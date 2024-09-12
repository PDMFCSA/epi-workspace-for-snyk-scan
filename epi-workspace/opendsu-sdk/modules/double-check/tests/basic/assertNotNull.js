const assert = require("../../lib/checksCore").assert;

const f = $$.flow.describe("assertNotNull", {
    action: function (cb) {
        this.cb = cb;
        this.dataArray = [{}, function () {
        }, true, false, "null"];
        this.dataArray.forEach(function (element) {
            assert.notNull(element)
        });
        this.cb();
    }
})();
assert.callback("assertNotNull", function (cb) {
    f.action(cb);
}, 1500);
