require("../../../../builds/output/testsRuntime");
const assert = require("double-check").assert;
const SeedSSI = require("../../lib/KeySSIs/SeedSSIs/SeedSSI");
const SignedHashLinkSSI = require("../../lib/KeySSIs/HashLinkSSIs/SignedHashLinkSSI");
assert.callback("SeedSSI and SReadSSI use the same encryption key test", (callback) => {
    const seedSSI = SeedSSI.createSeedSSI();
    seedSSI.initialize("domain", undefined, undefined, "v0", (err) => {
        if (err) {
            throw err;
        }

        const signedHashLinkSSI = SignedHashLinkSSI.createSignedHashLinkSSI();
        const currentTimestamp = Date.now();
        const timestamp = currentTimestamp + 5000;
        signedHashLinkSSI.initialize("domain", "hash1", timestamp, "signature1", "v0");
        seedSSI.createAnchorValue("hash2", signedHashLinkSSI, (err, anchorValue) => {
            assert.true(anchorValue.getTimestamp() > timestamp);
            callback();
        });
    });
});