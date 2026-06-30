import { withApiSession } from '../../../lib/session.js';
import bcrypt from 'bcryptjs';

// Rate limiting simple basé sur un Map en mémoire
// Note : sur Vercel serverless, chaque instance a son propre compteur.
// Pour un rate limiting robuste en production, utiliser Vercel KV (Redis).
const loginAttempts = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return false;
  }
  entry.count++;
  return entry.count > MAX_ATTEMPTS;
}

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' });
  }

  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Mot de passe requis' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  let isValid = false;

  // Si ADMIN_PASSWORD commence par '$2', c'est un hash bcrypt
  if (adminPassword.startsWith('$2')) {
    isValid = await bcrypt.compare(password, adminPassword);
  } else {
    // Fallback : comparaison directe (rétrocompatibilité)
    // Utilisation de timingSafeEqual pour éviter les attaques par timing
    const crypto = await import('crypto');
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(password),
        Buffer.from(adminPassword)
      );
    } catch {
      isValid = false; // Longueurs différentes
    }
  }

  if (isValid) {
    req.session.user = { isAdmin: true, loginAt: Date.now() };
    await req.session.save();
    return res.json({ success: true });
  }

  res.status(401).json({ error: 'Mot de passe incorrect' });
}

export default withApiSession(handler);
