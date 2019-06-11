import React from 'react'
import { StyleSheet, View, Text, Image, Button, ActivityIndicator } from 'react-native'
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
        };
        this._recoverThumbnails = this._recoverThumbnails.bind(this);
        this.notif = new NotifService(this.onRegister.bind(this), this.onNotif.bind(this));
      }

      state = []

      static getDerivedStateFromProps(nextProps, prevState){
        // Stocke prevUserId dans l'état afin que nous puissions comparer lorsque les accessoires changent. 
        // Efface toutes les données utilisateur précédemment chargées (pour ne pas restituer les données obsolètes).
        if(nextProps.newThumbnails !== prevState.thumbnails){
          return {
            thumbnails: nextProps.newThumbnails,
            profileOrError: null,
          }
        }
        // Aucune mise à jour d'état nécessaire
        return null
      }
    
      componentDidMount(){
        // Dans la plupart des cas, il est préférable d'attendre après le montage pour charger les données. 
        this._recoverThumbnails()
      }

      componentDidUpdate(prevProps, prevState){
        if(this.state.profileOrError === null){
          // A ce stade, nous sommes dans la phase "commit", il est donc prudent de charger les nouvelles données.
          this._recoverThumbnails()
        }
      }

      componentWillUnMount(){
        if(this._asyncRequest){
          this._asyncRequest.cancel()
        }
      }
    
      _recoverThumbnails() {
        this._asyncRequest = getThumbnails().then(data => {
            //console.log(data.thumbnails)
            // infos des vignettes
            this._asyncRequest = null
            this.setState({
                thumbnails: data.thumbnails
              })
        })
      }

      _displayLoading() {
        if (this.state.isLoading) {
          return (
            <View style={styles.loading_container}>
              <ActivityIndicator size='large' />
            </View>
          )
        }
      }

    render(){
      if(this.state.profileOrError === null){
        // Render loading UI
        { this._displayLoading() }
      } else {
        // Render thumbnails data
        return(
          <View style={styles.container}>
              <Image style={styles.logo} source={require('../../assets/images/logo.png')}/>
              <View style={styles.spacer}/>
              <View>
                  <Text style={styles.text}>{/*this.state.thumbnails.length*/} BOUCLES EN ALARMES ET/OU A ACQUITTER</Text>
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