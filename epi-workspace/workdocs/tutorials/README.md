# Tutorials

Step-by-step guides for operating and migrating the ePI environment.

| Tutorial | Purpose |
|---|---|
| [Migration guide](./migration-guide.md) | Runbook with the two migration sequences: the **local sequence** (populate 500+ products, start the server, validate the population with the migration script) and the **deployment sequence** (start the migration server on a deployed environment). |
| [Migration server](./migration-server.md) | API reference of `workdocs/tests/migration-server.js` (copied into `opendsu-sdk` to run) — read-only endpoints to extract products, batches, leaflets and action audit records for the migration. |
| [Populating the environment for a migration](./populating-for-migration.md) | How to fill the SOR with a deterministic, manifest-backed dataset (migrated from the workspace README). |
| [Testing the migration with a large dataset](./testing-migration-large-dataset.md) | End-to-end walkthrough: populate 500+ products and validate the migration server's pagination (CouchDB limit: 250 records per query), including the automated report validation test (`workdocs/tests/validate-populate-report.js`). |
