require("../../../../builds/output/testsRuntime");
const dc = require("double-check");
const {assert} = dc;
const utils = require('./utils');

assert.callback("Should create new anchor of type CZA", async (callback) => {
    const constSSI = utils.generateConstSSI("justarandomstring");
    const anchorId = await utils.getAnchorId(constSSI);
    const hashlink = await utils.getHashLink(constSSI);

    const AnchoringAbstractBehaviour = require('../../anchoring/anchoringAbstractBehaviour').AnchoringAbstractBehaviour;
    const MemoryPersistence = utils.MemoryPersistenceStrategy
    const ps = new MemoryPersistence();
    const ab = new AnchoringAbstractBehaviour(ps);
    ab.createAnchor(anchorId, hashlink, (err) => {
        assert.true(typeof err === 'undefined');
        callback();
    });
}, 2000);
