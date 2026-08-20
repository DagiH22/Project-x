import { Response, CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = 'access_token';

function getCookieOptions(nodeEnv: string): CookieOptions {
  const isProd = nodeEnv === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: isProd ? 15 * 60 * 1000 : 24 * 60 * 60 * 1000, // 15 mins for prod, 1 day for dev
  };
}

export function setAuthCookie(res: Response, token: string, nodeEnv: string) {
  res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions(nodeEnv));
}

export function clearAuthCookie(res: Response, nodeEnv: string) {
  res.clearCookie(AUTH_COOKIE_NAME, getCookieOptions(nodeEnv));
}
