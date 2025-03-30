import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';

export default function ContactModal({ onClose }) {
  const handlePhonePress = () => {
    Linking.openURL('tel:+94764479187');
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@nfc.lk');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>NFC SUPPORT</Text>
        
        <TouchableOpacity onPress={handlePhonePress}>
          <Text style={styles.contactText}>
            Contact: <Text style={styles.link}>+94764479187</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleEmailPress}>
          <Text style={styles.contactText}>
            Email: <Text style={styles.link}>support@nfc.lk</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  contactText: {
    fontSize: 16,
    marginBottom: 10,
  },
  link: {
    color: '#0066cc',
    textDecorationLine: 'underline',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0066cc',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 