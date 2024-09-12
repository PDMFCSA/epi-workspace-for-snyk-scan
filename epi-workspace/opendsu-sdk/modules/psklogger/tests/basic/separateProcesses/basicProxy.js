const PubSubProxy = require('../../../src/PubSubProxy').PubSubProxy;

new PubSubProxy({addressForPublishers: 'tcp://127.0.0.1:7000', addressForSubscribers: 'tcp://127.0.0.1:7001'});
