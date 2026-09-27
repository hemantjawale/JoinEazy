export async function request(path, { userId, method = 'GET', body, signal } = {}) {
  const response = await fetch(`/api${path}`, {
    method,
    signal,
    headers: { 'Content-Type': 'application/json', ...(userId ? { 'X-Demo-User': userId } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Unable to connect. Please try again.');
  }
  return response.status === 204 ? null : response.json();
}
