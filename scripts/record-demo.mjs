import { chromium } from 'playwright';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createApp } from '../backend/src/app.js';
import { createStore } from '../backend/src/services/store.js';
import { seedWorkspace } from '../backend/src/v2/seed.js';

const temp = await mkdtemp(join(tmpdir(), 'joineazy-recording-'));
const legacy = await createStore(join(temp, 'legacy.json'));
const store = await createStore(join(temp, 'round2.json'), seedWorkspace);
const server = createApp(legacy, { store, secret: 'isolated-recording-session-secret' }).listen(0);
await new Promise((resolve) => server.once('listening', resolve));
const base = `http://localhost:${server.address().port}`;
await mkdir('output/demo', { recursive: true });
await mkdir('tmp/recordings', { recursive: true });
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    recordVideo: { dir: 'tmp/recordings', size: { width: 1440, height: 1000 } },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const pause = (ms = 1600) => page.waitForTimeout(ms);
  const caption = async (text) => {
    await page.evaluate((text) => {
      document.querySelector('#walkthrough-caption')?.remove();
      const element = document.createElement('div');
      element.id = 'walkthrough-caption';
      element.textContent = text;
      Object.assign(element.style, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        padding: '13px 23px',
        borderRadius: '12px',
        background: '#352b43',
        color: '#fff',
        fontFamily: 'sans-serif',
        fontSize: '14px',
        boxShadow: '0 6px 25px #30204033',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      });
      document.body.append(element);
    }, text);
  };
  const switchDemo = async (name) => {
    await page.getByRole('button', { name: 'Account menu' }).click();
    await pause(700);
    await page.getByRole('button', { name }).click();
  };
  await page.goto(base);
  await page.getByRole('heading', { name: 'Less chaos. More learning.' }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await caption('01  /  A calmer home for courses, assignments, and collaboration');
  await pause(3500);
  await page.evaluate(() => window.scrollTo({ top: 810, behavior: 'smooth' }));
  await pause(2500);
  await page.goto(`${base}/login`);
  await page.getByRole('heading', { name: 'Good to see you.' }).waitFor();
  await caption('02  /  Real JWT sign-in, role-based redirects, and easy demo access');
  await pause(2200);
  await page.getByRole('button', { name: 'Student demo', exact: true }).click();
  await page.getByRole('heading', { name: 'Hello, Maya' }).waitFor();
  await caption('03  /  Maya’s courses, progress, next steps, and groups');
  await pause(3000);
  await page.getByRole('link', { name: 'CS 204', exact: false }).click();
  await page.getByRole('heading', { name: 'Web Development', exact: true }).waitFor();
  await caption('04  /  Clear briefs, exact deadlines, and individual or group work');
  await pause(2000);
  await page.getByRole('button', { name: 'The campus companion', exact: true }).click();
  await pause(2000);
  await page.getByRole('button', { name: 'Yes, I have submitted' }).click();
  await pause(1800);
  await page.getByRole('checkbox').check();
  await pause(800);
  await page.getByRole('button', { name: 'Confirm acknowledgment' }).click();
  await page.getByText('One team. One shared checkmark.').waitFor();
  await pause(2200);
  await page.getByRole('button', { name: 'All done' }).click();
  await switchDemo('Arjun Mehta');
  await page.getByRole('heading', { name: 'Hello, Arjun' }).waitFor();
  await page.goto(`${base}/app/courses/web`);
  await caption('05  /  The leader confirms once. Every group member sees the same timestamp.');
  await page.getByRole('button', { name: 'The campus companion', exact: true }).click();
  await page.getByText('One team. One shared checkmark.').waitFor();
  await pause(3000);
  await page.getByRole('button', { name: 'All done' }).click();
  await page.goto(`${base}/app/groups`);
  await page.getByRole('heading', { name: 'Pixel Pioneers', exact: true }).waitFor();
  await caption('06  /  Course-specific groups, clear leadership, and shareable invite codes');
  await pause(3000);
  await switchDemo('Ananya Deshmukh');
  await page.getByRole('heading', { name: 'Hello, Ananya' }).waitFor();
  await caption('07  /  A professor sees only the courses they teach');
  await pause(2500);
  await page.goto(`${base}/app/courses/web`);
  await page.getByRole('button', { name: 'Create assignment', exact: true }).click();
  await pause(1800);
  await page.getByLabel('Assignment title').fill('Build a thoughtful campus experience');
  await page
    .getByLabel('The brief')
    .fill(
      'Work as a team to create a responsive campus guide. Include a short demo and describe each member’s contribution.',
    );
  await page.getByLabel('Deadline · date & time').fill('2026-10-20T23:59');
  await page.getByRole('dialog').getByLabel('Submission format').selectOption('group');
  await pause(2500);
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Create assignment', exact: true })
    .click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await pause(1800);
  await page.goto(`${base}/app/progress`);
  await page.getByRole('heading', { name: 'Every student. Every step.' }).waitFor();
  await caption('08  /  Course analytics and individual student progress, at a glance');
  await pause(3200);
  await page.goto(base);
  await page.getByRole('heading', { name: 'Less chaos. More learning.' }).waitFor();
  await caption('Joineazy · React + Vite + Tailwind · Made for learning, together');
  await pause(3000);
  const video = page.video();
  await context.close();
  await video.saveAs('output/demo/joineazy-round2.webm');
  console.log('Walkthrough saved: output/demo/joineazy-round2.webm');
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
  await rm(temp, { recursive: true, force: true });
}
