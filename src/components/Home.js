import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, RefreshControl, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';
import axios from 'axios';

import {API_KEY} from '@env';

import thermometerIcon from '../assets/Icons/temperature.png';
import windIcon from '../assets/Icons/wind.png';
import dropletIcon from '../assets/Icons/humidity.png';

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
          // console.log(position);
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
          // console.log(position);
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
        // console.log(data);
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

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    }) + ', ' + date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

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
            <View style={styles.locationContainer}>
            <View style={styles.locationRow}>
              <Text style={styles.locationText}>{weatherData.location.name}, {weatherData.location.region}</Text>
              <Image 
                  source={require('../assets/Icons/location.png')} 
                  style={styles.locationIcon}
              />
            </View>
              <Text style={styles.timeText}>{formatDateTime(weatherData.location.localtime)}</Text>
            </View>

            <View style={styles.mainWeatherContainer}>
              <Image 
                source={{uri: `https:${weatherData.current.condition.icon}`}} 
                style={styles.weatherIcon} 
              />
              {/* <Text style={styles.temperatureText}>{weatherData.current.temp_c}°</Text> */}
            </View>

            <View style={styles.weatherDetailsContainer}>
              <WeatherDetail 
                title="Temp" 
                icon="thermometer" 
                value={`${weatherData.current.temp_c}°c`}
              />
              <WeatherDetail 
                title="Wind" 
                icon="wind" 
                value={`${weatherData.current.wind_kph} km/h`}
              />
              <WeatherDetail 
                title="Humidity" 
                icon="droplet" 
                value={`${weatherData.current.humidity}%`}
              />
            </View>

            <View style={styles.forecastContainer}>
              <View style={styles.forecastHeader}>
                <Text style={styles.forecastTitle}>Today</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {weatherData.forecast.forecastday[0].hour
                .filter(hour => new Date(hour.time) >= new Date())
                .map((hour, index) => (
                  <View key={index} style={styles.hourlyForecast}>
                    <Text style={styles.hourText}>
                      {hour.time.split(' ')[1]}
                    </Text>
                    <Image 
                      source={{uri: `https:${hour.condition.icon}`}} 
                      style={styles.smallWeatherIcon} 
                    />
                    <Text style={styles.hourlyTemp}>{hour.temp_c}°</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.dailyForecastContainer}>
              <View style={styles.forecastHeader}>
                <Text style={styles.forecastTitle}>Forecast</Text>
              </View>
              {weatherData.forecast.forecastday.map((day, index) => {
                const date = new Date(day.date);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                const dayDate = date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
                
                return (
                  <View key={index} style={[
                    styles.dailyForecastItem,
                    index === weatherData.forecast.forecastday.length - 1 && { borderBottomWidth: 0 }
                  ]}>
                    <View style={styles.dailyForecastLeft}>
                      <Text style={styles.dayName}>{dayName}</Text>
                      <Text style={styles.dayDate}>{dayDate}</Text>
                    </View>
                    <View style={styles.dailyForecastRight}>
                      <Text style={styles.dailyTemp}>{Math.round(day.day.maxtemp_c)}°</Text>
                      <Image 
                        source={{uri: `https:${day.day.condition.icon}`}} 
                        style={styles.dailyWeatherIcon} 
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

// Helper component for weather details
const WeatherDetail = ({ title, value, icon }) => {
  const iconMap = {
    thermometer: thermometerIcon,
    wind: windIcon,
    droplet: dropletIcon,
  };

  return (
    <View style={styles.weatherDetailItem}>
      <View style={styles.detailTitleContainer}>
      <Text style={styles.detailTitle}>{title}</Text>
        <Image 
          source={iconMap[icon]} 
          style={styles.detailIcon}
        />
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    padding: 20,
  },
  locationContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Add this to center the entire row
  },
  locationIcon: {
    width: 26,
    height: 26,
    tintColor: 'white',
    alignSelf: 'center', // Add this to ensure icon is centered vertically\
    position: 'absolute',
    right: "-18%",
  },
  locationText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlignVertical: 'center', // Add this for Android text alignment
  },
  timeText: {
    color: '#rgba(255,255,255,0.8)',
    fontSize: 16,
    marginTop: 5,
  },
  mainWeatherContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  weatherIcon: {
    width: 150,
    height: 150,
  },
    // temperatureText: {
    //   color: 'white',
    //   fontSize: 72,
    //   fontWeight: 'bold',
    // },
  weatherDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
  },
  weatherDetailItem: {
    alignItems: 'center',
  },
  detailTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailTitle: {
    color: '#rgba(255,255,255,0.8)',
    fontSize: 16,
    marginLeft: 10,
  },
  detailIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
    margin:5,
  },
  detailValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forecastContainer: {
    marginTop: 30,
  },
  forecastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  forecastTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAllText: {
    color: '#rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  hourlyForecast: {
    alignItems: 'center',
    marginRight: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    minWidth: 80,
  },
  hourText: {
    color: 'white',
    fontSize: 16,
  },
  smallWeatherIcon: {
    width: 40,
    height: 40,
    marginVertical: 10,
  },
  hourlyTemp: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dailyForecastContainer: {
    marginTop: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
  },
  dailyForecastItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  dailyForecastLeft: {
    flex: 1,
  },
  dailyForecastRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dayName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dayDate: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  dailyTemp: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  dailyWeatherIcon: {
    width: 40,
    height: 40,
  },
});
