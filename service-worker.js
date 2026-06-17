const CACHE_NAME = "posyandu-pintar-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/data.js",
  "/manifest.json",
];

// 1. Install & Cache PWA
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
  );
  self.skipWaiting();
});

// 2. Fetch (Buka offline)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((cached) => {
        return cached || fetch(event.request);
      })
      .catch(() => caches.match("/index.html")),
  );
});

// 3. Menangkap Push Notification dari Server
// self.addEventListener("push", function (event) {
//   let data = { title: "Info Posyandu", body: "Ada informasi baru!" };
//   if (event.data) {
//     data = event.data.json(); // Mengambil data dari server
//   }

//   const options = {
//     body: data.body,
//     icon: "/icon-192.png",
//     badge: "/icon-192.png",
//     data: { url: "/index.html" }, // URL saat notif diklik
//   };

//   event.waitUntil(self.registration.showNotification(data.title, options));
// });

// 4. Jika Notifikasi di-klik
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
