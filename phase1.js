/* DailyForm Phase 1 enhancements. Preserves legacy workout and weight keys. */
(() => {
'use strict';
const TEMPLATES_KEY='dailyform-templates-v1';
const $=id=>document.getElementById(id);
const getTemplates=()=>{try{const v=JSON.parse(localStorage.getItem(TEMPLATES_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return []}};
let templates=getTemplates();
const saveTemplates=()=>storeVerified(TEMPLATES_KEY,templates);
const notice=(id,message)=>{if($(id))$(id).textContent=message};
const fmtTime=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
const n=v=>Number(v)||0;
const validDate=()=>selectedDate<=dateKey(new Date());

function templateRender(){
 $('templateList').innerHTML=templates.length?templates.map((t,i)=>`<div class="phase-item"><div><strong>${escapeHTML(t.name)}</strong><small>${t.exercises.length} exercises</small></div><div><button data-load-template="${i}" type="button">Load</button> <button data-delete-template="${i}" type="button" aria-label="Delete template">×</button></div></div>`).join(''):'<p class="helper">No templates yet.</p>';
}
$('saveTemplate').addEventListener('click',()=>{
 const name=$('templateName').value.trim();
 const exercises=$('templateExercises').value.split(/\r?\n/).map(line=>{
 const [name,sets,reps,weight]=line.split('|').map(x=>x.trim());
 return {name:name||'',type:'strength',sets:String(Math.max(0,n(sets))),reps:String(Math.max(0,n(reps))),weight:weight==null?'':String(Math.max(0,n(weight)))};
 }).filter(e=>e.name);
 if(!name||!exercises.length){notice('templateFeedback','Enter a template name and at least one exercise.');return}
 if(templates.length>=50){notice('templateFeedback','Maximum of 50 templates.');return}
 templates.push({name,exercises});
 if(!saveTemplates()){templates.pop();notice('templateFeedback','Could not save template.');return}
 $('templateName').value='';$('templateExercises').value='';templateRender();notice('templateFeedback','Template saved.');
});
$('templateList').addEventListener('click',e=>{
 const del=e.target.closest('[data-delete-template]');const load=e.target.closest('[data-load-template]');
 if(del){const i=Number(del.dataset.deleteTemplate);if(!confirm('Delete this template?'))return;const old=templates.slice();templates.splice(i,1);if(!saveTemplates()){templates=old;notice('templateFeedback','Could not delete template.');return}templateRender();return}
 if(load){if(!validDate()){notice('templateFeedback','Select today or a past date first.');return}const t=templates[Number(load.dataset.loadTemplate)];if(!t)return;
  if(!records[selectedDate])records[selectedDate]={};
  const existing=Array.isArray(records[selectedDate].exercises)?records[selectedDate].exercises:[];
  records[selectedDate].exercises=existing.concat(t.exercises.map(x=>({...x})));
  if(!saveRecords()){records=loadRecords();notice('templateFeedback','Could not save loaded exercises.');return}
  render();notice('templateFeedback',`${t.exercises.length} exercises added for ${formatDate(selectedDate)}. You can edit by removing and re-adding an entry.`);
 }
});
function strengthProgress(){
 const all=[];
 Object.entries(records).forEach(([date,day])=>{if(!Array.isArray(day?.exercises))return;day.exercises.forEach(e=>{if(e.type==='strength'&&e.name&&n(e.weight)>0)all.push({...e,date})})});
 const names=[...new Set(all.map(e=>e.name.trim()))].sort((a,b)=>a.localeCompare(b));
 const select=$('progressExercise'),current=select.value;
 select.innerHTML='<option value="">Choose an exercise</option>'+names.map(name=>`<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`).join('');
 select.value=names.includes(current)?current:(names[0]||'');
 const chosen=all.filter(e=>e.name.trim()===select.value).sort((a,b)=>b.date.localeCompare(a.date));
 const best=chosen.length?Math.max(...chosen.map(e=>n(e.weight))):0;
 const orm=chosen.length?Math.max(...chosen.map(e=>n(e.weight)*(1+Math.min(n(e.reps),30)/30))):0;
 $('bestWeight').textContent=best?`${best.toFixed(1)} lb`:'—';
 $('bestOneRM').textContent=orm?`${orm.toFixed(1)} lb`:'—';
 $('strengthProgressList').innerHTML=chosen.length?chosen.slice(0,8).map(e=>`<div class="phase-item"><span>${escapeHTML(e.date)}</span><span>${escapeHTML(String(e.weight))} lb · ${escapeHTML(String(e.sets||0))}×${escapeHTML(String(e.reps||0))}</span></div>`).join(''):'<p class="helper">Log weighted strength exercises to see records.</p>';
}
$('progressExercise').addEventListener('change',strengthProgress);
function cardioProgress(){
 const today=dayData().cardio;
 const pace=today&&n(today.duration)>0&&n(today.metric)>0?n(today.duration)/n(today.metric):0;
 $('cardioPace').textContent=pace?`${Math.floor(pace)}:${String(Math.round((pace%1)*60)).padStart(2,'0')} /mi`:'—';
 const todayDate=dateFromKey(dateKey(new Date()));
 const rows=[];let total=0;
 for(let i=0;i<7;i++){const d=new Date(todayDate);d.setDate(d.getDate()-i);const key=dateKey(d),r=records[key]?.cardio;if(r&&n(r.metric)>0){total+=n(r.metric);rows.push({key,r})}}
 $('cardioWeeklyDistance').textContent=`${total.toFixed(2)} mi`;
 $('cardioTrend').innerHTML=rows.length?rows.map(({key,r})=>`<div class="phase-item"><span>${escapeHTML(key)}</span><span>${n(r.metric).toFixed(2)} mi · ${n(r.duration)} min</span></div>`).join(''):'<p class="helper">No cardio distance logged in the last 7 days.</p>';
}

// Timers are initialized by polish.js (Phase 1.1).

function backup(){
 const keys=[STORAGE_KEY,WEIGHT_KEY,TEMPLATES_KEY,'dailyform-exercise-drafts-v1','dailyform-timer-preferences-v1','dailyform-phase12-v1','dailyform-unified-v1'];const data={format:'dailyform-backup',version:1,exportedAt:new Date().toISOString(),storage:{}};
 keys.forEach(key=>{const value=localStorage.getItem(key);if(value!==null)data.storage[key]=JSON.parse(value)});
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`dailyform-backup-${dateKey(new Date())}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('exportBackup').addEventListener('click',()=>{try{backup();notice('backupFeedback','Backup downloaded. Keep it somewhere safe.')}catch(err){notice('backupFeedback','Backup failed: '+err.message)}});
$('importBackup').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  if(file.size>5_000_000)throw Error('File too large (maximum 5 MB).');
  const obj=JSON.parse(await file.text());
  if(obj.format!=='dailyform-backup'||obj.version!==1||!obj.storage||typeof obj.storage!=='object')throw Error('Not a compatible DailyForm backup.');
  const allowed=[STORAGE_KEY,WEIGHT_KEY,TEMPLATES_KEY,'dailyform-exercise-drafts-v1','dailyform-timer-preferences-v1','dailyform-phase12-v1','dailyform-unified-v1'];
  const items=allowed.filter(k=>Object.prototype.hasOwnProperty.call(obj.storage,k)).map(k=>[k,obj.storage[k]]);
  if(!items.length)throw Error('No supported records in this backup.');
  for(const [key,value] of items){if(!value||typeof value!=='object'||Array.isArray(value)!==(key===TEMPLATES_KEY))throw Error('Invalid data for '+key)}
  if(!confirm('Replace this device’s workout, weight and template records with the backup? Export your current data first.'))return;
  const previous=new Map(allowed.map(k=>[k,localStorage.getItem(k)]));
  try{items.forEach(([key,value])=>{if(!storeVerified(key,value))throw Error('Storage verification failed.');});}
  catch(err){previous.forEach((value,key)=>{try{if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value)}catch{}});throw err}
  notice('backupFeedback','Backup restored. Reloading…');location.reload();
 }catch(err){notice('backupFeedback','Import failed: '+err.message)}finally{e.target.value=''}
});
// Refresh Phase 1 insights when the existing application renders or the selected date changes.
const originalRender=render;
render=function(){originalRender();strengthProgress();cardioProgress()};
// The app's initial render already ran before this enhancement loaded.
templateRender();strengthProgress();cardioProgress();
})();
