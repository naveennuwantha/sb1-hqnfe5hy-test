import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Linking,
  Modal,
  Share,
  Clipboard,
  Platform,
  Switch,
  // Slider, // Removed as it's not supported in react-native-web
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase, supabaseError } from '../services/supabaseClient';
import QRCode from 'react-native-qrcode-svg';
import { lightTheme, darkTheme } from '../theme/theme';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';

// Import navigation hooks safely
let useNavigation, useRoute;
if (typeof window !== 'undefined' && Platform.OS === 'web') {
  // Web environment - don't try to import navigation
  useNavigation = () => ({
    navigate: () => console.log('Navigation not available in web'),
    goBack: () => typeof window !== 'undefined' && window.history.back(),
    setOptions: () => {}
  });
  useRoute = () => ({ params: {} });
} else if (Platform.OS !== 'web') {
  // Only import these hooks in native environments
  try {
    const ReactNavigation = require('@react-navigation/native');
    useNavigation = ReactNavigation.useNavigation;
    useRoute = ReactNavigation.useRoute;
  } catch (error) {
    console.warn('React Navigation not available:', error);
    // Provide fallbacks if the imports fail
    useNavigation = () => ({
      navigate: () => console.log('Navigation not available'),
      goBack: () => console.log('Navigation not available'),
      setOptions: () => {}
    });
    useRoute = () => ({ params: {} });
  }
}

const windowWidth = Dimensions.get('window').width;

// Import digital pattern background
const digitalPatternBackground = 'https://swhcrbyvnaadvuexfjpz.supabase.co/storage/v1/object/public/assets/digital-background.jpg';

// Add more social icons to support all platforms shown in the screenshot
const socialIcons = {
  facebook: 'logo-facebook',
  twitter: 'logo-twitter',
  linkedin: 'logo-linkedin',
  github: 'logo-github',
  instagram: 'logo-instagram',
  youtube: 'logo-youtube',
  tiktok: 'logo-tiktok',
  telegram: 'paper-plane',
  website: 'globe',
};

// Add more default social links to match the screenshot
const defaultSocialLinks = {
  facebook: {
    url: 'https://facebook.com/naveennuwantha',
    enabled: true
  },
  linkedin: {
    url: 'https://linkedin.com/in/naveennuwantha',
    enabled: true
  },
  github: {
    url: 'https://github.com/naveennuwantha',
    enabled: true
  },
  twitter: {
    url: 'https://twitter.com/naveennuwantha',
    enabled: true
  },
  instagram: {
    url: 'https://instagram.com/naveennuwantha',
    enabled: true
  },
  youtube: {
    url: 'https://youtube.com/@naveennuwantha',
    enabled: true
  },
  tiktok: {
    url: 'https://tiktok.com/@naveennuwantha',
    enabled: true
  },
  telegram: {
    url: 'https://t.me/naveennuwantha',
    enabled: true
  },
  website: {
    url: 'https://naveennuwantha.lk',
    enabled: true,
    label: 'naveennuwantha'
  }
};

// Update the default avatar URL to use a generic placeholder instead of a specific profile
const defaultAvatarUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

// Create a wrapper component that uses ThemeProvider
export default function PublicProfileScreen(props) {
  return (
    <ThemeProvider>
      <PublicProfileContent {...props} />
    </ThemeProvider>
  );
}

// Create a separate ProfileImage component for better rendering
const ProfileImage = ({ profile, theme }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatarUrl);
  
  // Generate initials from name (only used as last resort)
  const getInitials = (name) => {
    if (!name) return 'NN';
    return name
      .split(' ')
      .map(word => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };
  
  // Get avatar URL from Supabase using user ID
  const getAvatarUrl = () => {
    // Check if profile exists
    if (!profile) {
      console.log('No profile data available for avatar URL');
      return defaultAvatarUrl;
    }
    
    // If profile has a valid avatar URL that starts with http, use it
    if (profile.avatar_url && profile.avatar_url.startsWith('http')) {
      // Add cache-busting timestamp to prevent using cached version
      const timestamp = new Date().getTime();
      const cacheBustedUrl = profile.avatar_url.includes('?') 
        ? `${profile.avatar_url}&_cb=${timestamp}` 
        : `${profile.avatar_url}?_cb=${timestamp}`;
      
      console.log('Using provided avatar URL with cache busting:', cacheBustedUrl);
      return cacheBustedUrl;
    }
    
    // Otherwise use the default avatar
    console.log('Falling back to default avatar');
    return defaultAvatarUrl;
  };

  // Refresh the avatar URL (can be called when needed)
  const refreshAvatarUrl = () => {
    try {
      const url = getAvatarUrl();
      console.log('Refreshing avatar URL to:', url);
      setAvatarUrl(url);
      setHasError(false);
      setIsLoading(true);
    } catch (error) {
      console.error('Error refreshing avatar URL:', error);
    }
  };

  // Set the avatar URL when the profile changes
  useEffect(() => {
    if (!profile) {
      setIsLoading(false);
      return;
    }
    
    try {
      const url = getAvatarUrl();
      console.log('Setting avatar URL to:', url);
      setAvatarUrl(url);
      
      // For web, handle loading state differently
      if (Platform.OS === 'web') {
        setIsLoading(false); // We'll handle loading state in the Image onLoad/onError events
      } else {
        // For native platforms, just set loading to false after a short delay
        setTimeout(() => setIsLoading(false), 300);
      }
    } catch (error) {
      console.error('Error setting avatar URL:', error);
      setIsLoading(false);
      setHasError(true);
    }
  }, [profile]);

  // Split-view profile image with spinner at top half
  return (
    <View style={styles.profileImageOuterContainer}>
      <View style={styles.profileImageContainer}>
        {/* Top half - Spinner section */}
        <View style={styles.profileImageTop}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <View style={styles.emptySpace} />
          )}
        </View>
        
        {/* Bottom half - Image section */}
        <View style={styles.profileImageBottom}>
          <Image
            source={{ uri: avatarUrl }}
            style={styles.profileImage}
            onLoadStart={() => Platform.OS === 'web' && setIsLoading(true)}
            onLoad={() => {
              setIsLoading(false);
              setHasError(false);
            }}
            onError={(e) => {
              console.error('Image failed to load:', e.nativeEvent?.error || 'Unknown error');
              setIsLoading(false);
              setHasError(true);
              
              // If the image failed to load and it's not the default avatar, try the default avatar
              if (avatarUrl !== defaultAvatarUrl) {
                console.log('Image load failed, falling back to default avatar');
                setAvatarUrl(defaultAvatarUrl);
              }
            }}
          />
        </View>
      </View>
    </View>
  );
};

