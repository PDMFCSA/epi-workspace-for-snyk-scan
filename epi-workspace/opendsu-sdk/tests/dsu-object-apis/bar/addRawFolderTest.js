require('../../../builds/output/testsRuntime');

const double_check = require("double-check");
const assert = double_check.assert;

let folderPath;
let files;

const tir = require("../../../psknode/tests/util/tir.js");
const text = ["first", "second", "third"];
$$.LEGACY_BEHAVIOUR_ENABLED = true;

let addRawFolder = {
    start: function (callback) {
        this.callback = callback;

        double_check.ensureFilesExist([folderPath], files, text, (err) => {
            assert.true(err === null || typeof err === "undefined", "Failed to create folder hierarchy.");

            double_check.createTestFolder('AddFilesBatch', async (err, folder) => {
                tir.launchApiHubTestNode(100, folder, async err => {
                    assert.true(err === null || typeof err === "undefined", "Failed to create server.");

                    this.createBAR();
                });
            });
        });

    },

    createBAR: function () {
        const openDSU = require("opendsu");
        const resolver = openDSU.loadApi("resolver");
        const keySSISpace = openDSU.loadApi("keyssi");

        resolver.createDSU(keySSISpace.createTemplateSeedSSI("default"), (err, bar) => {
            if (err) {
                throw err;
            }

            this.bar = bar;
            this.bar.safeBeginBatch(err => {
                if (err) {
                    throw err;
                }
                this.addFolder(folderPath, "fld1", (err) => {
                    if (err) {
                        throw err;
                    }

                    this.bar.delete("/", (err) => {
                        if (err) {
                            throw err;
                        }
                        this.addFolder(folderPath, "fld2", async (err) => {
                            if (err) {
                                throw err;
                            }
                            await bar.commitBatchAsync();
                            this.bar.getKeySSIAsString((err, seedSSI) => {
                                if (err) {
                                    throw err;
                                }
                                resolver.loadDSU(seedSSI, (err, newBar) => {
                                    if (err) {
                                        throw err;
                                    }

                                    newBar.listFolders("/", (err, folders) => {
                                        if (err) {
                                            throw err;
                                        }
                                        assert.true(folders.length === 1);
                                        this.callback();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        })
    },

    addFolder: function (fsFolderPath, barPath, callback) {
        this.bar.addFolder(fsFolderPath, barPath, {encrypt: false}, callback);
    }
};

double_check.createTestFolder("bar_test_folder", (err, testFolder) => {
    const path = require("path");
    folderPath = path.join(testFolder, "fld");
    files = ["fld/a.txt", "fld/b.txt", "fld/c.txt"].map(file => path.join(testFolder, file));
    assert.callback("Add raw folder to bar test", (callback) => {
        addRawFolder.start(callback);
    }, 3000);
});
