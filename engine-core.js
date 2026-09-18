/* EPIX ENGINE CORE
 * Deterministic fixed timestep. Rendering can never change gameplay speed.
 */
class EpixEngineCore{
  constructor(){this.last=performance.now();this.acc=0;this.fixed=1/60;this.maxSteps=5}
  frame(step,render){
    const now=performance.now();
    let dt=Math.min(Math.max((now-this.last)/1000,0),0.08);
    this.last=now;this.acc+=dt;
    let steps=0;
    while(this.acc>=this.fixed&&steps<this.maxSteps){step(this.fixed);this.acc-=this.fixed;steps++}
    if(steps===this.maxSteps)this.acc=0;
    render(this.acc/this.fixed);
  }
}
window.EpixEngineCore=EpixEngineCore;
