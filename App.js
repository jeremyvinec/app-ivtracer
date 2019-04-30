/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Button, StyleSheet, Text, View, TouchableOpacity, Alert, Image } from 'react-native';
import NotifService from './NotifService';
import appConfig from './app.json';

type Props = {};
export default class App extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = {
      senderId: appConfig.senderID
    };

    this.notif = new NotifService(this.onRegister.bind(this), this.onNotif.bind(this));
  }

  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.logo} source={require('./Images/logo.png')}/>
        <View style={styles.spacer}/>
        <Text style={styles.text}>3 BOUCLES EN ALARMES ET/OU A ACQUITTER</Text>
        <TouchableOpacity style={styles.main_container} onPress={() => {this.notif.localNotif()}}>
          <View style={styles.button}>
          <Image style={styles.imageButton} source={require('./Images/hygrometry.png')}/>
            <View style={styles.content_container}>
              <View style={styles.header_container}>
                <Text style={styles.textButton}>11 UU97533-12008</Text>
              </View>
              <View style={styles.percentage_container}>
                <Text style={styles.textButton}>67%</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
          <View style={styles.spacer}/>
          <Button style={styles.button} title='Schedule Notification in 30s' onPress={() => {this.notif.scheduleNotif()}}/>
          <View style={styles.spacer}/>
          <Button style={styles.button} title='Cancel last notification (if any)' onPress={() => {this.notif.cancelNotif()}}/>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4C626F',
  },
  main_container: {
    flexDirection: 'row',
  },
  content_container: {
    flex: 1,
    margin: 3
  },
  percentage_container: {
    flex: 3,
    flexDirection: 'row',
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
  },
  textButton: {
    flex: 3,
    color: "#fff",
    fontSize: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButton: {
    alignItems: 'center',
    height: 40,
    width: 40,
    margin: 3,
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
    height: 76,
    width: 253,
  },
  text: {
    color: "#fff",
  }
});
