import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signOut } from '../services/supabaseClient';

export default function ProfileDropdown({ onClose, userId }) {
  const navigation = useNavigation();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.option}
        onPress={() => {
          onClose();
          navigation.navigate('PublicProfile', { userId });
        }}
      >
        <Text style={styles.optionText}>View Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.option}
        onPress={() => {
          onClose();
          navigation.navigate('ProfileEdit');
        }}
      >
        <Text style={styles.optionText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, styles.signOutOption]}
        onPress={handleSignOut}
      >
        <Text style={[styles.optionText, styles.signOutText]}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 150,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  signOutOption: {
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  signOutText: {
    color: '#ff3b30',
  },
}); 