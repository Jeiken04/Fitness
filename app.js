const STORAGE_KEY = 'dailyform-workouts-v1';
const types = ['strength', 'cardio', 'boxing'];
const labels = { strength: 'Strength', cardio: 'Cardio', boxing: 'Boxing' };
let selectedDate = dateKey(new Date());
let records = loadRecords();
let calendarMonth = new Date(new Date().getFullYear(),new Date().getMonth(),1);

function dateKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function loadRecords() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}
function storeVerified(key, data) {
  try {
    const payload = JSON.stringify(data);
    localStorage.setItem(key, payload);
    if (localStorage.getItem(key) !== payload) throw new Error('Storage verification failed');
    return true;
  } catch (error) {
    const message = 'Unable to save on this device. Open the app from its HTTPS website in a normal browser tab, check browser storage permissions and available space, then try again.';
    console.error('DailyForm save error:', error);
    showStorageError(message);
    return false;
  }
}
function showStorageError(message) {
  const banner = document.getElementById('storageError');
  if (banner) { banner.hidden = false; banner.textContent = message; }
}
function saveRecords() { return storeVerified(STORAGE_KEY, records); }
function dateFromKey(key) { const [y,m,d] = key.split('-').map(Number); return new Date(y,m-1,d); }
function formatDate(key, options={weekday:'short',month:'short',day:'numeric',year:'numeric'}) {
  return dateFromKey(key).toLocaleDateString(undefined, options);
}
function dayData() { return records[selectedDate] || {}; }

