# ⚡ CircuitMind — AI Circuit Design Q&A Tutor

> **Project 5** from Prof. Satyajit Chakrabarti's Engineering AI Projects Series

An interactive AI tutoring app where engineering students describe circuit problems and get step-by-step theory, calculations, and design guidance powered by Claude.

---

## 🚀 Features

- **6 Topic Areas** — DC Circuits, AC Circuits, Op-Amps, Digital Logic, Filters, Power Electronics
- **3 Difficulty Levels** — Beginner / Intermediate / Advanced (changes AI teaching style)
- **8 Quick Questions** — One-click starter questions for common circuit topics
- **Multi-turn Chat** — Full conversation history for follow-up questions
- **Step-by-Step Solutions** — AI shows all calculation steps, never skips
- **Code Blocks** — Circuit netlists and equations formatted cleanly
- **Export Session** — Save your tutoring session as a text file
- **Topic Highlighting** — Each AI response tagged with topic and difficulty

---

## 🛠️ Tech Stack

- React 18 + Vite
- Claude claude-sonnet-4-20250514 API
- Lucide React icons
- CSS Modules — dark industrial/electric aesthetic

---

## ⚙️ Setup

```bash
git clone https://github.com/YOUR_USERNAME/circuitmind.git
cd circuitmind
npm install
npm run dev
```

Open `http://localhost:5173`

---

## 🌐 Deploy

**Vercel (recommended):**
1. Push to GitHub
2. Import at vercel.com → Deploy (no env vars needed)

**Netlify:**
```bash
npm run build
# Drop /dist folder at netlify.com/drop
```

---

## 📖 How to Use

1. Enter your Claude API key (stored in browser localStorage)
2. Select a **Topic** chip (e.g. Op-Amps, AC Circuits)
3. Set your **Difficulty Level**
4. Type your question or click a **Quick Question**
5. Ask follow-up questions — context is maintained through the session
6. Export the session when done

---

## Sample Questions to Try

- "Explain Kirchhoff's Voltage Law with a worked example"
- "Design a low-pass RC filter for cutoff at 1kHz"
- "What is Thevenin's theorem? Show me step-by-step"
- "How does a non-inverting op-amp work? Give gain formula"

---

## 📁 Project Structure

```
circuitmind/
├── index.html
├── vite.config.js
├── package.json
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.module.css
    └── index.css
```

---

## 🎓 Academic Context

Part of a 10-project AI engineering tools series.
**Built with:** Claude API · React · Vite

## 📄 License
MIT — Free for educational use.
