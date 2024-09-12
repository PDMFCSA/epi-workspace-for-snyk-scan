require("../../../../builds/output/testsRuntime");
const assert = require("double-check").assert;
const KeySSIFactory = require("../../lib/KeySSIs/KeySSIFactory");
const CryptoAlgorithmsRegistry = require("../../lib/CryptoAlgorithms/CryptoAlgorithmsRegistry");

const SeedSSI = require("../../lib/KeySSIs/SeedSSIs/SeedSSI");

assert.callback("SeedSSI and SReadSSI use the same encryption key test", (callback) => {

    const seedSSI = SeedSSI.createSeedSSI();
    seedSSI.initialize("domain", undefined, undefined, "v0", (err) => {
        if (err) {
            throw err;
        }
        assert.true(seedSSI.getEncryptionKey().toString() === seedSSI.derive().getEncryptionKey().toString());
        callback();
    });
});
