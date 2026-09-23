emailjs.init("eOnK3qvUFiw89dhdV");
const DB_KEY = "social_task1_db_v999";
const ADMIN_EMAIL = "markobinna120@gmail.com";
const REF_BONUS = 50;
const PRICES={"Like a post":{adv:12,earn:4},"Like a video":{adv:12,earn:4},"Watch a video":{adv:10,earn:3},"View a video":{adv:10,earn:3},"Comment on a video":{adv:12,earn:5},"Custom comment":{adv:35,earn:8},"Share a post":{adv:12,earn:4},"Join a group":{adv:35,earn:7},"Follow a channel":{adv:35,earn:7},"Follow a page":{adv:12,earn:5},"Subscribe to a channel":{adv:35,earn:9},"Start a telegram bot":{adv:40,earn:9},"Website Signup":{adv:50,earn:10},"Website Vote":{adv:10,earn:3},"Website Visit":{adv:10,earn:3}};

let db = JSON.parse(localStorage.getItem(DB_KEY) || '{"users":[],"tasks":[],"deposits":[],"withdraws":[],"proofs":[],"pendingCodes":{},"currentUser":null}');
let selectedApp = "Facebook";
let currentPage = 1;
const perPage = 10;
let authMode = "signin";
let activeTaskId = null;
const APPS_LOGO = {Facebook:"https://cdn.simpleicons.org/facebook/1877F2",Instagram:"https://cdn.simpleicons.org/instagram/E4405F",TikTok:"https://cdn.simpleicons.org/tiktok/000000",YouTube:"https://cdn.simpleicons.org/youtube/FF0000",Twitter:"https://cdn.simpleicons.org/x/000000",Telegram:"https://cdn.simpleicons.org/telegram/26A5E4",WhatsApp:"https://cdn.simpleicons.org/whatsapp/25D366",Website:"https://cdn.simpleicons.org/googlechrome/0ea500"};
function save(){localStorage.setItem(DB_KEY, JSON.stringify(db))}
function rnd(){return Math.floor(100000+Math.random()*900000)+""}
function curUser(){return db.users.find(u=>u.id===db.currentUser)}
function isAdmin(){let u=curUser(); return u && u.email.toLowerCase()===ADMIN_EMAIL.toLowerCase()}
function getPending(uid){return db.proofs.filter(p=>p.uid===uid && p.status==="pending").reduce((s,p)=>s+p.earn,0)}
function toggleMenu(){document.getElementById('sideMenu').classList.toggle('active')}
function closePopup(id){document.getElementById(id).style.display='none'}
function openPopup(id){document.getElementById(id).style.display='flex'}
function goToDepositFromLowBal(){closePopup('lowBalPopup'); showPage('deposit')}
function setAuthMode(m){authMode=m; document.getElementById('tabSignIn').className=m==='signin'?'active':'inactive'; document.getElementById('tabSignUp').className=m==='signup'?'active':'inactive'; document.getElementById('aUser').classList.toggle('hidden', m==='signin'); document.getElementById('aRef').classList.toggle('hidden', m==='signin'); document.getElementById('authBtn').innerText=m==='signin'?'Sign In':'Sign Up'; document.getElementById('switchBtn').innerText=m==='signin'?"Don't have account? Sign Up":"Have account? Sign In";}
function toggleAuthMode(){setAuthMode(authMode==='signin'?'signup':'signin')}
async function handleAuth(){
  let email=document.getElementById('aEmail').value.trim().toLowerCase(); let pass=document.getElementById('aPass').value.trim(); let user=document.getElementById('aUser').value.trim(); let ref=document.getElementById('aRef').value.trim();
  if(!email||!pass){alert("Fill email & password"); return}
  if(authMode==='signup'){
    if(!user){alert("Enter username"); return}
    if(db.users.find(u=>u.email===email)){alert("Email exists"); return}
    let code=rnd(); db.pendingCodes[email]={code,user,pass,email,ref,refCode:user.toUpperCase().slice(0,4)+rnd().slice(0,3)}; save();
    document.getElementById('emailStatus').innerText="Sending code...";
    try{await emailjs.send("service_ey8lagr","template_kndbrqg",{to_name:user,to_email:email,code:code,email:email})}catch{}
    document.getElementById('aCode').classList.remove('hidden');
    document.getElementById('emailStatus').innerHTML=`Code sent! If not in inbox: <b style=color:red>${code}</b>`;
    document.getElementById('authBtn').innerText="Verify Code"; document.getElementById('authBtn').onclick=()=>verifyCode(email);
  }else{
    let u=db.users.find(x=>x.email===email && x.password===pass); if(!u){alert("Wrong login"); return} if(u.suspended){alert("Account suspended"); return}
    db.currentUser=u.id; save(); renderAll();
  }
}
function verifyCode(email){
  let c=document.getElementById('aCode').value.trim(); let p=db.pendingCodes[email]; if(!p||c!==p.code){alert("Wrong code"); return}
  let newUser={id:Date.now(),username:p.user,email:p.email,password:p.pass,bal:0,deposit:0,refCode:p.refCode,refBy:p.ref,referred:[],suspended:false};
  db.users.push(newUser); if(p.ref){let refUser=db.users.find(u=>u.refCode===p.ref || u.username===p.ref); if(refUser){refUser.bal+=REF_BONUS; refUser.referred.push(newUser.email)}}
  delete db.pendingCodes[email]; db.currentUser=newUser.id; save(); renderAll();
}
function logout(){db.currentUser=null; save(); location.reload()}
function showPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
  let target=document.getElementById(name); if(target) target.classList.remove('hidden');
  if(name!=='auth' &&!curUser()){document.getElementById('auth').classList.remove('hidden'); return}
  if(name==='home') renderHome(); if(name==='tasks') renderTasks(); if(name==='post') renderPost(); if(name==='deposit') renderDeposit(); if(name==='withdraw') renderWithdraw(); if(name==='referral') renderReferral(); if(name==='admin' && isAdmin()) showAdmin('users');
  window.scrollTo(0,0);
}
function renderAll(){ if(!curUser()){showPage('auth'); return} document.getElementById('adminLink').style.display=isAdmin()?'flex':'none'; showPage('home'); }
function taskCardHTML(t, showStart=true){
  let logo=APPS_LOGO[t.platform]||APPS_LOGO.Website;
  return `<div class="task-fansup"><div class="task-top"><div class="task-logo"><img src="${logo}"></div><div style="flex:1"><b>${t.title}</b><br><small style="color:#666">${t.platform} • ${t.type}</small><br><span class="badge">${t.total - t.done} left</span></div><div style="text-align:right"><small>Earn</small><br><b style="color:#0ea500">₦${t.earn}</b></div></div>${showStart?`<div class="task-bottom"><small>${t.platform} Task</small><button class="start-btn" onclick="openTask(${t.id})">Start</button></div>`:''}</div>`;
}
function renderHome(){
  let u=curUser(); if(!u) return;
  document.getElementById('avBal').innerText='₦'+u.bal; document.getElementById('pdBal').innerText='₦'+getPending(u.id); document.getElementById('postDep').innerText='₦'+u.deposit; document.getElementById('menuDep').innerText='₦'+u.deposit;
  let all=db.tasks.filter(t=>t.status==='approved' && (t.total-t.done)>0 &&!db.proofs.find(p=>p.taskId===t.id && p.uid===u.id));
  document.getElementById('homeTasks').innerHTML=all.slice(0,4).map(t=>taskCardHTML(t)).join('') || '<div style=text-align:center;padding:20px;color:#888>🎉 No tasks now</div>';
}
function renderTasks(){
  let u=curUser(); let all=db.tasks.filter(t=>t.status==='approved' && (t.total-t.done)>0 &&!db.proofs.find(p=>p.taskId===t.id && p.uid===u.id));
  let start=(currentPage-1)*perPage; let paged=all.slice(start,start+perPage);
  document.getElementById('allTasks').innerHTML=paged.map(t=>taskCardHTML(t)).join('') || '<div style=text-align:center;padding:20px;color:#888>🎉 No tasks</div>';
  document.getElementById('pageInfo').innerText=`Page ${currentPage} / ${Math.ceil(all.length/perPage)||1}`;
}
function changePage(d){ currentPage+=d; if(currentPage<1)currentPage=1; let max=Math.ceil(db.tasks.filter(t=>t.status==='approved').length/perPage)||1; if(currentPage>max)currentPage=max; renderTasks(); }
function renderPost(){
  let u=curUser(); let my=db.tasks.filter(t=>t.uid===u.id);
  document.getElementById('emptyState').style.display=my.length?'none':'block';
  document.getElementById('myCreatedList').innerHTML=my.map(t=>taskCardHTML(t,false)+`<div style=padding:8px;display:flex;justify-content:space-between><small>Status: <b>${t.status}</b> • ${t.done}/${t.total}</small><small>Paid: ₦${t.paid}</small></div>`).join('');
  document.getElementById('activeCount').innerText=my.length; renderAppGrid();
}
function renderAppGrid(){
  document.getElementById('appGrid').innerHTML=Object.keys(APPS_LOGO).map(k=>`<div onclick="selectApp('${k}')" style="border:${selectedApp===k?'2px solid #0ea500':'1px solid #ddd'};border-radius:14px;padding:10px;text-align:center;cursor:pointer;background:#fff"><img src="${APPS_LOGO[k]}" style="width:28px;height:28px"><br><small style="font-weight:700">${k}</small></div>`).join('');
  selectApp(selectedApp);
}
function selectApp(app){
  selectedApp=app; document.getElementById('selectedAppText').innerText='Selected: '+app+' ✓';
  document.getElementById('pType').innerHTML=Object.keys(PRICES).map(t=>`<option value="${t}">${t} - You Pay ₦${PRICES[t].adv} (Worker Earns ₦${PRICES[t].earn})</option>`).join('');
  updatePrice();
}
function updatePrice(){
  let type=document.getElementById('pType').value; let qty=parseInt(document.getElementById('pQty').value)||0; if(!type) return;
  let pay=PRICES[type].adv*qty; let earn=PRICES[type].earn;
  document.getElementById('priceInfo').innerHTML=`You will pay: <b>₦${pay}</b> (${PRICES[type].adv} x ${qty})<br>Worker will see: <b>Earn ₦${earn}</b> - your price hidden from workers`;
  document.getElementById('customBox').classList.toggle('hidden',type!=='Custom comment');
}
document.addEventListener('input', e=>{if(e.target.id==='pType'||e.target.id==='pQty')updatePrice()})
function createTask(){
  let u=curUser(); let type=document.getElementById('pType').value; let link=document.getElementById('pLink').value.trim(); let qty=parseInt(document.getElementById('pQty').value);
  if(!link||!qty||qty<1){alert("Fill link & units"); return}
  let pay=PRICES[type].adv*qty; if(pay>u.deposit){openPopup('lowBalPopup'); return}
  let custom=[]; if(type==='Custom comment'){ custom=document.getElementById('customCommentsInput').value.split(/[\n,]+/).map(s=>s.trim()).filter(Boolean); if(custom.length<qty){alert(`Enter at least ${qty} custom comments`); return} }
  u.deposit-=pay;
  db.tasks.unshift({id:Date.now(),uid:u.id,platform:selectedApp,type,title:`${selectedApp} - ${type}`,link,total:qty,done:0,price:PRICES[type].adv,earn:PRICES[type].earn,paid:pay,status:'approved',customComments:custom});
  save(); renderPost(); updatePrice(); document.getElementById('pLink').value=''; openPopup('postSuccessPopup');
}
function openTask(id){ activeTaskId=id; let t=db.tasks.find(x=>x.id===id); document.getElementById('popTitle').innerText=t.title; document.getElementById('popLink').href=t.link; document.getElementById('popCustomList').innerHTML=t.customComments&&t.customComments.length?`<div style=background:#f6f6f6;padding:8px;border-radius:10px;margin:8px 0><small>Copy one comment:</small><br><b>${t.customComments[Math.floor(Math.random()*t.customComments.length)]}</b></div>`:''; openPopup('taskPopup'); }
function submitProof(){
  let handle=document.getElementById('popHandle').value.trim(); let file=document.getElementById('popFile').files[0]; if(!handle||!file){alert("Enter username & upload proof"); return}
  let reader=new FileReader(); reader.onload=e=>{
    let t=db.tasks.find(x=>x.id===activeTaskId); db.proofs.unshift({id:Date.now(),taskId:activeTaskId,uid:curUser().id,username:curUser().username,handle,img:e.target.result,status:'pending',earn:t.earn}); save(); closePopup('taskPopup'); openPopup('successPopup'); document.getElementById('popHandle').value=''; renderHome(); renderTasks();
  }; reader.readAsDataURL(file);
    }
