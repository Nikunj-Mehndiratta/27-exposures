/* ---------- art: every texture and sprite is painted with canvas calls at startup ---------- */
const TEX={};
let _seed=11;const srand=()=>(_seed=(_seed*16807)%2147483647)/2147483647;
const mkCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
function bake(name,w,h,draw,o={}){const c=mkCanvas(w,h),g=c.getContext('2d');draw(g,w,h);
  TEX[name]={w,h,d:g.getImageData(0,0,w,h).data,em:o.em?o.em(w,h):null,eyes:o.eyes||null,canvas:c}}
function grime(g,w,h,n,a){for(let i=0;i<n;i++){g.fillStyle=srand()<.5?`rgba(0,0,0,${a*srand()})`:`rgba(255,240,210,${a*.4*srand()})`;g.fillRect(srand()*w|0,srand()*h|0,1+(srand()*2|0),1+(srand()*2|0))}}
function stains(g,w,h,n){for(let i=0;i<n;i++){const x=srand()*w,y=srand()*h*.8,r=6+srand()*16,gr=g.createRadialGradient(x,y,1,x,y,r);gr.addColorStop(0,'rgba(70,45,15,.32)');gr.addColorStop(1,'rgba(70,45,15,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}}
function line(g,pts){g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.stroke()}
function baseboard(g,w){g.fillStyle='#3a291b';g.fillRect(0,55,w,9);g.fillStyle='#24180f';g.fillRect(0,55,w,1)}

/* walls */
bake('wall',64,64,(g,w,h)=>{g.fillStyle='#7d8265';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=8){g.fillStyle='#70775a';g.fillRect(x,0,3,h)}
  g.fillStyle='#8c9173';for(let y=4;y<52;y+=10)for(let x=((y/10|0)%2)*4+2;x<w;x+=8)g.fillRect(x,y,2,3);
  stains(g,w,h,5);g.fillStyle='rgba(60,40,20,.25)';for(let i=0;i<4;i++){const x=srand()*w|0;g.fillRect(x,srand()*20|0,1,20+srand()*30)}baseboard(g,w);grime(g,w,h,260,.25)});
bake('panel',64,64,(g,w,h)=>{g.fillStyle='#4b2e2a';g.fillRect(0,0,w,30);g.fillStyle='#5a3833';for(let y=3;y<28;y+=8)for(let x=((y/8|0)%2)*6+2;x<w;x+=12)g.fillRect(x,y,3,3);
  g.fillStyle='#4a301d';g.fillRect(0,30,w,34);for(let x=0;x<w;x+=8){g.fillStyle='#3a2516';g.fillRect(x,30,1,34);g.fillStyle='rgba(255,220,170,.05)';g.fillRect(x+3,30,1,34)}
  g.fillStyle='#6b4a2e';g.fillRect(0,29,w,3);g.fillStyle='#2b1b10';g.fillRect(0,32,w,1);stains(g,w,30,3);grime(g,w,h,300,.3)});
bake('frame',64,64,(g,w,h)=>{g.drawImage(TEX.panel.canvas,0,0);g.fillStyle='#8a6a2c';g.fillRect(16,3,32,25);g.fillStyle='#5e4718';g.fillRect(18,5,28,21);
  g.fillStyle='#a08a66';g.fillRect(20,7,24,17);g.fillStyle='#3b3024';[[24,12],[31,10],[38,12]].forEach(([x,y])=>{g.fillRect(x-2,y+3,5,9);g.fillRect(x-1,y,3,3)});
  g.strokeStyle='#efe8da';g.lineWidth=1;[[24,12],[31,10],[38,12]].forEach(([x,y])=>{line(g,[[x-2,y-1],[x+2,y+3],[x-2,y+3],[x+2,y-1]])});grime(g,w,h,80,.3)});
bake('rose',64,64,(g,w,h)=>{g.fillStyle='#8c6a68';g.fillRect(0,0,w,h);for(let y=5;y<52;y+=12)for(let x=((y/12|0)%2)*8+4;x<w;x+=16){g.fillStyle='#a3787a';g.fillRect(x,y,4,4);g.fillStyle='#5e6a4c';g.fillRect(x+4,y+3,3,2)}
  stains(g,w,h,6);baseboard(g,w);grime(g,w,h,260,.25)});
bake('window',64,64,(g,w,h)=>{g.drawImage(TEX.wall.canvas,0,0);g.fillStyle='#b8b2a1';g.fillRect(12,6,40,44);const gr=g.createLinearGradient(0,9,0,47);gr.addColorStop(0,'#3f5068');gr.addColorStop(1,'#1a2433');
  g.fillStyle=gr;g.fillRect(15,9,34,38);g.fillStyle='#b8b2a1';g.fillRect(31,9,2,38);g.fillRect(15,27,34,2);g.strokeStyle='#0b0f15';g.lineWidth=1.5;line(g,[[15,40],[26,30],[34,33],[49,18]]);line(g,[[26,30],[24,16]]);line(g,[[38,31],[44,44]]);
  g.fillStyle='#4a1f1c';g.fillRect(8,4,7,50);g.fillRect(49,4,7,50);g.fillStyle='#331412';g.fillRect(11,4,1,50);g.fillRect(52,4,1,50);g.fillStyle='#8a8576';g.fillRect(10,50,44,3)},
  {em:(w,h)=>{const e=new Float32Array(w*h);for(let y=9;y<47;y++)for(let x=15;x<49;x++)e[y*w+x]=1.8-(y-9)/38*.8;return e}});
bake('door',64,64,(g,w,h)=>{g.fillStyle='#3d2a1e';g.fillRect(0,0,w,h);g.fillStyle='#4f3524';g.fillRect(8,2,48,62);g.fillStyle='#3a2618';[[13,20,16,16],[35,20,16,16],[13,40,16,18],[35,40,16,18]].forEach(r=>g.fillRect(...r));
  g.fillStyle='#1b2433';g.beginPath();g.arc(32,14,9,Math.PI,0);g.fill();g.fillStyle='#b08a3c';g.fillRect(48,36,4,4);g.fillRect(48,28,4,3);g.fillStyle='#2b1b10';g.fillRect(8,2,48,1);grime(g,w,h,200,.3)},
  {em:(w,h)=>{const e=new Float32Array(w*h);for(let y=5;y<14;y++)for(let x=23;x<41;x++)if(Math.hypot(x-32,y-14)<9)e[y*w+x]=1.1;return e}});

/* floors and ceiling */
bake('boards',64,64,(g,w,h)=>{for(let y=0;y<h;y+=8){g.fillStyle=['#4e3726','#563c29','#4a3323'][(y/8)%3];g.fillRect(0,y,w,8);g.fillStyle='#2a1c12';g.fillRect(0,y,w,1);g.fillRect(((y*13)%64),y,1,8)}grime(g,w,h,300,.35)});
bake('lino',64,64,(g,w,h)=>{for(let y=0;y<h;y+=16)for(let x=0;x<w;x+=16){g.fillStyle=((x+y)/16)%2?'#3f3c35':'#8b8676';g.fillRect(x,y,16,16)}stains(g,w,h,4);grime(g,w,h,300,.35)});
bake('carpet',64,64,(g,w,h)=>{g.fillStyle='#4a3439';g.fillRect(0,0,w,h);grime(g,w,h,900,.4);stains(g,w,h,3)});
bake('ceil',64,64,(g,w,h)=>{g.fillStyle='#6e6a61';g.fillRect(0,0,w,h);stains(g,w,h,5);grime(g,w,h,400,.25)});

/* the thing. Eyes are listed as texel coords so the renderer can draw eyeshine even when the sprite is a few pixels tall. */
const SKIN='#d3cab6',SKD='#9a917d',BLK='#120e0b';
function hair(g,x0,x1,y0,y1){g.strokeStyle='#17120f';g.lineWidth=1.4;for(let x=x0;x<=x1;x+=2){const len=y1-y0+(srand()*12|0);g.beginPath();g.moveTo(x,y0);g.quadraticCurveTo(x+(srand()*6-3),y0+len/2,x+(srand()*4-2),y0+len);g.stroke()}}
function head(g,x,y,rot,s=1){g.save();g.translate(x,y);g.rotate(rot);g.fillStyle=SKIN;g.beginPath();g.ellipse(0,0,7*s,10*s,0,0,7);g.fill();
  g.fillStyle=BLK;g.fillRect(-5*s,-3*s,4*s,4*s);g.fillRect(1*s,-3*s,4*s,4*s);g.fillRect(-3*s,5*s,6*s,2*s);g.restore()}
function figure(g,arms){g.lineCap='round';g.strokeStyle=SKIN;g.lineWidth=4;line(g,[[29,82],[27,104],[27,126]]);line(g,[[36,82],[38,104],[40,126]]);
  g.fillStyle=SKIN;g.beginPath();g.moveTo(24,38);g.quadraticCurveTo(32,34,41,38);g.lineTo(38,84);g.lineTo(27,84);g.closePath();g.fill();
  g.strokeStyle=SKD;g.lineWidth=1;for(let i=0;i<5;i++)line(g,[[27,46+i*5],[37,47+i*5]]);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(35,40,4,42);
  g.strokeStyle=SKIN;g.lineWidth=3;
  if(arms){line(g,[[25,40],[15,20],[19,3]]);line(g,[[40,40],[49,19],[45,1]]);g.lineWidth=1;[[19,3],[45,1]].forEach(([x,y])=>{for(let k=-2;k<=2;k++)line(g,[[x,y],[x+k*2,y-5]])})}
  else{line(g,[[25,40],[17,72],[19,112]]);line(g,[[40,40],[47,70],[44,114]]);g.lineWidth=1;[[19,112],[44,114]].forEach(([x,y])=>{for(let k=-2;k<=2;k++)line(g,[[x,y],[x+k*1.5,y+8]])})}
  g.lineWidth=4;line(g,[[32,38],[34,24]]);head(g,34,15,.42);hair(g,28,41,7,30)}
bake('cr_stand',64,128,g=>figure(g,false),{eyes:[[30,15],[36,17]]});
bake('cr_arms',64,128,g=>figure(g,true),{eyes:[[30,15],[36,17]]});
bake('cr_crawl',64,48,g=>{g.lineCap='round';g.strokeStyle=SKIN;g.lineWidth=3;line(g,[[26,26],[19,3],[23,22]]);line(g,[[38,26],[45,3],[41,22]]);
  g.lineWidth=3;line(g,[[17,27],[6,12],[3,46]]);line(g,[[47,27],[58,12],[61,46]]);g.fillStyle=SKIN;g.fillRect(16,24,32,7);head(g,32,32,-.15,1);hair(g,26,38,24,44)},{eyes:[[29,30],[34,30]]});
bake('chair',64,64,g=>{g.fillStyle='#5a2424';g.fillRect(12,4,40,44);g.fillRect(6,16,10,34);g.fillRect(48,16,10,34);g.fillStyle='#6d2e2c';g.fillRect(14,36,36,14);
  g.fillStyle='#3a5a3a';for(let i=0;i<14;i++)g.fillRect(14+srand()*34|0,6+srand()*40|0,3,3);g.fillStyle='#2a1a10';g.fillRect(10,50,4,13);g.fillRect(50,50,4,13);grime(g,64,64,120,.4)});
bake('chair_occ',64,96,g=>{g.drawImage(TEX.chair.canvas,0,32);g.fillStyle=SKIN;g.beginPath();g.moveTo(22,40);g.lineTo(42,40);g.lineTo(40,72);g.lineTo(24,72);g.fill();
  g.strokeStyle=SKIN;g.lineCap='round';g.lineWidth=3;line(g,[[23,42],[10,56],[9,95]]);line(g,[[41,42],[54,56],[55,95]]);g.lineWidth=4;line(g,[[27,74],[26,94]]);line(g,[[37,74],[38,94]]);
  g.lineWidth=4;line(g,[[32,40],[31,28]]);head(g,30,20,-.5);hair(g,24,37,12,36)},{eyes:[[27,19],[33,17]]});
bake('clock',32,96,g=>{g.fillStyle='#3b2416';g.fillRect(4,4,24,90);g.fillRect(2,0,28,8);g.fillStyle='#d8cfb4';g.beginPath();g.arc(16,20,9,0,7);g.fill();g.strokeStyle='#111';g.lineWidth=1;line(g,[[16,20],[16,13]]);line(g,[[16,20],[21,22]]);
  g.fillStyle='#14100c';g.fillRect(9,36,14,46);g.fillStyle='#a8873a';g.fillRect(15,36,2,30);g.beginPath();g.arc(16,68,4,0,7);g.fill();grime(g,32,96,100,.4)});
bake('bed',64,40,g=>{g.fillStyle='#2e1d12';g.fillRect(2,14,60,26);g.fillStyle='#cfc9bb';g.fillRect(6,4,52,22);g.fillStyle='#e3ded2';g.fillRect(10,2,44,8);g.fillStyle='#3a2416';g.fillRect(2,24,60,16);grime(g,64,40,80,.3)});
bake('bed_occ',64,40,g=>{g.drawImage(TEX.bed.canvas,0,0);g.fillStyle='#bdb7a8';g.beginPath();g.ellipse(32,16,20,8,0,0,7);g.fill();g.fillStyle='#17120f';g.beginPath();g.ellipse(32,6,8,4,0,0,7);g.fill();
  g.fillStyle=SKIN;g.fillRect(46,18,3,10)});
bake('stand',32,32,g=>{g.fillStyle='#3a2416';g.fillRect(4,6,24,26);g.fillStyle='#2a190f';g.fillRect(4,6,24,2);g.fillStyle='#a8873a';g.fillRect(15,16,3,2)});
bake('key',16,16,g=>{g.fillStyle='#c9a23f';g.beginPath();g.arc(5,8,4,0,7);g.fill();g.fillRect(8,7,7,2);g.fillRect(12,9,2,3);g.fillStyle='#000';g.fillRect(4,7,2,2)},{eyes:[[5,6]]});
bake('note',32,12,g=>{g.fillStyle='#e4dcc6';g.fillRect(1,1,30,10);g.fillStyle='#6a5e4a';for(let y=3;y<10;y+=2)g.fillRect(4,y,18+srand()*8|0,1)});
bake('lamp',32,80,g=>{g.fillStyle='#7a6a4a';g.beginPath();g.moveTo(6,22);g.lineTo(26,22);g.lineTo(21,2);g.lineTo(11,2);g.fill();g.fillStyle='#2a1d12';g.fillRect(15,22,2,52);g.fillRect(9,74,14,4)});
bake('table',64,40,g=>{g.fillStyle='#5a3d26';g.fillRect(2,8,60,6);g.fillStyle='#3a2616';g.fillRect(6,14,4,26);g.fillRect(54,14,4,26);g.fillStyle='#d8d2c2';g.fillRect(20,3,8,5);g.fillStyle='#6b6b6b';g.fillRect(36,4,10,4)});

/* the face you see when it reaches you: a flash photo of a face too close to the lens, repainted each frame for jitter */
function paintScare(g,w,h,t,k){g.fillStyle='#000';g.fillRect(0,0,w,h);const j=()=>(Math.random()-.5)*k*2.5,s=h/72*(1+t*.5);
  g.save();g.translate(w/2+j(),h*.55+j());g.rotate(-.18+(Math.random()-.5)*.05);g.scale(s,s);
  const sk=g.createRadialGradient(-6,-12,3,0,0,54);sk.addColorStop(0,'#f2ecdf');sk.addColorStop(.42,'#bdb39f');sk.addColorStop(.78,'#4f483e');sk.addColorStop(1,'#080605');
  g.fillStyle=sk;g.beginPath();g.moveTo(-25,-40);g.quadraticCurveTo(0,-58,25,-40);g.quadraticCurveTo(34,0,17,42);g.quadraticCurveTo(0,60,-17,42);g.quadraticCurveTo(-34,0,-25,-40);g.fill();
  for(let i=0;i<140;i++){g.fillStyle=Math.random()<.55?`rgba(55,35,25,${Math.random()*.22})`:`rgba(235,225,205,${Math.random()*.15})`;g.fillRect((Math.random()-.5)*48,(Math.random()-.5)*84,2,2)}
  for(const [ex,ey,r] of [[-11,-14,8],[12,-12,9]]){const sg=g.createRadialGradient(ex,ey,1,ex,ey,r*1.7);sg.addColorStop(0,'#000');sg.addColorStop(.55,'#060302');sg.addColorStop(1,'rgba(25,12,6,0)');
    g.fillStyle=sg;g.beginPath();g.ellipse(ex,ey,r*1.7,r*1.35,.2,0,7);g.fill();g.fillStyle='#000';g.beginPath();g.ellipse(ex,ey+1,r*.62,r*.85,0,0,7);g.fill()}
  g.fillStyle='#fff';g.fillRect(-11+j()*.3,-14,1.3,1.3);g.fillRect(12+j()*.3,-12,1.3,1.3);
  g.fillStyle='#160e09';g.fillRect(-3,2,1.6,4);g.fillRect(2,2,1.6,4);
  g.fillStyle='#060101';g.beginPath();g.moveTo(-9,12);g.quadraticCurveTo(0,8,10,12);g.quadraticCurveTo(14,30,5,50);g.quadraticCurveTo(0,54,-5,50);g.quadraticCurveTo(-14,30,-9,12);g.fill();
  g.fillStyle='#d6cbb3';for(let i=-4;i<=4;i++)g.fillRect(i*2-.6,11+Math.abs(i)*.35,1.2,2.4+Math.random()*1.6);for(let i=-2;i<=2;i++)g.fillRect(i*2-.5,46-Math.abs(i),1,2+Math.random());
  g.strokeStyle='rgba(50,8,8,.85)';g.lineWidth=.8;line(g,[[-9,12],[-15,7],[-19,8]]);line(g,[[10,12],[16,6],[20,7]]);g.restore();
  g.strokeStyle='#040302';g.lineWidth=Math.max(1,s*1.4);for(let x=-46;x<=46;x+=3){if(Math.abs(x)<17)continue;const x0=w/2+x*s;g.beginPath();g.moveTo(x0,0);g.quadraticCurveTo(x0+(Math.random()-.5)*8,h/2,x0+(Math.random()-.5)*10,h);g.stroke()}
  const v=g.createRadialGradient(w/2,h/2,h*.25,w/2,h/2,w*.6);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.85)');g.fillStyle=v;g.fillRect(0,0,w,h);
  if(Math.random()<.3){g.fillStyle='rgba(150,0,0,.3)';g.fillRect(0,0,w,h)}if(t<.08&&k>.5){g.globalCompositeOperation='difference';g.fillStyle='#fff';g.fillRect(0,0,w,h);g.globalCompositeOperation='source-over'}}
