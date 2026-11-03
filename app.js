import {firebaseConfig} from "./firebase-config.js";
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut,GoogleAuthProvider,signInWithPopup,sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,collection,doc,onSnapshot,setDoc,updateDoc,deleteDoc,addDoc,writeBatch} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const auth=getAuth(initializeApp(firebaseConfig)),db=getFirestore(auth.app);
const DEF=[["A. Sebelum & semasa sesi",["Membuka kelas dan memastikan keadaan bersih serta selamat","Menyambut kehadiran murid","Membantu guru dalam aktiviti PdP"]],["B. Hidangan",["Menyediakan sarapan dan minuman mengikut menu","Menyediakan kudapan mengikut menu"]],["C. Pembersihan & penutup",["Membersihkan kelas","Membersihkan tandas","Memastikan suis elektrik ditutup"]]];
let U=null,P={nama:"",kelas:"",sekolah:"Nama Sekolah"},T=[],R={},tab="dash",cur=today(),draft=null,un=[];
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function today(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
const fmt=d=>new Date(d+"T00:00").toLocaleDateString("ms-MY",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
function toast(m){const t=$("#toast");t.textContent=m;t.style.display="block";clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display="none",2200)}
const ud=()=>doc(db,"users",U.uid);
function prog(r){let a=0,n=0;T.forEach(t=>{const v=(r.items||{})[t.id];if(v==="s")a++;else if(v==="n")n++});const x=T.length-n;return x?Math.round(a/x*100):0}
const groups=()=>{const g={};T.forEach(t=>(g[t.section]=g[t.section]||[]).push(t));return g};

// ---------- Auth ----------
onAuthStateChanged(auth,u=>{un.forEach(f=>f());un=[];U=u;T=[];R={};draft=null;
 if(!u)return authView();
 un.push(onSnapshot(ud(),async s=>{if(!s.exists()||!s.data().seeded){const b=writeBatch(db);b.set(ud(),{...P,seeded:true},{merge:true});let o=0;DEF.forEach(([sec,l])=>l.forEach(x=>b.set(doc(collection(ud(),"tasks")),{section:sec,label:x,order:o++})));await b.commit()}else{P={...P,...s.data()};draw()}}));
 un.push(onSnapshot(collection(ud(),"tasks"),s=>{T=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>a.section.localeCompare(b.section)||a.order-b.order);draw()}));
 un.push(onSnapshot(collection(ud(),"records"),s=>{R={};s.docs.forEach(d=>R[d.id]=d.data());draw()}));
});
function authView(){
 $("#app").innerHTML=`<div class="card auth"><h1>Rekod Tugasan PPM</h1><p class="sub">Log masuk untuk menggunakan sistem.</p>
 <label>E-mel</label><input id="em" type="email" autocomplete="email"><label>Kata laluan</label><input id="pw" type="password" autocomplete="current-password">
 <p class="err" id="er"></p><button class="btn" data-a="in">Log masuk</button> <button class="btn g" data-a="up">Daftar akaun</button>
 <p><button class="btn g" data-a="gg">Log masuk dengan Google</button></p><p><a href="#" data-a="rs" class="sub">Lupa kata laluan?</a></p></div>`;
 $("#app").onclick=async e=>{const a=e.target.dataset.a;if(!a)return;e.preventDefault();const em=$("#em").value.trim(),pw=$("#pw").value;
  try{if(a==="in")await signInWithEmailAndPassword(auth,em,pw);else if(a==="up")await createUserWithEmailAndPassword(auth,em,pw);else if(a==="gg")await signInWithPopup(auth,new GoogleAuthProvider());else if(a==="rs"){await sendPasswordResetEmail(auth,em);$("#er").textContent="E-mel set semula dihantar."}}
  catch(x){$("#er").textContent=({"auth/invalid-credential":"E-mel atau kata laluan salah.","auth/weak-password":"Kata laluan minimum 6 aksara.","auth/email-already-in-use":"E-mel sudah didaftarkan.","auth/invalid-email":"E-mel tidak sah."})[x.code]||x.code}}}

// ---------- Shell ----------
const TABS=[["dash","Dashboard"],["form","Borang Harian"],["tasks","Senarai Tugasan"],["rep","Laporan PDF"]];
function draw(){if(!U)return;if(tab==="form"&&draft&&$("#ck"))return; // jangan ganggu borang yang sedang diisi
 $("#app").innerHTML=`<header><img src="logo.jpg" alt="" onerror="this.remove()"><div class="g"><h1>Rekod Tugasan PPM</h1><div class="sub">${esc(P.sekolah)}</div></div>
 <div class="sub" style="text-align:right">${esc(P.nama||U.email)}<br>${esc(P.kelas)}<br><a href="#" data-a="pf">Profil</a> · <a href="#" data-a="out">Log keluar</a></div></header>
 <nav>${TABS.map(([k,l])=>`<button data-t="${k}" class="${tab===k?"on":""}">${l}</button>`).join("")}</nav><main id="v"></main>`;
 ({dash,form,tasks,rep})[tab]();
 $("#app").onclick=async e=>{const t=e.target.dataset.t,a=e.target.dataset.a,o=e.target.dataset.open;
  if(t){tab=t;draft=null;draw()}if(o){cur=o;draft=null;tab="form";draw()}if(a)e.preventDefault();
  if(a==="out")signOut(auth);
  if(a==="pf"){const n=prompt("Nama PPM:",P.nama);if(n===null)return;const k=prompt("Kelas:",P.kelas);const s=prompt("Nama sekolah:",P.sekolah);await setDoc(ud(),{nama:n,kelas:k??P.kelas,sekolah:s||P.sekolah},{merge:true})}
  if(V.click)V.click(e)}}
