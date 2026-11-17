/* DailyForm Android offline app shell. Never intercepts data export or localStorage. */
'use strict';
const CACHE = 'dailyform-android-shell-v15';
const CORE = ['index.html','style.css?v=15-phase22-tab','app.js?v=15-phase22-tab','navigation.js?v=15-phase22-tab','phase1.js?v=15-phase22-tab','polish.js?v=15-phase22-tab','phase12.js?v=15-phase22-tab','unified.js?v=15-phase22-tab','android.js?v=15-phase22-tab','phase20.js?v=15-phase22-tab','phase21.js?v=15-phase22-tab','phase22.js?v=15-phase22-tab','manifest.json?v=15-phase22-tab','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png'];
const root = new URL('./', self.registration.scope);
const urls = CORE.map(path => new URL(path, root).href);
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(urls);
    await self.skipWaiting();
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
      try {return await fetch(request);} catch {
        const cache = await caches.open(CACHE);
        return (await cache.match(new URL('index.html', root).href)) || Response.error();
      }
    })());
    return;
  }
  if (!urls.includes(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    return (await cache.match(request)) || fetch(request);
  })());
});
