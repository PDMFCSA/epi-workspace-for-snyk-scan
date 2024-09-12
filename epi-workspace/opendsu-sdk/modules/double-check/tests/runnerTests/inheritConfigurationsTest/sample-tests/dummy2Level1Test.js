const assert = require('../../../../../double-check').assert;

const func = function () {
    throw "Unexpected error!";
}

assert.pass("UnexpectedErrorFail", func);