'use strict';
const testUtils = require('./utils');
const dc = require("double-check");
const assert = dc.assert;

let resolver;
let keySSISpace;

const FILE_PATH = '/something/something/darkside/my-file.txt';
const FILE_CONTENT = 'Lorem Ipsum';

testUtils.resolverFactory({
    testFolder: 'diff_brickmap_strategy_test',
    testName: 'Diff BrickMapStrategy test'
}, (err, result) => {
    assert.true(err === null || typeof err === 'undefined', 'Failed to initialize test');
    resolver = result.resolver;
    keySSISpace = result.keySSISpace;

    runTest(result.doneCallback);
});

function runTest(callback) {
    resolver.createDSU(keySSISpace.buildTemplateSeedSSI("default"), (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while creating the DSU');

        writeAndReadTest(dsu, callback);
    });
}

function writeAndReadTest(dsu, callback) {
    dsu.writeFile(FILE_PATH, FILE_CONTENT, (err) => {
        assert.true(typeof err === 'undefined', 'DSU is writable');

        dsu.readFile(FILE_PATH, (err, data) => {
            assert.true(typeof err === 'undefined', 'DSU is readable');
            assert.true(data.toString() === FILE_CONTENT, 'File was read correctly');

            dsu.getKeySSIAsString((err, keySSI) => {
                loadTest(keySSI, callback);
            })
        })
    })
}

function loadTest(keySSI, callback) {
    resolver.loadDSU(keySSI, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while loading the DSU');

        dsu.readFile(FILE_PATH, (err, data) => {
            assert.true(typeof err === 'undefined', 'No error while reading file from DSU');

            assert.true(data.toString() === FILE_CONTENT, 'File has the correct content');
            deleteTest(dsu, callback);
        });
    });
}

function deleteTest(dsu, callback) {
    dsu.delete(FILE_PATH, (err) => {
        assert.true(typeof err === 'undefined', 'File was deleted without error');

        dsu.readFile(FILE_PATH, (err) => {
            assert.true(typeof err !== 'undefined', 'File still exists');

            dsu.getKeySSIAsString((err, keySSI) => {
                renameTest(keySSI, callback);
            })
        })
    })
}

function renameTest(keySSI, callback) {
    resolver.loadDSU(keySSI, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while loading the DSU');

        dsu.writeFile(FILE_PATH, FILE_CONTENT, (err) => {
            assert.true(typeof err === 'undefined', 'No error while write file in DSU');

            dsu.rename(FILE_PATH, '/my-file.txt', (err) => {
                assert.true(typeof err === 'undefined', 'No error while renaming file in DSU');

                dsu.getKeySSIAsString((err, keySSI) => {
                    renameTestAfterLoad(keySSI, callback);
                })
            })

        });
    });
}

function renameTestAfterLoad(keySSI, callback) {
    resolver.loadDSU(keySSI, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while loading the DSU');

        dsu.readFile(FILE_PATH, (err) => {
            assert.true(typeof err !== 'undefined', 'File still exists');

            dsu.readFile('/my-file.txt', (err, data) => {
                assert.true(typeof err === 'undefined', 'No error while reading file from DSU');
                assert.true(data.toString() === FILE_CONTENT, 'File has the correct content');
                callback();
            })
        })
    });
}
