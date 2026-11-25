/* Phase 2.6A: read-only diagnostics. No user records are modified. */
(()=>{'use strict';
const keys=['dailyform-workouts-v1','dailyform-weights-v1','dailyform-templates-v1','dailyform-exercise-drafts-v1','dailyform-timer-preferences-v1','dailyform-phase12-v1','dailyform-unified-v1','dailyform-phase20-v1','dailyform-phase21-v1','dailyform-phase22-v1','dailyform-watch-activity-v1','dailyform-boxing-studio-v1','dailyform-boxing-programs-v1'];
const button=document.getElementById('runStorageHealth'),status=document.getElementById('storageHealthStatus'),results=document.getElementById('storageHealthResults');if(!button||!status||!results)return;
button.addEventListener('click',async()=>{
 button.disabled=true;results.replaceChildren();let failures=[],count=0,bytes=0;
 try{
  const probe='dailyform-health-probe-'+Date.now();
  try{localStorage.setItem(probe,'ok');if(localStorage.getItem(probe)!=='ok')throw Error('Read-back failed');}catch(e){failures.push('Storage write test failed: '+e.message)}finally{try{localStorage.removeItem(probe)}catch{}}
  for(const key of keys){let raw;try{raw=localStorage.getItem(key)}catch(e){failures.push('Cannot read '+key);continue}if(raw===null)continue;count++;bytes+=new Blob([raw]).size;try{JSON.parse(raw)}catch{failures.push('Invalid JSON: '+key)}}
  const summary=document.createElement('p');summary.textContent=count+' saved data categories checked · '+(bytes/1024).toFixed(1)+' KB stored · '+failures.length+' issue(s)';results.append(summary);
  if(failures.length){const list=document.createElement('ul');for(const issue of failures){const li=document.createElement('li');li.textContent=issue;list.append(li)}results.append(list);status.textContent='Storage check found issues. Export a backup before making changes.'}
  else status.textContent='Storage check passed. Existing records were not changed.';
  if(navigator.storage&&navigator.storage.estimate){try{const estimate=await navigator.storage.estimate();if(Number.isFinite(estimate.usage)&&Number.isFinite(estimate.quota)){const p=document.createElement('p');p.textContent='Estimated site storage: '+(estimate.usage/1024/1024).toFixed(1)+' MB of '+(estimate.quota/1024/1024).toFixed(0)+' MB available quota (browser estimate).';results.append(p)}}catch{}}
 }catch(e){status.textContent='Storage check could not finish: '+e.message}finally{button.disabled=false}
});
})();
