// --- Category Toggle ---
const catBtns = document.querySelectorAll(".cat-btn");
const contents = document.querySelectorAll(".content");

catBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    catBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    contents.forEach(c => c.style.display = "none");
    document.getElementById(btn.dataset.cat).style.display = "block";
  });
});
catBtns[0].click();

// --- Folders ---
const folderBtns = document.querySelectorAll(".folder-btn");
folderBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("active");
    const content = btn.nextElementSibling;
    content.style.display = (content.style.display === "block") ? "none" : "block";
  });
});

// --- General Settings Elements ---
const bgColor = document.getElementById("bgColor");
const textColor = document.getElementById("textColor");
const fontSize = document.getElementById("fontSize");
const linkColor = document.getElementById("linkColor");
const boldText = document.getElementById("boldText");
const letterSpacing = document.getElementById("letterSpacing");
const wordSpacing = document.getElementById("wordSpacing");
const lineHeight = document.getElementById("lineHeight");

// Load saved settings
chrome.storage.sync.get("generalSettings", data => {
  if (data.generalSettings) {
    const s = data.generalSettings;
    bgColor.value = s.bgColor || "#ffffff";
    textColor.value = s.textColor || "#000000";
    fontSize.value = s.fontSize || "16px";
    linkColor.value = s.linkColor || "#0000ee";
    boldText.checked = s.boldText || false;
    letterSpacing.value = s.letterSpacing || "";
    wordSpacing.value = s.wordSpacing || "";
    lineHeight.value = s.lineHeight || "";
    applyGeneralSettings(s);
  }
});

// --- Apply Settings ---
function applyGeneralSettings(settings) {
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (s) => {
          if (!window.originalSettings) {
            window.originalSettings = {
              bgColor: document.body.style.backgroundColor,
              textColor: document.body.style.color,
              fontSize: document.body.style.fontSize,
              letterSpacing: document.body.style.letterSpacing,
              wordSpacing: document.body.style.wordSpacing,
              linkColor: Array.from(document.querySelectorAll("a")).map(a => a.style.color),
              boldText: Array.from(document.querySelectorAll("*")).map(el => el.style.fontWeight)
            };
          }

          document.body.style.backgroundColor = s.bgColor;
          document.body.style.color = s.textColor;
          document.body.style.fontSize = s.fontSize;
          document.body.style.letterSpacing = s.letterSpacing;
          document.body.style.wordSpacing = s.wordSpacing;
          document.body.style.lineHeight = s.lineHeight;
          document.querySelectorAll('p, li, span, div, a, h1, h2, h3, h4, h5, h6').forEach(el => {
            el.style.lineHeight = s.lineHeight;
          });
          document.querySelectorAll("a").forEach(a => a.style.color = s.linkColor);
          document.querySelectorAll("*").forEach(el => el.style.fontWeight = s.boldText ? "bold" : "normal");
        },
        args: [settings]
      });
    }
  });
}

// --- Instant Apply ---
function format(setting, unit) {
  if (setting.value && !setting.value.includes(unit)) {
    setting.value = setting.value + unit;
  }
}
console.log("hello?")
[bgColor, textColor, fontSize, linkColor, boldText].forEach(input => {
  input.addEventListener("input", () => {
    format(fontSize, "px");
    console.log(fontSize.value)
    format(letterSpacing, "em");
    format(wordSpacing, "em");
    const settings = {
      bgColor: bgColor.value,
      textColor: textColor.value,
      fontSize: fontSize.value,
      lineHeight: lineHeight.value,
      letterSpacing: letterSpacing.value,
      wordSpacing: wordSpacing.value,
      linkColor: linkColor.value,
      boldText: boldText.checked
    };
    chrome.storage.sync.set({ generalSettings: settings });
    applyGeneralSettings(settings);
  });
});

// --- Reset Original ---
document.getElementById("resetGeneral").addEventListener("click", () => {
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          if (window.originalSettings) {
            const s = window.originalSettings;
            document.body.style.backgroundColor = s.bgColor;
            document.body.style.color = s.textColor;
            document.body.style.fontSize = s.fontSize;
            document.querySelectorAll("a").forEach((a, i) => a.style.color = s.linkColor[i]);
            document.querySelectorAll("*").forEach((el, i) => el.style.fontWeight = s.boldText[i]);
          }
        }
      });
    }
  });
});
