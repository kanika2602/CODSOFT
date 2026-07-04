# ARIA — Royal AI Chatbot
### Rule-Based NLP Chatbot | AI Internship Project

---

## 📁 Project Structure

```
royal-chatbot/
├── frontend/
│   └── index.html          ← Main HTML page (open this in browser)
├── backend/
│   └── chatbot_engine.js   ← Rule-Based NLP Engine (AI logic)
├── assets/
│   ├── css/
│   │   └── style.css       ← All styling, animations, transitions
│   └── js/
│       └── app.js          ← Frontend application logic
└── README.md
```

---

## 🚀 How to Run in VS Code

### Option 1 — Live Server (Recommended)
1. Open **VS Code**
2. Install the **Live Server** extension (by Ritwick Dey)
3. Open the project folder: `File → Open Folder → royal-chatbot`
4. Right-click `frontend/index.html` → **"Open with Live Server"**
5. Browser opens automatically at `http://127.0.0.1:5500`

### Option 2 — Direct Browser Open
1. Simply double-click `frontend/index.html`
2. It opens directly in your default browser
3. No server needed — pure HTML/CSS/JS!

---

## 🧠 How the Rule-Based NLP Works

The chatbot engine (`backend/chatbot_engine.js`) uses:

### Pattern Matching (Regex)
Each **intent** has a list of **regex patterns**:
```javascript
{
  tag: "greeting",
  patterns: [ /\b(hello|hi|hey|howdy)\b/i ],
  responses: [ "Hello! How may I assist you?" ]
}
```

### Intent Tags Supported
| Tag         | Examples                          |
|-------------|-----------------------------------|
| greeting    | "hi", "hello", "good morning"     |
| farewell    | "bye", "goodbye", "take care"     |
| thanks      | "thanks", "thank you", "cheers"   |
| identity    | "who are you", "your name"        |
| capabilities| "what can you do", "help me"      |
| how_are_you | "how are you", "what's up"        |
| joke        | "tell me a joke", "make me laugh" |
| time        | "what time is it"                 |
| date        | "what's today's date"             |
| math        | "calculate 5 + 3", "25 * 48"      |
| weather     | "what's the weather"              |
| age         | "how old are you"                 |
| creator     | "who made you"                    |
| facts       | "fun fact", "did you know"        |
| sad         | "I'm feeling sad", "I'm upset"    |
| fallback    | (anything unmatched)              |

### Special Dynamic Responses
- `__TIME__` → Returns current system time
- `__DATE__` → Returns today's date
- `__MATH__` → Evaluates math expressions safely

---

## 🎨 Frontend Features

### Animations & Motion
- ✨ **Particle system** — 120 floating particles in canvas
- 🌈 **Aurora background** — animated radial gradient blobs
- 💬 **Message entrance** — slide + scale animation per bubble
- 🤖 **Avatar float** — gentle vertical oscillation
- 🟢 **Status orb pulse** — live indicator breathing effect
- ⌨️ **Typing indicator** — 3-dot bounce animation

### UI/UX Features
- 🌙/☀️ **Dark/Light mode toggle**
- 🔊 **Sound toggle** — audio tones on send/receive
- 🗑️ **Clear chat** button
- ⚡ **Quick reply chips** — one-tap shortcuts
- 📊 **Message counter** in header
- 📱 **Fully responsive** — works on mobile
- ♿ **Accessible** — ARIA labels, keyboard navigation

---

## 🛠️ Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript   |
| Backend  | Pure JavaScript (Rule-Based NLP)  |
| Styling  | CSS Custom Properties, Glassmorphism |
| Animation| CSS Keyframes, Canvas API         |
| Audio    | Web Audio API                     |

---

## 📚 Learning Outcomes

1. **Natural Language Processing basics** — tokenization via regex
2. **Intent classification** — pattern matching with fallback
3. **Conversation flow** — message threading, typing delay
4. **DOM manipulation** — dynamic message rendering
5. **Canvas API** — particle system from scratch
6. **CSS animations** — keyframes, transitions, transforms
7. **Web Audio API** — programmatic sound feedback
8. **Responsive design** — mobile-first CSS

---

*Built with 💙 as an AI Internship Project — Rule-Based Chatbot*
