/* ---------- story: scripted scares, the hunt, death, the developed roll ---------- */
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const pad=n=>String(n).padStart(2,'0');
const scr=$('#screen');function show(html){scr.innerHTML=html;return scr.firstElementChild}
const dist=(x,y)=>Math.hypot(x-G.p.x,y-G.p.y);
const prop=id=>PROPS.find(p=>p.id===id);
function spotInView(dmin,dmax){const p=G.p;for(let i=0;i<50;i++){const d=rand(dmin,dmax),a=p.a+rand(-.32,.32),x=p.x+Math.cos(a)*d,y=p.y+Math.sin(a)*d;if(!blocked(x,y,.25)&&los(p.x,p.y,x,y))return[x,y]}
  for(let d=dmax;d>=.9;d-=.15){const x=p.x+Math.cos(p.a)*d,y=p.y+Math.sin(p.a)*d;if(!blocked(x,y,.2)&&los(p.x,p.y,x,y))return[x,y]}return null}
function unlockMouse(){try{document.exitPointerLock&&document.exitPointerLock()}catch(e){}}

async function faceScare(secs,vol){const sc=$('#scare'),g=sc.getContext('2d');sc.hidden=false;AU.duck(true);AU.scream(vol);if(!G.gentle)$('#shake').classList.add('on');
  const t0=performance.now();await new Promise(res=>{const f=()=>{const t=(performance.now()-t0)/1000;paintScare(g,128,72,t,G.gentle?.3:1);if(t<secs)requestAnimationFrame(f);else res()};f()});
  sc.hidden=true;$('#shake').classList.remove('on');AU.duck(false)}

