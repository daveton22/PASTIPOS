// Memanggil library Firebase khusus untuk background task
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js",
);

// Inisialisasi dengan kunci Firebase Anda
firebase.initializeApp({
  apiKey: "AIzaSyAC6j9_FLSJUAgv_ZRb9Y-74eV-9HnbFpI",
  authDomain: "pastipos-tegaltirto-5b554.firebaseapp.com",
  projectId: "pastipos-tegaltirto-5b554",
  storageBucket: "pastipos-tegaltirto-5b554.firebasestorage.app",
  messagingSenderId: "967675111498",
  appId: "1:967675111498:web:c5d743eacbaa3322e89eb3",
});

const messaging = firebase.messaging();

// Menangkap notifikasi saat website sedang ditutup (background)
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Menerima pesan background ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/assets/icon/umum.webp", // Ganti dengan path logo posyandu Anda jika ada
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
