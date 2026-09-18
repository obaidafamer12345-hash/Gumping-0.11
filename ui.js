function updateRotateGuard(){
  const portrait=innerHeight>innerWidth;
  const playing=(mode==="play"||mode==="pause");
  $("rotate").classList.toggle("show",portrait&&playing);
}
function hideScreens(){["home","levels","shop","settings","pause","win","over"].forEach(id=>$(id).style.display="none");updateRotateGuard()}
function enterGame(n){
  level=n;resetLevel();mode="play";hideScreens();
  $("hud").style.display="flex";$("controls").style.display="flex";$("pauseBtn").style.display="block";audioStart();updateRotateGuard();
}
function home(){mode="home";hideScreens();$("home").style.display="flex";$("hud").style.display=$("controls").style.display=$("pauseBtn").style.display="none";renderHome()}
function showLevels(){mode="levels";hideScreens();renderLevels();$("levels").style.display="flex";$("hud").style.display=$("controls").style.display=$("pauseBtn").style.display="none";updateRotateGuard()}
const settingsState={music:localStorage.epixMusic!=="0",sfx:localStorage.epixSfx!=="0",vibrate:localStorage.epixVibrate!=="0"};
function syncSettings(){["music","sfx","vibrate"].forEach(k=>{const b=$(k+"Toggle");if(!b)return;b.textContent=settingsState[k]?"تشغيل":"كتم";b.classList.toggle("off",!settingsState[k])})}
function showSettings(){mode="settings";hideScreens();syncSettings();$("settings").style.display="flex";$("hud").style.display=$("controls").style.display=$("pauseBtn").style.display="none";updateRotateGuard()}
function toggleSetting(k){settingsState[k]=!settingsState[k];localStorage["epix"+k[0].toUpperCase()+k.slice(1)]=settingsState[k]?"1":"0";syncSettings();if(k==="music"&&!settingsState.music){/* future audio nodes are gated by music flag */}}

function renderHome(){
  $("best").textContent=best;$("goldBank").textContent=gbank;$("diamondBank").textContent=dbank;$("openCount").textContent=open;
}
function renderLevels(){
  const grid=$("levelGrid");grid.innerHTML="";
  levels.forEach((lv,i)=>{
    const b=document.createElement("button");b.type="button";b.className="tile "+(i+1>open?"lock":"");
    b.innerHTML="<b>"+lv[0]+" "+(i+1)+"</b><small>"+(i+1<=open?lv[1]:"🔒 مغلقة")+"</small>";
    if(i+1<=open)b.onclick=()=>enterGame(i+1);
    grid.appendChild(b);
  });
}
function renderShop(){
  const grid=$("shopGrid");grid.innerHTML="";
  Object.entries(heroes).forEach(([k,h])=>{
    const box=document.createElement("div");box.className="hero";
    const have=owned.includes(k), selected=hero===k;
    box.innerHTML=`<div class="avatar">${h.icon}</div><h3>${h.name}</h3><div class="price">${have?"✅ مملوكة":(h.type==="gold"?"🪙 "+h.cost:"💎 "+h.cost)}</div><button type="button" class="main">${have?(selected?"⭐ مختارة":"اختيار"):"شراء"}</button>`;
    box.querySelector("button").onclick=()=>{
      if(have){hero=k;localStorage.epixHero=k;renderShop();return}
      if(h.type==="gold"&&gbank>=h.cost){gbank-=h.cost;owned.push(k);hero=k;save();renderShop()}
      else if(h.type==="diamond"&&dbank>=h.cost){dbank-=h.cost;owned.push(k);hero=k;save();renderShop()}
      else alert("الرصيد غير كافٍ!");
    };
    grid.appendChild(box);
  });
}
function save(){
  localStorage.epixBest=best;localStorage.epixGold=gbank;localStorage.epixDiamond=dbank;
  localStorage.epixOpen=open;localStorage.epixOwned=JSON.stringify(owned);localStorage.epixHero=hero;
}
