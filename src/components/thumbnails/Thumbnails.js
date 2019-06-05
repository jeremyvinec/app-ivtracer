import React from 'react'
import { StyleSheet, View, Text, Image, Button, Alert } from 'react-native'
import ThumbnailsList from './ThumbnailsList'

// Notification
import NotifService from '../notif-service';
import appConfig from '../app/app.json';

// API
import { getThumbnails } from '../../utils/api/Api'

class Thumbnails extends React.Component {
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
        getThumbnails().then(data => {
            //console.log(data.thumbnails)

            // infos des vignettes
            this.setState({
                thumbnails: this.state.thumbnails.concat(data.thumbnails) // ajouter les vignettes à ceux que l'on a déjà récupérés, deux copies de nos tableaux pour que la concaténation fonctionne
              })
        })
      }

    render(){
        return(
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
                <Button title='notif' onPress={() => this.notif.localNotif()}/>
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