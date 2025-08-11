// =========== i18n ===========
const I18N = {
  th: {
    tagline: "พร้อมดูแลคุณ…",
    chooseLanguage: "เลือกภาษา",
    langNote: "(สามารถเปลี่ยนภาษาได้ภายหลังที่มุมบนขวา)",
    menuLead:
      "ไม่ต้องรอให้เกิดก่อนถึงจะเข้าใจสโตรก เรียนรู้ตอนนี้ เพื่อช่วยชีวิตได้ทันเวลา",
    riskForm: "แบบประเมินความเสี่ยง",
    riskDesc: "ตอบ 22 ข้อ ใช้เวลา ~3 นาที",
    gameSim: "เกมจำลองสถานการณ์",
    gameDesc: "ตอบคำถามสู้บอสสโตรก",
    videoTitle: "วิดีโอให้ความรู้สโตรก",
    videoNote: "(ใส่วิดีโอลงที่นี่ภายหลังได้)",
    back: "← กลับ",
    prev: "ย้อนกลับ",
    next: "ถัดไป",
    riskResultTitle: "ผลการประเมินความเสี่ยง",
    retake: "ทำใหม่อีกครั้ง",
    backToMenu: "กลับเมนู",
    disclaimer:
      "* ผลประเมินนี้เพื่อการให้ความรู้ ไม่ใช่การวินิจฉัยทางการแพทย์ หากมีอาการฉุกเฉิน โทร 1669/112 หรือไปโรงพยาบาลทันที",
    quitGame: "← ออกจากเกม",
    playAgain: "เล่นอีกครั้ง",
    levels: { low: "เสี่ยงต่ำ", mid: "เสี่ยงปานกลาง", high: "เสี่ยงสูง" },
    game: {
      correct: "ตอบถูก! คุณโจมตีบอส",
      wrong: "ตอบผิด! บอสฮีลและโจมตีคุณ",
      win: "คุณชนะ! คุณเอาชนะบอสสโตรกได้ 🎉",
      lose: "คุณแพ้ บอสยังแข็งแรงอยู่ ลองใหม่อีกครั้งนะ",
      timeup: "หมดเวลา! บอสหนีไปได้"
    }
  },
  en: {
    tagline: "Here for you…",
    chooseLanguage: "Choose language",
    langNote: "(You can switch language later at top-right.)",
    menuLead:
      "Learn now—don’t wait for stroke to happen. Knowledge saves time and lives.",
    riskForm: "Risk Assessment",
    riskDesc: "22 questions • ~3 mins",
    gameSim: "Scenario Game",
    gameDesc: "Answer to battle the Stroke Boss",
    videoTitle: "Stroke Education Video",
    videoNote: "(Embed a video here later.)",
    back: "← Back",
    prev: "Previous",
    next: "Next",
    riskResultTitle: "Your risk summary",
    retake: "Retake",
    backToMenu: "Back to Menu",
    disclaimer:
      "* This is educational and not a diagnosis. If you have emergency symptoms, call local emergency services or go to hospital immediately.",
    quitGame: "← Quit",
    playAgain: "Play again",
    levels: { low: "Low risk", mid: "Moderate risk", high: "High risk" },
    game: {
      correct: "Correct! You hit the boss",
      wrong: "Wrong! Boss heals and hits you",
      win: "Victory! You defeated the Stroke Boss 🎉",
      lose: "Defeat. The boss still stands—try again.",
      timeup: "Time’s up! The boss escaped."
    }
  }
};

let lang = localStorage.getItem("lang") || "th";
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

function setLang(l) {
  lang = l;
  localStorage.setItem("lang", l);
  // Text nodes
  $$("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const parts = key.split(".");
    let t = I18N[lang];
    for (const p of parts) t = t?.[p];
    if (typeof t === "string") el.textContent = t;
  });
  // Update selects
  $("#langSelect").value = l;
  $("#langSelectRisk").value = l;
  $("#langSelectGame").value = l;
}
setLang(lang);

// Navigation helpers
function show(id) {
  $$(".screen").forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
}
function go(id) {
  window.scrollTo({ top: 0, behavior: "instant" });
  show(id);
}

