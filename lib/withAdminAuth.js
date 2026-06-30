import { withApiSession, withSsrSession } from './session.js';

// Protège les routes API — vérifie que l'utilisateur est connecté
export function withAdminApi(handler) {
  return withApiSession(async (req, res) => {
    if (!req.session.user?.id) {
      return res.status(401).json({ error: 'Non autorisé' });
    }
    return handler(req, res);
  });
}

// Protège les pages SSR — redirige vers /login si non connecté
export function withAdminSsr(handler) {
  return withSsrSession(async (context) => {
    const session = context.req.session;
    if (!session.user?.id) {
      return {
        redirect: { destination: '/login', permanent: false },
      };
    }
    return handler(context);
  });
}

// Protège les routes API — vérifie que l'utilisateur est super-admin
export function withSuperAdminApi(handler) {
  return withApiSession(async (req, res) => {
    if (!req.session.user?.id || req.session.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Accès interdit' });
    }
    return handler(req, res);
  });
}

// Protège les pages SSR — redirige si non super-admin
export function withSuperAdminSsr(handler) {
  return withSsrSession(async (context) => {
    const session = context.req.session;
    if (!session.user?.id || session.user.role !== 'superadmin') {
      return {
        redirect: { destination: '/login', permanent: false },
      };
    }
    return handler(context);
  });
}
