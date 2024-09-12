import XMLDisplayService from "../services/XMLDisplayService/XMLDisplayService.js";
import constants from "../../../constants.js";

let showExpired = function () {
  document.querySelector(".loader-container").setAttribute('style', 'display:none');
  document.querySelector("#expired-modal").classList.remove("hiddenElement");
  focusModalHeader();
}

let showIncorrectDate = function () {
  document.querySelector("#incorrect-date-modal").setAttribute('style', 'display:flex !important');
  focusModalHeader();
}

function handleLeafletAccordion() {
  let accordionItems = document.querySelectorAll("div.leaflet-accordion-item");
  accordionItems.forEach((accItem, index) => {
    accItem.addEventListener("click", (evt) => {
      accItem.classList.toggle("active");
      if (accItem.classList.contains("active")) {
        accItem.setAttribute('aria-expanded', "true");
      } else {
        accItem.setAttribute('aria-expanded', "false");
      }
      accItem.querySelector(".leaflet-accordion-item-content").addEventListener("click", (event) => {
        event.stopImmediatePropagation();
        event.stopPropagation();
      })
    })
    accItem.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        accItem.classList.toggle("active");
        if (accItem.classList.contains("active")) {
          accItem.setAttribute('aria-expanded', "true");
        } else {
          accItem.setAttribute('aria-expanded', "false");
        }
      }
      accItem.querySelector(".leaflet-accordion-item-content").addEventListener("keydown", (event) => {
        event.stopImmediatePropagation();
        event.stopPropagation();
      })
    })
  })
}

let focusModalHeader = function () {
  document.querySelectorAll(".modal-header").forEach(element => {
    if (element.offsetParent) {
      document.querySelector(".modal-header").focus();
    }
  })

}

let generateMissingFilesList = function (missingImgFiles) {
  let missingFilesErrText = ``;
  missingImgFiles.forEach(item => {
    missingFilesErrText = missingFilesErrText + `<li>Image ${item} does not exist</li>`
  })
  return missingFilesErrText;
}

let generateDifferentCaseToastList = function (differentCaseImgFiles) {
  let differentCaseErrText = ``;
  differentCaseImgFiles.forEach(item => {
    differentCaseErrText = differentCaseErrText + `<li>Image ${item.xmlName} does not exist, but a similar file ${item.fileName}  exists and will be used instead</li>`
  })
  return differentCaseErrText;
}

let validateLeafletFiles = function (htmlContent, leafletImages, uploadedImages) {
  if (!htmlContent) {
    let err = new Error("<li>Unsupported format for XML file.</li>");
    err.errorCode = constants.errorCodes.xml_parse_error;
    throw err;
  }

  let htmlImageNames = Array.from(leafletImages).map(img => img.getAttribute("src"));
  //removing from validation image src that are data URLs ("data:....")
  htmlImageNames = htmlImageNames.filter((imageSrc) => {
    let dataUrlRegex = new RegExp(/^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i);
    if (!!imageSrc.match(dataUrlRegex) || imageSrc.startsWith("data:")) {
      return false;
    }
    return true;
  });
  let uploadedImageNames = Object.keys(uploadedImages);
  let differentCaseImgFiles = [];
  let missingImgFiles = []
  htmlImageNames.forEach(imgName => {
    let similarItemIndex = uploadedImageNames.findIndex((item) => item.toLowerCase() === imgName.toLowerCase());
    if (similarItemIndex < 0) {
      missingImgFiles.push(imgName);
    } else if (uploadedImageNames[similarItemIndex] !== imgName) {
      differentCaseImgFiles.push({xmlName: imgName, fileName: uploadedImageNames[similarItemIndex]});
    }
  })

  if (missingImgFiles.length > 0) {
    let errMsg = generateMissingFilesList(missingImgFiles)
    let err = new Error(errMsg);
    err.errorCode = constants.errorCodes.xml_parse_error;
    throw err;
  }
  if (differentCaseImgFiles.length > 0) {
    let errMsg = generateDifferentCaseToastList(differentCaseImgFiles)
    let err = new Error(errMsg);
    err.errorCode = constants.errorCodes.xml_parse_error;
    throw err;
  }

}

let renderLeaflet = function (leafletData) {
  document.querySelector(".product-name").innerText = leafletData.productData.inventedName || leafletData.productData.name;
  document.querySelector(".product-description").innerText = leafletData.productData.nameMedicinalProduct || leafletData.productData.description;
   /* document.querySelector(".leaflet-title-icon").classList.remove("hiddenElement");*/
  let xmlService = new XMLDisplayService("#leaflet-content");
  let resultDocument = xmlService.getHTMLFromXML(leafletData.xmlContent);
  let leafletImages = resultDocument.querySelectorAll("img");
  for (let image of leafletImages) {
    let imageSrc = image.getAttribute("src");
    let dataUrlRegex = new RegExp(/^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i);
    if (!!imageSrc.match(dataUrlRegex) || imageSrc.startsWith("data:")) {
      //we don't alter already embedded images
      continue;
    }
    if (leafletData.leafletImages[imageSrc]) {
      image.setAttribute("src", leafletData.leafletImages[imageSrc]);
    }
  }
  let sectionsElements = resultDocument.querySelectorAll(".leaflet-accordion-item");
  let htmlContent = "";
  sectionsElements.forEach(section => {
    htmlContent = htmlContent + section.outerHTML;
  })

  validateLeafletFiles(htmlContent, leafletImages, leafletData.leafletImages);

  document.querySelector("#leaflet-content").innerHTML = htmlContent;
  let leafletLinks = document.querySelectorAll(".leaflet-link");
  xmlService.activateLeafletInnerLinks(leafletLinks);
  handleLeafletAccordion();
  document.querySelector(".loader-container").setAttribute('style', 'display:none');
  focusModalHeader();
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
  if (!(imageData instanceof Uint8Array)) {
    imageData = new Uint8Array(imageData);
  }
  let base64Image = bytesToBase64(imageData);
  base64Image = `data:image/png;base64, ${base64Image}`;
  return base64Image;
}

async function getFileContentAsBuffer(file) {
  return getFileContent(file, "readAsArrayBuffer");
}

async function getBase64FileContent(file, callback) {
  let content;
  try {
    content = await getFileContentAsBuffer(file);
    content = arrayBufferToBase64(content);
  } catch (e) {
    return callback(e);
  }
  return callback(undefined, content);
}

export {
  showExpired,
  showIncorrectDate,
  focusModalHeader,
  renderLeaflet,
  getFileContent,
  getFileContentAsBuffer,
  getBase64FileContent,
  getImageAsBase64
}