// Bind language buttons (first screen)
$$("[data-set-lang]").forEach((b) =>
  b.addEventListener("click", (e) => {
    setLang(e.currentTarget.getAttribute("data-set-lang"));
    go("#screen-menu");
  })
);

// Header language selects
$("#langSelect").addEventListener("change", (e) => setLang(e.target.value));
$("#langSelectRisk").addEventListener("change", (e) => setLang(e.target.value));
$("#langSelectGame").addEventListener("change", (e) => setLang(e.target.value));

// Menu buttons
$("#btnStartRisk").addEventListener("click", () => startRisk());
$("#btnStartGame").addEventListener("click", () => startGame());

// Back links
$$("[data-nav='menu']").forEach((b) =>
  b.addEventListener("click", () => go("#screen-menu"))
);
$$("[data-nav='risk']").forEach((b) =>
  b.addEventListener("click", () => startRisk())
);
$$("[data-nav='game']").forEach((b) =>
  b.addEventListener("click", () => startGame())
);

// =========== Risk Assessment ===========
/**
 * 22 ข้อ: ให้คะแนนความเสี่ยงแบบง่าย
 * โครงสร้าง: { id, text: {th,en}, choices: [{label:{th,en}, score}] }
 * คะแนนรวม 0-100 โดย normalize อัตโนมัติ
 */
const RISK_QUESTIONS = [
  // ปัจจัยเสี่ยงหลัก
  QYN("htn", "คุณเป็นโรคความดันโลหิตสูงหรือไม่?", "Do you have hypertension?", 8),
  QYN("dm", "คุณเป็นเบาหวานหรือไม่?", "Do you have diabetes?", 8),
  QYN(
    "chol",
    "คอเลสเตอรอล/ไขมันในเลือดสูงไหม?",
    "Do you have high cholesterol?",
    6
  ),
  QYN("smoke", "คุณสูบบุหรี่หรือไม่?", "Do you smoke?", 8),
  QYN(
    "af",
    "แพทย์เคยบอกว่ามีภาวะหัวใจเต้นผิดจังหวะ (AF) หรือไม่?",
    "Diagnosed atrial fibrillation (AF)?",
    8
  ),
  QYN(
    "tia",
    "เคยมีอาการ TIA/mini-stroke มาก่อนหรือไม่?",
    "History of TIA/mini-stroke?",
    8
  ),
  QYN("ob", "คุณมีภาวะอ้วน (BMI ≥ 30) หรือไม่?", "Obesity (BMI ≥ 30)?", 5),
  QYN(
    "inactive",
    "คุณออกกำลังกายน้อยกว่า 150 นาที/สัปดาห์หรือไม่?",
    "Less than 150 min exercise/week?",
    5
  ),
  QYN(
    "diet",
    "รับประทานอาหารเค็ม/มัน/หวานเป็นประจำหรือไม่?",
    "High-salt/fat/sugar diet routinely?",
    4
  ),
  QYN(
    "alcohol",
    "ดื่มแอลกอฮอล์เกิน 2 ดื่มมาตรฐาน/วัน หรือบ่อยครั้งหรือไม่?",
    "Alcohol >2 standard drinks/day or frequently?",
    4
  ),
  // ปัจจัยพื้นฐาน/ครอบครัว/พฤติกรรม
  QYN("stress", "คุณมีความเครียดเรื้อรังหรือไม่?", "Chronic stress?", 3),
  QYN("sleep", "นอนน้อยกว่า 6 ชม./คืนเป็นประจำหรือไม่?", "Sleep <6h/night?", 3),
  QYN(
    "family",
    "มีคนในครอบครัวสายตรงเคยเป็นสโตรกหรือไม่?",
    "Family history of stroke?",
    5
  ),
  QYN(
    "age55",
    "อายุ ≥ 55 ปี หรือไม่?",
    "Are you 55 years old or older?",
    5
  ),
  QYN("male", "เพศกำเนิดเป็นชายหรือไม่?", "Birth sex male?", 2),
  // ความรู้/การเฝ้าระวัง (ตอบ 'ไม่' จะเสี่ยงมากกว่า)
  QYNrev(
    "knowFAST",
    "คุณรู้จักอาการเตือน FAST (หน้าเบี้ยว-แขนขาอ่อน-พูดลำบาก-เวลา) หรือไม่?",
    "Do you know FAST warning signs?",
    2
  ),
  QYNrev(
    "bpCheck",
    "คุณวัดความดันโลหิตอย่างน้อยเดือนละครั้งหรือไม่?",
    "Do you check blood pressure at least monthly?",
    2
  ),
  QYNrev(
    "sugarCheck",
    "ถ้าเป็นเบาหวาน คุณตรวจน้ำตาลตามแพทย์แนะนำหรือไม่?",
    "If diabetic, do you monitor sugar as advised?",
    2
  ),
  QYNrev(
    "medAdh",
    "คุณรับประทานยาตามแพทย์สั่งสม่ำเสมอหรือไม่?",
    "Do you take prescribed meds regularly?",
    3
  ),
  QYNrev(
    "salt",
    "คุณพยายามลดเค็ม/โซเดียมในอาหารหรือไม่?",
    "Do you limit dietary salt?",
    2
  ),
  QYNrev(
    "quitPlan",
    "หากสูบบุหรี่ คุณมีแผนเลิก/กำลังเลิกอยู่หรือไม่?",
    "If you smoke, do you have a quit plan/trying to quit?",
    2
  )
];

