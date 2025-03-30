import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import styles from '../styles/login.module.css';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Google icon as base64 encoded SVG
const GOOGLE_ICON_BASE64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTcuNiA5LjJsLS4xLTEuOEg5djMuNGg0LjhDMTMuNiAxMiAxMyAxMyAxMiAxMy42djIuMmgzYTguOCA4LjggMCAwIDAgMi42LTYuNnoiIGZpbGw9IiM0Mjg1RjQiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGQ9Ik05IDE4YzIuNCAwIDQuNS0uOCA2LTIuMmwtMy0yLjJhNS40IDUuNCAwIDAgMS04LTIuOUgxVjEzYTkgOSAwIDAgMCA4IDV6IiBmaWxsPSIjMzRBODUzIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNNCAxMC43YTUuNCA1LjQgMCAwIDEgMC0zLjRWNUgxYTkgOSAwIDAgMCAwIDhsMy0yLjN6IiBmaWxsPSIjRkJCQzA1IiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNOSAzLjZjMS4zIDAgMi41LjQgMy40IDEuM0wxNSAyLjNBOSA5IDAgMCAwIDEgNWwzIDIuNGE1LjQgNS40IDAgMCAxIDUtMy43eiIgZmlsbD0iI0VBNDMzNSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZD0iTTAgMGgxOHYxOEgweiIvPjwvZz48L3N2Zz4=';

// Load the login screen dynamically to avoid SSR issues
const LoginScreen = dynamic(() => import('../src/screens/LoginScreen'), {
  ssr: false,
  loading: () => (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}></div>
      <p>Loading login screen...</p>
    </div>
  ),
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const checkComplete = useRef(false);
  const authInProgress = useRef(false);

  // Check for the auth state only once when the page loads
  useEffect(() => {
    // Skip if we've already checked
    if (checkComplete.current) return;
    
    // Get the hash from the URL
    const hash = window.location.hash;
    if (hash) {
      console.log("Detected hash in URL, might be an OAuth callback");
    }
    
    // Check if user is already signed in
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log("User is already signed in, redirecting");
          // Use Next.js router for client-side navigation
          router.push('/');
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
      } finally {
        checkComplete.current = true;
      }
    };
    
    checkUser();
  }, [router]);

  const handleNormalLogin = async (e) => {
    e.preventDefault();
    
    if (authInProgress.current) return;
    
    try {
      setLoading(true);
      authInProgress.current = true;
      setError(null);
      
      // Email validation
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
      
      // Password validation
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data?.session) {
        // Successful login
        router.push('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login');
    } finally {
      setLoading(false);
      setTimeout(() => {
        authInProgress.current = false;
      }, 1000);
    }
  };

  const handleGoogleLogin = async () => {
    if (authInProgress.current) return;
    
    try {
      setLoading(true);
      authInProgress.current = true;
      setError(null);
      
      console.log("Starting Google OAuth flow...");
      
      // This is the recommended way to handle OAuth with Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          // Adding explicit scopes
          scopes: 'email profile',
        }
      });
      
      if (error) {
        throw error;
      }
      
      // The user will be redirected to Google login page
      console.log("Redirecting to Google login...", data);
      
      // No need to redirect here as Supabase will handle it
      
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message || 'Failed to login with Google');
      setLoading(false);
      setTimeout(() => {
        authInProgress.current = false;
      }, 1000);
    }
  };

  // Create a web fallback for the login screen in case the dynamic component doesn't load properly
  const loginFallback = (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>NEXIA</h1>
        
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        
        <form className={styles.form} onSubmit={handleNormalLogin}>
          <input 
            type="email" 
            placeholder="Email" 
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          
          <input 
            type="password" 
            placeholder="Password" 
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          
          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? 'Please wait...' : 'Login'}
          </button>
          
          <div className={styles.divider}>
            <span className={styles.dividerLine}></span>
            <span className={styles.dividerText}>OR</span>
            <span className={styles.dividerLine}></span>
          </div>
          
          <button 
            type="button" 
            onClick={handleGoogleLogin}
            className={styles.googleButton}
            disabled={loading}
          >
            <img 
              src={GOOGLE_ICON_BASE64}
              alt="Google" 
              className={styles.googleIcon} 
            />
            Continue with Google
          </button>
          
          <div className={styles.registerLink}>
            <span>Need an account? </span>
            <a href="/register">Register</a>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Login to Nexia</title>
        <meta name="description" content="Sign in to your Nexia account" />
      </Head>
      
      {/* Use the web fallback for more reliable OAuth handling */}
      {loginFallback}
      
      {/* Web-specific styles */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
} 