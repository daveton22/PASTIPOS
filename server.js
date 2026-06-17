const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccountPath = path.resolve(
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(__dirname, "serviceAccountKey.json"),
);

let credential;

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  credential = admin.credential.cert(serviceAccount);
} else {
  credential = admin.credential.applicationDefault();
}

// Inisialisasi Firebase Admin SDK
admin.initializeApp({
  credential,
});

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Endpoint untuk di-trigger oleh Admin dari Frontend saat tambah Info
app.post("/notify", async (req, res) => {
  const { title, body } = req.body;

  try {
    // 1. Ambil semua token user yang tersimpan di Firestore
    const tokensSnapshot = await db.collection("fcmTokens").get();

    if (tokensSnapshot.empty) {
      return res
        .status(200)
        .json({ message: "Tidak ada user yang disubscribe." });
    }

    const tokens = [];
    tokensSnapshot.forEach((doc) => tokens.push(doc.id));

    // 2. Siapkan format payload notifikasi FCM
    const message = {
      notification: {
        title: title || "Informasi Baru Posyandu!",
        body: body || "Silakan cek info terbaru di aplikasi.",
      },
      tokens: tokens, // Kirim ke banyak token sekaligus
    };

    // 3. Eksekusi pengiriman
    const response = await admin.messaging().sendEachForMulticast(message);

    // Opsional: Bersihkan token yang sudah expired/tidak valid dari database
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) failedTokens.push(tokens[idx]);
      });
      failedTokens.forEach((token) =>
        db.collection("fcmTokens").doc(token).delete(),
      );
    }

    res.status(200).json({ message: "Push notification berhasil dikirim!" });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Firebase Push Notification Server berjalan di port ${PORT}`);
});
