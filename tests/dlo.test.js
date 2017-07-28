const testConfig = require('./test.config.js');
const { Account, Container, Segment, DynamicLargeObject } = require('../src/index.js');
const fs = require('fs');
const MemoryStream = require('memorystream');

let chunks = {};
let dlo_account = Account.fromUsernameAndPassword(testConfig.store_url,
    testConfig.account_user, testConfig.account_password);
let dlo_container = undefined;

beforeAll(function() {
    return dlo_account.connect().then(function() {
        dlo_container = new Container(dlo_account, testConfig.dlo_container_name);
        return dlo_container.create();
    }, function(error) {
        throw error.toString();
    });
});

test('DLO create from disk, chunks of 250 bytes', function(done) {
    expect.assertions(3);
    expect(dlo_account.isConnected()).toBeTruthy();
    expect(dlo_container).toBeDefined();
    let obj = new DynamicLargeObject(dlo_container, testConfig.dlo_object_name, testConfig.dlo_prefix);
    obj.createFromDisk('./tests/test.config.js', 250).then(function (data) {
        expect(data).toBeDefined();
        chunks = data;
        done();
    }, function (error) {
        done.fail(error.toString());
    });
});

test('DLO remove manifest, keep the chunks', function(done) {
    expect.assertions(3);
    expect(dlo_account.isConnected()).toBeTruthy();
    expect(dlo_container).toBeDefined();
    let obj = new DynamicLargeObject(dlo_container, testConfig.dlo_object_name, testConfig.dlo_prefix);
    obj.delete().then(function (status) {
        expect(status).toBeTruthy();
        done();
    }, function (error) {
        done.fail(error.toString());
    });
});

test('DLO re-create manifest', function(done) {
    expect.assertions(3);
    expect(dlo_account.isConnected()).toBeTruthy();
    expect(dlo_container).toBeDefined();
    let obj = new DynamicLargeObject(dlo_container, testConfig.dlo_object_name, testConfig.dlo_prefix);
    obj.createManifest().then(function (status) {
        expect(status).toBeTruthy();
        done();
    }, function (error) {
        done.fail(error.toString());
    });
});

test('DLO remove manifest, keep the chunks', function(done) {
    expect.assertions(3);
    expect(dlo_account.isConnected()).toBeTruthy();
    expect(dlo_container).toBeDefined();
    let obj = new DynamicLargeObject(dlo_container, testConfig.dlo_object_name, testConfig.dlo_prefix);
    obj.delete().then(function (status) {
        expect(status).toBeTruthy();
        done();
    }, function (error) {
        done.fail(error.toString());
    });
});

afterAll(function() {
    let delete_proms = [];
    for (let c in chunks) {
        let seg = new Segment(dlo_container, c);
        delete_proms.push(seg.delete());
    }
    return Promise.all(delete_proms).then(function(ok_array) {
        return dlo_container.delete().then(function(ok) {
            dlo_account.disconnect();
        }, function(error) {
            throw error.toString();
        });
    }, function(error) {
        throw error.toString();
    });
});