# Migration guide

Runbook for migrating the ePI data out of an SOR environment with the migration server
(`workdocs/tests/migration-server.js`, API reference in [migration-server.md](./migration-server.md)).

Two sequences:

- **Local sequence** — prepare a *source* environment with a known, report-backed dataset (500+
  products, beyond the 250-record database query limit) and validate the migration server against
  the populate report before extracting anything.
- **Deployment sequence** — start the migration server on an already-populated environment (for
  example a deployed SOR) so the migration client can extract the data.

Detailed references: [populating-for-migration.md](./populating-for-migration.md) and
[testing-migration-large-dataset.md](./testing-migration-large-dataset.md).

---

## Local sequence

Goal: a local environment holding **at least 500 products**, with the populate report validated
against the migration server.

### Step 1 — Prerequisites

1. CouchDB and the local server are running (`npm run server` in the workspace root). Verify:

   ```sh
   curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:8080/
   ```

   A `401` is expected and means the server is up.
2. `tests/config/test.config.json` points to the target environment (`sor_endpoint`, OAuth
   `clientId`/`clientSecret`/`scope`, `domain`, `subdomain`).
3. The OpenDSU build exists: `opendsu-sdk/builds/output/openDSU.js`.

### Step 2 — Populate 500+ products

1. (Recommended) Validate the plan without sending anything to the SOR:

   ```sh
   node ./bin/populate-controlled.js --products 500 --dry-run
   ```

   Review the plan summary and `workdocs/populate-manifest.json` (500 products, ~1,000+ batches,
   ~4,700+ leaflets).

2. Run the population (idempotent — reruns reuse existing records and fill gaps):

   ```sh
   node ./bin/populate-controlled.js --products 500 2>&1 | tee workdocs/populate-run.log
   ```

   Expect roughly 8,500 uploaded records and a runtime in the tens of minutes. The run must finish
   with zero failures; the per-record results (`added`/`skipped`/`failed`) are recorded in
   `workdocs/populate-manifest.json`, which is the report the validation uses.

### Step 3 — Start the migration server

