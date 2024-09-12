require("../../../../builds/output/testsRuntime");
const tir = require("../../../../psknode/tests/util/tir");

const dc = require("double-check");
const assert = dc.assert;
const openDSU = require("../../index");
$$.__registerModule("opendsu", openDSU);
const scAPI = openDSU.loadAPI("sc");
const w3cDID = openDSU.loadAPI("w3cdid");

const DOMAIN_CONFIG = {
    anchoring: {
        type: "FS",
        option: {
            enableBricksLedger: false,
        },
        commands: {
            addAnchor: "anchor",
        },
    },
    enable: ["mq"],
};

assert.callback(
    "key DID SSI test",
    (testFinished) => {
        const domain = "default";
        let sc;

        dc.createTestFolder("createDSU", async (err, folder) => {
            const vaultDomainConfig = {
                "anchoring": {
                    "type": "FS",
                    "option": {}
                }
            }
            await tir.launchConfigurableApiHubTestNodeAsync({
                domains: [{
                    name: "vault",
                    config: vaultDomainConfig
                }, {name: domain, config: DOMAIN_CONFIG}], rootFolder: folder
            });

            const dataToSend = "someData";

            let receiverDIDDocument;
            let senderDIDDocument;
            sc = scAPI.getSecurityContext();
            sc.on("initialised", async () => {
                try {
                    senderDIDDocument = await $$.promisify(w3cDID.createIdentity)("ssi:name", domain, "sender");
                    receiverDIDDocument = await $$.promisify(w3cDID.createIdentity)("ssi:name", domain, "receiver");
                } catch (e) {
                    return console.log(e);
                }

                receiverDIDDocument.readMessage((err, decryptedMessage) => {
                    console.log("received message", decryptedMessage)
                    if (err) {
                        return console.log(err);
                    }

                    assert.equal(decryptedMessage, dataToSend, "The received message is not the same as the message sent");
                    testFinished();
                });

                senderDIDDocument.sendMessage(dataToSend, receiverDIDDocument, () => {
                    console.log("Sent message", dataToSend);
                });
            });
        });
    },
    10000000
);
