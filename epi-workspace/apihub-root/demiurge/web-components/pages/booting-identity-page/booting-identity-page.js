import utils from "./../../../utils.js";
import AppManager from "./../../../services/AppManager.js";
import {getPermissionsWatcher} from "./../../../services/PermissionsWatcher.js";
export class BootingIdentityPage {
    constructor(element, invalidate) {
        this.element = element;
        this.invalidate = invalidate;
        this.invalidate(async () => {
            let appManager = AppManager.getInstance();
            this.userDetails = await utils.getUserDetails();
            this.username = userDetails.username;
            if (await appManager.didWasCreated()) {
                await this.checkPermissionAndNavigate();
                return;
            }

            //if the wallet was not created yet we should ensure that the user id is email format to prevent SSO misconfiguration
            let emailValidation = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailValidation.test(this.username)) {
                this.validationFailed = true;
                return webSkel.notificationHandler.reportUserRelevantError("Detected User Id is not a valid email address format! Contact the SSO admin in order to make corrections.");
            }
        });
    }

    beforeRender() {
        document.querySelector("sidebar-menu").style.display = "none";
    }

    afterRender() {
        let appManager = AppManager.getInstance();
        appManager.didWasCreated().then(wasCreated => {
            if (wasCreated || this.validationFailed) {
                document.querySelector(".create-identity-button").setAttribute("disabled", "disabled");
                document.querySelector(".create-identity-button").classList.add("disabled");
            }
        });
    }

    async checkPermissionAndNavigate() {
        let appManager = AppManager.getInstance();
        let navigate = async () => {
            let currentState = utils.detectCurrentPage();
            if (currentState.currentPage !== "booting-identity-page") {
                appManager.getWalletAccess(currentState.currentPage);
                return;
            }

            document.querySelector("sidebar-menu").style.display = "flex";
            appManager.getWalletAccess("groups-page");
        }
        let permissionWatcher = getPermissionsWatcher(await appManager.getDID(), navigate);
        if (await permissionWatcher.checkAccess()) {
            navigate();
        } else {
            permissionWatcher.setupIntervalCheck();
            await webSkel.showModal("waiting-access-modal", false);
        }
    }

    async createIdentity(_target) {
        if (this.validationFailed) {
            //if user id validation we should not allow the DID creation
            return;
        }
        _target.classList.add("disabled-btn");
        _target.innerHTML = `<i class="fa fa-circle-o-notch fa-spin" style="font-size:18px; width: 18px; height: 18px;"></i>`;
        _target.classList.add("remove");
        let appManager = AppManager.getInstance();

        let identity;
        try {
            identity = await appManager.createIdentity(this.userDetails);
        } catch (err) {
            webSkel.notificationHandler.reportUserRelevantError("Failed to create identity", err);
        }
        if (appManager.firstTimeAndFirstAdmin) {
            await webSkel.showModal("break-glass-recovery-code-modal", true);
            //  await webSkel.changeToDynamicPage("groups-page");
        }
        await this.checkPermissionAndNavigate();

    }
}
