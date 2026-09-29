<p align="center">
  <img src="frontend/public/favicon.svg" width="64" height="64" alt="Joineazy Logo" />
</p>

<h1 align="center">Joineazy — Assignment & Review Dashboard</h1>

<p align="center">
  A full-stack, role-based academic workspace where students track assignments and professors manage coursework — built with <strong>React 19</strong>, <strong>Vite 7</strong>, <strong>Tailwind CSS v4</strong>, and <strong>Express 5</strong>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Express-5.1-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Node.js-22.12+-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white" alt="Playwright" />
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [API Reference](#-api-reference)
- [Data Models](#-data-models)
- [User Workflows](#-user-workflows)
- [Testing Strategy](#-testing-strategy)
- [Deployment Guide](#-deployment-guide)
- [Design Decisions](#-design-decisions)
- [Scope & Limitations](#-scope--limitations)

---

## 🎯 Overview

**Joineazy** is a responsive, role-based assignment management dashboard designed to streamline the academic workflow between students and professors. It features a warm, accessible UI with soft purple accents (`#7460da`), custom SVG illustrations, and a carefully crafted two-step submission confirmation flow.

### Demo Profiles

The app ships with pre-seeded demo personas — no login required:

| Role | Name | Profile ID |
|------|------|------------|
| 🎓 Student | Maya Sharma | `student-maya` |
| 🎓 Student | Arjun Mehta | `student-alex` |
| 🎓 Student | Rohan Patil | `student-jordan` |
| 👩‍🏫 Professor | Ananya Deshmukh | `prof-sarah` |
| 👨‍🏫 Professor | Vikram Rao | `prof-james` |

Switch profiles instantly via the accessible dropdown in the top-right corner.

---

## ✨ Key Features

### 🎓 Student Dashboard
- **Assignment Overview** — Browse all assigned coursework with real-time status indicators (To do, Submitted, Overdue)
- **Smart Search & Filtering** — Search by title/course, filter by status tabs and course, sort by priority/due date/title/creation date
- **Two-Step Submission Confirmation** — Declare submission → Verify accessibility → Final confirmation with timestamp
- **Course Progress Tracking** — Visual progress bars per course with completion percentages
- **Dashboard Statistics** — At-a-glance cards showing total assignments, submitted, to-do, and overdue counts
- **Google Drive Integration** — Quick links to assignment materials on Google Drive/Docs

### 👩‍🏫 Professor Dashboard
- **Assignment CRUD** — Create, edit, and delete assignments with rich form validation
- **Student Assignment** — Assign coursework to specific students via checkbox picker
- **Submission Tracking** — Per-assignment progress bars and per-student submission status
- **Student Progress View** — Individual student completion rates across all your assignments
- **Cascade Operations** — Removing a student auto-purges their submission; deleting an assignment cascades to all submissions

### 🎨 UI/UX Highlights
- **Responsive Design** — Desktop sidebar + mobile slide-in drawer, fluid layouts across all breakpoints
- **Custom SVG Illustrations** — Hand-crafted study illustration in the hero section with animated progress ring
- **Native `<dialog>` Modals** — Focus trapping, Escape key handling, and backdrop click dismissal
- **WAI-ARIA Accessibility** — Keyboard-navigable profile menu, ARIA roles/labels, semantic HTML, reduced-motion support
- **Toast Notifications** — Auto-dismissing feedback on all mutations (4.5s timeout)
- **Dark-friendly Warm Neutrals** — Cohesive design system with `#faf9fc` backgrounds and soft purple accents

---

## 🛠 Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 19.1 | UI component library with hooks-based state management |
| **Build Tool** | Vite | 7.1 | Lightning-fast HMR, dev server with API proxy, optimized production builds |
| **Styling** | Tailwind CSS | 4.1 | Utility-first CSS with custom `@layer components` design system |
| **Icons** | Lucide React | 0.468 | Consistent, tree-shakable SVG icon set |
| **Backend** | Express | 5.1 | REST API framework with async error handling |
| **Runtime** | Node.js | 22.12+ | ES Modules, native test runner, `--watch` mode |
| **Persistence** | JSON File Store | Custom | Atomic write with `.tmp` + rename strategy, serialized mutation queue |
| **E2E Testing** | Playwright | 1.63 | Cross-browser automated workflow testing |
| **API Testing** | Node Test Runner | Built-in | Native `node:test` with `node:assert/strict` |
| **Code Quality** | ESLint 9 + Prettier | Latest | Flat config, React hooks/refresh plugins, consistent formatting |
| **Monorepo** | npm Workspaces | Native | Unified dependency management across `frontend` and `backend` |

---

## 🏗 Project Architecture

```text
Joineazy/
├── frontend/                          # React SPA (Vite + Tailwind)
│   ├── public/
│   │   └── favicon.svg                # Custom graduation cap favicon
│   ├── src/
│   │   ├── main.jsx                   # Entry: StrictMode + WorkspaceProvider
│   │   ├── App.jsx                    # Root layout, view routing, modal orchestration
│   │   ├── styles.css                 # Tailwind v4 + custom component design system
│   │   ├── components/
│   │   │   ├── EmptyState.jsx         # Context-aware empty/no-results fallback
│   │   │   ├── Hero.jsx               # Welcome banner, SVG illustration, progress ring
│   │   │   ├── Modal.jsx              # Native <dialog> with portal, focus trap, a11y
│   │   │   ├── ProfileMenu.jsx        # WAI-ARIA identity switcher dropdown
│   │   │   ├── ProgressBar.jsx        # Accessible progress indicator
│   │   │   └── Sidebar.jsx            # Responsive nav (desktop fixed + mobile drawer)
│   │   ├── context/
│   │   │   └── WorkspaceContext.jsx    # Global state, API calls, profile switching, toast
│   │   ├── features/
│   │   │   ├── assignments/
│   │   │   │   ├── AssignmentCard.jsx  # Card with course colors, badges, progress
│   │   │   │   ├── AssignmentDetails.jsx  # Detail modal, brief, Drive link, 2-step submit
│   │   │   │   ├── AssignmentForm.jsx     # CRUD form with student picker
│   │   │   │   └── AssignmentList.jsx     # Grid, search, tabs, filters, sorting
│   │   │   └── progress/
│   │   │       └── ProgressView.jsx   # Course progress (student) / Student progress (prof)
│   │   ├── services/
│   │   │   └── api.js                 # Fetch wrapper with X-Demo-User header injection
│   │   └── utils/
│   │       └── assignments.js         # Date formatting, status helpers, course styles
│   ├── vite.config.js                 # Vite 7 + React + Tailwind plugins, API proxy
│   └── eslint.config.js              # ESLint 9 flat config
│
├── backend/                           # Express 5 REST API (ES Modules)
│   ├── src/
│   │   ├── server.js                  # Entry: store init, HTTP listener
│   │   ├── app.js                     # Express factory: middleware, routes, SPA fallback
│   │   ├── data/
│   │   │   └── seed.js                # Demo users, relative-date assignments, submissions
│   │   ├── routes/
│   │   │   └── api.js                 # Route handlers, auth middleware, role guards
│   │   └── services/
│   │       ├── assignments.js         # Validation, filtering, HttpError class
│   │       └── store.js               # Atomic JSON persistence with serialized writes
│   ├── storage/
│   │   └── workspace.json             # Generated data file (gitignored)
│   └── tests/
│       └── api.test.js                # Integration tests: auth, CRUD, validation, cascade
│
├── tests/
│   └── e2e.mjs                        # Playwright browser workflow tests
├── package.json                       # Root workspace manifest + orchestration scripts
├── .prettierrc.json                   # Prettier configuration
└── .gitignore                         # node_modules, dist, storage, tmp
```

### Architecture Flow

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                     │
│  React 19 SPA  ←→  WorkspaceContext  ←→  fetch(/api)    │
└──────────────────────────┬──────────────────────────────┘
                           │ X-Demo-User header
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Express 5 Server                      │
│  Identity MW → Role Guard → Route Handler → Store        │
│                                                          │
│  Production: also serves frontend/dist as static files   │
└──────────────────────────┬──────────────────────────────┘
                           │ Atomic write (tmp + rename)
                           ▼
┌─────────────────────────────────────────────────────────┐
│               storage/workspace.json                     │
│  { assignments: [...], submissions: [...] }              │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `>=22.12.0` ([Download](https://nodejs.org/))
- **npm** (ships with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/hemantjawale/JoinEazy.git
cd JoinEazy

# Install all dependencies (frontend + backend via npm workspaces)
npm install
```

### Development

```bash
# Start both frontend and backend dev servers concurrently
npm run dev
```

This launches:
- 🌐 **Frontend** → [http://localhost:5173](http://localhost:5173) (Vite dev server with HMR)
- 🔌 **Backend API** → [http://localhost:3001](http://localhost:3001) (Express with file watcher)

Vite automatically proxies `/api` requests to the backend — no CORS configuration needed.

### Production Preview

```bash
# Build frontend assets
npm run build

# Start production server (API + static frontend)
npm start
```

Open [http://localhost:3001](http://localhost:3001) — Express serves both the API and the compiled React SPA.

---

## 📜 Available Scripts

All scripts are run from the **repository root**:

| Script | Command | Description |
|--------|---------|-------------|
| **Dev** | `npm run dev` | Start frontend + backend concurrently with hot reload |
| **Build** | `npm run build` | Build React app to `frontend/dist/` |
| **Start** | `npm start` | Serve API + built frontend in production mode |
| **Test** | `npm test` | Run backend API integration tests |
| **E2E** | `npm run test:e2e` | Build + run Playwright browser tests |
| **Check** | `npm run check` | Lint + test + build (full CI pipeline) |
| **Format** | `npm run format` | Format all source files with Prettier |

---

## 📡 API Reference

Base URL: `/api` · Auth: `X-Demo-User: <profile-id>` header (except public endpoints)

### Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/api/demo-users` | ❌ | Public | List all selectable demo profiles |
| `GET` | `/api/workspace` | ✅ | Any | Role-scoped assignments, submissions, and student roster |
| `POST` | `/api/assignments` | ✅ | Admin | Create a new assignment (returns `201`) |
| `PATCH` | `/api/assignments/:id` | ✅ | Admin | Update an owned assignment (cascades submission cleanup) |
| `DELETE` | `/api/assignments/:id` | ✅ | Admin | Delete an owned assignment + all submissions (`204`) |
| `POST` | `/api/assignments/:id/confirm` | ✅ | Student | Two-step submission: `{ confirmed: true, verified: true }` |

### Response Scoping

- **Students** see only assignments where they are in `studentIds` and only their own submissions. The `studentIds` field is omitted from student responses for privacy.
- **Professors** see only assignments where they are the `ownerId`, along with all related submissions and student info.

### Error Handling

All errors return JSON `{ message: "..." }` with appropriate HTTP status codes. Server errors (500+) return a generic message; client errors return descriptive messages.

---

## 📦 Data Models

### User
```typescript
{
  id: string          // "student-maya", "prof-sarah"
  name: string        // "Maya Sharma"
  role: "student" | "admin"
  initials: string    // "MS"
  program: string     // "Computer Science · Year 2"
}
```

### Assignment
```typescript
{
  id: string          // UUID or seed ID
  title: string       // 1–120 chars
  course: string      // 1–80 chars
  description: string // 1–5000 chars
  dueDate: string     // "YYYY-MM-DD" (validated calendar date)
  category: "Project" | "Assignment" | "Case study" | "Exercise"
  ownerId: string     // Professor's user ID
  studentIds: string[] // Assigned student IDs
  driveUrl: string    // HTTPS Google Drive/Docs URL (optional)
  createdAt: string   // ISO 8601 timestamp
}
```

### Submission
```typescript
{
  assignmentId: string  // Reference to Assignment
  studentId: string     // Reference to User
  submittedAt: string   // ISO 8601 timestamp
}
```

### Validation Rules

| Field | Rule |
|-------|------|
| `title` | Non-empty string, 1–120 characters, trimmed |
| `course` | Non-empty string, 1–80 characters, trimmed |
| `description` | Non-empty string, 1–5000 characters, trimmed |
| `dueDate` | `YYYY-MM-DD` format, valid calendar date (rejects `2026-02-31`) |
| `category` | Must be one of the four allowed values |
| `driveUrl` | HTTPS only, `drive.google.com` or `docs.google.com`, no credentials in URL |
| `studentIds` | Non-empty array, all IDs must reference existing student accounts |

---

## 👤 User Workflows

### Student Flow

1. **Browse** — View assigned coursework with status badges (To do / Submitted / Overdue)
2. **Search & Filter** — Find assignments by title/course, filter by status tab, filter by course, sort by priority
3. **Review** — Open assignment details to read the brief and access Drive materials
4. **Submit (Step 1)** — Click "Yes, I have submitted" to declare external submission
5. **Confirm (Step 2)** — Check the verification box and click "Confirm submission" — records a timestamped declaration
6. **Track Progress** — View per-course completion rates with visual progress indicators

### Professor Flow

1. **Create** — Add assignments with title, course, type, description, due date, optional Drive link, and selected students
2. **Manage** — Edit or delete only your own assignments (ownership-enforced)
3. **Monitor** — View per-assignment submission progress bars and per-student completion rates
4. **Track** — Access the Student Progress view for individual student completion percentages

---

## 🧪 Testing Strategy

### API Integration Tests (`npm test`)

Uses Node.js native test runner (`node:test`) with strict assertions:

- ✅ Authentication enforcement (401 for missing/invalid profile)
- ✅ Role-based access control (403 for unauthorized operations)
- ✅ Data isolation (professors see only own assignments)
- ✅ Full CRUD lifecycle with ownership checks
- ✅ Input validation (URLs, dates, empty fields, whitespace-only input)
- ✅ Two-step submission confirmation + idempotency
- ✅ Cascade behaviors (student removal, assignment deletion)
- ✅ Data privacy (students can't see `studentIds`)

### E2E Browser Tests (`npm run test:e2e`)

Playwright tests exercise complete user workflows in a real browser:

- Full student assignment browsing and submission flow
- Professor CRUD operations
- Profile switching
- Responsive layout verification (desktop + mobile viewports)
- Screenshots saved to `tmp/` for visual verification

```bash
# Install browser (one-time)
npx playwright install chromium

# Run E2E tests
npm run test:e2e
```

### Quality Checks (`npm run check`)

Single command that runs the full CI pipeline:
```
ESLint → API Integration Tests → Production Build
```

---

## 🌐 Deployment Guide

### Option 1: Deploy to Render (Recommended — Free Tier)

[Render](https://render.com) offers free web service hosting for Node.js apps.

**Steps:**

1. Push your code to GitHub
2. Sign in to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `joineazy` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Node Version** | `22` (set in Environment → `NODE_VERSION=22`) |

5. Add environment variable: `PORT=3001` (Render usually sets this automatically)
6. Click **Deploy** — your app will be live at `https://joineazy.onrender.com`

> **Note:** On the free tier, the app may spin down after inactivity and take ~30s to wake up.

---

### Option 2: Deploy to Railway

[Railway](https://railway.app) provides easy Node.js deployment with generous free tier.

1. Push code to GitHub
2. Sign in to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Railway auto-detects Node.js. Set:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Add variable `NODE_VERSION=22` if needed
5. Deploy — Railway provides a public URL automatically

---

### Option 3: Deploy to Vercel (Frontend) + Render (Backend)

For a split deployment:

**Frontend on Vercel:**
1. Sign in to [vercel.com](https://vercel.com) → Import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Set **Build Command** to `npm run build` and **Output Directory** to `dist`
4. Add environment variable for API URL pointing to your backend

**Backend on Render:**
1. Create a new Web Service on Render
2. Set **Root Directory** to `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `node src/server.js`

---

### Option 4: Deploy with Docker

Create a `Dockerfile` in the project root:

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY frontend/package.json frontend/
COPY backend/package.json backend/
RUN npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 3001

# Start production server
CMD ["npm", "start"]
```

Create a `compose.yaml`:

```yaml
services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    volumes:
      - app-data:/app/backend/storage

volumes:
  app-data:
```

```bash
# Build and run
docker compose up --build

# Access at http://localhost:3001
```

---

### Option 5: Deploy to a VPS (DigitalOcean / AWS EC2 / Linode)

```bash
# On your server
git clone https://github.com/hemantjawale/JoinEazy.git
cd JoinEazy
npm install
npm run build

# Run with PM2 for process management
npm install -g pm2
PORT=3001 pm2 start npm --name "joineazy" -- start

# Set up Nginx reverse proxy (optional)
# Point your domain to port 3001
```

---

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `DATA_FILE` | `backend/storage/workspace.json` | Path to JSON persistence file |
| `NODE_ENV` | — | Set to `production` for static file serving |

---

## 💡 Design Decisions

| Decision | Rationale |
|----------|-----------|
| **No external database** | JSON file store keeps the project zero-dependency on external services; atomic writes prevent corruption |
| **No `react-router`** | Three views managed via `useState` — simpler bundle, no URL sync needed for a demo |
| **Express 5** | Latest Express with native async error handling, cleaner middleware patterns |
| **Native `<dialog>`** | Built-in focus trapping and Escape handling — no modal library dependency |
| **X-Demo-User header** | Intentionally simple identity mechanism for demo — switching profiles is a feature, not a bug |
| **Tailwind v4 with `@layer`** | Utility classes for layout + custom component layer for the design system |
| **Serialized write queue** | Promise chain ensures no concurrent file writes corrupt `workspace.json` |
| **Two-step submission** | Prevents accidental confirmations — mirrors real-world "are you sure?" patterns |
| **Relative seed dates** | Demo assignments always have relevant due dates relative to when the server first runs |

---

## ⚠️ Scope & Limitations

This is a **demonstration MVP** of role-based academic workflows:

- **Not production auth** — Profiles are intentionally switchable; the `X-Demo-User` header is not a credential
- **Single-process store** — JSON persistence supports one server instance; not suitable for multi-instance/serverless
- **No file uploads** — Submission is a declaration, not a file upload. Drive links are professor-provided
- **No email notifications** — Status changes are visible in-app only
- **No grades** — Assignment tracking only; no grading or feedback system
- **No Google integration** — Drive URLs are validated but not verified via Google APIs

A production version would require authenticated sessions, a proper database (PostgreSQL/MongoDB), file upload service, and email notifications.

---

## 📄 License

This project was built as part of the **Joineazy Frontend Internship Task**.

---

<p align="center">
  Built with ❤️ by <strong>Hemant Jawale</strong>
</p>
