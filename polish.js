/* DailyForm Phase 1.1: timer alerts, drafts, recent exercises. No legacy data migrations. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const PREF_KEY='dailyform-timer-preferences-v1';
const DRAFT_KEY='dailyform-exercise-drafts-v1';
const fields=['exerciseType','exerciseName','exerciseSets','exerciseReps','exerciseWeight'];
const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v&&typeof v==='object'?v:fallback}catch{return fallback}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
const prefs=read(PREF_KEY,{sound:true,vibrate:true});
$('timerSound').checked=prefs.sound!==false;
$('timerVibrate').checked=prefs.vibrate!==false;
for(const [id,key] of [['timerSound','sound'],['timerVibrate','vibrate']])$(id).addEventListener('change',e=>{prefs[key]=e.target.checked;write(PREF_KEY,prefs)});
let audio=null;
function unlockAudio(){if(!prefs.sound)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;audio=audio||new C();if(audio.state==='suspended')audio.resume().catch(()=>{});}catch{}}
function tone(frequency,duration=0.15,offset=0){if(!prefs.sound)return;try{unlockAudio();if(!audio||audio.state!=='running')return;const at=audio.currentTime+offset,osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=frequency;gain.gain.setValueAtTime(0.0001,at);gain.gain.exponentialRampToValueAtTime(0.19,at+0.012);gain.gain.exponentialRampToValueAtTime(0.0001,at+duration);osc.connect(gain);gain.connect(audio.destination);osc.start(at);osc.stop(at+duration+0.02);}catch{}}
function buzz(pattern){if(prefs.vibrate&&navigator.vibrate){try{navigator.vibrate(pattern)}catch{}}}
function cue(kind){if(kind==='start'){tone(740,.14);tone(980,.28,.17);buzz([110,70,170])}else if(kind==='end'){tone(920,.16);tone(660,.3,.2);buzz([200,100,200])}else if(kind==='finish'){tone(700,.16);tone(900,.16,.2);tone(1150,.38,.4);buzz([150,80,150,80,280])}else{tone(950,.09);buzz(70)}}
const clock=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
const seconds=ms=>Math.max(0,Math.ceil(ms/1000));
const clamp=(v,min,max,fallback)=>{const n=Number(v);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback};
function setupRest(){
 let remaining=90000,deadline=0,running=false,handle=null,lastSec=90;
 const duration=()=>clamp($('restSeconds').value,1,3600,90)*1000;
 const paint=()=>{$('restDisplay').textContent=clock(seconds(remaining));$('restStart').textContent=running?'Pause':remaining<=0?'Restart':remaining===duration()?'Start':'Resume';$('restStatus').textContent=running?'Resting · timer running':remaining<=0?'Rest complete':remaining===duration()?'Ready for your next set':'Paused · resume when ready'};
 const stop=()=>{running=false;clearInterval(handle);handle=null};
 const tick=()=>{if(!running)return;const before=lastSec;remaining=Math.max(0,deadline-Date.now());const now=seconds(remaining);if(now<before&&now>0&&now<=3)cue('tick');lastSec=now;if(remaining<=0){stop();cue('finish')}paint()};
 const reset=()=>{stop();remaining=duration();lastSec=seconds(remaining);paint()};
 $('restStart').addEventListener('click',()=>{unlockAudio();if(running){tick();stop();paint();return}if(remaining<=0)remaining=duration();deadline=Date.now()+remaining;lastSec=seconds(remaining);running=true;handle=setInterval(tick,120);paint()});
 $('restReset').addEventListener('click',reset);$('restSeconds').addEventListener('change',reset);reset();
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick()});
}
function setupBoxing(){
 let round=1,stage='round',remaining=180000,deadline=0,running=false,handle=null,lastSec=180;
 const settings=()=>({rounds:clamp($('boxingTimerRounds').value,1,30,6),roundMs:clamp($('boxingRoundSeconds').value,10,1800,180)*1000,restMs:clamp($('boxingRestSeconds').value,0,600,60)*1000});
 const stop=()=>{running=false;clearInterval(handle);handle=null};
 const paint=()=>{$('boxingTimerDisplay').textContent=clock(seconds(remaining));$('boxingTimerStatus').textContent=stage==='done'?'Workout complete':`${stage==='round'?'Round':'Rest after round'} ${round} / ${settings().rounds} · ${running?'Running':'Paused'}`;$('boxingTimerStart').textContent=running?'Pause':stage==='done'?'Restart':remaining===settings().roundMs&&round===1&&stage==='round'?'Start':'Resume'};
 const reset=()=>{stop();round=1;stage='round';remaining=settings().roundMs;lastSec=seconds(remaining);paint()};
 const tick=()=>{
  if(!running)return;
  const now=Date.now(),cfg=settings();let transitions=0;
  while(now>=deadline&&stage!=='done'&&transitions++<200){
   if(stage==='round'){
    if(round>=cfg.rounds){stage='done';remaining=0;stop();cue('finish');break}
    cue('end');if(cfg.restMs){stage='rest';deadline+=cfg.restMs}else{round++;stage='round';deadline+=cfg.roundMs;cue('start')}
   }else{round++;stage='round';deadline+=cfg.roundMs;cue('start')}
   lastSec=seconds(deadline-now);
  }
  if(stage!=='done'){
   remaining=Math.max(0,deadline-now);
   const s=seconds(remaining);
   if(s<lastSec){if(stage==='round'&&lastSec>10&&s<=10&&s>3)cue('tick');if(s>0&&s<=3)cue('tick')}
   lastSec=s;
  }
  paint();
 };
 $('boxingTimerStart').addEventListener('click',()=>{unlockAudio();if(running){tick();stop();paint();return}if(stage==='done')reset();deadline=Date.now()+remaining;lastSec=seconds(remaining);running=true;handle=setInterval(tick,120);if(stage==='round'&&round===1&&remaining===settings().roundMs)cue('start');paint()});
 $('boxingTimerReset').addEventListener('click',reset);
 for(const id of ['boxingTimerRounds','boxingRoundSeconds','boxingRestSeconds'])$(id).addEventListener('change',reset);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick()});reset();
}
setupRest();setupBoxing();
// Date-scoped drafts are stored separately from saved exercise logs.
let drafts=read(DRAFT_KEY,{});
const draftStatus=$('exerciseDraftStatus');
const currentDraft=()=>Object.fromEntries(fields.map(id=>[id,$(id).value]));
const restoreDraft=()=>{const d=drafts[selectedDate];fields.forEach(id=>{$(id).value=d&&typeof d[id]==='string'?d[id]:(id==='exerciseType'?'strength':'')});draftStatus.textContent=d?'Draft restored for '+selectedDate+'.':'Drafts are saved automatically on this device.'};
let draftTimer=null;
$('exerciseForm').addEventListener('input',()=>{clearTimeout(draftTimer);draftTimer=setTimeout(()=>{drafts[selectedDate]=currentDraft();draftStatus.textContent=write(DRAFT_KEY,drafts)?'Draft saved on this device.':'Could not save draft. Check browser storage.'},250)});
$('exerciseForm').addEventListener('change',()=>{clearTimeout(draftTimer);drafts[selectedDate]=currentDraft();draftStatus.textContent=write(DRAFT_KEY,drafts)?'Draft saved on this device.':'Could not save draft.'});
// Clear stale confirmation before the legacy handler processes a new submission.
$('exerciseForm').addEventListener('submit',()=>{$('exerciseMessage').textContent=''},true);
// This listener runs after the legacy submit handler; clear drafts only after a verified save.
$('exerciseForm').addEventListener('submit',()=>{setTimeout(()=>{if(($('exerciseMessage').textContent||'').startsWith('Exercise saved successfully')){clearTimeout(draftTimer);delete drafts[selectedDate];write(DRAFT_KEY,drafts);draftStatus.textContent='Exercise saved. Draft cleared.';refreshRecent()}},0)});
for(const id of ['prevDay','nextDay','todayBtn'])$(id).addEventListener('click',()=>{clearTimeout(draftTimer);restoreDraft()});
$('calendarGrid')?.addEventListener('click',()=>setTimeout(restoreDraft,0));
function recent(){const seen=new Set(),items=[];Object.keys(records).sort().reverse().forEach(day=>{const ex=records[day]?.exercises;if(!Array.isArray(ex))return;ex.slice().reverse().forEach(e=>{const key=String(e.name||'').trim().toLowerCase();if(key&&!seen.has(key)&&items.length<12){seen.add(key);items.push(e)}})});return items}
function refreshRecent(){const list=recent();$('recentExercises').replaceChildren();$('recentExerciseButtons').replaceChildren();for(const e of list){const option=document.createElement('option');option.value=e.name;$('recentExercises').append(option);const b=document.createElement('button');b.type='button';b.textContent=e.name;b.title='Reuse '+e.name;b.addEventListener('click',()=>{for(const [id,value] of Object.entries({exerciseName:e.name,exerciseType:e.type||'strength',exerciseSets:e.sets||'',exerciseReps:e.reps||'',exerciseWeight:e.weight||''}))$(id).value=value;drafts[selectedDate]=currentDraft();write(DRAFT_KEY,drafts);draftStatus.textContent='Recent exercise loaded. Review values and save when ready.';$('exerciseName').focus()});$('recentExerciseButtons').append(b)}if(!list.length)$('recentExerciseButtons').textContent='Saved exercises will appear here.'}
$('exerciseList').addEventListener('click',()=>setTimeout(refreshRecent,0));
restoreDraft();refreshRecent();
})();
