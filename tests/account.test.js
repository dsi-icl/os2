const testConfig = require('./test.config.js');
const { Store, Account } = require('../src/index.js');

test('Account connection from Store Object', function(done) {
    expect.assertions(1);
    let test_store = new Store(testConfig.store_url);
    let account = new Account(test_store, testConfig.account_user, testConfig.account_password);
    account.connect().then(function() {
        expect(account.isConnected()).toBeTruthy();
        done();
    }, function (error) {
        done.fail(error);
    });
});

test('Account connection from StoreURL', function(done) {
    expect.assertions(1);
    let account = Account.fromStoreURL(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function() {
        expect(account.isConnected()).toBeTruthy();
        done();
    }, function (error) {
        done.fail(error);
    });
});

test('Account disconnection', function(done) {
    expect.assertions(3);
    let account = Account.fromStoreURL(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function() {
        expect(account.isConnected()).toBeTruthy();
        account.disconnect().then(function(ok) {
            expect(ok).toBeTruthy();
            expect(account.isConnected()).toBeFalsy();
            done();
        }, function(error) {
            done.fail(error);
        });
    }, function (error) {
        done.fail(error);
    });
});


test('Account disconnects on username change', function(done) {
    expect.assertions(2);
    let account = Account.fromStoreURL(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function() {
        expect(account.isConnected()).toBeTruthy();
        account.setUsername('test');
        expect(account.isConnected()).toBeFalsy();
        done();
    }, function (error) {
        done.fail(error);
    });
});


test('Account disconnects on password change', function(done) {
    expect.assertions(2);
    let account = Account.fromStoreURL(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function() {
        expect(account.isConnected()).toBeTruthy();
        account.setPassword('test');
        expect(account.isConnected()).toBeFalsy();
        done();
    }, function (error) {
        done.fail(error);
    });
});

test('Account token is null on disconnected account', function(done) {
    expect.assertions(2);
    let account = Account.fromStoreURL(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    expect(account.isConnected()).toBeFalsy();
    expect(account.getToken()).toBeNull();
    done();
});

test('Account token is not null on connected account', function(done) {
    expect.assertions(2);
    let account = Account.fromStoreURL(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function() {
        expect(account.isConnected()).toBeTruthy();
        expect(account.getToken()).not.toBeNull();
        done();
    }, function (error) {
        done.fail(error);
    });
});

test('Account list containers', function(done) {
    expect.assertions(3);
    let account = Account.fromStoreURL(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function() {
        expect(account.isConnected()).toBeTruthy();
        account.listContainers().then(function(containers) {
            expect(containers).not.toBeNull();
            expect(containers).toBeDefined();
            done();
        }, function (error) {
            done.fail(error);
        });
    }, function (error) {
        done.fail(error);
    });
});


test('Account get metadata', function(done) {
    expect.assertions(2);
    let account = Account.fromStoreURL(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function() {
        expect(account.isConnected()).toBeTruthy();
        account.getMetadata().then(function(meta) {
            expect(meta).toBeDefined();
            done();
        }, function(error) {
            done.fail(error);
        });
    }, function (error) {
        done.fail(error);
    });
});


test('Account create meta data', function(done) {
    expect.assertions(3);
    let account = Account.fromStoreURL(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function() {
        expect(account.isConnected()).toBeTruthy();
        account.setMetadata({test: 'helloworld'}).then(function(ok) {
            expect(ok).toBeTruthy();
            account.getMetadata().then(function(metadata) {
                expect(metadata['test']).toEqual('helloworld');
                done();
            }, function (error) {
                done.fail(error);
            });
        }, function(error) {
            done.fail(error);
        });
    }, function (error) {
        done.fail(error);
    });
});

test('Account update metadata', function(done) {
    expect.assertions(3);
    let account = Account.fromStoreURL(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function() {
        expect(account.isConnected()).toBeTruthy();
        account.setMetadata({test: 'helloworld_updated'}).then(function(ok) {
            expect(ok).toBeTruthy();
            account.getMetadata().then(function(metadata) {
                expect(metadata['test']).toEqual('helloworld_updated');
                done();
            }, function (error) {
                done.fail(error);
            });
        }, function(error) {
            done.fail(error);
        });
    }, function (error) {
        done.fail(error);
    });
});

test('Account remove metadata', function(done) {
    expect.assertions(3);
    let account = Account.fromStoreURL(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function() {
        expect(account.isConnected()).toBeTruthy();
        account.setMetadata({test: '' }).then(function(ok) {
            expect(ok).toBeTruthy();
            account.getMetadata().then(function(metadata) {
                expect(metadata['test']).not.toBeDefined();
                done();
            }, function (error) {
                done.fail(error);
            });
        }, function(error) {
            done.fail(error);
        });
    }, function (error) {
        done.fail(error);
    });
});
