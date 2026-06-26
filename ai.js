/* ============================================================
   ai.js  —  Minimax Algorithm (Unbeatable AI)
   CodSoft Internship — AI Track

   THEORY:
   Minimax is a recursive, depth-first search algorithm used in
   two-player zero-sum games. It explores every possible future
   state of the board and assigns a score:
     +10  → AI  (O) wins
     -10  → Human (X) wins
       0  → Draw

   The AI maximises its own score; the human minimises it.
   Because every branch is explored, the AI is mathematically
   unbeatable — the best a human can achieve is a draw.

   Time complexity : O(b^d)  where b = branching factor (≤9),
                              d = depth (≤9 moves)
   Space complexity: O(d)    (call-stack depth)
   ============================================================ */

"use strict";

/* ----------------------------------------------------------
   WIN PATTERNS
   All eight lines that can win a Tic-Tac-Toe game.
   ---------------------------------------------------------- */
const WIN_LINES = [
  [0, 1, 2], // top row
  [3, 4, 5], // middle row
  [6, 7, 8], // bottom row
  [0, 3, 6], // left column
  [1, 4, 7], // middle column
  [2, 5, 8], // right column
  [0, 4, 8], // diagonal ↘
  [2, 4, 6], // diagonal ↙
];

/* ----------------------------------------------------------
   checkWinner(board)
   Returns "X", "O", "draw", or null (game ongoing).
   ---------------------------------------------------------- */
function checkWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // "X" or "O"
    }
  }
  if (board.every((cell) => cell !== "")) return "draw";
  return null; // game still in progress
}

/* ----------------------------------------------------------
   minimax(board, isMaximising)
   Core recursive function.

   isMaximising = true  → it's the AI's  turn (O) — pick MAX score
   isMaximising = false → it's the human's turn (X) — pick MIN score

   Returns a numeric score for the given board state.
   ---------------------------------------------------------- */
function minimax(board, isMaximising) {
  // --- Base cases (terminal states) ---
  const result = checkWinner(board);
  if (result === "O")    return +10; // AI wins
  if (result === "X")    return -10; // Human wins
  if (result === "draw") return   0; // Nobody wins

  if (isMaximising) {
    // AI's turn: look for the highest possible score
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "O";                              // try move
        bestScore = Math.max(bestScore, minimax(board, false));
        board[i] = "";                               // undo move
      }
    }
    return bestScore;
  } else {
    // Human's turn: look for the lowest possible score
    let bestScore = +Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "X";                              // try move
        bestScore = Math.min(bestScore, minimax(board, true));
        board[i] = "";                               // undo move
      }
    }
    return bestScore;
  }
}

/* ----------------------------------------------------------
   getBestMove(board)
   Iterates over all empty cells, runs minimax for each,
   and returns the index of the cell with the highest score.
   ---------------------------------------------------------- */
function getBestMove(board) {
  let bestScore = -Infinity;
  let bestIndex = -1;

  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "O";                                // try move
      const score = minimax(board, false);           // evaluate
      board[i] = "";                                 // undo move

      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }
  }

  return bestIndex;
}
