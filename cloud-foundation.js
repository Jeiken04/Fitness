'use strict';
(() => {
 const url = 'https://ynwqixqvztcjecbxisgn.supabase.co';
 const key = 'sb_publishable_p4R46_uHk5-tUqJnd__7yw_ziK9IvIn';
 const button = document.getElementById('cloudProbe');
 const status = document.getElementById('cloudProbeStatus');
 if (!button || !status) return;
 button.addEventListener('click', async () => {
  button.disabled = true;
  status.textContent = 'Checking development database…';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
   const response = await fetch(url + '/rest/v1/dailyform_connection_probe?select=schema_version&id=eq.1', {headers:{apikey:key,Accept:'application/json'},cache:'no-store',credentials:'omit',redirect:'error',signal:controller.signal});
   if (!response.ok) throw new Error('HTTP ' + response.status);
   const rows = await response.json();
   if (!Array.isArray(rows) || rows.length !== 1 || rows[0].schema_version !== 1) throw new Error('Unexpected schema response');
   status.textContent = 'Connected — foundation schema v1. Personal data sync is disabled.';
  } catch (error) {
   status.textContent = 'Connection check failed. Verify SQL setup, internet access and Data API settings. (' + (error.name === 'AbortError' ? 'Timeout' : error.message) + ')';
  } finally { clearTimeout(timeout); button.disabled = false; }
 });
})();
