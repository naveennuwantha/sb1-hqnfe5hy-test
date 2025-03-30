import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  SafeAreaView,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Animated,
  Dimensions,
  ActivityIndicator,
  Modal,
  Linking,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabaseClient';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/theme';

// Camera is only imported for native platforms
let Camera;
if (Platform.OS !== 'web') {
  // Dynamically import camera to avoid errors on web
  try {
    const ExpoCamera = require('expo-camera');
    Camera = ExpoCamera.Camera;
  } catch (error) {
    console.warn('expo-camera not available');
  }
}

export default function QRScreen() {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [userProfile, setUserProfile] = useState(null);
  const [qrValue, setQrValue] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  
  // QR Scanner state
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  useEffect(() => {
    getUserProfile();
  }, []);

  const requestCameraPermission = async () => {
    try {
      // Use BarCodeScanner permissions for both web and native
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status === 'granted') {
        setScanning(true);
      } else {
        Alert.alert(
          'Camera Permission',
          'Camera permission is required to scan QR codes',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert(
        'Camera Error',
        'There was a problem accessing your camera. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const getPublicShareUrl = (userId) => {
    let baseUrl = '';
    
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      baseUrl = isLocalhost 
        ? `${window.location.protocol}//${window.location.host}`
        : 'https://nexia.naveennuwantha.lk';
    } else {
      baseUrl = 'https://nexia.naveennuwantha.lk';
    }
    
    // Use viewprofile route with path parameter
    return `${baseUrl}/viewprofile/${userId}`;
  };

  const getUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserProfile(profile);
        
        // Generate the public profile URL
        const publicUrl = getPublicShareUrl(user.id);
        setProfileUrl(publicUrl);
        setQrValue(publicUrl);
        
        // Save URL to profile if it doesn't exist
        if (!profile.public_profile_url) {
          await supabase
            .from('profiles')
            .update({ 
              public_profile_url: publicUrl,
              is_public_profile: true
            })
            .eq('id', user.id);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      Alert.alert('Error', 'Failed to load user profile');
    }
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScannedData(data);
    setScanning(false);
    
    // Check if scanned data is a valid URL
    try {
      console.log('Scanned data:', data);
      
      // Support the viewprofile path format
      if (data.includes('/viewprofile/')) {
        const parts = data.split('/');
        const userId = parts[parts.length - 1];
        
        if (userId) {
          console.log('Redirecting to profile with userId:', userId);
          navigation.navigate('PublicProfile', { userId });
        } else {
          Alert.alert('Invalid QR Code', 'This QR code does not contain a valid profile ID');
        }
      } 
      // Support the legacy public-profile path format
      else if (data.includes('/public-profile/')) {
        const parts = data.split('/');
        const userId = parts[parts.length - 1];
        
        if (userId) {
          console.log('Redirecting to profile with userId (legacy format):', userId);
          navigation.navigate('PublicProfile', { userId });
        } else {
          Alert.alert('Invalid QR Code', 'This QR code does not contain a valid profile ID');
        }
      }
      // Support deep links for native apps
      else if (data.includes('nexia://viewprofile/') || data.includes('nexia://public-profile/')) {
        const parts = data.split('/');
        const userId = parts[parts.length - 1];
        
        if (userId) {
          console.log('Redirecting to profile with userId (deep link):', userId);
          navigation.navigate('PublicProfile', { userId });
        } else {
          Alert.alert('Invalid QR Code', 'This QR code does not contain a valid profile ID');
        }
      } 
      // For other URLs, try to open them
      else {
        Alert.alert(
          'QR Code Scanned',
          `The scanned QR code contains: ${data}`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open', 
              onPress: () => Linking.openURL(data).catch(err => {
                Alert.alert('Error', 'Could not open the URL');
              })
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error handling QR code:', error);
      Alert.alert('Error', 'Invalid QR code format');
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out my Nexia profile: ${profileUrl}`,
        url: profileUrl,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share profile link');
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getUserProfile();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Simplified responsive sizing
  const getResponsiveSize = () => {
    const baseSize = Math.min(windowWidth, windowHeight) * 0.12;
    return {
      buttonSize: Math.max(40, Math.min(56, baseSize)),
      iconSize: Math.max(20, Math.min(28, baseSize * 0.5)),
      bottom: Math.max(70, Math.min(100, windowHeight * 0.1)),
    };
  };

  const responsiveSize = getResponsiveSize();

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const screenHeight = event.nativeEvent.layoutMeasurement.height;
    
    // Show button when scrolled 15% of screen height
    const scrollThreshold = screenHeight * 0.15;
    setShowScrollTop(offsetY > scrollThreshold);
  };

  const renderScanner = () => {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={scanning}
        onRequestClose={() => {
          setScanning(false);
        }}
      >
        <View style={styles.scannerContainer}>
          <BarCodeScanner
            onBarCodeScanned={handleBarCodeScanned}
            style={styles.scanner}
          >
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerGuide} />
              <Text style={styles.scannerText}>
                Position the QR code within the frame to scan
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setScanning(false)}
              >
                <Ionicons name="close" size={30} color="#fff" />
              </TouchableOpacity>
            </View>
          </BarCodeScanner>
        </View>
      </Modal>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 20,
    },
    qrContainer: {
      flex: 1,
      alignItems: 'center',
      padding: 20,
      borderRadius: 20,
      marginBottom: 16,
    },
    qrWrapper: {
      padding: 20,
      borderRadius: 20,
      borderWidth: 1,
      marginBottom: 20,
    },
    qrTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
      color: theme.text,
    },
    qrSubtitle: {
      fontSize: 14,
      marginBottom: 20,
      textAlign: 'center',
      color: theme.textSecondary || '#999',
    },
    profileUrl: {
      fontSize: 14,
      color: theme.textSecondary || '#999',
      marginTop: 10,
      marginBottom: 20,
      textAlign: 'center',
      padding: 10,
      backgroundColor: theme.cardBackground || '#222',
      borderRadius: 10,
    },
    buttonsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      width: '100%',
      gap: 10,
      marginBottom: 20,
    },
    shareButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 25,
      flex: 1,
      justifyContent: 'center',
    },
    scanButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 25,
      flex: 1,
      justifyContent: 'center',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    scrollTopButton: {
      position: 'absolute',
      right: Math.max(16, windowWidth * 0.04),
      bottom: responsiveSize.bottom,
      width: responsiveSize.buttonSize,
      height: responsiveSize.buttonSize,
      borderRadius: responsiveSize.buttonSize / 2,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      opacity: 0.9,
      transform: [{ scale: showScrollTop ? 1 : 0 }],
    },
    scannerContainer: {
      flex: 1,
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 1000,
    },
    scanner: {
      flex: 1,
    },
    scannerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: 20,
    },
    closeButton: {
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: 15,
      borderRadius: 50,
      marginBottom: 50,
    },
    scannerGuide: {
      position: 'absolute',
      top: '40%',
      alignSelf: 'center',
      width: 200,
      height: 200,
      borderWidth: 2,
      borderColor: '#fff',
      borderRadius: 10,
      backgroundColor: 'transparent',
    },
    scannerText: {
      color: '#fff',
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: 10,
      borderRadius: 10,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.qrContainer}>
            <Text style={styles.qrTitle}>Your Nexia Profile QR Code</Text>
            <Text style={styles.qrSubtitle}>
              Scan this code to view and save your public profile
            </Text>
            
            <View style={[styles.qrWrapper, { borderColor: theme.border || '#333' }]}>
              {qrValue ? (
                <QRCode
                  value={qrValue}
                  size={250}
                  color={theme.text || '#fff'}
                  backgroundColor={theme.background || '#000'}
                />
              ) : (
                <ActivityIndicator size="large" color={theme.primary || '#007AFF'} />
              )}
            </View>

            {profileUrl && (
              <Text style={styles.profileUrl} numberOfLines={2} ellipsizeMode="middle">
                {profileUrl}
              </Text>
            )}

            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[styles.shareButton, { backgroundColor: theme.primary || '#007AFF' }]}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={24} color="#fff" />
                <Text style={[styles.buttonText, { color: '#fff' }]}>
                  Share
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.scanButton, { backgroundColor: theme.primary || '#007AFF' }]}
                onPress={requestCameraPermission}
              >
                <Ionicons name="scan-outline" size={24} color="#fff" />
                <Text style={[styles.buttonText, { color: '#fff' }]}>
                  Scan
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {showScrollTop && (
          <TouchableOpacity
            style={[styles.scrollTopButton, { backgroundColor: theme.primary || '#007AFF' }]}
            onPress={() => {
              scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }}
          >
            <Ionicons 
              name="arrow-up" 
              size={responsiveSize.iconSize} 
              color="#fff" 
            />
          </TouchableOpacity>
        )}
        
        {/* QR Scanner Modal */}
        {scanning && renderScanner()}
      </KeyboardAvoidingView>
      <Footer />
    </SafeAreaView>
  );
} 