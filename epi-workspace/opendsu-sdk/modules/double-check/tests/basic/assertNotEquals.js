const assert = require("../../lib/checksCore").assert;
const f = $$.flow.describe("assertNotEquals", {
    action: function (cb) {
        this.cb = cb;
        this.valueArray1 = [0, "", "", '0', '17', [1, 2], String('foo'), null, null, undefined, {foo: 'bar'}, String('foo'), 0, 0, 'foo', NaN];
        this.valueArray2 = [false, false, 0, 0, 17, '1,2', 'foo', undefined, false, false, {foo: 'bar'}, String('foo'), null, NaN, NaN, NaN];
        assert.true(this.valueArray1.length === this.valueArray2.length);
        for (let i = 0; i < this.valueArray1.length; i++) {
            assert.notEqual(this.valueArray1[i], this.valueArray2[i]);
        }
        this.cb();
    }
})();
assert.callback("assertNotEquals", function (cb) {
    f.action(cb);
}, 1500);