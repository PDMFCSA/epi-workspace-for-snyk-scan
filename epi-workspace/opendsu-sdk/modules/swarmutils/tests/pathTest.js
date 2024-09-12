const path = require("../lib/path");
const dc = require("../../double-check");
const assert = dc.assert;

const pathArr = ["///dir1/\\dir2//", "//foo////bar/", "\\dir1///dir2//dir3////", ""];
const controlArr = ["/dir1/dir2/", "/foo/bar/", "/dir1/dir2/dir3/", ""];
const normalizedArr = [];

assert.begin("Path test suite", undefined, 2000);

pathArr.forEach(pth => normalizedArr.push(path.normalize(pth)));
assert.arraysMatch(controlArr, normalizedArr, "Normalization failed");
let err;
try {
    path.normalize();
} catch (e) {
    err = e;
} finally {
    assert.true(typeof err !== "undefined", "Expected error");
}

const controlJoin = "/dir1/dir2/foo/bar/dir1/dir2/dir3/";
assert.true(controlJoin === path.join(...pathArr), "Join failed");

const testArr = ["../dir", "/dir1/../dir2", "/dir1/../../dir2", "/dir1/dir2/.."];
const resolveCtrlArr = ["/dir", "/dir2", "/dir2", "/dir1"];
const resNormalize = [];
testArr.forEach(pth => resNormalize.push(path.normalize(pth)));
assert.arraysMatch(resolveCtrlArr, resNormalize, "Normalization failed");

const testPath = "dir/dir2/dir3";
assert.false(path.isAbsolute(testPath), `${testPath} is absolute`);
assert.true(path.ensureIsAbsolute(testPath) === "/" + testPath, "EnsureIsAbsolute failed");

const testPth = "//";
assert.true(path.isAbsolute(testPth), `${testPth} is not absolute`);
assert.true(path.isAbsolute(path.normalize("/../dir")), `Path is not absolute`);

assert.end();

