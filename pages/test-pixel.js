import { useState, useEffect } from 'react';

export default function TestPixel() {
  const [pixelId, setPixelId] = useState('');
  const [pixelUrl, setPixelUrl] = useState('');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const handleTest = (e) => {
    e.preventDefault();
    if (!pixelId) return;
    setPixelUrl(`/api/tracker/${pixelId}.png?t=${Date.now()}`); // t=Date permet d'éviter le cache local lors de multiples tests
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: 20 }}>🧪 Page de test du Pixel</h1>
      <p style={{ marginBottom: 20 }}>
        Cette page permet de s'assurer que votre navigateur réussit à charger l'image générée par l'API. Gmail vérifie exactement la même chose.
      </p>
      
      <form onSubmit={handleTest} style={{ display: 'flex', gap: 10, marginBottom: 30 }}>
        <input 
          type="text" 
          placeholder="ID du Pixel (ex: 8b3c...)" 
          value={pixelId} 
          onChange={(e) => setPixelId(e.target.value)} 
          style={{ width: '300px' }}
        />
        <button type="submit">Tester ce pixel</button>
      </form>

      {pixelUrl && (
        <div className="box" style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: 15 }}>Aperçu de l'image :</h3>
          <p style={{ fontSize: '0.85em', marginBottom: 20 }}>
            Si un minuscule point transparent apparaît au centre du carré rouge, c'est que l'image PNG a été chargée avec succès et que les Headers sont valides !
          </p>
          
          <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', border: '5px solid #cc0000', padding: 20, background: '#fff', minWidth: 100, minHeight: 100 }}>
            {/* L'image réelle, avec une micro bordure noire pour la voir */}
            <img 
              src={pixelUrl} 
              alt="Test de pixel" 
              style={{ border: '1px solid black', display: 'block' }} 
            />
          </div>
          
          <p style={{ marginTop: 20, fontSize: '0.85em', wordBreak: 'break-all', textAlign: 'left', background: '#e0e0e0', padding: 10 }}>
            <strong>URL complète :</strong> <br />
            <code>{origin}{pixelUrl.split('?')[0]}</code>
          </p>
        </div>
      )}
    </div>
  );
}
