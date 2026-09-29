import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/[...path].js';

const originalFetch = globalThis.fetch;
const originalBackend = process.env.BACKEND_URL;
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalBackend === undefined) delete process.env.BACKEND_URL;
  else process.env.BACKEND_URL = originalBackend;
});
function response() {
  return {
    headers: {},
    statusCode: 200,
    setHeader(key, value) {
      this.headers[key] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
  };
}
test('deployment proxy reports missing configuration and rejects foreign origins', async () => {
  delete process.env.BACKEND_URL;
  const missing = response();
  await handler({ headers: {}, url: '/api/v2/workspace', method: 'GET' }, missing);
  assert.equal(missing.statusCode, 503);
  process.env.BACKEND_URL = 'https://api.example.test';
  const denied = response();
  await handler(
    {
      headers: { host: 'app.example.test', origin: 'https://foreign.example.test' },
      url: '/api/v2/workspace',
      method: 'GET',
    },
    denied,
  );
  assert.equal(denied.statusCode, 403);
});
test('deployment proxy forwards JSON, HTTP-only session cookies, and status codes', async () => {
  process.env.BACKEND_URL = 'https://api.example.test';
  let captured;
  globalThis.fetch = async (url, options) => {
    captured = { url: String(url), options };
    return new Response('{"user":{"role":"student"}}', {
      status: 201,
      headers: {
        'content-type': 'application/json',
        'set-cookie': 'joineazy_session=jwt; Path=/api/v2; HttpOnly; Secure; SameSite=Lax',
      },
    });
  };
  const res = response();
  await handler(
    {
      method: 'POST',
      url: '/api/v2/auth/login',
      headers: {
        host: 'app.example.test',
        origin: 'https://app.example.test',
        cookie: 'joineazy_session=old',
      },
      body: { email: 'maya@example.test', password: 'test-value' },
    },
    res,
  );
  assert.equal(captured.url, 'https://api.example.test/api/v2/auth/login');
  assert.equal(captured.options.headers.Cookie, 'joineazy_session=old');
  assert.equal(JSON.parse(captured.options.body).email, 'maya@example.test');
  assert.equal(res.statusCode, 201);
  assert.match(res.headers['Set-Cookie'][0], /HttpOnly/);
  assert.equal(res.headers['Cache-Control'], 'no-store');
});
test('deployment proxy handles an unavailable backend and only allows v2 API routes', async () => {
  process.env.BACKEND_URL = 'https://api.example.test';
  globalThis.fetch = async () => {
    throw new Error('offline');
  };
  const offline = response();
  await handler(
    { method: 'GET', url: '/api/v2/workspace', headers: { host: 'app.example.test' } },
    offline,
  );
  assert.equal(offline.statusCode, 502);
  const invalid = response();
  await handler(
    { method: 'GET', url: '/api/legacy', headers: { host: 'app.example.test' } },
    invalid,
  );
  assert.equal(invalid.statusCode, 404);
});