// helper to build Yes/No item (Yes=score)
function QYN(id, th, en, score) {
  return {
    id,
    text: { th, en },
    choices: [
      { label: { th: "ใช่", en: "Yes" }, score },
      { label: { th: "ไม่ใช่", en: "No" }, score: 0 }
    ]
  };
}
// reverse-scored Yes/No (Yes=0, No=score)
function QYNrev(id, th, en, score) {
  return {
    id,
    text: { th, en },
    choices: [
      { label: { th: "ใช่", en: "Yes" }, score: 0 },
      { label: { th: "ไม่ใช่", en: "No" }, score }
    ]
  };
}

let riskIndex = 0;
let riskAnswers = [];

function startRisk() {
  riskIndex = 0;
  riskAnswers = Array(RISK_QUESTIONS.length).fill(null);
  renderRisk();
  go("#screen-risk");
}

function renderRisk() {
  const q = RISK_QUESTIONS[riskIndex];
  $("#riskQuestion").textContent = `(${riskIndex + 1}/${RISK_QUESTIONS.length}) ${
    q.text[lang]
  }`;

  const box = $("#riskChoices");
  box.innerHTML = "";
  q.choices.forEach((c, i) => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = c.label[lang];
    btn.addEventListener("click", () => {
      riskAnswers[riskIndex] = i;
      // auto next after click
      if (riskIndex < RISK_QUESTIONS.length - 1) {
        riskIndex++;
        renderRisk();
      } else {
        showRiskResult();
      }
    });
    box.appendChild(btn);
  });

  $("#riskPrev").disabled = riskIndex === 0;
  $("#riskNext").textContent = I18N[lang].next;

  $("#riskPrev").onclick = () => {
    if (riskIndex > 0) {
      riskIndex--;
      renderRisk();
    }
  };

  $("#riskNext").onclick = () => {
    if (riskIndex < RISK_QUESTIONS.length - 1) {
      riskIndex++;
      renderRisk();
    } else {
      showRiskResult();
    }
  };

  // progress
  const pct = ((riskIndex) / RISK_QUESTIONS.length) * 100;
  $("#riskProgress").style.width = `${pct}%` ;
}

