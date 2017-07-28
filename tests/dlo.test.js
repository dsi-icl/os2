const testConfig = require('./test.config.js');
const { Account, Container, Segment, DynamicLargeObject } = require('../src/index.js');
const fs = require('fs');
const MemoryStream = require('memorystream');

let chunks = {};
test('DLO create from disk, chunks of 25 bytes', function(done) {
    expect.assertions(3);
    let account = Account.fromUsernameAndPassword(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function() {
        expect(account.isConnected()).toBeTruthy();
        let container = new Container(account, testConfig.dlo_container_name);
        container.create().then(function(ok) {
            expect(ok).toBeTruthy();
            let obj = new DynamicLargeObject(container, testConfig.dlo_object_name, testConfig.dlo_prefix);
            obj.createFromDisk('./tests/test.config.js', 25).then(function (data) {
                expect(data).toBeDefined();
                chunks = data;
                done();
            }, function (error) {
                done.fail(error.toString());
            });
        }, function(error) {
            done.fail(error.toString());
        })
    }, function (error) {
        done.fail(error.toString());
    });
});

test('DLO remove manifest, keep the chunks', function(done) {
    expect.assertions(2);
    let account = Account.fromUsernameAndPassword(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function() {
        expect(account.isConnected()).toBeTruthy();
        let container = new Container(account, testConfig.dlo_container_name);
        let obj = new DynamicLargeObject(container, testConfig.dlo_object_name, testConfig.dlo_prefix);
        obj.delete().then(function (status) {
                expect(status).toBeTruthy();
                done();
            }, function (error) {
                done.fail(error.toString());
            });
        }, function(error) {
            done.fail(error.toString());
    });
});

test('DLO re-create manifest', function(done) {
    expect.assertions(2);
    let account = Account.fromUsernameAndPassword(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function() {
        expect(account.isConnected()).toBeTruthy();
        let container = new Container(account, testConfig.dlo_container_name);
        let obj = new DynamicLargeObject(container, testConfig.dlo_object_name, testConfig.dlo_prefix);
        obj.createManifest().then(function (status) {
            expect(status).toBeTruthy();
            done();
        }, function (error) {
            done.fail(error.toString());
        });
    }, function(error) {
        done.fail(error.toString());
    });
});

test('DLO remove manifest and remove chunks', function(done) {
    expect.assertions(4);
    let account = Account.fromUsernameAndPassword(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function() {
        expect(account.isConnected()).toBeTruthy();
        let container = new Container(account, testConfig.dlo_container_name);
        let obj = new DynamicLargeObject(container, testConfig.dlo_object_name, testConfig.dlo_prefix);
        let delete_proms = [];
        for (let c in chunks) {
            let seg = new Segment(container, c);
            delete_proms.push(seg.delete());
        }
        Promise.all(delete_proms).then(function(ok_array) {
            expect(ok_array[0]).toBeTruthy();
            obj.delete().then(function (status) {
                expect(status).toBeTruthy();
                container.delete().then(function(ok) {
                    expect(ok).toBeTruthy();
                    done();
                }, function(error) {
                    done.fail(error.toString());
                });
            }, function (error) {
                done.fail(error.toString());
            });
        }, function(error) {
           done.fail(error.toString());
        });
    }, function(error) {
        done.fail(error.toString());
    });
});