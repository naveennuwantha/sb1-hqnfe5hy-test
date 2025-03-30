import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import { getResponsiveWidth, responsiveSpacing } from '../utils/responsive';

// Helper function to safely handle spacing values
const getSpacing = (value) => {
  if (typeof value === 'number') {
    return responsiveSpacing(value);
  }
  return value;
};

export function Row({ children, style, spacing = 16, ...props }) {
  const { width } = useResponsive();
  
  return (
    <View
      style={[
        styles.row,
        { margin: -getSpacing(spacing / 2) },
        style,
      ]}
      {...props}
    >
      {React.Children.map(children, child => {
        if (!child) return null;
        return React.cloneElement(child, {
          style: [
            child.props.style,
            { margin: getSpacing(spacing / 2) },
          ],
        });
      })}
    </View>
  );
}

export function Col({ children, style, size = 12, offset = 0, ...props }) {
  const colWidth = getResponsiveWidth(size);
  const offsetWidth = getResponsiveWidth(offset);
  
  return (
    <View
      style={[
        styles.col,
        {
          width: colWidth,
          marginLeft: offsetWidth,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

export function Container({ children, style, fluid, ...props }) {
  const { width, breakpoint } = useResponsive();
  
  const getMaxWidth = () => {
    if (fluid) return '100%';
    switch (breakpoint) {
      case 'xl': return 1140;
      case 'lg': return 960;
      case 'md': return 720;
      case 'sm': return 540;
      default: return '100%';
    }
  };
  
  return (
    <View
      style={[
        styles.container,
        { maxWidth: getMaxWidth() },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  col: {
    flexShrink: 0,
  },
  container: {
    width: '100%',
    marginHorizontal: 'auto',
    paddingHorizontal: responsiveSpacing(16),
  },
}); 