import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { breakpoints, getCurrentBreakpoint, getOrientation } from '../utils/responsive';

export function useResponsive() {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [breakpoint, setBreakpoint] = useState(getCurrentBreakpoint());
  const [orientation, setOrientation] = useState(getOrientation());

  useEffect(() => {
    function handleDimensionsChange({ window }) {
      setDimensions(window);
      setBreakpoint(getCurrentBreakpoint());
      setOrientation(getOrientation());
    }

    const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const isPhone = dimensions.width < breakpoints.md;
  const isTablet = dimensions.width >= breakpoints.md && dimensions.width < breakpoints.lg;
  const isDesktop = dimensions.width >= breakpoints.lg;
  const isPortrait = orientation === 'portrait';
  const isLandscape = orientation === 'landscape';

  return {
    width: dimensions.width,
    height: dimensions.height,
    breakpoint,
    orientation,
    isPhone,
    isTablet,
    isDesktop,
    isPortrait,
    isLandscape,
    // Helper functions for responsive styles
    styles: (styles) => {
      if (typeof styles === 'function') {
        return styles({ width: dimensions.width, height: dimensions.height, breakpoint, orientation });
      }
      return styles[breakpoint] || styles.base || styles;
    },
    // Helper for conditional rendering
    render: (components) => {
      if (components[breakpoint]) {
        return components[breakpoint];
      }
      if (isPhone && components.phone) return components.phone;
      if (isTablet && components.tablet) return components.tablet;
      if (isDesktop && components.desktop) return components.desktop;
      return components.default || null;
    }
  };
} 