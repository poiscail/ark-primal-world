/* Premier moteur de combat à orbes */
const EL=["redorb","blueorb","greenorb","purpleorb","goldorb"],ICO={redorb:"🔥",blueorb:"💧",greenorb:"🌿",purpleorb:"⚡",goldorb:"☀️"},BEAT={redorb:"greenorb",greenorb:"blueorb",blueorb:"redorb"},rnd=n=>Math.floor(Math.random()*n);
const _tb=topbar;topbar=function(){_tb();const b=document.getElementById("xpBar");if(b)b.style.width=Math.min(100,S.xp/need(S.level)*100)+"%"};
const newOrbs=()=>Array.from({length:9},()=>EL[rnd(5)]);






document.getElementById("adminFab").classList.remove("hide");
