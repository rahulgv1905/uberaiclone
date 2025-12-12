import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';

export default function App() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [rideData, setRideData] = useState(null);

  // REPLACE WITH YOUR COMPUTER'S LOCAL IP (e.g., 192.168.1.5) if testing on phone
  // OR use 'http://127.0.0.1:8000' if using Android Emulator
  const API_URL = 'http://127.0.0.1:8000/book-ride'; 

  const handleBooking = async () => {
    if (!source || !destination) {
        Alert.alert("Error", "Please enter both locations");
        return;
    }
    setLoading(true);
    setRideData(null);
    
    try {
      // Sending data to Python Backend
      const response = await axios.post(`${API_URL}?source=${source}&destination=${destination}`);
      setRideData(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not fetch ride details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Uber AI 🚕</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="Source (e.g. New York)" 
        value={source}
        onChangeText={setSource}
      />
      <TextInput 
        style={styles.input} 
        placeholder="Destination (e.g. Boston)" 
        value={destination}
        onChangeText={setDestination}
      />
      
      <Button title="Check Ride & Weather" onPress={handleBooking} />

      {loading && <ActivityIndicator size="large" color="#0000ff" style={{marginTop: 20}} />}

      {rideData && (
        <View style={styles.resultCard}>
          <Text style={styles.title}>Ride Details:</Text>
          <Text>Duration: {rideData.ride_details.duration}</Text>
          <Text>Distance: {rideData.ride_details.distance}</Text>
          
          <View style={styles.separator} />
          
          <Text style={styles.title}>AI Suggestion 🤖:</Text>
          <Text style={styles.suggestion}>{rideData.ai_suggestion}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  header: { fontSize: 30, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  resultCard: { marginTop: 20, padding: 20, backgroundColor: 'white', borderRadius: 15, elevation: 5 },
  title: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  suggestion: { fontSize: 16, color: '#444', fontStyle: 'italic', marginTop: 5 },
  separator: { height: 1, backgroundColor: '#ddd', marginVertical: 10 }
});