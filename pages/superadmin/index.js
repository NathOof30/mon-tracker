import { useState } from 'react';
import { useRouter } from 'next/router';
import { withSuperAdminSsr } from '../../lib/withAdminAuth.js';
import { UserService } from '../../lib/userService.js';

export default function SuperAdminDashboard({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const [editingUser, setEditingUser] = useState(null);
  
  // States for editing form
  const [editEmail, setEditEmail] = useState('');
  const [editPixelLimit, setEditPixelLimit] = useState(10);
  const [editPassword, setEditPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSelectUser = (user) => {
    setEditingUser(user);
    setEditEmail(user.email);
    setEditPixelLimit(user.pixelLimit);
    setEditPassword('');
    setError('');
    setSuccess('');
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editEmail) {
      setError('L\'email est requis.');
      return;
    }

    const body = {
      userId: editingUser.id,
      email: editEmail,
      pixelLimit: Number(editPixelLimit),
    };

    if (editPassword) {
      if (editPassword.length < 8) {
        setError('Le nouveau mot de passe doit faire au moins 8 caractères.');
        return;
      }
      body.newPassword = editPassword;
    }

    const res = await fetch('/api/superadmin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setSuccess('Utilisateur mis à jour avec succès !');
      // Mettre à jour la liste locale
      setUsers(users.map(u => u.id === editingUser.id ? { 
        ...u, 
        email: editEmail, 
        pixelLimit: Number(editPixelLimit) 
      } : u));
      setEditPassword('');
    } else {
      const data = await res.json();
      setError(data.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('ATTENTION : Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cela supprimera également TOUS ses pixels et logs associés définitivement !')) {
      return;
    }

    setError('');
    setSuccess('');

    const res = await fetch('/api/superadmin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (res.ok) {
      setSuccess('Utilisateur supprimé avec succès.');
      setUsers(users.filter(u => u.id !== userId));
      if (editingUser?.id === userId) {
        setEditingUser(null);
      }
    } else {
      const data = await res.json();
      setError(data.error || 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, borderBottom: '2px solid var(--border)', paddingBottom: 20 }}>
        <div>
          <h1>Gestion des Comptes</h1>
          <p style={{ fontSize: '0.9em', opacity: 0.8 }}>Espace Super-Admin</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => router.push('/admin')}>Dashboard Principal</button>
          <button onClick={async () => { await fetch('/api/admin/logout'); router.push('/login'); }}>Déconnexion</button>
        </div>
      </header>

      {success && <div className="box" style={{ border: '2px solid green', color: 'green', background: 'transparent' }}>{success}</div>}
      {error && <div className="box" style={{ border: '2px solid red', color: 'red', background: 'transparent' }}>{error}</div>}

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* Liste des utilisateurs */}
        <div style={{ flex: '2 1 500px' }}>
          <h2>Utilisateurs inscrits</h2>
          <table style={{ marginTop: 10 }}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Rôle</th>
                <th>Pixels</th>
                <th>Limite</th>
                <th>Date d'inscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ 
                  backgroundColor: editingUser?.id === u.id ? 'var(--hover)' : 'inherit'
                }}>
                  <td>{u.email}</td>
                  <td>{u.role === 'superadmin' ? '👑 Super-Admin' : 'Utilisateur'}</td>
                  <td>{u.pixelCount}</td>
                  <td>{u.pixelLimit}</td>
                  <td style={{ fontSize: '0.85em' }}>{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button onClick={() => handleSelectUser(u)} style={{ fontSize: '0.8em', padding: '2px 8px' }}>Gérer</button>
                      {u.role !== 'superadmin' && (
                        <button onClick={() => handleDeleteUser(u.id)} style={{ fontSize: '0.8em', padding: '2px 8px', background: '#cc0000', color: 'white', borderColor: '#cc0000' }}>Supprimer</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Formulaire d'édition */}
        {editingUser && (
          <div style={{ flex: '1 1 300px' }}>
            <div className="box">
              <h3>Modifier l'utilisateur</h3>
              <p style={{ fontSize: '0.85em', opacity: 0.8, marginBottom: 15 }}>ID: {editingUser.id}</p>
              
              <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', marginBottom: 5 }}>Adresse Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', marginBottom: 5 }}>Limite de Pixels</label>
                  <input
                    type="number"
                    value={editPixelLimit}
                    onChange={(e) => setEditPixelLimit(e.target.value)}
                    style={{ width: '100%' }}
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', marginBottom: 5 }}>Nouveau Mot de Passe (laisser vide si inchangé)</label>
                  <input
                    type="password"
                    placeholder="Entrez un nouveau mot de passe"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button type="submit" style={{ flex: 1 }}>Sauvegarder</button>
                  <button type="button" onClick={() => setEditingUser(null)} style={{ flex: 1, background: 'transparent' }}>Annuler</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps = withSuperAdminSsr(async () => {
  const users = await UserService.getAllUsers();
  return {
    props: {
      initialUsers: users
    }
  };
});
