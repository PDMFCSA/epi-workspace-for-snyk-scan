require("../../../../builds/output/testsRuntime");
const assert = require("double-check").assert;

const SSITypes = require("../../lib/KeySSIs/SSITypes.js");
const KeySSIFactory = require("../../lib/KeySSIs/KeySSIFactory.js");
const seedSSI = KeySSIFactory.create(SSITypes.SEED_SSI);

assert.callback("SeedSSIs test", (callback) => {
    seedSSI.initialize("domain", undefined, undefined, "v0", '', (err) => {
        KeySSIFactory.getDerivedType(seedSSI, SSITypes.SZERO_ACCESS_SSI, (err, sZaSSI) => {
            if (err) {
                throw err;
            }
            assert.true(sZaSSI.getTypeName() === SSITypes.SZERO_ACCESS_SSI);
            callback();
        });
    });
}, 3000);