const STORY={
  tick(dt){const p=G.p,f=G.flags,c=G.cr,room=roomAt(p.x,p.y);
    if(c.on&&c.mode==='pose'&&!c.leaving&&dist(c.x,c.y)<(c.near||2)){crGone();AU.creak()}
    if(f.keyNote===1&&!G.note){f.keyNote=2;this.hunt()}
    if(c.on&&c.mode==='pose'){c.life-=dt;if(c.life<=0&&G.flashT>1)crGone()}
    if(G.phase===1&&f.firstSeen&&!c.on){f.stalkT=(f.stalkT==null?18:f.stalkT)-dt;if(f.stalkT<=0){f.stalkT=rand(20,38);const s=spotInView(4.5,7);
      if(s){crPlace(s[0],s[1],Math.random()<.7?'cr_stand':'cr_arms','pose');c.near=2.4;c.life=7;AU.breath(angleTo(G.p,s[0],s[1]),5,true)}}}
    if(G.phase===1){
      if(!f.clock&&G.playT>40){f.clock=1;for(let i=0;i<3;i++)setTimeout(()=>AU.bong(angleTo(G.p,CLOCK.x,CLOCK.y),dist(CLOCK.x,CLOCK.y)),i*2600);say('The clock in the living room strikes three.',5)}
      if(!f.hall&&p.x>7.7){f.hall=1;crPlace(19.5,7.5,'cr_stand','pose');c.near=3.4;c.life=22}
      if(!f.bath&&f.hall&&dist(11.5,6.6)<1.15&&!c.on){f.bath=1;crPlace(10.5,3.7,'cr_crawl','pose');c.near=1.5;c.life=14}
      if(!f.behind&&f.hall&&p.x>14.3&&room==='hall'&&!c.on){f.behind=1;f.behindT=1.4}
      if(f.behindT>0){f.behindT-=dt;if(f.behindT<=0){let bx=p.x-Math.cos(p.a)*1.25,by=p.y-Math.sin(p.a)*1.25;if(blocked(bx,by,.2)){bx=p.x-1.25;by=p.y}
        crPlace(bx,by,'cr_stand','behind');f.behindLeft=4.5;AU.breath(Math.PI,1.1,true);setTimeout(()=>G.cr.on&&AU.breath(Math.PI,1.1,false),1100);G.clockStop=30}}
      if(c.on&&c.mode==='behind'&&!c.leaving){f.behindLeft-=dt;if(f.behindLeft<=0){crGone();AU.whisper(Math.PI,1.4);say('The clock has stopped ticking.',4)}}
      if(!f.kitchen&&room==='kitchen'&&!c.on){f.kitchen=1;crPlace(9.5,12.4,'cr_stand','pose');c.near=1.8;c.life=16;setTimeout(()=>AU.knock(angleTo(G.p,11.5,13.3),dist(11.5,13.3)),2600)}
      if(f.kitchen&&f.hall&&!f.chair&&room==='living'){f.chair=1;const ch=prop('chair');ch.tex='chair_occ';ch.h=1.35}
      if(!f.bed&&dist(23.4,5)<2.1){f.bed=1;prop('bed').tex='bed';AU.creak();setTimeout(()=>AU.whisper(angleTo(G.p,23.5,1.5),dist(23.5,1.5)),700)}
    }else if(!f.ahead&&p.x<12.5&&c.on&&c.x>p.x+2&&G.flashT>.9){f.ahead=1;c.x=4.5;c.y=7.5;c.frozen=1.4;AU.whisper(angleTo(G.p,4.5,7.5),dist(4.5,7.5));say('Something is breathing between you and the front door.',4)}},

  onFlash(seen,d){const f=G.flags,c=G.cr;
    if(!f.first){f.first=1;setTimeout(()=>say('Wind the film before the next shot. R or the mouse wheel.',5),900)}
    if(G.film===0)setTimeout(()=>say('That was the last exposure.',4),1000);
    const ch=prop('chair');if(ch.tex==='chair_occ'&&dist(ch.x,ch.y)<7&&Math.abs(angleTo(G.p,ch.x,ch.y))<.75&&los(G.p.x,G.p.y,ch.x,ch.y)){AU.stinger();setTimeout(()=>{ch.tex='chair';ch.h=.9},900)}
    if(!seen)return;f.firstSeen=1;
    if(c.mode==='pose'&&c.jump){c.jump=false;c.leaving=true;setTimeout(()=>faceScare(.8,.9),120)}
    else if(c.mode==='pose'){AU.stinger();c.leaving=true}
    else if(c.mode==='behind'){c.leaving=true;setTimeout(()=>faceScare(.75,.85),140)}
    else if(c.mode==='hunt'){if(d<2.6){AU.scream(.5);AU.stinger();c.recoil=true}else if(d<6)AU.stinger()}},

  beforeFlash(){if(G.phase!==1||G.cr.on)return;const n=G.shots.length+1,c=G.cr,T=['cr_stand','cr_crawl','cr_arms'];
    const plan={2:[6,9,'cr_stand'],4:[3.8,5.2,'cr_crawl'],6:[2.3,3,'cr_arms'],8:[1.05,1.35,'cr_stand']}[n]||(n>8&&Math.random()<.4?[rand(2,3.5),rand(4.5,7),T[Math.random()*3|0]]:null);
    if(!plan)return;const s=spotInView(plan[0],plan[1]);if(!s)return;crPlace(s[0],s[1],plan[2],'pose');c.near=0;c.life=99;c.jump=plan[0]<1.5},
  onNote(id){if(id==='n4')setTimeout(()=>AU.knock(angleTo(G.p,.6,7.5),dist(.6,7.5)),3000)},
  takeKey(){prop('key').gone=true;G.hasKey=true;AU.keys();G.flags.keyNote=1;openNote('Taped to the key, in her handwriting:\n\nDon\'t come back for the camera.')},
  hunt(){G.phase=2;G.ck={film:G.film,shots:G.shots.length};AU.slam(angleTo(G.p,23.5,2.5),dist(23.5,2.5));AU.stinger();AU.dread(1);
    crPlace(23.5,1.6,'cr_arms','hunt');G.cr.frozen=2.6;setTimeout(()=>say('Get to the front door.',3),1500)},

  async caught(){if(G.state!=='play')return;G.state='dead';unlockMouse();G.deaths++;await faceScare(1.25,1);deathScreen()},
  async escape(){if(G.state!=='play')return;G.state='end';unlockMouse();$('#hud').hidden=true;$('#touch').hidden=true;AU.doorOpen();AU.dread(0);crGone();
    show('<div class="ov" style="background:#f4efe2"></div>');await sleep(1200);
    await lines(['You ran until you reached the streetlights.','At 3:33 AM a neighbor found you on the curb, still holding the camera.','The next Monday, the pharmacy developed the roll.'],2600);contactSheet()}
};

