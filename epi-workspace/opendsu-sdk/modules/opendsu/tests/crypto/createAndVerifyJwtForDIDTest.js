require("../../../../builds/output/testsRuntime");
const dc = require("double-check");
const assert = dc.assert;
const tir = require("../../../../psknode/tests/util/tir");
const openDSU = require("../../index");
$$.__registerModule("opendsu", openDSU);
const crypto = openDSU.loadApi("crypto");
const w3cDID = openDSU.loadAPI("w3cdid");
const scAPI = openDSU.loadAPI("sc");
const keySSISpace = openDSU.loadAPI("keyssi");
const {JWT_ERRORS} = crypto;

const domain = "default";
const DUMMY_IDENTIFIER = keySSISpace.createTemplateSeedSSI(domain).getIdentifier(true);

const credentials = [];
const options = {subject: DUMMY_IDENTIFIER};

let tests = [
    {
        name: "Create and verify valid JWT test",
        test: async (callback) => {
            try {
                const didDocument = await $$.promisify(w3cDID.createIdentity)("ssi:name", domain, crypto.generateRandom(10).toString("hex"));
                const jwt = await $$.promisify(crypto.createJWTForDID)(didDocument.getIdentifier(), "/", credentials, options);
                const verifyResult = await $$.promisify(crypto.verifyDID_JWT)(jwt, null);

                assert.true(verifyResult);
                callback();

            } catch (e) {
                console.log(e);
            }
        },
        timeout: 10000
    },
    {
        name: "Create and verify valid JWT and rootOfTrustVerificationStrategy success test",
        test: async (callback) => {
            try {
                const didDocument = await $$.promisify(w3cDID.createIdentity)("ssi:name", domain, crypto.generateRandom(10).toString("hex"));
                const jwt = await $$.promisify(crypto.createJWTForDID)(didDocument.getIdentifier(), "/", credentials, options);
                const verifyResult = await $$.promisify(crypto.verifyDID_JWT)(jwt,
                    (jwtContent, callback) => {
                        if (jwtContent.body.sub !== options.subject) {
                            return callback("invalid");
                        }
                        return callback(null, true);
                    });
                assert.true(verifyResult);
                callback();

            } catch (e) {
                console.log(e);

            }
        },
        timeout: 10000
    },
    {
        name: "Create and verify valid JWT and rootOfTrustVerificationStrategy failure test",
        test: async (callback) => {
            try {
                const didDocument = await $$.promisify(w3cDID.createIdentity)("ssi:name", domain, crypto.generateRandom(10).toString("hex"));
                const jwt = await $$.promisify(crypto.createJWTForDID)(didDocument.getIdentifier(), "/", credentials, options);
                await $$.promisify(crypto.verifyDID_JWT)(jwt,
                    (jwtContent, callback) => {
                        if (jwtContent.body.sub === options.subject) {
                            return callback("invalid");
                        }
                        return callback(null, true);
                    });
            } catch (e) {
                assert.notNull(e);
                assert.equal(e, JWT_ERRORS.ROOT_OF_TRUST_VERIFICATION_FAILED);
                callback();
            }
        },
        timeout: 10000
    },
    {
        name: "Create and verify invalid JWT test",
        test: async (callback) => {
            try {
                const didDocument = await $$.promisify(w3cDID.createIdentity)("ssi:name", domain, crypto.generateRandom(10).toString("hex"));
                const jwt = await $$.promisify(crypto.createJWTForDID)(didDocument.getIdentifier(), "/", credentials, options);
                const invalidJwt = jwt + "invalid";
                await $$.promisify(crypto.verifyJWT)(invalidJwt);
            } catch (e) {
                assert.notNull(e);
                callback();
            }
        },
        timeout: 10000
    },
    {
        name: "Create and verify invalid JWT (someone modifies the payload) test",
        test: async (callback) => {
            try {
                const didDocument1 = await $$.promisify(w3cDID.createIdentity)("ssi:name", domain, crypto.generateRandom(10).toString("hex"));
                const didDocument2 = await $$.promisify(w3cDID.createIdentity)("ssi:name", domain, crypto.generateRandom(10).toString("hex"));
                const jwt1 = await $$.promisify(crypto.createJWTForDID)(didDocument1.getIdentifier(), "/", credentials, options);
                const jwt2 = await $$.promisify(crypto.createJWTForDID)(didDocument2.getIdentifier(), "/", credentials, options);
                const firstJwtPayload = jwt1.substr(0, jwt1.lastIndexOf("."));
                const secondJwtSignature = jwt2.substr(jwt1.lastIndexOf(".") + 1);
                const invalidJwt = `${firstJwtPayload}${secondJwtSignature}`;
                await $$.promisify(crypto.verifyJWT)(invalidJwt);
            } catch (e) {
                assert.notNull(e);
                callback();
            }
        },
        timeout: 10000
    },
    {
        name: "createCredential test",
        test: async (callback) => {
            try {
                const didDocument = await $$.promisify(w3cDID.createIdentity)("ssi:name", domain, crypto.generateRandom(10).toString("hex"));
                const jwt = await $$.promisify(crypto.createJWTForDID)(didDocument.getIdentifier(), "/", credentials, options);
                const verifyResult = await $$.promisify(crypto.verifyDID_JWT)(jwt, (jwtContent, callback) => {
                    if (jwtContent.body.sub !== DUMMY_IDENTIFIER) {
                        return callback("invalid");
                    }
                    return callback(null, true);
                });
                assert.true(verifyResult);
                callback();
            } catch (e) {
                console.log(e);
            }
        },
        timeout: 10000
    },
    {
        name: "full manual verifyAuthToken test",
        test: async (callback) => {
            let didDocument1;
            let didDocument2;
            let credentialJWT;
            let authToken;
            try {
                didDocument1 = await $$.promisify(w3cDID.createIdentity)("ssi:name", domain, crypto.generateRandom(10).toString("hex"));
                didDocument2 = await $$.promisify(w3cDID.createIdentity)("ssi:name", domain, crypto.generateRandom(10).toString("hex"));
                credentialJWT = await $$.promisify(crypto.createCredentialForDID)(didDocument1.getIdentifier(), didDocument2.getIdentifier());
                authToken = await $$.promisify(crypto.createAuthTokenForDID)(didDocument2.getIdentifier(), "/", credentialJWT);
            } catch (e) {
                console.log(e);
            }
            crypto.verifyDID_JWT(authToken, (jwtContent, callback) => {
                    crypto.verifyDID_JWT(
                        jwtContent.body.credentials[0],
                        (jwtContent, callback) => {
                            if (didDocument2.getIdentifier() === jwtContent.body.sub) {
                                return callback(null, true);
                            }

                            return callback(null, false);
                        },
                        (verifyError, verifyResult) => {
                            if (verifyError) throw verifyError;
                            assert.true(verifyResult);
                            return callback(null, true);
                        }
                    );
                },
                (verifyError, verifyResult) => {
                    if (verifyError) throw verifyError;
                    assert.true(verifyResult);
                    callback();
                }
            );
        },
        timeout: 10000
    },
    {
        name: "verifyAuthToken test",
        test: async (callback) => {
            let didDocument1;
            let didDocument2;
            let credentialJWT;
            let authToken;
            let verifyResult;
            try {
                didDocument1 = await $$.promisify(w3cDID.createIdentity)("ssi:name", domain, crypto.generateRandom(10).toString("hex"));
                didDocument2 = await $$.promisify(w3cDID.createIdentity)("ssi:name", domain, crypto.generateRandom(10).toString("hex"));
                credentialJWT = await $$.promisify(crypto.createCredentialForDID)(didDocument1.getIdentifier(), didDocument2.getIdentifier());
                authToken = await $$.promisify(crypto.createAuthTokenForDID)(didDocument2.getIdentifier(), "/", credentialJWT);
                verifyResult = await $$.promisify(crypto.verifyDIDAuthToken)(authToken, [didDocument1.getIdentifier()])
                assert.true(verifyResult);
                return callback();
            } catch (e) {
                console.log(e);
            }
        },
        timeout: 10000
    },
    {
        name: "verifyAuthToken with invalid issuer test",
        test: async (callback) => {
            let didDocument1;
            let didDocument2;
            let credentialJWT;
            let authToken;
            try {
                didDocument1 = await $$.promisify(w3cDID.createIdentity)("ssi:name", domain, crypto.generateRandom(10).toString("hex"));
                didDocument2 = await $$.promisify(w3cDID.createIdentity)("ssi:name", domain, crypto.generateRandom(10).toString("hex"));
                credentialJWT = await $$.promisify(crypto.createCredentialForDID)(didDocument1.getIdentifier(), didDocument2.getIdentifier());
                authToken = await $$.promisify(crypto.createAuthTokenForDID)(didDocument2.getIdentifier(), "/", credentialJWT);
                await $$.promisify(crypto.verifyDIDAuthToken)(authToken, ["INEXISTING_VERIFIER"])
            } catch (e) {
                assert.notNull(e);
                callback();
            }
        },
        timeout: 10000
    }
];


assert.callback("JWTTests", (callback) => {
    let finalFinish;
    let prepareSetup = function (callback) {
        dc.createTestFolder('JWT', async (err, folder) => {
            if (err) {
                throw err;
            }
            tir.launchApiHubTestNode(100, folder, async err => {
                if (err) {
                    throw err;
                }
                scAPI.getSecurityContext().on("initialised", callback);
            });
        });
    }
    let executeTests = function () {
        if (tests.length) {
            let {name, test, timeout} = tests.pop();
            assert.callback(name, async (finish) => {

                test(() => {
                    finish();
                    executeTests();
                });

            }, timeout);
        } else {
            if (finalFinish) {
                finalFinish();
            }
        }
    }

    finalFinish = callback;
    prepareSetup(executeTests);
}, tests.length * 10000);

