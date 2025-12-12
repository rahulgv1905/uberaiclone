import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

// Conditional import for WebView
let WebView: any;
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView;
  } catch (e) {
    console.warn('react-native-webview not available');
  }
}

interface MapViewProps {
  origin?: string;
  destination?: string;
  polyline?: string;
  apiKey: string;
}

export default function MapView({ origin, destination, polyline, apiKey }: MapViewProps) {
  // For web, use iframe
  if (Platform.OS === 'web') {
    const mapUrl = origin && destination
      ? `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&zoom=13`
      : `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=40.7128,-74.0060&zoom=10`;

    return (
      <View style={styles.container}>
        {/* @ts-ignore - iframe for web */}
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={mapUrl}
        />
      </View>
    );
  }

  // For native platforms, use WebView if available
  if (WebView) {
    const mapUrl = origin && destination
      ? `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&zoom=13`
      : `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=40.7128,-74.0060&zoom=10`;

    return (
      <View style={styles.container}>
        <WebView
          source={{ uri: mapUrl }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      </View>
    );
  }

  // Fallback for native without WebView
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        {/* Map placeholder - would need react-native-maps for full native support */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  webview: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
