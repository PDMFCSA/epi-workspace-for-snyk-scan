require("../../../builds/output/testsRuntime");
const assert = require("double-check").assert;
const OwM = require("swarmutils").OwM;

assert.callback("Testul_lui_Om", function (callback) {
    let om = new OwM();
    assert.notNull(om.meta);

    om.setMeta("prop", 4);
    assert.true(om.getMeta("prop") === 4);

    om.setMeta(undefined, 5);
    assert.true(typeof om.getMeta(undefined) != "undefined", ": undefined is undefined");

    om.setMeta(function () {
    }, 2);
    assert.true(typeof om.getMeta(function () {
    }) != "undefined");

    om.setMeta(5, 5);
    assert.true(om.getMeta(5) === 5);

    console.log(om);

    let serializedOM = {
        "simpleProp": "cab",
        "meta": {
            "metaprop": "supervalue"
        },
        "relationship": {
            "meta": {}
        }
    };

    let newOm = OwM.prototype.convert(serializedOM);

    assert.true(newOm instanceof OwM);
    assert.true(typeof newOm.setMeta == "function");
    assert.true(newOm.relationship instanceof OwM);
    assert.true(typeof newOm.relationship.setMeta == "function");
    assert.true(typeof newOm.meta != "undefined");
    assert.true(typeof newOm.relationship.meta != "undefined");

    let OMClone = OwM.prototype.convert(newOm);

    console.log(OMClone);

    assert.true(newOm !== OMClone);
    assert.true(newOm.relationship === OMClone.relationship);

    let superOm = new OwM({
        "simpleProp": 1,
        "meta": {
            "metaprop": "2"
        }
    });
    console.log("superOm", superOm);

    callback();
});