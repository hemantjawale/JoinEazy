import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { createStore } from './services/store.js';
import { seedWorkspace } from './v2/seed.js';
import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const file =
  process.env.DATA_FILE || fileURLToPath(new URL('../storage/workspace.json', import.meta.url));
const store = await createStore(file);
const round2Store = await createStore(
  process.env.ROUND2_DATA_FILE || fileURLToPath(new URL('../storage/round2.json', import.meta.url)),
  seedWorkspace,
);
const keyFile = fileURLToPath(new URL('../storage/session.key', import.meta.url));
let secret = process.env.JWT_SECRET;
if (!secret) {
  try {
    secret = await readFile(keyFile, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    secret = randomBytes(48).toString('hex');
    await mkdir(fileURLToPath(new URL('../storage/', import.meta.url)), { recursive: true });
    await writeFile(keyFile, secret, { mode: 0o600 });
  }
}
const port = Number(process.env.PORT) || 3001;
createApp(store, { store: round2Store, secret }).listen(port, () =>
  console.log(`Joineazy API running at http://localhost:${port}`),
);
