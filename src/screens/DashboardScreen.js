import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { supabase } from '../services/supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Container, Row, Col } from '../components/Grid';
import { useResponsive } from '../hooks/useResponsive';
import { normalize, responsiveSpacing } from '../utils/responsive';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/theme';

export default function DashboardScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isPhone, isTablet } = useResponsive();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error.message);
    } finally {
      setLoading(false);
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
    },
    section: {
      backgroundColor: theme.cardBackground,
      borderRadius: responsiveSpacing(12),
      padding: responsiveSpacing(16),
      marginBottom: responsiveSpacing(16),
    },
    sectionTitle: {
      fontSize: normalize(isPhone ? 18 : 20),
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: responsiveSpacing(12),
    },
    card: {
      backgroundColor: theme.cardBackground,
      borderRadius: responsiveSpacing(8),
      padding: responsiveSpacing(16),
      marginBottom: responsiveSpacing(16),
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    cardTitle: {
      fontSize: normalize(isPhone ? 16 : 18),
      fontWeight: '600',
      color: theme.text,
      marginBottom: responsiveSpacing(8),
    },
    cardText: {
      fontSize: normalize(14),
      color: theme.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      <Header profileImage={profile?.avatar_url} />
      <ScrollView style={styles.content}>
        <Container>
          <Row spacing={16}>
            <Col size={isPhone ? 12 : 6}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Profile</Text>
                  <Text style={styles.cardText}>View and edit your profile information</Text>
                </View>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Learning</Text>
                  <Text style={styles.cardText}>Access your learning materials and progress</Text>
                </View>
              </View>
            </Col>
            <Col size={isPhone ? 12 : 6}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Latest Updates</Text>
                  <Text style={styles.cardText}>Check your recent activities and notifications</Text>
                </View>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Progress</Text>
                  <Text style={styles.cardText}>Track your learning progress</Text>
                </View>
              </View>
            </Col>
          </Row>
        </Container>
      </ScrollView>
      <Footer />
    </View>
  );
} 