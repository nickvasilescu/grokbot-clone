import type { Context, MiddlewareHandler } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { db, now } from '../db.js';
import { env } from '../env.js';
import { token } from './ids.js';
import type { User } from '../types.js';

const COOKIE = 'teammates_session';
/** Session cookie name before the rename; still accepted so existing sign-ins survive the upgrade. */
const LEGACY_COOKIE = 'grokbot_session';
const TTL_MS = 30 * 24 * 3600 * 1000;

export type AuthVars = { Variables: { user: User } };

export function createSession(c: Context, userId: string) {
  const t = token();
  db.prepare('INSERT INTO auth_sessions(token,user_id,created_at,expires_at) VALUES (?,?,?,?)').run(t, userId, now(), now() + TTL_MS);
  setCookie(c, COOKIE, t, { httpOnly: true, secure: env.secureCookies, sameSite: 'Lax', path: '/', maxAge: TTL_MS / 1000 });
}

export function destroySession(c: Context) {
  for (const name of [COOKIE, LEGACY_COOKIE]) {
    const t = getCookie(c, name);
    if (t) db.prepare('DELETE FROM auth_sessions WHERE token=?').run(t);
    deleteCookie(c, name, { path: '/' });
  }
}

export function userFromToken(t: string | undefined): User | null {
  if (!t) return null;
  const r = db
    .prepare('SELECT u.* FROM auth_sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires_at>?')
    .get(t, now()) as any;
  return r ? { id: r.id, email: r.email, name: r.name, avatarUrl: r.avatar_url } : null;
}

export function userFromCookieHeader(cookieHeader: string | undefined): User | null {
  const parts = cookieHeader?.split(/;\s*/) ?? [];
  for (const name of [COOKIE, LEGACY_COOKIE]) {
    const m = parts.find((p) => p.startsWith(`${name}=`));
    if (m) return userFromToken(decodeURIComponent(m.slice(name.length + 1)));
  }
  return null;
}

export const requireUser: MiddlewareHandler<AuthVars> = async (c, next) => {
  const u = userFromToken(getCookie(c, COOKIE) ?? getCookie(c, LEGACY_COOKIE));
  if (!u) return c.json({ error: 'unauthenticated' }, 401);
  c.set('user', u);
  await next();
};
