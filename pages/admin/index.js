import { withAdminSsr } from '../../lib/withAdminAuth.js';
import { PixelService } from '../../lib/pixelService.js';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminDashboard({ stats, pixels, host, userLimit, role }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) return;
    setError('');
    const res = await fetch('/api/admin/create-pixel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setName('');
      router.reload();
    } else {
      const data = await res.json();
      setError(data.error || 'Erreur lors de la création');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce pixel et tout son historique ?')) return;
    const res = await fetch('/api/admin/delete-pixel', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      router.reload();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copié : ' + text);
  };

  const isLimitReached = pixels.length >= userLimit;

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, borderBottom: '2px solid var(--border)', paddingBottom: 20 }}>
        <div>
          <h1>Dashboard Admin</h1>
          {role === 'superadmin' && (
            <p style={{ marginTop: 5 }}>
              <Link href="/superadmin" style={{ fontWeight: 'bold', color: 'blue' }}>👑 Gérer les comptes utilisateurs</Link>
            </p>
          )}
        </div>
        <button onClick={async () => { await fetch('/api/admin/logout'); router.push('/login'); }}>Déconnexion</button>
      </header>
      
      <div className="box">
        <h3 style={{ marginBottom: 10 }}>Créer un nouveau pixel</h3>
        {isLimitReached ? (
          <p style={{ color: 'red', fontWeight: 'bold', border: '1px solid red', padding: '10px', background: '#ffe6e6' }}>
            Vous avez atteint votre limite de pixels ({userLimit} max). Veuillez contacter un administrateur pour augmenter cette limite.
          </p>
        ) : (
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: 10 }}>
            <input 
              type="text" 
              placeholder="Nom du pixel (ex: Email Promo)" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              style={{ flex: 1 }}
              maxLength={100}
            />
            <button type="submit">Créer</button>
          </form>
        )}
        {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
        <div className="box" style={{ flex: 1, marginBottom: 0 }}>
          <div style={{ fontSize: '0.9em', textTransform: 'uppercase', fontWeight: 'bold' }}>Pixels Créés</div>
          <div style={{ fontSize: '2em' }}>{stats.totalPixels} / {userLimit}</div>
        </div>
        <div className="box" style={{ flex: 1, marginBottom: 0 }}>
          <div style={{ fontSize: '0.9em', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Ouvertures</div>
          <div style={{ fontSize: '2em' }}>{stats.totalOpens}</div>
        </div>
      </div>

      <h2 style={{ marginBottom: 20 }}>Liste des pixels</h2>
      {pixels.length === 0 ? <p>Aucun pixel créé pour le moment.</p> : null}
      
      {pixels.map(p => (
        <div key={p.id} className="box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ marginBottom: 5 }}>
              <Link href={`/admin/pixels/${p.id}`}>{p.name}</Link>
            </h3>
            <div style={{ fontSize: '0.85em', opacity: 0.8 }}>ID: {p.id}</div>
            <div style={{ fontSize: '0.85em', opacity: 0.8, marginTop: 5 }}>Ouvertures : <strong>{p.opens}</strong></div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
            <button onClick={() => copyToClipboard(p.id)} style={{ fontSize: '0.8em', padding: '5px 10px' }}>Copier ID</button>
            <button onClick={() => copyToClipboard(`${host.includes('localhost') ? 'http' : 'https'}://${host}/api/image/${p.id}.gif`)} style={{ fontSize: '0.8em', padding: '5px 10px' }}>Copier URL Pixel</button>
            <button onClick={() => handleDelete(p.id)} style={{ fontSize: '0.8em', padding: '5px 10px', background: '#cc0000', color: 'white', borderColor: '#cc0000' }}>Supprimer</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export const getServerSideProps = withAdminSsr(async (context) => {
  const userId = context.req.session.user.id;
  const stats = await PixelService.getStats(userId);
  const pixels = await PixelService.getAllPixels(userId);
  const host = context.req.headers.host;
  const userLimit = context.req.session.user.pixelLimit || 10;
  const role = context.req.session.user.role || 'user';
  return { props: { stats, pixels, host, userLimit, role } };
});
