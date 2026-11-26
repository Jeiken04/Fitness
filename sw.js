/* DailyForm Android offline app shell. Never intercepts data export or localStorage. */
'use strict';
const CACHE = 'dailyform-android-shell-v30b1';
const CORE = ['index.html','strength-dashboard.css?v=30b1','strength-analytics.js?v=30b1','analytics.js?v=30a','backup-security.js?v=26c-security','reliability.js?v=26c-security','reliability.css?v=26c-security','style.css?v=26c-security','phase24.css?v=26c-security','phase24.js?v=26c-security','app.js?v=26c-security','navigation.js?v=26c-security','phase1.js?v=26c-security','polish.js?v=26c-security','phase12.js?v=26c-security','unified.js?v=26c-security','android.js?v=26c-security','phase20.js?v=26c-security','phase21.js?v=26c-security','phase22.js?v=26c-security','activity.css?v=26c-security','activity.js?v=26c-security','boxing-studio.css?v=26c-security','boxing-studio.js?v=26c-security','boxing-programs.js?v=26c-security','boxing-programs.css?v=26c-security','boxing-tabs.js?v=26c-security','storage-health.js?v=26c-security','manifest.json?v=26c-security','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png'];
const root = new URL('./', self.registration.scope);
const urls = CORE.map(path => new URL(path, root).href);
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(urls.map(url=>new Request(url,{cache:"reload"})));
    // Wait for existing app windows to close before activating.
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('dailyform-android-shell-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== root.origin) return;
  const url = new URL(request.url);
  if (!url.pathname.startsWith(root.pathname)) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      return (await cache.match(new URL('index.html', root).href)) || fetch(request);
    })());
    return;
  }
  if (!urls.includes(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    return (await cache.match(request)) || fetch(request);
  })());
});
