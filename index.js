const STORAGE_KEY = "examination-tools.settings";
const DEFAULTS = {
  enabled: true,
  backgroundUrl: "",
  backgroundOpacity: 75,
  backgroundBlur: 0,
  backgroundScale: 100,
  backgroundX: 50,
  backgroundY: 50,
  accent: "#ff2020",
  backgroundColor: "#141414",
  fontSize: 16,
  messageSpacing: 8,
  compactMode: false,
  hideMemberList: false,
  reducedMotion: false,
  customCSS: ""
};

const STYLE_ID = "examination-tools-style";
const RUNTIME_STYLE_ID = "examination-tools-runtime-style";
const BUTTON_ID = "examination-tools-button";
const MODAL_ID = "examination-tools-modal";

module.exports = {
  start() {
    this.logs = [];
    this.settings = { ...DEFAULTS };
    this.loadSettings();
    this.installStyles();
    this.applySettings();
    this.addChatButton();

    this.observer = new MutationObserver(() => this.addChatButton());
    this.observer.observe(document.body, { childList: true, subtree: true });
    this.log("Examination Tools started");
  },

  stop() {
    this.observer?.disconnect();
    document.getElementById(BUTTON_ID)?.remove();
    document.getElementById(MODAL_ID)?.remove();
    document.getElementById(STYLE_ID)?.remove();
    document.getElementById(RUNTIME_STYLE_ID)?.remove();
    this.log("Examination Tools stopped");
  },

  log(message, level = "info") {
    this.logs ||= [];
    this.logs.unshift({ time: new Date().toLocaleTimeString(), level, message });
    this.logs.length = Math.min(this.logs.length, 500);
  },

  loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) this.settings = { ...DEFAULTS, ...JSON.parse(saved) };
    } catch (error) {
      this.log(`Settings load failed: ${String(error)}`, "error");
    }
  },

  saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      this.applySettings();
    } catch (error) {
      this.log(`Settings save failed: ${String(error)}`, "error");
    }
  },

  escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    })[character]);
  },

  installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${BUTTON_ID} { width:32px;height:32px;min-width:32px;margin:0 6px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:8px;color:var(--et-accent);background:var(--et-background);cursor:pointer }
      #${BUTTON_ID}:hover { filter:brightness(1.25) }
      #${MODAL_ID} { position:fixed;inset:0;z-index:999999;display:grid;place-items:center;background:rgba(0,0,0,.72);backdrop-filter:blur(8px) }
      #et-panel { position:relative;width:min(900px,calc(100vw - 28px));height:min(700px,calc(100vh - 28px));display:grid;grid-template-columns:190px 1fr;overflow:hidden;color:#fff;background:#181818;border:1px solid rgba(255,60,60,.45);border-radius:14px;box-shadow:0 20px 70px #000 }
      .et-sidebar { padding:18px 10px;background:#101010;border-right:1px solid #333 }
      .et-title { padding:8px 10px 16px;color:var(--et-accent);font-weight:800 }
      .et-nav { display:grid;gap:5px }
      .et-nav button,.et-action { padding:9px 10px;border:1px solid transparent;border-radius:7px;color:#ddd;background:transparent;text-align:left;cursor:pointer }
      .et-nav button.active,.et-nav button:hover,.et-action:hover { background:#431414;color:white }
      .et-content { overflow:auto;padding:22px }
      .et-content h2 { margin:0 0 16px;color:var(--et-accent) }
      .et-grid { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px }
      .et-card { padding:12px;background:#242424;border:1px solid #383838;border-radius:8px }
      .et-card label { display:flex;align-items:center;justify-content:space-between;gap:10px }
      .et-card input:not([type=checkbox]),.et-card textarea { width:100%;margin-top:9px;padding:8px;color:#fff;background:#111;border:1px solid #444;border-radius:6px }
      .et-card input[type=range] { width:100%;accent-color:var(--et-accent) }
      .et-card input[type=checkbox] { accent-color:var(--et-accent) }
      .et-card textarea { min-height:130px;font-family:monospace }
      .et-preview { height:180px;margin-bottom:12px;border-radius:9px;background:linear-gradient(120deg,#401111,#151515);background-size:cover;background-position:center }
      #et-close { position:absolute;right:12px;top:10px;z-index:1;color:white;background:#481515;border:1px solid #555;border-radius:6px;padding:5px 9px;cursor:pointer }
      #et-logs { max-height:330px;overflow:auto;padding:12px;background:#0d0d0d;border-radius:7px;font:12px monospace;white-space:pre-wrap }
      .et-actions { display:flex;flex-wrap:wrap;gap:8px;margin-top:12px }
      @media(max-width:620px) { #et-panel{grid-template-columns:1fr;grid-template-rows:auto 1fr}.et-sidebar{border-right:0;border-bottom:1px solid #333}.et-nav{grid-template-columns:repeat(3,1fr)}.et-grid{grid-template-columns:1fr} }
    `;
    document.head.appendChild(style);
  },

  applySettings() {
    const s = this.settings;
    document.documentElement.style.setProperty("--et-accent", s.accent);
    document.documentElement.style.setProperty("--et-background", s.backgroundColor);
    let style = document.getElementById(RUNTIME_STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = RUNTIME_STYLE_ID;
      document.head.appendChild(style);
    }

    const backgroundUrl = /^https?:\/\//i.test(s.backgroundUrl) ? s.backgroundUrl : "";
    const backgroundRule = backgroundUrl
      ? `body{background-image:linear-gradient(rgba(0,0,0,${(100 - Number(s.backgroundOpacity)) / 100}),rgba(0,0,0,${(100 - Number(s.backgroundOpacity)) / 100})),url("${backgroundUrl.replace(/["\\]/g, "")}")!important;background-size:${Number(s.backgroundScale)}% auto!important;background-position:${Number(s.backgroundX)}% ${Number(s.backgroundY)}%!important;background-repeat:no-repeat!important}`
      : "";

    style.textContent = `
      ${backgroundRule}
      [class*="message"]{font-size:${Number(s.fontSize)}px;margin-bottom:${Number(s.messageSpacing)}px}
      [class*="members"],[class*="memberList"]{${s.hideMemberList ? "display:none!important" : ""}}
      ${s.compactMode ? '[class*="message"]{padding-top:2px!important;padding-bottom:2px!important}' : ""}
      ${s.reducedMotion ? "*{animation:none!important;transition:none!important;scroll-behavior:auto!important}" : ""}
      ${s.customCSS || ""}
    `;
  },

  findComposer() {
    return document.querySelector('[class*="channelTextArea"]')
      || document.querySelector('[class*="scrollableContainer"]')
      || document.querySelector('[class*="form_"]');
  },

  addChatButton() {
    if (!this.settings.enabled || document.getElementById(BUTTON_ID)) return;
    const composer = this.findComposer();
    if (!composer) return;

    const button = document.createElement("button");
    button.id = BUTTON_ID;
    button.type = "button";
    button.title = "Examination Tools";
    button.setAttribute("aria-label", "Open Examination Tools");
    button.textContent = "✚";
    button.addEventListener("click", () => this.openPanel());
    composer.appendChild(button);
  },

  openPanel() {
    if (document.getElementById(MODAL_ID)) return;
    const modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.innerHTML = `
      <section id="et-panel">
        <aside class="et-sidebar"><div class="et-title">EXAMINATION</div><nav class="et-nav">
          <button class="active" data-screen="preview">Preview</button>
          <button data-screen="background">Background</button>
          <button data-screen="theme">Theme</button>
          <button data-screen="layout">Layout</button>
          <button data-screen="debug">Debug</button>
          <button data-screen="data">Import / Export</button>
        </nav></aside>
        <main class="et-content"><button id="et-close" aria-label="Close">×</button><div id="et-screen"></div></main>
      </section>`;
    document.body.appendChild(modal);
    modal.querySelector("#et-close").onclick = () => modal.remove();
    modal.addEventListener("click", event => { if (event.target === modal) modal.remove(); });
    modal.querySelectorAll("[data-screen]").forEach(button => {
      button.onclick = () => {
        modal.querySelectorAll("[data-screen]").forEach(item => item.classList.remove("active"));
        button.classList.add("active");
        this.renderScreen(button.dataset.screen);
      };
    });
    this.renderScreen("preview");
  },

  card(label, input) { return `<div class="et-card"><label>${label}</label>${input}</div>`; },
  textControl(key, label, type = "text") {
    return this.card(label, `<input type="${type}" data-key="${key}" value="${this.escapeHTML(this.settings[key])}">`);
  },
  rangeControl(key, label, min, max, step = 1) {
    return this.card(`${label}: <span data-value="${key}">${this.settings[key]}</span>`, `<input type="range" data-key="${key}" min="${min}" max="${max}" step="${step}" value="${this.settings[key]}">`);
  },
  checkControl(key, label) {
    return this.card(label, `<input type="checkbox" data-key="${key}" ${this.settings[key] ? "checked" : ""}>`);
  },

  renderScreen(screen) {
    const root = document.getElementById("et-screen");
    if (!root) return;
    const pages = {
      preview: `<h2>Live Theme Preview</h2><div class="et-preview" id="et-preview"></div><div class="et-grid">${this.textControl("accent", "Accent colour", "color")}${this.textControl("backgroundColor", "Panel colour", "color")}</div>`,
      background: `<h2>Background</h2><div class="et-grid">${this.textControl("backgroundUrl", "Image URL", "url")}${this.rangeControl("backgroundOpacity", "Opacity", 0, 100)}${this.rangeControl("backgroundBlur", "Blur setting", 0, 30)}${this.rangeControl("backgroundScale", "Scale", 10, 300)}${this.rangeControl("backgroundX", "Horizontal position", 0, 100)}${this.rangeControl("backgroundY", "Vertical position", 0, 100)}</div>`,
      theme: `<h2>Theme</h2><div class="et-grid">${this.textControl("accent", "Accent colour", "color")}${this.textControl("backgroundColor", "Background colour", "color")}</div>`,
      layout: `<h2>Chat Layout</h2><div class="et-grid">${this.rangeControl("fontSize", "Font size", 10, 24)}${this.rangeControl("messageSpacing", "Message spacing", 0, 30)}${this.checkControl("compactMode", "Compact messages")}${this.checkControl("hideMemberList", "Hide member list")}${this.checkControl("reducedMotion", "Reduce motion")}</div>`,
      debug: `<h2>Plugin Status & Debug Logs</h2><div id="et-logs"></div><div class="et-actions"><button class="et-action" data-action="clear">Clear logs</button><button class="et-action" data-action="status">Refresh status</button></div>`,
      data: `<h2>Import / Export Settings</h2>${this.card("Settings JSON", `<textarea id="et-json">${this.escapeHTML(JSON.stringify(this.settings, null, 2))}</textarea>`)}<div class="et-actions"><button class="et-action" data-action="copy">Copy export</button><button class="et-action" data-action="import">Import JSON</button><button class="et-action" data-action="download">Download JSON</button><button class="et-action" data-action="reset">Reset defaults</button></div>`
    };
    root.innerHTML = pages[screen];

    root.querySelectorAll("[data-key]").forEach(control => {
      const update = () => {
        const key = control.dataset.key;
        this.settings[key] = control.type === "checkbox" ? control.checked
          : control.type === "range" ? Number(control.value) : control.value;
        const output = root.querySelector(`[data-value="${key}"]`);
        if (output) output.textContent = this.settings[key];
        this.saveSettings();
        if (screen === "preview") this.renderScreen("preview");
      };
      control.addEventListener("input", update);
      control.addEventListener("change", update);
    });

    const preview = root.querySelector("#et-preview");
    if (preview && /^https?:\/\//i.test(this.settings.backgroundUrl)) {
      preview.style.backgroundImage = `linear-gradient(120deg,rgba(0,0,0,.2),#151515),url("${this.settings.backgroundUrl.replace(/["\\]/g, "")}")`;
    }
    if (screen === "debug") this.renderLogs();
    root.querySelectorAll("[data-action]").forEach(button => {
      button.onclick = () => this.handleAction(button.dataset.action);
    });
  },

  renderLogs() {
    const element = document.getElementById("et-logs");
    if (element) element.textContent = this.logs.map(item => `[${item.time}] ${item.level}: ${item.message}`).join("\n") || "No log entries.";
  },

  handleAction(action) {
    if (action === "clear") { this.logs = []; this.renderLogs(); return; }
    if (action === "status") { this.log("Plugin is running"); this.renderLogs(); return; }
    if (action === "copy") {
      navigator.clipboard?.writeText(JSON.stringify(this.settings, null, 2));
      this.log("Settings copied to clipboard");
      return;
    }
    if (action === "import") {
      try {
        this.settings = { ...DEFAULTS, ...JSON.parse(document.getElementById("et-json").value) };
        this.saveSettings();
        this.log("Settings imported");
        this.renderScreen("preview");
      } catch (error) { this.log(`Import failed: ${String(error)}`, "error"); }
      return;
    }
    if (action === "download") {
      const blob = new Blob([JSON.stringify(this.settings, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "examination-tools-settings.json";
      link.click();
      URL.revokeObjectURL(url);
      return;
    }
    if (action === "reset") {
      this.settings = { ...DEFAULTS };
      this.saveSettings();
      this.renderScreen("preview");
    }
  }
};
