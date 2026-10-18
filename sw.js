const CACHE = "xsho-v3";
const SHELL = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.hostname === "script.google.com" || u.hostname.endsWith("googleusercontent.com")) return;

  if (u.origin === location.origin) {
    // Sayt fayllari: avval tarmoq, bo'lmasa saqlangan nusxa
    e.respondWith(
      fetch(r).then(res => {
        if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
        return res;
      }).catch(() => caches.match(r).then(m => m || caches.match("index.html")))
    );
  } else if (u.hostname === "unpkg.com") {
    // Xarita kutubxonalari: avval saqlangan nusxa
    e.respondWith(
      caches.match(r).then(m => m || fetch(r).then(res => {
        if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
        return res;
      }))
    );
  }
});
