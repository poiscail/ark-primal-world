/* Musique procédurale à 3 ambiances : menu (calme), combat (rythmé), boss (sombre et tendu) */
const MSC={menu:{ms:560,root:[220,247,262,294,330,392,440,494],seq:[0,2,4,2,5,4,2,1,0,3,4,6,5,4,2,3],lead:"sine",lv:.08,bass:1,perc:false},
 battle:{ms:300,root:[196,233,262,294,349,392,466,524],seq:[0,0,3,0,4,0,3,5,0,0,3,0,6,5,4,3],lead:"triangle",lv:.09,bass:2,perc:true},
 boss:{ms:240,root:[174,185,220,233,262,277,330,349],seq:[0,1,0,1,3,2,0,1,0,1,4,3,5,4,3,1],lead:"sawtooth",lv:.06,bass:2,perc:true,dark:true}};
function musicMode(){if(screen!=="battle"||!fight||fight.over)return"menu";const e=fight.enemies&&fight.enemies[fight.wave];return e&&e.boss&&fight.wave===2?"boss":"battle"}
let mCur="menu";
function musicTick(){if(!PREFS.music||!PREFS.sound){stopMusic();return}const m=musicMode();if(m!==mCur){mCur=m;clearInterval(musicT);musicT=setInterval(musicTick,MSC[m].ms)}
 const c=MSC[m],n=c.seq[mStep%16],f=c.root[n];
 tone(f/2,c.ms/600,c.lead,c.lv,0);
 if(mStep%4===0)tone(f/4,c.ms*3/1000,"triangle",.07,0);
 if(c.bass===2&&mStep%2===0)tone(f/4,.18,"square",.05,0);
 if(c.perc){if(mStep%4===0)tone(90,.12,"sine",.22,0,40);else if(mStep%4===2)tone(300,.05,"square",.05,0,120);if(mStep%2===1)tone(6000,.03,"square",.015,0)}
 if(c.dark&&mStep%8===6)tone(f*1.5,.5,"sawtooth",.035,0,f*1.45);
 if(mStep%16===15)tone(f*2,.6,"sine",.04,0);
 mStep++}
function startMusic(){if(musicT||!PREFS.music||!PREFS.sound)return;ac();mCur=musicMode();musicT=setInterval(musicTick,MSC[mCur].ms)}
