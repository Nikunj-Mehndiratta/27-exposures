/* ---------- core: state, input, the camera, the thing ---------- */
const $=(s,r=document)=>r.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rand=(a,b)=>a+Math.random()*(b-a);
const wrap=$('#wrap'),stage=$('#stage'),view=$('#view'),vctx=view.getContext('2d'),VW=256,VH=144,live=vctx.createImageData(VW,VH);
const snapC=mkCanvas(VW,VH),snapG=snapC.getContext('2d'),ghostC=mkCanvas(VW,VH),ghostG=ghostC.getContext('2d');
let scale=1;
function fit(){const cs=getComputedStyle(document.body),W=document.body.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),H=document.body.clientHeight-16;
  scale=Math.max(.2,Math.min(W/960,H/540));wrap.style.width=960*scale+'px';wrap.style.height=540*scale+'px';stage.style.transform=`scale(${scale})`}
addEventListener('resize',fit);fit();
const touchMode=matchMedia('(pointer:coarse)').matches;

const G={state:'title',gentle:false,p:{x:3.5,y:7.5,a:0},film:27,wound:true,charge:0,flashT:99,adapt:0,phase:1,hasKey:false,noise:0,stepT:0,
  cr:{on:false,x:0,y:0,tex:'cr_stand',mode:'pose',frozen:0,stepT:0,breathT:0,inh:false,seen:false,leaving:false,recoil:false},
  flags:{},shots:[],note:false,unlock:0,clockStop:0,tickT:0,tockHi:false,heartT:0,playT:0,deaths:0,ck:null,keys:{},look:0,mv:{x:0,y:0}};
const PROPS=[{x:6.5,y:4.5,tex:'clock',h:1.25},{x:2.4,y:9.8,tex:'chair',h:.9,id:'chair'},{x:6.4,y:10.6,tex:'lamp',h:1.1},{x:11.5,y:10.7,tex:'table',h:.55},
  {x:23.4,y:5.0,tex:'bed_occ',h:.6,id:'bed'},{x:21.5,y:4.6,tex:'stand',h:.5},{x:21.5,y:4.6,tex:'key',h:.11,lift:.5,id:'key'}];
const ITEMS=[{id:'n1',x:4.6,y:9.0,tex:'note',h:.1,text:'Keep the hall light on.\nIt can\'t move while it\'s being looked at.\n— M.'},
  {id:'n2',x:13.5,y:7.5,tex:'note',h:.1,text:'Harold used the whole roll on it in \'87.\nHe had nothing left at the end.\n\nCount your flashes.'},
  {id:'n3',x:12.4,y:11.4,tex:'note',h:.1,text:'Walk.\nNever run in this house.\nIt hears running.'},
  {id:'n4',x:15.5,y:3.7,tex:'note',h:.1,text:'If it gets close, give it the flash.\nRight in the face.\nIt hates its own face. It will back off.\nFor a little while.'}];
const CLOCK={x:6.5,y:4.5};

function worldSprites(){const L=PROPS.filter(p=>!p.gone).map(p=>({...p}));ITEMS.forEach(i=>{if(!G.flags[i.id])L.push({x:i.x,y:i.y,tex:i.tex,h:i.h})});
  if(G.cr.on)L.push({x:G.cr.x,y:G.cr.y,tex:G.cr.tex,h:G.cr.tex==='cr_crawl'?.5:1.3,cr:true,add:.07});return L}

/* ---------- input ---------- */
const locked=()=>document.pointerLockElement===view;
function lock(){if(touchMode||G.noLock)return;try{const r=view.requestPointerLock();if(r&&r.catch)r.catch(()=>{G.noLock=true})}catch(e){G.noLock=true}}
addEventListener('keydown',e=>{const k=e.key.toLowerCase();G.keys[k]=true;if(G.state!=='play')return;
  if(k===' '){e.preventDefault();shoot()}else if(k==='r')wind();else if(k==='e'&&!e.repeat)use();else if(k==='escape'&&G.note)closeNote()});
