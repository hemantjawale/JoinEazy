import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { createApp } from '../backend/src/app.js';
import { createStore } from '../backend/src/services/store.js';
import { seedWorkspace } from '../backend/src/v2/seed.js';

const directory = await mkdtemp(join(tmpdir(), 'joineazy-round2-browser-'));
const legacy = await createStore(join(directory, 'legacy.json'));
const store = await createStore(join(directory, 'round2.json'), seedWorkspace);
const server = createApp(legacy, { store, secret: 'isolated-browser-test-secret' }).listen(0);
await new Promise((resolve) => server.once('listening', resolve));
const base = `http://localhost:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await mkdir('docs/screenshots', { recursive: true });
  await mkdir('tmp', { recursive: true });
  const screenshot = async (name) => {
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `docs/screenshots/${name}.png`, animations: 'disabled' });
  };
  const checkA11y = async (name) => {
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const violations = result.violations.map((item) => ({
      id: item.id,
      impact: item.impact,
      nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
    }));
    if (violations.length)
      console.log(`${name} accessibility findings:`, JSON.stringify(violations, null, 2));
    return violations;
  };
  const switchDemo = async (name) => {
    await page.getByRole('button', { name: 'Account menu' }).click();
    await page.getByRole('button', { name }).click();
  };
  const logout = async () => {
    await page.getByRole('button', { name: 'Account menu' }).click();
    await page.getByRole('button', { name: 'Log out', exact: true }).click();
    await page.getByRole('heading', { name: 'Good to see you.' }).waitFor();
  };

  await page.goto(base);
  await page.getByRole('heading', { name: 'Less chaos. More learning.' }).waitFor();
  await screenshot('landing');
  const accessibility = [];
  accessibility.push(...(await checkA11y('Landing')));
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `Landing: no horizontal overflow at ${width}px`,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await screenshot('landing-mobile');
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.getByRole('link', { name: 'Log in', exact: true }).click();
  await page.getByRole('heading', { name: 'Good to see you.' }).waitFor();
  await screenshot('login');
  accessibility.push(...(await checkA11y('Login')));
  await page.getByLabel('Email address').fill('maya@demo.joineazy.app');
  await page.getByLabel('Password', { exact: true }).fill('wrongpassword');
  await page.getByRole('button', { name: 'Step into my workspace' }).click();
  await page.getByRole('alert').waitFor();
  await page.getByLabel('Password', { exact: true }).fill('LearnTogether26!');
  await page.getByRole('button', { name: 'Step into my workspace' }).click();
  await page.getByRole('heading', { name: 'Hello, Maya' }).waitFor();
  assert.equal(new URL(page.url()).pathname, '/app/student');
  await screenshot('student-dashboard');
  accessibility.push(...(await checkA11y('Dashboard')));
  await page.reload();
  await page.getByRole('heading', { name: 'Hello, Maya' }).waitFor();
  await page.getByRole('link', { name: 'CS 204', exact: false }).click();
  await page.getByRole('heading', { name: 'Web Development', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Build a responsive portfolio', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, I have submitted' }).click();
  assert.ok(await page.getByRole('button', { name: 'Confirm acknowledgment' }).isDisabled());
  await page.getByRole('button', { name: 'Go back', exact: true }).click();
  await page.getByRole('button', { name: 'Not just yet' }).click();
  assert.equal(
    store
      .read()
      .acknowledgments.some((ack) => ack.assignmentId === 'web-1' && ack.studentId === 'maya'),
    false,
  );
  await page.getByRole('button', { name: 'Build a responsive portfolio', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, I have submitted' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Confirm acknowledgment' }).click();
  await page.getByText('That’s another step forward.').waitFor();
  await page.getByRole('button', { name: 'All done' }).click();

  await switchDemo('Arjun Mehta');
  await page.getByRole('heading', { name: 'Hello, Arjun' }).waitFor();
  await page.goto(`${base}/app/courses/web`);
  await page.getByRole('button', { name: 'The campus companion', exact: true }).click();
  await page.getByText('Your group leader takes it from here.').waitFor();
  assert.equal(await page.getByRole('button', { name: 'Yes, I have submitted' }).count(), 0);
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await switchDemo('Maya Sharma');
  await page.getByRole('heading', { name: 'Hello, Maya' }).waitFor();
  await page.goto(`${base}/app/courses/web`);
  await page.getByRole('button', { name: 'The campus companion', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, I have submitted' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Confirm acknowledgment' }).click();
  await page.getByText('One team. One shared checkmark.').waitFor();
  await page.getByRole('button', { name: 'All done' }).click();
  await switchDemo('Arjun Mehta');
  await page.getByRole('heading', { name: 'Hello, Arjun' }).waitFor();
  await page.goto(`${base}/app/courses/web`);
  await page.getByRole('button', { name: 'The campus companion', exact: true }).click();
  await page.getByText('One team. One shared checkmark.').waitFor();
  assert.ok(await page.getByText(/by Maya Sharma/).isVisible());
  await page.getByRole('button', { name: 'All done' }).click();

  await page.goto(`${base}/app/courses/design`);
  await page.getByRole('button', { name: 'Everyday experiences, reimagined', exact: true }).click();
  await page
    .getByText('You are not part of any group. Form or join one to submit this assignment.')
    .waitFor();
  await page.getByRole('link', { name: 'Find your group' }).click();
  await page.getByRole('button', { name: 'Create a group', exact: true }).click();
  await page.getByLabel('Group name').fill('The Curious Collective');
  await page.getByRole('button', { name: 'Create group', exact: true }).click();
  await page.getByRole('heading', { name: 'The Curious Collective', exact: true }).waitFor();
  const inviteCode = store
    .read()
    .groups.find((group) => group.name === 'The Curious Collective').joinCode;
  await switchDemo('Maya Sharma');
  await page.getByRole('heading', { name: 'Hello, Maya' }).waitFor();
  await page.goto(`${base}/app/groups?course=design`);
  await page.getByRole('button', { name: 'Join a group', exact: true }).click();
  await page.getByLabel('Group invite code').fill(inviteCode);
  await page.getByRole('button', { name: 'Join group', exact: true }).click();
  await page.getByRole('heading', { name: 'The Curious Collective', exact: true }).waitFor();
  await screenshot('groups');
  accessibility.push(...(await checkA11y('Groups')));

  await switchDemo('Ananya Deshmukh');
  await page.getByRole('heading', { name: 'Hello, Ananya' }).waitFor();
  assert.equal(new URL(page.url()).pathname, '/app/professor');
  await page.goto(`${base}/app/courses/web`);
  await page.getByRole('button', { name: 'Create assignment', exact: true }).click();
  await page.getByLabel('Assignment title').fill('A thoughtful browser test');
  await page.getByLabel('The brief').fill('A real end-to-end check of the professor workflow.');
  await page.getByLabel('Deadline · date & time').fill('2026-10-30T23:59');
  await page.getByLabel('OneDrive submission link').fill('https://1drv.ms/f/example');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Create assignment', exact: true })
    .click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'A thoughtful browser test', exact: true }).click();
  assert.equal(
    await page.getByRole('link', { name: 'Open OneDrive' }).getAttribute('href'),
    'https://1drv.ms/f/example',
  );
  await page.getByRole('button', { name: 'Edit assignment' }).click();
  await page.getByLabel('Assignment title').fill('A refined browser test');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'A refined browser test', exact: true }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByRole('button', { name: 'Delete assignment', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await screenshot('professor-assignments');
  await page.goto(`${base}/app/progress`);
  await page.getByRole('heading', { name: 'Every student. Every step.' }).waitFor();
  assert.ok(
    await page
      .getByRole('progressbar', { name: 'Maya Sharma Web Development progress' })
      .isVisible(),
  );
  await screenshot('class-progress');

  await logout();
  await page.getByRole('link', { name: 'Create an account' }).click();
  await page.getByLabel('Full name').fill('Neha Joshi');
  await page.getByLabel('Email address').fill('neha@browser.test');
  await page.getByLabel('Password', { exact: true }).fill('ThoughtfulWork26!');
  await page.getByRole('button', { name: 'Create my account' }).click();
  await page.getByRole('heading', { name: 'Hello, Neha' }).waitFor();
  await page.getByRole('button', { name: 'Join a course', exact: true }).click();
  await page.getByLabel('Course invite code').fill('WEB204');
  await page.getByRole('button', { name: 'Join course', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  assert.equal(await page.locator('.course-card-v2').count(), 1);
  await page.goto(`${base}/app/professor`);
  await page.waitForURL('**/app/student');

  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of [
      '/app/student',
      '/app/courses',
      '/app/courses/web',
      '/app/groups',
      '/app/progress',
    ]) {
      await page.goto(`${base}${path}`);
      await page.locator('.workspace-content h1').waitFor();
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${path}: no horizontal overflow at ${width}px`,
      );
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await page.getByRole('link', { name: 'My courses', exact: true }).click();
  await page.getByRole('heading', { name: 'Your space to explore.' }).waitFor();
  assert.equal(await page.locator('.sidebar-v2.open').count(), 0);
  await logout();
  await page.getByRole('button', { name: 'Student demo', exact: true }).click();
  await page.getByRole('heading', { name: 'Hello, Maya' }).waitFor();
  await screenshot('student-mobile');
  assert.deepEqual(errors, []);
  assert.equal(accessibility.length, 0, 'No WCAG A/AA violations in tested screens');
  console.log(
    'Round 2 browser checks passed: landing, login, registration, session persistence, role redirects, course enrollment, individual/group acknowledgment, group create/join, professor CRUD, progress, mobile navigation, and accessibility.',
  );
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
  await rm(directory, { recursive: true, force: true });
}
