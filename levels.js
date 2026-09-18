function buildLevel(n){
  const prof=stageProfiles[n-1], L=levels[n-1][2], gy=410;
  platforms=[];coins=[];gems=[];enemies=[];hazards=[];checkpoints=[];

  // EPIX TERRAIN BUILDER: every world has a different terrain grammar.
  // Ground is continuous where it is visually shown; lethal areas are never
  // placed on top of a platform that looks walkable.
  const terrain={
    1:{w:[300,380,330,420],g:[55,70,60],rise:[0,0,22,0]},
    2:{w:[240,280,210,310],g:[120,150,105,135],rise:[0,35,60,20]},
    3:{w:[310,260,360,280],g:[65,95,70],rise:[0,28,0,45]},
    4:{w:[220,300,245,340],g:[125,80,145],rise:[0,32,55,0]},
    5:{w:[330,240,300,260],g:[70,110,75],rise:[0,45,0,65]},
    6:{w:[280,360,250,320],g:[80,55,95],rise:[25,0,48,15]},
    7:{w:[380,300,340,260],g:[90,120,70],rise:[0,25,55,10]},
    8:{w:[250,290,220,310],g:[115,75,135],rise:[55,20,80,0]},
    9:{w:[210,330,260,290],g:[140,85,125],rise:[35,0,65,20]},
    10:{w:[350,260,320,290],g:[65,105,60],rise:[0,50,20,70]}
  }[n];

  // Safe starting runway.
  platforms.push({x:0,y:gy,w:520,h:130,kind:"ground"});
  let x=520, i=0, prevY=gy;
  while(x<L-720){
    const wi=terrain.w[i%terrain.w.length];
    const gi=Math.min(88, terrain.g[i%terrain.g.length]);
    const rise=terrain.rise[i%terrain.rise.length];
    let y=Math.max(285,Math.min(410,prevY-Math.min(58,rise)));
    let w=wi;
    // Keep routes physically readable: no tiny islands or impossible gaps.
    if(n===2) w=Math.max(235,wi); // islands: wider land masses, water only in gaps
    if(n===8) w=Math.max(245,wi); // low gravity: broad launch platforms
    platforms.push({x,y,w,h:540-y,kind:"ground"});

    // World-specific secondary platforms are sparse and always reachable.
    if((n===2||n===3||n===5||n===8||n===10) && i%3===1){
      const fx=x+Math.min(55,w*.28), fy=Math.max(170,y-115);
      platforms.push({x:fx,y:fy,w:125,h:18,kind:n===3?"magnet":"float"});
    }
    x+=w+gi;
    prevY=y;
    i++;
  }
  platforms.push({x:L-720,y:gy,w:720,h:130,kind:"finish"});

  // Helper: only put a hazard on a genuinely playable route or in a gap.
  const groundAt=(px)=>platforms.find(a=>a.kind!=="float"&&px>=a.x&&px<=a.x+a.w);
  const addRouteHazard=(type,px,mode="surface")=>{
    const g=groundAt(px);
    if(mode==="gap"){
      const left=platforms.filter(a=>a.x<px).sort((a,b)=>b.x-a.x)[0];
      const right=platforms.filter(a=>a.x>px).sort((a,b)=>a.x-b.x)[0];
      if(!left||!right||right.x-left.x<65)return;
      hazards.push({type,x:left.x+left.w+8,y:gy+38,w:Math.max(55,right.x-(left.x+left.w)-16),h:48,phase:hazards.length});
      return;
    }
    if(!g||g.kind==="float")return;
    // Jumpability contract: no surface hazard may exceed the player's
    // practical jump clearance, and no single gap may exceed the safe
    // horizontal travel distance of a normal jump.
    const hh=(type==="laser"||type==="energy"||type==="pulse")?7:18;
    const hw=(type==="water"||type==="lava"||type==="quicksand")?Math.min(82,g.w-50):48;
    const hx=Math.max(g.x+24,Math.min(px,g.x+g.w-hw-24));
    hazards.push({type,x:hx,y:g.y-hh,w:hw,h:hh,phase:hazards.length});
  };

  // Designed obstacle placement. Each obstacle corresponds to a visible action.
  for(let k=0;k<Math.ceil(L/620);k++){
    const base=620+k*620;
    if(base>L-900)break;
    if(n===1){ addRouteHazard("spike",base+120); if(k%2===0)addRouteHazard("spike",base+205); }
    if(n===2){ addRouteHazard("water",base+40,"gap"); }
    if(n===3){ addRouteHazard("laser",base+145); if(k%2===0)addRouteHazard("pulse",base+245); }
    if(n===4){ addRouteHazard("lava",base+30,"gap"); addRouteHazard("fallingRock",base+175); }
    if(n===5){ addRouteHazard("blade",base+150); if(k%2)addRouteHazard("laser",base+245); }
    if(n===6){ addRouteHazard("spike",base+120); if(k%2===0)addRouteHazard("vine",base+225); }
    if(n===7){ addRouteHazard("quicksand",base+140); if(k%2)addRouteHazard("spike",base+250); }
    if(n===8){ addRouteHazard("energy",base+135); addRouteHazard("laser",base+235); }
    if(n===9){ addRouteHazard("meteor",base+155); if(k%2===0)addRouteHazard("blade",base+255); }
    if(n===10){ addRouteHazard("royal",base+135); addRouteHazard("blade",base+245); }
  }

  // World-specific enemy families. Enemies spawn on the surface, never in gaps.
  const families={1:["walker","jumper"],2:["flyer","walker"],3:["pulse","charger"],4:["charger","fallingRock"],5:["blade","flyer"],6:["jumper","vine"],7:["charger","walker"],8:["flyer","pulse"],9:["meteor","charger"],10:["royal","charger"]};
  const fam=families[n];
  for(let k=0,ex=980;ex<L-520;ex+=700,k++){
    const g=groundAt(ex+30); if(!g)continue;
    const type=fam[k%fam.length];
    enemies.push({type,x:Math.max(g.x+35,Math.min(ex,g.x+g.w-80)),y:type==="flyer"?Math.max(145,g.y-155):g.y-58,w:44,h:58,vx:k%2?1.15:-1.15,min:g.x+25,max:g.x+g.w-55,vy:0,base:Math.max(145,g.y-155),ph:k});
  }

  // Collectibles follow the terrain surface instead of floating over hazards.
  for(let k=0,cx=210;cx<L-220;cx+=355,k++){
    const g=groundAt(cx); if(!g)continue;
    const cy=g.y-68-(k%3)*24;
    if(!hazards.some(h=>cx>h.x-35&&cx<h.x+h.w+35)) coins.push({x:cx,y:cy,r:10,got:false});
  }
  for(let k=0,cx=1150;cx<L-650;cx+=900,k++){
    const g=groundAt(cx); if(g)gems.push({x:cx,y:g.y-125-(k%2)*40,r:15,got:false});
  }

  // Checkpoints are generated from actual terrain, then verified against every hazard/enemy.
  const desired=[90];
  for(let cp=1550;cp<L-900;cp+=1850)desired.push(cp);
  const safePad=[];
  for(const want of desired){
    let best=null;
    for(const a of platforms.filter(p=>p.kind!=="float")){
      const candidate=Math.max(a.x+28,Math.min(want,a.x+a.w-60));
      if(candidate<20||candidate>L-120)continue;
      const box={x:candidate,y:a.y-player.h,w:player.w,h:player.h};
      const badHaz=hazards.some(h=>box.x+box.w>h.x-30&&box.x<h.x+h.w+30&&box.y+box.h>h.y-18&&box.y<h.y+h.h+18);
      const badEnemy=enemies.some(e=>box.x+box.w>e.x-60&&box.x<e.x+e.w+60&&box.y+box.h>e.y-45&&box.y<e.y+e.h+45);
      if(!badHaz&&!badEnemy){best={x:candidate,y:a.y};break;}
    }
    if(best)safePad.push(best);
  }
  checkpoints=safePad.map(p=>p.x);
  checkpoint=checkpoints[0]||40;

  // A checkpoint is never allowed to overlap a lethal object; filter once more after creation.
  hazards=hazards.filter(h=>!checkpoints.some(cp=>cp+player.w>h.x-55&&cp<h.x+h.w+55));
  enemies=enemies.filter(e=>!checkpoints.some(cp=>cp+player.w>e.x-70&&cp<e.x+e.w+70));

  // Final playability pass: every surface hazard must be jumpable and every
  // gap must be within the player's safe horizontal jump distance.
  hazards=hazards.filter(h=>{
    if(h.type==="water"||h.type==="lava"||h.type==="quicksand"){
      return h.w<=88;
    }
    return h.h<=18 && h.w<=52;
  });
}
function getSpawnPoint(preferred){
  const candidates=[preferred,...checkpoints,40].filter((v,i,a)=>Number.isFinite(v)&&a.indexOf(v)===i);
  const safe=(c,p)=>{
    const box={x:c,y:p.y-player.h,w:player.w,h:player.h};
    const near=(a,pad=0)=>box.x+box.w>a.x-pad&&box.x<a.x+a.w+pad&&box.y+box.h>a.y-pad&&box.y<a.y+a.h+pad;
    if(hazards.some(h=>near(h,70)))return false;
    if(enemies.some(e=>near(e,85)))return false;
    // A second solid overlapping the spawn volume would visually hide the player.
    if(platforms.some(a=>a!==p&&a.kind!=="float"&&near(a,2)))return false;
    return true;
  };
  for(const c of candidates){
    const p=platforms.filter(a=>a.kind!=="float"&&c>=a.x+18&&c<=a.x+a.w-player.w-18)
      .sort((a,b)=>Math.abs((a.x+a.w/2)-c)-Math.abs((b.x+b.w/2)-c))[0];
    if(p&&safe(c,p))return {x:c,y:p.y-player.h};
    // Search around the requested checkpoint instead of falling back blindly.
    if(p){
      for(let d=24;d<=220;d+=24){
        for(const q of [c-d,c+d]){
          if(q>=p.x+18&&q<=p.x+p.w-player.w-18&&safe(q,p))return {x:q,y:p.y-player.h};
        }
      }
    }
  }
  const ground=platforms.find(a=>a.kind!=="float");
  const x=ground?ground.x+30:40;
  return {x,y:(ground?ground.y:410)-player.h};
}
function resetLevel(){
  score=0;gold=0;diamond=0;lives=3;checkpoint=80;
  buildLevel(level);
  const spawn=getSpawnPoint(checkpoints[0]||90);player.x=spawn.x;player.y=spawn.y;player.vx=0;player.vy=0;player.ground=true;player.jumps=0;player.maxJumps=(hero==="cyber"||hero==="shadow"||hero==="runner")?2:1;player.sliding=false;
  player.cd=0;player.dash=false;player.dt=0;player.inv=90;
}