addEventListener('keyup',e=>{G.keys[e.key.toLowerCase()]=false});
addEventListener('blur',()=>{G.keys={}});
stage.addEventListener('mousedown',e=>{AU.init();AU.resume();if(G.state!=='play')return;if(G.note){closeNote();return}if(!touchMode&&!locked()&&!G.noLock){lock();return}if(e.button===0)shoot()});
stage.addEventListener('wheel',e=>{if(G.state==='play'){e.preventDefault();wind()}},{passive:false});
addEventListener('mousemove',e=>{if(G.state==='play'&&!G.note&&(locked()||G.noLock&&e.buttons))G.p.a+=e.movementX*.0026});
/* touch: left stick moves, dragging anywhere else turns */
if(touchMode){const stick=$('#stick'),knob=$('#knob');let sid=null,lid=null,lx=0;
  stick.addEventListener('pointerdown',e=>{sid=e.pointerId;stick.setPointerCapture(sid)});
  stick.addEventListener('pointermove',e=>{if(e.pointerId!==sid)return;const r=stick.getBoundingClientRect(),x=clamp((e.clientX-r.left-r.width/2)/(r.width/2),-1,1),y=clamp((e.clientY-r.top-r.height/2)/(r.height/2),-1,1);
    G.mv={x,y};knob.style.transform=`translate(${x*45}px,${y*45}px)`});
  const end=e=>{if(e.pointerId!==sid)return;sid=null;G.mv={x:0,y:0};knob.style.transform=''};stick.addEventListener('pointerup',end);stick.addEventListener('pointercancel',end);
  stage.addEventListener('pointerdown',e=>{if(e.target.closest('#stick,.tb')||G.state!=='play')return;lid=e.pointerId;lx=e.clientX});
  stage.addEventListener('pointermove',e=>{if(e.pointerId!==lid)return;G.p.a+=(e.clientX-lx)/scale*.008;lx=e.clientX});
  stage.addEventListener('pointerup',e=>{if(e.pointerId===lid)lid=null});
  $('#tFlash').addEventListener('pointerdown',e=>{e.stopPropagation();AU.init();shoot()});$('#tWind').addEventListener('pointerdown',e=>{e.stopPropagation();wind()});
  $('#tUse').addEventListener('pointerdown',e=>{e.stopPropagation();G.keys.e=true;use()});$('#tUse').addEventListener('pointerup',()=>{G.keys.e=false})}

/* ---------- HUD ---------- */
const hud=$('#hud'),promptEl=$('#prompt'),subEl=$('#sub'),ledEl=$('#led'),countEl=$('#count'),windEl=$('#wind');
let subT=0;function say(t,secs=4){subEl.textContent=t;subEl.classList.add('on');subT=secs}
function hudUpdate(dt){countEl.textContent=G.film;windEl.classList.toggle('on',!G.wound&&G.film>0);
  ledEl.className='led'+(G.film<=0?'':G.charge>0?' charge':G.wound?' ready':'');if(subT>0){subT-=dt;if(subT<=0)subEl.classList.remove('on')}
  if(!touchMode&&!locked()&&!G.noLock&&!G.note){promptEl.textContent='Click to keep going.';return}
  const it=nearest();promptEl.textContent=it?it.label:''}
function nearest(){const p=G.p,fx=Math.cos(p.a),fy=Math.sin(p.a);
  if(p.x<1.6&&Math.abs(p.y-7.5)<.9&&fx<-.3)return G.hasKey?{label:G.unlock>0?'Unlocking  '+'█'.repeat(Math.ceil(G.unlock/2.4*10)).padEnd(10,'░'):'Hold E · unlock the deadbolt',door:true}:{label:'Locked. The deadbolt needs her key.',door:true};
  for(const i of ITEMS)if(!G.flags[i.id]&&Math.hypot(i.x-p.x,i.y-p.y)<1.05&&Math.abs(angleTo(p,i.x,i.y))<1)return{label:'E · pick up the note',item:i};
  const k=PROPS.find(q=>q.id==='key');if(!k.gone&&Math.hypot(k.x-p.x,k.y-p.y)<1.2&&Math.abs(angleTo(p,k.x,k.y))<1.1)return{label:'E · take the key',key:true};return null}
function use(){if(G.note){closeNote();return}const it=nearest();if(!it)return;
  if(it.item){G.flags[it.item.id]=1;AU.paper();openNote(it.item.text);STORY.onNote(it.item.id)}else if(it.key){STORY.takeKey()}}
const noteEl=$('#note');
function openNote(t){G.note=true;$('#noteText').textContent=t;noteEl.hidden=false}
function closeNote(){G.note=false;noteEl.hidden=true;AU.paper()}

