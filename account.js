'use strict';
(() => {
 const base='https://ynwqixqvztcjecbxisgn.supabase.co/auth/v1';
 const key='sb_publishable_p4R46_uHk5-tUqJnd__7yw_ziK9IvIn';
 const storage='dailyform-auth-session-v1';
 const $=id=>document.getElementById(id);
 const status=$('accountStatus'), form=$('accountForm');
 let session=null, recovery=false, busy=false, verified=false;
 const redirect=location.origin+location.pathname;
 function save(value){session=value; try{if(value)localStorage.setItem(storage,JSON.stringify(value));else localStorage.removeItem(storage);}catch{status.textContent='Browser storage unavailable; session may not persist.';}}
 async function request(path,method='GET',body,token){
  const res=await fetch(base+path,{method,headers:{apikey:key,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{}),cache:'no-store',credentials:'omit',redirect:'error',signal:AbortSignal.timeout(15000)});
  const data=await res.json(); if(!res.ok)throw new Error(data.msg||data.message||data.error_description||'Request failed ('+res.status+')'); return data;
 }
 function render(){ $('accountGuest').hidden=!!session; $('accountMember').hidden=!session; $('accountRecovery').hidden=!recovery; $('accountEmailDisplay').textContent=session?.user?.email||'Account session'; $('accountNameDisplay').textContent=session?.user?.user_metadata?.display_name||''; $('accountProfile').hidden=!verified||recovery; $('accountName').value=session?.user?.user_metadata?.display_name||''; }
 async function run(fn){if(busy)return;busy=true; $('accountCard').querySelectorAll('button').forEach(b=>b.disabled=true);try{await fn();}catch(e){status.textContent=e.message||'Account request failed.';}finally{busy=false;render();$('accountCard').querySelectorAll('button').forEach(b=>b.disabled=false);}}
 async function validate(){if(!session)return; if(!session.expires_at||session.expires_at<=Date.now()/1000+60){const next=await request('/token?grant_type=refresh_token','POST',{refresh_token:session.refresh_token});save(next);}const user=await request('/user','GET',null,session.access_token);save({...session,user});verified=true;}
 function credentials(){return {email:$('accountEmail').value.trim(),password:$('accountPassword').value};}
 form.addEventListener('submit',e=>{e.preventDefault();run(async()=>{save(await request('/token?grant_type=password','POST',credentials()));await validate();form.reset();status.textContent='Signed in. Fitness records remain local.';});});
 $('accountRegister').onclick=()=>{if(!form.reportValidity())return;run(async()=>{const data=await request('/signup?redirect_to='+encodeURIComponent(redirect),'POST',credentials());form.reset();if(data.access_token){save(data);await validate();status.textContent='Account created.';}else status.textContent='Check your email for a confirmation link if registration is available.';});};
 $('accountReset').onclick=()=>{if(!$('accountEmail').reportValidity())return;run(async()=>{await request('/recover?redirect_to='+encodeURIComponent(redirect),'POST',{email:$('accountEmail').value.trim()});status.textContent='If the account exists, check your email for a reset link.';});};
 $('accountLogout').onclick=()=>run(async()=>{if(session){await validate();await request('/logout?scope=local','POST',null,session.access_token);}save(null);verified=false;recovery=false;status.textContent='Signed out. Local fitness records remain on this device.';});
 $('accountLocalLogout').onclick=()=>{save(null);verified=false;recovery=false;render();status.textContent='Local session cleared. Server session was not revoked.';};
 $('accountRecovery').addEventListener('submit',e=>{e.preventDefault();run(async()=>{await validate();await request('/user','PUT',{password:$('accountNewPassword').value},session.access_token);$('accountRecovery').reset();recovery=false;status.textContent='Password updated.';});});
 $('accountProfile').addEventListener('submit',e=>{e.preventDefault();run(async()=>{await validate();const user=await request('/user','PUT',{data:{display_name:$('accountName').value.trim()}},session.access_token);save({...session,user});status.textContent='Profile saved.';});});
 const params=new URLSearchParams(location.hash.slice(1));
 if(params.has('access_token')||params.has('error_description')){history.replaceState(null,'',location.pathname+location.search);if(params.has('access_token')&&params.has('refresh_token')){recovery=params.get('type')==='recovery';save({access_token:params.get('access_token'),refresh_token:params.get('refresh_token'),expires_at:Date.now()/1000+Number(params.get('expires_in')||0)});if(recovery)document.querySelector('[data-tab="settings"]')?.click();}else status.textContent=params.get('error_description')||'Invalid account link.';}else{try{session=JSON.parse(localStorage.getItem(storage)||'null');}catch{session=null;}}
 render();if(session)run(async()=>{await validate();status.textContent=recovery?'Enter your new password.':'Signed in. Fitness records remain local.';});
})();
