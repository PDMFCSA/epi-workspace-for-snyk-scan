# Populating the environment for a migration

This tutorial covers moving an existing SOR environment to a new release or infrastructure (for
example a new cluster or a new OpenDSU version). The workspace ships with dedicated test suites that
validate data integrity around a migration:

- `tests/migration/before-migration.test.js` - creates reference records (TRUST-125) on the source
  environment before the migration
- `tests/migration/after-migration.test.js` - verifies the same records on the target environment
  after the migration

To make the before/after comparison meaningful, the environment should be populated with a **known,
controlled dataset** and a **manifest** describing every record, so the records can be compared
afterwards. To inspect/extract the data through the migration APIs, see
[migration-server.md](./migration-server.md).

## Populating the environment

The script `bin/populate-controlled.js` fills the SOR with a deterministic, reproducible dataset and
writes a manifest describing exactly what was created. Reruns are idempotent: existing
products/batches are reused and already-uploaded leaflets are skipped.

**Prerequisites**

1. The server must be running (CouchDB + `npm run server`, see the workspace README
   [Installation](../../README.md#installation) section).
2. `tests/config/test.config.json` must point to the target environment (`sor_endpoint`, OAuth
   `clientId`/`clientSecret`/`scope`, `domain`, `subdomain`).

**Steps**

1. (Optional but recommended) Generate and validate the plan without sending anything to the SOR:

```sh
$ node ./bin/populate-controlled.js --dry-run
```

2. Populate the environment:

```sh
$ node ./bin/populate-controlled.js
```

The full default dataset (100 products) uploads roughly 1,700 records and takes some minutes. A run
summary is printed at the end; the full log is written to `workdocs/populate-run.log` when
redirecting the output.

**Options**

| Option | Default | Description |
|---|---|---|
| `--products <n>` | `100` | Number of products to generate |
| `--seed <n>` | `2026` | Seed for the deterministic dataset - the same seed always generates the same dataset |
| `--leaflets-dir <path>` | completLeaflet example folder | Folder with the leaflet XML (and its images) used as leaflet content |
| `--manifest <path>` | `workdocs/populate-manifest.json` | Where the dataset manifest is written |
| `--dry-run` | off | Generate, validate and write the manifest without contacting the SOR |

**What the dataset contains**

- 100 products (configurable), each with 2-3 languages (`en` + `fr` always, a 3rd language randomly),
  1-3 batches, 0-3 strengths and 0-2 markets (some products intentionally have no market)
- Product-level leaflets covering every scenario: `{leaflet, prescribingInfo} x {no market, each
  product market}` for every language
- Batch-level leaflets: type `leaflet` only, no market, 2-3 different languages per batch
- 2-3 update rounds (PUT) per product and per batch that change property values, creating version
  history and `Updated Product`/`Updated Batch` audit entries; the manifest records every round and
  the expected final state (`finalFields`/`finalStrengths`)
- Some products have a product photo and/or extra images attached to their leaflets
- Every optional product/batch/market property is filled randomly, so all combinations appear across
  the dataset

**Comparing records after the migration**

- `workdocs/populate-manifest.json` contains the full plan (every product with its GTIN, fields,
  strengths, markets, batches and leaflets) plus the execution result of the run (per record:
  `added`/`skipped`/`failed`). Use it as the baseline to compare the records before and after the
  migration.
- The same `--seed` regenerates the identical dataset; GTINs depend on the local `.gtin-counter.lock`
  state and are recorded in the manifest, which is the authoritative GTIN <-> product mapping.
- If the migration wipes the environment, delete `.gtin-counter.lock` and rerun the script with the
  same `--seed` to reproduce the exact same dataset (fresh GTINs - use the manifest of the previous
  run to map old GTINs to new ones).

For a full walkthrough of testing the migration APIs against a large dataset (500+ products), see
[testing-migration-large-dataset.md](./testing-migration-large-dataset.md).
