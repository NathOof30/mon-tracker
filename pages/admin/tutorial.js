import { useRouter } from 'next/router';
import { withAdminSsr } from '../../lib/withAdminAuth.js';

export default function TutorialPage() {
  const router = useRouter();

  return (
    <div className="container" style={{ maxWidth: 800 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, borderBottom: '2px solid var(--border)', paddingBottom: 20 }}>
        <div>
          <h1>Guide d'utilisation</h1>
          <p style={{ fontSize: '0.9em', opacity: 0.8 }}>Apprendre à tracker vos emails</p>
        </div>
        <button onClick={() => router.push('/admin')}>Retour au Dashboard</button>
      </header>

      <div className="box">
        <h2>💡 Quel est le but de ce site ?</h2>
        <p style={{ marginTop: 10 }}>
          Ce tracker vous permet de savoir si, quand et par qui vos emails ont été ouverts. 
          Il utilise un <strong>pixel espion</strong> (une image GIF transparente de 1x1 pixel). 
          Lorsque le destinataire ouvre l'email, son client de messagerie charge automatiquement cette image invisible, ce qui enregistre une ouverture sur notre serveur avec l'heure, l'adresse IP et le navigateur utilisé.
        </p>
      </div>

      <div className="box" style={{ background: 'var(--bg)' }}>
        <h2>🛠️ Guide pas-à-pas pour Gmail</h2>
        <ol style={{ paddingLeft: 20, marginTop: 15, display: 'flex', flexDirection: 'column', gap: 15 }}>
          <li>
            <strong>Créer un pixel :</strong><br />
            Sur votre dashboard, donnez un nom à votre pixel (ex : <em>"Devis Client X"</em>) et cliquez sur <strong>Créer</strong>.
          </li>
          <li>
            <strong>Générer une URL ciblée (Optionnel) :</strong><br />
            Cliquez sur le nom du pixel créé pour ouvrir sa page de détails. Tapez le nom ou l'email du destinataire dans le champ <strong>🎯 URL Ciblée</strong> (ex : <em>"jean.dupont@gmail.com"</em>). Cela permet d'identifier précisément qui ouvre l'email. Copiez l'URL générée.
          </li>
          <li>
            <strong>Insérer le pixel dans Gmail :</strong><br />
            Lors de la rédaction de votre email dans Gmail :
            <ul style={{ paddingLeft: 20, marginTop: 5, listStyleType: 'square' }}>
              <li>Dans la barre d'outils en bas de la fenêtre de rédaction, cliquez sur l'icône <strong>Insérer une photo</strong> (l'icône représentant une montagne/photo, ne pas utiliser le trombone de pièce jointe).</li>
              <li>Dans la fenêtre qui s'ouvre, sélectionnez l'onglet <strong>Adresse Web (URL)</strong> tout à droite.</li>
              <li>Collez l'URL de votre pixel copiée précédemment.</li>
              <li>Cliquez sur <strong>Insérer</strong>.</li>
            </ul>
            <p style={{ fontSize: '0.85em', color: '#666', marginTop: 5 }}>
              💡 L'image insérée est un GIF 1x1 transparent : elle sera totalement invisible dans le corps de votre message.
            </p>
          </li>
          <li>
            <strong>Envoyer et suivre :</strong><br />
            Envoyez l'email. Dès que le destinataire ouvrira le message, les logs apparaîtront instantanément sur la page de détails du pixel.
          </li>
        </ol>
      </div>

      <div className="box">
        <h2>⚠️ Conseils importants & Limitations</h2>
        <h3 style={{ marginTop: 15, fontSize: '1.1em' }}>🔍 Comment fonctionne l'anti-bruit (Gmail Proxy) ?</h3>
        <p style={{ fontSize: '0.9em', marginTop: 5 }}>
          Gmail utilise des serveurs proxy (Google Image Proxy) pour charger et mettre en cache les images des emails. 
          Lors du clic sur "Insérer" ou juste après l'envoi, les serveurs de Google peuvent charger l'image immédiatement. 
          Notre algorithme détecte ce comportement et marque automatiquement ces ouvertures initiales en <strong>UPLOAD (IGNORE)</strong> pour ne pas fausser vos statistiques.
        </p>

        <h3 style={{ marginTop: 15, fontSize: '1.1em' }}>🚫 Évitez de fausser vos propres logs</h3>
        <p style={{ fontSize: '0.9em', marginTop: 5 }}>
          Si vous ouvrez votre email dans votre dossier "Messages envoyés", votre propre ouverture pourrait être enregistrée. 
          Pour éviter cela, évitez de réouvrir l'email envoyé ou configurez votre client pour ne pas charger les images par défaut sur votre propre messagerie.
        </p>
      </div>
    </div>
  );
}

export const getServerSideProps = withAdminSsr(async () => {
  return { props: {} };
});
