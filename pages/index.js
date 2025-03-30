import React from 'react';
import { View, Text } from 'react-native-web';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Dynamically import the App component with SSR disabled
const App = dynamic(
  () => import('../App').then((mod) => mod.default || mod),
  {
    ssr: false,
    loading: () => (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Text>Loading...</Text>
      </View>
    ),
  }
);

export default function Home() {
  return (
    <>
      <Head>
        <title>NEXIA</title>
        <meta name="description" content="NEXIA - Your App Description" />
      </Head>
      <View style={{ flex: 1, minHeight: '100vh' }}>
        <App />
      </View>
    </>
  );
} 