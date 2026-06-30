import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>404 - Not Found</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      {/* 
        Le style global est réinitialisé ici localement pour forcer 
        un look très basique (fond noir, texte sombre)
      */}
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background-color: #0a0a0a;
          color: #333;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }
      `}</style>

      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 300, margin: 0, letterSpacing: '0.1em' }}>404</h1>
        <div style={{ fontSize: '1rem', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          <span>Page not found</span>
          
          {/* L'Easter Egg : un point quasi-invisible qui s'illumine en rouge au survol */}
          <div 
            onClick={() => router.push('/login')} 
            style={{ 
              cursor: 'pointer', 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%',
              backgroundColor: '#cc0000',
              opacity: 0.05,
              transition: 'all 0.3s ease',
              marginTop: '4px'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '1';
              e.target.style.boxShadow = '0 0 10px #cc0000';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '0.05';
              e.target.style.boxShadow = 'none';
            }}
            title="Connexion Admin"
          />
        </div>
      </div>
    </>
  );
}
