import {goToPage} from "../../../utils.js"
import {translate} from "../translationUtils.js";


function MenuPageController() {

  this.goHome = function () {
    goToPage("/main.html")
  }

  document.querySelector(".close-modal").addEventListener("click", this.goHome);

  document.getElementById("go-home-button").addEventListener("click", this.goHome)
}


const menuPageController = new MenuPageController();

window.onload = async (event) => {
  // document.querySelector("#settings-modal").classList.remove("hiddenElement");
  await translate();
  document.querySelector(".loader-container").setAttribute('style', 'display:none');
  setTimeout(() => {
    document.querySelector(".modal-header .close-modal").style.position = "absolute";
  }, 0);
}

window.menuPageController = menuPageController;

