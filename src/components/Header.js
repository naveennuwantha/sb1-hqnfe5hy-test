import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../services/supabaseClient';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/theme';
import { useResponsive } from '../hooks/useResponsive';
import { normalize, responsiveSpacing } from '../utils/responsive';

export default function Header() {
  const navigation = useNavigation();
  const route = useRoute();
  const [showDropdown, setShowDropdown] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { isPhone, isTablet } = useResponsive();
  const windowWidth = Dimensions.get('window').width;
  const profileButtonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  // Calculate responsive sizes
  const getResponsiveSizes = () => {
    // Base sizes for different device widths
    if (windowWidth < 360) { // Small phones
      return {
        iconSize: 20,
        buttonSize: 36,
        fontSize: 20,
        padding: 12,
      };
    } else if (windowWidth < 400) { // Medium phones
      return {
        iconSize: 22,
        buttonSize: 38,
        fontSize: 22,
        padding: 14,
      };
    } else if (windowWidth < 600) { // Large phones
      return {
        iconSize: 24,
        buttonSize: 40,
        fontSize: 24,
        padding: 16,
      };
    } else if (windowWidth < 960) { // Tablets
      return {
        iconSize: 26,
        buttonSize: 44,
        fontSize: 26,
        padding: 18,
      };
    } else { // Large tablets and desktop
      return {
        iconSize: 28,
        buttonSize: 48,
        fontSize: 28,
        padding: 20,
      };
    }
  };

  const sizes = getResponsiveSizes();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: sizes.padding,
      paddingVertical: sizes.padding * 0.8,
      backgroundColor: theme.headerBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    leftButton: {
      width: sizes.buttonSize,
      height: sizes.buttonSize,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: Math.round(sizes.buttonSize * 0.2),
    },
    titleContainer: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: sizes.padding,
    },
    title: {
      fontSize: sizes.fontSize,
      fontWeight: '700',
      color: '#0066FF',
      letterSpacing: Math.round(sizes.fontSize * 0.08),
      textAlign: 'center',
    },
    rightButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Math.round(sizes.padding * 0.75),
    },
    iconButton: {
      width: sizes.buttonSize,
      height: sizes.buttonSize,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: Math.round(sizes.buttonSize * 0.2),
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    dropdownContent: {
      position: 'absolute',
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      width: Math.min(280, windowWidth * 0.7),
      zIndex: 1000,
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Math.min(14, windowWidth * 0.035),
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    dropdownText: {
      marginLeft: 12,
      fontSize: Math.min(16, windowWidth * 0.04),
      fontWeight: '500',
      color: theme.text,
    },
    signOutText: {
      marginLeft: 12,
      fontSize: Math.min(16, windowWidth * 0.04),
      fontWeight: '500',
      color: '#FF3B30',
    },
    divider: {
      height: 1,
      marginVertical: 8,
    },
  });

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigation.replace('Login');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const showDropdownMenu = () => {
    profileButtonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setDropdownPosition({
        top: pageY + height + 8,
        right: windowWidth - (pageX + width),
      });
      setShowDropdown(true);
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.leftButton}
        onPress={() => navigation.navigate('AIAssistant')}
      >
        <Ionicons 
          name="chatbubble-ellipses-outline" 
          size={sizes.iconSize}
          color="#0066FF"
        />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>NEXIA</Text>
      </View>

      <View style={styles.rightButtons}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={toggleTheme}
        >
          <Ionicons 
            name={isDarkMode ? 'sunny' : 'sunny'} 
            size={sizes.iconSize}
            color="#0066FF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          ref={profileButtonRef}
          style={styles.iconButton}
          onPress={showDropdownMenu}
        >
          <Ionicons 
            name="person-outline" 
            size={sizes.iconSize}
            color="#0066FF"
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View 
            style={[
              styles.dropdownContent,
              {
                top: dropdownPosition.top,
                right: dropdownPosition.right,
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => {
                setShowDropdown(false);
                if (route.name !== 'QR') {
                  navigation.navigate('QR');
                }
              }}
            >
              <Ionicons name="home-outline" size={Math.min(20, windowWidth * 0.05)} color={theme.text} />
              <Text style={styles.dropdownText}>Home</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={async () => {
                setShowDropdown(false);
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                  navigation.navigate('PublicProfile', { userId: user.id });
                }
              }}
            >
              <Ionicons name="person-outline" size={Math.min(20, windowWidth * 0.05)} color={theme.text} />
              <Text style={styles.dropdownText}>View Public Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => {
                setShowDropdown(false);
                navigation.navigate('ProfileEdit');
              }}
            >
              <Ionicons name="create-outline" size={Math.min(20, windowWidth * 0.05)} color={theme.text} />
              <Text style={styles.dropdownText}>Edit Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => {
                setShowDropdown(false);
                navigation.navigate('Contact');
              }}
            >
              <Ionicons name="mail-outline" size={Math.min(20, windowWidth * 0.05)} color={theme.text} />
              <Text style={styles.dropdownText}>Contact Us</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.dropdownItem, { borderBottomWidth: 0 }]}
              onPress={handleSignOut}
            >
              <Ionicons name="log-out-outline" size={Math.min(20, windowWidth * 0.05)} color="#FF3B30" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
} 