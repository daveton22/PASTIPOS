// ============================================================
//  APP.JS – POSYANDU PINTAR GAME LOGIC
// ============================================================

// ── State ────────────────────────────────────────────────
let currentScreen = "splash-screen";
let currentChapter = null;
let currentQuestionIndex = 0;
let currentScore = 0;
let chapterProgress = {}; // { chapterId: { done: bool, score: int } }
let allInfos = [];
let answered = false;

const ADMIN_PASSWORD = "posyandu123"; // Ganti password admin di sini
const POINTS_CORRECT = 10;
const POINTS_WRONG = -5;

// ── Gambar Fallback (placeholder jika gambar tidak ditemukan) ──
// Ganti path ini jika kamu punya gambar placeholder sendiri
const PLACEHOLDER_CHAR = "assets/placeholder-char.svg";
const PLACEHOLDER_ITEM = "assets/placeholder-item.svg";

// ── Helper: Render gambar atau fallback ──────────────────
/**
 * Menghasilkan tag <img> dari path gambar.
 * Jika path kosong/undefined, tampilkan placeholder.
 * @param {string} imagePath - path ke file PNG lokal
 * @param {string} alt       - teks alt gambar
 * @param {string} cssClass  - class CSS yang dipakai
 * @param {string} fallback  - path gambar fallback
 */
function renderImage(imagePath, alt, cssClass, fallback) {
  const src = (imagePath && imagePath.trim() !== "") ? imagePath : fallback;
  return `<img 
    src="${src}" 
    alt="${alt}" 
    class="${cssClass}"
    onerror="this.src='${fallback}'; this.onerror=null;"
  >`;
}

// ── Init ─────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  loadProgress();
  loadInfos();
  generatePlaceholders(); // buat placeholder SVG otomatis jika belum ada
  setTimeout(() => showScreen("home-screen"), 2500);
});

// ── Generate placeholder SVG inline via CSS ──────────────
function generatePlaceholders() {
  // Inject style untuk placeholder gambar yang belum diisi
  const style = document.createElement("style");
  style.textContent = `
    img.char-img[src=""], img.char-img:not([src]) {
      background: #e8f5e9;
      border-radius: 12px;
    }
    img.item-img[src=""], img.item-img:not([src]) {
      background: #f5f5f5;
      border-radius: 8px;
    }
  `;
  document.head.appendChild(style);
}

// ── Screen Navigation ────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add("active");
    currentScreen = id;
  }
  if (id === "home-screen") updateHomeStats();
  if (id === "chapter-select") renderChapters();
  if (id === "info-screen") renderInfoList();
}

// ── Home Stats ───────────────────────────────────────────
function updateHomeStats() {
  let total = 0;
  let done = 0;
  for (const id in chapterProgress) {
    if (chapterProgress[id].done) {
      done++;
      total += chapterProgress[id].score;
    }
  }
  document.getElementById("total-score-home").textContent = total;
  document.getElementById("chapters-done-home").textContent =
    `${done}/${CHAPTERS.length}`;
}

// ── Chapter Select ───────────────────────────────────────
function renderChapters() {
  const grid = document.getElementById("chapter-list");
  grid.innerHTML = CHAPTERS.map((ch) => {
    const prog = chapterProgress[ch.id];
    const done = prog && prog.done;
    const score = done ? prog.score : 0;
    const stars = done ? getStars(score, ch.questions.length) : "";

    // Render gambar karakter chapter — pakai field `image`
    const chImgSrc = (ch.image && ch.image.trim() !== "") ? ch.image : PLACEHOLDER_CHAR;

    return `
      <button class="chapter-card ${done ? "done" : ""}" onclick="startChapter(${ch.id})">
        <div class="ch-img-wrap">
          <img 
            src="${chImgSrc}" 
            alt="${ch.character}" 
            class="ch-char-img"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          >
          <div class="ch-img-fallback" style="display:none">
            ${ch.id}
          </div>
        </div>
        <div class="ch-info">
          <div class="ch-num">Chapter ${ch.id}</div>
          <div class="ch-title">${ch.title}</div>
          <div class="ch-meta">${ch.questions.length} soal ${done ? `• ${stars} ${score} poin` : ""}</div>
        </div>
        ${done ? '<div class="ch-badge">✓</div>' : '<div class="ch-badge play">▶</div>'}
      </button>
    `;
  }).join("");
}

// ── Start Chapter ────────────────────────────────────────
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

// ── Render Question ──────────────────────────────────────
function renderQuestion() {
  const q = currentChapter.questions[currentQuestionIndex];
  const total = currentChapter.questions.length;
  answered = false;

  // Header
  document.getElementById("q-counter").textContent =
    `Soal ${currentQuestionIndex + 1}/${total}`;
  document.getElementById("score-display").textContent = `⭐ ${currentScore}`;

  // Progress bar
  const pct = (currentQuestionIndex / total) * 100;
  document.getElementById("progress-bar").style.width = pct + "%";

  // ── Karakter: pakai field `image` dari data.js ──
  const charEl = document.getElementById("char-emoji");
  const charSrc = (currentChapter.image && currentChapter.image.trim() !== "")
    ? currentChapter.image
    : PLACEHOLDER_CHAR;

  charEl.innerHTML = `
    <img 
      src="${charSrc}" 
      alt="${currentChapter.character}" 
      class="char-img"
      onerror="this.style.opacity='0.3'; this.onerror=null;"
    >
  `;

  document.getElementById("scene-bg").style.background = currentChapter.bgColor;
  document.getElementById("question-text").textContent = q.text;

  // Hide feedback
  document.getElementById("feedback-overlay").classList.remove("show");

  // ── Render item jawaban: pakai field `image` dari setiap item ──
  const items = [...q.items].sort(() => Math.random() - 0.5);
  const grid = document.getElementById("items-grid");

  grid.innerHTML = items.map((item) => {
    const itemSrc = (item.image && item.image.trim() !== "")
      ? item.image
      : PLACEHOLDER_ITEM;

    return `
      <button 
        class="item-btn" 
        onclick="selectItem(this, ${item.correct})" 
        data-correct="${item.correct}"
      >
        <span class="item-emoji">
          <img 
            src="${itemSrc}" 
            alt="${item.label}" 
            class="item-img"
            onerror="this.style.opacity='0.2'; this.onerror=null;"
          >
        </span>
        <span class="item-label">${item.label}</span>
      </button>
    `;
  }).join("");

  // Animasi masuk
  grid.querySelectorAll(".item-btn").forEach((btn, i) => {
    btn.style.animationDelay = `${i * 0.08}s`;
    btn.classList.add("pop-in");
  });
}

