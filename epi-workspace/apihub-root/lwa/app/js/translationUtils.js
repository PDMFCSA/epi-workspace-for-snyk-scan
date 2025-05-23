import {setTextDirectionForLanguage, setPageTitle} from "../../utils.js";
import constants from "../../constants.js";

function getLangSubtypesMap(languageCodesMap) {
    let result = {}
    Object.keys(languageCodesMap).forEach(key => {
        languageCodesMap[key].forEach(langSubtype => {
            result[langSubtype] = key
        })
    });
    return result
}

// export const supportedLanguageCodesMap = {
//     'ar': ["ar-ae", "ar-bh", "ar-dz", "ar-eg", "ar-iq", "ar-jo", "ar-kw", "ar-lb", "ar-ly", "ar-ma", "ar-om", "ar-qa", "ar-sa", "ar-sy", "ar-tn", "ar-ye"],
//     'bg': ["bg-bg"],
//     'cs': ["cs-cz"],
//     'da': ["da-dk"],
//     'de': ["de-de", "de-li", "de-at", "de-ch", "de-be"],
//     'el': ["el-gr"],
//     'en': ["en-au", "en-bz", "en-ca", "en-gb", "en-ie", "en-jm", "en-nz", "en-ph", "en-tt", "en-us", "en-za", "en-zw", "en-in", "en-sg"],
//     'es': ["es-es"],
//     'es-419': ["es-419", "es-ar", "es-bo", "es-cl", "es-co", "es-cr", "es-do", "es-ec", "es-gt", "es-mx", "es-ni", "es-pa", "es-pe", "es-pr", "es-py", "es-sv", "es-us", "es-uy", "es-ve"],
//     'et': ["et-ee"],
//     'fi': ["fi-fi"],
//     'fr': ["fr-be", "fr-ca", "fr-fr","fr-ch"],
//     'hr': ["hr-ba", "hr-hr"],
//     'hu': ["hu-hu"],
//     'it': ["it-ch", "it-it"],
//     'ko': ["ko-kr"],
//     'lt': ["lt-lt"],
//     'lv': ["lv-lv"],
//     'nl': ["nl-nl","nl-be"],
//     'no': ["nb", "nb-no", "nn", "nn-no"],
//     'pl': ["pl-pl"],
//     'pt': ["pt", "pt-pt"],
//     'pt-br': [],
//     'ro': ["ro-md", "ro-ro"],
//     'sk': ["sk-sk"],
//     'sl': ["sl-si"],
//     'sv': ["sv-fi", "sv-se"],
//     'tr': ["tr-tr"],
//     'uk': ["uk-ua"]
//     // 'zh': ["zh-cn", "zh-hans", "zh-hant", "zh-hk"]
// }

export const specialLanguageCodesMap = {
    'es-419': ["es-419", "es-ar", "es-bo", "es-cl", "es-co", "es-cr", "es-do", "es-ec", "es-gt", "es-mx", "es-ni", "es-pa", "es-pe", "es-pr", "es-py", "es-sv", "es-us", "es-uy", "es-ve"],
    'no': ["nb", "nb-no", "nn", "nn-no"],
}

export const supportedLanguages = [
    'ar',
    'bg',
    'cs',
    'da',
    'de',
    'el',
    'en',
    'es',
    'es-419',
    'et',
    'fi',
    'fr',
    'hr',
    'hu',
    'it',
    'ko',
    'lt',
    'lv',
    'nl',
    'no',,
    'pl',
    'pt',
    'pt-br',
    'ro',
    'sk',
    'sl',
    'sv',
    'tr',
    'uk'
]

// export const langSubtypesMap = getLangSubtypesMap(supportedLanguageCodesMap);


export const specialLangSubtypesMap = getLangSubtypesMap(specialLanguageCodesMap);


export function transformToISOStandardLangCode(code) {
    //language codes on phones have "_" instead of "-" and for base languages ends with "_"
    let replaceValue = "-";
    if (code.slice(-1) === "_") {
        replaceValue = "";
    }
    return code.replace("_", replaceValue);
}

async function fetchTranslation(langCode) {
    try {
        const dataModule = await import(`./../translations/${langCode}.js`);
        return dataModule.default
        // You can now use the 'translations' object for localization in your application
    } catch (error) {
        alert(`An error has occurred: ${error.message} on fetching translation for ${langCode} 
    Possible network issue!!! Check your network connection and try again`);
    }
}

let currentAppTranslation, fallbackTranslation;

function setDefaultLanguage() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let appLang = urlParams.get("lang") || window.navigator.language.toLowerCase() || localStorage.getItem(constants.APP_LANG);
    appLang = transformToISOStandardLangCode(appLang);
    let lang = getLanguageFallback(appLang);
    localStorage.setItem(constants.APP_LANG, lang);
    document.querySelector("body").setAttribute("app-lang", lang);
    document.documentElement.lang = lang;
    setTextDirectionForLanguage(lang);
}

export async function translate() {
    setDefaultLanguage();
    let matches = document.querySelectorAll("[translate]");
    currentAppTranslation = await fetchTranslation(localStorage.getItem(constants.APP_LANG));
    if(!fallbackTranslation)
        fallbackTranslation = await fetchTranslation("en");
    matches.forEach((item) => {
        item.innerHTML = currentAppTranslation[item.getAttribute('translate')] || fallbackTranslation[item.getAttribute('translate')];
    });

    setPageTitle();
}

export function getTranslation(key, ...args) {
    setDefaultLanguage();
    if (!currentAppTranslation) {
        fetchTranslation(localStorage.getItem(constants.APP_LANG)).then(result => {
            currentAppTranslation = result;
            return parseResult(currentAppTranslation[key], key, args);
        });
    } else {
        return parseResult(currentAppTranslation[key], key, args);
    }
}

function parseResult(result, key, ...args) {
    if(!result || result === undefined) 
        if(fallbackTranslation[key]){
            return parseResult(fallbackTranslation[key], key, args);
        }

    if(!args)
        return result;
    return stringFormat(result, args);
    
};

/**
 * Formats a string by replacing placeholders with provided arguments.
 * 
 * @param {string} text - The string containing placeholders to be replaced.
 * @param {...*} args - The values to replace the placeholders with.
 * @returns {string} The formatted string with placeholders replaced by the provided arguments.
 */
export function stringFormat(text, ...args) {
    return (text || "").replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] !== 'undefined'
            ? args[number]
            : match;
    });
};

export function translateAccessibilityAttributes(){
    ["alt", "title", "aria-label"].forEach((attr) => {
        let altElements = document.querySelectorAll(`[${attr}]`);
        altElements.forEach((element) => {
            let elAttr = element.getAttribute(`${attr}`);
            let elAttrTranslated = getTranslation(elAttr);
            if(elAttrTranslated){
                element.setAttribute(`${attr}`,elAttrTranslated);
            }
        });
    })
}

export function getLanguageFallback(appLang, fallback = true) {
     
    let specialLang = specialLangSubtypesMap[appLang.toLowerCase()];
    if(specialLang){
        return specialLang;
    }
    if(supportedLanguages.includes(appLang)){
        return appLang;
    }
    if(supportedLanguages.includes(appLang.split("-")[0])){
        return appLang.split("-")[0];
    }
    return fallback ? "en" : appLang;


}
