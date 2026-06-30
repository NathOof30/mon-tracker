import { withApiSession } from '../../../lib/session.js';
import { UserService } from '../../../lib/userService.js';

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;

  // Validation
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  // Validation email basique
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Format d\'email invalide' });
  }

  // Validation mot de passe (min 8 chars, 1 majuscule, 1 chiffre)
  if (password.length < 8) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
  }
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins une majuscule' });
  }
  if (!/[0-9]/.test(password)) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins un chiffre' });
  }

  try {
    const id = await UserService.register(email, password);

    // Connexion automatique après inscription
    req.session.user = {
      id,
      email: email.toLowerCase().trim(),
      role: 'user',
      pixelLimit: 10,
    };
    await req.session.save();
    return res.status(201).json({ success: true });
  } catch (error) {
    if (error.message === 'EMAIL_EXISTS') {
      return res.status(409).json({ error: 'Un compte existe déjà avec cet email' });
    }
    console.error('Erreur inscription :', error);
    return res.status(500).json({ error: 'Erreur interne' });
  }
}

export default withApiSession(handler);
