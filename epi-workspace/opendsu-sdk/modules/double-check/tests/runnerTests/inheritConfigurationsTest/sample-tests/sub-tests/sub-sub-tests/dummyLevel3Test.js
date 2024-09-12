const assert = require('../../../../../../../double-check').assert;

const func = function () {
    throw "Unexpected error from sub/sub-tests!";
}
assert.pass("UnexpectedErrorFail", func);