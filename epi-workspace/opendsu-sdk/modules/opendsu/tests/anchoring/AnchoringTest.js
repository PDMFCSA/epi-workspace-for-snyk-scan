require("../../../../builds/output/testsRuntime");
const testIntegration = require("../../../../psknode/tests/util/tir");
const dc = require("double-check");
const {assert, createTestFolder} = dc;

const resolver = require("../../resolver");
const keySSISpace = require("../../keyssi");

assert.callback("Resolver DSU Creation with different domains", (callback) => {

    createTestFolder('createDSU', (err, folder) => {
        testIntegration.launchApiHubTestNode(10, folder, (err) => {
            if (err) {
                throw err;
            }
            resolver.createDSU(keySSISpace.buildTemplateSeedSSI("default"), {}, (err, dsu) => {
                assert.true(typeof err === 'undefined', 'No error while creating the DSU');
                dsu.getKeySSIAsString(() => {
                    dsu.getKeySSIAsObject(() => {
                        assertFileWasWritten(dsu, '/file1.txt', 'Lorem 1', () => {
                            assertFileWasWritten(dsu, '/file2.txt', 'Lorem 2', () => {
                                assertFileWasAnchored(dsu, '/file1.txt', 'Lorem 1', () => {
                                    assertFileWasAnchored(dsu, '/file2.txt', 'Lorem 2', () => {
                                        callback();
                                    })
                                })
                            })
                        });
                    })
                })
            });
        })
    })
}, 5000)

function assertFileWasWritten(dsu, filename, data, callback) {
    dsu.safeBeginBatch((err) => {
        if (err) {
            return callback(err);
        }
        dsu.writeFile(filename, data, async (err) => {
            assert.true(typeof err === 'undefined', 'DSU is writable');

            await dsu.commitBatchAsync();
            dsu.readFile(filename, (err, dt) => {
                assert.true(typeof err === 'undefined', 'DSU is readable');
                assert.true(dt.toString() === data, 'File was read correctly');

                callback();
            })
        })
    })
}

function assertFileWasAnchored(dsu, path, expectedData, callback) {
    dsu.readFile(path, (err, data) => {
        assert.true(typeof err === 'undefined', 'DSU is readable');
        assert.true(data.toString() === expectedData, 'File was read correctly');

        callback();
    })

}