function render() {
  const today = dateKey(new Date());
  document.getElementById('dayLabel').textContent = selectedDate === today ? 'TODAY' : selectedDate > today ? 'UPCOMING' : 'PAST DAY';
  document.getElementById('dateLabel').textContent = formatDate(selectedDate);
  const data = dayData();
  const completed = types.filter(type => data[type]).length;
  const minutes = types.reduce((sum,type) => sum + (Number(data[type]?.duration) || 0), 0);
  document.getElementById('completionCount').textContent = `${completed}/3`;
  document.getElementById('totalMinutes').innerHTML = `${minutes} <small>min</small>`;
  document.getElementById('sessionSummary').textContent = completed ? `${completed} of 3 sessions logged` : 'No sessions logged yet';
  document.getElementById('progressRing').style.background = `conic-gradient(#1d2b1e ${completed/3*360}deg, #91b64c 0deg)`;

  types.forEach(type => {
    const card = document.querySelector(`[data-type="${type}"]`);
    const entry = data[type];
    card.classList.toggle('is-done', Boolean(entry));
    document.getElementById(`${type}Saved`).textContent = entry ? `✓ Saved · ${entry.duration || 0} min` : '✓ Session saved';
    const button = card.querySelector('.complete-button');
    button.innerHTML = entry ? '<span>✓</span> Update session' : '<span>＋</span> Log ' + labels[type].toLowerCase() + ' session';
    const fields = type === 'strength' ? ['Duration','Exercises','Notes'] : type === 'cardio' ? ['Duration','Distance','Notes'] : ['Duration','Rounds','Notes'];
    const ids = type === 'strength' ? ['strengthDuration','strengthExercises','strengthNotes'] : type === 'cardio' ? ['cardioDuration','cardioDistance','cardioNotes'] : ['boxingDuration','boxingRounds','boxingNotes'];
    ids.forEach((id,i) => {
      const input = document.getElementById(id);
      if (document.activeElement !== input) input.value = entry ? (i===0 ? entry.duration : i===1 ? entry.metric : entry.notes) ?? '' : '';
    });
  });
  renderHistory();
  renderChecklist();
  renderExercises();
  renderInsights();
  renderCalendar();
  renderWeight();
}
function logWorkout(type) {
  if (selectedDate > dateKey(new Date())) {
    alert('You can log workouts for today or a past date, not a future date.');
    return;
  }
  const prefix = type;
  const duration = Number(document.getElementById(`${prefix}Duration`).value) || 0;
  const metricId = type === 'strength' ? 'strengthExercises' : type === 'cardio' ? 'cardioDistance' : 'boxingRounds';
  const metric = document.getElementById(metricId).value;
  const notes = document.getElementById(`${prefix}Notes`).value.trim();
  if (duration <= 0 && !metric && !notes) {
    alert('Add at least a duration, a metric, or a note before saving this session.');
    return;
  }
  if (!records[selectedDate]) records[selectedDate] = {};
  records[selectedDate][type] = { duration, metric, notes, updatedAt: new Date().toISOString() };
  saveRecords();
  render();
}
function renderHistory() {
  const entries = [];
  Object.entries(records).sort(([a],[b]) => b.localeCompare(a)).forEach(([date, day]) => {
    types.forEach(type => {
      if (day[type]) entries.push({date,type,...day[type]});
    });
  });
  const container = document.getElementById('historyList');
  if (!entries.length) {
    container.innerHTML = '<div class="empty-state"><span>◎</span><strong>Your training story starts here.</strong><p>Log a session above and it will show up here.</p></div>';
    return;
  }
  container.innerHTML = entries.slice(0,30).map((entry,index) => {
    const metricLabel = entry.type === 'strength' ? `${entry.metric || '—'} exercises` : entry.type === 'cardio' ? `${entry.metric || '—'} mi` : `${entry.metric || '—'} rounds`;
    return `<div class="history-entry"><span class="history-date">${formatDate(entry.date,{month:'short',day:'numeric',year:'numeric'})}</span><div class="history-detail"><strong>${labels[entry.type]}</strong><p>${escapeHTML(entry.notes || 'Session logged')} · ${metricLabel}</p></div><span class="history-meta">${entry.duration || 0} MIN <button class="delete-entry" data-delete="${entry.date}|${entry.type}" aria-label="Delete ${labels[entry.type]} session">×</button></span></div>`;
  }).join('');
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

document.querySelectorAll('[data-save]').forEach(button => button.addEventListener('click', () => logWorkout(button.dataset.save)));
document.getElementById('prevDay').addEventListener('click', () => { const d=dateFromKey(selectedDate); d.setDate(d.getDate()-1); selectedDate=dateKey(d); render(); });
document.getElementById('nextDay').addEventListener('click', () => { const d=dateFromKey(selectedDate); d.setDate(d.getDate()+1); selectedDate=dateKey(d); render(); });
document.getElementById('todayBtn').addEventListener('click', () => { selectedDate=dateKey(new Date()); render(); });
document.getElementById('historyList').addEventListener('click', event => {
  const button = event.target.closest('[data-delete]');
  if (!button) return;
  const [date,type] = button.dataset.delete.split('|');
  if (!confirm(`Delete the ${labels[type]} session from ${formatDate(date)}?`)) return;
  delete records[date][type];
  if (!Object.keys(records[date]).length) delete records[date];
  saveRecords();
  render();
});

// A saved workout, including a checklist-only entry, counts as complete.
function renderChecklist(){
 const data=dayData();
 const count=types.filter(t=>Boolean(data[t])).length;
 document.getElementById('checklistCount').textContent=`${count} of 3 done`;
 document.getElementById('dailyChecklist').innerHTML=types.map(t=>`<label class="checklist-row ${data[t]?'checked':''}"><input type="checkbox" data-check="${t}" ${data[t]?'checked':''} ${selectedDate>dateKey(new Date())?'disabled':''}><span>${labels[t]}</span><small>${data[t]?'Completed':'Not completed'}</small></label>`).join('');
}
document.getElementById('dailyChecklist').addEventListener('change',e=>{
 const type=e.target.dataset.check;if(!types.includes(type))return;
 if(!records[selectedDate])records[selectedDate]={};
 if(e.target.checked) records[selectedDate][type]={duration:0,metric:'',notes:'',updatedAt:new Date().toISOString()};
 else delete records[selectedDate][type];
 if(!Object.keys(records[selectedDate]).length)delete records[selectedDate];
 saveRecords();render();
});
function exerciseNotice(message){const el=document.getElementById('exerciseMessage');if(el)el.textContent=message;}
function renderExercises(){
 const entries=Array.isArray(dayData().exercises)?dayData().exercises:[];
 document.getElementById('exerciseList').innerHTML=entries.map((e,i)=>`<div class="exercise-entry"><div><strong>${escapeHTML(e.name)}</strong><small>${labels[e.type]||'Workout'}</small></div><span class="exercise-values">${e.sets||0} sets × ${e.reps||0} reps${e.weight!==''?' · '+escapeHTML(String(e.weight))+' lb':''}</span><button type="button" data-remove-exercise="${i}" aria-label="Remove exercise">×</button></div>`).join('');
}
document.getElementById('exerciseForm').addEventListener('submit',e=>{
 e.preventDefault();if(selectedDate>dateKey(new Date())){alert('Choose today or an earlier date.');return;}
 const name=document.getElementById('exerciseName').value.trim();if(!name)return;
 if(!records[selectedDate])records[selectedDate]={};
 if(!Array.isArray(records[selectedDate].exercises))records[selectedDate].exercises=[];
 const num=id=>document.getElementById(id).value;
 records[selectedDate].exercises.push({name,type:document.getElementById('exerciseType').value,sets:num('exerciseSets'),reps:num('exerciseReps'),weight:num('exerciseWeight')});
 if (!saveRecords()) { exerciseNotice('Exercise could not be saved. Check the storage warning above.'); return; }
 exerciseNotice('Exercise saved successfully for '+formatDate(selectedDate)+'.');
 e.target.reset();render();
});
document.getElementById('exerciseList').addEventListener('click',e=>{
 const b=e.target.closest('[data-remove-exercise]');if(!b)return;
 const arr=dayData().exercises;if(!Array.isArray(arr))return;
 arr.splice(Number(b.dataset.removeExercise),1);
 if(!arr.length)delete records[selectedDate].exercises;
 if(!Object.keys(records[selectedDate]).length)delete records[selectedDate];
 saveRecords();render();
});
function completeCount(key){return types.filter(t=>Boolean(records[key]?.[t])).length;}
function renderInsights(){
 const today=dateFromKey(dateKey(new Date()));
 const completedDates=Object.keys(records).filter(k=>k<=dateKey(today)&&completeCount(k)===3).sort();
 const completedSet=new Set(completedDates);
 let best=0,run=0,previous='';
 completedDates.forEach(k=>{const expected=dateFromKey(k);expected.setDate(expected.getDate()-1);run=(previous===dateKey(expected))?run+1:1;best=Math.max(best,run);previous=k;});
 // A streak remains current if today or yesterday is fully completed.
 let cursor=new Date(today);
 if(!completedSet.has(dateKey(cursor)))cursor.setDate(cursor.getDate()-1);
 let current=0;
 while(completedSet.has(dateKey(cursor))){current++;cursor.setDate(cursor.getDate()-1);}
 document.getElementById('currentStreak').innerHTML=`${current} <small>days</small>`;
 document.getElementById('bestStreak').innerHTML=`${best} <small>days</small>`;
 const monday=new Date(today);monday.setDate(monday.getDate()-((monday.getDay()+6)%7));
 const summarize=start=>{let sessions=0,minutes=0,days=0;for(let i=0;i<7;i++){const d=new Date(start);d.setDate(d.getDate()+i);const data=records[dateKey(d)]||{};const count=types.filter(t=>Boolean(data[t])).length;sessions+=count;if(count)days++;types.forEach(t=>minutes+=Number(data[t]?.duration)||0);}return {sessions,minutes,days};};
 const prior=new Date(monday);prior.setDate(prior.getDate()-7);
 const now=summarize(monday),last=summarize(prior);
 document.getElementById('weeklySessions').innerHTML=`${now.sessions} <small>sessions</small>`;
 document.getElementById('weeklyMinutes').innerHTML=`${now.minutes} <small>min</small>`;
 document.getElementById('weeklyDays').innerHTML=`${now.days} <small>/ 7</small>`;
 const comparison=(n,p,unit)=>`${n-p>=0?'+':''}${n-p} ${unit} vs. last week`;
 document.getElementById('weeklySessionsDelta').textContent=comparison(now.sessions,last.sessions,'sessions');
 document.getElementById('weeklyMinutesDelta').textContent=comparison(now.minutes,last.minutes,'min');
}
function renderCalendar(){
 const year=calendarMonth.getFullYear(),month=calendarMonth.getMonth();
 document.getElementById('calendarTitle').textContent=calendarMonth.toLocaleDateString(undefined,{month:'long',year:'numeric'});
 const offset=(new Date(year,month,1).getDay()+6)%7;
 const days=new Date(year,month+1,0).getDate();
 let html=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<div class="calendar-weekday">${d}</div>`).join('');
 for(let i=0;i<offset;i++)html+='<div></div>';
 for(let d=1;d<=days;d++){
  const key=dateKey(new Date(year,month,d)),count=completeCount(key);
  html+=`<button type="button" class="calendar-day ${count===3?'full':count?'partial':''} ${key===selectedDate?'selected':''}" data-calendar-day="${key}" aria-label="${formatDate(key)}: ${count} of 3 workouts"><span>${d}</span><div class="calendar-dots">${'<i></i>'.repeat(count)}</div></button>`;
 }
 document.getElementById('calendarGrid').innerHTML=html;
}
document.getElementById('calendarPrev').addEventListener('click',()=>{calendarMonth.setMonth(calendarMonth.getMonth()-1);renderCalendar();});
document.getElementById('calendarNext').addEventListener('click',()=>{calendarMonth.setMonth(calendarMonth.getMonth()+1);renderCalendar();});
document.getElementById('calendarGrid').addEventListener('click',e=>{
 const b=e.target.closest('[data-calendar-day]');if(!b)return;
 selectedDate=b.dataset.calendarDay;render();document.getElementById('workouts').scrollIntoView({behavior:'smooth'});
});

// Separate weight-loss data store; existing workout records are unchanged.
const WEIGHT_KEY='dailyform-weight-v1';
function loadWeight(){try{const value=JSON.parse(localStorage.getItem(WEIGHT_KEY)||'{}');return {start:value.start||null,goal:value.goal||null,unit:value.unit==='kg'?'kg':'lb',entries:value.entries||{}};}catch{return {start:null,goal:null,unit:'lb',entries:{}};}}
let weightData=loadWeight();
function persistWeight(){return storeVerified(WEIGHT_KEY,weightData);}
function weightNotice(message){document.getElementById('weightMessage').textContent=message;}
function renderWeight(){
 const startInput=document.getElementById('weightStart'),goalInput=document.getElementById('weightGoal'),unitInput=document.getElementById('weightUnit'),dateInput=document.getElementById('weighDate');
 if(document.activeElement!==startInput)startInput.value=weightData.start??'';
 if(document.activeElement!==goalInput)goalInput.value=weightData.goal??'';
 if(document.activeElement!==unitInput)unitInput.value=weightData.unit;
 if(document.activeElement!==dateInput)dateInput.value=selectedDate;
 const sorted=Object.entries(weightData.entries).filter(([,v])=>Number.isFinite(Number(v))&&Number(v)>0).sort(([a],[b])=>a.localeCompare(b));
 const latest=sorted.length?Number(sorted[sorted.length-1][1]):null;
 const format=v=>v===null?'—':`${Number(v.toFixed(1))} ${weightData.unit}`;
 document.getElementById('weightLatest').textContent=format(latest);
 document.getElementById('weightChange').textContent=latest!==null&&weightData.start!==null?format(latest-weightData.start):'—';
 document.getElementById('weightRemaining').textContent=latest!==null&&weightData.goal!==null?format(Math.max(0,latest-weightData.goal)):'—';
 const distance=weightData.start!==null&&weightData.goal!==null?weightData.start-weightData.goal:0;
 const pct=distance>0&&latest!==null?Math.max(0,Math.min(100,(weightData.start-latest)/distance*100)):0;
 document.getElementById('weightProgressBar').style.width=pct+'%';
 document.getElementById('weightProgressLabel').textContent=distance>0&&latest!==null?`${Math.round(pct)}% toward goal`:distance>0?'Log a weigh-in to begin':'Set a lower goal weight to begin';
 const history=document.getElementById('weighHistory');
 history.innerHTML=sorted.length?sorted.slice().reverse().map(([date,val])=>`<div class="weight-history-row"><span>${formatDate(date)}</span><strong>${Number(val)} ${weightData.unit}</strong><button type="button" data-remove-weight="${date}" aria-label="Delete weigh-in from ${date}">×</button></div>`).join(''):'<p class="weight-empty">No weigh-ins yet. Log your first weight above.</p>';
 const chart=document.getElementById('weightChart');
 if(sorted.length<2){chart.textContent='Log at least two weigh-ins to see your trend.';return;}
 const values=sorted.map(([,v])=>Number(v)),lo=Math.min(...values),hi=Math.max(...values),pad=Math.max(1,(hi-lo)*.2),min=lo-pad,max=hi+pad;
 const width=600,height=170,left=34,right=12,top=15,bottom=30;
 const x=i=>left+(sorted.length===1?0:i/(sorted.length-1))*(width-left-right);
 const y=v=>top+(max-v)/(max-min)*(height-top-bottom);
 const points=values.map((v,i)=>`${x(i)},${y(v)}`).join(' ');
 const dots=values.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="#c7f36b"><title>${sorted[i][0]}: ${v} ${weightData.unit}</title></circle>`).join('');
 chart.innerHTML=`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Weight trend from ${values[0]} to ${values[values.length-1]} ${weightData.unit}"><line x1="${left}" y1="${top}" x2="${left}" y2="${height-bottom}" stroke="#465449"/><line x1="${left}" y1="${height-bottom}" x2="${width-right}" y2="${height-bottom}" stroke="#465449"/><text x="0" y="${top+4}" fill="#98a39a" font-size="11">${Number(hi.toFixed(1))}</text><text x="0" y="${height-bottom}" fill="#98a39a" font-size="11">${Number(lo.toFixed(1))}</text><polyline fill="none" stroke="#c7f36b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${points}"/>${dots}<text x="${left}" y="${height-5}" fill="#98a39a" font-size="11">${sorted[0][0]}</text><text x="${width-right}" y="${height-5}" text-anchor="end" fill="#98a39a" font-size="11">${sorted[sorted.length-1][0]}</text></svg>`;
}
document.getElementById('saveWeightGoal').addEventListener('click',()=>{
 const start=Number(document.getElementById('weightStart').value),goal=Number(document.getElementById('weightGoal').value),unit=document.getElementById('weightUnit').value;
 if(!Number.isFinite(start)||!Number.isFinite(goal)||start<=0||goal<=0||goal>=start){weightNotice('Enter a starting weight and a lower, positive goal weight.');return;}
 if(Object.keys(weightData.entries).length&&weightData.unit!==unit&&!confirm('Changing units does not convert previous weigh-ins. Continue?'))return;
 weightData.start=start;weightData.goal=goal;weightData.unit=unit;
 if(!persistWeight()){weightNotice('Goal was NOT saved. Check the storage warning above.');return;}
 weightNotice('✓ Goal saved successfully.');renderWeight();
});
document.getElementById('saveWeighIn').addEventListener('click',()=>{
 const date=document.getElementById('weighDate').value,raw=document.getElementById('weighValue').value,value=Number(raw);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date>dateKey(new Date())){weightNotice('Choose today or a past date.');return;}
 if(raw.trim()===''||!Number.isFinite(value)||value<=0){weightNotice('Enter a valid positive weight.');return;}
 weightData.entries[date]=value;
 if(!persistWeight()){weightNotice('Weigh-in was NOT saved. Check the storage warning above.');return;}
 document.getElementById('weighValue').value='';weightNotice('✓ Weigh-in saved successfully for '+formatDate(date)+'.');renderWeight();
});
document.getElementById('weighHistory').addEventListener('click',e=>{const btn=e.target.closest('[data-remove-weight]');if(!btn)return;if(!confirm('Delete this weigh-in?'))return;delete weightData.entries[btn.dataset.removeWeight];persistWeight();renderWeight();});

