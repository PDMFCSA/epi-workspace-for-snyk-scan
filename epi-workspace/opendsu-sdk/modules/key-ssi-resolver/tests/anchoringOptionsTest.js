'use strict';
const testUtils = require('./utils');
const dc = require("double-check");
const assert = dc.assert;

let resolver;
let keySSISpace;

testUtils.resolverFactory({testFolder: 'anchoring_options_test', testName: 'Anchoring Options Test'}, (err, result) => {
    assert.true(err === null || typeof err === 'undefined', 'Failed to initialize test');
    resolver = result.resolver;
    keySSISpace = result.keySSISpace;

    runTest(result.doneCallback);
});

function runTest(callback) {

    resolver.createDSU(keySSISpace.buildTemplateSeedSSI("default"), {
        anchoringOptions: {
            /**
             * @param {BrickMap} sessionBrickMap A dirty copy of the current valid BrickMap containing all changes (valid & un-anchored)
             * @param {callback} callback Calling the callback with the second parameter true, tells the BrickMapController to anchor the changes
             */
            decisionFn: (sessionBrickMap, callback) => {
                const anchorChanges = true;
                callback(undefined, anchorChanges);
            },

            /**
             * @param {BrickMapController} brickMapController
             * @param {object} conflictInfo
             * @param {BrickMap} conflictInfo.validBrickMap A valid brickMap containing the latest changes
             * @param {Array<BrickMapDiff>} conflictInfo.pendingAnchoringDiffs A reference to the list of BrickMapDiff objects containing all the changes proposed for anchoring
             * @param {Arrat<BrickMapDiff>} conflictInfo.newDiffs A reference to the list of new BrickMapDiff objects which haven't been yet proposed for anchoring
             * @param {Error|*} conflictInfo.error The error which occurred while trying to merge the un-anchored changes into the latest valid brickmap
             * @param {callback} callback
             */
            conflictResolutionFn: () => {
                // This function must use the conflictInfo object to fix 
                // the merging conflicts, apply the new changes from the pendingAnchoringDiffs and newDiffs and update the valid bar map and the dirty bar map clone
                // using the brickMapController, then call the callback to resume the anchoring process

                // If fixing the conflict fails, the `callback` must be called with an error
                // to abort the anchoring process.
            },

            /**
             * @param {Error} err
             * @param {string|undefined} anchoredBrickMapLatestHash
             */
            anchoringEventListener: (err, anchoredBrickMapLatestHash) => {
                if (err) {
                    // See `bar.constants.anchoringStatus` for a list
                    // of anchoring error types
                    console.log(err.type);
                    return;
                }

                console.log(anchoredBrickMapLatestHash);
                callback();
            }
        }
    }, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while creating the DSU');

        dsu.writeFile('/test', 'file content', (err) => {
            assert.true(typeof err === 'undefined', 'DSU is writable');
        });
    });
}
