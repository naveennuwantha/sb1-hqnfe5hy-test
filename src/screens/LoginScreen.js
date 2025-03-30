import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { signIn, signUp, supabase } from '../services/supabaseClient';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/theme';

// Google icon as base64 encoded SVG
const GOOGLE_ICON_BASE64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTcuNiA5LjJsLS4xLTEuOEg5djMuNGg0LjhDMTMuNiAxMiAxMyAxMyAxMiAxMy42djIuMmgzYTguOCA4LjggMCAwIDAgMi42LTYuNnoiIGZpbGw9IiM0Mjg1RjQiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGQ9Ik05IDE4YzIuNCAwIDQuNS0uOCA2LTIuMmwtMy0yLjJhNS40IDUuNCAwIDAgMS04LTIuOUgxVjEzYTkgOSAwIDAgMCA4IDV6IiBmaWxsPSIjMzRBODUzIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNNCAxMC43YTUuNCA1LjQgMCAwIDEgMC0zLjRWNUgxYTkgOSAwIDAgMCAwIDhsMy0yLjN6IiBmaWxsPSIjRkJCQzA1IiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNOSAzLjZjMS4zIDAgMi41LjQgMy40IDEuM0wxNSAyLjNBOSA5IDAgMCAwIDEgNWwzIDIuNGE1LjQgNS40IDAgMCAxIDUtMy43eiIgZmlsbD0iI0VBNDMzNSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZD0iTTAgMGgxOHYxOEgweiIvPjwvZz48L3N2Zz4=';

export default function LoginScreen({ navigation, googleLoginEnabled = true, isInitiallyLogin = true }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(isInitiallyLogin);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const googleAuthInProgress = useRef(false);

  // Troubleshooting log
  useEffect(() => {
    console.log('LoginScreen rendered with isInitiallyLogin:', isInitiallyLogin);
    console.log('Using theme:', isDarkMode ? 'dark' : 'light');
  }, [isInitiallyLogin, isDarkMode]);

  const validateForm = () => {
    if (!email || !password) {
      Alert.alert(
        'Missing Information',
        'Please fill in all fields to continue.',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address.',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (password.length < 6) {
      Alert.alert(
        'Invalid Password',
        'Password must be at least 6 characters long.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data, error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          Alert.alert(
            'Email Not Verified',
            'Please check your email and click the verification link to complete your registration.',
            [{ text: 'OK' }]
          );
        } else if (error.message.includes('Invalid login credentials')) {
          Alert.alert(
            'Login Failed',
            'Invalid email or password. Please try again.',
            [{ text: 'OK' }]
          );
        } else {
          throw error;
        }
        return;
      }

      if (data) {
        if (isLogin) {
          // Check if navigation exists (web doesn't have it)
          if (navigation && navigation.replace) {
            navigation.replace('QR');
          } else {
            // For web, redirect to home
            if (typeof window !== 'undefined') {
              window.location.href = '/';
            }
          }
        } else {
          Alert.alert(
            'Registration Successful',
            'Please check your email for a verification link. You will need to verify your email before logging in.',
            [{ text: 'OK', onPress: () => setIsLogin(true) }]
          );
        }
      }
    } catch (error) {
      Alert.alert(
        isLogin ? 'Login Error' : 'Registration Error',
        error.message || 'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (googleAuthInProgress.current) {
      console.log('Google auth already in progress, ignoring duplicate request');
      return;
    }
    
    try {
      setLoading(true);
      googleAuthInProgress.current = true;
      console.log('Attempting Google login/signup');
      
      // If running in web browser
      if (typeof window !== 'undefined') {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + (isLogin ? '/' : '/login?registered=true')
          }
        });
        
        if (error) throw error;
        console.log('Google auth initiated:', data);
      } else {
        // For mobile (requires additional configuration)
        // Mobile app needs to handle this with deep linking
        Alert.alert(
          'Google Login',
          'Please sign in using Google on the web version or use email/password for the app.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Google auth error:', error);
      Alert.alert(
        isLogin ? 'Google Login Error' : 'Google Registration Error',
        error.message || 'An error occurred during Google authentication',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      // Reset the flag after a delay to prevent immediate retries
      setTimeout(() => {
        googleAuthInProgress.current = false;
      }, 2000);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Text style={[styles.nexiaLogo, { color: theme.primary }]}>NEXIA</Text>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder,
                color: theme.inputText,
              }
            ]}
            placeholder="Email"
            placeholderTextColor={theme.inputPlaceholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder,
                color: theme.inputText,
              }
            ]}
            placeholder="Password"
            placeholderTextColor={theme.inputPlaceholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: theme.buttonPrimary },
              loading && styles.buttonDisabled
            ]}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: theme.buttonPrimaryText }]}>
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
            </Text>
          </TouchableOpacity>

          {/* Google login button - always show it */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.divider || '#3d3d3d' }]} />
            <Text style={[styles.dividerText, { color: theme.textSecondary || '#808080' }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.divider || '#3d3d3d' }]} />
          </View>
          
          <TouchableOpacity
            style={[
              styles.googleButton,
              { 
                borderColor: theme.divider || '#3d3d3d', 
                borderWidth: 1,
                backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff'
              },
              loading && styles.buttonDisabled
            ]}
            onPress={handleGoogleLogin}
            disabled={loading || googleAuthInProgress.current}
          >
            <Image 
              source={{ uri: GOOGLE_ICON_BASE64 }}
              style={styles.googleIcon}
            />
            <Text style={[styles.googleButtonText, { color: theme.text }]}>
              {isLogin ? 'Continue with Google' : 'Sign up with Google'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsLogin(!isLogin)}
            disabled={loading}
          >
            <Text style={[styles.switchText, { color: theme.primary }]}>
              {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  nexiaLogo: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
    letterSpacing: 2,
    fontFamily: Platform.select({
      ios: 'Helvetica Neue',
      android: 'sans-serif-medium',
      default: 'System'
    }),
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 10,
    fontSize: 14,
  },
  googleButton: {
    height: 50,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 