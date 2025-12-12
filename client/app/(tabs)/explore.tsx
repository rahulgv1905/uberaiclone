import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ExploreScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          About Uber AI Clone
        </ThemedText>

        <View style={styles.featureCard}>
          <IconSymbol name="sparkles" size={32} color="#000" style={styles.icon} />
          <ThemedText type="subtitle" style={styles.featureTitle}>
            AI-Powered Travel Assistant
          </ThemedText>
          <ThemedText style={styles.featureDescription}>
            Get personalized travel suggestions based on weather conditions and your destination.
            Our AI assistant helps you prepare for your trip with clothing recommendations and
            helpful tips.
          </ThemedText>
        </View>

        <View style={styles.featureCard}>
          <IconSymbol name="map.fill" size={32} color="#000" style={styles.icon} />
          <ThemedText type="subtitle" style={styles.featureTitle}>
            Real-Time Route Information
          </ThemedText>
          <ThemedText style={styles.featureDescription}>
            Get accurate distance and duration estimates using Google Maps integration. Plan your
            journey with confidence.
          </ThemedText>
        </View>

        <View style={styles.featureCard}>
          <IconSymbol name="cloud.sun.fill" size={32} color="#000" style={styles.icon} />
          <ThemedText type="subtitle" style={styles.featureTitle}>
            Weather Integration
          </ThemedText>
          <ThemedText style={styles.featureDescription}>
            Know the weather at your destination before you arrive. Our system provides real-time
            weather data to help you prepare.
          </ThemedText>
        </View>

        <View style={styles.featureCard}>
          <IconSymbol name="dollarsign.circle.fill" size={32} color="#000" style={styles.icon} />
          <ThemedText type="subtitle" style={styles.featureTitle}>
            Price Estimates
          </ThemedText>
          <ThemedText style={styles.featureDescription}>
            Compare prices across different ride options. Get transparent pricing information for
            your trip.
          </ThemedText>
        </View>

        <View style={styles.infoCard}>
          <ThemedText type="subtitle" style={styles.infoTitle}>
            How to Use
          </ThemedText>
          <ThemedText style={styles.infoText}>
            1. Enter your pickup location{'\n'}
            2. Enter your destination{'\n'}
            3. Tap "Find Ride" to get details{'\n'}
            4. Review AI suggestions and weather info
          </ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
