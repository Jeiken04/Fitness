/* Accessible single-section Boxing mini-tabs. Does not touch workout storage. */
(() => {
  const root=document.getElementById('tab-boxing');
  if(!root)return;
  const buttons=[...root.querySelectorAll('[data-boxing-target]')];
  const targets=new Map(buttons.map(b=>[b.dataset.boxingTarget,document.getElementById(b.dataset.boxingTarget)]));
  function selectBoxingTab(id,focus=false){
    if(!targets.has(id))return false;
    for(const b of buttons){
      const selected=b.dataset.boxingTarget===id;
      b.classList.toggle('active',selected);
      b.setAttribute('aria-selected',String(selected));
      b.tabIndex=selected?0:-1;
      targets.get(b.dataset.boxingTarget).hidden=!selected;
    }
    if(focus)buttons.find(b=>b.dataset.boxingTarget===id)?.focus();
    return true;
  }
  window.dailyformShowBoxingSection=selectBoxingTab;
  buttons.forEach((b,i)=>{
    b.addEventListener('click',()=>selectBoxingTab(b.dataset.boxingTarget));
    b.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight')next=(i+1)%buttons.length;
      else if(event.key==='ArrowLeft')next=(i-1+buttons.length)%buttons.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=buttons.length-1;
      else return;
      event.preventDefault();selectBoxingTab(buttons[next].dataset.boxingTarget,true);
    });
  });
  root.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');
    if(link&&targets.has(link.hash.slice(1)))selectBoxingTab(link.hash.slice(1));
  });
  const hash=location.hash.slice(1);
  if(targets.has(hash))selectBoxingTab(hash);
  else selectBoxingTab('boxing-quick-log');
})();
