const crypto = require('crypto');
const cookie = require('cookie');

const COOKIE_NAME = 'portal_session';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** @returns {string} */
function portalSecret () {
  const s = process.env.PORTAL_SESSION_SECRET || process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  return '';
}

/** @returns {string} fallback for dev-only */
function requireSecret () {
  const s = portalSecret();
  if (s) return s;
  console.warn(
    'PORTAL_SESSION_SECRET is unset or too short. Using insecure dev fallback (set PORTAL_SESSION_SECRET in .env for production).'
  );
  return 'dev_fallback_change_me!';
}

/** @returns {string} */
function signPayload (uid) {
  const secret = requireSecret();
  const exp = Date.now() + TTL_MS;
  const payload = Buffer.from(
    JSON.stringify({ uid: String(uid), exp }),
    'utf8'
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

/** @returns {{ uid: string, exp: number } | null} */
function verifyToken (token) {
  const secret = requireSecret();
  if (!secret || typeof token !== 'string' || !token.includes('.')) return null;

  const dot = token.indexOf('.');
  const payloadEnc = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = crypto.createHmac('sha256', secret).update(payloadEnc).digest('base64url');
  try {
    if (sig.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch (_) {
    return null;
  }

  let obj;
  try {
    obj = JSON.parse(Buffer.from(payloadEnc, 'base64url').toString('utf8'));
  } catch (_) {
    return null;
  }
  if (!obj.uid || typeof obj.exp !== 'number') return null;
  if (obj.exp < Date.now()) return null;
  return obj;
}

function parseCookieValue (cookieHeader, name = COOKIE_NAME) {
  if (!cookieHeader) return null;
  const parsed = cookie.parse(cookieHeader);
  return parsed[name] || null;
}

function setSessionCookie (res, tokenValue) {
  const maxAge = Math.floor(TTL_MS / 1000);
  res.append(
    'Set-Cookie',
    cookie.serialize(COOKIE_NAME, tokenValue, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge,
      secure: process.env.NODE_ENV === 'production'
    })
  );
}

function clearSessionCookie (res) {
  res.append(
    'Set-Cookie',
    cookie.serialize(COOKIE_NAME, '', {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 0,
      secure: process.env.NODE_ENV === 'production'
    })
  );
}

module.exports = {
  COOKIE_NAME,
  signPayload,
  verifyToken,
  parseCookieValue,
  setSessionCookie,
  clearSessionCookie,
  portalSecret,
  TTL_MS
};
