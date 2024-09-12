'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');
require('../../../builds/output/testsRuntime');
const tir = require('../../../psknode/tests/util/tir.js');
const dc = require("double-check");
const assert = dc.assert;
const openDSU = require("../../opendsu");
const bdns = openDSU.loadApi("bdns");
const keySSISpace = openDSU.loadApi("keyssi");

function createTestFolder(prefix, callback) {
    const testFolderPath = path.join(os.tmpdir(), prefix);
    fs.mkdtemp(testFolderPath, (err, res) => {
        callback(err, res);
    });
}

function resolverFactory(options, callback) {
    createTestFolder(options.testFolder, (err, testFolder) => {
        if (err) {
            return callback(err);
        }

        assert.callback(options.testName, (done) => {
            tir.launchVirtualMQNode(10, testFolder, (err, serverPort) => {
                if (err) {
                    return callback(err);
                }

                bdns.addRawInfo("default", {
                    brickStorages: [`http://localhost:${serverPort}`],
                    anchoringServices: [`http://localhost:${serverPort}`]
                });
                const resolver = openDSU.loadApi('resolver')

                callback(undefined, {
                    resolver,
                    keySSISpace,
                    doneCallback: done,
                });
            })
        }, 2000);
    })
}


module.exports = {
    resolverFactory
}
