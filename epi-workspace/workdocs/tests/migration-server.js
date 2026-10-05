/**
 * Read-only Express server exposing the ePI models (products, batches, leaflets and
 * action audit records) for the ePI workspace migration.
 *
 * Besides the query endpoints it offers a full data scan (POST /scan + GET /scan/:scanId) that
 * inventories everything present on the server into a report shaped like the populate script's
 * manifest (products, batches, leaflets, photos, audit records).
 *
 * Lives in workdocs/tests but must be copied into the opendsu-sdk folder and run from there,
 * because it depends on the OpenDSU build located at ./builds/output/openDSU.js
 * to bootstrap the OpenDSU runtime (making require("opendsu") available).
 *
 * Data sources:
 *   - Enclave database (CouchDB via the OpenDSU DBService): the "products", "batches" and
 *     "audit" tables of the ePI domain (user-access audit entries are intentionally not exposed)
 *   - Product/batch DSUs, loaded through the deterministic GTIN ArraySSI of each product/batch
 *
 * Usage (from the workspace root):
 *      cp workdocs/tests/migration-server.js opendsu-sdk/
 *      cd opendsu-sdk && node migration-server.js
 *
 * Optional environment variables:
 *      PORT            - the port the server listens on (defaults to 8086)
 *      READ_ONLY_MODE  - opens the database in read-only mode when set
 */
const express = require("express");
const path = require("path");
const fs = require("fs");

// Bootstrap the OpenDSU runtime so that require("opendsu") resolves to the SDK modules
require(path.join(__dirname, "./builds/output/openDSU.js"));

const openDSU = require("opendsu");

//loki-enclave-facade is not bundled inside the openDSU.js build, so we load it directly from the modules folder
const EnclaveFacade = require(path.join(__dirname, "./modules/loki-enclave-facade"));
const DBService = EnclaveFacade.DBService;

//OpenDSU APIs used to load the product/batch DSUs
const keyssiSpace = openDSU.loadApi("keyssi");
const resolver = openDSU.loadAPI("resolver");

//the opendsu runtime registry does not expose the version as a property,
//so we read it from the module's package.json on disk and fallback to "unknown"
let opendsuVersion = "unknown";
try {
    opendsuVersion = require(path.join(__dirname, "./modules/opendsu/package.json")).version;
} catch (e) {
    //keep the default
}

const PORT = process.env.PORT || 8086;
const MAX_PAGE_SIZE = 250;

//upper bound of the single query each listing runs before paginating in memory
//(the audit table of a 500-product dataset holds ~10k records, well below this cap)
const MAX_QUERY_LIMIT = 100000;

//the ePI types that contain leaflet documents
const LEAFLET_TYPES = ["leaflet", "prescribingInfo"];

//the file extensions returned as UTF-8 text when the document contents are requested; everything else is base64
const TEXT_EXTENSIONS = [".xml", ".xsl", ".json", ".txt", ".html", ".htm"];

//content types used when serving a single document
const CONTENT_TYPES = {
    ".xml": "application/xml",
    ".xsl": "text/xsl",
    ".json": "application/json",
    ".txt": "text/plain",
    ".html": "text/html",
    ".htm": "text/html",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf"
};

let config;
let env;
let dbService;
const startedAt = Date.now();

// ---------------------------------------------------------------------------
// Configuration and database helpers
// ---------------------------------------------------------------------------

const getConfig = () => {
    if (!config) {
        try {
            config = JSON.parse(fs.readFileSync(path.join(__dirname, "../apihub-root/external-volume/config/apihub.json"), "utf8"));
        } catch (e) {
            console.error("Failed to read apihub config", e);
            config = {};
        }
    }
    return config;
}

const getEnv = () => {
    if (!env) {
        try {
            env = JSON.parse(fs.readFileSync(path.join(__dirname, "../env.json"), "utf8"));
        } catch (e) {
            console.error("Failed to read env", e);
            env = {};
        }
    }
    return env;
}

const getDBService = () => {
    if (!dbService) {
        getConfig();
        dbService = new DBService({
            uri: config.db.uri,
            username: process.env.DB_USER || config.db.user,
            secret: process.env.DB_SECRET || config.db.secret,
            debug: config.db.debug,
            readOnlyMode: process.env.READ_ONLY_MODE || false
        });
    }
    return dbService;
}

//builds the enclave table name the same way gtin-resolver does, e.g. db_db_local-epi_local-epi_products
const getEnclaveDBName = (tableName) => {
    const {EPI_DOMAIN: domain, EPI_SUBDOMAIN: subdomain} = getEnv();
    return ["db", "db", domain.replaceAll(".", "-"), subdomain.replaceAll(".", "-"), tableName].join("_")
}

const getProductsDBName = () => getEnclaveDBName("products");
const getBatchesDBName = () => getEnclaveDBName("batches");