// Main content component that uses useTheme
function PublicProfileContent(props) {
  // Use navigation from props (for web) or hooks (for native)
  const navigation = props.navigation || 
    (Platform.OS !== 'web' && typeof useNavigation === 'function' ? useNavigation() : { 
      navigate: () => console.log('Navigation not available in web'),
      goBack: () => typeof window !== 'undefined' && window.history.back(),
      setOptions: () => {}
    });
    
  const route = props.route || 
    (Platform.OS !== 'web' && typeof useRoute === 'function' ? useRoute() : { params: {} });
  
  const { userId: routeUserId } = route.params || {};
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [profileUrl, setProfileUrl] = useState('');
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [isViewingOtherProfile, setIsViewingOtherProfile] = useState(false);
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBackgroundColor, setQrBackgroundColor] = useState('#FFFFFF');
  const [activeTab, setActiveTab] = useState('basic');
  const [qrStyle, setQrStyle] = useState('dots');
  const [showLogo, setShowLogo] = useState(true);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activeQrTab, setActiveQrTab] = useState('qrcode');
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Reload profile data when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('PublicProfileScreen is focused, reloading profile data...');
    loadProfile();
      return () => {
        // cleanup if needed
      };
    }, [routeUserId])
  );

  // Validate Supabase client is available
  useEffect(() => {
    if (supabaseError) {
      console.error('Supabase client error:', supabaseError);
      setLoading(false);
      alert('Database connection error: ' + (typeof supabaseError === 'string' ? supabaseError : 'Could not connect to the database. Please check your internet connection and try again.'));
      return;
    }
    
    if (!supabase) {
      console.error('Supabase client is not initialized');
      setLoading(false);
      alert('Database connection error. Please check your internet connection and try again.');
    }
  }, []);

  useEffect(() => {
    const routeUserId = route.params?.userId;
    
    if (routeUserId) {
      setIsViewingOtherProfile(true);
      
      // Only set navigation options if navigation.setOptions exists
      if (navigation && typeof navigation.setOptions === 'function') {
        navigation.setOptions({
          headerShown: true,
          title: 'View Profile',
          headerTintColor: theme.text,
          headerStyle: {
            backgroundColor: theme.background,
          }
        });
      }
      
      loadOtherProfile(routeUserId);
    } else {
      // Only set navigation options if navigation.setOptions exists
      if (navigation && typeof navigation.setOptions === 'function') {
        navigation.setOptions({
          headerShown: false
        });
      }
      
      loadProfile();
    }
  }, [route.params?.userId, navigation, theme]);

  const handleEmailPress = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handlePhonePress = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleSocialPress = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out my profile: ${profileUrl}`,
        url: profileUrl,
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };

  const generateVCard = () => {
    try {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${profile?.full_name || 'Naveen Nuwantha'}`,
      `TEL;TYPE=CELL:${profile?.contact_info?.mobile || '0764479187'}`,
      `EMAIL:${profile?.contact_info?.email || 'naveen.nuwantha076@gmail.com'}`,
      `ADR;TYPE=WORK:;;${profile?.address?.line1 || ''};${profile?.address?.city || ''};${profile?.address?.state || ''};${profile?.address?.zipcode || ''};${profile?.address?.country || 'Sri Lanka'}`,
      'END:VCARD'
    ].join('\\n');

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        try {
          // Web implementation - create and download vCard file
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile?.full_name || 'contact'}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Error creating vCard download:', error);
          alert('Could not download contact card. Please try copying the contact information instead.');
        }
      } else {
        // Native implementation
        // On native platforms, you would typically use a share feature
        // or a file system API to save the vcard
        Share.share({
          title: `${profile?.full_name || 'Contact'} vCard`,
          message: `Contact information for ${profile?.full_name || 'Naveen Nuwantha'}: ${profile?.contact_info?.mobile || '0764479187'}, ${profile?.contact_info?.email || 'naveen.nuwantha076@gmail.com'}`,
        });
      }
    } catch (error) {
      console.error('Error generating vCard:', error);
      alert('Could not generate contact card. Please try again.');
    }
  };

  // Add a function to check if profile is empty or incomplete
  const isProfileEmpty = (profileData) => {
    if (!profileData) return true;
    
    // Check if essential data is missing
    const missingFullName = !profileData.full_name || profileData.full_name.trim() === '';
    const missingTitle = !profileData.title || profileData.title.trim() === '';
    const missingContactInfo = !profileData.contact_info || 
      Object.keys(profileData.contact_info).length === 0 ||
      (profileData.contact_info?.enabled?.length === 0);
    
    return missingFullName && missingTitle && missingContactInfo;
  };

  // Modify loadOtherProfile to handle empty profiles better
  const loadOtherProfile = async (userId) => {
    try {
      setLoading(true);
      console.log(`Loading other user's profile: ${userId}`);

      // Force reload by using custom headers to bypass Supabase caching
      const timestamp = new Date().getTime();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
        .header('x-cache-control', 'no-cache')
        .header('x-custom-timestamp', timestamp.toString());

      if (error) {
        console.error('Error fetching profile:', error.message, error.details, error.hint);
        
        // No fallback data - just show empty profile state
        setProfile({
          id: userId,
          isEmpty: true
        });
        
        // Generate a valid profile URL for empty profiles
        const baseUrl = Platform.OS === 'web' 
          ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
              ? 'http://localhost:3000'
              : 'https://nexia.naveennuwantha.lk')
          : 'nexia://';
        
        const generatedProfileUrl = Platform.OS === 'web'
          ? `${baseUrl}/viewprofile/${userId}`
          : `${baseUrl}viewprofile/${userId}`;
        
        setProfileUrl(generatedProfileUrl);
        setLoading(false);
        return;
      }

      if (data) {
        console.log('Profile data received:', data ? 'Yes' : 'No');
        
        // Check if profile is empty or incomplete
        if (isProfileEmpty(data)) {
          data.isEmpty = true;
        }
        
        // If no avatar_url in profile, add default
        if (!data.avatar_url) {
          data.avatar_url = defaultAvatarUrl;
        }
        
        setProfile(data);
        
        // Generate a profile URL for sharing
        const baseUrl = Platform.OS === 'web' 
          ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
              ? 'http://localhost:3000'
              : 'https://nexia.naveennuwantha.lk')
          : 'nexia://';
        
        // Create the profile URL for public sharing
        const generatedProfileUrl = Platform.OS === 'web'
          ? `${baseUrl}/viewprofile/${userId}`
          : `${baseUrl}viewprofile/${userId}`;
        
        console.log('Setting profile URL to:', generatedProfileUrl);
        setProfileUrl(generatedProfileUrl);
      } else {
        console.warn('No profile data found for user, using empty profile');
        // Use empty profile
        setProfile({
          id: userId,
          isEmpty: true
        });
        
        // Generate a valid profile URL
        const baseUrl = Platform.OS === 'web' 
          ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
              ? 'http://localhost:3000'
              : 'https://nexia.naveennuwantha.lk')
          : 'nexia://';
        
        const generatedProfileUrl = Platform.OS === 'web'
          ? `${baseUrl}/viewprofile/${userId}`
          : `${baseUrl}viewprofile/${userId}`;
        
        setProfileUrl(generatedProfileUrl);
      }
    } catch (error) {
      console.error('Error in loadOtherProfile:', error.message, error);
      // Don't show error to user, just use empty profile
      setProfile({
        id: userId || 'unknown',
        isEmpty: true
      });
    } finally {
      setLoading(false);
    }
  };

  async function loadProfile() {
    try {
      setLoading(true);
      console.log('Loading current user profile');
      
      // Get the current user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError.message);
        alert('Authentication error. Please try signing in again.');
        setLoading(false);
        return;
      }

      if (!authData || !authData.user) {
        console.error('No authenticated user found');
        
        // Use empty profile when not logged in
        setProfile({
          isEmpty: true
        });
        
        // Set a profile URL, safely check window
        const baseUrl = (Platform.OS === 'web' && typeof window !== 'undefined')
          ? `${window.location.origin}`
          : 'nexia://';
          
        setProfileUrl(`${baseUrl}/login`);
        setLoading(false);
        return;
      }

      const user = authData.user;
      console.log('User authenticated, id:', user.id);

      // Force refresh profile data by using a custom header to bypass Supabase caching
      const timestamp = new Date().getTime();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .header('x-cache-control', 'no-cache')
        .header('x-custom-timestamp', timestamp.toString());

      if (error) {
        console.error('Error fetching profile:', error.message, error.details);
        
        if (error.message.includes('network') || error.message.includes('fetch')) {
          alert('Network error while loading profile. Please check your connection.');
        } else {
          alert(`Error loading profile: ${error.message}`);
        }
        
        // Set empty profile
        setProfile({
          id: user.id,
          isEmpty: true
        });
        
        setLoading(false);
        return;
      }
      
      // Use profile data or create default if none exists
      let profileData = data;
      if (!profileData) {
        console.log('No profile data found, creating empty profile');
        profileData = {
          id: user.id,
          isEmpty: true
        };
      } else {
        // Check if profile is empty
        if (isProfileEmpty(profileData)) {
          profileData.isEmpty = true;
        }
        
        // Ensure profile has avatar_url, if not, set default
        if (!profileData.avatar_url) {
          profileData.avatar_url = defaultAvatarUrl;
        }
      }

      console.log('Setting profile data');
      setProfile(profileData);
      
      // Generate the shareable profile URL - handle both local and production environments
      let baseUrl = '';
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        try {
          const hostname = window.location.hostname;
          const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
          baseUrl = isLocalhost 
            ? `${window.location.protocol}//${window.location.host}`
            : 'https://nexia.naveennuwantha.lk';
    } catch (error) {
          console.error('Error determining baseUrl:', error);
          baseUrl = 'https://nexia.naveennuwantha.lk';
        }
      } else {
        baseUrl = 'https://nexia.naveennuwantha.lk';
      }
      
      // Create the full profile URL using the correct route format
      const userId = user.id;
      // Check if we're in the native app or web
      let url = '';
      
      if (Platform.OS === 'web') {
        // For web: use the viewprofile route with path parameter
        url = `${baseUrl}/viewprofile/${userId}`;
        console.log('Setting web profile URL to:', url);
      } else {
        // For native: use deep linking with the correct format
        url = `nexia://viewprofile/${userId}`;
        console.log('Setting native profile URL to:', url);
      }
      
      // Check old format for safety, but shouldn't be needed now
      if (url.includes('/public-profile/')) {
        console.warn('Detected old format URL, correcting to new format');
        url = url.replace('/public-profile/', '/viewprofile/');
      }
      
      setProfileUrl(url);
        
    } catch (error) {
      console.error('Error in loadProfile:', error.message, error);
      alert('An unexpected error occurred while loading your profile. Please try again.');
      // Set empty profile
      setProfile({
        isEmpty: true
      });
    } finally {
      setLoading(false);
    }
  }

  // When showing the QR code, double-check the URL format
  const showQRCode = () => {
    console.log('QR Code URL being used:', profileUrl);
    // Make sure we're using the latest format
    if (profileUrl.includes('/public-profile/')) {
      const userId = profileUrl.split('/public-profile/')[1];
      const correctedUrl = `${profileUrl.split('/public-profile/')[0]}/viewprofile/${userId}`;
      console.log('Correcting QR code URL from', profileUrl, 'to', correctedUrl);
      setProfileUrl(correctedUrl);
    }
    setShowQR(true);
  };

  // Function to refresh the entire profile
  const refreshProfile = () => {
    console.log('Manually refreshing profile');
    if (isViewingOtherProfile && routeUserId) {
      loadOtherProfile(routeUserId);
    } else {
      loadProfile();
    }
  };

  // Get the formatted profile data
  const formattedProfile = getFormattedProfile();
  
  // Ensure profile data is properly structured even if some fields are missing
  function getFormattedProfile() {
    if (!profile) {
      console.log('No profile data available, using empty profile');
      // Return an empty profile
      return {
        isEmpty: true
      };
    }
    
    if (profile.isEmpty) {
      return profile;
    }
    
    // Return the actual profile data with sensible defaults for missing fields
    return {
      id: profile.id || '',
      full_name: profile.full_name || '',
      title: profile.title || '',
      bio: profile.bio || '',
      avatar_url: profile.avatar_url || defaultAvatarUrl,
      contact_info: profile.contact_info || { enabled: [] },
      social_links: profile.social_links || {},
      // Add other fields as needed
    };
  }

  const renderQrCustomization = () => {
    return (
      <View style={styles.qrCustomizationContainer}>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'basic' && styles.activeTabButton]} 
            onPress={() => setActiveTab('basic')}
          >
            <Text style={[styles.tabText, activeTab === 'basic' && styles.activeTabText]}>Basic</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'style' && styles.activeTabButton]} 
            onPress={() => setActiveTab('style')}
          >
            <Text style={[styles.tabText, activeTab === 'style' && styles.activeTabText]}>Style</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'logo' && styles.activeTabButton]} 
            onPress={() => setActiveTab('logo')}
          >
            <Text style={[styles.tabText, activeTab === 'logo' && styles.activeTabText]}>Logo</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'basic' && (
          <View style={styles.tabContent}>
            <Text style={styles.settingLabel}>QR Code Colors</Text>
            <View style={styles.colorPickerRow}>
              <View style={styles.colorOption}>
                <Text style={styles.colorLabel}>Foreground Color</Text>
                <View style={styles.colorPreviewContainer}>
                  <View style={[styles.colorPreview, { backgroundColor: qrColor }]} />
                  <Text style={styles.colorValue}>{qrColor}</Text>
                </View>
                <View style={styles.colorOptions}>
                  {['#000000', '#3498db', '#e74c3c', '#2ecc71', '#f39c12'].map(color => (
                    <TouchableOpacity 
                      key={color} 
                      style={[styles.colorBox, { backgroundColor: color }, qrColor === color && styles.selectedColorBox]} 
                      onPress={() => setQrColor(color)}
                    />
                  ))}
                </View>
              </View>
              
              <View style={styles.colorOption}>
                <Text style={styles.colorLabel}>Background Color</Text>
                <View style={styles.colorPreviewContainer}>
                  <View style={[styles.colorPreview, { backgroundColor: qrBackgroundColor }]} />
                  <Text style={styles.colorValue}>{qrBackgroundColor}</Text>
                </View>
                <View style={styles.colorOptions}>
                  {['#FFFFFF', '#f8f9fa', '#e9ecef', '#dee2e6', '#F5F5F5'].map(color => (
                    <TouchableOpacity 
                      key={color} 
                      style={[styles.colorBox, { backgroundColor: color }, qrBackgroundColor === color && styles.selectedColorBox]} 
                      onPress={() => setQrBackgroundColor(color)}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'style' && (
          <View style={styles.tabContent}>
            <Text style={styles.settingLabel}>QR Code Style</Text>
            <View style={styles.qrStyleOptions}>
              <TouchableOpacity 
                style={[styles.qrStyleOption, qrStyle === 'dots' && styles.selectedQrStyle]} 
                onPress={() => setQrStyle('dots')}
              >
                <View style={styles.qrStylePreview}>
                  <Text style={styles.qrStyleIcon}>•••</Text>
                </View>
                <Text style={styles.qrStyleText}>Dots</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.qrStyleOption, qrStyle === 'squares' && styles.selectedQrStyle]} 
                onPress={() => setQrStyle('squares')}
              >
                <View style={styles.qrStylePreview}>
                  <Text style={styles.qrStyleIcon}>■■■</Text>
                </View>
                <Text style={styles.qrStyleText}>Squares</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.qrStyleOption, qrStyle === 'rounded' && styles.selectedQrStyle]} 
                onPress={() => setQrStyle('rounded')}
              >
                <View style={styles.qrStylePreview}>
                  <Text style={styles.qrStyleIcon}>◆◆◆</Text>
                </View>
                <Text style={styles.qrStyleText}>Rounded</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.settingLabel, {marginTop: 16}]}>Corner Radius</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>{cornerRadius}</Text>
              <View style={styles.cornerRadiusButtons}>
                {[0, 5, 10, 15, 20, 25].map(radius => (
                  <TouchableOpacity
                    key={radius}
                    style={[
                      styles.cornerRadiusButton,
                      cornerRadius === radius && styles.cornerRadiusButtonActive
                    ]}
                    onPress={() => setCornerRadius(radius)}
                  >
                    <Text style={[
                      styles.cornerRadiusButtonText,
                      cornerRadius === radius && styles.cornerRadiusButtonTextActive
                    ]}>
                      {radius}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {activeTab === 'logo' && (
          <View style={styles.tabContent}>
            <View style={styles.logoOption}>
              <View style={styles.switchRow}>
                <Text style={styles.settingLabel}>Show Logo</Text>
                <Switch
                  value={showLogo}
                  onValueChange={setShowLogo}
                  trackColor={{ false: "#ddd", true: "#007AFF" }}
                />
              </View>
              
              {showLogo && (
                <View style={styles.logoPreviewContainer}>
                  <Image
                    source={{ uri: formattedProfile.avatar_url }}
                    style={styles.logoPreview}
                    resizeMode="cover"
                  />
                  <Text style={styles.logoHint}>Your profile image will be used as the QR logo</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  }

  // Replace renderQrAnalytics function with a fixed version
  const renderQrAnalytics = () => {
  return (
      <View style={styles.analyticsContainer}>
        <Text style={styles.analyticsSubtitle}>Scan History</Text>
        
        <ScrollView style={styles.historyContainer}>
          {[
            { date: '2023-06-15 14:22', location: 'Colombo, Sri Lanka', device: 'iPhone 12' },
            { date: '2023-06-14 09:45', location: 'Kandy, Sri Lanka', device: 'Samsung Galaxy S21' },
            { date: '2023-06-13 16:30', location: 'Colombo, Sri Lanka', device: 'Google Pixel 6' },
            { date: '2023-06-12 11:15', location: 'Galle, Sri Lanka', device: 'iPhone 13 Pro' },
          ].map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyItemLeft}>
                <Ionicons name="scan" size={18} color="#fff" />
              </View>
              <View style={styles.historyItemRight}>
                <Text style={styles.historyDate}>{item.date}</Text>
                <View style={styles.historyDetailsRow}>
                  <View style={styles.historyDetailItem}>
                    <Ionicons name="location-outline" size={14} color="#666" />
                    <Text style={styles.historyDetailText}>{item.location}</Text>
                  </View>
                  <View style={styles.historyDetailItem}>
                    <Ionicons name="phone-portrait-outline" size={14} color="#666" />
                    <Text style={styles.historyDetailText}>{item.device}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Modify the UI to show empty profile state
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );
  }

  // Show empty profile message if profile is empty
  if (profile?.isEmpty) {
  return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.emptyProfileContainer, { backgroundColor: theme.background }]}>
          <Ionicons name="person-outline" size={80} color={theme.textSecondary} />
          <Text style={[styles.emptyProfileTitle, { color: theme.text }]}>
            Profile Not Set Up Yet
          </Text>
          <Text style={[styles.emptyProfileText, { color: theme.textSecondary }]}>
            This user hasn't completed their profile setup.
          </Text>
          
          {!isViewingOtherProfile && (
            <TouchableOpacity
              style={[styles.emptyProfileButton, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('ProfileEdit')}
            >
              <Text style={styles.emptyProfileButtonText}>Complete Your Profile</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.refreshButton, { borderColor: theme.border }]}
            onPress={refreshProfile}
          >
            <Ionicons name="refresh" size={20} color={theme.textSecondary} />
            <Text style={[styles.refreshButtonText, { color: theme.textSecondary }]}>
              Check Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.container}>
        {/* Header with digital pattern background */}
        <View style={styles.header}>
              <Image
            source={{ uri: digitalPatternBackground }} 
            style={styles.backgroundPattern}
            resizeMode="cover"
          />
          
          {/* Profile Image centered */}
          <View style={styles.profileImageWrapper}>
            <ProfileImage profile={formattedProfile} theme={theme} />
          </View>

          {/* Name and Title */}
          <View style={styles.profileInfo}>
            <Text style={styles.nameText}>{formattedProfile.full_name}</Text>
            <Text style={styles.titleText}>{formattedProfile.title}</Text>
          </View>

          {/* Quick Action Buttons */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => handlePhonePress(formattedProfile.contact_info.mobile)}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="call" size={22} color="#000" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => Linking.openURL(`sms:${formattedProfile.contact_info.mobile}`)}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="chatbubble" size={22} color="#000" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => handleEmailPress(formattedProfile.contact_info.email)}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="mail" size={22} color="#000" />
              </View>
            </TouchableOpacity>
          </View>
          </View>

          {/* About Me Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.bioText}>{formattedProfile.bio}</Text>
          
          {/* Action buttons at the bottom of About Me */}
          <View style={styles.aboutActions}>
            <TouchableOpacity style={styles.circularButton} onPress={showQRCode}>
              <Ionicons name="qr-code" size={20} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.circularButton} onPress={handleShareProfile}>
              <Ionicons name="share-social" size={20} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.addContactButton} onPress={generateVCard}>
              <Text style={styles.addContactText}>Add to Contact</Text>
              <Ionicons name="add-circle" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact Us Section */}
        <View style={styles.section}>
          <View style={styles.contactHeader}>
            <Ionicons name="phone-portrait" size={22} color="#000" />
            <Text style={styles.contactTitle}>Contact Us</Text>
          </View>
          
          {formattedProfile.contact_info.mobile && (
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>Call Us</Text>
              <Text style={styles.contactInfo}>+{formattedProfile.contact_info.mobile}</Text>
            </View>
          )}
          
          {formattedProfile.contact_info.email && (
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactInfo}>{formattedProfile.contact_info.email}</Text>
            </View>
          )}

            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>Address</Text>
            <Text style={styles.contactInfo}>Colombo, Sri Lanka</Text>
            </View>
          </View>

        {/* Social Media Section */}
        {Object.entries(formattedProfile.social_links).map(([platform, data]) => {
          if (!data.enabled) return null;
          
          // Special handling for website to display custom label
          const platformLabel = platform === 'website' ? data.label || 'naveennuwantha' : platform.charAt(0).toUpperCase() + platform.slice(1);
          
          return (
              <TouchableOpacity
                key={platform}
                style={styles.socialButton}
                onPress={() => handleSocialPress(data.url)}
              >
              <View style={[styles.socialIcon, getSocialIconStyle(platform)]}>
                <Ionicons name={socialIcons[platform] || 'globe'} size={24} color="#fff" />
          </View>
              <Text style={styles.socialText}>{platformLabel}</Text>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* QR Code Modal */}
      <Modal
        visible={showQR}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQR(false)}
      >
        <View style={styles.modalOverlayFull}>
          <View style={styles.qrChimpContainer}>
            <View style={styles.qrChimpHeader}>
              <Text style={styles.qrChimpTitle}>My Digital Business Card</Text>
              <TouchableOpacity onPress={() => setShowQR(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {/* QR Chimp Tabs */}
            <View style={styles.qrChimpTabs}>
        <TouchableOpacity 
                style={[styles.qrChimpTab, activeQrTab === 'qrcode' && styles.qrChimpTabActive]} 
                onPress={() => setActiveQrTab('qrcode')}
              >
                <Ionicons name="qr-code" size={20} color={activeQrTab === 'qrcode' ? "#007AFF" : "#666"} />
                <Text style={[styles.qrChimpTabText, activeQrTab === 'qrcode' && styles.qrChimpTabTextActive]}>
                  QR Code
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.qrChimpTab, activeQrTab === 'customize' && styles.qrChimpTabActive]} 
                onPress={() => setActiveQrTab('customize')}
              >
                <Ionicons name="color-palette" size={20} color={activeQrTab === 'customize' ? "#007AFF" : "#666"} />
                <Text style={[styles.qrChimpTabText, activeQrTab === 'customize' && styles.qrChimpTabTextActive]}>
                  Customize
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.qrChimpTab, activeQrTab === 'analytics' && styles.qrChimpTabActive]} 
                onPress={() => setActiveQrTab('analytics')}
              >
                <Ionicons name="analytics" size={20} color={activeQrTab === 'analytics' ? "#007AFF" : "#666"} />
                <Text style={[styles.qrChimpTabText, activeQrTab === 'analytics' && styles.qrChimpTabTextActive]}>
                  Analytics
                </Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.qrChimpScrollView}
              contentContainerStyle={styles.qrChimpScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {activeQrTab === 'qrcode' && (
                <View style={styles.qrChimpContent}>
                  {/* Left section - QR Code */}
                  <View style={styles.qrChimpLeft}>
                    <View style={styles.qrCodeWrapperLarge}>
            <QRCode
              value={profileUrl}
                        size={Platform.OS === 'web' && windowWidth > 768 ? 220 : 200}
                        color={qrColor}
                        backgroundColor={qrBackgroundColor}
                        ecl="H"
                        logo={showLogo ? {uri: formattedProfile.avatar_url} : undefined}
                        logoSize={Platform.OS === 'web' && windowWidth > 768 ? 50 : 40}
                        logoBackgroundColor="white"
                        logoBorderRadius={25}
                        codeStyle={qrStyle}
                        outerEyeRadius={cornerRadius}
                        innerEyeRadius={cornerRadius / 2}
                      />
                    </View>
                    
                    <Text style={styles.qrChimpScanText}>Scan to view my profile</Text>
                    <Text style={styles.qrChimpUrl} numberOfLines={1} ellipsizeMode="middle">{profileUrl}</Text>
                    <Text style={styles.qrChimpPoweredBy}>Powered by Nexia</Text>
                    
                    <View style={styles.qrChimpActions}>
              <TouchableOpacity 
                        style={styles.qrChimpButton}
                        onPress={handleShareProfile}
                      >
                        <Ionicons name="share-social-outline" size={18} color="#fff" />
                        <Text style={styles.qrChimpButtonText}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                        style={styles.qrChimpButton}
                        onPress={() => {
                          // Function to download QR code image
                          if (Platform.OS === 'web') {
                            // Web implementation
                            alert('QR code downloaded (web implementation would save the image)');
                          } else {
                            // Native implementation
                            Share.share({
                              title: 'My QR Code',
                              message: `Here's my QR code to scan my profile: ${profileUrl}`
                            });
                          }
                        }}
                      >
                        <Ionicons name="download-outline" size={18} color="#fff" />
                        <Text style={styles.qrChimpButtonText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
                  
                  {/* Preview side by side on larger screens */}
                  {Platform.OS === 'web' && windowWidth > 768 && (
                    <View style={styles.qrChimpRight}>
                      <View style={styles.qrChimpPreviewHeader}>
                        <Text style={styles.qrChimpPreviewTitle}>Profile Preview</Text>
                      </View>
                      
                      <View style={styles.qrChimpProfilePreview}>
                        {/* Profile Image */}
                        <Image 
                          source={{ uri: formattedProfile.avatar_url }} 
                          style={styles.qrChimpProfileImage} 
                          resizeMode="cover"
                        />
                        
                        {/* Profile Info */}
                        <Text style={styles.qrChimpProfileName}>{formattedProfile.full_name}</Text>
                        <Text style={styles.qrChimpProfileTitle}>{formattedProfile.title}</Text>
                        
                        {/* Contact Info */}
                        <View style={styles.qrChimpInfoItem}>
                          <Ionicons name="call-outline" size={16} color="#666" />
                          <Text style={styles.qrChimpInfoText}>+{formattedProfile.contact_info.mobile}</Text>
                        </View>
                        
                        <View style={styles.qrChimpInfoItem}>
                          <Ionicons name="mail-outline" size={16} color="#666" />
                          <Text style={styles.qrChimpInfoText}>{formattedProfile.contact_info.email}</Text>
                        </View>
                        
                        <View style={styles.qrChimpInfoItem}>
                          <Ionicons name="location-outline" size={16} color="#666" />
                          <Text style={styles.qrChimpInfoText}>Colombo, Sri Lanka</Text>
                        </View>
                        
                        {/* Social Media Icons */}
                        <View style={styles.qrChimpSocialIcons}>
                          {Object.entries(formattedProfile.social_links).map(([platform, data]) => {
                            if (!data.enabled) return null;
                            return (
                              <View 
                                key={platform}
                                style={[styles.qrChimpSocialIcon, getSocialIconStyle(platform)]}
                              >
                                <Ionicons name={socialIcons[platform] || 'globe'} size={16} color="#fff" />
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              )}
              
              {activeQrTab === 'customize' && (
                <View style={styles.qrChimpContent}>
                  {renderQrCustomization()}
                </View>
              )}
              
              {activeQrTab === 'analytics' && (
                <View style={styles.qrChimpContent}>
                  <View style={styles.qrAnalyticsContainer}>
                    <Text style={styles.qrStatsTitle}>QR Code Statistics</Text>
                    <View style={styles.qrStatsRow}>
                      <View style={styles.qrStatItem}>
                        <Text style={styles.qrStatValue}>32</Text>
                        <Text style={styles.qrStatLabel}>Total Scans</Text>
                      </View>
                      <View style={styles.qrStatItem}>
                        <Text style={styles.qrStatValue}>12</Text>
                        <Text style={styles.qrStatLabel}>Unique Visitors</Text>
                      </View>
                      <View style={styles.qrStatItem}>
                        <Text style={styles.qrStatValue}>8</Text>
                        <Text style={styles.qrStatLabel}>Today</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.analyticsSubtitle}>Recent Scans</Text>
                    
                    <View style={styles.historyContainer}>
                      {[
                        { date: '2023-06-15 14:22', location: 'Colombo, Sri Lanka', device: 'iPhone 12' },
                        { date: '2023-06-14 09:45', location: 'Kandy, Sri Lanka', device: 'Samsung Galaxy S21' },
                        { date: '2023-06-13 16:30', location: 'Colombo, Sri Lanka', device: 'Google Pixel 6' },
                        { date: '2023-06-12 11:15', location: 'Galle, Sri Lanka', device: 'iPhone 13 Pro' },
                      ].map((item, index) => (
                        <View key={index} style={styles.historyItem}>
                          <View style={styles.historyItemLeft}>
                            <Ionicons name="scan" size={18} color="#fff" />
                          </View>
                          <View style={styles.historyItemRight}>
                            <Text style={styles.historyDate}>{item.date}</Text>
                            <View style={styles.historyDetailsRow}>
                              <View style={styles.historyDetailItem}>
                                <Ionicons name="location-outline" size={14} color="#666" />
                                <Text style={styles.historyDetailText}>{item.location}</Text>
                              </View>
                              <View style={styles.historyDetailItem}>
                                <Ionicons name="phone-portrait-outline" size={14} color="#666" />
                                <Text style={styles.historyDetailText}>{item.device}</Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Helper function to get social icon background color
function getSocialIconStyle(platform) {
  const colors = {
    facebook: { backgroundColor: '#1877F2' },
    twitter: { backgroundColor: '#000' },
    instagram: { backgroundColor: '#E4405F' },
    linkedin: { backgroundColor: '#0A66C2' },
    youtube: { backgroundColor: '#FF0000' },
    github: { backgroundColor: '#333' },
    tiktok: { backgroundColor: '#000' },
    telegram: { backgroundColor: '#0088CC' },
    website: { backgroundColor: '#808080' }
  };
  
  return colors[platform] || { backgroundColor: '#007AFF' };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: 200,
    top: 0,
  },
  profileImageWrapper: {
    marginTop: 140,
    marginBottom: 20,
    zIndex: 2,
  },
  profileImageOuterContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    overflow: 'hidden',
  },
  profileImageTop: {
    width: '100%',
    height: '50%',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageBottom: {
    width: '100%',
    height: '50%',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  profileImage: {
    width: '200%',
    height: '200%',
    position: 'absolute',
    bottom: 0,
    left: '-50%',
    resizeMode: 'cover',
  },
  emptySpace: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    fontFamily: "'Poppins', sans-serif",
  },
  titleText: {
    fontSize: 16,
    color: '#8E8E93',
    fontFamily: "'Poppins', sans-serif",
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 20,
  },
  quickActionButton: {
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    fontFamily: "'Poppins', sans-serif",
  },
  bioText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: "'Poppins', sans-serif",
  },
  aboutActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 10,
    position: 'relative',
  },
  circularButton: {
    backgroundColor: '#1A1A1A',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  addContactButton: {
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    minWidth: 140,
  },
  addContactText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: "'Poppins', sans-serif",
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: "'Poppins', sans-serif",
  },
  contactItem: {
    marginBottom: 12,
  },
  contactLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontFamily: "'Poppins', sans-serif",
  },
  contactInfo: {
    fontSize: 15,
    color: '#000',
    fontFamily: "'Poppins', sans-serif",
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 15,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  socialText: {
    fontSize: 15,
    color: '#000',
    flex: 1,
    fontFamily: "'Poppins', sans-serif",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  qrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: "'Poppins', sans-serif",
  },
  qrCodeWrapper: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  qrText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    fontFamily: "'Poppins', sans-serif",
  },
  qrUrl: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
    fontFamily: "'Poppins', sans-serif",
  },
  qrShareButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    width: '100%',
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: "'Poppins', sans-serif",
  },
  modalOverlayFull: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  qrChimpContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: Platform.OS === 'web' ? (windowWidth > 768 ? '80%' : '95%') : '95%',
    maxWidth: 1000,
    maxHeight: Platform.OS === 'web' ? (windowWidth > 768 ? '90%' : '95%') : '95%',
    overflow: 'hidden',
  },
  qrChimpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  qrChimpTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: "'Poppins', sans-serif",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  qrChimpContent: {
    flexDirection: Platform.OS === 'web' && windowWidth > 768 ? 'row' : 'column',
    justifyContent: 'space-between',
    width: '100%',
  },
  qrChimpLeft: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginBottom: Platform.OS === 'web' && windowWidth > 768 ? 0 : 24,
    borderRightWidth: Platform.OS === 'web' && windowWidth > 768 ? 1 : 0,
    borderBottomWidth: Platform.OS === 'web' && windowWidth > 768 ? 0 : 1,
    borderColor: '#eee',
  },
  qrCodeWrapperLarge: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrChimpScanText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif",
  },
  qrChimpPoweredBy: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
    fontFamily: "'Poppins', sans-serif",
  },
  qrChimpActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  qrChimpButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
  },
  qrChimpButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: "'Poppins', sans-serif",
  },
  qrChimpRight: {
    flex: 1,
    padding: 16,
  },
  qrChimpPreviewHeader: {
    marginBottom: 20,
  },
  qrChimpPreviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: "'Poppins', sans-serif",
  },
  qrChimpProfilePreview: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  qrChimpProfileImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 16,
  },
  qrChimpProfileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
    fontFamily: "'Poppins', sans-serif",
  },
  qrChimpProfileTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontFamily: "'Poppins', sans-serif",
  },
  qrChimpInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  qrChimpInfoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontFamily: "'Poppins', sans-serif",
  },
  qrChimpSocialIcons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  qrChimpSocialIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  visitProfileButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  visitProfileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    fontFamily: "'Poppins', sans-serif",
  },
  qrChimpScrollView: {
    flex: 1,
  },
  qrChimpScrollContent: {
    padding: 20,
  },
  qrChimpUrl: {
    color: '#8E8E93',
    marginBottom: 20,
    fontFamily: "'Poppins', sans-serif",
  },
  qrCustomizationContainer: {
    padding: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tabButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 5,
  },
  activeTabButton: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: "'Poppins', sans-serif",
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    fontFamily: "'Poppins', sans-serif",
  },
  colorPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  colorOption: {
    flex: 1,
  },
  colorPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorPreview: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  colorValue: {
    fontSize: 16,
    color: '#333',
    fontFamily: "'Poppins', sans-serif",
  },
  colorOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 10,
  },
  selectedColorBox: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  qrStyleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  qrStyleOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 5,
  },
  selectedQrStyle: {
    backgroundColor: '#007AFF',
  },
  qrStylePreview: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginBottom: 8,
  },
  qrStyleIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: "'Poppins', sans-serif",
  },
  qrStyleText: {
    fontSize: 16,
    color: '#333',
    fontFamily: "'Poppins', sans-serif",
  },
  sliderContainer: {
    marginTop: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    fontSize: 16,
    color: '#333',
    fontFamily: "'Poppins', sans-serif",
  },
  logoOption: {
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoPreviewContainer: {
    marginBottom: 10,
  },
  logoPreview: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  logoHint: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: "'Poppins', sans-serif",
  },
  qrStatsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  qrStatsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    fontFamily: "'Poppins', sans-serif",
  },
  qrStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qrStatItem: {
    alignItems: 'center',
  },
  qrStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
    fontFamily: "'Poppins', sans-serif",
  },
  qrStatLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: "'Poppins', sans-serif",
  },
  analyticsContainer: {
    padding: 20,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  analyticsToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  analyticsToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    fontFamily: "'Poppins', sans-serif",
  },
  analyticsContent: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    fontFamily: "'Poppins', sans-serif",
  },
  chartContainer: {
    marginBottom: 20,
  },
  webChartPlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webChartText: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: "'Poppins', sans-serif",
  },
  analyticsSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    fontFamily: "'Poppins', sans-serif",
  },
  historyContainer: {
    marginTop: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  historyItemLeft: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyItemRight: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
    fontFamily: "'Poppins', sans-serif",
  },
  historyDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  historyDetailText: {
    fontSize: 14,
    color: '#666',
    fontFamily: "'Poppins', sans-serif",
  },
  historyIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrChimpTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 16,
  },
  qrChimpTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  qrChimpTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  qrChimpTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
    fontFamily: "'Poppins', sans-serif",
  },
  qrChimpTabTextActive: {
    color: '#007AFF',
  },
  qrAnalyticsContainer: {
    padding: 20,
  },
  cornerRadiusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cornerRadiusButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 5,
  },
  cornerRadiusButtonActive: {
    backgroundColor: '#007AFF',
  },
  cornerRadiusButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif",
  },
  cornerRadiusButtonTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyProfileContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyProfileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyProfileText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  emptyProfileButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginBottom: 20,
  },
  emptyProfileButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderRadius: 20,
  },
  refreshButtonText: {
    marginLeft: 8,
    fontSize: 14,
  },
}); 