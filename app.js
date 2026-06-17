// ============================================================
//  APP.JS – POSYANDU PINTAR  |  FULL CRUD + ROLE MANAGEMENT
// ============================================================

// ── State ────────────────────────────────────────────────
let currentScreen = "splash-screen";
let currentChapter = null;
let currentQuestionIndex = 0;
let currentScore = 0;
let chapterProgress = {};
let allInfos = [];
let answered = false;
let userRole = null; // 'admin' | 'user'
let deleteTargetId = null; // id info yang akan dihapus

const ADMIN_PASSWORD = "posyandu123"; // ← ganti password di sini
const POINTS_CORRECT = 10;
const POINTS_WRONG = -5;
const PLACEHOLDER_CHAR = "assets/placeholder-char.svg";
const PLACEHOLDER_ITEM = "assets/placeholder-item.svg";

// ── Init ─────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  loadProgress();
  loadInfos();
  setTimeout(() => showScreen("login-screen"), 2500);
});

// ── Screen Navigation ────────────────────────────────────
function showScreen(id) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add("active");
    currentScreen = id;
  }
  if (id === "home-screen") updateHomeStats();
  if (id === "chapter-select") renderChapters();
  if (id === "info-screen") renderInfoScreen();
}

// ══════════════════════════════════════════════════════════
//  LOGIN & ROLE
// ══════════════════════════════════════════════════════════

function loginAsUser() {
  userRole = "user";
  showScreen("home-screen");

  // Meminta izin notifikasi saat login sebagai user
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") subscribeToPush();
  });
}

function toggleAdminLoginForm() {
  const form = document.getElementById("admin-login-form");
  const arrow = document.getElementById("admin-arrow");
  const open = form.style.display !== "none";
  form.style.display = open ? "none" : "block";
  arrow.textContent = open ? "↓" : "↑";
}

function loginAsAdmin() {
  const pass = document.getElementById("login-pass").value;
  if (pass !== ADMIN_PASSWORD) {
    showLoginError("❌ Password salah! Coba lagi.");
    return;
  }
  userRole = "admin";
  document.getElementById("login-pass").value = "";
  showScreen("home-screen");
}

function showLoginError(msg) {
  const el = document.getElementById("login-error");
  el.textContent = msg;
  el.style.display = "block";
  setTimeout(() => (el.style.display = "none"), 3000);
}

function logout() {
  userRole = null;
  // Reset admin form
  const form = document.getElementById("admin-login-form");
  if (form) form.style.display = "none";
  showScreen("login-screen");
}

// ── Home Stats ────────────────────────────────────────────
function updateHomeStats() {
  let total = 0,
    done = 0;
  for (const id in chapterProgress) {
    if (chapterProgress[id].done) {
      done++;
      total += chapterProgress[id].score;
    }
  }
  document.getElementById("total-score-home").textContent = total;
  document.getElementById("chapters-done-home").textContent =
    `${done}/${CHAPTERS.length}`;

  // Toggle label role di header sesuai login
  const userLabel = document.getElementById("role-label-user");
  const adminLabel = document.getElementById("role-label-admin");
  if (userLabel && adminLabel) {
    const isAdmin = userRole === "admin";
    userLabel.style.display = isAdmin ? "none" : "inline-flex";
    adminLabel.style.display = isAdmin ? "inline-flex" : "none";
  }

  // Cek dan update badge notifikasi info
  updateInfoBadge();
}

// ── Chapter Select ─────────────────────────────────────────
function renderChapters() {
  const grid = document.getElementById("chapter-list");
  grid.innerHTML = CHAPTERS.map((ch) => {
    const prog = chapterProgress[ch.id];
    const done = prog && prog.done;
    const score = done ? prog.score : 0;
    const stars = done ? getStars(score, ch.questions.length) : "";
    const imgSrc = ch.image && ch.image.trim() ? ch.image : PLACEHOLDER_CHAR;
    return `
      <button class="chapter-card ${done ? "done" : ""}" onclick="startChapter(${ch.id})">
        <div class="ch-img-wrap">
          <img src="${imgSrc}" alt="${ch.character}" class="ch-char-img"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
          <div class="ch-img-fallback" style="display:none">${ch.id}</div>
        </div>
        <div class="ch-info">
          <div class="ch-num">Chapter ${ch.id}</div>
          <div class="ch-title">${ch.title}</div>
          <div class="ch-meta">${ch.questions.length} soal ${done ? `• ${stars} ${score} poin` : ""}</div>
        </div>
        ${done ? '<div class="ch-badge">✓</div>' : '<div class="ch-badge play">▶</div>'}
      </button>`;
  }).join("");
}

