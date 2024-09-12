require("../../../builds/output/testsRuntime");
require("../../../builds/output/bindableModel");

const assert = require("double-check").assert;
const data = require("./data.json");
const BindableModel = require("psk-bindable-model");


wprint = function (message) {
    console.log.apply("WPRINT:\n" + message)
};


function getCleanModel() {
    return JSON.parse(JSON.stringify(data));
}

assert.callback("Expression should be added", (done) => {
    let data = getCleanModel();
    let model = BindableModel.setModel(data);

    const expressionName = 'test';

    model.addExpression(expressionName, function () {
        return 2 * 2;
    })

    assert.equal(true, model.hasExpression(expressionName), "Expression is added");
    done();
});

assert.callback("Expression should be evaluated", (done) => {
    let data = getCleanModel();
    let model = BindableModel.setModel(data);

    const expressionName = 'test';
    const expressionExpectedResult = 4;

    model.addExpression(expressionName, function () {
        return 2 * 2;
    })

    assert.equal(expressionExpectedResult, model.evaluateExpression(expressionName), "Expression is evaluated");
    done();
});

assert.callback("Expression should be evaluated to a promise", (done) => {
    let data = getCleanModel();
    let model = BindableModel.setModel(data);

    const expressionName = 'test';

    model.addExpression(expressionName, function () {
        return new Promise(function (resolve) {
            resolve();
        });
    })

    const expressionResult = model.evaluateExpression(expressionName);
    assert.equal(true, expressionResult instanceof Promise, "Expression result is a Promise");
    done();
});

assert.callback("Expression promise should resolve to a known value", (done) => {
    let data = getCleanModel();
    let model = BindableModel.setModel(data);

    const expressionName = 'test';
    const expressionExpectedResult = 4;
    let expressionActualResult;

    model.addExpression(expressionName, function () {
        return new Promise(function (resolve) {
            resolve(2 + 2);
        });
    })

    const expressionResult = model.evaluateExpression(expressionName);
    assert.equal(true, expressionResult instanceof Promise, "Expression result is a Promise");

    expressionResult.then((result) => {
        expressionActualResult = result;
    }).finally(() => {
        assert.equal(true, expressionExpectedResult === expressionActualResult, "Expression promise resolved to expected value");
        done();
    })
});

assert.callback("Expression callback is binded to proxy", (done) => {
    let data = getCleanModel();
    let model = BindableModel.setModel(data);

    const expressionName = 'test';
    let expressionSelf;

    model.addExpression(expressionName, function () {
        expressionSelf = this;
    })

    model.evaluateExpression(expressionName);

    assert.equal(true, expressionSelf === model, "Expression callback is binded to model");
    done();
})

assert.callback("Expression throws an error if arguments are invalid", (done) => {
    let data = getCleanModel();
    let model = BindableModel.setModel(data);

    const expressionName = 'test';
    let err;

    try {
        model.addExpression(expressionName);
    } catch (e) {
        err = e;
    }
    assert.true(err instanceof Error, "Error is thrown if no callback is provided");
    assert.equal("Expression must have a callback", err.message, "Invalid callback error message");

    try {
        model.addExpression('', function () {
        });
    } catch (e) {
        err = e;
    }
    assert.true(err instanceof Error, "Error is thrown if no callback is provided");
    assert.equal("Expression name must be a valid string", err.message, "Invalid expression name error message");
    done();
});

assert.callback('Expression chain should be watched for changes', (done) => {
    let data = getCleanModel();
    let model = BindableModel.setModel(data);

    const expressionName = 'test';
    const expressionChains = ['name', 'name.label',
        'primitive_nicknames', 'object_nicknames.0.nickname',
        'object_nicknames.2.id', 'favoriteBooks.books.0.revised'];

    let onChangedExpressionChainChangeCounter = 0;
    let expectedChangesCount = 6;

    model.addExpression(expressionName, function () {
        return true;
    }, expressionChains);

    model.onChangeExpressionChain(expressionName, function () {
        onChangedExpressionChainChangeCounter++;

        if (onChangedExpressionChainChangeCounter === expectedChangesCount) {
            done();
        }
    })

    model.name.value = 1;
    model.name.label = 2;
    model.primitive_nicknames.push('D');
    model.object_nicknames[0].nickname = 'John';
    model.object_nicknames[2].id++;
    model.favoriteBooks.books[0].revised.splice(0, 1);
});
