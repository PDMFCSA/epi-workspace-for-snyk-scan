import environment from "../environment.js";
import {parseGS1Code} from "../utils.js";

const appPages = ["main.html", "scan.html", "leaflet.html", "error.html", "about-page.html", "help-page.html", "privacy-page.html", "terms-page.html"];

window.onload = () => {
    try {
        let urlParts = location.href.split(location.origin)[1].split("/").filter(function (item) {
            return item !== "";
        })

        let pageWithQuery = urlParts[urlParts.length - 1].split("?");
        let page = pageWithQuery[0];
        let query = pageWithQuery[1]

        if (appPages.indexOf(page) === -1) {
            validateAndRedirect(constructUrl("main.html"));
        } else {
            validateAndRedirect(constructUrl(page, query));
        }

    } catch (e) {
        goTo404ErrPage()
    }
}

function getGS1Url() {
    let gs1Url;
    let retrievedURL;
    if (document.referrer && window.location.href.includes("404-errors")) {
        retrievedURL = document.referrer;
    } else {
        retrievedURL = window.location.href;
    }
    try {
        let gs1DLinkObject = parseGS1Code(retrievedURL);
        if (gs1DLinkObject && gs1DLinkObject.gtin) {
            gs1Url = `/leaflet.html?gtin=${gs1DLinkObject.gtin}`
            if (gs1DLinkObject.batchNumber) {
                gs1Url = gs1Url + `&batch=${gs1DLinkObject.batchNumber}`
            }
            if (gs1DLinkObject.expiry) {
                gs1Url = gs1Url + `&expiry=${gs1DLinkObject.expiry}`
            }
        }
    } catch (e) {
        console.log(e);
    }
    return gs1Url;
}

function goTo404ErrPage() {
    let pageUrl = "/404.html";
    let err404Page = `/app${pageUrl}`;
    if (environment.enableRootVersion) {
        err404Page = `/${environment.appBuildVersion}${pageUrl}`;
    }
    window.location.href = window.location.origin + err404Page;
}

function constructUrl(page, query) {
    let gs1Url = getGS1Url();

    if (gs1Url) {
        return `${window.location.origin}/${environment.appBuildVersion}${gs1Url}`;
    }

    return query ? `${window.location.origin}/${environment.appBuildVersion}/${page}?${query}` : `${window.location.origin}/${environment.appBuildVersion}/${page}`
}

function validateAndRedirect(url) {
    if (url.startsWith(`${window.location.origin}/${environment.appBuildVersion}`)) {
        window.location.href = url;
    } else {
        throw new Error("Invalid or potentially harmful URL.")
    }
}
