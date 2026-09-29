# Backend

ES-module Express service. Task 2 routes live in `src/v2`, with JWT cookie authentication, scrypt password hashing, role/course checks, group leadership rules, validated assignment mutations, and persistent JSON storage.

Run `npm run dev -w backend` from the root for the API alone. The default port is 3001. `npm test` runs isolated API tests. `GET /health` is available for host health checks.

Environment variables and production storage requirements are documented in `../docs/DEPLOYMENT.md`. Task 1's `/api` endpoints and data remain separate from `/api/v2` for reference and regression coverage.
