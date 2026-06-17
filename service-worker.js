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

// Menangani notifikasi saat PWA di-minimize atau ditutup
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
