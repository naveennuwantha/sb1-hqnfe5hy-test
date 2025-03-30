import { useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Import the PublicProfileScreen component dynamically to avoid SSR issues
const PublicProfileScreen = dynamic(() => import('../../src/screens/PublicProfileScreen'), {
  ssr: false,
  loading: () => (
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
        <p>Loading profile...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  ),
});

export default function ViewProfilePage({ userId }) {
  const router = useRouter();
  const { userId: paramUserId } = router.query;
  
  // If no userId is provided, redirect to home page
  useEffect(() => {
    if (!userId && !paramUserId) {
      router.replace('/');
    }
  }, [userId, paramUserId, router]);

  const activeUserId = userId || paramUserId;
  
  // If there's no userId, return null (will redirect in useEffect)
  if (!activeUserId) {
    return null;
  }

  // Create a navigation object that mimics React Navigation's interface
  const navigation = {
    navigate: (screenName, params) => {
      if (screenName === 'PublicProfile') {
        router.push(`/viewprofile/${params.userId}`);
      } else {
        router.push(`/${screenName.toLowerCase()}`);
      }
    },
    goBack: () => router.back(),
    setOptions: () => {},
  };

  // In the web version, we'll directly render the PublicProfileScreen component
  // with the userId as a prop and mock navigation
  return (
    <>
      <Head>
        <title>Profile | Nexia</title>
        <meta name="description" content="View profile on Nexia" />
      </Head>
      <PublicProfileScreen 
        navigation={navigation} 
        route={{ params: { userId: activeUserId } }} 
      />
    </>
  );
}

// Server-side props
export async function getServerSideProps(context) {
  const { userId } = context.params;
  
  if (!userId) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      userId,
    },
  };
} 