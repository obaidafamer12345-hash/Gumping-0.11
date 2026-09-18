function finishLevel(){
  mode="win";best=Math.max(best,score);gbank+=gold;dbank+=diamond;open=Math.min(levels.length,Math.max(open,level+1));save();
  $("hud").style.display=$("controls").style.display=$("pauseBtn").style.display="none";
  $("winText").innerHTML=`${levels[level-1][1]}<br>🏆 ${score} · 🪙 ${gold} · 💎 ${diamond}`;
  $("next").textContent=level<levels.length?"⚡ فتح المرحلة التالية":"🏆 العودة للمراحل";
  $("win").style.display="flex";sfx("win");
}
function gameOver(){
  mode="over";best=Math.max(best,score);save();
  $("hud").style.display=$("controls").style.display=$("pauseBtn").style.display="none";$("over").style.display="flex";
}
function tap(id,fn){
  const b=$(id);
  if(!b)return;
  let fired=0;
  const run=e=>{
    if(e){e.preventDefault();e.stopPropagation();}
    const now=performance.now();
    if(now-fired<250)return;
    fired=now;
    try{fn();}catch(err){console.error("Epix UI action failed:",id,err);}
  };
  // click is the most reliable activation path across mobile browsers.
  b.addEventListener("click",run,{passive:false});
  b.addEventListener("pointerup",run,{passive:false});
  b.addEventListener("touchend",run,{passive:false});
  b.addEventListener("keydown",e=>{
    if(e.key==="Enter"||e.key===" "){run(e);}
  });
}
tap("levelsBtn",showLevels);
tap("settingsBtn",showSettings);tap("home3",home);tap("musicToggle",()=>toggleSetting("music"));tap("sfxToggle",()=>toggleSetting("sfx"));tap("vibrateToggle",()=>toggleSetting("vibrate"));
tap("shopBtn",()=>{mode="shop";hideScreens();renderShop();$("shop").style.display="flex";$("hud").style.display=$("controls").style.display=$("pauseBtn").style.display="none";updateRotateGuard()});
tap("home1",home);tap("home2",home);tap("levels2",showLevels);tap("levels3",showLevels);tap("levels4",showLevels);tap("retry",()=>enterGame(level));
tap("pauseBtn",()=>{if(mode==="play"){mode="pause";$("pause").style.display="flex";updateRotateGuard()}});
tap("resume",()=>{mode="play";$("pause").style.display="none";audioStart();updateRotateGuard()});
tap("restart",()=>{resetLevel();mode="play";$("pause").style.display="none";audioStart();updateRotateGuard()});
tap("next",()=>level<levels.length?enterGame(level+1):showLevels());

// Defensive mobile fallback: direct onclick handlers guarantee menu navigation even
// on browsers with unusual PointerEvent/touch behavior. Each action is guarded.
(function bindCriticalMenuActions(){
  const bind=(id,fn)=>{const b=$(id); if(b) b.onclick=()=>{try{fn();}catch(e){console.error(e);}};};
  bind("levelsBtn",showLevels);
  bind("shopBtn",()=>{mode="shop";hideScreens();renderShop();$("shop").style.display="flex";$("hud").style.display=$("controls").style.display=$("pauseBtn").style.display="none";updateRotateGuard();});
  bind("settingsBtn",showSettings);
})();
addEventListener("resize",updateRotateGuard);
addEventListener("orientationchange",()=>setTimeout(updateRotateGuard,150));

function hold(id,key){
  const b=$(id);if(!b)return;
  const on=e=>{e.preventDefault();keys[key]=true;b.classList.add("pressed");try{b.setPointerCapture?.(e.pointerId)}catch{}};
  const off=e=>{e.preventDefault();keys[key]=false;b.classList.remove("pressed")};
  b.addEventListener("pointerdown",on,{passive:false});
  ["pointerup","pointercancel","pointerleave"].forEach(v=>b.addEventListener(v,off,{passive:false}));
}
function action(id,fn){
  const b=$(id);if(!b)return;
  b.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();b.classList.add("pressed");fn();},{passive:false});
  ["pointerup","pointercancel","pointerleave"].forEach(v=>b.addEventListener(v,e=>{e.preventDefault();b.classList.remove("pressed")},{passive:false}));
}
hold("left","ArrowLeft");hold("right","ArrowRight");
(function setupJump(){const b=$("jump");if(!b)return;
 const down=e=>{e.preventDefault();e.stopPropagation();if(!jumpHeld){jumpHeld=true;player.jumpBuffer=MOVE.buffer;jump();}b.classList.add("pressed");try{b.setPointerCapture?.(e.pointerId)}catch{}};
 const up=e=>{e.preventDefault();jumpRelease();b.classList.remove("pressed")};
 b.addEventListener("pointerdown",down,{passive:false});["pointerup","pointercancel","pointerleave"].forEach(v=>b.addEventListener(v,up,{passive:false}));
})();
(function setupSlide(){const b=$("slide");if(!b)return;const on=e=>{e.preventDefault();e.stopPropagation();setSlide(true);b.classList.add("pressed")};const off=e=>{e.preventDefault();setSlide(false);b.classList.remove("pressed")};b.addEventListener("pointerdown",on,{passive:false});["pointerup","pointercancel","pointerleave"].forEach(v=>b.addEventListener(v,off,{passive:false}))})();
addEventListener("keydown",e=>{
  keys[e.code]=true;
  if(["ArrowLeft","ArrowRight","ArrowUp","Space"].includes(e.code))e.preventDefault();
  if(e.code==="ArrowUp"||e.code==="Space"||e.code==="KeyW"){if(!jumpHeld){jumpHeld=true;player.jumpBuffer=MOVE.buffer;jump();}}
  if(e.code==="ArrowDown"||e.code==="KeyS")setSlide(true);
  if((e.code==="Escape"||e.code==="KeyP")&&mode==="play")$("pauseBtn").click();
});
addEventListener("keyup",e=>{keys[e.code]=false;if(e.code==="ArrowDown"||e.code==="KeyS")setSlide(false);if(e.code==="ArrowUp"||e.code==="Space"||e.code==="KeyW")jumpRelease()});

renderHome();renderLevels();
function loop(){engine.frame(()=>update(),()=>draw());requestAnimationFrame(loop)}loop();
