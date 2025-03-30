import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base width for scaling (based on iPhone 11)
const baseWidth = 375;
const baseHeight = 812;

// Breakpoints
export const breakpoints = {
  xs: 0,    // phones
  sm: 576,  // large phones
  md: 768,  // tablets
  lg: 992,  // laptops/small desktops
  xl: 1200, // large desktops
};

// Scale factor based on screen width
const widthScaleFactor = SCREEN_WIDTH / baseWidth;
const heightScaleFactor = SCREEN_HEIGHT / baseHeight;

// Normalize font size for different screen sizes
export function normalize(size) {
  const newSize = size * widthScaleFactor;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
}

// Responsive padding/margin based on screen size
export function responsiveSpacing(size) {
  return Math.round(size * widthScaleFactor);
}

// Get current breakpoint
export function getCurrentBreakpoint() {
  const width = SCREEN_WIDTH;
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}

// Responsive width based on percentage
export function getResponsiveWidth(percentage) {
  return (percentage / 100) * SCREEN_WIDTH;
}

// Responsive height based on percentage
export function getResponsiveHeight(percentage) {
  return (percentage / 100) * SCREEN_HEIGHT;
}

// Media query-like function for responsive styles
export function responsiveStyle(styles) {
  const breakpoint = getCurrentBreakpoint();
  return {
    ...styles.base,
    ...(styles[breakpoint] || {}),
  };
}

// Listen to dimension changes
export function useDimensionsChange(callback) {
  Dimensions.addEventListener('change', callback);
  return () => Dimensions.removeEventListener('change', callback);
}

// Get device type
export function getDeviceType() {
  const width = SCREEN_WIDTH;
  if (width >= breakpoints.md) return 'tablet';
  return 'phone';
}

// Get orientation
export function getOrientation() {
  return SCREEN_WIDTH > SCREEN_HEIGHT ? 'landscape' : 'portrait';
}

// Calculate dynamic font size
export function getDynamicFontSize(size) {
  const standardLength = SCREEN_WIDTH > SCREEN_HEIGHT ? SCREEN_WIDTH : SCREEN_HEIGHT;
  const offset = SCREEN_WIDTH > SCREEN_HEIGHT ? 0 : Platform.OS === "ios" ? 78 : 24;
  const deviceHeight = Platform.OS === "ios" 
    ? standardLength - offset 
    : standardLength - offset;
    
  const heightPercent = (size * deviceHeight) / baseHeight;
  return Math.round(heightPercent);
} 