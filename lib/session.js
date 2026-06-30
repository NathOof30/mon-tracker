import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";

export const sessionOptions = {
  password: process.env.ADMIN_PASSWORD, // Défini dans .env
  cookieName: "admin-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production", // HTTPS uniquement en prod
    httpOnly: true, // Inaccessible via JavaScript (protection XSS)
    sameSite: "lax",
    maxAge: 86400, // 24h
  },
};

export function withApiSession(handler) {
  return withIronSessionApiRoute(handler, sessionOptions);
}

export function withSsrSession(handler) {
  return withIronSessionSsr(handler, sessionOptions);
}
