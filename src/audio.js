'use strict';
/* ---------- audio: everything is synthesized. Positional sounds take (rel, d):
   rel = angle of the source relative to where the player faces, d = distance in tiles. ---------- */
const AU={ctx:null,out:null,amb:null,nb:null,crush:null,
  init(){if(this.ctx)return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;try{this.ctx=new C()}catch(e){return}
    const c=this.ctx,comp=c.createDynamicsCompressor();comp.threshold.value=-8;comp.ratio.value=6;comp.connect(c.destination);
    this.out=c.createGain();this.out.gain.value=.95;this.out.connect(comp);
    this.amb=c.createGain();this.amb.gain.value=1;this.amb.connect(this.out);
    const len=c.sampleRate*3,b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;this.nb=b;
    const ws=c.createWaveShaper(),cu=new Float32Array(2048);for(let i=0;i<2048;i++)cu[i]=Math.tanh((i/1024-1)*7);ws.curve=cu;this.crush=ws;ws.connect(this.out)},
  resume(){if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume()},
  get t(){return this.ctx?this.ctx.currentTime:0},
  env(g,t,a,v,hold,rel){g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+a+hold);g.gain.exponentialRampToValueAtTime(.0001,t+a+hold+rel)},
  osc(type,f,t,dur,v,o={}){const c=this.ctx;if(!c)return;const s=c.createOscillator(),g=c.createGain();s.type=type;s.frequency.setValueAtTime(f,t);
    if(o.to)s.frequency.exponentialRampToValueAtTime(o.to,t+(o.a||.005)+(o.hold||0)+dur);if(o.det)s.detune.value=o.det;
    this.env(g,t,o.a||.005,v,o.hold||0,dur);s.connect(g);g.connect(o.dest||this.out);s.start(t);s.stop(t+(o.a||.005)+(o.hold||0)+dur+.1);return s},
  noise(t,dur,v,o={}){const c=this.ctx;if(!c)return;const s=c.createBufferSource();s.buffer=this.nb;s.loop=true;const f=c.createBiquadFilter();f.type=o.type||'bandpass';
    f.frequency.setValueAtTime(o.f||1000,t);if(o.fTo)f.frequency.exponentialRampToValueAtTime(o.fTo,t+(o.a||.003)+(o.hold||0)+dur);f.Q.value=o.q==null?.7:o.q;
    const g=c.createGain();this.env(g,t,o.a||.003,v,o.hold||0,dur);s.connect(f);f.connect(g);g.connect(o.dest||this.out);s.start(t,Math.random()*2);s.stop(t+(o.a||.003)+(o.hold||0)+dur+.1);return{s,f,g}},
  /* a source behind you is panned and muffled, so you can tell front from back on headphones */
  spatial(rel,d,gain=1){const c=this.ctx,g=c.createGain();g.gain.value=gain*Math.min(1.3,1.8/(1+d*d*.16));let n=g;
    if(Math.cos(rel)<0){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=1100;g.connect(f);n=f}
    const p=c.createStereoPanner();p.pan.value=Math.sin(rel)*.95;n.connect(p);p.connect(this.out);return g},

  /* camera */
  shutter(){if(!this.ctx)return;const t=this.t;this.noise(t,.035,.6,{type:'highpass',f:3000});this.noise(t+.045,.06,.35,{f:1700,q:2});this.osc('square',95,t,.04,.08)},
  whine(dur){if(!this.ctx)return;this.osc('sine',2500,this.t,dur,.016,{to:7600,a:.06})},
  dry(){if(!this.ctx)return;this.noise(this.t,.02,.22,{type:'highpass',f:4200})},
  ratchet(){if(!this.ctx)return;const t=this.t;this.noise(t,.016,.3,{f:3600,q:7});this.noise(t+.035,.012,.15,{f:2600,q:7})},

  /* the player */
  step(run){if(!this.ctx)return;const t=this.t;this.noise(t,run?.09:.06,run?.2:.06,{type:'lowpass',f:run?520:300});if(Math.random()<.25)this.noise(t+.02,.25,.025,{f:400+Math.random()*300,q:14})},
  bump(){if(!this.ctx)return;const t=this.t;this.osc('sine',70,t,.18,.3,{to:40});this.noise(t,.08,.18,{type:'lowpass',f:300})},
  paper(){if(!this.ctx)return;const t=this.t;for(let i=0;i<4;i++)this.noise(t+i*.05,.06,.12,{type:'highpass',f:2500+Math.random()*2000})},
  keys(){if(!this.ctx)return;const t=this.t;for(let i=0;i<5;i++)this.noise(t+i*.07+Math.random()*.03,.03,.18,{f:4500+Math.random()*2500,q:12})},

  /* the house */
  tick(rel,d,hi){if(!this.ctx)return;const t=this.t,dest=this.spatial(rel,d,.6);this.noise(t,.02,.6,{f:hi?3400:2500,q:9,dest});this.osc('sine',hi?1900:1500,t,.03,.05,{dest})},
  bong(rel,d){if(!this.ctx)return;const t=this.t,dest=this.spatial(rel,d,1);[110,220.6,331.5,442.9].forEach((f,i)=>this.osc('sine',f,t,3.2-i*.5,.18/(i+1),{a:.004,dest}))},
  creak(){if(!this.ctx)return;const t=this.t;this.noise(t,1.1+Math.random(),.05,{f:250+Math.random()*400,fTo:180+Math.random()*900,q:22,a:.25,dest:this.amb})},
  knock(rel,d){if(!this.ctx)return;const t=this.t,dest=this.spatial(rel,d,1.3);for(let i=0;i<3;i++){this.osc('sine',85,t+i*.32,.16,.5,{to:55,dest});this.noise(t+i*.32,.06,.3,{type:'lowpass',f:500,dest})}},
  slam(rel,d){if(!this.ctx)return;const t=this.t,dest=this.spatial(rel,d,1.6);this.osc('sine',55,t,.6,.9,{to:32,dest});this.noise(t,.35,.6,{type:'lowpass',f:420,dest});this.noise(t+.02,.08,.4,{f:1500,q:3,dest})},
  doorOpen(){if(!this.ctx)return;const t=this.t;this.noise(t,.05,.4,{f:2200,q:6});this.noise(t+.1,1.8,.12,{f:500,fTo:900,q:25,a:.3});this.osc('sine',60,t+.05,.4,.3,{to:40})},

  /* it */
  cstep(rel,d){if(!this.ctx)return;const t=this.t,dest=this.spatial(rel,d,1.1);this.osc('sine',52,t,.22,.65,{to:34,dest});this.noise(t,.1,.35,{type:'lowpass',f:360,dest});
    this.noise(t+.05,.018,.35,{f:2900,q:11,dest});if(Math.random()<.4)this.noise(t+.11,.016,.25,{f:3300,q:11,dest})},
  breath(rel,d,inhale){if(!this.ctx)return;const t=this.t,dest=this.spatial(rel,d,1.2);
    this.noise(t,inhale?.9:1.2,.3,{f:inhale?850:620,fTo:inhale?1500:380,q:1.3,a:.35,dest});this.noise(t,inhale?.9:1.2,.06,{type:'lowpass',f:200,a:.3,dest})},
  whisper(rel,d){if(!this.ctx)return;const t=this.t,dest=this.spatial(rel,d,1.4),n=5+(Math.random()*5|0);
    for(let i=0;i<n;i++){const t0=t+i*.12+Math.random()*.06;this.noise(t0,.08+Math.random()*.06,.22,{f:1100+Math.random()*2200,q:5,a:.02,dest})}},
  heart(v){if(!this.ctx)return;const t=this.t;this.osc('sine',50,t,.14,.6*v,{to:32});this.osc('sine',47,t+.17,.12,.42*v,{to:30})},

  /* scares */
  stinger(){if(!this.ctx)return;const t=this.t,c=this.ctx,f=c.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(5000,t+.25);f.connect(this.out);
    [65.4,69.3,98,103.8,138.6].forEach(fr=>this.osc('sawtooth',fr,t,1.7,.1,{a:.03,det:Math.random()*30-15,dest:f}));
    this.osc('sine',2350,t,1.3,.05,{to:1750,a:.02});this.noise(t,.5,.25,{type:'highpass',f:1500,a:.01})},
  scream(v=1){if(!this.ctx)return;const t=this.t,k=v*(G.gentle?.35:1);
    [[540,170],[630,150],[390,120],[820,240]].forEach(([a,b])=>this.osc('sawtooth',a,t,1.15,.22*k,{to:b,a:.01,det:Math.random()*40,dest:this.crush}));
    this.noise(t,1.1,.9*k,{f:1400,fTo:700,q:.9,a:.005,dest:this.crush});this.osc('sine',38,t,1,.8*k,{to:25})},

  /* bed of dread under everything */
  ambientOn(){if(!this.ctx||this._amb)return;const c=this.ctx,t=this.t;
    const s=c.createBufferSource();s.buffer=this.nb;s.loop=true;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=320;const g=c.createGain();g.gain.value=.05;
    const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=.06;lg.gain.value=.035;lfo.connect(lg);lg.connect(g.gain);s.connect(f);f.connect(g);g.connect(this.amb);s.start();lfo.start();
    const d1=c.createOscillator(),d2=c.createOscillator(),dg=c.createGain();d1.frequency.value=41;d2.frequency.value=43.2;dg.gain.value=.03;d1.connect(dg);d2.connect(dg);dg.connect(this.amb);d1.start();d2.start();
    this._amb={dg}},
  dread(v,secs=1.5){if(!this._amb)return;this._amb.dg.gain.setTargetAtTime(.03+v*.09,this.t,secs)},
  duck(on){if(this.amb)this.amb.gain.setTargetAtTime(on?.15:1,this.t,on?.05:1.2)}
};
