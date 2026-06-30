import { withAdminSsr } from '../../../lib/withAdminAuth.js';
import { PixelService } from '../../../lib/pixelService.js';
import { useRouter } from 'next/router';

export default function PixelDetail({ pixel, host }) {
  const router = useRouter();
  if (!pixel) return <p>Pixel introuvable</p>;

  const protocol = host.includes('localhost') ? 'http' : 'https';
  const pixelUrl = `${protocol}://${host}/api/tracker/${pixel.id}`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copié : ' + text);
  };

  return (
    <div className="container">
      <button onClick={() => router.back()} style={{ marginBottom: 20 }}>⬅ Retour au Dashboard</button>
      
      <div className="box">
        <h1 style={{ marginBottom: 10 }}>{pixel.name}</h1>
        <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <strong>ID:</strong> {pixel.id} 
          <button onClick={() => copyToClipboard(pixel.id)} style={{ fontSize: '0.75em', padding: '2px 8px' }}>Copier ID</button>
        </div>
        <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <strong>URL du Tracker:</strong> <code>{pixelUrl}</code> 
          <button onClick={() => copyToClipboard(pixelUrl)} style={{ fontSize: '0.75em', padding: '2px 8px' }}>Copier URL</button>
        </div>
        <div style={{ marginBottom: 10 }}>
          <strong>Code HTML (pour intégration Email):</strong> <br/>
          <textarea readOnly value={`<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;" />`} style={{ width: '100%', padding: 10, marginTop: 5, fontFamily: 'monospace', height: 60 }} />
        </div>
        <hr style={{ border: 'none', borderTop: '2px solid var(--border)', margin: '20px 0' }} />
        <div><strong>Total Ouvertures:</strong> {pixel.logs.length}</div>
        <div><strong>Créé le:</strong> {new Date(pixel.createdAt).toLocaleString()}</div>
      </div>

      <h2 style={{ marginTop: 40, marginBottom: 20 }}>Historique des ouvertures</h2>
      {pixel.logs.length === 0 ? (
        <p>Aucune ouverture enregistrée pour le moment.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date et Heure</th>
              <th>IP (Anonymisée)</th>
              <th>Navigateur (User-Agent)</th>
            </tr>
          </thead>
          <tbody>
            {pixel.logs.map(log => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.ip || 'Inconnue'}</td>
                <td style={{ fontSize: '0.85em' }}>{log.userAgent || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export const getServerSideProps = withAdminSsr(async (context) => {
  const { id } = context.params;
  const pixel = await PixelService.getPixelById(id);
  const host = context.req.headers.host;
  return { props: { pixel, host } };
});