//the ePI integration APIs store the user action audit entries in the "audit" enclave table
//(see TABLES.AUDIT in gtin-resolver); the "user-access" table holds the access audits,
//which are not part of the migration and are therefore not exposed by this server
const getAuditDBName = () => getEnclaveDBName("audit");

// ---------------------------------------------------------------------------
// OpenDSU helpers
// ---------------------------------------------------------------------------

//creates the deterministic ArraySSI (GTIN SSI) identifying a product/batch DSU
const createGTIN_SSI = (domain, gtin, batch) => {
    const hint = JSON.stringify({avoidRandom: true});
    return keyssiSpace.createArraySSI(domain, [gtin, batch], "v0", hint);
}

//loads the DSU identified by the gtin (+optional batch) ArraySSI
const loadGtinDSU = async (domain, gtin, batch) => {
    const ssi = createGTIN_SSI(domain, gtin, batch);
    return $$.promisify(resolver.loadDSU)(ssi);
}

//reads a record from an enclave DB, returning null if it does not exist (404) and rethrowing any other failure
const readRecordOrNull = async (db, dbName, pk) => {
    try {
        return await db.readDocument(dbName, pk);
    } catch (e) {
        if (e.statusCode === 404 || e.error === "not_found") {
            return null;
        }
        throw e;
    }
}

//finds the highest <baseName>.epi_vX file available under <folder> inside the DSU
const findVersionedJsonPath = async (dsu, folder, baseName) => {
    const files = await $$.promisify(dsu.listFiles)(folder);
    const versions = files
        .map((file) => {
            const match = path.basename(file).match(new RegExp(`^${baseName}\\.epi_v(\\d+)$`));
            return match ? parseInt(match[1], 10) : null;
        })
        .filter((version) => version !== null)
        .sort((a, b) => b - a);

    if (versions.length === 0) {
        return null;
    }
    return `${folder}/${baseName}.epi_v${versions[0]}`;
}

//reads the versioned ePI JSON info (e.g. /product/product.epi_v1) from a DSU, falling back to the
//highest version actually stored in the DSU when the version from the DB record is not available.
//returns {path, version, data} or null when no info file exists in the DSU
const readVersionedJson = async (dsu, folder, baseName, version) => {
    let jsonPath = `${folder}/${baseName}.epi_${version}`;
    try {
        await $$.promisify(dsu.readFile)(jsonPath);
    } catch (e) {
        jsonPath = await findVersionedJsonPath(dsu, folder, baseName);
        if (!jsonPath) {
            return null;
        }
    }

    const data = JSON.parse((await $$.promisify(dsu.readFile)(jsonPath)).toString());
    return {
        path: jsonPath,
        version: jsonPath.match(new RegExp(`${baseName}\\.epi_v(\\d+)$`))[1],
        data: data
    };
}

// ---------------------------------------------------------------------------
// Leaflet helpers
// ---------------------------------------------------------------------------

//resolves and loads the product/batch DSU for a leaflet request, validating that the record exists.
//returns {dsu, basePath, record} on success, or {status, error} for the caller to send as the response
const resolveLeafletContext = async ({gtin, batchNumber}) => {
    const dbName = batchNumber ? getBatchesDBName() : getProductsDBName();
    const recordPk = batchNumber ? `${gtin}_${batchNumber}` : gtin;

    const record = await readRecordOrNull(getDBService(), dbName, recordPk);
    if (!record) {
        return {
            status: 404,
            error: batchNumber ? `Batch ${batchNumber} of product ${gtin} not found` : `Product not found: ${gtin}`
        };
    }

    const {EPI_DOMAIN: domain} = getEnv();
    const dsu = await loadGtinDSU(domain, gtin, batchNumber);
    return {
        dsu: dsu,
        basePath: batchNumber ? "/batch" : "/product",
        record: record
    };
}

//builds the DSU folder path of a leaflet from its metadata
const buildLeafletPath = (basePath, type, language, market) => {
    return market ? `${basePath}/ePI/${type}/${language}/${market}` : `${basePath}/${type}/${language}`;
}

