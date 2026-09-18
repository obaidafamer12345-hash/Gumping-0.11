let AC=null,musicTimer=null;
function audioStart(){
  try{
    if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)();
    if(AC.state==="suspended")AC.resume();
    if(settingsState.music&&!musicTimer)musicLoop();
  }catch(e){}
}
function tone(freq,d=.1,type="sine",vol=.04,delay=0){
  if(!AC||!settingsState.sfx)return;const o=AC.createOscillator(),g=AC.createGain(),n=AC.currentTime+delay;
  o.type=type;o.frequency.setValueAtTime(freq,n);g.gain.setValueAtTime(vol,n);g.gain.exponentialRampToValueAtTime(.001,n+d);
  o.connect(g);g.connect(AC.destination);o.start(n);o.stop(n+d);
}
function vibrate(ms=12){if(settingsState.vibrate&&navigator.vibrate)navigator.vibrate(ms)}
function sfx(kind){
  audioStart();
  if(kind==="jump"){vibrate(8);tone(250,.08);tone(500,.12,"sine",.03,.06)}
  if(kind==="coin"){tone(660,.07,"triangle",.06);tone(990,.13,"triangle",.04,.07)}
  if(kind==="gem"){tone(440,.07,"triangle",.07);tone(880,.11,"triangle",.05,.08);tone(1320,.16,"triangle",.04,.16)}
  if(kind==="dash"){tone(300,.16,"sawtooth",.06);tone(70,.22,"sawtooth",.03,.06)}
  if(kind==="hit"){vibrate(35);tone(65,.25,"square",.08)}
  if(kind==="slide"){tone(120,.07,"sawtooth",.025);tone(90,.10,"triangle",.018,.04)}
  if(kind==="checkpoint"){vibrate(12);tone(392,.08,"triangle",.035);tone(587,.14,"triangle",.03,.08)}
  if(kind==="win"){vibrate(20);[523,659,784,1047].forEach((f,i)=>tone(f,.18,"triangle",.05,i*.11))}
}
function musicLoop(){
  musicTimer=setTimeout(()=>{musicTimer=null;if(settingsState.music&&mode==="play"){tone(196,.1,"triangle",.012);tone(247,.1,"triangle",.01,.16);tone(294,.1,"triangle",.01,.32)}musicLoop()},900);
}
function burst(x,y,col,n=18){
  for(let i=0;i<Math.min(n,14)&&particles.length<90;i++)particles.push({x,y,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*8,r:2+Math.random()*4,life:25+Math.random()*30,col});
}
function sfxLand(){if(tick%2===0)tone(110,.05,"sine",.018)}
