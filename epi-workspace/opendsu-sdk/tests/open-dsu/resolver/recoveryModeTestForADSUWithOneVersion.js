process.env.OPENDSU_ENABLE_DEBUG = true;
process.env.DEV = true;
const path = require("path");
const fs = require("fs");

require("../../../builds/output/testsRuntime");

const tir = require("../../../psknode/tests/util/tir");
const double_check = require("double-check");
const assert = double_check.assert;
$$.LEGACY_BEHAVIOUR_ENABLED = true;

function getBrickStorageFolder(folder) {
    return path.join(folder, "external-volume/domains/default/brick-storage");
}

function getBrickFilePath(folder, hashLink) {
    let brickFolderName = hashLink.slice(0, 2);
    return path.join(getBrickStorageFolder(folder), brickFolderName, hashLink);
}

assert.callback("Create and load DSU test", (finishTest) => {
    double_check.createTestFolder('TEST', async (err, folder) => {
        tir.launchApiHubTestNode(100, folder, async err => {
            if (err) {
                throw err;
            }
            const openDSU = require("opendsu");
            const anchoring = openDSU.loadApi("anchoring");
            const sc = openDSU.loadApi("sc");
            const anchoringX = anchoring.getAnchoringX();

            sc.getMainEnclave((err, enclave) => {
                enclave.createTemplateSeedSSI("default", (err, templateSeed) => {
                    if (err) {
                        throw err;
                    }

                    enclave.createDSU(templateSeed, (err, dsu) => {
                        if (err) {
                            throw err;
                        }

                        dsu.getKeySSIAsObject(async (err, seed) => {
                            if (err) {
                                throw err;
                            }

                            await dsu.safeBeginBatchAsync()
                            dsu.writeFile("/test.txt", "just content", (err) => {
                                console.log("Frist write was called!!!", new Date().getTime());
                                if (err) {
                                    throw err;
                                }

                                dsu.writeFile("/secondfile.txt", "content that will be deleted from brick storage", async (err) => {
                                    if (err) {
                                        throw err;
                                    }

                                    await dsu.commitBatchAsync();
                                    seed.getAnchorId((err, anchorId) => {
                                        if (err) {
                                            throw err;
                                        }
                                        anchoringX.getAllVersions(anchorId, (err, allVersions) => {
                                            if (err) {
                                                throw err;
                                            }

                                            for (let i = 1; i < allVersions.length; i++) {
                                                let brickFilePath = getBrickFilePath(folder, allVersions[i].getHash());
                                                fs.unlinkSync(brickFilePath);
                                            }

                                            let recoveryContentFnc = (dsu, callback) => {
                                                console.log("Content recovery function was called!");
                                                if (dsu) {
                                                    dsu.restored = true;

                                                    dsu.safeBeginBatch((err) => {
                                                        if (err) {
                                                            return callback(err);
                                                        }
                                                        dsu.writeFile("/restoredFile.txt", "restored data", async (err) => {
                                                            if (err) {
                                                                throw err;
                                                            }

                                                            await dsu.commitBatchAsync();
                                                            return callback(undefined, dsu);
                                                        });
                                                    });
                                                }
                                            };

                                            enclave.loadDSURecoveryMode(seed, recoveryContentFnc, (err, recoveredDSU) => {
                                                if (err) {
                                                    throw err;
                                                }

                                                assert.equal(recoveredDSU.restored, true, "Content recovery function wasn't called");
                                                recoveredDSU.listFiles("/", (err, files) => {
                                                    if (err) {
                                                        throw err;
                                                    }
                                                    let expectedFiles = [
                                                        "dsu-metadata-log",
                                                        "restoredFile.txt"
                                                    ];

                                                    assert.equal(files.length, expectedFiles.length, "Recovery failed");
                                                    for (let i = 0; i < expectedFiles.length; i++) {
                                                        assert.true(files.indexOf(expectedFiles[i]) !== -1, "Recovery failed");
                                                    }

                                                    finishTest();
                                                });
                                            });

                                        });
                                    });
                                });
                            });

                        });
                    });

                });
            });
        });
    });

}, 100000);