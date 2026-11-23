/* DailyForm Android offline app shell. Never intercepts data export or localStorage. */
'use strict';
const CACHE = 'dailyform-android-shell-v23';
const CORE = ['index.html','style.css?v=23-phase25b','phase24.css?v=23-phase25b','phase24.js?v=23-phase25b','app.js?v=23-phase25b','navigation.js?v=23-phase25b','phase1.js?v=23-phase25b','polish.js?v=23-phase25b','phase12.js?v=23-phase25b','unified.js?v=23-phase25b','android.js?v=23-phase25b','phase20.js?v=23-phase25b','phase21.js?v=23-phase25b','phase22.js?v=23-phase25b','activity.css?v=23-phase25b','activity.js?v=23-phase25b','boxing-studio.css?v=23-phase25b','boxing-studio.js?v=23-phase25b','boxing-programs.js?v=23-phase25b','boxing-programs.css?v=23-phase25b','manifest.json?v=23-phase25b','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png'];
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
