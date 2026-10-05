# Testing the migration APIs with a large dataset (500+ products)

The enclave database (CouchDB) and the migration server's pagination share a hard limit of **250
records per query**. To prove that the migration extraction is complete and lossless, the environment
must hold **more than one page** of every model — 500 products guarantees this (500 / 250 = 2 full
pages, plus the page-boundary behaviour on every other listing).

This guide walks through populating the environment with 500+ products and validating every
[migration server](./migration-server.md) endpoint against it. The condensed runbook (local +
deployment sequences) lives in [migration-guide.md](./migration-guide.md).

---

## 1. Prerequisites

- The local server must be running: CouchDB + `npm run server` in the workspace root. Verify with:

  ```sh
  curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:8080/
  ```

  A `401` is expected and means it is up.
- `tests/config/test.config.json` must point to the target environment (`sor_endpoint`, OAuth
  `clientId`/`clientSecret`/`scope`, `domain`, `subdomain`).
- The OpenDSU build must exist: `opendsu-sdk/builds/output/openDSU.js`.

## 2. Populate 500 products

`bin/populate-controlled.js` generates a deterministic dataset (see
[populating-for-migration.md](./populating-for-migration.md) for all options and dataset details).

1. (Recommended) Validate the plan first, without sending anything to the SOR:

   ```sh
   node ./bin/populate-controlled.js --products 500 --dry-run
   ```

   Review the plan summary (products, batches, leaflets, updates, photos) and the generated
   `workdocs/populate-manifest.json`.

2. Populate the environment:

   ```sh
   node ./bin/populate-controlled.js --products 500 2>&1 | tee workdocs/populate-run.log
   ```

**Expected scale and duration**: the default 100-product dataset uploads roughly 1,700 records in a
few minutes; 500 products upload roughly 5x that (≈8,500 SOR records: products, batches, leaflets,
update rounds and photos). Expect a runtime in the tens of minutes — let it run to completion and
check the final summary (per-record `added`/`skipped`/`failed` counts live in
`workdocs/populate-manifest.json`).

The GTINs are recorded in the manifest, which is the authoritative GTIN ↔ product mapping for the
before/after comparison.

## 3. Start the migration server