function showRiskResult() {
  // sum scores
  let sum = 0;
  let max = 0;
  RISK_QUESTIONS.forEach((q, idx) => {
    const choiceIndex = riskAnswers[idx] ?? 0;
    sum += q.choices[choiceIndex].score;
    // assume max score per item is the maximum of its choices
    max += Math.max(...q.choices.map((c) => c.score));
  });
  const pct = Math.round((sum / max) * 100);
  $("#riskScorePct").textContent = `${pct}%`;

  // level
  let level = "low",
    badgeClass = "low",
    advice = "";
  if (pct >= 66) {
    level = I18N[lang].levels.high;
    badgeClass = "high";
    advice =
      lang === "th"
        ? "ความเสี่ยงสูง แนะนำพบแพทย์เพื่อตรวจสุขภาพและควบคุมปัจจัยเสี่ยงอย่างใกล้ชิด (ควบคุมความดัน/น้ำตาล/ไขมัน เลิกบุหรี่ ออกกำลังกายสม่ำเสมอ)"
        : "High risk. See a doctor for evaluation and aggressive risk control (BP/glucose/lipids, stop smoking, regular exercise).";
  } else if (pct >= 33) {
    level = I18N[lang].levels.mid;
    badgeClass = "mid";
    advice =
      lang === "th"
        ? "ความเสี่ยงปานกลาง ควรปรับพฤติกรรมและติดตามสุขภาพสม่ำเสมอ ตรวจความดัน/น้ำตาล/ไขมัน และเรียนรู้สัญญาณ FAST"
        : "Moderate risk. Improve lifestyle and monitor health regularly. Check BP/glucose/lipids and learn FAST signs.";
  } else {
    level = I18N[lang].levels.low;
    badgeClass = "low";
    advice =
      lang === "th"
        ? "ความเสี่ยงต่ำ รักษาพฤติกรรมที่ดีต่อสุขภาพต่อเนื่อง และรู้จักอาการเตือน FAST"
        : "Low risk. Maintain healthy habits and know the FAST warning signs.";
  }

  const badge = $("#riskLevelBadge");
  badge.textContent = level;
  badge.className = `badge ${badgeClass}`;
  $("#riskAdvice").textContent = advice;

  $("#riskProgress").style.width = "100%";
  go("#screen-risk-result");
}

// =========== Game ===========
const GAME_CONFIG = {
  timeSec: 60,
  playerMax: 100,
  bossMax: 150,
  damageCorrect: 20,
  bossHealOnWrong: 10,
  playerDamageOnWrong: 15
};

const GAME_QUESTIONS = [
  MC(
    "FAST ครบข้อใดต่อไปนี้?",
    "Which set correctly describes FAST?",
    [
      ["หน้าเบี้ยว แขนขาอ่อนแรง พูดไม่ชัด เวลา", "Face droop, Arm weakness, Speech trouble, Time", true],
      ["ไข้สูง เหงื่อออก หนาวสั่น ปวดศีรษะ", "Fever, Sweats, Chills, Headache", false],
      ["ไอ เจ็บคอ คัดจมูก น้ำมูก", "Cough, Sore throat, Congestion, Runny nose", false]
    ]
  ),
  MC(
    "อาการสโตรกควรไปโรงพยาบาลภายในกี่นาที/ชั่วโมงแรก?",
    "Within how soon should stroke symptoms be treated?",
    [
      ["ภายใน 3–4.5 ชั่วโมงแรก", "Within 3–4.5 hours", true],
      ["ภายใน 24 ชั่วโมง", "Within 24 hours", false],
      ["รอดู 2–3 วันก่อน", "Wait 2–3 days", false]
    ]
  ),
  MC(
    "ข้อใดไม่ควรทำเมื่อสงสัยสโตรก",
    "What should you NOT do when suspecting stroke?",
    [
      ["ให้ดื่มน้ำ/อาหารทันที", "Give food/drink right away", true],
      ["โทรฉุกเฉินและจดเวลาที่เริ่มมีอาการ", "Call emergency and note onset time", false],
      ["พาผู้ป่วยนั่ง/นอนตะแคงอย่างปลอดภัย", "Sit/lay patient safely", false]
    ]
  ),
  MC(
    "ปัจจัยเสี่ยงสำคัญข้อใด",
    "Which is an important risk factor?",
    [
      ["ความดันโลหิตสูง", "Hypertension", true],
      ["ผิวแห้งแตก", "Dry skin", false],
      ["สายตาสั้น", "Myopia", false]
    ]
  ),
  MC(
    "ผู้ป่วยสโตรกพูดไม่ชัด ควรทำอะไร",
    "Patient slurred speech—what to do first?",
    [
      ["โทรฉุกเฉินทันที", "Call emergency now", true],
      ["ให้ยาพาราฯ แล้วรอดู", "Give acetaminophen and wait", false],
      ["ให้ดื่มกาแฟเข้ม", "Give strong coffee", false]
    ]
  ),
  MC(
    "การควบคุมเกลือโซเดียมช่วยเพราะอะไร",
    "Why does salt restriction help?",
    [
      ["ช่วยควบคุมความดันโลหิต", "Helps control blood pressure", true],
      ["ช่วยให้ขาวขึ้น", "Makes skin lighter", false],
      ["ช่วยให้ผมยาวเร็ว", "Makes hair grow faster", false]
    ]
  )
];

