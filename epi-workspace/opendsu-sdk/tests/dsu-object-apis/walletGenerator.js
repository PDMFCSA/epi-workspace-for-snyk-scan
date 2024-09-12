require("../../builds/output/testsRuntime");

const tir = require("../../psknode/tests/util/tir");
const dc = require("double-check");
const assert = dc.assert;
const fs = require("fs");

assert.callback("Wallet generator", (testFinishCallback) => {
    dc.createTestFolder("wallet", function (err, folder) {
        const no_retries = 10;
        tir.launchVirtualMQNode(no_retries, folder, function (err) {
            if (err) {
                throw err;
            }

            const webAppFolder = folder + "\\web";
            fs.mkdirSync(webAppFolder, {recursive: true});
            fs.writeFileSync(webAppFolder + "/index.html", "Hello World!");
            generateWallet(webAppFolder, testFinishCallback);
        });
    });
}, 5000);

function generateWallet(webappFolder, callback) {
    const openDSU = require("opendsu");
    const resolver = openDSU.loadApi("resolver");
    const keySSISpace = openDSU.loadApi("keyssi");

    resolver.createDSU(keySSISpace.createTemplateSeedSSI("default"), async (err, walletTemplate) => {
        if (err) {
            throw err;
        }

        await walletTemplate.safeBeginBatchAsync();
        walletTemplate.addFolder("../../builds/output", "/", async (err) => {
            if (err) {
                throw err;
            }

            await walletTemplate.commitBatchAsync();
            resolver.createDSU(keySSISpace.createTemplateSeedSSI("default"), (err, wallet) => {
                if (err) {
                    throw err;
                }
                walletTemplate.getKeySSIAsString(async (err, walletTemplateKeySSI) => {
                    if (err) {
                        throw err;
                    }

                    await wallet.safeBeginBatchAsync();
                    wallet.mount("/constitution", walletTemplateKeySSI, function (err) {
                        if (err) {
                            throw err;
                        }

                        wallet.addFolder(webappFolder, "app", async function (err) {
                            if (err) {
                                throw err;
                            }

                            await wallet.commitBatchAsync();
                            wallet.readFile("/app/index.html", function (err) {
                                if (err) {
                                    throw err;
                                }

                                callback();
                            })
                        });
                    });
                });
            })
        });
    })

}
