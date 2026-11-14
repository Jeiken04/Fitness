const STORAGE_KEY = 'dailyform-workouts-v1';
const types = ['strength', 'cardio', 'boxing'];
const labels = { strength: 'Strength', cardio: 'Cardio', boxing: 'Boxing' };
let selectedDate = dateKey(new Date());
let records = loadRecords();

function dateKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function loadRecords() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}
function saveRecords() { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }
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
render();
