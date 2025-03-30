import React from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Load the login screen dynamically to avoid SSR issues with proper import path
const LoginScreen = dynamic(() => import('../src/screens/LoginScreen').catch(err => {
  console.error('Error loading LoginScreen:', err);
  return () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1>Login Component Could Not Be Loaded</h1>
      <p>Please try again later or contact support.</p>
    </div>
  );
}), {
  ssr: false,
  loading: () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh'
    }}>
      Loading registration form...
    </div>
  ),
});

export default function RegisterPage() {
  return (
    <>
      <Head>
        <title>Create a Nexia Account</title>
        <meta name="description" content="Register for a new Nexia account" />
      </Head>
      <LoginScreen googleLoginEnabled={true} isInitiallyLogin={false} />
    </>
  );
} 