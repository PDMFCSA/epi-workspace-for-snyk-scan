require('../../../builds/output/testsRuntime');

const double_check = require("double-check");
const assert = double_check.assert;

let folderPath;

let files;

const tir = require("../../../psknode/tests/util/tir.js");
const text = ["first", "second", "third"];

$$.LEGACY_BEHAVIOUR_ENABLED = true;

let addFilesBatchTest = {
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

        resolver.createDSU(keySSISpace.createTemplateSeedSSI("default"), async (err, bar) => {
            if (err) {
                throw err;
            }

            this.bar = bar;
            await this.bar.safeBeginBatchAsync();
            this.bar.addFiles(files, 'filesFolder', {embedded: true}, async (err) => {
                if (err) {
                    throw err;
                }
                await this.bar.commitBatchAsync();
                this.runAssertions();
            })
        })
    },
    runAssertions: function () {
        this.bar.listFiles('filesFolder', (err, files) => {
            if (err) {
                throw err;
            }

            assert.true(files.length === 3);
            assert.true(files.indexOf('a.txt') !== -1);
            assert.true(files.indexOf('b.txt') !== -1);
            assert.true(files.indexOf('c.txt') !== -1);

            this.bar.readFile('/filesFolder/a.txt', (err, data) => {
                assert.true(err === null || typeof err === "undefined", "Failed to read file");
                assert.true(text[0] === data.toString(), "Invalid read first file");

                this.bar.readFile('/filesFolder/b.txt', (err, data) => {
                    assert.true(err === null || typeof err === "undefined", "Failed to read file");
                    assert.true(text[1] === data.toString(), "Invalid read second file");

                    this.bar.readFile('/filesFolder/c.txt', (err, data) => {
                        assert.true(err === null || typeof err === "undefined", "Failed to read file");
                        assert.true(text[2] === data.toString(), "Invalid read third file");
                        this.callback();
                    })
                })
            })
        });
    }
};

double_check.createTestFolder("bar_test_folder", (err, testFolder) => {
    const path = require("path");
    folderPath = path.join(testFolder, "fld");
    files = ["fld/a.txt", "fld/b.txt", "fld/c.txt"].map(file => path.join(testFolder, file));
    assert.callback("Add files (embedded: true) to bar test", (callback) => {
        addFilesBatchTest.start(callback);
    }, 3000000);
});
