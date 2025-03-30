import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/theme';
import { useResponsive } from '../hooks/useResponsive';
import { normalize } from '../utils/responsive';

export default function Footer() {
  const navigation = useNavigation();
  const route = useRoute();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { isPhone } = useResponsive();
  const windowWidth = Dimensions.get('window').width;

  // Calculate responsive sizes
  const getResponsiveSizes = () => {
    if (windowWidth < 360) { // Small phones
      return {
        iconSize: 20,
        fontSize: 10,
        height: 55,
      };
    } else if (windowWidth < 400) { // Medium phones
      return {
        iconSize: 22,
        fontSize: 11,
        height: 60,
      };
    } else if (windowWidth < 600) { // Large phones
      return {
        iconSize: 24,
        fontSize: 12,
        height: 65,
      };
    } else if (windowWidth < 960) { // Tablets
      return {
        iconSize: 26,
        fontSize: 13,
        height: 70,
      };
    } else { // Large tablets and desktop
      return {
        iconSize: 28,
        fontSize: 14,
        height: 75,
      };
    }
  };

  const sizes = getResponsiveSizes();

  const isActive = (routeName) => {
    return route.name === routeName;
  };

  const styles = StyleSheet.create({
    safeArea: {
      backgroundColor: theme.tabBackground,
    },
    container: {
      flexDirection: 'row',
      height: sizes.height,
      borderTopWidth: 1,
      borderTopColor: theme.tabBorder,
      backgroundColor: theme.tabBackground,
      paddingBottom: Platform.OS === 'ios' ? 20 : 8,
      ...Platform.select({
        ios: {
          shadowColor: theme.cardShadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    tab: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 8,
    },
    activeTab: {
      borderTopWidth: 2,
      paddingTop: 6,
    },
    tabContent: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabText: {
      fontSize: sizes.fontSize,
      marginTop: 4,
      fontWeight: '500',
    },
    indicator: {
      position: 'absolute',
      top: 0,
      height: 2,
      width: '100%',
      backgroundColor: '#0066FF',
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity
          style={[
            styles.tab,
            isActive('Social') && styles.activeTab
          ]}
          onPress={() => navigation.navigate('Social')}
        >
          <View style={styles.tabContent}>
            <Ionicons
              name={isActive('Social') ? 'people' : 'people-outline'}
              size={sizes.iconSize}
              color={isActive('Social') ? '#0066FF' : theme.tabInactiveText}
            />
            <Text style={[
              styles.tabText,
              { color: isActive('Social') ? '#0066FF' : theme.tabInactiveText }
            ]}>
              Social
            </Text>
            {isActive('Social') && <View style={styles.indicator} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            isActive('QR') && styles.activeTab
          ]}
          onPress={() => navigation.navigate('QR')}
        >
          <View style={styles.tabContent}>
            <Ionicons
              name={isActive('QR') ? 'qr-code' : 'qr-code-outline'}
              size={sizes.iconSize}
              color={isActive('QR') ? '#0066FF' : theme.tabInactiveText}
            />
            <Text style={[
              styles.tabText,
              { color: isActive('QR') ? '#0066FF' : theme.tabInactiveText }
            ]}>
              QR Code
            </Text>
            {isActive('QR') && <View style={styles.indicator} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            isActive('Learning') && styles.activeTab
          ]}
          onPress={() => navigation.navigate('Learning')}
        >
          <View style={styles.tabContent}>
            <Ionicons
              name={isActive('Learning') ? 'book' : 'book-outline'}
              size={sizes.iconSize}
              color={isActive('Learning') ? '#0066FF' : theme.tabInactiveText}
            />
            <Text style={[
              styles.tabText,
              { color: isActive('Learning') ? '#0066FF' : theme.tabInactiveText }
            ]}>
              Learning
            </Text>
            {isActive('Learning') && <View style={styles.indicator} />}
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
} 