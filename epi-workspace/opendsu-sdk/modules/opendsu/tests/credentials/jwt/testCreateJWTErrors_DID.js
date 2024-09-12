require("../../../../../builds/output/testsRuntime");

const dc = require("double-check");
const assert = dc.assert;
const tir = require("../../../../../psknode/tests/util/tir");

const openDSU = require("../../../index");
$$.__registerModule("opendsu", openDSU);
const w3cDID = openDSU.loadAPI("w3cdid");
const scAPI = openDSU.loadAPI("sc");
const credentials = openDSU.loadApi("credentials");
const domain = "default";

function launchApiHubAndCreateDIDs(callback) {
    dc.createTestFolder("JWTTest", async (err, folder) => {
        if (err) {
            return callback(err);
        }

        tir.launchApiHubTestNode(100, folder, async (err) => {
            if (err) {
                return callback(err);
            }

            scAPI.getSecurityContext().on("initialised", async () => {
                try {
                    const issuerDidDocument = await $$.promisify(w3cDID.createIdentity)('ssi:name', domain, "issuerPublicName");
                    const subjectDidDocument = await $$.promisify(w3cDID.createIdentity)('ssi:name', domain, "subjectPublicName");
                    callback(undefined, {issuerDidDocument, subjectDidDocument});
                } catch (e) {
                    callback(e);
                }
            });
        });
    });
}

assert.callback("[DID] Test create JWT verifiable credential errors", (callback) => {
    launchApiHubAndCreateDIDs((err, result) => {
        if (err) {
            throw err;
        }

        const jwtOptions = {exp: 2531468420000};
        const {issuerDidDocument, subjectDidDocument} = result;
        const issuer = issuerDidDocument.getIdentifier();
        const subject = subjectDidDocument.getIdentifier();
        credentials.createJWTVerifiableCredential(null, subject, jwtOptions, (invalidIssuerFormatError) => {
            assert.notNull(invalidIssuerFormatError);
            assert.equal(invalidIssuerFormatError, credentials.JWT_ERRORS.INVALID_ISSUER_FORMAT);

            credentials.createJWTVerifiableCredential("invalidIssuer" + issuer, subject, jwtOptions, (invalidIssuerFormatError) => {
                assert.notNull(invalidIssuerFormatError);
                assert.equal(invalidIssuerFormatError, credentials.JWT_ERRORS.INVALID_ISSUER_FORMAT);

                credentials.createJWTVerifiableCredential(issuer, null, jwtOptions, (invalidSubjectFormatError) => {
                    assert.notNull(invalidSubjectFormatError);
                    assert.equal(invalidSubjectFormatError, credentials.JWT_ERRORS.INVALID_SUBJECT_FORMAT);

                    credentials.createJWTVerifiableCredential(issuer, "invalidSubject" + subject, jwtOptions, (invalidSubjectFormatError) => {
                        assert.notNull(invalidSubjectFormatError);
                        assert.equal(invalidSubjectFormatError, credentials.JWT_ERRORS.INVALID_SUBJECT_FORMAT);

                        callback();
                    });
                });
            });
        });
    });
}, 5000);