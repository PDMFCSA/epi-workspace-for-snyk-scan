require("../../builds/output/testsRuntime");

const tir = require("../../psknode/tests/util/tir");
const double_check = require("double-check");
const assert = double_check.assert;
assert.callback("rawDossier restore test", (testFinishCallback) => {
    double_check.createTestFolder('AddFilesBatch', async (err, folder) => {
        tir.launchApiHubTestNode(100, folder, async err => {
            if (err) {
                throw err;
            }
            const openDSU = require("opendsu");
            const resolver = openDSU.loadApi("resolver");
            const keySSISpace = openDSU.loadApi("keyssi");

            resolver.createDSU(keySSISpace.createTemplateSeedSSI("default"), async (err, ref) => {
                if (err) {
                    throw err;
                }

                await ref.safeBeginBatchAsync();
                ref.addFolder("../../builds/output", "/constitution", async (err) => {
                    if (err) {
                        throw err;
                    }

                    await ref.commitBatchAsync();
                    ref.getKeySSIAsString((err, refKeySSI) => {
                        if (err) {
                            throw err;
                        }
                        resolver.loadDSU(refKeySSI, (err, ref2) => {
                            if (err) {
                                throw err;
                            }
                            ref2.readFile("/constitution/testsRuntime.js", function (err, content) {
                                if (err) {
                                    throw err;
                                }
                                assert.true(content !== "");
                                testFinishCallback();
                            });
                        });
                    });
                });
            })
        })
    });
}, 5000);
