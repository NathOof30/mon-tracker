import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push('/admin');
    } else {
      setError('Mot de passe incorrect ou trop de tentatives.');
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400, marginTop: '100px' }}>
      <h1 style={{ marginBottom: 20, borderBottom: '2px solid var(--border)', paddingBottom: 10 }}>Administration</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        <input 
          type="password" 
          placeholder="Mot de passe" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          style={{ width: '100%' }}
        />
        <button type="submit">Se connecter</button>
        {error && <div style={{ background: 'transparent', color: 'red', padding: 10, border: '2px solid red' }}>{error}</div>}
      </form>
    </div>
  );
}
