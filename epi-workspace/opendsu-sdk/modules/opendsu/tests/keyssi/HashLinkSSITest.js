require('../../../../builds/output/testsRuntime');

const assert = require('double-check').assert;
const keySSISpace = require('../../keyssi');

assert.callback('Create hash link with buildTemplate test', (callback) => {
    keySSISpace.createTemplateKeySSI('hl', 'default', undefined, undefined, 'vn0', (err, ssi) => {
        const vn = ssi.getVn();
        const type = ssi.getTypeName();
        const DLDomain = ssi.getDLDomain();

        assert.true(type === 'hl', 'Invalid seed property');
        assert.true(vn === 'vn0', 'Invalid vn0 property');
        assert.true(DLDomain === 'default', 'Invalid domain property');

        callback();
    });
});
