#  Tic-Tac-Toe AI — Minimax Algorithm
### CodSoft AI Internship | Task 2

---

##  Project Structure

```
tic-tac-toe/
├── index.html   ← Page structure & layout
├── style.css    ← All visual styling & animations
├── ai.js        ← Minimax algorithm (AI brain)
└── game.js      ← Game flow, UI updates, confetti, music
```

---

##  How the AI Works — Minimax Algorithm

The AI uses the **Minimax** algorithm, a classic technique from Game Theory and Artificial Intelligence.

### Core Idea
Minimax simulates **every possible future move** in the game tree and assigns each terminal state a score:

| Outcome | Score |
|---------|-------|
| AI (O) wins | **+10** |
| Human (X) wins | **-10** |
| Draw | **0** |

The AI always picks the move that **maximises** its own score, assuming the human will always **minimise** it (play optimally).

### Pseudocode

```
function minimax(board, isMaximising):
    if terminal state:
        return score

    if isMaximising (AI's turn):
        bestScore = -∞
        for each empty cell:
            place "O", recurse(isMaximising=false)
            bestScore = max(bestScore, result)
        return bestScore

    else (Human's turn):
        bestScore = +∞
        for each empty cell:
            place "X", recurse(isMaximising=true)
            bestScore = min(bestScore, result)
        return bestScore
```

### Why is the AI Unbeatable?
Because it explores **every possible game state** (up to 9! = 362,880 states, pruned by early termination), the AI always finds the mathematically optimal move. The best result a human can achieve is a **draw**.

### Complexity
| Type | Value |
|------|-------|
| Time | O(b^d) → at most O(9!) |
| Space | O(d) — recursion stack depth |

---

##  Features

-  Unbeatable Minimax AI
-  Animated gradient background
-  Floating particle effects
-  Confetti burst when you win
-  Persistent score tracker across rounds
-  Background music toggle
-  Bouncing AI avatar with blinking eyes

---

##  How to Run

No server or dependencies needed. Just open **index.html** in any modern browser.

```bash
# Clone / download the folder, then:
open index.html
```

---

##  Tech Stack

- **HTML5** — semantic structure
- **CSS3** — animations, glassmorphism, grid layout
- **Vanilla JavaScript** — zero frameworks, zero dependencies

---

##  Author

Built as part of the **CodSoft AI Internship** program.

> *"This project demonstrates the Minimax search algorithm — the foundation of modern game-playing AI, from Tic-Tac-Toe all the way to chess engines."*
