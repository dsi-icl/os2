const testConfig = require('./test.config.js');
const { Account, Container, Segment } = require('../src/index.js');

test('Segment non-existing metadata get', function(done) {
    expect.assertions(2);
    let account = Account.fromUsernameAndPassword(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function() {
        expect(account.isConnected()).toBeTruthy();
        let container = new Container(account, testConfig.container_name);
        let obj = new Segment(container, testConfig.object_name);
        obj.getMetadata().then(function(data) {
            done.fail(data);
        }, function(error) {
            expect(error).toBeDefined();
            done();
        });
    }, function (error) {
        done.fail(error);
    });
});

test('Segment create from disk', function(done) {
    expect.assertions(2);
    let account = Account.fromUsernameAndPassword(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function () {
        expect(account.isConnected()).toBeTruthy();
        let container = new Container(account, testConfig.container_name);
        container.create().then(function(ok) {
            let obj = new Segment(container, testConfig.object_name);
            const buf = Buffer.alloc(10);
            obj.createFromDisk('./tests/test.config.js').then(function(ok) {
                expect(ok).toBeTruthy();
                done();
            }, function(error) {
                done.fail(error);
            });
        }, function(error) {
            done.fail(error);
        });
    }, function (error) {
        done.fail(error);
    });
});


test('Segment setMetadata', function(done) {
    expect.assertions(2);
    let account = Account.fromUsernameAndPassword(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function () {
        expect(account.isConnected()).toBeTruthy();
        let container = new Container(account, testConfig.container_name);
        let obj = new Segment(container, testConfig.object_name);
        obj.setMetadata({test: 'coucou'}).then(function(ok) {
            expect(ok).toBeTruthy();
            done();
        }, function(error) {
            done.fail(error);
        });
    }, function (error) {
        done.fail(error);
    });
});

test('Segment getMetadata', function(done) {
    expect.assertions(2);
    let account = Account.fromUsernameAndPassword(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function () {
        expect(account.isConnected()).toBeTruthy();
        let container = new Container(account, testConfig.container_name);
        let obj = new Segment(container, testConfig.object_name);
        obj.getMetadata().then(function(data) {
            expect(data.test).toEqual('coucou');
            done();
        }, function(error) {
            done.fail(error);
        });
    }, function (error) {
        done.fail(error);
    });
});


test('Segment update metadata', function(done) {
    expect.assertions(3);
    let account = Account.fromUsernameAndPassword(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function () {
        expect(account.isConnected()).toBeTruthy();
        let container = new Container(account, testConfig.container_name);
        let obj = new Segment(container, testConfig.object_name);
        obj.setMetadata({test: 'coucou_update'}).then(function(ok) {
            expect(ok).toBeTruthy();
            obj.getMetadata().then(function(data) {
                expect(data.test).toEqual('coucou_update');
                done();
            }, function(error) {
                done.fail(error);
            });
        }, function(error) {
            done.fail(error);
        });
    }, function (error) {
        done.fail(error);
    });
});

test('Segment delete', function(done) {
    expect.assertions(3);
    let account = Account.fromUsernameAndPassword(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function () {
        expect(account.isConnected()).toBeTruthy();
        let container = new Container(account, testConfig.container_name);
        let obj = new Segment(container, testConfig.object_name);
        obj.delete().then(function(ok) {
            expect(ok).toBeTruthy();
            container.delete().then(function(ok2) {
                expect(ok2).toBeTruthy();
                done();
            }, function(error) {
                done.fail(error);
            });
        }, function(error) {
            done.fail(error);
        });
    }, function(error) {
        done.fail(error);
    });
});

/*
test('Segment ', function(done) {
    expect.assertions(2);
    let account = Account.fromUsernameAndPassword(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function () {
        expect(account.isConnected()).toBeTruthy();
        let container = new Container(account, testConfig.container_name);
        let obj = new Segment(container, testConfig.object_name);
    }, function (error) {
        done.fail(error);
    });
});
*/