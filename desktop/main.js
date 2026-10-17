/* ARK: Primal World — application Windows (Electron).
   Ouvre le jeu (copié dans app/ par tools/build_exe.py) dans une fenêtre : plein écran avec F11,
   une seule fenêtre à la fois, taille et position mémorisées. La sauvegarde (localStorage) reste sur l'ordinateur,
   dans %APPDATA%\ARK Primal World ; l'export/import de sauvegarde (Accueil > Sauvegarde) permet de la déplacer.
   --smoke-test : lance le jeu dans un dossier de données à part (--smoke-data=dossier, jamais la vraie sauvegarde),
   joue un combat, fait une invocation et clique vraiment sur OK, écrit un rapport (--smoke-out=fichier.json),
   une capture (--smoke-shot=fichier.png) et quitte avec le code 0 (succès) ou 1 (échec).
   --smoke-expect-boot=N : vérifie aussi que c'est le N-ième lancement avec ce dossier (sauvegarde conservée). */
const { app, BrowserWindow, Menu, ipcMain, shell, session, dialog, screen } = require("electron");
const path = require("path"), fs = require("fs");
const arg = k => { const a = process.argv.find(x => x.startsWith(k + "=")); return a ? a.slice(k.length + 1) : null };
const SMOKE = process.argv.includes("--smoke-test");
if (SMOKE) app.setPath("userData", path.resolve(arg("--smoke-data") || path.join(app.getPath("temp"), "ark-primal-world-smoke")));
/* 0.41 : version portable avec la sauvegarde à côté de l'exe (dossier « ARK Primal World - sauvegarde », option des réglages) */
const NORMAL_DATA = app.getPath("userData");
const PORT_DIR = process.env.PORTABLE_EXECUTABLE_DIR || null, PORT_SAVE = PORT_DIR ? path.join(PORT_DIR, "ARK Primal World - sauvegarde") : null;
if (!SMOKE && PORT_SAVE && fs.existsSync(PORT_SAVE)) app.setPath("userData", PORT_SAVE);
if (process.platform === "win32") app.setAppUserModelId("fr.poiscail.arkprimalworld");
/* options de l'application (fenêtre sans bordure, dossier de copie de sauvegarde) */
const optFile = () => path.join(app.getPath("userData"), "options.json");
function loadOpt() { try { return JSON.parse(fs.readFileSync(optFile(), "utf8")) } catch (e) { return {} } }
function saveOpt(o) { try { fs.writeFileSync(optFile(), JSON.stringify(o)) } catch (e) {} }
const crashLog = m => { try { fs.appendFileSync(path.join(app.getPath("userData"), "plantages.log"), new Date().toISOString() + " " + m + "\n") } catch (e) {} };
let win = null;
const stateFile = () => path.join(app.getPath("userData"), "fenetre.json");
function loadState() { try { return JSON.parse(fs.readFileSync(stateFile(), "utf8")) } catch (e) { return {} } }
function saveState() {
  if (!win || SMOKE) return;
  try { const b = win.getNormalBounds(); fs.writeFileSync(stateFile(), JSON.stringify({ x: b.x, y: b.y, w: b.width, h: b.height, max: win.isMaximized(), full: win.isFullScreen() })) } catch (e) {}
}
function createWindow() {
  const st = SMOKE ? {} : loadState(), opt = SMOKE ? {} : loadOpt();
  let bl = null;
  if (opt.borderless) { try { bl = screen.getDisplayNearestPoint({ x: st.x || 0, y: st.y || 0 }).bounds } catch (e) { bl = null } }
  win = new BrowserWindow({
    width: bl ? bl.width : st.w || 1280, height: bl ? bl.height : st.h || 800, x: bl ? bl.x : st.x, y: bl ? bl.y : st.y, minWidth: 1024, minHeight: 640, frame: !bl,
    backgroundColor: "#04060d", title: "ARK: Primal World", show: false, autoHideMenuBar: true,
    icon: path.join(__dirname, "build", "icon.ico"),
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, sandbox: true, spellcheck: false,
      devTools: !app.isPackaged || process.env.ARK_DEVTOOLS === "1" }
  });
  Menu.setApplicationMenu(null);
  if (st.max && !bl) win.maximize();
  if (st.full) win.setFullScreen(true);
  win.once("ready-to-show", () => win.show());
  win.on("close", saveState);
  try { const z = win.webContents.setVisualZoomLevelLimits(1, 1); if (z && z.catch) z.catch(() => {}) } catch (e) {}
  win.webContents.on("before-input-event", (e, i) => {
    if (i.type === "keyDown" && i.key === "F11") { win.setFullScreen(!win.isFullScreen()); e.preventDefault() }
    if (i.type === "keyDown" && i.key === "F12" && !SMOKE) { e.preventDefault(); screenshot() }
  });
  /* aucun site extérieur dans la fenêtre du jeu : les liens s'ouvrent dans le navigateur */
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/i.test(url)) shell.openExternal(url); return { action: "deny" } });
  win.webContents.on("will-navigate", (e, url) => { if (!url.startsWith("file:")) { e.preventDefault(); if (/^https?:/i.test(url)) shell.openExternal(url) } });
  win.webContents.on("render-process-gone", (e, d) => { crashLog("moteur du jeu arrêté : " + (d && d.reason)); if (!SMOKE && d && d.reason !== "clean-exit") setTimeout(() => { try { win.reload() } catch (x) {} }, 500) });
  win.webContents.on("unresponsive", () => crashLog("le jeu ne répond plus"));
  if (SMOKE) smokeTest();
  win.loadFile(path.join(__dirname, "app", "index.html"));
}
/* exporter une sauvegarde : fenêtre « Enregistrer sous », dans Documents par défaut */
function setupDownloads() {
  session.defaultSession.on("will-download", (e, item) => {
    if (SMOKE) { item.setSavePath(path.join(app.getPath("userData"), item.getFilename())); return }
    item.setSaveDialogOptions({ title: /\.png$/i.test(item.getFilename()) ? "Enregistrer l'image" : "Exporter la sauvegarde", defaultPath: path.join(app.getPath("documents"), item.getFilename()) });
  });
}
/* capture d'écran (F12) dans Images\ARK Primal World */
async function screenshot() {
  try {
    const img = await win.webContents.capturePage(), dir = path.join(app.getPath("pictures"), "ARK Primal World"), d = new Date(), z = n => String(n).padStart(2, "0");
    fs.mkdirSync(dir, { recursive: true });
    const f = path.join(dir, `ARK-${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}-${z(d.getHours())}${z(d.getMinutes())}${z(d.getSeconds())}.png`);
    fs.writeFileSync(f, img.toPNG()); win.webContents.send("ark:shot", f);
  } catch (e) { try { win.webContents.send("ark:shot", "") } catch (x) {} }
}
app.on("child-process-gone", (e, d) => crashLog("processus " + (d && d.type) + " arrêté : " + (d && d.reason)));
ipcMain.on("ark:opts", e => { e.returnValue = { ...loadOpt(), portableSave: !!(PORT_SAVE && app.getPath("userData") === PORT_SAVE), canPortable: !!PORT_SAVE } });
ipcMain.on("ark:setOpt", (e, k, v) => { if (k !== "borderless") return; const o = loadOpt(); o[k] = !!v; saveOpt(o) });
ipcMain.on("ark:relaunch", () => { try { session.defaultSession.flushStorageData() } catch (e) {} app.relaunch(); app.exit(0) });
ipcMain.on("ark:crashlog", e => { try { e.returnValue = fs.readFileSync(path.join(app.getPath("userData"), "plantages.log"), "utf8").slice(-8000) } catch (x) { e.returnValue = "" } });
/* copie de sauvegarde dans un dossier choisi (OneDrive, clé USB…) : seulement des .json, seulement dans ce dossier */
ipcMain.handle("ark:pickDir", async () => {
  const r = await dialog.showOpenDialog(win, { title: "Dossier pour les copies de sauvegarde", properties: ["openDirectory", "createDirectory"] });
  if (r.canceled || !r.filePaths[0]) return null;
  const o = loadOpt(); o.backupDir = r.filePaths[0]; saveOpt(o); return o.backupDir;
});
ipcMain.on("ark:backup", (e, name, content) => {
  const o = loadOpt();
  if (!o.backupDir || !/^[\w .-]+\.json$/.test(String(name || "")) || typeof content !== "string" || content.length > 2e7) { e.returnValue = false; return }
  try { fs.mkdirSync(o.backupDir, { recursive: true }); fs.writeFileSync(path.join(o.backupDir, name), content); e.returnValue = true } catch (x) { e.returnValue = false }
});
ipcMain.on("ark:noBackup", () => { const o = loadOpt(); delete o.backupDir; saveOpt(o) });
/* version portable : déplacer la sauvegarde à côté de l'exe (ou la ramener) ; prend effet au prochain lancement */
ipcMain.on("ark:portable", (e, on) => {
  if (!PORT_SAVE) { e.returnValue = { ok: false, why: "Ce n'est pas la version portable." }; return }
  try {
    try { session.defaultSession.flushStorageData() } catch (x) {}
    const skip = src => !/(^|[\\/])(LOCK|lockfile|SingletonLock)$/.test(src);
    if (on) fs.cpSync(app.getPath("userData"), PORT_SAVE, { recursive: true, force: true, filter: skip });
    else { fs.cpSync(PORT_SAVE, NORMAL_DATA, { recursive: true, force: true, filter: skip }); fs.rmSync(PORT_SAVE, { recursive: true, force: true }) }
    e.returnValue = { ok: true };
  } catch (x) { e.returnValue = { ok: false, why: String(x && x.message || x) } }
});
ipcMain.on("ark:fullscreen", () => { if (win) win.setFullScreen(!win.isFullScreen()) });
ipcMain.on("ark:quit", () => app.quit());
ipcMain.on("ark:info", e => { e.returnValue = { version: app.getVersion(), platform: process.platform, portable: !!process.env.PORTABLE_EXECUTABLE_DIR, data: app.getPath("userData") } });
/* test de lancement (utilisé par la construction automatique sur Windows) */
function smokeTest() {
  const errs = [], wc = win.webContents, js = s => wc.executeJavaScript(s), wait = ms => new Promise(res => setTimeout(res, ms));
  wc.on("console-message", e => { if (e.level === "error") errs.push(String(e.message)) });
  wc.on("did-fail-load", (e, code, desc) => errs.push("chargement impossible : " + desc));
  wc.on("render-process-gone", (e, d) => errs.push("moteur arrêté : " + (d && d.reason)));
  const finish = (rep, code) => {
    const out = arg("--smoke-out");
    if (out) try { fs.writeFileSync(out, JSON.stringify(rep, null, 1)) } catch (e) {}
    console.log("SMOKE " + JSON.stringify(rep));
    app.exit(code);
  };
  setTimeout(() => finish({ ok: false, errs: errs.concat("délai dépassé") }, 1), 60000);
  wc.once("did-finish-load", () => setTimeout(async () => {
    const r = { appVersion: app.getVersion(), data: app.getPath("userData") };
    try {
      /* 1. démarrage, combat d'histoire joué jusqu'au bout, réglages de l'application, sauvegarde */
      Object.assign(r, await js(`(()=>{const out={version:typeof ARK_VERSION==="string"?ARK_VERSION:null,platform:typeof ARK_PLATFORM==="string"?ARK_PLATFORM:null,desktop:!!window.arkDesktop,
        boot:Number(localStorage.getItem("arkSmokeBoot")||0)+1};localStorage.setItem("arkSmokeBoot",String(out.boot));
        try{ens();out.stage0=S.stage||0;setPref("lore",false);setPref("anim",false);S.tut.off=true;
          startBattle({mode:"story",n:Math.min(100,(S.stage||0)+1)});let g=0;
          while(fight&&!fight.over&&g++<400){[0,1,2].forEach(k=>{if(!fight.over&&fight.hp[k]>0&&fight.cd[k]<=0)useSkill(k)});if(fight.over)break;
            if(fight.sp>=100){special();continue}let best=0,bv=-1;fight.orbs.forEach((c,i)=>{const v=orbPreview(c);if(v>bv){bv=v;best=i}});tapOrb(best)}
          out.battle=fight?fight.over:null;out.scene=!!document.querySelector("#battleArea .battlestage");out.stage1=S.stage||0;
          openSettings();out.settings=!!document.getElementById("setDesktop");closeSettings();
          save();out.save=!!localStorage.getItem("arkPrimalMobile")}catch(e){out.error=String(e&&e.stack||e)}return out})()`));
      /* 2. invocation animée, puis vrai clic souris sur OK (régression 0.13 : un calque restait par-dessus et bloquait le bouton) */
      await js('setPref("anim",true);go("summon");S.tickets+=1;summon(1);true');
      for (let k = 0; k < 120 && !r.summon; k++) {
        await wait(100);
        r.summon = await js('(()=>{const v=document.getElementById("gachaVeil");return !v.classList.contains("hide")&&!v.classList.contains("summoning")})()');
      }
      if (r.summon) {
        await wait(400);
        const p = await js(`(()=>{const b=[...document.querySelectorAll("#gachaBody button")].find(x=>/OK/.test(x.textContent));if(!b)return null;
          b.scrollIntoView({block:"center"});const q=b.getBoundingClientRect(),x=Math.round(q.left+q.width/2),y=Math.round(q.top+q.height/2),t=document.elementFromPoint(x,y);
          return{x,y,top:!!t&&(t===b||b.contains(t))}})()`);
        r.okOnTop = !!(p && p.top);
        if (p) for (const type of ["mouseMove", "mouseDown", "mouseUp"]) wc.sendInputEvent({ type, x: p.x, y: p.y, button: "left", clickCount: 1 });
        for (let k = 0; k < 30 && !r.summonClosed; k++) { await wait(100); r.summonClosed = await js('document.getElementById("gachaVeil").classList.contains("hide")') }
      }
      /* 3. capture de l'accueil */
      const shot = arg("--smoke-shot");
      if (shot) { await js('go("home");true'); await wait(900); fs.writeFileSync(shot, (await wc.capturePage()).toPNG()) }
    } catch (e) { errs.push(String(e)) }
    try { session.defaultSession.flushStorageData() } catch (e) {}
    await wait(600);
    const eb = arg("--smoke-expect-boot");
    if (eb) r.persist = r.boot === Number(eb) && (Number(eb) < 2 || r.stage0 >= 1);
    const ok = !errs.length && !r.error && r.version && r.version === r.appVersion && r.platform === "pc" && r.desktop && r.battle === "win" && r.scene
      && r.settings && r.summon && r.okOnTop && r.summonClosed && r.save && (eb ? r.persist : true);
    finish({ ok: !!ok, ...r, errs }, ok ? 0 : 1);
  }, 2500));
}
if (!SMOKE && !app.requestSingleInstanceLock()) app.quit();
else {
  app.on("second-instance", () => { if (win) { if (win.isMinimized()) win.restore(); win.focus() } });
  app.whenReady().then(() => { setupDownloads(); createWindow() });
  app.on("before-quit", () => { try { session.defaultSession.flushStorageData() } catch (e) {} });
  app.on("window-all-closed", () => app.quit());
}