// ── Select Item ──────────────────────────────────────────
function selectItem(btn, isCorrect) {
  if (answered) return;
  answered = true;

  const q = currentChapter.questions[currentQuestionIndex];

  // Disable semua tombol & highlight jawaban benar
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

// ── Feedback Overlay ─────────────────────────────────────
function showFeedback(correct, explanation) {
  const box = document.getElementById("feedback-box");
  document.getElementById("feedback-emoji").textContent = correct ? "🎉" : "😅";
  document.getElementById("feedback-text").textContent = correct
    ? "Benar! +10 Poin"
    : "Kurang Tepat -5 Poin";
  document.getElementById("feedback-explain").textContent = explanation;

  const isLast = currentQuestionIndex >= currentChapter.questions.length - 1;
  document.getElementById("next-btn").textContent = isLast ? "Lihat Hasil →" : "Lanjut →";

  box.className = "feedback-box " + (correct ? "correct" : "wrong");
  document.getElementById("feedback-overlay").classList.add("show");
}

// ── Next Question ────────────────────────────────────────
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex >= currentChapter.questions.length) {
    endChapter();
  } else {
    renderQuestion();
  }
}

// ── End Chapter ──────────────────────────────────────────
function endChapter() {
  chapterProgress[currentChapter.id] = {
    done: true,
    score: currentScore,
  };
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
  const max = totalQ * POINTS_CORRECT;
  const pct = (score / max) * 100;
  if (pct >= 80) return "⭐⭐⭐";
  if (pct >= 50) return "⭐⭐";
  return "⭐";
}

function replayChapter() {
  if (currentChapter) startChapter(currentChapter.id);
}

// ── Exit Game ────────────────────────────────────────────
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

// ── Particles Effect ─────────────────────────────────────
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

// ── INFO SYSTEM ──────────────────────────────────────────
function loadInfos() {
  const saved = localStorage.getItem("posyandu_infos");
  if (saved) {
    allInfos = JSON.parse(saved);
  } else {
    allInfos = [...DEFAULT_INFOS];
    saveInfos();
  }
}

function saveInfos() {
  localStorage.setItem("posyandu_infos", JSON.stringify(allInfos));
}

let currentFilter = "all";

function renderInfoList() {
  const list = document.getElementById("info-list");
  const filtered =
    currentFilter === "all"
      ? allInfos
      : allInfos.filter((i) => i.category === currentFilter);

  if (filtered.length === 0) {
    list.innerHTML = '<div class="info-empty">Belum ada informasi di kategori ini.</div>';
    return;
  }

  const catLabels = {
    gizi: "🥗 Gizi",
    kesehatan: "🏥 Kesehatan",
    imunisasi: "💉 Imunisasi",
    umum: "📋 Umum",
  };

  list.innerHTML = filtered.map((info) => `
    <div class="info-card" data-id="${info.id}">
      <div class="info-cat-badge">${catLabels[info.category] || info.category}</div>
      <h3 class="info-title">${info.title}</h3>
      <p class="info-body">${info.body}</p>
      <div class="info-meta">
        <span>👤 ${info.author}</span>
        <span>📅 ${formatDate(info.date)}</span>
      </div>
    </div>
  `).join("");
}

function filterInfo(cat, btn) {
  currentFilter = cat;
  document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderInfoList();
}

function toggleAdminPanel() {
  const panel = document.getElementById("admin-panel");
  panel.style.display = panel.style.display === "none" ? "block" : "none";
}

function submitInfo() {
  const pass = document.getElementById("admin-pass").value;
  const title = document.getElementById("info-title-input").value.trim();
  const body = document.getElementById("info-body-input").value.trim();
  const cat = document.getElementById("info-category").value;

  if (pass !== ADMIN_PASSWORD) {
    alert("❌ Password salah!");
    return;
  }
  if (!title || !body) {
    alert("⚠️ Judul dan isi informasi tidak boleh kosong!");
    return;
  }

  const newInfo = {
    id: "inf_" + Date.now(),
    title,
    body,
    category: cat,
    date: new Date().toISOString().split("T")[0],
    author: "Admin Posyandu",
  };

  allInfos.unshift(newInfo);
  saveInfos();
  renderInfoList();

  document.getElementById("info-title-input").value = "";
  document.getElementById("info-body-input").value = "";
  document.getElementById("admin-pass").value = "";
  document.getElementById("admin-panel").style.display = "none";

  alert("✅ Informasi berhasil dikirim!");
}

// ── Progress Persistence ─────────────────────────────────
function saveProgress() {
  localStorage.setItem("posyandu_progress", JSON.stringify(chapterProgress));
}
function loadProgress() {
  const saved = localStorage.getItem("posyandu_progress");
  if (saved) chapterProgress = JSON.parse(saved);
}

// ── Utils ─────────────────────────────────────────────────
function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
