import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/admin/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push('/admin');
    } else {
      setError(data.error || 'Inscription échouée');
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, marginTop: '80px' }}>
      <h1 style={{ marginBottom: 20, borderBottom: '2px solid var(--border)', paddingBottom: 10 }}>Créer un compte</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%' }}
        />
        <input
          type="password"
          placeholder="Mot de passe (min 8 chars, 1 majuscule, 1 chiffre)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          style={{ width: '100%' }}
        />
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          style={{ width: '100%' }}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Inscription...' : 'Créer mon compte'}
        </button>
        {error && <div style={{ background: 'transparent', color: 'red', padding: 10, border: '2px solid red' }}>{error}</div>}
      </form>
      <div style={{ marginTop: 20, fontSize: '0.9em', textAlign: 'center' }}>
        Déjà un compte ? <Link href="/login">Se connecter</Link>
      </div>
    </div>
  );
}
