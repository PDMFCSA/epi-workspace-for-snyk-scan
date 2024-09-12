require("../../../../builds/output/testsRuntime");
const tir = require("../../../../psknode/tests/util/tir");

const dc = require("double-check");
const assert = dc.assert;
const openDSU = require('../../index');
$$.__registerModule("opendsu", openDSU);
const enclaveAPI = openDSU.loadAPI("enclave");
const scAPI = openDSU.loadAPI("sc");

assert.callback('Remote enclave test', (testFinished) => {
    dc.createTestFolder('createDSU', async (err, folder) => {
        const vaultDomainConfig = {
            "anchoring": {
                "type": "FS",
                "option": {}
            },
            "enable": ["enclave", "mq"]
        }

        const domain = "mqtestdomain";
        await tir.launchConfigurableApiHubTestNodeAsync({
            domains: [{name: domain, config: vaultDomainConfig}],
            rootFolder: folder
        });

        const runAssertions = async () => {
            try {
                const DB_NAME = "test_db";
                const lokiAdapterClient = enclaveAPI.initialiseLightDBEnclave(DB_NAME)
                const TABLE = "test_table";
                const addedRecord = {data: 1};
                try {
                    await $$.promisify(lokiAdapterClient.createDatabase)(DB_NAME);
                    await $$.promisify(lokiAdapterClient.insertRecord)($$.SYSTEM_IDENTIFIER, TABLE, "pk1", addedRecord);
                    await $$.promisify(lokiAdapterClient.insertRecord)($$.SYSTEM_IDENTIFIER, TABLE, "pk2", addedRecord);
                    const record = await $$.promisify(lokiAdapterClient.getRecord)($$.SYSTEM_IDENTIFIER, TABLE, "pk1");
                    assert.objectsAreEqual(record, addedRecord, "Records do not match");
                    const allRecords = await $$.promisify(lokiAdapterClient.getAllRecords)($$.SYSTEM_IDENTIFIER, TABLE);
                    assert.equal(allRecords.length, 2, "Not all inserted records have been retrieved")
                    // test removeCollection function
                    await $$.promisify(lokiAdapterClient.removeCollection)($$.SYSTEM_IDENTIFIER, TABLE);
                    let tables;
                    let error;
                    try {
                        tables = await $$.promisify(lokiAdapterClient.getCollections)($$.SYSTEM_IDENTIFIER);
                    } catch (e) {
                        error = e;
                    }
                    assert.true(typeof error === "undefined", "Error occurred when getting tables");
                    assert.true(tables.length === 0, "Table was not removed");
                    testFinished();
                } catch (e) {
                    return console.log(e);
                }
            } catch (e) {
                return console.log(e);
            }
        }
        const sc = scAPI.getSecurityContext();
        if (sc.isInitialised()) {
            return runAssertions();
        }
        sc.on("initialised", runAssertions);
    });
}, 20000);
