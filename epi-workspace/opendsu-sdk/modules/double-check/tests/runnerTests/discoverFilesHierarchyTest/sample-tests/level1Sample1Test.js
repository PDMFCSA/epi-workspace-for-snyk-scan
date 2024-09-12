const assert = require('../../../../../double-check').assert;

const func = function () {
    console.log("This is a message!");
}
assert.pass("dummy1Level1", func);