const Store = require('./store.js');
const Account = require('./account.js');
const Container = require('./container.js');
const Segment = require('./segment.js');
const DLO = require('./dlo.js');
//const SLO = require('./slo.js');

module.exports = {
    Store: Store,
    Account: Account,
    Container: Container,
    Segment: Segment,
    DynamicLargeObject: DLO
//    StaticLargeObject: SLO
};