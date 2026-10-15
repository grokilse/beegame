(()=>{
try{if(window.self!==window.top)document.documentElement.classList.add("framed")}catch(e){document.documentElement.classList.add("framed")}
const $=s=>document.querySelector(s);
const params=new URLSearchParams(location.search);
let quiz,i=0,score=0,health=60,points=0,run=0,shield=false,tStart=0,tInt=0;const TLIM=15;
const HIT=15,MISS=20;
const NS="http://www.w3.org/2000/svg",fl=$("#flowers");
const flowers=[];
[[30,232,"#ff6f91"],[80,240,"#fff"],[130,250,"#b388ff"],[270,245,"#ff6f91"],[320,236,"#fff"],[370,242,"#ffab40"],[175,262,"#ffab40"],[230,265,"#b388ff"]].forEach(([x,y,c])=>{
 const g=document.createElementNS(NS,"g");g.setAttribute("class","flower");
 let p=`<path d="M${x} ${y}v-28" stroke="#3d8b37" stroke-width="3"/>`;
 for(let k=0;k<5;k++){const a=k*72*Math.PI/180;p+=`<circle cx="${x+Math.cos(a)*7}" cy="${y-30+Math.sin(a)*7}" r="6" fill="${c}"/>`}
 g.innerHTML=p+`<circle cx="${x}" cy="${y-30}" r="5" fill="#ffd54f"/>`;fl.appendChild(g);flowers.push(g)});
const bee={x:200,y:140,face:1,sc:1,droop:0,flying:false,t:0,raf:0};
function placeBee(){const y=bee.flying?bee.y:140+bee.droop;$("#bee").setAttribute("transform",`translate(${bee.x.toFixed(1)} ${(bee.flying?bee.y:y).toFixed(1)}) scale(${(bee.sc*bee.face).toFixed(3)} ${bee.sc.toFixed(3)})`)}
function wander(){cancelAnimationFrame(bee.raf);bee.flying=true;let last=performance.now();
 const step=now=>{const dt=Math.min(50,now-last)/1000;last=now;bee.t+=dt*0.55;const t=bee.t;
  const nx=200+130*Math.sin(t)*Math.cos(t*0.37), ny=125+45*Math.sin(t*1.7+1)+bee.droop*0.5;
  if(Math.abs(nx-bee.x)>0.05)bee.face=nx>bee.x?1:-1;bee.x=nx;bee.y=ny;placeBee();bee.raf=requestAnimationFrame(step)};
 bee.raf=requestAnimationFrame(step)}
function flyCenter(ms){cancelAnimationFrame(bee.raf);return new Promise(res=>{const x0=bee.x,y0=bee.y,x1=170,y1=135,s=performance.now();
 const step=now=>{const k=Math.min(1,(now-s)/ms),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;bee.x=x0+(x1-x0)*e;bee.y=y0+(y1-y0)*e;
  bee.face=x1>=x0?1:-1;if(k>=1)bee.face=1;placeBee();k<1?bee.raf=requestAnimationFrame(step):res()};bee.raf=requestAnimationFrame(step)})}
let actx,bufs={},soundOn=localStorage.getItem("beeSound")!=="off";
function snd(){$("#snd").textContent=soundOn?"🔊":"🔇"}
async function unlock(){if(actx){actx.resume();return}try{actx=new (window.AudioContext||window.webkitAudioContext)();actx.resume();
 for(const n of["woohoo","aww"]){fetch(`sounds/${n}.mp3`).then(r=>r.arrayBuffer()).then(b=>actx.decodeAudioData(b)).then(d=>bufs[n]=d).catch(()=>{})}loadNar()}catch(e){}}
let cur=null;function stopSnd(){if(cur){try{cur.stop()}catch(e){}cur=null}}
function play(n){stopSnd();if(!soundOn||!actx||!bufs[n])return 0;const s=actx.createBufferSource();s.buffer=bufs[n];s.connect(actx.destination);s.start();cur=s;return bufs[n].duration}
function loadNar(){if(!actx||!quiz)return;quiz.questions.forEach((_,n)=>{const key="q"+n;if(bufs[key])return;
 fetch(`sounds/quizzes/${quiz.id}/q${n+1}.mp3`).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(b=>actx.decodeAudioData(b)).then(d=>bufs[key]=d).catch(()=>{})})}
function render(){
 $("#hfill").style.width=health+"%";$("#hfill").style.background=`hsl(${Math.round(health*1.2)} 80% 55%)`;
 const sick=health<40,B=document.body.style;document.body.classList.toggle("sick",sick);document.body.classList.toggle("strong",health>=80);
 B.setProperty("--flap",(0.06+(100-health)/100*0.5).toFixed(2)+"s");
 B.setProperty("--sat",Math.min(1.3,0.15+health/100*1.15).toFixed(2));B.setProperty("--bri",(0.85+health/100*0.25).toFixed(2));
 $("#mouth").setAttribute("d",health>=70?"M28-3q7 10 14 0":health>=40?"M28 0h14":"M28 2q7-8 14 0");
 const sc=(0.8+health/100*0.35).toFixed(2);
 bee.sc=+sc;bee.droop=Math.round((100-health)*0.6)-20;if(!bee.flying)placeBee();
 const alive=Math.round(health/100*flowers.length);
 flowers.forEach((f,k)=>f.classList.toggle("wilt",k>=alive));
}
function pulse(c){document.body.classList.remove("cheer","oops");void document.body.offsetWidth;document.body.classList.add(c)}
function show(id){["start","quiz","end"].forEach(s=>$("#"+s).classList.toggle("hidden",s!==id))}
async function load(){
 try{
  const idx=await (await fetch("quizzes/index.json")).json();
  let id=params.get("quiz")||idx.default;
  if(!/^[a-z0-9-]+$/i.test(id))id=idx.default;
  let r=await fetch(`quizzes/${id}.json`);
  if(!r.ok)r=await fetch(`quizzes/${idx.default}.json`);
  quiz=await r.json();
  $("#qtitle").textContent=quiz.title;$("#go").disabled=false;
 }catch(e){$("#qtitle").textContent="Couldn't load the quiz. Please refresh."}
 render();
}
function ask(){bee.picked=false;
 const q=quiz.questions[i];$("#qnum").textContent=`${i+1}/${quiz.questions.length}`;
 $("#question").textContent=q.q;$("#feedback").classList.add("hidden");
 const box=$("#choices");box.innerHTML="";
 q.choices.forEach((c,k)=>{const b=document.createElement("button");b.className="choice";
  b.innerHTML=`<b>${"ABCD"[k]}</b><span></span>`;b.querySelector("span").textContent=c;
  b.onclick=()=>pick(k);box.appendChild(b)});
 bee.x=200;wander();show("quiz");upMeta();$("#quiz").style.animation="none";void $("#quiz").offsetWidth;$("#quiz").style.animation="";clearInterval(tInt);clearTimeout(bee.narT);$("#tfill").style.width="100%";$("#tsec").textContent="🔈";
 const nd=play("q"+i);tStart=performance.now()+nd*1000;bee.narT=setTimeout(()=>{tStart=performance.now();runTimer()},nd*1000);
}
function runTimer(){clearInterval(tInt);
 tInt=setInterval(()=>{const left=Math.max(0,TLIM-(performance.now()-tStart)/1000);$("#tfill").style.width=left/TLIM*100+"%";$("#tsec").textContent=Math.ceil(left)+"s";
  if(left<=0){clearInterval(tInt);pick(-1)}},200);
}
function upMeta(){$("#pts").textContent=`⭐ ${points} pts`;$("#streak").textContent=shield?"🛡️ Honey shield!":run?`🔥 ${run} in a row`:""}
function pick(k){clearInterval(tInt);clearTimeout(bee.narT);if(bee.picked)return;bee.picked=true;stopSnd();
 const used=Math.max(0,(performance.now()-tStart)/1000),q=quiz.questions[i],ok=k===q.answer,bs=[...document.querySelectorAll(".choice")];
 bs.forEach(b=>b.disabled=true);bs[q.answer].classList.add("right");if(!ok&&k>=0)bs[k].classList.add("wrong");
 if(ok){points+=100+Math.round(Math.max(0,TLIM-used)/TLIM*100)}bee.timeout=k<0;
 bee.busy=true;flyCenter(650).then(()=>{bee.flying=false;bee.x=170;const d=play(ok?"woohoo":"aww");setTimeout(()=>result(q,ok),Math.min(900,(d||0.3)*1000*0.7))});
}
function result(q,ok){
 if(ok){score++;health=Math.min(100,health+HIT);pulse("cheer");flowers.forEach(f=>{f.classList.remove("bloom");void f.offsetWidth;f.classList.add("bloom")})}
 if(ok){run++;if(run>=3&&!shield){shield=true;run=0;bee.newShield=true}}
 else{run=0;if(shield){shield=false;bee.blocked=true}else health=Math.max(5,health-MISS);pulse("oops")}
 $("#shield").classList.toggle("hidden",!shield);upMeta();
 $("#verdict").textContent=ok?["🎉 Correct! Your bee is buzzing!","🌼 Yes! She perks right up!","✅ Nailed it!"][i%3]:(bee.blocked?"🛡️ Honey shield blocked it! No health lost.":(bee.timeout?"⏰ Time’s up! ":"😢 Oops! ")+"Your bee is drooping…");if(bee.newShield)$("#verdict").textContent+=" 🛡️ 3 in a row: honey shield earned!";bee.blocked=bee.newShield=false;
 $("#fact").textContent=q.fact;$("#next").textContent=i+1<quiz.questions.length?"Next ➜":"See results";
 $("#feedback").classList.remove("hidden");render();$("#feedback").scrollIntoView({behavior:"smooth",block:"nearest"});
}
function end(){cancelAnimationFrame(bee.raf);bee.flying=false;bee.x=200;placeBee();
 const n=quiz.questions.length;
 const [t,m]=health>=75?["🌻 Your bee is thriving!","Amazing! The hive is happy and the meadow is in full bloom."]:health>=45?["🙂 Your bee is doing okay","Not bad! A little more bee knowledge and she'll be thriving."]:["🥀 Your bee needs help!","She's feeling droopy. Watch a few Stevie Bee Shorts and try again!"];
 $("#endTitle").textContent=t;$("#score").textContent=`${score} / ${n}`;$("#endMsg").textContent=m;$("#qnum").textContent="";
 const dead=score===0,buff=score===n,bm=$("#bigMsg");
 document.body.classList.toggle("dead",dead);document.body.classList.toggle("buff",buff);
 ["xeyes","legs","halo"].forEach(x=>$("#"+x).classList.toggle("hidden",!dead));$("#eyes").classList.toggle("hidden",dead);
 ["arms","speed","sparkles"].forEach(x=>$("#"+x).classList.toggle("hidden",!buff));
 if(dead){$("#endTitle").textContent="💀 Oh no!";bm.textContent="Try again to save the bee!";$("#endMsg").textContent="Our bee ran out of buzz… but bees are tough. One more try?";$("#mouth").setAttribute("d","M28 0q7 6 14 0");$("#bee").setAttribute("transform","translate(200 200) rotate(180) scale(.85)")}
 if(buff){$("#endTitle").textContent="💪 BUFF BEE!";bm.textContent="Perfect score!";$("#endMsg").textContent="Every answer right! Your bee is pumped up and zooming around the meadow!"}
 bm.classList.toggle("hidden",!(dead||buff));$("#shield").classList.add("hidden");
 $("#pointsEnd").textContent=`⭐ ${points} points`;
 const bk="beeBest:"+quiz.id,best=+localStorage.getItem(bk)||0;if(points>best)localStorage.setItem(bk,points);
 $("#best").textContent=points>best&&best?`🏆 New personal best! (old: ${best})`:points>best?"🏆 Personal best set!":`🏆 Personal best: ${best}`;
 const dy=$("#days");dy.classList.add("hidden");
 if(score*2>=n){const today=new Date().toLocaleDateString("en-CA"),y=new Date(Date.now()-864e5).toLocaleDateString("en-CA");
  let s={};try{s=JSON.parse(localStorage.getItem("beeDays"))||{}}catch(e){}
  if(s.last!==today){s.n=s.last===y?(s.n||0)+1:1;s.last=today;localStorage.setItem("beeDays",JSON.stringify(s))}
  dy.textContent=`🐝 Your bee survived ${s.n} day${s.n>1?"s":""} in a row!`;dy.classList.remove("hidden")}
 show("end");if(health>=75&&!buff)pulse("cheer");
}
const shareUrl=()=>location.origin+location.pathname+(quiz?`?quiz=${quiz.id}`:"");
const shareText=()=>`I scored ${score}/${quiz.questions.length} on the Stevie Bee quiz! Can you keep the bee healthy? 🐝`;
async function copy(){try{await navigator.clipboard.writeText(shareUrl())}catch(e){const t=document.createElement("textarea");t.value=shareUrl();document.body.appendChild(t);t.select();document.execCommand("copy");t.remove()}
 $("#copied").classList.remove("hidden");setTimeout(()=>$("#copied").classList.add("hidden"),2000)}
$("#share").onclick=async()=>{if(navigator.share){try{await navigator.share({title:"Save the Bee!",text:shareText(),url:shareUrl()})}catch(e){}}else copy()};
$("#copy").onclick=copy;snd();$("#snd").onclick=()=>{soundOn=!soundOn;localStorage.setItem("beeSound",soundOn?"on":"off");snd();if(soundOn)unlock();else stopSnd()};
$("#go").onclick=()=>{unlock();loadNar();reset();points=0;run=0;shield=false;i=0;score=0;health=60;render();ask()};
$("#next").onclick=()=>{i++;i<quiz.questions.length?ask():end()};
$("#again").onclick=()=>{reset();clearInterval(tInt);clearTimeout(bee.narT);stopSnd();health=60;render();show("start")};
function reset(){document.body.classList.remove("dead","buff","cheer","oops");["xeyes","legs","halo","arms","speed","sparkles"].forEach(x=>$("#"+x).classList.add("hidden"));$("#eyes").classList.remove("hidden")}
load();
})();
