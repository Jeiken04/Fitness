/* DailyForm single-page tab navigation. Existing app logic and storage stay unchanged. */
(() => {
  const tabs = Array.from(document.querySelectorAll('[data-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-panel]'));
  const valid = new Set(tabs.map(el => el.dataset.tab));
  function show(tab, updateHash=true) {
    if (!valid.has(tab)) tab = 'dashboard';
    tabs.forEach(el => {const active=el.dataset.tab===tab;el.classList.toggle('active',active);el.setAttribute('aria-selected',String(active));el.tabIndex=active?0:-1;});
    panels.forEach(el => {el.hidden = el.dataset.panel !== tab;});
    if (updateHash) history.replaceState(null,'','#'+tab);
    window.scrollTo({top:0,behavior:'instant'});
  }
  tabs.forEach(el => el.addEventListener('click',() => show(el.dataset.tab)));
  tabs.forEach((el,i)=>el.addEventListener('keydown',event=>{let n;if(['ArrowRight','ArrowDown'].includes(event.key))n=(i+1)%tabs.length;else if(['ArrowLeft','ArrowUp'].includes(event.key))n=(i+tabs.length-1)%tabs.length;else if(event.key==='Home')n=0;else if(event.key==='End')n=tabs.length-1;else return;event.preventDefault();show(tabs[n].dataset.tab);tabs[n].focus();}));
  document.querySelector('.brand')?.addEventListener('click', e => {e.preventDefault();show('dashboard');});
  window.addEventListener('hashchange',()=>show(location.hash.slice(1),false));
  const legacy = {'overview':'dashboard','workouts':'dashboard','checklist':'dashboard','exercise-log':'strength','insights':'progress','progress-dashboard':'progress','weight-loss':'weight','calendar-section':'history'};
  const initial=location.hash.slice(1);show(legacy[initial]||initial||'dashboard',false);
  // From the dashboard, click a checklist row's label to jump to the relevant workout tab.
  document.getElementById('dailyChecklist')?.addEventListener('click', e => {
    if (e.target.closest('input,button')) return;
    const row=e.target.closest('.checklist-row');
    const label=row?.textContent?.toLowerCase()||'';
    for(const type of ['strength','cardio','boxing']) if(label.includes(type)){show(type);break;}
  });
})();
