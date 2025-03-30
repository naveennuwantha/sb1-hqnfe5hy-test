import React from 'react';
import { Text, StyleSheet } from 'react-native';

export const Logo = () => {
  return (
    <Text style={styles.logoText}>NEXIA</Text>
  );
};

const styles = StyleSheet.create({
  logoText: {
    color: '#2563EB',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 40,
    textAlign: 'center',
  },
}); 