// ── Start Chapter ──────────────────────────────────────────
function startChapter(id) {
  currentChapter = CHAPTERS.find((c) => c.id === id);
  if (!currentChapter) return;
  currentQuestionIndex = 0;
  currentScore = 0;
  answered = false;
  showScreen("game-screen");
  document.getElementById("game-chapter-label").textContent =
    `Chapter ${currentChapter.id}: ${currentChapter.title}`;
  renderQuestion();
}

// ── Render Question ────────────────────────────────────────
function renderQuestion() {
  const q = currentChapter.questions[currentQuestionIndex];
  const total = currentChapter.questions.length;
  answered = false;

  document.getElementById("q-counter").textContent =
    `Soal ${currentQuestionIndex + 1}/${total}`;
  document.getElementById("score-display").textContent = `⭐ ${currentScore}`;
  document.getElementById("progress-bar").style.width =
    (currentQuestionIndex / total) * 100 + "%";

  // Karakter
  const charEl = document.getElementById("char-emoji");
  const charSrc =
    currentChapter.image && currentChapter.image.trim()
      ? currentChapter.image
      : PLACEHOLDER_CHAR;
  charEl.innerHTML = `<img src="${charSrc}" alt="${currentChapter.character}" class="char-img"
    onerror="this.style.opacity='0.3';this.onerror=null;">`;

  document.getElementById("scene-bg").style.background = currentChapter.bgColor;
  document.getElementById("question-text").textContent = q.text;
  document.getElementById("feedback-overlay").classList.remove("show");

  // Item jawaban
  const items = [...q.items].sort(() => Math.random() - 0.5);
  const grid = document.getElementById("items-grid");
  grid.innerHTML = items
    .map((item) => {
      const src =
        item.image && item.image.trim() ? item.image : PLACEHOLDER_ITEM;
      return `
      <button class="item-btn" onclick="selectItem(this,${item.correct})" data-correct="${item.correct}">
        <span class="item-emoji">
          <img src="${src}" alt="${item.label}" class="item-img"
            onerror="this.style.opacity='0.2';this.onerror=null;">
        </span>
        <span class="item-label">${item.label}</span>
      </button>`;
    })
    .join("");

  grid.querySelectorAll(".item-btn").forEach((btn, i) => {
    btn.style.animationDelay = `${i * 0.08}s`;
    btn.classList.add("pop-in");
  });
}

// ── Select Item ────────────────────────────────────────────
function selectItem(btn, isCorrect) {
  if (answered) return;
  answered = true;
  const q = currentChapter.questions[currentQuestionIndex];
  document.querySelectorAll(".item-btn").forEach((b) => {
    b.disabled = true;
    if (b.dataset.correct === "true") b.classList.add("correct");
  });
  if (isCorrect) {
    btn.classList.add("correct");
    currentScore += POINTS_CORRECT;
    showFeedback(true, q.explanation);
    spawnParticles(btn);
  } else {
    btn.classList.add("wrong");
    currentScore = Math.max(0, currentScore + POINTS_WRONG);
    showFeedback(false, q.explanation);
  }
  document.getElementById("score-display").textContent = `⭐ ${currentScore}`;
}

function showFeedback(correct, explanation) {
  const box = document.getElementById("feedback-box");

  // ← Ambil gambar dari chapter yang sedang aktif
  const imgSrc = correct
    ? currentChapter.feedbackCorrect
    : currentChapter.feedbackWrong;

  // ← Fallback jika gambar belum diisi
  const fallback = correct ? "😊" : "😢";

  document.getElementById("feedback-emoji").innerHTML = imgSrc
    ? `<img src="${imgSrc}" alt="${correct ? "Benar" : "Salah"}" class="feedback-img">`
    : `<span style="font-size:3rem">${fallback}</span>`;

  document.getElementById("feedback-text").textContent = correct
    ? "Benar! +10 Poin"
    : "Kurang Tepat -5 Poin";
  document.getElementById("feedback-explain").textContent = explanation;

  const isLast = currentQuestionIndex >= currentChapter.questions.length - 1;
  document.getElementById("next-btn").textContent = isLast
    ? "Lihat Hasil →"
    : "Lanjut →";

  box.className = "feedback-box " + (correct ? "correct" : "wrong");
  document.getElementById("feedback-overlay").classList.add("show");
}
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex >= currentChapter.questions.length) endChapter();
  else renderQuestion();
}

