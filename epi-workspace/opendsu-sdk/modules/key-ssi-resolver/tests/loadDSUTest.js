'use strict';

const testUtils = require('./utils');
const dc = require("double-check");
const assert = dc.assert;

let resolver;
let keySSISpace;

testUtils.resolverFactory({testFolder: 'load_dsu_test_folder', testName: 'Load DSU Test'}, (err, result) => {
    assert.true(err === null || typeof err === 'undefined', 'Failed to initialize test');
    resolver = result.resolver;
    keySSISpace = result.keySSISpace;

    createDSU((err, keySSI) => {
        assert.true(typeof err === 'undefined', 'DSU is writable');
        runTest(keySSI, result.doneCallback);
    });
});

function createDSU(callback) {
    resolver.createDSU(keySSISpace.buildTemplateSeedSSI("default"), (err, dsu) => {

        assert.true(typeof err === 'undefined', 'No error while creating the DSU');
        assert.true(dsu.constructor.name === 'Archive', 'DSU has the correct class');

        dsu.createFolder('/created-folder', () => {
            dsu.writeFile('my-file.txt', 'Lorem Ipsum', () => {
                dsu.writeFile('/created-folder/my-second-file.txt', 'Iorem Lpsum', () => {
                    dsu.getKeySSIAsString((err, keySSI) => {
                        callback(err, keySSI);
                    })
                })
            })
        })
    });
}

function runTest(keySSI, callback) {
    resolver.loadDSU(keySSI, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while loading the DSU');

        dsu.readFile('my-file.txt', (err, data) => {
            assert.true(typeof err === 'undefined', 'No error while reading file from DSU');

            assert.true(data.toString() === 'Lorem Ipsum', 'File has the correct content');

            dsu.readFile('/created-folder/my-second-file.txt', (err, data) => {
                assert.true(typeof err === 'undefined', 'No error while reading second file from DSU');
                assert.true(data.toString() === 'Iorem Lpsum', 'Second file has the correct content');
                callback();
            })
        });
    });
}
