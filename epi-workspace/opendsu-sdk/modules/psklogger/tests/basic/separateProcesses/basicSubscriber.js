const Configurator = require('../../../src/utils/Configurator');
const MessageSubscriber = require('../../../src/MessageSubscriber').MessageSubscriber;

const config = Configurator.getConfig();

new MessageSubscriber(config.addressForSubscribers, (topic, message) => {
    console.log('log level', topic.toString(), 'message:', message.toString());
});

