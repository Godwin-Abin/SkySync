import { Image, StyleSheet, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Home from './src/components/Home';
import Search from './src/components/Search';
import Notification from './src/components/Notification';

export default function App() {

  const Tab = createBottomTabNavigator();
  const HomeStack = createNativeStackNavigator();

  const HomeTabs = ()=>(
    <Tab.Navigator
        screenOptions={({route})=>({
          tabBarStyle: {
            backgroundColor: '#62cff4',
            borderColor:'#62cff4',
            shadowColor:'#62cff4',
          },
          tabBarIcon:({focused})=>{
            let iconPath ; 
            if (route.name === "Home"){
              iconPath = focused ? require('./src/assets/Icons/homeActive.png') : require('./src/assets/Icons/homeInactive.png');
            }
            else if (route.name === "Search"){
              iconPath = focused? require('./src/assets/Icons/searchActive.png') : require('./src/assets/Icons/searchInactive.png');
            }
            else if (route.name === "Notification"){
              iconPath = focused? require('./src/assets/Icons/bellActive.png') : require('./src/assets/Icons/bellInactive.png');
            }
            return (
              <Image style={styles.image} source={iconPath} />
            );
          },
          tabBarLabel:'',
        })}
      >
        <Tab.Screen name="Home" component={Home} options={{headerShown: false}} />
        <Tab.Screen name="Search" component={Search} options={{headerShown: false}} />
        <Tab.Screen name="Notification" component={Notification} options={{headerShown: false}} />
      </Tab.Navigator>
  )

  return (
        <NavigationContainer>
          <HomeStack.Navigator>
            <HomeStack.Screen name="Main" component={HomeTabs} options={{headerShown: false}} />
          </HomeStack.Navigator>
        </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  image: {
    width: 25,
    height: 25,
  },
});