function endChapter() {
  chapterProgress[currentChapter.id] = { done: true, score: currentScore };
  saveProgress();
  const stars = getStars(currentScore, currentChapter.questions.length);
  const max = currentChapter.questions.length * POINTS_CORRECT;
  const pct = Math.round((currentScore / max) * 100);
  let title, sub, char;
  if (pct >= 80) {
    title = "Luar Biasa! 🏆";
    sub = "Kamu calon orang tua terbaik!";
    char = "🥇";
  } else if (pct >= 50) {
    title = "Bagus! 👍";
    sub = "Terus belajar dan kamu bisa lebih baik lagi!";
    char = "😊";
  } else {
    title = "Semangat! 💪";
    sub = "Coba lagi untuk hasil lebih baik!";
    char = "📚";
  }
  document.getElementById("result-char").textContent = char;
  document.getElementById("result-title").textContent = title;
  document.getElementById("result-sub").textContent = sub;
  document.getElementById("result-score").textContent = currentScore;
  document.getElementById("result-stars").textContent = stars;
  showScreen("result-screen");
}

function getStars(score, totalQ) {
  const pct = (score / (totalQ * POINTS_CORRECT)) * 100;
  if (pct >= 80) return "⭐⭐⭐";
  if (pct >= 50) return "⭐⭐";
  return "⭐";
}

function replayChapter() {
  if (currentChapter) startChapter(currentChapter.id);
}

function confirmExit() {
  document.getElementById("exit-modal").style.display = "flex";
}
function closeModal() {
  document.getElementById("exit-modal").style.display = "none";
}
function exitGame() {
  closeModal();
  showScreen("chapter-select");
}

function spawnParticles(btn) {
  const emojis = ["⭐", "✨", "🎊", "🎉", "💛", "💚"];
  const rect = btn.getBoundingClientRect();
  for (let i = 0; i < 8; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left = rect.left + rect.width / 2 + "px";
    p.style.top = rect.top + rect.height / 2 + "px";
    const angle = (Math.random() * 360 * Math.PI) / 180;
    const dist = 60 + Math.random() * 80;
    p.style.setProperty("--tx", Math.cos(angle) * dist + "px");
    p.style.setProperty("--ty", Math.sin(angle) * dist + "px");
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 900);
  }
}

// ══════════════════════════════════════════════════════════
//  INFO SYSTEM – FULL CRUD
// ══════════════════════════════════════════════════════════

// function loadInfos() {
//   const saved = localStorage.getItem("posyandu_infos");
//   allInfos = saved ? JSON.parse(saved) : [];
//   if (!saved) saveInfos();
// }

// function saveInfos() {
//   localStorage.setItem("posyandu_infos", JSON.stringify(allInfos));
// }

// let currentFilter = "all";

// // ── Render Info Screen ─────────────────────────────────────
// function renderInfoScreen() {
//   const adminBtn = document.getElementById("admin-panel-btn");
//   const adminPanel = document.getElementById("admin-panel");
//   const titleEl = document.getElementById("info-screen-title");

//   if (userRole === "admin") {
//     adminBtn.style.display = "flex";
//     titleEl.textContent = "Kelola Informasi";
//   } else {
//     adminBtn.style.display = "none";
//     if (adminPanel) adminPanel.style.display = "none";
//     titleEl.textContent = "Informasi Posyandu";
//     // User membuka info → tandai sudah dibaca, hilangkan badge
//     markInfoRead();
//   }
//   renderInfoList();
// }

// // ── READ ───────────────────────────────────────────────────
// function renderInfoList() {
//   const list = document.getElementById("info-list");
//   const filtered =
//     currentFilter === "all"
//       ? allInfos
//       : allInfos.filter((i) => i.category === currentFilter);

//   if (filtered.length === 0) {
//     list.innerHTML =
//       '<div class="info-empty">Belum ada informasi di kategori ini.</div>';
//     return;
//   }

