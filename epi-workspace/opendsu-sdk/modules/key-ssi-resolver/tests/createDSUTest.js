'use strict';

const testUtils = require('./utils');
const dc = require("double-check");
const assert = dc.assert;

let resolver;
let keySSISpace;

testUtils.resolverFactory({testFolder: 'create_dsu_test_folder', testName: 'Create DSU test'}, (err, result) => {
    assert.true(err === null || typeof err === 'undefined', 'Failed to initialize test');
    resolver = result.resolver;
    keySSISpace = result.keySSISpace;
    runTest(result.doneCallback);
});

function runTest(callback) {
    resolver.createDSU(keySSISpace.buildTemplateSeedSSI("default"), (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while creating the DSU');
        assert.true(dsu.constructor.name === 'Archive', 'DSU has the correct class');

        dsu.createFolder('/something', (err) => {
            assert.true(typeof err === 'undefined', 'Directory was created');

            dsu.listFolders('/', (err, folders) => {
                assert.true(typeof err === 'undefined', 'No error while listing folders');
                assert.true(folders.indexOf('something') === 0, 'Created folder exists');

                dsu.listFiles('/something', (err, files) => {
                    assert.true(typeof err === 'undefined', 'No error while listing files');
                    assert.true(files.length === 0, 'Created folder is empty');

                    dsu.writeFile('/something/something/darkside/my-file.txt', 'Lorem Ipsum', (err) => {
                        assert.true(typeof err === 'undefined', 'DSU is writable');

                        dsu.readFile('/something/something/darkside/my-file.txt', (err, data) => {
                            assert.true(typeof err === 'undefined', 'DSU is readable');
                            assert.true(data.toString() === 'Lorem Ipsum', 'File was read correctly');

                            callback();
                        })
                    })
                })
            })
        });
    });
}
