import React from 'react'
import { StyleSheet, Image } from 'react-native'
import { createStackNavigator, createBottomTabNavigator, createAppContainer } from 'react-navigation'
import Thumbnails from '../components/thumbnails/Thumbnails'

const ThumbnailsStackNavigator = createStackNavigator({
    Thumbnails: {
      screen: Thumbnails,
      navigationOptions: {
        title: 'Afficheur'
      }
    }
  })
  
  const DisplayTabNavigator = createBottomTabNavigator(
    {
      Thumbnails: {
        screen: ThumbnailsStackNavigator,
        navigationOptions: {
          tabBarIcon: () => {
            return <Image
              source={require('../assets/images/icons/launcher-icon-2x.png')}
              style={styles.icon}/>
          }
        }
      },
      Thumbnails: {
        screen: ThumbnailsStackNavigator,
        navigationOptions: {
          tabBarIcon: () => {
            return <Image
              source={require('../assets/images/icons/launcher-icon-2x.png')}
              style={styles.icon}/>
          }
        }
      }
    },
    {
      tabBarOptions: {
        activeBackgroundColor: '#DDDDDD',
        inactiveBackgroundColor: '#FFFFFF',
        showLabel: false,
        showIcon: true
      }
    }
  )
  
  const styles = StyleSheet.create({
    icon: {
      width: 30,
      height: 30
    }
  })
  
  export default createAppContainer(DisplayTabNavigator)