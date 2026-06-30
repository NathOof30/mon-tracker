import { withAdminSsr } from '../../../lib/withAdminAuth.js';
import { PixelService } from '../../../lib/pixelService.js';
import { useRouter } from 'next/router';

export default function PixelDetail({ pixel }) {
  const router = useRouter();
  if (!pixel) return <p>Pixel introuvable</p>;

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <button onClick={() => router.back()}>⬅ Retour</button>
      <h1>📌 {pixel.name}</h1>
      <p>ID : <code>{pixel.id}</code></p>
      <p>Créé le : {new Date(pixel.createdAt).toLocaleString()}</p>
      <p>Total ouvertures : {pixel.logs.length}</p>

      <h3>Logs détaillés</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ textAlign: 'left', padding: 8, border: '1px solid #ddd' }}>Date</th>
            <th style={{ textAlign: 'left', padding: 8, border: '1px solid #ddd' }}>IP (anonymisée)</th>
            <th style={{ textAlign: 'left', padding: 8, border: '1px solid #ddd' }}>User-Agent</th>
          </tr>
        </thead>
        <tbody>
          {pixel.logs.map(log => (
            <tr key={log.id}>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>{new Date(log.timestamp).toLocaleString()}</td>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>{log.ip || 'Inconnue'}</td>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>{log.userAgent || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const getServerSideProps = withAdminSsr(async (context) => {
  const { id } = context.params;
  const pixel = await PixelService.getPixelById(id);
  return { props: { pixel } };
});
