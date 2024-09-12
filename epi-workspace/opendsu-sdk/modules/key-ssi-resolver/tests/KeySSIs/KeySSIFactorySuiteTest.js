require("../../../../builds/output/testsRuntime");
const assert = require("double-check").assert;

const SSITypes = require("../../lib/KeySSIs/SSITypes.js");
const KeySSIFactory = require("../../lib/KeySSIs/KeySSIFactory.js");


const seedSSI = KeySSIFactory.createType(SSITypes.SEED_SSI);
seedSSI.load(SSITypes.SEED_SSI, 'domain', undefined, undefined, 'v0')
seedSSI.initialize();

assert.callback("getCommonRootKeySSIType sza: type string", (callback) => {
    const rootKeySSIType = KeySSIFactory.getRootKeySSITypeName(SSITypes.SZERO_ACCESS_SSI);
    assert.true(rootKeySSIType === SSITypes.SEED_SSI)
    callback()
});

assert.callback("getCommonRootKeySSIType sza: type object", (callback) => {
    const rootKeySSIType = KeySSIFactory.getRootKeySSITypeName(seedSSI.derive().derive());
    assert.true(rootKeySSIType === SSITypes.SEED_SSI)
    callback()
});

assert.callback("getCommonRootKeySSIType sread", (callback) => {
    const rootKeySSIType = KeySSIFactory.getRootKeySSITypeName(seedSSI.derive());
    assert.true(rootKeySSIType === SSITypes.SEED_SSI)
    callback()
});

assert.callback("getCommonRootKeySSIType za", (callback) => {
    const rootKeySSIType = KeySSIFactory.getRootKeySSITypeName(SSITypes.ZERO_ACCESS_SSI);
    assert.true(rootKeySSIType === SSITypes.SECRET_SSI)
    callback()
});

assert.callback("getCommonRootKeySSIType cza: multiple parents return last common type", (callback) => {
    const rootKeySSIType = KeySSIFactory.getRootKeySSITypeName(SSITypes.CONSTANT_ZERO_ACCESS_SSI);
    assert.true(rootKeySSIType === SSITypes.CONST_SSI)
    callback()
});

assert.callback("getCommonRootKeySSIType seed", (callback) => {
    const rootKeySSIType = KeySSIFactory.getRootKeySSITypeName(SSITypes.SEED_SSI);
    assert.true(rootKeySSIType === SSITypes.SEED_SSI)
    callback()
});

assert.callback("getCommonRootKeySSIType array", (callback) => {
    const rootKeySSIType = KeySSIFactory.getRootKeySSITypeName(SSITypes.ARRAY_SSI);
    assert.true(rootKeySSIType === SSITypes.ARRAY_SSI)
    callback()
});
