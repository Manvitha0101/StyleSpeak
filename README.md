# <img src="frontend/public/favicon.svg" width="32" height="32" alt="StyleSpeak Logo"> StyleSpeak

<div align="center">

# Fashion is a language. We translate it.

**An AI Fashion Translator that understands how people naturally describe clothing and converts it into professional fashion terminology with intelligent outfit recommendations.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://stylespeek.vercel.app)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)

**FlowZint AI Hackathon 2026 • Open Innovation**

</div>

---

# The Problem

Every day, millions of people discover clothes they love on Instagram, Pinterest, movies, YouTube, or while walking down the street.

But when they try to buy them, they don't know what they're called.

People usually describe clothes like:

> *"That loose shirt with big sleeves."*

> *"Something Korean actors wear."*

> *"Office shoes that aren't boring."*

Current solutions don't solve this problem.

- Google Lens identifies products but doesn't explain fashion.
- Search engines require terminology users don't know.
- Store assistants struggle with vague descriptions.
- Generic AI chatbots provide one-shot answers without reasoning.

**The problem isn't search. It's translation.**

---

# The Solution

**StyleSpeak** is an AI Fashion Translator.

Instead of expecting users to know fashion terminology, StyleSpeak understands everyday language and translates it into professional fashion concepts.

```text
"I want a loose shirt with big sleeves"

            ↓

StyleSpeak translates

✓ Drop Shoulder
✓ Relaxed Fit
✓ Camp Collar
✓ Korean Casual

            ↓

AI Reasoning

            ↓

Complete Outfit

            ↓

Shopping Suggestions
```

---

# Why StyleSpeak?

Unlike traditional search engines or AI chatbots, StyleSpeak understands **intent**, not just keywords.

It converts natural human language into professional fashion terminology, explains its reasoning, recommends complete outfits, and teaches users the vocabulary behind fashion.

The result is an AI shopping assistant that feels like talking to an experienced stylist instead of a search engine.

---

# Features

| Feature | Description |
|---------|-------------|
| 🧠 **Fashion Translation** | Convert everyday descriptions into professional fashion terminology |
| 💬 **Conversational AI** | Intelligent follow-up questions for better recommendations |
| 📸 **Image Analysis** | Upload clothing images for AI-powered fashion analysis |
| 👔 **Outfit Generator** | Complete outfit recommendations from head to toe |
| 📖 **Fashion Dictionary** | Click any fashion term to learn its meaning and history |
| 🎤 **Voice Input** | Speak naturally using the Web Speech API |
| 💡 **Suggestion Chips** | Quick filters for budget, occasion, style and fit |
| 🛍️ **Shopping Suggestions** | Platform-specific shopping recommendations |
| 💾 **Session Memory** | Saves conversations locally across browser sessions |

---

# Screenshots

| Landing Page |
<img width="1896" height="876" alt="image" src="https://github.com/user-attachments/assets/122c44ff-88eb-4d7f-8e2d-d891ef2796bb" />



# Tech Stack

## Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Zustand
- React Router
- Lucide Icons

## AI

- Google Gemini API
- Gemini Vision
- Web Speech API

## Deployment

- Vercel
- GitHub

---

# Architecture

```text
                 User

                   │

      Text • Voice • Image

                   │

                   ▼

          Input Processor

                   │

                   ▼

         Context Builder

                   │

                   ▼

          Prompt Engine

                   │

                   ▼

          Google Gemini API

                   │

                   ▼

        Response Parser

          │             │

          ▼             ▼

 Fashion Translator   Chat Response

          │

          ▼

 Recommendation Cards

          │

          ▼

 Outfit Generator

          │

          ▼

 Shopping Suggestions
```

---

# Project Structure

```text
StyleSpeak/
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   │
│   ├── src/
│   │
│   ├── components/
│   │   ├── FashionTranslatorCard.tsx
│   │   ├── FashionTermModal.tsx
│   │   └── VoiceInput.tsx
│   │
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   └── ChatPage.tsx
│   │
│   ├── services/
│   │   └── geminiService.ts
│   │
│   ├── store/
│   │   └── chatStore.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── README.md
├── LICENSE
└── CONTRIBUTING.md
```

---

# Getting Started

## Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/stylespeek.git

cd stylespeek/frontend

npm install
```

Create a `.env` file.

```env
VITE_GEMINI_API_KEY=YOUR_API_KEY
```

Start the development server.

```bash
npm run dev
```

Visit:

```
http://localhost:5173
```

---

# Deployment

Deploy directly on **Vercel**.

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Set:

```
VITE_GEMINI_API_KEY
```

4. Deploy.

---

# Live Demo

🌐 **https://stylespeek.vercel.app**

---

# Try These Prompts

```
I want something Korean actors wear.

Gen Z streetwear under ₹2000.

I need an outfit for a software engineering interview.

What exactly is a Camp Collar?

I want a loose shirt with big sleeves.

Something for a rooftop dinner date.

Outfit for Hyderabad summer.

Can you analyze this clothing image?
```

---

# Future Scope

- Regional language support
- Real-time inventory integration
- Personalized recommendation engine
- AI trend forecasting
- AR Virtual Try-On
- Community outfit sharing

---

# License

MIT License © 2026 StyleSpeak

---

<div align="center">

### Built for FlowZint AI Hackathon 2026

**Powered by Google Gemini**

Fashion is a language. We translate it.

</div>
