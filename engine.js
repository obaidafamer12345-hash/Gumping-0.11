"use strict";
/* EPIX ENGINE — deterministic, safe, reusable gameplay core */
class EpixEngine extends EpixEngineCore{
  constructor(){super();this.maxDt=.05}

  aabb(a,b){return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y}
  safeSpawn(x, groundY, player, platforms, hazards, enemies){
    const candidates=[x,x-80,x+80,x-160,x+160,80];
    for(const c of candidates){
      const box={x:Math.max(8,c),y:groundY-player.h,w:player.w,h:player.h};
      const onGround=platforms.some(a=>box.x+box.w>a.x&&box.x<a.x+a.w&&Math.abs((a.y)-(groundY))<2);
      const badHaz=hazards.some(h=>box.x+box.w>h.x-18&&box.x<h.x+h.w+18&&box.y+box.h>h.y-12&&box.y<h.y+h.h+12);
      const badEnemy=enemies.some(e=>box.x+box.w>e.x-45&&box.x<e.x+e.w+45&&box.y+box.h>e.y-35&&box.y<e.y+e.h+35);
      if(onGround&&!badHaz&&!badEnemy)return Math.max(8,c);
    }
    return 80;
  }
}
window.EpixEngine=EpixEngine;const engine=new EpixEngine();
const canvas=document.getElementById("game"),ctx=canvas.getContext("2d"),$=id=>document.getElementById(id);
let W=960,H=540,S=1,DPR=1;
function resize(){
  const ratio=innerWidth/Math.max(1,innerHeight);
  W=ratio>=1?960:540*ratio; H=ratio>=1?540:540;
  DPR=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
addEventListener("resize",resize);addEventListener("orientationchange",()=>setTimeout(resize,120));resize();
