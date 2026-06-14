// ============================================================
//  DATA GAME – POSYANDU PINTAR
//  Edit file ini untuk mengganti soal, karakter, atau item jawaban
// ============================================================

/**
 * STRUKTUR CHAPTER:
 * id          – unik per chapter
 * title       – nama chapter
 * image       – link gambar karakter utama chapter
 * character   – label karakter
 * bgColor     – warna latar scene (hex atau css color)
 * scene       – emoji dekorasi latar
 * questions   – array soal (lihat struktur di bawah)
 *
 * STRUKTUR QUESTION:
 * text         – teks soal
 * items        – array 4 item jawaban (image + label)
 *   { image, label, correct: true/false }
 * explanation  – penjelasan setelah jawaban dipilih
 */

const CHAPTERS = [
  // ─────────────────────────────────────────────
  // CHAPTER 1 – FASE KEHAMILAN
  // ─────────────────────────────────────────────
  {
    id: 1,
    title: "Fase Kehamilan",
    image: "assets/characters/ibumelambai.png",
    character: "Ibu Hamil",
    bgColor: "#e8f5e9",
    scene: "🏥",
    questions: [
      {
        text: "Saat hamil muda, Ibu sering mual dan tidak nafsu makan. Apa tindakan paling tepat agar gizi janin tetap terpenuhi?",
        items: [
          {
            image: "assets/chapters/makanpadat.png",
            label: "Berhenti makan padat",
            correct: false,
          },
          {
            image: "assets/chapters/makananprotein.png",
            label: "Porsi kecil + lauk protein",
            correct: true,
          },
          {
            image: "assets/chapters/tehmanis.png",
            label: "Cuma minum teh manis",
            correct: false,
          },
          {
            image: "assets/chapters/jamu.png",
            label: "Minum jamu tanpa konsultasi",
            correct: false,
          },
        ],
        explanation:
          "Makan porsi kecil tapi sering dengan lauk protein (telur, ayam, ikan) membantu gizi janin tetap terpenuhi meski ada mual.",
      },
      {
        text: "Bidan memberi Tablet Tambah Darah (TTD). Bagaimana cara minum yang paling tepat agar penyerapannya maksimal?",
        items: [
          {
            image: "assets/chapters/tehpagihari.png",
            label: "Pagi + teh/kopi",
            correct: false,
          },
          {
            image: "assets/chapters/minummalamhari.png",
            label: "Malam + air putih/jeruk",
            correct: true,
          },
          {
            image: "assets/chapters/obatpusing.png",
            label: "Hanya saat pusing saja",
            correct: false,
          },
          {
            image: "assets/chapters/nasicampurpil.png",
            label: "Dicampur ke nasi",
            correct: false,
          },
        ],
        explanation:
          "Teh/kopi menghambat penyerapan zat besi. Minum malam hari bersama air putih atau jeruk (vitamin C) paling ideal.",
      },
      {
        text: "Berapa kali minimal ibu hamil harus periksa kandungan selama kehamilan menurut aturan terbaru?",
        items: [
          {
            image: "assets/chapters/periksakeposyandu.png",
            label: "1× menjelang lahir",
            correct: false,
          },
          {
            image: "assets/chapters/periksakeposyandu2.png",
            label: "Minimal 3× selama 9 bulan",
            correct: false,
          },
          {
            image: "assets/chapters/periksakedokter.png",
            label: "Minimal 6×, 2× oleh dokter/USG",
            correct: true,
          },
          {
            image: "assets/chapters/pergikeposyandu.png",
            label: "Setiap minggu ke Posyandu",
            correct: false,
          },
        ],
        explanation:
          "Aturan terbaru: minimal 6 kali periksa kandungan, dengan setidaknya 2 kali diperiksa dokter dan di-USG.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // CHAPTER 2 – PERSALINAN & BAYI BARU LAHIR
  // ─────────────────────────────────────────────
  {
    id: 2,
    title: "Bayi Baru Lahir",
    image: "assets/characters/bayibarulahir.png",
    character: "Bayi & Bidan",
    bgColor: "#fff8e1",
    scene: "🏨",
    questions: [
      {
        text: "Sesaat setelah bayi lahir, bidan akan melakukan IMD. Apa bentuk tindakan IMD yang benar?",
        items: [
          {
            image: "assets/chapters/bayimandi.png",
            label: "Dimandikan lalu dibedong",
            correct: false,
          },
          {
            image: "assets/chapters/menyusui.png",
            label: "Bayi di dada ibu 1 jam",
            correct: true,
          },
          {
            image: "assets/chapters/bayiminumsusu.png",
            label: "Langsung susu formula",
            correct: false,
          },
          {
            image: "assets/chapters/perawatsusubayi.png",
            label: "ASI diperah, disuapi perawat",
            correct: false,
          },
        ],
        explanation:
          "IMD: bayi tanpa pakaian diletakkan di dada ibu yang telanjang dada minimal 1 jam agar bayi mencari puting sendiri.",
      },
      {
        text: "Bayi usia 2 bulan ASI eksklusif. Cuaca panas, bayi sering menangis. Apa yang harus dilakukan?",
        items: [
          {
            image: "assets/chapters/bayiminumair.png",
            label: "Beri sedikit air putih",
            correct: false,
          },
          {
            image: "assets/chapters/pisanglumat.png",
            label: "Beri pisang lumat",
            correct: false,
          },
          {
            image: "assets/chapters/menyusui.png",
            label: "Tetap ASI saja, lebih sering",
            correct: true,
          },
          {
            image: "assets/chapters/bayidiberimadu.png",
            label: "Beri madu di bibir bayi",
            correct: false,
          },
        ],
        explanation:
          "ASI mengandung lebih dari 80% air, cukup untuk melepas dahaga bayi. Tidak perlu tambahan air atau makanan apapun sampai 6 bulan.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // CHAPTER 3 – MPASI
  // ─────────────────────────────────────────────
  {
    id: 3,
    title: "MPASI 6 Bulan+",
    image: "assets/characters/balita.png",
    character: "Bayi MPASI",
    bgColor: "#f3e5f5",
    scene: "🍴",
    questions: [
      {
        text: "Bayi usia 6 bulan siap MPASI pertama. Bahan makanan apa yang paling wajib ada untuk cegah stunting?",
        items: [
          {
            image: "assets/chapters/sayurbening.png",
            label: "Sayur bening saja",
            correct: false,
          },
          {
            image: "assets/chapters/buburprotein.png",
            label: "Bubur + protein hewani + lemak",
            correct: true,
          },
          {
            image: "assets/chapters/pisangpepaya.png",
            label: "Buah pisang & pepaya saja",
            correct: false,
          },
          {
            image: "assets/chapters/buburtehmanis.png",
            label: "Bubur instan + teh manis",
            correct: false,
          },
        ],
        explanation:
          "Protein hewani (telur, hati ayam, ikan) adalah kunci utama pencegahan stunting. Bubur harus mengandung ini sejak hari pertama MPASI.",
      },
      {
        text: "Bagaimana tekstur MPASI yang tepat untuk bayi 6 bulan yang baru pertama belajar makan?",
        items: [
          {
            image: "assets/chapters/mpasikental.png",
            label: "Cair encer seperti susu",
            correct: false,
          },
          {
            image: "assets/chapters/mpasipadat.png",
            label: "Lumat kental, tak tumpah dari sendok",
            correct: true,
          },
          {
            image: "assets/chapters/nasiayam.png",
            label: "Nasi utuh + potongan ayam",
            correct: false,
          },
          {
            image: "assets/chapters/mpasicair.png",
            label: "Sup cair banyak kuah",
            correct: false,
          },
        ],
        explanation:
          "Tekstur lumat kental (saring kental) adalah tekstur tepat untuk MPASI pertama. Saat sendok dimiringkan, makanannya tidak mudah jatuh.",
      },
      {
        text: "Anak 1,5 tahun GTM (susah makan). Tindakan paling tepat yang bisa dilakukan ibu di rumah?",
        items: [
          {
            image: "assets/chapters/bayimenangis.png",
            label: "Paksa makan, pencet hidung",
            correct: false,
          },
          {
            image: "assets/chapters/bayimakanbiskuit.png",
            label: "Biarkan hanya makan biskuit",
            correct: false,
          },
          {
            image: "assets/chapters/bayimakancemilan.png",
            label: "Jadwal teratur, batasi camilan manis sebelum makan",
            correct: true,
          },
          {
            image: "assets/chapters/bayiminumsirup.png",
            label: "Beli sirup penambah nafsu makan",
            correct: false,
          },
        ],
        explanation:
          "Atur jadwal makan teratur dan batasi camilan manis atau susu formula menjelang jam makan utama agar anak lapar saat waktunya makan.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // CHAPTER 4 – POSYANDU & SANITASI
  // ─────────────────────────────────────────────
  {
    id: 4,
    title: "Posyandu & Sanitasi",
    image: "assets/characters/sanitasi.png",
    character: "Kader Posyandu",
    bgColor: "#e0f2f1",
    scene: "🏥",
    questions: [
      {
        text: "Melihat kurva berat badan di Buku KIA, kapan ibu harus waspada dan segera ke Puskesmas terkait risiko stunting?",
        items: [
          {
            image: "",
            label: "Berat tidak naik 2 bulan berturut",
            correct: true,
          },
          {
            image: "",
            label: "Belum bisa berjalan usia 9 bulan",
            correct: false,
          },
          {
            image: "",
            label: "Berat di area warna hijau cerah",
            correct: false,
          },
          {
            image: "",
            label: "Belum tumbuh gigi usia 7 bulan",
            correct: false,
          },
        ],
        explanation:
          "Berat badan yang tidak naik (mendatar) selama 2 bulan berturut-turut adalah indikasi awal weight faltering / menuju stunting.",
      },
      {
        text: "Posyandu membagikan kapsul Vitamin A tiap Februari & Agustus. Mengapa ini wajib untuk balita?",
        items: [
          { image: "", label: "Diwajibkan Pak RT setempat", correct: false },
          {
            image: "",
            label: "Jaga kesehatan mata & daya tahan tubuh",
            correct: true,
          },
          {
            image: "",
            label: "Agar anak langsung tinggi semalam",
            correct: false,
          },
          { image: "", label: "Obat demam berdarah", correct: false },
        ],
        explanation:
          "Vitamin A melindungi kesehatan mata dan meningkatkan daya tahan tubuh agar balita tidak mudah sakit parah saat terkena infeksi.",
      },
      {
        text: "Kebiasaan sehari-hari apa yang paling ampuh mencegah anak sering diare berulang yang bisa menyedot gizinya?",
        items: [
          { image: "", label: "Antibiotik tiap bulan", correct: false },
          { image: "", label: "Larang anak main di lantai", correct: false },
          {
            image: "",
            label: "Cuci tangan sabun + air minum dimasak",
            correct: true,
          },
          {
            image: "",
            label: "Mandi antiseptik dosis tinggi tiap hari",
            correct: false,
          },
        ],
        explanation:
          "Cuci tangan ibu dengan sabun sebelum menyiapkan makanan anak dan memastikan air minum direbus sampai mendidih adalah cara terbaik mencegah diare.",
      },
      {
        text: "Apa hubungan logis antara imunisasi lengkap dengan pencegahan stunting?",
        items: [
          {
            image: "",
            label: "Imunisasi mengandung vitamin pemanjang tulang",
            correct: false,
          },
          {
            image: "",
            label: "Cegah sakit berat, gizi utuh untuk tumbuh kembang",
            correct: true,
          },
          {
            image: "",
            label: "Ibu dapat bantuan PMT dari puskesmas",
            correct: false,
          },
          {
            image: "",
            label: "Suntikan bikin nafsu makan instan",
            correct: false,
          },
        ],
        explanation:
          "Anak tidak diimunisasi sering sakit berat (TBC, Campak), sehingga gizi habis untuk melawan penyakit, bukan untuk tumbuh kembang.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // CHAPTER 5 – PERAWATAN & STIMULASI
  // ─────────────────────────────────────────────
  {
    id: 5,
    title: "Perawatan & Stimulasi",
    image: "assets/characters/perawatan.png",
    // optional: set individual image size for this chapter (pixels)
    imageSize: { width: 80, height: 80 },
    character: "Dokter Anak",
    bgColor: "#fce4ec",
    scene: "🏠",
    questions: [
      {
        text: "Balita demam tinggi dan diare di rumah. Pertolongan pertama paling krusial agar tidak kehilangan berat badan drastis?",
        items: [
          {
            image: "",
            label: "Bedong tebal agar keringat keluar",
            correct: false,
          },
          {
            image: "",
            label: "Kurangi minum agar diare mampet",
            correct: false,
          },
          {
            image: "",
            label: "Terus beri ASI/oralit sedikit tapi sering",
            correct: true,
          },
          {
            image: "",
            label: "Oles minyak kayu putih, biarkan tidur",
            correct: false,
          },
        ],
        explanation:
          "Cegah dehidrasi adalah prioritas. Terus berikan ASI (jika masih menyusu) atau oralit sedikit demi sedikit namun sangat sering.",
      },
      {
        text: "Cara praktis menstimulasi otak anak usia 2 tahun di rumah yang paling benar?",
        items: [
          {
            image: "",
            label: "Belikan HP untuk nonton Youtube sendiri",
            correct: false,
          },
          {
            image: "",
            label: "Ngobrol, dongeng, biarkan bereksplorasi",
            correct: true,
          },
          { image: "", label: "Duduk di baby walker seharian", correct: false },
          {
            image: "",
            label: "Bentak anak saat mengotori lantai",
            correct: false,
          },
        ],
        explanation:
          "Sering mengajak anak mengobrol, mendongeng sebelum tidur, dan membiarkan bermain bereksplorasi di tempat aman adalah stimulasi terbaik untuk otak anak usia 2 tahun.",
      },
      {
        text: "Kapan waktu yang paling tepat membawa anak sakit ringan (batuk pilek) ke Puskesmas/Dokter?",
        items: [
          { image: "", label: "Begitu bersin satu kali", correct: false },
          {
            image: "",
            label: "Sudah diobati sendiri 2 minggu, tidak sembuh",
            correct: false,
          },
          {
            image: "",
            label: "Demam tinggi, napas sesak, atau sangat lemas",
            correct: true,
          },
          {
            image: "",
            label: "Tunggu jadwal Posyandu bulan depan",
            correct: false,
          },
        ],
        explanation:
          "Tanda bahaya yang harus segera ditangani: demam sangat tinggi (>38°C), napas cepat/sesak, atau anak sangat lemas dan menolak minum.",
      },
    ],
  },
];

// ─────────────────────────────────────────────
// DATA INFORMASI BAWAAN (seed data)
// Admin bisa tambah lewat panel, disimpan di localStorage
// ─────────────────────────────────────────────
// const DEFAULT_INFOS = [
//   {
//     id: "inf1",
//     title: "Stunting: Apa dan Bagaimana Mencegahnya?",
//     body: "Stunting adalah kondisi gagal tumbuh pada anak akibat kekurangan gizi kronis, terutama pada 1000 Hari Pertama Kehidupan (HPK). Tanda utama: tinggi badan anak jauh di bawah rata-rata usianya. Pencegahan dimulai dari gizi ibu hamil, ASI eksklusif, MPASI berprotein hewani, dan imunisasi lengkap.",
//     category: "kesehatan",
//     date: "2025-06-01",
//     author: "Kader Posyandu",
//   },
//   {
//     id: "inf2",
//     title: "Jadwal Posyandu Rutin Bulan Juni",
//     body: "Posyandu buka setiap minggu pertama bulan berjalan. Bawa Buku KIA, pastikan anak ditimbang dan diukur tingginya. Jangan lupa ambil kapsul Vitamin A untuk balita usia 6–59 bulan pada bulan Agustus mendatang!",
//     category: "umum",
//     date: "2025-06-01",
//     author: "Kader Posyandu",
//   },
//   {
//     id: "inf3",
//     title: "Resep MPASI Bergizi: Bubur Merah Putih",
//     body: "Bahan: Nasi putih 3 sdm, hati ayam 1 potong kecil (rebus), bayam 2 lembar, minyak goreng ½ sdt. Cara: Rebus nasi hingga lembek, haluskan bersama hati ayam dan bayam yang sudah direbus, tambahkan minyak. Saring kental. Sajikan hangat. Kaya zat besi dan protein untuk cegah stunting!",
//     category: "gizi",
//     date: "2025-05-28",
//     author: "Kader Posyandu",
//   },
//   {
//     id: "inf4",
//     title: "Imunisasi Lengkap = Investasi Tumbuh Kembang",
//     body: "Jadwal imunisasi dasar lengkap: HB0 (lahir), BCG & Polio 1 (1 bulan), DPT-HB-Hib 1 & Polio 2 (2 bulan), DPT-HB-Hib 2 & Polio 3 (3 bulan), DPT-HB-Hib 3, Polio 4 & IPV (4 bulan), MR (9 bulan). Pastikan semua jadwal terpenuhi!",
//     category: "imunisasi",
//     date: "2025-05-20",
//     author: "Bidan Desa",
//   },
// ];
