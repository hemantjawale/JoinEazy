// Vercel keeps browser requests same-origin while the API runs on a persistent Node host.
export default async function handler(req, res) {
  const configured = process.env.BACKEND_URL;
  if (!configured)
    return res
      .status(503)
      .json({ message: 'Set BACKEND_URL in the Vercel project to connect your workspace.' });
  let backend;
  try {
    backend = new URL(configured);
    if (backend.protocol !== 'https:') throw new Error();
  } catch {
    return res.status(503).json({ message: 'BACKEND_URL must be a secure HTTPS origin.' });
  }
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (origin && origin !== `https://${host}` && origin !== `http://${host}`)
    return res.status(403).json({ message: 'This origin is not allowed.' });
  const requested = new URL(req.url, 'https://frontend.invalid');
  if (!requested.pathname.startsWith('/api/v2/'))
    return res.status(404).json({ message: 'API route not found.' });
  try {
    const upstream = await fetch(new URL(requested.pathname + requested.search, backend.origin), {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.cookie ? { Cookie: req.headers.cookie } : {}),
      },
      ...(!['GET', 'HEAD'].includes(req.method) && req.body
        ? { body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body) }
        : {}),
      redirect: 'manual',
      signal: AbortSignal.timeout(20000),
    });
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    const cookies = upstream.headers.getSetCookie();
    if (cookies.length) res.setHeader('Set-Cookie', cookies);
    res.status(upstream.status).send(await upstream.text());
  } catch {
    res
      .status(502)
      .json({
        message: 'The workspace server is waking up or unavailable. Please try again shortly.',
      });
  }
}
