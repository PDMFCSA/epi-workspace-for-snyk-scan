require('../../../builds/output/testsRuntime');

const double_check = require("double-check");
const assert = double_check.assert;
const tir = require("../../../psknode/tests/util/tir");

let folderPath;

let files;

const text = ["first", "second", "third"];

$$.LEGACY_BEHAVIOUR_ENABLED = true;

let removeFilesFromBarTest = {
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

            this.archive = bar;
            this.addFolder();
        });
    },

    addFolder: function () {
        this.archive.safeBeginBatch(err => {
            if (err) {
                throw err;
            }
            this.archive.addFolder(folderPath, "/", (err) => {
                if (err) {
                    throw err;
                }
                assert.true(err === null || typeof err === "undefined", "Failed to add folder.");
                this.listFiles((err, initialFiles) => {
                    if (err) {
                        throw err;
                    }

                    this.removeFile(initialFiles[0], async (err) => {
                        if (err) {
                            throw err;
                        }

                        await this.archive.commitBatchAsync();
                        this.listFiles((err, filesAfterRemoval) => {
                            if (err) {
                                throw err;
                            }

                            assert.arraysMatch(initialFiles.slice(1), filesAfterRemoval);
                            this.callback();
                        });
                    });
                })
            });
        });
    },

    listFiles: function (callback) {
        this.archive.listFiles("/", callback);
    },

    removeFile: function (file, callback) {
        this.archive.delete(file, callback);
    }
};

double_check.createTestFolder("bar_test_folder", (err, testFolder) => {

    const path = require("path");
    folderPath = path.join(testFolder, "fld");
    files = ["fld/a.txt", "fld/b.txt", "fld/c.txt"].map(file => path.join(testFolder, file));

    assert.callback("Remove files from bar test", (callback) => {
            removeFilesFromBarTest.start(callback);
        }, 6000
    );
});
