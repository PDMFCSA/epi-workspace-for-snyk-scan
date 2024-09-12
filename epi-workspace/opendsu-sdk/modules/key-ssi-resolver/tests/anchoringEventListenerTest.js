'use strict';
const testUtils = require('./utils');
const dc = require("double-check");
const assert = dc.assert;

let resolver;
let keySSISpace;

testUtils.resolverFactory({
    testFolder: 'anchoring_ev_listener_test',
    testName: 'Anchoring Event Listener Test'
}, (err, result) => {
    assert.true(err === null || typeof err === 'undefined', 'Failed to initialize test');

    resolver = result.resolver;
    keySSISpace = result.keySSISpace;

    runTest(result.doneCallback);
});

function runTest(callback) {
    let writesCounter = 0;
    let anchoringCounter = 0;
    let keySSI;

    function anchoringEventListener(err) {
        assert.true(typeof err === 'undefined', 'No error while anchoring changes');
        assertFirst4FilesWereAnchored(keySSI, () => {
            if (++anchoringCounter !== 2) {
                return;
            }

            resolver.loadDSU(keySSI, (err, dsu) => {
                assert.true(typeof err === 'undefined', "DSU has been anchored");
                assertFileWasAnchored(dsu, '/file5.txt', 'Lorem 5', () => {
                    callback();
                })
            });
        });
    }

    /**
     *
     * Anchor changes after 3 writes
     * @param {BrickMap} sessionBrickMap
     * @param {callback} callback
     */
    function decisionFunction(sessionBrickMap, callback) {
        if (writesCounter++ < 3) {
            return callback(undefined, false);
        }

        return callback(undefined, true);
    }

    resolver.createDSU(keySSISpace.buildTemplateSeedSSI("default"), {
        anchoringOptions: {
            decisionFn: decisionFunction,
            anchoringEventListener: anchoringEventListener
        }
    }, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while creating the DSU');
        dsu.getKeySSIAsString((err, _keySSI) => {
            keySSI = _keySSI;

            assertFileWasWritten(dsu, '/file1.txt', 'Lorem 1', () => {
                assertFileWasWritten(dsu, '/file2.txt', 'Lorem 2', () => {
                    assertFileWasWritten(dsu, '/file3.txt', 'Lorem 3', () => {
                        assertChangesWereNotAnchored(keySSI, () => {
                            assertFileWasWritten(dsu, '/file4.txt', 'Lorem 4', () => {
                                assertFileWasWritten(dsu, '/file5.txt', 'Lorem 5', () => {
                                    console.log('File was written to a new session');
                                })
                            })
                        })
                    })
                })
            });
        })

    });
}

function assertFileWasWritten(dsu, filename, data, callback) {
    dsu.writeFile(filename, data, (err) => {
        assert.true(typeof err === 'undefined', 'DSU is writable');

        dsu.readFile(filename, (err, dt) => {
            assert.true(typeof err === 'undefined', 'DSU is readable');
            assert.true(dt.toString() === data, 'File was read correctly');

            callback();
        })
    })
}

function assertChangesWereNotAnchored(keySSI, callback) {
    resolver.loadDSU(keySSI, (err, dsu) => {
        dsu.readFile('/file3.txt', (err) => {
            assert.true(typeof err !== 'undefined', "File wasn't written yet");
            callback();
        })
    });
}

function assertFirst4FilesWereAnchored(keySSI, callback) {
    resolver.loadDSU(keySSI, (err, dsu) => {
        assert.true(typeof err === 'undefined', "DSU has been anchored");

        assertFileWasAnchored(dsu, '/file1.txt', 'Lorem 1', () => {
            assertFileWasAnchored(dsu, '/file2.txt', 'Lorem 2', () => {
                assertFileWasAnchored(dsu, '/file3.txt', 'Lorem 3', () => {
                    assertFileWasAnchored(dsu, '/file4.txt', 'Lorem 4', () => {
                        callback();
                    })
                })
            })
        })
    });
}

function assertFileWasAnchored(dsu, path, expectedData, callback) {
    dsu.readFile(path, (err, data) => {
        assert.true(typeof err === 'undefined', 'DSU is readable');
        assert.true(data.toString() === expectedData, 'File was read correctly');

        callback();
    })

}
