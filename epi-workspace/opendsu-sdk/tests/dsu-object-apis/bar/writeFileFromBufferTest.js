require('../../../builds/output/testsRuntime');

const double_check = require("double-check");
const assert = double_check.assert;
const crc32 = require('buffer-crc32');

let expectedCrc;
const barPath = '/big-file.big';

const tir = require("../../../psknode/tests/util/tir.js");

let writeFileFromBufferTest = {
    start: function (callback) {
        this.callback = callback;
        double_check.createTestFolder('AddFilesBatch', async (err, folder) => {
            tir.launchApiHubTestNode(100, folder, async err => {
                assert.true(err === null || typeof err === "undefined", "Failed to create server.");

                this.createBAR();
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

            const buf = Buffer.alloc(1024 * 1024);
            expectedCrc = crc32.unsigned(buf);
            await bar.safeBeginBatchAsync();
            bar.writeFile(barPath, buf, async (err) => {
                assert.true(err === null || typeof err === "undefined", "Failed to write file.");
                await bar.commitBatchAsync();
                bar.getKeySSIAsString((err, keySSI) => {
                    if (err) {
                        throw err;
                    }
                    this.readFile(keySSI);
                });
            })
        });
    },

    readFile: function (keySSI) {
        const openDSU = require("opendsu");
        const resolver = openDSU.loadApi("resolver");

        resolver.loadDSU(keySSI, (err, newBar) => {
            if (err) {
                throw err;
            }
            newBar.readFile(barPath, (err, data) => {
                const dataCrc = crc32.unsigned(data);
                assert.true(err === null || typeof err === "undefined", "Failed read file from BAR.");
                assert.equal(1024 * 1024, data.length, "Failed asserting data length.");
                assert.equal(expectedCrc, dataCrc, "Failed asserting data integrity.");
                this.callback();
            });
        });
    }
};

double_check.createTestFolder("bar_test_folder", () => {
    assert.callback("Write file from buffer test", (callback) => {
        writeFileFromBufferTest.start(callback);
    }, 3000);
});
