const assert = require("../../lib/checksCore").assert;
const f = $$.flow.describe("equalPrimitiveNegativeTest", {
    action: function (cb) {

        this.cb = cb;
        this.compareDataPrim = [true, false, null, NaN, undefined, 1, 1.3, 12, true, false, null, NaN, undefined, 1, 1.3, "12"];
        this.len = this.compareDataPrim.length - 1;
        const counter = this.len / 2 + 1;
        for (let i = 0; i < this.compareDataPrim.length / 2; i++) {
            assert.notEqual(this.compareDataPrim[i], this.compareDataPrim[this.len]);
            while (this.len > counter) {
                this.len--;
            }
        }
        this.cb();
    }
})();
assert.callback("equalPrimitiveNegativeTest", function (cb) {
    f.action(cb);
}, 1500);


const f1 = $$.flow.describe("equalNonPrimitiveNegativeTest", {
    action: function (cb) {
        this.cb = cb;
        this.compareDataPrim = [[1, 2, 3], {1: 3}, String('foo'), String('foo')];
        this.data = [[1, 2, 3], {1: 3}, String('foo'), String('foo')];
        for (let i = 0; i < this.compareDataPrim.length; i++) {
            assert.notEqual(this.compareDataPrim[i], this.data[i]);
        }
        this.cb();
    }
})();
assert.callback("equalNonPrimitiveNegativeTest", function (cb) {
    f1.action(cb);
}, 1500);

