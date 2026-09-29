# Deploy on Vercel + a Node host

Vercel serves `frontend/dist` and the root `api/[...path].js` function. The function forwards `/api/v2/*` to the HTTPS Node service, relaying the HTTP-only session cookie through the frontend origin. The backend owns persistent data.

These files prepare deployment; they do not create a live deployment.

## Node service

Push the completed branch and deploy it on a Node host with a persistent disk (for example, Render with a disk). Select any required paid plan yourself in the hosting account.

| Setting        | Value               |
| -------------- | ------------------- |
| Root directory | Repository root     |
| Node           | 22.12+              |
| Build          | `npm ci --omit=dev` |
| Start          | `npm start`         |
| Health check   | `/health`           |
| Instances      | **1**               |
| Disk mount     | `/var/data`         |

Set host environment variables:

```dotenv
NODE_ENV=production
JWT_SECRET=<long random secret>
COOKIE_SECURE=true
DEMO_ENABLED=true
DATA_FILE=/var/data/legacy.json
ROUND2_DATA_FILE=/var/data/round2.json
```

Generate a random secret locally, paste it into the host's secret field, and retain it across redeploys. Do not commit it. The host normally supplies `PORT`; otherwise use 3001. Both data files must be on the persistent disk. The first start seeds them.

Confirm `https://YOUR-BACKEND/health` returns an `ok` status before connecting Vercel.

## Vercel frontend

1. Import the same repository and completed branch.
2. Keep the project root at the **repository root**, not `frontend`; the proxy function is outside the frontend folder.
3. Use Node 22 or newer. The committed `vercel.json` defines installation, build, output directory, and SPA rewrites.
4. Set server-side `BACKEND_URL=https://YOUR-BACKEND` in the Vercel environment. Do not prefix it with `VITE_`.
5. Deploy. Add `APP_ORIGIN=https://YOUR-FRONTEND.vercel.app` to the backend environment and restart that service. Update this for a custom domain.

The browser always uses relative `/api/v2` URLs. Vercel environment changes require a new deployment to take effect.

## Live verification

- Open the landing page and refresh `/login` directly.
- Sign in, reload, and confirm session persistence.
- Acknowledge individual work and verify its timestamp after reload.
- Acknowledge group work as Maya, then verify the shared result as Arjun.
- Create, edit, and delete an assignment as Ananya.
- Register a new student and join WEB204.
- Restart the Node service and verify the created account and acknowledgments survive.
- Check mobile navigation and use the actual live URL in the submission.

## Troubleshooting

| Symptom            | Check                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API 503            | Set an HTTPS `BACKEND_URL` in Vercel and redeploy.                                                                                                          |
| API 502            | Check Node logs and `/health`; the host may be waking up.                                                                                                   |
| Session disappears | Use HTTPS, `COOKIE_SECURE=true`, and the same-origin proxy. Check `Set-Cookie` in the browser.                                                              |
| Data resets        | Both data files must live on the persistent disk.                                                                                                           |
| Deep-link 404      | Keep the repository root and committed Vercel configuration.                                                                                                |
| Auth 429           | Wait a minute. The MVP limiter uses backend IPs; proxy traffic may share one. Larger deployments need trusted proxy configuration and distributed limiting. |

Demo identities are intentionally public and writable. For production use, remove seeded demo identities as well as disabling the demo endpoint. A single-process JSON store is an MVP tradeoff; use a transactional database before scaling to multiple instances.

Official references: [Vercel Node functions](https://vercel.com/docs/functions/runtimes/node-js), [Vercel rewrites](https://vercel.com/docs/rewrites), [Render disks](https://render.com/docs/disks), [Render environment variables](https://render.com/docs/configure-environment-variables).
