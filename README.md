# Jarvis-Cali React - Multi-File Structure

A modern, mobile-friendly math suite built with React, Vite, and Tailwind CSS. The project is organized with a feature-first architecture for scalability, clean ownership, and fast onboarding.

## Project Structure

```text
jarvis-cali/
├── server/
│   └── index.js                                   # Secure Gemini proxy API (server-side key)
├── src/
│   ├── app/
│   │   └── App.jsx                                # App shell + view switching + global state
│   ├── features/
│   │   ├── calculator/
│   │   │   ├── components/
│   │   │   │   ├── SimpleCalculatorPage.jsx       # Main calculator UI + modes + history sheet
│   │   │   │   ├── UnitConverter.jsx              # Multi-category unit conversion
│   │   │   │   ├── DateCalculator.jsx             # Date difference and add/subtract calculator
│   │   │   │   ├── CalendarWidget.jsx             # Date picker for calculator flows
│   │   │   │   └── GraphingCalculator.jsx         # Function plotting view
│   │   │   ├── hooks/
│   │   │   │   └── useCalendarNavigation.js       # Calendar month/year/view state logic
│   │   │   └── services/
│   │   │       └── calculatorHistoryService.js    # Calculator history persistence
│   │   ├── tutor/
│   │   │   ├── components/
│   │   │   │   └── AiTutorPage.jsx                # AI tutor (typed math, drawing, image input)
│   │   │   ├── hooks/
│   │   │   │   └── useTutorHistory.js             # Tutor history persistence
│   │   │   └── services/
│   │   │       └── tutorService.js                # Gemini request/response handling
│   │   ├── practice/
│   │   │   ├── components/
│   │   │   │   └── PracticeMode.jsx               # AI-generated quiz flow + scoring
│   │   │   ├── hooks/
│   │   │   │   └── usePracticeOptions.js          # Practice option constants
│   │   │   └── services/
│   │   │       └── practiceQuestionsService.js    # Gemini quiz generation logic
│   │   └── settings/
│   │       ├── components/
│   │       │   └── SettingsModal.jsx              # Theme, API key, model selection, PWA install
│   │       ├── hooks/
│   │       │   └── useDebouncedValue.js           # Debounced input handling
│   │       └── services/
│   │           └── geminiModelsService.js         # Fetch available Gemini models
│   ├── shared/
│   │   ├── assets/
│   │   │   └── logo.svg
│   │   ├── components/
│   │   │   └── MathRenderers.jsx                  # KaTeX/math rendering helpers
│   │   ├── hooks/
│   │   │   └── useSwipeGesture.js                 # Reusable swipe navigation hook
│   │   └── utils/
│   │       ├── constants.js                       # Math keyboard + shared constants
│   │       └── dateUtils.js                       # Date parsing/formatting helpers
│   ├── assets/
│   │   └── logo.png
│   ├── index.css
│   └── main.jsx
├── public/
│   ├── manifest.json
│   └── sw.js
├── .env.example
├── jsconfig.json                                   # Alias mapping for editor tooling
├── vite.config.js                                  # Vite config + alias mapping
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Installation And Setup

### Prerequisites

- Node.js 16+
- npm

### Steps

1. Install dependencies:

```bash
npm install --legacy-peer-deps
```

2. Create local environment file:

```bash
cp .env.example .env
```

3. Add Gemini API key in `.env`:

```env
GEMINI_API_KEY=your_api_key_here
```

4. Start development server:

```bash
npm run dev
```

App runs at `http://localhost:5173`.

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Environment And API Key Behavior

API key resolution priority:

1. User-saved key from Settings (optional override)
2. `GEMINI_API_KEY` on backend server (`.env`)

Notes:

- Default key stays server-side and is never bundled into frontend code.
- If user clears custom key, requests use secure server default key.

## Key Features

### Core Experience

- Multi-view app shell with smooth animated transitions.
- Universal swipe gestures for intuitive mobile back navigation.
- Dark and light theme support from Settings.

### Calculator Feature

- Standard and scientific calculator modes.
- Local expression evaluation with support for trig, log/ln, factorial, powers, constants, and angle unit switching (DEG/RAD).
- Live result preview while typing.
- History drawer with expandable mobile sheet behavior.
- Unit converter (Area, Length, Temperature, Volume, Mass, Data, Speed, Time).
- Date calculator with:
  - Date difference mode
  - Add/subtract years, months, days
  - Interactive calendar widget
