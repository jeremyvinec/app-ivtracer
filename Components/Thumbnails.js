import React from 'react'
import { StyleSheet, View, Text, Image } from 'react-native'
import ThumbnailsList from './ThumbnailsList'
import { getThumbnails } from '../API/Api'

class Thumbnails extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
          thumbnails: [],
        };
        this._recoverThumbnails = this._recoverThumbnails.bind(this);
      }
    
      componentDidMount(){
        this._recoverThumbnails()
      }

      /*id(){
        return '_' + Math.random().toString(36).substr(2,9)
      }
    
      replaceId( field, oldvalue, newvalue){
        getThumbnails().then(data => {
          for(var k=0; k < data.lenght; ++k){
            if( oldvalue == data[k][field]){
              data[k][field] = newvalue;
            }
          }
          return data
        })
      }*/
    
      _recoverThumbnails() {
        getThumbnails().then(data => {
          //console.log(data)
            this.setState({
                thumbnails: this.state.thumbnails.concat(data.thumbnails) // ajouter les vignettes à ceux que l'on a déjà récupérés, deux copies de nos tableaux pour que la concaténation fonctionne
              })
        })
      } 

    render(){
        return(
            <View style={styles.container}>
                <Image style={styles.logo} source={require('../Images/logo.png')}/>
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
}

const styles = StyleSheet.create({
    list: {
        flex: 1
    },
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
    },
    thumbnails_list : {
      height: '65%'
    }
})

export default Thumbnails