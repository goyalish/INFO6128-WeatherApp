const version = 1.2;
const cacheName = `MyCacheName ${version}`;
const filesToCache = [
"index.html",
"offline.html", 
"images/cloud_image.jpeg",
"images/cloud_light.jpeg",
"images/night.webp",
"images/weather_icon.png",
"images/weather_offline.png",
"assets/images/icon.png",
"assets/images/offline.svg", 
"src/appp.css",
"https://myleschuahiock.files.wordpress.com/2016/02/sunny2.png",
"https://unpkg.com/onsenui/css/onsenui.css",
"https://unpkg.com/onsenui/css/onsen-css-components.min.css",
"https://unpkg.com/localforage@1.10.0/dist/localforage.min.js",
"https://unpkg.com/onsenui/js/onsenui.min.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(cacheName).then(async (cache) => {
    for (const file of filesToCache) {
      try {
        await cache.add(file);
      } catch(e) {
        console.error(file, e);
      }
    }
  }));
  console.log("Service Worker installed...");
});

self.addEventListener("fetch", (event) => {
  console.log(event.request.url, new Date());
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;

      // Fallback to network and if it fails, return the offline page.
      return fetch(event.request).catch((error) => {
        console.log('Network error...', error);
        console.log('Attempting Offline fallback.');
        return caches.open(cacheName).then((cache) => {
          return cache.match("index.html");
        });
      });
    })
  );
});

self.addEventListener("activate", (e) => {
  console.log("Service Worker: Activate");
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== cacheName) {
            console.log("Service Worker: Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});
