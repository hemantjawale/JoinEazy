import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createSeed } from '../data/seed.js';

export async function createStore(filePath) {
  let data;
  try {
    data = JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    data = createSeed();
  }
  let queue = Promise.resolve();
  const persist = async (next) => {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(`${filePath}.tmp`, JSON.stringify(next, null, 2));
    await rename(`${filePath}.tmp`, filePath);
  };
  await persist(data);
  return {
    read: () => structuredClone(data),
    mutate: (operation) => {
      const task = queue.then(async () => {
        const next = structuredClone(data);
        const result = operation(next);
        await persist(next);
        data = next;
        return result;
      });
      queue = task.catch(() => {});
      return task;
    },
  };
}
