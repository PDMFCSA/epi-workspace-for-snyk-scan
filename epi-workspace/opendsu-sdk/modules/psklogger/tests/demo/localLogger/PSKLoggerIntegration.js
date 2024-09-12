const Configurator = require('../../../src/utils/Configurator');
const MessageSubscriber = require('../../../src/MessageSubscriber').MessageSubscriber;
const PSKLogger = require('../../../src/PSKLoggerClient');

const config = Configurator.getConfig();

/** !! START LOGGER PROXY BEFORE THIS **/

const originalConsole = {};
Object.keys(console).forEach(key => originalConsole[key] = console[key]);


function consoleSubscriber(topic, message) {
    message = message.toString();
    const log = JSON.parse(message);
    const logLevelName = log.level.name;

    originalConsole[logLevelName](message);
}

MessageSubscriber(config.addressForSubscribers, ['logs'], consoleSubscriber);
const logger = PSKLogger.getLogger();

Object.keys(logger).forEach(key => {
    console[key] = logger[key];
});

console.log('overwrite successful');
