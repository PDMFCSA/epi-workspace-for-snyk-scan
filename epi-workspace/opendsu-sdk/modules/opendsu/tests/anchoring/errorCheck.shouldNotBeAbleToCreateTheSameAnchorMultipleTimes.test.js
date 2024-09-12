require("../../../../builds/output/testsRuntime");
const dc = require("double-check");
const {assert} = dc;
const utils = require('./utils');

assert.callback("Should not be able to create the same anchor multiple times", async (callback) => {
    const seedSSI = utils.generateSeedSSI();
    const anchorId = await utils.getAnchorId(seedSSI);
    const hashlink = await utils.getSignedHashLink(seedSSI, null);

    const AnchoringAbstractBehaviour = require('../../anchoring/anchoringAbstractBehaviour').AnchoringAbstractBehaviour;
    const MemoryPersistence = utils.MemoryPersistenceStrategy
    const ps = new MemoryPersistence();
    const ab = new AnchoringAbstractBehaviour(ps);
    ab.createAnchor(anchorId, hashlink, (err) => {
        assert.true(typeof err === 'undefined');
        ab.createAnchor(anchorId, hashlink, (err) => {
            assert.true(typeof err !== 'undefined');
            callback();
        });
    });
}, 2000);




