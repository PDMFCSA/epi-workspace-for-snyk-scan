require("../../../../../builds/output/testsRuntime");
const tir = require("../../../../../psknode/tests/util/tir");

const dc = require("double-check");
const assert = dc.assert;
const openDSU = require('../../../index');
$$.__registerModule("opendsu", openDSU);
const resolver = openDSU.loadAPI("resolver");
$$.LEGACY_BEHAVIOUR_ENABLED = true;
assert.callback('Writing DSU with SReadSSI via SC', (testFinished) => {
    const domain = 'default';

    dc.createTestFolder('createDSU', (err, folder) => {
        tir.launchApiHubTestNode(10, folder, async (err) => {
            if (err) {
                throw err;
            }
            openDSU.loadAPI("sc").getSecurityContext();
            setTimeout(async () => {
                const seedDSU = await $$.promisify(resolver.createSeedDSU)(domain);
                await $$.promisify(seedDSU.getKeySSIAsString)();
                const mountedDSU = await $$.promisify(resolver.createSeedDSU)(domain);
                const mountedDSUSeedSSI = await $$.promisify(mountedDSU.getKeySSIAsObject)();
                const mountedDSUSreadSSI = await $$.promisify(mountedDSUSeedSSI.derive)();
                await $$.promisify(resolver.invalidateDSUCache)(mountedDSUSeedSSI);
                await $$.promisify(seedDSU.mount)("/mountedDSU", mountedDSUSreadSSI);
                let error;
                try {
                    await $$.promisify(seedDSU.writeFile)("/mountedDSU/file", "someData");
                } catch (e) {
                    error = e;
                }
                assert.true(error === undefined);
                testFinished();
            }, 2000);
        });
    });
}, 100000);

