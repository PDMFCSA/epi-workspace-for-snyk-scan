require("../../../builds/output/testsRuntime");

const dc = require("double-check");
const assert = dc.assert;

const Cache = require("../");

const CACHE_LIMIT = 3;
const CACHE_STORAGE_MAX_LEVELS = 3;
const sampleDataSet = [
    {'key0': 0}, {'key1': 1}, {'key2': 2},

    {'key3': 3}, {'key4': 4}, {'key5': 5},

    {'key6': 6}, {'key7': 7}, {'key8': 8},

    {'key9': 9}, {'key11': 10}
];

assert.callback('Cache: Simple set & get', (done) => {
    const cache = Cache.factory({
        limit: CACHE_LIMIT,
        maxLevels: CACHE_STORAGE_MAX_LEVELS
    });

    const key = 'my';
    const value = 'item';

    cache.set(key, value);

    assert.equal(true, cache.has(key), 'Cache has item');

    const actualValue = cache.get(key);
    assert.equal(value, actualValue, 'Get item from cache');

    done();
});

assert.callback('Cache: Old items are evicted when storing new data', (done) => {
    const cache = Cache.factory({
        limit: CACHE_LIMIT,
        maxLevels: CACHE_STORAGE_MAX_LEVELS
    });

    // Write data in cache
    for (let i = 0; i < 9; i++) {
        const data = sampleDataSet[i];
        const key = Object.keys(data).shift();
        const value = data[key];

        cache.set(key, value);
    }

    // Verify that the items are stored evenly on all 3 levels
    const cacheStorage = cache.storage;

    assert.equal(CACHE_STORAGE_MAX_LEVELS, cacheStorage.length, 'Storage levels count');

    // Level 1 assertions.
    assert.equal(CACHE_LIMIT, cacheStorage[0].size, 'Storage level limit');
    assert.equal(6, cacheStorage[0].get('key6'), 'Last 3 items cached should be stored in the first level');
    assert.equal(7, cacheStorage[0].get('key7'), 'Last 3 items cached should be stored in the first level');
    assert.equal(8, cacheStorage[0].get('key8'), 'Last 3 items cached should be stored in the first level');

    // Level 2 assertions
    assert.equal(CACHE_LIMIT, cacheStorage[1].size, 'Storage level limit');
    assert.equal(3, cacheStorage[1].get('key3'), 'Items 4 - 7 should be stored in the middle level');
    assert.equal(4, cacheStorage[1].get('key4'), 'Items 4 - 7 should be stored in the middle level');
    assert.equal(5, cacheStorage[1].get('key5'), 'Items 4 - 7 should be stored in the middle level');

    // Level 3 assertions
    assert.equal(CACHE_LIMIT, cacheStorage[2].size, 'Storage level limit');
    assert.equal(0, cacheStorage[2].get('key0'), 'First 3 items should be stored in the lowest level');
    assert.equal(1, cacheStorage[2].get('key1'), 'First 3 items should be stored in the lowest level');
    assert.equal(2, cacheStorage[2].get('key2'), 'First 3 items should be stored in the lowest level');

    // Cache new item
    cache.set('key9', 9);

    // Post-eviction level 1 assertions
    assert.equal(1, cacheStorage[0].size, 'Storage level size after eviction');
    assert.equal(9, cacheStorage[0].get('key9'), 'First storage level has new item');

    // Post-eviction level 2 assertions.
    assert.equal(CACHE_LIMIT, cacheStorage[1].size, 'Storage level limit');
    assert.equal(6, cacheStorage[1].get('key6'), 'Old level 1 items should be in the middle level');
    assert.equal(7, cacheStorage[1].get('key7'), 'Old level 1 items should be in the middle level');
    assert.equal(8, cacheStorage[1].get('key8'), 'Old level 1 items should be in the middle level');

    // Post-eviction level 3 assertions.
    assert.equal(CACHE_LIMIT, cacheStorage[2].size, 'Storage level limit');
    assert.equal(3, cacheStorage[2].get('key3'), 'Old level 2 items should be in the lowest level');
    assert.equal(4, cacheStorage[2].get('key4'), 'Old level 2 items should be in the lowest level');
    assert.equal(5, cacheStorage[2].get('key5'), 'Old level 2 items should be in the lowest level');
    done();
});

assert.callback('Cache: Old cached items are brought to the first storage level', (done) => {
    const cache = Cache.factory({
        limit: CACHE_LIMIT,
        maxLevels: CACHE_STORAGE_MAX_LEVELS
    });

    // Write data in cache
    for (let i = 0; i < sampleDataSet.length; i++) {
        const data = sampleDataSet[i];
        const key = Object.keys(data).shift();
        const value = data[key];

        cache.set(key, value);
    }

    // Assert old items were evicted
    assert.equal(false, cache.has('key0'), "Cache shouldn't have items from 0 - 2");
    assert.equal(false, cache.has('key1'), "Cache shouldn't have items from 0 - 2");
    assert.equal(false, cache.has('key2'), "Cache shouldn't have items from 0 - 2");

    // Assert items 3 - 5 are stored in the lowest level
    const cacheStorage = cache.storage;
    assert.equal(3, cacheStorage[2].get('key3'), 'Items 3 - 5 are stored in the lowest level');
    assert.equal(4, cacheStorage[2].get('key4'), 'Items 3 - 5 are stored in the lowest level');
    assert.equal(5, cacheStorage[2].get('key5'), 'Items 3 - 5 are stored in the lowest level');

    // Assert that the new item is brought to the first level
    cache.get('key5');
    assert.equal(CACHE_LIMIT, cacheStorage[0].size, 'Fist storage level has changed its size');
    assert.equal(5, cacheStorage[0].get('key5'), 'Old cache items is broguth to the first level');

    done();
});
