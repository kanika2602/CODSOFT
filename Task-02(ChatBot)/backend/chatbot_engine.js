// ============================================================
//  ROYAL CHATBOT — Rule-Based NLP Engine
//  backend/chatbot_engine.js
// ============================================================

"use strict";

// ── 1. INTENT PATTERNS ─────────────────────────────────────
const intents = [
  {
    tag: "greeting",
    patterns: [
      /\b(hello|hi|hey|howdy|greetings|good\s*(morning|evening|afternoon|day))\b/i,
    ],
    responses: [
      "Hello! It's a pleasure to meet you. How may I assist you today?",
      "Greetings! I'm ARIA, your AI assistant. What can I help you with?",
      "Hi there! Welcome. How can I be of service?",
    ],
  },
  {
    tag: "farewell",
    patterns: [
      /\b(bye|goodbye|see\s*you|take\s*care|farewell|ciao|adios|later)\b/i,
    ],
    responses: [
      "Goodbye! It was a pleasure assisting you. Have a wonderful day!",
      "Farewell! Feel free to return whenever you need help.",
      "Take care! I'll be here whenever you need me. Goodbye!",
    ],
  },
  {
    tag: "thanks",
    patterns: [
      /\b(thank(s|you)?|thx|ty|appreciate|grateful|cheers)\b/i,
    ],
    responses: [
      "You're most welcome! Is there anything else I can help with?",
      "My pleasure! Don't hesitate to ask if you need more assistance.",
      "Happy to help! Is there anything else on your mind?",
    ],
  },
  {
    tag: "identity",
    patterns: [
      /\b(who\s*(are\s*you|r\s*u)|what('?s|\s+is)\s*(your\s*name|you)|your\s*name|introduce\s*yourself)\b/i,
    ],
    responses: [
      "I'm ARIA — Adaptive Rule-based Intelligent Assistant. I'm designed to understand your queries and provide helpful responses using pattern matching and rule-based logic.",
      "My name is ARIA! I'm an AI chatbot built with rule-based NLP. I analyze your messages and match them to predefined intents to give you accurate answers.",
    ],
  },
  {
    tag: "capabilities",
    patterns: [
      /\b(what\s*(can|do)\s*you\s*(do|help|know)|your\s*(capabilities|skills|features)|help\s*me)\b/i,
    ],
    responses: [
      "I can help you with:\n• Answering general questions\n• Providing weather info guidance\n• Sharing jokes & fun facts\n• Math calculations\n• Date & time queries\n• General knowledge topics\nJust ask me anything!",
      "Here's what I'm capable of:\n• Friendly conversation\n• General knowledge Q&A\n• Jokes and entertainment\n• Basic math\n• Time & date info\nHow can I assist you today?",
    ],
  },
  {
    tag: "how_are_you",
    patterns: [
      /\b(how\s*(are\s*you|r\s*u|do\s*you\s*feel|is\s*it\s*going)|what'?s\s*up|sup|you\s*okay)\b/i,
    ],
    responses: [
      "I'm functioning at peak performance — all systems optimal! Thanks for asking. How about you?",
      "I'm doing wonderfully well, thank you! Ready to assist. How are you today?",
      "All circuits running smoothly! I'm great. What can I do for you?",
    ],
  },
  {
    tag: "joke",
    patterns: [
      /\b(joke|funny|laugh|humor|make\s*me\s*(laugh|smile)|tell\s*me\s*something\s*funny)\b/i,
    ],
    responses: [
      "😄 Why don't scientists trust atoms? Because they make up everything!",
      "😂 Why did the chatbot go to therapy? It had too many unresolved issues!",
      "🤣 What do you call a fake noodle? An impasta!",
      "😆 Why did the programmer quit his job? Because he didn't get arrays (a raise)!",
      "😄 How do robots eat? They byte!",
    ],
  },
  {
    tag: "time",
    patterns: [
      /\b(what('?s|\s+is)?\s*(the\s*)?(current\s*)?time|what\s*time\s*is\s*it|current\s*time|tell\s*me\s*the\s*time)\b/i,
    ],
    responses: ["__TIME__"],
  },
  {
    tag: "date",
    patterns: [
      /\b(what('?s|\s+is)?\s*(the\s*)?(current\s*|today'?s?\s*)?date|what\s*day\s*is\s*(it|today)|today'?s?\s*date)\b/i,
    ],
    responses: ["__DATE__"],
  },
  {
    tag: "math",
    patterns: [
      /\b(calculate|compute|math|what\s*is\s*[\d\s\+\-\*\/\^\(\)\.]+|[\d]+\s*[\+\-\*\/]\s*[\d]+)\b/i,
    ],
    responses: ["__MATH__"],
  },
  {
    tag: "weather",
    patterns: [
      /\b(weather|temperature|forecast|rain|sunny|cloudy|snow|climate)\b/i,
    ],
    responses: [
      "I don't have live weather data, but I recommend checking weather.com or your local weather app for accurate forecasts. Is there anything else I can help with?",
      "For real-time weather updates, apps like Weather Underground or AccuWeather are great! I can help with other questions though. What else do you need?",
    ],
  },
  {
    tag: "age",
    patterns: [
      /\b(how\s*old\s*(are\s*you|r\s*u)|your\s*age|when\s*(were\s*you|r\s*u)\s*(born|created|made))\b/i,
    ],
    responses: [
      "I was born in the digital realm — age is just a version number for me! I'm running on the latest build. 🤖",
      "I'm as young as my last update! In AI years, I'm still learning and growing every day.",
    ],
  },
  {
    tag: "creator",
    patterns: [
      /\b(who\s*(made|created|built|developed)\s*you|your\s*(creator|developer|maker|author))\b/i,
    ],
    responses: [
      "I was created as part of an AI internship project focused on rule-based chatbot development. My purpose is to demonstrate natural language processing through pattern matching!",
      "A passionate AI developer built me as an internship project — showcasing how rule-based NLP can power intelligent conversation. Cool, right?",
    ],
  },
  {
    tag: "facts",
    patterns: [
      /\b(fact|trivia|interesting|did\s*you\s*know|fun\s*fact|teach\s*me|tell\s*me\s*something)\b/i,
    ],
    responses: [
      "🌟 Fun Fact: Honey never spoils! Archaeologists have found 3000-year-old honey in Egyptian tombs that's still perfectly edible.",
      "🧠 Did you know? Octopuses have three hearts, blue blood, and nine brains — one central brain and one in each arm!",
      "🌍 Amazing Fact: A day on Venus is longer than a year on Venus. It rotates so slowly that it completes an orbit before finishing one rotation!",
      "⚡ Tech Fact: The first computer bug was an actual bug — a moth found in a relay of the Harvard Mark II computer in 1947!",
      "🐋 Nature Fact: The blue whale's heartbeat can be detected from over 2 miles away!",
    ],
  },
  {
    tag: "affirmative",
    patterns: [
      /^\s*(yes|yeah|yep|yup|sure|okay|ok|alright|absolutely|definitely|of\s*course)\s*\.?\s*$/i,
    ],
    responses: [
      "Great! What would you like to know or talk about?",
      "Wonderful! How can I assist you further?",
      "Perfect! What's on your mind?",
    ],
  },
  {
    tag: "negative",
    patterns: [
      /^\s*(no|nope|nah|not\s*really|never\s*mind|nothing)\s*\.?\s*$/i,
    ],
    responses: [
      "No worries! Just let me know whenever you need something.",
      "That's perfectly fine! I'm here whenever you have a question.",
      "Understood! Feel free to ask anything whenever you're ready.",
    ],
  },
  {
    tag: "love",
    patterns: [
      /\b(i\s*(love|like)\s*you|you'?re?\s*(great|awesome|amazing|wonderful|the\s*best))\b/i,
    ],
    responses: [
      "Aww, that's so kind of you! I'm here to help and glad you're enjoying our conversation! 💙",
      "That warms my circuits! Thank you so much. You're pretty great too! ✨",
    ],
  },
  {
    tag: "sad",
    patterns: [
      /\b(i'?m?\s*(sad|unhappy|depressed|feeling\s*down|not\s*okay|upset)|feeling\s*(sad|bad|low))\b/i,
    ],
    responses: [
      "I'm sorry to hear that. 💙 Remember, it's okay to have tough days. Would you like to talk about it, or can I cheer you up with a joke?",
      "That sounds difficult. 🌟 I'm here for you! Sometimes sharing helps — what's going on? Or I can share a fun fact to brighten your day!",
    ],
  },
  {
    tag: "fallback",
    patterns: [],
    responses: [
      "Hmm, I'm not quite sure I understood that. Could you rephrase? I'm still learning! 🤔",
      "That's an interesting query! I don't have a specific answer for that yet. Try asking me about jokes, facts, time, math, or just chat with me!",
      "I didn't quite catch that. Could you try asking in a different way? I'm always improving! 💡",
    ],
  },
];

// ── 2. UTILITY FUNCTIONS ───────────────────────────────────

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function resolveSpecial(response, input) {
  if (response === "__TIME__") {
    const now = new Date();
    return `The current time is ⏰ ${now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })}.`;
  }

  if (response === "__DATE__") {
    const now = new Date();
    return `Today is 📅 ${now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}.`;
  }

  if (response === "__MATH__") {
    // Extract a mathematical expression from the input
    const expr = input.replace(/[^0-9\s\+\-\*\/\.\(\)\^%]/g, "").trim();
    if (!expr) return "Please provide a valid math expression, e.g. '5 + 3 * 2'";
    try {
      // Safe eval using Function
      // Replace ^ with ** for exponentiation
      const sanitized = expr.replace(/\^/g, "**");
      // Only allow safe math characters
      if (!/^[\d\s\+\-\*\/\.\(\)\*%]+$/.test(sanitized)) {
        return "I can only evaluate simple math expressions with +, -, *, /, (, ).";
      }
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${sanitized})`)();
      return `🔢 The result of **${expr}** = **${result}**`;
    } catch {
      return "I couldn't calculate that. Please try a simpler expression like '12 * 8' or '(5 + 3) / 2'.";
    }
  }

  return response;
}

// ── 3. MAIN PROCESS FUNCTION ───────────────────────────────

/**
 * processInput(userMessage) → { tag, response, confidence }
 */
function processInput(userMessage) {
  const text = userMessage.trim();
  if (!text) {
    return {
      tag: "empty",
      response: "Please type something so I can help you! 😊",
      confidence: 0,
    };
  }

  // Match against each intent (skip fallback)
  for (const intent of intents) {
    if (intent.tag === "fallback") continue;
    for (const pattern of intent.patterns) {
      if (pattern.test(text)) {
        const raw = pickRandom(intent.responses);
        const response = resolveSpecial(raw, text);
        return { tag: intent.tag, response, confidence: 1 };
      }
    }
  }

  // Fallback
  const fallback = intents.find((i) => i.tag === "fallback");
  return {
    tag: "fallback",
    response: pickRandom(fallback.responses),
    confidence: 0,
  };
}

// ── 4. EXPORT ──────────────────────────────────────────────

// Works in Node.js (require) and browser (window.ChatbotEngine)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { processInput, intents };
} else {
  window.ChatbotEngine = { processInput, intents };
}
