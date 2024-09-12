require("../../../../builds/output/testsRuntime");
const dc = require("double-check");
const {assert} = dc;
const utils = require('./utils');

assert.callback("Should append anchor multiple times", async (callback) => {
    const seedSSI = utils.generateSeedSSI();
    const anchorId = await utils.getAnchorId(seedSSI);
    const hashlink = await utils.getSignedHashLink(seedSSI, null);
    const hashlink2 = await utils.getSignedHashLink(seedSSI, hashlink);
    const hashlink3 = await utils.getSignedHashLink(seedSSI, hashlink2);
    const hashlink4 = await utils.getSignedHashLink(seedSSI, hashlink3);

    const AnchoringAbstractBehaviour = require('../../anchoring/anchoringAbstractBehaviour').AnchoringAbstractBehaviour;
    const MemoryPersistence = utils.MemoryPersistenceStrategy
    const ps = new MemoryPersistence();
    const ab = new AnchoringAbstractBehaviour(ps);
    ab.createAnchor(anchorId, hashlink, (err) => {
        assert.true(typeof err === 'undefined');
        ab.appendAnchor(anchorId, hashlink2, (err) => {
            assert.true(typeof err === 'undefined');
            ab.appendAnchor(anchorId, hashlink3, (err) => {
                assert.true(typeof err === 'undefined');
                ab.appendAnchor(anchorId, hashlink4, (err) => {
                    assert.true(typeof err === 'undefined');
                    callback();
                });
            });
        });
    });
}, 2000);




