import { withSuperAdminApi } from '../../../lib/withAdminAuth.js';
import { UserService } from '../../../lib/userService.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    const users = await UserService.getAllUsers();
    return res.json(users);
  }

  if (req.method === 'DELETE') {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId manquant' });

    // Empêcher la suppression de son propre compte
    if (userId === req.session.user.id) {
      return res.status(400).json({ error: 'Impossible de supprimer votre propre compte' });
    }

    await UserService.deleteUser(userId);
    return res.json({ success: true });
  }

  if (req.method === 'PUT') {
    const { userId, email, pixelLimit, newPassword } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId manquant' });

    // Mise à jour des infos
    await UserService.updateUser(userId, { email, pixelLimit });

    // Reset mot de passe si demandé
    if (newPassword) {
      await UserService.resetPassword(userId, newPassword);
    }

    return res.json({ success: true });
  }

  return res.status(405).end();
}

export default withSuperAdminApi(handler);
