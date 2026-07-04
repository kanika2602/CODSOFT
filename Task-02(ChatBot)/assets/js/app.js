// ============================================================
//  ROYAL CHATBOT — Frontend Application Logic
//  assets/js/app.js
// ============================================================

"use strict";

// ── DOM REFERENCES ──────────────────────────────────────────
const chatMessages   = document.getElementById("chat-messages");
const userInput      = document.getElementById("user-input");
const sendBtn        = document.getElementById("send-btn");
const typingIndicator= document.getElementById("typing-indicator");
const charCount      = document.getElementById("char-count");
const clearBtn       = document.getElementById("clear-btn");
const themeToggle    = document.getElementById("theme-toggle");
const particleCanvas = document.getElementById("particle-canvas");
const soundToggle    = document.getElementById("sound-toggle");
const messageCount   = document.getElementById("message-count");

// ── STATE ───────────────────────────────────────────────────
let totalMessages   = 0;
let soundEnabled    = true;
let darkMode        = true;
let isTyping        = false;
const MAX_CHARS     = 300;

// ── PARTICLE SYSTEM ─────────────────────────────────────────
(function initParticles() {
  const ctx    = particleCanvas.getContext("2d");
  let W, H, particles = [];

  function resize() {
    W = particleCanvas.width  = window.innerWidth;
    H = particleCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x     = Math.random() * W;
      this.y     = initial ? Math.random() * H : H + 10;
      this.r     = Math.random() * 2.5 + 0.5;
      this.speed = Math.random() * 0.4 + 0.1;
      this.drift = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.hue   = Math.random() * 60 + 200; // blue-purple range
    }
    update() {
      this.y     -= this.speed;
      this.x     += this.drift;
      this.alpha -= 0.0008;
      if (this.y < -10 || this.alpha <= 0) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 120; i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();

// ── AUDIO FEEDBACK ──────────────────────────────────────────
function playTone(type) {
  if (!soundEnabled) return;
  try {
    const ac  = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ac.createOscillator();
    const gain= ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    if (type === "send") {
      osc.frequency.setValueAtTime(880, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ac.currentTime + 0.1);
    } else {
      osc.frequency.setValueAtTime(330, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ac.currentTime + 0.15);
    }
    gain.gain.setValueAtTime(0.08, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.2);
  } catch (_) {}
}

// ── TYPING INDICATOR ────────────────────────────────────────
function showTyping() {
  typingIndicator.classList.add("visible");
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function hideTyping() {
  typingIndicator.classList.remove("visible");
}

// ── MESSAGE RENDERING ───────────────────────────────────────
function formatText(text) {
  // Bold **text**, newlines → <br>
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n•/g, "<br>•")
    .replace(/\n/g, "<br>");
}

function appendMessage(text, sender, tag) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${sender}-message`;
  wrapper.setAttribute("data-tag", tag || "");

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = formatText(text);

  const meta = document.createElement("div");
  meta.className = "message-meta";
  const now = new Date();
  meta.textContent = now.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });

  wrapper.appendChild(bubble);
  wrapper.appendChild(meta);
  chatMessages.appendChild(wrapper);

  // Entrance animation via class
  requestAnimationFrame(() => wrapper.classList.add("visible"));

  totalMessages++;
  if (messageCount) messageCount.textContent = totalMessages;

  // Scroll to bottom
  setTimeout(() => {
    chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: "smooth" });
  }, 50);
}

// ── SEND LOGIC ───────────────────────────────────────────────
function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isTyping) return;

  appendMessage(text, "user");
  playTone("send");
  userInput.value = "";
  if (charCount) charCount.textContent = "0";
  sendBtn.disabled = true;

  // Simulate AI typing delay (400–900 ms)
  isTyping = true;
  showTyping();
  const delay = 400 + Math.random() * 500;

  setTimeout(() => {
    hideTyping();
    isTyping = false;
    sendBtn.disabled = false;

    const { tag, response } = window.ChatbotEngine.processInput(text);
    appendMessage(response, "bot", tag);
    playTone("receive");
  }, delay);
}

// ── QUICK REPLIES ───────────────────────────────────────────
function setupQuickReplies() {
  document.querySelectorAll(".quick-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (isTyping) return;
      userInput.value = btn.dataset.query;
      sendMessage();
    });
  });
}

// ── EVENTS ───────────────────────────────────────────────────
sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

userInput.addEventListener("input", () => {
  const len = userInput.value.length;
  if (charCount) charCount.textContent = len;
  sendBtn.disabled = len === 0;

  // Color warning
  if (charCount) {
    charCount.style.color =
      len > MAX_CHARS * 0.85 ? "var(--accent-warm)" : "var(--text-muted)";
  }
  if (len > MAX_CHARS) {
    userInput.value = userInput.value.slice(0, MAX_CHARS);
  }
});

if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    chatMessages.innerHTML = "";
    totalMessages = 0;
    if (messageCount) messageCount.textContent = "0";
    setTimeout(() => appendWelcome(), 100);
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    darkMode = !darkMode;
    document.body.classList.toggle("light-mode", !darkMode);
    themeToggle.textContent = darkMode ? "☀️" : "🌙";
  });
}

if (soundToggle) {
  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = soundEnabled ? "🔊" : "🔇";
    soundToggle.title = soundEnabled ? "Mute sounds" : "Enable sounds";
  });
}

// ── WELCOME MESSAGE ─────────────────────────────────────────
function appendWelcome() {
  const welcome = `Hello! I'm **ARIA** — your Adaptive Rule-based Intelligent Assistant. ✨\n\nI understand natural language and respond using smart pattern matching. Try asking me about:\n• The current time or date\n• A joke or fun fact\n• Math calculations\n• Who I am, or just say hi!`;
  appendMessage(welcome, "bot", "greeting");
}

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  appendWelcome();
  setupQuickReplies();
  userInput.focus();

  // Animate header orb
  const orb = document.querySelector(".status-orb");
  if (orb) {
    setInterval(() => orb.classList.toggle("pulse"), 1500);
  }
});
