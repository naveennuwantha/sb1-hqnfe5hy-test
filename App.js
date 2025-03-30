import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Linking, Platform } from 'react-native';
import { supabase } from './src/services/supabaseClient';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ContactScreen from './src/screens/ContactScreen';
import PublicProfileScreen from './src/screens/PublicProfileScreen';
import QRScreen from './src/screens/QRScreen';
import ProfileEdit from './src/screens/ProfileEdit';
import AIAssistantScreen from './src/screens/AIAssistantScreen';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { lightTheme, darkTheme } from './src/theme/theme';

const Stack = createNativeStackNavigator();

// Configure deep linking
const linking = {
  prefixes: ['https://nexia.naveennuwantha.lk', 'nexia://', 'exp://'],
  config: {
    screens: {
      PublicProfile: {
        path: 'viewprofile/:userId',
        parse: {
          userId: (userId) => userId,
        },
      },
      // Support for QR codes with query params
      QR: {
        path: 'qr',
        parse: {
          id: (id) => id,
        },
      },
      // Legacy public-profile path for backward compatibility
      LegacyProfile: {
        path: 'public-profile/:userId',
        parse: {
          userId: (userId) => userId,
        },
        // Map this screen to PublicProfile
        screens: {
          PublicProfile: {
            path: '',
          },
        },
      },
      Login: 'login',
      AIAssistant: 'ai-assistant',
      Contact: 'contact',
      ProfileEdit: 'profile-edit',
    },
  },
};

function AppContent() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: theme.background 
      }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <NavigationContainer 
        theme={{
          colors: {
            background: theme.background,
            card: theme.cardBackground,
            text: theme.text,
            border: theme.border,
            primary: theme.primary,
          }
        }}
        linking={linking}
        fallback={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        }
      >
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <Stack.Navigator 
          initialRouteName={user ? "QR" : "Login"}
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.headerBackground,
            },
            headerTintColor: theme.headerText,
            headerTitleStyle: {
              fontWeight: 'bold',
              color: theme.headerText,
            },
            contentStyle: {
              backgroundColor: theme.background,
            },
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="QR" 
            component={QRScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AIAssistant" 
            component={AIAssistantScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Contact" 
            component={ContactScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="PublicProfile" 
            component={PublicProfileScreen}
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="ProfileEdit" 
            component={ProfileEdit}
            options={{
              headerShown: false
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
} 