import { withApiSession, withSsrSession } from './session.js';

export function withAdminApi(handler) {
  return withApiSession(async (req, res) => {
    if (!req.session.user?.isAdmin) {
      return res.status(401).json({ error: 'Non autorisé' });
    }
    return handler(req, res);
  });
}

export function withAdminSsr(handler) {
  return withSsrSession(async (context) => {
    const session = context.req.session;
    if (!session.user?.isAdmin) {
      return {
        redirect: { destination: '/login', permanent: false },
      };
    }
    return handler(context);
  });
}