async function lines(L,gap){const r=show(`<div class="ov"><div class="lines">${L.map(l=>`<p>${l}</p>`).join('')}</div></div>`);let skip=false;r.addEventListener('mousedown',()=>skip=true);
  for(const p of r.querySelectorAll('.lines p')){p.classList.add('on');await sleep(skip?200:gap)}await sleep(skip?200:900)}

/* ---------- screens ---------- */
function titleScreen(){G.state='title';$('#hud').hidden=true;$('#touch').hidden=true;
  const r=show(`<div class="ov"><h1>27 EXPOSURES</h1><p>A dark house. A disposable camera. Something that only moves while nobody is looking at it.</p>
    <div class="row"><button class="btn" id="go">Begin</button></div>
    <label class="chk"><input type="checkbox" id="gentle">Gentle mode: dimmer flash, quieter scream, no shaking</label>
    <p class="small">Headphones on. Lights off. Play alone.<br>Contains loud jumpscares and bright camera flashes.</p>
    <p class="small">${touchMode?'Left stick moves · drag to look · FLASH, WIND and USE buttons on the right':'WASD move · mouse look · click or Space: flash · R or wheel: wind film · E: use · Shift: run (it hears you)'}</p>
    <p class="small">Made for Hack Club Scare</p></div>`);
  r.querySelector('#gentle').checked=G.gentle;r.querySelector('#go').addEventListener('click',()=>{AU.init();AU.resume();G.gentle=r.querySelector('#gentle').checked;intro()})}
async function intro(){resetGame();
  await lines(['October 31st. 2:51 AM.','The night after Grandma\'s funeral, the power went out.','Your phone is dead. The front door is deadbolted from the inside.','Her key is in her bedroom, at the end of the hall.','All you have is the disposable camera from her kitchen drawer.','27 exposures.'],2300);
  const r=show('<div class="ov"><p class="pulse">Click to open your eyes.</p></div>');r.addEventListener('click',()=>begin(),{once:true})}
function begin(){show('');$('#hud').hidden=false;$('#touch').hidden=!touchMode;G.state='play';last=performance.now();AU.init();AU.resume();AU.ambientOn();lock();
  if(G.phase===1)setTimeout(()=>say('It\'s too dark to see anything. Take a picture: click or Space.',6),600)}
function resetGame(){Object.assign(G,{p:{x:3.5,y:7.5,a:0},film:27,wound:true,charge:0,flashT:99,adapt:0,phase:1,hasKey:false,noise:0,flags:{},shots:[],note:false,unlock:0,clockStop:0,playT:0,ck:null,windN:0,mv:{x:0,y:0}});
  crGone();PROPS.forEach(p=>p.gone=false);prop('bed').tex='bed_occ';const ch=prop('chair');ch.tex='chair';ch.h=.9;AU.dread(0)}
function restart(){const ck=G.ck;Object.assign(G,{p:{x:22.6,y:7.5,a:Math.PI},film:Math.max(ck.film,5),wound:true,charge:0,flashT:99,adapt:3,noise:0,unlock:0,note:false});
  G.shots.length=ck.shots;G.flags.ahead=0;crPlace(23.5,1.6,'cr_arms','hunt');G.cr.frozen=2.8}
function deathScreen(){$('#hud').hidden=true;$('#touch').hidden=true;const t=`3:${pad(Math.min(59,6+Math.floor(G.playT/15)))} AM`;
  const r=show(`<div class="ov"><h2 class="red">It reached you.</h2><p>${t}. ${G.film} exposure${G.film===1?'':'s'} left on the roll.</p>
    <p class="small">${G.film>0?'When it gets close, give it the flash. It can\'t move while it\'s being looked at.':'You had nothing left to show it.'}</p>
    <div class="row"><button class="btn" id="retry">Try again from the bedroom</button><button class="btn" id="quit">Title</button></div></div>`);
  r.querySelector('#retry').addEventListener('click',()=>{restart();begin()});r.querySelector('#quit').addEventListener('click',titleScreen)}

/* ---------- the developed roll ---------- */
function insertion(s){const fx=Math.cos(s.a),fy=Math.sin(s.a),qx=-fy,qy=fx;for(const d of [2.6,3.4,1.9,4.2,1.4])for(const o of [.55,-.55,.25,-.25,0,.9,-.9]){
  const x=s.x+fx*d+qx*o,y=s.y+fy*d+qy*o;if(!blocked(x,y,.2)&&los(s.x,s.y,x,y))return{x,y,tex:Math.random()<.2?'cr_crawl':'cr_stand'}}return null}
