import React from 'react'
import { StyleSheet, View, Text, Image, Button, ActivityIndicator } from 'react-native'
import ThumbnailsList from './ThumbnailsList'

// Notification
import NotifService from './NotifService'
import appConfig from '../app/app.json';

// API
import { getThumbnails } from '../../utils/api/Api'

class Thumbnails extends React.Component {

    constructor(props){
      super(props)
      this.state = {
        senderId: appConfig.senderID,
        thumbnails: [],
      };
      this._recoverThumbnails = this._recoverThumbnails.bind(this);
    }

    componentDidMount(){
      // Dans la plupart des cas, il est préférable d'attendre après le montage pour charger les données. 
      this.interval = setInterval(this._recoverThumbnails, 1000)
    }

    componentWillUnmount(){
      clearInterval(this.interval)
    }

    _recoverThumbnails() {
      console.log('update')
      getThumbnails().then(data => {
          //console.log(data.thumbnails)
  
          // infos des vignettes
          this.setState({
              thumbnails: data.thumbnails
            })
  
      })
    }

    


    render(){
      return (
        <View style={styles.container}>
            <Image style={styles.logo} source={require('../../assets/images/logo.png')}/>
            <View style={styles.spacer}/>
            <View>
                <Text style={styles.text}>{this.state.thumbnails.length} BOUCLES EN ALARMES ET/OU A ACQUITTER</Text>
            </View>
            <View style={styles.spacer}/>
            <View style={styles.thumbnails_list}>
              <ThumbnailsList
                  thumbnails={this.state.thumbnails}
                  recoverThumbnails={this._recoverThumbnails}
                />
            </View>
        </View>
      )
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
    loading_container: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center'
    },
    spacer: {
      height: 10,
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
    },
    thumbnails_list : {
      height: '65%'
    }
})

export default Thumbnails