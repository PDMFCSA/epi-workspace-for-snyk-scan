gtinResolverRequire=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/builds/tmp/gtinResolver_intermediar.js":[function(require,module,exports){
(function (global){(function (){
global.gtinResolverLoadModules = function(){ 

	if(typeof $$.__runtimeModules["gtin-resolver"] === "undefined"){
		$$.__runtimeModules["gtin-resolver"] = require("gtin-resolver");
	}
};
if (true) {
	gtinResolverLoadModules();
}
global.gtinResolverRequire = require;
if (typeof $$ !== "undefined") {
	$$.requireBundle("gtinResolver");
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"gtin-resolver":"gtin-resolver"}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/DSUFabricFeatureManager.js":[function(require,module,exports){
const openDSU = require("opendsu");
const config = openDSU.loadAPI("config");

async function getDisabledFeatures() {
  let disabledFeaturesArr = [];
  try {
    let disabledFeaturesList = await $$.promisify(config.getEnv)("disabledFeatures");
    if (disabledFeaturesList) {
      let disabledCodesArr = disabledFeaturesList.split(",");
      disabledCodesArr.forEach(item => {
        disabledFeaturesArr.push(item.trim());
      })
    }
  } catch (e) {
    console.log("Couldn't load disabledFeatures")
  }
  return disabledFeaturesArr;
}

async function isFeatureEnabledAsync(feature){
  let disabledFeatures = await getDisabledFeatures();
  if(disabledFeatures.indexOf(feature) !== -1){
    return false;
  }
  return true;
}

function isFeatureEnabled(feature, callback){
  isFeatureEnabledAsync(feature).then((enabled)=>{
    return callback(undefined, enabled);
  }).catch(()=>{
    callback(undefined, true);
  });
}

module.exports = {
  getDisabledFeatures,
  isFeatureEnabled,
  isFeatureEnabledAsync
}

},{"opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/EpiVersionTransformer.js":[function(require,module,exports){
const epiProtocolVersionMap = {
  "v1": {
    ROOT_PATH_TO_PRODUCT_DSU: "/product",
    ROOT_PATH_TO_BATCH_DSU: "/batch",
  }
}

function getVersionMap(epiProtocolVersion) {
  if (!epiProtocolVersionMap[`v${epiProtocolVersion}`]) {
    throw new Error(`No mapping found for version ${epiProtocolVersion}`);
  }
  return epiProtocolVersionMap[`v${epiProtocolVersion}`];
}

function getProductPath(epiProtocolVersion) {
  let versionMap = getVersionMap(epiProtocolVersion);
  return `${versionMap["ROOT_PATH_TO_PRODUCT_DSU"]}/product.epi_v${epiProtocolVersion}`;
}

function getProductImagePath(epiProtocolVersion) {
  let versionMap = getVersionMap(epiProtocolVersion);
  return `${versionMap["ROOT_PATH_TO_PRODUCT_DSU"]}/image.png`;
}


function getBatchPath(epiProtocolVersion) {
  let versionMap = getVersionMap(epiProtocolVersion);
  return `${versionMap["ROOT_PATH_TO_BATCH_DSU"]}/batch.epi_v${epiProtocolVersion}`;
}

module.exports = {
  getVersionMap,
  getProductPath,
  getProductImagePath,
  getBatchPath
}

},{}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/GTIN_DSU_Factory.js":[function(require,module,exports){
function GTIN_DSU_Factory(resolver) {
    this.create = (keySSI, options, callback) => {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        options.dsuFactoryType = "const";
        resolver.createDSU(keySSI, options, callback);
    };


    this.load = (keySSI, options, callback) => {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        options.dsuFactoryType = "const";
        resolver.loadDSU(keySSI, options, callback);
    };
}

module.exports = GTIN_DSU_Factory;

},{}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/GTIN_SSI.js":[function(require,module,exports){
const openDSU = require("opendsu");
const keyssiSpace = openDSU.loadApi("keyssi");

function createGTIN_SSI(domain, bricksDomain, gtin, batch) {
    console.log(`New GTIN_SSI in domain:${domain} and bricksDomain:${bricksDomain}`);
    let hint = {avoidRandom : true};
    if (typeof bricksDomain !== "undefined") {
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = bricksDomain;
    }
    hint = JSON.stringify(hint);
    let realSSI = keyssiSpace.createArraySSI(domain, [gtin, batch], 'v0', hint);

    return realSSI;
}

function parseGTIN_SSI(ssiIdentifier) {
    /*const pskCrypto = require("pskcrypto");
    ssiIdentifier = pskCrypto.pskBase58Decode(ssiIdentifier).toString();
    ssiIdentifier = ssiIdentifier.replace("gtin", "array");
    ssiIdentifier = pskCrypto.pskBase58Encode(ssiIdentifier).toString();
    let realSSI = keyssiSpace.parse(ssiIdentifier);
    let gtinSSI = new GTIN_SSI(realSSI);
    setOptions(gtinSSI);
    return gtinSSI;*/
    return keyssiSpace.parse(ssiIdentifier);
}

module.exports = {
    createGTIN_SSI,
    parseGTIN_SSI
};
},{"opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/LeafletFeatureManager.js":[function(require,module,exports){
const openDSU = require("opendsu");
const config = openDSU.loadAPI("config");

async function getLeafletDisabledFeatures() {
  let disabledFeaturesArr = [];
  try {
    let disabledFeaturesList = await $$.promisify(config.getEnv)("disabledFeatures");
    if (disabledFeaturesList) {
      let disabledCodesArr = disabledFeaturesList.split(",");
      disabledCodesArr.forEach(item => {
        disabledFeaturesArr.push(item.trim());
      })
    }
  } catch (e) {
    console.log("Couldn't load disabledFeatures")
  }
  return disabledFeaturesArr;
}

async function getEpiProtocolVersion() {
  let defaultVersion = "1";
  let epiProtocolVersion = await $$.promisify(config.getEnv)("epiProtocolVersion");
  if (epiProtocolVersion && epiProtocolVersion !== "undefined") {
    return epiProtocolVersion
  }
  return defaultVersion;
}

module.exports = {
  getLeafletDisabledFeatures,
  getEpiProtocolVersion
}

},{"opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/apihubMappingEngine/index.js":[function(require,module,exports){
(function (Buffer,__dirname){(function (){
const errUtils = require("../mappings/errors/errorUtils.js");
errUtils.addMappingError("TOKEN_VALIDATION_FAIL");
const errMap = require("opendsu").loadApi("m2dsu").getErrorsMap();
const customErr = errMap.newCustomError(errMap.errorTypes.TOKEN_VALIDATION_FAIL, "token");

function getEPIMappingEngineForAPIHUB(server) {

  //this middleware is not present in MVP1
  return;

  const gtinResolverBundle = "./../../../gtin-resolver/build/bundles/gtinResolver.js";
  require(gtinResolverBundle);
  const workerController = new WorkerController(server.rootFolder);
  workerController.boot((err) => {
    if (err) {
      console.log(err);
    }
  })

  function putMessage(request, response) {
    const apiHub = require("apihub");
    let domainName = request.params.domain;
    let subdomainName = request.params.subdomain;
    let walletSSI = request.headers.token;

    console.log(`EPI Mapping Engine called for domain:  ${domainName}, and walletSSI : ${walletSSI}`);

    let data = [];
    request.on('data', (chunk) => {
      data.push(chunk);
    });

    request.on('end', async () => {

      try {
        let body = Buffer.concat(data).toString();
        let messages = JSON.parse(body);
        if (!Array.isArray(messages)) {
          messages = [messages]
        }
        let domainConfig = apiHub.getDomainConfig(domainName);
        let subdomain = domainConfig && domainConfig.bricksDomain ? domainConfig.bricksDomain : subdomainName;

        if (!subdomain) {
          throw new Error(`Missing subdomain. Must be provided in url or set in configuration`);
        }

        /*if (!walletSSI) {
          if (!domainConfig) {
            throw new Error(`Domain configuration ${domain} not found`);
          }

          //token should be in request header or in domain configuration or in the message body
          if (!domainConfig.mappingEngineWalletSSI) {
            if (!messages[0].token) {
              let err = new Error(`mappingEngineWalletSSI is not set in the domain with name ${domain} configuration and no token provided in header or message`);
              err.debug_message = "Invalid credentials";
              throw err;
            } else {
              walletSSI = messages[0].token
            }

          }
        }

        walletSSI = walletSSI || domainConfig.mappingEngineWalletSSI;
*/
        let {
          walletGroupMap,
          droppedMessages
        } = workerController.groupByWallet(messages, walletSSI, domainConfig, domainName, subdomain);
        try {
          let groups = Object.keys(walletGroupMap);
          if (groups.length === 0) {
            let err = new Error(`token not set in body or header or in domain config`);
            err.debug_message = "Invalid credentials";
            throw err;
          }
          for (let i = 0; i < groups.length; i++) {
            await workerController.addMessages(groups[i], domainName, subdomain, walletGroupMap[groups[i]], droppedMessages);
          }

        } catch (err) {
          console.log(err);
          err.debug_message === "Invalid credentials" ? response.statusCode = 403 : response.statusCode = 500;
          response.write("Failed to digest messages.");
          return response.end();
        }

        response.statusCode = 200;
        if (droppedMessages.length > 0) {
          response.setHeader("Content-type", 'application/json');
          response.write(JSON.stringify({droppedMessages, reason: "Invalid or missing token"}));
          let messagesToPersist = workerController.getResponseTemplates(droppedMessages);
          let errInfo = customErr.otherErrors.details[0];
          messagesToPersist.forEach(msg => {
            msg.addErrorResponse(errInfo.errorType, errInfo.errorMessage, errInfo.errorDetails, errInfo.errorField);
          })
          await workerController.persistMessageResults(messagesToPersist);
        }
        response.end();
      } catch (err) {
        console.error("Error on parse request message", err);
        err.debug_message === "Invalid credentials" ? response.statusCode = 403 : response.statusCode = 500;
        response.write("Failed to parse request message");
        response.end();
      }
    })

  }

  server.put("/mappingEngine/:domain", putMessage);
  server.put("/mappingEngine/:domain/:subdomain", putMessage);

}

function WorkerController(rootFolder) {
  //dependencies
  const gtinResolver = require("gtin-resolver");
  const openDSU = require("opendsu");
  const getBaseUrl = openDSU.loadApi("system").getBaseURL;
  const path = require("path");
  const fs = require("fs");
  const createLokiEnclaveFacadeInstance = require("loki-enclave-facade").createLokiEnclaveFacadeInstance;

  //constants
  const MAX_NUMBER_OF_MESSAGES = 50;
  const MAX_GROUP_SIZE = 10;
  const GROUPING_TIMEOUT = 5 * 1000;
  const ENCLAVE_FOLDER = path.join(rootFolder, "external-volume", "enclaves");
  const DATABASE_PERSISTENCE_TIMEOUT = 100;

  //state variables
  const walletIsBeingProcessed = {};
  const messagesPipe = {};
  const databases = {};
  const getDatabase = (walletSSI) => {
    if (typeof databases[walletSSI] === "undefined") {
      databases[walletSSI] = createLokiEnclaveFacadeInstance(path.join(ENCLAVE_FOLDER, walletSSI), DATABASE_PERSISTENCE_TIMEOUT);
    }
    return databases[walletSSI];
  }

  function getMessageEndPoint(message) {
    const apiHub = require("apihub");
    let {domain, subdomain} = message.context;
    let domainConfig = apiHub.getDomainConfig(domain);

    let mappingEnginResultURL = domainConfig.mappingEnginResultURL || `${getBaseUrl()}/mappingEngine/${domain}/${subdomain}/saveResult`;
    if (message.senderId && domainConfig.mappingEnginResultURLs && Array.isArray(domainConfig.mappingEnginResultURLs)) {
      let endpointObj = domainConfig.mappingEnginResultURLs.find(item => item["endPointId"] === message.senderId);
      if (endpointObj) {
        mappingEnginResultURL = endpointObj.endPointURL;
      }
    }

    return mappingEnginResultURL;
  }

  this.getResponseTemplates = (messages) => {
    const gtinResolver = require("gtin-resolver");
    const mappings = gtinResolver.loadApi("mappings");
    return messages.map(msg => {
      let response = mappings.buildResponse(0.2);
      response.setReceiverId(msg.senderId);
      response.setSenderId(msg.receiverId);
      response.setMessageType(msg.messageType);
      response.setRequestData(msg);
      response.endPoint = getMessageEndPoint(msg);
      return response;
    });
  }

  this.persistMessageResults = async (messagesToPersist) => {
    const httpSpace = require("opendsu").loadApi('http');
    for (let item of messagesToPersist) {
      try {
        await $$.promisify(httpSpace.doPut)(item.endPoint, JSON.stringify(item));
      } catch (err) {
        console.log(`Could not persist message: ${item} with error ${err}`);
      }
    }
  }
  let self = this;

  async function logUndigestedMessages(groupMessages, walletSSI, response) {
    let undigestedMessages = response.undigestedMessages;
    let messagesToPersist = self.getResponseTemplates(groupMessages);
    const gtinResolver = require("gtin-resolver");
    const mappings = gtinResolver.loadApi("mappings");
    let LogService = gtinResolver.loadApi("services").LogService;
    let logService = new LogService();
    let sharedEnclave = await getSharedEnclaveForWallet(walletSSI);
    let mappingLogService = mappings.getMappingLogsInstance(sharedEnclave, logService);
    try {
      for (let i = 0; i < messagesToPersist.length; i++) {
        let itemToPersist = messagesToPersist[i];
        let index = undigestedMessages.findIndex(uMsg => {
          if (typeof uMsg === "string") {
            uMsg = JSON.parse(uMsg);
          }
          return uMsg.message.messageId === itemToPersist.requestMessageId;
        })

        if (index >= 0) {
          let undigestedMessage = undigestedMessages[index];
          let errorStatus = undigestedMessage.error.debug_message || null;
          if (undigestedMessage.error && undigestedMessage.error.otherErrors && undigestedMessage.error.otherErrors.details.length) {
            mappingLogService.logFailAction(undigestedMessage.message, undigestedMessage.error.otherErrors.details, errorStatus)
            undigestedMessage.error.otherErrors.details.forEach((element) => {
              itemToPersist.addErrorResponse(element.errorType, element.errorMessage, element.errorDetails, element.errorField);
            })
          } else {
            mappingLogService.logFailAction(undigestedMessage.message, undigestedMessage.error, errorStatus)
          }
        }
      }

    } catch (e) {
      console.log(e);
    }
    await self.persistMessageResults(messagesToPersist);
  }

  const getMessagePipe = (walletSSI) => {
    if (typeof messagesPipe[walletSSI] === "undefined") {
      const MessagesPipe = gtinResolver.getMessagesPipe();
      const MessageQueuingService = gtinResolver.loadApi("services").getMessageQueuingServiceInstance();
      messagesPipe[walletSSI] = new MessagesPipe(MAX_GROUP_SIZE, GROUPING_TIMEOUT, MessageQueuingService.getNextMessagesBlock);
    }

    return messagesPipe[walletSSI];
  }

  const getMessagesFromDb = (walletSSI, callback) => {
    const db = getDatabase(walletSSI);
    db.listQueue("", walletSSI, "asc", MAX_NUMBER_OF_MESSAGES, async (err, dbMessages) => {
      if (err) {
        return callback(err);
      }

      if (!dbMessages || dbMessages.length === 0) {
        return callback(undefined, []);
      }
      let messages = [];
      for (let i = 0; i < dbMessages.length; i++) {
        const message = await $$.promisify(db.getObjectFromQueue)("", walletSSI, dbMessages[i]);
        messages.push(message);
      }

      callback(undefined, messages);
    });
  }

  const deleteProcessedMessagesFromDb = async (walletSSI, messages) => {
    const db = getDatabase(walletSSI);
    for (let i = 0; i < messages.length; i++) {
      await $$.promisify(db.deleteObjectFromQueue)("", walletSSI, messages[i].pk)
    }
  };

  const dispatchMessagesToWorker = async (walletSSI, messages) => {
    const syndicate = require("syndicate");
    const pool = syndicate.createWorkerPool({
      bootScript: require("path").join(__dirname, "./threadBootscript.js")
    })

    const task = {
      walletSSI,
      messages,
    }

    walletIsBeingProcessed[walletSSI] = true;
    let response = await $$.promisify(pool.addTask, pool)(JSON.stringify(task));
    response = JSON.parse(response);
    walletIsBeingProcessed[walletSSI] = false;
    return response;
  }

  const processWalletMessages = (walletSSI, callback) => {
    if (walletIsBeingProcessed[walletSSI]) {
      return callback();
    }

    getMessagesFromDb(walletSSI, async (err, messages) => {
      if (err) {
        return callback(err);
      }

      if (messages.length === 0) {
        return callback();
      }

      const messagePipe = getMessagePipe(walletSSI);
      messagePipe.addInQueue(messages);
      let noGroupMessages = 0;
      messagePipe.onNewGroup(async (groupMessages) => {
        noGroupMessages += groupMessages.length;
        try {
          const response = await dispatchMessagesToWorker(walletSSI, groupMessages);
          await deleteProcessedMessagesFromDb(walletSSI, groupMessages);
          await logUndigestedMessages(groupMessages, walletSSI, response);
        } catch (e) {
          return callback(e);
        }

        if (noGroupMessages === messages.length) {
          processWalletMessages(walletSSI, callback);
        }
      })
    })
  }

  async function getSharedEnclaveForWallet(walletSSI) {
    const resolver = require("opendsu").loadAPI("resolver");
    let wallet = await $$.promisify(resolver.loadDSU)(walletSSI);
    const scAPI = openDSU.loadApi("sc");
    scAPI.setMainDSU(wallet);
    let sharedEnclave = await $$.promisify(scAPI.getSharedEnclave)();
    return sharedEnclave;
  }

  this.boot = (callback) => {
    const __processWallets = () => {
      fs.readdir(ENCLAVE_FOLDER, async (err, files) => {
        if (err) {
          return callback(err);
        }

        if (files.length === 0) {
          return callback();
        }

        for (let i = 0; i < files.length; i++) {
          const walletSSI = files[i];
          await $$.promisify(processWalletMessages)(walletSSI);
        }
        callback();
      })
    }

    fs.access(ENCLAVE_FOLDER, async err => {
      if (err) {
        fs.mkdir(ENCLAVE_FOLDER, {recursive: true}, async err => {
          if (err) {
            return callback(err);
          }

          __processWallets();
        });

        return
      }

      __processWallets();
    })
  }

  let addMessageToMap = (walletGroupMap, message, token) => {
    if (!walletGroupMap[token]) {
      walletGroupMap[token] = [];
    }
    walletGroupMap[token].push(message)
  }

  this.groupByWallet = (messages, headerToken, domainConfig, domain, subdomain) => {
    let walletGroupMap = {};
    let droppedMessages = []
    messages.forEach(message => {
      if (message.token) {
        addMessageToMap(walletGroupMap, message, message.token)
      } else if (headerToken) {
        addMessageToMap(walletGroupMap, message, headerToken)
      } else if (domainConfig && domainConfig.mappingEngineWalletSSI) {
        addMessageToMap(walletGroupMap, message, domainConfig.mappingEngineWalletSSI)
      } else {
        message.context = {
          domain,
          subdomain
        };
        droppedMessages.push(message)
      }
    })
    return {walletGroupMap, droppedMessages}
  }

  this.addMessages = async (walletSSI, domain, subdomain, messages, droppedMessages) => {
    try {
      const resolver = require("opendsu").loadAPI("resolver");
      await $$.promisify(resolver.loadDSU)(walletSSI);
    } catch (e) {
      droppedMessages.push(messages)
      return;
    }

    const db = getDatabase(walletSSI);

    for (let i = 0; i < messages.length; i++) {
      let message = messages[i];
      message.context = {
        domain,
        subdomain
      };
      await $$.promisify(db.addInQueue)("", walletSSI, message);
    }

    $$.promisify(processWalletMessages)(walletSSI);
  }
}

module.exports.getEPIMappingEngineForAPIHUB = getEPIMappingEngineForAPIHUB;

}).call(this)}).call(this,require("buffer").Buffer,"/lib/apihubMappingEngine")

},{"../mappings/errors/errorUtils.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/errors/errorUtils.js","apihub":false,"buffer":false,"fs":false,"gtin-resolver":"gtin-resolver","loki-enclave-facade":false,"opendsu":false,"path":false,"syndicate":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/apihubMappingEngineMessageResults/index.js":[function(require,module,exports){
(function (Buffer){(function (){
const fs = require('fs');
const path = require('path');
const constants = require("../constants/constants");
const MESSAGE_SEPARATOR = "#$%/N";
function getEPIMappingEngineMessageResults(server) {
  const MESSAGES_PATH =path.join(server.rootFolder, "external-volume", "messages");

  function getLogs(msgParam, domain, callback) {
    const sanitizedDomain = path.basename(domain); // Prevent path traversal by using basename
    const LOGS_FOLDER = path.join(MESSAGES_PATH, sanitizedDomain);
    const LOGS_FILE = path.join(LOGS_FOLDER, constants.LOGS_TABLE);

    // Verify that LOGS_FILE is strictly within MESSAGES_PATH
    if (path.relative(MESSAGES_PATH, LOGS_FILE).startsWith('..')) {
      return callback(Error("Path Traversal detected!"));
    }

    fs.access(LOGS_FILE, fs.F_OK, (err) => {
      if (err) {
        return callback(`No logs found for domain -  ${domain}`);
      }

      fs.readFile(LOGS_FILE, 'utf8', (err, result) => {
        if (err) {
          return callback(err);
        }
        let messages = result.split(MESSAGE_SEPARATOR);
        if (messages[messages.length - 1] === "") {
          messages.pop();
        }
        try {
          messages = messages.map(msg => JSON.parse(msg));
        } catch (err) {
          return callback(err);
        }
        return callback(null, messages.reverse());
      });
    });
  }

  server.put("/mappingEngine/:domain/:subdomain/saveResult", function (request, response) {
    let msgDomain = path.basename(request.params.domain); // Sanitize domain to prevent traversal
    let data = [];

    request.on('data', (chunk) => {
      data.push(chunk);
    });

    request.on('end', async () => {
      try {
        let body = Buffer.concat(data).toString();

        const fileDir = path.join(MESSAGES_PATH, msgDomain);
        const logsFile = path.join(fileDir, constants.LOGS_TABLE);

        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }

        // Enhanced Path Traversal Check
        if (path.relative(MESSAGES_PATH, logsFile).startsWith('..')) {
          response.statusCode = 403;
          response.end("Path Traversal detected!");
          return;
        }

        fs.appendFile(logsFile, body + MESSAGE_SEPARATOR, (err) => {
          if (err) {
            throw err;
          }
          response.statusCode = 200;
          response.end();
        });
      } catch (e) {
        response.statusCode = 500;
        response.end();
      }
    });
  });

  server.get("/mappingEngine/:domain/logs", function (request, response) {

    let domainName = request.params.domain;
    let msgParam = request.params.messageParam;
    console.log(`EPI Mapping Engine get called for domain:  ${domainName}`);

    try {
      getLogs(msgParam, domainName, (err, logs) => {
        if (err) {
          console.log(err);
          response.statusCode = 500;
          response.end(JSON.stringify({result: "Error", message: "No logs"}));
          return;
        }
        if (!logs || logs.length === 0) {
          logs = "Log list is empty";
        }
        response.statusCode = 200;
        response.end(JSON.stringify(logs));
      });

    } catch (err) {
      console.error(err);
      response.statusCode = 500;
      response.end(JSON.stringify({result: "Error", error: err}));
    }

  });
}

module.exports.getEPIMappingEngineMessageResults = getEPIMappingEngineMessageResults;

}).call(this)}).call(this,require("buffer").Buffer)

},{"../constants/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","buffer":false,"fs":false,"path":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js":[function(require,module,exports){
module.exports = {
    VALID_SERIAL_NUMBER_TYPE: "valid",
    RECALLED_SERIAL_NUMBER_TYPE: "recalled",
    DECOMMISSIONED_SERIAL_NUMBER_TYPE: "decommissioned",
    PACKAGES_STORAGE_PATH: "/app/data/packages.json",
    LANGUAGES_STORAGE_PATH: "/app/data/languages.json",
    DATA_STORAGE_PATH: "/app/data",
    PRODUCTS_TABLE: "products",
    LOGS_TABLE: "logs",
    SERIAL_NUMBERS_LOGS_TABLE: "serial_numbers_logs",
    PRODUCT_KEYSSI_STORAGE_TABLE: "productKeySSIs",
    BATCHES_STORAGE_TABLE: "batches",
    EPI_PROTOCOL_VERSION: "v1",
    PRODUCT_DSU_MOUNT_POINT: "/product",
    BATCH_DSU_MOUNT_POINT: "/batch",
    BATCH_STORAGE_FILE: "/batch.epi_v",
    PRODUCT_STORAGE_FILE: "/product.epi_v",
    EPI_MOUNT_PREFIX: "ePI",
    LEAFLET_XML_FILE_NAME: "info.xml",
    PRODUCT_IMAGE_FILE: "/image.png",
    HISTORY_ITEM_DEFAULT_ICON: "./assets/icons/product_image_placeholder.svg",
    LEAFLET_ATTACHMENT_FILE: "/leaflet.xml",
    SMPC_ATTACHMENT_FILE: "/smpc.xml",
    XSL_PATH: "./leaflet.xsl",
    IMPORT_LOGS: "import-logs",
    SUCCESS_MAPPING_STATUS: "success",
    FAILED_MAPPING_STATUS: "failed",
    MISSING_PRODUCT_DSU: "Missing Product DSU",
    DSU_LOAD_FAIL: "Something went wrong. Could not load DSU",
    MISSING_BATCH_DSU: "Missing Batch DSU",
    MISSING_PRODUCT_VERSION: "Missing Product Version",
    ANCHOR_CHECK_TIMEOUT: 15000,
    READ_DSU_TIMEOUT: 10000,
    EPI_TYPES: {
        LEAFLET: 'leaflet',
        PRESCRIBING_INFO: 'prescribingInfo',
        SMPC: 'smpc'
    },
    EPI_TYPES_DESCRIPTION: {
        LEAFLET: 'Patient Information',
        PRESCRIBING_INFO: 'Prescribing Information',
        SMPC: 'SMPC'
    },
    MESSAGE_TYPES: {
        PRODUCT: "Product",
        BATCH: "Batch",
        PRODUCT_PHOTO: "ProductPhoto",
        LEAFLET: "leaflet",
        PRESCRIBING_INFO: "prescribingInfo",
        SMPC: "smpc",
        VIDEO_SOURCE: "VideoSource",
        RECOVER: "Recover"
    },
    LOG_TYPES: {
        PRODUCT: "PRODUCT_LOG",
        BATCH: "BATCH_LOG",
        PRODUCT_PHOTO: "PRODUCT_PHOTO_LOG",
        LEAFLET_LOG: "LEAFLET_LOG",
        VIDEO_SOURCE: "VIDEO_LOG",
        FAILED_ACTION: "FAILED_LOG",
        RECOVER: "RECOVER_LOG"
    },
    GTIN_AVAILABILITY_STATUS: {
        OWNED: "owned",
        USED: "used",
        FREE: "free",
        UNKNOWN: "unknown"
    },
    DISABLED_FEATURES_MAP: {
        "01": {
            modelProperties: ["patientLeafletInfo"],
            description: "Patient leaflet"
        },
        "02": {
            modelProperties: ["incorrectDateCheck", "expiredDateCheck"],
            description: "Batch date validation checks"
        },
        "04": {
            modelProperties: ["practitionerInfo"],
            description: "Healthcare practitioner info"
        },
        "05": {
            modelProperties: ["videos"],
            description: "Video source"
        },
        "06": {
            modelProperties: ["adverseEventsReportingEnabled"],
            description: "Adverse Events reporting"
        },
        "07": {
            modelProperties: ["hasAcdcAuthFeature", "authFeatureFieldModel", "serialCheck"],
            description: "Anti-counterfeiting functions"
        },
        "08": {
            modelProperties: ["recalled"],
            description: "Recall functions"
        },
        "09": {
            modelProperties: ["defaultMessage"],
            description: "Batch message"
        }
    }
}

},{}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/fixed-urls/index.js":[function(require,module,exports){
(function (Buffer){(function (){
const TAG_FIXED_URL_REQUEST = "fixedurlrequest";
const INTERVAL_TIME = 1 * 1000; //ms aka 1 sec
const DEFAULT_MAX_AGE = 10; //seconds aka 10 sec
const TASKS_TABLE = "tasks";
const HISTORY_TABLE = "history";
const DATABASE = "FixedUrls.db";

const enclaveAPI = require("opendsu").loadAPI("enclave");
const fsname = "fs";
const fs = require(fsname);
const pathname = "path";
const path = require(pathname);
const logger = $$.getLogger("FixedUrl", "apihub/logger");

function getFixedUrl (server) {
    const workingDir = path.join(server.rootFolder, "external-volume", "fixed-urls");
    const storage = path.join(workingDir, "storage");
    let lightDBEnclaveClient = enclaveAPI.initialiseLightDBEnclave(DATABASE);

    let watchedUrls = [];
    //we inject a helper function that can be called by different components or middleware to signal that their requests
    // can be watched by us
    server.allowFixedUrl = function (url) {
        if (!url) {
            throw new Error("Expected an Array of strings or single string representing url prefix");
        }
        if (Array.isArray(url)) {
            watchedUrls = watchedUrls.concat(url);
            return;
        }
        watchedUrls.push(url);
    }

    function ensureURLUniformity(req) {
        let base = "https://non.relevant.url.com";
        //we add the base to get a valid url
        let url = typeof req === "object" ? req.url : req;
        let converter = new URL(base + url);
        //we ensure that the searchParams are sorted
        converter.searchParams.sort();
        //we remove our artificial base
        let newString = converter.toString().replaceAll(base, "");
        return newString;
    }

    function respond(res, content, statusCode) {
        if (statusCode) {
            res.statusCode = statusCode;
            let code = 0x104;

            if(res.req.url.includes('leaflets'))
                code = 0x102;

            if(res.req.url.includes('metadata'))
                code = 0x106;

            logger.audit(code, `Responding to url ${res.req.url} with status code ${statusCode}`);
        } else {
            let code = 0x103;

            if(res.req.url.includes('leaflets'))
                code = 0x101;

            if(res.req.url.includes('metadata'))
                code = 0x105;

            logger.audit(code, `Successful serving url ${res.req.url}`);
            res.statusCode = 200;
        }
        const fixedURLExpiry = server.config.fixedURLExpiry || DEFAULT_MAX_AGE;
        res.setHeader("cache-control", `max-age=${fixedURLExpiry}`);
        res.write(content);
        res.end();
    }

    function getIdentifier(fixedUrl) {
        return Buffer.from(fixedUrl).toString("base64url");
    }

    const indexer = {
        getFileName: function (fixedUrl) {
            return path.join(storage, getIdentifier(fixedUrl));
        },
        persist: function (fixedUrl, content, callback) {
            logger.debug("Persisting url", fixedUrl);
            fs.writeFile(indexer.getFileName(fixedUrl), content, callback);
        },
        get: function (fixedUrl, callback) {
            logger.debug("Reading url", fixedUrl);
            fs.readFile(indexer.getFileName(fixedUrl), callback);
        },
        clean: function (fixedUrl, callback) {
            logger.debug("Cleaning url", fixedUrl);
            fs.unlink(indexer.getFileName(fixedUrl), callback);
        },
        getTimestamp: function (fixedUrl, callback) {
            logger.debug("Reading timestamp for", fixedUrl);
            fs.stat(indexer.getFileName(fixedUrl), {bigint: true}, (err, stats) => {
                if (err) {
                    return callback(err);
                }
                return callback(undefined, stats.mtimeMs);
            });
        }
    };

    const taskRegistry = {
        inProgress: {},
        createModel: function (fixedUrl) {
            return {url: fixedUrl, pk: getIdentifier(fixedUrl)};
        },
        register: function (task, callback) {
            let newRecord = taskRegistry.createModel(task);
            newRecord.__fallbackToInsert = true
            return lightDBEnclaveClient.updateRecord($$.SYSTEM_IDENTIFIER, HISTORY_TABLE, newRecord.pk, newRecord,  callback);
        },
        add: function (task, callback) {
            let newRecord = taskRegistry.createModel(task);
            lightDBEnclaveClient.getRecord($$.SYSTEM_IDENTIFIER, TASKS_TABLE, newRecord.pk, function (err, record) {
                if (err || !record) {
                    return lightDBEnclaveClient.insertRecord($$.SYSTEM_IDENTIFIER, TASKS_TABLE, newRecord.pk, newRecord, (insertError)=>{
                        //if we fail... could be that the task is ready register by another request due to concurrency
                        //we do another getRecord and if fails we return the original insert record error
                        if(insertError){
                            //we set the counter to 2 just in case there is a task with a counter value that we don't know,
                            // and we hope to have enough invalidation of the task to don't have garbage
                            newRecord.counter = 2;
                            newRecord.__fallbackToInsert = true;
                            return lightDBEnclaveClient.updateRecord($$.SYSTEM_IDENTIFIER, TASKS_TABLE, newRecord.pk, newRecord, err => {
                                if(err){
                                    return callback(err);
                                }
                                callback(undefined);
                            });
                        }
                        callback(undefined);
                    });
                }
                if (!record.counter) {
                    record.counter = 0;
                }
                record.counter++;
                record.__fallbackToInsert = true;
                return lightDBEnclaveClient.updateRecord($$.SYSTEM_IDENTIFIER, TASKS_TABLE, record.pk, record, callback);
            });
        },
        remove: function (task, callback) {
            let toBeRemoved = taskRegistry.createModel(task);
            lightDBEnclaveClient.getRecord($$.SYSTEM_IDENTIFIER, TASKS_TABLE, toBeRemoved.pk, function (err, record) {
                if (err || !record) {
                    return callback(undefined);
                }
                if (record.counter && record.counter > 1) {
                    record.counter = 1;
                    record.__fallbackToInsert = true;
                    return lightDBEnclaveClient.updateRecord($$.SYSTEM_IDENTIFIER, TASKS_TABLE, toBeRemoved.pk, record, callback);
                }

                lightDBEnclaveClient.deleteRecord($$.SYSTEM_IDENTIFIER, TASKS_TABLE, toBeRemoved.pk, err => {
                    if (err) {
                        return callback(err);
                    }
                    const end = Date.now();
                    callback(undefined);
                });
            });
        },
        getOneTask: function (callback) {
            lightDBEnclaveClient.getOneRecord($$.SYSTEM_IDENTIFIER, TASKS_TABLE, function (err, task) {
                if (err) {
                    return callback(err);
                }
                if (!task) {
                    return callback(undefined);
                }
                if (taskRegistry.inProgress[task.url]) {
                    logger.debug(`${task.url} is in progress.`);
                    //we already have this task in progress, we need to wait
                    return callback(undefined);
                }
                taskRegistry.markInProgress(task.url);
                const end = Date.now();
                callback(undefined, task);
            });
        },
        isInProgress: function (task) {
            return !!taskRegistry.inProgress[task];
        },
        isScheduled: function (task, callback) {
            let tobeChecked = taskRegistry.createModel(task);
            lightDBEnclaveClient.getRecord($$.SYSTEM_IDENTIFIER, TASKS_TABLE, tobeChecked.pk, function (err, task) {
                if (err || !task) {
                    return callback(undefined, undefined);
                }
                callback(undefined, task);
            });
        },
        markInProgress: function (task) {
            taskRegistry.inProgress[task] = true;
        },
        markAsDone: function (task, callback) {
            logger.debug(`Marking task ${task} as done`);
            taskRegistry.inProgress[task] = undefined;
            delete taskRegistry.inProgress[task];
            taskRegistry.remove(task, callback);
        },
        isKnown: function (task, callback) {
            let target = taskRegistry.createModel(task);
            lightDBEnclaveClient.getRecord($$.SYSTEM_IDENTIFIER, HISTORY_TABLE, target.pk, callback);
        },
        schedule: function (criteria, callback) {
            if(server.readOnlyModeActive){
                return callback(new Error("FixedURL scheduling is not possible when server is in readOnly mode"));
            }
            lightDBEnclaveClient.filter($$.SYSTEM_IDENTIFIER, HISTORY_TABLE, criteria, function (err, records) {
                if (err) {
                    if (err.code === 404) {
                        return callback();
                    }
                    return callback(err);
                }
                function createTask() {
                    if (records.length === 0) {
                        return callback(undefined);
                    }

                    let record = records.pop();
                    taskRegistry.add(record.url, function (err) {
                        if (err) {
                            return callback(err);
                        }
                        createTask();
                    });
                }

                createTask();
            });
        },
        cancel: function (criteria, callback) {
            lightDBEnclaveClient.filter($$.SYSTEM_IDENTIFIER, HISTORY_TABLE, criteria, async function (err, tasks) {
                if (err) {
                    if (err.code === 404) {
                        return callback();
                    }
                    return callback(err);
                }

                try {
                    let markAsDone = $$.promisify(taskRegistry.markAsDone);
                    let clean = $$.promisify(indexer.clean);
                    for (let task of tasks) {
                        let url = task.url;
                        //by marking it as done the task is removed from pending and lightDBEnclaveClient also
                        await markAsDone(url);
                        try {
                            await clean(url);
                        } catch (err) {
                            //we ignore any errors related to file not found...
                            if (err.code !== "ENOENT") {
                                throw err;
                            }
                        }
                    }
                } catch (err) {
                    return callback(err);
                }

                callback(undefined);
            });
        },
        status: function () {
            if(server.readOnlyModeActive){
                //preventing log noise in readOnly mode
                return ;
            }
            let inProgressCounter = Object.keys(taskRegistry.inProgress);
            logger.debug(`Number of tasks that are in progress: ${inProgressCounter.length ? inProgressCounter.length : 0}`);

            lightDBEnclaveClient.getAllRecords($$.SYSTEM_IDENTIFIER, TASKS_TABLE, (err, scheduledTasks) => {
                if (!err) {
                    logger.debug(`Number of scheduled tasks: ${scheduledTasks ? scheduledTasks.length : 0}`);
                }
            });
            lightDBEnclaveClient.getAllRecords($$.SYSTEM_IDENTIFIER, HISTORY_TABLE, (err, tasks) => {
                if (!err) {
                    logger.debug(`Number of fixed urls: ${tasks ? tasks.length : 0}`);
                }
            });
        },
        httpStatus: async function(req, res){
            let inProgressCounter = Object.keys(taskRegistry.inProgress);
            let status = {};
            try{
                status.inProgress = inProgressCounter.length ? inProgressCounter.length : 0;
                let scheduledTasks = await $$.promisify(lightDBEnclaveClient.getAllRecords)($$.SYSTEM_IDENTIFIER, TASKS_TABLE);
                status.scheduled = scheduledTasks ? scheduledTasks.length : 0;
                let tasks = await $$.promisify(lightDBEnclaveClient.getAllRecords)($$.SYSTEM_IDENTIFIER, HISTORY_TABLE);
                status.total = tasks ? tasks.length : 0;
            }catch(err){
                console.error(err);
                res.statusCode = 500;
                res.end(`Failed to generate status info`);
            }
            res.statusCode = 200;
            res.end(JSON.stringify(status));
        }
    };
    const taskRunner = {
        doItNow: function (task) {
            logger.info("Executing task for url", task.url);
            const fixedUrl = task.url;
            //we need to do the request and save the result into the cache
            let urlBase = `http://127.0.0.1`;
            let url = urlBase;
            if (!fixedUrl.startsWith("/")) {
                url += "/";
            }
            url += fixedUrl;

            //let's create an url object from our string
            let converter = new URL(url);
            //we inject the request identifier
            converter.searchParams.append(TAG_FIXED_URL_REQUEST, "true");
            //this new url will contain our flag that prevents resolving in our middleware
            url = converter.toString().replace(urlBase, "");

            //executing the request
            server.makeLocalRequest("GET", url, "", {}, function (error, result) {
                const end = Date.now();
                if (error) {
                    logger.error("caught an error during fetching fixedUrl", error.message, error.code, error);
                    if (error.httpCode && error.httpCode > 300) {
                        //missing data
                        taskRunner.resolvePendingReq(task.url, "", error.httpCode);
                        logger.debug("Cleaning url because of the resolving error", error);
                        indexer.clean(task.url, (err) => {
                            if (err) {
                                if (err.code !== "ENOENT") {
                                    logger.error("Failed to clean url", err);
                                }
                            }
                        });
                        return taskRegistry.markAsDone(task.url, (err) => {
                            if (err) {
                                logger.log("Failed to remove a task that we weren't able to resolve");
                                return;
                            }
                        });
                    }
                    return taskRegistry.markAsDone(task.url, (err) => {
                        if (err) {
                            logger.log("Failed to remove a task that we weren't able to resolve");
                            return;
                        }
                        //if failed we add the task back to the end of the queue...
                        setTimeout(() => {
                            taskRegistry.add(task.url, (err) => {
                                if (err) {
                                    logger.log("Failed to reschedule the task", task.url, err.message, err.code, err);
                                }
                            });
                        }, 100);
                    })
                }
                //got result... we need to store it for future requests, and we need to resolve any pending request waiting for it
                if (result) {
                    //let's resolve as fast as possible any pending request for the current task
                    taskRunner.resolvePendingReq(task.url, result);

                    if (!taskRegistry.isInProgress(task.url)) {
                        logger.info("Looks that somebody canceled the task before we were able to resolve.");
                        //if somebody canceled the task before we finished the request we stop!
                        return;
                    }

                    indexer.persist(task.url, result, function (err) {
                        if (err) {
                            logger.error("Not able to persist fixed url", task, err);
                        }

                        taskRegistry.markAsDone(task.url, (err) => {
                            if (err) {
                                logger.warn("Failed to mark request as done in lightDBEnclaveClient", task);
                            }
                        });

                        //let's test if we have other tasks that need to be executed...
                        taskRunner.execute();
                    });
                } else {
                    taskRegistry.markAsDone(task.url, (err) => {
                        if (err) {
                            logger.warn("Failed to mark request as done in lightDBEnclaveClient", task);
                        }
                        taskRunner.resolvePendingReq(task.url, result, 204);
                    });
                }
            });
        },
        execute: function () {
            taskRegistry.getOneTask(function (err, task) {
                if (err || !task) {
                    return;
                }

                taskRunner.doItNow(task);
            })
        },
        pendingRequests: {},
        registerReq: function (url, req, res) {
            if (!taskRunner.pendingRequests[url]) {
                taskRunner.pendingRequests[url] = [];
            }
            taskRunner.pendingRequests[url].push({req, res});
        },
        resolvePendingReq: function (url, content, statusCode) {
            let pending = taskRunner.pendingRequests[url];
            if (!pending) {
                return;
            }
            while (pending.length > 0) {
                let delayed = pending.shift();
                try {
                    respond(delayed.res, content, statusCode);
                } catch (err) {
                    //we ignore any errors at this stage... timeouts, client aborts etc.
                }
            }
        },
        status: function () {
            if(server.readOnlyModeActive){
                //preventing log noise in readOnly mode
                return ;
            }
            let pendingReq = Object.keys(taskRunner.pendingRequests);
            let counter = 0;
            for (let pendingUrl of pendingReq) {
                if (taskRunner.pendingRequests[pendingUrl]) {
                    counter += taskRunner.pendingRequests[pendingUrl].length;
                }
            }

            logger.debug(`Number of requests that are in pending: ${counter}`);
            taskRegistry.status();
        }
    };

    if(!server.readOnlyModeActive){
        fs.mkdir(storage, {recursive: true}, (err) => {
            if (err) {
                logger.error("Failed to ensure folder structure due to", err);
            }
            lightDBEnclaveClient.createDatabase(DATABASE, (err) => {
                if (err) {
                    logger.debug("Failed to create database", err.message, err.code, err.rootCause);
                }

                lightDBEnclaveClient.hasWriteAccess($$.SYSTEM_IDENTIFIER, (err, hasAccess) => {
                    if (err) {
                        logger.error("Failed to check if we have write access", err.message, err.code, err.rootCause);
                    }

                    if (hasAccess) {
                        setInterval(taskRunner.execute, INTERVAL_TIME);
                        return;
                    }

                    lightDBEnclaveClient.grantWriteAccess($$.SYSTEM_IDENTIFIER, (err) => {
                        if (err) {
                            logger.error("Failed to grant write access to the enclave", err.message, err.code, err.rootCause);
                        }

                        lightDBEnclaveClient.createCollection($$.SYSTEM_IDENTIFIER, TASKS_TABLE, ["pk", "__timestamp"], (err) => {
                            if (err) {
                                logger.error("Failed to create collection", err.message, err.code, err.rootCause);
                            }

                            lightDBEnclaveClient.createCollection($$.SYSTEM_IDENTIFIER, HISTORY_TABLE, ["pk", "__timestamp"], (err) => {
                                if (err) {
                                    logger.error("Failed to create collection", err.message, err.code, err.rootCause);
                                }

                                setInterval(taskRunner.execute, INTERVAL_TIME);
                            });
                        });
                    })
                })
            })
        });
    }

    server.put("/registerFixedURLs", require("./utils").bodyReaderMiddleware);
    server.put("/registerFixedURLs", function register(req, res, next) {
        if (!lightDBEnclaveClient) {
            return setTimeout(() => {
                register(req, res, next);
            }, 100);
        }
        let body = req.body;
        try {
            body = JSON.parse(body);
        } catch (err) {
            logger.log(err);
        }

        if (!Array.isArray(body)) {
            body = [body];
        }

        function recursiveRegistry() {
            if (body.length === 0) {
                res.statusCode = 200;
                res.end();
                return;
            }
            let fixedUrl = body.pop();
            taskRegistry.register(fixedUrl, function (err) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    return res.end(`Failed to register url`);
                }
                recursiveRegistry();
            });
        }

        recursiveRegistry();
    });

    server.put("/activateFixedURL", require("./utils").bodyReaderMiddleware);
    server.put("/activateFixedURL", function activate(req, res, next) {
        if (!lightDBEnclaveClient) {
            return setTimeout(() => {
                activate(req, res, next);
            }, 100);
        }

        if(!Buffer.isBuffer(req.body)){
            res.statusCode = 403;
            return res.end();
        }

        taskRegistry.schedule(req.body.toString(), function (err) {
            if (err) {
                logger.error(err);
                res.statusCode = 500;
                return res.end(`Failed to schedule task`);
            }
            res.statusCode = 200;
            res.end();
        });
    });

    server.put("/deactivateFixedURL", require("./utils").bodyReaderMiddleware);
    server.put("/deactivateFixedURL", function deactivate(req, res, next) {
        if (!lightDBEnclaveClient) {
            return setTimeout(() => {
                deactivate(req, res, next);
            }, 100);
        }

        if(!Buffer.isBuffer(req.body)){
            res.statusCode = 403;
            return res.end();
        }

        taskRegistry.cancel(req.body.toString(), function (err) {
            if (err) {
                logger.error(err);
                res.statusCode = 500;
                return res.end(`Failed to cancel task`);
            }
            res.statusCode = 200;
            res.end();
        });
    });

    function getTimestampHandler(req, res, next) {
        if (["HEAD", "GET"].indexOf(req.method) === -1) {
            //not our responsibility... for the moment we resolve only GET methods that have query params...
            return next();
        }
        let possibleFixedUrl = false;
        let url = req.url;

        if (req.method === "GET" && !url.startsWith("/mtime")) {
            //not our responsibility...
            return next();
        }

        if (req.method === "GET") {
            url = url.replace("/mtime", "");
        }

        for (let wUrl of watchedUrls) {
            if (url.startsWith(wUrl)) {
                possibleFixedUrl = true;
            }
        }

        if (!possibleFixedUrl) {
            //not our responsibility
            return next();
        }

        let fixedUrl = ensureURLUniformity(url);
        indexer.getTimestamp(fixedUrl, function (err, timestamp) {
            if (err) {
                //for any errors we try to invalidate any cache
                timestamp = Date.now() - 1000;
            }
            res.setHeader("ETag", timestamp);
            if (req.method === "GET") {
                res.write(timestamp.toString());
            }
            res.statusCode = 200;
            res.end();

        });
    }


    //register a middleware to intercept all the requests
    server.use("*", function (req, res, next) {

        if (req.method !== "GET") {
            //not our responsibility... for the moment we resolve only GET methods that have query params...
            return next();
        }

        let possibleFixedUrl = false;
        for (let url of watchedUrls) {
            if (req.url.startsWith(url)) {
                possibleFixedUrl = true;
            }
        }

        if (!possibleFixedUrl) {
            //not our responsibility
            return next();
        }


        if (req.query && req.query[TAG_FIXED_URL_REQUEST]) {
            //this TAG_FIXED_URL_REQUEST query param is set by our runner, and we should let this request to be executed
            return next();
        }

        //if we reached this line of code means that we need to do our "thing"
        let fixedUrl = ensureURLUniformity(req);
        if (taskRegistry.isInProgress(fixedUrl)) {
            //there is a task for it... let's wait
            return taskRunner.registerReq(fixedUrl, req, res);
        }

        function resolveURL() {
            taskRegistry.isScheduled(fixedUrl, (err, task) => {
                if (task) {
                    logger.debug(`There is a scheduled task for this ${fixedUrl}`);
                    taskRunner.registerReq(fixedUrl, req, res);
                    taskRegistry.markInProgress(fixedUrl);
                    taskRunner.doItNow(task);
                    return;
                }

                taskRegistry.isKnown(fixedUrl, (err, known) => {
                    if (known) {
                        //there is no task in progress for this url... let's test even more...
                        return indexer.get(fixedUrl, (err, content) => {
                            if (err) {
                                logger.warn(`Failed to load content for fixedUrl; highly improbable, check your configurations!`);
                                //no current task and no cache... let's move on to resolving the req
                                return next();
                            }
                            //known fixed url let's respond to the client
                            respond(res, content);
                        });
                    }
                    next();
                });
            });
        }

        taskRegistry.isKnown(fixedUrl, (err, known) => {
            //if reached this point it might be a fixed url that is not known yet, and it should get registered and scheduled for resolving...
            //this case could catch params combinations that are not captured...

            if(server.readOnlyModeActive){
                //this case of readOnlyModeActive needs to be handled carefully in order to prevent any writes possible
                if(known){
                    return indexer.get(fixedUrl, (err, content) => {
                        if (err) {
                            logger.warn(`Failed to load content for fixedUrl; This could happen when the task is not yet resolved by full container`);
                            //no current task and no cache... let's move on to resolving the req
                            return next();
                        }
                        //known fixed url let's respond to the client
                        respond(res, content);
                    });
                }else{
                    return next();
                }
            }

            if (!known) {
                return taskRegistry.register(fixedUrl, (err) => {
                    if (err) {
                        //this should not happen... but even if it happens we log and go on with the execution
                        console.error(err);
                    }
                    taskRegistry.add(fixedUrl, (err) => {
                        if (err) {
                            //this should not happen... but even if it happens we log and go on with the execution
                            console.error(err);
                        }
                        resolveURL();
                    });
                });
            }
            resolveURL();
        });
    });
    server.use("*", getTimestampHandler);
    server.get("/mtime/*", getTimestampHandler);
    server.get("/statusFixedURL", taskRegistry.httpStatus);
}

module.exports.getFixedUrl = getFixedUrl;
}).call(this)}).call(this,require("buffer").Buffer)

},{"./utils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/fixed-urls/utils/index.js","buffer":false,"opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/fixed-urls/utils/index.js":[function(require,module,exports){
(function (Buffer){(function (){
function bodyReaderMiddleware(req, res, next) {
    const data = [];

    req.on('data', (chunk) => {
        data.push(chunk);
    });

    req.on('end', () => {
        req.body = Buffer.concat(data);
        next();
    });
}

module.exports = {
    bodyReaderMiddleware
};
}).call(this)}).call(this,require("buffer").Buffer)

},{"buffer":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/gtinOwner/index.js":[function(require,module,exports){
const GTIN_SSI = require("../GTIN_SSI");
const path = require("path");
const fs = require('fs');
const CACHE_FILE = "gtinOwners";
function getGTINOwner(server) {
  if (server.allowFixedUrl) {
    //let's make the fixedURL middleware aware of our endpoints
    server.allowFixedUrl("/gtinOwner/");
  }

  const logger = $$.getLogger("gtinOwner", "getGtinOwner");
  const lokiEnclaveFacadeModule = require("loki-enclave-facade");
  const createLokiEnclaveFacadeInstance = lokiEnclaveFacadeModule.createLokiEnclaveFacadeInstance;
  const cachePath = path.join(server.rootFolder, "external-volume", "gtinOwner", "cache");

  const DATABASE_PERSISTENCE_TIMEOUT = 100;
  let database;

  if(!server.readOnlyModeActive){
    try {
      fs.accessSync(cachePath);
    } catch (e) {
      fs.mkdirSync(cachePath, {recursive: true});
    }
    database = createLokiEnclaveFacadeInstance(path.join(cachePath, CACHE_FILE), DATABASE_PERSISTENCE_TIMEOUT, lokiEnclaveFacadeModule.Adapters.PARTITIONED);
  }

  const GTIN_OWNERS_TABLE = "gtinOwners";
  async function getGtinOwnerHandler(request, response) {
    let epiDomain = request.params.epiDomain;
    const isValidDomain = require("swarmutils").isValidDomain;
    if(!isValidDomain(epiDomain)) {
      logger.error("Domain validation failed", epiDomain);
      response.statusCode = 400;
      return response.end("Fail");
    }
    let gtin = request.params.gtin;
    const url = `/gtinOwner/${epiDomain}/${gtin}`;
    let gtinOwnerDomain;
    try {
      if(database){
        gtinOwnerDomain = await $$.promisify(database.getRecord)(undefined, GTIN_OWNERS_TABLE, url);
      }
    } catch (e) {
      //exceptions on getting records from db are handled bellow
    }
    if (typeof gtinOwnerDomain !== "undefined") {

      try {
        let dbObj = JSON.parse(gtinOwnerDomain);
        if (dbObj.domain) {
          return sendResponse(response, 200, gtinOwnerDomain);
        }
      } catch (e) {
        //db record is invalid; continue with resolving request
      }

    }
    const openDSU = require("opendsu");

    const gtinSSI = GTIN_SSI.createGTIN_SSI(epiDomain, undefined, gtin);
    const anchoring = openDSU.loadAPI("anchoring");
    const anchoringx = anchoring.getAnchoringX();
    anchoringx.getLastVersion(gtinSSI, async (err, latestHashLink) => {
      if (err) {
        logger.info(0x103, `Failed to get last version for SSI <${gtinSSI.getIdentifier()}>`, err.message);
        response.statusCode = 500;
        response.end("Failed to get last version for SSI");
        return;
      }

      if(!latestHashLink){
        logger.info(0x103, `Gtin not found`);
        sendResponse(response, 404, "");
        return;
      }

      const keySSISpace = require("opendsu").loadAPI("keyssi");
      if (typeof latestHashLink === "string") {
        try {
          latestHashLink = keySSISpace.parse(latestHashLink);
        } catch (e) {
          logger.info(0x103, `Failed to parse hashlink <${latestHashLink}>`, e.message);
          response.statusCode = 500;
          response.end("Failed to parse the latest hashLink");
          return;
        }
      }

      gtinOwnerDomain = JSON.stringify({
        domain: latestHashLink.getDLDomain(),
      });

      if(!server.readOnlyModeActive){
        try {
          await $$.promisify(database.insertRecord)(undefined, GTIN_OWNERS_TABLE, url, gtinOwnerDomain);
        } catch (e) {
          logger.info(0x0, `Failed to cache gtinOwnerDomain `, e.message);
          //failed to cache; continue without caching
        }
      }

      sendResponse(response, 200, gtinOwnerDomain);
    })
  }
  server.get("/gtinOwner/:epiDomain/:gtin", getGtinOwnerHandler);
  server.get("/gtinOwner/:epiDomain/:gtin/:subdomain", function(req, res){
    let url = req.url.replace(`/${req.params.subdomain}`, "");
    logger.debug("Local resolving of gtinOwner without the extra params");
    return server.makeLocalRequest("GET", url, (err, content)=>{
      if(err){
        logger.error(0x100, err.message);
        return sendResponse(res, 529, `Server busy finding gtinOwner` );
      }
      logger.debug(0x100, "Successfully returned gtinOwner info after local redirect");
      return sendResponse(res, 200, content);
    });
  });
}

function sendResponse(response, statusCode, message) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "text/plain");
  response.end(message);
}

module.exports.getGTINOwner = getGTINOwner;

},{"../GTIN_SSI":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/GTIN_SSI.js","fs":false,"loki-enclave-facade":false,"opendsu":false,"path":false,"swarmutils":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/healthCheckAPIs/constants.js":[function(require,module,exports){
module.exports = {
    HEALTH_CHECK_STATUSES : {
        IN_PROGRESS: "in_progress",
        SUCCESS: "success",
        FAILED: "failed",
        REPAIRED: "repaired",
        FAILED_REPAIR: "failed_repair",
        NEVER_EXECUTED: "never_executed"
    },
    HEALTH_CHECK_TABLE: "health_check",
    HEALTH_CHECK_COMPONENTS: {
        SECRETS: "secrets",
        // SYSTEM_HEALTH: "systemHealth",
        // INSTALL_INFO: "installInfo",
        // CONFIGS_INFO: "configsInfo",
        // WALLETS: "wallets",
        BRICKING: "bricking",
        ANCHORING: "anchoring"
        // DATABASES: "databases",
        // PRODUCTS: "products",
        // BATCHES: "batches"
    },
    HEALTH_CHECK_ACTIONS: {
        START: "start",
        STATUS: "status"
    },
    FAILURE_ACTIONS: {
        DELETE: "delete",
        CORRUPT: "corrupt"
    }
}
},{}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/healthCheckAPIs/controllers/APIClient.js":[function(require,module,exports){
const http = require("opendsu").loadAPI("http");
function APIClient() {
    const baseUrl = require("opendsu").loadAPI("system").getBaseURL();
    this.fetchEndpoint = async function (endpoint, options = {}) {
        const response = await http.fetch(`${baseUrl}${endpoint}`, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    };

    this.checkInstallInfo = async function () {
        return this.fetchEndpoint('/maintenance/installInfo', {method: "GET"});
    };

    this.checkSystemHealth = async function () {
        return this.fetchEndpoint('/maintenance/systemHealth', {method: "GET"});
    };

    this.checkConfigsInfo = async function () {
        return this.fetchEndpoint('/maintenance/configsInfo', {method: "GET"});
    };

    this.checkWallets = async function () {
        return this.fetchEndpoint('/maintenance/checkWallets', {method: "GET"});
    };

    this.getCheckStatus = async function (healthCheckId, checkType) {
        let endpoint = `/maintenance/checkStatus/${healthCheckId}`;
        // if checkType is provided, append it to the endpoint as a query parameter
        if (checkType) {
            endpoint += `?checkType=${checkType}`;
        }
        return this.fetchEndpoint(endpoint, {method: "GET"});
    }

    this.postEndpoint = async function (endpoint, body) {
        const response = await http.fetch(`${baseUrl}${endpoint}`, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    };

    this.checkSecrets = async function (healthCheckId) {
        return this.postEndpoint('/maintenance/checkSecrets', {healthCheckId});
    };

    this.checkAnchoring = async function (healthCheckId) {
        return this.postEndpoint('/maintenance/checkAnchoring', {healthCheckId});
    };

    this.checkBricking = async function (healthCheckId) {
        return this.postEndpoint('/maintenance/checkBricking', {healthCheckId});
    };

    this.checkDatabases = async function (healthCheckId) {
        return this.postEndpoint('/maintenance/checkDatabases', {healthCheckId, tables: [
                "audit",
                "products",
                "batches",
                "user-access"
            ]
        });
    };

    this.checkProducts = async function (healthCheckId) {
        return this.postEndpoint('/maintenance/checkProducts', {healthCheckId});
    };

    this.checkBatches = async function (healthCheckId) {
        return this.postEndpoint('/maintenance/checkBatches', {healthCheckId});
    };

    this.startHealthCheck = async function () {
        return this.postEndpoint('/maintenance/startHealthCheck');
    }

    this.generateFailure = async function (component, action, args) {
        const endpoint = '/maintenance/generateFailure';
        const body = {
            component,
            action,
            args
        };
        const response = await fetch(`${baseUrl}${endpoint}`, {
            method: "DELETE",
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    }

    this.getIterationsMetadata = async function (start, number, sort, query) {
        let endpoint = `/maintenance/getIterationsMetadata?start=${start}&number=${number}&sort=${sort}&query=${query}`
        return this.fetchEndpoint(endpoint, {method: "GET"});

    }
}

function getInstance() {
    return new APIClient();
}

module.exports = {
    getInstance
};

},{"opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/healthCheckAPIs/controllers/FailuresRegistry.js":[function(require,module,exports){
const registry = {};

function FailureRegistry() {}

FailureRegistry.prototype.registerFailure = (component, action, failureFunction) => {
    if (!registry[component]) {
        registry[component] = {};
    }
    registry[component][action] = failureFunction;
};

FailureRegistry.prototype.execute =  async (component, action, ...args) => {
    if (!registry[component] || !registry[component][action]) {
        throw new Error(`No failure function registered for component: ${component}, action: ${action}`);
    }
    await registry[component][action](...args);
};

module.exports = FailureRegistry;
const constants = require("../constants.js");
const fs = require("fs").promises;

const openDSU = require("opendsu");
const keySSISpace = openDSU.loadAPI("keyssi");
const getDomainFromSSI = (ssi) => {
    const keySSI = keySSISpace.parse(ssi);
    return keySSI.getDLDomain();
}

const getAnchorPath = (rootFolder, anchor) => {
    return `${rootFolder}/external-volume/domains/${getDomainFromSSI(anchor)}/anchors/${anchor}`;
}

const getBrickPathFromHashlink = (rootFolder, hashLink) => {
    const parsedHashLink = keySSISpace.parse(hashLink);
    const domain = parsedHashLink.getDLDomain();
    const brick = parsedHashLink.getHash();
    return `${rootFolder}/external-volume/domains/${domain}/brick-storage/${brick.substring(0, 2)}/${brick}`;
}

const getAnchorVersions = async (rootFolder, anchor) => {
    const anchorPath = getAnchorPath(rootFolder, anchor);
    const anchorContent = await fs.readFile(anchorPath);
    const anchorVersions = anchorContent.toString().split("\n");
    anchorVersions.pop();
    return anchorVersions;
}

const listDomains = async (rootFolder) => {
    const domainsPath = `${rootFolder}/external-volume/domains`;
    return await fs.readdir(domainsPath);
}

const getBrickPath = async (rootFolder, brick) => {
    const domains = await listDomains(rootFolder);
    for (let i = 0; i < domains.length; i++) {
        const domain = domains[i];
        const brickPath = `${rootFolder}/external-volume/domains/${domain}/brick-storage/${brick.substring(0, 2)}/${brick}`;
        try {
            await fs.access(brickPath);
            return brickPath;
        } catch (e) {
            // brick not found in this domain
        }
    }
}

FailureRegistry.prototype.registerFailure(constants.HEALTH_CHECK_COMPONENTS.ANCHORING, constants.FAILURE_ACTIONS.DELETE, async (rootFolder, anchorsToCorrupt) => {
    for (let i = 0; i < anchorsToCorrupt.length; i++) {
        const anchorVersions = await getAnchorVersions(rootFolder, anchorsToCorrupt[i]);
        const lastAnchorVersion = anchorVersions[anchorVersions.length - 1];
        const brickMapPath = getBrickPathFromHashlink(rootFolder, lastAnchorVersion);
        await fs.unlink(brickMapPath);
    }
})

FailureRegistry.prototype.registerFailure(constants.HEALTH_CHECK_COMPONENTS.ANCHORING, constants.FAILURE_ACTIONS.CORRUPT, async (rootFolder, anchorsToCorrupt) => {
    for (let i = 0; i < anchorsToCorrupt.length; i++) {
        const anchorPath = getAnchorPath(rootFolder, anchorsToCorrupt[i]);
        await fs.appendFile(anchorPath, "corrupted");
    }
})

FailureRegistry.prototype.registerFailure(constants.HEALTH_CHECK_COMPONENTS.BRICKING, constants.FAILURE_ACTIONS.CORRUPT, async (rootFolder, bricksToCorrupt) => {
    for (let i = 0; i < bricksToCorrupt.length; i++) {
        const brickPath = await getBrickPath(rootFolder, bricksToCorrupt[i]);
        await fs.writeFile(brickPath, "corrupted");
    }
})

const getSecretContainerPath = (rootFolder, secretContainer) => {
    return `${rootFolder}/external-volume/secrets/${secretContainer}.secret`;
}

FailureRegistry.prototype.registerFailure(constants.HEALTH_CHECK_COMPONENTS.SECRETS, constants.FAILURE_ACTIONS.CORRUPT, async (rootFolder, secretsContainersToCorrupt) => {
    for (let i = 0; i < secretsContainersToCorrupt.length; i++) {
        const secretContainerPath = getSecretContainerPath(rootFolder, secretsContainersToCorrupt[i]);
        await fs.appendFile(secretContainerPath, "corrupted");
    }
})

module.exports = FailureRegistry;

},{"../constants.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/healthCheckAPIs/constants.js","fs":false,"opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/healthCheckAPIs/controllers/StatusController.js":[function(require,module,exports){
const openDSU = require('opendsu');
const keySSISpace = openDSU.loadAPI("keyssi");
const crypto = openDSU.loadAPI('crypto');
const enclave = openDSU.loadAPI('enclave');
const baseURL = openDSU.loadAPI('system').getBaseURL();
const constants = require('../constants');
const dbName = "demiurge";
const lightDBEnclaveClient = enclave.initialiseLightDBEnclave(dbName);
const https = require('https');
const {URL} = require('url');
const path = require("path");
const {promises: fs} = require("fs");
const {makeRequest, generatePk} = require("../utils");
const urlModule = require("url");
const apiClient = require("../controllers/APIClient").getInstance();
const HEALTH_CHECK_TABLE = constants.HEALTH_CHECK_TABLE;
const Tasks = constants.HEALTH_CHECK_COMPONENTS;
const Status = constants.HEALTH_CHECK_STATUSES;

function getRandomResult() {
    const randomNum = Math.random();
    return randomNum < 0.8 ? constants.HEALTH_CHECK_STATUSES.SUCCESS : constants.HEALTH_CHECK_STATUSES.FAILED;
}

function getRandomRepairStatus() {
    const randomNum = Math.random();
    return randomNum < 0.8 ? constants.HEALTH_CHECK_STATUSES.REPAIRED : constants.HEALTH_CHECK_STATUSES.FAILED_REPAIR;
}

function StatusController(server) {
    this.fixSecrets = () => {
        return getRandomRepairStatus();
    }
    this.getInstallInfo = () => {
        return {
            name: constants.HEALTH_CHECK_COMPONENTS.INSTALL_INFO,
            status: getRandomResult(),
            date: Date.now(),
            logs: "LOG      0x00  2024-07-10T05:54:10.454Z apihub/logg Logger      GET:/demiurge/assets/images/icons/arrow-right-short.svg 200 6.91ms\n" +
                "LOG      0x00  2024-07-10T05:54:10.455Z apihub/logg Logger      GET:/demiurge/assets/images/icons/menu-groups.svg 200 6.468ms\n" +
                "LOG      0x00  2024-07-10T05:54:10.456Z apihub/logg Logger      GET:/demiurge/assets/images/icons/menu-my-identities.svg 200 5.915ms\n" +
                "LOG      0x00  2024-07-10T05:54:10.456Z apihub/logg Logger      GET:/demiurge/assets/images/icons/menu-api-key.svg 200 5.199ms\n" +
                "LOG      0x00  2024-07-10T05:54:10.456Z apihub/logg Logger      GET:/demiurge/assets/images/icons/menu-audit.svg 200 4.732ms\n" +
                "LOG      0x00  2024-07-10T05:54:10.457Z apihub/logg Logger      GET:/demiurge/assets/images/icons/menu-system-status.svg 200 4.707ms\n" +
                "DEBUG    0x00  2024-07-10T05:54:10.457Z overwrite-r Logger      WARN     0x00  2024-07-10T05:54:10.457Z apihub"
        };
    }
    this.getSystemHealthInfo = () => {
        return {
            name: constants.HEALTH_CHECK_COMPONENTS.SYSTEM_HEALTH,
            status: getRandomResult(),
            date: Date.now(),
            logs: "LOG      0x00  2024-07-10T05:54:10.454Z apihub/logg Logger      GET:/demiurge/assets/images/icons/arrow-right-short.svg 200 6.91ms\n" +
                "LOG      0x00  2024-07-10T05:54:10.455Z apihub/logg Logger      GET:/demiurge/assets/images/icons/menu-groups.svg 200 6.468ms\n" +
                "LOG      0x00  2024-07-10T05:54:10.456Z apihub/logg Logger      GET:/demiurge/assets/images/icons/menu-my-identities.svg 200 5.915ms\n" +
                "LOG      0x00  2024-07-10T05:54:10.456Z apihub/logg Logger      GET:/demiurge/assets/images/icons/menu-api-key.svg 200 5.199ms\n" +
                "LOG      0x00  2024-07-10T05:54:10.456Z apihub/logg Logger      GET:/demiurge/assets/images/icons/menu-audit.svg 200 4.732ms\n" +
                "LOG      0x00  2024-07-10T05:54:10.457Z apihub/logg Logger      GET:/demiurge/assets/images/icons/menu-system-status.svg 200 4.707ms\n" +
                "DEBUG    0x00  2024-07-10T05:54:10.457Z overwrite-r Logger      WARN     0x00  2024-07-10T05:54:10.457Z apihub"
        };
    }
    this.getConfigsInfo = () => {
        return {
            name: constants.HEALTH_CHECK_COMPONENTS.CONFIGS_INFO,
            status: getRandomResult(),
            date: Date.now(),
            logs: "LOG      0x00  2024-07-10T05:54:10.454Z apihub/logg Logger      GET:/demiurge/assets/images/icons/arrow-right-short.svg 200 6.91ms\n" +
                "LOG      0x00  2024-07-10T05:54:10.455Z apihub/logg Logger      GET:/demiurge/assets/images/icons/menu-groups.svg 200 6.468ms\n" +
                "LOG      0x00  2024-07-10T05:54:10.456Z apihub/logg Logger      GET:/demiurge/assets/images/icons/menu-my-identities.svg 200 5.915ms\n" +
                "LOG      0x00  2024-07-10T05:54:10.456Z apihub/logg Logger      GET:/demiurge/assets/images/icons/menu-api-key.svg 200 5.199ms\n" +
                "LOG      0x00  2024-07-10T05:54:10.456Z apihub/logg Logger      GET:/demiurge/assets/images/icons/menu-audit.svg 200 4.732ms\n" +
                "LOG      0x00  2024-07-10T05:54:10.457Z apihub/logg Logger      GET:/demiurge/assets/images/icons/menu-system-status.svg 200 4.707ms\n" +
                "DEBUG    0x00  2024-07-10T05:54:10.457Z overwrite-r Logger      WARN     0x00  2024-07-10T05:54:10.457Z apihub"
        }
    }
    this.checkWallets = () => {
        return {
            name: constants.HEALTH_CHECK_COMPONENTS.WALLETS,
            status: getRandomResult(),
            date: Date.now(),
            logs: "LOG      0x00  2024-07-10T05:54:10.454Z apihub/logg Logger      GET:/demiurge/assets/images/icons/arrow-right-short.svg 200 6.91ms\n" +
                "LOG      0x00  2024-07-10T05:54:10.455Z apihub/logg Logger      GET:/demiurge/assets/images/icons/menu-groups.svg 200 6.468ms\n" +
                "LOG      0x00  2024-07-10T05:54:10.456Z apihub/logg Logger      GET:/demiurge/assets/images/icons/menu-my-identities.svg 200 5.915ms\n" +
                "LOG      0x00  2024-07-10T05:54:10.456Z apihub/logg Logger      GET:/demiurge/assets/images/icons/menu-api-key.svg 200 5.199ms\n" +
                "LOG      0x00  2024-07-10T05:54:10.456Z apihub/logg Logger      GET:/demiurge/assets/images/icons/menu-audit.svg 200 4.732ms\n" +
                "LOG      0x00  2024-07-10T05:54:10.457Z apihub/logg Logger      GET:/demiurge/assets/images/icons/menu-system-status.svg 200 4.707ms\n" +
                "DEBUG    0x00  2024-07-10T05:54:10.457Z overwrite-r Logger      WARN     0x00  2024-07-10T05:54:10.457Z apihub"
        }
    }
    this.fixWallet = () => {
        return getRandomRepairStatus();
    }

    function getComponentPk(healthCheckPK, componentName) {
        return healthCheckPK + "_" + componentName;
    }

    const markNeverExecutedCheck = async (checkType, healthCheckId) => {
        const record = await $$.promisify(lightDBEnclaveClient.getRecord)($$.SYSTEM_IDENTIFIER, HEALTH_CHECK_TABLE, healthCheckId);
        await $$.promisify(lightDBEnclaveClient.insertRecord)($$.SYSTEM_IDENTIFIER, healthCheckId, componentPk, {
            data: {
                status: Status.NEVER_EXECUTED,
                name: checkType
            }
        });
    };

    const initiateCheck = async (checkType, healthCheckId) => {
        await $$.promisify(lightDBEnclaveClient.insertRecord)($$.SYSTEM_IDENTIFIER, checkType, healthCheckId, {
            status: Status.IN_PROGRESS,
            name: checkType
        });
    }

    const markCheckCompletion = async (checkType, healthCheckId, checkData) => {
        await $$.promisify(lightDBEnclaveClient.updateRecord)($$.SYSTEM_IDENTIFIER, checkType, healthCheckId, checkData);
    }

    const getSecretsStatus = (secretsReport) => {
        if (secretsReport.corruptSecrets.fixable.length > 0 || secretsReport.corruptSecrets.notFixable.length > 0) {
            return Status.FAILED;
        }

        return Status.SUCCESS;
    }

    this.checkSecrets = async (req, res) => {
        let checkId = req.body.healthCheckId;
        if (!checkId) {
            checkId = Date.now().toString();
        }
        await initiateCheck(Tasks.SECRETS, checkId);
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/plain");
        res.end(checkId);
        const encryptionKeys = process.env.SSO_SECRETS_ENCRYPTION_KEY ? process.env.SSO_SECRETS_ENCRYPTION_KEY.split(",") : undefined;
        let encryptionKey = encryptionKeys ? encryptionKeys[0].trim() : undefined;
        encryptionKey = $$.Buffer.from(encryptionKey, "base64");
        const secretsPath = path.join(server.rootFolder, "external-volume", "secrets");
        const secretsFiles = await fs.readdir(secretsPath);
        const report = {
            corruptSecrets: {
                fixable: [],
                notFixable: []
            }
        }
        for (let i = 0; i < secretsFiles.length; i++) {
            const secretFile = secretsFiles[i];
            const secretPath = path.join(secretsPath, secretFile);
            const secretContent = await fs.readFile(secretPath);
            try {
                crypto.decrypt(secretContent, encryptionKey);
            } catch (e) {
                // remove extension from secret file
                const extensionIndex = secretFile.lastIndexOf(".");
                const secretsContainer = secretFile.substring(0, extensionIndex);
                const obj = {
                    secretsContainer,
                    reason: "Failed to decrypt secrets container"
                }
                report.corruptSecrets.fixable.push(obj);
            }
        }

        let result = {
            status: getSecretsStatus(report),
            healthCheckId: checkId
        }
        result.report = report;
        await markCheckCompletion(Tasks.SECRETS, checkId, result);
    }

    function isArraySuffix(a, b) {
        // Step 1: Check if 'b' is longer than 'a'
        if (b.length > a.length) {
            return false;
        }

        // Step 2: Calculate the starting index 'k' in 'a'
        let k = a.length - b.length;

        // Step 3: Compare elements from 'a[k]' to 'a[a.length - 1]' with 'b'
        for (let i = 0; i < b.length; i++) {
            if (a[k + i] !== b[i]) {
                return false;
            }
        }

        return true;
    }

    const checkAnchorsForDomain = async (domain) => {
        const domainPath = path.join(server.rootFolder, "external-volume", "domains", domain);
        const anchorsPath = path.join(domainPath, "anchors");
        const anchorFiles = await fs.readdir(anchorsPath);
        let report;
        for (let i = 0; i < anchorFiles.length; i++) {
            const anchorFile = anchorFiles[i];
            const anchorPath = path.join(anchorsPath, anchorFile);
            const anchorContent = await fs.readFile(anchorPath);
            const lines = anchorContent.toString().split("\n");
            //remove the last line if it is empty
            if (lines[lines.length - 1] === "") {
                lines.pop();
            }
            const missingBrickMaps = [];
            for (let j = 0; j < lines.length; j++) {
                const encodedHashLink = lines[j];
                if (encodedHashLink === "") {
                    const obj = {
                        anchor: anchorFile,
                        reason: "Empty hashlink",
                        line: j
                    }
                    if (!report) {
                        report = {
                            corruptAnchors: {
                                fixable: [],
                                notFixable: []
                            }
                        }
                    }
                    report.corruptAnchors.notFixable.push(obj);
                    // break from the second loop
                    break;
                }
                const decodedHashLink = crypto.decodeBase58(encodedHashLink).toString();
                let signedHashlinkSSI;
                try {
                    signedHashlinkSSI = keySSISpace.parse(decodedHashLink);
                } catch (e) {
                    const obj = {
                        anchor: anchorFile,
                        reason: `Failed to parse hashlink ${decodedHashLink}`,
                        line: j
                    }
                    if (!report) {
                        report = {
                            corruptAnchors: {
                                fixable: [],
                                notFixable: []
                            }
                        }
                    }
                    report.corruptAnchors.notFixable.push(obj);
                    break;
                }
                const originalHash = signedHashlinkSSI.getHash();
                let hash = originalHash;
                let counter = 0;
                let found = false;
                while (counter < 5 && !found) {
                    const hashPrefix = hash.substring(0, 2);
                    const brickPath = path.join(domainPath, "brick-storage", hashPrefix, originalHash);
                    try {
                        await fs.access(brickPath);
                        found = true;
                    } catch (e) {
                        if (e.code === "ENOENT") {
                            counter++;
                            // change the case of the hash to accommodate for case-sensitive file systems
                            if (counter === 1) {
                                hash = hash.substring(0, 1).toLowerCase() + hash.substring(1, 2).toUpperCase() + hash.substring(2);
                            } else if (counter === 2) {
                                hash = hash.substring(0, 1).toUpperCase() + hash.substring(1, 2).toLowerCase() + hash.substring(2);
                            } else if (counter === 3) {
                                hash = hash.toLowerCase();
                            } else {
                                hash = hash.toUpperCase();
                            }
                        } else {
                            const obj = {
                                anchor: anchorFile,
                                reason: `Error accessing brickPath ${brickPath}`,
                                line: j
                            }
                            if (!report) {
                                report = {
                                    corruptAnchors: {
                                        fixable: [],
                                        notFixable: []
                                    }
                                }
                            }
                            report.corruptAnchors.notFixable.push(obj);
                            break;
                        }
                    }
                }
                if (!found) {
                    missingBrickMaps.push(encodedHashLink);
                }

                // if the missing brickmaps are at the end of the anchor file, the anchor file can be fixed
                if (missingBrickMaps.length > 0) {
                    if (isArraySuffix(lines, missingBrickMaps)) {
                        const obj = {
                            anchor: anchorFile,
                            reason: `Missing brickMaps at the end of the anchor file`,
                            line: lines.length - missingBrickMaps.length,
                            missingBrickMaps: missingBrickMaps
                        }
                        if (!report) {
                            report = {
                                corruptAnchors: {
                                    fixable: [],
                                    notFixable: []
                                }
                            }
                        }
                        report.corruptAnchors.fixable.push(obj);
                    }
                }

            }
        }
        return report;
    }

    const getStatusForAnchorReport = (report) => {
        for (let domain in report) {
            if (report[domain].corruptAnchors && (report[domain].corruptAnchors.notFixable.length > 0 || report[domain].corruptAnchors.fixable.length > 0)) {
                return Status.FAILED;
            }
        }

        return Status.SUCCESS;
    }

    this.checkAnchoring = async (req, res) => {
        let checkId = req.body.healthCheckId;
        if (!checkId) {
            checkId = Date.now().toString();
        }
        await initiateCheck(Tasks.ANCHORING, checkId);
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/plain");
        res.end(checkId);
        const domainsPath = path.join(server.rootFolder, "external-volume", "domains");
        try {
            await fs.access(domainsPath);
        } catch (e) {
            console.error(e);
            res.statusCode = 500;
            res.end(`Error`);
            return;
        }
        const domains = await fs.readdir(domainsPath);
        const reports = {};
        let hasErrors = false;
        for (let i = 0; i < domains.length; i++) {
            const domain = domains[i];
            try {
                const report = await checkAnchorsForDomain(domain);
                reports[domain] = report || "";
            } catch (e) {
                reports[domain] = e;
                hasErrors = true;
            }

        }

        let result = {
            status: hasErrors ? Status.FAILED : getStatusForAnchorReport(reports),
            healthCheckId: checkId
        }
        result.report = reports;
        await markCheckCompletion(Tasks.ANCHORING, checkId, result);
    }

    const checkBrickingForDomain = async (domain) => {
        const domainPath = path.join(server.rootFolder, "external-volume", "domains", domain);
        const bricksPath = path.join(domainPath, "brick-storage");
        const bricksSubfolders = await fs.readdir(bricksPath);
        const corruptBricks = [];
        // iterate over each subfolder
        for (let i = 0; i < bricksSubfolders.length; i++) {
            const subfolder = bricksSubfolders[i];
            const subfolderPath = path.join(bricksPath, subfolder);
            const brickFiles = await fs.readdir(subfolderPath);
            // iterate over each brick file
            for (let j = 0; j < brickFiles.length; j++) {
                const brickFile = brickFiles[j];
                const brickPath = path.join(subfolderPath, brickFile);
                try {
                    await fs.access(brickPath);
                    const brickContent = await fs.readFile(brickPath);
                    // compute content hash
                    const hash = crypto.sha256(brickContent);
                    if (hash !== brickFile) {
                        corruptBricks.push({
                            brick: brickFile,
                            reason: "Invalid hash"
                        });
                    }
                } catch (e) {
                    if (e.code === "ENOENT") {
                        corruptBricks.push({
                            brick: brickFile,
                            reason: "File not found"
                        });
                    }
                }
            }
        }
        return corruptBricks;
    }

    const getBrickingStatus = async (brickingReport) => {
        for (let domain in brickingReport) {
            if (brickingReport[domain].length > 0) {
                return Status.FAILED;
            }
        }

        return Status.SUCCESS;
    }

    this.checkBricking = async (req, res) => {
        let checkId = req.body.healthCheckId;
        if (!checkId) {
            checkId = Date.now().toString();
        }
        await initiateCheck(Tasks.BRICKING, checkId);
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/plain");
        res.end(checkId);
        const domainsPath = path.join(server.rootFolder, "external-volume", "domains");
        const domains = await fs.readdir(domainsPath);
        const reports = {};
        let hasErrors = false;
        for (let i = 0; i < domains.length; i++) {
            const domain = domains[i];
            try {
                const report = await checkBrickingForDomain(domain);
                reports[domain] = report || "";
            } catch (e) {
                reports[domain] = e;
                hasErrors = true;
            }
        }

        const status = hasErrors ? Status.FAILED : await getBrickingStatus(reports);
        let result = {
            status: status,
            healthCheckId: checkId,
            report: reports
        };
        await markCheckCompletion(Tasks.BRICKING, checkId, result);
    }

    this.checkDatabases = async (req, res) => {
        if (typeof req.body !== 'object') {
            res.status(400).json({ error: "Invalid request body format" });
            return;
        }

        const tables = Array.isArray(req.body.tables) ? req.body.tables : [];
        const checkId = typeof req.body.healthCheckId === 'string' ? req.body.healthCheckId : Date.now().toString();

        await initiateCheck(Tasks.DATABASES, checkId);
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/plain");
        res.end(checkId);

        let status = undefined;
        const reports = {};
        if (tables.length === 0) {
            status = Status.FAILED;
            reports["no-tables"] = {
                message: "No tables found.",
            }
        }

        if (status !== Status.FAILED) {
            const encodedQuery = encodeURIComponent("__timestamp > 0");
            for (const table of Object.values(tables)) {
                try {
                    const r = await $$.promisify(lightDBEnclaveClient.filter)($$.SYSTEM_IDENTIFIER, table, undefined);
                    reports[table] = {
                        status: "OK",
                        dataCount: r.length
                    };
                } catch (e) {
                    status = Status.FAILED;
                    reports[table] = e;
                }
            }
        }

        const result = {
            status: status || Status.SUCCESS,
            healthCheckId: checkId,
            report: reports
        };
        await markCheckCompletion(Tasks.DATABASES, checkId, result);
    }

    this.checkProducts = async (req, res) => {
        console.log("Check Products headers=", req.headers)
        const checkId = req.body?.healthCheckId || Date.now().toString();
        await initiateCheck(Tasks.PRODUCTS, checkId);
        const reports = {};
        try {
            // Step 1: Make an authorized request to list products URL
            const encodedQuery = encodeURIComponent("__timestamp > 0");
            const getProductsURL = baseURL + `/integration/listProducts?query=${encodedQuery}`;
            const headers = {
                'Authorization': req.headers.authorization,
                'Content-Type': 'application/json'
            };

            const responseProducts = await makeRequest(getProductsURL, 'GET', headers);

            const products = responseProducts.body;

            const urlParts = urlModule.parse(req.url, true);
            const {healthCheckRunId} = urlParts.query;
            let record = await $$.promisify(lightDBEnclaveClient.getRecord)($$.SYSTEM_IDENTIFIER, constants.HEALTH_CHECK_TABLE, healthCheckRunId);

            // Step 2: For each object, send a request to list languages URL
            const totalProducts = products.length;
            reports["dataCount"] = totalProducts;
            for (let i = 0; i < totalProducts; i++) {
                const product = products[i];
                const getLanguagesURL = baseURL + `/integration/listProductLangs/${product.productCode}/leaflet`;
                const responseLanguages = await makeRequest(getLanguagesURL, 'GET', headers);

                const languages = responseLanguages.body;


                // Step 3: If the response is an array of language codes, send a request to URL
                if (Array.isArray(languages) && languages.length > 0) {
                    for (const lang of languages) {
                        const getLeafletsURL = baseURL + `/integration/epi/${product.productCode}/${lang}/leaflet`;
                        await makeRequest(getLeafletsURL, 'GET', headers);
                    }
                }

                // Update progress
                const data = {status: `In Progress: ${((i + 1) / totalProducts * 100).toFixed(0)}%`}
                if (i === totalProducts - 1) {
                    data.status = constants.HEALTH_CHECK_STATUSES.SUCCESS;
                }
                await $$.promisify(lightDBEnclaveClient.updateRecord)($$.SYSTEM_IDENTIFIER, constants.HEALTH_CHECK_TABLE, healthCheckRunId, {data});
            }

            const result = {
                status: Status.SUCCESS,
                healthCheckId: checkId,
                report: reports
            };
            await markCheckCompletion(Tasks.PRODUCTS, checkId, result);
            res.statusCode = 200;
            // If no errors occur, log success message
            res.end("Products check successful, no issues found");
        } catch (error) {
            const result = {
                status: Status.FAILED,
                healthCheckId: checkId,
                report: error
            };
            await markCheckCompletion(Tasks.PRODUCTS, checkId, result);

            res.statusCode = 500;
            let message = "";
            // Handle errors by logging the appropriate message
            if (error.statusCode) {
                message = `Request to ${error.url} failed with status ${error.statusCode} and response body ${error.body}`;
            } else {
                message = `Request failed with error.`;
            }
            res.setHeader("Content-Type", "text/plain");
            res.end("Failed to check products");
        }
    }

    this.checkBatches = async (req, res) => {
        const checkId = req.body?.healthCheckId || Date.now().toString();
        try {
            await initiateCheck(Tasks.BATCHES, checkId);
            // Step 1: Make an authorized request to list batches URL
            const getBatchesURL = baseURL + '/integration/listBatches?query=__timestamp%20%3E%200';
            const headers = {
                // 'Authorization': req.headers.authorization,
                'Content-Type': 'application/json'
            };

            const responseBatches = await makeRequest(getBatchesURL, 'GET', headers);

            const batches = responseBatches.body;
            const urlParts = urlModule.parse(req.url, true);
            const {healthCheckRunId} = urlParts.query;
            let record = await $$.promisify(lightDBEnclaveClient.getRecord)($$.SYSTEM_IDENTIFIER, constants.HEALTH_CHECK_TABLE, healthCheckRunId);

            // Step 2: For each object, send a request to list languages URL
            const totalBatches = batches.length;
            for (let i = 0; i < totalBatches; i++) {
                const batch = batches[i];
                const getLanguagesURL = baseURL + `/integration/listProductLangs/${batch.productCode}/${batch.batchNumber}/leaflet`;
                const responseLanguages = await makeRequest(getLanguagesURL, 'GET', headers);

                const languages = responseLanguages.body;

                // Step 3: If the response is an array of language codes, send a request to URL
                if (Array.isArray(languages) && languages.length > 0) {
                    for (const lang of languages) {
                        const getLeafletsURL = baseURL + `/integration/epi/${batch.productCode}/${batch.batchNumber}/${lang}/leaflet`;
                        await makeRequest(getLeafletsURL, 'GET', headers);
                    }
                }

                // Update progress
                data.status = `Progress: ${((i + 1) / totalBatches * 100).toFixed(0)}%`;
                if (i === totalBatches - 1) {
                    data.status = constants.HEALTH_CHECK_STATUSES.SUCCESS;
                }
                await $$.promisify(lightDBEnclaveClient.updateRecord)($$.SYSTEM_IDENTIFIER, constants.HEALTH_CHECK_TABLE, healthCheckRunId, {data: data});
            }

            const result = {
                status: Status.SUCCESS,
                healthCheckId: checkId,
                report: "OK"
            };
            await markCheckCompletion(Tasks.BATCHES, checkId, result);

            res.statusCode = 200;
            res.setHeader("Content-Type", "text/plain");
            // If no errors occur, log success message
            res.end("Batches check successful, no issues found");
            // const checkData = { batches: batches, status: Status.COMPLETED, name: Task.CHECK_BATCHES };
            // resolve(markCheckCompletion(Task.CHECK_BATCHES, healthCheckId, checkData));
        } catch (error) {
            const result = {
                status: Status.FAILED,
                healthCheckId: checkId,
                report: error
            };
            await markCheckCompletion(Tasks.BATCHES, checkId, result);

            res.statusCode = 500;
            let message = "";
            // Handle errors by logging the appropriate message
            if (error.statusCode) {
                message = `Request to ${error.url} failed with status ${error.statusCode} and response body ${error.body}`;
            } else {
                message = `Request failed with error.`;
            }
            console.debug(message);
            res.setHeader("Content-Type", "text/plain");
            res.end("Failed to check batches");
        }
    }

    const getCheckStatusForAllComponents = async (healthCheckId) => {
        const statuses = {};
        for (let component in constants.HEALTH_CHECK_COMPONENTS) {
            const componentName = constants.HEALTH_CHECK_COMPONENTS[component];
            let record;
            try {
                record = await $$.promisify(lightDBEnclaveClient.getRecord)($$.SYSTEM_IDENTIFIER, componentName, healthCheckId);
            } catch (e) {
                //ignored and handled below
            }
            if (record) {
                statuses[componentName] = record;
            } else {
                statuses[componentName] = {status: Status.NEVER_EXECUTED};
            }
        }

        return statuses;
    }

    this.getCheckStatus = async (req, res) => {
        const {healthCheckId} = req.params;
        // get checkType from query params
        const urlParts = urlModule.parse(req.url, true);
        const {checkType} = urlParts.query;
        // if checkType is undefined get records for all check types
        if (!checkType) {
            const statuses = await getCheckStatusForAllComponents(healthCheckId);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(statuses));
            return;
        }
        let record;
        try {
            record = await $$.promisify(lightDBEnclaveClient.getRecord)($$.SYSTEM_IDENTIFIER, checkType, healthCheckId);
        } catch (e) {
            //ignored and handled below
        }
        if (record) {
            res.statusCode = 200;
            res.setHeader("Content-type", "application/json");
            res.end(JSON.stringify(record));
            return;
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({status: Status.NEVER_EXECUTED}));
    }

    const startCheckForComponent = async (checkType, healthCheckId) => {
        // make the first letter of checkType uppercase
        const component = checkType.charAt(0).toUpperCase() + checkType.slice(1);
        return await apiClient[`check${component}`](healthCheckId);
    }

    this.startHealthCheck = async (req, res) => {
        // start health check for all components
        let pk = Date.now().toString();
        req.body = {
            pk
        };
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/plain");
        res.end(pk);

        let objectData = {
            status: constants.HEALTH_CHECK_STATUSES.IN_PROGRESS,
            date: Date.now(),
            pk: pk
        }
        await $$.promisify(lightDBEnclaveClient.insertRecord)($$.SYSTEM_IDENTIFIER, constants.HEALTH_CHECK_TABLE, pk, {data: objectData});

        const components = Object.values(constants.HEALTH_CHECK_COMPONENTS);
        const promises = components.map((component) => startCheckForComponent(component, pk));

        try {
            await Promise.allSettled(promises);
        } catch (e) {
            objectData.status = constants.HEALTH_CHECK_STATUSES.FAILED;
            await $$.promisify(lightDBEnclaveClient.updateRecord)($$.SYSTEM_IDENTIFIER, constants.HEALTH_CHECK_TABLE, pk, {data: objectData});
        }

    }

    this.generateFailure = async (req, res) => {
        const FailuresRegistry = require('./FailuresRegistry');
        const failuresRegistry = new FailuresRegistry();
        const action = req.body.action;
        const component = req.body.component;
        try {
            await failuresRegistry.execute(component, action, server.rootFolder, req.body.args);
            res.statusCode = 200;
            res.end("Success");
        } catch (e) {
            console.error(e);
            res.statusCode = 500;
            res.end("Fail");
        }
    }

    this.listChecks = async (checkType) => {

    }


    this.getCheckResult = async (checkType, date) => {

    }
}

function getInstance(server) {
    return new StatusController(server);
}

module.exports = {
    getInstance
};

},{"../constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/healthCheckAPIs/constants.js","../controllers/APIClient":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/healthCheckAPIs/controllers/APIClient.js","../utils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/healthCheckAPIs/utils.js","./FailuresRegistry":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/healthCheckAPIs/controllers/FailuresRegistry.js","fs":false,"https":false,"opendsu":false,"path":false,"url":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/healthCheckAPIs/index.js":[function(require,module,exports){
const urlModule = require('url');
const EPI_DOMAIN = process.env.EPI_DOMAIN;
const EPI_SUBDOMAIN = process.env.EPI_SUBDOMAIN;
const constants = require('./constants');
const openDSU = require('opendsu');
const crypto = openDSU.loadAPI('crypto');
const enclave = openDSU.loadAPI('enclave');

const bodyReaderMiddleware = require('../middlewares/bodyReaderMiddleware');
const {generatePk} = require("./utils");

module.exports = function healthCheckAPIs(server) {
    // this middleware injects the send method on res object before proceeding...
    server.use("/maintenance/*", addSendMethodMiddleware);
    server.use("/maintenance/*", bodyReaderMiddleware);
    const dbName = "demiurge";
    const lightDBEnclaveClient = enclave.initialiseLightDBEnclave(dbName);
    try {
        lightDBEnclaveClient.createDatabase(dbName, (err) => {
            if (err) {
                console.log("Failed to create database", err);
                return;
            }
            lightDBEnclaveClient.grantWriteAccess($$.SYSTEM_IDENTIFIER, (err) => {
                if (err) {
                    console.log("Failed to grant write access", err);
                }
            });
        });
    } catch (e) {
        //db already exists
    }

    const statusController = require("./controllers/StatusController.js").getInstance(server);
    const apiClient = require("./controllers/APIClient.js").getInstance();
    const getDomainAndSubdomain = (req) => {
        const urlParts = urlModule.parse(req.url, true);
        let {domain, subdomain} = urlParts.query;
        domain = domain || EPI_DOMAIN;
        subdomain = subdomain || EPI_SUBDOMAIN;
        return {domain, subdomain};
    }

    server.get('/maintenance/fixSecrets', async function (req, res) {
        try {
            const urlParts = urlModule.parse(req.url, true);
            const {healthCheckRunId} = urlParts.query;
            let secretsPk = getComponentPk(healthCheckRunId, "secrets");
            let result = statusController.fixSecrets();
            let record = await $$.promisify(lightDBEnclaveClient.getRecord)($$.SYSTEM_IDENTIFIER, healthCheckRunId, secretsPk);
            record.data.status = result;
            await $$.promisify(lightDBEnclaveClient.updateRecord)($$.SYSTEM_IDENTIFIER, healthCheckRunId, secretsPk, record);
            if (result === constants.HEALTH_CHECK_STATUSES.REPAIRED) {
                await updateHealthCheckStatus(healthCheckRunId);
            }
            res.send(200, "Success");
        } catch (e) {
            res.send(500, e.message);
        }
    });
    server.get('/maintenance/installInfo', function (req, res) {
        try {
            let data = statusController.getInstallInfo();
            res.send(200, data);
        } catch (e) {
            res.send(500, e.message);
        }
    });

    server.get('/maintenance/systemHealth', function (req, res) {
        try {
            let data = statusController.getSystemHealthInfo();
            res.send(200, data);
        } catch (e) {
            res.send(500, e.message);
        }
    });

    server.get('/maintenance/checkSecrets', function (req, res) {
        try {
            let data = statusController.checkSecrets();
            res.send(200, data);
        } catch (e) {
            res.send(500, e.message);
        }
    });
    server.get('/maintenance/configsInfo', function (req, res) {
        try {
            let data = statusController.getConfigsInfo();
            res.send(200, data);
        } catch (e) {
            res.send(500, e.message);
        }
    });

    server.get('/maintenance/checkWallets', function (req, res) {
        try {
            let data = statusController.checkWallets();
            res.send(200, data);
        } catch (e) {
            res.send(500, e.message);
        }
    });
    server.get('/maintenance/fixWallet', async function (req, res) {
        try {
            const urlParts = urlModule.parse(req.url, true);
            const {healthCheckRunId} = urlParts.query;
            let walletsPk = getComponentPk(healthCheckRunId, "wallets");
            let result = statusController.fixWallet();
            let record = await $$.promisify(lightDBEnclaveClient.getRecord)($$.SYSTEM_IDENTIFIER, healthCheckRunId, walletsPk);
            record.data.status = result;
            await $$.promisify(lightDBEnclaveClient.updateRecord)($$.SYSTEM_IDENTIFIER, healthCheckRunId, walletsPk, record);
            if (result === constants.HEALTH_CHECK_STATUSES.REPAIRED) {
                await updateHealthCheckStatus(healthCheckRunId);
            }
            res.send(200, "Success");
        } catch (e) {
            res.send(500, e.message);
        }
    });

    async function updateHealthCheckStatus(healthCheckRunId, res) {
        let record = await $$.promisify(lightDBEnclaveClient.getRecord)($$.SYSTEM_IDENTIFIER, constants.HEALTH_CHECK_TABLE, healthCheckRunId);
        let data = record.data;
        data.failedChecksNr = data.failedChecksNr - 1;
        if (data.failedChecksNr === 0) {
            data.status = constants.HEALTH_CHECK_STATUSES.SUCCESS;
        }
        await $$.promisify(lightDBEnclaveClient.updateRecord)($$.SYSTEM_IDENTIFIER, constants.HEALTH_CHECK_TABLE, healthCheckRunId, {data: data});
    }

    server.get('/maintenance/removeWrongBrick', function (req, res) {
        res.send(200, "Rename with extension “.wrong”, and  it makes it inaccessible the file corresponding to a brick that does not validate its hash (it is empty or with wrong data)");
    });

    server.get('/maintenance/fixLocalAnchor', function (req, res) {
        res.send(200, "Restore the status of a wrong anchor or recreate it (for anchors used by wallets only)");
    });

    server.get('/maintenance/fixDID', function (req, res) {
        res.send(200, "Forcefully change the private key for a DID that was lost");
    });
    server.post('/maintenance/healthCheck/:action', async function (req, res) {
        let action = req.params.action;
        try {
            if (action === constants.HEALTH_CHECK_ACTIONS.START) {
                await startHealthCheck(req, res);
            } else if (action === constants.HEALTH_CHECK_ACTIONS.STATUS) {
                const urlParts = urlModule.parse(req.url, true);
                const {healthCheckRunId} = urlParts.query;
                let data = await getIterationStatus(healthCheckRunId);
                res.send(200, data);
            }
        } catch (e) {
            res.send(500, e.message);
        }
    });

    async function getIterationStatus(healthCheckRunId) {
        let record = await $$.promisify(lightDBEnclaveClient.getRecord)($$.SYSTEM_IDENTIFIER, constants.HEALTH_CHECK_TABLE, healthCheckRunId);
        return record.data;
    }

    async function startHealthCheck(req, res) {
        let pk = generatePk();
        const objectData = {
            status: constants.HEALTH_CHECK_STATUSES.IN_PROGRESS,
            date: Date.now(),
            pk: pk
        }
        await $$.promisify(lightDBEnclaveClient.insertRecord)($$.SYSTEM_IDENTIFIER, constants.HEALTH_CHECK_TABLE, pk, {data: objectData});
        let promises = [];
        let syncChecks = [];
        syncChecks.push($$.promisify(apiClient.checkSecrets)());
        syncChecks.push($$.promisify(apiClient.checkInstallInfo)());
        syncChecks.push($$.promisify(apiClient.checkSystemHealth)());
        syncChecks.push($$.promisify(apiClient.checkConfigsInfo)());
        syncChecks.push($$.promisify(apiClient.checkWallets)());
        promises.push($$.promisify(apiClient.checkAnchoring)("start", pk));
        promises.push($$.promisify(apiClient.checkBricking)("start", pk));
        promises.push($$.promisify(apiClient.checkDatabases)("start", pk));
        promises.push($$.promisify(apiClient.checkProducts)("start", pk));
        promises.push($$.promisify(apiClient.checkBatches)("start", pk));
        let results = await Promise.all(promises);
        let syncResults;
        syncResults = await Promise.all(syncChecks);
        for (let data of syncResults) {
            let componentPk = getComponentPk(pk, data.name);
            await $$.promisify(lightDBEnclaveClient.insertRecord)($$.SYSTEM_IDENTIFIER, pk, componentPk, {data: data});
        }
        let failedChecks = 0;
        for (let result of syncResults) {
            if (result.status === constants.HEALTH_CHECK_STATUSES.FAILED) {
                failedChecks++;
            }
        }

        setInterval(async () => {
            //await $$.promisify(apiClient.checkAnchoring)("status");
            for (let result of results) {
                if (result.status === constants.HEALTH_CHECK_STATUSES.FAILED) {
                    failedChecks++;
                }
            }
            let checkStatus = failedChecks === 0 ? constants.HEALTH_CHECK_STATUSES.SUCCESS : constants.HEALTH_CHECK_STATUSES.FAILED;

            await markIterationComplete(pk, checkStatus, failedChecks);
        }, 2000);
        res.send(200, pk);
    }

    async function markIterationComplete(pk, status, failedChecksNr) {
        let record = await $$.promisify(lightDBEnclaveClient.getRecord)($$.SYSTEM_IDENTIFIER, constants.HEALTH_CHECK_TABLE, pk);
        record.data.status = status;
        record.data.failedChecksNr = failedChecksNr;
        await $$.promisify(lightDBEnclaveClient.updateRecord)($$.SYSTEM_IDENTIFIER, constants.HEALTH_CHECK_TABLE, pk, record);
    }

    server.get('/maintenance/getIterationComponent', async function (req, res) {
        const urlParts = urlModule.parse(req.url, true);
        const {healthCheckRunId, componentName} = urlParts.query;
        let pk = healthCheckRunId + "_" + componentName;
        try {
            let record = await $$.promisify(lightDBEnclaveClient.getRecord)($$.SYSTEM_IDENTIFIER, healthCheckRunId, pk);
            res.setHeader("Content-type", "text/json");
            res.send(200, JSON.stringify(record.data));
        } catch (e) {
            res.send(500, e.message);
        }
    });
    server.get('/maintenance/getIterationsMetadata', async function (req, res) {
        const urlParts = urlModule.parse(req.url, true);
        const {start, number, sort, query} = urlParts.query;
        try {
            let records = await $$.promisify(lightDBEnclaveClient.filter)($$.SYSTEM_IDENTIFIER, constants.HEALTH_CHECK_TABLE, query, sort, number);
            res.setHeader("Content-type", "text/json");
            res.send(200, JSON.stringify(records.map(record => {
                record.data.__timestamp = record.__timestamp;
                return record.data;
            })));
        } catch (e) {
            res.send(500, e.message);
        }
    });
    server.get('/maintenance/getIterationResults', function (req, res) {
        const urlParts = urlModule.parse(req.url, true);
        const {healthCheckRunId} = urlParts.query;
        lightDBEnclaveClient.getAllRecords($$.SYSTEM_IDENTIFIER, healthCheckRunId, (err, records) => {
            if (err) {
                res.send(500, "Failed to get records");
                return;
            }
            res.setHeader("Content-type", "text/json");
            res.send(200, JSON.stringify(records.map(record => record.data)));
        });
    })


    function getComponentPk(healthCheckPK, componentName) {
        return healthCheckPK + "_" + componentName;
    }


    function addSendMethodMiddleware(req, res, next) {
        res.send = function send(statusCode, result) {
            res.setHeader('Server', 'Maintenance Middleware');
            res.statusCode = statusCode;
            res.end(typeof result === "string" ? result : JSON.stringify(result));
        }
        next();
    }

    /* Asynchronous APIs */

    async function checkHandler(req, res, checkType) {
        const action = req.params.action;
        const healthCheckId = req.body.healthCheckId;
        if (!healthCheckId) {
            res.send(400, "Health check ID is required.");
            return;
        }
        switch (action) {
            case "start":
                try {
                    await statusController.startProcess(checkType, healthCheckId, req.body);
                    res.send(200, `${checkType} started for health check:${healthCheckId}`);
                } catch (error) {
                    res.send(500, "Failed to start process." + error);
                }
                return;
            case "status":
                try {
                    const verificationStatus = await statusController.getCheckStatus(checkType, healthCheckId);
                    res.send(200, `${checkType} status for health check:${healthCheckId} is ${verificationStatus}`);
                } catch (error) {
                    res.send(500, "Failed to get process status." + error);
                }
                return;
            case "listChecks":
                try {
                    const checks = await statusController.listChecks(checkType);
                    res.send(200, checks);
                } catch (error) {
                    res.send(500, "Failed to get process status." + error);
                }
                return;
            case "result":
                const date = req.body.date;
                if (!date) {
                    res.send(400, "Date is required.");
                    return;
                }
                try {
                    const result = await statusController.getCheckResult(checkType, date);
                    res.send(200, result);
                } catch (error) {
                    res.send(500, "Failed to get process status." + error);
                }
                return;
            default:
                res.send(400, "Invalid action");
                return;
        }
    }

    server.get('/maintenance/checkStatus/:healthCheckId', statusController.getCheckStatus);
    server.post('/maintenance/checkAnchoring', statusController.checkAnchoring);
    server.post('/maintenance/checkBricking', statusController.checkBricking);
    server.post('/maintenance/checkSecrets', statusController.checkSecrets);
    server.post('/maintenance/checkDatabases', statusController.checkDatabases);
    server.post('/maintenance/checkProducts', statusController.checkProducts);
    server.post('/maintenance/checkBatches', statusController.checkBatches);
    server.post('/maintenance/startHealthCheck', statusController.startHealthCheck);
    server.delete('/maintenance/generateFailure', statusController.generateFailure);
}

},{"../middlewares/bodyReaderMiddleware":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/middlewares/bodyReaderMiddleware.js","./constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/healthCheckAPIs/constants.js","./controllers/APIClient.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/healthCheckAPIs/controllers/APIClient.js","./controllers/StatusController.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/healthCheckAPIs/controllers/StatusController.js","./utils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/healthCheckAPIs/utils.js","opendsu":false,"url":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/healthCheckAPIs/utils.js":[function(require,module,exports){
const openDSU = require('opendsu');
const crypto = openDSU.loadAPI('crypto');
const http = require('http');
const https = require('https');

const makeRequest = (url, method = 'GET', headers = {}) => {
    return new Promise((resolve, reject) => {
        const options = {
            method,
            headers
        };

        const httpHandler = url.startsWith("https://") ? https : http;
        const req = httpHandler.request(new URL(url), options, (res) => {
            let data = '';

            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({statusCode: res.statusCode, body: JSON.parse(data)});
                } else {
                    reject({statusCode: res.statusCode, body: data});
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.end();
    });
};
const generatePk = () => {
    return Array.from(crypto.generateRandom(32))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

module.exports = {
    makeRequest,
    generatePk
};

},{"http":false,"https":false,"opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/clients/EpiSORIntegrationClient.js":[function(require,module,exports){
const constants = require("./../../constants/constants.js");
const instances = {};

//TODO: CODE-REVIEW - why do we have callback type functions if in the app and APIs the new trend is to use async/await ?
const systemAPI = require('opendsu').loadAPI("system");

function EpiSORIntegrationClient(domain, subdomain, appName) {
    const getBaseURL = () => {
        return `${systemAPI.getBaseURL()}/integration`;
    }

    const getEpiProductUrl = (gtin, language, epiType, ePIMarket) => {
        const baseEndpoint = `${getBaseURL()}/epi/${gtin}/${language}/${epiType}`;
        return ePIMarket ? `${baseEndpoint}/${ePIMarket}` : baseEndpoint;
    };

    const _sendRequest = (endpoint, method, data, responseType, callback) => {
        if (typeof data === 'function') {
            callback = data;
            data = undefined;
            responseType = "json";
        }

        if (typeof responseType === 'function') {
            callback = responseType;
            responseType = "json";
        }

        //add domain and subdomain as query parameters
        //check if the endpoint already has query parameters
        if (endpoint.indexOf('?') !== -1) {
            endpoint += '&';
        } else {
            endpoint += '?';
        }
        endpoint += `domain=${encodeURIComponent(domain)}&subdomain=${encodeURIComponent(subdomain)}`;
        if (appName) {
            endpoint += `&appName=${encodeURIComponent(appName)}`
        }
        const http = require('opendsu').loadAPI('http');
        if (method === 'GET') {
            let promise = http.fetch(endpoint, {method})
                .then(async response => {
                    if (response.status >= 400) {
                        let reason = await response.text();
                        throw {code: response.status, reason}
                    }
                    return response
                })

            if (responseType === "json") {
                promise.then(response => response.json())
                    .then(response => callback(undefined, response))
                    .catch(error => callback(error))

            } else {
                promise.then(response => response.text())
                    .then(response => callback(undefined, response))
                    .catch(error => callback(error))
            }

            //TODO: CODE-REVIEW - double callback call if the callback code is throwing errors...
        } else {
            let body;
            if (method !== 'DELETE' && data) {
                body = data ? JSON.stringify(data) : undefined;
            }
            http.fetch(endpoint, {method, body})
                .then(async response => {
                    if (response.status >= 400) {
                        let reason = await response.text();
                        throw {code: response.status, reason}
                    }
                    return response
                })
                .then(response => response.text())
                .then(response => callback(undefined, response))
                .catch(error => callback(error))
            //TODO: CODE-REVIEW - double callback call if the callback code is throwing errors...
        }
    };

    this.addProduct = (gtin, productMessage, callback) => {
        _sendRequest(`${getBaseURL()}/product/${gtin}`, 'POST', productMessage, callback);
    };

    this.updateProduct = (gtin, productMessage, callback) => {
        _sendRequest(`${getBaseURL()}/product/${gtin}`, 'PUT', productMessage, callback);
    };

    this.getProductMetadata = (gtin, callback) => {
        _sendRequest(`${getBaseURL()}/product/${gtin}`, 'GET', callback);
    };

    this.addImage = (gtin, productPhotoMessage, callback) => {
        _sendRequest(`${getBaseURL()}/image/${gtin}`, 'POST', productPhotoMessage, callback);
    };

    this.updateImage = (gtin, productPhotoMessage, callback) => {
        _sendRequest(`${getBaseURL()}/image/${gtin}`, 'PUT', productPhotoMessage, callback);
    };

    this.getImage = (gtin, dsuVersion, callback) => {
        let url = `${getBaseURL()}/image/${gtin}?domain=${encodeURIComponent(domain)}&subdomain=${encodeURIComponent(subdomain)}`;

        if (typeof dsuVersion === "function") {
            callback = dsuVersion;
        } else {
            if (dsuVersion) {
                url = `${url}&version=${dsuVersion}`;
            }
        }
        const http = require('opendsu').loadAPI('http');
        http.fetch(url, {method: 'GET'})
            .then(response => response.text())
            .then(response => callback(undefined, response))
            .catch(error => callback(error));
        //TODO: CODE-REVIEW - double callback call if the callback code is throwing errors...
    }

    this.addBatch = (gtin, batchNumber, batchMessage, callback) => {
        //TODO: CODE-REVIEW - validate the payload before sending it.
        _sendRequest(`${getBaseURL()}/batch/${gtin}/${encodeURIComponent(batchNumber)}`, 'POST', batchMessage, callback);
    };

    this.addAuditLog = (logType, auditMessage, callback) => {
        _sendRequest(`${getBaseURL()}/audit/${logType}`, 'POST', auditMessage, callback);
    }

    this.updateBatch = (gtin, batchNumber, batchMessage, callback) => {
        //TODO: CODE-REVIEW - validate the payload before sending it.
        _sendRequest(`${getBaseURL()}/batch/${gtin}/${encodeURIComponent(batchNumber)}`, 'PUT', batchMessage, callback);
    };

    this.getBatchMetadata = (gtin, batchNumber, callback) => {
        _sendRequest(`${getBaseURL()}/batch/${gtin}/${encodeURIComponent(batchNumber)}`, 'GET', callback);
    };

    this.getProductEPIs = (gtin, language, epiType, dsuVersion, callback) => {
        let url = `${getBaseURL()}/epi/${gtin}/${language}/${epiType}`;
        if (typeof dsuVersion === "function") {
            callback = dsuVersion;
        } else {
            if (dsuVersion) {
                url = `${url}?version=${dsuVersion}`;
            }
        }

        _sendRequest(url, 'GET', callback);
    }

    this.getProductEPIsByMarket = (gtin, language, epiType, epiMarket, dsuVersion, callback) => {
        let url = `${getBaseURL()}/epi/${gtin}/${language}/${epiType}/${epiMarket}`;
        if (typeof dsuVersion === "function") {
            callback = dsuVersion;
        } else {
            if (dsuVersion) {
                url = `${url}?version=${dsuVersion}`;
            }
        }
        _sendRequest(url, 'GET', callback);
    }

    this.getBatchEPIs = (gtin, batchNumber, language, epiType, dsuVersion, callback) => {
        let url = `${getBaseURL()}/epi/${gtin}/${encodeURIComponent(batchNumber)}/${language}/${epiType}`;
        if (typeof dsuVersion === "function") {
            callback = dsuVersion;
        } else {
            if (dsuVersion) {
                url = `${url}?version=${dsuVersion}`;
            }
        }

        _sendRequest(url, 'GET', callback);
    }

    this.addProductEPI = (gtin, language, epiType, ePIMarket, epiMessage, callback) => {
        const url = getEpiProductUrl(gtin, language, epiType, ePIMarket);
        return _sendRequest(url, 'POST', epiMessage, callback);
    };

    this.addBatchEPI = (gtin, batchNumber, language, epiType, epiMessage, callback) => {
        _sendRequest(`${getBaseURL()}/epi/${gtin}/${encodeURIComponent(batchNumber)}/${language}/${epiType}`, 'POST', epiMessage, callback);
    };

    this.updateProductEPI = (gtin, language, epiType, epiMarket, epiMessage, callback) => {
        const url = getEpiProductUrl(gtin, language, epiType, epiMarket);
        return _sendRequest(url, 'PUT', epiMessage, callback);
    }

    this.updateBatchEPI = (gtin, batchNumber, language, epiType, epiMessage, callback) => {
        _sendRequest(`${getBaseURL()}/epi/${gtin}/${encodeURIComponent(batchNumber)}/${language}/${epiType}`, 'PUT', epiMessage, callback);
    }

    this.deleteProductEPI = (gtin, language, epiType, epiMarket, callback) => {
        const url = getEpiProductUrl(gtin, language, epiType, epiMarket);
        return _sendRequest(url, 'DELETE', callback);
    };

    this.deleteBatchEPI = (gtin, batchNumber, language, epiType, callback) => {
        _sendRequest(`${getBaseURL()}/epi/${gtin}/${encodeURIComponent(batchNumber)}/${language}/${epiType}`, 'DELETE', callback);
    };

    this.listProductLangs = (gtin, epiType, callback) => {
        _sendRequest(`${getBaseURL()}/listProductLangs/${gtin}/${epiType}`, 'GET', callback);
    }

    this.listProductMarkets = (gtin, epiType, callback) => {
        _sendRequest(`${getBaseURL()}/listProductMarkets/${gtin}/${epiType}`, 'GET', callback);
    }

    this.listBatchLangs = (gtin, batchNumber, epiType, callback) => {
        _sendRequest(`${getBaseURL()}/listBatchLangs/${gtin}/${encodeURIComponent(batchNumber)}/${epiType}`, 'GET', callback);
    }

    this.digestMessage = (message, callback) => {
        _sendRequest(`${getBaseURL()}/message`, 'PUT', message, callback);
    };

    function processParametersAndSendRequest(baseURL, endpoint, start, number, query, sort, callback) {
        if (typeof start === 'function') {
            callback = start;
            start = undefined;
            number = undefined;
            sort = undefined;
            query = undefined;
        }

        if (typeof number === 'function') {
            callback = number;
            number = undefined;
            sort = undefined;
            query = undefined;
        }

        if (typeof query === 'function') {
            callback = query;
            query = undefined;
        }

        if (typeof sort === 'function') {
            callback = sort;
            sort = undefined;
        }

        if (!query) {
            query = "__timestamp > 0";
        }
        let url = `${baseURL}/${endpoint}?query=${query}`;
        if (typeof start !== 'undefined') {
            url += `&start=${start}`;
        }
        if (typeof number !== 'undefined') {
            url += `&number=${number}`;
        }
        if (typeof sort !== 'undefined') {
            url += `&sort=${sort}`;
        }
        _sendRequest(url, 'GET', callback);
    }

    this.listProducts = (start, number, query, sort, callback) => {
        processParametersAndSendRequest(getBaseURL(), 'listProducts', start, number, query, sort, callback);
    };

    this.listBatches = (start, number, query, sort, callback) => {
        processParametersAndSendRequest(getBaseURL(), 'listBatches', start, number, query, sort, callback);
    };

    this.filterAuditLogs = (logType, start, number, query, sort, callback) => {
        processParametersAndSendRequest(getBaseURL(), `audit/${logType}`, start, number, query, sort, callback);
    }

    this.doDemiurgeMigration = (demiurgeSharedEnclaveKeySSI, callback) => {
        _sendRequest(`${systemAPI.getBaseURL()}/doDemiurgeMigration`, 'PUT', {demiurgeSharedEnclaveKeySSI}, callback);
    };

    this.getDemiurgeMigrationStatus = (callback) => {
        _sendRequest(`${systemAPI.getBaseURL()}/getDemiurgeMigrationStatus`, 'GET', undefined, "text", callback);
    }

    this.doDSUFabricMigration = (epiSharedEnclaveKeySSI, callback) => {
        _sendRequest(`${systemAPI.getBaseURL()}/doMigration`, 'PUT', {epiSharedEnclaveKeySSI}, callback);
    }

    this.getDSUFabricMigrationStatus = (callback) => {
        _sendRequest(`${systemAPI.getBaseURL()}/getMigrationStatus`, 'GET', undefined, "text", callback);
    }

    this.digestMultipleMessages = (messages, callback) => {
        //TODO: CODE-REVIEW - validate the payload before sending it.
        _sendRequest(`${getBaseURL()}/multipleMessages`, 'PUT', messages, callback);
    };

    this.digestGroupedMessages = (groupedMessages, callback) => {
        //TODO: CODE-REVIEW - validate the payload before sending it.
        _sendRequest(`${getBaseURL()}/groupedMessages`, 'PUT', groupedMessages, callback);
    };

    this.objectStatus = async (productCode, batchNumber, callback) => {
        const systemAPI = require('opendsu').loadAPI("system");
        const http = require('opendsu').loadAPI('http');
        if (typeof batchNumber === "function") {
            callback = batchNumber;
            batchNumber = undefined;
        }

        let endpoint = `${systemAPI.getBaseURL()}/integration/objectStatus/${productCode}`;
        if (batchNumber) {
            endpoint += `/${encodeURIComponent(batchNumber)}`;
        }

        let response = await http.fetch(endpoint, {method: 'GET'});
        if (response.status !== 200) {
            return callback(Error("Failed to retrieve info"));
        }

        response = await response.text();
        return callback(undefined, response);
    };

    this.recover = async (productCode, batchNumber, callback) => {
        const systemAPI = require('opendsu').loadAPI("system");
        const http = require('opendsu').loadAPI('http');
        let endpointName = "recoverBatch";
        if (typeof batchNumber === "function") {
            callback = batchNumber;
            batchNumber = undefined;
            endpointName = "recoverProduct"
        }

        let endpoint = `${systemAPI.getBaseURL()}/integration/${endpointName}/${productCode}`;
        if (batchNumber) {
            endpoint += `/${encodeURIComponent(batchNumber)}`;
        }

        let response = await http.fetch(endpoint, {method: 'POST'});
        if (response.status !== 200) {
            return callback(Error("Failed to recover"));
        }

        return callback(undefined, response);
    };

    this.getGTINStatus = (productCode, callback) => {
        const systemAPI = require('opendsu').loadAPI("system");
        const http = require('opendsu').loadAPI('http');
        http.fetch(`${systemAPI.getBaseURL()}/gtinOwner/${domain}/${productCode}`, {method: 'GET'})
            .then(response => response.json())
            .then(response => {
                if (response.domain === domain) {
                    callback(undefined, JSON.stringify({
                        gtinStatus: constants.GTIN_AVAILABILITY_STATUS.OWNED,
                        ownerDomain: response.domain
                    }))
                } else {
                    callback(undefined, JSON.stringify({
                        gtinStatus: constants.GTIN_AVAILABILITY_STATUS.USED,
                        ownerDomain: response.domain
                    }))
                }
            })
            .catch(error => {
                let err404Status = require('opendsu').constants.ERROR_ROOT_CAUSE.MISSING_DATA_ERROR;
                if (error.rootCause === err404Status) {
                    callback(undefined, JSON.stringify({
                        gtinStatus: constants.GTIN_AVAILABILITY_STATUS.FREE
                    }))
                } else {
                    callback(error)
                }
            })
    };
}

const getInstance = (domain, subdomain, appName) => {
    const key = appName ? `${domain}_${subdomain}_${appName}` : `${domain}_${subdomain}`;
    if (!instances[key]) {
        instances[key] = new EpiSORIntegrationClient(domain, subdomain, appName);
    }

    return instances[key];
}

module.exports = {
    getInstance
};

},{"./../../constants/constants.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/controllers/BatchController.js":[function(require,module,exports){
const recoveryUtils = require("../utils/recoveryUtils.js");

function BatchController(enclave, version) {
    const {getUserId} = require("../utils/getUserId");
    const logger = $$.getLogger("BatchController", "integrationAPIs");
    const batchFactory = require("../factories/BatchFactory.js").getInstance(enclave);
    const productFactory = require("../factories/ProductFactory.js").getInstance(enclave);
    const auditService = require("../services/AuditService.js").getInstance(enclave);
    const validationService = require("../services/ValidationService.js").getInstance();
    const constants = require("../utils/constants.js");
    const OPERATIONS = constants.OPERATIONS;
    this.addBatch = async function (domain, subdomain, gtin, batchNumber, batchMessage, req, res) {
        const userId = getUserId(req, batchMessage);
        let batch;
        try {
            await validationService.validateBatchMessage(batchMessage);
        } catch (err) {
            logger.error(err);
            let details = err.reason || err.message;
            try{
                details = JSON.parse(details);
            }catch(err){
                //ignorable error
            }
            res.send(422, JSON.stringify({message: "Payload validation failed", details} ));
            return;
        }

        let product;
        try{
            product = await productFactory.lookupProduct(domain, subdomain, gtin, version);
            if(!product){
                throw Error(`Failed to find a product with gtin ${gtin}`);
            }
        }catch(err){
            logger.error(err);
            res.send(404, `Product with gtin ${gtin} not found`);
            return;
        }

        const operationInProgressContext = {
            userId,
            gtin,
            batchNumber,
            operation: OPERATIONS.CREATE_BATCH_IN_PROGRESS
        }

        const operationFailContext = {
            userId,
            gtin,
            batchNumber,
            operation: OPERATIONS.CREATE_BATCH_FAIL
        }

        const operationSuccessContext = {
            userId,
            gtin,
            batchNumber,
            operation: OPERATIONS.CREATE_BATCH
        }

        const batchData = batchMessage.payload;
        let auditId;
        try {
            auditId = await auditService.auditOperationInProgress(operationInProgressContext);
        } catch (err) {
            logger.error(err);
            res.send(500, "Failed to audit start of an operation");
            return;
        }

        try {
            batch = await batchFactory.createBatch(domain, subdomain, gtin, batchNumber, version);

            try{
                await batch.lock();
            }catch(err){
                logger.info(err);
                await auditService.auditFail(auditId, operationFailContext);
                res.send(423);
                return;
            }

            batch.update(batchData);
            try {
                await batch.persist(operationSuccessContext);
            } catch (err) {
                logger.error(err);
                await auditService.auditFail(auditId, operationFailContext);
                res.send(529);
                return;
            }


        } catch (err) {
            logger.error(err);
            await auditService.auditFail(auditId, operationFailContext);
            res.send(500, err.message);
            return;
        }

        await auditService.auditBatch(auditId, JSON.parse(JSON.stringify(batch)), operationSuccessContext);
        res.send(200);
    }

    this.updateBatch = async function (domain, subdomain, gtin, batchNumber, batchMessage, req, res) {
        const userId = getUserId(req, batchMessage);
        let batch;
        try {
            await validationService.validateBatchMessage(batchMessage);
        } catch (err) {
            let details = err.reason || err.message;
            try{
                details = JSON.parse(details);
            }catch(err){
                //ignorable error
            }
            res.send(422, JSON.stringify({message: "Payload validation failed", details} ));
            return;
        }

        const batchData = batchMessage.payload;

        if(gtin !== batchData.productCode){
            res.send(422, JSON.stringify({message: "Payload validation failed", details:"Different gtin between url params and payload."}));
            return;
        }

        if( batchNumber !== batchData.batchNumber){
            res.send(422, JSON.stringify({message: "Payload validation failed", details:"Different batch info between url params and payload."}));
            return;
        }

        let product;
        try{
            product = await productFactory.lookupProduct(domain, subdomain, gtin, version);
            if(!product){
                throw Error(`Failed to find a product with gtin ${gtin}`);
            }
        }catch(err){
            logger.error(err);
            res.send(404, `Product with gtin ${gtin} not found`);
            return;
        }

        const operationInProgressContext = {
            userId,
            gtin,
            batchNumber,
            operation: OPERATIONS.UPDATE_BATCH_IN_PROGRESS
        }

        const operationFailContext = {
            userId,
            gtin,
            batchNumber,
            operation: OPERATIONS.UPDATE_BATCH_FAIL
        }

        const operationSuccessContext = {
            userId,
            gtin,
            batchNumber,
            operation: OPERATIONS.UPDATE_BATCH
        }

        try {
            batch = await batchFactory.lookupBatch(domain, subdomain, gtin, batchNumber, version);
            if (!batch) {
                //if we don't have a batch to update ...
                await this.addBatch(domain, subdomain, gtin, batchNumber, batchMessage, req, res);
                return;
            }
        } catch (e) {
            logger.error(e);
            res.send(500, e.message);
            return;
        }

        let auditId;
        try {
            auditId = await auditService.auditOperationInProgress(operationInProgressContext);
        } catch (err) {
            logger.error(err);
            res.send(500, "Failed to audit start of an operation");
            return;
        }

        try {

            try{
                await batch.lock();
            }catch(err){
                logger.info(err);
                await auditService.auditFail(auditId, operationFailContext);
                res.send(423);
                return;
            }

            batch.update(batchData);
            try {
                await batch.persist(operationSuccessContext);
            } catch (err) {
                logger.error(err);
                await auditService.auditFail(auditId, operationFailContext);
                res.send(529, err.message);
                return;
            }

            await batch.unlock();
            await auditService.auditBatch(auditId, JSON.parse(JSON.stringify(batch)), operationSuccessContext);
        } catch (err) {
            logger.error(err);
            await auditService.auditFail(auditId, operationFailContext);
            res.send(500);
            return;
        }

        res.send(200);
    }

    this.getBatch = async function (domain, subdomain, gtin, batchNumber, req, res) {
        let batch;
        batch = await batchFactory.lookupBatch(domain, subdomain, gtin, batchNumber, version);

        if (!batch) {
            //if we don't have a batch...
            res.send(404, "Batch not found");
            return;
        }

        return JSON.stringify(batch);
    }

    this.listBatches = async (start, number, query, sort) => {
        const products = await $$.promisify(enclave.filter)($$.SYSTEM_IDENTIFIER, constants.TABLES.PRODUCTS);
        const productDictionary = {};
        products.forEach(product => {
            productDictionary[product.productCode] = product;
        });
        const batches = await $$.promisify(enclave.filter)($$.SYSTEM_IDENTIFIER, constants.TABLES.BATCHES, query, sort, number);
        for(let i = 0; i < batches.length; i++){
            const batch = batches[i];
            const product = productDictionary[batch.productCode];
            if(product){
                batch.inventedName = product.inventedName;
                batch.nameMedicinalProduct = product.nameMedicinalProduct;
            }
        }
        return batches;
    }

    this.listLanguages = async (domain, subdomain, gtin, batchNumber, epiType, req, res) => {
        let batch;
        batch = await batchFactory.lookupBatch(domain, subdomain, gtin, batchNumber, version);

        if (!batch) {
            res.send(404, "Batch not found");
            return;
        }

        const languages = await batch.listLanguages(epiType, batchNumber);
        return languages;
    };

    this.tryToDigest = async function (domain, subdomain, message, req, res) {
        try {
            await validationService.validateBatchMessage(message);
            let batchNumber = message.payload.batchNumber;
            if (await batchFactory.lookupBatch(domain, subdomain, batchNumber)) {
                await this.updateBatch(domain, subdomain, batchNumber, message, req, res);
                return true;
            } else {
                await this.addBatch(domain, subdomain, batchNumber, message, req, res);
                return true;
            }
        } catch (err) {

        }

        return false;
    }

    this.checkObjectStatus = async function(domain, subdomain, gtin, batchNumber){
        return await batchFactory.checkObjectStatus(domain, subdomain, gtin, batchNumber, version);
    }

    this.recover = async function(domain, subdomain, gtin, batchNumber, req, res){
        let auditId;
        const userId = req.headers["user-id"];
        let operationInProgressContext = {
            operation: OPERATIONS.BATCH_RECOVERY_IN_PROGRESS,
            gtin,
            batchNumber,
            userId
        }
        try {
            auditId = await auditService.auditOperationInProgress(operationInProgressContext);
        } catch (err) {
            logger.error(err);
            res.send(500, "Failed to audit start of an operation");
            return;
        }

        let batchNewVersion;
        try{
            batchNewVersion = await recoveryUtils.runRecovery(version, gtin, batchNumber);
        }catch(err){
            let auditContext = {
                operation: OPERATIONS.BATCH_RECOVERY_FAIL,
                gtin,
                batchNumber,
                userId
            }

            try {
                await auditService.auditFail(auditId, auditContext);
            } catch (err) {
                logger.error(err);
                res.send(500, "Failed to audit failed result of an operation");
                return;
            }
            res.send(424, err.message);
            return ;
        }

        if (batchNewVersion) {
            let auditContext = {
                reason: `The batch ${batchNumber} for GTIN ${gtin} got recovered as version ${batchNewVersion}.`,
                gtin,
                batchNumber,
                userId,
                version: batchNewVersion
            }

            try {
                await auditService.auditSuccess(auditId, auditContext);
            } catch (err) {
                logger.error(err);
                res.send(500, "Failed to audit success result of an operation");
                return;
            }
        } else {
            let auditContext = {
                operation: OPERATIONS.RECOVERED_BATCH,
                gtin,
                batchNumber,
                userId
            }

            try {
                await auditService.auditSuccess(auditId, auditContext);
            } catch (err) {
                logger.error(err);
                res.send(500, "Failed to audit result of an operation");
                return;
            }
        }

        res.send(200);
    }
}

let instances = {};

function getInstance(enclave, version) {
    if (!instances[version]) {
        instances[version] = new BatchController(enclave, version);
    }

    return instances[version];
}

module.exports = {
    getInstance
}
},{"../factories/BatchFactory.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/factories/BatchFactory.js","../factories/ProductFactory.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/factories/ProductFactory.js","../services/AuditService.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/services/AuditService.js","../services/ValidationService.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/services/ValidationService.js","../utils/constants.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/constants.js","../utils/getUserId":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/getUserId.js","../utils/recoveryUtils.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/recoveryUtils.js"}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/controllers/LeafletController.js":[function(require,module,exports){
const {EPI_TYPES} = require("../../constants/constants");
const {getCountry} = require("../../utils/Countries");

function LeafletController(enclave, version) {
    const {getUserId} = require("../utils/getUserId");
    const logger = $$.getLogger("LeafletController", "integrationAPIs");
    const productFactory = require("../factories/ProductFactory.js").getInstance(enclave);
    const batchFactory = require("../factories/BatchFactory.js").getInstance(enclave);
    const auditService = require("../services/AuditService.js").getInstance(enclave);
    const validationService = require("../services/ValidationService.js").getInstance();
    const constants = require("../utils/constants.js");
    const OPERATIONS = constants.OPERATIONS;

    function prepareAuditEntries(userId, gtin, batchNumber, reqMethod) {

        let operationInProgressContext = {
            userId,
            gtin,
            batchNumber,
            operation: reqMethod === "POST" ? OPERATIONS.ADD_LEAFLET_IN_PROGRESS : OPERATIONS.UPDATE_LEAFLET_IN_PROGRESS
        }

        let operationFailContext = {
            userId,
            gtin,
            batchNumber,
            operation: reqMethod === "POST" ? OPERATIONS.ADD_LEAFLET_FAIL : OPERATIONS.UPDATE_LEAFLET_FAIL
        }

        let operationSuccessContext = {
            userId,
            gtin,
            batchNumber,
            operation: reqMethod === "POST" ? OPERATIONS.ADD_LEAFLET : OPERATIONS.UPDATE_LEAFLET
        }
        return {operationInProgressContext, operationFailContext, operationSuccessContext}
    }

    this.addEPI = async (domain, subdomain, gtin, batchNumber, language, epiType, epiMarket, leafletMessage, req, res) => {
        const userId = getUserId(req, leafletMessage);
        let base64XMLFileContent;
        try {
            base64XMLFileContent = await validationService.validateLeafletMessage(leafletMessage);
        } catch (err) {
            logger.error(err);
            let details = err.reason || err.message;
            try{
                details = JSON.parse(details);
            }catch(err){
                //ignorable error
            }
            res.send(422, JSON.stringify({message: "Payload validation failed", details} ));
            return;
        }

        // let epiTypes = ["leaflet", "hcp", "smpc"];
        if (!epiType || Object.values(EPI_TYPES).indexOf(epiType) === -1) {
            res.send(400, `Invalid epi type: ${epiType}.`);
            return;
        }

        if (epiMarket) {
            try {
                const country = getCountry(epiMarket);
                if (!country)
                    throw new Error(`Invalid ePI Market: ${epiMarket}`);
            } catch (e) {
                res.send(400, `Invalid ePI Market: ${epiMarket}.`);
                return;
            }
        }

        if (gtin !== leafletMessage.payload.productCode) {
            res.send(422, JSON.stringify({
                message: "Payload validation failed",
                details: "Different gtin between url params and payload."
            }));
            return;
        }

        if (batchNumber && batchNumber !== leafletMessage.payload.batchNumber) {
            res.send(422, JSON.stringify({
                message: "Payload validation failed",
                details: "Different batch info between url params and payload."
            }));
            return;
        }

        if (batchNumber && epiMarket) {
            res.send(400, "Markets are not available at the epi batch level.");
            return;
        }

        let {
            operationInProgressContext,
            operationFailContext,
            operationSuccessContext
        } = prepareAuditEntries(userId, gtin, batchNumber, req.method);

        let auditId;
        try {
            auditId = await auditService.auditOperationInProgress(operationInProgressContext);
        } catch (err) {
            logger.error(err);
            res.send(500, "Failed to audit start of an operation");
            return;
        }

        const productCode = gtin;

        let targetObject;

        try {
            if (!batchNumber) {
                targetObject = await productFactory.lookupProduct(domain, subdomain, productCode, version);
            } else {
                targetObject = await batchFactory.lookupBatch(domain, subdomain, productCode, batchNumber, version);
            }


            if (!targetObject) {
                //if we don't have a product/batch to update ...
                await auditService.auditFail(auditId, operationFailContext);
                res.send(404, "Product/Batch not found");
                return;
            }
            let {otherFilesContent} = leafletMessage.payload;
            try {

                try{
                    await targetObject.lock();
                }catch(err){
                    logger.info(err);
                    await auditService.auditFail(auditId, operationFailContext);
                    res.send(423);
                    return;
                }

                await targetObject.addEPI(language, epiType, epiMarket, base64XMLFileContent, otherFilesContent);
                await targetObject.persist(operationSuccessContext);

                await targetObject.unlock();
            } catch (err) {
                logger.error(err);
                await auditService.auditFail(auditId, operationFailContext);
                res.send(500);
                return;
            }

        } catch (err) {
            logger.error(err);
            await auditService.auditFail(auditId, operationFailContext);
            res.send(500);
            return;
        }

        if (operationSuccessContext.version) {
            if (!batchNumber) {
                await auditService.auditProductVersionChange(productCode, operationSuccessContext.version);
            } else {
                await auditService.auditBatchVersionChange(productCode, batchNumber, operationSuccessContext.version);
            }
        }

        operationSuccessContext.diffs.push({epiLanguage: language, epiType, epiMarket});
        await auditService.auditSuccess(auditId, operationSuccessContext);
        res.send(200);
    }

    this.getEPI = async (domain, subdomain, gtin, batchNumber, language, type, epiMarket, dsuVersion, req, res) => {
        // domain, subdomain, gtin, batchNumber, language, epiType, epiMarket, dsuVersion, req, res
        let targetObject;
        try {

            if (!batchNumber) {
                targetObject = await productFactory.lookupProduct(domain, subdomain, gtin, version);
            } else {
                targetObject = await batchFactory.lookupBatch(domain, subdomain, gtin, batchNumber, version);
            }

            if (!targetObject) {
                res.send(412, "Product/Batch not found");
                return;
            }

            if (batchNumber && epiMarket) {
                res.send(400, "Markets are not available at the epi batch level.");
                return;
            }

            const epiParams = batchNumber ? [language, type, dsuVersion] : [language, type, epiMarket, dsuVersion];
            const epi = await targetObject.getEpi(...epiParams);
            return epi;
        } catch (err) {
            logger.error(err);
            res.send(500, "Failed to get EPI");
        }
    }

    this.updateEPI = this.addEPI;

    this.deleteEPI = async (domain, subdomain, productCode, batchNumber, language, epiType, epiMarket, req, res) => {
        if(!res) {
            res = req;
            req = epiMarket;
            epiMarket = undefined;
        }

        const userId = getUserId(req);
        let successStatusCode = 200;

        // let epiTypes = ["leaflet", "smpc"];
        if (!epiType || Object.values(EPI_TYPES).indexOf(epiType) === -1) {
            res.send(400, `Invalid epi type: ${epiType}.`);
            return;
        }

        if (batchNumber && epiMarket) {
            res.send(400, "Markets are not available at the epi batch level.");
            return;
        }

        const operationInProgressContext = {
            userId,
            gtin: productCode,
            batchNumber,
            operation: OPERATIONS.DELETE_LEAFLET_IN_PROGRESS
        }

        const operationFailContext = {
            userId,
            gtin: productCode,
            batchNumber,
            operation: OPERATIONS.DELETE_LEAFLET_FAIL
        }

        const operationSuccessContext = {
            userId,
            gtin: productCode,
            batchNumber,
            operation: OPERATIONS.DELETE_LEAFLET
        }

        let auditId;
        try {
            auditId = await auditService.auditOperationInProgress(operationInProgressContext);
        } catch (err) {
            res.send(500, "Failed to audit start of an operation");
            return;
        }

        let targetObject;
        try {

            if (!batchNumber) {
                targetObject = await productFactory.lookupProduct(domain, subdomain, productCode, version);
            } else {
                targetObject = await batchFactory.lookupBatch(domain, subdomain, productCode, batchNumber, version);
            }

            if (!targetObject) {
                //if we don't have a product/batch to update ...
                await auditService.auditFail(auditId, operationFailContext);
                res.send(404, "Product/Batch not found");
                return;
            }

            try {
                try{
                    await targetObject.lock();
                }catch(err){
                    logger.info(err);
                    await auditService.auditFail(auditId, operationFailContext);
                    res.send(423);
                    return;
                }

                let existing = await targetObject.deleteEPI(language, epiType, epiMarket);
                if (!existing) {
                    successStatusCode = 204;
                }
                await targetObject.persist(operationSuccessContext);

                await targetObject.unlock();
            } catch (err) {
                await auditService.auditFail(auditId, operationFailContext);
                logger.error(err);
                res.send(500);
                return;
            }

        } catch (err) {
            await auditService.auditFail(auditId, operationFailContext);
            logger.error(err);
            return res.send(500, err.message);
        }

        if (operationSuccessContext.version) {
            if (!batchNumber) {
                await auditService.auditProductVersionChange(productCode, operationSuccessContext.version);
            } else {
                await auditService.auditBatchVersionChange(productCode, batchNumber, operationSuccessContext.version);
            }
        }

        operationSuccessContext.diffs.push({epiLanguage: language, epiType, epiMarket});
        await auditService.auditSuccess(auditId, operationSuccessContext);
        res.send(successStatusCode);
    };

    this.tryToDigest = async function (domain, subdomain, message, req, res) {
        try {
            await validationService.validateLeafletMessage(message);
            await this.addEPI(domain, subdomain, message, req, res);
            return true;
        } catch (err) {

        }

        try {
            await validationService.validateLeafletDeleteMessage(message);
            await this.deleteEPI(domain, subdomain, message, req, res);
            return true;
        } catch (err) {

        }

        return false;
    }
}

let instances = {};

function getInstance(enclave, version) {
    if (!instances[version]) {
        instances[version] = new LeafletController(enclave, version);
    }

    return instances[version];
}

module.exports = {
    getInstance
}

},{"../../constants/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","../../utils/Countries":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/Countries.js","../factories/BatchFactory.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/factories/BatchFactory.js","../factories/ProductFactory.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/factories/ProductFactory.js","../services/AuditService.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/services/AuditService.js","../services/ValidationService.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/services/ValidationService.js","../utils/constants.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/constants.js","../utils/getUserId":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/getUserId.js"}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/controllers/MonsterController.js":[function(require,module,exports){
function MonsterController(enclave, version) {

    this.digestMessage = async function (domain, subdomain, message, req, res) {
        let digested = false;

        const productController = require("./ProductController.js").getInstance(version);
        digested = await productController.tryToDigest(domain, subdomain, message, req, res);
        if (digested) {
            return;
        }

        const batchController = require("./BatchController.js").getInstance(version);
        digested = await batchController.tryToDigest(domain, subdomain, message, req, res);
        if (digested) {
            return;
        }


        const leafletController = require("./LeafletController.js").getInstance(version);
        digested = await leafletController.tryToDigest(domain, subdomain, message, req, res);
        if (digested) {
            return;
        }

        res.send(422, "Failed to digestMessage");
    }
}

let instances = {};

function getInstance(enclave, version) {
    if (!instances[version]) {
        instances[version] = new MonsterController(enclave, version);
    }

    return instances[version];
}

module.exports = {
    getInstance
}
},{"./BatchController.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/controllers/BatchController.js","./LeafletController.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/controllers/LeafletController.js","./ProductController.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/controllers/ProductController.js"}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/controllers/ProductController.js":[function(require,module,exports){
function ProductController(enclave, version) {
    const {getUserId} = require("../utils/getUserId");
    const logger = $$.getLogger("ProductController", "integrationsAPIs");
    const productFactory = require("../factories/ProductFactory.js").getInstance(enclave);
    const auditService = require("../services/AuditService.js").getInstance(enclave);
    const validationService = require("../services/ValidationService.js").getInstance();
    const constants = require("../utils/constants.js");
    const recoveryUtils = require("../utils/recoveryUtils.js");

    const OPERATIONS = constants.OPERATIONS;

    function prepareImageAuditEntries(userId, gtin, reqMethod) {

        let operationInProgressContext = {
            userId,
            gtin,
            operation: reqMethod === "POST" ? OPERATIONS.ADD_PRODUCT_PHOTO_IN_PROGRESS : OPERATIONS.UPDATE_PRODUCT_PHOTO_IN_PROGRESS
        }

        let failedOperationContext = {
            userId,
            gtin,
            operation: reqMethod === "POST" ? OPERATIONS.ADD_PRODUCT_PHOTO_FAIL : OPERATIONS.UPDATE_PRODUCT_PHOTO_FAIL
        }

        let successOperationContext = {
            userId,
            gtin,
            operation: reqMethod === "POST" ? OPERATIONS.ADD_PRODUCT_PHOTO : OPERATIONS.UPDATE_PRODUCT_PHOTO
        }
        return {operationInProgressContext, failedOperationContext, successOperationContext}
    }

    this.addProduct = async (domain, subdomain, gtin, productMessage, req, res) => {
        const userId = getUserId(req, productMessage);
        let product;
        try {
            await validationService.validateProductMessage(productMessage);
        } catch (err) {
            let details = err.reason || err.message;
            try{
                details = JSON.parse(details);
            }catch(err){
                //ignorable error
            }
            res.send(422, JSON.stringify({message: "Payload validation failed", details} ));
            return;
        }

        const productData = productMessage.payload;

        if (gtin !== productData.productCode) {
            res.send(422, JSON.stringify({message: "Payload validation failed", details:"Different gtin between url params and payload."}));
            return;
        }

        const operationInProgressContext = {
            operation: OPERATIONS.CREATE_PRODUCT_IN_PROGRESS,
            gtin,
            userId
        }

        const failedOperationContext = {
            operation: OPERATIONS.CREATE_PRODUCT_FAIL,
            gtin,
            userId
        }

        const successOperationContext = {
            operation: OPERATIONS.CREATE_PRODUCT,
            gtin,
            userId
        }

        let auditId;
        try {
            auditId = await auditService.auditOperationInProgress(operationInProgressContext);
        } catch (err) {
            logger.error(err);
            res.send(500, "Failed to audit start of an operation");
            return;
        }

        try {
            product = await productFactory.createProduct(domain, subdomain, gtin, version);

            try{
                await product.lock();
            }catch(err){
                logger.info(err);
                await auditService.auditFail(auditId, failedOperationContext);
                res.send(423);
                return;
            }

            //todo: CODE-REVIEW - why do we call this function here? can we hide this in the update function before doing the update?!
            product.update(productData);
            try {
                await product.persist(successOperationContext);
            } catch (err) {
                logger.error(err);
                await auditService.auditFail(auditId, failedOperationContext);
                //.... return proper error to the client
                res.send(529);
                return;
            }

            await product.unlock();

        } catch (err) {
            logger.error(err);
            await auditService.auditFail(auditId, failedOperationContext);
            res.send(500);
            return;
        }
        await auditService.auditProduct(auditId, JSON.parse(JSON.stringify(product)), successOperationContext);
        res.send(200);
    }

    this.updateProduct = async function (domain, subdomain, gtin, productMessage, req, res) {
        const userId = getUserId(req, productMessage);
        let product;
        try {
            await validationService.validateProductMessage(productMessage);
        } catch (err) {
            let details = err.reason || err.message;
            try{
                details = JSON.parse(details);
            }catch(err){
                //ignorable error
            }
            res.send(422, JSON.stringify({message: "Payload validation failed", details} ));
            return;
        }

        const productData = productMessage.payload;

        if (gtin !== productData.productCode) {
            res.send(422, JSON.stringify({message: "Payload validation failed", details:"Different gtin between url params and payload."}));
            return;
        }

        const operationInProgressContext = {
            operation: OPERATIONS.UPDATE_PRODUCT_IN_PROGRESS,
            gtin,
            userId
        }

        const failedOperationContext = {
            operation: OPERATIONS.UPDATE_PRODUCT_FAIL,
            gtin,
            userId
        }

        const successOperationContext = {
            operation: OPERATIONS.UPDATE_PRODUCT,
            gtin,
            userId
        }

        try {
            product = await productFactory.lookupProduct(domain, subdomain, gtin, version);
            if (!product) {
                //if the product does not exist it should be created
                return this.addProduct(domain, subdomain, gtin, productMessage, req, res);
            }
        } catch (e) {
            logger.error(e)
            res.send(500, e.message);
            return;
        }


        let auditId;
        try {
            auditId = await auditService.auditOperationInProgress(operationInProgressContext);
        } catch (err) {
            logger.error(err)
            res.send(500, "Failed to audit start of an operation");
            return;
        }

        try {

            try{
                const lock = await product.lock();
                if(!lock) throw new Error("Unable to lock product");
            }catch(err){
                logger.info(err);
                await auditService.auditFail(auditId, failedOperationContext);
                res.send(423);
                return;
            }

            product.update(productData);
            try {
                await product.persist(successOperationContext);
            } catch (err) {
                logger.error(err);
                await auditService.auditFail(auditId, failedOperationContext);
                res.send(529);
                return;
            }

            await product.unlock();
        } catch (err) {
            logger.error(err);
            await auditService.auditFail(auditId, failedOperationContext);
            res.send(500);
            return;
        }
        await auditService.auditProduct(auditId, JSON.parse(JSON.stringify(product)), successOperationContext);
        res.send(200);
    }

    this.getProduct = async (domain, subdomain, gtin, req, res) => {
        try {
            let product;
            product = await productFactory.lookupProduct(domain, subdomain, gtin, version);

            if (!product) {
                //if we don't have a product...
                res.send(404, "Product not found");
                return;
            }

            const productMetadata = JSON.stringify(product);
            return productMetadata;
        } catch (err) {
            logger.error(err);
            res.send(500, err.message);
        }
    }

    this.addImage = async (domain, subdomain, gtin, photoMessage, req, res) => {
        const userId = getUserId(req, photoMessage);
        let product;
        try {
            await validationService.validatePhotoMessage(photoMessage);
        } catch (err) {
            let details = err.reason || err.message;
            try{
                details = JSON.parse(details);
            }catch(err){
                //ignorable error
            }
            res.send(422, JSON.stringify({message: "Payload validation failed", details} ));
            return;
        }

        const {imageData} = photoMessage.payload;

        if(gtin !== photoMessage.payload.productCode){
            res.send(422, JSON.stringify({message: "Payload validation failed", details:"Different gtin between url params and payload."}));
            return;
        }

        let {
            operationInProgressContext,
            failedOperationContext,
            successOperationContext
        } = prepareImageAuditEntries(userId, gtin, req.method);

        let auditId;
        try {
            auditId = await auditService.auditOperationInProgress(operationInProgressContext);
        } catch (err) {
            logger.error(err);
            res.send(500, "Failed to audit start of an operation");
            return;
        }

        try {
            product = await productFactory.lookupProduct(domain, subdomain, gtin, version);
            if (!product) {
                //if we don't have a product to update ...
                await auditService.auditFail(auditId, "replace with proper fail audit data");
                res.send(404, "Product not found");
                return;
            }

            try{
                await product.lock();
            }catch(err){
                logger.info(err);
                await auditService.auditFail(auditId, failedOperationContext);
                res.send(423);
                return;
            }

            try {
                await product.addPhoto(imageData);
                successOperationContext.diffs = await product.persist(successOperationContext);
            } catch (err) {
                logger.error(err);
                await auditService.auditFail(auditId, failedOperationContext);
                return res.send(500, "Failed to add photo");
                //.... return proper error to the client
            }

            await product.unlock();

        } catch (err) {
            logger.error(err);
            await auditService.auditFail(auditId, failedOperationContext);
            return res.send(500);
        }

        if(successOperationContext.version){
            await auditService.auditProductVersionChange(gtin, successOperationContext.version);
        }

        await auditService.auditSuccess(auditId, successOperationContext);
        res.send(200);
    }

    this.updateImage = this.addImage;

    this.getImage = async (domain, subdomain, gtin, dsuVersion, req, res) => {
        try {
            let product;
            product = await productFactory.lookupProduct(domain, subdomain, gtin, version);

            if (!product) {
                //if we don't have a product...
                res.send(412, "Product not found");
                return;
            }
            let productPhoto;
            try {
                productPhoto = await product.getPhoto(dsuVersion);
            } catch (e) {
                logger.error(e);
                return res.send(404, "Photo not found");
            }

            return res.send(200, productPhoto);
        } catch (err) {
            logger.error(err);
            res.send(500);
        }
    }

    this.deleteImage = async (domain, subdomain, gtin, req, res) => {
        const userId = getUserId(req);
        let product;

        const operationInProgressContext = {
            operation: OPERATIONS.DELETE_PRODUCT_PHOTO_IN_PROGRESS,
            gtin,
            userId
        }

        const failedOperationContext = {
            operation: OPERATIONS.DELETE_PRODUCT_PHOTO_FAIL,
            gtin,
            userId
        }

        const successOperationContext = {
            operation: OPERATIONS.DELETE_PRODUCT_PHOTO,
            gtin,
            userId
        }

        let auditId;
        try {
            auditId = await auditService.auditOperationInProgress(operationInProgressContext);
        } catch (err) {
            logger.error(err);
            res.send(500, "Failed to audit start of an operation");
            return;
        }

        try {
            product = await productFactory.lookupProduct(domain, subdomain, gtin, version);

            if (!product) {
                //if we don't have a product to update ...
                await auditService.auditFail(auditId, failedOperationContext);
                res.send(404, "Product not found");
                return;
            }

            try{
                await product.lock();
            }catch(err){
                logger.info(err);
                await auditService.auditFail(auditId, failedOperationContext);
                res.send(423);
                return;
            }

            try {
                await product.deletePhoto();
                successOperationContext.diffs = await product.persist(successOperationContext);
            } catch (err) {
                logger.error(err);
                await auditService.auditFail(auditId, failedOperationContext);
                //.... return proper error to the client
            }

            await product.unlock();

        } catch (err) {
            logger.error(err);
            await auditService.auditFail(auditId, failedOperationContext);
        }

        await auditService.auditSuccess(auditId, successOperationContext);
        res.send(200);
    }

    this.listProducts = async (start, number, query, sort) => {
        let products = await $$.promisify(enclave.filter)($$.SYSTEM_IDENTIFIER, constants.TABLES.PRODUCTS, query, sort, number);
        return products;
    }

    this.listLanguages = async (domain, subdomain, gtin, epiType, req, res) => {
        let product;
        product = await productFactory.lookupProduct(domain, subdomain, gtin, version);

        if (!product) {
            //if we don't have a product...
            res.send(404, "Product not found");
            return;
        }

        const languages = await product.listLanguages(epiType);
        return languages;
    }

    this.listMarkets = async (domain, subdomain, gtin, epiType, req, res) => {
        let product;
        product = await productFactory.lookupProduct(domain, subdomain, gtin, version);

        if (!product) {
            res.send(404, "Product not found");
            return;
        }

        return product.listMarkets(epiType);
    }

    this.tryToDigest = async function (domain, subdomain, message, req, res) {
        try {
            await validationService.validateProductMessage(message);
            let gtin = message.payload.productCode;
            if (await productFactory.lookupProduct(domain, subdomain, gtin, version)) {
                await this.updateProduct(domain, subdomain, gtin, message, req, res);
                return true;
            } else {
                await this.addProduct(domain, subdomain, gtin, message, req, res);
                return true;
            }
        } catch (err) {

        }

        try {
            await validationService.validatePhotoMessage(message);
            let gtin = message.productCode;
            await this.addImage(domain, subdomain, gtin, message, req, res);
            return true;
        } catch (err) {

        }

        return false;
    }

    this.checkObjectStatus = async function (domain, subdomain, gtin) {
        return await productFactory.checkObjectStatus(domain, subdomain, gtin, version);
    }

    this.recover = async function (domain, subdomain, gtin, req, res) {
        let auditId;
        const userId = req.headers["user-id"];
        let operationInProgressContext = {
            operation: OPERATIONS.PRODUCT_RECOVERY_IN_PROGRESS,
            gtin,
            userId
        }
        try {
            auditId = await auditService.auditOperationInProgress(operationInProgressContext);
        } catch (err) {
            logger.error(err);
            res.send(500, "Failed to audit start of an operation");
            return;
        }

        let productVersion;
        try {
            productVersion = await recoveryUtils.runRecovery(version, gtin);
        } catch (err) {
            let auditContext = {
                operation: OPERATIONS.PRODUCT_RECOVERY_FAIL,
                gtin,
                userId
            }

            try {
                await auditService.auditFail(auditId, auditContext);
            } catch (err) {
                logger.error(err);
                res.send(500, "Failed to audit failed result of an operation");
                return;
            }
            res.send(424, err.message);
            return;
        }

        if (typeof productVersion !== "undefined") {
            let auditContext = {
                reason: `The product with GTIN ${gtin} got recovered as version ${productVersion}`,
                gtin,
                userId,
                newVersion: productVersion
            }

            try {
                await auditService.auditSuccess(auditId, auditContext);
            } catch (err) {
                logger.error(err);
                res.send(500, "Failed to audit success result of an operation");
                return;
            }
        } else {
            //if newVersion is undefined it means that we were able to load the latest version
            let auditContext = {
                operation: OPERATIONS.RECOVERED_PRODUCT,
                gtin,
                userId
            }

            try {
                await auditService.auditSuccess(auditId, auditContext);
            } catch (err) {
                logger.error(err);
                res.send(500, "Failed to audit result of an operation");
                return;
            }
        }

        res.send(200);
    }
}

let instances = {};

function getInstance(enclave, version) {
    if (!instances[version]) {
        instances[version] = new ProductController(enclave, version);
    }

    return instances[version];
}

module.exports = {
    getInstance
}

},{"../factories/ProductFactory.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/factories/ProductFactory.js","../services/AuditService.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/services/AuditService.js","../services/ValidationService.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/services/ValidationService.js","../utils/constants.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/constants.js","../utils/getUserId":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/getUserId.js","../utils/recoveryUtils.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/recoveryUtils.js"}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/factories/BatchFactory.js":[function(require,module,exports){

function BatchFactory(enclave) {
    const Batch = require("../models/Batch.js");
    const ModelFactoryMixin = require("./ModelFactoryMixin.js");
    ModelFactoryMixin(this, enclave);

    this.getInstance = (domain, subdomain, gtin, version, batchNumber) => {
        return new Batch(enclave, domain, subdomain, gtin, batchNumber, version);
    }
    this.createBatch = async (domain, subdomain, gtin, batchNumber, version) => {
        return await this.create(domain, subdomain, gtin, version, batchNumber);
    }

    this.lookupBatch = async (domain, subdomain, gtin, batchNumber, version) => {
        return await this.lookup(domain, subdomain, gtin, version, batchNumber);
    }

    this.checkObjectStatus = async function(domain, subdomain, gtin, batchNumber, version){
        let batchDummy = new Batch(enclave, domain, subdomain, gtin, batchNumber, version);
        return await batchDummy.checkStatus();
    }
}

let batchFactory;

function getInstance(enclave) {
    if (!batchFactory) {
        batchFactory = new BatchFactory(enclave);
    }
    return batchFactory;
}

module.exports = {
    getInstance
};

},{"../models/Batch.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/models/Batch.js","./ModelFactoryMixin.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/factories/ModelFactoryMixin.js"}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/factories/ModelFactoryMixin.js":[function(require,module,exports){
function ModelFactoryMixin(target) {
    const constants = require("../utils/constants.js");
    const cacheAPI = require("opendsu").loadAPI("cache");
    const cache = cacheAPI.getWeakRefMemoryCache(constants.MODELS_CACHE_NAME);

    target.getInstance = () => {
        throw Error("getInstance method not implemented");
    }

    target.getCacheKey = (gtin, batchNumber) => {
        if (typeof batchNumber === "undefined") {
            return gtin;
        }
        return `${gtin}_${batchNumber}`;
    }

    target.create = async (domain, subdomain, gtin, version, batchNumber) => {
        const cacheKey = target.getCacheKey(gtin, batchNumber);
        const instance = cache.get(cacheKey);
        if (instance) {
            return instance;
        }
        const newInstance = target.getInstance(domain, subdomain, gtin, version, batchNumber);
        cache.put(cacheKey, newInstance);
        await newInstance.getEventRecorderInstance(newInstance.getGTINSSI());
        return newInstance;
    };

    target.lookup = async (domain, subdomain, gtin, version, batchNumber) => {
        const cacheKey = target.getCacheKey(gtin, batchNumber);
        let instance = cache.get(cacheKey);

        if (instance) {
            try{
                instance.version = await instance.getBlockchainDSUVersion();

            }catch(err){
                //todo: handle error
            }
            return instance;
        }

        instance = target.getInstance(domain, subdomain, gtin, version, batchNumber);

        if (await instance.immutableDSUIsCorrupted()) {
            let error;
            if(batchNumber){
                error = new Error(`Failed to load batch information for gtin: ${gtin} batch: ${batchNumber}}`);
            }else{
                error = new Error(`Failed to load product information for gtin: ${gtin}`);
            }

            error.rootCause = require("opendsu").constants.ERROR_ROOT_CAUSE.MISSING_DATA_ERROR;
            throw error;
        }
        try {
            await instance.loadMutableDSUInstance();
        } catch (e) {
            return undefined; //no instance found
        }
        await instance.loadMetadata();
        try{
            instance.version = await instance.getBlockchainDSUVersion();
        }catch(err){
            //todo: handle error
            console.log(err);
        }
        await instance.getEventRecorderInstance();
        cache.put(cacheKey, instance);
        return instance;

    }

    return target;
}

module.exports = ModelFactoryMixin;
},{"../utils/constants.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/constants.js","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/factories/ProductFactory.js":[function(require,module,exports){
function ProductFactory(enclave) {
    const Product = require("../models/Product.js");
    const ModelFactoryMixin = require("./ModelFactoryMixin.js");
    ModelFactoryMixin(this, enclave);

    this.getInstance = (domain, subdomain, gtin, version) => {
        return new Product(enclave, domain, subdomain, gtin, version);
    }

    this.createProduct = async (domain, subdomain, gtin, version) => {
        return await this.create(domain, subdomain, gtin, version);
    }

    this.lookupProduct = async function (domain, subdomain, gtin, version) {
        return await this.lookup(domain, subdomain, gtin, version);
    }

    this.checkObjectStatus = async function(domain, subdomain, gtin, version){
        let productDummy = new Product(enclave, domain, subdomain, gtin, version);
        return await productDummy.checkStatus();
    }
}

let productFactory;

function getInstance(enclave) {
    if (!productFactory) {
        productFactory = new ProductFactory(enclave);
    }
    return productFactory;
}

module.exports = {
    getInstance
};

},{"../models/Product.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/models/Product.js","./ModelFactoryMixin.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/factories/ModelFactoryMixin.js"}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/index.js":[function(require,module,exports){
const version = 1;
const {
    requestBodyJSONMiddleware,
    getIntegrationAPIsAuthorizationMiddleware,
    getRequestLimiterMiddleware
} = require("./utils/middlewares.js");
const LightDBEnclaveFactory = require("./utils/LightDBEnclaveFactory.js");
const {validateGTIN} = require("../utils/ValidationUtils.js");
const {migrateDataFromEpiEnclaveToLightDB, getMigrationStatus} = require("./utils/dataMigration.js");
const urlModule = require("url");
const {AUDIT_LOG_TYPES} = require("./utils/constants");
const {EPI_TYPES} = require("../constants/constants");
const {constants} = require("../../index");

module.exports = function (server) {
    const lightDBEnclaveFactory = LightDBEnclaveFactory.getLightDBEnclaveFactoryInstance();
    const EPI_DOMAIN = process.env.EPI_DOMAIN;
    const EPI_SUBDOMAIN = process.env.EPI_SUBDOMAIN;
    //setting up the connection to lightDB and share to the services via lightDBEnclaveFactory apis
    //lightDBEnclaveFactory.setEnclaveInstance(domain);
    function basicPreValidationMiddleware(req, res, next) {
        const {gtin} = req.params;

        //gtin validation required...
        let {isValid} = validateGTIN(gtin);
        if (!isValid) {
            res.send(400);
            return;
        }
        //collecting and JSON parsing of payload
        let payload = req.body;

        if (!payload) {
            res.send(400);
            return;
        }

        //maybe a ${domain} validation is required to be sure that we know the domain or else to return 404 !

        next();
    }

    function addSendMethodMiddleware(req, res, next) {
        res.send = function send(statusCode, result) {
            res.setHeader('Server', 'SoR integration Middleware');
            res.statusCode = statusCode;
            res.end(result);
        }

        next();
    }

    function getDataFromRequest(req) {
        let {gtin, batchNumber, language} = req.params;
        let payload = req.body;
        if (batchNumber) {
            batchNumber = decodeURIComponent(batchNumber);
        }
        return {payload, gtin, batchNumber, language}
    }


    getRequestLimiterMiddleware(server);
    getIntegrationAPIsAuthorizationMiddleware(server);

    //this middleware injects the send method on res object before proceeding...
    server.use("/integration/*", addSendMethodMiddleware);

    const getDomainAndSubdomain = (req) => {
        const urlParts = urlModule.parse(req.url, true);
        let {domain, subdomain, appName} = urlParts.query;
        domain = domain || EPI_DOMAIN;
        subdomain = subdomain || EPI_SUBDOMAIN;
        return {domain, subdomain, appName};
    }

    server.use("/integration/*", async function (req, res, next) {
        const {domain, subdomain, appName} = getDomainAndSubdomain(req);
        const enclaveInstance = await lightDBEnclaveFactory.createLightDBEnclaveAsync(domain, subdomain);
        const demiurgeEnclaveInstance = await lightDBEnclaveFactory.createLightDBEnclaveAsync(domain, subdomain, appName);
        const productController = require("./controllers/ProductController.js").getInstance(enclaveInstance, version);
        const batchController = require("./controllers/BatchController.js").getInstance(enclaveInstance, version);
        const leafletController = require("./controllers/LeafletController.js").getInstance(enclaveInstance, version);
        const monsterController = require("./controllers/MonsterController.js").getInstance(enclaveInstance, version);
        const auditService = require("./services/AuditService.js").getInstance(enclaveInstance);
        const demiurgeAuditService = require("./services/AuditService.js").getInstance(demiurgeEnclaveInstance);
        req.enclaveInstance = enclaveInstance;
        req.demiurgeEnclaveInstance = demiurgeEnclaveInstance;
        req.productController = productController;
        req.batchController = batchController;
        req.leafletController = leafletController;
        req.monsterController = monsterController;
        req.auditService = auditService;
        req.demiurgeAuditService = demiurgeAuditService;
        next();
    });

    //------ Product
    server.post("/integration/product/:gtin", requestBodyJSONMiddleware);
    // server.post("/integration/product/:gtin", basicPreValidationMiddleware);

    const createOrUpdateProductHandler = async function (req, res) {
        const {gtin} = req.params;
        const {domain, subdomain} = getDomainAndSubdomain(req);
        // get the domain and subdomain from query params
        //collecting and JSON parsing of productMessage
        let productMessage = req.body;

        try {
            productMessage = JSON.parse(productMessage);
        } catch (err) {
            //can we send errors to the client?!
            res.send(415, err.message);
            return;
        }

        try {
            if (productMessage.payload.strength && !productMessage.payload.strengths) {
                productMessage.payload.strengths = [{substance: "-", strength: productMessage.payload.strength}]
            }

            if (!productMessage.payload.description && productMessage.payload.nameMedicinalProduct) {
                productMessage.payload.description = productMessage.payload.nameMedicinalProduct;
            }
            if (!productMessage.payload.name && productMessage.payload.inventedName) {
                productMessage.payload.name = productMessage.payload.inventedName;
            }
            await req.productController.updateProduct(domain, subdomain, gtin, productMessage, req, res);
        } catch (err) {
            res.send(500, err.message);
        }
    }

    server.post("/integration/product/:gtin", createOrUpdateProductHandler);

    server.put("/integration/product/:gtin", requestBodyJSONMiddleware);
    server.put("/integration/product/:gtin", basicPreValidationMiddleware);
    server.put("/integration/product/:gtin", createOrUpdateProductHandler);

    server.get("/integration/product/:gtin", async function (req, res) {
        const {gtin} = req.params;
        const {domain, subdomain} = getDomainAndSubdomain(req);

        //gtin validation required...
        let {isValid} = validateGTIN(gtin);
        if (!isValid) {
            res.send(400);
            return;
        }

        let productMetadata;
        try {
            productMetadata = await req.productController.getProduct(domain, subdomain, gtin, req, res);
            if (productMetadata.strength && !productMetadata.strengths) {
                productMetadata.strengths = [{substance: "-", strength: productMetadata.strength}]
            }
            if (productMetadata.description && !productMetadata.nameMedicinalProduct) {
                productMetadata.nameMedicinalProduct = productMetadata.description;
            }

            if (productMetadata.name && !productMetadata.inventedName) {
                productMetadata.inventedName = productMetadata.name;
            }
            res.setHeader("Content-type", "text/json");
            res.send(200, productMetadata);
        } catch (err) {
            res.send(500);
            return;
        }
    });

    const imageHandler = async function (req, res) {
        const {gtin} = req.params;
        const {domain, subdomain} = getDomainAndSubdomain(req);
        //collecting and JSON parsing of productPhotoMessage
        let productPhotoMessage = req.body;

        try {
            productPhotoMessage = JSON.parse(productPhotoMessage);
        } catch (err) {
            res.send(415, err.message);
            return;
        }

        // let isValidImage = await isBase64ValidImage(productPhotoMessage.imageData)
        // if (!isValidImage) {
        //     res.send(415, "Unsupported file format");
        //     return;
        // }

        try {
            await req.productController.addImage(domain, subdomain, gtin, productPhotoMessage, req, res);
        } catch (err) {
            res.send(500);
            return;
        }
    }

    server.post("/integration/image/:gtin", requestBodyJSONMiddleware);
    server.post("/integration/image/:gtin", basicPreValidationMiddleware);
    server.post("/integration/image/:gtin", imageHandler);

    server.put("/integration/image/:gtin", requestBodyJSONMiddleware);
    server.put("/integration/image/:gtin", basicPreValidationMiddleware);
    server.put("/integration/image/:gtin", imageHandler);

    server.get("/integration/image/:gtin", async function (req, res) {
        const {gtin} = req.params;
        const {domain, subdomain} = getDomainAndSubdomain(req);

        //gtin validation required...
        let {isValid} = validateGTIN(gtin);
        if (!isValid) {
            res.send(400);
            return;
        }

        let dsuVersion;
        if (req.query && req.query.version) {
            let valid = false;
            try {
                dsuVersion = Number(req.query.version);
                valid = Number.isInteger(dsuVersion);
            } catch (e) {
                res.send(422, JSON.stringify({
                    message: "Validation failed",
                    details: "Found version query param and is not a integer."
                }));
                return;
            }
            if (dsuVersion <= 0 || !valid) {
                res.send(422, JSON.stringify({
                    message: "Validation failed",
                    details: "Query version param need to be an integer greater then zero."
                }));
                return;
            }

            //because DSUVersion is read from an array that starts with index 0 and the versions from the audit start with 1, we need to do the version increment
            dsuVersion--;
        }

        try {
            await req.productController.getImage(domain, subdomain, gtin, dsuVersion, req, res);
        } catch (err) {
            res.send(500);
        }
    });

    //------ Batch
    const createOrUpdateBatchHandler = async function (req, res) {
        const {domain, subdomain} = getDomainAndSubdomain(req);

        let batchMessage, payload, gtin, batchNumber;
        try {
            const {payload: _payload, gtin: _gtin, batchNumber: _batchNumber} = getDataFromRequest(req);
            payload = _payload;
            gtin = _gtin;
            batchNumber = _batchNumber;
            batchMessage = JSON.parse(payload);
            if (batchMessage.payload.productCode !== gtin) {
                res.send(422, JSON.stringify({
                    message: "Payload validation failed",
                    details: "Different gtin between url params and payload."
                }));
                return;
            }

            if (batchNumber !== batchMessage.payload.batchNumber) {
                res.send(422, JSON.stringify({
                    message: "Payload validation failed",
                    details: "Different batch info between url params and payload."
                }));
                return;
            }
        } catch (err) {
            res.send(415, err.message);
            return;
        }

        try {
            if (batchMessage.payload.batchNumber && !batchMessage.payload.batch) {
                batchMessage.payload.batch = batchMessage.payload.batchNumber;
            }
            await req.batchController.updateBatch(domain, subdomain, gtin, batchNumber, batchMessage, req, res);
        } catch (err) {
            res.send(500);
            return;
        }
    }
    server.put("/integration/batch/:gtin/:batchNumber", requestBodyJSONMiddleware);
    server.put("/integration/batch/:gtin/:batchNumber", basicPreValidationMiddleware);
    server.put("/integration/batch/:gtin/:batchNumber", createOrUpdateBatchHandler);

    server.post("/integration/batch/:gtin/:batchNumber", requestBodyJSONMiddleware);
    server.post("/integration/batch/:gtin/:batchNumber", basicPreValidationMiddleware);
    server.post("/integration/batch/:gtin/:batchNumber", createOrUpdateBatchHandler);
    server.get("/integration/batch/:gtin/:batchNumber", async function (req, res) {
        const {gtin, batchNumber} = req.params;
        const {domain, subdomain} = getDomainAndSubdomain(req);

        //gtin validation required...
        let {isValid} = validateGTIN(gtin);
        if (!isValid) {
            res.send(400);
            return;
        }

        let batchMetadata;
        try {
            batchMetadata = await req.batchController.getBatch(domain, subdomain, gtin, decodeURIComponent(batchNumber), req, res);
            if (batchMetadata) {
                if (!batchMetadata.batchNumber && batchMetadata.batch) {
                    batchMetadata.batchNumber = batchMetadata.batch;
                }
                res.setHeader("Content-type", "text/json");
                res.send(200, batchMetadata);
            }
        } catch (err) {
            res.send(500);
            return;
        }
    });

    //------ Leaflet

    async function productEpiHandler(req, res) {
        const {epiType, epiMarket} = req.params;
        const {domain, subdomain} = getDomainAndSubdomain(req);

        //collecting and JSON parsing of leafletMessage
        let leafletMessage, gtin, payload, language;

        try {
            const {
                payload: _payload,
                gtin: _gtin,
                language: _language,
            } = getDataFromRequest(req);

            payload = _payload;
            gtin = _gtin;
            language = _language;
            leafletMessage = JSON.parse(payload);

            /**
             * Due to a route conflict, parameters may arrive in the wrong order.
             * If `language` is actually a batch number, the values are rearranged before calling the batch handler.
             * "/integration/epi/:gtin/:language/:epiType/:epiMarket" -> ePI product call
             * "/integration/epi/:gtin/:language/:epiType" -> ePI product call
             * "/integration/epi/:gtin/:batchNumber/:language/:epiType" -> ePI batch call
             */
            if (decodeURIComponent(language) === leafletMessage.payload?.batchNumber) {
                const {language, epiType, epiMarket} = req.params;
                req.params.batchNumber = decodeURIComponent(language);
                req.params.language = epiType;
                req.params.epiType = epiMarket;
                req.params.epiMarket = null;
                return batchEpiHandler(req, res);
            }

            if (leafletMessage.payload.productCode !== gtin || language !== leafletMessage.payload.language || leafletMessage.payload.batchNumber) {
                throw new Error("The data provided in the payload does not match the query parameters.");
            }

            if (leafletMessage.payload.productCode !== gtin) {
                res.send(422, JSON.stringify({
                    message: "Payload validation failed",
                    details: "Different gtin code between payload and url param"
                }));
                return;
            }

            if (leafletMessage.payload.batchNumber) {
                res.send(422, JSON.stringify({
                    message: "Payload validation failed",
                    details: "Found batch info in payload, when it shouldn't"
                }));
                return;
            }

            if (language !== leafletMessage.payload.language) {
                res.send(422, JSON.stringify({
                    message: "Payload validation failed",
                    details: "Different language code between payload and url param"
                }));
                return;
            }
        } catch (err) {
            res.send(415, err.message);
            return;
        }
        try {
            await req.leafletController.addEPI(domain, subdomain, gtin, null, language, epiType, epiMarket, leafletMessage, req, res);
        } catch (err) {
            res.send(500);
            return;
        }
    }

    async function batchEpiHandler(req, res) {
        const {epiType} = req.params;
        const {domain, subdomain} = getDomainAndSubdomain(req);

        //collecting and JSON parsing of leafletMessage
        let leafletMessage, gtin, batchNumber, payload, language;

        try {
            const {
                payload: _payload,
                gtin: _gtin,
                batchNumber: _batchNumber,
                language: _language
            } = getDataFromRequest(req);
            payload = _payload;
            gtin = _gtin;
            batchNumber = _batchNumber;
            language = _language;
            leafletMessage = JSON.parse(payload);
            if (leafletMessage.payload.productCode !== gtin) {
                res.send(422, JSON.stringify({
                    message: "Payload validation failed",
                    details: "Different gtin code between payload and url param"
                }));
                return;
            }
            if (batchNumber !== leafletMessage.payload.batchNumber) {
                res.send(422, JSON.stringify({
                    message: "Payload validation failed",
                    details: "Different batch info between payload and url param"
                }));
                return;
            }
            if (language !== leafletMessage.payload.language) {
                res.send(422, JSON.stringify({
                    message: "Payload validation failed",
                    details: "Different language code between payload and url param"
                }));
                return;
            }
        } catch (err) {
            res.send(415, err.message);
            return;
        }

        try {
            await req.leafletController.addEPI(domain, subdomain, gtin, batchNumber, language, epiType, null, leafletMessage, req, res);
        } catch (err) {
            res.send(500);
            return;
        }
    }


    async function getEpiHandler(req, res) {
        let {gtin, language, epiType, epiMarket, batchNumber} = req.params;

        /**
         * Due to a route conflict, parameters may arrive in the wrong order.
         * If `epiType` is invalid, the values are rearranged before calling the function again.
         * "/integration/epi/:gtin/:language/:epiType/:epiMarket" -> ePI product call
         * "/integration/epi/:gtin/:language/:epiType" -> ePI product call
         * "/integration/epi/:gtin/:batchNumber/:language/:epiType" -> batch call
         */
        if (!Object.values(constants.EPI_TYPES).includes(epiType)) {
            req.params.batchNumber = decodeURIComponent(language);
            req.params.language = epiType;
            req.params.epiType = epiMarket;
            req.params.epiMarket = null;
            return getEpiHandler(req, res);
        }

        const {domain, subdomain} = getDomainAndSubdomain(req);
        let dsuVersion;
        if (req.query && req.query.version) {
            let valid = false;
            try {
                dsuVersion = Number(req.query.version);
                valid = Number.isInteger(dsuVersion);
            } catch (e) {
                res.send(422, JSON.stringify({
                    message: "Validation failed",
                    details: "Found version query param and is not a integer."
                }));
                return;
            }
            if (dsuVersion <= 0 || !valid) {
                res.send(422, JSON.stringify({
                    message: "Validation failed",
                    details: "Query version param need to be an integer greater then zero."
                }));
                return;
            }

            //because DSUVersion is read from an array that starts with index 0 and the versions from the audit start with 1, we need to do the version increment
            dsuVersion--;
        }

        //gtin validation required...
        let {isValid} = validateGTIN(gtin);
        if (!isValid) {
            res.send(400);
            return;
        }

        const Languages = require("../utils/Languages.js");
        let langRegex = Languages.getLanguageRegex();
        if (!language || !langRegex.test(language)) {
            res.send(400);
            return;
        }

        if (Object.values(EPI_TYPES).indexOf(epiType) === -1) {
            res.send(400, `Invalid epi type: ${epiType}.`);
            return;
        }

        if (batchNumber && epiMarket) {
            res.send(400, "Markets are not available at the epi batch level.");
            return;
        }

        let EPI;
        try {
            if (batchNumber) {
                batchNumber = decodeURIComponent(batchNumber);
            }
            EPI = await req.leafletController.getEPI(domain, subdomain, gtin, batchNumber, language, epiType, epiMarket, dsuVersion, req, res);

            if (!EPI) {
                return res.send(404, `Not found EPI type ${epiType} for language ${language}`)
            }

            if (EPI.batchCode && !EPI.batchNumber) {
                EPI.batchNumber = EPI.batchCode;
            }
            if (!EPI.batchCode && EPI.batchNumber) {
                EPI.batchCode = EPI.batchNumber;
            }
        } catch (err) {
            return res.send(500);
        }

        res.setHeader("Content-type", "text/json");
        res.send(200, JSON.stringify(EPI));
    }

    async function deleteProductEpiHandler(req, res) {
        const {gtin, language, epiType, epiMarket} = req.params;
        const {domain, subdomain} = getDomainAndSubdomain(req);

        //gtin validation required...
        let {isValid} = validateGTIN(gtin);
        if (!isValid) {
            res.send(400);
            return;
        }

        const Languages = require("../utils/Languages.js");
        let langRegex = Languages.getLanguageRegex();
        if (!language) {
            res.send(400);
            return;
        }

        if(!langRegex.test(language)){
            req.params.batchNumber = decodeURIComponent(language);
            req.params.language = epiType;
            req.params.epiType = epiMarket;
            req.params.epiMarket = null;
            return deleteBatchEpiHandler(req, res)
        }

        try {
            await req.leafletController.deleteEPI(domain, subdomain, gtin, undefined, language, epiType, epiMarket, req, res);
        } catch (err) {
            console.error(err);
            res.send(500);
            return;
        }
    }

    async function deleteBatchEpiHandler(req, res) {
        const {gtin, batchNumber, language, epiType} = req.params;
        const {domain, subdomain} = getDomainAndSubdomain(req);

        //gtin validation required...
        let {isValid} = validateGTIN(gtin);
        if (!isValid) {
            res.send(400);
            return;
        }

        const Languages = require("../utils/Languages.js");
        let langRegex = Languages.getLanguageRegex();
        if (!language || !langRegex.test(language)) {
            res.send(400);
            return;
        }

        try {
            await req.leafletController.deleteEPI(domain, subdomain, gtin, decodeURIComponent(batchNumber), language, epiType, undefined, req, res);
        } catch (err) {
            res.send(500);
            return;
        }
    }


    // PRODUCT PUT
    server.put("/integration/epi/:gtin/:language/:epiType/:epiMarket", requestBodyJSONMiddleware);
    server.put("/integration/epi/:gtin/:language/:epiType/:epiMarket", basicPreValidationMiddleware);
    server.put("/integration/epi/:gtin/:language/:epiType/:epiMarket", productEpiHandler);

    server.put("/integration/epi/:gtin/:language/:epiType", requestBodyJSONMiddleware);
    server.put("/integration/epi/:gtin/:language/:epiType", basicPreValidationMiddleware);
    server.put("/integration/epi/:gtin/:language/:epiType", productEpiHandler);

    // BATCH PUT
    server.put("/integration/epi/:gtin/:batchNumber/:language/:epiType", requestBodyJSONMiddleware);
    server.put("/integration/epi/:gtin/:batchNumber/:language/:epiType", basicPreValidationMiddleware);
    server.put("/integration/epi/:gtin/:batchNumber/:language/:epiType", batchEpiHandler);

    // PRODUCT POST
    server.post("/integration/epi/:gtin/:language/:epiType/:epiMarket", requestBodyJSONMiddleware);
    server.post("/integration/epi/:gtin/:language/:epiType/:epiMarket", basicPreValidationMiddleware);
    server.post("/integration/epi/:gtin/:language/:epiType/:epiMarket", productEpiHandler);

    server.post("/integration/epi/:gtin/:language/:epiType", requestBodyJSONMiddleware);
    server.post("/integration/epi/:gtin/:language/:epiType", basicPreValidationMiddleware);
    server.post("/integration/epi/:gtin/:language/:epiType", productEpiHandler);

    // BATCH POST
    server.post("/integration/epi/:gtin/:batchNumber/:language/:epiType", requestBodyJSONMiddleware);
    server.post("/integration/epi/:gtin/:batchNumber/:language/:epiType", basicPreValidationMiddleware);
    server.post("/integration/epi/:gtin/:batchNumber/:language/:epiType", batchEpiHandler);

    // PRODUCT GET
    server.get("/integration/epi/:gtin/:language/:epiType/:epiMarket", getEpiHandler);
    server.get("/integration/epi/:gtin/:language/:epiType", getEpiHandler);

    // BATCH GET
    server.get("/integration/epi/:gtin/:batchNumber/:language/:epiType", getEpiHandler);


//    server.delete("/integration/epi/:gtin/:language/:epiType", requestBodyJSONMiddleware);
//    server.delete("/integration/epi/:gtin/:language/:epiType", basicPreValidationMiddleware);
    server.delete("/integration/epi/:gtin/:language/:epiType/:epiMarket", deleteProductEpiHandler);
    server.delete("/integration/epi/:gtin/:language/:epiType", deleteProductEpiHandler);

//    server.delete("/integration/epi/:gtin/:batchNumber/:language/:epiType", requestBodyJSONMiddleware);
//    server.delete("/integration/epi/:gtin/:batchNumber/:language/:epiType", basicPreValidationMiddleware);
    server.delete("/integration/epi/:gtin/:batchNumber/:language/:epiType", deleteBatchEpiHandler);

    //------ Messages
    server.put("/integration/message", requestBodyJSONMiddleware);
    server.put("/integration/message", async function (req, res) {
        let message = req.body;
        const {domain, subdomain} = getDomainAndSubdomain(req);

        try {
            message = JSON.parse(message);
        } catch (err) {
            res.send(415, err.message);
            return;
        }

        try {
            await req.monsterController.digestMessage(domain, subdomain, message, req, res);
        } catch (err) {
            res.send(500);
            return;
        }
    });

    server.put("/integration/multipleMessages", requestBodyJSONMiddleware);
    server.put("/integration/multipleMessages", async function (req, res) {
        let message = req.body;
        const {domain, subdomain} = getDomainAndSubdomain(req);

        try {
            message = JSON.parse(message);
        } catch (err) {
            res.send(415, err.message);
            return;
        }

        try {
            await req.monsterController.digestMultipleMessages(domain, subdomain, message, req, res);
        } catch (err) {
            res.send(500);
            return;
        }
    });


    server.get("/integration/listProducts", async (req, res) => {
        const urlModule = require('url');
        const urlParts = urlModule.parse(req.url, true);
        const {query, start, sort, number} = urlParts.query;
        let products;
        try {
            products = await req.productController.listProducts(parseInt(start), parseInt(number), stringToArray(query), sort, req, res);
        } catch (e) {
            return res.send(500);
        }
        res.setHeader("Content-type", "text/json");
        res.send(200, JSON.stringify(products));
    })

    function stringToArray(string) {
        let splitString = string.split(",");
        let arr = [];
        splitString.forEach((query) => {
            arr.push(query);
        });
        return arr;
    }

    server.get("/integration/listBatches", async (req, res) => {
        const urlModule = require('url');
        const urlParts = urlModule.parse(req.url, true);
        const {query, start, sort, number} = urlParts.query;
        let batches;
        try {
            batches = await req.batchController.listBatches(parseInt(start), parseInt(number), stringToArray(query), sort, req, res);
        } catch (e) {
            return res.send(500);
        }
        res.setHeader("Content-type", "text/json");
        res.send(200, JSON.stringify(batches));
    })

    server.get("/integration/listProductLangs/:gtin/:epiType", async (req, res) => {
        const {gtin, epiType} = req.params;
        const {domain, subdomain} = getDomainAndSubdomain(req);

        let languages;
        try {
            languages = await req.productController.listLanguages(domain, subdomain, gtin, epiType, req, res);
        } catch (e) {
            return res.send(500);
        }
        res.setHeader("Content-type", "text/json");
        res.send(200, JSON.stringify(languages));
    })

    server.get("/integration/listProductMarkets/:gtin/:epiType", async (req, res) => {
        const {gtin, epiType} = req.params;
        const {domain, subdomain} = getDomainAndSubdomain(req);
        let markets;
        try {
            markets = await req.productController.listMarkets(domain, subdomain, gtin, epiType, req, res);
        } catch (e) {
            return res.send(500);
        }
        res.setHeader("Content-type", "text/json");
        res.send(200, JSON.stringify(markets));
    });

    server.get("/integration/listBatchLangs/:gtin/:batchNumber/:epiType", async (req, res) => {
        const {gtin, batchNumber, epiType} = req.params;
        const {domain, subdomain} = getDomainAndSubdomain(req);

        let languages;
        try {
            languages = await req.batchController.listLanguages(domain, subdomain, gtin, decodeURIComponent(batchNumber), epiType, req, res);
        } catch (e) {
            return res.send(500);
        }
        res.setHeader("Content-type", "text/json");
        res.send(200, JSON.stringify(languages));
    });

    server.get("/integration/audit/:logType", async (req, res) => {
        const urlModule = require('url');
        const urlParts = urlModule.parse(req.url, true);
        const {logType} = req.params;
        const {query, start, sort, number} = urlParts.query;
        let auditService;
        if(logType === AUDIT_LOG_TYPES.DEMIURGE_USER_ACTION || logType === AUDIT_LOG_TYPES.DEMIURGE_USER_ACCESS){
            auditService = req.demiurgeAuditService;
        } else {
            auditService = req.auditService;
        }
        let logs;
        try {
            logs = await auditService.filterAuditLogs(logType, parseInt(start), parseInt(number), stringToArray(query), sort);
        } catch (e) {
            return res.send(500);
        }

        res.setHeader("Content-type", "text/json");
        res.send(200, JSON.stringify(logs));
    });

    server.post("/integration/audit/:logType", requestBodyJSONMiddleware);
    server.post("/integration/audit/:logType", async (req, res) => {
        const {logType} = req.params;
        let auditMessage = req.body;
        let auditService;
        if(logType === AUDIT_LOG_TYPES.DEMIURGE_USER_ACTION || logType === AUDIT_LOG_TYPES.DEMIURGE_USER_ACCESS){
            auditService = req.demiurgeAuditService;
        } else {
            auditService = req.auditService;
        }
        try {
            auditMessage = JSON.parse(auditMessage);
        } catch (err) {
            //can we send errors to the client?!
            res.send(415, err.message);
            return;
        }
        try {
            await auditService.addLog(logType, auditMessage, req, res);
        } catch (err) {
            res.send(500, "Failed to audit user access");
            return;
        }
        res.setHeader("Content-type", "text/json");
        res.send(200, JSON.stringify({logType: "saved"}));
    });

    // PUT /integration/{domain}/productGroupedMessages/{gtin}
    server.put("/integration/productGroupedMessages/:gtin", requestBodyJSONMiddleware);
    server.put("/integration/productGroupedMessages/:gtin", async function (req, res) {
        let messages = req.body;
        let {gtin} = req.params;

        try {
            messages = JSON.parse(messages);
        } catch (err) {
            res.send(415, err.message);
            return;
        }

        try {
            await req.monsterController.digestProductGroupedMessages(gtin, messages, req, res);
        } catch (err) {
            res.send(500);
            return;
        }
    });

    server.put("/integration/batchGroupedMessages/:gtin/:batchNumber", requestBodyJSONMiddleware);
    server.put("/integration/batchGroupedMessages/:gtin/:batchNumber", async function (req, res) {
        let messages = req.body;
        let {gtin, batchNumber} = req.params;

        try {
            messages = JSON.parse(messages);
        } catch (err) {
            res.send(415, err.message);
            return;
        }

        try {
            await req.monsterController.digestBatchGroupedMessages(gtin, decodeURIComponent(batchNumber), messages, req, res);
        } catch (err) {
            res.send(500);
            return;
        }
    });

    async function objectStatusHandler(req, res) {
        let {gtin, batchNumber} = req.params;

        //gtin validation required...
        let {isValid} = validateGTIN(gtin);
        if (!isValid) {
            res.send(400);
            return;
        }

        let controller;
        const {domain, subdomain} = getDomainAndSubdomain(req);
        let args = [domain, subdomain, gtin];
        if (!batchNumber) {
            controller = req.productController;
        } else {
            controller = req.batchController;
            args.push(decodeURIComponent(batchNumber));
        }
        args.push(version);

        let status;
        try {
            status = await controller.checkObjectStatus(...args);
        } catch (err) {
            console.error(err);
            res.statusCode = 500;
            res.end();
            return;
        }

        res.statusCode = 200;
        res.setHeader("Content-type", "text/plain");
        res.setHeader("Content-length", status.length);
        res.end(status);
    }

    server.get("/integration/objectStatus/:gtin", objectStatusHandler)
    server.get("/integration/objectStatus/:gtin/:batchNumber", objectStatusHandler);

    async function recoverObjectHandler(req, res) {
        let {gtin, batchNumber} = req.params;

        //gtin validation required...
        let {isValid} = validateGTIN(gtin);
        if (!isValid) {
            res.send(400);
            return;
        }

        let controller;
        const {domain, subdomain} = getDomainAndSubdomain(req);
        let args = [domain, subdomain, gtin];
        if (!batchNumber) {
            controller = req.productController;
        } else {
            controller = req.batchController;
            args.push(decodeURIComponent(batchNumber));
        }
        //args.push(version);

        try {
            await controller.recover(...args, req, res);
        } catch (err) {
            console.error(err);
            res.statusCode = 500;
            res.end();
            return;
        }

        //at this point in time a result should have been sent to client
    }

    server.post("/integration/recoverProduct/:gtin", recoverObjectHandler)
    server.post("/integration/recoverBatch/:gtin/:batchNumber", recoverObjectHandler);

    server.put("/doMigration", requestBodyJSONMiddleware);
    server.put("/doMigration", async (req, res) => {
        let body;
        try {
            body = JSON.parse(req.body);
        } catch (err) {
            res.send(415, err.message);
            return;
        }
        let {epiEnclaveKeySSI} = body;
        migrateDataFromEpiEnclaveToLightDB(EPI_DOMAIN, EPI_SUBDOMAIN, epiEnclaveKeySSI).catch(err => {
            console.error(err);
        })
        res.statusCode = 200;
        return res.end();
    });


    server.put("/doDemiurgeMigration", requestBodyJSONMiddleware);
    server.put("/doDemiurgeMigration", async (req, res) => {
        let body;
        try {
            body = JSON.parse(req.body);
        } catch (err) {
            res.send(415, err.message);
            return;
        }
        let {demiurgeSharedEnclaveKeySSI} = body;
        const demiurgeMigration = require("./utils/demiurgeMigration.js");
        demiurgeMigration.migrateDataFromDemiurgeSharedEnclaveToLightDB(EPI_DOMAIN, EPI_SUBDOMAIN, demiurgeSharedEnclaveKeySSI).catch(err => {
            console.error(err);
        });
        res.statusCode = 200;
        return res.end();
    });

    server.get("/getDemiurgeMigrationStatus", async (req, res) => {
        const demiurgeMigration = require("./utils/demiurgeMigration.js");
        let status;
        try {
            status = await demiurgeMigration.getDemiurgeMigrationStatus();
        } catch (err) {
            console.error(err);
            res.statusCode = 500;
            res.end();
            return;
        }
        res.statusCode = 200;
        res.end(status);
    });

    server.get("/getMigrationStatus", async (req, res) => {
        let migrationStatus;
        try {
            migrationStatus = await getMigrationStatus();
        } catch (err) {
            console.error(err);
            res.statusCode = 500;
            res.end();
            return;
        }
        res.statusCode = 200;
        res.end(migrationStatus);
    })

    server.delete("/resetUserDID/:didDomain", async (req, res) => {
        const didDomain = req.params.didDomain;
        const APP_NAME = "DSU_Fabric";
        const didName = `${APP_NAME}/${req.headers["user-id"]}`
        const fs = require("fs").promises;
        const path = require("path");
        const openDSU = require("opendsu");
        const keySSISpace = openDSU.loadAPI("keyssi");
        try {
            const constSSI = keySSISpace.createConstSSI(didDomain, didName);
            const anchorId = constSSI.getAnchorIdSync();
            const anchorPath = path.join(server.rootFolder, "external-volume", "domains", didDomain, "anchors", anchorId);
            await fs.rm(anchorPath, {force: true});
            res.statusCode = 200;
            res.end();
        } catch (e) {
            console.error(e);
            res.statusCode = 500;
            res.end("Failed to reset user DID");
        }
    })

    const GET_EPI_GROUP_URL = "/getEpiGroup";

    if (typeof server.whitelistUrlForSessionTimeout === "function") {
        server.whitelistUrlForSessionTimeout(GET_EPI_GROUP_URL);
    } else {
        throw new Error(`Failed to whitelist url ${GET_EPI_GROUP_URL}. Method not found in server instance.`);
    }

    server.get(GET_EPI_GROUP_URL, async (req, res) => {
        const APP_NAME = "DSU_Fabric";
        const apihub = require("apihub");
        const crypto = require("opendsu").loadAPI("crypto");
        const secretsServiceInstance = await apihub.getSecretsServiceInstanceAsync();
        const userId = req.headers["user-id"];
        const secretName = crypto.sha256JOSE(APP_NAME + userId, "base64url");
        let secret;
        let apiKey;
        try {
            secret = secretsServiceInstance.getSecretSync(secretsServiceInstance.constants.CONTAINERS.USER_API_KEY_CONTAINER_NAME, secretName);
        } catch (e) {
            res.statusCode = 404;
            res.end("Not authorized");
            return;
        }

        try {
            secret = JSON.parse(secret);
            if (Object.keys(secret).length === 0) {
                throw new Error("Invalid secret");
            }
            apiKey = JSON.parse(Object.values(secret)[0]);
            res.statusCode = 200;
            res.setHeader("Content-type", "text/plain");
            res.end(apiKey.scope);
        } catch (e) {
            console.error(e);
            res.statusCode = 500;
            res.end("Failed to parse secret.");
        }
    });
}

},{"../../index":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/index.js","../constants/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","../utils/Languages.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/Languages.js","../utils/ValidationUtils.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/ValidationUtils.js","./controllers/BatchController.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/controllers/BatchController.js","./controllers/LeafletController.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/controllers/LeafletController.js","./controllers/MonsterController.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/controllers/MonsterController.js","./controllers/ProductController.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/controllers/ProductController.js","./services/AuditService.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/services/AuditService.js","./utils/LightDBEnclaveFactory.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/LightDBEnclaveFactory.js","./utils/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/constants.js","./utils/dataMigration.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/dataMigration.js","./utils/demiurgeMigration.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/demiurgeMigration.js","./utils/middlewares.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/middlewares.js","apihub":false,"fs":false,"opendsu":false,"path":false,"url":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/models/Batch.js":[function(require,module,exports){
const ModelBase = require("./ModelBase.js");
const GTIN_SSI = require("../../GTIN_SSI.js");
const constants = require("../../constants/constants.js");

function Batch(enclave, domain, subdomain, gtin, batchNumber, version) {
    let instance = new ModelBase(enclave, domain, subdomain, gtin);

    //all the data that needs to be serialized as JSON needs to be added to the instance as soon as possible
    instance.productCode = gtin;
    instance.batchNumber = batchNumber;
    //there is version specific paths and logic that may need to be carefully treated
    instance.epiProtocol = `v${version}`;

    instance.getJSONStoragePath = () => {
        return `/batch.epi_${instance.epiProtocol}`;
    }

    instance.getLeafletStoragePath = (language, type) => {
        let path = `/${type}`;
        if (language) {
            path += `/${language}`;
        }
        return path;
    }

    instance.getLeafletFilePath = (language, type) => {
        return `${instance.getLeafletStoragePath(language, type)}/${type}.xml`;
    }

    instance.getMutableMountingPoint = () => {
        return constants.BATCH_DSU_MOUNT_POINT;
    }

    instance.getPathOfPathSSI = () => {
        return {
            path: `0/${gtin}/${batchNumber}`,
            domain: subdomain
        };
    }

    instance.getGTINSSI = () => {
        return GTIN_SSI.createGTIN_SSI(domain, subdomain, instance.productCode, instance.batchNumber);
    }


    let persist = instance.persist;
    instance.persist = async (auditContext) => {
        let diffs = await persist.call(instance, auditContext);
        //we need to trigger this only at the creation of the batch...
        if(auditContext && auditContext.operation === "Created Batch"){
            let languages = require("./../../utils/Languages.js").getList();
            let langs = [];
            for(let lang of languages){
                let {code} = lang;
                langs.push(code);
            }
            let fixedUrlUtils = require("./../../mappings/utils.js");
            await fixedUrlUtils.registerLeafletFixedUrlByDomainAsync(domain, subdomain, "leaflet", gtin, langs, instance.batchNumber, undefined, instance.epiProtocol);
        }

        try{
            //we don't wait for the request to be finalized because of the delays between fixedUrl and lightDB
            $$.promisify(require("../../mappings/utils").activateGtinOwnerFixedUrl)(undefined, domain, gtin);
            $$.promisify(require("../../mappings/utils").activateLeafletFixedUrl)(undefined, domain, gtin);
        }catch(err){
            //ignore them for now...
        }

        return diffs;
    }

    const loadMetadata = instance.loadMetadata;
    instance.loadMetadata = async () => {
        await loadMetadata.call(instance);
        instance.batchNumber = instance.batchNumber || instance.batch;
        instance.inventedName = instance.inventedName || instance.productName;
        instance.nameMedicinalProduct = instance.nameMedicinalProduct || instance.productName;
        instance.productCode = instance.productCode || instance.gtin;
        instance.expiryDate = instance.expiryDate || instance.expiry;
        instance.batchRecall = instance.batchRecall || "";
        instance.importLicenseNumber = instance.importLicenseNumber || "";
        instance.dateOfManufacturing = instance.dateOfManufacturing || "";
        instance.manufacturerName = instance.manufacturerName || "";
        instance.manufacturerAddress1 = instance.manufacturerAddress1 || "";
        instance.manufacturerAddress2 = instance.manufacturerAddress2 || "";
        instance.manufacturerAddress3 = instance.manufacturerAddress3 || "";
        instance.manufacturerAddress4 = instance.manufacturerAddress4 || "";
        instance.manufacturerAddress5 = instance.manufacturerAddress5 || "";
    }

    return instance;
}

module.exports = Batch;

},{"../../GTIN_SSI.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/GTIN_SSI.js","../../constants/constants.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","../../mappings/utils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/utils.js","./../../mappings/utils.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/utils.js","./../../utils/Languages.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/Languages.js","./ModelBase.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/models/ModelBase.js"}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/models/ModelBase.js":[function(require,module,exports){
const {EventRecorder, EVENTS} = require("../utils/Events");
const {getImageAsBase64} = require("../../utils/CommonUtils");
const XMLDisplayService = require("../../services/XMLDisplayService/XMLDisplayService");

function ModelBase(enclave, domain, subdomain, gtin) {
    let eventRecorder;
    this.getEventRecorderInstance = async () => {
        if (!eventRecorder) {
            eventRecorder = new EventRecorder(this.ensureDSUStructure);
        }
        return eventRecorder;
    }

    this.getEnclave = () => {
        return enclave;
    }

    this.getGTINSSI = () => {
        throw new Error("Not implemented! Needs to be implemented in the wrapper class");
    }

    this.getLeafletStoragePath = () => {
        throw new Error("Not implemented! Needs to be implemented in the wrapper class");
    }

    this.getLeafletFilePath = () => {
        throw new Error("Not implemented! Needs to be implemented in the wrapper class");
    }

    this.getJSONStoragePath = () => {
        throw new Error("Not implemented! Needs to be implemented in the wrapper class");
    }

    this.getMutableMountingPoint = () => {
        throw new Error("Not implemented! Needs to be implemented in the wrapper class");
    }

    this.getPathOfPathSSI = () => {
        throw new Error("Not implemented! Needs to be implemented in the wrapper class");
    }

    let immutableDSU;
    this.loadImmutableDSUInstance = async () => {
        if (immutableDSU) {
            return immutableDSU;
        }
        const keySSI = this.getGTINSSI();
        return await this.loadDSUInstance(keySSI);
    }

    let pathKeySSI;
    this.getPathKeySSI = async () => {
        if (!pathKeySSI) {
            const {domain, path} = this.getPathOfPathSSI();
            pathKeySSI = await $$.promisify(enclave.createPathKeySSI)($$.SYSTEM_IDENTIFIER, domain, path);
        }
        return pathKeySSI;
    }

    this.getMutableSeedSSI = async () => {
        let pathKeySSI = await this.getPathKeySSI();
        const seedSSI = await $$.promisify(pathKeySSI.derive)();

        return seedSSI;
    }

    this.createImmutableDSUInstance = async () => {
        const keySSI = this.getGTINSSI();
        return this.createDSUInstanceForSSI(keySSI);
    }

    let mutableDSU;

    this.createMutableDSUInstance = async () => {
        const keySSI = await this.getMutableSeedSSI();
        if (mutableDSU) {
            return mutableDSU;
        }
        mutableDSU = await this.createDSUInstanceForSSI(keySSI);
        return mutableDSU;
    }

    this.loadMutableDSUInstance = async (dsuVersion) => {
        const keySSI = await this.getMutableSeedSSI();
        if (mutableDSU && !dsuVersion) {
            return mutableDSU;
        }
        if (dsuVersion) {
            keySSI.setDSUVersionHint(dsuVersion);
        }
        mutableDSU = await this.loadDSUInstance(keySSI);
        return mutableDSU;
    }

    this.loadDSUInstance = async (keySSI) => {
        const loadDSU = $$.promisify(enclave.loadDSU, enclave);
        let dsuInstance = await loadDSU($$.SYSTEM_IDENTIFIER, keySSI);
        return dsuInstance;
    }

    this.createDSUInstanceForSSI = async (keySSI) => {
        const createDSUForExistingSSI = $$.promisify(enclave.createDSUForExistingSSI, enclave);
        let dsuInstance = await createDSUForExistingSSI(keySSI, {addLog: false});
        return dsuInstance;
    }

    this.ensureDSUStructure = async () => {
        let immutableDSU;
        try {
            immutableDSU = await this.loadImmutableDSUInstance();
        } catch (e) {
            //TODO: CODE-REVIEW - we should handle different the network errors in order to prevent any anchoring conflict, if possible
            immutableDSU = await this.createImmutableDSUInstance();
        }

        let mutableDSU;
        try {
            mutableDSU = await this.loadMutableDSUInstance();
            return {mutableDSU};
        } catch (e) {
            //TODO: CODE-REVIEW - we should handle different the network errors in order to prevent any anchoring conflict, if possible
            mutableDSU = await this.createMutableDSUInstance();
        }

        let sreadSSI = await $$.promisify(mutableDSU.getKeySSIAsString)("sread");
        const mutableMountingPoint = this.getMutableMountingPoint();
        const existingFilesAndFolders = await $$.promisify(immutableDSU.readDir)(mutableMountingPoint);
        let batchId;
        if (existingFilesAndFolders.length === 0) {
            batchId = await immutableDSU.startOrAttachBatchAsync();
            await $$.promisify(immutableDSU.mount)(mutableMountingPoint, sreadSSI);
        }
        return {mutableDSU, immutableDSU, batchId};
    }

    this.registerFixedUrl = async (language, epiType, ensureGtinOwner = true) => {
        try {
            let fixedUrlUtils = require("./../../mappings/utils.js");
            if(ensureGtinOwner){
                await fixedUrlUtils.registerGtinOwnerFixedUrlByDomainAsync(domain, gtin);
            }
            if (this.batchNumber) {
                await fixedUrlUtils.registerLeafletFixedUrlByDomainAsync(domain, subdomain, epiType, gtin, language, this.batchNumber, undefined, this.epiProtocol);
            }else{
                await fixedUrlUtils.registerLeafletFixedUrlByDomainAsync(domain, subdomain, epiType, gtin, language, undefined, this.expiryDate, this.epiProtocol);
            }
            await fixedUrlUtils.deactivateLeafletFixedUrlAsync(undefined, domain, gtin);
        } catch (err) {
            //if cleanup fails mapping needs to fail...
            console.log("Failed to trigger FixedUrl", err);
            const errMap = require("opendsu").loadApi("m2dsu").getErrorsMap();
            const errorUtils = require("../../mappings/errors/errorUtils.js");
            errorUtils.addMappingError("NOT_ABLE_TO_ENSURE_DATA_CONSISTENCY_ON_SERVER");
            throw errMap.newCustomError(errMap.errorTypes.NOT_ABLE_TO_ENSURE_DATA_CONSISTENCY_ON_SERVER, epiType);
        }
    }

    this.addEPI = async (language, epiType, epiMarket, base64XMLFileContent, otherFilesContent) => {
        if (!otherFilesContent) {
            base64XMLFileContent = epiMarket;
            otherFilesContent = base64XMLFileContent;
            epiMarket = "";
        }

        await this.registerFixedUrl(language, epiType);
        const epiPath = this.getLeafletFilePath(language, epiType, epiMarket);
        const storagePath = this.getLeafletStoragePath(language, epiType, epiMarket);
        const eventRecorder = await this.getEventRecorderInstance(this.getGTINSSI());
        // if already exists should be replaced, so try to delete first
        eventRecorder.register(EVENTS.DELETE, storagePath);
        eventRecorder.register(EVENTS.WRITE, epiPath, $$.Buffer.from(base64XMLFileContent, "base64"));
        if (otherFilesContent) {
            for (let i = 0; i < otherFilesContent.length; i++) {
                let filePath = `${storagePath}/${otherFilesContent[i].filename}`;
                eventRecorder.register(EVENTS.WRITE, filePath, $$.Buffer.from(otherFilesContent[i].fileContent, "base64"));
            }
        }
    }

    this.getEpi = async (language, epiType, epiMarket, dsuVersion) => {

        const epiPath = this.getLeafletStoragePath(language, epiType, epiMarket);
        const dsu = await this.loadMutableDSUInstance(dsuVersion);
        let files = await $$.promisify(dsu.listFiles)(epiPath);
        let epiResult;
        if (files && files.length > 0) {
            epiResult = {otherFilesContent: []}
            for (let file of files) {
                let fileContent = await dsu.readFileAsync(`${epiPath}/${file}`);
                if (file.endsWith("xml")) {
                    epiResult.xmlFileContent = fileContent.toString("base64");
                } else {
                    epiResult.otherFilesContent.push({filename: file, fileContent: getImageAsBase64(fileContent)})
                }
            }
        }
        return epiResult;
    }

    this.deleteEPI = async (language, epiType, epiMarket) => {
        await this.registerFixedUrl(language, epiType);
        let existing = false;
        try {
            existing = !!await this.getEpi(language, epiType, epiMarket);
        } catch (err) {

        }
        let eventRecorder = await this.getEventRecorderInstance(this.getGTINSSI());
        eventRecorder.register(EVENTS.DELETE, this.getLeafletStoragePath(language, epiType, epiMarket));
        return existing;
    }

    this.listLanguages = async (epiType, batchNumber) => {
        const constants = require("../utils/constants");
        const XMLDisplayService = require("../../services/XMLDisplayService/XMLDisplayService.js");
        const simulatedModel = {networkName: domain, product: {gtin}};
        let xmlDisplayService = new XMLDisplayService(undefined, this.getGTINSSI(), simulatedModel, epiType, undefined);
        if (batchNumber) {
            return $$.promisify(xmlDisplayService.getAvailableLanguagesForBatch, xmlDisplayService)();
        }
        return $$.promisify(xmlDisplayService.getAvailableLanguagesForProduct, xmlDisplayService)();
    }

    //check version before doing any deserialization
    this.loadMetadata = async () => {
        let dsu = await this.loadImmutableDSUInstance(this.getGTINSSI());
        let jsonSerialization = await dsu.readFileAsync(`${this.getMutableMountingPoint()}${this.getJSONStoragePath()}`);
        Object.assign(this, JSON.parse(jsonSerialization));
    }

    //check version before doing any serialization
    this.update = (data) => {
        Object.assign(this, data);
        let clonedThis = JSON.parse(JSON.stringify(this));
        //the version should not be stored in DSU !!!
        //the version is read from the blockchain/database when needed
        clonedThis.version = undefined;
        delete clonedThis.version;
        let content = JSON.stringify(clonedThis);
        eventRecorder.register(EVENTS.WRITE, this.getJSONStoragePath(), content, true);
    }

    this.immutableDSUIsCorrupted = async () => {
        try {
            await this.loadImmutableDSUInstance();
        } catch (err) {
            const gtinSSI = await this.getGTINSSI();
            const openDSU = require("opendsu");
            const brickingAPI = openDSU.loadAPI("bricking");
            const anchoringAPI = openDSU.loadAPI("anchoring").getAnchoringX();
            let lastVersion;
            try {
                lastVersion = await $$.promisify(anchoringAPI.getLastVersion)(gtinSSI);
            } catch (e) {
                return false;
            }

            if (!lastVersion) {
                return false;
            }

            try {
                await $$.promisify(brickingAPI.getBrick)(lastVersion);
            } catch (e) {
                return true;
            }
            return false;
        }
    }

    this.persist = async (auditContext) => {
        if (eventRecorder) {
            return await eventRecorder.execute(auditContext);
            //at this point we should end batch on dsu...?!
        }
        throw new Error("Nothing to persist");
    }

    this.recover = async () => {
        let pathSSI = await this.getPathKeySSI();
        let seedSSI = await $$.promisify(pathSSI.derive)();
        let sreadSSI = await $$.promisify(seedSSI.derive)();
        const gtinSSI = await this.getGTINSSI();

        //this var will help keep track of the new version that we will create
        let nextVersion = undefined;

        // inner function
        let recoverDSU = async (ssi, recoveryFnc) => {
            return new Promise(async (resolve, reject) => {
                let enclave = this.getEnclave();

                //this is just a wrapper of the recoveryFnc in order to manage the batch process
                let recoverFnc = async (dsu, callback) => {
                    //because in the recoveryFnc the content get "recovered" we need to control the batch for those operations
                    let batchId = await dsu.startOrAttachBatchAsync();
                    recoveryFnc(dsu, async (err, dsu) => {
                        if (err) {
                            return callback(err);
                        }
                        dsu.commitBatch(batchId, callback);
                    });
                };

                let dsu;
                try {
                    dsu = await $$.promisify(enclave.loadDSURecoveryMode)($$.SYSTEM_IDENTIFIER, ssi, recoverFnc);
                } catch (err) {
                    reject(err);
                    return;
                }

                //not sure why we had this timeout, but i'll leave it for backward compatible behaviour
                // setTimeout(() => {
                resolve(dsu);
                // }, 3000);
            })
        }

        //we keep the callback arg due to how resolver.recovery method works...
        let recoveryImmutableDSU = async (dsu, callback) => {
            let error;

            try {
                await $$.promisify(dsu.mount)(this.getMutableMountingPoint(), sreadSSI.getIdentifier());
            } catch (err) {
                const mountError = createOpenDSUErrorWrapper("Failed to mount mutable DSU", err);
                error = mountError;
            }

            return callback(error, dsu);
        }

        //we keep the callback arg due to how resolver.recovery method works...
        let recoveryMutableDSU = async (dsu, callback) => {
            dsu.writeFile("/recovered", new Date().toISOString(), async (err) => {
                if (err) {
                    return callback(err);
                }

                try {
                    nextVersion = await require("opendsu").loadApi("anchoring").getNextVersionNumberAsync(dsu.getCreationSSI());
                } catch (err) {
                    throw Error("Failed to get next dsu version");
                }

                return callback(undefined, dsu);
            });
        }

        return new Promise(async (resolve, reject) => {
            try {
                await recoverDSU(gtinSSI, recoveryImmutableDSU);
                let recoveredMutableDSU;
                let mutableJustCreated = false;
                try{
                    recoveredMutableDSU = await recoverDSU(seedSSI, recoveryMutableDSU);
                }catch(err){
                    let mutableAnchorId = await seedSSI.getAnchorIdAsync();
                    const openDSU = require("opendsu");
                    const anchoringAPI = openDSU.loadAPI("anchoring").getAnchoringX();
                    let version = await $$.promisify(anchoringAPI.getLastVersion)(mutableAnchorId);
                    if(!version){
                        recoveredMutableDSU = await this.createMutableDSUInstance();
                        let batchId = await recoveredMutableDSU.startOrAttachBatchAsync();
                        await $$.promisify(recoveryMutableDSU)(recoveredMutableDSU);
                        await recoveredMutableDSU.commitBatchAsync(batchId);
                        mutableJustCreated = true;
                    }else{
                        throw err;
                    }
                }

                let jsonInitializationRequired = false;
                try {
                     await recoveredMutableDSU.readFileAsync(this.getJSONStoragePath());
                } catch (err) {
                    if (err.message === `Path <${this.getJSONStoragePath()}> not found.` || mutableJustCreated) {
                        //we are not able to read the json file, so we need to create an empty one.
                        jsonInitializationRequired = true;
                    } else {
                        throw err;
                    }
                }

                if (jsonInitializationRequired) {
                    try {
                        await this.getEventRecorderInstance(this.getGTINSSI());
                        this.update({version: nextVersion});
                        await this.persist();
                    } catch (err) {
                        throw Error("Failed to store default json structure");
                    }
                }
            } catch (err) {
                return reject(err);
            }
            resolve(nextVersion);
        });
    }

    this.getBlockchainDSUVersion = async () => {
        let mutableDSU = await this.loadMutableDSUInstance();
        let version = await require("opendsu").loadApi("anchoring").getNextVersionNumberAsync(mutableDSU.getCreationSSI());
        return --version;
    }

    this.lock = async function(){
        const {acquireLock} = require("../../utils/Locks.js");
        const anchorId = await this.getGTINSSI().getAnchorIdAsync();
        try{
            this.lockId = await acquireLock(anchorId, 55*1000);
            return this.lockId;
        }catch(err){
            throw Error("Failed to lock the resource!");
        }
    }

    this.unlock = async function(){
        const {releaseLock} = require("../../utils/Locks.js");
        const anchorId = await this.getGTINSSI().getAnchorIdAsync();
        await releaseLock(anchorId, this.lockId);
    }
}

ModelBase.prototype.constants = {
    FREE_OBJECT: "FREE_OBJECT",
    EXTERNAL_OBJECT: "EXTERNAL_OBJECT",
    MY_OBJECT: "MY_OBJECT",
    RECOVERY_REQUIRED: "RECOVERY_REQUIRED"
};

ModelBase.prototype.checkStatus = async function () {
    let gtinSSI = this.getGTINSSI();
    let anchorId = await gtinSSI.getAnchorIdAsync();

    if (!anchorId) {
        return ModelBase.prototype.constants.FREE_OBJECT;
    }

    let openDSU = require("opendsu");
    const anchoring = openDSU.loadApi("anchoring").getAnchoringX();
    let lastVersion;
    try {
        lastVersion = await $$.promisify(anchoring.getLastVersion)(anchorId);
        let brickDomain = lastVersion.getDLDomain();
        let hint = gtinSSI.getHint();
        let myBrickDomain = hint.getBricksDomain();

        if (brickDomain !== myBrickDomain) {
            return ModelBase.prototype.constants.EXTERNAL_OBJECT;
        }
    } catch (err) {
        //todo: handle potential errors
        return ModelBase.prototype.constants.FREE_OBJECT;
    }

    let mutableKeySSI;
    try {
        let dsu = await this.loadImmutableDSUInstance();
        let mountingPoint = this.getMutableMountingPoint();
        let keyssi = require("opendsu").loadApi("keyssi");
        mutableKeySSI = await $$.promisify(dsu.getSSIForMount)(mountingPoint);
        mutableKeySSI = keyssi.parse(mutableKeySSI);

        // mutableCapableSigningKeySSI = await $$.promisify(this.getEnclave().getCapableOfSigningKeySSI)($$.SYSTEM_IDENTIFIER, mutableAnchorId);
    } catch (err) {
        return ModelBase.prototype.constants.RECOVERY_REQUIRED;
    }

    try {
        let mutableDSU = await $$.promisify(this.getEnclave().loadDSU)($$.SYSTEM_IDENTIFIER, mutableKeySSI);
        let jsonSerialization = await mutableDSU.readFileAsync(`${this.getJSONStoragePath()}`);
        Object.assign(this, JSON.parse(jsonSerialization));
    } catch (err) {
        return ModelBase.prototype.constants.RECOVERY_REQUIRED;
    }

    return ModelBase.prototype.constants.MY_OBJECT;
}

module.exports = ModelBase;

},{"../../mappings/errors/errorUtils.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/errors/errorUtils.js","../../services/XMLDisplayService/XMLDisplayService":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/XMLDisplayService/XMLDisplayService.js","../../services/XMLDisplayService/XMLDisplayService.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/XMLDisplayService/XMLDisplayService.js","../../utils/CommonUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/CommonUtils.js","../../utils/Locks.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/Locks.js","../utils/Events":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/Events.js","../utils/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/constants.js","./../../mappings/utils.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/utils.js","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/models/Product.js":[function(require,module,exports){
const ModelBase = require("./ModelBase.js");
const GTIN_SSI = require("../../GTIN_SSI.js");
const constants = require("../../constants/constants.js");
const {EVENTS} = require("../utils/Events");
const XMLDisplayService = require("../../services/XMLDisplayService/XMLDisplayService");
const {LEAFLET_XML_FILE_NAME, EPI_MOUNT_PREFIX} = require("../../constants/constants");

function Product(enclave, domain, subdomain, gtin, version) {

    const MUTABLE_MOUNTING_POINT = `/product`;
    let instance = new ModelBase(enclave, domain, subdomain, gtin);

    //all the data that needs to be serialized as JSON needs to be added to the instance as soon as possible
    instance.productCode = gtin;
    //there is version specific paths and logic that may need to be carefully treated
    instance.epiProtocol = `v${version}`;

    instance.getJSONStoragePath = () => {
        return `/product.epi_${instance.epiProtocol}`;
    }

    instance.getLeafletStoragePath = (language, type, epiMarket) => {
        let path = `/${type}/${language}`;
        if (epiMarket)
            path = `/${EPI_MOUNT_PREFIX}/${type}/${language}/${epiMarket}`;
        return path;
    }

    instance.getLeafletFilePath = (language, type, epiMarket) => {
        const baseName = epiMarket ? `${LEAFLET_XML_FILE_NAME}` : `${type}`;
        const fileName = baseName.endsWith(".xml") ? baseName : `${baseName}.xml`;
        return `${instance.getLeafletStoragePath(language, type, epiMarket)}/${fileName}`;
    }

    instance.getMutableMountingPoint = () => {
        return constants.PRODUCT_DSU_MOUNT_POINT;
    }

    instance.getPathSSIData = () => {
        return {
            path: `0/${instance.productCode}`,
            domain: subdomain
        };
    }

    instance.getGTINSSI = () => {
        return GTIN_SSI.createGTIN_SSI(domain, subdomain, instance.productCode);
    }

    let persist = instance.persist;
    instance.persist = async (auditContext) => {
        let diffs = await persist.call(instance, auditContext);
        try{
            //we don't wait for the request to be finalized because of the delays between fixedUrl and lightDB
            $$.promisify(require("./../../mappings/utils.js").activateGtinOwnerFixedUrl)(undefined, domain, gtin);
            $$.promisify(require("./../../mappings/utils.js").activateLeafletFixedUrl)(undefined, domain, gtin);
        }catch(err){
            //ignore them for the moment.
        }
        return diffs;
    }

    instance.addPhoto = async (photoData) => {
        let eventRecorder = await instance.getEventRecorderInstance(instance.getGTINSSI());
        let fileExtension = ".png"; //for now is hardcoded to png, but it should reflect the info from the base64 data encoding...
        eventRecorder.register(EVENTS.WRITE, getImageMountingPoint(fileExtension), photoData);
    }

    const getImageMountingPoint = (fileExtension) => {
        return `/photo${fileExtension}`;
    }

    instance.getPhoto = async (dsuVersion) => {
        const imageMountingPoint = getImageMountingPoint(".png");
        const dsu = await instance.loadMutableDSUInstance(dsuVersion);
        return await dsu.readFileAsync(imageMountingPoint);
    }

    instance.deletePhoto = async () => {
        let eventRecorder = await instance.getEventRecorderInstance(instance.getGTINSSI());
        let fileExtension = ".png"; //for now is hardcoded to png, but it should reflect the info from the base64 data encoding...
        eventRecorder.register(EVENTS.DELETE, `${MUTABLE_MOUNTING_POINT}/photo${fileExtension}`);
    }

    instance.listMarkets = async (epiType) => {
        const constants = require("../utils/constants");
        const XMLDisplayService = require("../../services/XMLDisplayService/XMLDisplayService.js");
        const simulatedModel = {networkName: domain, product: {gtin}};
        let xmlDisplayService = new XMLDisplayService(undefined, instance.getGTINSSI(), simulatedModel, epiType, undefined);
        return $$.promisify(xmlDisplayService.getAvailableMarketsForProduct, xmlDisplayService)();
    }

    instance.getPathOfPathSSI = () => {
        const path = `0/${instance.productCode}`;
        return {
            path: path,
            domain: subdomain
        };
    }

    const loadMetadata = instance.loadMetadata;
    instance.loadMetadata = async () => {
        await loadMetadata.call(instance);
        instance.inventedName = instance.inventedName || instance.name;
        instance.nameMedicinalProduct = instance.nameMedicinalProduct || instance.description;
        instance.productRecall = instance.productRecall || "";
    }
    return instance;
}

module.exports = Product;

},{"../../GTIN_SSI.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/GTIN_SSI.js","../../constants/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","../../constants/constants.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","../../services/XMLDisplayService/XMLDisplayService":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/XMLDisplayService/XMLDisplayService.js","../../services/XMLDisplayService/XMLDisplayService.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/XMLDisplayService/XMLDisplayService.js","../utils/Events":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/Events.js","../utils/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/constants.js","./../../mappings/utils.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/utils.js","./ModelBase.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/models/ModelBase.js"}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/schemas/AuditDemiurgeUserActionSchema.js":[function(require,module,exports){
const messageHeaderSchema = require("./../../mappings/messageHeaderSchema.js");
let auditDemiurgeUserActionSchema = {
    "type": "object",
    "properties":
        {
            "payload": {
                "type": "object", "required": true,
                "properties": {
                    "userDID": {"type": "string", "required": true},
                    "userGroup": {"type": "string", "required": true}
                }
            }
        }
}
auditDemiurgeUserActionSchema.properties = {...messageHeaderSchema, ...auditDemiurgeUserActionSchema.properties};
module.exports = auditDemiurgeUserActionSchema

},{"./../../mappings/messageHeaderSchema.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/messageHeaderSchema.js"}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/schemas/AuditUserAccessSchema.js":[function(require,module,exports){
const messageHeaderSchema = require("./../../mappings/messageHeaderSchema.js");
let auditUserAccessSchema = {
    "type": "object",
    "properties":
        {
            "payload": {
                "type": "object", "required": true,
                "properties": {
                    "userDID": {"type": "string", "required": true},
                    "userGroup": {"type": "string", "required": true}
                }
            }
        }
}
auditUserAccessSchema.properties = {...messageHeaderSchema, ...auditUserAccessSchema.properties};
module.exports = auditUserAccessSchema

},{"./../../mappings/messageHeaderSchema.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/messageHeaderSchema.js"}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/schemas/AuditUserActionSchema.js":[function(require,module,exports){
const messageHeaderSchema = require("./../../mappings/messageHeaderSchema.js");
let auditUserActionSchema = {
    "type": "object",
    "properties":
        {
            "payload": {
                "type": "object", "required": true,
                "properties": {
                    "reason": {"type": "string", "required": true},
                    "itemCode": {"type": "string", "required": true},
                    "batchNumber": {"type": "string", "required": true},
                    "details": {
                        "type": "array"
                    },
                    "version": {"type": "number", "required": true}
                }
            }
        }
}
auditUserActionSchema.properties = {...messageHeaderSchema, ...auditUserActionSchema.properties};
module.exports = auditUserActionSchema

},{"./../../mappings/messageHeaderSchema.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/messageHeaderSchema.js"}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/services/AuditService.js":[function(require,module,exports){
const {AUDIT_LOG_TYPES} = require("../utils/constants");

function AuditService(enclave) {
    const {getUserId} = require("../utils/getUserId");
    const {TABLES} = require("../utils/constants.js");
    const {AUDIT_LOG_TYPES} = require("../utils/constants.js");
    const crypto = require("opendsu").loadAPI("crypto");
    const validationService = require("../services/ValidationService.js").getInstance();

    const generatePK = () => {
        return crypto.generateRandom(32).toString("base64url");
    }

    const generateAuditEntry = (context) => {
        const auditEntry = {
            itemCode: context.itemCode || context.gtin,
            reason: context.reason || context.operation,
            creationTime: context.creationTime || new Date().toISOString(),
            username: context.username || context.userId,
            version: context.version
        };

        if (context.batchNumber) {
            auditEntry.batchNumber = context.batchNumber;
        }

        if (context.diffs) {
            auditEntry.details = context.diffs;
        }

        return auditEntry;
    }

    this.auditProduct = async (auditId, productPayload, context) => {
        if (context && context.version) {
            //if we find a version in the context, that version is read from blockchain so we should keep it also into the database for UI reasons
            productPayload.version = context.version;
        }
        try {
            await $$.promisify(enclave.insertRecord)($$.SYSTEM_IDENTIFIER, TABLES.PRODUCTS, productPayload.productCode, productPayload);
        } catch (error) {
            await $$.promisify(enclave.updateRecord)($$.SYSTEM_IDENTIFIER, TABLES.PRODUCTS, productPayload.productCode, productPayload);
        }

        await this.auditSuccess(auditId, context);
    }

    this.auditProductVersionChange = async (productCode, newVersion) => {
        let product = await $$.promisify(enclave.getRecord)($$.SYSTEM_IDENTIFIER, TABLES.PRODUCTS, productCode);
        product.version = newVersion;
        await $$.promisify(enclave.updateRecord)($$.SYSTEM_IDENTIFIER, TABLES.PRODUCTS, productCode, product);
    }

    this.getName = ()=> {
        return enclave.getName();
    }
    this.auditBatch = async (auditId, batchPayload, context) => {
        const pk = `${batchPayload.productCode}_${batchPayload.batch}`;
        if (context && context.version) {
            //if we find a version in the context, that version is read from blockchain so we should keep it also into the database for UI reasons
            batchPayload.version = context.version;
        }
        try {
            await $$.promisify(enclave.insertRecord)($$.SYSTEM_IDENTIFIER, TABLES.BATCHES, pk, batchPayload);
        } catch (error) {
            await $$.promisify(enclave.updateRecord)($$.SYSTEM_IDENTIFIER, TABLES.BATCHES, pk, batchPayload);
        }

        await this.auditSuccess(auditId, context);
    }

    this.auditBatchVersionChange = async (productCode, batchNumber, newVersion) => {
        const pk = `${productCode}_${batchNumber}`;
        let batch = await $$.promisify(enclave.getRecord)($$.SYSTEM_IDENTIFIER, TABLES.BATCHES, pk);
        batch.version = newVersion;
        await $$.promisify(enclave.updateRecord)($$.SYSTEM_IDENTIFIER, TABLES.BATCHES, pk, batch);
    }

    this.auditFail = async (auditId, context) => {
        await $$.promisify(enclave.updateRecord)($$.SYSTEM_IDENTIFIER, TABLES.AUDIT, auditId, generateAuditEntry(context));
    }

    this.auditOperationInProgress = async (context) => {
        const auditId = generatePK();
        await $$.promisify(enclave.insertRecord)($$.SYSTEM_IDENTIFIER, TABLES.AUDIT, auditId, generateAuditEntry(context));
        return auditId;
    }

    this.addLog = async (logType, auditMessage, req, res) => {
        const username = getUserId(req, auditMessage);

        let auditData = {username, ...auditMessage.payload};

        if (logType === AUDIT_LOG_TYPES.USER_ACCESS ) {
            //TODO: we should check the user who authorized this call is the one that appers in the audit entry
            try {
                await validationService.validateAuditUserAccessMessage(auditMessage);
            } catch (err) {
                let details = err.reason || err.message;
                try {
                    details = JSON.parse(details);
                } catch (err) {
                    //ignorable error
                }
                res.send(422, JSON.stringify({message: "Payload validation failed", details}));
                return;
            }
            return await this.insertRecordToAudit(TABLES.USER_ACCESS, auditData);
        }

        try {
            if (logType === AUDIT_LOG_TYPES.DEMIURGE_USER_ACTION) {
                await validationService.validateAuditDemiurgeUserActionMessage(auditMessage);
            }
            if (logType === AUDIT_LOG_TYPES.DEMIURGE_USER_ACCESS) {
                await validationService.validateAuditDemiurgeUserActionMessage(auditMessage);
            }

            if (logType === AUDIT_LOG_TYPES.USER_ACTION) {
                await validationService.validateAuditUserActionMessage(auditMessage);
            }

        } catch (err) {
            let details = err.reason || err.message;
            try {
                details = JSON.parse(details);
            } catch (err) {
                //ignorable error
            }
            res.send(422, JSON.stringify({message: "Payload validation failed", details}));
            return;
        }
        await this.insertRecordToAudit(TABLES.AUDIT, auditData);
    }

    this.insertRecordToAudit = async (tableName, auditData) => {
        const auditId = generatePK();
        await $$.promisify(enclave.insertRecord)($$.SYSTEM_IDENTIFIER, tableName, auditId, auditData);
        return auditId;
    }

    this.auditSuccess = async (auditId, context) => {
        await $$.promisify(enclave.updateRecord)($$.SYSTEM_IDENTIFIER, TABLES.AUDIT, auditId, generateAuditEntry(context));
    }

    this.filterAuditLogs = async (logType, start, number, query, sort) => {
        let table;
        if (logType === AUDIT_LOG_TYPES.USER_ACCESS) {
            table = TABLES.USER_ACCESS
        }
        if (logType === AUDIT_LOG_TYPES.USER_ACTION || logType === AUDIT_LOG_TYPES.DEMIURGE_USER_ACTION || logType === AUDIT_LOG_TYPES.DEMIURGE_USER_ACCESS) {
            table = TABLES.AUDIT
        }
        return await $$.promisify(enclave.filter)($$.SYSTEM_IDENTIFIER, table, query, sort, number);
    }
}

function getInstance(enclave) {
  return new AuditService(enclave);
}

module.exports = {
    getInstance
};

},{"../services/ValidationService.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/services/ValidationService.js","../utils/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/constants.js","../utils/constants.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/constants.js","../utils/getUserId":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/getUserId.js","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/services/ValidationService.js":[function(require,module,exports){
(function (__dirname){(function (){
const {sanitize} = require("../../utils/htmlSanitize");
const errorUtils = require("../../mappings/errors/errorUtils");
const validationUtils = require("../../utils/ValidationUtils");
const sax = require("../../saxjs/sax");
const schema = require("../schemas/AuditUserActionSchema");
const errMap = require("opendsu").loadApi("m2dsu").getErrorsMap();

function ValidationService() {
    this.validateProductMessage = async function validateProductMessage(payload) {
        const schema = require("../../mappings/product/productSchema.js");
        await validationUtils.validateMessageOnSchema(payload, schema);
        let gtinValidation = validationUtils.validateGTIN(payload.payload.productCode);
        if (!gtinValidation.isValid) {
            throw new Error(gtinValidation.message);
        }
        //await validationUtils.validateMVP1Values(payload, "product");
    }

    this.validateBatchMessage = async function validateBatchMessage(payload) {
        const schema = require("../../mappings/batch/batchSchema.js");
        await validationUtils.validateMessageOnSchema(payload, schema);
        let gtinValidation = validationUtils.validateGTIN(payload.payload.productCode);
        if (!gtinValidation.isValid) {
            throw new Error(gtinValidation.message);
        }
        // await validationUtils.validateMVP1Values(payload, "product");
    }
    let isValidImageBase64 = function (base64String) {
        const fs = require('fs');
        const path = require('path');
        const imageData = base64String.split(';base64,').pop();

        // Generate a random file name with .png extension
        const tempFilePath = path.join(__dirname, 'temp_image.png');

        try {
            // Write the Base64 data to a temporary file
            fs.writeFileSync(tempFilePath, imageData, 'base64');

            // Read the temporary file to verify if it's a valid image
            const imageBuffer = fs.readFileSync(tempFilePath);
            // Check if the file starts with the expected image headers
            return (imageBuffer.toString('hex', 0, 2) === '8950' || // PNG header
                imageBuffer.toString('hex', 0, 2) === 'ffd8' || // JPEG header
                imageBuffer.toString('hex', 0, 6) === '474946')   // GIF header
        } catch (error) {
            return false; // Return false if any error occurs
        } finally {
            // Cleanup: Delete the temporary file
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        }
    }
    this.validatePhotoMessage = async function validatePhotoMessage(payload) {
        const schema = require("../../mappings/product/productPhotoSchema.js");
        await validationUtils.validateMessageOnSchema(payload, schema);
        let gtinValidation = validationUtils.validateGTIN(payload.payload.productCode);
        if (!gtinValidation.isValid) {
            throw new Error(gtinValidation.message);
        }
        let imageData = payload.payload.imageData;
        if (!(imageData.startsWith('data:image/jpeg;base64,') || imageData.startsWith('data:image/png;base64,') || imageData.startsWith('data:image/gif;base64,')) || !isValidImageBase64(imageData)) {
            throw new Error("Invalid base64 image");
        }
    }

    let validateXMLAndGetImageNames = async function (base64XMLFileContent) {
        return new Promise((resolve, reject) => {
            let xmlString = atob(base64XMLFileContent);
            let xmlImages = [];
            // Create a SAX parser
            const parser = sax.parser(true);
            // Function to handle errors
            parser.onerror = function () {
                this.resume();
                //Removed due to porse embeded image can throw error
                // reject(errMap.newCustomError(errMap.errorTypes.WRONG_XML_FORMAT));
            };
            let isFirstRootNode = true;
            let isValidXML = false;
            // Variables to track XML structure
            let openTags = []; // Stack to track open tags
            parser.onopentag = function (node) {
                openTags.push(node.name);
                if (isFirstRootNode && node.name === 'root') {
                    isValidXML = true;
                }
                if (node.name === 'document') {
                    if (node.attributes.type && node.attributes.type.startsWith("pharmaledger-")) {
                        isValidXML = true;
                    } else if (node.attributes["xsi:schemaLocation"] && node.attributes["xsi:schemaLocation"].includes("www.accessdata.fda.gov/spl/schema/spl.xsd")) {
                        isValidXML = true;
                    }
                }
                if (node.name === "img") {
                    if (node.attributes.src && !node.attributes.src.startsWith("data:")) {
                        xmlImages.push(node.attributes.src)
                    }
                }
                if (node.name === "reference") {
                    if (node.attributes.value && !node.attributes.value.startsWith("data:")) {
                        xmlImages.push(node.attributes.value)
                    }
                }
            }

            parser.onclosetag = function (tagName) {
                // Pop the top tag from the stack
                const lastOpenTag = openTags.pop();

                // Check if the closing tag matches the last open tag
                if (lastOpenTag !== tagName) {
                    reject(errMap.newCustomError(errMap.errorTypes.WRONG_XML_FORMAT));
                }
            };

            parser.onend = function () {
                if (isValidXML) {
                    resolve(xmlImages);
                } else {
                    reject(errMap.newCustomError(errMap.errorTypes.WRONG_XML_FORMAT));
                }
            };
            parser.write(xmlString).close();
        })
    }

    let healDifferentCaseImgFiles = function (xmlImageNames, leafletMessage) {
        let uploadedImageNames = leafletMessage.payload.otherFilesContent.map(fileObj => {
            return fileObj.filename
        })

        let differentCaseImgFiles = [];
        xmlImageNames.forEach(xmlImgName => {
            let differentImg = uploadedImageNames.find((item) => item.toLowerCase() === xmlImgName.toLowerCase())
            if (differentImg) {
                if (xmlImgName !== differentImg) {
                    differentCaseImgFiles.push(xmlImgName)
                }
            }
        });

        for (let i = 0; i < leafletMessage.payload.otherFilesContent.length; i++) {
            let differentCaseFileName = differentCaseImgFiles.find(item => leafletMessage.payload.otherFilesContent[i].filename.toLowerCase() === item.toLowerCase());
            if (differentCaseFileName) {
                leafletMessage.payload.otherFilesContent[i].filename = differentCaseFileName;
            }
        }
    }

    this.validateLeafletMessage = async function validateLeafletMessage(leafletMessage) {
        const schema = require("../../mappings/leaflet/leafletSchema.js");
        await validationUtils.validateMessageOnSchema(leafletMessage, schema);
        let gtinValidation = validationUtils.validateGTIN(leafletMessage.payload.productCode);
        if (!gtinValidation.isValid) {
            throw new Error(gtinValidation.message);
        }

        if (leafletMessage.messageType === "smpc") {
            errorUtils.addMappingError("MVP1_RESTRICTED");
            throw errMap.newCustomError(errMap.errorTypes.MVP1_RESTRICTED, "smpc");
        }

        let base64XMLFileContent = leafletMessage.payload.xmlFileContent;
        try {
            base64XMLFileContent = sanitize(base64XMLFileContent);
        } catch (e) {
            errorUtils.addMappingError("FILE_CONTAINS_FORBIDDEN_TAGS");
            throw errMap.newCustomError(errMap.errorTypes.FILE_CONTAINS_FORBIDDEN_TAGS, leafletMessage.messageType);
        }
        //remove BOM-utf8 chars from the beginning of the xml
        if (base64XMLFileContent.substring(0, 4) === '77u/') {
            base64XMLFileContent = base64XMLFileContent.substring(4)
        }

        let xmlImageNames = await validateXMLAndGetImageNames(base64XMLFileContent);
        if (xmlImageNames && xmlImageNames.length > 0) {
            let uploadedImageNames = leafletMessage.payload.otherFilesContent.map(fileObj => {
                return fileObj.filename
            })

            let missingImgFiles = [];
            xmlImageNames.forEach(htmlImgName => {
                let differentImg = uploadedImageNames.find((item) => item.toLowerCase() === htmlImgName.toLowerCase())

                if (!differentImg) {
                    missingImgFiles.push({
                        field: htmlImgName, message: `does not exist`
                    });
                }
            })
            if (missingImgFiles.length > 0) {
                leafletMessage.invalidFields = missingImgFiles;
                throw errMap.newCustomError(errMap.errorTypes.WRONG_XML_IMG_SRC_TO_FILES_MAPPING, missingImgFiles);
            }

            healDifferentCaseImgFiles(xmlImageNames, leafletMessage);
        }
        return base64XMLFileContent;
    }

    /*  this.validateLeafletDeleteMessage = async function validateLeafletDeleteMessage(payload){
        const schema = require("../../mappings/leaflet/leafletDeleteSchema.js");
        const validationUtils = require("../../utils/ValidationUtils.js");
        await validationUtils.validateMessageOnSchema(payload, schema);
      }*/

    this.validateLeafletDeleteMessage = async function validateLeafletDeleteMessage(payload) {
        const schema = require("../../mappings/leaflet/leafletDeleteSchema.js");
        await validationUtils.validateMessageOnSchema(payload, schema);
        // await validationUtils.validateMVP1Values(payload, "product");
    }

    this.validateAuditUserActionMessage = async function validateAuditMessage(payload) {
        const schema = require("../schemas/AuditUserActionSchema.js");
        await validationUtils.validateMessageOnSchema(payload, schema);
    }
    this.validateAuditDemiurgeUserActionMessage = async function validateAuditMessage(payload) {
        const schema = require("../schemas/AuditDemiurgeUserActionSchema.js");
        await validationUtils.validateMessageOnSchema(payload, schema);
    }
    this.validateAuditUserAccessMessage = async function validateAuditMessage(payload) {
        const schema = require("../schemas/AuditUserAccessSchema.js");
        await validationUtils.validateMessageOnSchema(payload, schema);
    }

}


let serviceInstance;

function getInstance() {
    if (!serviceInstance) {
        serviceInstance = new ValidationService();
    }
    return serviceInstance;
}

module.exports = {
    getInstance
};

}).call(this)}).call(this,"/lib/integrationAPIs/services")

},{"../../mappings/batch/batchSchema.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/batch/batchSchema.js","../../mappings/errors/errorUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/errors/errorUtils.js","../../mappings/leaflet/leafletDeleteSchema.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/leaflet/leafletDeleteSchema.js","../../mappings/leaflet/leafletSchema.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/leaflet/leafletSchema.js","../../mappings/product/productPhotoSchema.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/product/productPhotoSchema.js","../../mappings/product/productSchema.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/product/productSchema.js","../../saxjs/sax":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/saxjs/sax.js","../../utils/ValidationUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/ValidationUtils.js","../../utils/htmlSanitize":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/htmlSanitize.js","../schemas/AuditDemiurgeUserActionSchema.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/schemas/AuditDemiurgeUserActionSchema.js","../schemas/AuditUserAccessSchema.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/schemas/AuditUserAccessSchema.js","../schemas/AuditUserActionSchema":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/schemas/AuditUserActionSchema.js","../schemas/AuditUserActionSchema.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/schemas/AuditUserActionSchema.js","fs":false,"opendsu":false,"path":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/Events.js":[function(require,module,exports){
const EVENTS = {
    WRITE: "WriteEvent",
    DELETE: "DeleteEvent"
}

function Event(path, content) {
    Object.assign(this, {path, content});
}

let getDiffsForAudit = (newData, prevData) => {
    let diffs = {}
    if (prevData && (Array.isArray(prevData) || Object.keys(prevData).length > 0)) {
        diffs = Object.keys(newData).reduce((diffs, key) => {
            if (JSON.stringify(prevData[key]) === JSON.stringify(newData[key])) return diffs
            return {
                ...diffs, [key]: {oldValue: prevData[key], newValue: newData[key]}
            }
        }, {})
       
    } else {
        for (let key of Object.keys(newData)) {
            if (Array.isArray(newData[key]) && !newData[key].length) {
                continue;
            }
            if (newData[key] === "") {
                continue;
            }
            diffs[key] = {oldValue: "", newValue: newData[key]};
        }
    }
    
    if('lockId' in diffs)
        delete diffs.lockId;

    return diffs;
}

function WriteEvent(path, content, diff, ...args) {
    let instance = new Event(path, content, diff, ...args);

    instance.execute = async function (dsu) {
        let diffs;
        if (typeof diff !== "boolean") {
            diffs = diff;
        } else {
            if (diff) {
                let oldContent = null;
                let newContent = null;
                try {
                    oldContent = await dsu.readFileAsync(path);
                    oldContent = JSON.parse(oldContent.toString());

                } catch (err) {
                    oldContent = null;
                }
                newContent = JSON.parse(content);
                diffs = getDiffsForAudit(newContent, oldContent);
            } else {
                //no diffs...
            }
        }
        await dsu.writeFileAsync(path, content);
        return diffs ? {path, diffs} : undefined;
    }
    return instance;
}

function DeleteEvent(path, content, diff, ...args) {
    let instance = new Event(path, content, diff, ...args);

    instance.execute = async function (dsu) {
        let diffs;
        if (typeof diff !== "boolean") {
            diffs = diff;
        } else {
            if (diff) {
                let oldContent = null;
                try {
                    oldContent = await dsu.readFileAsync(path);
                    oldContent = JSON.parse(oldContent);
                    content = JSON.parse(content);
                } catch (err) {
                    oldContent = null;
                }

                diffs = getDiffsForAudit(null, oldContent);
            } else {
                //no diffs...
            }
        }
        await dsu.deleteAsync(path);
        return diffs ? {path, diffs} : undefined;
    }
    return instance;
}

const eventConstructors = {
    WriteEvent,
    DeleteEvent
}

function EventRecorder(getDSUFnc) {

    let events = [];
    this.register = function (operation, path, content, ...args) {
        let EventConstructor = eventConstructors[operation];
        events.push(new EventConstructor(path, content, ...args));
    }

    this.execute = async function (auditContext) {
        let {mutableDSU, batchId, immutableDSU} = await getDSUFnc();
        if (batchId) {
            let old = immutableDSU.batchInProgress;
            immutableDSU.batchInProgress = () => {
                immutableDSU.batchInProgress = old;
                return false;
            };
        }

        let version;
        let mutableBatchId = await mutableDSU.startOrAttachBatchAsync();
        let diffs = [];
        for (let event of events) {
            let operationDiff = await event.execute(mutableDSU);

            if(!operationDiff)
                continue;

            if(Object.keys(operationDiff.diffs) < 1)
                continue;

            if (operationDiff) {
                diffs.push(operationDiff);
            }
        }

        let promises = [];
        promises.push(mutableDSU.commitBatchAsync(mutableBatchId));
        if (batchId) {
            promises.push(immutableDSU.commitBatchAsync(batchId));
        }
        await Promise.all(promises);

        if (auditContext) {
            auditContext.diffs = diffs;
            try {
                version = await require("opendsu").loadApi("anchoring").getNextVersionNumberAsync(mutableDSU.getCreationSSI());
            } catch (err) {
                //todo: handle this error...
            }
            auditContext.version = version - 1;
        }
        return diffs;
    }
}

module.exports = {
    EventRecorder,
    EVENTS,
    getDiffsForAudit
}

},{"opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/LightDBEnclaveFactory.js":[function(require,module,exports){
function LightDBEnclaveFactory() {
    let instances = {};
    const PREFIX = "DB_";
    let secretsServiceInstance;

    this.generateEnclaveName = (domain, subdomain, appName) => {
        return appName ? `${PREFIX}${domain}_${subdomain}_${appName}` : `${PREFIX}${domain}_${subdomain}`;
    }

    const addEnclaveInstanceInCache = (domain, subdomain, appName, enclaveInstance) => {
        instances[this.generateEnclaveName(domain, subdomain, appName)] = enclaveInstance;
    }

    const getEnclaveInstanceFromCache = (domain, subdomain, appName) => {
        return instances[this.generateEnclaveName(domain, subdomain, appName)];
    }

    const enclaveExists = (domain, subdomain, appName) => {
        return !!getEnclaveInstanceFromCache(domain, subdomain, appName);
    }

    this.createLightDBEnclaveAsync = async (domain, subdomain, options) => {
        let skipCache = false;
        let appName;
        if (options && typeof options === "boolean") {
            skipCache = options;
        }
        if (options && typeof options === "string") {
            appName = options;
        }

        if (options && typeof options === "object") {
            skipCache = !!options.skipCache;
            appName = options.appName;
        }
        if (!skipCache && enclaveExists(domain, subdomain, appName)) {
            return getEnclaveInstanceFromCache(domain, subdomain, appName);
        }

        if (!secretsServiceInstance) {
            secretsServiceInstance = await require("apihub").getSecretsServiceInstanceAsync();
        }
        let secret;
        try {
            secret = secretsServiceInstance.readSecretFromDefaultContainerSync(this.generateEnclaveName(domain, subdomain, appName));
        } catch (e) {
            // ignored and handled below
        }

        if (!secret) {
            throw new Error(`Secret for enclave ${this.generateEnclaveName(domain, subdomain, appName)} not found`);
        }

        const slots = secret.split(";");
        const enclave = require("opendsu").loadAPI("enclave");
        const lightDBEnclaveInstance = enclave.initialiseLightDBEnclave(this.generateEnclaveName(domain, subdomain, appName), slots);
        try {
            await $$.promisify(lightDBEnclaveInstance.createDatabase)(this.generateEnclaveName(domain, subdomain, appName));
        } catch (e) {
            console.info(`Failed to create database for enclave ${this.generateEnclaveName(domain, subdomain, appName)}`, e);
        }

        addEnclaveInstanceInCache(domain, subdomain, appName, lightDBEnclaveInstance);
        return lightDBEnclaveInstance;
    };
}

let instance;
const getLightDBEnclaveFactoryInstance = () => {
    if (!instance) {
        instance = new LightDBEnclaveFactory();
    }
    return instance;
}

module.exports = {
    getLightDBEnclaveFactoryInstance
};

},{"apihub":false,"opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/constants.js":[function(require,module,exports){
module.exports = {
    TABLES: {
        AUDIT: 'audit',
        PRODUCTS: 'products',
        BATCHES: 'batches',
        USER_ACCESS: "user-access"
    },
    MESSAGE_TYPES: {
        LEAFLET: 'leaflet',
        SMPC: 'smpc',
        PRODUCT: 'product',
        BATCH: 'batch',
        PRODUCT_PHOTO: 'productPhoto'
    },
    AUDIT_LOG_TYPES: {
        USER_ACCESS: "userAccess",
        USER_ACTION: "userAction",
        DEMIURGE_USER_ACCESS: "demiurgeUserAccess",
        DEMIURGE_USER_ACTION: "demiurgeUserAction"
    },
    OPERATIONS: {
        CREATE_PRODUCT: 'Created Product',
        CREATE_PRODUCT_IN_PROGRESS: 'Create Product In Progress',
        CREATE_PRODUCT_FAIL: 'Create Product Fail',
        UPDATE_PRODUCT: 'Updated Product',
        UPDATE_PRODUCT_IN_PROGRESS: 'Update Product In Progress',
        UPDATE_PRODUCT_FAIL: 'Updated Product Fail',
        CREATE_BATCH: 'Created Batch',
        CREATE_BATCH_IN_PROGRESS: 'Create Batch In Progress',
        CREATE_BATCH_FAIL: 'Create Batch Fail',
        UPDATE_BATCH: 'Updated Batch',
        UPDATE_BATCH_IN_PROGRESS: 'Update Batch In Progress',
        UPDATE_BATCH_FAIL: 'Update Batch Fail',
        ADD_LEAFLET: 'Added Leaflet',
        ADD_LEAFLET_IN_PROGRESS: 'Add Leaflet In Progress',
        ADD_LEAFLET_FAIL: 'Add Leaflet Fail',
        UPDATE_LEAFLET: 'Updated Leaflet',
        UPDATE_LEAFLET_IN_PROGRESS: 'Update Leaflet In Progress',
        UPDATE_LEAFLET_FAIL: 'Update Leaflet Fail',
        DELETE_LEAFLET: 'Deleted Leaflet',
        DELETE_LEAFLET_IN_PROGRESS: 'Delete Leaflet In Progress',
        DELETE_LEAFLET_FAIL: 'Delete Leaflet Fail',
        ADD_PRODUCT_PHOTO: 'Added ProductPhoto',
        ADD_PRODUCT_PHOTO_IN_PROGRESS: 'Add ProductPhoto In Progress',
        ADD_PRODUCT_PHOTO_FAIL: 'Add ProductPhoto Fail',
        UPDATE_PRODUCT_PHOTO: 'Updated ProductPhoto',
        UPDATE_PRODUCT_PHOTO_IN_PROGRESS: 'Update ProductPhoto In Progress',
        UPDATE_PRODUCT_PHOTO_FAIL: 'Update ProductPhoto Fail',
        DELETE_PRODUCT_PHOTO: 'Deleted ProductPhoto',
        DELETE_PRODUCT_PHOTO_IN_PROGRESS: 'Delete ProductPhoto In Progress',
        DELETE_PRODUCT_PHOTO_FAIL: 'Delete ProductPhoto Fail',
        RECOVERED_PRODUCT: 'Recovered Product',
        PRODUCT_RECOVERY_IN_PROGRESS: 'Recovery process for Product In Progress',
        PRODUCT_RECOVERY_FAIL: 'Product Recovery Fail',
        RECOVERED_BATCH: 'Recovered Batch',
        BATCH_RECOVERY_IN_PROGRESS: 'Recovery process for Batch In Progress',
        BATCH_RECOVERY_FAIL: 'Batch Recovery Fail',
        ADD_SMPC: 'Created SMPC',
        UPDATE_SMPC: 'Updated SMPC',
        DELETE_SMPC: 'Deleted SMPC',
        USER_LOGIN: "User login"
    },
    MODELS_CACHE_NAME: 'modelsCache',
    MIGRATION_STATUS: {
        NOT_STARTED: "not_started",
        IN_PROGRESS: "in_progress",
        COMPLETED: "completed",
        FAILED: "failed"
    }
}

},{}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/dataMigration.js":[function(require,module,exports){
const API_HUB = require('apihub');
let config = API_HUB.getServerConfig();
const openDSU = require("opendsu");
const process = require("process");
const enclaveAPI = openDSU.loadAPI("enclave");
const {getDiffsForAudit} = require("./Events");
const anchoring = openDSU.loadApi("anchoring");
const resolver = openDSU.loadApi("resolver");
const anchoringX = anchoring.getAnchoringX();
const {migrateDataToLightDB} = require("./migrationUtils");
const constants = require("./constants");
const MIGRATION_STATUS = constants.MIGRATION_STATUS;

const PREFIX = 'DB_';
const generateEnclaveName = (domain, subdomain) => `${PREFIX}${domain}_${subdomain}`;

const getEpiEnclave = (keySSI, callback) => {
    const epiEnclave = enclaveAPI.initialiseWalletDBEnclave(keySSI);

    epiEnclave.on("error", (err) => {
        return callback(err);
    })

    epiEnclave.on("initialised", async () => {
        callback(undefined, epiEnclave);
    });
}

const getEpiEnclaveAsync = async (keySSI) => {
    return $$.promisify(getEpiEnclave)(keySSI);
}
const getSlotFromEpiEnclave = async (epiEnclave) => {
    const privateKey = await $$.promisify(epiEnclave.getPrivateKeyForSlot)(undefined, 0);
    console.log("GETTING SLOT FROM EPI ENCLAVE", privateKey);
    return privateKey.toString("base64");
}

const MIGRATION_SECRET_NAME = "wallet_migration";
let migrationStatus = MIGRATION_STATUS.NOT_STARTED;

const migrationDone = async () => {
    const secretsServiceInstance = await API_HUB.getSecretsServiceInstanceAsync(config.storage);
    let secret;
    try {
        secret = secretsServiceInstance.readSecretFromDefaultContainerSync(MIGRATION_SECRET_NAME);
    } catch (e) {
        console.log("Failed to read secret", MIGRATION_SECRET_NAME, e);
    }
    if (secret && secret === process.env.EPI_VERSION) {
        return true;
    }

    return false;
}

const copySlotToSecrets = async (slot, domain, subdomain) => {
    const secretsServiceInstance = await API_HUB.getSecretsServiceInstanceAsync(config.storage);
    await secretsServiceInstance.putSecretInDefaultContainerAsync(generateEnclaveName(domain, subdomain), slot);
}

const migrateDataFromEpiEnclaveToLightDB = async (domain, subdomain, epiEnclaveKeySSI) => {
    migrationStatus = MIGRATION_STATUS.IN_PROGRESS;
    let slot;
    let epiEnclave;
    try {
        epiEnclave = await getEpiEnclaveAsync(epiEnclaveKeySSI);
    } catch (e) {
        console.error("Failed to get epi enclave", e);
        migrationStatus = MIGRATION_STATUS.FAILED;
        throw e;
    }
    try {
        slot = await getSlotFromEpiEnclave(epiEnclave);
    } catch (err) {
        console.error("Failed to get slot from epi enclave", err);
        migrationStatus = MIGRATION_STATUS.FAILED;
        throw err;
    }

    try {
        await copySlotToSecrets(slot, domain, subdomain);
    } catch (e) {
        console.error("Failed to copy slot to secrets", e);
        migrationStatus = MIGRATION_STATUS.FAILED;
        throw e;
    }
    console.log("Slot copied to secrets");

    const LightDBEnclaveFactory = require("./LightDBEnclaveFactory");
    const lightDBEnclaveFactory = LightDBEnclaveFactory.getLightDBEnclaveFactoryInstance();
    const lightDBEnclave = await lightDBEnclaveFactory.createLightDBEnclaveAsync(domain, subdomain, true);

    // Define transformations for specific tables
    const transformProduct = record => {
        delete record.pk;
        record.productCode = record.gtin;
        record.inventedName = record.name;
        record.nameMedicinalProduct = record.description;
        return record;
    };

    const generateProductPk = record => record.gtin;

    const transformBatch = record => {
        delete record.pk;
        record.batchNumber = record.batchNumber || record.batch;
        record.inventedName = record.productName;
        record.nameMedicinalProduct = record.productDescription;
        record.productCode = record.gtin;
        record.expiryDate = record.expiry;
        return record;
    }

    const transformUserAccess = record => {
        record.username = record.userId;
        return record;
    }

    /*
    * old format kept logs in DSU so needs to be extracted
    * */
    const getLogDetails = async (record) => {
        if (record.auditKeySSI) {
            let auditDSU = await $$.promisify(resolver.loadDSU)(record.auditKeySSI);
            let auditDetails = await $$.promisify(auditDSU.readFile)("/audit.json");
            record = JSON.parse(auditDetails);
        }
        return record;
    }

    const transformAuditForBatch = async (record) => {
        record.batchNumber = record.itemCode;
        record.itemCode = record.gtin;
        // in case the old format does not have diffs property we should calculate it
        if (!record.diffs) {
            let auditDetails = await getLogDetails(record);
            record.diffs = auditDetails.diffs || getDiffsForAudit(auditDetails.logInfo.batch, {});
        }
    }

    const transformAuditForProduct = async (record) => {
        // in case the old format does not have diffs property we should calculate it
        if (!record.diffs) {
            let auditDetails = await getLogDetails(record);
            record.diffs = auditDetails.diffs || getDiffsForAudit(auditDetails.logInfo.product, {});
        }
    }

    const transformAuditLog = async record => {
        delete record.pk;
        let auditDetailsObject = {};
        if (record.logType === "BATCH_LOG") {
            try {
                await transformAuditForBatch(record);
            } catch (e) {
                console.log(e);
                //if fails to retrieve audit DSU data keep useful info for later use
                if (record.auditKeySSI) {
                    auditDetailsObject.auditKeySSI = record.auditKeySSI;
                    auditDetailsObject.anchorId = record.anchorId || "";
                    auditDetailsObject.hashLink = record.hashLink || "";
                }
            }
            auditDetailsObject.path = `/batch.epi_v1`
        }

        if (record.logType === "PRODUCT_LOG") {
            try {
                await transformAuditForProduct(record);
            } catch (e) {
                console.log(e);
                //if fails to retrieve audit DSU data keep useful info for later use
                if (record.auditKeySSI) {
                    auditDetailsObject.auditKeySSI = record.auditKeySSI;
                    auditDetailsObject.anchorId = record.anchorId || "";
                    auditDetailsObject.hashLink = record.hashLink || "";
                }
            }
            auditDetailsObject.path = `/product.epi_v1`
        }

        if (record.diffs) {
            auditDetailsObject.diffs = record.diffs;
        }

        if (record.status) {
            auditDetailsObject.status = record.status;
        }

        if (record.logType === "LEAFLET_LOG") {
            let auditDetails = await getLogDetails(record);
            record.details = [{
                epiLanguage: auditDetails.logInfo.language,
                epiType: auditDetails.logInfo.messageType
            }]
            if (record.metadata && record.metadata.attachedTo === "BATCH") {
                record.batchNumber = record.metadata.batch;
                record.itemCode = record.metadata.gtin;
            }
        } else {
            record.details = [auditDetailsObject];
        }

        if (record.anchorId && record.hashLink && !record.version) {
            try {
                let allVersions = await $$.promisify(anchoringX.getAllVersions)(record.anchorId)
                let version = allVersions.findIndex(item => item.getIdentifier() === record.hashLink);
                if (version >= 0) {
                    record.version = version + 1;
                }
            } catch (e) {
                //do nothing
            }
        }

        return record;
    }
    const generatePkForAudit = record => {
        let pk = record.pk;
        if (typeof pk !== "string") {
            pk = JSON.stringify(pk);
        }

        if (!pk) {
            pk = openDSU.loadAPI("crypto").generateRandom(32).toString("hex");
        }

        return pk;
    }
    const generateBatchPk = record => {
        return `${record.gtin}_${record.batchNumber}`;
    }

    const noTransform = record => record;

    try {
        // Use the generalized migration function for different tables with appropriate transformations
        await migrateDataToLightDB(epiEnclave, lightDBEnclave, "products", "products", transformProduct, generateProductPk);
        console.log("Products migrated")
        await migrateDataToLightDB(epiEnclave, lightDBEnclave, "batches", "batches", transformBatch, generateBatchPk);
        console.log("Batches migrated")
        await migrateDataToLightDB(epiEnclave, lightDBEnclave, "logs", "audit", transformAuditLog, generatePkForAudit);
        console.log("Audit migrated")
        await migrateDataToLightDB(epiEnclave, lightDBEnclave, "login_logs", "user-access", transformUserAccess);
        console.log("User actions migrated")
        await migrateDataToLightDB(epiEnclave, lightDBEnclave, "path-keyssi-private-keys", "path-keyssi-private-keys", noTransform);
        console.log("Path keyssi private keys migrated")
    } catch (e) {
        console.error("Failed to migrate data", e);
        migrationStatus = MIGRATION_STATUS.FAILED;
        throw e;
    }

    try {
        const secretsServiceInstance = await API_HUB.getSecretsServiceInstanceAsync(config.storage);
        await secretsServiceInstance.putSecretInDefaultContainerAsync(MIGRATION_SECRET_NAME, process.env.EPI_VERSION);
        console.log("=============================================================")
        console.log("Migration of old wallet completed");
        console.log("=============================================================")
    } catch (e) {
        console.error("Failed to mark migration as done", e);
        migrationStatus = MIGRATION_STATUS.FAILED;
        throw e;
    }
}

const getMigrationStatus = async () => {
    let migrationIsDone = await migrationDone();
    if (migrationIsDone) {
        return MIGRATION_STATUS.COMPLETED;
    }

    return migrationStatus;
}

module.exports = {
    getMigrationStatus,
    migrateDataFromEpiEnclaveToLightDB
}

},{"./Events":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/Events.js","./LightDBEnclaveFactory":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/LightDBEnclaveFactory.js","./constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/constants.js","./migrationUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/migrationUtils.js","apihub":false,"opendsu":false,"process":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/demiurgeMigration.js":[function(require,module,exports){
const API_HUB = require('apihub');
let config = API_HUB.getServerConfig();
const {migrateDataToLightDB} = require('./migrationUtils');
const LightDBEnclaveFactory = require("./LightDBEnclaveFactory");
const {getDiffsForAudit} = require("./Events");
const process = require("process");
const openDSU = require("opendsu");
const enclaveAPI = openDSU.loadAPI("enclave");
const crypto = openDSU.loadAPI("crypto");
const constants = require("./constants");
const MIGRATION_STATUS = constants.MIGRATION_STATUS;
const APP_NAME = "Demiurge";
const PREFIX = 'DB_';
const generateEnclaveName = (domain, subdomain) => `${PREFIX}${domain}_${subdomain}_${APP_NAME}`;


const MIGRATION_SECRET_NAME = "demiurge_migration";
let migrationStatus = MIGRATION_STATUS.NOT_STARTED;

const migrationDone = async () => {
    const secretsServiceInstance = await API_HUB.getSecretsServiceInstanceAsync(config.storage);
    let secret;
    try {
        secret = secretsServiceInstance.readSecretFromDefaultContainerSync(MIGRATION_SECRET_NAME);
    } catch (e) {
        console.log("Failed to read secret", MIGRATION_SECRET_NAME, e);
    }
    if (secret && secret === process.env.EPI_VERSION) {
        return true;
    }

    return false;

}
const getDemiurgeSharedEnclave = (keySSI, callback) => {
    const epiEnclave = enclaveAPI.initialiseWalletDBEnclave(keySSI);

    epiEnclave.on("error", (err) => {
        return callback(err);
    })

    epiEnclave.on("initialised", async () => {
        callback(undefined, epiEnclave);
    });
}

const getDemiurgeSharedEnclaveAsync = async (keySSI) => {
    return $$.promisify(getDemiurgeSharedEnclave)(keySSI);
}

const generateAndSaveSlotToSecrets = async (domain, subdomain) => {
    const slot = crypto.generateRandom(32).toString("base64");
    const secretsServiceInstance = await API_HUB.getSecretsServiceInstanceAsync(config.storage);
    await secretsServiceInstance.putSecretInDefaultContainerAsync(generateEnclaveName(domain, subdomain, APP_NAME), slot);
}

const migrateDataFromDemiurgeSharedEnclaveToLightDB = async (domain, subdomain, demiurgeSharedEnclaveKeySSI) => {
    migrationStatus = MIGRATION_STATUS.IN_PROGRESS;
    let demiurgeSharedEnclave;
    try {
        demiurgeSharedEnclave = await getDemiurgeSharedEnclaveAsync(demiurgeSharedEnclaveKeySSI);
    } catch (e) {
        console.error("Failed to get epi enclave", e);
        migrationStatus = MIGRATION_STATUS.FAILED;
        throw e;
    }

    try {
        await generateAndSaveSlotToSecrets(domain, subdomain);
    } catch (e) {
        console.error("Failed to generate slot and save to secrets", e);
        migrationStatus = MIGRATION_STATUS.FAILED;
        throw e;
    }
    console.log("Slot generated and saved to secrets");

    const LightDBEnclaveFactory = require("./LightDBEnclaveFactory");
    const lightDBEnclaveFactory = LightDBEnclaveFactory.getLightDBEnclaveFactoryInstance();
    const lightDBEnclave = await lightDBEnclaveFactory.createLightDBEnclaveAsync(domain, subdomain, {appName: APP_NAME, skipCache: true});

    const transformUserAccess = record => {
        record.username = record.actionUserId;
        record.userGroup = record.group;

        return record;
    }

    const generatePkForAudit = record => {
        let pk = record.pk;
        if (typeof pk !== "string") {
            pk = JSON.stringify(pk);
        }

        if (!pk) {
            pk = openDSU.loadAPI("crypto").generateRandom(32).toString("hex");
        }

        return pk;
    }


    try {
        // Use the generalized migration function for different tables with appropriate transformations
        await migrateDataToLightDB(demiurgeSharedEnclave, lightDBEnclave, "demiurge_logs_table", "audit", transformUserAccess, generatePkForAudit);
        console.log("Audit migrated")
    } catch (e) {
        console.error("Failed to migrate data", e);
        migrationStatus = MIGRATION_STATUS.FAILED;
        throw e;
    }

    try {
        const secretsServiceInstance = await API_HUB.getSecretsServiceInstanceAsync(config.storage);
        await secretsServiceInstance.putSecretInDefaultContainerAsync(MIGRATION_SECRET_NAME, process.env.EPI_VERSION);
        console.log("=============================================================")
        console.log("Audit migration completed");
        console.log("=============================================================")
    } catch (e) {
        console.error("Failed to mark migration as done", e);
        migrationStatus = MIGRATION_STATUS.FAILED;
        throw e;
    }
}

const getDemiurgeMigrationStatus = async () => {
    let migrationIsDone = await migrationDone();
    if (migrationIsDone) {
        return MIGRATION_STATUS.COMPLETED;
    }

    return migrationStatus;
}

module.exports = {
    getDemiurgeMigrationStatus,
    migrateDataFromDemiurgeSharedEnclaveToLightDB
}

},{"./Events":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/Events.js","./LightDBEnclaveFactory":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/LightDBEnclaveFactory.js","./constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/constants.js","./migrationUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/migrationUtils.js","apihub":false,"opendsu":false,"process":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/getUserId.js":[function(require,module,exports){
function isEmail(ssoDetectedId) {
    const regexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexPattern.test(ssoDetectedId);
}

const getUserId = (req, message) => {
    if (isEmail(req.headers["user-id"])) {
        return req.headers["user-id"];
    }

    if (message && message.senderId) {
        return `${message.senderId} [${req.headers["user-id"]}]`;
    }

    return req.headers["user-id"];
}

module.exports = {
    getUserId
}
},{}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/middlewares.js":[function(require,module,exports){
function requestBodyJSONMiddleware(request, response, next) {
    let data = "";

    request.on('data', (chunk) => {
        data += chunk;
    });

    request.on('end', () => {
        if (!data.length) {
            request.body = undefined;
            return next();
        }

        request.body = data;
        next();
    });
}

function getIntegrationAPIsAuthorizationMiddleware(server) {
    const BASE_PATH = "/integration/*";
    const READ_SCOPE = "read";
    const WRITE_SCOPE = "write";
    const SCOPES = [READ_SCOPE, WRITE_SCOPE];
    const WHITELISTED_PATHS = ["/integration/audit"];
    const APP_NAME = "DSU_Fabric";
    const apihub = require("apihub");
    const crypto = require("opendsu").loadAPI("crypto");
    server.use(BASE_PATH, async (req, res, next) => {
        const secretsServiceInstance = await apihub.getSecretsServiceInstanceAsync();
        if (req.headers["x-api-key"] && await secretsServiceInstance.validateAPIKey(req.headers["x-api-key"])) {
            next();
            return;
        }
        const userId = req.headers["user-id"];
        let adminSecret;
        try {
            adminSecret = await secretsServiceInstance.getSecretSync(secretsServiceInstance.constants.CONTAINERS.ADMIN_API_KEY_CONTAINER_NAME, req.headers["user-id"])
        } catch (e) {
            // ignored and handled below
        }
        if(adminSecret){
            next();
            return;
        }
        const secretName = crypto.sha256JOSE(APP_NAME + userId, "base64url");
        let secret;
        let apiKey;
        try {
            secret = secretsServiceInstance.getSecretSync(secretsServiceInstance.constants.CONTAINERS.USER_API_KEY_CONTAINER_NAME, secretName);
            secret = JSON.parse(secret);
            if (Object.keys(secret).length === 0) {
                throw new Error("Invalid secret");
            }
            apiKey = JSON.parse(Object.values(secret)[0]);
        } catch (e) {
            res.statusCode = 401;
            res.end(`User is not authorized`);
            return;
        }

        if (!SCOPES.includes(apiKey.scope)) {
            res.statusCode = 401;
            res.end(`User does not have the necessary permissions`);
            return;
        }

        if (apiKey.scope === READ_SCOPE) {
            if (WHITELISTED_PATHS.some(path => req.url.includes(path))) {
                next();
                return;
            }

            if ((req.method === "PUT" || req.method === "POST" || req.method === "DELETE")) {
                res.statusCode = 401;
                res.end(`User does not have write access`);
                return;
            }
        }

        next();
    });
}

function ThrottlerMiddleware(server, config) {
    const TokenBucket = require("apihub").TokenBucket;
    const defaultUpdateProductOrBatchConfig = {
        startTokens: 30,
        tokenValuePerTime: 1,
        unitOfTime: 2000
    }

    const defaultUpdateEPIConfig = {
        startTokens: 10,
        tokenValuePerTime: 1,
        unitOfTime: 2000
    }

    if (!config) {
        config = {};
    }

    const updateProductsAndBatchesConfig = config.updateProductOrBatch || defaultUpdateProductOrBatchConfig;
    const updateEPIsConfig = config.updateEPI || defaultUpdateEPIConfig;

    const updateProductAndBatchesTokenBucket = new TokenBucket(updateProductsAndBatchesConfig.startTokens, updateProductsAndBatchesConfig.tokenValuePerTime, updateProductsAndBatchesConfig.unitOfTime);
    const updateEPIsTokenBucket = new TokenBucket(updateEPIsConfig.startTokens, updateEPIsConfig.tokenValuePerTime, updateEPIsConfig.unitOfTime);

    function getThrottlerMiddleware(tokenBucket) {
        return function throttlerMiddleware(req, res, next) {
            tokenBucket.takeToken("*", 1, (err) => {
                if (err) {
                    if (err === TokenBucket.ERROR_LIMIT_EXCEEDED) {
                        res.statusCode = 429;
                    } else {
                        res.statusCode = 500;
                    }

                    res.end();
                    return;
                }
                next();
            });
        }
    }

    server.put("/integration/product/:gtin", getThrottlerMiddleware(updateProductAndBatchesTokenBucket));
    server.post("/integration/product/:gtin", getThrottlerMiddleware(updateProductAndBatchesTokenBucket));

    server.put("/integration/image/:gtin", getThrottlerMiddleware(updateProductAndBatchesTokenBucket));
    server.post("/integration/image/:gtin", getThrottlerMiddleware(updateProductAndBatchesTokenBucket));

    server.put("/integration/batch/:gtin/:batchNumber", getThrottlerMiddleware(updateProductAndBatchesTokenBucket));
    server.post("/integration/batch/:gtin/:batchNumber", getThrottlerMiddleware(updateProductAndBatchesTokenBucket));

    server.put("/integration/epi/*", getThrottlerMiddleware(updateEPIsTokenBucket));
    server.post("/integration/epi/*", getThrottlerMiddleware(updateEPIsTokenBucket));
}


/**
 * Middleware for limiting concurrent requests.
 *
 * @constructor
 * @param {number} maxConcurrentRequests - The maximum number of concurrent requests allowed.
 * @param {number} [requestTimeout=60000] - The timeout for each request in milliseconds.
 */
function RequestLimiter(maxConcurrentRequests, requestTimeout = 60000) {
    this.maxConcurrentRequests = maxConcurrentRequests;
    this.currentRequests = 0;

    this.requestMiddleware = (req, res, next) => {
        if (this.currentRequests >= this.maxConcurrentRequests) {
            res.statusCode = 429;
            res.end('Too many requests. Please try again later.');
            return;
        }

        this.currentRequests++;

        const timeoutId = setTimeout(() => {
            if (!res.headersSent) {
                res.statusCode = 408;
                res.end('Request timeout. Please try again.');
            }
        }, requestTimeout);

        const finalize = () => {
            clearTimeout(timeoutId);
            this.currentRequests--;
        };

        res.on('finish', finalize);
        res.on('close', finalize);

        next();
    };
}

const getRequestLimiterMiddleware = (server) => {
    let config = server.config["componentsConfig"]["integration-api"]["requestLimiterConfig"]
    if (!config) {
        config = {}
    }
    config.metadataCapacity = config.metadataCapacity || 5;
    config.epiCapacity = config.epiCapacity || 5;
    const metadataRequestLimiter = new RequestLimiter(config.metadataCapacity);
    const epiRequestLimiter = new RequestLimiter(config.epiCapacity);

    server.put("/integration/product/*", metadataRequestLimiter.requestMiddleware);
    server.post("/integration/product/*", metadataRequestLimiter.requestMiddleware);

    server.put("/integration/batch/*", metadataRequestLimiter.requestMiddleware);
    server.post("/integration/batch/*", metadataRequestLimiter.requestMiddleware);

    server.put("/integration/image/*", metadataRequestLimiter.requestMiddleware);
    server.post("/integration/image/*", metadataRequestLimiter.requestMiddleware);

    server.delete("/integration/epi/*", epiRequestLimiter.requestMiddleware);
    server.put("/integration/epi/*", epiRequestLimiter.requestMiddleware);
    server.post("/integration/epi/*", epiRequestLimiter.requestMiddleware);
};

module.exports = {
    requestBodyJSONMiddleware,
    getIntegrationAPIsAuthorizationMiddleware,
    getRequestLimiterMiddleware
}
},{"apihub":false,"opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/migrationUtils.js":[function(require,module,exports){
// Generalized migration function
const migrateDataToLightDB = async (walletDBEnclave, lightDBEnclave, sourceTableName, targetTableName, transformRecord = async record => await record, generatePK = record => record.pk) => {
    let tables;
    try{
        tables = await $$.promisify(walletDBEnclave.getAllTableNames)($$.SYSTEM_IDENTIFIER);
    }catch (e) {
        console.error("Failed to get tables", e);
    }

    console.log("====================================================================================================");
    console.log(tables);
    console.log("====================================================================================================");

    let records;
    try {
        records = await $$.promisify(walletDBEnclave.getAllRecords)(undefined, sourceTableName);
        console.log(`Preparing to migrate ${records.length} records from table ${sourceTableName} to table ${targetTableName}`);
    } catch (e) {
        console.error("Failed to get records from table", sourceTableName, e);
        throw e;
    }

    let counter = 0;
    for (let record of records) {
        const transformedRecord = await transformRecord(record);
        let existingRecord;
        try {
            existingRecord = await $$.promisify(lightDBEnclave.getRecord)($$.SYSTEM_IDENTIFIER, targetTableName, generatePK(record));
        } catch (e) {
            //table does not exist
        }

        if (!existingRecord) {
            try {
                counter++;
                await $$.promisify(lightDBEnclave.insertRecord)($$.SYSTEM_IDENTIFIER, targetTableName, generatePK(record), transformedRecord);
            } catch (e) {
                console.error("Failed to insert record", transformedRecord, "in table", targetTableName, e);
                throw e;
            }
        }
    }
    try {
        await $$.promisify(lightDBEnclave.saveDatabase)($$.SYSTEM_IDENTIFIER);
    } catch (e) {
        console.error("Failed to save database", e);
        throw e;
    }
    console.log(`Migrated ${counter} records from table ${sourceTableName} to table ${targetTableName}`);
};

module.exports = {
    migrateDataToLightDB
}
},{}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/utils/recoveryUtils.js":[function(require,module,exports){
(function (__dirname){(function (){
function runRecovery(version, gtin, batchNumber){

    return new Promise((resolve, reject)=>{
        const { fork } = require('node:child_process');
        const logger = $$.getLogger("RecoveryDSUHandler", "integrationsAPIs");

        let path = require("path");
        let scriptPath = path.resolve(path.join(__dirname, 'RecoveryDSUHandler.js'));
        let cmdArgs = [version, gtin];
        if(batchNumber){
            cmdArgs.push(batchNumber);
        }
        const recoveryDSUHandler = fork(scriptPath, cmdArgs);

        recoveryDSUHandler.on('message', (message)=>{
            resolve(message.version);
        });

        recoveryDSUHandler.on('error', (error)=>{
            reject(error);
        });

        recoveryDSUHandler.on('close', (code) => {
            logger.info(`Recovery process for ${gtin} ${batchNumber?' batch '+batchNumber : ''} exited with code ${code}`);
        });
    });
}

module.exports = {
    runRecovery
}

}).call(this)}).call(this,"/lib/integrationAPIs/utils")

},{"node:child_process":false,"path":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/leaflet-web-api/index.js":[function(require,module,exports){
const XMLDisplayService = require("./../services/XMLDisplayService/XMLDisplayService");
const LeafletInfoService = require("./../services/LeafletInfoService");
const {EPI_TYPES} = require("../constants/constants");
const {getCountry} = require("../utils/Countries");
const utils = require("./leafletUtils");
const languageServiceUtils = require("../utils/Languages");
const GTIN_SSI = require("../GTIN_SSI");

function getWebLeaflet(server) {

  server.registerAccessControlAllowHeaders(["epiprotocolversion", "X-Merck-APIkey", "X-api-key"]);
  if (server.allowFixedUrl) {
    //let's make the fixedURL middleware aware of our endpoints
    server.allowFixedUrl("/leaflets/");
  }

  const logger = $$.getLogger("leaflet-web-api", "getWebLeaflet");
  async function getLeafletHandler(request, response) {
    let domainName = request.params.domain;
    const isValidDomain = require("swarmutils").isValidDomain;
    if (!isValidDomain(domainName)) {
      logger.error("Domain validation failed", domainName);
      response.statusCode = 400;
      return response.end("Invalid domain");
    }

    // Sanitize and validate input parameters
    let leaflet_type = request.query.leaflet_type || "";
    let gtin = request.query.gtin || null;
    let lang = request.query.lang || "";
    let batchNumber = request.query.batch || null;
    const epiMarket = request.query?.epiMarket || null;

    // Validate gtin to be numeric and 14 characters
    if (gtin && (!/^\d{14}$/.test(gtin) || typeof gtin !== "string")) {
      logger.info(0x103, `Validation failed for gtin.length`);
      return sendResponse(response, 400, JSON.stringify({ code: "002" }));
    }

    // Validate leaflet_type to only allow known values
    if (leaflet_type && !Object.values(EPI_TYPES).includes(leaflet_type)) {
      logger.info(0x103, `Unknown leaflet type: ${leaflet_type}`);
      return sendResponse(response, 400, "Unknown leaflet type. Please check API documentation.");
    }

    // Validate lang to allow only alphanumeric or hyphen (language code format)
    if (lang && !/^[a-zA-Z-]+$/.test(lang)) {
      logger.info(0x103, `Invalid language format: ${lang}`);
      return sendResponse(response, 400, "Invalid language format. Please check API documentation.");
    }

    if (epiMarket) {
      try {
        const country = getCountry(epiMarket);
        if (!country)
          throw new Error(`Invalid ePI Market: ${epiMarket}`);
      } catch (e) {
        return sendResponse(response, 400,  `Invalid ePI Market: ${epiMarket}.`);
      }
    }

    // Validate batchNumber if present
    if (batchNumber && batchNumber === "undefined") {
      batchNumber = null;
    }

    try {
      if (!gtin) {
        logger.info(0x103, `Missing required parameter <gtin>`);
        return sendResponse(response, 400, JSON.stringify({ code: "002" }));
      }

      let validationResult = require("../utils/ValidationUtils").validateGTIN(gtin);
      if (validationResult && !validationResult.isValid) {
        logger.info(0x103, `Validation failed for gtin`);
        return sendResponse(response, 400, JSON.stringify({ code: "003" }));
      }

      if (!leaflet_type) {
        logger.info(0x103, `Missing required parameter <leaflet_type>`);
        return sendResponse(response, 400, "leaflet_type is a required parameter. Please check API documentation.");
      }

      if (!lang) {
        logger.info(0x103, `Missing required parameter <lang>`);
        return sendResponse(response, 400, "lang is a required parameter. Please check API documentation.");
      }

      try {
        require("./../utils/Languages").getLanguageFromCode(lang);
      } catch (err) {
        logger.info(0x103, `Unable to handle lang: ${lang}`);
        return sendResponse(response, 400, "Unable to handle lang. Please check API documentation.");
      }

      let knownParams = ["leaflet_type", "gtin", "lang", "batch", "epiMarket", "fixedurlrequest"];
      let queryParams = Object.keys(request.query);
      for (let param of queryParams) {
        if (!knownParams.includes(param)) {
          logger.debug(`Query contains invalid param`, param);
          return server.makeLocalRequest("GET", `/leaflets/${domainName}?gtin=${gtin}&lang=${lang}&leaflet_type=${leaflet_type}&batch=${batchNumber}&epiMarket=${epiMarket}`, (err, content) => {
            if (err) {
              logger.error(0x100, "Error Object", err);
              return sendResponse(response, 529, "Server busy reading gtin-only leaflet");
            }
            logger.debug(0x100, "Successfully returned content without invalid params");
            return sendResponse(response, 200, content);
          });
        }
      }

      const GTIN_SSI = require("../GTIN_SSI");
      const productGtinSSI = GTIN_SSI.createGTIN_SSI(domainName, undefined, gtin);
      const utils = require("./leafletUtils");
      let productKnown = false;
      try{
        productKnown = await utils.checkDSUExistAsync(productGtinSSI);
      }catch(err){
        logger.info(0x103, `Unable to check Product DSU existence`);
        logger.error(err);
        return sendResponse(response, 529, "Server busy checking product existence");
      }

      if(!productKnown){
        logger.info(0x103, `Gtin unknown`);
        return sendResponse(response, 400, JSON.stringify({code: "001"}));
      }

      let leafletInfo = await LeafletInfoService.init({gtin, batchNumber}, domainName);

      const model = {
        product: {gtin},
        networkName: domainName
      }
      let leafletXmlService = new XMLDisplayService(null, leafletInfo.gtinSSI, model, leaflet_type);

      let batchExists = false;
      let preventProductFallback = false;
      try{
        const batchGtinSSI = GTIN_SSI.createGTIN_SSI(domainName, undefined, gtin, batchNumber);
        batchExists = await utils.checkDSUExistAsync(batchGtinSSI);
        if(batchExists){
          let batchLanguages = await utils.getLanguagesForBatchAsync(domainName, gtin, batchNumber);
          if(batchLanguages.indexOf(lang) !== -1){
            preventProductFallback = true;
          }else{
            let productLanguages = await utils.getLanguagesForProductAsync(domainName, gtin);
            if(productLanguages.indexOf(lang) !== -1){
              preventProductFallback = false;
            }else{
              //if we get to this point, and we have some languages we need to skip the fallback and let the normal apis to do their stuff
              if(batchLanguages.length){
                preventProductFallback = true;
              }
            }
          }
        }
      }catch(err){
        logger.info(0x103, `Unable to check Batch DSU existence`);
        logger.error(err);
        return sendResponse(response, 529, "Server busy checking batch existence");
      }

      if(!batchExists || (batchNumber && !preventProductFallback) ){
        let content;
        try{
          let uri = `/leaflets/${domainName}?gtin=${gtin}&lang=${lang}&leaflet_type=${leaflet_type}`;
          uri = epiMarket ? uri + `&epiMarket=${epiMarket}` : uri;
          content = await $$.promisify(server.makeLocalRequest, server)("GET", uri);
        }catch(err){ 
          if(err.httpCode && err.httpCode === 404){

          }else{
            logger.error(0x100, "Error message", err.message);
            logger.error(0x100, "Error Object", err);
            logger.error(0x100, "Error Stack", err.stack);
            return sendResponse(response, 529, `Server busy reading gtin only leaflet` );
          }
        }

        if(content){
            logger.info(0x100, "Successfully returned content from redirect to gtin only url");
            if(typeof content === "string")
                content = JSON.parse(content);
            if(content?.productData && !content.productData?.batchData)
                content.productData.batchData = await leafletInfo.getBatchClientModel();

            if(!content?.availableLanguages) {
              let constSSI = GTIN_SSI.createGTIN_SSI(domainName, undefined, gtin);
              let leafletXmlService = new XMLDisplayService(null, constSSI, model, leaflet_type);
              const langs = await leafletXmlService.mergeAvailableLanguages();
              content.availableLanguages = Object.keys(langs || {}).map((lang) => {
                return languageServiceUtils.getLanguageAsItemForVMFromCode(lang);
              });
            }

            if (!content?.availableMarkets) {
              const availableEpiMarkets = await utils.getEPIMarketsForProductAsync(domainName, gtin, leaflet_type);
              const invertedMarkets = {};
              for (const [lang, countries] of Object.entries(availableEpiMarkets)) {
                for (const country of countries) {
                  if (!invertedMarkets[country])
                    invertedMarkets[country] = [];
                  invertedMarkets[country].push(languageServiceUtils.getLanguageAsItemForVMFromCode(lang));
                }
              }
              content.availableEpiMarkets = invertedMarkets;
            }
            if (!content?.availableTypes)
              content.availableTypes = await utils.getEPITypesAsync(domainName, gtin);
            return sendResponse(response, 200, JSON.stringify(content));
        }
      }

      if (lang && epiMarket) {
        let productData = await leafletInfo.getProductClientModel();
        return leafletXmlService.readXmlFileFromMarket(lang, epiMarket, async (err, xmlContent, pathBase, leafletImagesObj) => {
          if (err) {
            if (err.statusCode === 504) {
              logger.error(0x100, "Error Object", err);
              return sendResponse(response, 529, "System busy; please try again later");
            }
            let errMessage = `No available XML for gtin=${gtin} language=${lang} epiMarket=${epiMarket} leaflet type=${leaflet_type}`;
            logger.info(0x103, errMessage);
            return sendResponse(response, 200, JSON.stringify({
              resultStatus: "has_no_leaflet",
              epiMarket: epiMarket,
              productData,
            }));
          }

          logger.audit(0x101, `Successful serving url ${response.req.url}`);
          console.log("")
          return sendResponse(response, 200, JSON.stringify({
            resultStatus: "xml_found",
            epiMarket: epiMarket,
            xmlContent,
            leafletImages: leafletImagesObj,
            productData
          }));
        });
      }

      leafletXmlService.readXmlFile(lang, async (err, xmlContent, pathBase, leafletImagesObj) => {
        if (err) {
          if (err.statusCode === 504) {
            logger.error(0x100, "Error Object", err);
            return sendResponse(response, 529, "System busy; please try again later");
          }
          let errMessage = `No available XML for gtin=${gtin} language=${lang} leaflet type=${leaflet_type}`
          if (batchNumber) {
            errMessage = `${errMessage} batchNumber id=${batchNumber}`;
          }

          utils.getAvailableLanguagesForType(leafletInfo.gtinSSI, gtin, leaflet_type, async (langerr, availableLanguages) => {
            if (langerr) {
              logger.error(langerr);
              logger.info(0x103, errMessage);
              return sendResponse(response, 529, "System busy; please try again later");
            }

            let productData = await leafletInfo.getProductClientModel();

            if(!availableLanguages || !availableLanguages.length){

              return sendResponse(response, 200, JSON.stringify({
                resultStatus: "has_no_leaflet",
                productData
              }));
            }
            logger.info(0x100, "Sending alternative languages");
            return sendResponse(response, 200, JSON.stringify({
              resultStatus: "no_xml_for_lang",
              availableLanguages: availableLanguages,
              productData
            }));
          });
        } else {
          let productData = await leafletInfo.getProductClientModel();
          try {
            let batchData = await leafletInfo.getBatchClientModel();
            productData.batchData = batchData;
          } catch (e) {
            // gtin only case
            productData.batchData = null;
          }
          // logger.audit(0x101, `Successful serving url ${response.req.url}`);
          return sendResponse(response, 200, JSON.stringify({
            resultStatus: "xml_found",
            xmlContent,
            leafletImages: leafletImagesObj,
            productData
          }));
        }
      }, lang)
    } catch (err) {
      logger.info(0x103, err.message);
      return sendResponse(response, 500, err.message);
    }
  }

  async function getLeafletDocumentsHandler(request, response) {
    let domainName = request.params.domain;
    const isValidDomain = require("swarmutils").isValidDomain;
    if (!isValidDomain(domainName)) {
      logger.error("Domain validation failed", domainName);
      response.statusCode = 400;
      return response.end("Invalid domain");
    }

    // Sanitize and validate input parameters
    let leaflet_type = request.query.leaflet_type || "";
    let gtin = request.query.gtin || null;

    // Validate gtin to be numeric and 14 characters
    if (gtin && (!/^\d{14}$/.test(gtin) || typeof gtin !== "string")) {
      logger.info(0x103, `Validation failed for gtin.length`);
      return sendResponse(response, 400, JSON.stringify({ code: "002" }));
    }

    // Validate leaflet_type to only allow known values
    if (leaflet_type && !Object.values(EPI_TYPES).includes(leaflet_type)) {
      logger.info(0x103, `Unknown leaflet type: ${leaflet_type}`);
      return sendResponse(response, 400, "Unknown leaflet type. Please check API documentation.");
    }




  }

  // server.get("/leaflets/:domain/documents",getLeafletDocumentsHandler);
  server.get("/leaflets/:domain",getLeafletHandler);
  server.get("/leaflets/:domain/:subdomain",function(req, res){
    let url = req.url.replace(`/${req.params.subdomain}`, "");
    logger.debug("Local searching for Leaflet without the extra params");
    return server.makeLocalRequest("GET", url, (err, content)=>{
      if(err){
        logger.error(0x100, "Error Object", err);
        return sendResponse(res, 529, `Server busy reading leaflet` );
      }
      logger.debug(0x100, "Successfully returned content after local redirect");
      return sendResponse(res, 200, content);
    });
  });
}


function sendResponse(response, statusCode, message) {
  response.statusCode = statusCode;
  if(statusCode === 200){
    response.setHeader("Content-type", "application/json");
  }else{
    response.setHeader("Content-Type", "text/plain");
  }
  response.end(message);
}

module.exports.getWebLeaflet = getWebLeaflet;

},{"../GTIN_SSI":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/GTIN_SSI.js","../constants/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","../utils/Countries":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/Countries.js","../utils/Languages":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/Languages.js","../utils/ValidationUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/ValidationUtils.js","./../services/LeafletInfoService":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/LeafletInfoService.js","./../services/XMLDisplayService/XMLDisplayService":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/XMLDisplayService/XMLDisplayService.js","./../utils/Languages":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/Languages.js","./leafletUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/leaflet-web-api/leafletUtils.js","swarmutils":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/leaflet-web-api/leafletUtils.js":[function(require,module,exports){
const XMLDisplayService = require("../services/XMLDisplayService/XMLDisplayService");
const GTIN_SSI = require("../GTIN_SSI");
const {EPI_TYPES} = require("../constants/constants");

function ApiCache(expirationTime){
    let cache = {};
    this.registerResult = function(uid, apiName, result){
        cache[uid+apiName] = {result, time:Date.now()};
    }

    this.getResult = function(uid, apiName){
        let potentialResult = cache[uid+apiName];
        if(!potentialResult){
            return;
        }
        if(Date.now()-expirationTime < potentialResult.time){
            return potentialResult.result;
        }
        delete cache[uid+apiName];
        return;
    }
}

let apiCache = new ApiCache(10*1000);

module.exports.getLanguagesForProductAsync = async function(domain, gtin){
    let apiName = "getLanguagesForProductAsync";
    let constSSI = GTIN_SSI.createGTIN_SSI(domain, undefined, gtin);
    let uid = constSSI.getIdentifier();
    let result = apiCache.getResult(uid, apiName);
    if(result){
        return result;
    }
    const model = {
        product: {gtin},
        networkName: domain
    }
    let leafletXmlService = new XMLDisplayService(null, constSSI, model, "leaflet");
    result = await $$.promisify(leafletXmlService.getAvailableLanguagesFromPath, leafletXmlService)(constSSI, leafletXmlService.getProductPathToXmlType());
    apiCache.registerResult(uid, apiName, result);
    return result;
}

module.exports.getLanguagesForBatchAsync = async function(domain, gtin, batch){
    let apiName = "getLanguagesForBatchAsync";
    let constSSI = GTIN_SSI.createGTIN_SSI(domain, undefined, gtin, batch);
    let uid = constSSI.getIdentifier();
    let result = apiCache.getResult(uid, apiName);
    if(result){
        return result;
    }
    const model = {
        product: {gtin},
        networkName: domain
    }
    let leafletXmlService = new XMLDisplayService(null, constSSI, model, "leaflet");
    result = await $$.promisify(leafletXmlService.getAvailableLanguagesFromPath, leafletXmlService)(constSSI, leafletXmlService.getBatchPathToXmlType());
    apiCache.registerResult(uid, apiName, result);
    return result;
}

/**
 * @param {string} domain - The domain name for which the ePI market information is requested.
 * @param {string} gtin - GTIN of the product.
 * @param {string} epiType - The type of ePI
 *
 * @returns {Promise<Object<string, string[]>>}
 */
module.exports.getEPIMarketsForProductAsync = async function(domain, gtin, epiType){
    let apiName = `getEPIMarketsForProductAsync_${epiType}`;
    let constSSI = GTIN_SSI.createGTIN_SSI(domain, undefined, gtin);
    let uid = constSSI.getIdentifier();
    let result = apiCache.getResult(uid, apiName);
    if(result){
        return result;
    }
    const model = {
        product: {gtin},
        networkName: domain
    }
    let leafletXmlService = new XMLDisplayService(null, constSSI, model, epiType);
    result = await $$.promisify(leafletXmlService.getAvailableMarketsForProduct, leafletXmlService)();
    apiCache.registerResult(uid, apiName, result);
    return result;
}

module.exports.getEPITypesAsync = async function(domain, gtin) {
    let apiName = "getEPITypesAsync";
    let constSSI = GTIN_SSI.createGTIN_SSI(domain, undefined, gtin);
    let uid = constSSI.getIdentifier();
    let result = apiCache.getResult(uid, apiName);
    if (result) {
        return result;
    }

    let availableLeafletTypes = [];
    const model = {product: { gtin }, networkName: domain};
    const epiTypes = Object.values(EPI_TYPES); //.filter((type) => type !== EPI_TYPES.SMPC);
    for (let epiType of epiTypes) {
        let leafletXmlService = new XMLDisplayService(null, constSSI, model, epiType);
        const noMarketLeafletsLanguages = await leafletXmlService.mergeAvailableLanguages();
        const marketLeaflets = await $$.promisify(leafletXmlService.hasMarketXMLAvailable, leafletXmlService)();
        if (Object.keys(noMarketLeafletsLanguages).length > 0 || marketLeaflets) {
            availableLeafletTypes.push(epiType);
        }
    }
    apiCache.registerResult(uid, apiName, availableLeafletTypes);
    return availableLeafletTypes;
};

module.exports.checkDSUExistAsync = async function(constSSI){
    let apiName = "checkDSUExist";
    let uid = constSSI.getIdentifier();
    let result = apiCache.getResult(uid, apiName);
    if(result){
        return result;
    }
    const resolver = require("opendsu").loadApi("resolver");
    result = await $$.promisify(resolver.dsuExists)(constSSI);
    apiCache.registerResult(uid, apiName, result);
    return result;
}

module.exports.getAvailableLanguagesForType = function(constSSI, gtin, type, callback){
    let apiName = "getAvailableLanguagesForType"+type;
    let uid = constSSI.getIdentifier();
    let result = apiCache.getResult(uid, apiName);
    if(result){
        return callback(undefined, result.availableLanguages, result.availableMarkets);
    }

    const model = {
        product: {gtin},
        networkName: constSSI.getDLDomain()
    }
    let leafletXmlService = new XMLDisplayService(null, constSSI, model, type);

    leafletXmlService.getAvailableMarketsForProduct((err, availableMarkets) => {
        leafletXmlService.getAvailableLanguagesForXmlType((langerr, availableLanguages) => {
            if(langerr){
                return callback;
            }
            apiCache.registerResult(uid, apiName, {availableLanguages, availableMarkets});
            return callback(undefined, availableLanguages, availableMarkets);
        });
    });
}

module.exports.dsuExists = function (server, keySSI, gtin, useFastRoute=false, callback){
    if(typeof useFastRoute === "function"){
        callback = useFastRoute;
        useFastRoute = false;
    }

    function resolverCheckDSU(){
        const resolver = require("opendsu").loadApi("resolver");
        resolver.dsuExists(keySSI, callback);
    }

    if(useFastRoute){
        return server.makeLocalRequest("GET",`/gtinOwner/${keySSI.getDLDomain()}/${gtin}`, "", (err, response)=>{
            if(err || !response.domain){
                if(!err.cause){
                    //network error
                }
                return resolverCheckDSU();
            }

            return callback(undefined, true);
        });
    }

    resolverCheckDSU();
}

module.exports.dsuExistsAsync = $$.promisify(module.exports.dsuExists);
},{"../GTIN_SSI":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/GTIN_SSI.js","../constants/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","../services/XMLDisplayService/XMLDisplayService":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/XMLDisplayService/XMLDisplayService.js","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/batch/batch.js":[function(require,module,exports){
const utils = require("../../utils/CommonUtils");
const validationUtils = require("../../utils/ValidationUtils");
const constants = require("../../constants/constants.js");
const batchUtils = require("./batchUtils");
const ModelMessageService = require('../../services/ModelMessageService');
const logUtils = require("../../utils/LogUtils");
const schema = require("./batchSchema");
const dbUtils = require("../../utils/DBUtils");
const productUtils = require("../product/productUtils");

function verifyIfBatchMessage(message) {
  return message.messageType === "Batch";
}

async function processBatchMessage(message) {

  this.mappingLogService = logUtils.createInstance(this.storageService, this.options.logService);

  await validationUtils.validateMessageOnSchema.call(this, message, schema);
  await validationUtils.validateMVP1Values.call(this, message, "batch");
  const batchId = message.batch.batch;
  const productCode = message.batch.productCode;

  const {
    batchDSU,
    batchConstDSU,
    alreadyExists,
    gtinSSI
  } = await batchUtils.getBatchDSU.call(this, message, productCode, batchId, true);

  let anchoringDomain = this.options.holderInfo.domain;
  let brickingDomain = this.options.holderInfo.subdomain;

  let batchMetadata = await batchUtils.getBatchMetadata.call(this, message, utils.getBatchMetadataPK(productCode, batchId), alreadyExists);

  /*
* extension of the file will contain epi version. Used format is epi_+epiVersion;
* Ex: for version 1 - batch.epi_v1
*  */
  const indication = require("../utils").getBatchJSONIndication(message);

  await this.loadJSONS(batchDSU, indication);

  if (typeof this.batch === "undefined") {
    this.batch = JSON.parse(JSON.stringify(batchMetadata));
  }else{
    //the batch is not new... we need to signal fixedUrl that an update will follow
    const utils = require("./../utils");
    await $$.promisify(utils.deactivateGtinOwnerFixedUrl)(batchConstDSU, anchoringDomain, productCode);
    await $$.promisify(utils.deactivateLeafletFixedUrl)(batchConstDSU, brickingDomain, productCode);
  }

  let modelMsgService = new ModelMessageService("batch");
  //this line is similar to Object.assign, we try to get all the props from the message and assign to our batch model
  this.batch = {...this.batch, ...modelMsgService.getModelFromMessage(message.batch)};

  let {productDSU} = await productUtils.getProductDSU.call(this, message, productCode);

  const productIndication = {product: `${constants.PRODUCT_STORAGE_FILE}${message.messageTypeVersion}`};

  await this.loadJSONS(productDSU, productIndication);

  this.batch.productName = this.product.name;
  this.batch.productDescription = this.product.description;

  let diffs = this.mappingLogService.getDiffsForAudit(modelMsgService.getMessageFromModel(this.batch), alreadyExists ? modelMsgService.getMessageFromModel(batchMetadata) : null);

  if (this.batch.creationTime) {
    this.batch.creationTime = utils.convertDateTOGMTFormat(new Date());
  }

  this.batch.messageTime = message.messageDateTime;

  if (!this.batch.bloomFilterSerialisations) {
    this.batch.bloomFilterSerialisations = [];
  }

  manageSerialNumbers(this.batch);

  this.batch.version = await require("opendsu").loadApi("anchoring").getNextVersionNumberAsync(batchDSU.getCreationSSI());

  const batchClone = JSON.parse(JSON.stringify(this.batch));

  //we delete the arrays because they contain sensitive serial numbers, and we don't want them stored in "clear" in DSU.
  delete this.batch.serialNumbers;
  delete this.batch.recalledSerialNumbers;
  delete this.batch.decommissionedSerialNumbers;

  this.batch.epiProtocol = `v${message.messageTypeVersion}`;

  await this.saveJSONS(batchDSU, indication);

  Object.assign(batchMetadata, this.batch);
  if(!batchMetadata.pk){
    batchMetadata.pk = utils.getBatchMetadataPK(productCode, batchId);
  }

  if(alreadyExists){
    await $$.promisify(this.storageService.updateRecord, this.storageService)(constants.BATCHES_STORAGE_TABLE, batchMetadata.pk, batchMetadata);
  }else{
    await $$.promisify(this.storageService.insertRecord, this.storageService)(constants.BATCHES_STORAGE_TABLE, batchMetadata.pk, batchMetadata);
  }

  batchDSU.onCommitBatch(async ()=>{
    await this.mappingLogService.logSuccessAction(message, this.batch, alreadyExists, diffs, batchDSU);
  }, true);

  try{
    const fixedUrl = require("./../utils");
    await $$.promisify(fixedUrl.registerGtinOwnerFixedUrlByDomain)(anchoringDomain, productCode);
    const leafletUtils = require("./../leaflet/leafletUtils");
    const leafletTypes = leafletUtils.getLeafletTypes();
    for (let key in leafletTypes) {
      const type = leafletTypes[key];

      let languages = [];
      function merge(langs){
        for(let lang of langs){
          if(languages && languages.indexOf(lang)===-1){
            languages.push(lang);
          }
        }
      }

      let prodLangs = await $$.promisify(leafletUtils.getProductAvailableLanguages)(productDSU, productCode, type);
      merge(prodLangs);

      let batchLanguages = await $$.promisify(leafletUtils.getBatchAvailableLanguages)(batchDSU, productCode, type);
      merge(batchLanguages);

      for(let lang of languages){
        let expirationDate = require("./../../utils/CommonUtils").convertFromGS1DateToYYYY_HM(this.batch.expiry);
        let args = [anchoringDomain, brickingDomain, type, productCode, lang, this.batch.batchNumber, expirationDate, this.batch.epiLeafletVersion];
        await fixedUrl.registerLeafletFixedUrlByDomainAsync(...args);
        //let's register a supplementary fixedUrl without expiration date.
        args = [anchoringDomain, brickingDomain, type, productCode, lang, this.batch.batchNumber, undefined, this.batch.epiLeafletVersion];
        await fixedUrl.registerLeafletFixedUrlByDomainAsync(...args);
      }
    }

    fixedUrl.activateGtinOwnerFixedUrl(batchConstDSU, anchoringDomain, productCode);
    fixedUrl.activateLeafletFixedUrl(batchConstDSU, brickingDomain, productCode);
  }catch(err){
    console.log("Batch Mapping failed due to", err);
    const errMap = require("opendsu").loadApi("m2dsu").getErrorsMap();
    const errorUtils = require("../errors/errorUtils");
    errorUtils.addMappingError("NOT_ABLE_TO_ENSURE_DATA_CONSISTENCY_ON_SERVER");
    throw errMap.newCustomError(errMap.errorTypes.NOT_ABLE_TO_ENSURE_DATA_CONSISTENCY_ON_SERVER, message.messageType);
  }

  //from this line all the modifications will be only in sharedDB and not DSU

  // this.batch.keySSI = await batchDSU.getKeySSIAsString();

  this.batch.consKeySSI = gtinSSI;
  batchClone.keySSI = this.batch.keySSI;

  await dbUtils.createOrUpdateRecord(this.storageService, {table:constants.BATCHES_STORAGE_TABLE, pk:batchMetadata.pk}, batchClone);
}

function removeAllBloomFiltersOfType(bfList, type) {
  return bfList.filter((bfObj) => bfObj.type !== type);
}

function manageSerialNumbers(batch) {

  if (batch.snValidReset) {
    batch.bloomFilterSerialisations = removeAllBloomFiltersOfType(batch.bloomFilterSerialisations, constants.VALID_SERIAL_NUMBER_TYPE)
    batch.defaultSerialNumber = "";
    batch.snValidReset = false;
  }

  if (batch.snRecalledReset) {
    batch.bloomFilterSerialisations = removeAllBloomFiltersOfType(batch.bloomFilterSerialisations, constants.RECALLED_SERIAL_NUMBER_TYPE)
    batch.defaultRecalledSerialNumber = "";
    batch.snRecalledReset = false;
  }

  if (batch.snDecomReset) {
    batch.bloomFilterSerialisations = removeAllBloomFiltersOfType(batch.bloomFilterSerialisations, constants.DECOMMISSIONED_SERIAL_NUMBER_TYPE)
    batch.defaultDecommissionedSerialNumber = "";
    batch.snDecomReset = false;
  }

  let bf;
  if (batch.serialNumbers && batch.serialNumbers.length > 0) {
    bf = utils.getBloomFilterSerialisation(batch.serialNumbers);
    // batch.bloomFilterSerialisations.push(bf.bloomFilterSerialisation());
    batch.bloomFilterSerialisations.push({
      serialisation: bf.bloomFilterSerialisation(),
      type: constants.VALID_SERIAL_NUMBER_TYPE
    });
    batch.defaultSerialNumber = batch.serialNumbers[0];
  }

  if (batch.recalledSerialNumbers && batch.recalledSerialNumbers.length > 0) {
    bf = utils.getBloomFilterSerialisation(batch.recalledSerialNumbers);
    // batch.bloomFilterRecalledSerialisations.push(bf.bloomFilterSerialisation());
    batch.bloomFilterSerialisations.push({
      serialisation: bf.bloomFilterSerialisation(),
      type: constants.RECALLED_SERIAL_NUMBER_TYPE
    });
    batch.defaultRecalledSerialNumber = batch.recalledSerialNumbers[0];
  }
  if (batch.decommissionedSerialNumbers && batch.decommissionedSerialNumbers.length > 0) {
    bf = utils.getBloomFilterSerialisation(batch.decommissionedSerialNumbers);
    // batch.bloomFilterDecommissionedSerialisations.push(bf.bloomFilterSerialisation());
    batch.bloomFilterSerialisations.push({
      serialisation: bf.bloomFilterSerialisation(),
      type: constants.DECOMMISSIONED_SERIAL_NUMBER_TYPE
    });
    batch.defaultDecommissionedSerialNumber = batch.decommissionedSerialNumbers[0];
  }
}

require("opendsu").loadApi("m2dsu").defineMapping(verifyIfBatchMessage, processBatchMessage);

},{"../../constants/constants.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","../../services/ModelMessageService":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/ModelMessageService.js","../../utils/CommonUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/CommonUtils.js","../../utils/DBUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/DBUtils.js","../../utils/LogUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/LogUtils.js","../../utils/ValidationUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/ValidationUtils.js","../errors/errorUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/errors/errorUtils.js","../product/productUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/product/productUtils.js","../utils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/utils.js","./../../utils/CommonUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/CommonUtils.js","./../leaflet/leafletUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/leaflet/leafletUtils.js","./../utils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/utils.js","./batchSchema":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/batch/batchSchema.js","./batchUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/batch/batchUtils.js","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/batch/batchSchema.js":[function(require,module,exports){
const messageHeaderSchema = require("./../messageHeaderSchema");
let batchSchema = {
  "type": "object",
  "properties":
    {
      "payload": {
        "type": "object", "required": true,
        "properties": {
          "productCode": {"type": "string", "required": true},
          "batchNumber": {
            /*
            GS1 regex
            /^[!%-?A-Z_a-z\x22]{1,20}$/
            */
            "type": "string", "required": true, regex: /^[a-zA-Z0-9/-]{1,20}$/
          },
          "expiryDate": {"type": "batchDate", "required": true},
          "importLicenseNumber" : {"type": "string", "required": false},
          "dateOfManufacturing": {"type": "Date", "required": false},
          "manufacturerName": {"type": "string", "required": false},
          "manufacturerAddress1": {"type": "string", "required": false},
          "manufacturerAddress2": {"type": "string", "required": false},
          "manufacturerAddress3": {"type": "string", "required": false},
          "manufacturerAddress4": {"type": "string", "required": false},
          "manufacturerAddress5": {"type": "string", "required": false},
          "batchRecall": {"type": "boolean"},
          "packagingSiteName": {"type": "string"},
          "epiLeafletVersion": {"type": "number"},
          "flagEnableEXPVerification": {"type": "boolean"},
          "flagEnableExpiredEXPCheck": {"type": "boolean"},
          "batchMessage": {"type": "string"},
          "flagEnableBatchRecallMessage": {"type": "boolean"},
          "recallMessage": {"type": "string"},
          "flagEnableACFBatchCheck": {"type": "boolean"},
          "acfBatchCheckURL": {"type": "string"},
          "flagEnableSNVerification": {"type": "boolean"},
          // ACDC PATCH START
          "acdcAuthFeatureSSI": {"type": "string"},
          // ACDC PATCH END
          "snValidReset": {"type": "boolean"},
          "snValid": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      }
    }
}
batchSchema.properties = {...messageHeaderSchema, ...batchSchema.properties};
module.exports = batchSchema

},{"./../messageHeaderSchema":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/messageHeaderSchema.js"}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/batch/batchUtils.js":[function(require,module,exports){
const constants = require("../../constants/constants.js");
const GTIN_SSI = require("../../GTIN_SSI");
const productUtils = require("../product/productUtils");
const errUtils = require("../errors/errorUtils");
const logUtils = require("../../utils/LogUtils");
errUtils.addMappingError("BATCH_DSU_LOAD_FAIL");
errUtils.addMappingError("BATCH_MISSING_PRODUCT");
errUtils.addMappingError("EXISTING_BATCH_ID");
const errMap = require("opendsu").loadApi("m2dsu").getErrorsMap();

async function getBatchDSURecovery(message, productCode, batchId) {

  let seedSSI = await this.createPathSSI(this.options.holderInfo.subdomain, `0/${productCode}/${batchId}`);
  let sreadSSI = await $$.promisify(seedSSI.derive)();

  async function recoveryBatchConstDSU (dsu, callback){
    let error;
   try{
      await $$.promisify(dsu.mount)(constants.BATCH_DSU_MOUNT_POINT, sreadSSI.getIdentifier());
    }catch(err){
      const mountError = createOpenDSUErrorWrapper("Failed to mount batch DSU", err);
      error = mountError
    }

    callback(error, dsu);
  }

  return new Promise((resolve, reject)=>{
    const gtinSSI = GTIN_SSI.createGTIN_SSI(this.options.holderInfo.domain, this.options.holderInfo.subdomain, productCode, batchId);
    this.recoverDSU(gtinSSI, recoveryBatchConstDSU, async(err, batchConstDSU)=>{
      if(err){
        return reject(err);
      }

      let batchDSU = await $$.promisify(this.recoverDSU)(sreadSSI, (dsu, callback)=>{
        dsu.writeFile("/recovered", new Date().toISOString(), {embed: true}, async (err)=>{
          if(err){
            const writeError = createOpenDSUErrorWrapper("Failed to write recovered file", err);
            try{
              await dsu.cancelBatchAsync();
            } catch (e) {
              return callback(createOpenDSUErrorWrapper("Failed to cancel batch on const DSU", e, writeError));
            }
            return callback(err);
          }

          this.mappingLogService = logUtils.createInstance(this.storageService, this.options.logService);

          let nextVersion = 0;
          try{
            nextVersion = await require("opendsu").loadApi("anchoring").getNextVersionNumberAsync(dsu.getCreationSSI());
            //i believe that we don't need to decrement any more...
            //nextVersion--;
          }catch(err){
            throw errMap.newCustomError(errMap.errorTypes.BATCH_DSU_LOAD_FAIL, "batchId");
          }

          let logData = {
            reason: `The batch ${batchId} for GTIN ${productCode} got recovered as version ${nextVersion}.`,
            pk:require("./../../utils/CommonUtils").getBatchMetadataPK(productCode, batchId),
            messageId: message.messageId,
            senderId: message.senderId,
            messageDateTime: message.messageDateTime,
            messageType: constants.MESSAGE_TYPES.RECOVER,
            itemCode: batchId,
            itemType: "recoveredBatch",
            batch:{
              batch: batchId,
              gtin: productCode
            }
          };

          await this.mappingLogService.logSuccessAction(logData, {}, true, {}, dsu);
          return callback(undefined, dsu);
        });
      });

      resolve( {batchConstDSU: batchConstDSU,
          batchDSU: batchDSU,
          alreadyExists: true,
          gtinSSI: gtinSSI});
    });
  });
}

async function getBatchDSU(message, productCode, batchId, create = false) {

  if(message.force){
    return await getBatchDSURecovery.call(this, message, productCode, batchId, create);
  }

  let err;
  let productDSUObj;

  try {
    productDSUObj = await productUtils.getProductDSU.call(this, message, productCode);
  } catch (e) {
    throw errMap.newCustomError(errMap.errorTypes.PRODUCT_DSU_LOAD_FAIL, "productCode");
  }

  if (!productDSUObj) {
    throw errMap.newCustomError(errMap.errorTypes.PRODUCT_DSU_LOAD_FAIL, "productCode");
  }

  const gtinSSI = GTIN_SSI.createGTIN_SSI(this.options.holderInfo.domain, this.options.holderInfo.subdomain, productCode, batchId);
  const {dsu: batchConstDSU, alreadyExists: batchExists} = await this.loadConstSSIDSU(gtinSSI);
  let batchDSU;

  if (!batchExists) {
    batchDSU = await this.createPathSSIDSU(this.options.holderInfo.subdomain, `0/${productCode}/${batchId}`);
    let sreadSSI = await batchDSU.getKeySSIAsString("sread");
    await batchConstDSU.mount(constants.BATCH_DSU_MOUNT_POINT, sreadSSI);
  } else {
    let reason = "batchId";
    try {
      let getSSIForMount = $$.promisify(batchConstDSU.getSSIForMount, batchConstDSU);
      //we read the ssi from the mounting point instead of the sharedDB. is more reliable
      let ssi = await getSSIForMount(constants.BATCH_DSU_MOUNT_POINT);
      //we should check if we still in control of the mutable dsu
      let pathSSI = await this.createPathSSI(this.options.holderInfo.subdomain, `0/${productCode}/${batchId}`);
      let anchorIdFromPath = await pathSSI.getAnchorIdAsync();
      if(typeof ssi === "string"){
        ssi = require("opendsu").loadApi("keyssi").parse(ssi);
      }
      let anchorIdMount = await ssi.getAnchorIdAsync();
      if(anchorIdFromPath !== anchorIdMount){
        reason = errMap.newCustomError(errMap.errorTypes.PRODUCT_DSU_LOAD_FAIL, new Error("You are not allowed to overwrite a product from a different company."));
        throw reason;
      }
      batchDSU = await this.loadDSU(ssi);
    } catch (err) {
      throw errMap.newCustomError(errMap.errorTypes.BATCH_DSU_LOAD_FAIL, reason);
    }
  }

  return {
    batchConstDSU: batchConstDSU,
    batchDSU: batchDSU,
    alreadyExists: batchExists,
    gtinSSI: gtinSSI
  };
}

async function getBatchMetadata(message, batchId, shouldExist = true) {
  let metadata = {};
  try {
    metadata = await $$.promisify(this.storageService.getRecord, this.storageService)(constants.BATCHES_STORAGE_TABLE, batchId);
/*    if (!shouldExist && metadata) {
      throw errMap.newCustomError(errMap.errorTypes.EXISTING_BATCH_ID, "batch");
    }*/

  } catch (e) {
    if (shouldExist) {
      if(message.force){
        //trying to set some defaults in recovery mode

        const utils = require("./../../utils/CommonUtils");
        const data = utils.getDataFromBatchMetadataPK(batchId);
        metadata.batchNumber = data.batch;
        metadata.gtin = data.productCode;
        metadata.productName = "recovered";
        metadata.productDescription = "no description";
        metadata.expiry = "010101";
        metadata = await $$.promisify(this.storageService.insertRecord, this.storageService)(constants.BATCHES_STORAGE_TABLE, batchId, metadata);
      }else {
        throw errMap.newCustomError(errMap.errorTypes.DB_OPERATION_FAIL, "productCode");
      }
    }
  }
  return metadata;
}

module.exports = {
  getBatchDSU,
  getBatchMetadata
}

},{"../../GTIN_SSI":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/GTIN_SSI.js","../../constants/constants.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","../../utils/LogUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/LogUtils.js","../errors/errorUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/errors/errorUtils.js","../product/productUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/product/productUtils.js","./../../utils/CommonUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/CommonUtils.js","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/errors/errorMap.js":[function(require,module,exports){
module.exports = {
  PRODUCT_DSU_LOAD_FAIL: {errCode: 7, errMsg: "Failed to load product DSU"},
  BATCH_MISSING_PRODUCT: {errCode: 8, errMsg: "Fail to create a batch for a missing product"},
  BATCH_DSU_LOAD_FAIL: {errCode: 9, errMsg: "Failed to load batch DSU"},
  PHOTO_MISSING_PRODUCT: {errCode: 10, errMsg: "Fail to create a product photo for a missing product"},
  VIDEO_SOURCE_MISSING_PRODUCT: {errCode: 11, errMsg: "Fail to add video source for missing batch or missing product"},
  GTIN_VALIDATION_FAIL: {errCode: 12, errMsg: "Failed to validate gtin"},
  DSU_MOUNT_FAIL: {errCode: 13, errMsg: "Failed to mount in DSU"},
  UNSUPPORTED_FILE_FORMAT: {errCode: 14, errMsg: "Upload of unsupported file format"},
  TOKEN_VALIDATION_FAIL: {errCode: 15, errMsg: "Invalid or missing token"},
  WRITING_FILE_FAILED: {errCode: 16, errMsg: "Failed to write file into DSU"},
  FILE_CONTAINS_FORBIDDEN_TAGS: {errCode: 17, errMsg: "File contains forbidden html tags"},
  EXISTING_BATCH_ID: {errCode: 19, errMsg: "Fail to create a batch. Batch number is already used for other product"},
  MVP1_RESTRICTED: {errCode: 20, errMsg: "Message is MVP1 restricted."},
  WRONG_XML_FORMAT: {errCode: 21, errMsg: "Unsupported format for XML file."},
  WRONG_XML_IMG_SRC_TO_FILES_MAPPING: {
    errCode: 22,
    errMsg: "There is an inconsistency between image references and file names"
  },
  NOT_ABLE_TO_ENSURE_DATA_CONSISTENCY_ON_SERVER: {errCode: 40, errMsg: "Not able to ensure data consistency on server."}
}

},{}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/errors/errorUtils.js":[function(require,module,exports){
const errMap = require("opendsu").loadApi("m2dsu").getErrorsMap();
const mappingErrorsMap = require("./errorMap");

function addMappingError(errorKey, detailsFn) {
  if (!errMap.errorTypes[errorKey]) {
    errMap.addNewErrorType(errorKey, mappingErrorsMap[errorKey].errCode, mappingErrorsMap[errorKey].errMsg, detailsFn);
  }
}

module.exports = {
  addMappingError
}

},{"./errorMap":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/errors/errorMap.js","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/index.js":[function(require,module,exports){
//loading EPI necessary mappings
require("./product/product.js");
require("./batch/batch.js");
require("./product/productPhoto.js");
require("./product-video/videoSource.js");
require("./leaflet/leaflet.js");
require("./leaflet/leafletDelete.js");

module.exports.getEPIMappingEngine = function (options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = undefined;
  }
  const openDSU = require("opendsu");
  const scAPI = openDSU.loadAPI("sc");
  scAPI.getSharedEnclave((err, sharedEnclave) => {
    if (err) {
      return callback(err);
    }
    const mappingEngine = openDSU.loadApi("m2dsu").getMappingEngine(sharedEnclave, options);
    callback(undefined, mappingEngine);
  })
}

// module.exports.utils = require("./utils.js");
module.exports.getMappingLogs = function (storageService) {
  return require("../utils/LogUtils").createInstance(storageService).getMappingLogs;
}
module.exports.getMappingLogsInstance = function (storageService, logService) {
  return require("../utils/LogUtils").createInstance(storageService, logService);
}

module.exports.buildResponse = function (version) {
  return require("./responses").buildResponse(version);
}

},{"../utils/LogUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/LogUtils.js","./batch/batch.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/batch/batch.js","./leaflet/leaflet.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/leaflet/leaflet.js","./leaflet/leafletDelete.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/leaflet/leafletDelete.js","./product-video/videoSource.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/product-video/videoSource.js","./product/product.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/product/product.js","./product/productPhoto.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/product/productPhoto.js","./responses":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/responses/index.js","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/leaflet/leaflet.js":[function(require,module,exports){
const {EPI_TYPES} = require("../../constants/constants");

function verifyIfLeafletMessage(message) {
  return Object.keys(EPI_TYPES).includes(message.messageType)
    && Object.keys(message).some(key => ['productCode', 'batchCode'].includes(key))
    && (message.action === "add" || message.action === "update")
}

const acceptedFileExtensions = ["xml", "apng", "avif", "gif", "jpg", "jpeg", "jfif", "pjpeg", "pjp", "png", "svg", "webp", "bmp", "ico", "cur"];

async function processLeafletMessage(message) {
  const schema = require("./leafletSchema");
  const validationUtils = require("../../utils/ValidationUtils");
  const leafletUtils = require("./leafletUtils");
  const logUtils = require("../../utils/LogUtils");
  const errorUtils = require("../errors/errorUtils");
  const errMap = require("opendsu").loadApi("m2dsu").getErrorsMap();

  const {sanitize} = require("../../utils/htmlSanitize");
  this.mappingLogService = logUtils.createInstance(this.storageService, this.options.logService);

  await validationUtils.validateMessageOnSchema.call(this, message, schema);
  if (message.messageType === EPI_TYPES.SMPC) {
    errorUtils.addMappingError("MVP1_RESTRICTED");
    throw errMap.newCustomError(errMap.errorTypes.MVP1_RESTRICTED, EPI_TYPES.SMPC);
  }

  message.otherFilesContent.forEach(fileObj => {
    const splitFileName = fileObj.filename.split(".");
    const fileExtension = splitFileName[splitFileName.length - 1];
    const index = acceptedFileExtensions.findIndex(acceptedExtension => acceptedExtension === fileExtension.toLowerCase());
    if (index === -1) {
      errorUtils.addMappingError("UNSUPPORTED_FILE_FORMAT");
      throw errMap.newCustomError(errMap.errorTypes.UNSUPPORTED_FILE_FORMAT, message.messageType);
    }
    //big images can cause  Maximum call stack size exceeded
    /*try {
      fileObj.fileContent = sanitize(fileObj.fileContent);
    } catch (e) {
      errorUtils.addMappingError("FILE_CONTAINS_FORBIDDEN_TAGS");
      throw errMap.newCustomError(errMap.errorTypes.FILE_CONTAINS_FORBIDDEN_TAGS, message.messageType);
    }*/
  });

  let language = message.language;
  let type = message.messageType

  let basePath = leafletUtils.getLeafletDirPath(type, language);
  let xmlFilePath = leafletUtils.getLeafletPath(type, language);
  let base64ToArrayBuffer = require("../../utils/CommonUtils").base64ToArrayBuffer;


  let base64XMLFileContent = message.xmlFileContent;
  try {
    base64XMLFileContent = sanitize(base64XMLFileContent);
  } catch (e) {
    errorUtils.addMappingError("FILE_CONTAINS_FORBIDDEN_TAGS");
    throw errMap.newCustomError(errMap.errorTypes.FILE_CONTAINS_FORBIDDEN_TAGS, message.messageType);
  }


  const {hostDSU, hostMetadata} = await leafletUtils.getHostDSUData.call(this, message);
  let anchoringDomain = this.options.holderInfo.domain;
  let brickingDomain = this.options.holderInfo.subdomain;
  let args = [anchoringDomain, brickingDomain, type];
  let gtin = hostMetadata.gtin;
  errorUtils.addMappingError("WRONG_XML_FORMAT");
  errorUtils.addMappingError("WRONG_XML_IMG_SRC_TO_FILES_MAPPING", (data) => {
    return data.map(item => {
      return {
        errorType: this.errCode,
        errorMessage: this.errMsg,
        errorDetails: `Image ${item} does not exist`,
        errorField: item.field
      }
    })
  });
  let leafletHtmlContent;
  let htmlXMLContent
  try {
    let xmlDisplayService = leafletUtils.getService(hostDSU, gtin, type);

    //remove BOM-utf8 chars from the begining of the xml
    if (base64XMLFileContent.substring(0, 4) === '77u/') {
      base64XMLFileContent = base64XMLFileContent.substring(4)
    }
    htmlXMLContent = xmlDisplayService.getHTMLFromXML("", atob(base64XMLFileContent));

    leafletHtmlContent = xmlDisplayService.buildLeafletHTMLSections(htmlXMLContent);
  } catch (e) {
    console.log(e);
    leafletHtmlContent = null;
  }
  let differentCaseImgFiles = [];
  if (!leafletHtmlContent) {
    throw errMap.newCustomError(errMap.errorTypes.WRONG_XML_FORMAT, message.messageType);
  } else {
    let htmlImageNames = Array.from(htmlXMLContent.querySelectorAll("img")).map(img => img.getAttribute("src"))
    //removing from validation image src that are data URLs ("data:....")
    htmlImageNames = htmlImageNames.filter((imageSrc)=>{
      let dataUrlRegex = new RegExp(/^\s*data:([a-z]+\/[a-z]+(;[a-z-]+=[a-z-]+)?)?(;base64)?,[a-z0-9!$&',()*+;=\-._~:@/?%\s]*\s*$/i);
      if(!!imageSrc.match(dataUrlRegex) || imageSrc.startsWith("data:")){
        return false;
      }
      return true;
    });

    let uploadedImageNames = message.otherFilesContent.map(fileObj => {
      return fileObj.filename
    })

    let missingImgFiles = [];
    htmlImageNames.forEach(htmlImgName => {

      let differentImg = uploadedImageNames.find((item) => item.toLowerCase() === htmlImgName.toLowerCase())

      if (!differentImg) {
        missingImgFiles.push({
          field: htmlImgName,
          message: `does not exist`
        });
      } else {
        if (htmlImgName !== differentImg) {
          differentCaseImgFiles.push(htmlImgName)
        }
      }
    })
    if (missingImgFiles.length > 0) {
      message.invalidFields = missingImgFiles;
      throw errMap.newCustomError(errMap.errorTypes.WRONG_XML_IMG_SRC_TO_FILES_MAPPING, missingImgFiles);
    }
  }

  try {
    if (message.batchCode) {
      //leaflet on batch
      args = args.concat([gtin, language, message.batchCode]);
      args = args.concat([require("./../../utils/CommonUtils.js").convertFromGS1DateToYYYY_HM(hostMetadata.expiry), hostMetadata.epiLeafletVersion]);
    } else {
      //leaflet on product
      args = args.concat([gtin, language, undefined, undefined, undefined]);
    }

    //triggering fixedUrl registration and a cleanup if needed...
    try {
      await require("./../utils.js").registerGtinOwnerFixedUrlByDomainAsync(anchoringDomain, gtin);
      await require("./../utils.js").registerLeafletFixedUrlByDomainAsync(...args);
      if (message.batchCode) {
        //we are in batch case... let's register a fixedUrl without expiry date
        let newArgs = [anchoringDomain, brickingDomain, type, gtin, language, message.batchCode, undefined, hostMetadata.epiLeafletVersion];
        await require("./../utils.js").registerLeafletFixedUrlByDomainAsync(...newArgs);
      }
      await require("./../utils.js").deactivateLeafletFixedUrlAsync(hostDSU, brickingDomain, gtin);
    } catch (err) {
      //if cleanup fails mapping needs to fail...
      console.log("Leaflet Mapping failed due to", err);
      const errMap = require("opendsu").loadApi("m2dsu").getErrorsMap();
      const errorUtils = require("../errors/errorUtils");
      errorUtils.addMappingError("NOT_ABLE_TO_ENSURE_DATA_CONSISTENCY_ON_SERVER");
      throw errMap.newCustomError(errMap.errorTypes.NOT_ABLE_TO_ENSURE_DATA_CONSISTENCY_ON_SERVER, message.messageType);
    }

    if (message.action === "update") {
      await hostDSU.delete(basePath, {ignoreError: true});
    }
    let arrayBufferXMLFileContent = base64ToArrayBuffer(base64XMLFileContent);
    await hostDSU.writeFile(xmlFilePath, $$.Buffer.from(arrayBufferXMLFileContent));
    let warnLogMessage = [];
    for (let i = 0; i < message.otherFilesContent.length; i++) {
      let file = message.otherFilesContent[i];
      let differentCaseFileName = differentCaseImgFiles.find(item => file.filename.toLowerCase() === item.toLowerCase());
      if (differentCaseFileName) {
        warnLogMessage.push(`Image ${differentCaseFileName} does not exist, but a similar file ${file.filename}  exists and will be used instead`)
        file.filename = differentCaseFileName;
      }
      let filePath = `${basePath}/${file.filename}`;
      await hostDSU.writeFile(filePath, $$.Buffer.from(base64ToArrayBuffer(file.fileContent)));
    }

    let diffs = {
      type: message.messageType,
      language: message.language,
      action: message.action
    };

    if (warnLogMessage.length > 0) {
      diffs.additionalInfo = warnLogMessage
    }

    await leafletUtils.updateVersionOnTarget(this, message, hostDSU, hostMetadata);
    hostDSU.onCommitBatch(async () => {
      await this.mappingLogService.logSuccessAction(message, hostMetadata, true, diffs, hostDSU);
    }, true);

    //triggering the creation of fixedUrls for the gtinOwner
    require("./../utils.js").activateGtinOwnerFixedUrl(hostDSU, anchoringDomain, gtin);

    //triggering the creation of fixedUrls for the leaflet
    require("./../utils.js").activateLeafletFixedUrl(hostDSU, brickingDomain, gtin);
  } catch (e) {
    console.log("Leaflet Mapping failed because of", e);

    const errMap = require("opendsu").loadApi("m2dsu").getErrorsMap();
    const errorUtils = require("../errors/errorUtils");
    errorUtils.addMappingError("WRITING_FILE_FAILED");
    throw errMap.newCustomError(errMap.errorTypes.WRITING_FILE_FAILED, message.messageType);
  }
}

require("opendsu").loadApi("m2dsu").defineMapping(verifyIfLeafletMessage, processLeafletMessage);

},{"../../constants/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","../../utils/CommonUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/CommonUtils.js","../../utils/LogUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/LogUtils.js","../../utils/ValidationUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/ValidationUtils.js","../../utils/htmlSanitize":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/htmlSanitize.js","../errors/errorUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/errors/errorUtils.js","./../../utils/CommonUtils.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/CommonUtils.js","./../utils.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/utils.js","./leafletSchema":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/leaflet/leafletSchema.js","./leafletUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/leaflet/leafletUtils.js","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/leaflet/leafletDelete.js":[function(require,module,exports){
const {EPI_TYPES} = require("../../constants/constants");

function verifyIfDeleteLeafletMessage(message) {
  return Object.values(EPI_TYPES).includes(message.messageType) && Object.keys(message).some(key => ['productCode', 'batchCode'].includes(key)) && message.action === "delete"
}

async function processDeleteLeafletMessage(message) {
  const schema = require("./leafletDeleteSchema");
  const validationUtils = require("../../utils/ValidationUtils");
  const leafletUtils = require("./leafletUtils");
  const logUtils = require("../../utils/LogUtils");
  const utils = require("../utils");
  this.mappingLogService = logUtils.createInstance(this.storageService, this.options.logService);

  await validationUtils.validateMessageOnSchema.call(this, message, schema);


  let language = message.language;
  let type = message.messageType;
  let leafletDir = leafletUtils.getLeafletDirPath(type, language);

  const {hostDSU, hostMetadata} = await leafletUtils.getHostDSUData.call(this, message);
  let diffs = {"type": type, "language": language, "action": "deleted"};

  //triggering a cleanup
  let gtin = hostMetadata.productCode || hostMetadata.gtin;
  if(!message.batchCode){
    gtin = hostMetadata.gtin;
  }

  try{
    await $$.promisify(require("./../utils.js").deactivateLeafletFixedUrl)(hostDSU, this.options.holderInfo.subdomain, gtin);
  }catch(err){
    //if cleanup fails mapping needs to fail...

    console.log("Leaflet Mapping failed due to", err);

    const errMap = require("opendsu").loadApi("m2dsu").getErrorsMap();
    const errorUtils = require("../errors/errorUtils");
    errorUtils.addMappingError("NOT_ABLE_TO_ENSURE_DATA_CONSISTENCY_ON_SERVER");
    throw errMap.newCustomError(errMap.errorTypes.NOT_ABLE_TO_ENSURE_DATA_CONSISTENCY_ON_SERVER, message.messageType);
  }

  try {
    await hostDSU.delete(leafletDir, {ignoreError: true});
  } catch (e) {
    console.log(e);
  }

  await leafletUtils.updateVersionOnTarget(this, message, hostDSU, hostMetadata);
  $$.promisify(require("./../utils.js").activateLeafletFixedUrl)(hostDSU, this.options.holderInfo.subdomain, gtin);

  hostDSU.onCommitBatch(async ()=>{
    await this.mappingLogService.logSuccessAction(message, hostMetadata, true, diffs, hostDSU);
  }, true);
}

require("opendsu").loadApi("m2dsu").defineMapping(verifyIfDeleteLeafletMessage, processDeleteLeafletMessage);

},{"../../constants/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","../../utils/LogUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/LogUtils.js","../../utils/ValidationUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/ValidationUtils.js","../errors/errorUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/errors/errorUtils.js","../utils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/utils.js","./../utils.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/utils.js","./leafletDeleteSchema":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/leaflet/leafletDeleteSchema.js","./leafletUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/leaflet/leafletUtils.js","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/leaflet/leafletDeleteSchema.js":[function(require,module,exports){
const Languages = require("../../utils/Languages");

const messageHeaderSchema = require("./../messageHeaderSchema");
let leafletDeleteSchema = {
    "type": "object",
    "properties":
        {
            "payload": {
                "type": "object", "required": true,
                "properties": {
                    "language": {
                        "type": "string",
                        "required": true,
                        regex: Languages.getLanguageRegex()
                    },
                    "productCode": {"type": "string", "required": true},
                    "batchNumber": {"type": "string", "required": false}

                }
            }
        }
}
leafletDeleteSchema.properties = {...messageHeaderSchema, ...leafletDeleteSchema.properties};
module.exports = leafletDeleteSchema;

},{"../../utils/Languages":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/Languages.js","./../messageHeaderSchema":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/messageHeaderSchema.js"}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/leaflet/leafletSchema.js":[function(require,module,exports){
const Languages = require("../../utils/Languages");

const messageHeaderSchema = require("./../messageHeaderSchema");
let leafletSchema = {
    "type": "object",
    "properties":
        {
            "payload": {
                "type": "object", "required": true,
                "properties": {
                    "language": {
                        "type": "string",
                        "required": true,
                        regex: Languages.getLanguageRegex()
                    },
                    "productCode": {"type": "string", "required": true},
                    "batchNumber": {"type": "string", "required": false},
                    "xmlFileContent": {"type": "string", "required": true},
                    "otherFilesContent": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "filename": {
                                    "type": "string",
                                    "required": true
                                },
                                "fileContent": {
                                    "type": "string",
                                    "required": true
                                }
                            }
                        }
                    }
                }
            }
        }
}
leafletSchema.properties = {...messageHeaderSchema, ...leafletSchema.properties};
module.exports = leafletSchema

},{"../../utils/Languages":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/Languages.js","./../messageHeaderSchema":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/messageHeaderSchema.js"}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/leaflet/leafletUtils.js":[function(require,module,exports){
const errMap = require("opendsu").loadApi("m2dsu").getErrorsMap();
const utils = require("../../utils/CommonUtils.js");
const {EPI_TYPES} = require("../../constants/constants");
function getLeafletDirPath(type, language) {
  return `/${type}/${language}`;
}

function getLeafletPath(type, language) {
  return `${getLeafletDirPath(type, language)}/${type}.xml`;
}

function getLeafletTypes(){
  return {...EPI_TYPES};
}

function getService(dsu, gtin, leafletType){
  const gtinSSI = dsu.getCreationSSI();
  const XMLDisplayService = require("../../services/XMLDisplayService/XMLDisplayService.js");
  const keyssi = require("opendsu").loadApi("keyssi");
  const simulatedModel = {networkName:keyssi.parse(gtinSSI).getDLDomain(), product:{gtin}};
  const service = new XMLDisplayService(undefined, gtinSSI, simulatedModel, leafletType, undefined);
  return service;
}

function getBatchAvailableLanguages(dsu, gtin, leafletType, callback){
  const service = getService(dsu, gtin, leafletType);
  service.readLanguagesFromDSU(dsu, `/${leafletType}`, callback);
}

function getProductAvailableLanguages(dsu, gtin, leafletType, callback){
  const service = getService(dsu, gtin, leafletType);
  service.readLanguagesFromDSU(dsu, `/${leafletType}`, callback);
}

async function updateVersionOnTarget(context, message, hostDSU, hostMetadata){
  const utils = require("../utils");
  const constants = require("../../constants/constants");

  let indications = utils.getProductJSONIndication(message);
  Object.assign(indications, utils.getBatchJSONIndication(message));
  await context.loadJSONS.call(context, hostDSU, indications);

  let productOrBatch = context.product || context.batch;
  productOrBatch.version = await require("opendsu").loadApi("anchoring").getNextVersionNumberAsync(hostDSU.getCreationSSI());
  hostMetadata.version = productOrBatch.version;

  if(context.batch){
    if(!hostMetadata.pk){
      hostMetadata.pk = require("../../utils/CommonUtils").getBatchMetadataPK(context.batch.productCode, context.batch.batch);
    }
    await $$.promisify(context.storageService.updateRecord, context.storageService)(constants.BATCHES_STORAGE_TABLE, hostMetadata.pk, hostMetadata);
    await context.saveJSONS.call(context, hostDSU, utils.getBatchJSONIndication(message));
  }else{
    if(!hostMetadata.pk){
      hostMetadata.pk = context.product.productCode;
    }
    await $$.promisify(context.storageService.updateRecord, context.storageService)(constants.PRODUCTS_TABLE, hostMetadata.pk, hostMetadata);
    await context.saveJSONS.call(context, hostDSU, utils.getProductJSONIndication(message));
  }

}

module.exports = {
  updateVersionOnTarget,
  getLeafletPath,
  getLeafletDirPath,
  getBatchAvailableLanguages,
  getProductAvailableLanguages,
  getLeafletTypes,
  getService,
  getHostDSUData: async function (message) {
    let hostDSU;
    let errorType;
    let errorDetails;
    let hostMetadata;

    try {
      if (message.batchCode) {
        errorType = errMap.errorTypes.BATCH_DSU_LOAD_FAIL;
        errorDetails = `for batch ${message.batchCode}`;
        let res = await require("../batch/batchUtils").getBatchDSU.call(this, message, message.productCode, message.batchCode);
        hostDSU = res.batchDSU;
        hostMetadata = await require("../batch/batchUtils").getBatchMetadata.call(this, message, utils.getBatchMetadataPK(message.productCode, message.batchCode), true);

      } else {
        errorType = errMap.errorTypes.PRODUCT_DSU_LOAD_FAIL;
        errorDetails = `for productCode ${message.productCode}`;
        let res = await require("../product/productUtils").getProductDSU.call(this, message, message.productCode);
        hostDSU = res.productDSU;
        hostMetadata = await require("../product/productUtils").getProductMetadata.call(this, message, message.productCode, true);

      }
    } catch (err) {
      throw errMap.newCustomError(errorType, errorDetails);
    }

    return {hostDSU, hostMetadata}
  }

}

},{"../../constants/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","../../services/XMLDisplayService/XMLDisplayService.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/XMLDisplayService/XMLDisplayService.js","../../utils/CommonUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/CommonUtils.js","../../utils/CommonUtils.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/CommonUtils.js","../batch/batchUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/batch/batchUtils.js","../product/productUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/product/productUtils.js","../utils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/utils.js","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/messageHeaderSchema.js":[function(require,module,exports){
module.exports = {
    "messageType": {"type": "string"},
    "messageTypeVersion": {"type": "number"},
    "senderId": {"type": "string"},
    "receiverId": {"type": "string"},
    "messageId": {"type": "string"},
    "messageDateTime": {"type": "string"}
}

},{}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/product-video/videoSchema.js":[function(require,module,exports){
const messageHeaderSchema = require("./../messageHeaderSchema");
let videoSchema = {
  "type": "object",
  "properties":
    {
      "videos": {
        "type": "object", "required": true,
        "properties": {
          "productCode": {"type": "string", "required": true},
          "source": {"type": "string", "required": false},
          "batch": {"type": "string", "required": false},
          "sources": {
            "type": "array", "required": false,
            "items": {
              "type": "object",
              "properties": {
                "documentType": {"type": "string"},
                "lang": {"type": "string"},
                "source": {"type": "string"}
              }
            }
          }
        }
      }
    }
}
videoSchema.properties = {...messageHeaderSchema, ...videoSchema.properties}
module.exports = videoSchema

},{"./../messageHeaderSchema":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/messageHeaderSchema.js"}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/product-video/videoSource.js":[function(require,module,exports){
const dbUtils = require("../../utils/DBUtils");
const utils = require("../../utils/CommonUtils.js");
const batchUtils = require("../batch/batchUtils");

function verifyIfVideoMessage(message) {
  return message.messageType === "VideoSource";
}

async function processVideoMessage(message) {
  const schema = require("./videoSchema");
  const validationUtils = require("../../utils/ValidationUtils");
  const productUtils = require("../product/productUtils");
  const constants = require("../../constants/constants.js");
  const errorUtils = require("../errors/errorUtils");
  errorUtils.addMappingError("VIDEO_SOURCE_MISSING_PRODUCT");
  const errMap = require("opendsu").loadApi("m2dsu").getErrorsMap();
  this.mappingLogService = require("../../utils/LogUtils").createInstance(this.storageService, this.options.logService);

  await validationUtils.validateMessageOnSchema.call(this, message, schema);
  await validationUtils.validateMVP1Values.call(this, message, "videos");

  const productCode = message.videos.productCode;

  try {
    if (message.videos.batch) {
      //batch id means its saved on batch
      const batchId = message.videos.batch;

      let batchMetadata = await batchUtils.getBatchMetadata.call(this, message, utils.getBatchMetadataPK(productCode, batchId));
      let {batchDSU} = await batchUtils.getBatchDSU.call(this, message, productCode, batchId);
      const indication = {batch: `${constants.BATCH_STORAGE_FILE}${message.messageTypeVersion}`};

      await this.loadJSONS(batchDSU, indication);
      if (typeof this.batch === "undefined") {
        this.batch = JSON.parse(JSON.stringify(batchMetadata));
      }

      prepareVideoSources(this.batch, message);

      this.batch.version = await require("opendsu").loadApi("anchoring").getNextVersionNumberAsync(batchDSU.getCreationSSI());
      batchMetadata.version = this.batch.version;

      await this.saveJSONS(batchDSU, indication);
      let diffs = this.mappingLogService.getDiffsForAudit(this.batch, batchMetadata);

      await $$.promisify(this.storageService.insertRecord, this.storageService)(constants.BATCHES_STORAGE_TABLE, batchId, batchMetadata);

      this.batch.keySSI = await batchDSU.getKeySSIAsString();
      let logData = await this.mappingLogService.logSuccessAction(message, this.batch, true, diffs, batchDSU);
      await dbUtils.createOrUpdateRecord(this.storageService, logData, this.batch);

    } else {
      //it's saved on product

      const {productDSU, alreadyExists} = await productUtils.getProductDSU.call(this, message, productCode);
      let productMetadata;

      const indication = require("./../utils").getProductJSONIndication(message);
      await this.loadJSONS(productDSU, indication);

      productMetadata = await productUtils.getProductMetadata.call(this, message, productCode, alreadyExists);
      if (typeof this.product === "undefined") {
        this.product = JSON.parse(JSON.stringify(productMetadata));
      }

      prepareVideoSources(this.product, message);
      this.product.version = await require("opendsu").loadApi("anchoring").getNextVersionNumberAsync(productDSU.getCreationSSI());
      productMetadata.version = this.product.version;
      await this.saveJSONS(productDSU, indication);

      await $$.promisify(this.storageService.updateRecord, this.storageService)(constants.PRODUCTS_TABLE, this.product.pk, this.product);

      let diffs = this.mappingLogService.getDiffsForAudit(this.product, productMetadata);
      //this save may generate strange behavior....
      this.product.keySSI = await productDSU.getKeySSIAsString();

      let logData = await this.mappingLogService.logSuccessAction(message, this.product, true, diffs, productDSU);
      await dbUtils.createOrUpdateRecord(this.storageService, logData, this.product);

      //triggering the reactivation of fixedUrl
      require("./../utils.js").activateGtinOwnerFixedUrl(productDSU, this.options.holderInfo.domain, productCode);
      require("./../utils.js").activateLeafletFixedUrl(productDSU, this.options.holderInfo.subdomain, productCode);
    }
  } catch (err) {
    throw errMap.newCustomError(errMap.errorTypes.VIDEO_SOURCE_MISSING_PRODUCT, "productCode");
  }

}

function prepareVideoSources(sourceObject, message) {
  if (!sourceObject.videos) {
    sourceObject.videos = {}
  }

  if (message.videos.sources) {
    sourceObject.videos = {
      defaultSource: sourceObject.videos.defaultSource
    }
    message.videos.sources.forEach(docSource => {
      let key = `${docSource.documentType}/${docSource.lang}`
      sourceObject.videos[key] = docSource.source;
    })
  }

  if (typeof message.videos.source !== "undefined") {
    sourceObject.videos.defaultSource = message.videos.source;
  }
}

require("opendsu").loadApi("m2dsu").defineMapping(verifyIfVideoMessage, processVideoMessage);

},{"../../constants/constants.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","../../utils/CommonUtils.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/CommonUtils.js","../../utils/DBUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/DBUtils.js","../../utils/LogUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/LogUtils.js","../../utils/ValidationUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/ValidationUtils.js","../batch/batchUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/batch/batchUtils.js","../errors/errorUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/errors/errorUtils.js","../product/productUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/product/productUtils.js","./../utils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/utils.js","./../utils.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/utils.js","./videoSchema":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/product-video/videoSchema.js","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/product/product.js":[function(require,module,exports){
function verifyIfProductMessage(message) {
  return message.messageType === "Product";
}

async function processProductMessage(message) {
  const constants = require("../../constants/constants");
  const validationUtils = require("../../utils/ValidationUtils");
  const logUtils = require("../../utils/LogUtils");
  const ModelMessageService = require('../../services/ModelMessageService');
  const schema = require("./productSchema");
  const productUtils = require("./productUtils");
  const dbUtils = require("../../utils/DBUtils");
  this.mappingLogService = logUtils.createInstance(this.storageService, this.options.logService);

  await validationUtils.validateMessageOnSchema.call(this, message, schema);
  await validationUtils.validateMVP1Values.call(this, message, "product");
  await productUtils.validateGTIN.call(this, message);

  const productCode = message.product.productCode;

  const {
    productDSU,
    alreadyExists
  } = await productUtils.getProductDSU.call(this, message, productCode, true);

  let productMetadata = await productUtils.getProductMetadata.call(this, message, productCode, alreadyExists);

  /*
  * extension of the file will contain epi version. Used format is epi_+epiVersion;
  * Ex: for version 1 - product.epi_v1
  *  */
  const indication = require("../utils").getProductJSONIndication(message);
  await this.loadJSONS(productDSU, indication);

  if (typeof this.product === "undefined") {
    this.product = JSON.parse(JSON.stringify(productMetadata));
  }

  let modelMsgService = new ModelMessageService("product");
  this.product = {...this.product, ...modelMsgService.getModelFromMessage(message.product)};
  this.product.version = await require("opendsu").loadApi("anchoring").getNextVersionNumberAsync(productDSU.getCreationSSI());

  this.product.epiProtocol = `v${message.messageTypeVersion}`;

  await this.saveJSONS(productDSU, indication);

  let diffs = this.mappingLogService.getDiffsForAudit(modelMsgService.getMessageFromModel(this.product), alreadyExists ? modelMsgService.getMessageFromModel(productMetadata) : null);
  await dbUtils.createOrUpdateRecord(this.storageService, {pk: message.product.productCode, table:constants.PRODUCTS_TABLE}, this.product);
  productDSU.onCommitBatch(async ()=>{
    await this.mappingLogService.logSuccessAction(message, this.product, alreadyExists, diffs, productDSU);
  }, true);

  //triggering the reactivation of fixedUrl

  require("./../utils.js").activateGtinOwnerFixedUrl(productDSU, this.options.holderInfo.domain, productCode);
  require("./../utils.js").activateLeafletFixedUrl(productDSU, this.options.holderInfo.subdomain, productCode);

}

require("opendsu").loadApi("m2dsu").defineMapping(verifyIfProductMessage, processProductMessage);

},{"../../constants/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","../../services/ModelMessageService":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/ModelMessageService.js","../../utils/DBUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/DBUtils.js","../../utils/LogUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/LogUtils.js","../../utils/ValidationUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/ValidationUtils.js","../utils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/utils.js","./../utils.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/utils.js","./productSchema":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/product/productSchema.js","./productUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/product/productUtils.js","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/product/productPhoto.js":[function(require,module,exports){
const errorUtils = require("../errors/errorUtils");

function verifyIfProductPhotoMessage(message) {
  return message.messageType === "ProductPhoto";
}

async function processProductPhotoMessage(message) {
  const schema = require("./productPhotoSchema");
  const validationUtils = require("../../utils/ValidationUtils");
  const productUtils = require("./productUtils");
  const LogUtils = require("../../utils/LogUtils");
  const constants = require("../../constants/constants");
  const errUtils = require("../errors/errorUtils");

  errUtils.addMappingError("PHOTO_MISSING_PRODUCT");
  const {base64ToArrayBuffer, bytesToBase64, isBase64ValidImage} = require("../../utils/CommonUtils");
  const errMap = require("opendsu").loadApi("m2dsu").getErrorsMap();

  await validationUtils.validateMessageOnSchema.call(this, message, schema);
  let isValidImage = await isBase64ValidImage(message.imageData)
  if (!isValidImage) {
    message.invalidFields = [{
      field: "imageData",
      message: "Invalid Image format"
    }]
    errorUtils.addMappingError("UNSUPPORTED_FILE_FORMAT");
    throw errMap.newCustomError(errMap.errorTypes.UNSUPPORTED_FILE_FORMAT, message.messageType);
  }

  const productCode = message.productCode;
  this.mappingLogService = LogUtils.createInstance(this.storageService, this.options.logService);

  let previousVersionHasPhoto, oldValue;
  try {
    const {
      productDSU,
      alreadyExists
    } = await productUtils.getProductDSU.call(this, message, productCode);

    let productMetadata = await productUtils.getProductMetadata.call(this, message, productCode, alreadyExists);
    this.product = JSON.parse(JSON.stringify(productMetadata));

    const indication = require("../utils").getProductJSONIndication(message);
    indication.dsuProduct = indication.product;
    delete indication.product;
    await this.loadJSONS(productDSU, indication);

    let photoPath = constants.PRODUCT_IMAGE_FILE;
    let productPhotoStat = await productDSU.stat(photoPath);

    previousVersionHasPhoto = typeof productPhotoStat.type !== "undefined";
    try {
      oldValue = bytesToBase64(await productDSU.readFile(photoPath));
    } catch (e) {
      oldValue = "no photo";
    }

    this.product.version = await require("opendsu").loadApi("anchoring").getNextVersionNumberAsync(productDSU.getCreationSSI());

    this.dsuProduct.version = this.product.version;
    await this.saveJSONS(productDSU, indication);
    await productDSU.writeFile(photoPath, $$.Buffer.from(base64ToArrayBuffer(message.imageData)));
    let diffs = {oldValue: oldValue, newValue: message.imageData};

    await $$.promisify(this.storageService.updateRecord, this.storageService)(constants.PRODUCTS_TABLE, this.product.pk, this.product);

    const dbUtils = require("../../utils/DBUtils");
    await dbUtils.createOrUpdateRecord(this.storageService, {
      pk: this.product.gtin,
      table: constants.PRODUCTS_TABLE
    }, this.product);

    productDSU.onCommitBatch(async () => {
      await this.mappingLogService.logSuccessAction(message, this.product, previousVersionHasPhoto, diffs, productDSU);
    }, true);

    //triggering the reactivation of fixedUrl
    let cb = (err) => {
      if (err) {
        console.error(err);
      }
    };

    require("./../utils.js").activateGtinOwnerFixedUrl(productDSU, this.options.holderInfo.domain, productCode, cb);
    require("./../utils.js").activateLeafletFixedUrl(productDSU, this.options.holderInfo.subdomain, productCode, cb);

  } catch (err) {
    throw errMap.newCustomError(errMap.errorTypes.PHOTO_MISSING_PRODUCT, "productCode");
  }
}

require("opendsu").loadApi("m2dsu").defineMapping(verifyIfProductPhotoMessage, processProductPhotoMessage);

},{"../../constants/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","../../utils/CommonUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/CommonUtils.js","../../utils/DBUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/DBUtils.js","../../utils/LogUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/LogUtils.js","../../utils/ValidationUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/ValidationUtils.js","../errors/errorUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/errors/errorUtils.js","../utils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/utils.js","./../utils.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/utils.js","./productPhotoSchema":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/product/productPhotoSchema.js","./productUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/product/productUtils.js","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/product/productPhotoSchema.js":[function(require,module,exports){
const messageHeaderSchema = require("./../messageHeaderSchema");
let photoSchema = {
    "type": "object",
    "properties":
        {
            "payload": {
                "type": "object", "required": true,
                "properties": {
                    "productCode": {"type": "string", "required": true},
                    "imageData": {"type": "string", "required": true},
                }
            }
        }
}
photoSchema.properties = {...messageHeaderSchema, ...photoSchema.properties};
module.exports = photoSchema

},{"./../messageHeaderSchema":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/messageHeaderSchema.js"}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/product/productSchema.js":[function(require,module,exports){
const messageHeaderSchema = require("./../messageHeaderSchema");
let productSchema = {
    "type": "object",
    "properties":
        {
            "payload": {
                "type": "object", "required": true,
                "properties": {
                    "productCode": {"type": "string", "required": true},
                    "internalMaterialCode": {"type": "string", "required": false},
                    "inventedName": {"type": "string", "required": true},
                    "nameMedicinalProduct": {"type": "string", "required": true},
                    "productRecall": {"type": "boolean"},
                    "flagEnableAdverseEventReporting": {"type": "boolean"},
                    "adverseEventReportingURL": {"type": "string"},
                    "flagEnableACFProductCheck": {"type": "boolean"},
                    "acfProductCheckURL": {"type": "string"},
                    "patientSpecificLeaflet": {"type": "string"},
                    "healthcarePractitionerInfo": {"type": "string"},
                    "strengths": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "substance": {"type": "string", "required": false},
                                "strength": {"type": "string", "required": true},
                                "legalEntityName": {"type": "string"},
                            }
                        }
                    },
                    "markets": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "marketId": {
                                    "type": "string",
                                    "required": true,
                                    regex: /^(AF|AX|AL|DZ|AS|AD|AO|AI|AQ|AG|AR|AM|AW|AU|AT|AZ|BS|BH|BD|BB|BY|BE|BZ|BJ|BM|BT|BO|BA|BW|BV|BR|IO|BN|BG|BF|BI|KH|CM|CA|CV|KY|CF|TD|CL|CN|CX|CC|CO|KM|CG|CD|CK|CR|CI|HR|CU|CY|CZ|DK|DJ|DM|DO|EC|EG|SV|GQ|ER|EE|ET|FK|FO|FJ|FI|FR|GF|PF|TF|GA|GM|GE|DE|GH|GI|GR|GL|GD|GP|GU|GT|GG|GN|GW|GY|HT|HM|VA|HN|HK|HU|IS|IN|ID|IR|IQ|IE|IM|IL|IT|JM|JP|JE|JO|KZ|KE|KI|KP|KR|KW|KG|LA|LV|LB|LS|LR|LY|LI|LT|LU|MO|MK|MG|MW|MY|MV|ML|MT|MH|MQ|MR|MU|YT|MX|FM|MD|MC|MN|MS|MA|MZ|MM|NA|NR|NP|NL|AN|NC|NZ|NI|NE|NG|NU|NF|MP|NO|OM|PK|PW|PS|PA|PG|PY|PE|PH|PN|PL|PT|PR|QA|RE|RO|RU|RW|SH|KN|LC|PM|VC|WS|SM|ST|SA|SN|CS|SC|SL|SG|SK|SI|SB|SO|ZA|GS|ES|LK|SD|SR|SJ|SZ|SE|CH|SY|TW|TJ|TZ|TH|TL|TG|TK|TO|TT|TN|TR|TM|TC|TV|UG|UA|AE|GB|US|UM|UY|UZ|VU|VE|VN|VG|VI|WF|EH|YE|ZM|ZW)$/
                                },
                                "nationalCode": {"type": "string", "required": false},
                                "mahName": {"type": "string", "required": false},
                                "legalEntityName": {"type": "string"},
                                "mahAddress": {"type": "string"},
                            }
                        }
                    }
                }
            }
        }
}
productSchema.properties = {...messageHeaderSchema, ...productSchema.properties};
module.exports = productSchema

},{"./../messageHeaderSchema":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/messageHeaderSchema.js"}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/product/productUtils.js":[function(require,module,exports){
const constants = require("../../constants/constants.js");
const GTIN_SSI = require("../../GTIN_SSI");
const openDSU = require("opendsu");
const errMap = openDSU.loadAPI("m2dsu").getErrorsMap();
const errorUtils = require("../errors/errorUtils");
const validationUtils = require("../../utils/ValidationUtils");
const logUtils = require("../../utils/LogUtils");
errorUtils.addMappingError("PRODUCT_DSU_LOAD_FAIL");
errorUtils.addMappingError("GTIN_VALIDATION_FAIL");

async function getProductDSURecovery(message, productCode) {

  let seedSSI = await this.createPathSSI(this.options.holderInfo.subdomain, `0/${productCode}`);
  let sreadSSI = await $$.promisify(seedSSI.derive)();

  async function recoveryProductConstDSU (dsu, callback){
    let error;

    try{
      await $$.promisify(dsu.mount)(constants.PRODUCT_DSU_MOUNT_POINT, sreadSSI.getIdentifier());
    }catch(err){
      const mountError = createOpenDSUErrorWrapper("Failed to mount product DSU", err);
      error = mountError;
    }

    callback(error, dsu);
  }

  return new Promise((resolve, reject)=>{
    const gtinSSI = GTIN_SSI.createGTIN_SSI(this.options.holderInfo.domain, this.options.holderInfo.subdomain, productCode);
    this.recoverDSU(gtinSSI, recoveryProductConstDSU, async(err, recoveredDSU)=>{
      if(err){
        return reject(err);
      }

      let productDSU = await $$.promisify(this.recoverDSU)(sreadSSI, (dsu, callback)=>{
        dsu.writeFile("/recovered", new Date().toISOString(), async (err)=>{
            if(err){
              return callback(err);
            }

            this.mappingLogService = logUtils.createInstance(this.storageService, this.options.logService);

          let nextVersion = 0;
          try{
            nextVersion = await require("opendsu").loadApi("anchoring").getNextVersionNumberAsync(dsu.getCreationSSI());
            //i believe that we don't need to decrement any more...
            //nextVersion--;
          }catch(err){
            throw errMap.newCustomError(errMap.errorTypes.PRODUCT_DSU_LOAD_FAIL, "productCode");
          }

          let logData = {
              reason: `The product with GTIN ${productCode} got recovered as version ${nextVersion}.`,
              pk: productCode,
              messageId: message.messageId,
              senderId: message.senderId,
              messageDateTime: message.messageDateTime,
              messageType: constants.MESSAGE_TYPES.RECOVER,
              itemCode: productCode,
              itemType: constants.MESSAGE_TYPES.RECOVER,
              product:{
                gtin: productCode
              }
            };

            await this.mappingLogService.logSuccessAction(logData, {}, true, {}, dsu);
            return callback(undefined, dsu);
        });
      });
      resolve({constDSU: recoveredDSU, productDSU: productDSU, alreadyExists: true});
    });
  });
}

async function getProductDSU(message, productCode, create = false) {

  if(message.force){
    return await getProductDSURecovery.call(this, message, productCode, create);
  }

  let productDSU = {};
  const gtinSSI = GTIN_SSI.createGTIN_SSI(this.options.holderInfo.domain, this.options.holderInfo.subdomain, productCode);
  const {dsu, alreadyExists} = await this.loadConstSSIDSU(gtinSSI);

  if (create && !alreadyExists) {
    productDSU = await this.createPathSSIDSU(this.options.holderInfo.subdomain, `0/${productCode}`);
    let sreadSSI = await productDSU.getKeySSIAsString("sread");
    await dsu.mount(constants.PRODUCT_DSU_MOUNT_POINT, sreadSSI);
    return {constDSU: dsu, productDSU: productDSU, alreadyExists: alreadyExists};
  }

  let reason = "productCode";
  try {
    let getSSIForMount = $$.promisify(dsu.getSSIForMount);
    //we read the ssi from the mounting point instead of the sharedDB. is more reliable
    let ssi = await getSSIForMount(constants.PRODUCT_DSU_MOUNT_POINT);
    //we should check if we still in control of the mutable dsu
    let pathSSI = await this.createPathSSI(this.options.holderInfo.subdomain, `0/${productCode}`);
    let anchorIdFromPath = await pathSSI.getAnchorIdAsync();
    if(typeof ssi === "string"){
      ssi = require("opendsu").loadApi("keyssi").parse(ssi);
    }
    let anchorIdMount = await ssi.getAnchorIdAsync();
    if(anchorIdFromPath !== anchorIdMount){
      reason = new Error("You are not allowed to overwrite a product from a different company.");
      throw reason;
    }
    productDSU = await this.loadDSU(ssi);
  } catch (err) {
    throw errMap.newCustomError(errMap.errorTypes.PRODUCT_DSU_LOAD_FAIL, reason);
  }
  return {constDSU: dsu, productDSU: productDSU, alreadyExists: alreadyExists};
}

async function validateGTIN(message) {
  let gtinValidationResult = validationUtils.validateGTIN(message.product.productCode);
  if (!gtinValidationResult.isValid) {
    message.invalidFields = [{
      field: "productCode",
      message: gtinValidationResult.message
    }]
    errMap.setErrorMessage("GTIN_VALIDATION_FAIL", gtinValidationResult.message);
    throw errMap.newCustomError(errMap.errorTypes.GTIN_VALIDATION_FAIL, "productCode");
  }
}

async function getProductMetadata(message, productCode, shouldExist = true) {
  let productMetadata = {};
  try {
    productMetadata = await $$.promisify(this.storageService.getRecord, this.storageService)(constants.PRODUCTS_TABLE, productCode);
  } catch (e) {
    if (shouldExist) {
      if(message.force){
        //trying to set some defaults in recovery mode
        productMetadata.gtin = productCode;
        productMetadata.name = "Recovered product";
        productMetadata.description = "no description";
        productMetadata = await $$.promisify(this.storageService.insertRecord, this.storageService)(constants.PRODUCTS_TABLE, productCode, productMetadata);
      }else {
        throw errMap.newCustomError(errMap.errorTypes.DB_OPERATION_FAIL, "productCode");
      }
    }
  }
  return productMetadata;
}

module.exports = {
  getProductDSU,
  getProductMetadata,
  validateGTIN
}

},{"../../GTIN_SSI":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/GTIN_SSI.js","../../constants/constants.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","../../utils/LogUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/LogUtils.js","../../utils/ValidationUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/ValidationUtils.js","../errors/errorUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/errors/errorUtils.js","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/responses/index.js":[function(require,module,exports){
let responses = {};

module.exports = {
  buildResponse: function (version) {
    return new responses[version];
  },
  registerResponseVersion: function (version, buildFunction) {
    responses[version] = buildFunction;
  }
}
module.exports.registerResponseVersion(0.2, require("./response_v0.2"))

},{"./response_v0.2":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/responses/response_v0.2.js"}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/responses/response_v0.2.js":[function(require,module,exports){
module.exports = function () {
  this.setMessageType = (type) => {
    type = type ? type.toLowerCase() : "";
    switch (type) {
      case "product":
        this.messageType = "ProductResponse";
        break;
      case "batch":
        this.messageType = "BatchResponse";
        break;
      case "productphoto":
        this.messageType = "ProductPhotoResponse";
        break;
      case "videosource":
        this.messageType = "VideoSourceResponse";
        break;
      default:
        this.messageType = "UnknownTypeResponse";
        break;
    }
  }
  this.messageTypeVersion = 0.2;
  this.setSenderId = (senderID) => {
    this.senderId = senderID
  }
  this.setReceiverId = (receiverID) => {
    this.receiverId = receiverID
  }
  this.messageId = generate(13);
  this.messageDateTime = new Date();
  this.setRequestData = (requestObj) => {
    this.requestMessageType = requestObj.messageType;
    this.requestMessageTypeVersion = requestObj.messageTypeVersion;
    this.requestMessageId = requestObj.messageId
    this.requestMessageDateTime = requestObj.messageDateTime;
  }
  this.response = [];
  this.addSuccessResponse = () => {
    if (this.response.length) {
      console.log('Possible response already set.');
      return;
    }
    this.response.push({
      "responseCounter": 1,
      "responseType": 100,
      "responseDescription": "Message successfully digested"
    });
  }
  this.addErrorResponse = (type, message, details, field) => {
    this.response.push({
      "responseCounter": this.response.length + 1,
      "responseType": type,
      "responseDescription": message,
      "errorData": details,
      "errorDataField": field
    })
  }

}

function generate(n) {
  let add = 1,
    max = 12 - add;

  if (n > max) {
    return generate(max) + generate(n - max);
  }

  max = Math.pow(10, n + add);
  var min = max / 10; // Math.pow(10, n) basically
  var number = Math.floor(Math.random() * (max - min + 1)) + min;

  return ("" + number).substring(add);
}



},{}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/utils.js":[function(require,module,exports){
const constants = require("../constants/constants");
const SmartUrl = require("opendsu").loadApi("utils").SmartUrl;

function buildLeafletUrl(domain, leaflet_type, gtin, language, batchNumber){
  //query params are sort on the fixedURL middleware when checking for any entry....
  //so we need to create the url that will be "hashed" with base64 into the same order and thus why
  //we will use URLSearchParams.sort function will provide the same sort mechanism on client and server
  let converter = new URL("https://non.relevant.url.com");
  //let create a wrapper over append method to ensure that no undefined variable will be added to the query
  let append = converter.searchParams.append;
  converter.searchParams.append = (name, value)=>{
    if(typeof value === "undefined"){
      return;
    }
    append.call(converter.searchParams, name, value);
  }

  converter.searchParams.append("batch",  batchNumber);
  converter.searchParams.append("lang",  language);
  converter.searchParams.append("gtin",  gtin);
  converter.searchParams.append("leaflet_type",  leaflet_type);
  converter.searchParams.sort();
  return `/leaflets/${domain}?${converter.searchParams.toString()}`;
}

function buildGtinOwnerURL(domain, gtin){
  return `/gtinOwner/${domain}/${gtin}`;
}

function getReplicasAsSmartUrls(targetDomain, callback){
  const BDNS = require("opendsu").loadApi("bdns");
  BDNS.getAnchoringServices(targetDomain, (err, endpoints)=> {
    if (err) {
      return callback(err);
    }
    let replicas = [];
    for(let endpoint of endpoints){
      replicas.push(new SmartUrl(endpoint));
    }
    return callback(undefined, replicas);
  });
}

function call(endpoints, body, callback){
  function executeRequest(){
    if(endpoints.length === 0){
      const msg = `Not able to activate fixedUrl`;
      console.log(msg);
      return callback(new Error(msg));
    }

    let apihubEndpoint = endpoints.shift();
    apihubEndpoint.doPut(body, {}, (err) => {
      if (err) {
        console.error(err);
        //if we get error we try to make a call to other endpoint if any
        executeRequest();
      } else {
        return callback(undefined, true);
      }
    });
  }

  executeRequest();
}

function registerGtinOwnerFixedUrlByDomain(domain, gtin, callback){
  getReplicasAsSmartUrls(domain, (err, replicas)=>{
    if(replicas.length === 0){
      const msg = `Not able to fix the url for gtinOwner`;
      console.log(msg);
      return callback(new Error(msg));
    }

    let body = JSON.stringify([buildGtinOwnerURL(domain, gtin)]);

    let targets = [];
    for(let replica of replicas){
      targets.push(replica.concatWith("/registerFixedURLs"));
    }

    call(targets, body, callback);
  });
}

function registerLeafletFixedUrlByDomain(domain, subdomain,  leaflet_type, gtin, language, batchNumber, expiry, epiVersion, callback){
  getReplicasAsSmartUrls(subdomain, (err, replicas)=>{
    if(replicas.length === 0){
      const msg = `Not able to fix the url for Leaflet`;
      console.log(msg);
      return callback(new Error(msg));
    }

    let body;
    if(Array.isArray(language)){
      let urls = [];
      for(let lang of language){
        urls.push(buildLeafletUrl(domain, leaflet_type, gtin, lang, batchNumber, expiry, epiVersion));
      }
      body = JSON.stringify(urls);
    }else{
      body = JSON.stringify([buildLeafletUrl(domain, leaflet_type, gtin, language, batchNumber, expiry, epiVersion)]);
    }

    let targets = [];
    for(let replica of replicas){
      targets.push(replica.concatWith("/registerFixedURLs"));
    }

    call(targets, body, callback);
  });
}

function getActivateRelatedFixedURLHandler(getReplicasFnc){
  return function activateRelatedFixedUrl(dsu, domain, gtin, callback){
    if(typeof callback === "undefined"){
      callback = (err)=>{
        if(err){
          console.error(err);
        }
      }
    }

    let next = async ()=>{
      //we were able to commit the new changes then we should call the fixedUrl endpoints
      getReplicasFnc(domain, function(err, replicas){
        if(replicas.length === 0){
          const msg = `Not able to activate fixedUrls`;
          console.log(msg);
          return callback(new Error(msg));
        }
        let targets = [];
        for(let replica of replicas){
          targets.push(replica.concatWith("/activateFixedURL"));
        }

        call(targets, `url like (${gtin})`, callback);
      });
    }

    if(dsu){
      dsu.onCommitBatch(next, true);
    }else{
      next();
    }
  }
}

function getDeactivateRelatedFixedURLHandler(getReplicasFnc){
  return function deactivateRelatedFixedUrl(dsu, domain, gtin, callback){
    getReplicasFnc(domain, function(err, replicas){
      if(replicas.length === 0){
        const msg = `Not able to deactivate fixedUrls`;
        console.log(msg);
        return callback(new Error(msg));
      }
      let targets = [];
      for(let replica of replicas){
        targets.push(replica.concatWith("/deactivateFixedURL"));
      }

      call(targets, `url like (${gtin})`, callback);
    });
  }
}

function getProductJSONIndication(message){
  return {product: `${constants.PRODUCT_STORAGE_FILE}${message.messageTypeVersion}`};
}

function getBatchJSONIndication(message){
  return {batch: `${constants.BATCH_STORAGE_FILE}${message.messageTypeVersion}`}
}

let expose = {
  getProductJSONIndication,
  getBatchJSONIndication,
  registerLeafletFixedUrlByDomain,
  registerGtinOwnerFixedUrlByDomain,
  activateLeafletFixedUrl:getActivateRelatedFixedURLHandler(getReplicasAsSmartUrls),
  deactivateLeafletFixedUrl:getDeactivateRelatedFixedURLHandler(getReplicasAsSmartUrls),
  activateGtinOwnerFixedUrl:getActivateRelatedFixedURLHandler(getReplicasAsSmartUrls),
  deactivateGtinOwnerFixedUrl:getDeactivateRelatedFixedURLHandler(getReplicasAsSmartUrls)
}

expose.registerLeafletFixedUrlByDomainAsync = $$.promisify(expose.registerLeafletFixedUrlByDomain);
expose.registerGtinOwnerFixedUrlByDomainAsync = $$.promisify(expose.registerGtinOwnerFixedUrlByDomain);
expose.deactivateLeafletFixedUrlAsync = $$.promisify(expose.deactivateLeafletFixedUrl);
expose.deactivateGtinOwnerFixedUrlAsync = $$.promisify(expose.deactivateGtinOwnerFixedUrl);

module.exports = expose;

},{"../constants/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/metadata/index.js":[function(require,module,exports){
const GTIN_SSI = require("../GTIN_SSI");
const path = require("path");
const fs = require('fs');
const utils = require("../leaflet-web-api/leafletUtils");
const {EPI_TYPES} = require("../constants/constants");
const XMLDisplayService = require("../services/XMLDisplayService/XMLDisplayService");
const languageServiceUtils = require("../utils/Languages");
const LeafletInfoService = require("../services/LeafletInfoService");
const CACHE_FILE = "dsuMetadata";

function getMetadata(server){
    if (server.allowFixedUrl) {
        //let's make the fixedURL middleware aware of our endpoints
        server.allowFixedUrl("/metadata/");
    }

    const logger = $$.getLogger("metadata", "getMetadata");
    // const lokiEnclaveFacadeModule = require("loki-enclave-facade");
    // const createLokiEnclaveFacadeInstance = lokiEnclaveFacadeModule.createLokiEnclaveFacadeInstance;
    // const cachePath = path.join(server.rootFolder, "external-volume", "metadata", "cache");


    // const DATABASE_PERSISTENCE_TIMEOUT = 100;
    // let database;

    // if(!server.readOnlyModeActive){
    //     try {
    //         fs.accessSync(cachePath);
    //     } catch (e) {
    //         fs.mkdirSync(cachePath, {recursive: true});
    //     }
    //     database = createLokiEnclaveFacadeInstance(path.join(cachePath, CACHE_FILE), DATABASE_PERSISTENCE_TIMEOUT, lokiEnclaveFacadeModule.Adapters.PARTITIONED);
    // }

    // const METADATA_TABLE = "dsuMetadata";

    async function getDSUMetadataHandler(request, response) {
        let epiDomain = request.params.domain;
        const isValidDomain = require("swarmutils").isValidDomain;
        if(!isValidDomain(epiDomain)) {
            logger.error("Domain validation failed", epiDomain);
            response.statusCode = 400;
            return response.end("Fail");
        }

        // Sanitize and validate input parameters
        let gtin = request.query.gtin || null;
        let batchNumber = request.query.batch || null;

        // Validate gtin to be numeric and 14 characters
        if (gtin && (!/^\d{14}$/.test(gtin) || typeof gtin !== "string")) {
            logger.info(0x103, `Validation failed for gtin.length`);
            return sendResponse(response, 400, JSON.stringify({ code: "002" }));
        }

        // Validate batchNumber if present
        if (batchNumber && batchNumber === "undefined") {
            batchNumber = null;
        }

        // let metadataObj;
        // let metadataDBUrl = `/metadata/leaflet/${epiDomain}/${gtin}/${batchNumber}`

        // //Get from db
        // try {
        //     if(database) 
        //         metadataObj = await $$.promisify(database.getRecord)(undefined, METADATA_TABLE, metadataDBUrl);
        // } catch (err) {
        //     //exceptions on getting records from db are handled bellow
        // }

        // //Respond if object found in db
        // if (typeof metadataObj !== "object") {
        //     try {
        //         let dbObj = JSON.parse(metadataObj);
        //         if (dbObj !== "undefined") {
        //           return sendResponse(response, 200, metadataObj);
        //         }
        //     } catch (e) {
        //         //db record is invalid; continue with resolving request
        //     }
        // }


        try {

            if (!gtin) {
                logger.info(0x103, `Missing required parameter <gtin>`);
                return sendResponse(response, 400, JSON.stringify({ code: "002" }));
            }

            let validationResult = require("../utils/ValidationUtils").validateGTIN(gtin);

            if (validationResult && !validationResult.isValid) {
                logger.info(0x103, `Validation failed for gtin`);
                return sendResponse(response, 400, JSON.stringify({ code: "003" }));
            }


            
            // const productGtinSSI = GTIN_SSI.createGTIN_SSI(epiDomain, undefined, gtin);

            // let product = undefined;
            // try {
            //     product = await checkDSUExistAsync(productGtinSSI);
            // } catch(err) {
            //     logger.info(0x103, `Unable to check Product DSU existence`);
            //     logger.error(err);
            //     return sendResponse(response, 529, "Server busy checking product existence");
            // }

            // if(!product){
            //     logger.info(0x103, `Product unknown`);
            //     return sendResponse(response, 400, JSON.stringify({code: "001"}));
            // }
            
            // let batch = undefined;
            // try {
            //     const batchGtinSSI = GTIN_SSI.createGTIN_SSI(epiDomain, undefined, gtin, batchNumber);
            //     batch = await checkDSUExistAsync(batchGtinSSI);
            // } catch (err) {
            //     logger.info(0x103, `Unable to check Batch DSU existence`);
            //     logger.error(err);
            //     return sendResponse(response, 529, "Server busy checking batch existence");
            // }

            // if(!batch){
            //     logger.info(0x103, `Batch unknown`);
            //     return sendResponse(response, 400, JSON.stringify({code: "001"}));
            // }

            let leafletInfo = await LeafletInfoService.init({gtin, batchNumber}, epiDomain);
            const productData = await leafletInfo.getProductClientModel();

            const model = {product: {gtin}, networkName: epiDomain};
            const documentsMetadata = {};
            for (let epiType of Object.values(EPI_TYPES)) {
                const constSSI = GTIN_SSI.createGTIN_SSI(epiDomain, undefined, gtin);
                const leafletXmlService = new XMLDisplayService(null, constSSI, model, epiType);

                const langsFromUnspecifiedMarket = await leafletXmlService.mergeAvailableLanguages();
                const ePIsByLang = await utils.getEPIMarketsForProductAsync(epiDomain, gtin, epiType);
                const ePIsByMarket = {};
                for (const [lang, countries] of Object.entries(ePIsByLang)) {
                    for (const country of countries) {
                        if (!ePIsByMarket[country])
                            ePIsByMarket[country] = [];
                        ePIsByMarket[country].push(languageServiceUtils.getLanguageAsItemForVMFromCode(lang));
                    }
                }

                if (Object.keys(langsFromUnspecifiedMarket).length || Object.keys(ePIsByLang).length) {
                    documentsMetadata[epiType] = {
                        ...(Object.keys(langsFromUnspecifiedMarket) ? {
                            unspecified: Object.keys(langsFromUnspecifiedMarket || {}).map((lang) => {
                                return languageServiceUtils.getLanguageAsItemForVMFromCode(lang);
                            })
                        } : {}),
                        ...ePIsByMarket
                    };
                }
            }

            // //Save object to db
            // if(!server.readOnlyModeActive){
            //     try {
            //       await $$.promisify(database.insertRecord)(undefined, METADATA_TABLE, metadataDBUrl, documentsMetadata);
            //     } catch (e) {
            //       logger.info(0x0, `Failed to cache metadata`, e.message);
            //       //failed to cache; continue without caching
            //     }
            // }

            return sendResponse(response, 200, JSON.stringify({
                productData: productData,
                availableDocuments: documentsMetadata
            }));
        } catch (err) {
            logger.info(0x103, err.message);
            return sendResponse(response, 500, err.message);
        }
    }


    server.get("/metadata/leaflet/:domain", getDSUMetadataHandler);
    server.get("/metadata/leaflet/:domain/:subdomain", function(req, res){
      let url = req.url.replace(`/${req.params.subdomain}`, "");
      logger.debug("Local resolving of metadata without the extra params");
      return server.makeLocalRequest("GET", url, (err, content)=>{
        if(err){
          logger.error(0x100, err.message);
          return sendResponse(res, 529, `Server busy finding metadata` );
        }
        logger.debug(0x100, "Successfully returned metadata info after local redirect");
        return sendResponse(res, 200, content);
      });
    });
}

function sendResponse(response, statusCode, message) {
  response.statusCode = statusCode;
  if(statusCode === 200){
    response.setHeader("Content-type", "application/json");
  }else{
    response.setHeader("Content-Type", "text/plain");
  }
  response.end(message);
}

// async function checkDSUExistAsync(constSSI){
//     let apiName = "checkDSUExist";
//     let uid = constSSI.getIdentifier();
//     let result // = apiCache.getResult(uid, apiName);
//     if(result){
//         return result;
//     }
//     const resolver = require("opendsu").loadApi("resolver");
//     result = await $$.promisify(resolver.dsuExists)(constSSI);
//     // apiCache.registerResult(uid, apiName, result);
//     return result;
// }
module.exports.getMetadata = getMetadata;
},{"../GTIN_SSI":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/GTIN_SSI.js","../constants/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","../leaflet-web-api/leafletUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/leaflet-web-api/leafletUtils.js","../services/LeafletInfoService":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/LeafletInfoService.js","../services/XMLDisplayService/XMLDisplayService":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/XMLDisplayService/XMLDisplayService.js","../utils/Languages":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/Languages.js","../utils/ValidationUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/ValidationUtils.js","fs":false,"path":false,"swarmutils":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/middlewares/bodyReaderMiddleware.js":[function(require,module,exports){
const bodyReaderMiddleware = (req, res, next) => {
    let data = '';

    req.on('data', chunk => {
        data += chunk;
    });

    req.on('end', () => {
        try {
            req.body = JSON.parse(data);
        } catch (e) {
            req.body = data;
        }
        next();
    });
};
module.exports = bodyReaderMiddleware;
},{}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/saxjs/sax.js":[function(require,module,exports){
(function (Buffer){(function (){
(function (sax) { // wrapper for non-node envs
  sax.parser = function (strict, opt) { return new SAXParser(strict, opt) }
  sax.SAXParser = SAXParser
  sax.SAXStream = SAXStream
  sax.createStream = createStream

  // When we pass the MAX_BUFFER_LENGTH position, start checking for buffer overruns.
  // When we check, schedule the next check for MAX_BUFFER_LENGTH - (max(buffer lengths)),
  // since that's the earliest that a buffer overrun could occur.  This way, checks are
  // as rare as required, but as often as necessary to ensure never crossing this bound.
  // Furthermore, buffers are only tested at most once per write(), so passing a very
  // large string into write() might have undesirable effects, but this is manageable by
  // the caller, so it is assumed to be safe.  Thus, a call to write() may, in the extreme
  // edge case, result in creating at most one complete copy of the string passed in.
  // Set to Infinity to have unlimited buffers.
  sax.MAX_BUFFER_LENGTH = 64 * 1024

  var buffers = [
    'comment', 'sgmlDecl', 'textNode', 'tagName', 'doctype',
    'procInstName', 'procInstBody', 'entity', 'attribName',
    'attribValue', 'cdata', 'script'
  ]

  sax.EVENTS = [
    'text',
    'processinginstruction',
    'sgmldeclaration',
    'doctype',
    'comment',
    'opentagstart',
    'attribute',
    'opentag',
    'closetag',
    'opencdata',
    'cdata',
    'closecdata',
    'error',
    'end',
    'ready',
    'script',
    'opennamespace',
    'closenamespace'
  ]

  function SAXParser (strict, opt) {
    if (!(this instanceof SAXParser)) {
      return new SAXParser(strict, opt)
    }

    var parser = this
    clearBuffers(parser)
    parser.q = parser.c = ''
    parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH
    parser.opt = opt || {}
    parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags
    parser.looseCase = parser.opt.lowercase ? 'toLowerCase' : 'toUpperCase'
    parser.tags = []
    parser.closed = parser.closedRoot = parser.sawRoot = false
    parser.tag = parser.error = null
    parser.strict = !!strict
    parser.noscript = !!(strict || parser.opt.noscript)
    parser.state = S.BEGIN
    parser.strictEntities = parser.opt.strictEntities
    parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES)
    parser.attribList = []

    // namespaces form a prototype chain.
    // it always points at the current tag,
    // which protos to its parent tag.
    if (parser.opt.xmlns) {
      parser.ns = Object.create(rootNS)
    }

    // mostly just for error reporting
    parser.trackPosition = parser.opt.position !== false
    if (parser.trackPosition) {
      parser.position = parser.line = parser.column = 0
    }
    emit(parser, 'onready')
  }

  if (!Object.create) {
    Object.create = function (o) {
      function F () {}
      F.prototype = o
      var newf = new F()
      return newf
    }
  }

  if (!Object.keys) {
    Object.keys = function (o) {
      var a = []
      for (var i in o) if (o.hasOwnProperty(i)) a.push(i)
      return a
    }
  }

  function checkBufferLength (parser) {
    var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10)
    var maxActual = 0
    for (var i = 0, l = buffers.length; i < l; i++) {
      var len = parser[buffers[i]].length
      if (len > maxAllowed) {
        // Text/cdata nodes can get big, and since they're buffered,
        // we can get here under normal conditions.
        // Avoid issues by emitting the text node now,
        // so at least it won't get any bigger.
        switch (buffers[i]) {
          case 'textNode':
            closeText(parser)
            break

          case 'cdata':
            emitNode(parser, 'oncdata', parser.cdata)
            parser.cdata = ''
            break

          case 'script':
            emitNode(parser, 'onscript', parser.script)
            parser.script = ''
            break

          default:
            error(parser, 'Max buffer length exceeded: ' + buffers[i])
        }
      }
      maxActual = Math.max(maxActual, len)
    }
    // schedule the next check for the earliest possible buffer overrun.
    var m = sax.MAX_BUFFER_LENGTH - maxActual
    parser.bufferCheckPosition = m + parser.position
  }

  function clearBuffers (parser) {
    for (var i = 0, l = buffers.length; i < l; i++) {
      parser[buffers[i]] = ''
    }
  }

  function flushBuffers (parser) {
    closeText(parser)
    if (parser.cdata !== '') {
      emitNode(parser, 'oncdata', parser.cdata)
      parser.cdata = ''
    }
    if (parser.script !== '') {
      emitNode(parser, 'onscript', parser.script)
      parser.script = ''
    }
  }

  SAXParser.prototype = {
    end: function () { end(this) },
    write: write,
    resume: function () { this.error = null; return this },
    close: function () { return this.write(null) },
    flush: function () { flushBuffers(this) }
  }

  var Stream
  try {
    Stream = require('stream').Stream
  } catch (ex) {
    Stream = function () {}
  }
  if (!Stream) Stream = function () {}

  var streamWraps = sax.EVENTS.filter(function (ev) {
    return ev !== 'error' && ev !== 'end'
  })

  function createStream (strict, opt) {
    return new SAXStream(strict, opt)
  }

  function SAXStream (strict, opt) {
    if (!(this instanceof SAXStream)) {
      return new SAXStream(strict, opt)
    }

    Stream.apply(this)

    this._parser = new SAXParser(strict, opt)
    this.writable = true
    this.readable = true

    var me = this

    this._parser.onend = function () {
      me.emit('end')
    }

    this._parser.onerror = function (er) {
      me.emit('error', er)

      // if didn't throw, then means error was handled.
      // go ahead and clear error, so we can write again.
      me._parser.error = null
    }

    this._decoder = null

    streamWraps.forEach(function (ev) {
      Object.defineProperty(me, 'on' + ev, {
        get: function () {
          return me._parser['on' + ev]
        },
        set: function (h) {
          if (!h) {
            me.removeAllListeners(ev)
            me._parser['on' + ev] = h
            return h
          }
          me.on(ev, h)
        },
        enumerable: true,
        configurable: false
      })
    })
  }

  SAXStream.prototype = Object.create(Stream.prototype, {
    constructor: {
      value: SAXStream
    }
  })

  SAXStream.prototype.write = function (data) {
    if (typeof Buffer === 'function' &&
      typeof Buffer.isBuffer === 'function' &&
      Buffer.isBuffer(data)) {
      if (!this._decoder) {
        var SD = require('string_decoder').StringDecoder
        this._decoder = new SD('utf8')
      }
      data = this._decoder.write(data)
    }

    this._parser.write(data.toString())
    this.emit('data', data)
    return true
  }

  SAXStream.prototype.end = function (chunk) {
    if (chunk && chunk.length) {
      this.write(chunk)
    }
    this._parser.end()
    return true
  }

  SAXStream.prototype.on = function (ev, handler) {
    var me = this
    if (!me._parser['on' + ev] && streamWraps.indexOf(ev) !== -1) {
      me._parser['on' + ev] = function () {
        var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments)
        args.splice(0, 0, ev)
        me.emit.apply(me, args)
      }
    }

    return Stream.prototype.on.call(me, ev, handler)
  }

  // this really needs to be replaced with character classes.
  // XML allows all manner of ridiculous numbers and digits.
  var CDATA = '[CDATA['
  var DOCTYPE = 'DOCTYPE'
  var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace'
  var XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/'
  var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE }

  // http://www.w3.org/TR/REC-xml/#NT-NameStartChar
  // This implementation works on strings, a single character at a time
  // as such, it cannot ever support astral-plane characters (10000-EFFFF)
  // without a significant breaking change to either this  parser, or the
  // JavaScript language.  Implementation of an emoji-capable xml parser
  // is left as an exercise for the reader.
  var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/

  var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/

  var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/
  var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/

  function isWhitespace (c) {
    return c === ' ' || c === '\n' || c === '\r' || c === '\t'
  }

  function isQuote (c) {
    return c === '"' || c === '\''
  }

  function isAttribEnd (c) {
    return c === '>' || isWhitespace(c)
  }

  function isMatch (regex, c) {
    return regex.test(c)
  }

  function notMatch (regex, c) {
    return !isMatch(regex, c)
  }

  var S = 0
  sax.STATE = {
    BEGIN: S++, // leading byte order mark or whitespace
    BEGIN_WHITESPACE: S++, // leading whitespace
    TEXT: S++, // general stuff
    TEXT_ENTITY: S++, // &amp and such.
    OPEN_WAKA: S++, // <
    SGML_DECL: S++, // <!BLARG
    SGML_DECL_QUOTED: S++, // <!BLARG foo "bar
    DOCTYPE: S++, // <!DOCTYPE
    DOCTYPE_QUOTED: S++, // <!DOCTYPE "//blah
    DOCTYPE_DTD: S++, // <!DOCTYPE "//blah" [ ...
    DOCTYPE_DTD_QUOTED: S++, // <!DOCTYPE "//blah" [ "foo
    COMMENT_STARTING: S++, // <!-
    COMMENT: S++, // <!--
    COMMENT_ENDING: S++, // <!-- blah -
    COMMENT_ENDED: S++, // <!-- blah --
    CDATA: S++, // <![CDATA[ something
    CDATA_ENDING: S++, // ]
    CDATA_ENDING_2: S++, // ]]
    PROC_INST: S++, // <?hi
    PROC_INST_BODY: S++, // <?hi there
    PROC_INST_ENDING: S++, // <?hi "there" ?
    OPEN_TAG: S++, // <strong
    OPEN_TAG_SLASH: S++, // <strong /
    ATTRIB: S++, // <a
    ATTRIB_NAME: S++, // <a foo
    ATTRIB_NAME_SAW_WHITE: S++, // <a foo _
    ATTRIB_VALUE: S++, // <a foo=
    ATTRIB_VALUE_QUOTED: S++, // <a foo="bar
    ATTRIB_VALUE_CLOSED: S++, // <a foo="bar"
    ATTRIB_VALUE_UNQUOTED: S++, // <a foo=bar
    ATTRIB_VALUE_ENTITY_Q: S++, // <foo bar="&quot;"
    ATTRIB_VALUE_ENTITY_U: S++, // <foo bar=&quot
    CLOSE_TAG: S++, // </a
    CLOSE_TAG_SAW_WHITE: S++, // </a   >
    SCRIPT: S++, // <script> ...
    SCRIPT_ENDING: S++ // <script> ... <
  }

  sax.XML_ENTITIES = {
    'amp': '&',
    'gt': '>',
    'lt': '<',
    'quot': '"',
    'apos': "'"
  }

  sax.ENTITIES = {
    'amp': '&',
    'gt': '>',
    'lt': '<',
    'quot': '"',
    'apos': "'",
    'AElig': 198,
    'Aacute': 193,
    'Acirc': 194,
    'Agrave': 192,
    'Aring': 197,
    'Atilde': 195,
    'Auml': 196,
    'Ccedil': 199,
    'ETH': 208,
    'Eacute': 201,
    'Ecirc': 202,
    'Egrave': 200,
    'Euml': 203,
    'Iacute': 205,
    'Icirc': 206,
    'Igrave': 204,
    'Iuml': 207,
    'Ntilde': 209,
    'Oacute': 211,
    'Ocirc': 212,
    'Ograve': 210,
    'Oslash': 216,
    'Otilde': 213,
    'Ouml': 214,
    'THORN': 222,
    'Uacute': 218,
    'Ucirc': 219,
    'Ugrave': 217,
    'Uuml': 220,
    'Yacute': 221,
    'aacute': 225,
    'acirc': 226,
    'aelig': 230,
    'agrave': 224,
    'aring': 229,
    'atilde': 227,
    'auml': 228,
    'ccedil': 231,
    'eacute': 233,
    'ecirc': 234,
    'egrave': 232,
    'eth': 240,
    'euml': 235,
    'iacute': 237,
    'icirc': 238,
    'igrave': 236,
    'iuml': 239,
    'ntilde': 241,
    'oacute': 243,
    'ocirc': 244,
    'ograve': 242,
    'oslash': 248,
    'otilde': 245,
    'ouml': 246,
    'szlig': 223,
    'thorn': 254,
    'uacute': 250,
    'ucirc': 251,
    'ugrave': 249,
    'uuml': 252,
    'yacute': 253,
    'yuml': 255,
    'copy': 169,
    'reg': 174,
    'nbsp': 160,
    'iexcl': 161,
    'cent': 162,
    'pound': 163,
    'curren': 164,
    'yen': 165,
    'brvbar': 166,
    'sect': 167,
    'uml': 168,
    'ordf': 170,
    'laquo': 171,
    'not': 172,
    'shy': 173,
    'macr': 175,
    'deg': 176,
    'plusmn': 177,
    'sup1': 185,
    'sup2': 178,
    'sup3': 179,
    'acute': 180,
    'micro': 181,
    'para': 182,
    'middot': 183,
    'cedil': 184,
    'ordm': 186,
    'raquo': 187,
    'frac14': 188,
    'frac12': 189,
    'frac34': 190,
    'iquest': 191,
    'times': 215,
    'divide': 247,
    'OElig': 338,
    'oelig': 339,
    'Scaron': 352,
    'scaron': 353,
    'Yuml': 376,
    'fnof': 402,
    'circ': 710,
    'tilde': 732,
    'Alpha': 913,
    'Beta': 914,
    'Gamma': 915,
    'Delta': 916,
    'Epsilon': 917,
    'Zeta': 918,
    'Eta': 919,
    'Theta': 920,
    'Iota': 921,
    'Kappa': 922,
    'Lambda': 923,
    'Mu': 924,
    'Nu': 925,
    'Xi': 926,
    'Omicron': 927,
    'Pi': 928,
    'Rho': 929,
    'Sigma': 931,
    'Tau': 932,
    'Upsilon': 933,
    'Phi': 934,
    'Chi': 935,
    'Psi': 936,
    'Omega': 937,
    'alpha': 945,
    'beta': 946,
    'gamma': 947,
    'delta': 948,
    'epsilon': 949,
    'zeta': 950,
    'eta': 951,
    'theta': 952,
    'iota': 953,
    'kappa': 954,
    'lambda': 955,
    'mu': 956,
    'nu': 957,
    'xi': 958,
    'omicron': 959,
    'pi': 960,
    'rho': 961,
    'sigmaf': 962,
    'sigma': 963,
    'tau': 964,
    'upsilon': 965,
    'phi': 966,
    'chi': 967,
    'psi': 968,
    'omega': 969,
    'thetasym': 977,
    'upsih': 978,
    'piv': 982,
    'ensp': 8194,
    'emsp': 8195,
    'thinsp': 8201,
    'zwnj': 8204,
    'zwj': 8205,
    'lrm': 8206,
    'rlm': 8207,
    'ndash': 8211,
    'mdash': 8212,
    'lsquo': 8216,
    'rsquo': 8217,
    'sbquo': 8218,
    'ldquo': 8220,
    'rdquo': 8221,
    'bdquo': 8222,
    'dagger': 8224,
    'Dagger': 8225,
    'bull': 8226,
    'hellip': 8230,
    'permil': 8240,
    'prime': 8242,
    'Prime': 8243,
    'lsaquo': 8249,
    'rsaquo': 8250,
    'oline': 8254,
    'frasl': 8260,
    'euro': 8364,
    'image': 8465,
    'weierp': 8472,
    'real': 8476,
    'trade': 8482,
    'alefsym': 8501,
    'larr': 8592,
    'uarr': 8593,
    'rarr': 8594,
    'darr': 8595,
    'harr': 8596,
    'crarr': 8629,
    'lArr': 8656,
    'uArr': 8657,
    'rArr': 8658,
    'dArr': 8659,
    'hArr': 8660,
    'forall': 8704,
    'part': 8706,
    'exist': 8707,
    'empty': 8709,
    'nabla': 8711,
    'isin': 8712,
    'notin': 8713,
    'ni': 8715,
    'prod': 8719,
    'sum': 8721,
    'minus': 8722,
    'lowast': 8727,
    'radic': 8730,
    'prop': 8733,
    'infin': 8734,
    'ang': 8736,
    'and': 8743,
    'or': 8744,
    'cap': 8745,
    'cup': 8746,
    'int': 8747,
    'there4': 8756,
    'sim': 8764,
    'cong': 8773,
    'asymp': 8776,
    'ne': 8800,
    'equiv': 8801,
    'le': 8804,
    'ge': 8805,
    'sub': 8834,
    'sup': 8835,
    'nsub': 8836,
    'sube': 8838,
    'supe': 8839,
    'oplus': 8853,
    'otimes': 8855,
    'perp': 8869,
    'sdot': 8901,
    'lceil': 8968,
    'rceil': 8969,
    'lfloor': 8970,
    'rfloor': 8971,
    'lang': 9001,
    'rang': 9002,
    'loz': 9674,
    'spades': 9824,
    'clubs': 9827,
    'hearts': 9829,
    'diams': 9830
  }

  Object.keys(sax.ENTITIES).forEach(function (key) {
    var e = sax.ENTITIES[key]
    var s = typeof e === 'number' ? String.fromCharCode(e) : e
    sax.ENTITIES[key] = s
  })

  for (var s in sax.STATE) {
    sax.STATE[sax.STATE[s]] = s
  }

  // shorthand
  S = sax.STATE

  function emit (parser, event, data) {
    parser[event] && parser[event](data)
  }

  function emitNode (parser, nodeType, data) {
    if (parser.textNode) closeText(parser)
    emit(parser, nodeType, data)
  }

  function closeText (parser) {
    parser.textNode = textopts(parser.opt, parser.textNode)
    if (parser.textNode) emit(parser, 'ontext', parser.textNode)
    parser.textNode = ''
  }

  function textopts (opt, text) {
    if (opt.trim) text = text.trim()
    if (opt.normalize) text = text.replace(/\s+/g, ' ')
    return text
  }

  function error (parser, er) {
    closeText(parser)
    if (parser.trackPosition) {
      er += '\nLine: ' + parser.line +
        '\nColumn: ' + parser.column +
        '\nChar: ' + parser.c
    }
    er = new Error(er)
    parser.error = er
    emit(parser, 'onerror', er)
    return parser
  }

  function end (parser) {
    if (parser.sawRoot && !parser.closedRoot) strictFail(parser, 'Unclosed root tag')
    if ((parser.state !== S.BEGIN) &&
      (parser.state !== S.BEGIN_WHITESPACE) &&
      (parser.state !== S.TEXT)) {
      error(parser, 'Unexpected end')
    }
    closeText(parser)
    parser.c = ''
    parser.closed = true
    emit(parser, 'onend')
    SAXParser.call(parser, parser.strict, parser.opt)
    return parser
  }

  function strictFail (parser, message) {
    if (typeof parser !== 'object' || !(parser instanceof SAXParser)) {
      throw new Error('bad call to strictFail')
    }
    if (parser.strict) {
      error(parser, message)
    }
  }

  function newTag (parser) {
    if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]()
    var parent = parser.tags[parser.tags.length - 1] || parser
    var tag = parser.tag = { name: parser.tagName, attributes: {} }

    // will be overridden if tag contails an xmlns="foo" or xmlns:foo="bar"
    if (parser.opt.xmlns) {
      tag.ns = parent.ns
    }
    parser.attribList.length = 0
    emitNode(parser, 'onopentagstart', tag)
  }

  function qname (name, attribute) {
    var i = name.indexOf(':')
    var qualName = i < 0 ? [ '', name ] : name.split(':')
    var prefix = qualName[0]
    var local = qualName[1]

    // <x "xmlns"="http://foo">
    if (attribute && name === 'xmlns') {
      prefix = 'xmlns'
      local = ''
    }

    return { prefix: prefix, local: local }
  }

  function attrib (parser) {
    if (!parser.strict) {
      parser.attribName = parser.attribName[parser.looseCase]()
    }

    if (parser.attribList.indexOf(parser.attribName) !== -1 ||
      parser.tag.attributes.hasOwnProperty(parser.attribName)) {
      parser.attribName = parser.attribValue = ''
      return
    }

    if (parser.opt.xmlns) {
      var qn = qname(parser.attribName, true)
      var prefix = qn.prefix
      var local = qn.local

      if (prefix === 'xmlns') {
        // namespace binding attribute. push the binding into scope
        if (local === 'xml' && parser.attribValue !== XML_NAMESPACE) {
          strictFail(parser,
            'xml: prefix must be bound to ' + XML_NAMESPACE + '\n' +
            'Actual: ' + parser.attribValue)
        } else if (local === 'xmlns' && parser.attribValue !== XMLNS_NAMESPACE) {
          strictFail(parser,
            'xmlns: prefix must be bound to ' + XMLNS_NAMESPACE + '\n' +
            'Actual: ' + parser.attribValue)
        } else {
          var tag = parser.tag
          var parent = parser.tags[parser.tags.length - 1] || parser
          if (tag.ns === parent.ns) {
            tag.ns = Object.create(parent.ns)
          }
          tag.ns[local] = parser.attribValue
        }
      }

      // defer onattribute events until all attributes have been seen
      // so any new bindings can take effect. preserve attribute order
      // so deferred events can be emitted in document order
      parser.attribList.push([parser.attribName, parser.attribValue])
    } else {
      // in non-xmlns mode, we can emit the event right away
      parser.tag.attributes[parser.attribName] = parser.attribValue
      emitNode(parser, 'onattribute', {
        name: parser.attribName,
        value: parser.attribValue
      })
    }

    parser.attribName = parser.attribValue = ''
  }

  function openTag (parser, selfClosing) {
    if (parser.opt.xmlns) {
      // emit namespace binding events
      var tag = parser.tag

      // add namespace info to tag
      var qn = qname(parser.tagName)
      tag.prefix = qn.prefix
      tag.local = qn.local
      tag.uri = tag.ns[qn.prefix] || ''

      if (tag.prefix && !tag.uri) {
        strictFail(parser, 'Unbound namespace prefix: ' +
          JSON.stringify(parser.tagName))
        tag.uri = qn.prefix
      }

      var parent = parser.tags[parser.tags.length - 1] || parser
      if (tag.ns && parent.ns !== tag.ns) {
        Object.keys(tag.ns).forEach(function (p) {
          emitNode(parser, 'onopennamespace', {
            prefix: p,
            uri: tag.ns[p]
          })
        })
      }

      // handle deferred onattribute events
      // Note: do not apply default ns to attributes:
      //   http://www.w3.org/TR/REC-xml-names/#defaulting
      for (var i = 0, l = parser.attribList.length; i < l; i++) {
        var nv = parser.attribList[i]
        var name = nv[0]
        var value = nv[1]
        var qualName = qname(name, true)
        var prefix = qualName.prefix
        var local = qualName.local
        var uri = prefix === '' ? '' : (tag.ns[prefix] || '')
        var a = {
          name: name,
          value: value,
          prefix: prefix,
          local: local,
          uri: uri
        }

        // if there's any attributes with an undefined namespace,
        // then fail on them now.
        if (prefix && prefix !== 'xmlns' && !uri) {
          strictFail(parser, 'Unbound namespace prefix: ' +
            JSON.stringify(prefix))
          a.uri = prefix
        }
        parser.tag.attributes[name] = a
        emitNode(parser, 'onattribute', a)
      }
      parser.attribList.length = 0
    }

    parser.tag.isSelfClosing = !!selfClosing

    // process the tag
    parser.sawRoot = true
    parser.tags.push(parser.tag)
    emitNode(parser, 'onopentag', parser.tag)
    if (!selfClosing) {
      // special case for <script> in non-strict mode.
      if (!parser.noscript && parser.tagName.toLowerCase() === 'script') {
        parser.state = S.SCRIPT
      } else {
        parser.state = S.TEXT
      }
      parser.tag = null
      parser.tagName = ''
    }
    parser.attribName = parser.attribValue = ''
    parser.attribList.length = 0
  }

  function closeTag (parser) {
    if (!parser.tagName) {
      strictFail(parser, 'Weird empty close tag.')
      parser.textNode += '</>'
      parser.state = S.TEXT
      return
    }

    if (parser.script) {
      if (parser.tagName !== 'script') {
        parser.script += '</' + parser.tagName + '>'
        parser.tagName = ''
        parser.state = S.SCRIPT
        return
      }
      emitNode(parser, 'onscript', parser.script)
      parser.script = ''
    }

    // first make sure that the closing tag actually exists.
    // <a><b></c></b></a> will close everything, otherwise.
    var t = parser.tags.length
    var tagName = parser.tagName
    if (!parser.strict) {
      tagName = tagName[parser.looseCase]()
    }
    var closeTo = tagName
    while (t--) {
      var close = parser.tags[t]
      if (close.name !== closeTo) {
        // fail the first time in strict mode
        strictFail(parser, 'Unexpected close tag')
      } else {
        break
      }
    }

    // didn't find it.  we already failed for strict, so just abort.
    if (t < 0) {
      strictFail(parser, 'Unmatched closing tag: ' + parser.tagName)
      parser.textNode += '</' + parser.tagName + '>'
      parser.state = S.TEXT
      return
    }
    parser.tagName = tagName
    var s = parser.tags.length
    while (s-- > t) {
      var tag = parser.tag = parser.tags.pop()
      parser.tagName = parser.tag.name
      emitNode(parser, 'onclosetag', parser.tagName)

      var x = {}
      for (var i in tag.ns) {
        x[i] = tag.ns[i]
      }

      var parent = parser.tags[parser.tags.length - 1] || parser
      if (parser.opt.xmlns && tag.ns !== parent.ns) {
        // remove namespace bindings introduced by tag
        Object.keys(tag.ns).forEach(function (p) {
          var n = tag.ns[p]
          emitNode(parser, 'onclosenamespace', { prefix: p, uri: n })
        })
      }
    }
    if (t === 0) parser.closedRoot = true
    parser.tagName = parser.attribValue = parser.attribName = ''
    parser.attribList.length = 0
    parser.state = S.TEXT
  }

  function parseEntity (parser) {
    var entity = parser.entity
    var entityLC = entity.toLowerCase()
    var num
    var numStr = ''

    if (parser.ENTITIES[entity]) {
      return parser.ENTITIES[entity]
    }
    if (parser.ENTITIES[entityLC]) {
      return parser.ENTITIES[entityLC]
    }
    entity = entityLC
    if (entity.charAt(0) === '#') {
      if (entity.charAt(1) === 'x') {
        entity = entity.slice(2)
        num = parseInt(entity, 16)
        numStr = num.toString(16)
      } else {
        entity = entity.slice(1)
        num = parseInt(entity, 10)
        numStr = num.toString(10)
      }
    }
    entity = entity.replace(/^0+/, '')
    if (isNaN(num) || numStr.toLowerCase() !== entity) {
      strictFail(parser, 'Invalid character entity')
      return '&' + parser.entity + ';'
    }

    return String.fromCodePoint(num)
  }

  function beginWhiteSpace (parser, c) {
    if (c === '<') {
      parser.state = S.OPEN_WAKA
      parser.startTagPosition = parser.position
    } else if (!isWhitespace(c)) {
      // have to process this as a text node.
      // weird, but happens.
      strictFail(parser, 'Non-whitespace before first tag.')
      parser.textNode = c
      parser.state = S.TEXT
    }
  }

  function charAt (chunk, i) {
    var result = ''
    if (i < chunk.length) {
      result = chunk.charAt(i)
    }
    return result
  }

  function write (chunk) {
    var parser = this
    if (this.error) {
      throw this.error
    }
    if (parser.closed) {
      return error(parser,
        'Cannot write after close. Assign an onready handler.')
    }
    if (chunk === null) {
      return end(parser)
    }
    if (typeof chunk === 'object') {
      chunk = chunk.toString()
    }
    var i = 0
    var c = ''
    while (true) {
      c = charAt(chunk, i++)
      parser.c = c

      if (!c) {
        break
      }

      if (parser.trackPosition) {
        parser.position++
        if (c === '\n') {
          parser.line++
          parser.column = 0
        } else {
          parser.column++
        }
      }

      switch (parser.state) {
        case S.BEGIN:
          parser.state = S.BEGIN_WHITESPACE
          if (c === '\uFEFF') {
            continue
          }
          beginWhiteSpace(parser, c)
          continue

        case S.BEGIN_WHITESPACE:
          beginWhiteSpace(parser, c)
          continue

        case S.TEXT:
          if (parser.sawRoot && !parser.closedRoot) {
            var starti = i - 1
            while (c && c !== '<' && c !== '&') {
              c = charAt(chunk, i++)
              if (c && parser.trackPosition) {
                parser.position++
                if (c === '\n') {
                  parser.line++
                  parser.column = 0
                } else {
                  parser.column++
                }
              }
            }
            parser.textNode += chunk.substring(starti, i - 1)
          }
          if (c === '<' && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
            parser.state = S.OPEN_WAKA
            parser.startTagPosition = parser.position
          } else {
            if (!isWhitespace(c) && (!parser.sawRoot || parser.closedRoot)) {
              strictFail(parser, 'Text data outside of root node.')
            }
            if (c === '&') {
              parser.state = S.TEXT_ENTITY
            } else {
              parser.textNode += c
            }
          }
          continue

        case S.SCRIPT:
          // only non-strict
          if (c === '<') {
            parser.state = S.SCRIPT_ENDING
          } else {
            parser.script += c
          }
          continue

        case S.SCRIPT_ENDING:
          if (c === '/') {
            parser.state = S.CLOSE_TAG
          } else {
            parser.script += '<' + c
            parser.state = S.SCRIPT
          }
          continue

        case S.OPEN_WAKA:
          // either a /, ?, !, or text is coming next.
          if (c === '!') {
            parser.state = S.SGML_DECL
            parser.sgmlDecl = ''
          } else if (isWhitespace(c)) {
            // wait for it...
          } else if (isMatch(nameStart, c)) {
            parser.state = S.OPEN_TAG
            parser.tagName = c
          } else if (c === '/') {
            parser.state = S.CLOSE_TAG
            parser.tagName = ''
          } else if (c === '?') {
            parser.state = S.PROC_INST
            parser.procInstName = parser.procInstBody = ''
          } else {
            strictFail(parser, 'Unencoded <')
            // if there was some whitespace, then add that in.
            if (parser.startTagPosition + 1 < parser.position) {
              var pad = parser.position - parser.startTagPosition
              c = new Array(pad).join(' ') + c
            }
            parser.textNode += '<' + c
            parser.state = S.TEXT
          }
          continue

        case S.SGML_DECL:
          if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
            emitNode(parser, 'onopencdata')
            parser.state = S.CDATA
            parser.sgmlDecl = ''
            parser.cdata = ''
          } else if (parser.sgmlDecl + c === '--') {
            parser.state = S.COMMENT
            parser.comment = ''
            parser.sgmlDecl = ''
          } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
            parser.state = S.DOCTYPE
            if (parser.doctype || parser.sawRoot) {
              strictFail(parser,
                'Inappropriately located doctype declaration')
            }
            parser.doctype = ''
            parser.sgmlDecl = ''
          } else if (c === '>') {
            emitNode(parser, 'onsgmldeclaration', parser.sgmlDecl)
            parser.sgmlDecl = ''
            parser.state = S.TEXT
          } else if (isQuote(c)) {
            parser.state = S.SGML_DECL_QUOTED
            parser.sgmlDecl += c
          } else {
            parser.sgmlDecl += c
          }
          continue

        case S.SGML_DECL_QUOTED:
          if (c === parser.q) {
            parser.state = S.SGML_DECL
            parser.q = ''
          }
          parser.sgmlDecl += c
          continue

        case S.DOCTYPE:
          if (c === '>') {
            parser.state = S.TEXT
            emitNode(parser, 'ondoctype', parser.doctype)
            parser.doctype = true // just remember that we saw it.
          } else {
            parser.doctype += c
            if (c === '[') {
              parser.state = S.DOCTYPE_DTD
            } else if (isQuote(c)) {
              parser.state = S.DOCTYPE_QUOTED
              parser.q = c
            }
          }
          continue

        case S.DOCTYPE_QUOTED:
          parser.doctype += c
          if (c === parser.q) {
            parser.q = ''
            parser.state = S.DOCTYPE
          }
          continue

        case S.DOCTYPE_DTD:
          parser.doctype += c
          if (c === ']') {
            parser.state = S.DOCTYPE
          } else if (isQuote(c)) {
            parser.state = S.DOCTYPE_DTD_QUOTED
            parser.q = c
          }
          continue

        case S.DOCTYPE_DTD_QUOTED:
          parser.doctype += c
          if (c === parser.q) {
            parser.state = S.DOCTYPE_DTD
            parser.q = ''
          }
          continue

        case S.COMMENT:
          if (c === '-') {
            parser.state = S.COMMENT_ENDING
          } else {
            parser.comment += c
          }
          continue

        case S.COMMENT_ENDING:
          if (c === '-') {
            parser.state = S.COMMENT_ENDED
            parser.comment = textopts(parser.opt, parser.comment)
            if (parser.comment) {
              emitNode(parser, 'oncomment', parser.comment)
            }
            parser.comment = ''
          } else {
            parser.comment += '-' + c
            parser.state = S.COMMENT
          }
          continue

        case S.COMMENT_ENDED:
          if (c !== '>') {
            strictFail(parser, 'Malformed comment')
            // allow <!-- blah -- bloo --> in non-strict mode,
            // which is a comment of " blah -- bloo "
            parser.comment += '--' + c
            parser.state = S.COMMENT
          } else {
            parser.state = S.TEXT
          }
          continue

        case S.CDATA:
          if (c === ']') {
            parser.state = S.CDATA_ENDING
          } else {
            parser.cdata += c
          }
          continue

        case S.CDATA_ENDING:
          if (c === ']') {
            parser.state = S.CDATA_ENDING_2
          } else {
            parser.cdata += ']' + c
            parser.state = S.CDATA
          }
          continue

        case S.CDATA_ENDING_2:
          if (c === '>') {
            if (parser.cdata) {
              emitNode(parser, 'oncdata', parser.cdata)
            }
            emitNode(parser, 'onclosecdata')
            parser.cdata = ''
            parser.state = S.TEXT
          } else if (c === ']') {
            parser.cdata += ']'
          } else {
            parser.cdata += ']]' + c
            parser.state = S.CDATA
          }
          continue

        case S.PROC_INST:
          if (c === '?') {
            parser.state = S.PROC_INST_ENDING
          } else if (isWhitespace(c)) {
            parser.state = S.PROC_INST_BODY
          } else {
            parser.procInstName += c
          }
          continue

        case S.PROC_INST_BODY:
          if (!parser.procInstBody && isWhitespace(c)) {
            continue
          } else if (c === '?') {
            parser.state = S.PROC_INST_ENDING
          } else {
            parser.procInstBody += c
          }
          continue

        case S.PROC_INST_ENDING:
          if (c === '>') {
            emitNode(parser, 'onprocessinginstruction', {
              name: parser.procInstName,
              body: parser.procInstBody
            })
            parser.procInstName = parser.procInstBody = ''
            parser.state = S.TEXT
          } else {
            parser.procInstBody += '?' + c
            parser.state = S.PROC_INST_BODY
          }
          continue

        case S.OPEN_TAG:
          if (isMatch(nameBody, c)) {
            parser.tagName += c
          } else {
            newTag(parser)
            if (c === '>') {
              openTag(parser)
            } else if (c === '/') {
              parser.state = S.OPEN_TAG_SLASH
            } else {
              if (!isWhitespace(c)) {
                strictFail(parser, 'Invalid character in tag name')
              }
              parser.state = S.ATTRIB
            }
          }
          continue

        case S.OPEN_TAG_SLASH:
          if (c === '>') {
            openTag(parser, true)
            closeTag(parser)
          } else {
            strictFail(parser, 'Forward-slash in opening tag not followed by >')
            parser.state = S.ATTRIB
          }
          continue

        case S.ATTRIB:
          // haven't read the attribute name yet.
          if (isWhitespace(c)) {
            continue
          } else if (c === '>') {
            openTag(parser)
          } else if (c === '/') {
            parser.state = S.OPEN_TAG_SLASH
          } else if (isMatch(nameStart, c)) {
            parser.attribName = c
            parser.attribValue = ''
            parser.state = S.ATTRIB_NAME
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_NAME:
          if (c === '=') {
            parser.state = S.ATTRIB_VALUE
          } else if (c === '>') {
            strictFail(parser, 'Attribute without value')
            parser.attribValue = parser.attribName
            attrib(parser)
            openTag(parser)
          } else if (isWhitespace(c)) {
            parser.state = S.ATTRIB_NAME_SAW_WHITE
          } else if (isMatch(nameBody, c)) {
            parser.attribName += c
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_NAME_SAW_WHITE:
          if (c === '=') {
            parser.state = S.ATTRIB_VALUE
          } else if (isWhitespace(c)) {
            continue
          } else {
            strictFail(parser, 'Attribute without value')
            parser.tag.attributes[parser.attribName] = ''
            parser.attribValue = ''
            emitNode(parser, 'onattribute', {
              name: parser.attribName,
              value: ''
            })
            parser.attribName = ''
            if (c === '>') {
              openTag(parser)
            } else if (isMatch(nameStart, c)) {
              parser.attribName = c
              parser.state = S.ATTRIB_NAME
            } else {
              strictFail(parser, 'Invalid attribute name')
              parser.state = S.ATTRIB
            }
          }
          continue

        case S.ATTRIB_VALUE:
          if (isWhitespace(c)) {
            continue
          } else if (isQuote(c)) {
            parser.q = c
            parser.state = S.ATTRIB_VALUE_QUOTED
          } else {
            strictFail(parser, 'Unquoted attribute value')
            parser.state = S.ATTRIB_VALUE_UNQUOTED
            parser.attribValue = c
          }
          continue

        case S.ATTRIB_VALUE_QUOTED:
          if (c !== parser.q) {
            if (c === '&') {
              parser.state = S.ATTRIB_VALUE_ENTITY_Q
            } else {
              parser.attribValue += c
            }
            continue
          }
          attrib(parser)
          parser.q = ''
          parser.state = S.ATTRIB_VALUE_CLOSED
          continue

        case S.ATTRIB_VALUE_CLOSED:
          if (isWhitespace(c)) {
            parser.state = S.ATTRIB
          } else if (c === '>') {
            openTag(parser)
          } else if (c === '/') {
            parser.state = S.OPEN_TAG_SLASH
          } else if (isMatch(nameStart, c)) {
            strictFail(parser, 'No whitespace between attributes')
            parser.attribName = c
            parser.attribValue = ''
            parser.state = S.ATTRIB_NAME
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_VALUE_UNQUOTED:
          if (!isAttribEnd(c)) {
            if (c === '&') {
              parser.state = S.ATTRIB_VALUE_ENTITY_U
            } else {
              parser.attribValue += c
            }
            continue
          }
          attrib(parser)
          if (c === '>') {
            openTag(parser)
          } else {
            parser.state = S.ATTRIB
          }
          continue

        case S.CLOSE_TAG:
          if (!parser.tagName) {
            if (isWhitespace(c)) {
              continue
            } else if (notMatch(nameStart, c)) {
              if (parser.script) {
                parser.script += '</' + c
                parser.state = S.SCRIPT
              } else {
                strictFail(parser, 'Invalid tagname in closing tag.')
              }
            } else {
              parser.tagName = c
            }
          } else if (c === '>') {
            closeTag(parser)
          } else if (isMatch(nameBody, c)) {
            parser.tagName += c
          } else if (parser.script) {
            parser.script += '</' + parser.tagName
            parser.tagName = ''
            parser.state = S.SCRIPT
          } else {
            if (!isWhitespace(c)) {
              strictFail(parser, 'Invalid tagname in closing tag')
            }
            parser.state = S.CLOSE_TAG_SAW_WHITE
          }
          continue

        case S.CLOSE_TAG_SAW_WHITE:
          if (isWhitespace(c)) {
            continue
          }
          if (c === '>') {
            closeTag(parser)
          } else {
            strictFail(parser, 'Invalid characters in closing tag')
          }
          continue

        case S.TEXT_ENTITY:
        case S.ATTRIB_VALUE_ENTITY_Q:
        case S.ATTRIB_VALUE_ENTITY_U:
          var returnState
          var buffer
          switch (parser.state) {
            case S.TEXT_ENTITY:
              returnState = S.TEXT
              buffer = 'textNode'
              break

            case S.ATTRIB_VALUE_ENTITY_Q:
              returnState = S.ATTRIB_VALUE_QUOTED
              buffer = 'attribValue'
              break

            case S.ATTRIB_VALUE_ENTITY_U:
              returnState = S.ATTRIB_VALUE_UNQUOTED
              buffer = 'attribValue'
              break
          }

          if (c === ';') {
            if (parser.opt.unparsedEntities) {
              var parsedEntity = parseEntity(parser)
              parser.entity = ''
              parser.state = returnState
              parser.write(parsedEntity)
            } else {
              parser[buffer] += parseEntity(parser)
              parser.entity = ''
              parser.state = returnState
            }
          } else if (isMatch(parser.entity.length ? entityBody : entityStart, c)) {
            parser.entity += c
          } else {
            strictFail(parser, 'Invalid character in entity name')
            parser[buffer] += '&' + parser.entity + c
            parser.entity = ''
            parser.state = returnState
          }

          continue

        default: /* istanbul ignore next */ {
          throw new Error(parser, 'Unknown state: ' + parser.state)
        }
      }
    } // while

    if (parser.position >= parser.bufferCheckPosition) {
      checkBufferLength(parser)
    }
    return parser
  }

  /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
  /* istanbul ignore next */
  if (!String.fromCodePoint) {
    (function () {
      var stringFromCharCode = String.fromCharCode
      var floor = Math.floor
      var fromCodePoint = function () {
        var MAX_SIZE = 0x4000
        var codeUnits = []
        var highSurrogate
        var lowSurrogate
        var index = -1
        var length = arguments.length
        if (!length) {
          return ''
        }
        var result = ''
        while (++index < length) {
          var codePoint = Number(arguments[index])
          if (
            !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
            codePoint < 0 || // not a valid Unicode code point
            codePoint > 0x10FFFF || // not a valid Unicode code point
            floor(codePoint) !== codePoint // not an integer
          ) {
            throw RangeError('Invalid code point: ' + codePoint)
          }
          if (codePoint <= 0xFFFF) { // BMP code point
            codeUnits.push(codePoint)
          } else { // Astral code point; split in surrogate halves
            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            codePoint -= 0x10000
            highSurrogate = (codePoint >> 10) + 0xD800
            lowSurrogate = (codePoint % 0x400) + 0xDC00
            codeUnits.push(highSurrogate, lowSurrogate)
          }
          if (index + 1 === length || codeUnits.length > MAX_SIZE) {
            result += stringFromCharCode.apply(null, codeUnits)
            codeUnits.length = 0
          }
        }
        return result
      }
      /* istanbul ignore next */
      if (Object.defineProperty) {
        Object.defineProperty(String, 'fromCodePoint', {
          value: fromCodePoint,
          configurable: true,
          writable: true
        })
      } else {
        String.fromCodePoint = fromCodePoint
      }
    }())
  }
})(typeof exports === 'undefined' ? this.sax = {} : exports)

}).call(this)}).call(this,require("buffer").Buffer)

},{"buffer":false,"stream":false,"string_decoder":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/LeafletInfoService.js":[function(require,module,exports){
const {createGTIN_SSI} = require("./../GTIN_SSI");
const LeafletFeatureManager = require("./../LeafletFeatureManager");
const constants = require("../constants/constants");
const versionTransformerUtils = require("../EpiVersionTransformer");
const utils = require("../utils/CommonUtils");
const openDSU = require("opendsu");
const resolver = openDSU.loadAPI("resolver");

class LeafletInfoService {
  constructor(gs1Fields, networkName, epiProtocolVersion) {
    this.gs1Fields = gs1Fields;
    this.gtin = gs1Fields.gtin;
    this.batch = gs1Fields.batchNumber;
    this.networkName = networkName;
    this.gtinSSI = this.getLeafletGtinSSI();
    this.epiProtocolVersion = epiProtocolVersion;
  }

  static async init(gs1Fields, networkName) {
    let epiProtocolVersion = await LeafletFeatureManager.getEpiProtocolVersion();
    return new LeafletInfoService(gs1Fields, networkName, epiProtocolVersion);
  }

  getLeafletGtinSSI = () => {
    let gtinSSI = createGTIN_SSI(this.networkName, undefined, this.gtin, this.batch);
    return gtinSSI;
  }

  checkBatchAnchorExists(callback) {
    let anchorCheckTimeoutFlag = false;
    setTimeout(() => {
      if (!anchorCheckTimeoutFlag) {
        anchorCheckTimeoutFlag = true;
        return callback(undefined, false);
      }
    }, constants.ANCHOR_CHECK_TIMEOUT)
    resolver.loadDSU(this.gtinSSI.getIdentifier(), (err) => {
      if (anchorCheckTimeoutFlag) {
        return;
      }
      anchorCheckTimeoutFlag = true;
      if (err) {
        return callback(undefined, false);
      }
      callback(undefined, true);
    });
  }

  checkConstProductDSUExists(callback) {
    let anchorCheckTimeoutFlag = false;
    setTimeout(() => {
      if (!anchorCheckTimeoutFlag) {
        anchorCheckTimeoutFlag = true;
        return callback(undefined, false);
      }
    }, constants.ANCHOR_CHECK_TIMEOUT)
    //this is called in gtin only case (batch not found)
    this.gtinSSI = createGTIN_SSI(this.networkName, undefined, this.gtin);
    resolver.loadDSU(this.gtinSSI.getIdentifier(), (err) => {
      if (anchorCheckTimeoutFlag) {
        return;
      }
      anchorCheckTimeoutFlag = true;
      if (err) {
        return callback(undefined, false);
      }
      callback(undefined, true);
    });
  }

  readProductData(callback) {
    const gtinSSI = createGTIN_SSI(this.networkName, undefined, this.gtin);
    resolver.loadDSU(gtinSSI, async (err, dsu) => {
      if (err) {
        return callback(err);
      }
      try {
        let productData = await $$.promisify(dsu.readFile)(versionTransformerUtils.getProductPath(this.epiProtocolVersion));
        if (typeof productData === "undefined") {
          return callback(Error(`Product data is undefined.`));
        }
        productData = JSON.parse(productData.toString());
        try {
          let imgFile = await $$.promisify(dsu.readFile)(versionTransformerUtils.getProductImagePath(this.epiProtocolVersion));
          productData.productPhoto = utils.getImageAsBase64(imgFile)
        } catch (err) {
          productData.productPhoto = constants.HISTORY_ITEM_DEFAULT_ICON;
        }
        callback(undefined, productData);
      } catch (err) {
        return callback(err);
      }
    });
  }

  readBatchData(callback) {
    resolver.loadDSU(this.gtinSSI, (err, dsu) => {
      if (err) {
        return callback(err);
      }
      dsu.readFile(versionTransformerUtils.getBatchPath(this.epiProtocolVersion), (err, batchData) => {
        if (err) {
          return callback(err);
        }
        if (typeof batchData === "undefined") {
          return callback(Error(`Batch data is undefined`));
        }
        batchData = JSON.parse(batchData.toString());
        callback(undefined, batchData);
      });
    });
  }

  async disableFeatures(model) {
    let disabledFeatures = await LeafletFeatureManager.getLeafletDisabledFeatures();
    if (!disabledFeatures || disabledFeatures.length === 0) {
      return;
    }
    let disabledFeaturesKeys = [];
    disabledFeatures.forEach(code => {
      disabledFeaturesKeys = disabledFeaturesKeys.concat(constants.DISABLED_FEATURES_MAP[code].modelProperties);

    });
    Object.keys(model).forEach(key => {
      if (disabledFeaturesKeys.find(item => item === key)) {
        model[key] = null;
      }
    })
  }

  getBatchClientModel = async () => {
    let self = this;
    return new Promise(function (resolve, reject) {
      self.readBatchData(async (err, batchModel) => {
        if (err) {
          return reject(err);
        }
        if (typeof batchModel === "undefined") {
          return reject(new Error("Could not find batch"));
        }
        if (`v${self.epiProtocolVersion}` === batchModel.epiProtocol) {
          await self.disableFeatures(batchModel);
          return resolve(batchModel)
        } else {
          // TO DO: transform model to this.epiProtocolVersion
          return reject(new Error(`Version incompatibility. Current version is ${self.epiProtocolVersion} and dsu version is ${batchModel.epiProtocol}`));
        }

      })
    })
  }

  getProductClientModel = async () => {
    let self = this;
    return new Promise(function (resolve, reject) {
      self.readProductData(async (err, productModel) => {
        if (err) {
          return reject(err);
        }
        if (typeof productModel === "undefined") {
          return reject(new Error("Could not find batch"));
        }
        if (`v${self.epiProtocolVersion}` === productModel.epiProtocol) {
          await self.disableFeatures(productModel)
          return resolve(productModel)
        } else {
          // TO DO: transform model to this.epiProtocolVersion
          return reject(new Error(`Version incompatibility. Current version is ${self.epiProtocolVersion} and dsu version is ${productModel.epiProtocol}`));
        }
      })
    })
  }

  leafletShouldBeDisplayed(model, expiryCheck, currentTime) {
    let batchData = model.batch;
    let snCheck = model.snCheck;
    let expiryTime = model.expiryTime;

    if (batchData.serialCheck && !snCheck.validSerial && !snCheck.recalledSerial && !snCheck.decommissionedSerial ) {
      return true;
    }

    if (batchData.serialCheck && typeof model.serialNumber === "undefined" ) {
      return true;
    }

    if (batchData.serialCheck && snCheck.recalledSerial ) {
      return true;
    }

    if (batchData.serialCheck && snCheck.decommissionedSerial ) {
      return true;
    }

    if (!batchData.expiredDateCheck && !batchData.incorrectDateCheck && !batchData.serialCheck) {
      return true;
    }

    if (batchData.expiredDateCheck && currentTime < expiryTime && !batchData.incorrectDateCheck && !batchData.serialCheck) {
      return true;
    }

    if (batchData.expiredDateCheck && expiryTime < currentTime && !batchData.incorrectDateCheck && !batchData.serialCheck) {
      return true;
    }

    if (batchData.incorrectDateCheck && !expiryCheck && !batchData.serialCheck && !batchData.serialCheck) {
      return true;
    }

    if (!batchData.expiredDateCheck && batchData.incorrectDateCheck && expiryCheck && !batchData.serialCheck) {
      return true;
    }

    if (batchData.expiredDateCheck && currentTime < expiryTime && batchData.incorrectDateCheck && expiryCheck && !batchData.serialCheck) {
      return true;
    }

    if (batchData.expiredDateCheck && expiryTime < currentTime && batchData.incorrectDateCheck && expiryCheck && !batchData.serialCheck) {
      return true;
    }

    if (batchData.expiredDateCheck && currentTime < expiryTime && !batchData.incorrectDateCheck && batchData.serialCheck && snCheck.validSerial) {
      return true;
    }

    if (batchData.expiredDateCheck && expiryTime < currentTime && !batchData.incorrectDateCheck && batchData.serialCheck && snCheck.validSerial) {
      return true;
    }

    if (batchData.expiredDateCheck && currentTime < expiryTime && batchData.incorrectDateCheck && expiryCheck && batchData.serialCheck && snCheck.validSerial && batchData.recalled ) {
      return true;
    }

    if (batchData.expiredDateCheck && currentTime < expiryTime && batchData.incorrectDateCheck && expiryCheck && batchData.serialCheck && snCheck.validSerial && !batchData.recalled) {
      return true;
    }

    if (batchData.expiredDateCheck && expiryTime < currentTime && batchData.incorrectDateCheck && expiryCheck
      && batchData.serialCheck && snCheck.validSerial) {
      return true;
    }

    if (batchData.incorrectDateCheck && !expiryCheck && batchData.serialCheck && snCheck.validSerial) {
      return true;
    }

    if (!batchData.expiredDateCheck && !batchData.incorrectDateCheck && batchData.serialCheck && snCheck.validSerial) {
      return true;
    }

    if (!batchData.expiredDateCheck && batchData.incorrectDateCheck && expiryCheck && batchData.serialCheck && snCheck.validSerial) {
      return true;
    }

    return false;
  }
}

module.exports = LeafletInfoService;



},{"../EpiVersionTransformer":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/EpiVersionTransformer.js","../constants/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","../utils/CommonUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/CommonUtils.js","./../GTIN_SSI":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/GTIN_SSI.js","./../LeafletFeatureManager":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/LeafletFeatureManager.js","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/LogService.js":[function(require,module,exports){
const constants = require('../constants/constants');

module.exports = class LogService {

  constructor(logsTable) {
    if (typeof logsTable === "undefined") {
      this.logsTable = constants.LOGS_TABLE;
    } else {
      this.logsTable = logsTable;
    }
  }

  log(logDetails, callback) {
    if (logDetails === null || logDetails === undefined) {
      return;
    }

    let log = {
      ...logDetails,
      timestamp: logDetails.timestamp || new Date().getTime()
    };

    try {
      log.itemCode = logDetails.itemCode || logDetails.metadata.gtin || "unknown";
    } catch (e) {
      log.itemCode = "unknown"
    }
    return this.persistLog(log, callback)

  }

  loginLog(logDetails, callback) {
    let log = {
      ...logDetails,
      logISODate: new Date().toISOString()
    };
    this.getSharedStorage((err, storageService) => {
        if (err) {
            return callback(err);
        }

        storageService.startOrAttachBatch(async (err, batchId) => {
            if (err) {
                return callback(err);
            }
            let syncError = true;
            try{
                this.persistLog(log, (err) => {
                    syncError = false;
                    if (err) {
                        return callback(err);
                    }
                    storageService.commitBatch(batchId, err => {
                        if (err) {
                            return callback(err);
                        }
                        callback(undefined, log);
                    })
                 })
            }catch(err){
                if(syncError){
                    const persistSyncError = createOpenDSUErrorWrapper(`Failed to persist log. Sync error thrown`, err);
                    try{
                        await storageService.cancelBatchAsync(batchId);
                    } catch (e) {
                        return callback(createOpenDSUErrorWrapper(`Failed to cancel batch`, e, persistSyncError));
                    }

                    return callback(persistSyncError);
                }

                callback(err);
            }
        })
    })
  }

  getLogs(callback) {
    this.getSharedStorage((err, storageService) => {
      if (err) {
        return callback(err);
      }
      storageService.filter(this.logsTable, "__timestamp > 0", callback);
    });
  }

  persistLog(log, callback) {
    this.getSharedStorage(async (err, storageService) => {
      if (err) {
        return callback(err);
      }

      const crypto = require("opendsu").loadAPI("crypto");
      if(!log.pk){
        log.pk = crypto.encodeBase58(crypto.generateRandom(32));
      }else{
        try{
          let record = await $$.promisify(storageService.getRecord, storageService)(log.pk);
          if(record){
            return callback(undefined, record);
          }
        }catch(err){
          //ignorable
        }
      }
      let batchId = await storageService.startOrAttachBatchAsync();
      storageService.insertRecord(this.logsTable, log.pk, log, async (err) => {
        if (err) {
          console.warn(`Caught an error ${err}`);
          try{
            await storageService.cancelBatchAsync(batchId);
          }catch(e){
            //nothing to do if we fail to cancel
          }
          return callback(err);
        }
        try{
          await storageService.commitBatchAsync(batchId);
        }catch(err){
          console.error("This case need developer attention", err);
          return callback(err);
        }

        callback(undefined, log);
      })
    })
  }

  getSharedStorage(callback) {
    if (typeof this.storageService !== "undefined") {
      return callback(undefined, this.storageService);
    }
    const openDSU = require("opendsu");
    const scAPI = openDSU.loadAPI("sc");
    scAPI.getSharedEnclave((err, sharedEnclave) => {
      if (err) {
        return callback(err);
      }
        sharedEnclave.addIndex(this.logsTable, "__timestamp", (error) => {
          if (error) {
            return callback(error);
          }
          sharedEnclave.addIndex(this.logsTable, "auditId", (error) => {
            if (error) {
              return callback(error);
            }
            this.storageService = sharedEnclave;
            callback(undefined, this.storageService)
        });
      })
    });
  }
}

},{"../constants/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/MessageQueuingService.js":[function(require,module,exports){
function MessageQueuingService() {

  this.getNextMessagesBlock = function (messages, callback) {

    let productsInQueue = [];
    let batchesInQueue = [];
    let queue = [];

    let letQueuePass = () => {
      if (!queue.length) {
        queue = messages;
      }
      callback(undefined, queue);
    }

    for (let i = 0; i < messages.length; i++) {
      let message = messages[i];
      let productCode, batchNumber;
      try {
        switch (true) {
          case message.messageType.toLowerCase() === "product":
            productCode = message.product.productCode;
            if (productsInQueue.indexOf(productCode) === -1) {
              productsInQueue.push(productCode);
              queue.push(message);
            } else {
              return letQueuePass();
            }
            break;
          case message.messageType.toLowerCase() === "batch":
            productCode = message.batch.productCode;
            batchNumber = message.batch.batch;
            if (productsInQueue.indexOf(productCode) === -1 && batchesInQueue.indexOf(batchNumber) === -1) {
              productsInQueue.push(productCode);
              batchesInQueue.push(batchNumber);
              queue.push(message);
            } else {
              return letQueuePass();
            }
            break;
          case ["productphoto", "leaflet", "smpc"].indexOf(message.messageType.toLowerCase()) !== -1:
            let itemCode, searchQueue;
            //if both productcode and bachcode on message - means it's a batch leaflet or smpc
            //if just productcode on message - means it's a product leaflet/smpc or productphoto
            if (message.productCode) {
              itemCode = message.productCode;
              searchQueue = productsInQueue;

              if (message.batchCode) {
                itemCode = message.batchCode;
                searchQueue = batchesInQueue;
              }

              if (searchQueue.indexOf(itemCode) === -1) {
                searchQueue.push(itemCode);
                queue.push(message);
              } else {
                return letQueuePass();
              }

            }
            break;
          default:
            queue.push(message);
            return letQueuePass();
        }
      } catch (e) {
        queue.push(message);
        return letQueuePass();
      }


    }
    letQueuePass();
  }

}

let instance = null;
module.exports.getMessageQueuingServiceInstance = () => {

  if (!instance) {
    instance = new MessageQueuingService();
  }

  return instance;
}

},{}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/ModelMessageService.js":[function(require,module,exports){
const modelToMessageMap = {
  "product": {
    name: "inventedName",
    gtin: "productCode",
    description: "nameMedicinalProduct",
    manufName: "manufName",
    reportURL: function (param) {
      if (param.direction === "toMsg") {
        return "adverseEventReportingURL"
      }
      if (typeof window !== "undefined" && window.top) {
        param.obj['reportURL'] = `${window.top.location.origin}/default-report.html`;
      }
      param.obj['reportURL'] = param.msg["adverseEventReportingURL"];
    },
    antiCounterfeitingURL: function (param) {
      if (param.direction === "toMsg") {
        return "acfProductCheckURL"
      }
      if (typeof window !== "undefined" && window.top) {
        param.obj['antiCounterfeitingURL'] = `${window.top.location.origin}/default-anti-counterfeiting.html`;
      }
      param.obj['antiCounterfeitingURL'] = param.msg["acfProductCheckURL"];
    },
    adverseEventsReportingEnabled: "flagEnableAdverseEventReporting",
    antiCounterfeitingEnabled: "flagEnableACFProductCheck",
    practitionerInfo: function (param) {
      if (param.direction === "toMsg") {
        return "healthcarePractitionerInfo"
      }
      param.obj["practitionerInfo"] = param.msg["healthcarePractitionerInfo"] || "SmPC";

    },
    patientLeafletInfo: function (param) {
      if (param.direction === "toMsg") {
        return "patientSpecificLeaflet"
      }
      param.obj["patientLeafletInfo"] = param.msg["patientSpecificLeaflet"] || "Patient Information";
    },
    markets: "markets",
    internalMaterialCode: "internalMaterialCode",
    strength: "strength",
  },
  "batch": {
    gtin: "productCode",
    batchNumber: "batch",
    expiry: function (param) {
      if (param.direction === "toMsg") {
        return "expiryDate"
      }
      param.obj['expiry'] = param.msg["expiryDate"];
      try {
        const y = param.msg.expiryDate.slice(0, 2);
        const m = param.msg.expiryDate.slice(2, 4);
        let d = param.msg.expiryDate.slice(4, 6);
        const lastMonthDay = ("0" + new Date(y, m, 0).getDate()).slice(-2);
        if (d === '00') {
          param.obj.enableExpiryDay = false;
          d = lastMonthDay;
        } else {
          param.obj.enableExpiryDay = true;
        }
        const localDate = new Date(Date.parse(m + '/' + d + '/' + y));
        const gmtDate = new Date(localDate.getFullYear() + '-' + m + '-' + d + 'T00:00:00Z');
        param.obj.expiryForDisplay = gmtDate.getTime();
      } catch (e) {
        throw new Error(`${param.msg.expiryDate} date is invalid`, e);
      }
    },
    serialNumbers: "snValid",
    recalledSerialNumbers: "snRecalled",
    decommissionedSerialNumbers: function (param) {
      if (param.direction === "toMsg") {
        return param.obj.decommissionReason ? "snDecom " + param.obj.decommissionReason : "snDecom";
      }
      const decomKey = Object.keys(param.msg).find((key) => key.includes("snDecom"));
      if (!decomKey) {
        return
      }
      const keyArr = decomKey.split(" ");
      if (keyArr.length === 2) {
        param.obj.decommissionReason = keyArr[1];
      } else {
        param.obj.decommissionReason = "unknown";
      }
      param.obj.decommissionedSerialNumbers = param.msg[decomKey];
    },
    recalled: "flagEnableBatchRecallMessage",
    serialCheck: "flagEnableSNVerification",
    incorrectDateCheck: "flagEnableEXPVerification",
    expiredDateCheck: "flagEnableExpiredEXPCheck",
    recalledMessage: "recallMessage",
    defaultMessage: "batchMessage",
    packagingSiteName: "packagingSiteName",
    flagEnableACFBatchCheck: "flagEnableACFBatchCheck",
    // ACDC PATCH START
    acdcAuthFeatureSSI: "acdcAuthFeatureSSI",
    // ACDC PATCH END
    acfBatchCheckURL: "acfBatchCheckURL",
    snValidReset: "snValidReset",
    snRecalledReset: "snRecalledReset",
    snDecomReset: "snDecomReset"
  }
}

class ModelMessageService {
  constructor(type) {
    this.type = type;
  }

  getModelFromMessage(messageObj) {
    let destinationObj = {};
    let mappingObj = modelToMessageMap[this.type]
    for (let prop in mappingObj) {
      if (typeof mappingObj[prop] === "function") {
        mappingObj[prop]({direction: "fromMsg", "obj": destinationObj, "msg": messageObj});
      } else {
        destinationObj[prop] = messageObj[mappingObj[prop]];
      }
    }
    return destinationObj;
  }

  getMessageFromModel(sourceObj) {
    let messageObj = {};
    let mappingObj = modelToMessageMap[this.type]
    for (let prop in mappingObj) {
      if (sourceObj[prop] !== "undefined") {
        if (typeof mappingObj[prop] === "function") {
          messageObj[mappingObj[prop]({direction: "toMsg", "obj": sourceObj, "msg": messageObj})] = sourceObj[prop];
        } else {
          messageObj[mappingObj[prop]] = sourceObj[prop];
        }
      }
    }
    return messageObj;
  }
}


module.exports = ModelMessageService;

},{}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/NodeDSUStorage.js":[function(require,module,exports){
class NodeDSUStorage {
  constructor(walletSSI) {
    this.directAccessEnabled = false;

    if (!walletSSI) {
      throw new Error("Wallet SSI was not provided in constructor of NodeDSUStorage!")
    }

    this.walletSSI = walletSSI;
  }

  enableDirectAccess(callback) {
    let self = this;

    function addFunctionsFromMainDSU() {
      if (!self.directAccessEnabled) {

        let availableFunctions = [
          "addFile",
          "addFiles",
          "addFolder",
          "appendToFile",
          "createFolder",
          "delete",
          "extractFile",
          "extractFolder",
          "getArchiveForPath",
          "getCreationSSI",
          "getKeySSI",
          "listFiles",
          "listFolders",
          "mount",
          "readDir",
          "readFile",
          "rename",
          "unmount",
          "writeFile",
          "listMountedDSUs",
          "beginBatch",
          "commitBatch",
          "cancelBatch"
        ];
        let getDSU = (err, mainDSU) => {
          if (err) {
            return callback(err);
          }
          try {
            for (let f of availableFunctions) {
              self[f] = mainDSU[f];
            }
            self.directAccessEnabled = true;
            callback(undefined, true);
          } catch (err) {
            return callback(err);
          }

        }
        if (self.walletSSI) {
          let resolver = require("opendsu").loadAPI("resolver");
          return resolver.loadDSU(self.walletSSI, getDSU);
        }
        let sc = require("opendsu").loadAPI("sc");
        sc.getMainDSU(getDSU)
      } else {
        callback(undefined, true);
      }
    }

    addFunctionsFromMainDSU();
  }

  setObject(path, data, callback) {
    try {
      let dataSerialized = JSON.stringify(data);
      this.setItem(path, dataSerialized, callback)
    } catch (e) {
      callback(createOpenDSUErrorWrapper("setObject failed", e));
    }
  }

  getObject(path, callback) {
    this.getItem(path, "json", function (err, res) {
      if (err || !res) {
        return callback(undefined, undefined);
      }
      callback(undefined, res);
    })
  }

  setItem(path, data, callback) {
    this.writeFile(path, data, callback);
  }

  getItem(path, expectedResultType, callback) {
    if (typeof expectedResultType === "function") {
      callback = expectedResultType;
      expectedResultType = "arrayBuffer";
    }
    try {
      this.readFile(path, function (err, res) {
        if (err) {
          return callback(err);
        }
        try {
          if (expectedResultType == "json") {
            res = JSON.parse(res.toString());
          }
        } catch (err) {
          return callback(err);
        }
        callback(undefined, res);
      })
    } catch (e) {
      return callback(e);
    }

  }

  uploadFile(path, file, options, callback) {
    doFileUpload(...arguments);
  }

  uploadMultipleFiles(path, files, options, callback) {
    doFileUpload(...arguments);
  }

  deleteObjects(objects, callback) {
    performRemoval(objects, callback);
  }

  removeFile(filePath, callback) {
    console.log("[Warning] - obsolete. Use DSU.deleteObjects");
    performRemoval([filePath], callback);
  }

  removeFiles(filePathList, callback) {
    console.log("[Warning] - obsolete. Use DSU.deleteObjects");
    performRemoval(filePathList, callback);
  }
}

let instances = {};
module.exports = {
  getInstance: function (walletSSI) {
    if (!instances[walletSSI]) {
      instances[walletSSI] = module.exports.createInstance(walletSSI);
    }
    return instances[walletSSI];
  },
  createInstance: function (walletSSI) {
    let instance;
    switch ($$.environmentType) {
      case "nodejs":
        instance = new NodeDSUStorage(walletSSI);
        break;
      default:
        throw new Error('DSU Storage is not implemented for this <${$$.environmentType}> env!');
    }
    return instance;
  }
};

},{"opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/SharedDBStorageService.js":[function(require,module,exports){
const CREDENTIAL_FILE_PATH = "/myKeys/credential.json";

class SharedStorage {
  constructor(dsuStorage) {
    const openDSU = require("opendsu");
    const dbAPI = openDSU.loadAPI("db");
    const scAPI = openDSU.loadAPI("sc");
    dsuStorage.getObject("/environment.json", async (err, env) => {
      const mainDSU = await $$.promisify(scAPI.getMainDSU)();
      await $$.promisify(mainDSU.writeFile)(
        "/environment.json",
        JSON.stringify(env)
      );
      await $$.promisify(mainDSU.refresh)();
      scAPI.setMainDSU(mainDSU);
      scAPI.refreshSecurityContext();
      dbAPI.getSharedEnclaveDB((err, enclaveDB) => {
        if (err) {
          return console.log(err);
        }
        this.mydb = enclaveDB;
        this.DSUStorage = dsuStorage;
      });
    });
  }

  waitForDb(func, args) {
    if (typeof args === "undefined") {
      args = [];
    }
    func = func.bind(this);
    setTimeout(function () {
      func(...args);
    }, 10);
  }

  dbReady() {
    return this.mydb !== undefined && this.mydb !== "initialising";
  }

  filter(tableName, query, sort, limit, callback) {
    if (this.dbReady()) {
      this.mydb.filter(tableName, query, sort, limit, callback);
    } else {
      this.waitForDb(this.filter, [tableName, query, sort, limit, callback]);
    }
  }

  addSharedFile() {
    throw Error("Not implemented");
  }

  addIndex(tableName, field, callback) {
    if (this.dbReady()) {
      this.mydb.addIndex(tableName, field, callback);
    } else {
      this.waitForDb(this.addIndex, [tableName, field, callback]);
    }
  }

  getRecord(tableName, key, callback) {
    if (this.dbReady()) {
      this.mydb.getRecord(tableName, key, callback);
    } else {
      this.waitForDb(this.getRecord, [tableName, key, callback]);
    }
  }

  insertRecord(tableName, key, record, callback) {
    if (this.dbReady()) {
      this.mydb.insertRecord(tableName, key, record, callback);
    } else {
      this.waitForDb(this.insertRecord, [tableName, key, record, callback]);
    }
  }

  updateRecord(tableName, key, record, callback) {
    if (this.dbReady()) {
      this.mydb.updateRecord(tableName, key, record, callback);
    } else {
      this.waitForDb(this.updateRecord, [tableName, key, record, callback]);
    }
  }

  beginBatch() {
    if (this.dbReady()) {
      this.mydb.beginBatch();
    } else {
      this.waitForDb(this.beginBatch);
    }
  }

  cancelBatch(callback) {
    if (this.dbReady()) {
      this.mydb.cancelBatch(callback);
    } else {
      this.waitForDb(this.cancelBatch, [callback]);
    }
  }

  commitBatch(callback) {
    if (this.dbReady()) {
      this.mydb.commitBatch(callback);
    } else {
      this.waitForDb(this.commitBatch, [callback]);
    }
  }

  getSharedSSI(callback) {
    this.DSUStorage.getObject(CREDENTIAL_FILE_PATH, (err, credential) => {
      if (err || !credential) {
        return callback(createOpenDSUErrorWrapper("Invalid credentials", err));
      } else {
        const crypto = require("opendsu").loadApi("crypto");
        const keyssi = require("opendsu").loadApi("keyssi");
        crypto.parseJWTSegments(
          credential.credential,
          (parseError, jwtContent) => {
            if (parseError) {
              return callback(
                createOpenDSUErrorWrapper(
                  "Error parsing user credential:",
                  parseError
                )
              );
            }
            callback(undefined, keyssi.parse(jwtContent.body.iss));
          }
        );
      }
    });
  }
}

module.exports.getSharedStorage = function (dsuStorage) {
  if (typeof sharedStorageSingleton === "undefined") {
    sharedStorageSingleton = new SharedStorage(dsuStorage);
  }
  return sharedStorageSingleton;
};

let instances = {};

module.exports.getSharedStorageInstance = function (dsuStorage) {
  if (!dsuStorage.walletSSI) {
    return module.exports.getSharedStorage(dsuStorage);
  }
  if (!instances[dsuStorage.walletSSI]) {
    instances[dsuStorage.walletSSI] = new SharedStorage(dsuStorage);
  }
  return instances[dsuStorage.walletSSI];
};

module.exports.getPromisifiedSharedObject = function (dsuStorage) {
  const instance = module.exports.getSharedStorageInstance(dsuStorage);
  const promisifyFns = [
    "addSharedFile",
    "cancelBatch",
    "commitBatch",
    "filter",
    "getRecord",
    "getSharedSSI",
    "insertRecord",
    "updateRecord",
    "addIndex"
  ];
  for (let i = 0; i < promisifyFns.length; i++) {
    let prop = promisifyFns[i];
    if (typeof instance[prop] === "function") {
      instance[prop] = $$.promisify(instance[prop].bind(instance));
    }
  }
  return instance;
};

},{"opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/XMLDisplayService/Acodis_StyleSheet.js":[function(require,module,exports){
const acordisXslContent = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="urn:hl7-org:v3"
                xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="urn:hl7-org:v3 https://www.accessdata.fda.gov/spl/schema/spl.xsd">

    <xsl:output method="html" version="1.0"
                encoding="UTF-8" indent="yes" doctype-public="-//W3C//DTD XHTML 1.1//EN"/>

    <!--setting identity transformation-->
    <xsl:template match="@*|node()">
        <xsl:copy>
            <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="document">
            <div><xsl:apply-templates select="@*|node()"/></div>
    </xsl:template>
    
    <xsl:param name="quote">"</xsl:param>
    <xsl:param name="space">\\0020</xsl:param>
    <xsl:template match="//ul">
        <ul> <xsl:apply-templates select="node()" /></ul>
    </xsl:template>

    <xsl:template match="//ul/li">
        <li>
          <xsl:attribute name="style"> list-style-type: <xsl:value-of select="$quote"/><xsl:value-of select="@data-enum"/><xsl:value-of select="$space"/><xsl:value-of select="$quote"/>; </xsl:attribute>
        <xsl:apply-templates select="node()" /></li>
    </xsl:template>

    <xsl:template match="//ol">
        <ol><xsl:apply-templates select="node()" /></ol>
    </xsl:template>

    <xsl:template match="//ol/li">
        <li>
         <xsl:attribute name="style"> list-style-type: <xsl:value-of select="$quote"/><xsl:value-of select="@data-enum"/><xsl:value-of select="$space"/><xsl:value-of select="$quote"/>; </xsl:attribute>
        <xsl:apply-templates select="node()" /></li>
    </xsl:template>

    <xsl:template match="//section//p">
        <p><xsl:apply-templates select="node()" /></p>
    </xsl:template>
    
    <xsl:template match="//figure">
        <figure><xsl:apply-templates select="node()" /></figure>
    </xsl:template>

    <xsl:template match="//figure/*[not(self::img)]">
        <section style="display:none;" class="ignore_from_ui"><xsl:apply-templates select="node()" /></section>
    </xsl:template>
    
    
    <xsl:template match="//figure/img">
        <xsl:variable name="_src">
            <xsl:value-of select="@src"/>
        </xsl:variable>
        <img>
            <xsl:attribute name="src">
                <xsl:value-of select="concat($resources_path, $_src)"/>
            </xsl:attribute>
            <xsl:apply-templates select="node()"/>
        </img>
    </xsl:template>
    
    <xsl:template match="//table">
        <table><xsl:apply-templates select="node()" /></table>
    </xsl:template>

    <xsl:template match="//tr">
        <tr><xsl:apply-templates select="node()" /></tr>
    </xsl:template>
      
     <xsl:template match="//*[@class='Table of Content']" priority="9">
        <div style="display:none;" class="leaflet_hidden_section ignore_from_ui"><xsl:apply-templates select="@class|node()"/></div>
    </xsl:template>
    
      <xsl:template match="//*[@class='Type']" priority="9">
        <div style="display:none;" class="leaflet_hidden_section ignore_from_ui"><xsl:apply-templates select="@class|node()"/></div>
    </xsl:template>
   
    <xsl:template match="//*[@class='Product_Name']" priority="9">
        <div style="display:none;" class="leaflet_hidden_section ignore_from_ui"><xsl:apply-templates select="@class|node()"/></div>
    </xsl:template>
   <xsl:template match="//*[@class='Ingredient Substance']" priority="9">
        <div style="display:none;" class="leaflet_hidden_section ignore_from_ui"><xsl:apply-templates select="@class|node()"/></div>
    </xsl:template>
   <xsl:template match="//*[@class='Read Instructions']" priority="9">
        <div style="display:none;" class="leaflet_hidden_section ignore_from_ui"><xsl:apply-templates select="@class|node()"/></div>
    </xsl:template>
    <xsl:template match="//*[@class='ignore_from_ui']" priority="9">
        <div style="display:none;" class="leaflet_hidden_section ignore_from_ui"><xsl:apply-templates select="@class|node()"/></div>
    </xsl:template>
    <xsl:template match="document/section">
        <div class="section leaflet-accordion-item">
            <xsl:apply-templates select="header"/>
                <div class="leaflet-accordion-item-content">
                     <xsl:apply-templates select="*[not(self::header)]"/>
                </div>
        </div>
    </xsl:template>
    
    <xsl:template match="document/section/header">
        <h2>
            <xsl:apply-templates select="node()" />
        </h2>
    </xsl:template>
</xsl:stylesheet>`;

module.exports = acordisXslContent;

},{}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/XMLDisplayService/XMLDisplayService.js":[function(require,module,exports){
const languageUtils = require("../../utils/Languages.js");
const constants = require("../../constants/constants.js");
const {createGTIN_SSI} = require("../../GTIN_SSI");
const utils = require("../../utils/CommonUtils.js");
const accordis_xslContent = require("./Acodis_StyleSheet.js");
const default_xslContent = require("./leafletXSL.js");
const {sanitize} = require("../../utils/htmlSanitize");
const openDSU = require("opendsu");
const {LEAFLET_XML_FILE_NAME, EPI_TYPES} = require("../../constants/constants");

let errorMessage = "This is a valid product. However, more information about this product has not been published by the Pharmaceutical Company. Please check back later.";
let securityErrorMessage = "Due to security concerns, the leaflet cannot be displayed";

class XmlDisplayService {
    constructor(element, gtinSSI, model, xmlType, htmlContainerId) {
        this.element = element;
        this.gtinSSI = gtinSSI;
        this.xmlType = xmlType;
        this.model = model;
        this.htmlContainerId = htmlContainerId || "#leaflet-content";
    }

    static async init(element, gtinSSI, model, xmlType, htmlContainerId) {
        let service = new XmlDisplayService(element, gtinSSI, model, xmlType, htmlContainerId);
        await service.isXmlAvailable();
        return service;
    }

    async isXmlAvailable() {
        return new Promise((resolve, reject) => {
            this.getAvailableLanguagesForXmlType((err, languages) => {
                if (err) {
                    return reject(err);
                }
                if (this.xmlType === EPI_TYPES.SMPC) {
                    this.model.showSmpc = !(this.model.product.practitionerInfo === null) && languages.length > 0
                }

                if (this.xmlType === EPI_TYPES.LEAFLET) {
                    this.model.showLeaflet = !(this.model.product.patientLeafletInfo === null) && languages.length > 0
                }

                return resolve(this.model.showSmpc || this.model.showLeaflet);
            });
        })
    }

    displayXmlForLanguage(language, callback) {
        this.readXmlFile(language, (err, xmlContent, pathBase) => {
            if (err) {
                this.displayError();
                return callback(err, null);
            }
            try {
                this.displayXmlContent(pathBase, xmlContent);
            } catch (e) {
                this.displayError();
                return callback(err, null);
            }
            return callback(null)
            // this.applyStylesheetAndDisplayXml(pathBase, xmlContent);
        });
    }

    getGtinSSIForConstProductDSU() {
        return createGTIN_SSI(this.model.networkName, undefined, this.model.product.gtin);
    }

    makeSaneCallback(callbackRef) {
        return function (...params) {
            if (callbackRef) {
                callbackRef(...params);
                callbackRef = undefined;
            }
        }
    }

    readXmlFile(language, callback) {
        let dsuResponseAvailable = false;
        callback = this.makeSaneCallback(callback);
        setTimeout(() => {
            if (!dsuResponseAvailable) {
                let error = Error("read_dsu_timeout");
                error.statusCode = 504;
                error.statusText = "read_dsu_timeout";
                callback(error);
                return;
            }
        }, constants.READ_DSU_TIMEOUT);
        this.mergeAvailableLanguages().then(languagesMap => {
            let pathToLeafletLanguage = languagesMap[language];
            let gtinSSI = this.gtinSSI;
            if (pathToLeafletLanguage.includes(constants.PRODUCT_DSU_MOUNT_POINT)) {
                gtinSSI = this.getGtinSSIForConstProductDSU();
            }
            const pathToXml = `${pathToLeafletLanguage}/${this.xmlType}.xml`;
            const openDSU = require("opendsu");
            const resolver = openDSU.loadAPI("resolver");
            resolver.loadDSU(gtinSSI, async (err, dsu) => {
                if (err) {
                    dsuResponseAvailable = true;
                    callback(err);
                    return;
                }
                try {
                    let files = await $$.promisify(dsu.listFiles)(pathToLeafletLanguage);
                    let xmlContent = await $$.promisify(dsu.readFile)(pathToXml);
                    let textDecoder = new TextDecoder("utf-8");
                    let leafletImagesObj = {};
                    this.images = {};
                    let anyOtherFiles = files.filter((file) => !file.endsWith('.xml'));
                    for (let i = 0; i < anyOtherFiles.length; i++) {
                        let filePath = `${pathToLeafletLanguage}/${anyOtherFiles[i]}`;
                        let imgFile = await $$.promisify(dsu.readFile)(filePath);
                        leafletImagesObj[anyOtherFiles[i]] = this.images[filePath] = utils.getImageAsBase64(imgFile);
                    }
                    dsuResponseAvailable = true;
                    callback(undefined, textDecoder.decode(xmlContent), `${pathToLeafletLanguage}/`, leafletImagesObj);
                    return
                } catch (e) {
                    dsuResponseAvailable = true;
                    callback(e);
                    return
                }
            })

        }).catch(err=>{
            dsuResponseAvailable = true;
            callback(err);
        })
    }

    hasMarketXMLAvailable(callback) {
        let dsuResponseAvailable = false;
        callback = this.makeSaneCallback(callback);
        setTimeout(() => {
            if (!dsuResponseAvailable) {
                let error = Error("read_dsu_timeout");
                error.statusCode = 504;
                error.statusText = "read_dsu_timeout";
                callback(error);
                return;
            }
        }, constants.READ_DSU_TIMEOUT);

        const openDSU = require("opendsu");
        const resolver = openDSU.loadAPI("resolver");
        resolver.loadDSU(this.getGtinSSIForConstProductDSU(), async (err, dsu) => {
            dsuResponseAvailable = true;
            if (err)
                return callback(err);

            let hasDocument = false;
            try {
                const path = this.getProductMarketPathToXmlType();
                const files = await $$.promisify(dsu.listFiles)(path);

                console.log("$$$ getProductMarketPathToXmlType, pah=", path, "->", files)

                if (Array.isArray(files) && files.length > 0) {
                    const hasXML = files.some((f) => f.endsWith(".xml"));
                    if (hasXML)
                        hasDocument = true;
                }
                callback(undefined, hasDocument);
            } catch (e) {
                callback(e);
            }
        });
    }

    readXmlFileFromMarket(language, epiMarket, callback) {
        const pskPath = require("swarmutils").path;
        let dsuResponseAvailable = false;
        callback = this.makeSaneCallback(callback);
        setTimeout(() => {
            if (!dsuResponseAvailable) {
                let error = Error("read_dsu_timeout");
                error.statusCode = 504;
                error.statusText = "read_dsu_timeout";
                callback(error);
                return;
            }
        }, constants.READ_DSU_TIMEOUT);

        const pathToLeafletLanguage = this.getProductMarketPathToXmlType(language);
        let gtinSSI = this.gtinSSI;
        if (pathToLeafletLanguage.includes(constants.PRODUCT_DSU_MOUNT_POINT)) {
            gtinSSI = this.getGtinSSIForConstProductDSU();
        }

        const openDSU = require("opendsu");
        const resolver = openDSU.loadAPI("resolver");
        const marketFolderPath = pskPath.join(pathToLeafletLanguage, epiMarket);
        const marketXMLPath = pskPath.join(marketFolderPath, LEAFLET_XML_FILE_NAME);

        resolver.loadDSU(gtinSSI, async (err, dsu) => {
            if (err) {
                dsuResponseAvailable = true;
                callback(err);
                return;
            }
            try {
                let files = await $$.promisify(dsu.listFiles)(marketFolderPath);
                let xmlContent = await $$.promisify(dsu.readFile)(marketXMLPath);

                let textDecoder = new TextDecoder("utf-8");
                let leafletImagesObj = {};
                this.images = {};
                let anyOtherFiles = files.filter((file) => !file.endsWith('.xml'));
                for (let i = 0; i < anyOtherFiles.length; i++) {
                    let filePath = `${marketFolderPath}/${anyOtherFiles[i]}`;
                    let imgFile = await $$.promisify(dsu.readFile)(filePath);
                    leafletImagesObj[anyOtherFiles[i]] = this.images[filePath] = utils.getImageAsBase64(imgFile);
                }
                dsuResponseAvailable = true;
                callback(undefined, textDecoder.decode(xmlContent), `${marketFolderPath}/`, leafletImagesObj);
            } catch (e) {
                dsuResponseAvailable = true;
                callback(e);
            }
        });
    }

    displayError(errMsg = errorMessage) {
        let errorMessageElement = this.getErrorMessageElement(errMsg);
        this.element.querySelector(this.htmlContainerId).innerHTML = "";
        this.element.querySelector(this.htmlContainerId).appendChild(errorMessageElement);
    }

    displayXmlContent(pathBase, xmlContent, images) {
        let resultDocument = this.getHTMLFromXML(pathBase, xmlContent);
        let leafletImages = resultDocument.querySelectorAll("img");
        this.images = this.images || images;
        for (let image of leafletImages) {
            //imageSrc will contain the name of the imageFile form XML
            let imageSrc = image.getAttribute("src");
            let dataUrlRegex = new RegExp(/^\s*data:([a-z]+\/[a-z]+(;[a-z-]+=[a-z-]+)?)?(;base64)?,[a-z0-9!$&',()*+;=\-._~:@/?%\s]*\s*$/i);
            if (!!imageSrc.match(dataUrlRegex) || imageSrc.startsWith("data:")) {
                //we don't alter already embedded images
                continue;
            }
            let imgObj = images.find(elem => elem.filename === imageSrc);
            if (imgObj) {
                image.setAttribute("src", imgObj.fileContent);
            }

        }
        let htmlFragment = this.buildLeafletHTMLSections(resultDocument);
        try {
            let epiContainer = this.element.querySelector(this.htmlContainerId) || document.querySelector(this.htmlContainerId)
            epiContainer.innerHTML = sanitize(htmlFragment);
        } catch (e) {
            return this.displayError(securityErrorMessage);
        }
        let leafletLinks = this.element.querySelectorAll(".leaflet-link");
        this.activateLeafletInnerLinks(leafletLinks);
    }

    activateLeafletInnerLinks(leafletLinks) {
        for (let link of leafletLinks) {
            let linkUrl = link.getAttribute("linkUrl");
            if (linkUrl.slice(0, 1) === "#") {
                link.addEventListener("click", () => {
                    document.getElementById(linkUrl.slice(1)).scrollIntoView();
                });
            }
        }
    }

    getHTMLFromXML(pathBase, xmlContent) {
        let xsltProcessor = new XSLTProcessor();
        xsltProcessor.setParameter(null, "resources_path", pathBase);
        let parser = new DOMParser();

        let xmlDoc = parser.parseFromString(xmlContent, "text/xml");
        if (!xmlDoc || !xmlDoc.children) {
            return "";
        }
        let xslContent;
        switch (xmlDoc.children[0].tagName) {
            case "root":
                let rootInnerHtml = xmlDoc.children[0].innerHTML;
                let newXmlDoc = document.implementation.createDocument(null, "document");
                try {
                    newXmlDoc.children[0].innerHTML = sanitize(rootInnerHtml);
                } catch (e) {
                    return this.displayError(securityErrorMessage);
                }
                xmlDoc = newXmlDoc;
                xslContent = accordis_xslContent;
                break
            case "document":
                if (xmlDoc.documentElement.hasAttribute("type") && xmlDoc.documentElement.getAttribute("type") === "pharmaledger-1.0") {
                    xslContent = accordis_xslContent;
                    break;
                }
                xslContent = default_xslContent;
                break
        }

        if (!xslContent) {
            return ""
        }
        let xslDoc = parser.parseFromString(xslContent, "text/xml");

        xsltProcessor.importStylesheet(xslDoc);

        let resultDocument = xsltProcessor.transformToFragment(xmlDoc, document);
        return resultDocument;
    }

    /*  buildLeafletHTMLSections(resultDocument) {
        let sectionsElements = resultDocument.querySelectorAll(".leaflet-accordion-item");
        let aboutContent = "";
        let beforeContent = "";
        let howToContent = "";
        let sideEffectsContent = "";
        let storingContent = "";
        let moreContent = "";
        sectionsElements.forEach(section => {
          let xmlCodeValue = section.getAttribute("sectionCode");
          switch (xmlCodeValue) {
            case '48780-1':
            case '34089-3':
            case '34076-0':
            case '60559-2':
              aboutContent = aboutContent + section.innerHTML;
              break;
            case '34070-3':
            case '34084-4':
            case '34086-9':
            case '69759-9':
              beforeContent = beforeContent + section.innerHTML;
              break;
            case '34068-7':
            case '43678-2':
            case '34072-9':
            case '34067-9':
            case '59845-8':
              howToContent = howToContent + section.innerHTML;
              break;
            case '34071-1':
            case '43685-7':
            case '54433-8':
            case '69762-3':
            case '34077-8':
            case '60563-4':
            case '34078-6':
              sideEffectsContent = sideEffectsContent + section.innerHTML;
              break;
            case '44425-7':
              storingContent = storingContent + section.innerHTML;
              break;
            default:
              moreContent = moreContent + section.innerHTML;

          }
        });

        let htmlFragment = ``
        return htmlFragment;
      }*/

    buildLeafletHTMLSections(resultDocument) {
        let sectionsElements = resultDocument.querySelectorAll(".leaflet-accordion-item");
        let htmlContent = "";
        sectionsElements.forEach(section => {
            htmlContent = htmlContent + section.outerHTML;
        })
        return htmlContent;
    }

    clearSearchResult(domElement) {
        let cleanHtml = domElement.innerHTML.replace(/((<mark class([a-zA-Z""=])*>)|<mark>|<\/mark>)/gim, '');
        try {
            domElement.innerHTML = sanitize(cleanHtml);
        } catch (e) {
            return this.displayError(securityErrorMessage);
        }
    }

    searchInHtml(searchQuery) {
        let domElement = this.element.querySelector(this.htmlContainerId);
        this.clearSearchResult(domElement);
        if (searchQuery === "") {
            return
        }
        const regex = new RegExp(searchQuery, 'gi');
        let resultNodes = [];
        try {

            let results = this.element.parentElement.ownerDocument.evaluate(`.//*[text()[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),"${searchQuery}")]]`, domElement);
            let domNode = null;

            while (domNode = results.iterateNext()) {
                // checking if the element is rendered, such that it can be highlighted and scrolled into view
                if (domNode.checkVisibility()) {
                    resultNodes.push(domNode);
                }
            }
            for (let i = 0; i < resultNodes.length; i++) {
                let text = resultNodes[i].innerHTML;
                const newText = text.replace(regex, '<mark>$&</mark>');
                try {
                    resultNodes[i].innerHTML = sanitize(newText);
                } catch (e) {
                    return this.displayError(securityErrorMessage);
                }
            }


        } catch (e) {
            // not found should not throw error just skip and wait for new input
        }
        return resultNodes;
    }

    getBatchPathToXmlType() {
        return `${constants.BATCH_DSU_MOUNT_POINT}/${this.xmlType}`;
    }

    getProductPathToXmlType() {
        return `${constants.PRODUCT_DSU_MOUNT_POINT}/${this.xmlType}`;
    }

    getProductMarketPathToXmlType(lang) {
        const path = `${constants.PRODUCT_DSU_MOUNT_POINT}/${constants.EPI_MOUNT_PREFIX}/${this.xmlType}`;
        if (lang)
            return `${path}/${lang}`;
        return path;
    }


    getAvailableLanguagesFromPath(gtinSSI, path, callback) {
        const resolver = openDSU.loadAPI("resolver");
        resolver.loadDSU(gtinSSI, (err, dsu) => {
            if (err) {
                err.isDSUError = err;
                return callback(err);
            }
            this.readLanguagesFromDSU(dsu, path, callback);
        })
    }

    readLanguagesFromDSU(dsu, path, callback) {
        const pskPath = require("swarmutils").path;
        dsu.listFolders(path, async (err, langFolders) => {
            if (err) {
                err.isDSUError = err;
                return callback(err);
            }
            let langs = [];
            for (let i = 0; i < langFolders.length; i++) {
                let langFolderPath = pskPath.join(path, langFolders[i]);
                let files = await $$.promisify(dsu.listFiles)(langFolderPath);
                let hasXml = files.find((item) => {
                    return item.endsWith("xml")
                })
                if (hasXml) {
                    langs.push(langFolders[i])
                }
            }
            return callback(undefined, langs);
        })
    }

    getAvailableMarketsFromPath(gtinSSI, path, lang, callback) {
        if (!callback) {
            callback = lang;
            lang = undefined;
        }

        const resolver = openDSU.loadAPI("resolver");
        resolver.loadDSU(gtinSSI, (err, dsu) => {
            if (err) {
                err.isDSUError = err;
                return callback(err);
            }
            this.readMarketsFromDSU(dsu, path, lang, callback);
        });
    }

    readMarketsFromDSU(dsu, path, lang, callback) {
        if (!callback) {
            callback = lang;
            lang = undefined;
        }

        const pskPath = require("swarmutils").path;
        dsu.listFolders(path, async (err, langFolders) => {
            if (err) {
                err.isDSUError = err;
                return callback(err);
            }

            if (lang && !langFolders.includes(lang)) {
                return callback(`Invalid language ${lang}. Not found.`)
            }

            langFolders = lang ? [lang] : langFolders;

            const markets = {};
            for (const langLabel of langFolders) {
                const langPath = pskPath.join(path, langLabel);
                const marketFolders = await $$.promisify(dsu.listFolders)(langPath);

                const validMarkets = [];
                for (const marketLabel of marketFolders) {
                    const marketFolderPath = pskPath.join(langPath, marketLabel, LEAFLET_XML_FILE_NAME);
                    try {
                        await $$.promisify(dsu.readFileAsync)(marketFolderPath);
                        validMarkets.push(marketLabel);
                    } catch {
                        console.warn(`Market file missing or unreadable at: ${marketFolderPath}`);
                    }
                }
                if (validMarkets.length > 0)
                    markets[langLabel] = validMarkets;
            }
            callback(undefined, markets);
        });
    }

    getAvailableLanguagesForBatch(callback) {
        this.getAvailableLanguagesFromPath(this.gtinSSI, this.getBatchPathToXmlType(), (err, langs) => {
            if (err) {
                langs = [];
                langs.isError = err;
            }
            callback(null, langs)
        })
    }

    getAvailableLanguagesForProduct(callback) {
        let gtinSSI = this.getGtinSSIForConstProductDSU();
        const dsuPath = this.getProductPathToXmlType();
        this.getAvailableLanguagesFromPath(gtinSSI, dsuPath, (err, langs) => {
            if (err) {
                langs = [];
                langs.isError = err;
            }
            callback(null, langs)
        });
    }

    getAvailableMarketsForProduct(callback) {
        let gtinSSI = this.getGtinSSIForConstProductDSU();
        this.getAvailableMarketsFromPath(gtinSSI, this.getProductMarketPathToXmlType(), (err, markets) => {
            if (err) {
                markets = [];
                markets.isError = err;
            }
            callback(null, markets);
        });
    }

    async mergeAvailableLanguages() {
        let productLanguages = await $$.promisify(this.getAvailableLanguagesForProduct, this)();
        let batchLanguages = await $$.promisify(this.getAvailableLanguagesForBatch, this)();
        // let marketLanguages = await $$.promisify(this.getAvailableMarketsForProduct, this)();
        const gotError = productLanguages.isError;
        if (undefined !== gotError && undefined !== gotError.isDSUError) {
            throw gotError;
        }
        let languagesMap = {};
        const pskPath = require("swarmutils").path;
        productLanguages.forEach(prodLang => {
            languagesMap[prodLang] = pskPath.join(this.getProductPathToXmlType(), prodLang);
        });
        batchLanguages.forEach(batchLang => {
            languagesMap[batchLang] = pskPath.join(this.getBatchPathToXmlType(), batchLang);
        });

        return languagesMap;
    }

    getErrorMessageElement(errorMessage) {
        let pskLabel = document.createElement("psk-label");
        pskLabel.className = "scan-error-message";
        pskLabel.label = errorMessage;
        return pskLabel;
    }

    getAvailableLanguagesForXmlType(callback) {
        this.mergeAvailableLanguages().then(languagesMap => {
            callback(undefined, languageUtils.normalizeLanguages(Object.keys(languagesMap)));
        }).catch(callback)
    }

    activateLeafletAccordion() {
        let accordionItems = document.querySelectorAll("div.leaflet-accordion-item");
        accordionItems.forEach((accItem, index) => {
            accItem.addEventListener("click", (evt) => {
                accItem.classList.toggle("active");
                accItem.querySelector(".leaflet-accordion-item-content").addEventListener("click", (event) => {
                    event.stopImmediatePropagation();
                    event.stopPropagation();
                })
            })
        })
    }

}

module.exports = XmlDisplayService;

},{"../../GTIN_SSI":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/GTIN_SSI.js","../../constants/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","../../constants/constants.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","../../utils/CommonUtils.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/CommonUtils.js","../../utils/Languages.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/Languages.js","../../utils/htmlSanitize":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/htmlSanitize.js","./Acodis_StyleSheet.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/XMLDisplayService/Acodis_StyleSheet.js","./leafletXSL.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/XMLDisplayService/leafletXSL.js","opendsu":false,"swarmutils":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/XMLDisplayService/leafletXSL.js":[function(require,module,exports){
const xslContent = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="urn:hl7-org:v3"
                xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="urn:hl7-org:v3 https://www.accessdata.fda.gov/spl/schema/spl.xsd">
    <xsl:output method="html"/>

    <!--setting identity transformation-->
    <xsl:template match="@*|node()">
        <xsl:copy>
            <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="xs:document">
        <div class="accordion">
            <xsl:apply-templates select="@*|node()"/>
        </div>
    </xsl:template>

    <xsl:template match="xs:document/xs:component">
        <xsl:apply-templates select="@*|node()"/>
    </xsl:template>

    <xsl:template match="xs:component/xs:structuredBody">
        <xsl:apply-templates select="@*|node()"/>
    </xsl:template>

    <xsl:template match="xs:structuredBody/xs:component">
        <xsl:apply-templates select="@*|node()"/>
    </xsl:template>

    <xsl:template match="xs:paragraph">
        <p>
            <xsl:apply-templates select="@*|node()"/>
        </p>
    </xsl:template>

    <xsl:template match="xs:list">
        <ul>
            <xsl:apply-templates select="@*|node()"/>
        </ul>
    </xsl:template>

    <xsl:template match="xs:item">
        <li>
            <xsl:apply-templates select="@*|node()"/>
        </li>
    </xsl:template>

    <xsl:template match="xs:linkHtml">
        <xsl:variable name="_href">
            <xsl:value-of select="@href"/>
        </xsl:variable>
        <xsl:variable name="firstLetter" select="substring($_href,1,1)"/>
        <xsl:choose>
            <xsl:when test="$firstLetter != '#'">
                <a target="_blank">
                    <xsl:attribute name="href">
                        <xsl:value-of select="@href"/>
                    </xsl:attribute>
                    <xsl:value-of select="."/>
                </a>
            </xsl:when>
            <xsl:otherwise>
                <span class="leaflet-link">
                    <xsl:attribute name="linkUrl">
                        <xsl:value-of select="@href"/>
                    </xsl:attribute>
                    <xsl:value-of select="."/>
                </span>
            </xsl:otherwise>
        </xsl:choose>

    </xsl:template>

    <xsl:template match="xs:section">
        <xsl:choose>
            <xsl:when test="xs:code/@displayName != 'SPL LISTING DATA ELEMENTS SECTION'">
                <div class="leaflet-accordion-item">
                    <xsl:attribute name="sectionCode">
                        <xsl:value-of select="xs:code/@code"/>
                    </xsl:attribute>
                    <h2>
                        <!--<xsl:value-of select="xs:code/@displayName"/>-->
                        <xsl:variable name="partialTitle" select="substring(xs:code/@displayName,2)"/>
                        <xsl:variable name="firstLetter" select="substring(xs:code/@displayName,1,1)"/>
                        <xsl:variable name="modifiedTitle">
                            <xsl:value-of
                                    select="concat($firstLetter,translate($partialTitle,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'))"/>
                        </xsl:variable>
                        <xsl:value-of select="$modifiedTitle"/>
                    </h2>
                    <div class="leaflet-accordion-item-content">
                        <xsl:apply-templates select="@*|node()"/>
                    </div>
                </div>
            </xsl:when>
            <xsl:otherwise></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="xs:section/xs:component/xs:section">
        <div>
            <h3>
                <!--<xsl:value-of select="xs:code/@displayName"/>-->
                <xsl:variable name="partialTitle" select="substring(xs:code/@displayName,2)"/>
                <xsl:variable name="firstLetter" select="substring(xs:code/@displayName,1,1)"/>
                <xsl:variable name="modifiedTitle">
                    <xsl:value-of
                            select="concat($firstLetter,translate($partialTitle,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'))"/>
                </xsl:variable>
                <xsl:value-of select="$modifiedTitle"/>
            </h3>
            <div>
                <xsl:apply-templates select="@*|node()"/>
            </div>
        </div>
    </xsl:template>

    <xsl:template match="xs:content">
        <xsl:choose>
            <xsl:when test="@styleCode = 'bold'">
                <b>
                    <xsl:value-of select="."/>
                </b>
            </xsl:when>
            <xsl:when test="@styleCode = 'underline'">
                <u>
                    <xsl:value-of select="."/>
                </u>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="."/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="xs:observationMedia">
        <img>
            <xsl:attribute name="src">
                <xsl:value-of select="concat($resources_path, xs:value/xs:reference/@value)"/>
            </xsl:attribute>
            <xsl:attribute name="alt">
                <xsl:value-of select="xs:text"/>
            </xsl:attribute>
        </img>
    </xsl:template>

    <xsl:template match="xs:document/xs:title">
        <accordion-item>
            <xsl:attribute name="shadow"/>
            <xsl:attribute name="title">
                Highlights of prescribing information
            </xsl:attribute>
            <!-- <xsl:attribute name="opened">
                opened
            </xsl:attribute> -->
            <div class="accordion-item-content" slot="item-content">
                <xsl:apply-templates select="@*|node()"/>
            </div>
        </accordion-item>
    </xsl:template>

    <!--nodes or attributes that we need to hide for a cleaner output-->
    <xsl:template
            match="xs:author|xs:id|xs:document/xs:code|xs:document/xs:effectiveTime|xs:document/xs:setId|xs:document/xs:versionNumber">
        <!--hide selected nodes-->
    </xsl:template>
</xsl:stylesheet>`

module.exports = xslContent;

},{}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/index.js":[function(require,module,exports){
module.exports = {
	SharedDBStorageService: require("./SharedDBStorageService"),
	DSUStorage: require("./NodeDSUStorage"),
	LogService : require("./LogService"),
	getMessageQueuingServiceInstance: () => require("./MessageQueuingService").getMessageQueuingServiceInstance(),
	ModelMessageService: require("./ModelMessageService")
}

},{"./LogService":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/LogService.js","./MessageQueuingService":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/MessageQueuingService.js","./ModelMessageService":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/ModelMessageService.js","./NodeDSUStorage":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/NodeDSUStorage.js","./SharedDBStorageService":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/SharedDBStorageService.js"}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/CommonUtils.js":[function(require,module,exports){
function getBloomFilterSerialisation(arr, bfSerialisation) {
    let crypto = require("opendsu").loadAPI("crypto");
    let bf;
    if (bfSerialisation) {
        bf = crypto.createBloomFilter(bfSerialisation);
    } else {
        bf = crypto.createBloomFilter({estimatedElementCount: arr.length, falsePositiveTolerance: 0.000001});
    }
    arr.forEach(sn => {
        bf.insert(sn);
    });
    return bf
}

function convertDateTOGMTFormat(date) {
    let formatter = new Intl.DateTimeFormat('en', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
        weekday: "short",
        monthday: "short",
        timeZone: 'GMT'
    });

    let arr = formatter.formatToParts(date);
    let no = {};
    arr.forEach(item => {
        no[item.type] = item.value;
    })
    let {year, month, day, hour, minute} = no;

    let offset = -date.getTimezoneOffset();
    let offset_min = offset % 60;
    if (!offset_min) {
        offset_min = "00"
    }
    offset = offset / 60;
    let offsetStr = "GMT ";
    if (offset) {
        if (offset > 0) {
            offsetStr += "+";
        }
        offsetStr += offset;
        offsetStr += ":";
        offsetStr += offset_min;
    }

    return `${year} ${month} ${day} ${hour}:${minute} ${offsetStr}`;
}

/**
 * https://gist.github.com/jonleighton/958841#gistcomment-2839519
 * @param arrayBuffer
 * @returns {string}
 */

let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// Use a lookup table to find the index.
let lookup = new Uint8Array(256);
for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
}

const arrayBufferToBase64 = (arrayBuffer) => {
    let bytes = new Uint8Array(arrayBuffer),
        i, len = bytes.length, base64 = "";

    for (i = 0; i < len; i += 3) {
        base64 += chars[bytes[i] >> 2];
        base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
        base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
        base64 += chars[bytes[i + 2] & 63];
    }

    if ((len % 3) === 2) {
        base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2) + "==";
    }

    return base64;
}

/**
 * @param base64
 * @returns {ArrayBuffer}
 */
const base64ToArrayBuffer = (base64) => {
    let bufferLength = base64.length * 0.75,
        len = base64.length, i, p = 0,
        encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === "=") {
        bufferLength--;
        if (base64[base64.length - 2] === "=") {
            bufferLength--;
        }
    }

    let arraybuffer = new ArrayBuffer(bufferLength),
        bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i += 4) {
        encoded1 = lookup[base64.charCodeAt(i)];
        encoded2 = lookup[base64.charCodeAt(i + 1)];
        encoded3 = lookup[base64.charCodeAt(i + 2)];
        encoded4 = lookup[base64.charCodeAt(i + 3)];

        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
};

const bytesToBase64 = (bytes) => {
    const base64abc = [
        "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
        "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
        "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"
    ];

    let result = '', i, l = bytes.length;
    for (i = 2; i < l; i += 3) {
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
        result += base64abc[((bytes[i - 1] & 0x0F) << 2) | (bytes[i] >> 6)];
        result += base64abc[bytes[i] & 0x3F];
    }
    if (i === l + 1) { // 1 octet yet to write
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[(bytes[i - 2] & 0x03) << 4];
        result += "==";
    }
    if (i === l) { // 2 octets yet to write
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
        result += base64abc[(bytes[i - 1] & 0x0F) << 2];
        result += "=";
    }
    return result;
}

function getImageAsBase64(imageData) {
    if (typeof imageData === "string") {
        return imageData;
    }
    const envTypes = require("opendsu").constants.ENVIRONMENT_TYPES;
    let base64Image;

    if ($$.environmentType === envTypes.NODEJS_ENVIRONMENT_TYPE) {
        const buffer = $$.Buffer.isBuffer(imageData) ? imageData : $$.Buffer.from(imageData);
        base64Image = buffer.toString('base64');
    } else {
        if (!(imageData instanceof Uint8Array)) {
            imageData = new Uint8Array(imageData);
        }
        let binary = '';
        const len = imageData.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(imageData[i]);
        }
        base64Image = btoa(binary);
    }

    return `data:image/png;base64,${base64Image}`;
}

//used to validate image data in mapping manager
async function isBase64ValidImage(base64String) {
    let image = new Image()

    return await (new Promise((resolve) => {
        image.onload = function () {
            if (image.height === 0 || image.width === 0) {
                resolve(false);
                return;
            }
            resolve(true)
        }
        image.onerror = () => {
            resolve(false)
        }
        image.src = getImageAsBase64(base64ToArrayBuffer(base64String));
    }))

}

const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

/**
 * converts date from ISO (YYYY-MM-DD) to YYYY-HM, where HM comes from human name for the month, i.e. 2021-DECEMBER
 * @param {string} dateString
 */
function convertFromISOtoYYYY_HM(dateString, useFullMonthName, separator) {
    const splitDate = dateString.split('-');
    const month = parseInt(splitDate[1]);
    let separatorString = "-";
    if (typeof separator !== "undefined") {
        separatorString = separator;
    }
    if (useFullMonthName) {
        return `${splitDate[2]} ${separatorString} ${monthNames[month - 1]} ${separatorString} ${splitDate[0]}`;
    }
    return `${splitDate[2]} ${separatorString} ${monthNames[month - 1].slice(0, 3)} ${separatorString} ${splitDate[0]}`;
}

function convertFromGS1DateToYYYY_HM(gs1DateString) {
    let year = "20" + gs1DateString.slice(0, 2);
    let month = gs1DateString.slice(2, 4);
    let day = gs1DateString.slice(4);
    return `${day} - ${monthNames[month - 1].slice(0, 3)} - ${year}`
}

function getTimeSince(date) {

    let seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let month = new Date(date).getMonth() + 1;
    let monthSeconds = 31 * 24 * 60 * 60;
    if (month === 2) {
        monthSeconds = 28 * 24 * 60 * 60;
    }
    if ([4, 6, 9, 11].includes(month)) {
        monthSeconds = 30 * 24 * 60 * 60;
    }

    if (seconds > monthSeconds) {
        return
    }
    let interval = seconds / (24 * 60 * 60);
    if (interval >= 1) {
        return Math.floor(interval) + (interval >= 2 ? " days" : " day");
    }
    interval = seconds / (60 * 60);
    if (interval >= 1) {
        return Math.floor(interval) + (interval >= 2 ? " hours" : " hour");
    }
    interval = seconds / 60;
    if (interval >= 1) {
        return Math.floor(interval) + (interval >= 2 ? " minutes" : " minute");
    }
    return seconds + (seconds >= 2 ? " seconds" : " second");
}

function getDateForDisplay(date) {
    if (date.slice(0, 2) === "00") {
        return date.slice(5);
    }
    return date;
}

function getRecordPKey(gtinSSI, gs1Fields) {
    if (typeof gtinSSI !== "string") {
        gtinSSI = gtinSSI.getIdentifier();
    }
    return `${gtinSSI}${gs1Fields.batchNumber || "-"}|${gs1Fields.serialNumber}|${gs1Fields.expiry}`;
}

let productPrefix = "p_";
let batchPrefix = "b_";
let separator = " | ";

function getBatchMetadataPK(productCode, batch) {
    return `${productPrefix}${productCode}${separator}${batchPrefix}${batch}`;
}

function getDataFromBatchMetadataPK(batchMetadataPK) {
    let result = {};
    let parts = batchMetadataPK.split(separator);
    if (parts) {
        for (let part of parts) {
            if (part.indexOf(productPrefix) !== -1) {
                result.productCode = part.replace(productPrefix, "");
                continue;
            }
            if (part.indexOf(batchPrefix) !== -1) {
                result.batch = part.replace(batchPrefix, "");
            }
        }
    }

    return result;
}

//convert date to last date of the month for 00 date
function convertToLastMonthDay(date) {
    let expireDateConverted = date.replace("00", "01");
    expireDateConverted = new Date(expireDateConverted.replaceAll(' ', ''));
    expireDateConverted.setFullYear(expireDateConverted.getFullYear(), expireDateConverted.getMonth() + 1, 0);
    expireDateConverted = expireDateConverted.getTime();
    return expireDateConverted;
}

module.exports = {
    base64ToArrayBuffer,
    arrayBufferToBase64,
    convertDateTOGMTFormat,
    getBloomFilterSerialisation,
    getImageAsBase64,
    bytesToBase64,
    convertFromISOtoYYYY_HM,
    convertFromGS1DateToYYYY_HM,
    getRecordPKey,
    getDateForDisplay,
    convertToLastMonthDay,
    getTimeSince,
    getBatchMetadataPK,
    getDataFromBatchMetadataPK,
    isBase64ValidImage
}

},{"opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/Countries.js":[function(require,module,exports){
const countries = [
    {"name": "Afghanistan", "code": "AF"},
    {"name": "Åland Islands", "code": "AX"},
    {"name": "Albania", "code": "AL"},
    {"name": "Algeria", "code": "DZ"},
    {"name": "American Samoa", "code": "AS"},
    {"name": "Andorra", "code": "AD"},
    {"name": "Angola", "code": "AO"},
    {"name": "Anguilla", "code": "AI"},
    {"name": "Antarctica", "code": "AQ"},
    {"name": "Antigua and Barbuda", "code": "AG"},
    {"name": "Argentina", "code": "AR"},
    {"name": "Armenia", "code": "AM"},
    {"name": "Aruba", "code": "AW"},
    {"name": "Australia", "code": "AU"},
    {"name": "Austria", "code": "AT"},
    {"name": "Azerbaijan", "code": "AZ"},
    {"name": "Bahamas", "code": "BS"},
    {"name": "Bahrain", "code": "BH"},
    {"name": "Bangladesh", "code": "BD"},
    {"name": "Barbados", "code": "BB"},
    {"name": "Belarus", "code": "BY"},
    {"name": "Belgium", "code": "BE"},
    {"name": "Belize", "code": "BZ"},
    {"name": "Benin", "code": "BJ"},
    {"name": "Bermuda", "code": "BM"},
    {"name": "Bhutan", "code": "BT"},
    {"name": "Bolivia", "code": "BO"},
    {"name": "Bosnia and Herzegovina", "code": "BA"},
    {"name": "Botswana", "code": "BW"},
    {"name": "Bouvet Island", "code": "BV"},
    {"name": "Brazil", "code": "BR"},
    {"name": "British Indian Ocean Territory", "code": "IO"},
    {"name": "Brunei Darussalam", "code": "BN"},
    {"name": "Bulgaria", "code": "BG"},
    {"name": "Burkina Faso", "code": "BF"},
    {"name": "Burundi", "code": "BI"},
    {"name": "Cambodia", "code": "KH"},
    {"name": "Cameroon", "code": "CM"},
    {"name": "Canada", "code": "CA"},
    {"name": "Cape Verde", "code": "CV"},
    {"name": "Cayman Islands", "code": "KY"},
    {"name": "Central African Republic", "code": "CF"},
    {"name": "Chad", "code": "TD"},
    {"name": "Chile", "code": "CL"},
    {"name": "China", "code": "CN"},
    {"name": "Christmas Island", "code": "CX"},
    {"name": "Cocos (Keeling) Islands", "code": "CC"},
    {"name": "Colombia", "code": "CO"},
    {"name": "Comoros", "code": "KM"},
    {"name": "Congo", "code": "CG"},
    {"name": "Congo, The Democratic Republic of the", "code": "CD"},
    {"name": "Cook Islands", "code": "CK"},
    {"name": "Costa Rica", "code": "CR"},
    {"name": "Cote D'Ivoire", "code": "CI"},
    {"name": "Croatia", "code": "HR"},
    {"name": "Cuba", "code": "CU"},
    {"name": "Cyprus", "code": "CY"},
    {"name": "Czech Republic", "code": "CZ"},
    {"name": "Denmark", "code": "DK"},
    {"name": "Djibouti", "code": "DJ"},
    {"name": "Dominica", "code": "DM"},
    {"name": "Dominican Republic", "code": "DO"},
    {"name": "Ecuador", "code": "EC"},
    {"name": "Egypt", "code": "EG"},
    {"name": "El Salvador", "code": "SV"},
    {"name": "Equatorial Guinea", "code": "GQ"},
    {"name": "Eritrea", "code": "ER"},
    {"name": "Estonia", "code": "EE"},
    {"name": "Ethiopia", "code": "ET"},
    {"name": "Falkland Islands (Malvinas)", "code": "FK"},
    {"name": "Faroe Islands", "code": "FO"},
    {"name": "Fiji", "code": "FJ"},
    {"name": "Finland", "code": "FI"},
    {"name": "France", "code": "FR"},
    {"name": "French Guiana", "code": "GF"},
    {"name": "French Polynesia", "code": "PF"},
    {"name": "French Southern Territories", "code": "TF"},
    {"name": "Gabon", "code": "GA"},
    {"name": "Gambia", "code": "GM"},
    {"name": "Georgia", "code": "GE"},
    {"name": "Germany", "code": "DE"},
    {"name": "Ghana", "code": "GH"},
    {"name": "Gibraltar", "code": "GI"},
    {"name": "Greece", "code": "GR"},
    {"name": "Greenland", "code": "GL"},
    {"name": "Grenada", "code": "GD"},
    {"name": "Guadeloupe", "code": "GP"},
    {"name": "Guam", "code": "GU"},
    {"name": "Guatemala", "code": "GT"},
    {"name": "Guernsey", "code": "GG"},
    {"name": "Guinea", "code": "GN"},
    {"name": "Guinea-Bissau", "code": "GW"},
    {"name": "Guyana", "code": "GY"},
    {"name": "Haiti", "code": "HT"},
    {"name": "Heard Island and Mcdonald Islands", "code": "HM"},
    {"name": "Holy See (Vatican City State)", "code": "VA"},
    {"name": "Honduras", "code": "HN"},
    {"name": "Hong Kong", "code": "HK"},
    {"name": "Hungary", "code": "HU"},
    {"name": "Iceland", "code": "IS"},
    {"name": "India", "code": "IN"},
    {"name": "Indonesia", "code": "ID"},
    {"name": "Iran, Islamic Republic Of", "code": "IR"},
    {"name": "Iraq", "code": "IQ"},
    {"name": "Ireland", "code": "IE"},
    {"name": "Isle of Man", "code": "IM"},
    {"name": "Israel", "code": "IL"},
    {"name": "Italy", "code": "IT"},
    {"name": "Jamaica", "code": "JM"},
    {"name": "Japan", "code": "JP"},
    {"name": "Jersey", "code": "JE"},
    {"name": "Jordan", "code": "JO"},
    {"name": "Kazakhstan", "code": "KZ"},
    {"name": "Kenya", "code": "KE"},
    {"name": "Kiribati", "code": "KI"},
    {"name": "Korea, Democratic People'S Republic of", "code": "KP"},
    {"name": "Korea, Republic of", "code": "KR"},
    {"name": "Kuwait", "code": "KW"},
    {"name": "Kyrgyzstan", "code": "KG"},
    {"name": "Lao People'S Democratic Republic", "code": "LA"},
    {"name": "Latvia", "code": "LV"},
    {"name": "Lebanon", "code": "LB"},
    {"name": "Lesotho", "code": "LS"},
    {"name": "Liberia", "code": "LR"},
    {"name": "Libyan Arab Jamahiriya", "code": "LY"},
    {"name": "Liechtenstein", "code": "LI"},
    {"name": "Lithuania", "code": "LT"},
    {"name": "Luxembourg", "code": "LU"},
    {"name": "Macao", "code": "MO"},
    {"name": "Macedonia, The Former Yugoslav Republic of", "code": "MK"},
    {"name": "Madagascar", "code": "MG"},
    {"name": "Malawi", "code": "MW"},
    {"name": "Malaysia", "code": "MY"},
    {"name": "Maldives", "code": "MV"},
    {"name": "Mali", "code": "ML"},
    {"name": "Malta", "code": "MT"},
    {"name": "Marshall Islands", "code": "MH"},
    {"name": "Martinique", "code": "MQ"},
    {"name": "Mauritania", "code": "MR"},
    {"name": "Mauritius", "code": "MU"},
    {"name": "Mayotte", "code": "YT"},
    {"name": "Mexico", "code": "MX"},
    {"name": "Micronesia, Federated States of", "code": "FM"},
    {"name": "Moldova, Republic of", "code": "MD"},
    {"name": "Monaco", "code": "MC"},
    {"name": "Mongolia", "code": "MN"},
    {"name": "Montserrat", "code": "MS"},
    {"name": "Morocco", "code": "MA"},
    {"name": "Mozambique", "code": "MZ"},
    {"name": "Myanmar", "code": "MM"},
    {"name": "Namibia", "code": "NA"},
    {"name": "Nauru", "code": "NR"},
    {"name": "Nepal", "code": "NP"},
    {"name": "Netherlands", "code": "NL"},
    {"name": "Netherlands Antilles", "code": "AN"},
    {"name": "New Caledonia", "code": "NC"},
    {"name": "New Zealand", "code": "NZ"},
    {"name": "Nicaragua", "code": "NI"},
    {"name": "Niger", "code": "NE"},
    {"name": "Nigeria", "code": "NG"},
    {"name": "Niue", "code": "NU"},
    {"name": "Norfolk Island", "code": "NF"},
    {"name": "Northern Mariana Islands", "code": "MP"},
    {"name": "Norway", "code": "NO"},
    {"name": "Oman", "code": "OM"},
    {"name": "Pakistan", "code": "PK"},
    {"name": "Palau", "code": "PW"},
    {"name": "Palestinian Territory, Occupied", "code": "PS"},
    {"name": "Panama", "code": "PA"},
    {"name": "Papua New Guinea", "code": "PG"},
    {"name": "Paraguay", "code": "PY"},
    {"name": "Peru", "code": "PE"},
    {"name": "Philippines", "code": "PH"},
    {"name": "Pitcairn", "code": "PN"},
    {"name": "Poland", "code": "PL"},
    {"name": "Portugal", "code": "PT"},
    {"name": "Puerto Rico", "code": "PR"},
    {"name": "Qatar", "code": "QA"},
    {"name": "Reunion", "code": "RE"},
    {"name": "Romania", "code": "RO"},
    {"name": "Russian Federation", "code": "RU"},
    {"name": "Rwanda", "code": "RW"},
    {"name": "Saint Helena", "code": "SH"},
    {"name": "Saint Kitts and Nevis", "code": "KN"},
    {"name": "Saint Lucia", "code": "LC"},
    {"name": "Saint Pierre and Miquelon", "code": "PM"},
    {"name": "Saint Vincent and the Grenadines", "code": "VC"},
    {"name": "Samoa", "code": "WS"},
    {"name": "San Marino", "code": "SM"},
    {"name": "Sao Tome and Principe", "code": "ST"},
    {"name": "Saudi Arabia", "code": "SA"},
    {"name": "Senegal", "code": "SN"},
    {"name": "Serbia and Montenegro", "code": "CS"},
    {"name": "Seychelles", "code": "SC"},
    {"name": "Sierra Leone", "code": "SL"},
    {"name": "Singapore", "code": "SG"},
    {"name": "Slovakia", "code": "SK"},
    {"name": "Slovenia", "code": "SI"},
    {"name": "Solomon Islands", "code": "SB"},
    {"name": "Somalia", "code": "SO"},
    {"name": "South Africa", "code": "ZA"},
    {"name": "South Georgia and the South Sandwich Islands", "code": "GS"},
    {"name": "Spain", "code": "ES"},
    {"name": "Sri Lanka", "code": "LK"},
    {"name": "Sudan", "code": "SD"},
    {"name": "Suriname", "code": "SR"},
    {"name": "Svalbard and Jan Mayen", "code": "SJ"},
    {"name": "Swaziland", "code": "SZ"},
    {"name": "Sweden", "code": "SE"},
    {"name": "Switzerland", "code": "CH"},
    {"name": "Syrian Arab Republic", "code": "SY"},
    {"name": "Taiwan, Province of China", "code": "TW"},
    {"name": "Tajikistan", "code": "TJ"},
    {"name": "Tanzania, United Republic of", "code": "TZ"},
    {"name": "Thailand", "code": "TH"},
    {"name": "Timor-Leste", "code": "TL"},
    {"name": "Togo", "code": "TG"},
    {"name": "Tokelau", "code": "TK"},
    {"name": "Tonga", "code": "TO"},
    {"name": "Trinidad and Tobago", "code": "TT"},
    {"name": "Tunisia", "code": "TN"},
    {"name": "Turkey", "code": "TR"},
    {"name": "Turkmenistan", "code": "TM"},
    {"name": "Turks and Caicos Islands", "code": "TC"},
    {"name": "Tuvalu", "code": "TV"},
    {"name": "Uganda", "code": "UG"},
    {"name": "Ukraine", "code": "UA"},
    {"name": "United Arab Emirates", "code": "AE"},
    {"name": "United Kingdom", "code": "GB"},
    {"name": "United States", "code": "US"},
    {"name": "United States Minor Outlying Islands", "code": "UM"},
    {"name": "Uruguay", "code": "UY"},
    {"name": "Uzbekistan", "code": "UZ"},
    {"name": "Vanuatu", "code": "VU"},
    {"name": "Venezuela", "code": "VE"},
    {"name": "Viet Nam", "code": "VN"},
    {"name": "Virgin Islands, British", "code": "VG"},
    {"name": "Virgin Islands, U.S.", "code": "VI"},
    {"name": "Wallis and Futuna", "code": "WF"},
    {"name": "Western Sahara", "code": "EH"},
    {"name": "Yemen", "code": "YE"},
    {"name": "Zambia", "code": "ZM"},
    {"name": "Zimbabwe", "code": "ZW"}
];


    function getList() {
        return countries;
    }
    function getListAsVM() {
        let result = [];
        countries.forEach(country => {
            result.push({label: country.name, value: country.code});
        });

        return result;
    }
    function getCountry(code) {
        return countries.find(country => country.code === code).name;
    }
module.exports ={
    getList,
    getListAsVM,
    getCountry
}
},{}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/DBUtils.js":[function(require,module,exports){
const createOrUpdateRecord = async (storageService, logData, data) => {
    let dbRecord;
    try {
        dbRecord = await $$.promisify(storageService.getRecord, storageService)(logData.table, logData.pk);
    } catch (e) {
        //possible issue on db.
    }

    if (dbRecord) {
        await $$.promisify(storageService.updateRecord, storageService)(logData.table, logData.pk, data);
    } else {
        await $$.promisify(storageService.addIndex, storageService)(logData.table, "__timestamp");
        await $$.promisify(storageService.insertRecord, storageService)(logData.table, logData.pk, data);
    }
}

module.exports = {
    createOrUpdateRecord
}

},{}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/DSUFabricUtils.js":[function(require,module,exports){
const openDSU = require("opendsu");
const resolver = openDSU.loadAPI("resolver");
const UploadTypes = require("./UploadTypes");
const Languages = require("./Languages");
const constants = require("../constants/constants");
const utils = require("./CommonUtils");

const LEAFLET_CARD_STATUS = {
  NEW: "add",
  UPDATE: "update",
  EXISTS: "exists",
  DELETE: "delete"
}

function generateCard(action, type, code, files, videoSource) {
  let card = {
    action: action,
    type: {value: type},
    language: {value: code},
    files: files,
    videoSource: videoSource
  };
  card.type.label = UploadTypes.getLanguage(type);
  card.language.label = Languages.getLanguageName(code);
  return card;
}

async function getXMLFileContent(files, callback) {
  let xmlFiles = files.filter((file) => file.name.endsWith('.xml'));

  if (xmlFiles.length === 0) {
    return callback(new Error("No xml files found."))
  }
  return await getBase64FileContent(xmlFiles[0], callback)
}

async function getOtherCardFiles(files, callback) {
  let anyOtherFiles = files.filter((file) => !file.name.endsWith('.xml'))

  let filesContent = [];
  for (let i = 0; i < anyOtherFiles.length; i++) {
    let file = anyOtherFiles[i];
    filesContent.push({
      filename: file.name,
      fileContent: await $$.promisify(getBase64FileContent)(file)
    })
  }
  callback(undefined, filesContent);
}

async function getFileContent(file, methodName = "readAsText") {
  let fileReader = new FileReader();
  return new Promise((resolve, reject) => {
    fileReader.onload = function () {
      return resolve(fileReader.result)
    }
    fileReader.onerror = function () {
      return reject()
    }
    fileReader[methodName](file);
  })
}

async function getFileContentAsBuffer(file) {
  return getFileContent(file, "readAsArrayBuffer");
}

async function getBase64FileContent(file, callback) {
  let content;
  try {
    content = await getFileContentAsBuffer(file);
    content = utils.arrayBufferToBase64(content);
  } catch (e) {
    return callback(e);
  }
  return callback(undefined, content);
}


function generateRandom(n) {
  let add = 1,
      max = 12 - add;

  if (n > max) {
    return generateRandom(max) + generateRandom(n - max);
  }

  max = Math.pow(10, n + add);
  let min = max / 10; // Math.pow(10, n) basically
  let number = Math.floor(Math.random() * (max - min + 1)) + min;

  return ("" + number).substring(add);
}

async function createEpiMessages(data, attachedTo) {
  let cardMessages = [];

  for (let i = 0; i < data.cards.length; i++) {
    let card = data.cards[i];

    if (card.action !== LEAFLET_CARD_STATUS.EXISTS) {

      let cardMessage = {
        messageTypeVersion: data.messageTypeVersion,
        senderId: data.senderId,
        receiverId: "",
        messageId: generateRandom(13),
        messageDateTime: data.messageDateTime,
        token: "",
        action: card.action,
        language: card.language.value,
        messageType: card.type.value,

      }
      try {
        if (card.action !== LEAFLET_CARD_STATUS.DELETE) {
          cardMessage.xmlFileContent = await $$.promisify(getXMLFileContent)(card.files);
          cardMessage.otherFilesContent = await $$.promisify(getOtherCardFiles)(card.files);
        }
      } catch (e) {
        console.log('err ', e);
      }

      if (attachedTo === "product") {
        cardMessage.productCode = data.code;
      } else {
        if (data.productCode) {
          cardMessage.productCode = data.productCode;
        }
        cardMessage.batchCode = data.code;
      }
      cardMessages.push(cardMessage);
    }
  }


  return cardMessages;
}

async function getLanguageTypeCards(model, dsuObj, folderName) {
  let cards = [];
  let folders = await $$.promisify(dsuObj.listFolders)(`/${folderName}`);
  for (const languageCode of folders) {
    let files = await $$.promisify(dsuObj.listFiles)(`/${folderName}/${languageCode}`);
    let videoSource = "";
    if (model.videos && model.videos[`${folderName}/${languageCode}`]) {
      videoSource = atob(model.videos[`${folderName}/${languageCode}`]);
    }
    cards.push(generateCard(LEAFLET_CARD_STATUS.EXISTS, `${folderName}`, languageCode, files, videoSource));
  }
  return cards;
}

async function getLeafletFile(leafletType, leafletLang, fileName, model) {
  let {gtinSSI, mountPath} = await getDSUBaseInfo(model);
  let constDSU = await $$.promisify(resolver.loadDSU)(gtinSSI);
  let content = await $$.promisify(constDSU.readFile)(`${mountPath}/${leafletType}/${leafletLang}/${fileName}`);
  return content;
}

async function getDSUBaseInfo(model) {
  let gtinSSI, mountPath;
  if (model.product) {
    mountPath = constants.PRODUCT_DSU_MOUNT_POINT;
    gtinSSI = await getGtinSSI(model.product.gtin);
  } else {
    mountPath = constants.BATCH_DSU_MOUNT_POINT;
    gtinSSI = await getGtinSSI(model.batch.gtin, model.batch.batchNumber);
  }
  return {gtinSSI, mountPath}
}

function getDSUAttachments(model, disabledFeatures, callback) {
  const gtinResolver = require("gtin-resolver");
  const config = openDSU.loadAPI("config");
  config.getEnv("epiDomain", async (err, domain) => {
    if (err) {
      return callback(err);
    }

    const subdomain = await $$.promisify(config.getEnv)("epiSubdomain")
    let gtinSSI;
    let mountPath;
    if (model.batchNumber) {
      gtinSSI = gtinResolver.createGTIN_SSI(domain, subdomain, model.gtin, model.batchNumber);
      mountPath = constants.BATCH_DSU_MOUNT_POINT;
    } else {
      gtinSSI = gtinResolver.createGTIN_SSI(domain, subdomain, model.gtin)
      mountPath = constants.PRODUCT_DSU_MOUNT_POINT;
    }

    resolver.loadDSU(gtinSSI, async (err, constDSU) => {
      if (err) {
        return callback(err);
      }

      //used temporarily to avoid the usage of dsu cached instances which are not up to date
      try {
        const context = await $$.promisify(constDSU.getArchiveForPath)(mountPath);
        let dsuObj = context.archive;
        await $$.promisify(dsuObj.load)();
        let languageTypeCards = [];
        if (!disabledFeatures.includes("01")) {
          languageTypeCards = languageTypeCards.concat(await getLanguageTypeCards(model, dsuObj, "leaflet"));
        }
        if (!disabledFeatures.includes("04")) {
          languageTypeCards = languageTypeCards.concat(await getLanguageTypeCards(model, dsuObj, "smpc"));
        }

        try {
          let stat = await $$.promisify(dsuObj.stat)(constants.PRODUCT_IMAGE_FILE)
          if (stat.type === "file") {
            let data = await $$.promisify(dsuObj.readFile)(constants.PRODUCT_IMAGE_FILE);
            let productPhoto = utils.getImageAsBase64(data);
            return callback(undefined, {languageTypeCards: languageTypeCards, productPhoto: productPhoto});
          }
        } catch (err) {
          // if model is not a product or there is no image in dsu do not return a product photo
        }

        return callback(undefined, {languageTypeCards: languageTypeCards});
      } catch (e) {
        return callback(e);
      }
    });
  });
}

function getMetadata(gtinSSI, targetFilePath, callback) {
  resolver.loadDSU(gtinSSI, async (err, constDSU) => {
    if (err) {
      return callback(err);
    }
    constDSU.readFile(targetFilePath, (err, content) => {
      if (err) {
        return callback(err);
      }
      return callback(undefined, JSON.parse(content.toString()));
    });
  });
}

async function getEnvDetails() {
  const config = openDSU.loadAPI("config");
  const domain = await $$.promisify(config.getEnv)("epiDomain");
  const subdomain = await $$.promisify(config.getEnv)("epiSubdomain")

  return {domain, subdomain};
}

async function getGtinSSI(gtin, batchNumber) {
  let {domain, subdomain} = await getEnvDetails();
  const gtinResolver = require("gtin-resolver");
  let gtinSSI = gtinResolver.createGTIN_SSI(domain, subdomain, gtin, batchNumber);
  return gtinSSI;
}

function checkExistenceForSSI(ssi, callback) {
  const anchoring = require("opendsu").loadApi("anchoring");
  const anchoringX = anchoring.getAnchoringX();
  anchoringX.getLastVersion(ssi, (err, version) => {
    if (err) {
      return callback(err);
    }
    callback(undefined, !!version);
  });
}

async function checkIfWeHaveDataForThis(gtin, batchNumber, callback) {
  const ssi = await getGtinSSI(gtin, batchNumber);
  checkExistenceForSSI(ssi, callback);
}

async function getProductMetadata(gtin, callback) {
  let {domain, subdomain} = await getEnvDetails();
  const gtinResolver = require("gtin-resolver");
  let gtinSSI = gtinResolver.createGTIN_SSI(domain, subdomain, gtin);
  let targetFilePath = require("../EpiVersionTransformer").getProductPath(1);
  getMetadata(gtinSSI, targetFilePath, callback);
}

async function getBatchMetadata(batchNumber, gtin, callback) {
  let {domain, subdomain} = await getEnvDetails();
  const gtinResolver = require("gtin-resolver");
  let gtinSSI = gtinResolver.createGTIN_SSI(domain, subdomain, gtin, batchNumber);
  let targetFilePath = require("../EpiVersionTransformer").getBatchPath(1);
  getMetadata(gtinSSI, targetFilePath, callback);
}

module.exports = {
  checkIfWeHaveDataForThis,
  generateCard,
  createEpiMessages,
  LEAFLET_CARD_STATUS,
  getDSUAttachments,
  getProductMetadata,
  getBatchMetadata,
  getXMLFileContent,
  getOtherCardFiles,
  getBase64FileContent,
  getLeafletFile,
  getDSUBaseInfo,
  getFileContent,
  getFileContentAsBuffer
}

},{"../EpiVersionTransformer":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/EpiVersionTransformer.js","../constants/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","./CommonUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/CommonUtils.js","./Languages":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/Languages.js","./UploadTypes":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/UploadTypes.js","gtin-resolver":"gtin-resolver","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/Languages.js":[function(require,module,exports){
//TODO: CODE-REVIEW - why do we store the languages as array if we do lots of iterations and searches?
const languages = [
  {"code": "ar", "name": "Arabic", "nativeName": "العربية"},
  {"code": "bg", "name": "Bulgarian", "nativeName": "Български език"},
  {"code": "zh", "name": "Chinese", "nativeName": "中文 (Zhōngwén), 汉语, 漢語"},
  {"code": "hr", "name": "Croatian", "nativeName": "hrvatski"},
  {"code": "cs", "name": "Czech", "nativeName": "Česky, čeština"},
  {"code": "da", "name": "Danish", "nativeName": "Dansk"},
  {"code": "nl", "name": "Dutch", "nativeName": "Nederlands, Vlaams"},
  {"code": "en", "name": "English", "nativeName": "English"},
  {"code": "en-gb", "name": "English (UK)", "nativeName": "English"},
  {"code": "et", "name": "Estonian", "nativeName": "Eesti, eesti keel"},
  {"code": "fi", "name": "Finnish", "nativeName": "Suomi, suomen kieli"},
  {"code": "fr", "name": "French", "nativeName": "Français"},
  {"code": "ka", "name": "Georgian", "nativeName": "ქართული"},
  {"code": "de", "name": "German", "nativeName": "Deutsch"},
  {"code": "el", "name": "Greek, Modern", "nativeName": "Ελληνικά"},
  {"code": "he", "name": "Hebrew (modern)", "nativeName": "עברית"},
  {"code": "hi", "name": "Hindi", "nativeName": "हिन्दी, हिंदी"},
  {"code": "hu", "name": "Hungarian", "nativeName": "Magyar"},
  {"code": "id", "name": "Indonesian", "nativeName": "Bahasa Indonesia"},
  {"code": "is", "name": "Icelandic", "nativeName": "Islenska"},
  {"code": "it", "name": "Italian", "nativeName": "Italiano"},
  {"code": "ja", "name": "Japanese", "nativeName": "日本語 (にほんご／にっぽんご)"},
  {"code": "ko", "name": "Korean", "nativeName": "한국어 (韓國語), 조선말 (朝鮮語)"},
  {"code": "lt", "name": "Lithuanian", "nativeName": "Lietuvių kalba"},
  {"code": "lv", "name": "Latvian", "nativeName": "Latviešu valoda"},
  {"code": "mk", "name": "Macedonian", "nativeName": "Македонски јазик"},
  {"code": "no", "name": "Norwegian", "nativeName": "Norsk"},
  {"code": "pa", "name": "Panjabi, Punjabi", "nativeName": "ਪੰਜਾਬੀ, پنجابی‎"},
  {"code": "pl", "name": "Polish", "nativeName": "Polski"},
  {"code": "pt", "name": "Portuguese", "nativeName": "Português"},
  {"code": "pt-br", "name": "Portuguese (Brasil)", "nativeName": "Português (Brasil)"},
  {"code": "ro", "name": "Romanian", "nativeName": "Română"},
  {"code": "ru", "name": "Russian", "nativeName": "Русский язык"},
  {"code": "sr", "name": "Serbian", "nativeName": "Српски језик"},
  {"code": "sk", "name": "Slovak", "nativeName": "Slovenčina"},
  {"code": "sl", "name": "Slovenian", "nativeName": "Slovenščina"},
  {"code": "es", "name": "Spanish", "nativeName": "Español"},
  {"code": "es-419", "name": "Spanish (Latin-American)", "nativeName": "Español (latinoamericano)"},
  {"code": "sv", "name": "Swedish", "nativeName": "Svenska"},
  {"code": "th", "name": "Thai", "nativeName": "ไทย"},
  {"code": "tr", "name": "Turkish", "nativeName": "Türkçe"},
  {"code": "uk", "name": "Ukrainian", "nativeName": "Українська"},
  {"code": "vi", "name": "Vietnamese", "nativeName": "Tiếng Việt"}
];

function getListAsVM() {
  let result = [];
  languages.forEach(language => {
    result.push({label: language.name, value: language.code, disabled: false, selected: language.code === "en"});
  });

  return result;
}

function getLanguageFromCode(code) {
  const language = languages.find(language => language.code === code)
  if (typeof language === "undefined") {
    throw Error(`The language code ${code} does not match with any of the known languages.`)
  }
  return language;
}

function getLanguageFromName(name) {
  const language = languages.find(language => language.name.includes(name));
  if (typeof language === "undefined") {
    throw Error(`The language name ${name} does not match with any of the known languages.`)
  }
  return language;
}

function createVMItem(language) {
  return {label: language.name, value: language.code, nativeName: language.nativeName}
}

function normalizeLanguage(language) {
  switch (typeof language) {
    case "string":
      let normalizedLang;
      try {
        normalizedLang = getLanguageAsItemForVMFromCode(language);
      } catch (e) {
        normalizedLang = getLanguageAsItemForVMFromName(language);
      }
      return normalizedLang;

    case "object":
      if (typeof language.value !== "undefined") {
        return language;
      }
      if (typeof language.code !== "undefined") {
        return getLanguageAsItemForVMFromCode(language.code);
      }

      throw Error("Invalid language format");
    default:
      throw Error(`The language should be of type string or object. Provided type ${typeof language}`);
  }
}

function normalizeLanguages(languages) {
  return languages.map(language => normalizeLanguage(language));
}

function getAllLanguagesAsVMItems() {
  let result = [];
  languages.forEach(language => {
    result.push(createVMItem(language));
  });

  return result;
}

function getList() {
  return languages;
}

function getLanguageName(code) {
  let language = getLanguageFromCode(code);
  return language.name;
}

function getLanguageCode(name) {
  let language = getLanguageFromName(name);
  return language.code;
}

function getLanguageAsItemForVMFromCode(code) {
  const language = getLanguageFromCode(code);
  return createVMItem(language);
}

function getLanguageAsItemForVMFromName(name) {
  const language = getLanguageFromName(name);
  return createVMItem(language);
}

function getLanguagesAsVMItemsFromNames(languageNames) {
  const languages = languageNames.map(languageName => getLanguageFromName(languageName));
  const vmItems = languages.map(language => createVMItem(language));
  return vmItems;
}

function getLanguagesAsVMItemsFromCodes(codes) {
  const languages = codes.map(code => getLanguageFromName(code));
  const vmItems = languages.map(language => createVMItem(language));
  return vmItems;
}

function getLanguagesAsVMItems(languageList) {
  const vmItems = languageList.map(language => createVMItem(language));
  return vmItems;
}

function getLanguageCodes() {
  return languages.map(lang => {
    return lang.code
  })
}

function getLanguageRegex() {
  let langCodes = getLanguageCodes();
  let regexString = "^("
  langCodes.forEach(code => {
    regexString = regexString + code + "|"
  })
  regexString.slice(0, -1);
  regexString = regexString + ")$"
  return new RegExp(regexString);
}

module.exports = {
  getListAsVM,
  getList,
  getLanguageFromCode,
  getAllLanguagesAsVMItems,
  getLanguageName,
  getLanguageCode,
  getLanguageAsItemForVMFromCode,
  getLanguageAsItemForVMFromName,
  getLanguagesAsVMItemsFromNames,
  getLanguagesAsVMItemsFromCodes,
  getLanguagesAsVMItems,
  normalizeLanguages,
  getLanguageCodes,
  getLanguageRegex
}

},{}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/Lock.js":[function(require,module,exports){
class Lock {    
    constructor() {        
        this.queue = [];        
        this.locked = false;
    }       
    async acquire() {        
        const self = this;        
        if (self.locked) {            
            return new Promise(((resolve) => self.queue.push(resolve)));
        }        
        else {            
            self.locked = true;           
            return Promise.resolve();        
        }}        
    
    release() {        
        const self = this;        
        const next = self.queue.shift();        
        if(next) {            
            const cb = () => {
                next();
            };            
            if (typeof globalThis.window === 'undefined')                
                globalThis.process.nextTick(cb);            
            else                
                setTimeout(cb, 0);        
        }else {          
            self.locked = false;        
        } 
    }
}

module.exports = Lock;
},{}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/Locks.js":[function(require,module,exports){
const opendsu = require("opendsu");
const lockApi = opendsu.loadApi("lock");
const Lock = require("./Lock");
const _lock = new Lock();

async function acquireLock(resourceId, period) {
    const crypto = opendsu.loadApi("crypto");
    let secret = crypto.encodeBase58(crypto.generateRandom(32));

    let lockAcquired;
    await _lock.acquire();
    lockAcquired = await lockApi.lockAsync(resourceId, secret, period);
    _lock.release();

    if (!lockAcquired) {
        secret = undefined;
    }

    return secret;
}

async function releaseLock(resourceId, secret) {
    try {
        await lockApi.unlockAsync(resourceId, secret);
    } catch (err) {
        //if the unlock fails, the lock will be released after the expiration period set at the beginning.
    }
}

module.exports = {acquireLock, releaseLock};
},{"./Lock":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/Lock.js","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/LogUtils.js":[function(require,module,exports){
const constants = require("../constants/constants");
const utils = require("../utils/CommonUtils.js");
let instance;
const dbMessageFields = ["pk", "meta", "did", "__timestamp", "$loki", "context", "keySSI", "epiProtocol", "version"];
const crypto = require("opendsu").loadAPI("crypto");

function MappingLogService(storageService, logService) {
  this.storageService = storageService;
  this.logService = logService;

  this.getMappingLogs = (callback) => {
    this.storageService.filter(constants.IMPORT_LOGS, "__timestamp > 0", callback);
  }

  this.refreshAsync = async () => {
    if (typeof storageService.refresh === "function") {
      return await $$.promisify(storageService.refresh)();
    }
  };

  this.createLogInfoDSU = async (message, diffs) => {
    const openDSU = require("opendsu");
    const keyssi = openDSU.loadApi("keyssi");
    const scAPI = openDSU.loadAPI("sc");
    const vaultDomain = await $$.promisify(scAPI.getVaultDomain)();
    const seedSSI = keyssi.createTemplateSeedSSI(vaultDomain, undefined, undefined, "v0");
    let auditObj = {"logInfo": message};
    if (diffs) {
      auditObj["diffs"] = diffs
    }
    let auditData = JSON.stringify(auditObj);
    console.log(`Creating Log DSU. Storage is in progress ${this.storageService.batchInProgress()}`);
    const mainEnclave = await $$.promisify(scAPI.getMainEnclave)();
    console.log(`Batch in progress: ${mainEnclave.batchInProgress()}`);
    const enclaveAPI = openDSU.loadAPI("enclave");
    const memoryEnclave = enclaveAPI.initialiseMemoryEnclave();
    let rowDossier = await $$.promisify(memoryEnclave.createDSU)(undefined, seedSSI);
    $$.debug.logDSUEvent(rawDossier, `Is audit dsu`);
    let batchId = await rowDossier.safeBeginBatchAsync();
    await $$.promisify(rowDossier.writeFile)("/audit.json", auditData);
    await rowDossier.commitBatchAsync(batchId);
    let keySSI = await $$.promisify(rowDossier.getKeySSIAsString)();
    return keySSI
  }

  this.logSuccessAction = async (message, data, alreadyExists, diffs, DSU) => {
    if($$.uiProgressService){
      $$.uiProgressService.showProgress("Audit operation in progress. Please wait...");
    }
    let logData = getLogData(message, data, alreadyExists);
    logData.status = constants.SUCCESS_MAPPING_STATUS;
    let auditKeySSI = await this.createLogInfoDSU(message, diffs);
    logData.auditLogData.auditKeySSI = auditKeySSI;
    let keySSIObj = await $$.promisify(DSU.getKeySSIAsObject)();
    logData.auditLogData.anchorId = await $$.promisify(keySSIObj.getAnchorId)();
    const latestHashLink = await $$.promisify(DSU.getLatestAnchoredHashLink)();
    logData.auditLogData.hashLink = latestHashLink.getIdentifier();
    await logAction(logData);
    if($$.uiProgressService){
      $$.uiProgressService.closeProgress();
    }
    return logData;
  }

  this.logFailAction = async (message, data, status) => {
    if($$.uiProgressService){
      $$.uiProgressService.showProgress("Audit operation in progress. Please wait...");
    }
    let logData = getLogData(message, data || status, true, status);
    let logStatus = status ? status : constants.FAILED_MAPPING_STATUS;
    logData.status = logStatus;
    let auditKeySSI = await this.createLogInfoDSU(message);
    logData.auditLogData.auditKeySSI = auditKeySSI;

    logData.invalidFields = message.invalidFields;
    logData.auditLogData.logType = constants.LOG_TYPES.FAILED_ACTION;
    logData.auditLogData.status = logStatus;
    logData.auditLogData.reason = "Failed - See details";

    await logAction(logData);
    if($$.uiProgressService){
      $$.uiProgressService.closeProgress();
    }
    return logData;
  }

  let logAction = async (logData) => {
    let batchId = await this.storageService.startOrAttachBatchAsync();
    //we are trying to overwrite the pk to prevent audit log loss
    logData.pk = logData.itemCode + "|" + logData.timestamp + "|" + crypto.encodeBase58(crypto.generateRandom(8));

    if (typeof this.logService !== "undefined") {
      try{
        await $$.promisify(this.logService.log, this.logService)(logData.auditLogData);
      }catch(err){
        console.error("This case needs dev attention", err);
        await this.storageService.cancelBatchAsync(batchId);
        return;
      }
    }
    try {
      await $$.promisify(this.storageService.addIndex, this.storageService)(constants.IMPORT_LOGS, "__timestamp");
      await $$.promisify(this.storageService.insertRecord, this.storageService)(constants.IMPORT_LOGS, logData.pk, logData);
      await this.storageService.commitBatchAsync(batchId);
    } catch (e) {
      console.error("This case needs developer attention", e);
      await this.storageService.cancelBatchAsync(batchId);
    }
  }

  let cleanMessage = (message) => {
    let cleanMessage = JSON.parse(JSON.stringify(message));
    dbMessageFields.forEach(field => {
      if (field in cleanMessage) {
        delete cleanMessage[field]
      }
    })
    return cleanMessage;
  }

  this.getDiffsForAudit = (newData, prevData) => {
    if (prevData && (Array.isArray(prevData) || Object.keys(prevData).length > 0)) {
      prevData = cleanMessage(prevData);
      newData = cleanMessage(newData);

      let diffs = Object.keys(newData).reduce((diffs, key) => {
        if (JSON.stringify(prevData[key]) === JSON.stringify(newData[key])) return diffs
        return {
          ...diffs, [key]: {oldValue: prevData[key], newValue: newData[key]}
        }
      }, {})
      return diffs;
    }
  }

  let getLogData = (message, data, alreadyExists) => {
    message = cleanMessage(message);
    let resultObj = {
      itemCode: "unknown",
      itemType: "unknown",
      timestamp: new Date().getTime(),
      messageId: message.messageId || crypto.encodeBase58(crypto.generateRandom(32)),
      auditLogData: {
        username: message.senderId,
        auditId: message.messageId + "|" + message.senderId + "|" + message.messageDateTime
      },
      metadata: {}
    };
    let auditLogType = "";

    try {
      switch (message.messageType) {
        case constants.MESSAGE_TYPES.BATCH:
          resultObj.reason = alreadyExists ? "Edited Batch" : "Created Batch";
          resultObj.mappingLogMessage = alreadyExists ? "updated" : "created";
          resultObj.pk = utils.getBatchMetadataPK(message.batch.productCode, message.batch.batch);
          resultObj.itemCode = message.batch.batch || resultObj.itemCode;
          resultObj.itemType = message.messageType;
          resultObj.table = constants.BATCHES_STORAGE_TABLE;
          auditLogType = constants.LOG_TYPES.BATCH;
          resultObj.metadata.gtin = message.batch.productCode;
          break;
        case constants.MESSAGE_TYPES.PRODUCT:
          resultObj.reason = alreadyExists ? "Edited Product" : "Created Product";
          resultObj.mappingLogMessage = alreadyExists ? "updated" : "created";
          resultObj.pk = message.product.productCode;
          resultObj.itemCode = message.product.productCode || resultObj.itemCode;
          resultObj.itemType = message.messageType;
          resultObj.table = constants.PRODUCTS_TABLE;
          auditLogType = constants.LOG_TYPES.PRODUCT
          resultObj.metadata.gtin = message.product.productCode;
          break;
        case constants.MESSAGE_TYPES.PRODUCT_PHOTO:
          resultObj.reason = alreadyExists ? "Updated Product Photo" : "Edited Product Photo";
          resultObj.mappingLogMessage = alreadyExists ? "updated photo" : "created photo";
          resultObj.pk = message.productCode;
          resultObj.itemCode = message.productCode || resultObj.itemCode;
          resultObj.itemType = message.messageType;
          resultObj.table = constants.PRODUCTS_TABLE;
          auditLogType = constants.LOG_TYPES.PRODUCT_PHOTO;
          resultObj.metadata.attachedTo = "PRODUCT";
          resultObj.metadata.gtin = message.productCode;
          break;
        case constants.MESSAGE_TYPES.LEAFLET:
        case constants.MESSAGE_TYPES.PRESCRIBING_INFO:
        case constants.MESSAGE_TYPES.SMPC:
          let suffix = message.action === "add" ? "ed" : "d";
          let leafletStatus = message.action.charAt(0).toUpperCase() + message.action.slice(1) + suffix;

          const messageTypeMapping = {
            [constants.MESSAGE_TYPES.LEAFLET]: constants.EPI_TYPES_DESCRIPTION.LEAFLET,
            [constants.MESSAGE_TYPES.PRESCRIBING_INFO]: constants.EPI_TYPES_DESCRIPTION.PRESCRIBING_INFO,
            [constants.MESSAGE_TYPES.SMPC]: constants.EPI_TYPES_DESCRIPTION.SMPC
          }[message.messageType] || "Unknown";

          resultObj.reason = `${leafletStatus} ${messageTypeMapping}`; //message.messageType === constants.MESSAGE_TYPES.LEAFLET ? `${leafletStatus} Leaflet` : `${leafletStatus} SMPC`;
          resultObj.mappingLogMessage = `${leafletStatus} ${messageTypeMapping.toLowerCase()}`; //message.messageType === constants.MESSAGE_TYPES.LEAFLET ? `${leafletStatus} leaflet` : `${leafletStatus} SMPC`;
          resultObj.itemType = message.messageType;
          if (message.batchCode) {
            resultObj.metadata.attachedTo = "BATCH";
            resultObj.metadata.batch = message.batchCode;
            resultObj.itemCode = message.batchCode;
          } else {
            resultObj.metadata.attachedTo = "PRODUCT";
            resultObj.itemCode = message.productCode;
          }
          resultObj.metadata.gtin = message.productCode;
          auditLogType = constants.LOG_TYPES.LEAFLET_LOG;
          break;
        case constants.MESSAGE_TYPES.VIDEO_SOURCE:
          resultObj.reason = "Updated Video Source";
          resultObj.mappingLogMessage = "updated";
          resultObj.itemType = message.messageType;
          auditLogType = constants.LOG_TYPES.VIDEO_SOURCE;
          if (message.videos.batch) {
            resultObj.pk = message.videos.batch;
            resultObj.metadata.attachedTo = "BATCH";
            resultObj.metadata.batch = message.videos.batch;
            resultObj.itemCode = message.videos.batch;
            resultObj.table = constants.BATCHES_STORAGE_TABLE;
          } else {
            resultObj.pk = message.videos.productCode;
            resultObj.metadata.attachedTo = "PRODUCT";
            resultObj.itemCode = message.videos.productCode;
            resultObj.table = constants.PRODUCTS_TABLE;
          }
          resultObj.metadata.gtin = message.videos.productCode;
          break;
        case constants.MESSAGE_TYPES.RECOVER:
          resultObj.pk = message.pk;
          resultObj.reason = message.reason || "Recovery action";
          resultObj.mappingLogMessage = "success";
          resultObj.itemCode = message.itemCode || resultObj.itemCode;
          resultObj.metadata.gtin = "unknown";
          if (message.batch) {
            resultObj.metadata.gtin = message.batch.gtin;
            resultObj.metadata.batch = message.batch.batch;
          }
          if (message.product) {
            resultObj.metadata.gtin = message.product.gtin;
          }
          resultObj.itemType = message.messageType || "unknown";
          auditLogType = constants.LOG_TYPES.RECOVER;
          break;
        default:
          throw new Error("Unknown message type");
      }
    } catch (err) {
      resultObj.reason = "Edit action";
      resultObj.mappingLogMessage = "failed";
      resultObj.itemCode = resultObj.itemCode || "unknown";
      resultObj.itemType = message.messageType || "unknown";
      resultObj.metadata.failReason = err.message;
      auditLogType = constants.LOG_TYPES.FAILED_ACTION;
    }

    resultObj.auditLogData.reason = resultObj.reason;
    resultObj.auditLogData.itemCode = resultObj.itemCode;
    resultObj.auditLogData.logType = auditLogType;
    resultObj.auditLogData.metadata = resultObj.metadata;
    resultObj.auditLogData.gtin = resultObj.metadata.gtin;
    return resultObj;
  }
}

module.exports = {
  createInstance: function (storageService, logService) {
    if (!instance) {
      instance = new MappingLogService(storageService, logService);
    }
    return instance;
  }
}
},{"../constants/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","../utils/CommonUtils.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/CommonUtils.js","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/UploadTypes.js":[function(require,module,exports){
const {EPI_TYPES_DESCRIPTION, EPI_TYPES} = require("../constants/constants");

let types = [
  {name: "Leaflet", code: "leaflet", disabled: false, selected: false},
  {name: "SMPC", code: "smpc", disabled: false, selected: false}
];

module.exports = {
  getList() {
    return types;
  },
  getEpiTypeDescription(ePIType) {
    const key = Object.keys(EPI_TYPES).find(k => EPI_TYPES[k] === ePIType);
    return key ? EPI_TYPES_DESCRIPTION[key] : undefined;
  },
  getListAsVM(disabledFeatures) {
    let result = [];
    result.push({label: "Select a type", value: "", disabled: true, selected: false});
    if (disabledFeatures && disabledFeatures.length > 0) {
      disabledFeatures.forEach(feature => {
        types = types.map(item => {
          if (item.code === feature) {
            item.disabled = true;
          }
          return item;
        })
      })
    }
    types.forEach(type => {
      result.push({label: type.name, value: type.code, disabled: type.disabled, selected: type.selected});
    });

    let index = result.findIndex(item => item.disabled === false);
    if (index >= 0) {
      result[index].selected = true;
    }

    return result;
  },
  getLanguage(code) {
    return types.find(language => language.code === code).name;
  }
}

},{"../constants/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js"}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/ValidationUtils.js":[function(require,module,exports){
const errMap = require("opendsu").loadApi("m2dsu").getErrorsMap();

const errorUtils = require("../mappings/errors/errorUtils");
errorUtils.addMappingError("MVP1_RESTRICTED");

const itemValidator = function (messageValue, schemaObj, schemaKey) {

    if (messageValue && typeof messageValue === "string") {
        messageValue = messageValue.trim()
    }

    if ((typeof messageValue === "string") && messageValue && !validateForHTMLTags(messageValue)) {
        invalidFields.push({field: schemaKey, message: `HTML tags are not allowed`});
        return;
    }

    /*    if (!schemaObj.required && (schemaObj.type === "array" || schemaObj.type === "object") && !messageValue) {
            invalidFields.push({
                field: schemaKey,
                message: `Wrong type. Found ${typeof messageValue} , expected ${schemaObj.type}`
            });
            return;
        }*/

    if (!schemaObj.required && !messageValue) {
        return;
    }

    if (schemaObj.required && (!messageValue || ((typeof messageValue === "string") && !messageValue.trim()))) {
        invalidFields.push({field: schemaKey, message: `Required field`});
        return;
    }

    if (schemaObj.regex && !schemaObj.regex.test(messageValue)) {
        if (schemaKey === "messageTypeVersion") {
            invalidFields.push({field: schemaKey, message: `Wrong message version.`});
            return;
        }
        if (schemaKey === "marketId") {
            invalidFields.push({field: schemaKey, message: `not recognized`});
            return;
        }

        invalidFields.push({field: schemaKey, message: `Invalid format`});

        return;
    }
    
    if(schemaObj.type.toLowerCase().trim() === "date") {
        function isValidDate(date) {
            return date instanceof Date && !isNaN(date);
        }
        if(!isValidDate(new Date(messageValue))) {
            invalidFields.push({
                field: schemaKey,
                message: `Wrong date or date format`
            });
        }  
        return;
    } 

    if (schemaObj.type === "batchDate") {
        let resultDate;
        let wrongLastDay = false;
        if (messageValue.length === 6) {
            let year = "20" + messageValue.slice(0, 2);
            let month = messageValue.slice(2, 4);
            let day = messageValue.slice(4, 6);
            if (day === "00") {
                day = "01";
            }
            resultDate = new Date(`${year}/${month}/${day}`);
            wrongLastDay = resultDate.getMonth() + 1 !== parseInt(month);
        }
        if (!resultDate || resultDate.toString() === "Invalid Date" || wrongLastDay) {
            invalidFields.push({
                field: schemaKey,
                message: `Wrong date or date format`
            });
        }

        return;
    }

    if ((schemaObj.type !== "array" && schemaObj.type !== typeof messageValue) || (schemaObj.type === "array" && !Array.isArray(messageValue))) {
        invalidFields.push({
            field: schemaKey,
            message: `Wrong type. Found ${typeof messageValue} , expected ${schemaObj.type}`
        });
        return;
    }
}

const schemaParser = function (message, schema) {
    const schemaObject = schema.properties;
    const schemaKeys = Object.keys(schemaObject);
    for (let i = 0; i < schemaKeys.length; i++) {
        const schemaKey = schemaKeys[i];
        if (schemaObject[schemaKey].type === "object") {
            if (!message[schemaKey]) {
                itemValidator(message[schemaKey], schemaObject[schemaKey], schemaKey);
            } else {
                schemaParser(message[schemaKey], schemaObject[schemaKey]);
            }
        }
        if (schemaObject[schemaKey].type === "array") {
            if (Array.isArray(message[schemaKey]) && message[schemaKey].length >= 0) {
                message[schemaKey].forEach(msg => {
                    if (schemaObject[schemaKey].items.type === "object" && typeof msg === "object") {
                        schemaParser(msg, schemaObject[schemaKey].items)
                    } else {
                        itemValidator(msg, schemaObject[schemaKey].items, schemaKey);
                    }

                })
            } else if (schemaObject[schemaKey].required) {
                if (message[schemaKey]) {
                    invalidFields.push({
                        field: schemaKey,
                        message: `Wrong type. Found ${typeof message[schemaKey]} , expected ${schemaObject.type}`
                    });
                    return;
                } else {
                    invalidFields.push({field: schemaKey, message: `Required field`});
                    return;
                }
            } else if (typeof message[schemaKey] !== "undefined") {
                invalidFields.push({
                    field: schemaKey,
                    message: `Wrong type. Found ${typeof message[schemaKey]} , expected ${schemaObject.type}`
                });
                return;
            }
        }

        if (schemaObject[schemaKey].type !== "object" && schemaObject[schemaKey].type !== "array") {
            if (!message[schemaKey] && schemaObject[schemaKey].defaultValue) {
                message[schemaKey] = schemaObject[schemaKey].defaultValue;
            } else {
                itemValidator(message[schemaKey], schemaObject[schemaKey], schemaKey);
            }
        }
    }

}
let invalidFields;
const validateMsgOnSchema = function (message, schema) {
    invalidFields = [];
    schemaParser(message, schema);
    if (invalidFields.length > 0) {
        return {
            valid: false, invalidFields: invalidFields
        }
    }
    return {
        valid: true
    }
}

async function validateMessageOnSchema(message, schema) {
    const msgValidation = validateMsgOnSchema(message, schema);
    if (!msgValidation.valid) {
        message.invalidFields = msgValidation.invalidFields;
        throw errMap.newCustomError(errMap.errorTypes.INVALID_MESSAGE_FORMAT, msgValidation.invalidFields);
    }
    return msgValidation;
}

const MVP1_DISABLED_DEFAULT_VALUES_MAP = {
    "flagEnableAdverseEventReporting": false,
    "flagEnableACFProductCheck": false,
    "healthcarePractitionerInfo": "SmPC",
    "snValid": [],
    "snRecalled": [],
    "snDecom": [],
    "flagEnableBatchRecallMessage": false,
    "flagEnableSNVerification": false,
    "flagEnableEXPVerification": false,
    "flagEnableExpiredEXPCheck": true,
    "recallMessage": "",
    "batchMessage": "",
    "flagEnableACFBatchCheck": false,
    "acdcAuthFeatureSSI": "",
    "acfBatchCheckURL": false,
    "snValidReset": false,
    "snRecalledReset": false,
    "snDecomReset": false
}

async function validateMVP1Values(message, messageType) {
    const featManager = require("./../DSUFabricFeatureManager.js");
    if (await featManager.isFeatureEnabledAsync("02")) {
        //for demo system we need to escape any MVP1 validation
        return;
    }

    let invalidFields = [];
    if (messageType === "videos") {
        throw errMap.newCustomError(errMap.errorTypes.MVP1_RESTRICTED, "videos");
    }
    let msg = message[messageType];
    Object.keys(MVP1_DISABLED_DEFAULT_VALUES_MAP).forEach(key => {
        if (msg[key] && JSON.stringify(msg[key]) !== JSON.stringify(MVP1_DISABLED_DEFAULT_VALUES_MAP[key])) {
            invalidFields.push({
                field: key,
                message: `MVP1 wrong filed value, expected: ${MVP1_DISABLED_DEFAULT_VALUES_MAP[key]}`
            });
        }
    })
    if (invalidFields.length > 0) {
        message.invalidFields = invalidFields;
        throw errMap.newCustomError(errMap.errorTypes.INVALID_MESSAGE_FORMAT, invalidFields);
    }
}

function validateGTIN(gtinValue) {
    const gtinMultiplicationArray = [3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3];
    const pattern = /^\d+$/;
    if (!pattern.test(gtinValue)) {
        return {isValid: false, message: "GTIN should be a numeric value"};
    }
    let gtinDigits = gtinValue.split("");

    // TO DO this check is to cover all types of gtin. For the moment we support just 14 digits length. TO update also in leaflet-ssapp
    /*
    if (gtinDigits.length !== 8 && gtinDigits.length !== 12 && gtinDigits.length !== 13 && gtinDigits.length !== 14) {

      return {isValid: false, message: "GTIN length should be 8, 12, 13 or 14"};
    }
    */

    if (gtinDigits.length !== 14) {
        return {isValid: false, message: "GTIN length should be 14"};
    }
    let j = gtinMultiplicationArray.length - 1;
    let reszultSum = 0;
    for (let i = gtinDigits.length - 2; i >= 0; i--) {
        reszultSum = reszultSum + gtinDigits[i] * gtinMultiplicationArray[j];
        j--;
    }
    let validDigit = Math.floor((reszultSum + 10) / 10) * 10 - reszultSum;
    if (validDigit === 10) {
        validDigit = 0;
    }
    if (gtinDigits[gtinDigits.length - 1] != validDigit) {
        return {isValid: false, message: "Invalid GTIN. Last digit should be " + validDigit};
    }

    return {isValid: true, message: "GTIN is valid"};
}

function validateForHTMLTags(text) {
    let htmlTagPattern = /<(br|basefont|hr|input|source|frame|param|area|meta|!DOCTYPE).*?>|<(a|abbr|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|html|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video).*?>/i;
    // Check for HTML tags
    if (htmlTagPattern.test(text)) {
        return false;
    }
    return true;
}

module.exports = {
    validateMessageOnSchema,
    validateGTIN,
    validateMVP1Values
}


},{"../mappings/errors/errorUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/errors/errorUtils.js","./../DSUFabricFeatureManager.js":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/DSUFabricFeatureManager.js","opendsu":false}],"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/htmlSanitize.js":[function(require,module,exports){
const checkIfBase64 = (str) => {
    const regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/g;
    return regex.test(str);
}

const sanitize = (html) => {
    let clone = html;
    if ($$.Buffer.isBuffer(clone)) {
        clone = clone.toString();
    }

    if (checkIfBase64(clone)) {
        clone = $$.Buffer.from(clone, "base64").toString();
    }
    const regex = /(<iframe>([\s\S]*)<\/iframe>)|(<script>([\s\S]*)<\/script>)/g;

    if (regex.test(clone)) {
        throw Error(`The html contains forbidden tags`);
    }

    return html;
}

module.exports = {
    sanitize
}
},{}],"gtin-resolver":[function(require,module,exports){
const openDSU = require("opendsu");
const resolver = openDSU.loadApi("resolver");
const GtinDSUFactory = require("./lib/GTIN_DSU_Factory");

resolver.registerDSUFactory("gtin", new GtinDSUFactory(resolver));
const {createGTIN_SSI, parseGTIN_SSI} = require("./lib/GTIN_SSI");
const DSUFabricFeatureManager = require("./lib/DSUFabricFeatureManager");
const LeafletFeatureManager = require("./lib/LeafletFeatureManager");
const LeafletInfoService = require("./lib/services/LeafletInfoService");
const DSUFabricUtils = require("./lib/utils/DSUFabricUtils");
const Languages = require("./lib/utils/Languages");
const Countries = require("./lib/utils/Countries");
const UploadTypes = require("./lib/utils/UploadTypes");
const XMLDisplayService = require("./lib/services/XMLDisplayService/XMLDisplayService");
const utils = require("./lib/utils/CommonUtils");
const logUtils = require("./lib/utils/LogUtils");
const validationUtils = require("./lib/utils/ValidationUtils");
const versionTransformer = require("./lib/EpiVersionTransformer")
const constants = require("./lib/constants/constants");
const EPISORClient = require("./lib/integrationAPIs/clients/EpiSORIntegrationClient");

module.exports = {
    createGTIN_SSI,
    parseGTIN_SSI,
    DSUFabricFeatureManager,
    LeafletFeatureManager,
    LeafletInfoService,
    DSUFabricUtils,
    UploadTypes,
    Languages,
    Countries,
    utils,
    logUtils,
    validationUtils,
    versionTransformer,
    constants,
    XMLDisplayService,
    loadApi: function (apiName) {
        switch (apiName) {
            case "mappings":
                return require("./lib/mappings");
            case "services":
                return require("./lib/services");
        }
    },
    getEPIMappingEngineForAPIHUB: function (server) {
        return require("./lib/apihubMappingEngine").getEPIMappingEngineForAPIHUB(server);
    },
    getEPIMappingEngineMessageResults: function (server) {
        return require("./lib/apihubMappingEngineMessageResults").getEPIMappingEngineMessageResults(server);
    },
    getWebLeaflet: function (server) {
        return require("./lib/leaflet-web-api").getWebLeaflet(server);
    },
    getGTINOwner: function (server) {
        return require("./lib/gtinOwner").getGTINOwner(server);
    },
    getMetadata: function (server) {
        return require("./lib/metadata").getMetadata(server);
    },
    getFixedUrl: function (server) {
        return require("./lib/fixed-urls").getFixedUrl(server);
    },
    getMessagesPipe: function () {
        const opendsu = require("opendsu");
        return opendsu.loadApi("m2dsu").getMessagesPipe();
    },
    getErrorsMap: function () {
        return require("opendsu").loadApi("m2dsu").getErrorsMap();
    },
    getMappingsUtils: function () {
        return require("./lib/utils/CommonUtils");
    },
    getEPISorClient: function (domain, subdomain, appName) {
        const EPISORClient = require("./lib/integrationAPIs/clients/EpiSORIntegrationClient");
        return EPISORClient.getInstance(domain, subdomain, appName);
    },
    getHealthCheckClient: function () {
        const HealthCheckClient = require("./lib/healthCheckAPIs/controllers/APIClient");
        return HealthCheckClient.getInstance();
    },
    getIntegrationAPIs: function (server) {
        return require("./lib/integrationAPIs")(server);
    },
    getHealthCheckAPIs: function (server) {
        return require("./lib/healthCheckAPIs")(server);
    }
}


},{"./lib/DSUFabricFeatureManager":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/DSUFabricFeatureManager.js","./lib/EpiVersionTransformer":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/EpiVersionTransformer.js","./lib/GTIN_DSU_Factory":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/GTIN_DSU_Factory.js","./lib/GTIN_SSI":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/GTIN_SSI.js","./lib/LeafletFeatureManager":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/LeafletFeatureManager.js","./lib/apihubMappingEngine":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/apihubMappingEngine/index.js","./lib/apihubMappingEngineMessageResults":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/apihubMappingEngineMessageResults/index.js","./lib/constants/constants":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/constants/constants.js","./lib/fixed-urls":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/fixed-urls/index.js","./lib/gtinOwner":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/gtinOwner/index.js","./lib/healthCheckAPIs":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/healthCheckAPIs/index.js","./lib/healthCheckAPIs/controllers/APIClient":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/healthCheckAPIs/controllers/APIClient.js","./lib/integrationAPIs":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/index.js","./lib/integrationAPIs/clients/EpiSORIntegrationClient":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/integrationAPIs/clients/EpiSORIntegrationClient.js","./lib/leaflet-web-api":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/leaflet-web-api/index.js","./lib/mappings":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/mappings/index.js","./lib/metadata":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/metadata/index.js","./lib/services":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/index.js","./lib/services/LeafletInfoService":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/LeafletInfoService.js","./lib/services/XMLDisplayService/XMLDisplayService":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/services/XMLDisplayService/XMLDisplayService.js","./lib/utils/CommonUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/CommonUtils.js","./lib/utils/Countries":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/Countries.js","./lib/utils/DSUFabricUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/DSUFabricUtils.js","./lib/utils/Languages":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/Languages.js","./lib/utils/LogUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/LogUtils.js","./lib/utils/UploadTypes":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/UploadTypes.js","./lib/utils/ValidationUtils":"/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/lib/utils/ValidationUtils.js","opendsu":false}]},{},["/home/runner/work/epi-workspace-for-snyk-scan/epi-workspace-for-snyk-scan/epi-workspace/gtin-resolver/builds/tmp/gtinResolver_intermediar.js"])
                    ;(function(global) {
                        global.bundlePaths = {"gtinResolver":"build/bundles/gtinResolver.js"};
                    })(typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
                