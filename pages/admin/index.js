import { withAdminSsr } from '../../lib/withAdminAuth.js';
import { PixelService } from '../../lib/pixelService.js';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminDashboard({ stats, pixels, host, userLimit, role, dailyStats, hourlyStats, topTargets }) {
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

  // Calculs pour les graphiques
  const maxDaily = Math.max(...dailyStats.map(d => d.count), 0) || 5;
  const maxHourly = Math.max(...hourlyStats.map(h => h.count), 0) || 5;

  return (
    <div className="container" style={{ maxWidth: 1000 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, borderBottom: '2px solid var(--border)', paddingBottom: 20 }}>
        <div>
          <h1>Dashboard Admin</h1>
          <div style={{ display: 'flex', gap: 15, marginTop: 5 }}>
            <Link href="/admin/tutorial" style={{ fontWeight: 'bold' }}>📖 Guide d'utilisation</Link>
            {role === 'superadmin' && (
              <Link href="/superadmin" style={{ fontWeight: 'bold', color: 'blue' }}>👑 Gérer les comptes</Link>
            )}
          </div>
        </div>
        <button onClick={async () => { await fetch('/api/admin/logout'); router.push('/login'); }}>Déconnexion</button>
      </header>
      
      {/* Statistiques globales */}
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

      {/* Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 30 }}>
        
        {/* Graphique 1 : 7 Derniers Jours */}
        <div className="box" style={{ marginBottom: 0 }}>
          <h3 style={{ marginBottom: 15 }}>📈 Activité (7 derniers jours)</h3>
          <div style={{ overflowX: 'auto', width: '100%', paddingBottom: 5 }}>
            <div style={{ minWidth: '350px' }}>
              <svg viewBox="0 0 350 150" width="100%" height="150" style={{ overflow: 'visible' }}>
                {/* Lignes d'aide horizontal */}
                <line x1="0" y1="20" x2="350" y2="20" stroke="var(--border)" strokeOpacity="0.55" strokeDasharray="4 4" />
                <line x1="0" y1="70" x2="350" y2="70" stroke="var(--border)" strokeOpacity="0.55" strokeDasharray="4 4" />
                <line x1="0" y1="120" x2="350" y2="120" stroke="var(--border)" />

                {dailyStats.map((d, i) => {
                  const x = i * 50 + 10;
                  const barWidth = 30;
                  const maxBarHeight = 90;
                  const barHeight = (d.count / maxDaily) * maxBarHeight;
                  const y = 120 - barHeight;
                  
                  return (
                    <g key={i}>
                      {/* Nombre d'ouvertures au-dessus de la barre */}
                      <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fontSize="12" fontWeight="bold" fill="var(--text)">
                        {d.count}
                      </text>
                      {/* Barre */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        fill={d.count > 0 ? 'var(--text)' : 'var(--hover)'}
                        stroke="var(--border)"
                        strokeWidth="2"
                      />
                      {/* Label du jour */}
                      <text x={x + barWidth / 2} y="140" textAnchor="middle" fontSize="11" fill="var(--text)" style={{ textTransform: 'capitalize' }}>
                        {d.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Graphique 2 : Répartition horaire */}
        <div className="box" style={{ marginBottom: 0 }}>
          <h3 style={{ marginBottom: 15 }}>🕒 Heures d'ouvertures (Distribution)</h3>
          <div style={{ overflowX: 'auto', width: '100%', paddingBottom: 5 }}>
            <div style={{ minWidth: '480px' }}>
              <svg viewBox="0 0 480 150" width="100%" height="150" style={{ overflow: 'visible' }}>
                {/* Lignes d'aide horizontal */}
                <line x1="0" y1="20" x2="480" y2="20" stroke="var(--border)" strokeOpacity="0.55" strokeDasharray="4 4" />
                <line x1="0" y1="70" x2="480" y2="70" stroke="var(--border)" strokeOpacity="0.55" strokeDasharray="4 4" />
                <line x1="0" y1="120" x2="480" y2="120" stroke="var(--border)" />

                {hourlyStats.map((h, i) => {
                  const x = i * 20 + 5;
                  const barWidth = 12;
                  const maxBarHeight = 90;
                  const barHeight = (h.count / maxHourly) * maxBarHeight;
                  const y = 120 - barHeight;
                  
                  return (
                    <g key={i}>
                      {/* Barre */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        fill={h.count > 0 ? 'var(--text)' : 'var(--hover)'}
                        stroke="var(--border)"
                        strokeWidth="1.5"
                      />
                      {/* Tooltip titre au survol */}
                      <title>{`${h.count} ouvertures à ${h.label}`}</title>
                      {/* Label d'heure toutes les 2 heures */}
                      {h.hour % 2 === 0 && (
                        <text x={x + barWidth / 2} y="140" textAnchor="middle" fontSize="10" fill="var(--text)">
                          {h.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Graphique 3 : Top Cibles */}
        <div className="box" style={{ marginBottom: 0 }}>
          <h3 style={{ marginBottom: 15 }}>🎯 Cibles les plus actives</h3>
          {topTargets.length === 0 ? (
            <p style={{ fontSize: '0.9em', color: '#666' }}>Aucune cible identifiée pour le moment.</p>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topTargets.map((t, index) => (
                <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--border)', gap: 10 }}>
                  <span style={{ fontWeight: '600', wordBreak: 'break-all', fontSize: '0.9em' }}>
                    {t.target}
                  </span>
                  <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>{t.count} ouv.</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Box de création */}
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

      {/* Liste des pixels */}
      <h2 style={{ marginBottom: 20 }}>Liste de vos pixels</h2>
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
  
  // Seulement 2 requêtes parallèles à la base de données au lieu de 5 !
  const [pixels, analytics] = await Promise.all([
    PixelService.getAllPixels(userId),
    PixelService.getAnalyticsData(userId)
  ]);

  const totalPixels = pixels.length;
  const totalOpens = pixels.reduce((sum, p) => sum + p.opens, 0);

  const stats = {
    totalPixels,
    totalOpens
  };

  const host = context.req.headers.host;
  const userLimit = context.req.session.user.pixelLimit || 10;
  const role = context.req.session.user.role || 'user';
  
  return { 
    props: { 
      stats, 
      pixels, 
      host, 
      userLimit, 
      role, 
      dailyStats: analytics.dailyStats, 
      hourlyStats: analytics.hourlyStats, 
      topTargets: analytics.topTargets 
    } 
  };
});
