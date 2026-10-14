/* Service worker : mode hors ligne. La version vient de js/00-version.js (changer ARK_VERSION invalide le cache). */
importScripts("js/00-version.js");
const CACHE="ark-primal-"+ARK_VERSION;
const FILES=["./","index.html","manifest.json","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","icons/apple-touch-icon.png"
 ,"css/00-base.css","css/10-combat.css","css/20-effects.css","css/30-nav.css","css/40-skills.css","css/50-gacha.css","css/60-equipment.css","css/70-modes.css","css/80-fx.css"
 ,"js/00-version.js","js/00-core.js","js/05-admin.js","js/10-combat-v1.js","js/20-team-forge-save.js","js/30-zones-supers.js","js/40-progression.js","js/50-skills-species.js","js/60-gacha-hud.js","js/70-equipment.js","js/80-modes.js","js/90-settings-audio.js","js/95-portraits.js","js/99-pwa.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("ark-primal-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET"||new URL(r.url).origin!==location.origin)return;
 e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>r.mode==="navigate"?caches.match("index.html"):Response.error())))});
