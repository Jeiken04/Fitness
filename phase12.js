/* DailyForm Phase 1.2. Additive records only; legacy keys remain unchanged. */
(() => {
'use strict';
const KEY='dailyform-phase12-v1';
const $=id=>document.getElementById(id);
const defaults=()=>({sets:{},cardio:{},boxing:{},planner:{},custom:[]});
let data;
try {data=Object.assign(defaults(),JSON.parse(localStorage.getItem(KEY)||'{}'));} catch {data=defaults();}
for(const k of ['sets','cardio','boxing','planner']) if(!data[k]||typeof data[k]!=='object'||Array.isArray(data[k]))data[k]={};
if(!Array.isArray(data.custom))data.custom=[];
const safe=s=>escapeHTML(String(s??''));
const number=(v,min,max)=>{const n=Number(v);return v===''||!Number.isFinite(n)||n<min||n>max?null:n};
const notice=(id,msg)=>{if($(id))$(id).textContent=msg};
function persist(){if(!storeVerified(KEY,data))return false;return true;}
function mutate(fn,feedback){try{data=Object.assign(defaults(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{}const previous=JSON.stringify(data);fn();if(!persist()){data=JSON.parse(previous);if(feedback)notice(feedback,'Unable to save. Check browser storage.');return false;}renderAll();return true;}
const library=[['Bench press','Chest'],['Incline dumbbell press','Chest'],['Push-up','Chest'],['Cable fly','Chest'],['Pull-up','Back'],['Lat pulldown','Back'],['Barbell row','Back'],['Seated cable row','Back'],['Deadlift','Back'],['Back squat','Legs'],['Front squat','Legs'],['Leg press','Legs'],['Romanian deadlift','Legs'],['Lunge','Legs'],['Leg curl','Legs'],['Overhead press','Shoulders'],['Lateral raise','Shoulders'],['Face pull','Shoulders'],['Biceps curl','Arms'],['Hammer curl','Arms'],['Triceps pushdown','Arms'],['Skull crusher','Arms'],['Plank','Core'],['Hanging leg raise','Core'],['Cable crunch','Core'],['Russian twist','Core']];
function allExercises(){return [...library,...data.custom.filter(x=>x&&typeof x.name==='string').map(x=>[x.name,x.group])];}
function renderLibrary(){
 const q=$('librarySearch').value.trim().toLowerCase(),g=$('libraryGroup').value;
 const entries=allExercises().filter(([name,group])=>(g==='all'||group===g)&&name.toLowerCase().includes(q));
 $('libraryResults').innerHTML=entries.length?entries.slice(0,80).map(([name,group])=>`<div class="phase-item"><div><strong>${safe(name)}</strong><small>${safe(group)}</small></div><button type="button" data-pick-exercise="${safe(name)}">Use</button></div>`).join(''):'<p class="helper">No exercises found. Add a custom exercise below.</p>';
 $('exerciseLibraryOptions').innerHTML=allExercises().map(([name])=>`<option value="${safe(name)}"></option>`).join('');
}
$('librarySearch').addEventListener('input',renderLibrary);$('libraryGroup').addEventListener('change',renderLibrary);
$('libraryResults').addEventListener('click',e=>{const b=e.target.closest('[data-pick-exercise]');if(!b)return;$('setExercise').value=b.dataset.pickExercise;notice('libraryFeedback',`${b.dataset.pickExercise} selected for set logging above.`);$('strength-sets').scrollIntoView({behavior:'smooth'});});
$('saveCustomExercise').addEventListener('click',()=>{
 const name=$('customExerciseName').value.trim(),group=$('customExerciseGroup').value;
 if(!name||name.length>90){notice('libraryFeedback','Enter a valid exercise name.');return;}
 if(allExercises().some(([n])=>n.toLowerCase()===name.toLowerCase())){notice('libraryFeedback','That exercise already exists.');return;}
 if(mutate(()=>data.custom.push({name,group}),'libraryFeedback')){$('customExerciseName').value='';notice('libraryFeedback','Custom exercise saved.');}
});
function renderSets(){
 const sets=Array.isArray(data.sets[selectedDate])?data.sets[selectedDate]:[];
 $('strengthSetList').innerHTML=sets.length?`<div class="v12-table-wrap"><table class="v12-table"><thead><tr><th>Exercise</th><th>Set</th><th>Weight</th><th>Reps</th><th>RPE</th><th>Done</th><th></th></tr></thead><tbody>${sets.map((s,i)=>`<tr><td>${safe(s.exercise)}<small>${safe(s.type)}</small></td><td>${sets.slice(0,i+1).filter(x=>x.exercise===s.exercise).length}</td><td>${s.weight} lb</td><td>${s.reps}</td><td>${s.rpe??'—'}</td><td><input aria-label="Mark set complete" type="checkbox" data-check-set="${i}" ${s.done?'checked':''}></td><td><button type="button" class="v12-delete" data-delete-set="${i}" aria-label="Delete set">×</button></td></tr>`).join('')}</tbody></table></div>`:'<p class="helper">No detailed sets logged for this date.</p>';
 const done=sets.filter(s=>s.done);const volume=done.filter(s=>s.type!=='warmup').reduce((sum,s)=>sum+s.weight*s.reps,0);
 $('strengthSetTotals').innerHTML=`<div><strong>${sets.length}</strong><span>Logged sets</span></div><div><strong>${done.length}</strong><span>Completed sets</span></div><div><strong>${Math.round(volume).toLocaleString()} lb</strong><span>Completed working volume</span></div>`;
}
function newSet(){
 if(selectedDate>dateKey(new Date())){notice('setFeedback','Select today or an earlier date.');return;}
 const exercise=$('setExercise').value.trim(),weight=number($('setWeight').value,0,2000),reps=number($('setReps').value,1,200),rpe=$('setRpe').value===''?null:number($('setRpe').value,1,10);
 if(!exercise||exercise.length>90||weight===null||reps===null||!Number.isInteger(reps)||($('setRpe').value!==''&&rpe===null)){notice('setFeedback','Enter an exercise, valid weight and reps (and optional RPE 1–10).');return;}
 const entry={exercise,weight,reps,rpe,type:$('setType').value,done:true};
 if(mutate(()=>{(data.sets[selectedDate]??=[]).push(entry)},'setFeedback'))notice('setFeedback','Set saved and marked complete.');
}
$('addStrengthSet').addEventListener('click',newSet);
$('repeatStrengthSet').addEventListener('click',()=>{const arr=data.sets[selectedDate]||[];const last=arr[arr.length-1];if(!last){notice('setFeedback','Log a set first.');return;}$('setExercise').value=last.exercise;$('setWeight').value=last.weight;$('setReps').value=last.reps;$('setRpe').value=last.rpe??'';$('setType').value=last.type;newSet();});
$('strengthSetList').addEventListener('change',e=>{const b=e.target.closest('[data-check-set]');if(!b)return;const i=Number(b.dataset.checkSet);mutate(()=>{data.sets[selectedDate][i].done=b.checked},'setFeedback');});
$('strengthSetList').addEventListener('click',e=>{const b=e.target.closest('[data-delete-set]');if(!b)return;mutate(()=>{data.sets[selectedDate].splice(Number(b.dataset.deleteSet),1);if(!data.sets[selectedDate].length)delete data.sets[selectedDate]},'setFeedback');});
function loadDetails(){
 const c=data.cardio[selectedDate]||{};$('cardioActivity').value=c.activity||'Running';$('cardioEffort').value=c.effort??'';$('cardioHeartRate').value=c.hr??'';
 const b=data.boxing[selectedDate]||{};$('boxingActivity').value=b.activity||'Heavy bag';$('boxingIntensity').value=b.intensity??'';$('boxingCombos').value=b.combos||'';$('boxingTechnique').value=b.technique||'';
}
$('saveCardioDetails').addEventListener('click',()=>{
 if(selectedDate>dateKey(new Date())){notice('cardioDetailsFeedback','Select today or a past date.');return;}
 const effort=$('cardioEffort').value===''?null:number($('cardioEffort').value,1,10),hr=$('cardioHeartRate').value===''?null:number($('cardioHeartRate').value,30,250);
 if(($('cardioEffort').value!==''&&(effort===null||!Number.isInteger(effort)))||($('cardioHeartRate').value!==''&&(hr===null||!Number.isInteger(hr)))){notice('cardioDetailsFeedback','Effort must be 1–10 and heart rate 30–250 bpm.');return;}
 if(mutate(()=>data.cardio[selectedDate]={activity:$('cardioActivity').value,effort,hr},'cardioDetailsFeedback'))notice('cardioDetailsFeedback','Cardio details saved for '+selectedDate+'.');
});
$('saveBoxingJournal').addEventListener('click',()=>{
 if(selectedDate>dateKey(new Date())){notice('boxingJournalFeedback','Select today or a past date.');return;}
 const intensity=$('boxingIntensity').value===''?null:number($('boxingIntensity').value,1,10);
 if($('boxingIntensity').value!==''&&(intensity===null||!Number.isInteger(intensity))){notice('boxingJournalFeedback','Intensity must be a whole number from 1 to 10.');return;}
 if(mutate(()=>data.boxing[selectedDate]={activity:$('boxingActivity').value,intensity,combos:$('boxingCombos').value.trim().slice(0,1500),technique:$('boxingTechnique').value.trim().slice(0,1500)},'boxingJournalFeedback'))notice('boxingJournalFeedback','Boxing journal saved for '+selectedDate+'.');
});
function renderDetailsHistory(){
 $('cardioDetailsHistory').innerHTML=Object.entries(data.cardio).sort(([a],[b])=>b.localeCompare(a)).slice(0,6).map(([d,x])=>`<div class="phase-item"><strong>${safe(d)}</strong><span>${safe(x.activity)} · effort ${x.effort??'—'}/10 · ${x.hr??'—'} bpm</span></div>`).join('')||'<p class="helper">No cardio details yet.</p>';
 $('boxingJournalHistory').innerHTML=Object.entries(data.boxing).sort(([a],[b])=>b.localeCompare(a)).slice(0,6).map(([d,x])=>`<div class="phase-item"><div><strong>${safe(d)} · ${safe(x.activity)}</strong><small>${safe(x.combos||x.technique||'No notes')}</small></div><span>${x.intensity??'—'}/10</span></div>`).join('')||'<p class="helper">No boxing journal entries yet.</p>';
}
function monday(d){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-(x.getDay()+6)%7);return x;}
let plannerStart=monday(new Date());
function renderPlanner(){
 const days=Array.from({length:7},(_,i)=>{const d=new Date(plannerStart);d.setDate(d.getDate()+i);return d;});
 $('plannerWeek').textContent=days[0].toLocaleDateString(undefined,{month:'short',day:'numeric'})+' – '+days[6].toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
 $('plannerGrid').innerHTML=days.map(d=>{const key=dateKey(d),p=data.planner[key]||{},count=['strength','cardio','boxing'].filter(t=>records[key]?.[t]).length;return `<div class="planner-day"><strong>${d.toLocaleDateString(undefined,{weekday:'short'})}<small>${d.toLocaleDateString(undefined,{month:'short',day:'numeric'})}</small></strong><label><input type="checkbox" data-plan="${key}|strength" ${p.strength?'checked':''}> Strength</label><label><input type="checkbox" data-plan="${key}|cardio" ${p.cardio?'checked':''}> Cardio</label><label><input type="checkbox" data-plan="${key}|boxing" ${p.boxing?'checked':''}> Boxing</label><label><input type="checkbox" data-plan="${key}|rest" ${p.rest?'checked':''}> Recovery day</label><span class="planner-done">${count} logged · ${p.rest?'Recovery planned':'Training day'}</span></div>`}).join('');
}
$('plannerGrid').addEventListener('change',e=>{const input=e.target.closest('[data-plan]');if(!input)return;const [day,type]=input.dataset.plan.split('|');if(mutate(()=>{const p=(data.planner[day]??={});p[type]=input.checked;if(type==='rest'&&input.checked){p.strength=false;p.cardio=false;p.boxing=false;}else if(type!=='rest'&&input.checked)p.rest=false;},'plannerFeedback'))notice('plannerFeedback','Weekly plan saved.');});
for(const [id,shift] of [['plannerPrev',-7],['plannerNext',7]])$(id).addEventListener('click',()=>{plannerStart.setDate(plannerStart.getDate()+shift);renderPlanner()});
$('plannerToday').addEventListener('click',()=>{plannerStart=monday(new Date());renderPlanner()});
function renderSummaries(){
 const r=records[selectedDate]||{},sets=(data.sets[selectedDate]||[]).filter(x=>x.done),volume=sets.filter(x=>x.type!=='warmup').reduce((sum,x)=>sum+x.weight*x.reps,0),cardio=r.cardio,boxing=r.boxing;
 const pace=cardio&&Number(cardio.metric)>0&&Number(cardio.duration)>0?(Number(cardio.duration)/Number(cardio.metric)).toFixed(1)+' min/mi':'—';
 const cards=[['Strength',r.strength?`${r.strength.duration||0} min`:'No session logged',`${sets.length} completed sets · ${Math.round(volume).toLocaleString()} lb working volume`],['Cardio',cardio?`${cardio.duration||0} min · ${cardio.metric||0} mi`:'No session logged',`${safe(data.cardio[selectedDate]?.activity||'')} ${pace==='—'?'':'· '+pace}`],['Boxing',boxing?`${boxing.duration||0} min · ${boxing.metric||0} rounds`:'No session logged',`${safe(data.boxing[selectedDate]?.activity||'')} ${data.boxing[selectedDate]?.intensity?'· Intensity '+data.boxing[selectedDate].intensity+'/10':''}`]];
 $('sessionSummaryCards').innerHTML=cards.map(([title,headline,detail])=>`<article class="phase-panel"><span class="eyebrow">${title}</span><h3>${headline}</h3><p class="helper">${detail||'Add session details in the workout tab.'}</p></article>`).join('');
}
function renderAll(){try{data=Object.assign(defaults(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{}renderSets();renderLibrary();renderDetailsHistory();renderPlanner();renderSummaries();}
const previousRender=render;
render=function(){previousRender();loadDetails();renderAll();};
render();
})();