/* ---------- the camera ---------- */
function wind(){if(G.state!=='play'||G.wound||G.film<=0)return;AU.ratchet();G.windN=(G.windN||0)+1;if(G.windN>=3){G.wound=true;G.windN=0;setTimeout(()=>AU.ratchet(),60)}}
function stamp(g,text){g.font='11px VT323, monospace';g.textAlign='right';g.fillStyle='rgba(255,140,40,.95)';g.shadowColor='rgba(255,120,20,.9)';g.shadowBlur=3;g.fillText(text,VW-8,VH-7);g.shadowBlur=0}
const STAMP="10 31 '26";
function shoot(){if(G.state!=='play'||G.note)return;if(G.film<=0){AU.dry();say('The counter reads 0.');return}
  if(!G.wound){AU.dry();say('Wind the film first. R or mouse wheel.',2.5);return}if(G.charge>0){AU.dry();return}
  G.film--;G.wound=false;G.charge=G.film>0?1.4:0;G.flashT=0;G.adapt=0;AU.shutter();if(G.film>0)AU.whine(1.4);STORY.beforeFlash();
  const sp=worldSprites(),img=snapG.createImageData(VW,VH);render(img.data,VW,VH,G.p,{flash:G.gentle?.72:1,amb:.015,moon:.6,sprites:sp,grain:9});snapG.putImageData(img,0,0);stamp(snapG,STAMP);
  ghostG.globalCompositeOperation='source-over';ghostG.clearRect(0,0,VW,VH);ghostG.drawImage(snapC,0,0);ghostG.globalCompositeOperation='multiply';ghostG.fillStyle='#55ffaa';ghostG.fillRect(0,0,VW,VH);
  const c=G.cr,cs=sp.find(s=>s.cr),d=c.on?Math.hypot(c.x-G.p.x,c.y-G.p.y):99;c.seen=!!(cs&&cs.px>0&&d<15);
  G.shots.push({x:G.p.x,y:G.p.y,a:G.p.a,cr:c.on&&c.seen?{x:c.x,y:c.y,tex:c.tex}:null,props:PROPS.map(p=>p.gone?null:p.tex)});
  G.noise=Math.max(G.noise,.5);STORY.onFlash(c.seen,d)}

/* ---------- the thing ---------- */
let F=null,fT=0;
function crPlace(x,y,tex,mode){Object.assign(G.cr,{on:true,x,y,tex,mode,seen:false,leaving:false,frozen:0,recoil:false,jump:false})}
function crGone(){G.cr.on=false;G.cr.leaving=false}
function farSpot(){const P=field(Math.floor(G.p.x),Math.floor(G.p.y)),c=[];for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const v=P[x+y*MW];if(v>=7&&v<=11&&!los(G.p.x,G.p.y,x+.5,y+.5))c.push([x+.5,y+.5])}
  return c.length?c[Math.random()*c.length|0]:[23.5,1.5]}
function crUpdate(dt){const c=G.cr;if(!c.on)return;const d=Math.hypot(c.x-G.p.x,c.y-G.p.y),rel=angleTo(G.p,c.x,c.y),lit=G.flashT<.75&&c.seen;
  if(d<4.8){c.breathT-=dt;if(c.breathT<=0){c.inh=!c.inh;AU.breath(rel,d,c.inh);c.breathT=c.inh?1.0:1.35}}
  if(c.leaving&&G.flashT>.9){crGone();return}
  if(c.recoil&&G.flashT>.7){c.recoil=false;const s=farSpot();c.x=s[0];c.y=s[1];c.frozen=2.4;AU.whisper(angleTo(G.p,c.x,c.y),6);return}
  if(c.mode!=='hunt')return;c.frozen-=dt;if(lit||c.frozen>0)return;
  fT-=dt;if(!F||fT<=0){F=field(Math.floor(G.p.x),Math.floor(G.p.y));fT=.25}
  const cx=Math.floor(c.x),cy=Math.floor(c.y);let tx=G.p.x,ty=G.p.y;
  if(cx!==Math.floor(G.p.x)||cy!==Math.floor(G.p.y)){let best=F[cx+cy*MW],bx=cx,by=cy;for(const [ax,ay] of [[1,0],[-1,0],[0,1],[0,-1]]){const v=F[(cx+ax)+(cy+ay)*MW];if(v>=0&&(best<0||v<best)){best=v;bx=cx+ax;by=cy+ay}}tx=bx+.5;ty=by+.5}
  const sp=(G.noise>.35?2.45:1.5)*(G.gentle?.85:1)*dt,vx=tx-c.x,vy=ty-c.y,vl=Math.hypot(vx,vy)||1;c.x+=vx/vl*Math.min(sp,vl);c.y+=vy/vl*Math.min(sp,vl);
  c.stepT-=dt;if(c.stepT<=0){AU.cstep(rel,d);c.stepT=G.noise>.35?.32:.5}
  if(d<.72)STORY.caught()}