//   const catLabels = {
//     gizi: " Gizi",
//     kesehatan: " Kesehatan",
//     imunisasi: " Imunisasi",
//     umum: " Umum",
//   };

//   const catIcons = {
//     gizi: "assets/icon/gizi.webp",
//     kesehatan: "assets/icon/kesehatan.webp",
//     imunisasi: "assets/icon/imunisasi.webp",
//     umum: "assets/icon/umum.webp",
//   };

//   list.innerHTML = filtered
//     .map(
//       (info) => `
//     <div class="info-card" data-id="${info.id}">
//       <div class="info-card-header">
//         <div class="info-cat-badge">
//           <img src="${catIcons[info.category] || "assets/icon/umum.webp"}" alt="" width="15" height="15" />
//           ${catLabels[info.category] || info.category}
//         </div>
//         ${
//           userRole === "admin"
//             ? `
//           <div class="info-actions">
//             <button class="action-btn edit-btn" onclick="openEditModal('${info.id}')"> Edit</button>
//             <button class="action-btn delete-btn" onclick="confirmDeleteInfo('${info.id}')"> Hapus</button>
//           </div>`
//             : ""
//         }
//       </div>
//       <h3 class="info-title">${info.title}</h3>
//       <p class="info-body">${info.body}</p>
//       <div class="info-meta">
//         <span> ${info.author}</span>
//         <span> ${formatDate(info.date)}</span>
//       </div>
//     </div>`,
//     )
//     .join("");
// }

// function filterInfo(cat, btn) {
//   currentFilter = cat;
//   document
//     .querySelectorAll(".filter-btn")
//     .forEach((b) => b.classList.remove("active"));
//   btn.classList.add("active");
//   renderInfoList();
// }

// // ── CREATE ─────────────────────────────────────────────────
// function toggleAdminPanel() {
//   const panel = document.getElementById("admin-panel");
//   const isOpen = panel.style.display !== "none";
//   panel.style.display = isOpen ? "none" : "block";
//   document.getElementById("admin-panel-btn").textContent = isOpen
//     ? "➕ Tambah"
//     : "✕ Tutup";
// }

// function submitInfo() {
//   if (userRole !== "admin") return;
//   const title = document.getElementById("info-title-input").value.trim();
//   const body = document.getElementById("info-body-input").value.trim();
//   const cat = document.getElementById("info-category").value;

//   if (!title || !body) {
//     showToast("⚠️ Judul dan isi tidak boleh kosong!");
//     return;
//   }

//   allInfos.unshift({
//     id: "inf_" + Date.now(),
//     title,
//     body,
//     category: cat,
//     date: new Date().toISOString().split("T")[0],
//     author: "Admin Posyandu",
//   });
//   saveInfos();
//   renderInfoList();

//   // +++ TAMBAHAN: Kirim trigger ke Backend agar Push Notif menyala +++
//   fetch("http://localhost:3000/notify", {
//     method: "POST",
//     body: JSON.stringify({ title: title, body: body }),
//     headers: { "Content-Type": "application/json" },
//   }).catch((e) => console.error("Notifikasi gagal dikirim:", e));
//   // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//   // Tandai ada info baru → badge merah akan muncul untuk user
//   markInfoAdded();

//   document.getElementById("info-title-input").value = "";
//   document.getElementById("info-body-input").value = "";
//   document.getElementById("admin-panel").style.display = "none";
//   document.getElementById("admin-panel-btn").textContent = "➕ Tambah";
//   showToast("✅ Informasi berhasil ditambahkan!");
// }

// // ── UPDATE ─────────────────────────────────────────────────
// function openEditModal(id) {
//   const info = allInfos.find((i) => i.id === id);
//   if (!info) return;
//   document.getElementById("edit-id").value = info.id;
//   document.getElementById("edit-title").value = info.title;
//   document.getElementById("edit-body").value = info.body;
//   document.getElementById("edit-category").value = info.category;
//   document.getElementById("edit-modal").style.display = "flex";
// }

// function saveEdit() {
//   const id = document.getElementById("edit-id").value;
//   const title = document.getElementById("edit-title").value.trim();
//   const body = document.getElementById("edit-body").value.trim();
//   const category = document.getElementById("edit-category").value;

//   if (!title || !body) {
//     showToast("⚠️ Judul dan isi tidak boleh kosong!");
//     return;
//   }

