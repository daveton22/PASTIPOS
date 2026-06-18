// ============================================================
// 1. IMPORT LIBRARY (Workbox & Firebase)
// ============================================================
importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js",
);
// MASUKKAN FIREBASE CONFIG KAMU DI SINI JUGA
const firebaseConfig = {
  apiKey: "AIzaSyAC6j9_FLSJUAgv_ZRb9Y-74eV-9HnbFpI",
  authDomain: "pastipos-tegaltirto-5b554.firebaseapp.com",
  projectId: "pastipos-tegaltirto-5b554",
  storageBucket: "pastipos-tegaltirto-5b554.firebasestorage.app",
  messagingSenderId: "967675111498",
  appId: "1:967675111498:web:c5d743eacbaa3322e89eb3",
  measurementId: "G-73ESD1DLQT",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Notifikasi background diterima: ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "assets/icon/informasi.webp",
    badge: "assets/icon/informasi.webp",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});

if (workbox) {
  console.log(`✅ Workbox berhasil dimuat!`);

  // Force update service worker jika ada versi baru
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  // A. Caching HTML (Halaman Utama) -> Network First
  workbox.routing.registerRoute(
    ({ request }) => request.mode === "navigate",
    new workbox.strategies.NetworkFirst({
      cacheName: "posyandu-html-cache",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 10,
        }),
      ],
    }),
  );

  // B. Caching CSS & JavaScript -> Stale While Revalidate
  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === "script" || request.destination === "style",
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: "posyandu-static-resources",
    }),
  );

  // C. Caching Gambar (Assets, Karakter, dll) -> Cache First
  workbox.routing.registerRoute(
    ({ request }) => request.destination === "image",
    new workbox.strategies.CacheFirst({
      cacheName: "posyandu-image-cache",
      plugins: [
        // Batasi jumlah gambar dan lama penyimpanannya agar memori HP tidak penuh
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100, // Maksimal 100 gambar disimpan
          maxAgeSeconds: 30 * 24 * 60 * 60, // Disimpan selama 30 Hari
        }),
      ],
    }),
  );
} else {
  console.log(`❌ Workbox gagal dimuat`);
}