//walks the leaflet folders inside a product/batch DSU. A "leaflet" is a folder (type/language/market)
//that can hold several files (leaflet.xml, figures, tables...). Walks both the plain hierarchy
//(<basePath>/<type>/<lang>) and the ePI market hierarchy (<basePath>/ePI/<type>/<lang>/<market>)
const listLeafletFolders = async (dsu, basePath) => {
    const leaflets = [];

    const safeListFolders = async (folder) => {
        try {
            return await $$.promisify(dsu.listFolders)(folder);
        } catch (e) {
            return [];
        }
    };
    const safeListFiles = async (folder) => {
        try {
            return await $$.promisify(dsu.listFiles)(folder);
        } catch (e) {
            return [];
        }
    };

    const types = await safeListFolders(basePath);
    for (const type of types) {
        if (!LEAFLET_TYPES.includes(type)) {
            continue;
        }

        //plain hierarchy: <basePath>/<type>/<lang>
        const languages = await safeListFolders(`${basePath}/${type}`);
        for (const language of languages) {
            const leafletPath = `${basePath}/${type}/${language}`;
            const files = await safeListFiles(leafletPath);
            if (files.length === 0) {
                continue;
            }
            leaflets.push({
                type: type,
                language: language,
                market: null,
                path: leafletPath,
                fileCount: files.length,
                hasXml: files.some((file) => file.endsWith(".xml")),
                files: files
            });
        }

        //ePI market hierarchy: <basePath>/ePI/<type>/<lang>/<market>
        const epiTypePath = `${basePath}/ePI/${type}`;
        const marketLanguages = await safeListFolders(epiTypePath);
        for (const language of marketLanguages) {
            const markets = await safeListFolders(`${epiTypePath}/${language}`);
            for (const market of markets) {
                const leafletPath = `${epiTypePath}/${language}/${market}`;
                const files = await safeListFiles(leafletPath);
                if (files.length === 0) {
                    continue;
                }
                leaflets.push({
                    type: type,
                    language: language,
                    market: market,
                    path: leafletPath,
                    fileCount: files.length,
                    hasXml: files.some((file) => file.endsWith(".xml")),
                    files: files
                });
            }
        }
    }

    return leaflets;
}

// ---------------------------------------------------------------------------
// Shared handlers
// ---------------------------------------------------------------------------

//shared handler for the paginated listing endpoints. Returns the enclave records themselves
//(not only their ids) so that a migration client needs a single request per page.
//response: { page, totalPages, totalRecords, data: [<records>] }
const listRecords = async (req, res, dbName, label, query = ["_id > 0"]) => {
    let pageSize = parseInt(req.params.x, 10);
    if (isNaN(pageSize) || pageSize < 1) {
        return res.status(400).json({error: "The path param x must be a positive integer representing the number of records per page"});
    }
    if (pageSize > MAX_PAGE_SIZE) {
        pageSize = MAX_PAGE_SIZE;
    }

    let page = parseInt(req.query.page, 10);
    if (isNaN(page) || page < 1) {
        page = 1;
    }

    const db = getDBService();
    const lastKey = (page - 1) * pageSize;

    //the DBService countDocs undercounts tables whose record ids sort above "_design/"
    //(e.g. the hashed audit pks starting with a-f), which would truncate the listings; so the
    //matching records are fetched in one bounded query and paginated in memory instead
    const sortField = query[0].split(/\s+/)[0];
    const allMatching = await db.filter(dbName, query, [{[sortField]: "asc"}], MAX_QUERY_LIMIT, 0);
    const totalRecords = allMatching.length;
    const records = allMatching.slice(lastKey, lastKey + pageSize);

    const totalPages = Math.ceil(totalRecords / pageSize);
    res.status(200).json({
        page: page,
        totalPages: totalPages,
        totalRecords: totalRecords,
        data: records
    });
}

//shared handler for the ePI info endpoints: reads the DB record for the ePI protocol version,
//loads the GTIN DSU and returns the versioned JSON info stored inside it (e.g. /product/product.epi_v1)
const getEpiInfo = async (res, {dbName, recordPk, gtin, batch, folder, baseName, label}) => {
    const db = getDBService();

    //the DB record holds the metadata, including the ePI protocol version used for the storage path
    const record = await readRecordOrNull(db, dbName, recordPk);
    if (!record) {
        return res.status(404).json({error: `${label} not found`});
    }
    const version = record.epiProtocol || "v1";

    const {EPI_DOMAIN: domain} = getEnv();
    const dsu = await loadGtinDSU(domain, gtin, batch);

    //the outer DSU mounts the mutable DSU at <folder>; the JSON info is versioned, e.g. <folder>/<baseName>.epi_v1
    const info = await readVersionedJson(dsu, folder, baseName, version);
    if (!info) {
        return res.status(404).json({error: `No ${label} information found in the DSU`});
    }

    res.status(200).json({
        version: info.version,
        path: info.path,
        [baseName]: info.data
    });
}

//shared handler for the listLeaflets endpoints: resolves the product/batch DSU and returns
//the metadata of every leaflet folder found inside it
const listLeafletsHandler = async (res, {gtin, batchNumber}) => {
    const context = await resolveLeafletContext({gtin, batchNumber});
    if (context.error) {
        return res.status(context.status).json({error: context.error});
    }

    const leaflets = await listLeafletFolders(context.dsu, context.basePath);

    res.status(200).json({
        gtin: gtin,
        batchNumber: batchNumber || null,
        basePath: context.basePath,
        leaflets: leaflets
    });
}

