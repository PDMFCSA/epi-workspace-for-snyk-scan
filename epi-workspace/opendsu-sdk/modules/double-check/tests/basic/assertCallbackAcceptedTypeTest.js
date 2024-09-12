const assert = require("../../lib/checksCore").assert;

const f = $$.flow.describe("acceptedCallbackType", {
    action: function (cb) {
        this.cb = cb;
        this.cb();
    }
})();

const wrongCalls = [null, undefined, {}, "string", true, 5, 0, function () {
}.toString(), false];
const goodCalls = [function (cb) {
    f.action(cb);
}, (function () {
    return function (cb) {
        f.action(cb);
    }
})()];

const callbackType = wrongCalls.concat(goodCalls);
let counter = 0;

for (let i = 0; i < callbackType.length; i++) {
    try {
        assert.callback("acceptedCallbackType", callbackType[i], 1500);
    } catch (error) {
        if (wrongCalls.indexOf(callbackType[i]) !== -1) {
            counter++;
        }
    }
}

assert.equal(counter, wrongCalls.length, "Counter should be equal to " + wrongCalls.length + " instead is " + counter);