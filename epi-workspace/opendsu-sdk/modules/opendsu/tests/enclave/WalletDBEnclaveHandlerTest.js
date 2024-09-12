require("../../../../builds/output/testsRuntime");
const tir = require("../../../../psknode/tests/util/tir");

const dc = require("double-check");
const assert = dc.assert;
const openDSU = require('../../index');
$$.__registerModule("opendsu", openDSU);
const enclaveAPI = openDSU.loadAPI("enclave");
const keySSISpace = openDSU.loadAPI("keyssi");
const scAPI = openDSU.loadAPI("sc");
const crypto = openDSU.loadAPI("crypto");
const EnclaveHandler = require("../../enclave/KeySSIMappings/PathKeySSIMapping/WalletDBEnclaveHandler");
assert.callback('WalletDBEnclaveHandler test', (testFinished) => {
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

        const mainEnclave = enclaveAPI.initialiseWalletDBEnclave();
        mainEnclave.on("initialised", async () => {
            await $$.promisify(scAPI.setMainEnclave)(mainEnclave);
            const NO_PATH_KEY_SSIS = 30;
            const mainEnclaveDSU = await $$.promisify(mainEnclave.getDSU)();
            const enclaveHandler = new EnclaveHandler(mainEnclaveDSU, {maxNoScatteredKeys: 10});
            let expectedResult = {};
            for (let i = 0; i < NO_PATH_KEY_SSIS; i++) {
                const path = crypto.generateRandom(16).toString("hex")
                const pathKeySSI = keySSISpace.createPathKeySSI("vault", `0/${path}`);
                await $$.promisify(enclaveHandler.storePathKeySSI)(pathKeySSI);
                expectedResult[pathKeySSI.getSpecificString()] = pathKeySSI.getIdentifier();
            }

            const loadedPaths = await $$.promisify(enclaveHandler.loadPaths)();
            assert.objectsAreEqual(expectedResult, loadedPaths);

            testFinished();
        });
    });
}, 10000);