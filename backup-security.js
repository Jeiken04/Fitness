/* Shared backup validation and verified restore; no network or DOM dependency. */
(function(root){'use strict';
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const date=k=>/^\d{4}-\d{2}-\d{2}$/.test(k);
function validateTree(value){const stack=[[value,0]];let count=0;while(stack.length){const [v,depth]=stack.pop();if(++count>2000000||depth>64)throw Error('Backup structure exceeds safety limits.');if(typeof v==='number'&&!Number.isFinite(v))throw Error('Invalid numeric value.');if(v&&typeof v==='object'){for(const k of Object.keys(v)){if(['__proto__','constructor','prototype'].includes(k))throw Error('Unsafe property in backup.');stack.push([v[k],depth+1]);}}}}
function validate(obj,allowed){if(!object(obj)||obj.format!=='dailyform-backup'||obj.version!==1||!object(obj.storage))throw Error('Not a compatible DailyForm backup.');validateTree(obj);const items=allowed.filter(k=>Object.prototype.hasOwnProperty.call(obj.storage,k)).map(k=>[k,obj.storage[k]]);if(!items.length)throw Error('No supported records in this backup.');
const arrays=(v,keys)=>keys.every(k=>v[k]===undefined||Array.isArray(v[k]));const maps=(v,keys)=>keys.every(k=>v[k]===undefined||object(v[k]));const rows=v=>Array.isArray(v)&&v.every(object);
for(const [k,v] of items){let ok=k==='dailyform-templates-v1'?rows(v)&&v.every(t=>typeof t.name==='string'&&rows(t.exercises)):object(v);if(!ok)throw Error('Invalid data for '+k);
switch(k){case 'dailyform-workouts-v1':ok=Object.entries(v).every(([d,r])=>date(d)&&object(r)&&['strength','cardio','boxing'].every(t=>r[t]==null||object(r[t]))&&(r.exercises===undefined||rows(r.exercises)));break;
case 'dailyform-weight-v1':ok=maps(v,['entries'])&&Object.entries(v.entries||{}).every(([d,n])=>date(d)&&['number','string'].includes(typeof n)&&Number.isFinite(Number(n))&&Number(n)>0);break;
case 'dailyform-phase12-v1':ok=maps(v,['sets','cardio','boxing','planner'])&&arrays(v,['custom']);break;
case 'dailyform-phase20-v1':ok=maps(v,['targets','nutrition','measurements'])&&['nutrition','measurements'].every(k=>Object.keys(v[k]||{}).every(date));break;
case 'dailyform-unified-v1':ok=maps(v,['imported']);break;
case 'dailyform-phase21-v1':ok=arrays(v,['custom','favorites']);break;
case 'dailyform-phase22-v1':ok=arrays(v,['pantry','plan','checked','customRecipes','extraGroceries'])&&maps(v,['settings']);break;
case 'dailyform-watch-activity-v1':ok=maps(v,['days'])&&Object.entries(v.days||{}).every(([d,r])=>date(d)&&object(r))&&(v.workouts===undefined||rows(v.workouts)&&v.workouts.every(w=>typeof w.type==='string'&&date(w.day)));break;
case 'dailyform-boxing-studio-v1':ok=['sessions','history'].every(k=>v[k]===undefined||rows(v[k]));break;
case 'dailyform-boxing-programs-v1':ok=maps(v,['progress']);break;
}if(!ok)throw Error('Invalid data for '+k); }return items;}
function restore(storage,items){const previous=items.map(([k])=>[k,storage.getItem(k)]);const attempted=[];try{for(const [k,v] of items){const payload=JSON.stringify(v);attempted.push(k);storage.setItem(k,payload);if(storage.getItem(k)!==payload)throw Error('Storage verification failed.');}}catch(err){let failed=false;for(const [k,v] of previous.reverse()){if(!attempted.includes(k))continue;try{if(storage.getItem(k)!==v){if(v===null)storage.removeItem(k);else storage.setItem(k,v);}if(storage.getItem(k)!==v)failed=true;}catch{failed=true;}}throw Error(failed?'Restore failed and rollback could not be verified. Do not reload; retain your external backup.':'Restore failed; previous stored values verified unchanged.');}}
const api={validate,restore};if(typeof module==='object'&&module.exports)module.exports=api;else root.DailyFormBackupSecurity=api;
})(globalThis);
