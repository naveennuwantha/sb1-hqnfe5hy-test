import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/theme';

export default function ContactScreen() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            user_id: user.id,
            subject: subject.trim(),
            message: message.trim(),
            status: 'pending',
          },
        ]);

      if (error) throw error;

      Alert.alert(
        'Success',
        'Your message has been sent successfully. We will get back to you soon.',
        [{ text: 'OK', onPress: () => {
          setSubject('');
          setMessage('');
        }}]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={[styles.scrollView, { backgroundColor: theme.background }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <Text style={[styles.title, { color: theme.text }]}>Contact Us</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Have a question or feedback? We'd love to hear from you.
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.text }]}>Subject</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
                  <Ionicons name="create-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={subject}
                    onChangeText={setSubject}
                    placeholder="Enter subject"
                    placeholderTextColor={theme.textSecondary}
                    maxLength={100}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.text }]}>Message</Text>
                <View style={[
                  styles.inputWrapper, 
                  styles.messageWrapper, 
                  { backgroundColor: theme.inputBackground, borderColor: theme.border }
                ]}>
                  <Ionicons name="chatbubble-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.messageInput, { color: theme.text }]}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Type your message here..."
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    numberOfLines={6}
                    maxLength={1000}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Send Message</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.contactInfoCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.contactTitle, { color: theme.text }]}>Other Ways to Reach Us</Text>
            
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={22} color={theme.primary} style={styles.contactIcon} />
              <Text style={[styles.contactText, { color: theme.text }]}>support@nexia.com</Text>
            </View>
            
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={22} color={theme.primary} style={styles.contactIcon} />
              <Text style={[styles.contactText, { color: theme.text }]}>+1 (555) 123-4567</Text>
            </View>
            
            <View style={styles.contactItem}>
              <Ionicons name="time-outline" size={22} color={theme.primary} style={styles.contactIcon} />
              <Text style={[styles.contactText, { color: theme.text }]}>
                Monday - Friday, 9:00 AM - 5:00 PM EST
              </Text>
            </View>
            
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={22} color={theme.primary} style={styles.contactIcon} />
              <Text style={[styles.contactText, { color: theme.text }]}>
                123 Innovation Drive, Tech Valley, CA 94043
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  heroSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
  },
  messageWrapper: {
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  messageInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#0066FF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#99c2ff',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactIcon: {
    marginRight: 12,
  },
  contactText: {
    fontSize: 16,
    flex: 1,
  },
}); 