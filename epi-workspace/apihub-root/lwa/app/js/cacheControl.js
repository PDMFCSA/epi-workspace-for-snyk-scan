/**
 * If browser back button was used, flush cache
 * This ensures that user will always see an accurate, up-to-date view based on their state
 * https://stackoverflow.com/questions/8788802/prevent-safari-loading-from-cache-when-back-button-is-clicked
 */
(function () {
  window.onpageshow = function(event) {
    if (event.persisted) {
      window.location.reload();
    }
  };
})();