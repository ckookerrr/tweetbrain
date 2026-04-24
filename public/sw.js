const CACHE = "tweetbrain-v1"
const STATIC = ["/", "/drafts", "/queue", "/results", "/manifest.json", "/icon-192.png", "/icon-512.png"]

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC)).then(() => self.skipWaiting()))
})

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (e) => {
  // Don't intercept API calls — always go to network
  if (e.request.url.includes("/api/")) return

  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).catch(() => caches.match("/")))
  )
})
