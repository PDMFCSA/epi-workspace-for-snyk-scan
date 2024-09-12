const assert = require("../../lib/checksCore").assert;

const f = $$.flow.describe("assertObjectHasFields", {
    action: function (cb) {
        this.testData = [{}, {}, {age: 23}, {age: 23}, {age: 24, name: "adrian"}, {age: 24}];
        this.cb = cb;
        for (let i = 0; i < this.testData.length; i++) {
            assert.objectHasFields(this.testData[i], this.testData[i + 1]);
            i++;
        }
        this.cb();
    }
})();
assert.callback("assertObjectHasFields", function (cb) {
    f.action(cb);
}, 1500);