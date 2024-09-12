import {translate} from "../translationUtils.js";
import {goToPage} from "../../../utils.js";

window.onload = async (event) => {
  await translate();


  function Error404Controller() {
    this.goHomeHandler = function () {
      goToPage("/main.html")
    }
    let scanAgainButton = document.getElementById("go-home-button");
    scanAgainButton.addEventListener("click", this.goHomeHandler);
    scanAgainButton.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        this.goHomeHandler();
      }
    });
  }

  const error404Controller = new Error404Controller();
  window.error404Controller = error404Controller;
}


