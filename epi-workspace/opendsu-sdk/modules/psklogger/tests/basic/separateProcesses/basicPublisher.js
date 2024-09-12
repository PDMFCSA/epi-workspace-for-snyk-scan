const Configurator = require('../../../src/utils/Configurator');
const LoggerClient = require('../../../src/LoggerClient').LoggerClient;
const MessagePublisher = require('../../../src/MessagePublisher').MessagePublisher;

const config = Configurator.getConfig();

const messagePublisher = new MessagePublisher(config.addressForPublishers);
const logger = new LoggerClient(messagePublisher);

logger.log(undefined, 2);