/* ---------- frame ---------- */
function update(dt){const p=G.p,k=G.keys;if(G.note)return;
  const turn=(k.arrowleft?-1:0)+(k.arrowright?1:0);p.a+=turn*2.3*dt;
  const fwd=(k.w||k.arrowup?1:0)-(k.s||k.arrowdown?1:0)-G.mv.y,str=(k.d?1:0)-(k.a?1:0)+G.mv.x,run=!!k.shift&&fwd>0,mag=Math.hypot(fwd,str);
  if(mag>.1){const sp=(run?2.9:1.55)*dt/Math.max(1,mag),fx=Math.cos(p.a),fy=Math.sin(p.a);if(tryMove(p,p.x+(fx*fwd-fy*str)*sp,p.y+(fy*fwd+fx*str)*sp,.22)&&Math.random()<.04)AU.bump();
    G.stepT-=dt;if(G.stepT<=0){AU.step(run);G.stepT=run?.32:.55}if(run)G.noise=1}
  G.noise=Math.max(0,G.noise-dt*.35);G.flashT+=dt;G.adapt+=dt;G.charge=Math.max(0,G.charge-dt);G.playT+=dt;
  const nd=nearest();if(nd&&nd.door&&G.hasKey&&(k.e)){G.unlock+=dt;if(Math.random()<dt*4)AU.keys();if(G.unlock>=2.4)STORY.escape()}else G.unlock=Math.max(0,G.unlock-dt*2);
  crUpdate(dt);
  const cd=G.cr.on?Math.hypot(G.cr.x-p.x,G.cr.y-p.y):99;
  G.clockStop=Math.max(0,G.clockStop-dt);G.tickT-=dt;if(G.tickT<=0){G.tickT=1;G.tockHi=!G.tockHi;if(G.clockStop<=0&&cd>5&&G.phase===1)AU.tick(angleTo(p,CLOCK.x,CLOCK.y),Math.hypot(CLOCK.x-p.x,CLOCK.y-p.y),G.tockHi)}
  if(G.phase===2||cd<7){G.heartT-=dt;if(G.heartT<=0){const v=clamp(1-cd/8,.25,1);AU.heart(v);G.heartT=.3+clamp(cd,1,9)*.09}}
  if(Math.random()<dt/14)AU.creak();STORY.tick(dt)}
function draw(){const amb=G.gentle?.09:.012+.075*clamp(G.adapt/7,0,1);
  render(live.data,VW,VH,G.p,{flash:0,amb,moon:.85,sprites:worldSprites(),grain:4,eyeDark:G.phase===2?14:0});vctx.putImageData(live,0,0);
  const f=G.flashT;if(f<1.3){vctx.globalAlpha=f<.09?1:Math.pow(Math.max(0,1-(f-.09)/1.2),1.6);vctx.drawImage(snapC,0,0)}
  if(f>.09&&f<4.5){vctx.globalCompositeOperation='lighter';vctx.globalAlpha=.17*(1-(f-.09)/4.4);vctx.drawImage(ghostC,1,0);vctx.globalCompositeOperation='source-over'}vctx.globalAlpha=1}
const grainC=$('#grain'),grainG=grainC.getContext('2d');let grainT=0;
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;
  if(G.state==='play'){if(touchMode||locked()||G.noLock||G.note)update(dt);draw();hudUpdate(dt)}
  grainT-=dt;if(grainT<=0){grainT=.08;noiseFill(grainG,160,90)}requestAnimationFrame(frame)}
function noiseFill(g,w,h){const im=g.createImageData(w,h),d=im.data;for(let i=0;i<d.length;i+=4){const v=Math.random()*255|0;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255}g.putImageData(im,0,0)}
