chrome.action.onClicked.addListener(tab => {
  chrome.windows.create({
    url: "popup.html",
    type: "popup",
    width: 400,
    height: 700,
    top: 50,
    left: 50
  });
});
