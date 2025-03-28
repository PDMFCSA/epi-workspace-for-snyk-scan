import {getUserDetails, loadPage, getSSOId, setHealthyAuthorizationInfo} from "../../../utils/utils.js";
import {getPermissionsWatcher} from "../../../services/PermissionsWatcher.js";
import env from "../../../environment.js";
import HistoryGateKeeper from "../../../services/HistoryGateKeeper.js";

const openDSU = require("opendsu");
const keySSISpace = openDSU.loadAPI("keyssi");
const crypto = openDSU.loadAPI("crypto");
const scAPI = openDSU.loadAPI("sc");
const w3cDID = openDSU.loadAPI("w3cdid");
const resolver = openDSU.loadAPI("resolver");
const systemAPI = openDSU.loadAPI("system");
const DEFAULT_PIN = "1qaz";
const MIGRATION_STATUS = {
    NOT_STARTED: "not_started",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed"
}

export class LandingPage {
    constructor(element, invalidate) {
        this.element = element;
        this.invalidate = invalidate;
        this.sourcePage = this.element.getAttribute("data-source-page");
        this.invalidate(async () => {
            const migrationStatus = await this.getMigrationStatus();
            if (migrationStatus === MIGRATION_STATUS.NOT_STARTED) {
                alert("Migration is needed. Please access the Demiurge Wallet or ask your administrator to access it then refresh this page.");
                return;
            }

            if(migrationStatus === MIGRATION_STATUS.IN_PROGRESS){
                alert("Migration is in progress. Please wait for the process to complete.");
                return;
            }

            try {
                this.encryptedSSOSecret = await this.getSSOSecret();
            } catch (e) {
                console.log("generate new secret")
                this.encryptedSSOSecret = await this.putSSOSecret();
            }

            const versionlessSSI = keySSISpace.createVersionlessSSI(undefined, `/${this.getSSODetectedId()}`, this.deriveEncryptionKey(this.encryptedSSOSecret));
            try {
                const dsu = await this.loadWallet();
                let envJson = await dsu.readFileAsync("environment.json");
                envJson = JSON.parse(envJson);
                console.log(envJson);
                env.WALLET_MAIN_DID = envJson.WALLET_MAIN_DID;
                env.enclaveKeySSI = envJson.enclaveKeySSI;
                env.enclaveType = envJson.enclaveType;
                env.enclaveDID = envJson.enclaveDID;
            } catch (e) {
                // No previous version wallet found
            }
            let mainDSU;
            try {
                mainDSU = await $$.promisify(resolver.loadDSU)(versionlessSSI);
            } catch (error) {
                if(error.rootCause === openDSU.constants.ERROR_ROOT_CAUSE.NETWORK_ERROR) {
                    alert("Network error");
                    $$.forceTabRefresh();
                    return;
                }
                try {
                    mainDSU = await $$.promisify(resolver.createDSUForExistingSSI)(versionlessSSI);
                    await $$.promisify(mainDSU.writeFile)('environment.json', JSON.stringify(env));
                } catch (e) {
                    console.log(e);
                }
            }

            scAPI.setMainDSU(mainDSU);
            const sc = scAPI.getSecurityContext();
            if (sc.isInitialised()) {
                return await this.getWalletAccess();
            }
            sc.on("initialised", async () => {
                console.log("Initialised");
                return await this.getWalletAccess();
            });
        });
    }

    getMigrationStatus = async () => {
        let response = await fetch(`${window.location.origin}/getMigrationStatus`);
        if (response.status !== 200) {
            throw new Error(`Failed to check if migration is needed. Status: ${response.status}`);
        }
        let migrationStatus = await response.text();
        return migrationStatus;
    }
    deriveEncryptionKey = (key) => {
        return crypto.deriveEncryptionKey(key);
    }
    getSSODetectedId = () => {
        return getSSOId("SSODetectedId");
    }

