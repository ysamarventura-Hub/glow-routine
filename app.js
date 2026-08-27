const defaults=[{id:1,name:"Gentle Cleanser",cat:"Cleanser"},{id:2,name:"Hydrating Serum",cat:"Serum"},{id:3,name:"Daily Moisturizer",cat:"Moisturizer"},{id:4,name:"SPF 50",cat:"Sunscreen"}];

let products=JSON.parse(localStorage.glowProducts||"null")||defaults,
used=JSON.parse(localStorage.glowUsed||"[]"),
streak=+localStorage.glowStreak||0,
kind="morning",
selected=new Set();

const $=id=>document.getElementById(id);

$("date").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
$("streak").textContent=streak;

function save(){
  localStorage.glowProducts=JSON.stringify(products);
  localStorage.glowUsed=JSON.stringify(used);
  localStorage.glowStreak=streak;
}

function esc(s){
  return String(s).replace(/[&<>"']/g,c=>({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  }[c]));
}

function render(){
  let g=$("products");

  g.innerHTML=products.map(p=>`
    <article class="product">
      <div>
        <div class="dot">✦</div>
        <h3>${esc(p.name)}</h3>
        <small>${esc(p.cat)}</small>
      </div>
      <button class="use ${used.some(x=>x.id===p.id)?"selected":""}" onclick="toggleUse(${p.id})">
        ${used.some(x=>x.id===p.id)?"Used today":"Use today"}
      </button>
    </article>
  `).join("");

  $("used").innerHTML=used.length
    ? used.slice(0,8).map(x=>`
        <div>
          <strong>${esc(x.name)}</strong>
          <span>${esc(x.cat)} · ${esc(x.time)}</span>
        </div>
      `).join("")
    : `<div><span>No products recorded yet.</span><span>Tap a product above</span></div>`;
}

function toggleUse(id){
  let p=products.find(x=>x.id===id),
      i=used.findIndex(x=>x.id===id);

  if(i>=0){
    used.splice(i,1);
  }else{
    used.unshift({
      ...p,
      time:new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})
    });
  }

  save();
  render();
  toast(i>=0?"Removed from today’s routine":p.name+" added");
}

function openRoutine(k){
  kind=k;
  selected=new Set(used.map(x=>x.id));

  $("routineType").textContent=k==="morning"?"MORNING":"NIGHT";
  $("routineTitle").textContent=k==="morning"
    ?"Choose what you used this morning"
    :"Choose what you used tonight";

  $("choices").innerHTML=products.map(p=>`
    <label class="choice ${selected.has(p.id)?"selected":""}">
      <span>${esc(p.name)}<br><small>${esc(p.cat)}</small></span>
      <input type="checkbox"
        ${selected.has(p.id)?"checked":""}
        onchange="pick(${p.id},this.checked,this.parentElement)">
    </label>
  `).join("");

  $("routineModal").classList.remove("hidden");
}

function pick(id,on,el){
  on?selected.add(id):selected.delete(id);
  el.classList.toggle("selected",on);
}

function saveRoutine(){
  let now=new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});

  used=products
    .filter(p=>selected.has(p.id))
    .map(p=>({...p,time:now}));

  streak++;
  $("streak").textContent=streak;

  save();
  render();
  closeModal("routineModal");

  toast((kind==="morning"?"Morning":"Night")+" routine saved ✦");
}

function openAdd(){
  $("addModal").classList.remove("hidden");
}

function addProduct(){
  let name=$("newName").value.trim();

  if(!name)return toast("Add a product name first");

  products.push({
    id:Date.now(),
    name,
    cat:$("newCategory").value
  });

  $("newName").value="";
  save();
  render();
  closeModal("addModal");
  toast("Added to your shelf");
}

function closeModal(id){
  $(id).classList.add("hidden");
}

function toast(m){
  let t=$("toast");
  t.textContent=m;
  t.classList.add("show");
  clearTimeout(window.tt);
  window.tt=setTimeout(()=>t.classList.remove("show"),1800);
}

function scrollToTop(){
  window.scrollTo({top:0,behavior:"smooth"});
}

render();
