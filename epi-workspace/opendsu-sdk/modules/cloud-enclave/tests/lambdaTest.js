require("../../../builds/output/testsRuntime");
const tir = require("../../../psknode/tests/util/tir");

const dc = require("double-check");
const assert = dc.assert;
const openDSU = require("opendsu");

const scAPI = openDSU.loadApi("sc");
const w3cDID = openDSU.loadAPI("w3cdid");
const enclaveAPI = openDSU.loadApi("enclave");


const {CloudEnclaveServer} = require("..");
process.env.CLOUD_ENCLAVE_SECRET = "something";

// 3 zones: read, write, admin
// each did is part of one or multiple zones
// a lambda name is a resource in acl-magic
// a lambda can be called by a did if the did is part of the zone that has access to the resource
// a lambda has a forDID as first argument

assert.callback('Lambda test', (testFinished) => {
    dc.createTestFolder('createDSU', async (err, folder) => {
        const testDomainConfig = {
            "anchoring": {
                "type": "FS",
                "option": {}
            },
            "enable": ["enclave", "mq"]
        }

        const fs = require("fs");
        const path = require("path");
        const lambdaDefinition = "const fn = (...args) => {\n" +
            "    const callback = args.pop();\n" +
            "    callback(undefined, args);\n" +
            "}\n" +
            "\n" +
            "module.exports = {\n" +
            "    registerLambdas: function (cloudEnclaveServer) {\n" +
            "        cloudEnclaveServer.addEnclaveMethod(\"testLambda\", fn, \"read\");\n" +
            "    }\n" +
            "}"

        fs.mkdirSync(path.join(folder, "main"), {recursive: true});
        fs.writeFileSync(path.join(folder, "main", "lambda.js"), lambdaDefinition);
        const domain = "vault";
        const apiHub = await tir.launchConfigurableApiHubTestNodeAsync({
            domains: [{
                name: domain,
                config: testDomainConfig
            }],
            rootFolder: folder
        });
        const serverDID = await tir.launchConfigurableCloudEnclaveTestNodeAsync({
            domain,
            apihubPort: apiHub.port,
            rootFolder: folder,
            secret: "testSecret",
            lambdas: path.join(folder, "main"),
            name: "lambdasEnclave"
        });

        try {
            const keySSISpace = openDSU.loadAPI("keyssi");
            const scAPI = openDSU.loadApi("sc");
            const createCloudEnclaveClient = async () => {
                const clientSeedSSI = keySSISpace.createSeedSSI("vault", "some secret");
                const clientDIDDocument = await $$.promisify(w3cDID.createIdentity)("ssi:key", clientSeedSSI);

                const cloudEnclaveClient = enclaveAPI.initialiseCloudEnclaveClient(clientDIDDocument.getIdentifier(), serverDID);
                cloudEnclaveClient.on("initialised", async () => {
                    cloudEnclaveClient.grantExecutionAccess(clientDIDDocument.getIdentifier(), (err) => {
                        assert.true(err === undefined, "Grant execution access failed")
                        cloudEnclaveClient.callLambda("testLambda", "param1", "param2", (err, result) => {
                            assert.true(err === undefined, "Lambda call failed");
                            assert.true(result !== undefined, "Lambda result is undefined");
                            assert.true(result instanceof Array, "Lambda result is not an array");
                            assert.true(result.length === 2, "Lambda result is not an array with 2 elements");
                            assert.true(result[0] === "param1", "Lambda result is not as expected");
                            assert.true(result[1] === "param2", "Lambda result is not as expected");
                            testFinished();
                        })
                    })
                });
            }

            const sc = scAPI.getSecurityContext();
            if (sc.isInitialised()) {
                return await createCloudEnclaveClient();
            }
            sc.on("initialised", async () => {
                await createCloudEnclaveClient();
            });

        } catch (e) {
            return console.log(e);
        }
    });
}, 500000);