'use client';

import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL available:', !!supabaseUrl);
console.log('Supabase key available:', !!supabaseAnonKey);

// Export a function that returns a client or errors
const createSupabaseClient = () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return { error: 'Missing Supabase environment variables' };
    }

    // Create the Supabase client
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false // Disable URL detection to avoid CSP issues
      },
      global: {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    });

    return { client };
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    return { error };
  }
};

const { client: supabase, error: supabaseError } = createSupabaseClient();

if (supabaseError) {
  console.error('Supabase client initialization failed:', supabaseError);
}

// Make the client and error available
export { supabase, supabaseError };

// Storage bucket name
export const AVATAR_BUCKET = 'avatars';

// Helper function to detect platform without using React Native directly
// This avoids ESM issues during build
const isPlatformWeb = () => {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    return true;
  }
  return false;
};

// Helper function to upload profile picture
export const uploadProfilePicture = async (base64Image, userId) => {
  try {
    if (!base64Image || !userId) return { error: 'Missing required data' };

    // Create a unique file name
    const fileName = `${userId}/${Date.now()}.jpg`;

    // Convert base64 to Uint8Array
    const base64Data = base64Image.split(',')[1] || base64Image;
    const byteCharacters = atob(base64Data);
    const byteArray = new Uint8Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(fileName, byteArray, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(fileName);

    return { url: publicUrl };
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return { error };
  }
};

// Helper function to delete profile picture
export const deleteProfilePicture = async (fileUrl) => {
  try {
    if (!fileUrl) return { error: 'No file URL provided' };

    // Extract file path from URL
    const urlParts = fileUrl.split('/');
    const filePath = urlParts.slice(-2).join('/'); // Gets "userId/timestamp.jpg"

    const { error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .remove([filePath]);

    return { error };
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return { error };
  }
};

// Helper function to update profile
export const updateProfile = async (userId, updates) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      });

    return { error };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error };
  }
};

// Auth functions with automatic profile creation
export const signUp = async (email, password) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) return { error: authError };

  if (authData?.user) {
    // Create initial profile in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email: authData.user.email,
        }
      ]);

    if (profileError) return { error: profileError };
  }

  return { data: authData };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// QR Code functions
export const generateProfileUrl = (userId) => {
  // Use a consistent domain for your application
  // In production, this should be your actual domain
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nexia.naveennuwantha.lk';
  return `${baseUrl}/profile/${userId}`;
};

export const generateDeepLink = (userId) => {
  // For mobile, create a deep link that will open the app
  return `nexia://profile/${userId}`;
};

// Contact functions
export const saveContact = async (userId, savedUserId) => {
  const { data, error } = await supabase
    .from('contacts')
    .insert([{ user_id: userId, saved_user_id: savedUserId }]);
  return { data, error };
};

// Tutorial functions
export const getTutorials = async () => {
  const { data, error } = await supabase
    .from('tutorials')
    .select('*')
    .order('title', { ascending: true });
  return { data, error };
};

// Database schema setup
/*
Create these tables in your Supabase dashboard:

1. users (created by default)
   - id (uuid, primary key)
   - email (text)
   - name (text)
   - phone (text)
   - qr_code (text)
   - created_at (timestamp with timezone)

2. profiles
   - id (uuid, primary key, references auth.users.id)
   - name (text)
   - email (text)
   - phone (text)
   - created_at (timestamp with timezone)
*/ 