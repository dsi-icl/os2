const testConfig = require('./test.config.js');
const { Account, Container, Segment } = require('../src/index.js');
const fs = require('fs');
const MemoryStream = require('memorystream');

test('Segment non-existing metadata get', function(done) {
    expect.assertions(2);
    let account = Account.fromUsernameAndPassword(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function() {
        expect(account.isConnected()).toBeTruthy();
        let container = new Container(account, testConfig.segment_container_name);
        let obj = new Segment(container, testConfig.segment_object_name);
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
        let container = new Container(account, testConfig.segment_container_name);
        container.create().then(function(ok) {
            let obj = new Segment(container, testConfig.segment_object_name);
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

test('Segment update from stream', function(done) {
    expect.assertions(2);
    let account = Account.fromUsernameAndPassword(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function () {
        expect(account.isConnected()).toBeTruthy();
        let container = new Container(account, testConfig.segment_container_name);
        container.create().then(function(ok) {
            let obj = new Segment(container, testConfig.segment_object_name);
            let ms = new MemoryStream('');
            obj.createFromStream(ms).then(function(ok) {
                expect(ok).toBeTruthy();
                done();
            }, function(error) {
                done.fail(error);
            });
            ms.end('coucou hibou');
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
        let container = new Container(account, testConfig.segment_container_name);
        let obj = new Segment(container, testConfig.segment_object_name);
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
        let container = new Container(account, testConfig.segment_container_name);
        let obj = new Segment(container, testConfig.segment_object_name);
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
        let container = new Container(account, testConfig.segment_container_name);
        let obj = new Segment(container, testConfig.segment_object_name);
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

test('Segment read', function(done) {
    expect.assertions(5);
    let account = Account.fromUsernameAndPassword(testConfig.store_url, testConfig.account_user, testConfig.account_password);
    account.connect().then(function () {
        expect(account.isConnected()).toBeTruthy();
        let container = new Container(account, testConfig.segment_container_name);
        let obj = new Segment(container, testConfig.segment_object_name);
        obj.getContentStream().then(function(stream) {
            expect(stream).not.toBeNull();
            expect(stream).toBeDefined();
            expect(stream.isPaused()).toBeFalsy();
            let content = '';
            stream.on('data', function(data) {
               content += data;
            });
            stream.on('end', function() {
                let ref = 'coucou hibou';//fs.readFileSync('./tests/test.config.js', {encoding: 'utf8'});
                expect(content).toEqual(ref);
                done();
            });
            stream.on('error', function(error) {
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
        let container = new Container(account, testConfig.segment_container_name);
        let obj = new Segment(container, testConfig.segment_object_name);
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
        let container = new Container(account, testConfig.segment_container_name);
        let obj = new Segment(container, testConfig.segment_object_name);
    }, function (error) {
        done.fail(error);
    });
});
*/