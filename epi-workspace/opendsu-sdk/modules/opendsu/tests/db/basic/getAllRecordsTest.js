require("../../../../../builds/output/testsRuntime");
const tir = require("../../../../../psknode/tests/util/tir");

const dc = require("double-check");
const assert = dc.assert;
const openDSU = require('../../../index');
$$.__registerModule("opendsu", openDSU);
const dbAPI = openDSU.loadAPI("db");

assert.callback('Get all records test', (testFinished) => {
    dc.createTestFolder('createDSU', async (err, folder) => {
        const vaultDomainConfig = {
            "anchoring": {
                "type": "FS",
                "option": {}
            }
        }

        try {
            await tir.launchConfigurableApiHubTestNodeAsync({
                domains: [{name: "vault", config: vaultDomainConfig}],
                rootFolder: folder
            });
            const TABLE = "test_table";
            let records = [{pk: "key1", record: {"value": 1}}, {pk: "key2", record: {"value": 2}}, {
                pk: "key3",
                record: {"value": 3}
            }, {pk: "key4", record: {"value": 5}}];
            const db = dbAPI.getSimpleWalletDB("mydb");
            for (let i = 0; i < records.length; i++) {
                await $$.promisify(db.insertRecord)(TABLE, records[i].pk, records[i].record);
            }
            const tableContent = await $$.promisify(db.getAllRecords)(TABLE);
            records = records.map(e => e.record);
            tableContent.sort((a, b) => {
                if (a.value < b.value) {
                    return -1;
                }

                if (a.value === b.value) {
                    return 0
                }

                return 1;
            })

            assert.arraysMatch(tableContent, records);
            testFinished();
        } catch (e) {
            return console.log(e);
        }
    });
}, 5000);

