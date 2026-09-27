import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { createApp } from '../backend/src/app.js';
import { createStore } from '../backend/src/services/store.js';

// Exercise production assets against isolated storage; the working demo stays unchanged.
const directory = await mkdtemp(join(tmpdir(), 'joineazy-browser-'));
const store = await createStore(join(directory, 'data.json'));
const server = createApp(store).listen(0);
await new Promise((resolve) => server.once('listening', resolve));
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`http://localhost:${server.address().port}`);
  await page.getByRole('heading', { name: 'My assignments' }).waitFor();
  assert.equal(await page.locator('.assignment-card').count(), 6);
  assert.equal(
    await page.getByRole('button', { name: 'Open navigation', exact: true }).isVisible(),
    false,
  );
  await mkdir('tmp', { recursive: true });
  await page.screenshot({ path: 'tmp/desktop.png', fullPage: true });
  await page.getByRole('tab', { name: 'Overdue' }).click();
  assert.equal(await page.locator('.assignment-card').count(), 1);
  await page.getByRole('tab', { name: 'All assignments' }).click();
  await page.getByRole('textbox', { name: 'Search assignments' }).fill('not a real assignment');
  await page.getByRole('heading', { name: 'Nothing here just yet' }).waitFor();
  await page.getByRole('button', { name: 'Clear search' }).click();

  const switchProfile = async (name) => {
    await page.getByRole('button', { name: 'Switch demo profile' }).click();
    await page.getByRole('menuitemradio', { name }).click();
  };
  await switchProfile('Ananya Deshmukh');
  await page.getByRole('button', { name: 'Create assignment', exact: true }).click();
  await page.getByRole('textbox', { name: 'Assignment title' }).fill('Browser test project');
  await page.getByRole('textbox', { name: 'Course', exact: false }).fill('Web Development');
  await page
    .getByRole('textbox', { name: 'The brief' })
    .fill('Create a thoughtful, responsive interface.');
  await page.getByLabel('Due date').fill('2026-12-31');
  await page
    .getByRole('textbox', { name: 'Google Drive link' })
    .fill('https://drive.google.com/drive/folders/demo');
  await page.getByRole('checkbox', { name: 'Arjun Mehta' }).uncheck();
  await page.getByRole('checkbox', { name: 'Rohan Patil' }).uncheck();
  await page.getByRole('dialog').getByRole('button', { name: 'Create assignment' }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Browser test project', exact: true }).waitFor();

  await switchProfile('Arjun Mehta');
  await page.getByRole('heading', { name: 'Hello, Arjun' }).waitFor();
  assert.equal(
    await page.getByRole('button', { name: 'Browser test project', exact: true }).count(),
    0,
  );
  await switchProfile('Maya Sharma');
  await page.getByRole('button', { name: 'Browser test project', exact: true }).click();
  assert.equal(
    await page.getByRole('link', { name: 'Open Drive' }).getAttribute('href'),
    'https://drive.google.com/drive/folders/demo',
  );
  await page.getByRole('button', { name: 'Yes, I have submitted' }).click();
  assert.equal(await page.getByRole('button', { name: 'Confirm submission' }).isDisabled(), true);
  await page.getByRole('button', { name: 'Go back' }).click();
  await page.getByRole('button', { name: 'Not yet' }).click();
  assert.equal(
    store.read().submissions.filter((item) => !/^a\d$/.test(item.assignmentId)).length,
    0,
  );
  await page.getByRole('button', { name: 'Browser test project', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, I have submitted' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Confirm submission' }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.reload();
  await page.getByRole('button', { name: 'Browser test project', exact: true }).click();
  await page.getByText('You’re all set!').waitFor();
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await switchProfile('Ananya Deshmukh');
  await page.getByRole('button', { name: 'Student progress', exact: true }).click();
  await page.getByRole('heading', { name: 'Every student. Every step.' }).waitFor();
  assert.equal(await page.getByRole('progressbar').count(), 3);
  await page.screenshot({ path: 'tmp/professor.png', fullPage: true });
  await page.getByRole('button', { name: 'Assignments', exact: true }).click();
  await page.getByRole('button', { name: 'Browser test project', exact: true }).click();
  await page.getByRole('button', { name: 'Edit assignment' }).click();
  await page
    .getByRole('textbox', { name: 'Assignment title' })
    .fill('Browser test project updated');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Browser test project updated', exact: true }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByRole('button', { name: 'Delete assignment', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  assert.equal(
    store.read().assignments.some((item) => item.title.startsWith('Browser test project')),
    false,
  );

  await switchProfile('Maya Sharma');
  await page.getByRole('heading', { name: 'Hello, Maya' }).waitFor();
  for (const width of [320, 375, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      true,
      `No horizontal overflow at ${width}px`,
    );
    await page.screenshot({ path: `tmp/mobile-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await page.getByRole('button', { name: 'My progress', exact: true }).click();
  await page.getByRole('heading', { name: 'A little better, every day' }).waitFor();
  assert.equal(await page.locator('.sidebar.is-open').count(), 0);
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    true,
  );
  assert.deepEqual(errors, []);
  console.log(
    'Browser checks passed: filters, role isolation, CRUD, double confirmation, persistence, desktop and mobile navigation.',
  );
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
  await rm(directory, { recursive: true, force: true });
}
