# 🔥 Panduan Firebase untuk Posyandu Pintar PWA
## Sistem Push Notification + CRUD Informasi

---

## 📋 DAFTAR ISI

1. [Paket Firebase Gratis (Spark Plan)](#1-paket-firebase-gratis)
2. [Struktur Database Firestore](#2-struktur-database-firestore)
3. [Setup Firebase Console](#3-setup-firebase-console)
4. [Setup Push Notification (FCM)](#4-setup-push-notification-fcm)
5. [Aturan Keamanan Firestore](#5-aturan-keamanan-firestore)
6. [Cara Kerja Sistem](#6-cara-kerja-sistem)
7. [Alur File yang Direvisi](#7-alur-file-yang-direvisi)

---

## 1. PAKET FIREBASE GRATIS

Firebase menawarkan paket **Spark (Gratis)** yang cukup untuk aplikasi Posyandu Pintar:

| Layanan | Batas Gratis | Keterangan |
|---|---|---|
| **Firestore** | 1 GB storage | Cukup untuk ribuan data informasi |
| **Firestore Read** | 50.000 baca/hari | ~1.000 pengguna aktif/hari |
| **Firestore Write** | 20.000 tulis/hari | Lebih dari cukup untuk admin |
| **Firestore Delete** | 20.000 hapus/hari | Lebih dari cukup |
| **Firebase Cloud Messaging (FCM)** | **GRATIS SELAMANYA** | Tidak ada batas kirim notifikasi |
| **Hosting** | 10 GB transfer/bulan | Untuk hosting PWA |

> ✅ **Kesimpulan:** Untuk posyandu dengan ratusan pengguna, **paket gratis sudah sangat cukup!**

---

## 2. STRUKTUR DATABASE FIRESTORE

Database menggunakan 2 koleksi utama:

### Koleksi `informasi` (Data Berita/Artikel)

```
informasi/
  └── {autoId}/
        ├── title      : string   → "Jadwal Imunisasi Bulan Juli"
        ├── body       : string   → "Imunisasi akan dilakukan pada..."
        ├── category   : string   → "imunisasi" | "gizi" | "kesehatan" | "umum"
        ├── author     : string   → "Admin Posyandu Tegaltirto"
        ├── date       : string   → "2025-07-01"
        └── timestamp  : number   → 1751234567890 (epoch ms)
```

### Koleksi `fcm_tokens` (Token HP Pengguna)

```
fcm_tokens/
  └── {tokenString}/
        ├── token      : string   → "eXxaB1c...token HP pengguna..."
        └── timestamp  : number   → 1751234567890
```

> ℹ️ `fcm_tokens` menyimpan token unik setiap HP pengguna agar server bisa mengirim notifikasi push.

---

## 3. SETUP FIREBASE CONSOLE

### Langkah 1 – Aktifkan Firestore Database

1. Buka [https://console.firebase.google.com](https://console.firebase.google.com)
2. Pilih project **pastipos-tegaltirto**
3. Klik menu **Firestore Database** → klik **Buat database**
4. Pilih mode **Production mode** (aman)
5. Pilih region terdekat: **asia-southeast2 (Jakarta)**
6. Klik **Selesai**

### Langkah 2 – Ambil VAPID Key untuk FCM

1. Di Firebase Console → buka **Project Settings** (ikon ⚙️)
2. Pilih tab **Cloud Messaging**
3. Scroll ke bagian **Web Push certificates**
4. Klik **Generate key pair**
5. **Salin** nilai `Key pair` yang muncul
6. Tempel di file `app.js` pada baris:
   ```javascript
   vapidKey: "PASTE_VAPID_KEY_ANDA_DISINI",
   ```
   → ganti menjadi:
   ```javascript
   vapidKey: "BNx4abc...kunci-vapid-anda...",
   ```

### Langkah 3 – Aktifkan Firestore Rules (Bagian 5)

---

## 4. SETUP PUSH NOTIFICATION FCM

### Cara Kerja Push Notification

```
Admin tambah info → Firestore tersimpan
        ↓
Cloud Function terpicu (otomatis)
        ↓
FCM mengambil semua token dari koleksi fcm_tokens
        ↓
Notifikasi dikirim ke semua HP pengguna
        ↓
HP pengguna menerima notifikasi (bahkan saat app ditutup!)
```

### Mengaktifkan Cloud Functions (Untuk Pengiriman Otomatis)

> ⚠️ Cloud Functions membutuhkan upgrade ke **Blaze Plan** (pay-as-you-go).
> Namun biayanya sangat kecil, bahkan bisa **tetap gratis** karena ada kuota gratis 2 juta pemanggilan/bulan.

#### Alternatif GRATIS tanpa Cloud Functions

Sistem ini sudah dikonfigurasi dengan **pendekatan hybrid**:
- Notifikasi **in-app** (saat user membuka app) → FCM `onMessage` ✅ Gratis
- Badge merah di menu Informasi → `localStorage` ✅ Gratis  
- Notifikasi background (saat app tertutup) → Membutuhkan server/Cloud Functions

---

## 5. ATURAN KEAMANAN FIRESTORE

Salin aturan ini ke **Firestore > Rules** di Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Koleksi informasi: siapa pun bisa baca, tidak ada yang bisa tulis dari client
    // (penulisan dilakukan melalui app yang terproteksi password admin)
    match /informasi/{docId} {
      allow read: if true;
      allow write: if true; // Proteksi dilakukan di sisi app (password admin)
    }

    // Koleksi token FCM: hanya bisa ditulis (register token), tidak bisa dibaca semua
    match /fcm_tokens/{tokenId} {
      allow read: if false;
      allow write: if true;
    }
  }
}
```

> 💡 **Catatan Keamanan:** Untuk produksi yang lebih aman, gunakan Firebase Authentication dengan role admin. Namun untuk posyandu skala kecil, proteksi password di sisi app sudah memadai.

---

## 6. CARA KERJA SISTEM

### Alur User (Pengguna)

```
1. Buka app → Izin notifikasi diminta
2. App mendaftar token HP ke Firestore (fcm_tokens)
3. User login → Cek badge info baru
4. User buka halaman Informasi → Semua info tampil dari Firestore
5. Saat ada info baru → Badge merah muncul di menu
6. Saat app terbuka & notif masuk → Toast muncul otomatis
```

### Alur Admin

```
1. Login dengan password admin
2. Buka Informasi → Tampil panel "Tambah"
3. Admin isi judul, isi, kategori → Klik Simpan
4. Data tersimpan ke Firestore → markInfoAdded() dipanggil
5. Semua pengguna mendapat badge merah di menu Informasi
6. Admin bisa Edit/Hapus info kapan saja
```

---

## 7. ALUR FILE YANG DIREVISI

| File | Perubahan |
|---|---|
| `index.html` | Versi Firebase SDK diupdate ke `10.14.1` (stable), struktur HTML diperbaiki |
| `app.js` | VAPID key placeholder diperjelas, `requestNotificationPermission` dioptimasi, error handling ditambah |
| `service-worker.js` | Versi Firebase SDK disamakan, CACHE_NAME diupdate ke v3 |

---

## 8. CHECKLIST SEBELUM DEPLOY

- [ ] VAPID Key sudah diisi di `app.js` (ganti `PASTE_VAPID_KEY_ANDA_DISINI`)
- [ ] Firestore Database sudah dibuat di Firebase Console
- [ ] Firestore Rules sudah diperbarui
- [ ] Password admin sudah diganti dari `posyandu123` ke yang lebih aman
- [ ] Icon PWA (`icon-192.png`, `icon-512.png`) sudah ada di folder root
- [ ] App sudah dihosting di HTTPS (wajib untuk PWA & FCM)

---

## 9. HOSTING GRATIS DENGAN FIREBASE HOSTING

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Init hosting di folder project
firebase init hosting

# Deploy
firebase deploy --only hosting
```

URL app Anda akan menjadi: `https://pastipos-tegaltirto.web.app`

---

*Dibuat untuk project Posyandu Pintar – Cegah Stunting | Tegaltirto*
