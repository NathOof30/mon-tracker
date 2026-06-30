import { getIronSession } from "iron-session";

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

// Pour les routes API
export function withApiSession(handler) {
  return async function (req, res) {
    req.session = await getIronSession(req, res, sessionOptions);
    return handler(req, res);
  };
}

// Pour les pages (getServerSideProps)
export function withSsrSession(handler) {
  return async function (context) {
    context.req.session = await getIronSession(context.req, context.res, sessionOptions);
    return handler(context);
  };
}
