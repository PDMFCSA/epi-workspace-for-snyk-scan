const assert = require('../../../../../double-check').assert;

const func = function () {
    console.log("This is a message 2!");
}
assert.pass("dummy2Level1", func);