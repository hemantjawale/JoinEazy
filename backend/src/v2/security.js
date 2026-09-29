import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';

export const SESSION_COOKIE = 'joineazy_session';
export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  return timingSafeEqual(Buffer.from(hash, 'hex'), scryptSync(password, salt, 64));
}
export const publicUser = ({ passwordHash: _password, ...user }) => user;
export function sessionToken(user, secret) {
  return jwt.sign({ sub: user.id, role: user.role }, secret, {
    expiresIn: '8h',
    issuer: 'joineazy',
    audience: 'joineazy-web',
  });
}
export function verifyToken(token, secret) {
  return jwt.verify(token, secret, {
    algorithms: ['HS256'],
    issuer: 'joineazy',
    audience: 'joineazy-web',
  });
}
export function readCookie(req) {
  return req.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
}
export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.COOKIE_SECURE === 'true',
  path: '/api/v2',
};
