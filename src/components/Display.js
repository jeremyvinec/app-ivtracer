/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import { Button, StyleSheet, Text, View, TouchableOpacity, Alert, Image } from 'react-native';
import NotifService from './thumbnails/NotifService';
import appConfig from './app/app.json';

class Display extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      senderId: appConfig.senderID,
      thumbnails: [],
    };
    this._recoverThumbnails = this._recoverThumbnails.bind(this);
    this.notif = new NotifService(this.onRegister.bind(this), this.onNotif.bind(this));
  }

  componentDidMount(){
    this._recoverThumbnails()
  }

  _recoverThumbnails() {
    fetch('https://raw.githubusercontent.com/jeremyvinec/thumbnails-json/master/data.json')
      .then(response => {
          response.json().then(data => {
            console.log(data)
            console.log(data['thumbnails'][0])
            console.log(data.thumbnails[0].name)
            this.setState({
              thumbnails : [...this.state.thumbnails, ...data.results]
            })
          })
      })
      .catch(error => {
        console.log(error.message);
          throw error;
        });
  }

  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.logo} source={require('../assets/images/logo.png')}/>
        <View style={styles.spacer}/>
        <View>
          <Text style={styles.text}>3 BOUCLES EN ALARMES</Text>
          <Text style={styles.text}>ET/OU A ACQUITTER</Text>
        </View>
        <View style={styles.spacer}/>
        <TouchableOpacity onPress={() => {this.notif.localNotif()}}>
          <View style={[styles.button, styles.main_container]}>
          <Image style={styles.imageButton} source={require('../assets/images/hygrometry.png')}/>
            <View style={styles.content_container}>
              <View style={styles.header_container}>
                <Text style={styles.title_text}>11 UU97533-12008</Text>
              </View>
              <View style={styles.percentage_container}>
                <Text style={styles.textButton}>67%</Text>
                <Image source={require('../assets/images/ArrowUp.png')}/>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {this.notif.localNotif()}}>
          <View style={[styles.button, styles.jaune, styles.main_container]}>
          <Image style={styles.imageButton} source={require('../assets/images/temperature.png')}/>
            <View style={styles.content_container}>
              <View style={styles.header_container}>
                <Text style={styles.title_text}>44 DP11000-11019</Text>
              </View>
              <View style={styles.percentage_container}>
                <Text style={styles.textButton}>31°C</Text>
                <Image source={require('../assets/images/ArrowDown.png')}/>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {this.notif.localNotif()}}>
          <View style={[styles.button, styles.vert, styles.main_container]}>
          <Image style={styles.imageButton} source={require('../assets/images/hygrometry.png')}/>
            <View style={styles.content_container}>
              <View style={styles.header_container}>
                <Text style={styles.title_text}>44 DP11000-11019</Text>
              </View>
              <View style={styles.percentage_container}>
                <Text style={styles.textButton}>876 ppm</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
          <View style={styles.spacer}/>
          <Button style={styles.button} title='Schedule Notification in 30s' onPress={() => {this.notif.scheduleNotif()}}/>
          <View style={styles.spacer}/>
          <Button style={styles.button} title='Cancel all notifications' onPress={() => {this.notif.cancelAll()}}/>
      </View>
    );
  }

  onRegister(token) {
    Alert.alert("Registered !", JSON.stringify(token));
    console.log(token);
    this.setState({ registerToken: token.token, gcmRegistered: true });
  }

  onNotif(notif) {
    console.log(notif);
    Alert.alert(notif.title, notif.message);
  }

  handlePerm(perms) {
    Alert.alert("Permissions", JSON.stringify(perms));
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#4C626F',
  },
  main_container: {
    height: 90,
    flexDirection: 'row',
  },
  content_container: {
    flex: 1,
  },
  header_container: {
    flexDirection: 'row'
  },
  percentage_container: {
    flexDirection: 'row',
    marginTop: 1
  },
  button: {
    borderWidth: 5,
    borderColor: "#fff",
    margin: 5,
    padding: 5,
    width: 200,
    height: 90,
    backgroundColor: "#FD5D54",
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jaune: {
    backgroundColor: '#FDB44B' 
  },
  vert: {
    backgroundColor: '#84EF42'
  },
  title_text: {
    color: "#fff",
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5
  },
  textButton:{
    color: "#fff",
    fontSize: 17,
    fontWeight: 'bold',
    paddingRight: 65
  },
  imageButton: {
    height: 40,
    width: 40,
    margin: 2,
  },
  spacer: {
    height: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
  },
  logo: {
    marginTop: 50,
    height: 76,
    width: 253,
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: 'center'
  }
});

export default Display
