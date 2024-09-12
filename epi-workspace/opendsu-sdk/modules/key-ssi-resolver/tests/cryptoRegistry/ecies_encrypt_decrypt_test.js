require("../../../../builds/output/testsRuntime");
const assert = require("double-check").assert;

const SSITypes = require("../../lib/KeySSIs/SSITypes.js");
const KeySSIFactory = require("../../lib/KeySSIs/KeySSIFactory.js");

assert.callback("Get anchor alias from SeedSSI test", (callback) => {
    const seedSSI = KeySSIFactory.createType(SSITypes.SEED_SSI);
    seedSSI.initialize('domain', undefined, undefined, undefined, (err, seedSSI) => {
        if (err) {
            throw err;
        }

        assert.true(seedSSI.getAnchorId() === seedSSI.derive().derive().getIdentifier());
        callback();
    });
});