The server script lives in `workdocs/tests` and must be copied into the `opendsu-sdk` folder (it
bootstraps the OpenDSU runtime from that folder's build output):

```sh
cp workdocs/tests/migration-server.js opendsu-sdk/
cd opendsu-sdk
node migration-server.js
```

- Default port `8086` (override with the `PORT` env var); startup takes a few seconds.
- Verify: `curl -s http://localhost:8086/health` → `{"status":"ok",...}`.

### Step 4 — Validate the population with the migration script

From the workspace root, with the server running:

```sh
# full validation of every product/batch/leaflet/audit record in the report
node ./workdocs/tests/validate-populate-report.js --manifest workdocs/populate-manifest.json

# quick run: deep-checks on a sample of 10 products
node ./workdocs/tests/validate-populate-report.js --sample 10
```

Expected: `Validation PASSED: the populate report matches the migration server (500 products)` and
exit code `0`. On a freshly populated environment you can additionally demand exact record counts
with `--strict` (extra records left by earlier populate runs would then fail the run; by default
they are warnings).

The validation walks every page of the `listProducts`/`listBatches`/`listAuditRecords` listings
(proving pagination beyond the 250-record limit), checks the record fields against the report's
final state, deep-checks the DSU content (product/batch info, leaflets and their documents, product
photos) and confirms every GTIN has audit records. See
[testing-migration-large-dataset.md](./testing-migration-large-dataset.md) for the complete test
walkthrough and success criteria.

Once the validation passes, the local sequence is complete — the same extraction client can be
pointed at a deployed environment.

### Step 5 (optional) — Scan the data before migrating

Before attempting the migration, the full data scan generates a report of everything present on the
server — same structure as the populate manifest, so the two can be compared record by record:

```sh
curl -s -X POST http://localhost:8086/scan                          # {"scanId":"...","status":"running"}
curl -s http://localhost:8086/scan | head -c 300                    # poll until status "completed"
curl -s http://localhost:8086/scan > workdocs/server-scan-report.json
```

The scan loads a DSU per product/batch and takes minutes on large datasets (watch
`progress.scannedProducts`). Details and the full report structure are documented in the
[Data scan](./migration-server.md#data-scan) section of the API reference. Note the scan state is
in-memory only: fetch the report before restarting the server.

---

## Deployment sequence

Goal: start the migration server on a deployed (pre-populated) SOR environment.

### Step 1 — Prerequisites on the deployment environment

1. The `opendsu-sdk` folder with the OpenDSU build (`builds/output/openDSU.js`) — the server must
   run from inside this folder because it bootstraps the runtime from the build output.
2. Next to the SDK folder (one level up), the environment configuration it reads:
   - `env.json` — `EPI_DOMAIN`/`EPI_SUBDOMAIN` of the ePI enclave (they build the enclave table
     names `db_db_<domain>_<subdomain>_<table>`);
   - `apihub-root/external-volume/config/apihub.json` — the CouchDB credentials (`db.uri`,
     `db.user`, `db.secret`).
3. CouchDB is reachable at `db.uri` from the machine running the server. No other ePI component is
   required by the server (it reads the enclave database and the DSUs directly), but resolving the
   product/batch DSUs requires access to the same anchors/apihub the environment used — in the
   default setup this is the `BDNS_ROOT_HOSTS` entry of `env.json`.

### Step 2 — Copy the server script into the SDK folder

```sh
cp workdocs/tests/migration-server.js opendsu-sdk/
```

Place `migration-server.js` inside the deployment's `opendsu-sdk` folder (the script is
self-contained apart from the runtime bootstrap, no extra dependencies).

### Step 3 — Start the server

```sh
cd opendsu-sdk
node migration-server.js
```

Environment variables (all optional):

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8086` | HTTP port of the server |
| `DB_USER` / `DB_SECRET` | from `apihub.json` | Override the CouchDB credentials |
| `READ_ONLY_MODE` | off | Opens the database in read-only mode (recommended for migrations) |

Startup takes a few seconds and prints `Migration server started on port <PORT>`; noisy
DEBUG/WARN lines ("Logger not available, using console", "The system is not safe for production...")
are normal. Run it under a process supervisor (or `nohup`/`screen`) for long extractions.

### Step 4 (optional) — Scan the data before migrating

Before attempting the migration, the full data scan inventories everything present on the server
into a report shaped like the populate script's manifest:

```sh
curl -s -X POST http://localhost:<PORT>/scan                        # {"scanId":"...","status":"running"}
curl -s http://localhost:<PORT>/scan | head -c 300                  # poll until status "completed"
curl -s http://localhost:<PORT>/scan > server-scan-report.json
```

The report is the baseline for the migration: per-product record fields, leaflet references, photo
references, DSU info paths and audit statistics. The scan loads a DSU per product/batch and takes
minutes on large datasets (watch `progress.scannedProducts`); details and the full report structure
are documented in the [Data scan](./migration-server.md#data-scan) section of the API reference.
Note the scan state is in-memory only: fetch the report before restarting the server.

### Step 5 — Verify and extract

1. Health check:

   ```sh
   curl -s http://localhost:<PORT>/health
   ```

   → `{"status":"ok","uptime":...,"opendsuVersion":...,"node":...}`.

2. Sanity-check the data before starting the extraction client:

   ```sh
   curl -s "http://localhost:<PORT>/listProducts/1"      # totalRecords = expected product count
   curl -s "http://localhost:<PORT>/listAuditRecords/1"  # totalRecords = audit entry count
   ```

3. Point the migration client at `http://localhost:<PORT>` and walk the pages (the pagination
   convention and every endpoint's contract are documented in
   [migration-server.md](./migration-server.md)).

### Step 6 — Stop the server

Kill the process with `SIGINT`/`SIGTERM` (e.g. `pkill -f "node migration-server.js"`); it shuts down
gracefully. The server is read-only, so stopping it mid-extraction is safe — the client can resume
by re-walking the pages.
