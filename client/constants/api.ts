/**
 * API configuration constants
 */
import { Platform } from 'react-native';

// Determine API URL based on environment
export const getApiUrl = (): string => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'android') {
      // Android emulator uses 10.0.2.2 to access host machine's localhost
      return 'http://10.0.2.2:8000/api';
    } else if (Platform.OS === 'ios') {
      // iOS simulator uses localhost
      return 'http://localhost:8000/api';
    } else {
      // Web or other platforms
      return 'http://localhost:8000/api';
    }
  } else {
    // Production - replace with your production API URL
    return 'https://your-production-api.com/api';
  }
};

export const API_URL = getApiUrl();

export const API_ENDPOINTS = {
  HEALTH: '/',
  BOOK_RIDE: '/book-ride',
  PRODUCTS: '/products',
  PRICE_ESTIMATES: '/price-estimates',
  TIME_ESTIMATES: '/time-estimates',
  AUTOCOMPLETE: '/autocomplete',
} as const;


