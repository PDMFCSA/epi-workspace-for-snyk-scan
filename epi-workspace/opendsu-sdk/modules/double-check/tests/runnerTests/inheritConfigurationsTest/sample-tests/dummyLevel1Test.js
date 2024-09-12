const assert = require('../../../../../double-check').assert;

const func = function () {
    console.log("OK");
}
assert.pass("OK", func);