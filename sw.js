/* Pappilon service worker: app-shell cache + reminder notifications */
const VERSION = 'pappilon-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'];
const STATIC_HOSTS = ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  // Never cache Supabase, Google Maps/Street View or map tiles: live data / licensed imagery.
  const isStatic = url.origin === location.origin || STATIC_HOSTS.includes(url.hostname);
  if (!isStatic) return;
  if (req.mode === 'navigate') {
    // network-first so updates arrive; fall back to cached shell when offline
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', copy)); return r; }).catch(() => caches.match('./index.html')));
    return;
  }
  // stale-while-revalidate for everything else
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});

/* ---------- reminders ---------- */
// The page sends its reminder settings + "recorded today" state; the worker keeps them in IndexedDB-free memory
// plus the Cache API so periodic sync can use them while the page is closed.
const STATE_URL = './__reminder_state__';
async function readState() { try { const r = await (await caches.open(VERSION + '-state')).match(STATE_URL); return r ? await r.json() : null; } catch { return null; } }
async function writeState(s) { try { await (await caches.open(VERSION + '-state')).put(STATE_URL, new Response(JSON.stringify(s), { headers: { 'Content-Type': 'application/json' } })); } catch {} }
const todayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

async function maybeNotify(force = false) {
  const s = await readState();
  if (!s || !s.enabled) return;
  const now = new Date(), key = todayKey(now);
  if (s.lastRecorded === key) return;            // already recorded today
  if (!force && s.lastNotified === key) return;  // already nudged today
  const [h, m] = String(s.time || '18:00').split(':').map(Number);
  const due = new Date(now); due.setHours(h, m, 0, 0);
  if (!force && now < due) return;               // not time yet
  try {
    await self.registration.showNotification('Pappilon — daily check-in', {
      body: 'You haven’t recorded any places today. Add a place or code an image — it only takes a minute.',
      icon: './icons/icon-192.png', badge: './icons/icon-192.png', tag: 'pappilon-daily', renotify: false,
      data: { url: './?action=report' }
    });
  } catch { return; }   // permission not granted
  s.lastNotified = key; await writeState(s);
}

self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type === 'reminder-state') e.waitUntil((async () => {
    const old = await readState(), s = d.state || {};
    // keep the later "already notified" day so a page refresh never causes a duplicate
    if (old && old.lastNotified && (!s.lastNotified || old.lastNotified > s.lastNotified) && !d.reset) s.lastNotified = old.lastNotified;
    await writeState(s); await maybeNotify(false);
  })());
  if (d.type === 'reminder-test') e.waitUntil(self.registration.showNotification('Pappilon — test reminder', { body: 'Reminders are working on this device.', icon: './icons/icon-192.png', badge: './icons/icon-192.png', tag: 'pappilon-test', data: { url: './' } }).catch(() => {}));
});
// Chrome on Android (installed PWA) may fire this roughly daily; it's best-effort and not guaranteed.
self.addEventListener('periodicsync', e => { if (e.tag === 'pappilon-daily-check') e.waitUntil(maybeNotify(false)); });

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    for (const c of cs) { if ('focus' in c) { c.postMessage({ type: 'notification-click' }); return c.focus(); } }
    return self.clients.openWindow(target);
  }));
});
