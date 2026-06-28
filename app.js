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
let splashTimerId = null;
let messagingSwRegistration = null;

const ADMIN_PASSWORD = "posyandu123"; // ← ganti password di sini
const POINTS_CORRECT = 10;
const POINTS_WRONG = -5;
let lastAnswerCorrect = null;

const PLACEHOLDER_CHAR = "assets/placeholder-char.svg";
const PLACEHOLDER_ITEM = "assets/placeholder-item.svg";
const LAST_SCREEN_KEY = "posyandu_last_screen";
const NAV_STATE_KEY = "posyandu_nav_state";

// ── Init ─────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  loadProgress();
  loadInfos();
  const restored = restoreNavigationState();
  if (restored) {
    return;
  }

  if (!history.state) {
    history.replaceState(
      { screen: "splash-screen" },
      "",
      location.pathname + location.search,
    );
  }

  splashTimerId = setTimeout(() => {
    showScreen("login-screen", { replaceState: true });
  }, 2500);

  // Di dalam window.addEventListener('DOMContentLoaded', ...)
  // Tambahkan:
  if ("serviceWorker" in navigator) {
    registerMessagingServiceWorker();
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "NOTIFICATION_CLICK") {
        markInfoAdded();
        // Opsional: langsung tampilkan info
        // showScreen('info-screen');
      }
    });
  }

  // Periksa parameter URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("from")) {
    markInfoAdded();
    // Hapus parameter dari URL tanpa reload
    history.replaceState({}, document.title, window.location.pathname);
  }
});

window.addEventListener("popstate", (event) => {
  restoreNavigationState(event.state || readNavigationState());
});

// ── Screen Navigation ────────────────────────────────────
function showScreen(id, options = {}) {
  const { replaceState = false, skipPersist = false } = options;
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

  if (splashTimerId && id !== "login-screen") {
    clearTimeout(splashTimerId);
    splashTimerId = null;
  }

  if (!skipPersist) {
    persistNavigationState();
  }

  const historyState = buildNavigationState(id);
  if (replaceState) {
    history.replaceState(historyState, "", location.pathname + location.search);
  } else {
    history.pushState(historyState, "", location.pathname + location.search);
  }
}

function buildNavigationState(screenId = currentScreen) {
  const state = {
    screen: screenId,
    userRole,
  };

  if (screenId === "game-screen" || screenId === "result-screen") {
    state.chapterId = currentChapter ? currentChapter.id : null;
    state.questionIndex = currentQuestionIndex;
    state.score = currentScore;
    state.answered = answered;
    state.lastAnswerCorrect = lastAnswerCorrect;
  }

  return state;
}

function persistNavigationState() {
  const state = buildNavigationState();
  sessionStorage.setItem(NAV_STATE_KEY, JSON.stringify(state));
  sessionStorage.setItem(LAST_SCREEN_KEY, state.screen);
}

function readNavigationState() {
  try {
    const raw = sessionStorage.getItem(NAV_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function restoreNavigationState(state = readNavigationState()) {
  if (!state || !state.screen || !document.getElementById(state.screen)) {
    return false;
  }

  if (state.userRole === "admin" || state.userRole === "user") {
    userRole = state.userRole;
  }

  if (state.screen === "game-screen" || state.screen === "result-screen") {
    const chapterId = Number(state.chapterId);
    currentChapter =
      CHAPTERS.find((chapter) => chapter.id === chapterId) || null;
    if (!currentChapter) {
      return false;
    }
    currentQuestionIndex = Number.isFinite(Number(state.questionIndex))
      ? Number(state.questionIndex)
      : 0;
    currentScore = Number.isFinite(Number(state.score))
      ? Number(state.score)
      : 0;
    answered = Boolean(state.answered);
    lastAnswerCorrect =
      typeof state.lastAnswerCorrect === "boolean"
        ? state.lastAnswerCorrect
        : null;
  } else {
    currentChapter = null;
    currentQuestionIndex = 0;
    currentScore = 0;
    answered = false;
    lastAnswerCorrect = null;
  }

  showScreen(state.screen, { replaceState: true, skipPersist: true });

  if (state.screen === "game-screen") {
    document.getElementById("game-chapter-label").textContent =
      `Chapter ${currentChapter.id}: ${currentChapter.title}`;
    renderQuestion();
    if (answered) {
      restoreFeedbackState();
    }
  }

  if (state.screen === "result-screen") {
    renderResultContent();
  }

  if (state.screen === "home-screen") updateHomeStats();
  if (state.screen === "chapter-select") renderChapters();
  if (state.screen === "info-screen") renderInfoScreen();

  return true;
}

// ══════════════════════════════════════════════════════════
//  LOGIN & ROLE
// ══════════════════════════════════════════════════════════

function loginAsUser() {
  userRole = "user";
  showScreen("home-screen");

  // Meminta izin notifikasi saat login sebagai user
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      subscribeToPush();
    } else {
      updateNotificationStatus();
    }
  });
}

function activateNotifications() {
  if (Notification.permission === "denied") {
    showToast("⚠️ Izin notifikasi telah ditolak. Silakan aktifkan dari pengaturan browser.");
    return;
  }
  subscribeToPush();
}

