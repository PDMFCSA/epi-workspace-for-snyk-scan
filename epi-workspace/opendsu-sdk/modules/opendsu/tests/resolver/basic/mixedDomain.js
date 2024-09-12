require("../../../../../builds/output/testsRuntime");
const {BRICKS_DOMAIN_KEY} = require("../../../moduleConstants");
const dc = require("double-check");
const {assert} = dc;

const resolver = require("../../../resolver");
const keySSI = require("../../../keyssi");


const testIntegration = require("../../../../../psknode/tests/util/tir");

const DOMAIN_1 = 'test1'
const DOMAIN_2 = 'test2'

assert.callback("Resolver DSU Creation with different domains", (testFinishCallback) => {

    (function initializeEnv() {
        dc.createTestFolder("wallet", function (err, folder) {
            testIntegration.launchApiHubTestNode(10, folder, function (err) {
                if (err) {
                    throw err;
                }

                createDSUWithMultipleDomains()
            });
        })
    })()


    function createDSUWithMultipleDomains() {
        const hintJSON = {}
        hintJSON[`${BRICKS_DOMAIN_KEY}`] = DOMAIN_2;
        const defaultTemplate = keySSI.createTemplateSeedSSI(DOMAIN_1, undefined, undefined, 'v0', JSON.stringify(hintJSON));
        resolver.createDSU(defaultTemplate, (err, dsu) => {
            if (err) {
                return console.log(err);
            }

            test(dsu)
        })
    }

    function test(dsu) {
        dsu.getLastHashLinkSSI((err, hashLinkSSI) => {
            if (err) {
                throw err;
            }

            assert.equal(hashLinkSSI.getDLDomain(), DOMAIN_2)
            testFinishCallback()
        })
    }
}, 5000);
