require('../../../../builds/output/testsRuntime');
const assert = require('double-check').assert;
const dc = require("double-check");
const tir = require("../../../../psknode/tests/util/tir");
const openDSU = require("opendsu");
const http = openDSU.loadApi("http");
const doPut = $$.promisify(http.doPut);


const utils = require('./utils');

assert.callback('Should create new anchor of type CZA', async (callback) => {

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
        const constSSI = utils.generateConstSSI();
        const anchorId = await utils.getAnchorId(constSSI);
        const hashlink = await utils.getHashLink(constSSI);

        const mainNodeUrl = apiHub.url;

        await $$.promisify(doPut)(`${mainNodeUrl}/anchor/${domain}/create-anchor/${anchorId}`, {"hashLinkSSI": hashlink}, async (err) => {
            assert.true(typeof err === 'undefined');
            callback();

        });
    })
}, 5000)

