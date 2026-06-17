// Dengarkan event push dari server
self.addEventListener("push", (event) => {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: "assets/icon/informasi.webp", // Icon yang muncul di notifikasi
    badge: "assets/icon/informasi.webp", // Icon kecil di status bar (Android)
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Aksi jika notifikasi di-klik (membuka aplikasi)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