function MC(thQ, enQ, opts /* [ [th,en,correct] ] */) {
  return {
    text: { th: thQ, en: enQ },
    choices: opts.map(([th, en, ok]) => ({
      label: { th, en },
      correct: !!ok
    }))
  };
}

let game;
function startGame() {
  game = {
    t: GAME_CONFIG.timeSec,
    player: GAME_CONFIG.playerMax,
    boss: GAME_CONFIG.bossMax,
    qi: 0,
    order: shuffle([...Array(GAME_QUESTIONS.length).keys()])
  };
  // HUD
  updateHP();
  $("#gameTime").textContent = game.t;
  renderGameQ();
  go("#screen-game");

  // timer
  if (game._timer) clearInterval(game._timer);
  game._timer = setInterval(() => {
    game.t--;
    $("#gameTime").textContent = game.t;
    if (game.t <= 0) return endGame("timeup");
  }, 1000);
}

function renderGameQ() {
  const idx = game.order[game.qi % game.order.length];
  const q = GAME_QUESTIONS[idx];
  $("#gameQuestion").textContent = q.text[lang];
  const box = $("#gameChoices");
  box.innerHTML = "";
  shuffle(q.choices.slice()).forEach((c) => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = c.label[lang];
    btn.addEventListener("click", () => onAnswer(c.correct));
    box.appendChild(btn);
  });
}

function onAnswer(correct) {
  if (correct) {
    game.boss = Math.max(0, game.boss - GAME_CONFIG.damageCorrect);
    toast(I18N[lang].game.correct);
  } else {
    game.boss = Math.min(
      GAME_CONFIG.bossMax,
      game.boss + GAME_CONFIG.bossHealOnWrong
    );
    game.player = Math.max(
      0,
      game.player - GAME_CONFIG.playerDamageOnWrong
    );
    toast(I18N[lang].game.wrong);
  }
  updateHP();

  if (game.boss <= 0) return endGame("win");
  if (game.player <= 0) return endGame("lose");

  game.qi++;
  renderGameQ();
}

function updateHP() {
  $("#hpPlayer").style.width =
    (100 * game.player) / GAME_CONFIG.playerMax + "%";
  $("#hpBoss").style.width = (100 * game.boss) / GAME_CONFIG.bossMax + "%";
  $("#hpPlayerText").textContent = `${game.player}/${GAME_CONFIG.playerMax}`;
  $("#hpBossText").textContent = `${game.boss}/${GAME_CONFIG.bossMax}`;
}

function endGame(type) {
  clearInterval(game._timer);
  let title = "Game Over",
    msg = "";
  if (type === "win") {
    title = "🏆";
    msg = I18N[lang].game.win;
  } else if (type === "lose") {
    title = "💥";
    msg = I18N[lang].game.lose;
  } else if (type === "timeup") {
    title = "⏱";
    msg = I18N[lang].game.timeup;
  }
  $("#gameOverTitle").textContent = title;
  $("#gameOverMsg").textContent = msg;
  go("#screen-game-over");
}

// small toast line
let toastTimer;
function toast(text) {
  let el = $("#_toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "_toast";
    Object.assign(el.style, {
      position: "fixed",
      left: "50%",
      bottom: "22px",
      transform: "translateX(-50%)",
      background: "#000",
      color: "#fff",
      padding: "8px 12px",
      borderRadius: "999px",
      fontWeight: "700",
      zIndex: 9999,
      opacity: 0,
      transition: ".2s opacity"
    });
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.style.opacity = 0.95;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.style.opacity = 0), 1200);
}

// utils
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// start at menu if language known
if (localStorage.getItem("lang")) {
  go("#screen-menu");
} else {
  go("#screen-lang");
}