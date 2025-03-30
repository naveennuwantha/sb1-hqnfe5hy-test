import React, { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import '../styles/globals.css';
import Head from 'next/head';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { theme } from '../src/services/themeService';
import { ThemeProvider } from '../src/context/ThemeContext';

// Define __DEV__ if it's not defined
if (typeof __DEV__ === 'undefined') {
  global.__DEV__ = process.env.NODE_ENV !== 'production';
}

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    let isMounted = true;
    let authListener = null;
    
    // Prevent multiple simultaneous auth-related redirects
    let redirectInProgress = false;
    
    // Set up the auth state listener
    const setupAuthListener = async () => {
      // Only subscribe once
      if (authListener) return;
      
      // Listen for auth state changes
      const { data } = await supabase.auth.getSession();
      
      console.log("Initial auth check complete:", data.session ? "User is signed in" : "No user session");
      
      authListener = supabase.auth.onAuthStateChange((event, session) => {
        console.log("Auth state changed:", event);
        
        if (!isMounted || redirectInProgress) return;
        
        // Handle sign in
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
          console.log("User signed in, no redirect needed as login page already handles this");
          // We don't redirect here as the login page already handles redirects after sign in
        }
        
        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log("User signed out");
          
          // If not on login page, redirect to login
          if (window.location.pathname !== '/login') {
            redirectInProgress = true;
            window.location.href = '/login';
          }
        }
      });
    };
    
    setupAuthListener();
    
    // Clean up
    return () => {
      isMounted = false;
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  React.useEffect(() => {
    // Remove the server-side injected CSS
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles?.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <ThemeProvider>
      <EmotionThemeProvider theme={theme}>
        <Head>
          {/* Viewport meta tag belongs in _app.js, not in _document.js */}
          <meta 
            name="viewport" 
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" 
          />
          {/* Font preloading */}
          <link
            href="https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/AntDesign.ttf"
            rel="preload"
            as="font"
            crossOrigin="anonymous"
          />
          <link
            href="https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/Entypo.ttf"
            rel="preload"
            as="font"
            crossOrigin="anonymous"
          />
          <link
            href="https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/EvilIcons.ttf"
            rel="preload"
            as="font"
            crossOrigin="anonymous"
          />
          <link
            href="https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/Feather.ttf"
            rel="preload"
            as="font"
            crossOrigin="anonymous"
          />
          <link
            href="https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf"
            rel="preload"
            as="font"
            crossOrigin="anonymous"
          />
          <link
            href="https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf"
            rel="preload"
            as="font"
            crossOrigin="anonymous"
          />
          <link
            href="https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf"
            rel="preload"
            as="font"
            crossOrigin="anonymous"
          />
          <style>{`
            @font-face {
              font-family: 'AntDesign';
              src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/AntDesign.ttf') format('truetype');
            }
            @font-face {
              font-family: 'Entypo';
              src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/Entypo.ttf') format('truetype');
            }
            @font-face {
              font-family: 'EvilIcons';
              src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/EvilIcons.ttf') format('truetype');
            }
            @font-face {
              font-family: 'Feather';
              src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/Feather.ttf') format('truetype');
            }
            @font-face {
              font-family: 'FontAwesome';
              src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf') format('truetype');
            }
            @font-face {
              font-family: 'MaterialIcons';
              src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf') format('truetype');
            }
            @font-face {
              font-family: 'MaterialCommunityIcons';
              src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf') format('truetype');
            }
          `}</style>
          {/* Remove duplicate font loading as it's now in _document.js */}
        </Head>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Component {...pageProps} />
        </div>
      </EmotionThemeProvider>
    </ThemeProvider>
  );
}

export default MyApp; 