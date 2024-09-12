require("../../../../builds/output/testsRuntime");
const assert = require("double-check").assert;
const SSITypes = require("../../lib/KeySSIs/SSITypes");

const SignedHashLinkSSI = require("../../lib/KeySSIs/HashLinkSSIs/SignedHashLinkSSI");

assert.callback("get HashLinkSSI from SignedHashLinkSSI test", (callback) => {
    const signedHashLinkSSI = SignedHashLinkSSI.createSignedHashLinkSSI();

    const domain = "default";
    const hashLink = "HASH_LINK";
    const timestampAndSignature = "TIMESTAMP_AND_SIGNATURE";

    signedHashLinkSSI.initialize(domain, hashLink, timestampAndSignature, "v0");
    const hashLinkSSI = signedHashLinkSSI.derive();

    assert.equal(SSITypes.HASH_LINK_SSI, hashLinkSSI.getTypeName());
    assert.equal(domain, hashLinkSSI.getDLDomain());
    assert.equal(hashLink, hashLinkSSI.getSpecificString());
    assert.equal("", hashLinkSSI.getControlString());

    callback();
});