const getContentType = (name) => {
    return CONTENT_TYPES[path.extname(name).toLowerCase()] || "application/octet-stream";
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

const app = express();

const getHealthStatus = () => {
    return {
        status: "ok",
        uptime: Math.floor((Date.now() - startedAt) / 1000),
        timestamp: new Date().toISOString(),
        opendsuVersion: opendsuVersion,
        node: process.version
    };
};

//alias endpoint, same response as /health
app.get("/healthz", (req, res) => {
    res.status(200).json(getHealthStatus());
});

app.get("/health", (req, res) => {
    res.status(200).json(getHealthStatus());
});

//listProducts endpoint: returns a paginated list of the product enclave records
//   GET /listProducts/:x?page=N
//     :x    - path param, the number of records per page (max 250)
//     ?page - query param, the page number (defaults to 1)
//   response: { page, totalPages, totalRecords, data: [<product records>] }
app.get("/listProducts/:x", async (req, res) => {
    try {
        return await listRecords(req, res, getProductsDBName(), "products");
    } catch (e) {
        console.error("Failed to list products", e);
        res.status(500).json({error: "Failed to list products", message: e.message});
    }
});

//getProduct endpoint: returns the product information stored inside the product DSU
//   GET /getProduct/:gtin
//     :gtin - path param, the product code (GTIN)
//   response: { version, path, product: <product info JSON> }
app.get("/getProduct/:gtin", async (req, res) => {
    const gtin = req.params.gtin;
    try {
        return await getEpiInfo(res, {
            dbName: getProductsDBName(),
            recordPk: gtin,
            gtin: gtin,
            batch: undefined,
            folder: "/product",
            baseName: "product",
            label: `Product ${gtin}`
        });
    } catch (e) {
        console.error(`Failed to get product ${gtin}`, e);
        res.status(500).json({error: `Failed to get product ${gtin}`, message: e.message});
    }
});

//getProductImage endpoint: returns the product image stored inside the product DSU
//   GET /getProductImage/:gtin
//     :gtin - path param, the product code (GTIN)
//   the image is stored by gtin-resolver inside the mounted product folder (e.g. /product/photo.png or /product/image.png)
//   response: the raw image content with the appropriate Content-Type header (e.g. image/png)
app.get("/getProductImage/:gtin", async (req, res) => {
    const gtin = req.params.gtin;
    try {
        //make sure the product exists before trying to read its image
        const product = await readRecordOrNull(getDBService(), getProductsDBName(), gtin);
        if (!product) {
            return res.status(404).json({error: `Product not found: ${gtin}`});
        }

        const {EPI_DOMAIN: domain} = getEnv();
        const dsu = await loadGtinDSU(domain, gtin, undefined);

        const imagePath = await findProductImagePath(dsu);
        if (!imagePath) {
            return res.status(404).json({error: `Product image not found: ${gtin}`});
        }

        const image = await $$.promisify(dsu.readFile)(imagePath);

        //the stored photo can be raw binary or a base64 data URL (the DSU-fabric product API registers the
        //raw base64 data), so we detect data URLs and decode them before sending the raw image content
        let contentType = getContentType(path.basename(imagePath));
        let payload = image;
        const dataUrl = /^data:([^;,]+);base64,/.exec(image.toString("utf8"));
        if (dataUrl) {
            contentType = dataUrl[1];
            payload = Buffer.from(image.toString("utf8").slice(dataUrl[0].length), "base64");
        }

        res.status(200)
            .set("Content-Type", contentType)
            .send(payload);
    } catch (e) {
        console.error(`Failed to get image of product ${gtin}`, e);
        res.status(500).json({error: `Failed to get image of product ${gtin}`, message: e.message});
    }
});

//the product photo is stored inside the mounted product folder of the outer DSU. Depending on which
//gtin-resolver component wrote it, the file is named image.png (legacy productPhoto mapping) or
//photo.png (DSU-fabric product API addPhoto/getPhoto), possibly with a different extension
const PRODUCT_IMAGE_FOLDER = "/product";

//resolves the path of the product photo inside the outer DSU: lists the product folder and picks the
//first existing candidate (image.png from the legacy mapping, photo.png from the DSU-fabric product API,
//or any other photo.*/image.* file). Returns null when no photo is stored
const findProductImagePath = async (dsu) => {
    let files = [];
    try {
        files = await $$.promisify(dsu.listFiles)(PRODUCT_IMAGE_FOLDER);
    } catch (e) {
        return null;
    }
    const names = files.map((file) => path.basename(file));
    const preferred = ["image.png", "photo.png"];
    const name = preferred.find((candidate) => names.includes(candidate))
        || names.find((name) => /^(photo|image)\.\w+$/i.test(name));
    return name ? `${PRODUCT_IMAGE_FOLDER}/${name}` : null;
}

//listBatches endpoint: returns a paginated list of the batch enclave records of a specific product
//   GET /listBatches/:gtin/:x?page=N
//     :gtin - path param, the product code (GTIN) whose batches are listed
//     :x    - path param, the number of records per page (max 250)
//     ?page - query param, the page number (defaults to 1)
//   response: { page, totalPages, totalRecords, data: [<batch records>] }
app.get("/listBatches/:gtin/:x", async (req, res) => {
    const gtin = req.params.gtin;
    try {
        //make sure the product exists before listing its batches
        const product = await readRecordOrNull(getDBService(), getProductsDBName(), gtin);
        if (!product) {
            return res.status(404).json({error: `Product not found: ${gtin}`});
        }

        return await listRecords(req, res, getBatchesDBName(), `batches of product ${gtin}`, [`productCode == ${gtin}`]);
    } catch (e) {
        console.error(`Failed to list batches of product ${gtin}`, e);
        res.status(500).json({error: `Failed to list batches of product ${gtin}`, message: e.message});
    }
});

//getBatch endpoint: returns the batch information stored inside the batch DSU
//   GET /getBatch/:gtin/:batchNumber
//     :gtin        - path param, the product code (GTIN) the batch belongs to
//     :batchNumber - path param, the batch number
//   response: { version, path, batch: <batch info JSON> }
app.get("/getBatch/:gtin/:batchNumber", async (req, res) => {
    const {gtin, batchNumber} = req.params;
    try {
        return await getEpiInfo(res, {
            dbName: getBatchesDBName(),
            recordPk: `${gtin}_${batchNumber}`,
            gtin: gtin,
            batch: batchNumber,
            folder: "/batch",
            baseName: "batch",
            label: `Batch ${batchNumber} of product ${gtin}`
        });
    } catch (e) {
        console.error(`Failed to get batch ${batchNumber} of product ${gtin}`, e);
        res.status(500).json({error: `Failed to get batch ${batchNumber} of product ${gtin}`, message: e.message});
    }
});

//listLeaflets endpoints: return the metadata of the leaflet folders inside a product/batch DSU.
//A leaflet is a folder (type/language/optional market) that can hold several files, so the metadata
//returned here is what a subsequent getLeaflet request needs in order to fetch the folder documents
//   GET /listLeaflets/:gtin                    -> leaflets of the product DSU
//   GET /listLeaflets/:gtin/:batchNumber       -> leaflets of the batch DSU
//   response: { gtin, batchNumber, basePath, leaflets: [{type, language, market, path, fileCount, hasXml, files}] }
app.get("/listLeaflets/:gtin", async (req, res) => {
    const gtin = req.params.gtin;
    try {
        return await listLeafletsHandler(res, {gtin: gtin, batchNumber: undefined});
    } catch (e) {
        console.error(`Failed to list leaflets of product ${gtin}`, e);
        res.status(500).json({error: `Failed to list leaflets of product ${gtin}`, message: e.message});
    }
});

app.get("/listLeaflets/:gtin/:batchNumber", async (req, res) => {
    const {gtin, batchNumber} = req.params;
    try {
        return await listLeafletsHandler(res, {gtin: gtin, batchNumber: batchNumber});
    } catch (e) {
        console.error(`Failed to list leaflets of batch ${batchNumber} of product ${gtin}`, e);
        res.status(500).json({error: `Failed to list leaflets of batch ${batchNumber} of product ${gtin}`, message: e.message});
    }
});

//getLeaflet endpoint: returns the documents (files) inside a leaflet folder of a product/batch DSU
//   GET /getLeaflet/:gtin?type=<type>&language=<lang>[&market=<market>][&batchNumber=<batch>][&content=true]
//     type        - required query param, one of: leaflet, prescribingInfo
//     language    - required query param, the leaflet language (e.g. en)
//     market      - optional query param, the ePI market (selects the <basePath>/ePI/... hierarchy)
//     batchNumber - optional query param, selects the batch DSU instead of the product DSU
//     content     - optional query param, when "true" each document also embeds its content
//                   (utf8 for text files, base64 for binary files)
//   response: { gtin, batchNumber, type, language, market, path, documents: [{name, path[, content, encoding]}] }
app.get("/getLeaflet/:gtin", async (req, res) => {
    const gtin = req.params.gtin;
    try {
        const {type, language, market, batchNumber} = req.query;

        if (!LEAFLET_TYPES.includes(type)) {
            return res.status(400).json({error: `The type query param is required and must be one of: ${LEAFLET_TYPES.join(", ")}`});
        }
        if (!language || typeof language !== "string") {
            return res.status(400).json({error: "The language query param is required"});
        }

        const context = await resolveLeafletContext({gtin, batchNumber});
        if (context.error) {
            return res.status(context.status).json({error: context.error});
        }

        const leafletPath = buildLeafletPath(context.basePath, type, language, market);

        let files;
        try {
            files = await $$.promisify(context.dsu.listFiles)(leafletPath);
        } catch (e) {
            files = [];
        }
        if (files.length === 0) {
            return res.status(404).json({error: `Leaflet not found at path ${leafletPath}`});
        }

        const documents = [];
        for (const file of files) {
            const document = {name: file, path: `${leafletPath}/${file}`};

            if (req.query.content === "true") {
                const buffer = await $$.promisify(context.dsu.readFile)(document.path);
                const isText = TEXT_EXTENSIONS.some((ext) => file.toLowerCase().endsWith(ext));
                document.encoding = isText ? "utf8" : "base64";
                document.content = isText ? buffer.toString("utf8") : buffer.toString("base64");
            }
            documents.push(document);
        }

        res.status(200).json({
            gtin: gtin,
            batchNumber: batchNumber || null,
            type: type,
            language: language,
            market: market || null,
            path: leafletPath,
            documents: documents
        });
    } catch (e) {
        console.error(`Failed to get leaflet of product ${gtin}`, e);
        res.status(500).json({error: `Failed to get leaflet of product ${gtin}`, message: e.message});
    }
});

//getLeafletDocument endpoint: fetches a single document (file) from a leaflet folder of a product/batch DSU
//   GET /getLeafletDocument/:gtin?type=<type>&language=<lang>&name=<file>[&market=<market>][&batchNumber=<batch>]
//     type, language, market, batchNumber - identify the leaflet folder, same as the getLeaflet endpoint
//     name      - required query param, the file name inside the leaflet folder (e.g. leaflet.xml)
//   response: the raw file content with the appropriate Content-Type header
app.get("/getLeafletDocument/:gtin", async (req, res) => {
    const gtin = req.params.gtin;
    try {
        const {type, language, market, batchNumber, name} = req.query;

        if (!LEAFLET_TYPES.includes(type)) {
            return res.status(400).json({error: `The type query param is required and must be one of: ${LEAFLET_TYPES.join(", ")}`});
        }
        if (!language || typeof language !== "string") {
            return res.status(400).json({error: "The language query param is required"});
        }
        if (!name || typeof name !== "string" || name.includes("/") || name.includes("\\") || name.includes("..")) {
            return res.status(400).json({error: "The name query param is required and must be a simple file name (no paths)"});
        }

        const context = await resolveLeafletContext({gtin, batchNumber});
        if (context.error) {
            return res.status(context.status).json({error: context.error});
        }

        const filePath = `${buildLeafletPath(context.basePath, type, language, market)}/${name}`;

        let content;
        try {
            content = await $$.promisify(context.dsu.readFile)(filePath);
        } catch (e) {
            return res.status(404).json({error: `Document not found: ${filePath}`});
        }

        res.status(200)
            .set("Content-Type", getContentType(name))
            .send(content);
    } catch (e) {
        console.error(`Failed to get document of product ${gtin}`, e);
        res.status(500).json({error: `Failed to get document of product ${gtin}`, message: e.message});
    }
});

//listAuditRecords endpoints: return a paginated list of the user action audit records written by the
//ePI integration APIs (the "audit" enclave table; the "user-access" access audits are not exposed)
//   GET /listAuditRecords/:x?page=N           -> all audit records
//   GET /listAuditRecords/:gtin/:x?page=N     -> audit records of a specific product (itemCode == gtin)
//     :x    - path param, the number of audit records per page (max 250)
//     ?page - query param, the page number (defaults to 1)
//   each audit record contains the metadata of an ePI operation (itemCode, reason, creationTime, username, version,
//   batchNumber when the operation was on a batch, details when diffs were recorded)
//   response: { page, totalPages, totalRecords, data: [<audit records>] }
app.get("/listAuditRecords/:x", async (req, res) => {
    try {
        return await listRecords(req, res, getAuditDBName(), "audit records");
    } catch (e) {
        console.error("Failed to list audit records", e);
        res.status(500).json({error: "Failed to list audit records", message: e.message});
    }
});

app.get("/listAuditRecords/:gtin/:x", async (req, res) => {
    const gtin = req.params.gtin;
    try {
        return await listRecords(req, res, getAuditDBName(), `audit records of product ${gtin}`, [`itemCode == ${gtin}`]);
    } catch (e) {
        console.error(`Failed to list audit records of product ${gtin}`, e);
        res.status(500).json({error: `Failed to list audit records of product ${gtin}`, message: e.message});
    }
});

//getAuditRecord endpoint: returns a single audit record by its id
//   GET /getAuditRecord/:auditId
//     :auditId - path param, the id (pk) of the audit record
//   response: the audit record JSON
app.get("/getAuditRecord/:auditId", async (req, res) => {
    const auditId = req.params.auditId;
    try {
        const record = await readRecordOrNull(getDBService(), getAuditDBName(), auditId);
        if (!record) {
            return res.status(404).json({error: `Audit record not found: ${auditId}`});
        }
        res.status(200).json(record);
    } catch (e) {
        console.error(`Failed to get audit record ${auditId}`, e);
        res.status(500).json({error: `Failed to get audit record ${auditId}`, message: e.message});
    }
});

// ---------------------------------------------------------------------------
// Full data scan
// ---------------------------------------------------------------------------

//system fields added by the server on top of the message payloads (see the SOR data model)
const SYSTEM_FIELDS = ["pk", "epiProtocol", "lockId", "version", "__timestamp"];

//the report of the last scan started via POST /scan (the scan runs in the background and the
//client polls GET /scan/:scanId until the status is "completed"; the state is in-memory only)
let latestScan = null;

//the SOR may store array properties (e.g. strengths) as a JSON string; normalize for the report
const normalizeStoredValue = (value) => {
    if (typeof value === "string" && value.trimStart().startsWith("[")) {
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }
    return value;
}

//the record fields as they were uploaded (everything except the system fields and, for batches,
//the product fields the server adds to every batch record)
const payloadFields = (record, serverFields = []) => {
    const fields = {};
    for (const [key, value] of Object.entries(record)) {
        if (!SYSTEM_FIELDS.includes(key) && !serverFields.includes(key)) {
            fields[key] = normalizeStoredValue(value);
        }
    }
    return fields;
}

//reduces a DSU leaflet folder to the {type, language, market} reference used by the report
//(same shape as the leaflet entries of the populate manifest)
const toLeafletRef = (leaflet) => {
    return {type: leaflet.type, language: leaflet.language, market: leaflet.market};
}

//runs the scan in the background; per-item failures are recorded in the report summary and the
//scan continues, so a single broken DSU does not abort the whole inventory
const runScan = async (scan) => {
    const db = getDBService();
    const {EPI_DOMAIN: domain, EPI_SUBDOMAIN: subdomain} = getEnv();

    //enclave records, fetched in single bounded queries (same strategy as the listings)
    const products = await db.filter(getProductsDBName(), ["_id > 0"], [{"_id": "asc"}], MAX_QUERY_LIMIT, 0);
    const batches = await db.filter(getBatchesDBName(), ["_id > 0"], [{"_id": "asc"}], MAX_QUERY_LIMIT, 0);
    const audits = await db.filter(getAuditDBName(), ["_id > 0"], [{"_id": "asc"}], MAX_QUERY_LIMIT, 0);

    const batchesByProduct = new Map();
    for (const batch of batches) {
        if (!batchesByProduct.has(batch.productCode)) {
            batchesByProduct.set(batch.productCode, []);
        }
        batchesByProduct.get(batch.productCode).push(batch);
    }

    const auditReasons = {};
    let firstAuditTime = null;
    let lastAuditTime = null;
    for (const audit of audits) {
        auditReasons[audit.reason] = (auditReasons[audit.reason] || 0) + 1;
        if (!firstAuditTime || audit.creationTime < firstAuditTime) {
            firstAuditTime = audit.creationTime;
        }
        if (!lastAuditTime || audit.creationTime > lastAuditTime) {
            lastAuditTime = audit.creationTime;
        }
    }

    scan.progress.totalProducts = products.length;

    const reportProducts = [];
    const failures = [];
    let productLeafletCount = 0;
    let batchLeafletCount = 0;
    let photoCount = 0;

    for (let index = 0; index < products.length; index++) {
        const record = products[index];
        const gtin = record.productCode || record.pk;

        const product = {
            index: index + 1,
            gtin: gtin,
            inventedName: record.inventedName,
            nameMedicinalProduct: record.nameMedicinalProduct,
            epiProtocol: record.epiProtocol || "v1",
            version: record.version,
            timestamp: record.__timestamp,
            fields: payloadFields(record),
            photo: null,
            dsu: null,
            productLeaflets: [],
            batches: []
        };

        try {
            //product DSU: versioned product info, leaflet folders and the product photo
            const dsu = await loadGtinDSU(domain, gtin, undefined);
            const info = await readVersionedJson(dsu, "/product", "product", product.epiProtocol);
            product.dsu = info ? {infoPath: info.path, infoVersion: info.version} : {error: "No product info file found in the DSU"};

            const leaflets = await listLeafletFolders(dsu, "/product");
            product.productLeaflets = leaflets.map(toLeafletRef);
            productLeafletCount += leaflets.length;

            const imagePath = await findProductImagePath(dsu);
            if (imagePath) {
                product.photo = {imageName: path.basename(imagePath), path: imagePath};
                photoCount++;
            }
        } catch (e) {
            product.dsu = {error: e.message};
            failures.push({item: `product ${gtin}`, error: e.message});
        }

        for (const batchRecord of batchesByProduct.get(gtin) || []) {
            const batch = {
                batchNumber: batchRecord.batchNumber,
                epiProtocol: batchRecord.epiProtocol || "v1",
                version: batchRecord.version,
                timestamp: batchRecord.__timestamp,
                fields: payloadFields(batchRecord, ["inventedName", "nameMedicinalProduct"]),
                batchLeaflets: []
            };
            try {
                //batch DSU: leaflet folders (the batch info file is part of the batch record)
                const batchDsu = await loadGtinDSU(domain, gtin, batch.batchNumber);
                const batchLeaflets = await listLeafletFolders(batchDsu, "/batch");
                batch.batchLeaflets = batchLeaflets.map(toLeafletRef);
                batchLeafletCount += batchLeaflets.length;
            } catch (e) {
                failures.push({item: `batch ${gtin}/${batch.batchNumber}`, error: e.message});
            }
            product.batches.push(batch);
        }

        reportProducts.push(product);
        scan.progress.scannedProducts = index + 1;
    }

    const productsWithMarkets = reportProducts.filter((product) => (product.fields.markets || []).length > 0).length;

    scan.report = {
        generatedAt: new Date().toISOString(),
        source: {kind: "migration-server-scan", domain: domain, subdomain: subdomain},
        counts: {
            products: reportProducts.length,
            batches: batches.length,
            productLeaflets: productLeafletCount,
            batchLeaflets: batchLeafletCount,
            photos: photoCount,
            productsWithMarkets: productsWithMarkets,
            productsWithoutMarkets: reportProducts.length - productsWithMarkets,
            auditRecords: audits.length
        },
        summary: {
            auditReasons: auditReasons,
            auditTimeRange: {first: firstAuditTime, last: lastAuditTime},
            failures: failures
        },
        products: reportProducts
    };
}

//starts a scan and returns it immediately (the caller responds 202 to the client)
const startScan = () => {
    const scan = {
        id: `scan-${Date.now()}`,
        status: "running",
        startedAt: new Date().toISOString(),
        finishedAt: null,
        progress: {scannedProducts: 0, totalProducts: 0},
        error: null,
        report: null
    };
    latestScan = scan;
    runScan(scan).then(() => {
        scan.status = "completed";
        scan.finishedAt = new Date().toISOString();
        console.log(`Data scan ${scan.id} completed: ${JSON.stringify(scan.report.counts)}` +
            (scan.report.summary.failures.length ? `, failures: ${scan.report.summary.failures.length}` : ""));
    }).catch((e) => {
        scan.status = "failed";
        scan.finishedAt = new Date().toISOString();
        scan.error = e.message;
        console.error(`Data scan ${scan.id} failed`, e);
    });
    return scan;
}

//shared response for the scan status endpoints
const scanStatusResponse = (res, scan) => {
    res.status(200).json({
        scanId: scan.id,
        status: scan.status,
        startedAt: scan.startedAt,
        finishedAt: scan.finishedAt,
        progress: scan.progress,
        ...(scan.error ? {error: scan.error} : {}),
        ...(scan.report ? {report: scan.report} : {})
    });
}

//scan endpoint: starts a full scan of the data present on the server (products, batches, leaflets,
//photos and audit records) and generates a report shaped like the populate script's manifest
//   POST /scan
//   response 202: { scanId, status: "running" } - or 409 when a scan is already running
app.post("/scan", (req, res) => {
    if (latestScan && latestScan.status === "running") {
        return res.status(409).json({error: "A scan is already running", scanId: latestScan.id});
    }
    const scan = startScan();
    res.status(202).json({scanId: scan.id, status: scan.status});
});

//scan status endpoints: return the state of a scan; the report is included when it is completed
//   GET /scan           -> the last scan (404 before the first scan)
//   GET /scan/:scanId   -> a specific scan
//   response 200: { scanId, status, startedAt, finishedAt, progress, [report] } or 404
app.get("/scan", (req, res) => {
    if (!latestScan) {
        return res.status(404).json({error: "No scan has been started yet (POST /scan)"});
    }
    return scanStatusResponse(res, latestScan);
});

app.get("/scan/:scanId", (req, res) => {
    if (!latestScan || latestScan.id !== req.params.scanId) {
        return res.status(404).json({error: `Scan not found: ${req.params.scanId}`});
    }
    return scanStatusResponse(res, latestScan);
});

app.use((req, res) => {
    res.status(404).json({error: `Unknown endpoint: ${req.method} ${req.originalUrl}`});
});

// ---------------------------------------------------------------------------
// Server bootstrap
// ---------------------------------------------------------------------------

const server = app.listen(PORT, () => {
    console.log(`Migration server started on port ${PORT}`);
    console.log(`   GET /health  -> ${JSON.stringify(getHealthStatus())}`);
});

//clean shutdown on SIGINT/SIGTERM
const shutdown = () => {
    console.log("Shutting down migration server...");
    server.close(() => {
        console.log("Migration server stopped.");
        process.exit(0);
    });
    //force exit if the server does not close in time
    setTimeout(() => process.exit(0), 3000).unref();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
