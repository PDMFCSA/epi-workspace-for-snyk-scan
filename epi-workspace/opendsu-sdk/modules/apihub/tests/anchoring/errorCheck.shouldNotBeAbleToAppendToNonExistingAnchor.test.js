require('../../../../builds/output/testsRuntime');
const assert = require('double-check').assert;
const dc = require("double-check");
const tir = require("../../../../psknode/tests/util/tir");
const openDSU = require("opendsu");
const http = openDSU.loadApi("http");
const doPut = $$.promisify(http.doPut);


const utils = require('./utils');

assert.callback('Should not be able to append to non existing anchor', async (callback) => {

    dc.createTestFolder('createDSU', async () => {
        const vaultDomainConfig = {
            "anchoring": {
                "type": "FSX",
                "option": {}
            }
        }
        const domain = 'default';
        const apiHub = await tir.launchConfigurableApiHubTestNodeAsync({
            domains: [{
                name: "default",
                config: vaultDomainConfig
            }]
        });
        console.log(apiHub);
        const seedSSI = utils.generateSeedSSI();
        const anchorId = await utils.getAnchorId(seedSSI);
        const hashlink = await utils.getSignedHashLink(seedSSI, null);

        const mainNodeUrl = apiHub.url;

        await $$.promisify(doPut)(`${mainNodeUrl}/anchor/${domain}/append-to-anchor/${anchorId}`, {"hashLinkSSI": hashlink}, async (err) => {
            assert.true(typeof err !== 'undefined');

            callback();
        });

    })
}, 5000)

