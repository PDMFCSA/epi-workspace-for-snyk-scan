require("../../../../builds/output/testsRuntime");
const tir = require("../../../../psknode/tests/util/tir");

const dc = require("double-check");
const assert = dc.assert;
const openDSU = require('../../index');
$$.__registerModule("opendsu", openDSU);
const resolver = openDSU.loadAPI("resolver");

assert.callback('Anchoring the same ConstSSI multiple times', (testFinished) => {
    const domain = 'default';

    dc.createTestFolder('createConstDSU', (err, folder) => {
        tir.launchApiHubTestNode(10, folder, async (err) => {
            if (err) {
                throw err;
            }
            let error;
            try {
                const constDSU = await $$.promisify(resolver.createConstDSU)(domain, "someString");
                await $$.promisify(constDSU.writeFile)("/file1", "someData");
                await $$.promisify(constDSU.writeFile)("/file2", "someData");
            } catch (e) {
                error = e;
            }

            console.log(error)
            assert.true(typeof error !== "undefined");
            testFinished();
        });
    });
}, 5000);

