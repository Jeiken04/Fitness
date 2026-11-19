/* Phase 2.4.5: Local Apple Health export import; never uploads or transmits health records. */
(()=>{'use strict';
const KEY='dailyform-watch-activity-v1';const $=id=>document.getElementById(id);
const fmt=n=>Math.round(n||0).toLocaleString();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}
function status(s){$('watchFeedback').textContent=s}
function dateKey(s){const m=String(s||'').match(/^(\d{4}-\d\d-\d\d)/);return m?m[1]:null}
function attrs(tag){const out={};for(const m of tag.matchAll(/([A-Za-z][\w]*)\s*=\s*(["'])(.*?)\2/g))out[m[1]]=m[3];return out}
function units(v,unit,target){const n=Number(v);if(!Number.isFinite(n)||n<0)return 0;if(target==='km')return unit==='mi'?n*1.609344:unit==='m'?n/1000:n;if(target==='kcal')return unit==='kJ'?n/4.184:n;return n}
function aggregate(xml){if(!xml.includes('<HealthData')&&!xml.includes('<Record')&&!xml.includes('<Workout'))throw Error('This does not look like an Apple Health export.');
 const days={};const workouts=[];let count=0;const get=d=>days[d]||(days[d]={steps:0,active:0,exercise:0,distance:0,heartSum:0,heartCount:0,workouts:0});
 // Match start tags only; do not retain or process sensitive fields such as medications, diagnoses, or reproductive health.
 const re=/<(Record|Workout)\b[^>]*>/g;let match;
 while((match=re.exec(xml))!==null){const a=attrs(match[0]);const d=dateKey(a.startDate);if(!d)continue;const v=Number(a.value);const row=get(d);
 if(match[1]==='Record'){
  if(!Number.isFinite(v)||v<0)continue;
  switch(a.type){
   case 'HKQuantityTypeIdentifierStepCount':row.steps+=v;count++;break;
   case 'HKQuantityTypeIdentifierActiveEnergyBurned':row.active+=units(v,a.unit,'kcal');count++;break;
   case 'HKQuantityTypeIdentifierAppleExerciseTime':row.exercise+=v;count++;break;
   case 'HKQuantityTypeIdentifierDistanceWalkingRunning':row.distance+=units(v,a.unit,'km');count++;break;
   case 'HKQuantityTypeIdentifierHeartRate':row.heartSum+=v;row.heartCount++;count++;break;
  }
 }else if(workouts.length<5000){const seconds=Number(a.duration)||0;const w={day:d,type:String(a.workoutActivityType||'Workout').replace(/^HKWorkoutActivityType/,''),minutes:a.durationUnit==='hr'?seconds*60:a.durationUnit==='sec'?seconds/60:seconds,energy:units(a.totalEnergyBurned,a.totalEnergyBurnedUnit,'kcal')};workouts.push(w);row.workouts++;count++}
 }
 if(!count)throw Error('No supported activity records found.');
 return {importedAt:new Date().toISOString(),days,workouts:workouts.sort((a,b)=>b.day.localeCompare(a.day)),count};
}
async function unzip(file){const buf=await file.arrayBuffer();const bytes=new Uint8Array(buf);const dv=new DataView(buf);const decoder=new TextDecoder();
 // Find the ZIP central directory to locate export.xml, even if other ZIP entries precede it.
 let eocd=-1;for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--){if(dv.getUint32(i,true)===0x06054b50){eocd=i;break}}
 if(eocd<0)throw Error('Invalid ZIP archive.');let pos=dv.getUint32(eocd+16,true);const total=dv.getUint16(eocd+10,true);
 for(let i=0;i<total;i++){
  if(dv.getUint32(pos,true)!==0x02014b50)throw Error('Invalid ZIP file index.');
  const method=dv.getUint16(pos+10,true),compressed=dv.getUint32(pos+20,true),uncompressed=dv.getUint32(pos+24,true),n=dv.getUint16(pos+28,true),extra=dv.getUint16(pos+30,true),comment=dv.getUint16(pos+32,true),offset=dv.getUint32(pos+42,true),name=decoder.decode(bytes.subarray(pos+46,pos+46+n));pos+=46+n+extra+comment;
  if(!/(^|\/)export\.xml$/i.test(name))continue;
  if(uncompressed>180*1024*1024)throw Error('Export XML is too large for browser import (180 MB limit).');
  if(dv.getUint32(offset,true)!==0x04034b50)throw Error('Invalid ZIP entry.');
  const start=offset+30+dv.getUint16(offset+26,true)+dv.getUint16(offset+28,true);const payload=bytes.slice(start,start+compressed);
  if(method===0)return decoder.decode(payload);
  if(method!==8)throw Error('Unsupported ZIP compression. Extract export.xml manually.');
  if(typeof DecompressionStream==='undefined')throw Error('ZIP decompression unavailable. Extract export.xml manually.');
  try{const stream=new Blob([payload]).stream().pipeThrough(new DecompressionStream('deflate-raw'));return await new Response(stream).text()}
  catch{throw Error('This browser cannot unpack this ZIP. Extract export.xml and import that file instead.')}
 }
 throw Error('export.xml was not found in the ZIP.');
}
function render(){const data=read();const days=data?.days||{};const keys=Object.keys(days).sort();const today=new Date().toLocaleDateString('en-CA');const input=$('watchDay');if(!input.value)input.value=keys.at(-1)||today;const d=days[input.value]||{};
 const metrics=[['Steps',fmt(d.steps)],['Active calories',fmt(d.active)+' kcal'],['Exercise time',fmt(d.exercise)+' min'],['Distance',((d.distance||0).toFixed(2))+' km'],['Average recorded heart rate',d.heartCount?fmt(d.heartSum/d.heartCount)+' bpm':'—'],['Workouts',fmt(d.workouts)]];
 $('watchMetrics').innerHTML=metrics.map(([k,v])=>`<div class="activity-metric"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('');
 $('watchImportedAt').textContent=data?`Last imported ${new Date(data.importedAt).toLocaleString()} · ${fmt(data.count)} supported records · ${fmt(keys.length)} days. Importing again replaces these records.`:'No Apple Health data imported yet.';
 const recent=keys.slice(-14);const max=Math.max(1,...recent.map(k=>days[k].steps||0));$('watchTrend').innerHTML=recent.length?recent.map(k=>`<div class="activity-trend-row"><span>${esc(k.slice(5))}</span><div class="activity-track"><div class="activity-fill" style="width:${Math.min(100,100*(days[k].steps||0)/max).toFixed(1)}%"></div></div><strong>${fmt(days[k].steps)} steps</strong></div>`).join(''):'<p class="helper">Import your Apple Health export to see daily steps.</p>';
 $('watchWorkouts').innerHTML=data?.workouts?.length?data.workouts.slice(0,50).map(w=>`<div class="phase-panel"><strong>${esc(w.type.replace(/([a-z])([A-Z])/g,'$1 $2'))}</strong> · ${esc(w.day)}<p class="helper">${fmt(w.minutes)} min · ${fmt(w.energy)} kcal (if recorded)</p></div>`).join(''):'<p class="helper">No imported workouts yet.</p>';
}
$('watchImport').addEventListener('click',async()=>{const file=$('watchImportFile').files?.[0];if(!file){status('Select a ZIP or export.xml file first.');return}if(file.size>600*1024*1024){status('File exceeds the 600 MB ZIP limit. Extract export.xml or use a smaller export.');return}
 $('watchImport').disabled=true;status('Reading Apple Health export locally… this may take a moment.');await new Promise(r=>setTimeout(r,30));try{const xml=/\.zip$/i.test(file.name)?await unzip(file):await file.text();const data=aggregate(xml);const json=JSON.stringify(data);try{localStorage.setItem(KEY,json)}catch{throw Error('Not enough browser storage for this export. Existing watch data was not changed.')} $('watchDay').value='';render();status(`Imported ${fmt(data.count)} supported records. Previous watch import replaced; manual DailyForm workouts unchanged.`)}catch(e){status('Import failed: '+e.message)}finally{$('watchImport').disabled=false}});
$('watchClear').addEventListener('click',()=>{if(!confirm('Remove imported Apple Health activity from this browser? Your manually logged DailyForm workouts will stay.'))return;localStorage.removeItem(KEY);$('watchDay').value='';render();status('Imported watch data removed.')});$('watchDay').addEventListener('change',render);render();
})();