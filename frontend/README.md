# Frontend

Task 2 is the active React + Vite + Tailwind app in `src/round2`. `src/main.jsx` mounts it. Pages, feature forms, shared components, session context, and API helpers are separated by responsibility.

Run `npm run dev` from the repository root for the frontend and backend together. The browser calls relative `/api/v2` URLs; development uses Vite's proxy, deployment uses the root Vercel function. Do not point the browser directly at a separate backend origin.

See the root README for demo accounts, checks, screenshots, and deployment. Earlier Task 1 components remain as reference but are not part of the active application.
