const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/index.js',
  '/dist/bundle.js',
  '/dist/manifest.json',
  '/icons/icon_192x192.png',
  '/icons/icon_512x512.png',
  '/icons/icon-72x72.png',
];


self.addEventListener("install", function (evt) {
    // pre cache image data
    evt.waitUntil(
      caches.open(DATA_CACHE_NAME).then((cache) => cache.add("/api/images"))
      );
      
    // pre cache all static assets
    evt.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
    );

    // tell the browser to activate this service worker immediately once it
    // has finished installing
    self.skipWaiting();
});

self.addEventListener("activate", function(evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );

    self.clients.claim();
});

self.addEventListener("fetch", function(evt) {
    evt.respondWith(
        caches.match(evt.request).then((resp) => {
          return resp || fetch(evt.request).then((response) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(evt.request, response.clone());
              return response;
            });  
          });
        })
      );
    evt.respondWith(
        caches.open(CACHE_NAME).then(cache => {
          return cache.match(evt.request).then(response => {
            return response || fetch(evt.request);
          });
        })
    );
});

