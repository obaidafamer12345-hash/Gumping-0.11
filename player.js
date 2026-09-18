/* EPIX ENGINE V1 — Player controller
 * Fixed-timestep friendly movement with acceleration, variable jump,
 * coyote time, jump buffer, slide hitbox, wall jump and safe collisions.
 */
let jumpHeld=false,jumpHoldFrames=0;
const MOVE={
  max:4.15, accel:0.22, airAccel:0.12,
  friction:0.16, airFriction:0.035,
  gravity:0.46, maxFall:11.5,
  jump:-9.55, jumpHold:0.105,
  coyote:8, buffer:9,
  wallJumpX:5.35, wallJumpY:-9.6
};
const SLIDE={height:40, offset:18, minSpeed:1.15};

function doJump(kind="normal"){
  if(kind==="wall"){
    const side=player.wallSide;
    player.vy=MOVE.wallJumpY;
    player.vx=-side*MOVE.wallJumpX;
    player.dir=-side;
    player.jumps=1;
    player.wallGrace=12;
  }else if(kind==="double"){
    player.vy=-8.8;
    player.jumps=player.maxJumps;
  }else{
    player.vy=MOVE.jump;
    player.jumps=1;
  }
  player.ground=false;
  player.coyote=0;
  player.jumpBuffer=0;
  player.jumpCutApplied=false;
  jumpHoldFrames=kind==="wall"?13:16;
  sfx("jump");
  burst(player.x+player.w/2,player.y+player.h,"#e0f2fe",kind==="wall"?14:10);
  return true;
}

function jump(){
  if(mode!=="play")return false;
  if(player.ground||player.coyote>0)return doJump("normal");
  if(player.wallSide!==0&&player.wallGrace<=0)return doJump("wall");
  if(player.jumps<player.maxJumps)return doJump("double");
  return false;
}

function jumpRelease(){
  jumpHeld=false;
  jumpHoldFrames=0;
  // Early release trims the upward velocity; holding keeps the full arc.
  if(player.vy<0&&!player.jumpCutApplied){player.vy*=0.60;player.jumpCutApplied=true}
}

function canStandFromSlide(){
  if(!player.sliding)return true;
  const targetH=player.baseH;
  const targetY=player.y-SLIDE.offset;
  const box={x:player.x,y:targetY,w:player.w,h:targetH};
  return !platforms.some(a=>a.kind!=="float"&&
    box.x+box.w>a.x+2&&box.x<a.x+a.w-2&&
    box.y+box.h>a.y+2&&box.y<a.y+a.h-2);
}

function setSlide(on){
  if(mode!=="play")return;
  if(on&&!player.sliding&&player.ground&&Math.abs(player.vx)>=SLIDE.minSpeed){
    player.sliding=true;
    player.y+=SLIDE.offset;
    player.h=SLIDE.height;
    sfx("slide");
    burst(player.x+player.w/2,player.y+player.h,"#94a3b8",5);
  }else if(!on&&player.sliding&&canStandFromSlide()){
    player.y-=SLIDE.offset;
    player.h=player.baseH;
    player.sliding=false;
  }
}

function respawn(){
  const spawn=getSpawnPoint(checkpoint);
  player.x=spawn.x;player.y=spawn.y;
  player.vx=player.vy=0;
  player.ground=true;player.jumps=0;
  player.inv=110;player.dt=0;
  player.sliding=false;player.h=player.baseH;
  player.coyote=MOVE.coyote;player.jumpBuffer=0;player.wallGrace=12;player.wallSide=0;
}

function hurt(){
  if(player.inv>0)return;
  lives--;sfx("hit");shake=14;
  if(lives<=0)gameOver();else respawn();
}

function hitEnemy(e){
  if(player.inv>0)return;
  if(["spike","saw","lava","water","quicksand","laser","energy","pulse","blade","meteor","sand","royal"].includes(e.type)){hurt();return}
  if(player.vy>0&&player.y+player.h-player.vy<=e.y+16){
    enemies=enemies.filter(a=>a!==e);player.vy=-7.8;player.jumps=1;score+=80;
    burst(e.x+e.w/2,e.y+e.h/2,"#fb7185",20);sfx("coin");return;
  }
  hurt();
}

function solidAt(x,y,w,h){
  return platforms.some(a=>a.kind!=="float"&&x+w>a.x+1&&x<a.x+a.w-1&&y+h>a.y+1&&y<a.y+a.h-1);
}

