import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import React, { useState } from 'react';
import axios from 'axios'; // Import axios
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import {API_KEY} from '@env';

export default function Search() {
  const [weatherData, setWeatherData] = useState(null);
  let api = 'https://api.weatherapi.com/v1/';
  const[inputText,setInputText] = useState('');
  // console.log(inputText);

  const fetchWeatherData = async () => {
    try {
      const response = await axios.get(`${api}forecast.json`, {
        params: {
          key: API_KEY,
          q: `${inputText}`,
          aqi:"yes",
          days: "7"
        }
      });
      const data = response.data;
      setWeatherData(data); 
    } catch (error) {
      // console.error(error);
      alert('Location not found. Please try again.');
    }
  };

  return (
    <LinearGradient colors={['#2c67f2', '#62cff4']} style={styles.container}>
      <SafeAreaView>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Search</Text>
        </View>
        <View style={styles.left}>
          <View style={styles.inputContainer}>
            <TextInput
              value={inputText}
              onChangeText={setInputText} 
              style={styles.typeText} 
              placeholder='city name / coordinates' 
            />
            <TouchableOpacity onPress={() =>{
              if(inputText!==''){
                fetchWeatherData();
              }
            }} style={styles.searchButton}>
              <Image style={styles.image} source={require('../assets/Icons/search.png')} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
      <ScrollView>
      <View style={styles.dataContainer}>
          {weatherData && (
            <>
              <View style={styles.locationContainer}>
                <Text style={styles.cityName}>{weatherData.location.name}</Text>
                <Text style={styles.regionText}>{weatherData.location.region}, {weatherData.location.country}</Text>
                <Text style={styles.timeText}>{weatherData.location.localtime}</Text>
              </View>

              <View style={styles.currentWeather}>
                <Image 
                  style={styles.weatherIcon} 
                  source={{ uri: 'https:' + weatherData.current.condition.icon }} 
                />
                <Text style={styles.temperature}>{weatherData.current.temp_c}°C</Text>
                <Text style={styles.condition}>{weatherData.current.condition.text}</Text>
              </View>

              <View style={styles.detailsContainer}>
                <View style={styles.weatherDetail}>
                  <Text style={styles.detailLabel}>Humidity</Text>
                  <Text style={styles.detailValue}>{weatherData.current.humidity}%</Text>
                </View>
                <View style={styles.weatherDetail}>
                  <Text style={styles.detailLabel}>Wind</Text>
                  <Text style={styles.detailValue}>{weatherData.current.wind_kph} km/h</Text>
                </View>
                <View style={styles.weatherDetail}>
                  <Text style={styles.detailLabel}>Feels Like</Text>
                  <Text style={styles.detailValue}>{weatherData.current.feelslike_c}°C</Text>
                </View>
              </View>
              <View style={styles.hourlyContainer}>
                <Text style={styles.sectionTitle}>Today's Forecast</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.hourlyScrollContent}
                >
                  {weatherData.forecast.forecastday[0].hour
                    .filter(hourData => {
                      const hourTime = new Date(hourData.time);
                      const currentTime = new Date();
                      return hourTime >= currentTime;
                    })
                    .map((hourData, index) => (
                      <View key={index} style={styles.hourlyItem}>
                        <Text style={styles.hourText}>
                          {new Date(hourData.time).getHours()}:00
                        </Text>
                        <Image 
                          style={styles.hourlyIcon} 
                          source={{ uri: 'https:' + hourData.condition.icon }} 
                        />
                        <Text style={styles.hourlyTemp}>{hourData.temp_c}°C</Text>
                      </View>
                    ))}
                </ScrollView>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding:15,
  },
  headerContainer:{
    alignItems: 'center',
  },
  header:{
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
    paddingTop: 4,
  },
  typeText:{
    fontSize: 17,
    color:"#ccc",
    fontWeight:'500',
    flex: 1,
    paddingHorizontal: 10,
  },
  left:{
    justifyContent: 'center',
    alignItems: 'center',
    padding: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
  },
  searchButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  dataContainer:{
    flex:1,
    paddingTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image:{
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  locationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cityName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  regionText: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.8,
  },
  timeText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.7,
    marginTop: 5,
  },
  currentWeather: {
    alignItems: 'center',
    marginBottom: 20,
  },
  weatherIcon: {
    width: 100,
    height: 100,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  condition: {
    fontSize: 20,
    color: '#fff',
    opacity: 0.9,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  weatherDetail: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 10,
    minWidth: 100,
  },
  detailLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
  },

  hourlyContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
    height: 160,
  },
  hourlyScrollContent: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  hourlyItem: {
    alignItems: 'center',
    marginRight: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 10,
    minWidth: 80,
    height: 110, // Fixed height for each item
    justifyContent: 'space-between'
  },
  hourText: {
    color: '#fff',
    fontSize: 16,
  },
  hourlyIcon: {
    width: 40,
    height: 40,
    marginVertical: 5,
  },
  hourlyTemp: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});