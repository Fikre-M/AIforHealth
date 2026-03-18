# AIforHealth

> An AI-powered healthcare platform that makes managing your health as easy as sending a message.

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
[![Gemini](https://img.shields.io/badge/AI-Gemini_2.5_Flash-orange.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-gray.svg)](LICENSE)

---

## The Problem

Healthcare is fragmented. Patients forget appointments, struggle to find the right specialist, can't
get quick answers to basic health questions at 2am, and have no single place to track their health
journey. Doctors waste time on administrative overhead instead of patient care.

**AIforHealth** was built to solve this — a unified platform where AI handles the guidance,
scheduling handles the logistics, and both patient and doctor have exactly what they need in one
place.

---

## Design Process

### 1. Problem Discovery

The core insight: most health anxiety happens outside clinic hours. People Google symptoms, get
scared, and either overreact or ignore real warning signs. The opportunity was to put a
knowledgeable, calm AI assistant in their pocket — one that gives real guidance and knows when to
say "you need to see a doctor."

### 2. User Flows First

Before writing a line of code, two primary user journeys were mapped:

- **Patient**: Land on site → get a taste of the AI → sign up → book appointment → get reminders →
  track health
- **Doctor**: Log in → see today's schedule → manage patient queue → update records

### 3. Progressive Disclosure

The landing page chatbot was a deliberate design decision. Instead of a cold sign-up wall, visitors
get 3 free AI exchanges. They experience the value before committing. Conversion happens naturally.

### 4. Dual Dashboard Architecture

Patients and doctors have fundamentally different needs. Rather than one dashboard with role-based
visibility toggles (confusing), two completely separate dashboards were built — each optimized for
its user.

### 5. Iterative Refinement

Key UX decisions made during development:

- Symptom checker and AI chat were unified into the same container size/shape for visual consistency
- Floating chat widget added to authenticated app so AI is always one click away
- Settings reminders tab crash fixed by adding defensive null guards — real-world API responses are
  messy

---

## Features

### For Patients

- **AI Health Assistant** — Ask anything, get real answers powered by Gemini 2.5 Flash
- **Symptom Checker** — Structured symptom analysis with urgency detection and specialist
  recommendations
- **Appointment Booking** — Find doctors by specialty, see availability, book instantly
- **Smart Reminders** — Configurable email/SMS/push reminders so you never miss an appointment
- **Health Dashboard** — Upcoming appointments, medications, health reminders in one view
- **Notification Center** — All alerts in one place

### For Doctors

- **Patient Queue** — Today's appointments with priority and status management
- **Patient Management** — Full patient list with history
- **Analytics** — Practice insights and appointment trends

### Platform-wide

- **Landing Page Chatbot** — 3 free AI exchanges for visitors, then prompts sign-up
- **Floating Chat Widget** — Persistent AI assistant on every authenticated page
- **Dark Mode** — Full dark theme with system preference detection
- **Responsive Design** — Works on mobile, tablet, and desktop
- **Role-based Access** — Patient and doctor roles with appropriate permissions

---

## Tech Stack

| Layer    | Technology                                  |
| -------- | ------------------------------------------- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS    |
| Backend  | Node.js, Express, TypeScript                |
| Database | MongoDB Atlas (Mongoose)                    |
| AI       | Google Gemini 2.5 Flash                     |
| Auth     | JWT + Refresh Tokens, bcrypt                |
| Security | Helmet, CORS, Rate Limiting, Zod validation |
| Logging  | Winston                                     |
| Docs     | Swagger / OpenAPI                           |
| CI       | GitHub Actions, Husky, ESLint, Prettier     |
| Hosting  | Render (backend), Netlify (frontend)        |

---

## Project Structure

```
AIforHealth/
├── frontend/
│   └── src/
│       ├── components/        # Reusable UI (Button, Card, layout, chat widget)
│       ├── features/          # Feature modules (auth, dashboard, booking, chat...)
│       ├── hooks/             # useAuth, useDarkMode, useLoadingState...
│       ├── services/          # API layer (appointments, AI, auth, profile...)
│       ├── types/             # TypeScript interfaces
│       └── utils/             # Validation, logging, accessibility helpers
├── backend/
│   └── src/
│       ├── controllers/       # Request handlers
│       ├── services/          # Business logic (AI, appointments, auth...)
│       ├── models/            # Mongoose schemas
│       ├── routes/            # Express routers
│       ├── middleware/        # Auth, error handling, rate limiting, logging
│       ├── config/            # Env, database, Swagger, Sentry
│       └── utils/             # Logger, error monitoring
├── scripts/                   # Lint scripts, setup helpers
├── render.yaml                # Render deployment config
└── netlify.toml               # Netlify deployment config
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google AI Studio API key (free at [ai.google.dev](https://ai.google.dev))

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

```bash
npm run dev
# API running at http://localhost:5000
# Docs at http://localhost:5000/api-docs
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

```bash
npm run dev
# App running at http://localhost:5173
```

---

## API Overview

Base URL: `/api/v1`

| Resource      | Endpoints                                                                           |
| ------------- | ----------------------------------------------------------------------------------- |
| Auth          | `POST /auth/register`, `POST /auth/login`, `GET /auth/profile`                      |
| Appointments  | `GET/POST /appointments`, `PATCH /appointments/:id`                                 |
| AI Assistant  | `POST /ai-assistant/conversations`, `POST /ai-assistant/conversations/:id/messages` |
| Doctors       | `GET /doctors`, `GET /doctors/:id`                                                  |
| Clinics       | `GET /clinics`                                                                      |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read`                               |
| Profile       | `PUT /auth/profile`, `GET/PUT /auth/settings`                                       |

Full interactive docs available at `/api-docs` (Swagger UI).

---

## Key Technical Decisions

**Why Gemini over OpenAI?** Gemini 2.5 Flash has a generous free tier (1,500 req/day) which makes it
practical for a project at this stage. The model handles health queries well and the
`@google/generative-ai` SDK is clean to work with.

**Why MongoDB?** Health data is document-oriented by nature — a patient's profile, appointments, and
medical info map naturally to nested documents. Schema flexibility also helped during rapid
iteration.

**Why a floating chat widget instead of a dedicated page only?** The dedicated `/app/ai-chat` page
exists for focused conversations. But health questions come up in context — while looking at an
appointment, or checking reminders. The floating widget makes the AI available everywhere without
navigation friction.

**Landing page chatbot strategy** Unauthenticated users get 3 hardcoded FAQ responses (no API calls,
no abuse risk). After 3 exchanges, a sign-up prompt appears. This gives real value before the ask,
which is better UX than a cold CTA.

---

## Security

- JWT authentication with short-lived access tokens and refresh token rotation
- Passwords hashed with bcrypt (12 rounds)
- Rate limiting on all API endpoints (100 req/15min)
- Input validation with Zod on all routes
- Security headers via Helmet.js
- CORS configured per environment
- Audit logging for sensitive operations

---

## Deployment

The app is deployed on:

- **Backend**: Render (see `render.yaml`)
- **Frontend**: Netlify (see `netlify.toml`)

Production environment variables needed:

```env
# Backend (Render)
NODE_ENV=production
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
CORS_ORIGIN=https://your-frontend-domain.netlify.app
FRONTEND_URL=https://your-frontend-domain.netlify.app

# Frontend (Netlify)
VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1
```

---

## Results & Impact

- **AI response time**: ~1-2s average with Gemini 2.5 Flash
- **Landing page conversion**: The 3-exchange chatbot creates a natural, low-friction path to
  sign-up
- **Zero white-screen crashes**: Defensive null guards on all API-driven UI components
- **Pre-commit quality gates**: ESLint + Prettier + TypeScript checks run on every commit via Husky
  — no broken code reaches main

---

## Roadmap

- [ ] Real-time notifications via WebSocket
- [ ] Telemedicine video calls
- [ ] Mobile app (React Native)
- [ ] Electronic health records (EHR) integration
- [ ] Multi-language support
- [ ] Redis caching for high-traffic endpoints
- [ ] Prescription management

---

## License

MIT — see [LICENSE](LICENSE)

---

<div align="center">
  Built to make healthcare less stressful.<br/>
  <a href="https://github.com/Fikre-M/AIforHealth/issues">Report a bug</a> · <a href="https://github.com/Fikre-M/AIforHealth/issues">Request a feature</a>
</div>