function update(){
  if(mode!=="play")return;
  tick++;
  if(player.cd>0)player.cd--;
  if(player.inv>0)player.inv--;
  if(player.wallGrace>0)player.wallGrace--;

  if(player.ground)player.coyote=MOVE.coyote;
  else player.coyote=Math.max(0,player.coyote-1);
  if(player.jumpBuffer>0)player.jumpBuffer--;

  // Variable jump: while held, add a small amount of upward impulse.
  if(jumpHeld&&jumpHoldFrames>0&&player.vy<0){
    player.vy-=MOVE.jumpHold;
    jumpHoldFrames--;
  }else if(!jumpHeld&&player.vy<0&&!player.jumpCutApplied){
    player.vy*=0.78;
    player.jumpCutApplied=true;
    jumpHoldFrames=0;
  }
  player.vy=Math.min(player.vy+MOVE.gravity,MOVE.maxFall);

  const dir=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0);
  if(dir){
    player.dir=dir;
    const accel=player.ground?MOVE.accel:MOVE.airAccel;
    player.vx+=(dir*MOVE.max-player.vx)*accel;
  }else{
    const friction=player.ground?MOVE.friction:MOVE.airFriction;
    player.vx*=1-friction;
    if(Math.abs(player.vx)<0.025)player.vx=0;
  }
  if(player.sliding)player.vx+=(player.dir*4.55-player.vx)*0.10;
  player.vx=Math.max(-MOVE.max,Math.min(MOVE.max,player.vx));

  // Buffered jump is consumed only when a legal jump becomes available.
  if(player.jumpBuffer>0&&!jumpHeld){
    if(player.ground||player.coyote>0||player.wallSide!==0||player.jumps<player.maxJumps)jump();
  }

  const oldX=player.x,oldY=player.y;
  player.ground=false;

  // Horizontal collision first: walls stop the player instead of letting the
  // character enter terrain and then being pushed out on the next frame.
  player.x+=player.vx;
  for(const a of platforms){
    if(a.kind==="float")continue;
    const vertical=player.y+player.h>a.y+5&&player.y<a.y+a.h-5;
    if(!vertical)continue;
    if(player.vx>0&&oldX+player.w<=a.x+1&&player.x+player.w>a.x){
      player.x=a.x-player.w;player.vx=0;player.wallSide=1;
    }else if(player.vx<0&&oldX>=a.x+a.w-1&&player.x<a.x+a.w){
      player.x=a.x+a.w;player.vx=0;player.wallSide=-1;
    }
  }

  // Vertical collision uses previous bottom/top. This prevents the classic
  // "visible floor but deadly" bug caused by overlapping rectangles.
  player.y+=player.vy;
  for(const a of platforms){
    if(player.x+player.w<=a.x+2||player.x>=a.x+a.w-2)continue;
    if(player.vy>=0&&oldY+player.h<=a.y+3&&player.y+player.h>=a.y){
      const wasAir=!player.ground;
      player.y=a.y-player.h;player.vy=0;player.ground=true;player.jumps=0;player.coyote=MOVE.coyote;
      if(wasAir)sfxLand();
    }else if(player.vy<0&&oldY>=a.y+a.h-2&&player.y<=a.y+a.h){
      player.y=a.y+a.h;player.vy=0;
    }
  }

  // Refresh wall contact after both axes have been resolved.
  player.wallSide=0;
  if(!player.ground){
    for(const a of platforms){
      if(a.kind==="float")continue;
      const vertical=player.y+player.h>a.y+8&&player.y<a.y+a.h-8;
      if(!vertical)continue;
      if(Math.abs(player.x+player.w-a.x)<=5)player.wallSide=1;
      else if(Math.abs(player.x-(a.x+a.w))<=5)player.wallSide=-1;
    }
  }

  if(player.x<0){player.x=0;player.vx=0}

  // Slide is released automatically when no longer held, but never through a ceiling.
  if(!keys.ArrowDown&&!keys.KeyS&&!document.getElementById("slide")?.classList.contains("pressed"))setSlide(false);

  for(const e of enemies){
    if(e.type==="flyer"){
      e.x+=e.vx;if(e.x<e.min||e.x>e.max)e.vx*=-1;
      e.y=e.base+Math.sin(tick*.05+e.ph)*55;
    }else{
      e.x+=e.vx;if(e.x<e.min||e.x>e.max)e.vx*=-1;
      if(e.type==="jumper"){e.vy+=.5;e.y+=e.vy;if(e.y>352){e.y=352;e.vy=-10}}
      if(e.type==="charger"&&Math.abs(player.x-e.x)<380)e.vx+=(player.x>e.x?.045:-.045);
    }
    if(player.x+player.w>e.x&&player.x<e.x+e.w&&player.y+player.h>e.y&&player.y<e.y+e.h)hitEnemy(e);
  }

  for(const cp of checkpoints){
    if(player.x>=cp&&cp>checkpoint){checkpoint=cp;burst(cp+10,385,"#4ade80",12);sfx("checkpoint")}
  }
  for(const h of hazards){
    if(player.x+player.w>h.x&&player.x<h.x+h.w&&player.y+player.h>h.y&&player.y<h.y+h.h){hurt();break}
  }
  coins.forEach(c=>{if(!c.got&&player.x+player.w>c.x-c.r&&player.x<c.x+c.r&&player.y+player.h>c.y-c.r&&player.y<c.y+c.r){c.got=true;gold++;score+=30;sfx("coin");burst(c.x,c.y,"#facc15",15)}});
  gems.forEach(c=>{if(!c.got&&player.x+player.w>c.x-c.r&&player.x<c.x+c.r&&player.y+player.h>c.y-c.r&&player.y<c.y+c.r){c.got=true;diamond++;score+=150;sfx("gem");burst(c.x,c.y,"#c084fc",25)}});

  const finishX=levels[level-1][2]-115;
  if(player.x>=finishX){finishLevel();return}
  if(player.y>Math.max(H+80,620)){hurt();return}

  const target=Math.max(0,Math.min(Math.max(0,levels[level-1][2]-W),player.x-W*.30));
  cam+=(target-cam)*0.12;
  for(let i=particles.length-1;i>=0;i--){const a=particles[i];a.x+=a.vx;a.y+=a.vy;a.vy+=.14;a.life--;if(a.life<=0)particles.splice(i,1)}
  $("score").textContent=score;$("gold").textContent=gold;$("diamond").textContent=diamond;$("lives").textContent=lives;
}
