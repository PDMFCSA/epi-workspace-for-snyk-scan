const assert = require("../../lib/checksCore").assert;

const arr = [function a(next) {
    next();
},
    function b(next) {
        next();
    }
];

assert.steps("Happy path test", arr);