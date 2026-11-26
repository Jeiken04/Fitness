(()=>{'use strict';
const $=id=>document.getElementById(id);
const status=msg=>{$('offlineStatus').textContent=msg;};
let errors=0;
function report(){errors++;$('runtimeStatus').textContent=`Unexpected app errors this visit: ${errors}. Export a backup if possible before reloading.`;}
window.addEventListener('error',report,true);window.addEventListener('unhandledrejection',report);
if(!('serviceWorker' in navigator)||!isSecureContext){status('Offline installation requires a supported browser and HTTPS.');return;}
let registration;
function describe(){if(registration?.waiting)status('Update downloaded. Save your work, close all DailyForm windows, then reopen.');else if(navigator.serviceWorker.controller)status('Offline app shell active.');else status('Offline setup pending. Reopen after installation completes.');}
function watch(worker){worker?.addEventListener('statechange',describe);}
(async()=>{try{registration=await navigator.serviceWorker.register('./sw.js',{scope:'./'});watch(registration.installing);registration.addEventListener('updatefound',()=>watch(registration.installing));describe();}catch{status('Offline setup failed. Try again while online.');}})();
navigator.serviceWorker.addEventListener('controllerchange',describe);
$('checkUpdate').addEventListener('click',async()=>{if(!registration){status('Offline registration unavailable. Reload while online.');return;}try{await registration.update();describe();}catch{status('Update check failed. Check your internet connection.');}});
})();