    getSSOUserId = () => {
        return getSSOId("SSOUserId");
    }
    putSSOSecret = async () => {
        let secret = crypto.generateRandom(32).toString("base64");
        let encrypted = this.encrypt(DEFAULT_PIN, secret);
        let putData = {secret: JSON.stringify(JSON.parse(encrypted).data)};
        const url = `${systemAPI.getBaseURL()}/putSSOSecret/${env.appName}`;
        try {
            await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(putData)
            });
        } catch (e) {
            console.log(e);
        }
        return putData.secret;
    }

    getSSOSecret = async () => {
        const url = `${systemAPI.getBaseURL()}/getSSOSecret/${env.appName}`;
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Secret not found");
            }

            throw new Error(`Failed to get secret: ${response.status}`);
        }
        const encryptedSecret = await response.text();
        return encryptedSecret;
    }

    encrypt(key, dataObj) {
        const encryptionKey = crypto.deriveEncryptionKey(key);
        const encryptedCredentials = crypto.encrypt(JSON.stringify(dataObj), encryptionKey);
        return JSON.stringify(encryptedCredentials);
    }

    decrypt(key, encryptedData) {
        const encryptionKey = crypto.deriveEncryptionKey(key);
        const decryptData = crypto.decrypt($$.Buffer.from(JSON.parse(encryptedData)), encryptionKey);
        return JSON.parse(decryptData.toString());
    }

    getWalletSecretsArray(encryptedSSOSecret) {
        const ssoSecret = this.decrypt(DEFAULT_PIN, encryptedSSOSecret);
        return [this.getSSODetectedId(), this.getSSOUserId(), ssoSecret, env.appName];
    }

    loadWallet = async () => {
        let resolver = require("opendsu").loadApi("resolver");
        let keyssi = require("opendsu").loadApi("keyssi");
        let walletSSI = keyssi.createTemplateWalletSSI(env.vaultDomain, this.getWalletSecretsArray(this.encryptedSSOSecret));
        const constDSU = await $$.promisify(resolver.loadDSU)(walletSSI);
        return constDSU.getWritableDSU();
    }

    createDID = async () => {
        const userDetails = getUserDetails();
        const vaultDomain = await $$.promisify(scAPI.getVaultDomain)();
        const openDSU = require("opendsu");
        const config = openDSU.loadAPI("config");
        let appName = await $$.promisify(config.getEnv)("appName");
        let userId = `${appName}/${userDetails}`;
        let didDocument;
        let shouldPersist = false;
        const mainDID = await scAPI.getMainDIDAsync();
        const healDID = async (didIdentifier)=>{
            try {
                didDocument = await $$.promisify(w3cDID.resolveDID)(didIdentifier);
                // try to sign with the DID to check if it's valid
                await $$.promisify(didDocument.sign)("test");
            } catch (e) {
                console.log(`Failed to resolve DID. Error: ${e.message}`)
                let response = await fetch(`${window.location.origin}/resetUserDID/${vaultDomain}`, {method: "DELETE"});
                if (response.status !== 200) {
                    console.log(`Failed to reset DID. Status: ${response.status}`);
                }
                try {
                    didDocument = await $$.promisify(w3cDID.createIdentity)("ssi:name", vaultDomain, userId);
                    shouldPersist = true;
                } catch (e) {
                    throw new Error(`Failed to create DID. Error: ${e.message}`);
                }
            }
        }
        if (mainDID) {
            await healDID(mainDID);
        } else {
            const didIdentifier = `did:ssi:name:${vaultDomain}:${userId}`;
            await healDID(didIdentifier);
            shouldPersist = true;
        }
        if (shouldPersist) {
            let batchId;
            let mainEnclave;
            try {
                mainEnclave = await $$.promisify(scAPI.getMainEnclave)();
                batchId = await mainEnclave.startOrAttachBatchAsync();
                await scAPI.setMainDIDAsync(didDocument.getIdentifier());
                await mainEnclave.commitBatchAsync(batchId);
            } catch (e) {
                const writeKeyError = createOpenDSUErrorWrapper(`Failed to write key`, e);
                try {
                    await mainEnclave.cancelBatchAsync(batchId);
                } catch (error) {
                    throw createOpenDSUErrorWrapper(`Failed to cancel batch`, error, writeKeyError);
                }
                throw writeKeyError;
            }
        }
        return didDocument.getIdentifier();
    }

    getWalletAccess = async () => {
        await webSkel.showLoading();
        try {
            let did = await this.createDID();

            if (this.sourcePage === "#landing-page" || this.sourcePage === "#generate-did-page") {
                this.sourcePage = "#home-page";
            }

            const credential = await setHealthyAuthorizationInfo();
            getPermissionsWatcher(did, async () => {
                await webSkel.appServices.addAccessLog(did);
                await loadPage(this.sourcePage);
            }, credential);

            HistoryGateKeeper.init();
        } catch (err) {
            webSkel.notificationHandler.reportUserRelevantError("Failed to initialize wallet", err);
            setTimeout(() => {
                window.disableRefreshSafetyAlert = true;
                window.location.reload()
            }, 2000)
        }
    }


    beforeRender() {

    }

    afterRender() {
    }

}
