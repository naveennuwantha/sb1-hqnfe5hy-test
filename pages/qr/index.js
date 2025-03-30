import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function QRRedirectPage() {
  const router = useRouter();
  const { id } = router.query;
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only run after router is ready and we have query parameters
    if (!router.isReady) return;

    if (id) {
      console.log('Redirecting from QR to profile with ID:', id);
      router.replace(`/viewprofile/${id}`);
    } else {
      // If there's no ID but router is ready, redirect to home page
      console.log('No ID provided, redirecting to home page');
      router.replace('/');
    }
  }, [id, router, router.isReady]);

  return (
    <>
      <Head>
        <title>Redirecting... | Nexia</title>
        <meta name="description" content="Redirecting to profile" />
      </Head>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              margin: '0 auto',
              border: '4px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              borderTop: '4px solid #3498db',
              animation: 'spin 1s linear infinite'
            }}
          />
          <p>Redirecting to profile...</p>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    </>
  );
}

// Server-side props
export async function getServerSideProps(context) {
  const { id } = context.query;
  
  if (!id) {
    // Instead of redirecting to home, we'll let the client-side handle
    // the redirect to the demo profile
    return {
      props: {},
    };
  }

  return {
    props: {},
  };
} 