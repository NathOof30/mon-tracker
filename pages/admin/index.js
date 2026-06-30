import { withAdminSsr } from '../../lib/withAdminAuth.js';
import { PixelService } from '../../lib/pixelService.js';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminDashboard({ stats, pixels, host }) {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) return;
    const res = await fetch('/api/admin/create-pixel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setName('');
      router.reload();
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

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, borderBottom: '2px solid var(--border)', paddingBottom: 20 }}>
        <h1>Dashboard Admin</h1>
        <button onClick={async () => { await fetch('/api/admin/logout'); router.push('/login'); }}>Déconnexion</button>
      </header>
      
      <div className="box">
        <h3 style={{ marginBottom: 10 }}>Créer un nouveau pixel</h3>
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
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
        <div className="box" style={{ flex: 1, marginBottom: 0 }}>
          <div style={{ fontSize: '0.9em', textTransform: 'uppercase', fontWeight: 'bold' }}>Pixels Créés</div>
          <div style={{ fontSize: '2em' }}>{stats.totalPixels}</div>
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
  const stats = await PixelService.getStats();
  const pixels = await PixelService.getAllPixels();
  const host = context.req.headers.host;
  return { props: { stats, pixels, host } };
});
