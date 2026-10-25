// WeatherBoard Service Worker
// Caches the app shell and weather API responses for offline use.

const SHELL_CACHE = "wb-shell-v1";
const API_CACHE = "wb-api-v1";

const SHELL_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-192.svg",
  "/icon-512.svg",
  "/favicon.ico",
];

// ---------- Install ----------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

// ---------- Activate ----------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL_CACHE && k !== API_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ---------- Fetch ----------
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Weather API calls — NetworkFirst, fall back to cache
  const isWeatherApi =
    url.hostname === "api.openweathermap.org" ||
    url.hostname === "api.open-meteo.com" ||
    url.hostname === "geocoding-api.open-meteo.com" ||
    url.hostname === "wft-geo-db.p.rapidapi.com";

  if (isWeatherApi) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Google Fonts — StaleWhileRevalidate
  if (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  ) {
    event.respondWith(staleWhileRevalidate(request, "wb-fonts-v1"));
    return;
  }

  // App shell & static assets — CacheFirst
  if (request.destination === "document" || request.mode === "navigate") {
    event.respondWith(
      caches
        .match("/")
        .then((cached) => cached || fetch(request))
        .catch(() => caches.match("/")),
    );
    return;
  }

  // Everything else — NetworkFirst
  event.respondWith(networkFirst(request, SHELL_CACHE));
});

// ---------- Strategies ----------
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw new Error("Network error and no cache available");
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });
  return cached || fetchPromise;
}
