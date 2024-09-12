require("../../../../builds/output/testsRuntime");
const dc = require("double-check");
const {assert} = dc;
const utils = require('./utils');

assert.callback("Should not be able to append to non existing anchor", async (callback) => {
    const seedSSI = utils.generateSeedSSI();
    const anchorId = await utils.getAnchorId(seedSSI);
    const hashlink = await utils.getSignedHashLink(seedSSI, null);
    const hashlink2 = await utils.getSignedHashLink(seedSSI, hashlink);

    const AnchoringAbstractBehaviour = require('../../anchoring/anchoringAbstractBehaviour').AnchoringAbstractBehaviour;
    const MemoryPersistence = utils.MemoryPersistenceStrategy
    const ps = new MemoryPersistence();
    const ab = new AnchoringAbstractBehaviour(ps);
    ab.appendAnchor(anchorId, hashlink2, (err) => {
        assert.true(typeof err !== 'undefined');
        callback();
    });
}, 2000);