async function getCurrentFcmToken() {
  try {
    const registration = await registerMessagingServiceWorker();
    if (!registration) return null;
    return await messaging.getToken({
      vapidKey: PUBLIC_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
  } catch (error) {
    console.error("Gagal mendapatkan current FCM token:", error);
    return null;
  }
}

async function updateNotificationStatus() {
  const statusEl = document.getElementById("notification-status");
  const btn = document.getElementById("notification-btn");
  if (!statusEl || !btn) return;

  if (Notification.permission === "granted") {
    const token = await getCurrentFcmToken();
    if (!token) {
      statusEl.textContent = "Status notifikasi: belum terdaftar";
      btn.textContent = "Aktifkan Notifikasi";
      return;
    }

    const doc = await db.collection("fcmTokens").doc(token).get();
    if (doc.exists) {
      statusEl.textContent = "Status notifikasi: aktif";
      btn.textContent = "Notifikasi Aktif";
      btn.disabled = true;
    } else {
      statusEl.textContent = "Status notifikasi: token ditemukan, belum tersimpan";
      btn.textContent = "Aktifkan Notifikasi";
      btn.disabled = false;
    }
    return;
  }

  statusEl.textContent = "Status notifikasi: izin belum diberikan";
  btn.textContent = "Aktifkan Notifikasi";
  btn.disabled = false;
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
  sessionStorage.removeItem(NAV_STATE_KEY);
  sessionStorage.removeItem(LAST_SCREEN_KEY);
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
      <button class="chapter-card ${done ? "done" : ""}" onclick="showModule(${ch.id})">
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
  lastAnswerCorrect = null;
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

  // ── MODIFIKASI DI SINI ──
  grid.innerHTML = items
    .map((item) => {
      // Cek apakah item memiliki gambar yang valid
      const hasImage = item.image && item.image.trim() !== "";
      const imageHtml = hasImage
        ? `<span class="item-emoji">
             <img src="${item.image}" alt="${item.label}" class="item-img"
               onerror="this.style.opacity='0.2';this.onerror=null;">
           </span>`
        : "";

      return `
        <button class="item-btn" onclick="selectItem(this,${item.correct})" data-correct="${item.correct}" aria-label="Pilih jawaban ${item.label}">
          ${imageHtml}
          <span class="item-label">${item.label}</span>
        </button>`;
    })
    .join("");

  grid.querySelectorAll(".item-btn").forEach((btn, i) => {
    btn.style.animationDelay = `${i * 0.08}s`;
    btn.classList.add("pop-in");
  });

  persistNavigationState();
}

// ── Select Item ────────────────────────────────────────────
function selectItem(btn, isCorrect) {
  if (answered) return;
  answered = true;
  lastAnswerCorrect = isCorrect;
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
  persistNavigationState();
}

function showFeedback(correct, explanation) {
  const box = document.getElementById("feedback-box");

  const imgSrc = correct
    ? currentChapter.feedbackCorrect
    : currentChapter.feedbackWrong;

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
  answered = false;
  lastAnswerCorrect = null;
  renderResultContent();
  showScreen("result-screen");
  persistNavigationState();
}

function renderResultContent() {
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
}

function restoreFeedbackState() {
  answered = true;
  const q = currentChapter.questions[currentQuestionIndex];
  document.querySelectorAll(".item-btn").forEach((b) => {
    b.disabled = true;
    if (b.dataset.correct === "true") b.classList.add("correct");
  });
  if (lastAnswerCorrect === false) {
    showFeedback(false, q.explanation);
  } else {
    showFeedback(true, q.explanation);
  }
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

const PUBLIC_VAPID_KEY =
  "BAAisHTEnGV7eZPH6UyUnq6xL5lKBpIqso8NIVF--BicLrcvdSAJMrzjVicdZ6lJrhVrZOhCun3XpJ85yfGsO7M";

// ============================================================
//  INFO SYSTEM – FULL CRUD (FIRESTORE)
// ============================================================

let currentFilter = "all";
let infoBadgeUnsubscribe = null;
let sharedInfoRevision = 0;

// ── READ ───────────────────────────────────────────────────
async function loadInfos() {
  db.collection("infos")
    .orderBy("createdAt", "desc")
    .onSnapshot((snapshot) => {
      allInfos = [];
      snapshot.forEach((doc) => {
        allInfos.push({ id: doc.id, ...doc.data() });
      });

      if (currentScreen === "info-screen") {
        renderInfoList();
      }
    });

  if (!infoBadgeUnsubscribe) {
    infoBadgeUnsubscribe = db
      .collection("appMeta")
      .doc("infoBadge")
      .onSnapshot((doc) => {
        const data = doc.exists ? doc.data() : null;
        sharedInfoRevision = Number(data?.revision || 0);
        updateInfoBadge();
      });
  }
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
            <button class="action-btn edit-btn" onclick="openEditModal('${info.id}')" aria-label="Edit informasi ${info.title}"> Edit</button>
            <button class="action-btn delete-btn" onclick="confirmDeleteInfo('${info.id}')" aria-label="Hapus informasi ${info.title}"> Hapus</button>
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

// ── CREATE & SEND NOTIFICATION ─────────────────────────────
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
    // 1. Simpan data info ke Firestore
    await db.collection("infos").add({
      title,
      body,
      category: cat,
      date: new Date().toISOString().split("T")[0],
      author: "Admin Posyandu",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await markSharedInfoUpdated();

    // 2. Trigger Server Node.js untuk kirim Broadcast FCM ke semua HP
    fetch("/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          console.log("Notifikasi Firebase sukses disiarkan via Server!");
        }
      })
      .catch((e) =>
        console.error("Gagal terhubung ke server notifikasi:", e),
      );

    markInfoAdded();
    document.getElementById("info-title-input").value = "";
    document.getElementById("info-body-input").value = "";
    toggleAdminPanel();
    showToast("✅ Informasi & Notifikasi berhasil disiarkan!");
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
    await markSharedInfoUpdated();
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
    await markSharedInfoUpdated();
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

// ============================================================
// PUSH NOTIFICATION LOGIC (FCM API)
// ============================================================
async function registerMessagingServiceWorker() {
  if (messagingSwRegistration) return messagingSwRegistration;
  try {
    messagingSwRegistration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );
    console.log("Firebase messaging SW terdaftar dengan scope:", messagingSwRegistration.scope);
    return messagingSwRegistration;
  } catch (error) {
    console.error("Gagal mendaftar Firebase messaging service worker:", error);
    return null;
  }
}

async function subscribeToPush() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Izin notifikasi ditolak atau belum disetujui.");
      showToast("⚠️ Izinkan notifikasi untuk menerima informasi terbaru.");
      updateNotificationStatus();
      return;
    }

    const registration = await registerMessagingServiceWorker();
    if (!registration) return;

    const currentToken = await messaging.getToken({
      vapidKey: PUBLIC_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (currentToken) {
      await db.collection("fcmTokens").doc(currentToken).set(
        {
          token: currentToken,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      console.log("Token FCM berhasil didapatkan dan diamankan!");
      showToast("✅ Notifikasi berhasil diaktifkan.");
      updateNotificationStatus();
    } else {
      console.log("Gagal mendapatkan token FCM dari browser.");
      showToast("❌ Gagal mendapatkan token notifikasi.");
      updateNotificationStatus();
    }
  } catch (error) {
    console.error("Error meminta izin notifikasi:", error);
    showToast("❌ Terjadi kesalahan saat mengaktifkan notifikasi.");
    updateNotificationStatus();
  }
}

// Menangkap notifikasi masuk jika aplikasi web sedang dibuka oleh User
messaging.onMessage((payload) => {
  showToast(`🔔 Info Baru: ${payload.notification.title}`);
  markInfoAdded();
});

// ══════════════════════════════════════════════════════════
//  INFO BADGE – SISTEM NOTIFIKASI BELUM BACA
// ══════════════════════════════════════════════════════════

function markInfoAdded() {
  localStorage.setItem("lastInfoAdded", String(sharedInfoRevision));
  updateInfoBadge();
}

function markInfoRead() {
  localStorage.setItem("lastInfoReadRevision", String(sharedInfoRevision));
  updateInfoBadge();
}

function updateInfoBadge() {
  const badge = document.getElementById("info-badge");
  if (!badge) return;

  if (userRole === "admin") {
    badge.classList.remove("visible");
    return;
  }

  const lastRead = Number(localStorage.getItem("lastInfoReadRevision") || "0");
  const lastAdded = sharedInfoRevision;

  if (lastAdded > lastRead) {
    badge.classList.add("visible");
  } else {
    badge.classList.remove("visible");
  }
}

async function markSharedInfoUpdated() {
  await db
    .collection("appMeta")
    .doc("infoBadge")
    .set(
      {
        revision: firebase.firestore.FieldValue.increment(1),
      },
      { merge: true },
    );
}

// ── Progress & Utils ─────────────────────────────────────────
function saveProgress() {
  localStorage.setItem("posyandu_progress", JSON.stringify(chapterProgress));
}
function loadProgress() {
  const saved = localStorage.getItem("posyandu_progress");
  if (saved) chapterProgress = JSON.parse(saved);
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

// ── Modul Popup ─────────────────────────────────────────────
function showModule(chapterId) {
  const moduleData = CHAPTER_MODULES.find((m) => m.id === chapterId);
  if (!moduleData) return;

  document.getElementById("module-title").textContent =
    `📖 Modul Chapter ${chapterId}: ${moduleData.title}`;

  const list = document.getElementById("module-points");
  list.innerHTML = moduleData.points.map((p) => `<li>${p}</li>`).join("");

  // Simpan ID chapter untuk tombol mulai
  document.getElementById("module-start-btn").dataset.chapterId = chapterId;
  document.getElementById("module-modal").style.display = "flex";
}

function closeModule() {
  document.getElementById("module-modal").style.display = "none";
}

function startModuleQuiz(btn) {
  const chapterId = parseInt(btn.dataset.chapterId, 10);
  closeModule();
  startChapter(chapterId);
}
