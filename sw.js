// Service Worker: macht die App nach dem ersten Laden offline nutzbar.
//
// Strategie:
//  - Die App-Datei (index.html / Navigations-Requests) wird "network-first" ausgeliefert:
//    solange das Gerät online ist, kommt IMMER die zuletzt deployte Version (wichtig, weil die
//    gesamte Logik inkl. Regeln in index.html steckt). Nur offline wird auf die zuletzt
//    gecachte Kopie zurückgefallen.
//  - Alle anderen Dateien (Icons, Schrift, CDN-Bibliotheken für die Lobby) werden
//    "cache-first, dann Netzwerk" bedient und beim ersten erfolgreichen Laden nachgecacht.
//  - Funktionen, die zwingend Internet brauchen (Lobby/Firebase-Verbindung), funktionieren
//    logischerweise nie offline, unabhängig vom Service Worker.
//
// Cache-Version: bei strukturellen Änderungen an dieser Datei hochzählen. Für App-Updates ist
// das NICHT nötig — die kommen durch die network-first-Auslieferung von selbst.
const CACHE = 'splitterblatt-v2';
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Einzeln statt cache.addAll(): so bricht ein einzelnes fehlendes Asset nicht den ganzen Precache ab.
    await Promise.all(PRECACHE.map(url => cache.add(url).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  // Nur GET cachen (POST/PUT etc. — z. B. Firebase-Schreibzugriffe — unangetastet lassen).
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isAppShell =
    req.mode === 'navigate' ||
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('/index.html');

  if (isAppShell) {
    // network-first: online immer die frische App, offline die letzte gecachte Kopie.
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res && res.status === 200) {
          const cache = await caches.open(CACHE);
          cache.put('./index.html', res.clone()).catch(() => {});
        }
        return res;
      } catch (e) {
        const cached = await caches.match('./index.html') || await caches.match('./');
        return cached || Response.error();
      }
    })());
    return;
  }

  // Alles andere: cache-first, dann Netzwerk (und erfolgreiche Antworten nachcachen).
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
        const cache = await caches.open(CACHE);
        cache.put(req, res.clone()).catch(() => {});
      }
      return res;
    } catch (e) {
      return cached || Response.error();
    }
  })());
});
