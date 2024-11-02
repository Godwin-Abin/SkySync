import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Search() {
  const [weatherData, setWeatherData] = useState(null);
  let api = 'https://api.weatherapi.com/v1/';
  const[inputText,setInputText] = useState('');
  // console.log(inputText);

  const fetchWeatherData = async () => {
    try {
      const response = await axios.get(`${api}forecast.json`, {
        params: {
          key: 'c77ef9b9b83c4b27b40165218242109',
          q: `${inputText}`,
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
          <Text>{weatherData.location.name}</Text>
          <Text>{weatherData.location.region}</Text>
          <Text>{weatherData.location.country}</Text>
          <Text>{weatherData.location.localtime}</Text>
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
  }
});