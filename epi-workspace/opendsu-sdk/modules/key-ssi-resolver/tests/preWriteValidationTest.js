'use strict';

const testUtils = require('./utils');
const dc = require("double-check");
const assert = dc.assert;

let resolver;
let keySSISpace;

testUtils.resolverFactory({
    testFolder: 'prewrite_validation_test',
    testName: 'PreWrite Validation Test'
}, (err, result) => {
    assert.true(err === null || typeof err === 'undefined', 'Failed to initialize test');

    resolver = result.resolver;
    keySSISpace = result.keySSISpace;

    runTest(result.doneCallback);
});

function runTest(callback) {
    resolver.createDSU(keySSISpace.buildTemplateSeedSSI('default'), (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while creating the DSU');

        const preWriteValidation = {
            validate: (brickMap, operation, path, options, callback) => {
                return callback(new Error('Validation error'));
            }
        }

        dsu.setValidationRules({
            preWrite: preWriteValidation
        });

        dsu.writeFile('/my-file.txt', 'Test', (err) => {
            assert.true(typeof err !== 'undefined', 'Write failed due to validation error');
            assert.true(err.message === 'Validation error');
            callback();
        });
    });
}


