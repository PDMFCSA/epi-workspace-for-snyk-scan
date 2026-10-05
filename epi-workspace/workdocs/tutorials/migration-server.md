# Migration server (`workdocs/tests/migration-server.js`)

This document describes the HTTP APIs exposed by `workdocs/tests/migration-server.js` — a read-only
Express server used by the ePI migration process to extract products, batches, leaflets and action
audit records from the enclave database and from inside the product/batch DSUs.

---

## General

- **Server script**: `workdocs/tests/migration-server.js` (must be copied into the `opendsu-sdk`
  folder and run from there — it bootstraps the OpenDSU runtime from `./builds/output/openDSU.js`)
- **Base URL**: `http://localhost:8086` (default port `8086`, override with the `PORT` env var)
- **Data sources**:
  - Enclave database (CouchDB via the OpenDSU `DBService`): tables
    `db_db_<domain>_<subdomain>_products`, `db_db_<domain>_<subdomain>_batches` and
    `db_db_<domain>_<subdomain>_audit`, where `<domain>`/`<subdomain>` come from `env.json`
    (`EPI_DOMAIN`/`EPI_SUBDOMAIN`, e.g. `local.epi`)
  - Product/batch DSUs, loaded through the deterministic GTIN ArraySSI of each product/batch
- **Pagination convention** (all `list*` endpoints):
  - `:x` path param — number of records per page (positive integer, **max 250**, larger values are
    capped — this matches the underlying database query limit)
  - `?page=N` query param — page number (defaults to `1`)
  - Response: `{ "page": <page>, "totalPages": <total>, "totalRecords": <total>, "data": [...] }`
  - Unlike the older healthcheck API, the listings return the **full enclave records** (not only
    their ids), so a migration client needs a single request per page
  - Every listing fetches the matching records in a single bounded query (up to `MAX_QUERY_LIMIT` =
    100,000 records) and paginates them in memory; `totalRecords` is therefore the **true** number of
    retrievable records (see [Known behaviour](#known-behaviour--gotchas))
- **Error format** (all endpoints):
  - `400` — invalid/missing params: `{ "error": "<description>" }`
  - `404` — record or DSU content not found: `{ "error": "<description>" }`
  - `500` — internal failure: `{ "error": "<description>", "message": "<exception message>" }`
  - any unknown route: `404 { "error": "Unknown endpoint: <method> <originalUrl>" }`

### Running the server

```sh
cp workdocs/tests/migration-server.js opendsu-sdk/
cd opendsu-sdk
node migration-server.js
```

- Startup takes a few seconds; the console prints `Migration server started on port 8086`.
- Expect noisy DEBUG log lines ("Logger not available, using console", "The system is not safe for
  production...") — all normal.
- It shuts down gracefully on SIGINT/SIGTERM.
- Optional environment variables: `PORT`, `READ_ONLY_MODE` (opens the database in read-only mode),
  `DB_USER`/`DB_SECRET` (override the CouchDB credentials from `apihub.json`).

---

## Health

### `GET /health`

Returns the server health status.

**Response** `200`:

```json
{
  "status": "ok",
  "uptime": 18,
  "timestamp": "2026-10-04T15:57:25.040Z",
  "opendsuVersion": "v1.0.9",
  "node": "v24.16.0"
}
```

### `GET /healthz`

Alias of `GET /health` (same response).

---

## Products

### `GET /listProducts/:x?page=N`

Returns a paginated list of the **full product enclave records**.

- `:x` — number of records per page (max 250)
- `?page=N` — page number (default 1)

**Response** `200`:

```json
{
  "page": 1,
  "totalPages": 50,
  "totalRecords": 100,
  "data": [
    {
      "pk": "00000000000451",
      "productCode": "00000000000451",
      "epiProtocol": "v1",
      "lockId": "5utCUAAq5CoGCN7uWRxLEC7YcJCKVSrynoEGRGQTGUSv",
      "internalMaterialCode": "IMC-2245",
      "inventedName": "Neuropril",
      "nameMedicinalProduct": "Neuropril 2.5mg effervescent tablets",
      "productRecall": false,
      "strengths": [],
      "markets": [],
      "version": 18,
      "__timestamp": 1790961937054
    }
  ]
}
```

### `GET /getProduct/:gtin`

Returns the ePI product information stored inside the product DSU.

- `:gtin` — path param, the product code (GTIN)

The ePI protocol version is read from the product DB record (`epiProtocol`, default `v1`) and used to
build the storage path (e.g. `/product/product.epi_v1`); if that version's file is not stored in the
DSU, the highest available `product.epi_vX` is used instead.

**Response** `200`:

```json
{
  "version": "1",
  "path": "/product/product.epi_v1",
  "product": {
    "productCode": "00000000000451",
    "epiProtocol": "v1",
    "internalMaterialCode": "IMC-2245",
    "inventedName": "Neuropril",
    "nameMedicinalProduct": "Neuropril 2.5mg effervescent tablets",
    "productRecall": false,
    "version": 18
  }
}
```

**Errors**: `404` product not found in the DB, or no product info file exists in the DSU.

### `GET /getProductImage/:gtin`

Returns the product image stored inside the product DSU as raw bytes.

- `:gtin` — path param, the product code (GTIN)

The image is resolved dynamically inside the mounted product folder of the outer DSU: `image.png`
(legacy gtin-resolver mapping), `photo.png` (DSU-fabric product API `addPhoto`/`getPhoto`), then any
other `photo.*`/`image.*` file. If the stored content is a base64 data URL (`data:image/png;base64,...`,
how `addPhoto` stores it), it is decoded and served as raw binary.

**Response** `200`: raw image bytes with `Content-Type` derived from the file extension or the data URL
mime type (e.g. `image/png`).

**Errors**: `404` product not found in the DB, or no image stored in the DSU.

---

## Batches

### `GET /listBatches/:gtin/:x?page=N`

Returns a paginated list of the **full batch enclave records** of a specific product. The product
must exist.

- `:gtin` — path param, the product code (GTIN) whose batches are listed
- `:x` — number of records per page (max 250)
- `?page=N` — page number (default 1)

Each batch record's `pk` is the unique batch id `"<productCode>_<batchNumber>"`.

**Response** `200`:

```json
{
  "page": 1,
  "totalPages": 1,
  "totalRecords": 3,
  "data": [
    {
      "pk": "00000000000451_POP-001-1",
      "productCode": "00000000000451",
      "batchNumber": "POP-001-1",
      "expiryDate": "270215",
      "batchRecall": false,
      "version": 3
    }
  ]
}
```

**Errors**: `404` product not found.

### `GET /getBatch/:gtin/:batchNumber`

Returns the ePI batch information stored inside the batch DSU.

- `:gtin` — path param, the product code (GTIN) the batch belongs to
- `:batchNumber` — path param, the batch number

Same versioning behavior as `GET /getProduct/:gtin` (path e.g. `/batch/batch.epi_v1`).

**Response** `200`:

```json
{
  "version": "1",
  "path": "/batch/batch.epi_v1",
  "batch": {
    "productCode": "00000000000451",
    "batchNumber": "POP-001-1",
    "epiProtocol": "v1",
    "expiryDate": "270215",
    "dateOfManufacturing": "250615",
    "batchRecall": false,
    "version": 3
  }
}
```

**Errors**: `404` batch not found in the DB, or no batch info file exists in the DSU.

---

## Leaflets

A "leaflet" is a folder (`type`/`language`/optional `market`) inside a product or batch DSU that holds
several files (`info.xml`/`leaflet.xml`, figures, tables, ...). Leaflet folders exist in two hierarchies:

- plain: `<basePath>/<type>/<language>` (e.g. `/product/leaflet/en`)
- ePI market: `<basePath>/ePI/<type>/<language>/<market>` (e.g. `/product/ePI/leaflet/en/GB`)

`basePath` is `/product` for product DSUs and `/batch` for batch DSUs. The leaflet types are
`leaflet` and `prescribingInfo`.

### `GET /listLeaflets/:gtin`

Returns the metadata of every leaflet folder found inside the **product** DSU.

**Response** `200`:

```json
{
  "gtin": "00000000000451",
  "batchNumber": null,
  "basePath": "/product",
  "leaflets": [
    {
      "type": "leaflet",
      "language": "en",
      "market": null,
      "path": "/product/leaflet/en",
      "fileCount": 5,
      "hasXml": true,
      "files": ["leaflet.xml", "table_img_a.jpg", "table_img_b.jpg", "figure_009_0948_3982_2628_1542.png", "figure_009_0948_7574_2666_1528.png"]
    }
  ]
}
```

### `GET /listLeaflets/:gtin/:batchNumber`

Same as above for the **batch** DSU (`batchNumber` is set in the response).

### `GET /getLeaflet/:gtin?type=<type>&language=<lang>[&market=<market>][&batchNumber=<batch>][&content=true]`

Returns the documents (files) inside a leaflet folder of a product or batch DSU.

| Query param | Required | Description |
|---|---|---|
| `type` | yes | one of: `leaflet`, `prescribingInfo` |
| `language` | yes | the leaflet language (e.g. `en`) |
| `market` | no | the ePI market (selects the `<basePath>/ePI/...` hierarchy) |
| `batchNumber` | no | selects the batch DSU instead of the product DSU |
| `content` | no | when `"true"`, each document also embeds its content: `encoding: "utf8"` for text files (`.xml`, `.xsl`, `.json`, `.txt`, `.html`, `.htm`), `encoding: "base64"` for binary files |

**Response** `200`:

```json
{
  "gtin": "00000000000451",
  "batchNumber": null,
  "type": "leaflet",
  "language": "en",
  "market": "GB",
  "path": "/product/ePI/leaflet/en/GB",
  "documents": [
    { "name": "info.xml", "path": "/product/ePI/leaflet/en/GB/info.xml" },
    { "name": "table_img_a.jpg", "path": "/product/ePI/leaflet/en/GB/table_img_a.jpg" }
  ]
}
```

With `content=true`, each document additionally carries `"encoding"` and `"content"`.

**Errors**: `400` missing/invalid `type` or `language`; `404` product/batch not found or no file at the
resolved leaflet path.

### `GET /getLeafletDocument/:gtin?type=<type>&language=<lang>&name=<file>[&market=<market>][&batchNumber=<batch>]`

Fetches a single document (file) from a leaflet folder of a product or batch DSU.

| Query param | Required | Description |
|---|---|---|
| `type` | yes | one of: `leaflet`, `prescribingInfo` |
| `language` | yes | the leaflet language (e.g. `en`) |
| `name` | yes | the file name inside the leaflet folder (e.g. `info.xml`); plain names only — no `/`, `\` or `..` |
| `market` | no | the ePI market (selects the `<basePath>/ePI/...` hierarchy) |
| `batchNumber` | no | selects the batch DSU instead of the product DSU |

**Response** `200`: the raw file content with the appropriate `Content-Type` header. Known content
types: `.xml` → `application/xml`, `.xsl` → `text/xsl`, `.json` → `application/json`, `.txt` →
`text/plain`, `.html`/`.htm` → `text/html`, `.png` → `image/png`, `.jpg`/`.jpeg` → `image/jpeg`,
`.gif` → `image/gif`, `.svg` → `image/svg+xml`, `.pdf` → `application/pdf`; anything else →
`application/octet-stream`.

**Errors**: `400` missing/invalid params (including path-like `name` values); `404` product/batch not
found or document not found.

---

## Action audit records

The audit entries are stored by gtin-resolver's `AuditService` in the enclave `audit` table (one entry
per ePI operation). Each record contains the operation metadata:

```json
{
  "pk": "001b16cd7d7432938a587746ff8d230d20a350d076329ba523fe28a38ef226d6",
  "itemCode": "00000000001410",
  "reason": "Added Leaflet",
  "creationTime": "2026-10-02T15:09:53.842Z",
  "username": "auto-tester@pdmfc.com [722eeddb-54d7-4c34-a210-86c0fbab0d5b]",
  "__timestamp": 1790953793845,
  "version": 4,
  "details": [
    { "epiLanguage": "en", "epiType": "prescribingInfo" }
  ]
}
```

- `batchNumber` is present only for batch operations
- `details` contains either the field diffs of the operation or the ePI metadata (language/type/market)
- The `user-access` table (access audits) is **not** exposed by this API.

### `GET /listAuditRecords/:x?page=N`

Returns a paginated list of **all** action audit records (product and batch operations), in insertion
order, as **full records**.

**Response** `200`: `{ "page": 1, "totalPages": 1, "totalRecords": 1897, "data": [ <audit record>, ... ] }`

### `GET /listAuditRecords/:gtin/:x?page=N`

Returns a paginated list of the audit records where `itemCode == gtin` (batch audits included, since
batch entries carry the parent GTIN as `itemCode`). Paginated in memory; unknown gtins return an
empty page (`{ "page": 1, "totalPages": 0, "totalRecords": 0, "data": [] }`).

### `GET /getAuditRecord/:auditId`

Returns a single audit record by its id (the record `pk`).

**Response** `200`: the audit record JSON.

**Errors**: `404` audit record not found.

---

## Migration client cheat sheet

A typical full extraction walks the pages of each listing and then fetches the DSU content:

1. `GET /listProducts/250?page=1..totalPages` → product records
2. Per product: `GET /getProduct/:gtin`, `GET /getProductImage/:gtin`, `GET /listLeaflets/:gtin`
3. `GET /listBatches/:gtin/250?page=1..totalPages` → batch records per product
4. Per batch: `GET /getBatch/:gtin/:batchNumber`, `GET /listLeaflets/:gtin/:batchNumber`
5. Per leaflet: `GET /getLeaflet/:gtin?...&content=true` (or per file with `/getLeafletDocument`)
6. `GET /listAuditRecords/250?page=1..totalPages` → action audit records

The enclave records carry the authoritative metadata (`pk`, `productCode`, `batchNumber`, `version`,
`__timestamp`, `epiProtocol`); the DSU endpoints provide the versioned document content.

---

## Validating a populate run against the server

`workdocs/tests/validate-populate-report.js` compares the populate report
(`workdocs/populate-manifest.json`) against what the server actually exposes — products/batches
records and their DSU content, leaflet folders and documents, product photos, and the action audit
records. See [testing-migration-large-dataset.md](./testing-migration-large-dataset.md) for the full
workflow.

---

## Data scan

`POST /scan` starts a **full scan** of the data present on the server — products, batches, leaflet
folders, product photos and action audit records — and generates a report shaped like the populate
script's manifest (`workdocs/populate-manifest.json`), which makes before/after comparisons between
a populate run and the server data straightforward.

- `POST /scan` — starts the scan and returns immediately with `202 { "scanId": "...", "status": "running" }`.
  A scan loads a DSU per product/batch, so it takes minutes on large datasets; while a scan is
  running, another `POST /scan` returns `409 { "error": "A scan is already running", "scanId": "..." }`.
- `GET /scan` — the state of the last scan (`404` before the first scan).
- `GET /scan/:scanId` — the state of a specific scan.

**Status response** `200`:

```json
{
  "scanId": "scan-1791200000000",
  "status": "running",
  "startedAt": "2026-10-04T19:20:00.000Z",
  "finishedAt": null,
  "progress": { "scannedProducts": 37, "totalProducts": 100 }
}
```

When `status` is `"completed"` the response additionally carries the `report`; when it is `"failed"`
it carries an `error`. The scan state is kept **in memory only** — it is lost when the server
restarts, so fetch the report before stopping the server.

**Report structure** (trimmed):

```json
{
  "generatedAt": "2026-10-04T19:21:52.000Z",
  "source": { "kind": "migration-server-scan", "domain": "local.epi", "subdomain": "local.epi" },
  "counts": {
    "products": 100,
    "batches": 224,
    "productLeaflets": 936,
    "batchLeaflets": 405,
    "photos": 35,
    "productsWithMarkets": 70,
    "productsWithoutMarkets": 30,
    "auditRecords": 3030
  },
  "summary": {
    "auditReasons": { "Created Product": 100, "Added Leaflet": 1393, "...": 0 },
    "auditTimeRange": { "first": "2026-10-02T14:55:49.278Z", "last": "2026-10-02T15:10:56.686Z" },
    "failures": [ { "item": "batch 00000000000451/POP-001-2", "error": "..." } ]
  },
  "products": [
    {
      "index": 1,
      "gtin": "00000000000451",
      "inventedName": "Neuropril",
      "nameMedicinalProduct": "Neuropril 2.5mg effervescent tablets",
      "epiProtocol": "v1",
      "version": 18,
      "timestamp": 1790961937054,
      "fields": { "...full product record without system fields...": "" },
      "photo": { "imageName": "photo.png", "path": "/product/photo.png" },
      "dsu": { "infoPath": "/product/product.epi_v1", "infoVersion": "1" },
      "productLeaflets": [ { "type": "leaflet", "language": "en", "market": null } ],
      "batches": [
        {
          "batchNumber": "POP-001-1",
          "epiProtocol": "v1",
          "version": 3,
          "timestamp": 1790952864742,
          "fields": { "...full batch record without system/product fields...": "" },
          "batchLeaflets": [ { "type": "leaflet", "language": "en", "market": null } ]
        }
      ]
    }
  ]
}
```

Notes:

- `fields` carries the record as uploaded (system fields `pk`/`epiProtocol`/`lockId`/`version`/
  `__timestamp` — and on batches, the server-added `inventedName`/`nameMedicinalProduct` — are
  lifted to dedicated properties instead); array properties stored as JSON strings (e.g. some
  `strengths` values) are parsed back into arrays.
- Leaflet folders appear as `{type, language, market}` references only — the documents themselves
  are fetched with `GET /getLeaflet...`/`GET /getLeafletDocument...` (no file contents in the report).
- Per-item failures (e.g. a DSU that fails to load) are listed in `summary.failures` and the scan
  continues; `counts.products` reflects the products actually scanned.

---

## Known behaviour / gotchas

- **`totalRecords` does not come from the DB `countDocs`.** The OpenDSU `DBClient.countDocs`
  undercounts tables whose record ids sort above `_design/` (CouchDB lists every record with an id
  starting with `a`–`f` together with the design documents). The audit table uses sha256 hex pks, so
  ~37% of its records would be unreachable through skip-based pagination if the count were trusted —
  the listings therefore fetch the matching records in one bounded query (`MAX_QUERY_LIMIT`) and
  paginate in memory. Datasets above 100,000 audit records would need chunked extraction.
- The `listAuditRecords/:gtin/:x` filtered variant and the `listBatches/:gtin/:x` variant create a
  database index on the filtered field on first use — the INFO log lines are expected.
- The product image is resolved dynamically inside the mounted product folder of the outer DSU:
  `image.png` (legacy gtin-resolver mapping) or `photo.png` (DSU-fabric product API), then any other
  `photo.*`/`image.*` file; base64 data URLs are decoded before being served.
- Leaflet folders exist in two hierarchies: plain (`/product/leaflet/en`) and ePI market
  (`/product/ePI/leaflet/en/<market>`); pass `market=` to select the latter.
- The ePI info endpoints read the ePI protocol version from the DB record (`epiProtocol`, default
  `v1`) and fall back to the highest `*.epi_vX` file stored in the DSU when that version's file is
  missing.
