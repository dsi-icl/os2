const testConfig = require('./test.config.js');
const { Account, Container, StaticLargeObject } = require('../src/index.js');
const fs = require('fs');

let chunks = {};
let slo_account = Account.fromUsernameAndPassword(testConfig.store_url,
    testConfig.account_user, testConfig.account_password);
let slo_container = undefined;

beforeAll(function() {
    return slo_account.connect().then(function() {
            slo_container = new Container(slo_account, testConfig.slo_container_name);
            return slo_container.create();
    }, function(error) {
        throw error.toString();
    });
});

test('SLO create from disk', function(done) {
    expect.assertions(3);
    expect(slo_account.isConnected()).toBeTruthy();
    expect(slo_container).toBeDefined();
    let obj = new StaticLargeObject(slo_container, testConfig.slo_object_name);
    obj.createFromDisk('./tests/test.config.js').then(function (data) {
        expect(data).toBeDefined();
        chunks = data;
        done();
    }, function (error) {
        done.fail(error.toString());
    });
});

test('SLO remove manifest, keep the chunks', function(done) {
    expect.assertions(3);
    expect(slo_account.isConnected()).toBeTruthy();
    expect(slo_container).toBeDefined();
    let obj = new StaticLargeObject(slo_container, testConfig.slo_object_name);
    obj.delete().then(function (status) {
        expect(status).toBeTruthy();
        done();
    }, function (error) {
        done.fail(error.toString());
    });
});

test('SLO re-create manifest', function(done) {
    expect.assertions(3);
    expect(slo_account.isConnected()).toBeTruthy();
    expect(slo_container).toBeDefined();
    let obj = new StaticLargeObject(slo_container, testConfig.slo_object_name);
    let manifest = [];
    for (let c in chunks) {
        manifest.push({ path: slo_container.getName() + '/' + c});
    }
    obj.createManifest(manifest).then(function (status) {
        expect(status).toBeTruthy();
        done();
    }, function (error) {
        done.fail(error.toString());
    });
});

test('SLO remove manifest and remove chunks', function(done) {
    expect.assertions(3);
    expect(slo_account.isConnected()).toBeTruthy();
    expect(slo_container).toBeDefined();
    let obj = new StaticLargeObject(slo_container, testConfig.slo_object_name);
    obj.deleteWithContent().then(function (status) {
        expect(status).toBeTruthy();
        done();
    }, function (error) {
        done.fail(error.toString());
    });
});

afterAll(function() {
    return slo_container.delete().then(function(ok) {
        slo_account.disconnect();
    }, function(error) {
        done.fail(error.toString());
    });
});