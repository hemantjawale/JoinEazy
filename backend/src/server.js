import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { createStore } from './services/store.js';

const file =
  process.env.DATA_FILE || fileURLToPath(new URL('../storage/workspace.json', import.meta.url));
const store = await createStore(file);
const port = Number(process.env.PORT) || 3001;
createApp(store).listen(port, () =>
  console.log(`Joineazy API running at http://localhost:${port}`),
);
