// // service-worker.js – Posyandu Pintar PWA
// // Cache version – update this string setiap kali ada update
// const CACHE_NAME = 'posyandu-pintar-v1';

// const ASSETS = [
//   '/',
//   '/index.html',
//   '/style.css',
//   '/app.js',
//   '/data.js',
//   '/manifest.json',
//   'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap'
// ];

// // Install – cache semua aset
// self.addEventListener('install', event => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
//   );
//   self.skipWaiting();
// });

// // Activate – hapus cache lama
// self.addEventListener('activate', event => {
//   event.waitUntil(
//     caches.keys().then(keys =>
//       Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
//     )
//   );
//   self.clients.claim();
// });

// // Fetch – cache first strategy
// self.addEventListener('fetch', event => {
//   event.respondWith(
//     caches.match(event.request).then(cached => {
//       return cached || fetch(event.request).then(response => {
//         if (response && response.status === 200 && response.type === 'basic') {
//           const clone = response.clone();
//           caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
//         }
//         return response;
//       });
//     }).catch(() => {
//       // Fallback ke index.html jika offline
//       if (event.request.destination === 'document') {
//         return caches.match('/index.html');
//       }
//     })
//   );
// });

// // self.addEventListener('fetch', event => {
// //   event.respondWith(fetch(event.request)); // langsung fetch, skip cache
// // });