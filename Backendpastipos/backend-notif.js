const express = require("express");
const cors = require("cors");
const { initializeApp, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const { getFirestore } = require("firebase-admin/firestore"); // Tambahan Firestore

const serviceAccount = require("./serviceAccountKey.json");

// Inisialisasi Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(); // Nyalakan akses ke Database
const app = express();
app.use(express.json());
app.use(cors());

app.post("/kirim-notifikasi", async (req, res) => {
  const { judul, pesan } = req.body;

  try {
    // 1. Ambil SEMUA token unik (KTP perangkat user) dari Firestore
    const snapshot = await db.collection("fcmTokens").get();
    const tokens = snapshot.docs.map((doc) => doc.id);

    // Jika belum ada user yang mengklik "Allow" di website
    if (tokens.length === 0) {
      console.log("Belum ada perangkat yang terdaftar.");
      return res
        .status(200)
        .json({ sukses: false, error: "Belum ada user terdaftar" });
    }

    // 2. Siapkan format pesan Multicast (kirim massal)
    const message = {
      notification: {
        title: judul,
        body: pesan,
      },
      tokens: tokens, // Menembak array token, bukan topic
    };

    // 3. Tembakkan notifikasi!
    const response = await getMessaging().sendEachForMulticast(message);

    console.log(`Pesan sukses terkirim ke ${response.successCount} perangkat`);
    if (response.failureCount > 0) {
      console.log(`Gagal terkirim ke ${response.failureCount} perangkat`);
    }

    res.status(200).json({ sukses: true, berhasil: response.successCount });
  } catch (error) {
    console.error("Terjadi kesalahan server:", error);
    res.status(500).json({ sukses: false, error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(
    `Server Backend (Multicast) berjalan aman di http://localhost:${PORT}`,
  );
});
