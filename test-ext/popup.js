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

  /* ---------------- ION KNOW ---------------- */
  loadData("settings", (savedSettings) => {
    if (savedSettings) {
      Object.keys(inputs).forEach(k => {
        if (savedSettings[k] !== undefined) inputs[k].value = savedSettings[k];
      });
    }
  });


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
      fontSize: "25px",
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
// Load the last saved settings (preset or custom)
loadData("settings", (savedSettings) => {
  if (savedSettings) {
    Object.keys(inputs).forEach(k => {
      if (savedSettings[k] !== undefined) inputs[k].value = savedSettings[k];
    });
    applySettings(savedSettings);
  }
  
  // Now load selected preset ONLY for button highlight
  loadData("presetActive", (isActive) => {
    if (!isActive) return;
    loadData("selectedPreset", (savedPreset) => {
      if (!savedPreset) return;
      activePreset = savedPreset;
      // highlight preset button, but do NOT overwrite inputs
      document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
      document.querySelector(`.preset-btn[data-preset="${activePreset}"]`)?.classList.add("active");
    });
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
    const s = {};
    Object.keys(inputs).forEach(k => s[k] = inputs[k].value);
    activePreset = null;

    // Save the advanced/custom settings
    storeData("settings", s);
    applySettings(s);

    // SAVE CURRENT FONT BEFORE APPLYING
    chrome.storage.sync.set({ selectedFont: fontSelect.value });

    // Apply the font
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

    // clear preset state in storage
    storeData("selectedPreset", null);
    storeData("presetActive", false);

    // remove active highlight
    document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));

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
  const rules = `You are an AI accessibility assistant built into a browser extension called "Visual Aid".

This extension helps users — especially visually impaired users — read and understand webpages more comfortably. Your job is to give advice, explanations, and readability improvements that match the tools available in the extension.

The extension can adjust the following:
These are storted by priority, recomend ONE thing unless asked for multiple

ACCESSIBILITY PRESETS, These presets do everything needed to assist with the specific condition, recomend users to click the desired preset button and then stop. 
- High Contrast
- Protanopia (red color blindness)
- Deuteranopia (green color blindness)
- Tritanopia (blue color blindness)
- Cataracts simulation
- Grayscale
- Dyslexia-friendly mode
- Low Vision mode


CUSTOM CONTROLS, reference these if customization is mentioned
- Background color, text color, link color
- Font type (System Default, Atkinson Hyperlegible, Open Dyslexic, Verdana)
- Font size, line height, letter spacing, word spacing
- Hue rotation, grayscale, contrast, brightness, saturation

HOW YOU SHOULD RESPOND
1. Keep responses SHORT one sentence is ideal, you lose a point for every character typed.
2. Never write long paragraphs.
3. ONE CLEAR RECOMENDATION AT A TIME
4. Use bullet points only when listing more than 2 things.
5. Do not repeat yourself.
6. Do not add extra explanation unless asked.
7. Stop after answering the question — do not add follow-up suggestions.
8. If a preset is suggested do not give any more recomendations

Your purpose is to improve reading comfort, clarity, and accessibility — not to give medical advice.`;

  const userInput = aiPrompt.value.trim();
  if (!userInput) return;

  const fullPrompt = `<|system|>\n${rules}<|end|>\n<|user|>\n${userInput}<|end|>\n<|assistant|>\n`;

  aiResponseDiv.textContent = "Thinking...";

  try {
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "phi3",
        prompt: fullPrompt,
        raw: true,
        stream: true,
        options: {
          temperature: 0.3,
          num_predict: 200
        }
      })
    });

    if (!response.ok) {
      aiResponseDiv.textContent = `HTTP error: ${response.status} ${response.statusText}`;
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let out = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      console.log("chunk:", chunk);
      chunk.split("\n").forEach(line => {
        if (!line.trim()) return;
        try {
          const d = JSON.parse(line);
          if (d.response) {
            out += d.response;
            aiResponseDiv.textContent = out;
          }
        } catch (parseErr) {
          console.log("parse error on line:", line, parseErr);
        }
      });
    }

    if (!out) aiResponseDiv.textContent = "No response received from model.";

  } catch (e) {
    aiResponseDiv.textContent = `AI error: ${e.message}`;
    console.error("Full error:", e);
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