//   const idx = allInfos.findIndex((i) => i.id === id);
//   if (idx !== -1) {
//     allInfos[idx] = { ...allInfos[idx], title, body, category };
//     saveInfos();
//     renderInfoList();
//     closeEditModal();
//     showToast("✅ Informasi berhasil diperbarui!");
//   }
// }

// function closeEditModal() {
//   document.getElementById("edit-modal").style.display = "none";
// }

// // ── DELETE ─────────────────────────────────────────────────
// function confirmDeleteInfo(id) {
//   const info = allInfos.find((i) => i.id === id);
//   if (!info) return;
//   deleteTargetId = id;
//   document.getElementById("delete-info-title").textContent = `"${info.title}"`;
//   document.getElementById("delete-modal").style.display = "flex";
// }

// function executeDelete() {
//   if (!deleteTargetId) return;
//   allInfos = allInfos.filter((i) => i.id !== deleteTargetId);
//   saveInfos();
//   renderInfoList();
//   closeDeleteModal();
//   showToast("🗑️ Informasi berhasil dihapus!");
//   deleteTargetId = null;
// }

// function closeDeleteModal() {
//   document.getElementById("delete-modal").style.display = "none";
//   deleteTargetId = null;
// }

// ── Toast ──────────────────────────────────────────────────
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// ============================================================
//  FIREBASE INITIALIZATION
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyAC6j9_FLSJUAgv_ZRb9Y-74eV-9HnbFpI",
  authDomain: "pastipos-tegaltirto-5b554.firebaseapp.com",
  projectId: "pastipos-tegaltirto-5b554",
  storageBucket: "pastipos-tegaltirto-5b554.firebasestorage.app",
  messagingSenderId: "967675111498",
  appId: "1:967675111498:web:c5d743eacbaa3322e89eb3",
  measurementId: "G-73ESD1DLQT",
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const messaging = firebase.messaging();

// Ganti VAPID Key dengan yang kamu generate di Firebase Console
const PUBLIC_VAPID_KEY =
  "BAAisHTEnGV7eZPH6UyUnq6xL5lKBpIqso8NIVF--BicLrcvdSAJMrzjVicdZ6lJrhVrZOhCun3XpJ85yfGsO7M";

// ============================================================
//  INFO SYSTEM – FULL CRUD (FIRESTORE)
// ============================================================

let currentFilter = "all";

// ── READ ───────────────────────────────────────────────────
async function loadInfos() {
  db.collection("infos")
    .orderBy("createdAt", "desc")
    .onSnapshot((snapshot) => {
      allInfos = [];
      snapshot.forEach((doc) => {
        allInfos.push({ id: doc.id, ...doc.data() });
      });

      // Jika user sedang di halaman info, update tampilannya
      if (currentScreen === "info-screen") {
        renderInfoList();
      }
    });
}

function renderInfoScreen() {
  const adminBtn = document.getElementById("admin-panel-btn");
  const adminPanel = document.getElementById("admin-panel");
  const titleEl = document.getElementById("info-screen-title");

  if (userRole === "admin") {
    adminBtn.style.display = "flex";
    titleEl.textContent = "Kelola Informasi";
  } else {
    adminBtn.style.display = "none";
    if (adminPanel) adminPanel.style.display = "none";
    titleEl.textContent = "Informasi Posyandu";
    markInfoRead();
  }
  renderInfoList();
}

function renderInfoList() {
  const list = document.getElementById("info-list");
  const filtered =
    currentFilter === "all"
      ? allInfos
      : allInfos.filter((i) => i.category === currentFilter);

  if (filtered.length === 0) {
    list.innerHTML =
      '<div class="info-empty">Belum ada informasi di kategori ini.</div>';
    return;
  }

  const catLabels = {
    gizi: " Gizi",
    kesehatan: " Kesehatan",
    imunisasi: " Imunisasi",
    umum: " Umum",
  };
  const catIcons = {
    gizi: "assets/icon/gizi.webp",
    kesehatan: "assets/icon/kesehatan.webp",
    imunisasi: "assets/icon/imunisasi.webp",
    umum: "assets/icon/umum.webp",
  };

  list.innerHTML = filtered
    .map(
      (info) => `
    <div class="info-card" data-id="${info.id}">
      <div class="info-card-header">
        <div class="info-cat-badge">
          <img src="${catIcons[info.category] || "assets/icon/umum.webp"}" alt="" width="15" height="15" />
          ${catLabels[info.category] || info.category}
        </div>
        ${
          userRole === "admin"
            ? `
          <div class="info-actions">
            <button class="action-btn edit-btn" onclick="openEditModal('${info.id}')"> Edit</button>
            <button class="action-btn delete-btn" onclick="confirmDeleteInfo('${info.id}')"> Hapus</button>
          </div>`
            : ""
        }
      </div>
      <h3 class="info-title">${info.title}</h3>
      <p class="info-body">${info.body}</p>
      <div class="info-meta">
        <span> ${info.author}</span>
        <span> ${formatDate(info.date)}</span>
      </div>
    </div>`,
    )
    .join("");
}

