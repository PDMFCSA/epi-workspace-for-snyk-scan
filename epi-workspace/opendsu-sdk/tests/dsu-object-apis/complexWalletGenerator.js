require("../../builds/output/testsRuntime");

const tir = require("../../psknode/tests/util/tir");
const dc = require("double-check");
const assert = dc.assert;

const assetsIndexData = "Hello World from JS!";
const indexData = "Hello World!";

assert.callback("Wallet generator", (testFinishCallback) => {
    dc.createTestFolder("wallet", function (err, folder) {
        const no_retries = 10;
        tir.launchVirtualMQNode(no_retries, folder, function (err) {
            if (err) {
                throw err;
            }
            const fs = require("fs");
            const webAppFolder = folder + "/web";
            fs.mkdirSync(webAppFolder, {recursive: true});
            fs.mkdirSync(webAppFolder + "/assets/js", {recursive: true});
            fs.writeFileSync(webAppFolder + "/index.html", indexData);
            fs.writeFileSync(webAppFolder + "/assets/js/index.js", assetsIndexData);
            generateWallet(webAppFolder, testFinishCallback);
        });
    });
}, 15000);

function generateWallet(webappFolder, callback) {
    const openDSU = require("opendsu");
    const resolver = openDSU.loadApi("resolver");
    const keySSISpace = openDSU.loadApi("keyssi");
    resolver.createDSU(keySSISpace.createTemplateSeedSSI("default"), async (err, walletTemplate) => {
        if (err) {
            throw err;
        }

        await walletTemplate.safeBeginBatchAsync();
        walletTemplate.addFolder("../../builds/output", "/", {encrypt: true, depth: 0}, async (err) => {
            if (err) {
                throw err;
            }

            await walletTemplate.commitBatchAsync();
            resolver.createDSU(keySSISpace.createTemplateSeedSSI("default"), (err, wallet) => {
                if (err) {
                    throw err;
                }

                walletTemplate.getKeySSIAsString(async (err, keySSI) => {
                    if (err) {
                        throw err;
                    }

                    await wallet.safeBeginBatchAsync();
                    wallet.mount("/constitution", keySSI, async function (err) {
                        if (err) {
                            throw err;
                        }

                        wallet.addFolder(webappFolder, "app", {encrypt: true, depth: 0}, async function (err) {
                            if (err) {
                                throw err;
                            }

                            await wallet.commitBatchAsync();

                            wallet.listFiles("/app/assets", function (err, files) {
                                if (err) {
                                    throw err;
                                }

                                assert.true(files.indexOf('js/index.js') !== -1);
                                assert.true(files.indexOf('constitution/testsRuntime.js') !== -1);

                                wallet.readFile("/app/assets/js/index.js", function (err, content) {
                                    if (err) {
                                        throw err;
                                    }

                                    assert.true(content.toString() === assetsIndexData);

                                    callback();
                                })
                            });
                        });
                    });
                });
            })
        });
    })
}
