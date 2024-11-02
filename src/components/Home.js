import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, RefreshControl, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';
import axios from 'axios';

import {API_KEY} from '@env';

export default function Home() {
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [location, setLocation] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [weatherData, setWeatherData] = useState(null);
  let api = 'https://api.weatherapi.com/v1/';

  useEffect(() => {
    if (Platform.OS === 'android') {
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
            alert('Location permission denied. Please enable location services to use this app.');
          }
        } catch (err) {
          console.warn(err);
        }
      };
      requestLocationPermission();
    } else {
      Geolocation.requestAuthorization()
        .then(authorization => {
          if (authorization === 'authorized') {
            setHasLocationPermission(true);
          } else {
            alert('Location permission denied. Please enable location services to use this app.');
          }
        })
        .catch(error => console.log(error));
    }
  }, []);

  useEffect(() => {
    if (hasLocationPermission) {
      Geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
          console.log(position);
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      let timeoutId = setTimeout(() => {
        alert('Location services are not enabled. Please enable location services to use this app.');
      }, 15000); // 15000 is 15 seconds in milliseconds
      return () => clearTimeout(timeoutId);
    }
  }, [hasLocationPermission]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (hasLocationPermission) {
      Geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
          console.log(position);
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setRefreshing(false);
        },
        (error) => {
          console.log(error.code, error.message);
          setRefreshing(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      setRefreshing(false);
    }
  }, [hasLocationPermission]);

  const fetchWeatherData = async () => {
    if (latitude && longitude) {
      try {
        const response = await axios.get(`${api}forecast.json`, {
          params: {
            key: API_KEY,
            q: `${latitude},${longitude}`,
            aqi:"yes",
            days: "7"
          }
        });
        const data = response.data;
        setWeatherData(data); 
        console.log(data);
      } catch (error) {
        console.error(error);
        alert('Error fetching weather data');
      }
    }
  };

  const onRefreshWeatherData = async () => {
    setRefreshing(true);
    await fetchWeatherData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchWeatherData();
  }, [latitude, longitude]);

  return (
    <LinearGradient colors={['#2c67f2', '#62cff4']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            onRefresh();
            onRefreshWeatherData();
          }} />
        }>
        {weatherData && (
          <>
          <Text>{weatherData.location.name}</Text>
          <Text>{weatherData.location.region}</Text>
          <Text>{weatherData.location.country}</Text>
          <Text>{weatherData.location.localtime}</Text>
          </>
        )}
        <Text>Home</Text>
        {location && (
          <Text>
            Latitude: {latitude}
            Longitude: {longitude}
          </Text>
        )}
        {weatherData && ( 
          <>
          <Image source={{uri: `https:${weatherData.current.condition.icon}`}} style={{width: 64, height: 64}} />
          <Text>{weatherData.current.condition.text}</Text>
          <Text>Feels Like: {weatherData.current.feelslike_c}°C</Text>
          <Text>Humidity: {weatherData.current.humidity}%</Text>
          <Text>Wind Speed: {weatherData.current.wind_kph} km/h</Text>
          </>
        )}
        {weatherData && (
          <>
          <Text>Sunrise : {weatherData.forecast.forecastday[0].astro.sunrise}</Text>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