let V={};
const row=d=>{const p=prog(R[d]);return `<div class="li"><div style="flex:1"><b>${fmt(d)}</b> <span class="tag ${p<100?"w":""}">${p}%</span><div class="bar" style="margin-top:6px"><i style="width:${p}%"></i></div></div><button class="btn g" data-open="${d}">Buka</button></div>`};

// ---------- Dashboard ----------
function dash(){V={};const ds=Object.keys(R).sort().reverse(),m=today().slice(0,7),dm=ds.filter(d=>d.startsWith(m));
 const avg=ds.length?Math.round(ds.reduce((a,d)=>a+prog(R[d]),0)/ds.length):0;
 $("#v").innerHTML=`<div class="grid"><div class="card stat"><span class="sub">REKOD BULAN INI</span><b>${dm.length} hari</b></div><div class="card stat"><span class="sub">PURATA TUGASAN SELESAI</span><b>${avg}%</b><div class="bar"><i style="width:${avg}%"></i></div></div><div class="card stat"><span class="sub">HARI INI</span><b>${R[today()]?prog(R[today()])+"%":"Belum diisi"}</b></div><div class="card stat"><span class="sub">JUMLAH TUGASAN</span><b>${T.length}</b></div></div>
 <div class="card"><h2>Kemajuan harian</h2>${ds.slice(0,10).map(row).join("")||'<p class="sub">Belum ada rekod.</p>'}<button class="btn" data-open="${today()}">Isi rekod hari ini</button></div>`}

// ---------- Borang ----------
function form(){draft=draft||structuredClone(R[cur]||{items:{},tiba:"",pulang:"",menu:"",catatan:"",ulasan:"",guru:""});const r=draft;
 $("#v").innerHTML=`<div class="card"><h2>Borang Tugasan Harian</h2><div class="row"><div><label>Tarikh</label><input type="date" id="dt" value="${cur}"></div><div><label>Masa tiba</label><input type="time" id="tb" value="${r.tiba}"></div><div><label>Masa pulang</label><input type="time" id="pl" value="${r.pulang}"></div></div>
 <label>Menu</label><input id="mn" value="${esc(r.menu)}">
 <div id="ck">${Object.entries(groups()).map(([s,l])=>`<div class="sec">${esc(s)}</div>`+l.map(t=>`<div class="item"><span style="flex:1;min-width:200px">${esc(t.label)}</span><div class="seg" data-k="${t.id}"><button data-v="s">Selesai</button><button data-v="n">Tidak berkenaan</button></div></div>`).join("")).join("")||'<p class="sub">Tambah tugasan di tab Senarai Tugasan.</p>'}</div>
 <label>Catatan PPM</label><textarea id="ct" rows="3">${esc(r.catatan)}</textarea><label>Ulasan guru</label><textarea id="ul" rows="2">${esc(r.ulasan)}</textarea><label>Nama guru (pengesahan)</label><input id="gr" value="${esc(r.guru)}">
 <p><span class="tag" id="pg"></span></p><button class="btn" id="sv">Simpan</button> ${R[cur]?'<button class="btn d" id="dl">Padam</button>':""}</div>`;
 const paint=()=>{document.querySelectorAll(".seg").forEach(s=>s.querySelectorAll("button").forEach(b=>b.className=b.dataset.v===r.items[s.dataset.k]?b.dataset.v:""));$("#pg").textContent="Kemajuan: "+prog(r)+"%"};paint();
 const rd=()=>{r.tiba=$("#tb").value;r.pulang=$("#pl").value;r.menu=$("#mn").value;r.catatan=$("#ct").value;r.ulasan=$("#ul").value;r.guru=$("#gr").value};
 V.click=async e=>{const b=e.target.closest(".seg button");if(b){const k=b.parentNode.dataset.k;r.items[k]=r.items[k]===b.dataset.v?"":b.dataset.v;paint()}
  if(e.target.id==="sv"){rd();await setDoc(doc(db,"users",U.uid,"records",cur),r);draft=null;toast("Rekod disimpan");tab="dash";draw()}
  if(e.target.id==="dl"&&confirm("Padam rekod ini?")){await deleteDoc(doc(db,"users",U.uid,"records",cur));draft=null;tab="dash";draw()}};
 $("#dt").onchange=e=>{rd();cur=e.target.value||cur;draft=structuredClone(R[cur]||{...r,items:{},catatan:"",ulasan:"",guru:""});$("#ck").remove();form()}}

