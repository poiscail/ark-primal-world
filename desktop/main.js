/* ARK: Primal World — application Windows (Electron).
   Ouvre le jeu (copié dans app/ par tools/build_exe.py) dans une fenêtre : plein écran avec F11,
   une seule fenêtre à la fois, taille et position mémorisées. La sauvegarde (localStorage) reste sur l'ordinateur,
   dans %APPDATA%\ARK Primal World ; l'export/import de sauvegarde (Accueil > Sauvegarde) permet de la déplacer.
   --smoke-test : lance le jeu dans un dossier de données à part (--smoke-data=dossier, jamais la vraie sauvegarde),
   joue un combat, fait une invocation et clique vraiment sur OK, écrit un rapport (--smoke-out=fichier.json),
   une capture (--smoke-shot=fichier.png) et quitte avec le code 0 (succès) ou 1 (échec).
   --smoke-expect-boot=N : vérifie aussi que c'est le N-ième lancement avec ce dossier (sauvegarde conservée). */
const { app, BrowserWindow, Menu, ipcMain, shell, session } = require("electron");
const path = require("path"), fs = require("fs");
const arg = k => { const a = process.argv.find(x => x.startsWith(k + "=")); return a ? a.slice(k.length + 1) : null };
const SMOKE = process.argv.includes("--smoke-test");
if (SMOKE) app.setPath("userData", path.resolve(arg("--smoke-data") || path.join(app.getPath("temp"), "ark-primal-world-smoke")));
if (process.platform === "win32") app.setAppUserModelId("fr.poiscail.arkprimalworld");
let win = null;
const stateFile = () => path.join(app.getPath("userData"), "fenetre.json");
function loadState() { try { return JSON.parse(fs.readFileSync(stateFile(), "utf8")) } catch (e) { return {} } }
function saveState() {
  if (!win || SMOKE) return;
  try { const b = win.getNormalBounds(); fs.writeFileSync(stateFile(), JSON.stringify({ x: b.x, y: b.y, w: b.width, h: b.height, max: win.isMaximized(), full: win.isFullScreen() })) } catch (e) {}
}
function createWindow() {
  const st = SMOKE ? {} : loadState();
  win = new BrowserWindow({
    width: st.w || 1280, height: st.h || 800, x: st.x, y: st.y, minWidth: 960, minHeight: 600,
    backgroundColor: "#04060d", title: "ARK: Primal World", show: false, autoHideMenuBar: true,
    icon: path.join(__dirname, "build", "icon.ico"),
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, sandbox: true, spellcheck: false,
      devTools: !app.isPackaged || process.env.ARK_DEVTOOLS === "1" }
  });
  Menu.setApplicationMenu(null);
  if (st.max) win.maximize();
  if (st.full) win.setFullScreen(true);
  win.once("ready-to-show", () => win.show());
  win.on("close", saveState);
  try { const z = win.webContents.setVisualZoomLevelLimits(1, 1); if (z && z.catch) z.catch(() => {}) } catch (e) {}
  win.webContents.on("before-input-event", (e, i) => {
    if (i.type === "keyDown" && i.key === "F11") { win.setFullScreen(!win.isFullScreen()); e.preventDefault() }
  });
  /* aucun site extérieur dans la fenêtre du jeu : les liens s'ouvrent dans le navigateur */
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/i.test(url)) shell.openExternal(url); return { action: "deny" } });
  win.webContents.on("will-navigate", (e, url) => { if (!url.startsWith("file:")) { e.preventDefault(); if (/^https?:/i.test(url)) shell.openExternal(url) } });
  if (SMOKE) smokeTest();
  win.loadFile(path.join(__dirname, "app", "index.html"));
}
/* exporter une sauvegarde : fenêtre « Enregistrer sous », dans Documents par défaut */
function setupDownloads() {
  session.defaultSession.on("will-download", (e, item) => {
    if (SMOKE) { item.setSavePath(path.join(app.getPath("userData"), item.getFilename())); return }
    item.setSaveDialogOptions({ title: "Exporter la sauvegarde", defaultPath: path.join(app.getPath("documents"), item.getFilename()) });
  });
}
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
