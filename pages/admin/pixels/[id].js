import { useState } from 'react';
import { withAdminSsr } from '../../../lib/withAdminAuth.js';
import { PixelService } from '../../../lib/pixelService.js';
import { useRouter } from 'next/router';

export default function PixelDetail({ pixel, host }) {
  const router = useRouter();
  if (!pixel) return <p>Pixel introuvable</p>;

  const formatDate = (dateString) => {
    if (!dateString) return 'Inconnue';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const protocol = host.includes('localhost') ? 'http' : 'https';
  const basePixelUrl = `${protocol}://${host}/api/image/${pixel.id}.gif`;

  // State pour le générateur d'URL ciblée
  const [targetName, setTargetName] = useState('');
  const pixelUrl = targetName ? `${basePixelUrl}?cible=${encodeURIComponent(targetName)}` : basePixelUrl;

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce pixel et tout son historique ?')) return;
    const res = await fetch('/api/admin/delete-pixel', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: pixel.id }),
    });
    if (res.ok) {
      router.push('/admin');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copié : ' + text);
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={() => router.push('/admin')}>⬅ Retour au Dashboard</button>
        <button onClick={handleDelete} style={{ background: '#cc0000', color: 'white', borderColor: '#cc0000', padding: '8px 16px' }}>Supprimer ce pixel</button>
      </div>

      <div className="box">
        <h1 style={{ marginBottom: 10 }}>{pixel.name}</h1>
        <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <strong>ID:</strong> {pixel.id}
          <button onClick={() => copyToClipboard(pixel.id)} style={{ fontSize: '0.75em', padding: '2px 8px' }}>Copier ID</button>
        </div>
        <div style={{ marginBottom: 15, padding: 15, background: 'var(--bg-color)', border: '1px solid var(--border)' }}>
          <strong style={{ display: 'block', marginBottom: 10 }}>🎯 URL Ciblée (Optionnel) :</strong>
          <p style={{ fontSize: '0.85em', color: '#666', marginBottom: 10 }}>Si vous envoyez cet email à une personne spécifique, tapez son nom ci-dessous pour générer une URL de tracking unique.</p>
          <input
            type="text"
            placeholder="Ex: jean.dupont"
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
            style={{ width: '100%', marginBottom: 10, padding: 8, border: '1px solid #ccc' }}
          />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="text" readOnly value={pixelUrl} style={{ flex: 1, padding: '5px' }} />
            <button onClick={() => copyToClipboard(pixelUrl)} style={{ fontSize: '0.75em', padding: '2px 8px' }}>Copier URL</button>
          </div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <strong>Code HTML (à insérer) :</strong> <br />
          <textarea readOnly value={`<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;" />`} style={{ width: '100%', padding: 10, marginTop: 5, fontFamily: 'monospace', height: 60, border: '1px solid #ccc' }} />
        </div>
        <hr style={{ border: 'none', borderTop: '2px solid var(--border)', margin: '20px 0' }} />
        <div><strong>Total Ouvertures:</strong> {pixel.logs.length}</div>
        <div><strong>Créé le:</strong> {formatDate(pixel.createdAt)}</div>
      </div>

      <h2 style={{ marginTop: 40, marginBottom: 20 }}>Historique des ouvertures</h2>
      {pixel.logs.length === 0 ? (
        <p>Aucune ouverture enregistrée pour le moment.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date et Heure</th>
              <th>Cible</th>
              <th>IP</th>
              <th>Navigateur (User-Agent)</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              // On utilise une fenêtre de 10 secondes pour détecter l'upload
              const targetFirstProxyTime = {};
              const uploadEventIds = new Set();

              // On parcourt à l'envers (du plus ancien au plus récent)
              for (let i = pixel.logs.length - 1; i >= 0; i--) {
                const log = pixel.logs[i];
                if (log.userAgent && log.userAgent.includes('GoogleImageProxy')) {
                  // Nettoyage de la clé pour éviter les bugs d'espaces ou de majuscules
                  const targetKey = (log.target || 'no_target').toLowerCase().trim();
                  const logTime = new Date(log.timestamp).getTime();

                  if (!targetFirstProxyTime[targetKey]) {
                    // C'est la TOUTE PREMIÈRE FOIS qu'on voit cette cible via le proxy : c'est l'upload
                    targetFirstProxyTime[targetKey] = logTime;
                    uploadEventIds.add(log.id);
                  } else {
                    // Si on est dans les 10 secondes suivant la toute première vue, on ignore (c'est toujours l'upload)
                    const diffSeconds = (logTime - targetFirstProxyTime[targetKey]) / 1000;
                    if (diffSeconds <= 10) {
                      uploadEventIds.add(log.id);
                    }
                  }
                }
              }

              return pixel.logs.map(log => {
                const isUpload = uploadEventIds.has(log.id);

                return (
                  <tr key={log.id} style={{
                    opacity: isUpload ? 0.4 : 1,
                    backgroundColor: isUpload ? 'var(--bg-color)' : 'inherit',
                    borderBottom: '1px solid var(--border)'
                  }}>
                    <td style={{ padding: '10px 5px' }}>{formatDate(log.timestamp)}</td>
                    <td style={{ padding: '10px 5px', fontWeight: 'bold', color: 'var(--primary-color, #0070f3)' }}>
                      {log.target || <span style={{ color: '#999', fontWeight: 'normal' }}>-</span>}
                    </td>
                    <td style={{ padding: '10px 5px' }}>
                      {isUpload && <span style={{
                        fontSize: '0.7em',
                        background: '#666',
                        color: 'white',
                        padding: '2px 5px',
                        marginRight: '8px',
                        borderRadius: '3px'
                      }}>UPLOAD (IGNORE)</span>}
                      {log.ip || 'Inconnue'}
                    </td>
                    <td style={{ fontSize: '0.8em', padding: '10px 5px' }}>{log.userAgent || 'N/A'}</td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      )}
    </div>
  );
}

export const getServerSideProps = withAdminSsr(async (context) => {
  const { id } = context.params;
  const userId = context.req.session.user.id;
  const pixel = await PixelService.getPixelById(id, userId);
  const host = context.req.headers.host;
  return { props: { pixel, host } };
});
