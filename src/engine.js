/* ---------- the house: a 26x14 grid. '.' is floor; every other character is a wall with its own texture. ----------
   Living room (west) → front door on its west wall. A one-tile hallway runs east past the bathroom, kitchen and study
   to Grandma's bedroom, which has a closet in its north corner. */
const MW=26,MH=14,MAP=[];
for(let y=0;y<MH;y++)MAP.push(new Array(MW).fill('#'));
const carve=(x0,y0,x1,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)MAP[y][x]='.'};
carve(1,4,7,11);carve(8,7,19,7);carve(10,3,12,5);MAP[6][11]='.';carve(9,9,13,12);MAP[8][11]='.';
carve(14,3,17,5);MAP[6][16]='.';carve(21,4,24,10);MAP[7][20]='.';carve(22,1,24,2);MAP[3][23]='.';
for(let x=8;x<=19;x++){if(MAP[6][x]==='#')MAP[6][x]='P';if(MAP[8][x]==='#')MAP[8][x]='P'}
[[9,6],[13,8],[18,6],[15,8]].forEach(([x,y])=>MAP[y][x]='F');
for(let y=0;y<=11;y++)for(let x=20;x<MW;x++)if(MAP[y][x]==='#')MAP[y][x]='%';
[[3,3],[5,3],[4,12],[11,13],[25,6],[25,8],[15,2],[11,2]].forEach(([x,y])=>MAP[y][x]='W');
MAP[7][0]='D';
const WALLTEX={'#':'wall',P:'panel',F:'frame','%':'rose',W:'window',D:'door'};
const cellAt=(x,y)=>x<0||y<0||x>=MW||y>=MH?'#':MAP[y][x];
const isWall=(x,y)=>cellAt(x,y)!=='.';
function floorAt(x,y){if(x>=9&&x<=13&&y>=8&&y<=12)return 'lino';if(x>=10&&x<=12&&y>=3&&y<=6)return 'lino';if(x>=20&&y<=10)return 'carpet';return 'boards'}
function roomAt(x,y){x|=0;y|=0;if(x<=7)return 'living';if(y===7&&x<=19)return 'hall';if(y<=6&&x>=10&&x<=12)return 'bath';if(y>=8&&x<=13)return 'kitchen';if(y<=6&&x>=14&&x<=17)return 'study';if(y<=3)return 'closet';return 'bedroom'}

/* ---------- movement and sight ---------- */
const blocked=(x,y,r)=>isWall(Math.floor(x-r),Math.floor(y-r))||isWall(Math.floor(x+r),Math.floor(y-r))||isWall(Math.floor(x-r),Math.floor(y+r))||isWall(Math.floor(x+r),Math.floor(y+r));
function tryMove(o,nx,ny,r){let hit=false;if(!blocked(nx,o.y,r))o.x=nx;else hit=true;if(!blocked(o.x,ny,r))o.y=ny;else hit=true;return hit}
function los(ax,ay,bx,by){const d=Math.hypot(bx-ax,by-ay),n=Math.ceil(d/.08);for(let i=1;i<n;i++){const t=i/n;if(isWall(Math.floor(ax+(bx-ax)*t),Math.floor(ay+(by-ay)*t)))return false}return true}
/* breadth-first distance from one tile to every reachable tile */
function field(tx,ty){const F=new Int16Array(MW*MH).fill(-1),q=[tx+ty*MW];F[q[0]]=0;
  for(let h=0;h<q.length;h++){const c=q[h],x=c%MW,y=(c/MW)|0;for(const [ax,ay] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+ax,ny=y+ay;if(isWall(nx,ny))continue;const k=nx+ny*MW;if(F[k]<0){F[k]=F[c]+1;q.push(k)}}}return F}
const angleTo=(from,x,y)=>{let r=Math.atan2(y-from.y,x-from.x)-from.a;while(r>Math.PI)r-=Math.PI*2;while(r<-Math.PI)r+=Math.PI*2;return r};

/* ---------- renderer ----------
   opt.flash: 0..1 strength of the camera flash (falls off fast with distance and toward the frame edges)
   opt.amb:   ambient light (your eyes adjusting to the dark), opt.moon: window glow
   opt.sprites: [{x,y,tex,h,lift,dim}]  — a sprite's drawn pixel count is written back to s.px */
