const Configurator = require('../../../src/utils/Configurator');
const PubSubProxy = require('../../../src/PubSubProxy').PubSubProxy;

const config = Configurator.getConfig();

new PubSubProxy(config);
