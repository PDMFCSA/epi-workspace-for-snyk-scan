require("../../../../builds/output/testsRuntime");
const tir = require("../../../../psknode/tests/util/tir");

const dc = require("double-check");
const assert = dc.assert;
const openDSU = require('../../index');
$$.__registerModule("opendsu", openDSU);
const scAPI = openDSU.loadAPI("sc");

assert.callback('Delete shared enclave test', (testFinished) => {
    dc.createTestFolder('createDSU', async (err, folder) => {
        const vaultDomainConfig = {
            "anchoring": {
                "type": "FS",
                "option": {}
            }
        }
        await tir.launchConfigurableApiHubTestNodeAsync({
            domains: [{name: "vault", config: vaultDomainConfig}],
            rootFolder: folder
        });
        const sc = scAPI.getSecurityContext();
        sc.on("initialised", async () => {
            const enclaveAPI = openDSU.loadAPI("enclave");
            const config = openDSU.loadAPI("config");
            const sharedEnclave = enclaveAPI.initialiseWalletDBEnclave();
            sharedEnclave.on("initialised", async () => {
                await $$.promisify(scAPI.setSharedEnclave)(sharedEnclave);
                let env = await $$.promisify(config.readEnvFile)();
                assert.true(typeof env["sharedEnclaveKeySSI"] !== "undefined");
                await $$.promisify(scAPI.deleteSharedEnclave)();
                env = await $$.promisify(config.readEnvFile)();
                assert.true(typeof env["sharedEnclaveKeySSI"] === "undefined");
                testFinished();
            })

            sharedEnclave.on("error", (err) => {
                console.log(err);
            })
        })
    });
}, 5000000);

