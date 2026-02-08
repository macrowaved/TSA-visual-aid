// On page load, automatically apply stored settings
console.log("Content script initialized.");

console.log("Content script loaded, fetching stored settings...");
chrome.storage.local.get("settings", ({ settings }) => {
  if (settings) {
    const body = document.body;

    if (settings.bgColor) body.style.backgroundColor = settings.bgColor;
    if (settings.textColor) body.style.color = settings.textColor;
    if (settings.fontSize) body.style.fontSize = settings.fontSize;
    if (settings.letterSpacing) body.style.letterSpacing = settings.letterSpacing;
    if (settings.wordSpacing) body.style.wordSpacing = settings.wordSpacing;

    if (settings.lineHeight) {
      body.style.lineHeight = settings.lineHeight;
      document.querySelectorAll('p, li, span, div, a, h1, h2, h3, h4, h5, h6').forEach(el => {
        el.style.lineHeight = settings.lineHeight;
      });
    }

    if (settings.linkColor) {
      document.querySelectorAll("a").forEach(a => a.style.color = settings.linkColor);
    }


    document.documentElement.style.filter = `
      hue-rotate(${settings.hueRotate || 0}deg)
      grayscale(${settings.grayscale || 0}%)
      contrast(${settings.contrast || 100}%)
      brightness(${settings.brightness || 100}%)
      saturate(${settings.saturate || 100}%)
    `;
  }
});


let originalStylesSaved = false;
let originalStyles = {};

function saveOriginal() {
  if (originalStylesSaved) return;

  const body = document.body;
  originalStyles = {
    backgroundColor: body.style.backgroundColor,
    color: body.style.color,
    fontSize: body.style.fontSize,
    letterSpacing: body.style.letterSpacing,
    wordSpacing: body.style.wordSpacing
  };

  originalStylesSaved = true;
}

chrome.runtime.onMessage.addListener((msg) => {
  const body = document.body;
  if (msg.action === "applyGeneral") {
    saveOriginal();

    if (msg.settings.bgColor)
      body.style.backgroundColor = msg.settings.bgColor;

    if (msg.settings.textColor)
      body.style.color = msg.settings.textColor;

    if (msg.settings.fontSize)
      body.style.fontSize = msg.settings.fontSize;

    if (msg.settings.letterSpacing)
      body.style.letterSpacing = msg.settings.letterSpacing;

    if (msg.settings.wordSpacing)
      body.style.wordSpacing = msg.settings.wordSpacing;

    if (msg.settings.lineHeight)
      body.style.lineHeight = msg.settings.lineHeight;
      document.querySelectorAll('p, li, span, div, a, h1, h2, h3, h4, h5, h6').forEach(el => {
        el.style.lineHeight = msg.settings.lineHeight;
      });
  }

  if (msg.action === "applyAdvanced") {
    saveOriginal();

    if (msg.css.h1)
      document.querySelectorAll("h1").forEach(e => e.style.cssText += msg.css.h1);

    if (msg.css.h2)
      document.querySelectorAll("h2").forEach(e => e.style.cssText += msg.css.h2);

    if (msg.css.p)
      document.querySelectorAll("p").forEach(e => e.style.cssText += msg.css.p);

    if (msg.css.a)
      document.querySelectorAll("a").forEach(e => e.style.cssText += msg.css.a);
  }

  if (msg.action === "resetOriginal") {
    body.style.backgroundColor = originalStyles.backgroundColor;
    body.style.color = originalStyles.color;
    body.style.fontSize = originalStyles.fontSize;
    body.style.lineHeight = originalStyles.lineHeight;
    body.style.letterSpacing = originalStyles.letterSpacing;
    body.style.wordSpacing = originalStyles.wordSpacing;
  }
});

//FONT CHANGER - ONLY WORKS ON PAGE RELOAD - DOES NOT WORK WITH APPLY SETTINGS 
//lies -> FONT CHANGER - ONLY WORKS ON PAGE RELOAD - DOES NOT WORK WITH APPLY SETTINGS
function injectFont(fontName) {
  const old = document.getElementById("fontStyle");
  if (old) old.remove();

  let dropInFont = "";
  if (fontName == "verdana") {
    dropInFont = "Verdana";
  } else if (fontName == "openDyslexic") {
    dropInFont = "Open Dyslexic";
  } else if (fontName == "atkinson") {
    dropInFont = "Atkinson Hyperlegible";
  }
  
	if (dropInFont) {
		const style = document.createElement("style");
    style.id = "fontStyle";
    style.textContent = `
      @font-face {
        font-family: 'Atkinson Hyperlegible';
        src: url('${chrome.runtime.getURL("fonts/AtkinsonHyperlegible-Regular.ttf")}') format('truetype');
        font-weight: 400;
        font-style: normal;
      }

      @font-face {
        font-family: 'Atkinson Hyperlegible';
        src: url('${chrome.runtime.getURL("fonts/AtkinsonHyperlegible-Bold.ttf")}') format('truetype');
        font-weight: 700;
        font-style: normal;
      }

      @font-face {
        font-family: 'Atkinson Hyperlegible';
        src: url('${chrome.runtime.getURL("fonts/AtkinsonHyperlegible-Italic.ttf")}') format('truetype');
        font-weight: 400;
        font-style: italic;
      }

      @font-face {
        font-family: 'Atkinson Hyperlegible';
        src: url('${chrome.runtime.getURL("fonts/AtkinsonHyperlegible-BoldItalic.ttf")}') format('truetype');
        font-weight: 700;
        font-style: italic;
      }

      @font-face {
        font-family: 'Open Dyslexic';
        src: url('${chrome.runtime.getURL("fonts/OpenDyslexic-Regular.otf")}') format('opentype');
        font-weight: 400;
        font-style: normal;
      }

      @font-face {
        font-family: 'Open Dyslexic';
        src: url('${chrome.runtime.getURL("fonts/OpenDyslexic-Bold.otf")}') format('opentype');
        font-weight: 700;
        font-style: normal;
      }

      @font-face {
        font-family: 'Open Dyslexic';
        src: url('${chrome.runtime.getURL("fonts/OpenDyslexic-Italic.otf")}') format('opentype');
        font-weight: 400;
        font-style: italic;
      }

      @font-face {
        font-family: 'Open Dyslexic';
        src: url('${chrome.runtime.getURL("fonts/OpenDyslexic-BoldItalic.otf")}') format('opentype');
        font-weight: 700;
        font-style: italic;
      }

      body, * {
        font-family: '${dropInFont}', sans-serif !important;
      }
    `;

		document.head.appendChild(style);
	}
}

// Message listener -> from popup.js, injects script when apply button is pressed
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "applyFont") {
    applyFontFromStorage();
  } else if (msg.action === "resetFont") {
    removeInjectedFont();
  }
});

function applyFontFromStorage() {
  chrome.storage.sync.get(["selectedFont"], ({ selectedFont }) => {
    removeInjectedFont(); // always remove first
    if (!selectedFont || selectedFont === "defaultFont") return;
    injectFont(selectedFont);
  });
}

function removeInjectedFont() {
  const old = document.getElementById("fontStyle");
  if (old) old.remove();
}

// Apply the font immediately on page load
chrome.storage.sync.get(["selectedFont"], ({ selectedFont }) => {
  if (!selectedFont || selectedFont === "defaultFont") return;
  injectFont(selectedFont);
});
