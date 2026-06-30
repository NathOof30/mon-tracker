import { withAdminSsr } from '../../lib/withAdminAuth.js';
import { PixelService } from '../../lib/pixelService.js';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminDashboard({ stats, pixels }) {
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
      router.replace(router.asPath); // Rafraîchir les données
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>📊 Dashboard Admin</h1>
      
      <div style={{ background: '#f9f9f9', padding: 15, borderRadius: 8, marginBottom: 20 }}>
        <h3>Créer un nouveau pixel</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: 10 }}>
          <input 
            type="text" 
            placeholder="Nom du pixel" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            style={{ padding: 8, flex: 1 }}
            maxLength={100}
          />
          <button type="submit" style={{ padding: '8px 16px' }}>Créer</button>
        </form>
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
        <div style={{ background: '#f0f0f0', padding: 15, borderRadius: 8 }}>📌 Pixels créés : {stats.totalPixels}</div>
        <div style={{ background: '#f0f0f0', padding: 15, borderRadius: 8 }}>👁️ Total ouvertures : {stats.totalOpens}</div>
      </div>

      <h2>Liste des pixels</h2>
      <ul>
        {pixels.map(p => (
          <li key={p.id} style={{ marginBottom: 10, padding: 10, border: '1px solid #ddd', borderRadius: 4 }}>
            <Link href={`/admin/pixels/${p.id}`}>
              <strong>{p.name}</strong> (ID: {p.id})
            </Link>
            <span style={{ marginLeft: 15 }}>Ouvertures: {p.opens}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const getServerSideProps = withAdminSsr(async () => {
  const stats = await PixelService.getStats();
  const pixels = await PixelService.getAllPixels();
  return { props: { stats, pixels } };
});
