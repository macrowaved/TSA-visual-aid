document.addEventListener("DOMContentLoaded", () => {
  /* ------------chrome storage------------ */
  function storeData(key, data) {
    chrome.storage.local.set({[key]: data});
  }

  function loadData(key, callback) {
    chrome.storage.local.get({[key]: null}, (result) => {
      callback(result[key]);
    });
  }

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
    fontSize: fontSize,
    lineHeight: lineHeight,
    letterSpacing: letterSpacing,
    wordSpacing: wordSpacing,
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
    letterSpacing: "",
    wordSpacing: "",
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
      bgColor: "#ffffff",
      textColor: "#000000",
      linkColor: "#0044cc",
      fontSize: "18px",
      lineHeight: "1.5",
      letterSpacing: "0.05em",
      wordSpacing: "0.15em",
      grayscale: 0,
      contrast: 100,
      brightness: 100,
      saturate: 100,
      hueRotate: 0
    },
    lowVision: {
      bgColor: "#ffffff",
      textColor: "#0a0a0a",
      linkColor: "#0044cc",
      fontSize: "20px",
      lineHeight: "1.6",
      grayscale: 0,
      contrast: 110,
      brightness: 100,
      saturate: 100,
      hueRotate: 0
    }
  };

  let activePreset = null;

