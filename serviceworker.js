const urlsToCache = ["/", "sudoku.js", "timer_workers.js", "sudoku.css"];

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
 
//Cache First
//  self.addEventListener("fetch", event => {
//     event.respondWith(
//       caches.match(event.request)
//       .then(cachedResponse => {
//         // It can update the cache to serve updated content on the next request
//           return cachedResponse || fetch(event.request);
//       }
//     )
//    )
//  });


// Stale while revalidate
self.addEventListener('fetch', event => {
   event.respondWith(
     caches.match(event.request).then(cachedResponse => {
         const networkFetch = fetch(event.request).then(response => {
           // update the cache with a clone of the network response
           const responseClone = response.clone()
           caches.open(url.searchParams.get('name')).then(cache => {
             cache.put(event.request, responseClone)
           })
           return response
         }).catch(function (reason) {
           console.error('ServiceWorker fetch failed: ', reason)
         })
         // prioritize cached response over network
         return cachedResponse || networkFetch
       }
     )
   )
 })
 
 