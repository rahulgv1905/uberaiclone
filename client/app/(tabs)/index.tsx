import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import axios from 'axios';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { API_URL, API_ENDPOINTS } from '@/constants/api';
import { GOOGLE_MAPS_API_KEY } from '@/constants/maps';
import MapView from '@/components/MapView';

const { width, height } = Dimensions.get('window');

interface RideData {
  ride_details: {
    distance: string;
    duration: string;
    start_address: string;
    end_address: string;
    polyline?: string;
  };
  weather_report: {
    condition: string;
    temperature: number;
  };
  uber_estimates: {
    prices: Array<{
      display_name: string;
      estimate: string;
      duration: number;
    }>;
    times: Array<{
      display_name: string;
      estimate: number;
    }>;
  };
  ai_suggestion: string;
}

export default function HomeScreen() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [rideData, setRideData] = useState<RideData | null>(null);
  const [sourceSuggestions, setSourceSuggestions] = useState<string[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<string[]>([]);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (source.length > 2) {
        fetchAutocomplete(source, 'source');
      } else {
        setSourceSuggestions([]);
        setShowSourceSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [source]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (destination.length > 2) {
        fetchAutocomplete(destination, 'destination');
      } else {
        setDestSuggestions([]);
        setShowDestSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [destination]);

  const fetchAutocomplete = async (input: string, type: 'source' | 'destination') => {
    try {
      const response = await axios.get(`${API_URL}${API_ENDPOINTS.AUTOCOMPLETE}`, {
        params: { input_text: input },
      });
      const suggestions = response.data.suggestions?.slice(0, 5) || [];
      if (type === 'source') {
        setSourceSuggestions(suggestions.map((s: any) => s.description || s));
        setShowSourceSuggestions(true);
      } else {
        setDestSuggestions(suggestions.map((s: any) => s.description || s));
        setShowDestSuggestions(true);
      }
    } catch (error: any) {
      console.error('Autocomplete error:', error);
      if (type === 'source') {
        setSourceSuggestions([]);
        setShowSourceSuggestions(false);
      } else {
        setDestSuggestions([]);
        setShowDestSuggestions(false);
      }
    }
  };

  const handleBooking = async () => {
    if (!source || !destination) {
      Alert.alert('Error', 'Please enter both pickup and destination locations');
      return;
    }

    setLoading(true);
    setRideData(null);
    setShowMap(true);

    try {
      const response = await axios.post(
        `${API_URL}${API_ENDPOINTS.BOOK_RIDE}`,
        { source, destination },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setRideData(response.data);
    } catch (error: any) {
      console.error('Booking error:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Could not fetch ride details.');
    } finally {
      setLoading(false);
    }
  };

  const selectSuggestion = (suggestion: string, type: 'source' | 'destination') => {
    if (type === 'source') {
      setSource(suggestion);
      setShowSourceSuggestions(false);
    } else {
      setDestination(suggestion);
      setShowDestSuggestions(false);
    }
  };

  const getWeatherIcon = (condition: string, temp: number) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle') || lowerCondition.includes('storm')) {
      return '🌧️';
    } else if (lowerCondition.includes('snow')) {
      return '❄️';
    } else if (lowerCondition.includes('cloud')) {
      return '☁️';
    } else if (temp < 10) {
      return '🥶';
    } else if (temp > 25) {
      return '☀️';
    }
    return '🌤️';
  };

  const getWeatherColor = (condition: string, temp: number) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain') || lowerCondition.includes('storm')) {
      return '#4A90E2'; // Blue for rain
    } else if (temp < 10) {
      return '#87CEEB'; // Light blue for cold
    } else if (temp > 25) {
      return '#FFA500'; // Orange for hot
    }
    return '#32CD32'; // Green for normal
  };

  return (
    <View style={styles.container}>
      {/* Map View - Uber Style */}
      {showMap && (
        <View style={styles.mapContainer}>
          <MapView
            origin={rideData ? rideData.ride_details.start_address : undefined}
            destination={rideData ? rideData.ride_details.end_address : undefined}
            apiKey={GOOGLE_MAPS_API_KEY}
          />
        </View>
      )}

      {/* Bottom Sheet - Uber Style */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.bottomSheet}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Handle */}
          <View style={styles.handle} />

          {/* Weather Alert - Prominent */}
          {rideData && (
            <View style={[styles.weatherAlert, { backgroundColor: getWeatherColor(rideData.weather_report.condition, rideData.weather_report.temperature) }]}>
              <View style={styles.weatherAlertContent}>
                <ThemedText style={styles.weatherIcon}>{getWeatherIcon(rideData.weather_report.condition, rideData.weather_report.temperature)}</ThemedText>
                <View style={styles.weatherTextContainer}>
                  <ThemedText style={styles.weatherAlertTitle}>Weather Alert</ThemedText>
                  <ThemedText style={styles.weatherAlertText}>
                    {rideData.weather_report.condition.charAt(0).toUpperCase() + rideData.weather_report.condition.slice(1)} • {rideData.weather_report.temperature}°C
                  </ThemedText>
                </View>
              </View>
            </View>
          )}

          {/* Input Section */}
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              {/* Pickup Location */}
              <View style={styles.locationInput}>
                <View style={styles.locationDot} />
                <View style={styles.inputContent}>
                  <ThemedText style={styles.inputLabel}>Pickup</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter pickup location"
                    placeholderTextColor="#999"
                    value={source}
                    onChangeText={setSource}
                    onFocus={() => {
                      if (sourceSuggestions.length > 0) setShowSourceSuggestions(true);
                    }}
                  />
                </View>
              </View>

              {/* Divider Line */}
              <View style={styles.dividerLine} />

              {/* Destination Location */}
              <View style={styles.locationInput}>
                <View style={[styles.locationDot, styles.destinationDot]} />
                <View style={styles.inputContent}>
                  <ThemedText style={styles.inputLabel}>Destination</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="Where to?"
                    placeholderTextColor="#999"
                    value={destination}
                    onChangeText={setDestination}
                    onFocus={() => {
                      if (destSuggestions.length > 0) setShowDestSuggestions(true);
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Suggestions */}
            {showSourceSuggestions && sourceSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {sourceSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => selectSuggestion(suggestion, 'source')}
                  >
                    <IconSymbol name="mappin.circle.fill" size={20} color="#000" />
                    <ThemedText style={styles.suggestionText}>{suggestion}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {showDestSuggestions && destSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {destSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => selectSuggestion(suggestion, 'destination')}
                  >
                    <IconSymbol name="mappin.circle" size={20} color="#000" />
                    <ThemedText style={styles.suggestionText}>{suggestion}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Find Ride Button - Uber Black */}
            <TouchableOpacity
              style={[styles.findRideButton, loading && styles.buttonDisabled]}
              onPress={handleBooking}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.findRideText}>Find Ride</ThemedText>
              )}
            </TouchableOpacity>
          </View>

          {/* Ride Details */}
          {rideData && (
            <View style={styles.rideDetailsCard}>
              {/* Trip Info */}
              <View style={styles.tripInfo}>
                <View style={styles.tripInfoItem}>
                  <IconSymbol name="clock.fill" size={18} color="#666" />
                  <ThemedText style={styles.tripInfoText}>{rideData.ride_details.duration}</ThemedText>
                </View>
                <View style={styles.tripInfoItem}>
                  <IconSymbol name="ruler.fill" size={18} color="#666" />
                  <ThemedText style={styles.tripInfoText}>{rideData.ride_details.distance}</ThemedText>
                </View>
              </View>

              {/* Price Estimates */}
              {rideData.uber_estimates.prices.length > 0 && (
                <View style={styles.priceSection}>
                  <ThemedText style={styles.sectionTitle}>Choose a ride</ThemedText>
                  {rideData.uber_estimates.prices.slice(0, 3).map((price, index) => (
                    <TouchableOpacity key={index} style={styles.priceItem}>
                      <View>
                        <ThemedText style={styles.priceName}>{price.display_name}</ThemedText>
                        <ThemedText style={styles.priceTime}>{Math.round(price.duration / 60)} min</ThemedText>
                      </View>
                      <ThemedText style={styles.priceEstimate}>{price.estimate}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* AI Suggestion - Enhanced */}
              <View style={styles.aiSuggestionCard}>
                <View style={styles.aiHeader}>
                  <IconSymbol name="sparkles" size={20} color="#000" />
                  <ThemedText style={styles.aiTitle}>Travel Assistant</ThemedText>
                </View>
                <ThemedText style={styles.aiSuggestionText}>{rideData.ai_suggestion}</ThemedText>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
    zIndex: 0,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.65,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  weatherAlert: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  weatherAlertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIcon: {
    fontSize: 32,
    marginRight: 12,
    lineHeight: 32,
  },
  weatherTextContainer: {
    flex: 1,
  },
  weatherAlertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  weatherAlertText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  inputSection: {
    paddingHorizontal: 16,
  },
  inputContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000',
    marginRight: 12,
  },
  destinationDot: {
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#fff',
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    padding: 0,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 8,
    marginLeft: 24,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  findRideButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  findRideText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  rideDetailsCard: {
    paddingHorizontal: 16,
  },
  tripInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 16,
  },
  tripInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tripInfoText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  priceSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  priceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  priceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  priceTime: {
    fontSize: 12,
    color: '#666',
  },
  priceEstimate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  aiSuggestionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#000',
  },
  aiSuggestionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
});
