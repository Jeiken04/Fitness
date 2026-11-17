/* DailyForm Phase 2.0: additive nutrition and measurements. */
(() => {
'use strict';
const KEY='dailyform-phase20-v1', $=id=>document.getElementById(id);
const initial={targets:{calories:0,protein:0,carbs:0,fat:0,water:0},nutrition:{},measurements:{}};
function load(){try{const v=JSON.parse(localStorage.getItem(KEY)||'{}');return {targets:{...initial.targets,...(v.targets&&typeof v.targets==='object'&&!Array.isArray(v.targets)?v.targets:{})},nutrition:v.nutrition&&typeof v.nutrition==='object'&&!Array.isArray(v.nutrition)?v.nutrition:{},measurements:v.measurements&&typeof v.measurements==='object'&&!Array.isArray(v.measurements)?v.measurements:{}}}catch{return structuredClone(initial)}}
let data=load();
const fmt=n=>Number(n||0).toLocaleString(undefined,{maximumFractionDigits:1});
const clean=(v,max)=>{const n=Number(v);return Number.isFinite(n)&&n>=0&&n<=max?n:null};
const escape=s=>escapeHTML(String(s));
const day=()=>{const v=data.nutrition[selectedDate];return v&&typeof v==='object'&&!Array.isArray(v)?v:{foods:[],water:0}};
function save(next,feedback){if(!storeVerified(KEY,next)){if(feedback)feedback.textContent='Save failed. Your previous data was kept; check device storage.';return false}data=next;return true}
const numeric=(id,max)=>{const el=$(id);if(!el.value.trim())return 0;return clean(el.value,max)};
function renderNutrition(){
 $('nutritionDate').textContent=selectedDate;
 const t=data.targets;
 for(const k of ['calories','protein','carbs','fat','water']){const el=$('target'+k[0].toUpperCase()+k.slice(1));if(document.activeElement!==el)el.value=t[k]||''}
 const d=day(),foods=Array.isArray(d.foods)?d.foods:[],sum=k=>foods.reduce((a,f)=>a+(Number(f[k])||0),0);
 const totals=[['Calories',sum('calories'),'kcal',t.calories],['Protein',sum('protein'),'g',t.protein],['Carbs',sum('carbs'),'g',t.carbs],['Fat',sum('fat'),'g',t.fat],['Water',Number(d.water)||0,'mL',t.water]];
 $('nutritionTotals').innerHTML=totals.map(([name,n,unit,target])=>`<div class="p20-kpi"><span>${name}</span><strong>${fmt(n)} <small>${unit}</small></strong><p>${target>0?`${fmt(target)} ${unit} target`:'No target set'}</p><div class="p20-meter"><i style="width:${target>0?Math.min(100,n/target*100):0}%"></i></div></div>`).join('');
 $('waterTotal').textContent=`${fmt(d.water)} mL`;
 $('foodEntries').innerHTML=foods.length?foods.map((f,i)=>`<div class="phase-item p20-entry"><div><strong>${escape(f.name)}</strong><small>${escape(f.meal)} · ${fmt(f.calories)} kcal · P ${fmt(f.protein)}g · C ${fmt(f.carbs)}g · F ${fmt(f.fat)}g</small></div><button type="button" data-delete-food="${i}" aria-label="Delete ${escape(f.name)}">Delete</button></div>`).join(''):'<p class="helper">No food entries for this date.</p>';
 const days=[];for(let i=6;i>=0;i--){const dt=dateFromKey(selectedDate);dt.setDate(dt.getDate()-i);const k=dateKey(dt),r=data.nutrition[k],entries=Array.isArray(r?.foods)?r.foods:[];days.push(`<div class="phase-item"><span>${k}</span><span>${entries.length} foods · ${fmt(entries.reduce((a,f)=>a+(Number(f.calories)||0),0))} kcal</span></div>`)}$('nutritionWeek').innerHTML=days.join('');
}
function renderMeasurements(){const m=data.measurements[selectedDate]||{};for(const k of ['waist','hips','chest','arm','thigh']){const el=$('measure'+k[0].toUpperCase()+k.slice(1));if(document.activeElement!==el)el.value=m[k]??''}
 const rows=Object.entries(data.measurements).filter(([,v])=>v&&typeof v==='object').sort(([a],[b])=>b.localeCompare(a)).slice(0,12);
 $('measurementHistory').innerHTML=rows.length?rows.map(([date,v])=>`<div class="phase-item"><strong>${escape(date)}</strong><span>${['waist','hips','chest','arm','thigh'].filter(k=>v[k]!=null).map(k=>`${k}: ${fmt(v[k])} cm`).join(' · ')}</span></div>`).join(''):'<p class="helper">No measurements saved yet.</p>';
}
function renderPhase20(){renderNutrition();renderMeasurements()}
$('saveNutritionTargets').addEventListener('click',()=>{const targets={};for(const [k,max] of [['calories',15000],['protein',1000],['carbs',1500],['fat',500],['water',10000]]){targets[k]=numeric('target'+k[0].toUpperCase()+k.slice(1),max);if(targets[k]===null){$('targetFeedback').textContent='Check target values: use non-negative numbers within the allowed range.';return}}if(save({...data,targets},$('targetFeedback'))){$('targetFeedback').textContent='Targets saved.';renderNutrition()}});
$('addFood').addEventListener('click',()=>{const name=$('foodName').value.trim(),meal=$('foodMeal').value,food={name,meal};if(!name){$('foodFeedback').textContent='Enter a food or meal name.';return}for(const [k,max] of [['calories',15000],['protein',1000],['carbs',1500],['fat',500]]){food[k]=numeric('food'+k[0].toUpperCase()+k.slice(1),max);if(food[k]===null){$('foodFeedback').textContent='Check nutrition values: use non-negative numbers.';return}}const old=day(),foods=Array.isArray(old.foods)?old.foods:[];if(foods.length>=200){$('foodFeedback').textContent='Maximum 200 entries per day.';return}const nutrition={...data.nutrition,[selectedDate]:{...old,foods:[...foods,food]}};if(save({...data,nutrition},$('foodFeedback'))){$('foodFeedback').textContent='Food saved.';for(const id of ['foodName','foodCalories','foodProtein','foodCarbs','foodFat'])$(id).value='';renderNutrition()}});
$('foodEntries').addEventListener('click',e=>{const btn=e.target.closest('[data-delete-food]');if(!btn)return;const i=Number(btn.dataset.deleteFood),old=day(),foods=Array.isArray(old.foods)?old.foods:[];if(!Number.isInteger(i)||i<0||i>=foods.length)return;const nutrition={...data.nutrition,[selectedDate]:{...old,foods:foods.filter((_,j)=>i!==j)}};if(save({...data,nutrition},$('foodFeedback'))){$('foodFeedback').textContent='Entry deleted.';renderNutrition()}});
document.querySelectorAll('[data-water]').forEach(btn=>btn.addEventListener('click',()=>{const old=day(),water=Math.max(0,Math.min(10000,(Number(old.water)||0)+Number(btn.dataset.water)));const nutrition={...data.nutrition,[selectedDate]:{...old,water}};if(save({...data,nutrition},$('waterFeedback'))){$('waterFeedback').textContent='Water updated.';renderNutrition()}}));
$('saveMeasurements').addEventListener('click',()=>{const values={};for(const k of ['waist','hips','chest','arm','thigh']){const el=$('measure'+k[0].toUpperCase()+k.slice(1));if(!el.value.trim())continue;const n=clean(el.value,400);if(n===null||n===0){$('measurementFeedback').textContent='Measurements must be greater than zero and at most 400 cm.';return}values[k]=n}if(!Object.keys(values).length){$('measurementFeedback').textContent='Enter at least one measurement, or use Delete.';return}const measurements={...data.measurements,[selectedDate]:values};if(save({...data,measurements},$('measurementFeedback'))){$('measurementFeedback').textContent='Measurements saved.';renderMeasurements()}});
$('deleteMeasurements').addEventListener('click',()=>{if(!data.measurements[selectedDate])return;if(!confirm('Delete measurements for '+selectedDate+'?'))return;const measurements={...data.measurements};delete measurements[selectedDate];if(save({...data,measurements},$('measurementFeedback'))){for(const k of ['waist','hips','chest','arm','thigh'])$('measure'+k[0].toUpperCase()+k.slice(1)).value='';$('measurementFeedback').textContent='Measurements deleted.';renderMeasurements()}});
const previousRender=render;render=function(){previousRender();renderPhase20()};renderPhase20();
})();
