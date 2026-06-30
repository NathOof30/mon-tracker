import { withApiSession } from '../../../lib/session.js';
import rateLimit from 'express-rate-limit';

// Rate Limiting en mémoire (pour la démo, en production utilisez Redis)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  keyGenerator: (req) => req.ip,
});

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Application du rate limit
  await new Promise((resolve, reject) => {
    limiter(req, res, (result) => (result instanceof Error ? reject(result) : resolve(result)));
  });

  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    req.session.user = { isAdmin: true, loginAt: Date.now() };
    await req.session.save();
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Mot de passe incorrect' });
}

export default withApiSession(handler);
