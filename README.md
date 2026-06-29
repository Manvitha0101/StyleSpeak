# <img src="frontend/public/favicon.svg" width="32" height="32" alt="StyleSpeak Logo"> StyleSpeak

<div align="center">

**Fashion is a language. We translate it.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://stylespeek.vercel.app)
[![Built with Gemini](https://img.shields.io/badge/Powered%20by-Gemini%20AI-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)

*FlowZint AI Hackathon 2026 · Open Innovation Category*

</div>

---

## The Problem

Every day, millions of people see clothes they love — on Instagram, in movies, on someone walking by — but when they try to find them, they hit a wall.

> *"That loose shirt with big sleeves that Korean actors wear"*
> *"The hoodie from Stranger Things"*
> *"Office shoes that aren't boring"*

Current tools fail them:
- **Google Lens** → identifies products, doesn't advise or recommend
- **Search engines** → require exact terminology users don't know
- **Store assistants** → struggle with vague descriptions
- **Generic chatbots** → one-shot answers, no personalization or reasoning

The gap is not a search problem. It's a **translation problem**.

---

## The Solution

**StyleSpeak** is an AI Fashion Translator. It bridges the gap between how people *talk about* clothes and how the fashion industry *describes* them.

```
"I want that loose shirt with big sleeves"
                    ↓
        StyleSpeak Translates
                    ↓
  ✓ Drop Shoulder   [97% confidence]
  ✓ Relaxed Fit     [94% confidence]
  ✓ Camp Collar     [89% confidence]
  ✓ Korean Casual   [82% confidence]
                    ↓
  Complete outfit · AI reasoning · Shop online
```

---

## Features

| Feature | Description |
|---|---|
| 🗣️ **Fashion Translation** | Convert vague descriptions into precise fashion terminology |
| 📸 **Image Analysis** | Upload clothing photos for instant multi-dimensional analysis |
| 🎤 **Voice Input** | Speak naturally — Web Speech API captures and translates |
| 🧠 **AI Reasoning** | Every recommendation includes confidence scores and reasoning |
| 👔 **Outfit Generator** | Complete head-to-toe outfits built around your item |
| 📖 **Fashion Dictionary** | Click any term to get its definition, history, and context |
| 💡 **Suggestion Chips** | Smart follow-up prompts for budget, occasion, style, and fit |
| 💾 **Session Memory** | Past conversations persisted locally across browser sessions |
| 🛍️ **Shop Links** | Platform-specific search queries for Myntra, Ajio, Amazon Fashion |

---

## Screenshots

> *Add screenshots after first demo run*

| Landing Page | Chat — Translation | Fashion Dictionary |
|---|---|---|
| `[screenshot]` | `[screenshot]` | `[screenshot]` |

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| TypeScript | 5 | Type safety |
| Vite | 8 | Build tool + dev server |
| Tailwind CSS v4 | latest | Utility styling |
| Framer Motion | 11 | Animations |
| Zustand | 5 | State management + persistence |
| React Router | 6 | Client-side routing |
| Lucide React | latest | Icons |

### AI & APIs
| Service | Usage |
|---|---|
| Gemini 1.5 Flash | Fashion translation, outfit generation, term explanation |
| Gemini Vision | Clothing image analysis |
| Web Speech API | Browser-native voice recognition |

### Infrastructure
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting + CDN |
| GitHub | Version control |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              BROWSER (React + Vite)              │
│                                                  │
│  LandingPage → ChatPage → SelfieAdvisorPage     │
│       ↓              ↓                           │
│  FashionTranslatorCard  VoiceInput               │
│  FashionTermModal       SuggestionChips          │
│                                                  │
│  ┌──────────────┐  ┌─────────────────────────┐  │
│  │ Zustand Store│  │   Gemini Service Layer  │  │
│  │ (persisted)  │  │   analyzeImage()        │  │
│  │ conversations│  │   analyzeText()         │  │
│  │ preferences  │  │   chat()                │  │
│  └──────────────┘  │   analyzeSelfie()       │  │
│                    │   explainTerm()         │  │
│                    └──────────┬──────────────┘  │
└───────────────────────────────┼─────────────────┘
                                │ HTTPS
                                ▼
                    ┌───────────────────────┐
                    │   Google Gemini API   │
                    │   (gemini-1.5-flash)  │
                    └───────────────────────┘
```

### AI Workflow

```
User Input (text / image / voice)
         │
         ▼
  Input Processor
  (detects modality)
         │
         ▼
  Context Builder
  (loads conversation history + preferences)
         │
         ▼
  Prompt Engine
  (structured prompts with JSON schema)
         │
         ▼
  Gemini 1.5 Flash
         │
         ▼
  Response Parser
  (extracts JSON metadata + conversational text)
         │
    ┌────┴────┐
    ▼         ▼
  Chat     FashionTranslatorCard
  Message  (terms + confidence + outfit + links)
```

---

## Folder Structure

```
StyleSense AI/
├── frontend/
│   ├── public/
│   │   └── favicon.svg              # StyleSpeak logo (SVG)
│   ├── src/
│   │   ├── components/
│   │   │   ├── FashionTranslatorCard.tsx  # Signature AI card
│   │   │   ├── FashionTermModal.tsx       # Fashion dictionary
│   │   │   └── VoiceInput.tsx             # Web Speech API
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx            # Hero + translation demo
│   │   │   ├── ChatPage.tsx               # Main chat experience
│   │   │   └── SelfieAdvisorPage.tsx      # AI style reading
│   │   ├── services/
│   │   │   └── geminiService.ts           # All AI interactions
│   │   ├── store/
│   │   │   └── chatStore.ts               # Zustand + persistence
│   │   ├── types/
│   │   │   └── index.ts                   # TypeScript interfaces
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css                      # Full design system
│   ├── .env                               # Environment variables
│   ├── .env.example                       # Template
│   ├── vercel.json                        # Deployment config
│   └── vite.config.ts
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A free [Gemini API key](https://aistudio.google.com/app/apikey)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/stylespeek.git
cd stylespeek

# 2. Install dependencies
cd frontend
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and add your Gemini API key

# 4. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Environment Variables

Create `frontend/.env` with:

```env
# Required — get yours free at https://aistudio.google.com/app/apikey
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

That's it. No database, no backend, no other configuration required.

---

## Deployment

### Deploy to Vercel (Recommended)

```bash
# Option A: Vercel CLI
cd frontend
npm install -g vercel
vercel

# Option B: GitHub Integration
# 1. Push to GitHub
# 2. Import project at vercel.com
# 3. Set root directory to "frontend"
# 4. Add VITE_GEMINI_API_KEY in Environment Variables
# 5. Deploy
```

**Important:** Set `VITE_GEMINI_API_KEY` in Vercel's Environment Variables dashboard before deploying.

### Production Build

```bash
cd frontend
npm run build      # Build to frontend/dist/
npm run preview    # Preview production build locally
```

---

## Demo

**Live URL:** [stylespeek.vercel.app](https://stylespeek.vercel.app)

### Try These Prompts

```
"I want the oversized shirt Korean actors wear"
"Something for a job interview that's not boring"
"What is a Cuban collar?"
"Gen Z streetwear under ₹2000"
"Outfit for a rooftop date night"
```

### Voice Demo
Click the 🎤 microphone button in the chat and say any fashion description naturally.

### Image Demo
Drag and drop any clothing photo into the chat window.

---

## Future Scope

| Feature | Description | Priority |
|---|---|---|
| FastAPI Backend | Persistent user accounts, cross-device history | High |
| Firebase Auth | Google Sign-In for user profiles | High |
| Supabase DB | Saved items, preference learning | High |
| Hindi/Regional NLU | Support Indian regional fashion descriptions | Medium |
| Real Inventory | Live product availability from Myntra/Ajio API | Medium |
| AR Try-On | Virtual clothing try-on via WebXR | Low |
| Trend Alerts | Weekly AI-curated trend reports | Low |
| Community Boards | Share and discover outfit translations | Low |

---

## License

MIT © 2026 StyleSpeak. See [LICENSE](./LICENSE) for details.

---

<div align="center">
  Built for FlowZint AI Hackathon 2026 · Open Innovation Category<br/>
  Powered by Google Gemini AI
</div>
