import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios'; // Import axios

import {API_KEY} from '@env';

export default function Notification() {
  const [location, setLocation] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false); // Define hasLocationPermission

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'This app needs access to your location ' +
            'so we can know where you are.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setHasLocationPermission(true);
      } else {
        setHasLocationPermission(false);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    if (hasLocationPermission) {
      Geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
          // console.log(position);
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          fetchWeatherData(latitude, longitude); // Call fetchWeatherData here
        },
        (error) => {
          console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    } else {
      let timeoutId = setTimeout(() => {
        alert('Location services are not enabled. Please enable location services to use this app.');
      }, 15000); // 15000 is 15 seconds in milliseconds
      return () => clearTimeout(timeoutId);
    }
  }, [hasLocationPermission]);

  const fetchWeatherData = async (latitude, longitude) => {
    try {
      const response = await axios.get(`https://api.weatherapi.com/v1/forecast.json`, { // Add API URL
        params: {
          key: API_KEY,
          q: `${latitude},${longitude}`,
          alert: "yes",
        },
      });
      const data = response.data;
      setWeatherData(data);
      // console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <LinearGradient colors={['#2c67f2', '#62cff4']} style={styles.container}>
      <View>
        <Text style={styles.header}>Notification</Text>
      </View>
        <View style={styles.dataContainer}>
      {weatherData && (
        weatherData.alerts && weatherData.alerts.alert && weatherData.alerts.alert.length > 0 ? (
          <Text style={styles.alertText}>{weatherData.alerts.alert[0]}</Text>
        ) : (
          <Text style={styles.text}>No new alerts</Text>
        )
      )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  dataContainer:{
    padding: 10,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 10,
    minWidth: '92%',
  },
  header:{
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
    paddingTop: 4,
  },
  text:{
    fontSize: 20,
    marginBottom: 10,
    color: '#fff'
  }
});