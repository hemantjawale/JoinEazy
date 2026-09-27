# Joineazy — Assignment & Review Dashboard

A responsive assignment workspace for students and professors. Built with React, Vite, Tailwind CSS, and an ES-module Express API. The interface uses warm neutrals, soft purple accents, clear status indicators, and an original SVG illustration.

## Start locally

Requires **Node.js 22.12+** and npm. Run commands from the repository root:

```sh
npm install
npm run dev
```

Open **http://localhost:5173**. Vite forwards `/api` requests to the backend on port 3001. Both servers start with one command.

```sh
npm run check  # ESLint, API integration tests, production build
npm run test:e2e # Build and run isolated browser workflow tests
npm run build # Build the React application
npm start     # Serve the API and built frontend at http://localhost:3001
```

Use `npm start` after building for a complete production-style demo. `vite preview` serves only the frontend and is not the full-stack demo.

Browser tests require Chromium (`npx playwright install chromium`). Alternatively, set `PLAYWRIGHT_CHANNEL=msedge` in your shell to use an installed Microsoft Edge. Browser tests start their own server with temporary data, test the complete workflow, and save screenshots to the gitignored `tmp/` directory. `npm run format` formats the source with Prettier.

### Docker demo

```sh
docker compose up --build
```

Open **http://localhost:3001**. A named volume persists demo data across container restarts. Docker must be installed and running.

## Try the MVP

Use the profile selector in the top-right corner:

- **Maya Sharma, Arjun Mehta, Rohan Patil:** student profiles with different assignments and progress.
- **Ananya Deshmukh, Vikram Rao:** professors who see and manage only assignments they created.

### Student flow

1. Browse assignments, search by title/course, filter by status or course, and sort by due date, title, or creation date.
2. Open an assignment to read the brief and follow its Drive link when available.
3. Upload work externally, then choose **Yes, I have submitted**.
4. Verify that the final work is accessible and choose **Confirm submission**. Cancelling either step leaves the status unchanged.
5. Review updated dashboard totals and course progress.

Sample assignments intentionally have no fabricated Drive links. A professor can attach a real Google Drive/Docs URL. Confirmation records a student's declaration, not file upload or verification by Google Drive. Late confirmation is allowed and the due date remains visible. Confirmation is final in this MVP.

### Professor flow

Create assignments with a title, course, description, type, due date, optional Drive/Docs link, and selected students. Edit or delete only your own assignments. See submitted/not submitted status in assignment details, a submission bar on each assignment card, and individual student progress bars in **Student progress**. Removing a student from an assignment also removes that student's related confirmation; deletion removes all related confirmations.

## Architecture

```text
frontend/
  public/                  # App icon
  src/
    components/            # Shared layout, modal, hero, progress, empty state
    context/               # Workspace loading, profile state, mutations, toast
    features/
      assignments/         # Cards, filtering, CRUD form, two-step confirmation
      progress/            # Course and individual student progress
    services/              # HTTP client
    utils/                 # Date, status, and progress calculations
    App.jsx                # App composition and view/dialog state
    styles.css             # Tailwind entry and responsive component styling
backend/
  src/
    data/                  # Demo identities and relative-date seed data
    routes/                # Scoped REST endpoints and role enforcement
    services/              # Validation and serialized JSON persistence
    app.js                 # Express setup, errors, static production frontend
    server.js              # Server entry point
  tests/                   # Node test runner API integration tests
  storage/                 # Generated data; gitignored
Dockerfile
compose.yaml
```

React Context supplies the current workspace, with `useState`, `useEffect`, and `useMemo` for interactions and derived views. Features are isolated from the HTTP transport; shared components handle reusable UI. Tailwind v4 is integrated through Vite, with utility classes and a component stylesheet for the visual system and responsive states. Native modal dialogs provide focus containment and Escape handling. Form labels, status text, progress semantics, reduced-motion support, and keyboard focus styles support accessibility.

The Express API resolves the selected demo user and scopes queries and mutations. Browser storage only remembers the selected profile. Assignments and confirmations persist in `backend/storage/workspace.json`. Writes are serialized and atomically replaced within a single server process. Seed dates are relative to the first launch; deleting that generated file while the server is stopped resets the demo.

### API

Requests use `X-Demo-User: <profile-id>` except for the public demo profile listing.

| Method | Endpoint                       | Purpose                                                          |
| ------ | ------------------------------ | ---------------------------------------------------------------- |
| GET    | `/api/demo-users`              | List selectable demo identities                                  |
| GET    | `/api/workspace`               | Current role-scoped assignments, submissions, and student roster |
| POST   | `/api/assignments`             | Professor creates an assignment                                  |
| PATCH  | `/api/assignments/:id`         | Owner updates an assignment                                      |
| DELETE | `/api/assignments/:id`         | Owner deletes an assignment and its submissions                  |
| POST   | `/api/assignments/:id/confirm` | Assigned student confirms with `confirmed: true, verified: true` |

Server configuration: `PORT` (default `3001`), `DATA_FILE` (optional persistence path). The Vite dev proxy expects port 3001.

## Scope and limitations

This is a demonstration of role-based workflows, **not production authentication**. Profiles are intentionally switchable; the identity header is not a credential. A real deployment needs authenticated sessions and a database. The JSON store supports one server process and requires persistent storage; it is not suitable for multi-instance/serverless deployment. There are no grades, actual file uploads, email notifications, or Google account integrations.

The original brief allows mock/localStorage data. This implementation adds a small backend to keep frontend and backend separate and enforce scoped operations in one place. The repository ignores the original assignment PDF. Assignment due dates use the viewer's local calendar day; overdue means after that day's end.

## Validation and delivery

`npm run check` checks frontend code, exercises role scoping, CRUD, validation, double confirmation, idempotency, cleanup, and disk persistence, then builds production assets. API tests use temporary storage and never modify the demo dataset.

The local application and Docker configuration are provided. Publishing a GitHub repository, hosting the demo publicly, recording a walkthrough, preparing the final submission PDF, and submitting the application form remain manual delivery steps. No external form is submitted by this project.

Verified locally: ESLint, six API integration tests, production build, and browser flows using Microsoft Edge. Docker configuration is included but was not run because Docker is not installed in the development environment.
