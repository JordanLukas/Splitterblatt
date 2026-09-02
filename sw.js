// Service Worker: macht die App nach dem ersten Laden offline nutzbar.
// Cache-Strategie: "Cache-first, dann Netzwerk" für die App-Datei selbst (funktioniert immer
// offline, sobald einmal geladen). Für externe CDN-Bibliotheken (Schrift, QR, Firebase) wird
// zusätzlich versucht, sie beim ersten Laden mitzuspeichern — aber Funktionen, die zwingend
// Internet brauchen (Lobby/Firebase-Verbindung), funktionieren logischerweise nie offline,
// unabhängig vom Service Worker.
const CACHE_NAME = 'splitterblatt-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './firebase-config.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  // Nur GET-Anfragen cachen (POST/PUT etc. — z.B. Firebase-Schreibzugriffe — unangetastet lassen).
  if(req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(cached => {
      if(cached) return cached;
      return fetch(req).then(res => {
        // Erfolgreiche Antworten zusätzlich cachen (auch externe CDN-Dateien), damit ein
        // zweiter Offline-Start auch diese enthält.
        if(res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')){
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, resClone)).catch(()=>{});
        }
        return res;
      }).catch(() => cached); // offline und nicht im Cache: schlägt fehl (z.B. Firebase-Aufrufe)
    })
  );
});
