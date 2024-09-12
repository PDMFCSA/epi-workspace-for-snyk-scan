require("../../../../../../builds/output/testsRuntime");

const dc = require("double-check");
const assert = dc.assert;
const FSLock = require("../utils/FSLock");
const path = require("path");
assert.callback("Trying to acquire multiple locks", (callback) => {
    dc.createTestFolder("testFolder", (err, folder) => {
        if (err) {
            throw err;
        }

        const filePath = path.join(folder, "testFile");
        const fsLock = new FSLock(filePath, 1000, 1000);
        const newFsLock = new FSLock(filePath, 1000, 1000);

        fsLock.acquireLock((err) => {
            assert.true(typeof err === "undefined");
            newFsLock.acquireLock((err) => {
                assert.true(typeof err !== "undefined");
                callback();
            })
        })
    })
})