The server script lives in `workdocs/tests` and must be copied into the `opendsu-sdk` folder (it
bootstraps the OpenDSU runtime from that folder's build output):

```sh
cp workdocs/tests/migration-server.js opendsu-sdk/
cd opendsu-sdk
node migration-server.js
```

Default port is `8086`; the console prints `Migration server started on port 8086`.

## 4. Verify pagination at scale

Base URL: `http://localhost:8086`. The page size is capped at 250, and the response always carries
`page`, `totalPages` and `totalRecords`.

### 4.1 Products — walk every page and count

```sh
BASE=http://localhost:8086

# two full pages of 250
curl -s "$BASE/listProducts/250?page=1" | head -c 300
curl -s "$BASE/listProducts/250?page=2" | head -c 300
```

Walk all pages and assert the unique product count equals 500:

```sh
BASE=http://localhost:8086
TOTAL_PAGES=$(curl -s "$BASE/listProducts/250" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).totalPages))')

UNIQUE=0
for p in $(seq 1 "$TOTAL_PAGES"); do
  curl -s "$BASE/listProducts/250?page=$p" \
    | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).data.map(r=>r.productCode).join("\n")))'
done | sort -u | wc -l
```

Expected: `UNIQUE = 500` — no duplicated and no missing records across pages.

### 4.2 Batches — more than 1,000 records

500 products with 1-3 batches each produce roughly 1,000+ batch records, i.e. **5+ pages**:

```sh
# pick the first product and walk its batches
GTIN=$(curl -s "$BASE/listProducts/1" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).data[0].productCode))')
curl -s "$BASE/listBatches/$GTIN/250" | head -c 300
```

Batch totals across the whole dataset can be read from the manifest
(`plan.batches`) or by summing `totalRecords` over every product.

### 4.3 Action audit records — thousands of records

Every product/batch/leaflet operation and update round writes an audit entry, so 500 products
generate several thousand action audit records (the 100-product dataset already holds ~1,900):

```sh
curl -s "$BASE/listAuditRecords/250?page=1" | head -c 300
```

Walk all pages with the same loop as in 4.1 (replace `listProducts` with `listAuditRecords` and
`productCode` with `pk`) and verify the unique count equals `totalRecords`.

Also verify the per-product filtered listing:

```sh
curl -s "$BASE/listAuditRecords/$GTIN/250" | head -c 300
```

Unknown gtins return an empty page (`{ "page": 1, "totalPages": 0, "totalRecords": 0, "data": [] }`).

### 4.4 Page boundary behaviour

```sh
# page beyond the last page -> empty data, totalPages unchanged
curl -s "$BASE/listProducts/250?page=999"

# page size above the cap is silently capped at 250
curl -s "$BASE/listProducts/1000" | head -c 300

# invalid page size -> 400
curl -s "$BASE/listProducts/0"
```

### 4.5 Deep fetch on the first and last records

Extracting only the first page's records is not enough — the migration must also work on the last
page. Take the first and last GTINs from the page walk and fetch their DSU content:

```sh
curl -s "$BASE/getProduct/$GTIN" | head -c 300                       # { version, path, product }
curl -s "$BASE/getBatch/$GTIN/$(curl -s "$BASE/listBatches/$GTIN/1" \
  | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).data[0].batchNumber))')" \
  | head -c 300                                                      # { version, path, batch }
curl -s "$BASE/listLeaflets/$GTIN" | head -c 400                     # leaflet folder metadata
curl -s "$BASE/getLeaflet/$GTIN?type=leaflet&language=en" | head -c 300
curl -s -o /tmp/product-image.png -w "%{http_code} %{content_type} %{size_download}\n" \
  "$BASE/getProductImage/$GTIN" && file /tmp/product-image.png       # only for products with a photo
```

A handful of records deep-fetched per page (first, last, one random) is enough to trust the bulk
extraction.

### 4.6 Optional: full data scan before migrating

Before attempting the migration, the full data scan generates a report of everything present on the
server — same structure as the populate manifest, so the two can be compared record by record:

```sh
curl -s -X POST http://localhost:8086/scan                          # {"scanId":"...","status":"running"}
curl -s http://localhost:8086/scan | head -c 300                    # poll until status "completed"
curl -s http://localhost:8086/scan > workdocs/server-scan-report.json
```

The scan loads a DSU per product/batch and takes minutes on large datasets; details and the full
report structure are documented in the [Data scan](./migration-server.md#data-scan) section of the
API reference. The scan state is in-memory only — fetch the report before restarting the server.

## 5. Automated validation

Instead of (or in addition to) the manual walk above, the report produced by the populate run can be
validated automatically against the migration server:

```sh
# full validation of every product/batch/leaflet/audit record in the report
node ./workdocs/tests/validate-populate-report.js

# quick run: deep-checks (DSU content, leaflets, photos) on a sample of 10 products
node ./workdocs/tests/validate-populate-report.js --sample 10

# exact record counts (use on a freshly populated environment; by default records left on the
# server by earlier populate runs are reported as warnings, not failures)
node ./workdocs/tests/validate-populate-report.js --strict

# options: --manifest <path> (default workdocs/populate-manifest.json), --server <url> (default
# http://localhost:8086), --quiet
```

The test walks every page of the `listProducts`/`listBatches`/`listAuditRecords` listings (verifying
the walked records match the reported `totalRecords`), checks every record field against the
manifest's final state (`finalFields`/`finalStrengths`/markets), deep-checks the DSU content
(`getProduct`/`getBatch`/`listLeaflets`/`getLeafletDocument`/`getProductImage`) and verifies every
GTIN of the report has audit records. Exit code 0 = report matches the server.

## 6. Known behaviour / gotchas

- `:x` is capped at **250** per page (the CouchDB/DBService query limit); `?page` defaults to 1.
- `listBatches`/`listAuditRecords` filtered variants paginate in memory; the first filtered query
  auto-creates a DB index (`productCode_index`, `itemCode_index`) — the INFO log lines are expected.
- Audit records come from the enclave `audit` table only (user **action** audits). The `user-access`
  table is intentionally not exposed.
- The population run is idempotent: rerunning `bin/populate-controlled.js` with the same
  `--products`/`--seed` reuses existing records and skips already-uploaded leaflets, filling gaps.
- A fresh SOR needs the `.gtin-counter.lock` deletion trick only when the environment was wiped (see
  [populating-for-migration.md](./populating-for-migration.md)).

## 7. Success criteria

- The population run ends with zero failures (check the run summary and the manifest execution
  results) and the manifest records 500 products.
- `GET /listProducts/250` reports `totalRecords >= 500` and `totalPages >= 2`; the page walk collects
  exactly `totalRecords` unique `productCode` values.
- Batch and audit page walks likewise collect exactly `totalRecords` unique `pk` values.
- Page-boundary requests behave as documented (empty last+1 page, cap at 250, `400` on invalid `:x`).
- Deep fetches (`getProduct`, `getBatch`, `listLeaflets`, `getLeaflet`, `getProductImage`) succeed on
  records taken from different pages, including the last one.
- No unhandled 500s in the server console during the run (CouchDB "document not found" DEBUG lines
  for missing records are normal — they map to 404 responses).
