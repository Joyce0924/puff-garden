import Matter from 'matter-js';
import './style.css';
const {Engine,Bodies,Body,Composite}=Matter;
const W=360,H=520, cx=W/2,cy=H/2,step=1000/120;
const engine=Engine.create({gravity:{x:0,y:0},positionIterations:16,velocityIterations:12});
const settings={size:38,bounce:.45,friction:.055,cohesion:.65,interval:280,speed:1,amount:6};
const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d');
const colors=['#f1b8a5','#edcd77','#adc8ad','#b9bce0','#edacbb','#95c8c8','#d4b295','#c4d789','#a6c0dc','#d7b8da'];
let items=[],queue=0,ticks=0,waiting=0,serial=0,elapsed=0,nextSpawn=0;
const radius=b=>b.circleRadius;
function add(x,y,r,target=r){const b=Bodies.polygon(x,y,40,r,{restitution:settings.bounce,friction:.08,frictionAir:settings.friction,density:.002});b.circleRadius=r;b.plugin={target,color:colors[serial++%colors.length],phase:Math.random()*6,age:target===r?10000:0,start:r};items.push(b);Composite.add(engine.world,b);return b;}
function reset(){Composite.clear(engine.world,false);items=[];queue=0;ticks=0;waiting=0;serial=0;elapsed=0;nextSpawn=0;const t=80;Composite.add(engine.world,[Bodies.rectangle(W/2,-t/2,W+160,t,{isStatic:true}),Bodies.rectangle(W/2,H+t/2,W+160,t,{isStatic:true}),Bodies.rectangle(-t/2,H/2,t,H,{isStatic:true}),Bodies.rectangle(W+t/2,H/2,t,H,{isStatic:true})]);for(let i=0;i<10;i++){const a=i*Math.PI*2/10;add(cx+Math.cos(a)*Math.max(66,settings.size*1.65),cy+Math.sin(a)*Math.max(66,settings.size*1.65),settings.size/2);}message('从中心出发，轻轻挤一挤。');update();}
function message(s){document.querySelector('#hint').textContent=s;}
function update(){document.querySelector('#count').textContent=`${items.length} 位小居民`;document.querySelector('#spawn').disabled=queue>0||items.some(b=>radius(b)<b.plugin.target-.01);}
function available(){return Math.max(0,Math.min(44,Math.floor(Math.PI*138**2*.60/(Math.PI*(settings.size/2)**2)))-items.length);}
document.querySelector('#spawn').onclick=()=>{queue=Math.min(available(),settings.amount||2+Math.floor(Math.random()*3));waiting=0;message(queue?'小居民正在从中心冒出来…':'小岛有点拥挤啦，重置后再试试。');update();};
document.querySelector('#reset').onclick=reset;
for(const [key,title,min,max,inc] of [['size','碰撞半径',24,48,2],['bounce','碰撞弹性',.1,.8,.05],['cohesion','聚拢力度',.2,1.2,.05],['interval','生成间隔',140,700,20],['speed','动画速度',.5,1.5,.1]]){const label=document.createElement('label');const display=v=>key==='size'?`${v/2}px`:key==='interval'?`${v}ms`:key==='speed'?`${v}×`:v;label.innerHTML=`<span>${title}</span><input aria-label="${title}" type="range" min="${min}" max="${max}" step="${inc}" value="${settings[key]}"><output>${display(settings[key])}</output>`;label.querySelector('input').oninput=e=>{const v=+e.target.value;settings[key]=v;label.querySelector('output').textContent=display(v);if(key==='size')reset();else items.forEach(b=>b.restitution=settings.bounce);};document.querySelector('#controls').append(label);}
function physics(){
 ticks++;elapsed+=step;
 // A soft central potential holds a compact pile. All translation comes from forces and contacts.
 for(const b of items){const dx=cx-b.position.x,dy=cy-b.position.y,d=Math.hypot(dx,dy);const k=.00000065*settings.cohesion*(d>138?3:1);Body.applyForce(b,b.position,{x:dx*b.mass*k,y:dy*b.mass*k});
 b.plugin.age+=step;
 if(radius(b)<b.plugin.target){const next=Math.min(b.plugin.target,radius(b)+.26);Body.scale(b,next/radius(b),next/radius(b));}
 const speed=Math.hypot(b.velocity.x,b.velocity.y);if(speed>3)Body.setVelocity(b,{x:b.velocity.x*3/speed,y:b.velocity.y*3/speed});
 Body.setAngularVelocity(b,Math.max(-.035,Math.min(.035,b.angularVelocity))*.985);
 }
 if(queue&&elapsed>=nextSpawn){
 waiting++;
 // Locate an actually empty seed pocket in the central 36px disk, never insert overlapping bodies.
 const candidates=[{x:cx,y:cy}];for(let ring=1;ring<=3;ring++)for(let i=0;i<12;i++){const a=i*Math.PI/6+serial*2.399; candidates.push({x:cx+Math.cos(a)*ring*12,y:cy+Math.sin(a)*ring*12});}
 const spot=candidates.find(p=>items.every(b=>Math.hypot(b.position.x-p.x,b.position.y-p.y)>radius(b)+6));
 if(spot){const b=add(spot.x,spot.y,4,settings.size/2);Body.setAngularVelocity(b,(serial%2?1:-1)*.018);queue--;nextSpawn=elapsed+settings.interval;waiting=0;}
 else {for(const b of items){let dx=b.position.x-cx,dy=b.position.y-cy,d=Math.hypot(dx,dy);if(d<settings.size*1.6){if(d<.1){dx=Math.cos(b.id);dy=Math.sin(b.id);d=1;}Body.applyForce(b,b.position,{x:dx/d*b.mass*.00038,y:dy/d*b.mass*.00038});}}
 if(waiting>300){queue=0;message('中心已经很拥挤，重置后继续试试。');}}
 }
 Engine.update(engine,step);
 if(ticks%12===0){update();if(!queue&&!items.some(b=>radius(b)<b.plugin.target-.01))message(available()?'轻轻挤开，再慢慢聚拢。':'小岛住满啦，重置后再试试。');}
}
function draw(){const dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(W*dpr)){canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);ctx.fillStyle='#dce2d2';for(let x=16;x<W;x+=24)for(let y=16;y<H;y+=24){ctx.beginPath();ctx.arc(x,y,.8,0,7);ctx.fill();}ctx.strokeStyle='#d5ddc9';ctx.setLineDash([3,6]);ctx.beginPath();ctx.arc(cx,cy,38,0,7);ctx.stroke();ctx.setLineDash([]);for(const b of items){const age=b.plugin.age;const pulse=age<650?1-.10*Math.exp(-age/220)*Math.cos(age/65):1;const r=radius(b)*.94*pulse;ctx.save();ctx.translate(b.position.x,b.position.y);ctx.rotate(b.angle);ctx.shadowColor='#60745b20';ctx.shadowBlur=8;ctx.shadowOffsetY=4;ctx.fillStyle=b.plugin.color;ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();ctx.shadowColor='transparent';ctx.strokeStyle='#ffffff80';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='#ffffff60';ctx.beginPath();ctx.ellipse(-r*.3,-r*.45,r*.25,r*.12,-.5,0,7);ctx.fill();ctx.fillStyle='#405346';for(const x of [-.27,.27]){ctx.beginPath();ctx.ellipse(x*r,-r*.04,r*.055,r*.085,0,0,7);ctx.fill();}ctx.strokeStyle='#405346';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,r*.12,r*.12,.1,Math.PI-.1);ctx.stroke();ctx.fillStyle='#db817b65';for(const x of [-.47,.47]){ctx.beginPath();ctx.ellipse(x*r,r*.16,r*.13,r*.07,0,0,7);ctx.fill();}ctx.restore();}}
let last=performance.now(),acc=0;function frame(now){acc+=Math.min(now-last,50)*settings.speed;last=now;while(acc>=step){physics();acc-=step;}draw();requestAnimationFrame(frame);}document.addEventListener('visibilitychange',()=>{last=performance.now();acc=0;});reset();requestAnimationFrame(frame);
