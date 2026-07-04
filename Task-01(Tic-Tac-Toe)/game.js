/* ============================================================
   game.js  —  UI Logic, Game Flow, Confetti, Music
   CodSoft Internship — AI Track

   Depends on: ai.js  (checkWinner, getBestMove)
   ============================================================ */

"use strict";

/* ----------------------------------------------------------
   STATE
   ---------------------------------------------------------- */
let board    = Array(9).fill("");   // 9-cell board ("", "X", or "O")
let gameOver = false;
let scores   = { you: 0, ai: 0, draw: 0 };

/* ----------------------------------------------------------
   DOM REFERENCES
   ---------------------------------------------------------- */
const boardEl  = document.getElementById("board");
const statusEl = document.getElementById("status");
const winnerEl = document.getElementById("winner");

/* ----------------------------------------------------------
   SPAWN FLOATING BACKGROUND PARTICLES
   ---------------------------------------------------------- */
(function spawnParticles() {
  for (let i = 0; i < 30; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.left              = Math.random() * 100 + "vw";
    p.style.animationDuration = (8 + Math.random() * 10) + "s";
    p.style.animationDelay    = (Math.random() * 10) + "s";
    document.body.appendChild(p);
  }
})();

/* ----------------------------------------------------------
   BUILD BOARD CELLS
   ---------------------------------------------------------- */
(function buildBoard() {
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className    = "cell";
    cell.dataset.i    = i;
    cell.addEventListener("click", () => humanMove(i));
    boardEl.appendChild(cell);
  }
})();

/* ----------------------------------------------------------
   RENDER
   Syncs DOM cells with the board array.
   ---------------------------------------------------------- */
function render() {
  document.querySelectorAll(".cell").forEach((cell, i) => {
    cell.textContent = board[i];
    cell.className   = "cell";
    if (board[i] === "X") cell.classList.add("x");
    if (board[i] === "O") cell.classList.add("o");
  });
}

/* ----------------------------------------------------------
   HUMAN MOVE
   Called when a player clicks a cell.
   ---------------------------------------------------------- */
function humanMove(index) {
  if (gameOver || board[index] !== "") return; // ignore invalid clicks

  board[index] = "X";
  render();

  const result = checkWinner(board);
  if (result) { endGame(result); return; }

  // AI responds after a short "thinking" delay
  statusEl.textContent = "AI Thinking…";
  setTimeout(aiMove, 400);
}

/* ----------------------------------------------------------
   AI MOVE
   Calls getBestMove() from ai.js, places "O", checks result.
   ---------------------------------------------------------- */
function aiMove() {
  const move = getBestMove(board);
  if (move === -1) return;             // board is full (shouldn't happen)

  board[move] = "O";
  render();

  const result = checkWinner(board);
  if (result) { endGame(result); return; }

  statusEl.textContent = "Your Turn";
}

/* ----------------------------------------------------------
   END GAME
   Updates scores, shows result banner, triggers confetti.
   ---------------------------------------------------------- */
function endGame(result) {
  gameOver = true;

  if (result === "X") {
    scores.you++;
    winnerEl.textContent  = "🎉 You Win!";
    winnerEl.style.color  = "#22c55e";
    launchConfetti();
  } else if (result === "O") {
    scores.ai++;
    winnerEl.textContent  = "🤖 AI Wins!";
    winnerEl.style.color  = "#f87171";
  } else {
    scores.draw++;
    winnerEl.textContent  = "🤝 Draw!";
    winnerEl.style.color  = "#facc15";
  }

  // Update score display
  document.getElementById("you").textContent  = scores.you;
  document.getElementById("ai").textContent   = scores.ai;
  document.getElementById("draw").textContent = scores.draw;

  statusEl.textContent = "Game Over — click New Game";
}

/* ----------------------------------------------------------
   RESET GAME
   Clears board without resetting cumulative scores.
   Exposed globally so the HTML onclick can reach it.
   ---------------------------------------------------------- */
function resetGame() {
  board    = Array(9).fill("");
  gameOver = false;
  winnerEl.textContent  = "";
  statusEl.textContent  = "Your Turn";
  render();
}

/* ----------------------------------------------------------
   CONFETTI  (canvas-based particle burst)
   ---------------------------------------------------------- */
const canvas = document.getElementById("confetti");
const ctx    = canvas.getContext("2d");

// Keep canvas sized to the window
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener("resize", () => {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});

let confettiParticles = [];

function launchConfetti() {
  confettiParticles = [];
  for (let i = 0; i < 150; i++) {
    confettiParticles.push({
      x  : Math.random() * canvas.width,
      y  : -20,
      r  : Math.random() * 6 + 3,
      dx : (Math.random() - 0.5) * 6,
      dy : Math.random() * 5 + 3,
      c  : `hsl(${Math.random() * 360}, 100%, 50%)`,
    });
  }
  animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  confettiParticles.forEach((p) => {
    p.x += p.dx;
    p.y += p.dy;
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Remove particles that have fallen off-screen
  confettiParticles = confettiParticles.filter((p) => p.y < canvas.height);

  if (confettiParticles.length > 0) {
    requestAnimationFrame(animateConfetti);
  }
}

/* ----------------------------------------------------------
   BACKGROUND MUSIC TOGGLE
   ---------------------------------------------------------- */
const music    = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
let   playing  = false;

musicBtn.addEventListener("click", () => {
  if (!playing) {
    music.play().catch(() => {
      // Auto-play policy may block this — user must interact first
    });
  } else {
    music.pause();
  }
  playing = !playing;
});

/* ----------------------------------------------------------
   INITIAL RENDER
   ---------------------------------------------------------- */
render();
