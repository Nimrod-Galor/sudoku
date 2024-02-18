const urlsToCache = ["/", "sudoku.js", "sudoku.css"];

self.addEventListener("install", event => {
    console.log("Service worker installed");
    event.waitUntil(
        caches.open("sudoku-assets")
        .then(cache => {
           return cache.addAll(urlsToCache);
        })
     );  
 });

 self.addEventListener("activate", event => {
    console.log("Service worker activated");
 });
 

 self.addEventListener("fetch", event => {
    event.respondWith(
      caches.match(event.request)
      .then(cachedResponse => {
        // It can update the cache to serve updated content on the next request
          return cachedResponse || fetch(event.request);
      }
    )
   )
 });
 