// Combined training + weight analytics. Existing storage formats remain unchanged.
function mondayOf(date){const d=new Date(date.getFullYear(),date.getMonth(),date.getDate());d.setDate(d.getDate()-(d.getDay()+6)%7);return d;}
function combinedWeeks(count){
 const current=mondayOf(new Date()),weeks=[];
 for(let i=count-1;i>=0;i--){
  const start=new Date(current);start.setDate(start.getDate()-7*i);
  const end=new Date(start);end.setDate(end.getDate()+6);
  const totals={strength:0,cardio:0,boxing:0,sessions:0,minutes:0};
  for(let day=0;day<7;day++){
   const date=new Date(start);date.setDate(date.getDate()+day);
   if(date>new Date())continue;
   const data=records[dateKey(date)]||{};
   types.forEach(type=>{if(data[type]){totals.sessions++;const minutes=Number(data[type].duration)||0;totals[type]+=minutes;totals.minutes+=minutes;}});
  }
  const weighIns=Object.entries(weightData.entries).filter(([key,val])=>key>=dateKey(start)&&key<=dateKey(end)&&key<=dateKey(new Date())&&Number.isFinite(Number(val))&&Number(val)>0).sort(([a],[b])=>a.localeCompare(b));
  weeks.push({start,end,...totals,weighIns});
 }
 return weeks;
}
function renderCombinedProgress(){
 const count=Number(document.getElementById('combinedRange').value)||8;
 const weeks=combinedWeeks(count),start=dateKey(weeks[0].start),today=dateKey(new Date());
 const totalSessions=weeks.reduce((n,w)=>n+w.sessions,0),totalMinutes=weeks.reduce((n,w)=>n+w.minutes,0);
 const weighIns=Object.entries(weightData.entries).filter(([key,val])=>key>=start&&key<=today&&Number.isFinite(Number(val))&&Number(val)>0).sort(([a],[b])=>a.localeCompare(b));
 document.getElementById('combinedWorkouts').textContent=String(totalSessions);
 document.getElementById('combinedTime').textContent=totalMinutes.toLocaleString()+' min';
 document.getElementById('combinedWeightUnit').textContent=weightData.unit;
 const change=weighIns.length>=2?Number(weighIns[weighIns.length-1][1])-Number(weighIns[0][1]):null;
 document.getElementById('combinedWeightChange').textContent=change===null?'—':`${change>0?'+':''}${Number(change.toFixed(1))} ${weightData.unit}`;
 const chart=document.getElementById('combinedTrainingChart');
 const W=560,H=210,L=39,R=12,T=15,B=38,plotH=H-T-B;
 const max=Math.max(1,...weeks.map(w=>w.minutes));
 const slot=(W-L-R)/weeks.length,bw=Math.min(32,slot*.57);
 let bars='';
 weeks.forEach((week,i)=>{
  const x=L+slot*(i+.5)-bw/2;let y=H-B;
  [['strength','#c7f36b'],['cardio','#83b9ee'],['boxing','#f2a66b']].forEach(([type,color])=>{
   const height=week[type]/max*plotH;y-=height;
   if(height>0)bars+=`<rect x="${x}" y="${y}" width="${bw}" height="${height}" rx="2" fill="${color}"><title>${type}: ${week[type]} min, week of ${dateKey(week.start)}</title></rect>`;
  });
  bars+=`<text x="${x+bw/2}" y="${H-15}" text-anchor="middle" fill="#98a39a" font-size="10">${week.start.toLocaleDateString(undefined,{month:'short',day:'numeric'})}</text>`;
 });
 chart.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Stacked weekly training minutes"><line x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}" stroke="#465449"/><text x="2" y="${T+5}" fill="#98a39a" font-size="10">${max}m</text><text x="2" y="${H-B}" fill="#98a39a" font-size="10">0</text>${bars}</svg>`;
 const weightChart=document.getElementById('combinedWeightChart');
 if(weighIns.length<2){weightChart.textContent='Log at least two weigh-ins in this period to see a weight trend.';}
 else{
  const vals=weighIns.map(([,v])=>Number(v)),minVal=Math.min(...vals),maxVal=Math.max(...vals),padding=Math.max(.5,(maxVal-minVal)*.15);
  const min=minVal-padding,max=maxVal+padding;
  const first=dateFromKey(start).getTime(),last=new Date().getTime(),span=Math.max(1,last-first);
  const x=key=>L+(dateFromKey(key).getTime()-first)/span*(W-L-R);
  const y=value=>T+(max-value)/(max-min)*plotH;
  const points=weighIns.map(([key,value])=>`${x(key)},${y(Number(value))}`).join(' ');
  const dots=weighIns.map(([key,value])=>`<circle cx="${x(key)}" cy="${y(Number(value))}" r="4" fill="#c7f36b"><title>${key}: ${value} ${weightData.unit}</title></circle>`).join('');
  weightChart.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Weight measurements from ${vals[0]} to ${vals[vals.length-1]} ${weightData.unit}"><line x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}" stroke="#465449"/><text x="2" y="${T+5}" fill="#98a39a" font-size="10">${Number(maxVal.toFixed(1))}</text><text x="2" y="${H-B}" fill="#98a39a" font-size="10">${Number(minVal.toFixed(1))}</text><polyline fill="none" stroke="#c7f36b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${points}"/>${dots}<text x="${L}" y="${H-15}" fill="#98a39a" font-size="10">${weighIns[0][0].slice(5)}</text><text x="${W-R}" y="${H-15}" text-anchor="end" fill="#98a39a" font-size="10">${weighIns[weighIns.length-1][0].slice(5)}</text></svg>`;
 }
 document.getElementById('combinedWeekRows').innerHTML=weeks.slice().reverse().map(w=>{
  const latest=w.weighIns.length?`${Number(w.weighIns[w.weighIns.length-1][1])} ${weightData.unit}`:'—';
  return `<tr><td>${w.start.toLocaleDateString(undefined,{month:'short',day:'numeric'})}</td><td>${w.strength} min</td><td>${w.cardio} min</td><td>${w.boxing} min</td><td>${w.minutes} min</td><td>${latest}</td></tr>`;
 }).join('');
}
document.getElementById('combinedRange').addEventListener('change',renderCombinedProgress);
// Wrap existing rendering functions so all changes immediately refresh the combined dashboard.
const previousRender=render;
render=function(){previousRender();renderCombinedProgress();};
const previousRenderWeight=renderWeight;
renderWeight=function(){previousRenderWeight();renderCombinedProgress();};
render();
