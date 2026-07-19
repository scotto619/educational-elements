
const CACHE="dinner-planner-v1";
const ASSETS=["./","./index.html","./styles.css","./data.js","./app.js","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener("activate",event=>event.waitUntil(self.clients.claim()));
self.addEventListener("fetch",event=>event.respondWith(caches.match(event.request).then(found=>found||fetch(event.request))));
