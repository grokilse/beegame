(()=>{
try{if(window.self!==window.top)document.documentElement.classList.add("framed")}catch(e){document.documentElement.classList.add("framed")}
const $=s=>document.querySelector(s);
const params=new URLSearchParams(location.search);
let quiz,i=0,score=0,health=60;
const HIT=15,MISS=20;
const NS="http://www.w3.org/2000/svg",fl=$("#flowers");
const flowers=[];
[[30,232,"#ff6f91"],[80,240,"#fff"],[130,250,"#b388ff"],[270,245,"#ff6f91"],[320,236,"#fff"],[370,242,"#ffab40"],[175,262,"#ffab40"],[230,265,"#b388ff"]].forEach(([x,y,c])=>{
 const g=document.createElementNS(NS,"g");g.setAttribute("class","flower");
 let p=`<path d="M${x} ${y}v-28" stroke="#3d8b37" stroke-width="3"/>`;
 for(let k=0;k<5;k++){const a=k*72*Math.PI/180;p+=`<circle cx="${x+Math.cos(a)*7}" cy="${y-30+Math.sin(a)*7}" r="6" fill="${c}"/>`}
 g.innerHTML=p+`<circle cx="${x}" cy="${y-30}" r="5" fill="#ffd54f"/>`;fl.appendChild(g);flowers.push(g)});
function render(){
 $("#hfill").style.width=health+"%";$("#hfill").style.background=`hsl(${Math.round(health*1.2)} 80% 55%)`;
 const sick=health<40,B=document.body.style;document.body.classList.toggle("sick",sick);document.body.classList.toggle("strong",health>=80);
 B.setProperty("--flap",(0.06+(100-health)/100*0.5).toFixed(2)+"s");
 B.setProperty("--sat",Math.min(1.3,0.15+health/100*1.15).toFixed(2));B.setProperty("--bri",(0.85+health/100*0.25).toFixed(2));
 $("#mouth").setAttribute("d",health>=70?"M28-3q7 10 14 0":health>=40?"M28 0h14":"M28 2q7-8 14 0");
 const sc=(0.8+health/100*0.35).toFixed(2);
 $("#bee").setAttribute("transform",`translate(200 ${140+Math.round((100-health)*0.6)-20}) scale(${sc})`);
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
function ask(){
 const q=quiz.questions[i];$("#qnum").textContent=`${i+1}/${quiz.questions.length}`;
 $("#question").textContent=q.q;$("#feedback").classList.add("hidden");
 const box=$("#choices");box.innerHTML="";
 q.choices.forEach((c,k)=>{const b=document.createElement("button");b.className="choice";
  b.innerHTML=`<b>${"ABCD"[k]}</b><span></span>`;b.querySelector("span").textContent=c;
  b.onclick=()=>pick(k);box.appendChild(b)});
 show("quiz");$("#quiz").style.animation="none";void $("#quiz").offsetWidth;$("#quiz").style.animation="";
}
function pick(k){
 const q=quiz.questions[i],ok=k===q.answer,bs=[...document.querySelectorAll(".choice")];
 bs.forEach(b=>b.disabled=true);bs[q.answer].classList.add("right");if(!ok)bs[k].classList.add("wrong");
 if(ok){score++;health=Math.min(100,health+HIT);pulse("cheer");flowers.forEach(f=>{f.classList.remove("bloom");void f.offsetWidth;f.classList.add("bloom")})}
 else{health=Math.max(5,health-MISS);pulse("oops")}
 $("#verdict").textContent=ok?["🎉 Correct! Your bee is buzzing!","🌼 Yes! She perks right up!","✅ Nailed it!"][i%3]:"😢 Oops! Your bee is drooping…";
 $("#fact").textContent=q.fact;$("#next").textContent=i+1<quiz.questions.length?"Next ➜":"See results";
 $("#feedback").classList.remove("hidden");render();$("#feedback").scrollIntoView({behavior:"smooth",block:"nearest"});
}
function end(){
 const n=quiz.questions.length;
 const [t,m]=health>=75?["🌻 Your bee is thriving!","Amazing! The hive is happy and the meadow is in full bloom."]:health>=45?["🙂 Your bee is doing okay","Not bad! A little more bee knowledge and she'll be thriving."]:["🥀 Your bee needs help!","She's feeling droopy. Watch a few Stevie Bee Shorts and try again!"];
 $("#endTitle").textContent=t;$("#score").textContent=`${score} / ${n}`;$("#endMsg").textContent=m;$("#qnum").textContent="";
 const dead=score===0,buff=score===n,bm=$("#bigMsg");
 document.body.classList.toggle("dead",dead);document.body.classList.toggle("buff",buff);
 ["xeyes","legs","halo"].forEach(x=>$("#"+x).classList.toggle("hidden",!dead));$("#eyes").classList.toggle("hidden",dead);
 ["arms","speed","sparkles"].forEach(x=>$("#"+x).classList.toggle("hidden",!buff));
 if(dead){$("#endTitle").textContent="💀 Oh no!";bm.textContent="Try again to save the bee!";$("#endMsg").textContent="Our bee ran out of buzz… but bees are tough. One more try?";$("#mouth").setAttribute("d","M28 0q7 6 14 0");$("#bee").setAttribute("transform","translate(200 200) rotate(180) scale(.85)")}
 if(buff){$("#endTitle").textContent="💪 BUFF BEE!";bm.textContent="Perfect score!";$("#endMsg").textContent="Every answer right! Your bee is pumped up and zooming around the meadow!"}
 bm.classList.toggle("hidden",!(dead||buff));
 show("end");if(health>=75&&!buff)pulse("cheer");
}
const shareUrl=()=>location.origin+location.pathname+(quiz?`?quiz=${quiz.id}`:"");
const shareText=()=>`I scored ${score}/${quiz.questions.length} on the Stevie Bee quiz! Can you keep the bee healthy? 🐝`;
async function copy(){try{await navigator.clipboard.writeText(shareUrl())}catch(e){const t=document.createElement("textarea");t.value=shareUrl();document.body.appendChild(t);t.select();document.execCommand("copy");t.remove()}
 $("#copied").classList.remove("hidden");setTimeout(()=>$("#copied").classList.add("hidden"),2000)}
$("#share").onclick=async()=>{if(navigator.share){try{await navigator.share({title:"Save the Bee!",text:shareText(),url:shareUrl()})}catch(e){}}else copy()};
$("#copy").onclick=copy;
$("#go").onclick=()=>{reset();i=0;score=0;health=60;render();ask()};
$("#next").onclick=()=>{i++;i<quiz.questions.length?ask():end()};
$("#again").onclick=()=>{reset();health=60;render();show("start")};
function reset(){document.body.classList.remove("dead","buff","cheer","oops");["xeyes","legs","halo","arms","speed","sparkles"].forEach(x=>$("#"+x).classList.add("hidden"));$("#eyes").classList.remove("hidden")}
load();
})();