// ---------- Senarai tugasan (tambah / edit / padam) ----------
function tasks(){const g=groups();
 $("#v").innerHTML=`<div class="card"><h2>Tambah tugasan</h2><div class="row"><div><label>Kumpulan</label><input id="ns" list="sl" placeholder="cth: A. Sebelum sesi"><datalist id="sl">${Object.keys(g).map(s=>`<option value="${esc(s)}">`).join("")}</datalist></div><div style="grid-column:span 2"><label>Tugasan</label><input id="nl"></div></div><button class="btn" id="ad">Tambah</button></div>
 ${Object.entries(g).map(([s,l])=>`<div class="card"><h2>${esc(s)}</h2>${l.map(t=>`<div class="li"><span>${esc(t.label)}</span><span><button class="sm" data-ed="${t.id}">Edit</button> <button class="sm d" data-rm="${t.id}">Padam</button></span></div>`).join("")}</div>`).join("")}
 <p class="sub">Memadam tugasan tidak mengubah rekod lama, tetapi tugasan itu tidak lagi dikira.</p>`;
 V.click=async e=>{const d=e.target.dataset,tk=id=>T.find(t=>t.id===id);
  if(e.target.id==="ad"){const s=$("#ns").value.trim(),l=$("#nl").value.trim();if(!s||!l)return toast("Isi kumpulan dan tugasan");await addDoc(collection(ud(),"tasks"),{section:s,label:l,order:Date.now()});toast("Ditambah")}
  if(d.ed){const t=tk(d.ed),l=prompt("Edit tugasan:",t.label);if(l&&l.trim())await updateDoc(doc(ud(),"tasks",t.id),{label:l.trim()});}
  if(d.rm&&confirm("Padam tugasan ini?"))await deleteDoc(doc(ud(),"tasks",d.rm))}}

// ---------- Laporan PDF ----------
function rep(){const ds=Object.keys(R).sort().reverse();
 $("#v").innerHTML=`<div class="card"><h2>Laporan Harian PDF</h2><label>Pilih tarikh</label><select id="sd">${ds.map(d=>`<option value="${d}">${fmt(d)}</option>`).join("")||"<option value=''>Tiada rekod</option>"}</select><p><button class="btn" id="pdf">Muat turun PDF</button></p><p class="sub">Letakkan fail <b>logo.jpg</b> dalam folder yang sama dengan index.html untuk memaparkan logo sekolah pada laporan.</p></div>`;
 V.click=e=>{if(e.target.id==="pdf"&&$("#sd").value)pdf($("#sd").value)}}
async function logo(){try{const b=await (await fetch("logo.jpg",{cache:"no-cache"})).blob();if(!b.type.includes("image"))return null;return await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)})}catch(e){return null}}
async function pdf(d){const r=R[d],{jsPDF}=window.jspdf,doc=new jsPDF(),L=["SELESAI","TIDAK BERKENAAN"],lg=await logo();let x=14;
 if(lg){try{doc.addImage(lg,"JPEG",14,10,24,24);x=44}catch(e){}}
 doc.setFont("helvetica","bold").setFontSize(13).text(P.sekolah.toUpperCase(),x,18).setFontSize(11).text("LAPORAN HARIAN PEMBANTU PENGURUSAN MURID (PPM)",x,25);
 doc.setFont("helvetica","normal").setFontSize(10).text(`Nama PPM: ${P.nama||"-"}     Kelas: ${P.kelas||"-"}`,14,42).text(`Tarikh: ${fmt(d)}     Tiba: ${r.tiba||"-"}     Pulang: ${r.pulang||"-"}`,14,48).text(`Menu: ${r.menu||"-"}`,14,54);
 const body=[];let n=0;Object.entries(groups()).forEach(([s,l])=>{body.push([{content:s,colSpan:3,styles:{fillColor:[254,243,199],fontStyle:"bold"}}]);l.forEach(t=>body.push([++n,t.label,{SELESAI:"",s:"SELESAI",n:"TIDAK BERKENAAN"}[(r.items||{})[t.id]]||"-"]))});
 doc.autoTable({startY:60,head:[["No","Tugasan","Status"]],body,theme:"grid",headStyles:{fillColor:[31,36,48]},styles:{fontSize:9},columnStyles:{0:{cellWidth:12},2:{cellWidth:38}}});
 let y=doc.lastAutoTable.finalY+8;doc.text(`Kemajuan: ${prog(r)}%`,14,y).text("Catatan: "+(r.catatan||"-"),14,y+6,{maxWidth:180}).text("Ulasan guru: "+(r.ulasan||"-"),14,y+16,{maxWidth:180});
 doc.text("Disahkan oleh: "+(r.guru||"______________________"),14,y+32).text("Tandatangan: ______________________",120,y+32);
 doc.save(`laporan-ppm-${d}.pdf`)}