function filterInfo(cat, btn) {
  currentFilter = cat;
  document
    .querySelectorAll(".filter-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderInfoList();
}

function toggleAdminPanel() {
  const panel = document.getElementById("admin-panel");
  const isOpen = panel.style.display !== "none";
  panel.style.display = isOpen ? "none" : "block";
  document.getElementById("admin-panel-btn").textContent = isOpen
    ? "➕ Tambah"
    : "✕ Tutup";
}

// ── CREATE ─────────────────────────────────────────────────
async function submitInfo() {
  if (userRole !== "admin") return;
  const title = document.getElementById("info-title-input").value.trim();
  const body = document.getElementById("info-body-input").value.trim();
  const cat = document.getElementById("info-category").value;

  if (!title || !body) {
    showToast("⚠️ Judul dan isi tidak boleh kosong!");
    return;
  }

  try {
    // Simpan ke Firestore
    await db.collection("infos").add({
      title,
      body,
      category: cat,
      date: new Date().toISOString().split("T")[0],
      author: "Admin Posyandu",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // Panggil Node.js Backend untuk trigger Push Notification ke semua user
    fetch("http://localhost:3000/notify", {
      method: "POST",
      body: JSON.stringify({ title: title, body: body }),
      headers: { "Content-Type": "application/json" },
    }).catch((e) => console.error("Gagal memanggil server notifikasi:", e));

    markInfoAdded();
    document.getElementById("info-title-input").value = "";
    document.getElementById("info-body-input").value = "";
    toggleAdminPanel();
    showToast("✅ Informasi berhasil ditambahkan!");
  } catch (error) {
    showToast("❌ Gagal menyimpan informasi.");
    console.error(error);
  }
}

// ── UPDATE ─────────────────────────────────────────────────
function openEditModal(id) {
  const info = allInfos.find((i) => i.id === id);
  if (!info) return;
  document.getElementById("edit-id").value = info.id;
  document.getElementById("edit-title").value = info.title;
  document.getElementById("edit-body").value = info.body;
  document.getElementById("edit-category").value = info.category;
  document.getElementById("edit-modal").style.display = "flex";
}

async function saveEdit() {
  const id = document.getElementById("edit-id").value;
  const title = document.getElementById("edit-title").value.trim();
  const body = document.getElementById("edit-body").value.trim();
  const category = document.getElementById("edit-category").value;

  if (!title || !body) return showToast("⚠️ Judul dan isi tidak boleh kosong!");

  try {
    await db.collection("infos").doc(id).update({ title, body, category });
    closeEditModal();
    showToast("✅ Informasi berhasil diperbarui!");
  } catch (error) {
    showToast("❌ Gagal memperbarui.");
  }
}

function closeEditModal() {
  document.getElementById("edit-modal").style.display = "none";
}

// ── DELETE ─────────────────────────────────────────────────
function confirmDeleteInfo(id) {
  const info = allInfos.find((i) => i.id === id);
  if (!info) return;
  deleteTargetId = id;
  document.getElementById("delete-info-title").textContent = `"${info.title}"`;
  document.getElementById("delete-modal").style.display = "flex";
}

async function executeDelete() {
  if (!deleteTargetId) return;
  try {
    await db.collection("infos").doc(deleteTargetId).delete();
    closeDeleteModal();
    showToast("🗑️ Informasi berhasil dihapus!");
  } catch (error) {
    showToast("❌ Gagal menghapus informasi.");
  }
}

function closeDeleteModal() {
  document.getElementById("delete-modal").style.display = "none";
  deleteTargetId = null;
}

// ── Toast & Badges ──────────────────────────────────────────
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function markInfoAdded() {
  localStorage.setItem("lastInfoAdded", Date.now().toString());
  updateInfoBadge();
}

function markInfoRead() {
  localStorage.setItem("lastInfoRead", Date.now().toString());
  updateInfoBadge();
}

function updateInfoBadge() {
  const badge = document.getElementById("info-badge");
  if (!badge) return;
  if (userRole === "admin") return badge.classList.remove("visible");

  const lastAdded = parseInt(localStorage.getItem("lastInfoAdded") || "0");
  const lastRead = parseInt(localStorage.getItem("lastInfoRead") || "0");
  lastAdded > lastRead
    ? badge.classList.add("visible")
    : badge.classList.remove("visible");
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ============================================================
// PUSH NOTIFICATION LOGIC (FCM)
// ============================================================
async function subscribeToPush() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const currentToken = await messaging.getToken({
        vapidKey: PUBLIC_VAPID_KEY,
      });
      if (currentToken) {
        // Simpan token ke Firestore agar Backend bisa mengambilnya
        await db.collection("fcmTokens").doc(currentToken).set(
          {
            token: currentToken,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
        console.log("Token FCM berhasil disimpan!");
      } else {
        console.log("Gagal mendapatkan token FCM.");
      }
    }
  } catch (error) {
    console.error("Error meminta izin notifikasi:", error);
  }
}

// Menangkap notifikasi jika aplikasi sedang aktif (foreground)
messaging.onMessage((payload) => {
  showToast(`🔔 Info Baru: ${payload.notification.title}`);
  markInfoAdded();
});

// ══════════════════════════════════════════════════════════
//  INFO BADGE – SISTEM NOTIFIKASI BELUM BACA
// ══════════════════════════════════════════════════════════

/**
 * Dipanggil saat admin menambah informasi baru.
 * Menyimpan timestamp info terbaru ke localStorage.
 */
function markInfoAdded() {
  localStorage.setItem("lastInfoAdded", Date.now().toString());
  updateInfoBadge();
}

/**
 * Dipanggil saat user membuka halaman info.
 * Menyimpan timestamp terakhir dibaca ke localStorage.
 */
function markInfoRead() {
  localStorage.setItem("lastInfoRead", Date.now().toString());
  updateInfoBadge();
}

/**
 * Mengecek apakah ada info baru yang belum dibaca,
 * lalu tampilkan atau sembunyikan badge merah.
 * Badge HANYA muncul untuk role 'user', bukan admin.
 */
function updateInfoBadge() {
  const badge = document.getElementById("info-badge");
  if (!badge) return;

  // Admin tidak perlu notifikasi (dia yang nambah)
  if (userRole === "admin") {
    badge.classList.remove("visible");
    return;
  }

  const lastAdded = parseInt(localStorage.getItem("lastInfoAdded") || "0");
  const lastRead = parseInt(localStorage.getItem("lastInfoRead") || "0");

  // Tampilkan badge jika ada info baru yang belum dibaca
  if (lastAdded > lastRead) {
    badge.classList.add("visible");
  } else {
    badge.classList.remove("visible");
  }
}

// ── Progress ───────────────────────────────────────────────
function saveProgress() {
  localStorage.setItem("posyandu_progress", JSON.stringify(chapterProgress));
}
function loadProgress() {
  const saved = localStorage.getItem("posyandu_progress");
  if (saved) chapterProgress = JSON.parse(saved);
}

// ── Utils ──────────────────────────────────────────────────
function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ============================================================
// PUSH NOTIFICATION LOGIC
// ============================================================

// GANTI DENGAN PUBLIC KEY DARI LANGKAH 1
const PUBLIC_VAPID_KEY = "MASUKKAN_PUBLIC_KEY_DI_SINI";

// Fungsi wajib untuk mengubah format key agar diterima push server
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Fungsi meminta izin dan mendaftarkan push notification
async function subscribeToPush() {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    try {
      const register = await navigator.serviceWorker.ready;

      // Minta langganan ke push server
      const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
      });

      // Kirim data subscription ke SQLite backend kita
      await fetch("http://localhost:3000/subscribe", {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: { "Content-Type": "application/json" },
      });

      console.log("Berhasil daftar push notification!");
    } catch (err) {
      console.error("Gagal daftar push notification:", err);
    }
  }
}
