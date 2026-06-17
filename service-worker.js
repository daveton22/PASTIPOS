// ============================================================
//  SERVICE WORKER – POSYANDU PINTAR
//  Versi: v3  |  Firebase SDK 10.14.1 (compat)
//  Fungsi: Caching PWA offline + Firebase Cloud Messaging
// ============================================================

// Firebase SDK compat untuk service worker (harus versi compat, bukan modular)
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

// ── Konfigurasi Firebase (harus sama dengan index.html) ────
const firebaseConfig = {
  apiKey:            "AIzaSyBU74nG8Zvax2SP8xw2cF3G1-la5SlvXXA",
  authDomain:        "pastipos-tegaltirto.firebaseapp.com",
  projectId:         "pastipos-tegaltirto",
  storageBucket:     "pastipos-tegaltirto.firebasestorage.app",
  messagingSenderId: "972382240580",
  appId:             "1:972382240580:web:7b109724a9fef0388b2111",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ── Push Notification Background ──────────────────────────
/**
 * onBackgroundMessage: Menangani notifikasi saat app DITUTUP atau
 * berada di background (tab tidak aktif).
 * Ini yang membuat notifikasi muncul di status bar HP!
 */
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Notifikasi background diterima:", payload);

  const notificationTitle =
    payload.notification?.title || "📢 Info Posyandu Baru!";

  const notificationOptions = {
    body:    payload.notification?.body || "Ada informasi baru dari posyandu.",
    icon:    "/icon-192.png",
    badge:   "/icon-192.png",
    tag:     "posyandu-info",       // Grup notifikasi (tidak dobel-dobel)
    renotify: true,                 // Berbunyi meski tag sama
    vibrate: [200, 100, 200],       // Pola getar (ms)
    data: {
      url:       "/index.html",
      timestamp: Date.now(),
    },
    actions: [
      {
        action: "buka",
        title:  "📖 Buka Informasi",
      },
      {
        action: "tutup",
        title:  "✕ Tutup",
      },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ── PWA Caching ────────────────────────────────────────────
const CACHE_NAME = "posyandu-pintar-v3";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/data.js",
  "/manifest.json",
];

// 1. Install: Cache semua aset utama
self.addEventListener("install", (event) => {
  console.log("[SW] Install v3 – caching aset utama...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn("[SW] Beberapa aset gagal di-cache:", err);
      });
    })
  );
  self.skipWaiting(); // Langsung aktif tanpa menunggu tab ditutup
});

// 2. Activate: Hapus cache lama
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate – membersihkan cache lama...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log("[SW] Menghapus cache lama:", name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim(); // Ambil kontrol semua tab sekarang
});

// 3. Fetch: Strategi Cache-First untuk aset, Network-First untuk API
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Lewati request ke Firebase / Google APIs (biarkan network langsung)
  if (
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("firebase.googleapis.com") ||
    url.hostname.includes("fcm.googleapis.com") ||
    url.hostname.includes("gstatic.com") ||
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com")
  ) {
    return; // Biarkan browser tangani sendiri
  }

  // Strategi: Cache-First → fallback ke network → fallback ke index.html
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // Cache respons baru yang berhasil
          if (
            response &&
            response.status === 200 &&
            response.type === "basic"
          ) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline fallback: tampilkan halaman utama
          return caches.match("/index.html");
        });
    })
  );
});

// 4. Klik Notifikasi
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/index.html";
  const action    = event.action;

  if (action === "tutup") return; // User klik tutup, tidak perlu buka app

  // Buka atau fokus ke tab yang sudah ada
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Cari tab yang sudah buka app
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.postMessage({ type: "NOTIFICATION_CLICKED" });
            return client.focus();
          }
        }
        // Tidak ada tab terbuka, buka yang baru
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// 5. Push event langsung (opsional, fallback jika onBackgroundMessage tidak jalan)
// self.addEventListener("push", (event) => {
//   const data    = event.data?.json() ?? {};
//   const title   = data.title ?? "Info Posyandu";
//   const options = {
//     body:  data.body  ?? "Ada informasi baru!",
//     icon:  "/icon-192.png",
//     badge: "/icon-192.png",
//     data:  { url: "/index.html" },
//   };
//   event.waitUntil(self.registration.showNotification(title, options));
// });
