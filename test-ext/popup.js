document.addEventListener("DOMContentLoaded", () => {

  /* ---------------- UI ---------------- */
  const catBtns = document.querySelectorAll(".cat-btn");
  const contents = document.querySelectorAll(".content");
  catBtns.forEach(btn => {
    btn.onclick = () => {
      catBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      contents.forEach(c => c.style.display = "none");
      document.getElementById(btn.dataset.cat).style.display = "block";
    };
  });
  catBtns[0].click();

  document.querySelectorAll(".folder-title").forEach(t => {
    t.onclick = () => {
      const c = t.nextElementSibling;
      c.style.display = c.style.display === "block" ? "none" : "block";
    };
  });

  /* ---------------- INPUTS ---------------- */
  const inputs = {
    bgColor: bgColor,
    textColor: textColor,
    linkColor: linkColor,
    lineHeight: lineHeight,
    hueRotate: hueRotate,
    grayscale: grayscale,
    contrast: contrast,
    brightness: brightness,
    saturate: saturate
  };

  /* ---------------- DEFAULT (NORMAL PAGE) ---------------- */
  const DEFAULT_SETTINGS = {
    fontSelect: "defaultFont",
    bgColor: "",
    textColor: "",
    linkColor: "",
    fontSize: "",
    lineHeight: "",
    hueRotate: 0,
    grayscale: 0,
    contrast: 100,
    brightness: 100,
    saturate: 100
  };

  /* ---------------- PRESETS ---------------- */
  const PRESETS = {
    highContrast: {
      bgColor: "#000000",
      textColor: "#ffffff",
      linkColor: "#00ffff",
      fontSize: "18px",
      lineHeight: "1.6",
      contrast: 160,
      brightness: 110,
      saturate: 120,
      hueRotate: 0,
      grayscale: 0
    },
    protanopia: {
      bgColor: "#ffffff",
      textColor: "#000000",
      linkColor: "#0000ff",
      fontSize: "16px",
      lineHeight: "1.5",
      hueRotate: 20,
      saturate: 120,
      contrast: 110,
      brightness: 100,
      grayscale: 0
    },
    deuteranopia: {
      bgColor: "#ffffff",
      textColor: "#000000",
      linkColor: "#0000ff",
      fontSize: "16px",
      lineHeight: "1.5",
      hueRotate: 40,
      saturate: 120,
      contrast: 110,
      brightness: 100,
      grayscale: 0
    },
    tritanopia: {
      bgColor: "#ffffff",
      textColor: "#000000",
      linkColor: "#0000ff",
      fontSize: "16px",
      lineHeight: "1.5",
      hueRotate: 90,
      saturate: 110,
      contrast: 110,
      brightness: 100,
      grayscale: 0
    },
    cataracts: {
      bgColor: "#f5f5f5",
      textColor: "#000000",
      linkColor: "#003366",
      fontSize: "18px",
      lineHeight: "1.7",
      contrast: 140,
      brightness: 115,
      saturate: 110,
      hueRotate: 0,
      grayscale: 0
    },
    grayscale: {
      bgColor: "#ffffff",
      textColor: "#000000",
      linkColor: "#000000",
      fontSize: "16px",
      lineHeight: "1.5",
      grayscale: 100,
      contrast: 110,
      brightness: 100,
      saturate: 0,
      hueRotate: 0
    },
    dyslexia: {
      bgColor: "#f7f7f7",
      textColor: "#1a1a1a",
      linkColor: "#0033cc",
      fontSize: "18px",
      lineHeight: "1.7",
      grayscale: 0,
      contrast: 105,
      brightness: 100,
      saturate: 90,
      hueRotate: 0
    }
    
  };

  let activePreset = null;

  /* ---------------- APPLY SETTINGS ---------------- */
  function applySettings(s) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (x) => {
          document.body.style.backgroundColor = x.bgColor;
          document.body.style.color = x.textColor;
          document.body.style.fontSize = x.fontSize;
          document.body.style.lineHeight = x.lineHeight;
          document.querySelectorAll("a").forEach(a => a.style.color = x.linkColor);
          document.documentElement.style.filter =
            `hue-rotate(${x.hueRotate}deg) 
             grayscale(${x.grayscale}%)
             contrast(${x.contrast}%)
             brightness(${x.brightness}%)
             saturate(${x.saturate}%)`;
        },
        args: [s]
      });
    });
  }

  /* ---------------- APPLY GENERAL BUTTON ---------------- */
  document.getElementById("applyGeneral").onclick = () => {
    const s = {};
    Object.keys(inputs).forEach(k => s[k] = inputs[k].value);
    activePreset = null;
    applySettings(s);

    // font code twih
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "applyFont" });
    });
  };

  /* ---------------- RESET ---------------- */
  document.getElementById("resetGeneral").onclick = () => {
    activePreset = null;
    Object.keys(inputs).forEach(k => inputs[k].value = DEFAULT_SETTINGS[k]);
    applySettings(DEFAULT_SETTINGS);

    // hi hudson this is to reset the font
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "resetFont" });
    })
  };

  /* ---------------- PRESET TOGGLE ---------------- */
  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.onclick = () => {
      const name = btn.dataset.preset;

      if (activePreset === name) {
        activePreset = null;
        Object.keys(inputs).forEach(k => inputs[k].value = DEFAULT_SETTINGS[k]);
        applySettings(DEFAULT_SETTINGS);

        //reset font
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "resetFont" });
        });
        return;
      }

      activePreset = name;

      //apply font for given presets
      if (activePreset == "dyslexia"){
        const fontSelect = document.getElementById("fontSelect")
        fontSelect.value = "atkinson"
        fontSelect.dispatchEvent(new Event("change"));
        //#cuck4life

        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "applyFont" });
        });

      }
      const p = PRESETS[name];
      Object.keys(inputs).forEach(k => inputs[k].value = p[k]);
      applySettings(p);

    };
  });

  /* ---------------- AI (UNCHANGED) ---------------- */
  const aiPrompt = document.getElementById("aiPrompt");
  const sendAIButton = document.getElementById("sendAI");
  const aiResponseDiv = document.getElementById("aiResponse");

  sendAIButton.onclick = async () => {
    const prompt = aiPrompt.value.trim();
    if (!prompt) return;
    aiResponseDiv.textContent = "Thinking...";
    try {
      const response = await fetch("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "phi3", prompt, max_tokens: 300, temperature: 0.7 })
      });
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let out = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        decoder.decode(value).split("\n").forEach(line => {
          try {
            const d = JSON.parse(line);
            if (d.response) {
              out += d.response;
              aiResponseDiv.textContent = out;
            }
          } catch {}
        });
      }
    } catch (e) {
      aiResponseDiv.textContent = "AI error";
    }
  };
});


//FONT CHANGER - SAVE SELECTION FROM DROPDOWN
const fontSelect = document.getElementById("fontSelect");

chrome.storage.sync.get(["selectedFont"], result => {
  fontSelect.value = result.selectedFont || "defaultFont";
});

fontSelect.addEventListener("change", () => {
  chrome.storage.sync.set({selectedFont: fontSelect.value});
});



//67676767676767