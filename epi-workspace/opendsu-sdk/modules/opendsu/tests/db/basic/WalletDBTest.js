require("../../../../../builds/output/testsRuntime");
const assert = require("double-check").assert;
const dc = require("double-check");
const db = require("../../../db");
const tir = require("../../../../../psknode/tests/util/tir");

//ow.register("opendsu", "../index.js")
$$.LEGACY_BEHAVIOUR_ENABLED = true;
assert.callback("DB Indexing test", (testFinishCallback) => {
    dc.createTestFolder("wallet", function (err, folder) {
        const no_retries = 10;

        async function testPersistence(sreadSSI) {
            console.log("Persistence DSU is:", await $$.promisify(sreadSSI.getAnchorId)());
            let mydb = db.getSharedDB(sreadSSI, "testDb");
            mydb.getRecord("test", "key1", function (err, res) {
                console.log("Result is", res);
                assert.equal(res.__version, 2);
                assert.equal(res.value, "v2");
                testFinishCallback();
            })
        }

        tir.launchApiHubTestNode(no_retries, folder, function (err) {
            if (err) {
                throw err;
            }
            let keySSIApis = require("../../../keyssi");
            let storageSSI = keySSIApis.createSeedSSI("default");

            let mydb = db.getWalletDB(storageSSI, "testDb");
            mydb.insertRecord("test", "key1", {value: "v0"}, function () {
                mydb.updateRecord("test", "key1", {value: "v1"}, function () {
                    mydb.updateRecord("test", "key1", {value: "v2"}, async function () {
                        await testPersistence(mydb.getShareableSSI());
                    });
                });
            });
        });
    });
}, 5000000);

