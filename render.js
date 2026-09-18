function rounded(x,y,w,h,r){
  const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();ctx.fill();
}
function drawHero(){
  const a=player.x,b=player.y,h=heroes[hero]||heroes.nova;
  ctx.save();if(player.inv>0&&Math.floor(player.inv/5)%2===0)ctx.globalAlpha=.45;
  ctx.fillStyle="#0007";ctx.beginPath();ctx.ellipse(a+player.w/2,b+player.h+5,player.w*.48,5,0,0,Math.PI*2);ctx.fill();
  const palettes={
    nova:["#67e8f9","#4f46e5","#ffd2b3","#111827"],
    shadow:["#94a3b8","#111827","#f1c7a8","#020617"],
    robot:["#e5e7eb","#475569","#cbd5e1","#0f172a"],
    fire:["#fb923c","#dc2626","#ffd0a8","#451a03"],
    cyber:["#f0abfc","#7c3aed","#ffd2b3","#111827"],
    ice:["#dbeafe","#0891b2","#f8d7c0","#164e63"],
    runner:["#fde68a","#f59e0b","#ffd2b3","#451a03"],
    guardian:["#cbd5e1","#475569","#f1c7a8","#0f172a"]
  };
  const q=palettes[hero]||palettes.nova;
  const body=ctx.createLinearGradient(a,b,a+player.w,b+player.h);body.addColorStop(0,q[0]);body.addColorStop(1,q[1]);
  ctx.fillStyle=body;rounded(a+2,b+22,player.w-4,28,10);
  ctx.fillStyle=q[3];rounded(a+7,b+47,9,17,4);rounded(a+player.w-16,b+47,9,17,4);
  ctx.fillStyle=q[2];ctx.beginPath();ctx.arc(a+player.w/2,b+16,15,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=q[3];ctx.beginPath();ctx.arc(a+player.w/2,b+14,15,Math.PI,Math.PI*2);ctx.fill();
  if(hero==="robot"){ctx.fillStyle="#94a3b8";rounded(a+4,b+5,player.w-8,22,7);ctx.fillStyle="#22d3ee";ctx.fillRect(a+9,b+14,6,4);ctx.fillRect(a+23,b+14,6,4)}
  else if(hero==="shadow"){ctx.fillStyle="#020617";rounded(a+4,b+7,player.w-8,19,8);ctx.fillStyle="#ef4444";ctx.fillRect(a+10,b+16,18,3)}
  else {ctx.fillStyle="#0f172a";rounded(a+5,b+13,player.w-10,9,4);ctx.fillStyle=q[0];ctx.fillRect(a+10,b+16,player.w-20,3)}
  ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(a+player.w/2,b+37,6,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=q[1];ctx.font="bold 9px Arial";ctx.textAlign="center";ctx.fillText(h.icon,a+player.w/2,b+40);
  ctx.restore();
}
function draw(){
  const prof=stageProfiles[level-1];
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,prof.sky[0]);g.addColorStop(1,prof.sky[1]);
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // Distinct atmospheric scenery per stage.
  ctx.save();ctx.globalAlpha=.22;
  for(let i=0;i<18;i++){
    const sx=((i*181-cam*(.08+(level*.005)))%(W+220)+W+220)%(W+220), sy=(i*67)%(H*.72);
    ctx.fillStyle=prof.top;ctx.beginPath();ctx.arc(sx,sy,2+(i%4),0,Math.PI*2);ctx.fill();
  }
  if(level===2){for(let i=0;i<7;i++){ctx.fillStyle="#67e8f9";ctx.beginPath();ctx.ellipse((i*260-cam*.12)%(W+260),120+(i%3)*80,100,25,0,0,Math.PI*2);ctx.fill()}}
  if(level===4){ctx.fillStyle="#fb923c";for(let i=0;i<8;i++)ctx.beginPath(),ctx.arc((i*240-cam*.1)%(W+240),90+(i%3)*70,35,0,Math.PI*2),ctx.fill()}
  if(level===6){ctx.fillStyle="#4ade80";for(let i=0;i<9;i++){const sx=(i*210-cam*.09)%(W+210);ctx.fillRect(sx,220,20,180)}}
  if(level===7){ctx.fillStyle="#fde68a";for(let i=0;i<8;i++){const sx=(i*270-cam*.1)%(W+270);ctx.beginPath();ctx.arc(sx,330,80+(i%3)*20,Math.PI,Math.PI*2);ctx.fill()}}
  if(level>=8){ctx.fillStyle=prof.top;for(let i=0;i<6;i++){const sx=(i*310-cam*.08)%(W+310);ctx.beginPath();ctx.arc(sx,170+(i%2)*90,35,0,Math.PI*2);ctx.fill()}}
  ctx.restore();

  ctx.save();
  if(shake){ctx.translate((Math.random()-.5)*7,(Math.random()-.5)*7);shake--}
  ctx.translate(-cam,0);

  // Terrain
  const viewL=cam-120, viewR=cam+W+120;
  platforms.forEach(a=>{
    if(a.x+a.w<viewL||a.x>viewR)return;
    const pg=ctx.createLinearGradient(0,a.y,0,Math.min(a.y+a.h,a.y+260));pg.addColorStop(0,prof.top);pg.addColorStop(.08,prof.ground);pg.addColorStop(1,"#090d18");
    ctx.fillStyle=pg;rounded(a.x,a.y,a.w,Math.min(a.h,360),a.kind==="float"?8:15);
    ctx.fillStyle=prof.top;ctx.fillRect(a.x,a.y,a.w,4);
    if(a.kind==="ground"||a.kind==="finish"){
      // Surface markings stay aligned with the actual collision top, so the visual floor matches the hitbox.
      ctx.globalAlpha=.14;ctx.fillStyle="#fff";
      for(let q=a.x+18;q<a.x+a.w-18;q+=72){ctx.fillRect(q,a.y+24,28,3);ctx.fillRect(q+14,a.y+58,24,3)}
      ctx.globalAlpha=1;
      ctx.fillStyle="#0006";
      for(let q=a.x+34;q<a.x+a.w-20;q+=105){ctx.beginPath();ctx.ellipse(q,a.y+34,11,5,0,0,Math.PI*2);ctx.fill()}
      ctx.fillStyle=prof.top;ctx.globalAlpha=.7;ctx.fillRect(a.x,a.y+5,a.w,3);ctx.globalAlpha=1;
    }
  });

  // Checkpoint beacons
  checkpoints.forEach(cp=>{if(cp<viewL-50||cp>viewR+50)return;
    ctx.fillStyle="#4ade80";ctx.fillRect(cp,360,5,50);
    ctx.beginPath();ctx.moveTo(cp+5,360);ctx.lineTo(cp+38,372);ctx.lineTo(cp+5,384);ctx.closePath();ctx.fill();
  });

  // Functional hazards
  hazards.forEach(h=>{if(h.x+h.w<viewL||h.x>viewR)return;
    ctx.save();
    if(["water","lava"].includes(h.type)){
      ctx.fillStyle=h.type==="water"?"#0891b2":"#ea580c";rounded(h.x,h.y,h.w,h.h,7);
      ctx.fillStyle=h.type==="water"?"#67e8f9":"#fde047";
      for(let q=0;q<h.w;q+=28)ctx.fillRect(h.x+q,h.y+5+Math.sin(tick*.1+q)*3,18,3);
    }else if(h.type==="spike"||h.type==="vine"||h.type==="royal"){
      ctx.fillStyle=h.type==="vine"?"#4ade80":prof.top;
      for(let q=0;q<3;q++){ctx.beginPath();ctx.moveTo(h.x+q*24,h.y+h.h);ctx.lineTo(h.x+12+q*24,h.y);ctx.lineTo(h.x+24+q*24,h.y+h.h);ctx.closePath();ctx.fill()}
    }else if(h.type==="laser"||h.type==="energy"||h.type==="pulse"){
      ctx.shadowBlur=18;ctx.shadowColor=prof.top;ctx.fillStyle=prof.top;ctx.fillRect(h.x,h.y,h.w,6);
      ctx.fillStyle="#fff";ctx.fillRect(h.x,h.y+1,h.w,2);ctx.shadowBlur=0;
    }else if(h.type==="blade"||h.type==="meteor"){
      ctx.translate(h.x+h.w/2,h.y+h.h/2);ctx.rotate(tick*.08);
      ctx.fillStyle="#e2e8f0";ctx.beginPath();for(let q=0;q<12;q++){let a=q*Math.PI/6,r=q%2?9:28;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fill();
    }else if(h.type==="sand"){
      ctx.fillStyle="#f59e0b";ctx.beginPath();ctx.arc(h.x+h.w/2,h.y+h.h/2,18+Math.sin(tick*.08)*4,0,Math.PI*2);ctx.fill();
    }
    // Every lethal hazard gets a visible warning marker; no invisible kill hitboxes.
    if(["spike","vine","royal","blade","meteor","laser","energy","pulse","lava","water","sand"].includes(h.type)){
      ctx.globalAlpha=.9;ctx.fillStyle="#fff";ctx.font="bold 10px Arial";ctx.textAlign="center";
      ctx.fillText("!",h.x+h.w/2,Math.max(18,h.y-8));ctx.globalAlpha=1;
    }
    ctx.restore();
  });

  coins.forEach(c=>{if(!c.got&&c.x>viewL-40&&c.x<viewR+40){ctx.fillStyle="#facc15";ctx.beginPath();ctx.ellipse(c.x,c.y,8,12,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff4a3";ctx.stroke()}});
  gems.forEach(c=>{if(!c.got&&c.x>viewL-50&&c.x<viewR+50){ctx.save();ctx.translate(c.x,c.y);ctx.rotate(tick*.025);ctx.fillStyle="#c084fc";ctx.beginPath();ctx.moveTo(0,-17);ctx.lineTo(13,-6);ctx.lineTo(8,14);ctx.lineTo(0,18);ctx.lineTo(-8,14);ctx.lineTo(-13,-6);ctx.closePath();ctx.fill();ctx.strokeStyle="#f5d0fe";ctx.stroke();ctx.restore()}});

  enemies.forEach(e=>{if(e.x+e.w<viewL-80||e.x>viewR+80)return;
    ctx.save();
    if(e.type==="flyer"){ctx.fillStyle="#d946ef";ctx.beginPath();ctx.ellipse(e.x+22,e.y+29,25,17,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff";ctx.arc(e.x+14,e.y+26,4,0,Math.PI*2);ctx.fill();ctx.arc(e.x+30,e.y+26,4,0,Math.PI*2);ctx.fill()}
    else if(e.type==="pulse"){ctx.strokeStyle="#67e8f9";ctx.lineWidth=6;ctx.beginPath();ctx.arc(e.x+22,e.y+29,22+Math.sin(tick*.12)*5,0,Math.PI*2);ctx.stroke()}
    else if(e.type==="blade"){ctx.translate(e.x+22,e.y+29);ctx.rotate(tick*.1);ctx.fillStyle="#e2e8f0";ctx.beginPath();for(let q=0;q<12;q++){let a=q*Math.PI/6,r=q%2?12:28;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fill()}
    else if(e.type==="vine"){ctx.strokeStyle="#4ade80";ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(e.x+22,e.y+58);ctx.quadraticCurveTo(e.x-10,e.y+20,e.x+22,e.y);ctx.stroke()}
    else if(e.type==="meteor"){ctx.fillStyle="#fb7185";ctx.beginPath();ctx.arc(e.x+22,e.y+29,25,0,Math.PI*2);ctx.fill()}
    else if(e.type==="royal"){ctx.fillStyle="#fbbf24";rounded(e.x,e.y,e.w,e.h,12);ctx.fillStyle="#111827";ctx.fillRect(e.x+8,e.y+13,7,7);ctx.fillRect(e.x+29,e.y+13,7,7)}
    else {ctx.fillStyle=e.type==="charger"?"#dc2626":e.type==="jumper"?"#f97316":"#b91c1c";rounded(e.x,e.y,e.w,e.h,10);ctx.fillStyle="#fff";ctx.fillRect(e.x+8,e.y+13,7,7);ctx.fillRect(e.x+29,e.y+13,7,7);ctx.fillStyle="#111827";ctx.fillRect(e.x+12,e.y+39,20,4)}
    ctx.restore();
  });
  particles.forEach(a=>{ctx.globalAlpha=Math.max(0,a.life/50);ctx.fillStyle=a.col;ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1});
  drawHero();
  const fx=levels[level-1][2]-115;ctx.shadowBlur=28;ctx.shadowColor=prof.top;ctx.fillStyle=prof.top;ctx.fillRect(fx,300,7,110);ctx.beginPath();ctx.arc(fx+3,285,22+Math.sin(tick*.08)*3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.restore();
}