/* ---------------- LOAD BUTTON STATE ---------------- */
loadData("selectedPreset", (savedPreset) => {
    loadData("presetActive", (isActive) => {
        if (!savedPreset || !isActive) return; // skip if not active
        activePreset = savedPreset;
        const p = PRESETS[activePreset];
        if (p) {
            Object.keys(inputs).forEach(k => inputs[k].value = p[k]);
            applySettings(p);
            // show the button as active
            document.querySelector(`.preset-btn[data-preset="${activePreset}"]`)?.classList.add("active");
        }
    });
});


  /* ---------------- APPLY SETTINGS ---------------- */
  function applySettings(s) {
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (x) => {
            document.body.style.backgroundColor = x.bgColor;
            document.body.style.color = x.textColor;
            document.body.style.fontSize = x.fontSize;
            document.body.style.lineHeight = x.lineHeight;
            document.querySelectorAll('p, li, span, div, a, h1, h2, h3, h4, h5, h6').forEach(el => {
              el.style.lineHeight = x.lineHeight;
            });
            document.body.style.letterSpacing = x.letterSpacing;
            document.body.style.wordSpacing = x.wordSpacing;
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
      }
    });
  }

  /* ---------------- APPLY GENERAL BUTTON ---------------- */
  document.getElementById("applyGeneral").onclick = () => {
    console.log("does log work?");
    const s = {};
    Object.keys(inputs).forEach(k => s[k] = inputs[k].value);
    activePreset = null;

    storeData("settings", s);
    applySettings(s);

    // font code - apply selected font
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { action: "applyFont" });
      }
    });
  };

  /* ---------------- RESET ---------------- */
  document.getElementById("resetGeneral").onclick = () => {
    activePreset = null;
    Object.keys(inputs).forEach(k => inputs[k].value = DEFAULT_SETTINGS[k]);
    storeData("settings", DEFAULT_SETTINGS);
    applySettings(DEFAULT_SETTINGS);

    // font code - reset font
    document.getElementById("fontSelect").value = "defaultFont";
    fontSelect.dispatchEvent(new Event("change"));
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { action: "resetFont" });
      }
    });
  };

  /* ---------------- PRESET TOGGLE ---------------- */
  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.onclick = () => {

      const name = btn.dataset.preset;

      storeData("selectedPreset", name);
      storeData("presetActive", true);

      if (activePreset === name) {
        activePreset = null;
        Object.keys(inputs).forEach(k => inputs[k].value = DEFAULT_SETTINGS[k]);
        storeData("settings", DEFAULT_SETTINGS);
        applySettings(DEFAULT_SETTINGS); 
        storeData("presetActive", false);
        btn.classList.remove("active");

        // reset font dropdown to default and persist
        fontSelect.value = DEFAULT_SETTINGS.fontSelect || "defaultFont";
        chrome.storage.sync.set({ selectedFont: fontSelect.value });

        //reset font
        chrome.tabs.query({}, (tabs) => {
          for (const tab of tabs) {
            chrome.tabs.sendMessage(tab.id, { action: "resetFont" });
          }
        });
        return;
      }

      activePreset = name;

      //apply font for given presets
      if (activePreset == "dyslexia" || activePreset == "lowVision") {
        const fontSelect = document.getElementById("fontSelect")
        fontSelect.value = "atkinson"
        fontSelect.dispatchEvent(new Event("change"));

        chrome.tabs.query({}, (tabs) => {
          for (const tab of tabs) {
            chrome.tabs.sendMessage(tab.id, { action: "applyFont" });
          }
        });

        
      }

      const p = PRESETS[name];
      Object.keys(inputs).forEach(k => inputs[k].value = p[k]);
      storeData("settings", p);
      applySettings(p);
      document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
      document.querySelector(`.preset-btn[data-preset="${name}"]`)?.classList.add("active");
    };
  });

  /* ---------------- AI (UNCHANGED) ---------------- */
  const aiPrompt = document.getElementById("aiPrompt");
  const sendAIButton = document.getElementById("sendAI");
  const aiResponseDiv = document.getElementById("aiResponse");

  sendAIButton.onclick = async () => {
    const rules = `
    
    You are an AI accessibility assistant built into a browser extension called “Visual Aid”.

This extension helps users — especially visually impaired users — read and understand webpages more comfortably. Your job is to give advice, explanations, and readability improvements that match the tools available in the extension.

The extension can adjust the following:

ACCESSIBILITY PRESETS
- High Contrast
- Protanopia (red color blindness)
- Deuteranopia (green color blindness)
- Tritanopia (blue color blindness)
- Cataracts simulation (blur + low contrast)
- Grayscale
- Dyslexia-friendly mode
- Low Vision mode

CUSTOM COLOR CONTROLS
- Background color
- Text color
- Link color

TYPOGRAPHY CONTROLS
- Font type (System Default, Atkinson Hyperlegible, Open Dyslexic, Verdana)
- Font size
- Line height
- Letter spacing
- Word spacing

VISUAL FILTER CONTROLS
- Hue rotation
- Grayscale intensity
- Contrast
- Brightness
- Saturation

HOW YOU SHOULD RESPOND

1. Always give advice that can be achieved using these controls.
2. When suggesting changes, clearly mention which setting to adjust (example: “Increase line height” or “Use Atkinson Hyperlegible font”).
3. Keep language simple and easy to read.
4. Use short paragraphs or bullet points.
5. If the user pastes text from a webpage, summarize or rewrite it in a clearer, easier-to-read way.
6. If a user describes a visual difficulty (blurry text, eye strain, hard-to-read colors), recommend specific preset(s) or settings that would help.
7. Do not use emojis or decorative symbols.
8. Keep a calm, helpful tone.
9. If the request is unrelated to accessibility or readability, still answer — but prefer clear and simple explanations.
10. If the user is asking about a Wikipedia article, offer:
   - A simplified summary
   - Key bullet points
   - Definitions of difficult words
11. OFTEN USE LINE BERAKS "\n" FOR BETTER READABILITY.
Your purpose is to improve reading comfort, clarity, and accessibility — not to give medical advice or replace professional diagnosis.

    
    `
    const prompt = aiPrompt.value.trim() + rules;
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

  //FONT CHANGER - SAVE SELECTION FROM DROPDOWN
  const fontSelect = document.getElementById("fontSelect");

  chrome.storage.sync.get(["selectedFont"], result => {
    fontSelect.value = result.selectedFont || "defaultFont";
  });

  fontSelect.addEventListener("change", () => {
    chrome.storage.sync.set({selectedFont: fontSelect.value});
  });
});


