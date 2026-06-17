importScripts(
  "https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyANro9J6TQtvQsqHYIpgaO6RdVFbbkzXFM",
  authDomain: "pastipos-e9e1c.firebaseapp.com",
  projectId: "pastipos-e9e1c",
  storageBucket: "pastipos-e9e1c.firebasestorage.app",
  messagingSenderId: "11282146268",
  appId: "1:11282146268:web:8ca6086573c3f398fce519",
  measurementId: "G-G2QR1FNWY1",
});

const messaging = firebase.messaging();

// Menerima pesan saat app di background (HP terkunci)
messaging.onBackgroundMessage((payload) => {
  console.log("Notifikasi background diterima:", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
