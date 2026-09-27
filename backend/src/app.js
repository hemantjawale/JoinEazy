import express from 'express';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { createApi } from './routes/api.js';

export function createApp(store) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));
  app.use('/api', createApi(store));
  app.use('/api', (_req, res) => res.status(404).json({ message: 'API route not found.' }));
  const frontend = fileURLToPath(new URL('../../frontend/dist/', import.meta.url));
  if (existsSync(frontend)) {
    app.use(express.static(frontend));
    app.get('/{*path}', (_req, res) => res.sendFile(`${frontend}/index.html`));
  }
  app.use((error, _req, res, _next) => {
    const status = error.status || 500;
    if (status >= 500) console.error(error);
    res
      .status(status)
      .json({ message: status >= 500 ? 'Something went wrong. Please try again.' : error.message });
  });
  return app;
}
