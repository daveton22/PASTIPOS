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
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon-192.png",
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
