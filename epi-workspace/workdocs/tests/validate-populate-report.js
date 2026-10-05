#!/usr/bin/env node
/**
 * @description Validates the populate report (workdocs/populate-manifest.json) against the
 *              migration server (workdocs/tests/migration-server.js, copied into opendsu-sdk).
 * @summary Walks every page of the migration server listings and checks that what the populate
 *          script planned/executed is exactly what the server exposes: product/batch records,
 *          their DSU content, leaflet folders, product photos and action audit records.
 *
 * Usage (from the workspace root, with the migration server running):
 *      node ./workdocs/tests/validate-populate-report.js [options]
 *
 * Options:
 *   --manifest <path>   Populate report to validate (default: workdocs/populate-manifest.json)
 *   --server <url>      Migration server base URL (default: http://localhost:8086,
 *                       overridable with the MIGRATION_SERVER_URL env var)
 *   --sample <n>        Only deep-check (DSU loads: getProduct/getBatch/listLeaflets/leaflets
 *                       documents/photos) the first <n> products; 0 checks all (default: 0)
 *   --strict            Require exact record counts (products/batches/audits). Use on freshly
 *                       populated environments; by default extra records left on the server by
 *                       earlier populate runs are reported as warnings, not failures
 *   --quiet             Only print the summary and the failures
 *   --help              Show this help
 *
 * Exit code: 0 when every check passes, 1 otherwise.
 */
process.chdir(require("path").join(__dirname, "..", ".."));

const fs = require("fs");
const path = require("path");

const DEFAULT_SERVER = process.env.MIGRATION_SERVER_URL || "http://localhost:8086";
const DEFAULT_MANIFEST = path.join(process.cwd(), "workdocs", "populate-manifest.json");
const PAGE_SIZE = 250; // the migration server caps the page size at the CouchDB query limit
const HTTP_TIMEOUT = 60000;

// ---------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------