- Graphing calculator powered by function plotting.

### AI Tutor Feature

- Typed math input with structured math keyboard tabs.
- Handwritten drawing mode on canvas.
- Image upload and camera capture for problem input.
- Gemini-powered step-by-step solution generation.
- KaTeX-based rendering for math expressions and explanations.
- Persistent tutor history with re-openable attempts.

### Practice Mode Feature

- AI-generated quizzes based on topic, difficulty, and question count.
- Curated question bank with difficulty tags and curriculum mapping (General, Common Core, IGCSE, SAT).
- Hybrid generation strategy: approved curated items first, AI fallback for missing coverage.
- Built-in solution quality review queue for AI-generated questions (approve/needs-work workflow).
- Topic presets: Algebra, Calculus, Geometry, Trigonometry, Arithmetic, Statistics.
- Per-question feedback with explanation.
- End-of-quiz summary with score/percentage and retry flow.

### Settings And PWA Feature

- Save personal Gemini API key override.
- Auto-detect available Gemini models via secure backend proxy.
- Select and persist preferred model.
- Theme toggling.
- Progressive Web App install prompt integration when available.
- Offline action queue for tutor/practice requests.
- Background sync trigger for queued actions when connectivity returns.
- Conflict-safe queue replay strategy (last-write-wins per conflict key).
- In-app update toast when a new service worker version is available.

## Content Quality Workflow

- `curatedQuestionBank.js` stores approved baseline content with metadata:
  - `topic`
  - `difficulty`
  - `curriculumTag`
  - `quality.status`
- `questionBankService.js` handles filtering and review override state.
- `qualityReviewService.js` tracks generated-question review queue and outcomes.

## Architecture Highlights

- Feature-first folder structure (`features/*`) for domain ownership.
- Internal separation into:
  - `components` for UI
  - `hooks` for reusable state logic
  - `services` for IO/API and persistence logic
- Shared cross-domain layer in `src/shared`.
- Backend proxy layer in `server/index.js` for secure Gemini communication.
- Import aliases for clean paths:
  - `@app`
  - `@features`
  - `@shared`
  - `@`

## Scripts

- `npm run dev` - run secure proxy + Vite together
- `npm run dev:server` - run secure proxy server (watch mode)
- `npm run dev:client` - run Vite client only
- `npm run build` - create production bundle
- `npm run preview` - preview production build locally
- `npm run start` - run secure proxy server in production mode
- `npm run deploy` - deploy dist to GitHub Pages

## Professional DevOps

Recommended GitHub Actions workflows (add when needed):

- `.github/workflows/ci.yml`
  - Run install, build, and static checks on push/PR.
- `.github/workflows/preview-artifact.yml`
  - Build PR preview artifact (`dist`) for quick QA download.
- `.github/workflows/uptime.yml`
  - Scheduled uptime checks for live web URL and optional API health URL.
- `.github/workflows/release.yml`
  - Auto-generate release notes for `v*` tags.

Optional monitoring:

- Frontend Sentry via `VITE_SENTRY_DSN`.

## Deployment

### GitHub Pages

```bash
npm run deploy
```

The `predeploy` script runs production build automatically.

### Other Platforms

Deploy generated `dist/` folder to Vercel, Netlify, Cloudflare Pages, or any static host.

## Architecture Decisions (ADR)

### ADR-001: Feature-Based Modules

- Status: Accepted
- Decision: Organize code by feature (`calculator`, `tutor`, `practice`, `settings`) with components, hooks, and services.
- Rationale: Keeps business logic close to UI and reduces cross-feature coupling.

### ADR-002: Shared Core Layer

- Status: Accepted
- Decision: Keep common assets, hooks, components, and utilities in `src/shared`.
- Rationale: Enables reuse without blurring feature boundaries.

### ADR-003: Path Alias Strategy

- Status: Accepted
- Decision: Use aliases (`@app`, `@features`, `@shared`, `@`) in Vite and jsconfig.
- Rationale: Improves readability and minimizes brittle relative imports.

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request
