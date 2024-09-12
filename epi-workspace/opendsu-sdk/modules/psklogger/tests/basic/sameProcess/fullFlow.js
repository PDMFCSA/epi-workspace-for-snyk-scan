const Configurator = require('../../../src/utils').Configurator;
const PubSubProxy = require('../../../src/PubSubProxy').PubSubProxy;

const config = Configurator.getConfig();


/** starting proxy **/
new PubSubProxy(config);


/** starting collector **/
const MessageSubscriber = require('../../../src/MessageSubscriber').MessageSubscriber;

new MessageSubscriber(config.addressForSubscribers, ['logs'], (topic, message) => {
    console.log('log level', topic.toString(), 'message:', JSON.parse(message.toString()));
});

/** starting logger **/
const LoggerClient = require('../../../src/LoggerClient').LoggerClient;
const MessagePublisher = require('../../../src/MessagePublisher').MessagePublisher;
const transport = new MessagePublisher(config.addressForPublishers);
const logger = new LoggerClient(transport);

logger.log(undefined, 2);