function parseArgs(argv) {
    const options = {manifest: DEFAULT_MANIFEST, server: DEFAULT_SERVER, sample: 0, strict: false, quiet: false};
    for (let i = 0; i < argv.length; i++) {
        switch (argv[i]) {
            case "--manifest":
                options.manifest = path.resolve(argv[++i]);
                break;
            case "--server":
                options.server = argv[++i].replace(/\/+$/, "");
                break;
            case "--sample":
                options.sample = parseInt(argv[++i], 10);
                break;
            case "--strict":
                options.strict = true;
                break;
            case "--quiet":
                options.quiet = true;
                break;
            case "--help":
                console.log(fs.readFileSync(__filename, "utf8").match(/\/\*\*[\s\S]*?\*\//)[0]
                    .replace(/^\/\*\*|\*\/$/g, "").split("\n").map((line) => line.replace(/^\s*\*\s?/, "")).join("\n"));
                process.exit(0);
            default:
                console.error(`Unknown option: ${argv[i]} (see --help)`);
                process.exit(2);
        }
    }
    return options;
}

const options = parseArgs(process.argv.slice(2));

// ---------------------------------------------------------------------------
// Check registry
// ---------------------------------------------------------------------------

const results = {passed: 0, failed: 0, failures: []};

function check(condition, label, detail) {
    if (condition) {
        results.passed++;
        return true;
    }
    results.failed++;
    results.failures.push(detail ? `${label} - ${detail}` : label);
    if (!options.quiet) {
        console.error(`  FAIL ${label}${detail ? ` - ${detail}` : ""}`);
    }
    return false;
}

function log(message) {
    if (!options.quiet) {
        console.log(message);
    }
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

async function fetchWithTimeout(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT);
    try {
        return await fetch(url, {signal: controller.signal});
    } finally {
        clearTimeout(timer);
    }
}

async function getJson(endpoint) {
    const response = await fetchWithTimeout(`${options.server}${endpoint}`);
    const body = await response.json();
    return {status: response.status, body};
}

async function getBinary(endpoint) {
    const response = await fetchWithTimeout(`${options.server}${endpoint}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    return {status: response.status, contentType: response.headers.get("content-type") || "", buffer};
}

//walks every page of a listing endpoint; endpoint must contain the ":x" page-size placeholder
//and support "?page=N"; returns {totalRecords, records}
async function walkPages(endpoint, label) {
    const records = [];
    let totalRecords = null;
    let totalPages = 1;
    for (let page = 1; page <= totalPages; page++) {
        const url = endpoint.replace(":x", String(PAGE_SIZE)) + (endpoint.includes("?") ? "&" : "?") + `page=${page}`;
        const {status, body} = await getJson(url);
        if (!check(status === 200, `${label}: page ${page} returned 200`, `status ${status}: ${JSON.stringify(body).slice(0, 200)}`)) {
            return {totalRecords, records};
        }
        totalRecords = body.totalRecords;
        totalPages = body.totalPages;
        records.push(...body.data);
    }
    check(records.length === totalRecords, `${label}: walked records match totalRecords`,
        `walked ${records.length}, reported ${totalRecords}`);
    return {totalRecords, records};
}

// ---------------------------------------------------------------------------
// Value comparison helpers (manifest expectations vs server records)
// ---------------------------------------------------------------------------

//the SOR may store array properties (e.g. strengths) as a JSON string; normalize before comparing
function normalizeValue(value) {
    if (typeof value === "string" && value.trimStart().startsWith("[")) {
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }
    return value;
}

//every expected key must exist on the record with an equal value (the record may carry extra keys)
function checkFieldsSubset(expected, record, label) {
    for (const [key, value] of Object.entries(expected)) {
        check(JSON.stringify(normalizeValue(record[key])) === JSON.stringify(normalizeValue(value)),
            `${label}: field "${key}"`, `expected ${JSON.stringify(value)}, got ${JSON.stringify(record[key])}`);
    }
}

//array entries must be a same-length match where every expected entry has a subset-equal record
//entry (matched by an identity key when provided, otherwise by insertion order)
function checkEntriesSubset(expectedEntries, recordEntries, identityKey, label) {
    expectedEntries = expectedEntries || [];
    recordEntries = normalizeValue(recordEntries) || [];
    check(recordEntries.length === expectedEntries.length, `${label}: entry count`,
        `expected ${expectedEntries.length}, got ${recordEntries.length}`);

    const findMatch = (entry) => {
        if (identityKey) {
            return recordEntries.find((candidate) => candidate[identityKey] === entry[identityKey]);
        }
        return recordEntries[expectedEntries.indexOf(entry)];
    };
    for (const entry of expectedEntries) {
        const match = findMatch(entry);
        if (!check(Boolean(match), `${label}: entry ${identityKey ? `${identityKey}=${entry[identityKey]}` : JSON.stringify(entry).slice(0, 80)} found`)) {
            continue;
        }
        checkFieldsSubset(entry, match, label);
    }
}

// ---------------------------------------------------------------------------
// Manifest loading
// ---------------------------------------------------------------------------

function loadManifest() {
    if (!fs.existsSync(options.manifest)) {
        console.error(`Populate report not found: ${options.manifest}`);
        process.exit(2);
    }
    const manifest = JSON.parse(fs.readFileSync(options.manifest, "utf8"));
    if (!manifest.execution || !manifest.execution.products) {
        console.error(`The report has no execution results (dry-run manifests cannot be validated): ${options.manifest}`);
        process.exit(2);
    }

    //join the plan (product fields/leaflets/batches) with the execution results (gtin mapping,
    //per-record status); products without a successful execution cannot be validated
    const products = [];
    for (const planProduct of manifest.products) {
        const execution = manifest.execution.products[planProduct.inventedName];
        if (!execution || execution.status !== "ok" || !execution.gtin) {
            log(`? skipping product "${planProduct.inventedName}" (no successful execution recorded)`);
            continue;
        }
        products.push({gtin: execution.gtin, plan: planProduct, execution});
    }
    log(`Loaded ${options.manifest}`);
    log(`  plan: ${manifest.products.length} products, execution: ${products.length} validatable` +
        (manifest.summary ? `, populate summary failures: ${manifest.summary.failures.length}` : ""));
    return {manifest, products};
}

// ---------------------------------------------------------------------------
// Validation sections
// ---------------------------------------------------------------------------

async function validateHealth() {
    log("\n[1/8] Server health");
    const {status, body} = await getJson("/health");
    check(status === 200 && body.status === "ok", "GET /health returns status ok", `status ${status}: ${JSON.stringify(body)}`);
}

//products listing: pagination completeness + every manifest gtin present
async function validateProductListing(products) {
    log("\n[2/8] Products listing (pagination + completeness)");
    const {totalRecords, records} = await walkPages("/listProducts/:x", "listProducts");
    const byGtin = new Map(records.map((record) => [record.productCode, record]));

    if (options.strict) {
        check(totalRecords === products.length, "listProducts: product count",
            `expected ${products.length}, got ${totalRecords}`);
    } else if (totalRecords < products.length) {
        check(false, "listProducts: product count", `expected at least ${products.length}, got ${totalRecords}`);
    } else if (totalRecords > products.length) {
        log(`  ! listProducts: ${totalRecords - products.length} product(s) not in the report (earlier runs)`);
    }

    const gtins = products.map((product) => product.gtin);
    const duplicates = gtins.length !== new Set(gtins).size;
    check(!duplicates, "manifest gtins are unique");
    for (const product of products) {
        check(byGtin.has(product.gtin), `listProducts contains gtin ${product.gtin}`, `product "${product.plan.inventedName}"`);
    }
    return new Map(products.map((product) => [product.gtin, byGtin.get(product.gtin)]));
}

//product record fields vs the manifest final state
function validateProductRecord(product, record) {
    const label = `product ${product.gtin} (${product.plan.inventedName})`;
    checkFieldsSubset(product.plan.finalFields, record, `${label} record`);
    check(record.inventedName === product.plan.inventedName, `${label}: record inventedName`,
        `expected ${product.plan.inventedName}, got ${record.inventedName}`);
    checkEntriesSubset(product.plan.finalStrengths, record.strengths, null, `${label} strengths`);
    checkEntriesSubset(product.plan.markets, record.markets, "marketId", `${label} markets`);
}

//batches listing per product: pagination completeness + batch record fields
async function validateBatchListings(product) {
    const {totalRecords, records} = await walkPages(`/listBatches/${product.gtin}/:x`, `listBatches ${product.gtin}`);

    //only batches that the populate run created/reused successfully are expected on the server
    const expectedBatches = product.plan.batches
        .filter((batch) => (product.execution.batches[batch.batchNumber] || "ok") !== "failed");
    const byBatchNumber = new Map(records.map((record) => [record.batchNumber, record]));
    if (options.strict) {
        check(totalRecords === expectedBatches.length, `listBatches ${product.gtin}: batch count`,
            `expected ${expectedBatches.length}, got ${totalRecords}`);
    } else if (totalRecords < expectedBatches.length) {
        check(false, `listBatches ${product.gtin}: batch count`,
            `expected at least ${expectedBatches.length}, got ${totalRecords}`);
    } else if (totalRecords > expectedBatches.length) {
        //records left on the server by earlier populate runs are tolerated outside --strict
        log(`  ! listBatches ${product.gtin}: ${totalRecords - expectedBatches.length} batch(es) not in the report (earlier runs)`);
    }
    for (const batch of expectedBatches) {
        const record = byBatchNumber.get(batch.batchNumber);
        if (!check(Boolean(record), `listBatches ${product.gtin}: batch ${batch.batchNumber} present`)) {
            continue;
        }
        checkFieldsSubset(batch.finalFields, record, `batch ${product.gtin}/${batch.batchNumber} record`);
        check(record.productCode === product.gtin, `batch ${product.gtin}/${batch.batchNumber}: record productCode`);
    }
    return expectedBatches;
}

//audit records: pagination completeness + every manifest gtin audited
async function validateAuditListing(products) {
    log("\n[7/8] Action audit records");
    const {totalRecords, records} = await walkPages("/listAuditRecords/:x", "listAuditRecords");
    const itemCodes = new Set(records.map((record) => record.itemCode));
    for (const product of products) {
        check(itemCodes.has(product.gtin), `audit records exist for gtin ${product.gtin}`, `product "${product.plan.inventedName}"`);
    }
}

// ---------------------------------------------------------------------------
// Deep (DSU) checks, applied to every product or to the --sample subset
// ---------------------------------------------------------------------------

function isDeepCheckProduct(index, total) {
    if (options.sample === 0) {
        return true;
    }
    if (options.sample >= total) {
        return index < total;
    }
    //spread the sample over the whole dataset instead of taking only the first products
    return index % Math.floor(total / options.sample) === 0;
}

async function validateProductDeep(product) {
    const label = `product ${product.gtin} (${product.plan.inventedName})`;

    //versioned product info from the DSU
    const {status, body} = await getJson(`/getProduct/${product.gtin}`);
    if (check(status === 200, `${label}: getProduct returns 200`, `status ${status}: ${JSON.stringify(body).slice(0, 200)}`)) {
        check(body.product.productCode === product.gtin, `${label}: DSU product productCode`);
        checkFieldsSubset(product.plan.finalFields, body.product, `${label} DSU info`);
    }

    //leaflet folders of the product DSU vs the manifest leaflets
    const leafletsResponse = await getJson(`/listLeaflets/${product.gtin}`);
    if (check(leafletsResponse.status === 200, `${label}: listLeaflets returns 200`)) {
        const serverLeaflets = leafletsResponse.body.leaflets;
        const expectedLeaflets = product.plan.productLeaflets
            .filter((leaflet) => {
                const key = leaflet.market ? `${leaflet.type}/${leaflet.language}/${leaflet.market}` : `${leaflet.type}/${leaflet.language}`;
                return (product.execution.leaflets[key] || "ok") !== "failed";
            });
        const findLeaflet = (expected) => serverLeaflets.find((leaflet) =>
            leaflet.type === expected.type && leaflet.language === expected.language && (leaflet.market || null) === (expected.market || null));
        for (const expected of expectedLeaflets) {
            const descriptor = `${expected.type}/${expected.language}${expected.market ? `/${expected.market}` : ""}`;
            const serverLeaflet = findLeaflet(expected);
            if (!check(Boolean(serverLeaflet), `${label}: leaflet ${descriptor} present`)) {
                continue;
            }
            check(serverLeaflet.fileCount > 0, `${label}: leaflet ${descriptor} has files`);
            check(serverLeaflet.hasXml === true, `${label}: leaflet ${descriptor} has an xml document`);

            //fetch the xml document to prove the leaflet content is retrievable
            const xmlName = serverLeaflet.files.find((file) => file.endsWith(".xml"));
            const document = await getBinary(`/getLeafletDocument/${product.gtin}?type=${expected.type}&language=${expected.language}` +
                `${expected.market ? `&market=${expected.market}` : ""}&name=${encodeURIComponent(xmlName)}`);
            check(document.status === 200 && document.buffer.length > 0,
                `${label}: leaflet ${descriptor} document "${xmlName}" retrievable`, `status ${document.status}, ${document.buffer.length} bytes`);
        }
    }

    //product photo, when the populate plan attached one and it was not recorded as failed
    if (product.plan.photo && product.execution.photo !== "failed") {
        const image = await getBinary(`/getProductImage/${product.gtin}`);
        const isImage = image.status === 200 && image.contentType.startsWith("image/") && image.buffer.length > 0
            && (image.buffer[0] === 0x89 || image.buffer[0] === 0xff); //PNG or JPEG magic number
        check(isImage, `${label}: product photo is a valid image`, `status ${image.status}, type ${image.contentType}, ${image.buffer.length} bytes`);
    }

    //batches of the product: DSU info + batch leaflet folders
    const batches = await validateBatchListings(product);
    for (const batch of batches) {
        const batchLabel = `batch ${product.gtin}/${batch.batchNumber}`;
        const {status, body} = await getJson(`/getBatch/${product.gtin}/${encodeURIComponent(batch.batchNumber)}`);
        if (check(status === 200, `${batchLabel}: getBatch returns 200`, `status ${status}: ${JSON.stringify(body).slice(0, 200)}`)) {
            check(body.batch.batchNumber === batch.batchNumber, `${batchLabel}: DSU batch batchNumber`);
            checkFieldsSubset(batch.finalFields, body.batch, `${batchLabel} DSU info`);
        }

        const batchLeaflets = await getJson(`/listLeaflets/${product.gtin}/${encodeURIComponent(batch.batchNumber)}`);
        if (check(batchLeaflets.status === 200, `${batchLabel}: listLeaflets returns 200`)) {
            const serverLeaflets = batchLeaflets.body.leaflets;
            for (const expected of batch.leaflets) {
                const key = `${batch.batchNumber}/${expected.language}`;
                if ((product.execution.leaflets[key] || "ok") === "failed") {
                    continue;
                }
                const serverLeaflet = serverLeaflets.find((leaflet) =>
                    leaflet.type === expected.type && leaflet.language === expected.language && (leaflet.market || null) === (expected.market || null));
                check(Boolean(serverLeaflet), `${batchLabel}: leaflet ${expected.type}/${expected.language} present`);
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

(async () => {
    console.log(`Validating populate report against the migration server ${options.server}`);
    const {manifest, products} = loadManifest();
    if (products.length === 0) {
        console.error("Nothing to validate: the report has no successfully executed products.");
        process.exit(1);
    }

    await validateHealth();
    const productRecords = await validateProductListing(products);

    log("\n[3/8] Product records (enclave fields vs manifest final state)");
    for (const [gtin, record] of productRecords) {
        const product = products.find((candidate) => candidate.gtin === gtin);
        if (record) {
            validateProductRecord(product, record);
        }
    }

    log("\n[4/8] Product DSU info, leaflets, photos and batches (deep checks)");
    log(options.sample === 0
        ? `  checking all ${products.length} products`
        : `  checking a sample of ${Math.min(options.sample, products.length)} of ${products.length} products (use --sample 0 for all)`);
    let deepIndex = 0;
    for (const product of products) {
        if (!isDeepCheckProduct(deepIndex++, products.length)) {
            continue;
        }
        log(`  - ${product.gtin} (${product.plan.inventedName})`);
        await validateProductDeep(product);
    }

    await validateAuditListing(products);

    log("\n[8/8] Summary");
    console.log(`Checks: ${results.passed} passed, ${results.failed} failed`);
    if (results.failed > 0) {
        console.error("\nFailures:");
        for (const failure of results.failures) {
            console.error(`  - ${failure}`);
        }
        console.error(`\nValidation FAILED (${results.failed} failing checks)`);
        process.exit(1);
    }
    console.log(`\nValidation PASSED: the populate report matches the migration server (${products.length} products)`);
})().catch((e) => {
    console.error(`Validation crashed: ${e.message}`);
    process.exit(1);
});
