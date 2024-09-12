require("../../../../../builds/output/testsRuntime");

const dc = require("double-check");
const assert = dc.assert;

const resolver = require("../../../resolver");
const {createTestFolderWithDSU, isHashLinkSSI} = require("./utils");
$$.LEGACY_BEHAVIOUR_ENABLED = true;
assert.callback(
    "getHandler appendToFile",
    (testFinished) => {
        createTestFolderWithDSU("dsu-appendToFile", (keySSI) => {
            resolver.getDSUHandler(keySSI).writeFile("dummy", "dummy-content", (error) => {
                if (error) {
                    throw error;
                }

                resolver.getDSUHandler(keySSI).readFile("/dummy", (error, initialResult) => {
                    if (error) {
                        throw error;
                    }

                    resolver.getDSUHandler(keySSI).appendToFile("/dummy", ":new-content", (error, result) => {
                        if (error) {
                            throw error;
                        }

                        assert.true(isHashLinkSSI(result), "expected result to be a HashLinkSSI");

                        resolver.getDSUHandler(keySSI).readFile("/dummy", (error, finalResult) => {
                            if (error) {
                                throw error;
                            }

                            assert.true(initialResult.toString() === "dummy-content");
                            assert.true(finalResult.toString() === "dummy-content:new-content");

                            testFinished();
                        });
                    });
                });
            });
        });
    },
    10000
);
