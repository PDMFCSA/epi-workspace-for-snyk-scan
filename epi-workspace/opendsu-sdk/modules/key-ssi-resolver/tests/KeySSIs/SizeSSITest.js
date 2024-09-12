require("../../../../builds/output/testsRuntime");
const assert = require("double-check").assert;

const SSITypes = require("../../lib/KeySSIs/SSITypes.js");
const KeySSIFactory = require("../../lib/KeySSIs/KeySSIFactory.js");
const sizeSSI = KeySSIFactory.createType(SSITypes.SIZE_SSI);

assert.callback(
    "SizeSSITest test",
    (callback) => {
        const totalSize = 12345;
        const bufferSize = 123;
        sizeSSI.initialize("domain", totalSize, bufferSize, "v0", "");

        const identifier = sizeSSI.getIdentifier();

        const loadedSizeSSI = KeySSIFactory.create(identifier);

        assert.true(totalSize === loadedSizeSSI.getTotalSize());
        assert.true(bufferSize === loadedSizeSSI.getBufferSize());

        callback();
    },
    3000
);
