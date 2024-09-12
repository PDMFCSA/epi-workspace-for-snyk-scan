require('../../../../builds/output/testsRuntime');

const assert = require('double-check').assert;
const errorSpace = require('../../error');

assert.callback('Verify error messages test', (callback) => {
    errorSpace.observeUserRelevantMessages('info', () => {
        callback();
    });

    errorSpace.reportUserRelevantInfo('reportUserRelevantInfo message');
});
