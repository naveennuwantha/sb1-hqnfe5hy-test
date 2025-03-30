import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Platform,
  ActivityIndicator,
  Switch,
  Modal,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ProfileEdit() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [sections, setSections] = useState({
    profile: true,
    heading: true,
    contact: true,
    social: true
  });
  const [profile, setProfile] = useState({
    username: '',
    full_name: '',
    title: '',
    bio: '',
    heading: [],
    contact_info: {
      mobile: '',
      email: '',
      sms: '',
      enabled: []
    },
    address: {
      label: '',
      line1: '',
      city: '',
      state: '',
      country: '',
      zipcode: '',
      map_url: ''
    },
    social_links: {
      facebook: { url: '', enabled: true },
      instagram: { url: '', enabled: true },
      twitter: { url: '', enabled: true },
      linkedin: { url: '', enabled: true },
      github: { url: '', enabled: true },
      website: { url: '', enabled: true }
    },
    custom_sections: [],
    avatar_url: null,
    cover_url: null,
    is_public_profile: true
  });
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const socialPlatforms = [
    { id: 'facebook', name: 'Facebook', icon: 'logo-facebook' },
    { id: 'instagram', name: 'Instagram', icon: 'logo-instagram' },
    { id: 'twitter', name: 'Twitter', icon: 'logo-twitter' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'logo-linkedin' },
    { id: 'youtube', name: 'YouTube', icon: 'logo-youtube' },
    { id: 'github', name: 'GitHub', icon: 'logo-github' },
    { id: 'pinterest', name: 'Pinterest', icon: 'logo-pinterest' },
    { id: 'tiktok', name: 'TikTok', icon: 'logo-tiktok' },
    { id: 'snapchat', name: 'Snapchat', icon: 'logo-snapchat' },
    { id: 'whatsapp', name: 'WhatsApp', icon: 'logo-whatsapp' },
  ];

  useEffect(() => {
    loadProfile();
    requestMediaLibraryPermission();
  }, []);

  async function requestMediaLibraryPermission() {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
      }
    }
  }

  async function loadProfile() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      // First check if the profile exists
      const { data: countData, error: countError } = await supabase
        .from('profiles')
        .select('count')
        .eq('id', user.id);
        
      if (countError) {
        console.error('Error checking profile existence:', countError);
        throw countError;
      }
      
      const profileExists = countData && countData.length > 0 && countData[0].count > 0;
      
      if (!profileExists) {
        // Create a default profile if it doesn't exist
        console.log('Profile does not exist. Creating default profile.');
        const defaultProfile = {
          id: user.id,
          username: '',
          full_name: user.user_metadata?.full_name || '',
          title: '',
          bio: '',
          heading: [],
          contact_info: {
            mobile: user.user_metadata?.phone || '',
            email: user.email || '',
            enabled: ['email']
          },
          social_links: {
            facebook: { url: '', enabled: true },
            instagram: { url: '', enabled: true },
            twitter: { url: '', enabled: true },
            linkedin: { url: '', enabled: true },
            github: { url: '', enabled: true },
            website: { url: '', enabled: true }
          },
          is_public_profile: true,
          updated_at: new Date().toISOString()
        };
        
        // Insert the default profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([defaultProfile]);
          
        if (insertError) {
          console.error('Error creating default profile:', insertError);
          throw insertError;
        }
        
        setProfile(defaultProfile);
        return;
      }

      // Now get the profile safely
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        console.log('Loaded profile:', data[0]);
        setProfile(data[0]);
      } else {
        console.log('No profile data found after checking existence');
      }
    } catch (error) {
      console.error('Error loading profile:', error.message);
      Alert.alert('Error', 'Failed to load profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  const toggleSection = (section) => {
    setSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const pickImage = async (type = 'avatar') => {
    try {
      setImageLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'avatar' ? [1, 1] : [16, 9],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const base64Image = asset.base64;
        
        if (!base64Image) {
          throw new Error('No image data received');
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        const fileName = `${user.id}/${Date.now()}_${type}.jpg`;
        const byteCharacters = atob(base64Image);
        const byteArray = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, byteArray, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        const updateField = type === 'avatar' ? 'avatar_url' : 'cover_url';
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ [updateField]: publicUrl })
          .eq('id', user.id);

        if (updateError) throw updateError;

        setProfile(prev => ({ ...prev, [updateField]: publicUrl }));
        Alert.alert('Success', `${type === 'avatar' ? 'Profile' : 'Cover'} picture updated`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to upload image: ${error.message}`);
    } finally {
      setImageLoading(false);
    }
  };

  const renderToggleSection = (title, section) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Switch
        value={sections[section]}
        onValueChange={() => toggleSection(section)}
        trackColor={{ false: '#ddd', true: '#FFD700' }}
        thumbColor={sections[section] ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  const renderInput = (label, key, required = false, parentKey = null) => {
    const value = parentKey ? profile[parentKey][key] : profile[key];
    const error = errors[key];

    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={value}
          onChangeText={(text) => {
            if (parentKey) {
              setProfile(prev => ({
                ...prev,
                [parentKey]: { ...prev[parentKey], [key]: text }
              }));
            } else {
              setProfile(prev => ({ ...prev, [key]: text }));
            }
            if (error) setErrors(prev => ({ ...prev, [key]: null }));
          }}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  };

  const addHeading = () => {
    setProfile(prev => ({
      ...prev,
      heading: [...prev.heading, { title: '', subheading: '', id: Date.now() }]
    }));
  };

  const updateHeading = (index, field, value) => {
    const updatedHeadings = [...profile.heading];
    updatedHeadings[index] = {
      ...updatedHeadings[index],
      [field]: value
    };
    setProfile(prev => ({
      ...prev,
      heading: updatedHeadings
    }));
  };

  const removeHeading = (index) => {
    setProfile(prev => ({
      ...prev,
      heading: prev.heading.filter((_, i) => i !== index)
    }));
  };

  const toggleContactMethod = (method) => {
    setProfile(prev => {
      const currentEnabled = prev.contact_info?.enabled || [];
      return {
        ...prev,
        contact_info: {
          ...(prev.contact_info || {}),
          enabled: currentEnabled.includes(method)
            ? currentEnabled.filter(m => m !== method)
            : [...currentEnabled, method]
        }
      };
    });
  };

  const addSocialLink = (platform) => {
    if (platform && !profile.social_links[platform.id]) {
      setProfile(prev => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [platform.id]: { url: '', enabled: true, name: platform.name }
        }
      }));
    }
    setShowPlatformModal(false);
  };

  const SuccessModal = () => (
    <Modal
      visible={showSuccessModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowSuccessModal(false)}
    >
      <View style={styles.successModalOverlay}>
        <Animated.View style={[styles.successModalContent, { opacity: fadeAnim }]}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
          </View>
          <Text style={styles.successTitle}>Profile Saved!</Text>
          <Text style={styles.successMessage}>Your profile has been updated successfully</Text>
          <View style={styles.successButtonsContainer}>
            <TouchableOpacity 
              style={[styles.successButton, styles.viewProfileButton]}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate('PublicProfile');
              }}
            >
              <Text style={styles.viewProfileButtonText}>View Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.successButton, styles.closeButton]}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  async function updateProfile() {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fix the errors before saving');
      return;
    }

    try {
      setLoading(true);
      console.log('Starting profile update process...');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No user found in Supabase auth');
        throw new Error('No user found');
      }
      
      console.log('User found:', user.id);
      console.log('Current profile state:', JSON.stringify(profile, null, 2));

      // Generate the proper profile URL
      let baseUrl = '';
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        baseUrl = isLocalhost 
          ? `${window.location.protocol}//${window.location.host}`
          : 'https://nexia.naveennuwantha.lk';
      } else {
        baseUrl = 'https://nexia.naveennuwantha.lk';
      }
      
      // Create the full profile URL
      const profileUrl = Platform.OS === 'web' 
        ? `${baseUrl}/viewprofile/${user.id}`
        : `nexia://viewprofile/${user.id}`;
      
      console.log('Generated profile URL:', profileUrl);

      // Ensure all required fields are present
      const updates = {
        id: user.id,
        username: profile.username?.trim() || null,
        full_name: profile.full_name?.trim() || null,
        title: profile.title?.trim() || 'Nexia User',
        bio: profile.bio?.trim() || null,
        heading: profile.heading || [],
        contact_info: profile.contact_info || {
          email: user.email,
          mobile: null,
          enabled: ['email']
        },
        address: profile.address || {
          line1: null,
          city: null,
          state: null,
          country: null,
          zipcode: null
        },
        social_links: profile.social_links || {},
        custom_sections: profile.custom_sections || [],
        avatar_url: profile.avatar_url || null,
        cover_url: profile.cover_url || null,
        is_public_profile: true, // Always make profile public
        public_profile_url: profileUrl,
        updated_at: new Date().toISOString()
      };

      console.log('Profile updates prepared:', JSON.stringify(updates, null, 2));

      // First try to check if the profile exists
      console.log('Checking if profile exists...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error('Error checking profile existence:', profileError);
      }
      
      const profileExists = profileData?.id === user.id;
      console.log('Profile exists?', profileExists);
      
      let error;
      
      if (profileExists) {
        // Update existing profile
        console.log('Updating existing profile...');
        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select();
        
        error = updateError;
        if (updateData) {
          console.log('Update response:', updateData);
        }
      } else {
        // Insert new profile
        console.log('Inserting new profile...');
        const { data: insertData, error: insertError } = await supabase
          .from('profiles')
          .insert([updates])
          .select();
        
        error = insertError;
        if (insertData) {
          console.log('Insert response:', insertData);
        }
      }

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Profile successfully saved to Supabase');

      // Verify the profile was saved by fetching it again
      console.log('Verifying profile was saved...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (verifyError) {
        console.error('Error verifying profile was saved:', verifyError);
      } else {
        console.log('Verification data:', verifyData ? 'Profile exists' : 'Profile does not exist');
      }

      // Show success UI and add delay to see animation
      setShowSuccessModal(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Wait 1.5 seconds then navigate to the public profile view
      setTimeout(() => {
        setShowSuccessModal(false);
        navigation.navigate('PublicProfile', { userId: user.id });
      }, 1500);

    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', `Failed to update profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const validateForm = () => {
    const newErrors = {};

    if (!profile.full_name?.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (profile.email && !/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (profile.phone && !/^\+?[\d\s-]{10,}$/.test(profile.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (profile.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(profile.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.content}>
        {/* Profile Section */}
        {renderToggleSection('Profile', 'profile')}
        {sections.profile && (
          <View style={styles.section}>
            <View style={styles.photoSection}>
              <View style={styles.photoContainer}>
                {profile.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={styles.profilePhoto} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="person" size={40} color="#666" />
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.photoButton}
                  onPress={() => pickImage('avatar')}
                >
                  <Ionicons name="camera" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <View style={styles.photoContainer}>
                {profile.cover_url ? (
                  <Image source={{ uri: profile.cover_url }} style={styles.coverPhoto} />
                ) : (
                  <View style={[styles.photoPlaceholder, styles.coverPlaceholder]}>
                    <Ionicons name="image" size={40} color="#666" />
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.photoButton}
                  onPress={() => pickImage('cover')}
                >
                  <Ionicons name="camera" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <TextInput
            style={styles.input}
            value={profile.full_name}
            onChangeText={(text) => setProfile({...profile, full_name: text})}
            placeholder="Full Name *"
            placeholderTextColor="#999"
          />
          {errors.full_name && <Text style={styles.errorText}>{errors.full_name}</Text>}
          
          <TextInput
            style={styles.input}
            value={profile.title}
            onChangeText={(text) => setProfile({...profile, title: text})}
            placeholder="Professional Title (e.g. Software Developer)"
            placeholderTextColor="#999"
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            value={profile.bio}
            onChangeText={(text) => setProfile({...profile, bio: text})}
            placeholder="Bio or About Me"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Heading Section */}
        {renderToggleSection('Heading & Text', 'heading')}
        {sections.heading && (
          <View style={styles.section}>
            {profile.heading.map((item, index) => (
              <View key={item.id} style={styles.headingContainer}>
                <View style={styles.headingHeader}>
                  <Text style={styles.headingNumber}>#{index + 1}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeHeading(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#ff3b30" />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  value={item.title}
                  onChangeText={(text) => updateHeading(index, 'title', text)}
                  placeholder="Enter title"
                />
                <TextInput
                  style={styles.input}
                  value={item.subheading}
                  onChangeText={(text) => updateHeading(index, 'subheading', text)}
                  placeholder="Enter sub heading"
                />
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addHeading}>
              <Ionicons name="add-circle-outline" size={24} color="#FFD700" />
              <Text style={styles.addButtonText}>Add More</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Contact Section */}
        {renderToggleSection('Contact Us', 'contact')}
        {sections.contact && (
          <View style={styles.section}>
            <View style={styles.contactButtons}>
              <TouchableOpacity 
                style={[
                  styles.contactButton,
                  profile.contact_info?.enabled?.includes('mobile') && styles.contactButtonActive
                ]}
                onPress={() => toggleContactMethod('mobile')}
              >
                <Ionicons 
                  name="call" 
                  size={24} 
                  color={profile.contact_info?.enabled?.includes('mobile') ? '#FFD700' : '#666'} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.contactButton,
                  profile.contact_info?.enabled?.includes('email') && styles.contactButtonActive
                ]}
                onPress={() => toggleContactMethod('email')}
              >
                <Ionicons 
                  name="mail" 
                  size={24} 
                  color={profile.contact_info?.enabled?.includes('email') ? '#FFD700' : '#666'} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.contactButton,
                  profile.contact_info?.enabled?.includes('sms') && styles.contactButtonActive
                ]}
                onPress={() => toggleContactMethod('sms')}
              >
                <Ionicons 
                  name="chatbubble" 
                  size={24} 
                  color={profile.contact_info?.enabled?.includes('sms') ? '#FFD700' : '#666'} 
                />
              </TouchableOpacity>
            </View>

            {profile.contact_info?.enabled?.includes('mobile') && (
              renderInput('Mobile', 'mobile', true, 'contact_info')
            )}
            {profile.contact_info?.enabled?.includes('email') && (
              renderInput('Email', 'email', true, 'contact_info')
            )}
            {profile.contact_info?.enabled?.includes('sms') && (
              renderInput('SMS', 'sms', true, 'contact_info')
            )}

            {renderInput('Label', 'label', false, 'address')}
            {renderInput('Address', 'line1', false, 'address')}
            {renderInput('City', 'city', false, 'address')}
            {renderInput('State', 'state', false, 'address')}
            {renderInput('Country', 'country', false, 'address')}
            {renderInput('Zipcode', 'zipcode', false, 'address')}
            <View style={styles.mapContainer}>
              <TextInput
                style={[styles.input, styles.mapInput]}
                value={profile.address.map_url}
                placeholder="Add Google Maps URL"
                onChangeText={(text) => {
                  setProfile(prev => ({
                    ...prev,
                    address: { ...prev.address, map_url: text }
                  }));
                }}
              />
              <TouchableOpacity style={styles.mapButton}>
                <Text style={styles.mapButtonText}>Add to Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Social Links Section */}
        {renderToggleSection('Social Links', 'social')}
        {sections.social && (
          <View style={styles.section}>
            {Object.entries(profile.social_links).map(([platform, data]) => (
              <View key={platform} style={styles.socialContainer}>
                <View style={styles.socialHeader}>
                  <View style={styles.socialIcon}>
                    <Ionicons 
                      name={platform === 'website' ? 'globe-outline' : `logo-${platform.toLowerCase()}`}
                      size={24}
                      color="#666"
                    />
                    <Text style={styles.platformName}>{data.name || platform}</Text>
                  </View>
                  <View style={styles.socialControls}>
                    <Switch
                      value={data.enabled}
                      onValueChange={(value) => {
                        setProfile(prev => ({
                          ...prev,
                          social_links: {
                            ...prev.social_links,
                            [platform]: { ...data, enabled: value }
                          }
                        }));
                      }}
                      trackColor={{ false: '#ddd', true: '#FFD700' }}
                      thumbColor={data.enabled ? '#fff' : '#f4f3f4'}
                    />
                    <TouchableOpacity
                      style={styles.removeIconButton}
                      onPress={() => {
                        setProfile(prev => {
                          const newSocialLinks = { ...prev.social_links };
                          delete newSocialLinks[platform];
                          return { ...prev, social_links: newSocialLinks };
                        });
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="#ff3b30" />
                    </TouchableOpacity>
                  </View>
                </View>
                {data.enabled && (
                  <TextInput
                    style={styles.input}
                    value={data.url}
                    onChangeText={(text) => {
                      setProfile(prev => ({
                        ...prev,
                        social_links: {
                          ...prev.social_links,
                          [platform]: { ...data, url: text }
                        }
                      }));
                    }}
                    placeholder={`Enter your ${data.name || platform} profile URL`}
                  />
                )}
              </View>
            ))}
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => setShowPlatformModal(true)}
            >
              <Ionicons name="add-circle-outline" size={24} color="#FFD700" />
              <Text style={styles.addButtonText}>Add More Social Links</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={updateProfile}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showPlatformModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPlatformModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPlatformModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Platform</Text>
              <TouchableOpacity 
                onPress={() => setShowPlatformModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.platformList}>
              {socialPlatforms.map((platform) => (
                !profile.social_links[platform.id] && (
                  <TouchableOpacity
                    key={platform.id}
                    style={styles.platformOption}
                    onPress={() => addSocialLink(platform)}
                  >
                    <Ionicons name={platform.icon} size={24} color="#666" />
                    <Text style={styles.platformOptionText}>{platform.name}</Text>
                  </TouchableOpacity>
                )
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <SuccessModal />
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  photoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  photoContainer: {
    flex: 1,
    position: 'relative',
  },
  profilePhoto: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
  },
  coverPhoto: {
    width: '100%',
    aspectRatio: 16/9,
    borderRadius: 8,
  },
  photoPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholder: {
    aspectRatio: 16/9,
  },
  photoButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  required: {
    color: '#ff3b30',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: -12,
    marginBottom: 12,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
    marginBottom: 15,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  contactButtonActive: {
    borderColor: '#FFD700',
    backgroundColor: '#fff',
  },
  mapContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  mapInput: {
    flex: 1,
  },
  mapButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
  },
  mapButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  socialContainer: {
    marginBottom: 15,
  },
  socialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  socialIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  platformName: {
    fontSize: 14,
    color: '#333',
    textTransform: 'capitalize',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  addButtonText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#FFD700',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  headingContainer: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
  },
  headingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headingNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    minHeight: 300,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCloseButton: {
    padding: 5,
  },
  platformList: {
    padding: 15,
  },
  platformOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 15,
    backgroundColor: '#fff',
  },
  platformOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  socialControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  removeIconButton: {
    padding: 5,
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successIconContainer: {
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  successButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  successButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewProfileButton: {
    backgroundColor: '#FFD700',
  },
  viewProfileButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
}); 