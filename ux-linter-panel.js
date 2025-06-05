// Create a custom panel
chrome.devtools.panels.create(
  "UX Linter",
  "icons/icon16.png",
  "panel.html",
  function(panel) {
    console.log("UX Linter panel created");
  }
); 