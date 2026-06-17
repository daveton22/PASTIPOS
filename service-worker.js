importScripts(
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyBU74nG8Zvax2SP8xw2cF3G1-la5SlvXXA",
  authDomain: "pastipos-tegaltirto.firebaseapp.com",
  projectId: "pastipos-tegaltirto",
  storageBucket: "pastipos-tegaltirto.firebasestorage.app",
  messagingSenderId: "972382240580",
  appId: "1:972382240580:web:7b109724a9fef0388b2111",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle =
    payload.notification?.title || "Info Posyandu Baru!";
  const notificationOptions = {
    body: payload.notification?.body || "Ada informasi baru!",
    icon: "/icon-192.png",
    data: { url: "/index.html" },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

const CACHE_NAME = "posyandu-pintar-v2";
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
