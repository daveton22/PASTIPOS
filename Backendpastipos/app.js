const express = require("express");
const cors = require("cors");
const { initializeApp, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");

const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const app = express();
app.use(express.json());
app.use(cors());

app.post("/kirim-notifikasi", async (req, res) => {
  const { judul, pesan } = req.body;

  const message = {
    topic: "all_users",
    notification: {
      title: judul,
      body: pesan,
    },
  };

  try {
    const response = await getMessaging().send(message);
    console.log("Sukses mengirim pesan:", response);
    res.status(200).json({ sukses: true, id_pesan: response });
  } catch (error) {
    console.error("Gagal mengirim pesan:", error);
    res.status(500).json({ sukses: false, error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(
    `Server Backend berjalan dengan aman di http://localhost:${PORT}`,
  );
});