const PLANE=.72;
function render(out,W,H,cam,opt){const px=cam.x,py=cam.y,dx=Math.cos(cam.a),dy=Math.sin(cam.a),plx=-dy*PLANE,ply=dx*PLANE,KS=(W/2)/PLANE,half=H/2;
  const fl=opt.flash||0,amb=opt.amb==null?.04:opt.amb,moon=opt.moon==null?1:opt.moon,gr=opt.grain||0,zb=new Float32Array(W);
  const light=(d,cx)=>{let L=amb;if(fl>0)L+=fl*(1-.42*cx*cx)*2.7/(1+.2*d*d);return L>.9?Math.min(1.12,.9+(L-.9)*.22):L};
  const put=(o,r,g,b,L)=>{const n=gr?(Math.random()-.5)*gr:0;out[o]=r*L+n;out[o+1]=g*L+n;out[o+2]=b*L*1.06+n;out[o+3]=255};
  const rdx0=dx-plx,rdy0=dy-ply,rdx1=dx+plx,rdy1=dy+ply;
  for(let y=0;y<H;y++){const fl0=y>=half,p=fl0?(y-half+.5):(half-y-.5),rd=KS*.5/p,sx=rd*(rdx1-rdx0)/W,sy=rd*(rdy1-rdy0)/W;let fx=px+rd*rdx0,fy=py+rd*rdy0;
    for(let x=0;x<W;x++){const tx=Math.floor(fx),ty=Math.floor(fy),T=TEX[fl0?floorAt(tx,ty):'ceil'],u=((fx-tx)*64)|0,v=((fy-ty)*64)|0,i=((v&63)*64+(u&63))*4;
      put((y*W+x)*4,T.d[i],T.d[i+1],T.d[i+2],light(rd,2*x/W-1)*(fl0?1:.7));fx+=sx;fy+=sy}}
  for(let x=0;x<W;x++){const cx=2*x/W-1,rx=dx+plx*cx,ry=dy+ply*cx;let mx=Math.floor(px),my=Math.floor(py);const ddx=Math.abs(1/rx),ddy=Math.abs(1/ry);let stx,sty,sdx,sdy,side=0,c='#';
    if(rx<0){stx=-1;sdx=(px-mx)*ddx}else{stx=1;sdx=(mx+1-px)*ddx}if(ry<0){sty=-1;sdy=(py-my)*ddy}else{sty=1;sdy=(my+1-py)*ddy}
    for(let n=0;n<80;n++){if(sdx<sdy){sdx+=ddx;mx+=stx;side=0}else{sdy+=ddy;my+=sty;side=1}if(isWall(mx,my)){c=cellAt(mx,my);break}}
    const pd=Math.max(.05,side===0?(mx-px+(1-stx)/2)/rx:(my-py+(1-sty)/2)/ry);zb[x]=pd;
    const lh=KS/pd,y0=half-lh/2;let wx=side===0?py+pd*ry:px+pd*rx;wx-=Math.floor(wx);let tu=(wx*64)|0;if(side===0&&rx>0)tu=63-tu;if(side===1&&ry<0)tu=63-tu;
    const T=TEX[WALLTEX[c]]||TEX.wall,L=light(pd,cx)*(side?.8:1);
    for(let y=Math.max(0,Math.floor(y0));y<=Math.min(H-1,Math.floor(y0+lh));y++){const tv=Math.min(63,((y-y0)/lh*64)|0),k=tv*64+tu,i=k*4;put((y*W+x)*4,T.d[i],T.d[i+1],T.d[i+2],L+(T.em?T.em[k]*moon:0))}}
  const inv=1/(plx*dy-dx*ply),sps=(opt.sprites||[]).map(s=>{const rx=s.x-px,ry=s.y-py;return{s,tX:inv*(dy*rx-dx*ry),tY:inv*(-ply*rx+plx*ry)}}).sort((a,b)=>b.tY-a.tY);
  for(const {s,tX,tY} of sps){s.px=0;if(tY<=.12)continue;const T=TEX[s.tex],sh=KS*s.h/tY,sw=sh*T.w/T.h*(s.wm||1),sxs=(W/2)*(1+tX/tY),bottom=half+KS*(.5-(s.lift||0))/tY,top=bottom-sh,left=sxs-sw/2;
    const x0=Math.max(0,Math.floor(left)),x1=Math.min(W-1,Math.floor(left+sw)),ya=Math.max(0,Math.floor(top)),yb=Math.min(H-1,Math.floor(bottom));
    for(let x=x0;x<=x1;x++){if(tY>=zb[x])continue;const tu=Math.min(T.w-1,((x-left)/sw*T.w)|0),L=light(tY,2*x/W-1)*(s.dim||1)+(s.add||0);
      for(let y=ya;y<=yb;y++){const tv=Math.min(T.h-1,((y-top)/sh*T.h)|0),i=(tv*T.w+tu)*4;if(T.d[i+3]<128)continue;put((y*W+x)*4,T.d[i],T.d[i+1],T.d[i+2],L);s.px++}}
    if(T.eyes){const ev=fl>0?Math.min(255,255*fl*1.5):(opt.eyeDark||0);if(ev>0){const sz=Math.max(1,Math.round(sh/70));
      for(const [ex,ey] of T.eyes){const xi=Math.floor(left+(ex+.5)/T.w*sw),yi=Math.floor(top+(ey+.5)/T.h*sh);if(xi<0||xi>=W||yi<0||yi>=H||tY>=zb[xi])continue;
        for(let a=0;a<sz;a++)for(let b=0;b<sz;b++){const X=xi+a,Y=yi+b;if(X<W&&Y<H){const o=(Y*W+X)*4;out[o]=ev;out[o+1]=ev;out[o+2]=ev*.9;s.px++}}}}}}
  return zb}
