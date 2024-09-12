'use strict';
const testUtils = require('./utils');
const dc = require("double-check");
const assert = dc.assert;

let resolver;
let keySSISpace;

const FILE_PATH = '/something/something/darkside/my-file.txt';
const FILE_CONTENT = 'Lorem Ipsum';

const SECOND_FILE_PATH = '/my-second-file.txt';
const SECOND_FILE_CONTENT = 'Ipsum Lorem';

testUtils.resolverFactory({
    testFolder: 'anchoring_default_conflict_resolution_test',
    testName: 'Anchoring default conflict resolution test'
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
                loadSameDSU(keySSI, dsu, callback);
            })
        })
    })
}

function loadSameDSU(keySSI, oldDSU, callback) {
    resolver.loadDSU(keySSI, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while loading the DSU');

        dsu.writeFile(SECOND_FILE_PATH, SECOND_FILE_CONTENT, (err) => {
            assert.true(typeof err === 'undefined', 'No error while writing second file');

            writeFileInOldDSU(oldDSU, callback);
        });
    });
}

function writeFileInOldDSU(dsu, callback) {
    dsu.writeFile('/new-file.txt', 'Some data', (err) => {
        assert.true(typeof err === 'undefined', 'No error while writing file in the old DSU');

        dsu.getKeySSIAsString((err, keySSI) => {
            readFilesTest(keySSI, callback);
        })
    })
}

function readFilesTest(keySSI, callback) {
    resolver.loadDSU(keySSI, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while loading the DSU');

        dsu.readFile(FILE_PATH, (err, data) => {
            assert.true(typeof err === 'undefined', 'No error while reading first file in DSU');

            assert.true(FILE_CONTENT === data.toString(), 'First file has the correct content');

            dsu.readFile(SECOND_FILE_PATH, (err, data) => {
                assert.true(typeof err === 'undefined', 'No error while reading second file in DSU');

                assert.true(SECOND_FILE_CONTENT === data.toString(), 'Third file has the correct content');

                dsu.readFile('/new-file.txt', (err, data) => {
                    assert.true(typeof err === 'undefined', 'No error while reading third file in DSU');

                    assert.true('Some data' === data.toString(), 'Third file has the correct content');
                    callback();
                })
            })
        });
    });
}