function renderShot(s,cv){const g=cv.getContext('2d'),img=g.createImageData(cv.width,cv.height),sp=[];PROPS.forEach((p,i)=>{if(s.props[i])sp.push({...p,tex:s.props[i],h:s.props[i]==='chair_occ'?1.35:p.h})});
  const cr=s.cr||insertion(s);if(cr)sp.push({x:cr.x,y:cr.y,tex:cr.tex,h:cr.tex==='cr_crawl'?.5:1.3});render(img.data,cv.width,cv.height,s,{flash:1,amb:.015,moon:.6,sprites:sp,grain:20});g.putImageData(img,0,0)}
async function contactSheet(){const n=G.shots.length,dd=new Date(),dev=`${pad(dd.getMonth()+1)}/${pad(dd.getDate())}`;
  const r=show(`<div class="ov" style="gap:16px"><p class="small">ROLL 1 · ${n} OF 27 EXPOSURES · DEVELOPED ${dev}</p><div class="sheet"></div><p id="cap" style="min-height:1.6em"></p><div class="row" id="more" hidden><button class="btn" id="one">There's one more print in the envelope</button></div></div>`);
  const sheet=r.querySelector('.sheet'),cvs=[];for(let i=0;i<27;i++){const f=document.createElement('div');f.className='frame';const cv=mkCanvas(128,72);f.appendChild(cv);const s=document.createElement('span');s.textContent=i+1;f.appendChild(s);sheet.appendChild(f);cvs.push(cv)}
  for(let i=0;i<27;i++){await sleep(i<n?360:70);const cv=cvs[i];if(i<n){renderShot(G.shots[i],cv);AU.paper()}else{const g=cv.getContext('2d'),gr=g.createLinearGradient(0,0,128,0);gr.addColorStop(0,'rgba(255,120,30,.25)');gr.addColorStop(.3,'#0a0603');gr.addColorStop(1,'#050302');g.fillStyle=gr;g.fillRect(0,0,128,72)}cv.classList.add('on')}
  const cap=r.querySelector('#cap');await sleep(1400);cap.textContent=n?'You never saw it in most of these.':'You didn\'t take a single picture.';await sleep(2800);
  cap.textContent='It was in every one.';cap.classList.add('red');AU.stinger();await sleep(2400);r.querySelector('#more').hidden=false;r.querySelector('#one').addEventListener('click',finalPrint,{once:true})}
async function finalPrint(){const now=new Date(),st=`${pad(now.getMonth()+1)} ${pad(now.getDate())} '${String(now.getFullYear()).slice(2)}  ${now.getHours()}:${pad(now.getMinutes())}`;
  const r=show('<div class="ov" style="gap:20px"><canvas class="big" width="256" height="144"></canvas><p id="cap2" style="min-height:3.4em"></p></div>');
  const cv=r.querySelector('canvas'),g=cv.getContext('2d'),img=g.createImageData(256,144);
  render(img.data,256,144,{x:23.5,y:2.7,a:Math.PI/2},{flash:1,amb:.015,moon:.6,grain:16,sprites:[{x:23.4,y:5,tex:'bed_occ',h:.6},{x:22.75,y:5.0,tex:'cr_stand',h:1.3},{x:21.5,y:4.6,tex:'stand',h:.5}]});
  g.putImageData(img,0,0);g.font='11px VT323, monospace';g.textAlign='right';g.fillStyle='rgba(255,140,40,.95)';g.fillText(st,248,137);AU.paper();
  const cap=r.querySelector('#cap2'),add=async(t,ms)=>{cap.innerHTML+=(cap.innerHTML?'<br>':'')+t;await sleep(ms)};
  await sleep(1500);await add('Exposure 28.',1700);await add('The roll only had 27.',2000);AU.stinger();await add('<span class="red">It\'s stamped with today\'s date. And the time on your clock right now.</span>',4200);
  const e=show(`<div class="ov"><h1>27 EXPOSURES</h1><p class="small">Thanks for playing. Made for Hack Club Scare.</p><div class="row"><button class="btn" id="again">Play again</button></div></div>`);
  e.querySelector('#again').addEventListener('click',titleScreen)}

titleScreen();requestAnimationFrame(frame);