function renderDeposit(){ let u=curUser(); document.getElementById('depBalText').innerText='₦'+u.deposit; document.getElementById('myDeposits').innerHTML=db.deposits.filter(d=>d.uid===u.id).map(d=>`<div style=display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #eee><span>₦${d.amount} - ${d.name}</span><b>${d.status}</b></div>`).join('')||'No deposits'; }
function submitDeposit(){ let name=document.getElementById('dName').value.trim(); let amt=parseInt(document.getElementById('dAmt').value); if(!name||!amt){alert("Fill all"); return} db.deposits.unshift({id:Date.now(),uid:curUser().id,name,amount:amt,status:'pending'}); save(); renderDeposit(); openPopup('depositSuccessPopup'); }
function renderWithdraw(){ let u=curUser(); document.getElementById('wAvBal').innerText='₦'+u.bal; document.getElementById('wPdBal').innerText='₦'+getPending(u.id); document.getElementById('wInfo').innerText=`Min ₦300 Charge ₦20 - Available: ₦${u.bal}`; document.getElementById('myWithdrawals').innerHTML=db.withdraws.filter(w=>w.uid===u.id).map(w=>`<div style=display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #eee><span>₦${w.amount} - ${w.bank}</span><b>${w.status}</b></div>`).join('')||'No withdrawals'; }
function requestWithdraw(){ let accName=document.getElementById('wAccName').value.trim(); let accNum=document.getElementById('wAccNum').value.trim(); let bank=document.getElementById('wBank').value.trim(); let amt=parseInt(document.getElementById('wAmt').value); let u=curUser(); if(!accName||!accNum||!bank||!amt){alert("Fill all"); return} if(amt<300){alert("Min ₦300"); return} if(amt>u.bal){alert("Insufficient"); return} u.bal-=amt; db.withdraws.unshift({id:Date.now(),uid:u.id,name:accName,account:accNum,bank,amount:amt,status:'pending'}); save(); renderWithdraw(); openPopup('withdrawSuccessPopup'); }
function renderReferral(){ let u=curUser(); document.getElementById('myRefCode').innerText=u.refCode; document.getElementById('myRefLink').innerText=location.origin+location.pathname+'?ref='+u.refCode; document.getElementById('refCount').innerText=u.referred.length; document.getElementById('refEarn').innerText='₦'+(u.referred.length*50); document.getElementById('myReferralsList').innerHTML=u.referred.map(e=>`<div style=padding:6px;border-bottom:1px solid #eee>${e}</div>`).join('')||'No referrals yet'; }
function copyRef(){ navigator.clipboard.writeText(document.getElementById('myRefLink').innerText); alert("Copied!"); }
function showAdmin(tab){
  if(!isAdmin()) return; let html='';
  if(tab==='users'){ html=`<h3>All Users (${db.users.length})</h3>${db.users.map(u=>`<div style=border:1px solid #eee;border-radius:12px;padding:10px;margin:8px 0><b>${u.username}</b> ${u.suspended?'<span style=color:red>[SUSPENDED]</span>':''}<br><small>${u.email} • ${u.refCode}</small><br><small>💰 Bal: ₦${u.bal} | Deposit: ₦${u.deposit} | Pending: ₦${getPending(u.id)}</small><br><button onclick="toggleSuspend(${u.id})" style="padding:6px 12px;border-radius:8px;border:1px solid #0ea500;background:${u.suspended?'#0ea500':'#fff'};color:${u.suspended?'#fff':'#0ea500'};margin-top:6px">${u.suspended?'Unsuspend':'Suspend'}</button></div>`).join('')}`; }
  else if(tab==='pendingBal'){ let pend=db.proofs.filter(p=>p.status==='pending'); html=`<h3>Pending Balances (${pend.length})</h3>${pend.map(p=>`<div style=border:1px solid #eee;padding:10px;border-radius:12px;margin:6px 0><b>${p.username} @${p.handle} - ₦${p.earn}</b><br><img src="${p.img}" style="width:100%;max-height:180px;object-fit:cover;border-radius:10px;margin:6px 0"><br><button onclick="approveProof(${p.id})" style="padding:8px 14px;background:#0ea500;color:#fff;border:none;border-radius:10px">Approve</button> <button onclick="rejectProof(${p.id})" style="padding:8px 14px;border:1px solid #ddd;border-radius:10px">Reject</button></div>`).join('')||'None'}`; }
  else if(tab==='depositsAdmin'){ let d=db.deposits.filter(x=>x.status==='pending'); html=`<h3>Deposits (${d.length})</h3>${d.map(x=>{let u=db.users.find(u=>u.id===x.uid); return `<div style=border:1px solid #eee;padding:10px;border-radius:12px;margin:6px 0><b>₦${x.amount} - ${u?u.username:''}</b><br><small>${x.name}</small><br><button onclick="approveDeposit(${x.id})" style="padding:8px 14px;background:#0ea500;color:#fff;border:none;border-radius:10px;margin-top:6px">Approve</button></div>`}).join('')||'None'}`; }
  else if(tab==='withdrawalsAdmin'){ let w=db.withdraws.filter(x=>x.status==='pending'); html=`<h3>Withdrawals (${w.length})</h3>${w.map(x=>{let u=db.users.find(u=>u.id===x.uid); return `<div style=border:1px solid #eee;padding:10px;border-radius:12px;margin:6px 0><b>₦${x.amount} - ${u?u.username:''}</b><br><small>${x.name} | ${x.bank} | ${x.account}</small><br><button onclick="approveWithdraw(${x.id})" style="padding:8px 14px;background:#0ea500;color:#fff;border:none;border-radius:10px;margin-top:6px">Paid</button></div>`}).join('')||'None'}`; }
  else if(tab==='allTasksAdmin'){ html=`<h3>All Tasks (${db.tasks.length})</h3>${db.tasks.map(t=>`<div style=border:1px solid #eee;padding:10px;border-radius:12px;margin:6px 0><b>${t.title}</b> - ${t.status}<br><small>${t.done}/${t.total} • Paid ₦${t.paid} | Earn ₦${t.earn} | Adv ₦${t.price}</small></div>`).join('')}`; }
  document.getElementById('adminContent').innerHTML=html;
}
function toggleSuspend(uid){ let u=db.users.find(x=>x.id===uid); u.suspended=!u.suspended; save(); showAdmin('users'); }
function approveProof(id){ let p=db.proofs.find(x=>x.id===id); p.status='approved'; let u=db.users.find(x=>x.id===p.uid); let t=db.tasks.find(x=>x.id===p.taskId); u.bal+=p.earn; t.done++; save(); showAdmin('pendingBal'); }
function rejectProof(id){ let p=db.proofs.find(x=>x.id===id); p.status='rejected'; save(); showAdmin('pendingBal'); }
function approveDeposit(id){ let d=db.deposits.find(x=>x.id===id); let u=db.users.find(x=>x.id===d.uid); d.status='approved'; u.deposit+=d.amount; save(); showAdmin('depositsAdmin'); }
function approveWithdraw(id){ let w=db.withdraws.find(x=>x.id===id); w.status='paid'; save(); showAdmin('withdrawalsAdmin'); }
window.onload=()=>{ renderAll(); renderAppGrid(); let params=new URLSearchParams(location.search); let ref=params.get('ref'); if(ref) document.getElementById('aRef').value=ref; }
