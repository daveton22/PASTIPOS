// // server.js
// const express = require("express");
// const webpush = require("web-push");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const sqlite3 = require("sqlite3").verbose();

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// // 1. Setup VAPID Keys (GANTI DENGAN KEY DARI LANGKAH 1)
// const publicVapidKey =
//   "BDAkr6AyUwHDUZvWiBnvbTXQD0vtARpadvHOswgL7mQGsOu9Kb3cO6zEhFX5KWa_rpw-m3zfrU9d4Dy1WTrmkuQ";
// const privateVapidKey = "sIxKTiJTZIHfZ8Ghub0NUTuG10BAJ6NG_zDAl373gmY";

// webpush.setVapidDetails(
//   "mailto:davefarfar2005@gmail.com",
//   publicVapidKey,
//   privateVapidKey,
// );

// // 2. Setup Database SQLite Sederhana
// const db = new sqlite3.Database("./posyandu.db", (err) => {
//   if (err) console.error(err.message);
//   console.log("Terkoneksi ke database SQLite.");
// });

// // Buat tabel untuk menyimpan token/langganan user
// db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   sub_json TEXT UNIQUE
// )`);

// // 3. Endpoint untuk Menerima Subscription dari Frontend
// app.post("/subscribe", (req, res) => {
//   const subscription = req.body;
//   const subJson = JSON.stringify(subscription);

//   // Simpan ke SQLite
//   db.run(
//     `INSERT OR IGNORE INTO subscriptions (sub_json) VALUES (?)`,
//     [subJson],
//     function (err) {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }
//       res.status(201).json({ message: "Subscribed tersimpan di database!" });
//     },
//   );
// });

// // 4. Endpoint untuk Mengirim Notifikasi (Dipanggil oleh Admin)
// app.post("/notify", (req, res) => {
//   const payload = JSON.stringify({
//     title: req.body.title || "Informasi Baru!",
//     body: req.body.body || "Ada informasi baru dari Posyandu.",
//   });

//   // Ambil semua user yang sudah subscribe dari database
//   db.all(`SELECT sub_json FROM subscriptions`, [], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });

//     // Kirim notifikasi ke masing-masing user
//     const pushPromises = rows.map((row) => {
//       const sub = JSON.parse(row.sub_json);
//       return webpush
//         .sendNotification(sub, payload)
//         .catch((e) => console.error("Gagal kirim:", e));
//     });

//     Promise.all(pushPromises).then(() => {
//       res
//         .status(200)
//         .json({ message: "Push notification berhasil dikirim ke semua user!" });
//     });
//   });
// });

// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`Server berjalan di http://localhost:${PORT}`);
// });

//---------------------------

const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg"); // Menggunakan library pg untuk PostgreSQL

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 1. Setup VAPID Keys (Sebaiknya gunakan Environment Variable untuk keamanan)
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

webpush.setVapidDetails(
  "mailto:davefarfar2005@gmail.com",
  publicVapidKey,
  privateVapidKey,
);

// 2. Koneksi ke Supabase PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .connect()
  .then(() => console.log("Terkoneksi ke database Supabase PostgreSQL."))
  .catch((err) => console.error("Error koneksi database", err.stack));

// 3. Endpoint Menerima Subscription
app.post("/subscribe", async (req, res) => {
  const subscription = req.body;
  const subJson = JSON.stringify(subscription);

  try {
    // Insert data, abaikan jika sudah ada (ON CONFLICT)
    await pool.query(
      `INSERT INTO subscriptions (sub_json) VALUES ($1) ON CONFLICT (sub_json) DO NOTHING`,
      [subJson],
    );
    res.status(201).json({ message: "Subscribed tersimpan di database!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Endpoint Mengirim Notifikasi
app.post("/notify", async (req, res) => {
  const payload = JSON.stringify({
    title: req.body.title || "Informasi Baru!",
    body: req.body.body || "Ada informasi baru dari Posyandu.",
  });

  try {
    const { rows } = await pool.query(`SELECT sub_json FROM subscriptions`);

    const pushPromises = rows.map((row) => {
      const sub = JSON.parse(row.sub_json);
      return webpush
        .sendNotification(sub, payload)
        .catch((e) => console.error("Gagal kirim:", e));
    });

    await Promise.all(pushPromises);
    res.status(200).json({ message: "Push notification berhasil dikirim!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
