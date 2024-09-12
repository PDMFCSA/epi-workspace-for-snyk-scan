const assert = require('../../../../../../double-check').assert;

const func = function () {
    console.log("This is a message from a level 2 test!");
}
assert.pass("level2Sample1", func);