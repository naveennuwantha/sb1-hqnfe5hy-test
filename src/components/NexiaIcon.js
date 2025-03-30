import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NexiaIcon({ size = 32, color = '#fff', backgroundColor = '#0066cc' }) {
  return (
    <View style={[
      styles.container,
      {
        width: size,
        height: size,
        backgroundColor: backgroundColor,
        borderRadius: size / 2
      }
    ]}>
      <Text style={[
        styles.text,
        {
          color: color,
          fontSize: size * 0.4
        }
      ]}>
        NEXIA
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
  },
}); 