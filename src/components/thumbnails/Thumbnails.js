import React from 'react'
import { StyleSheet, View, Text, Image, Button } from 'react-native'
import ThumbnailsList from './ThumbnailsList'
import Display from '../Display'

// API
import { getThumbnails } from '../../utils/api/Api'

// ICONS
import temperature from '../../assets/images/types/temperature.png'
import hygrometry from '../../assets/images/types/hygrometry.png'
import concentration from '../../assets/images/types/concentration.png'
import conductivity from '../../assets/images/types/conductivity.png'
import flow from '../../assets/images/types/flow.png'
import generic from '../../assets/images/types/generic.png'
import particle from '../../assets/images/types/particle.png'
import pressure from '../../assets/images/types/pressure.png'
import speed from '../../assets/images/types/speed.png'
import toc from '../../assets/images/types/toc.png'
import tor from '../../assets/images/types/tor.png'

class Thumbnails extends React.Component {
    constructor(props) {
        super(props)
        //this.icons = [],
        this.state = {
          thumbnails: [],
          icons: [],
        };
        this._recoverThumbnails = this._recoverThumbnails.bind(this);
      }
    
      componentWillMount(){
        this._recoverThumbnails()
      }
    
      _recoverThumbnails() {
        getThumbnails().then(data => {
            //console.log(data.thumbnails)

            // infos des vignettes
            this.setState({
                thumbnails: this.state.thumbnails.concat(data.thumbnails) // ajouter les vignettes à ceux que l'on a déjà récupérés, deux copies de nos tableaux pour que la concaténation fonctionne
              })
            
            // récupérer les icons en fonctions de leurs types
            for(i in data.thumbnails){
              switch (data.thumbnails[i].type){
                case 'temperature': {
                  this.setState({ icons : temperature });
                  console.log('temperature');
                  break;
                }
                case 'hygrometry': {
                  this.setState({ icons : hygrometry });
                  console.log('hygometry');
                  break;
                }
                case 'concentration': {
                  this.setState({ icons : concentration });
                  console.log('concentration');
                  break;
                }
                case 'conductivity': {
                  this.setState({ icons : conductivity });
                  console.log('conductivity');
                  break;
                }
                case 'flow': {
                  this.setState({ icons : flow });
                  console.log('flow');
                  break;
                }
                case 'generic': {
                  this.setState({ icons : generic });
                  console.log('generic');
                  break;
                }
                case 'particle': {
                  this.setState({ icons : particle });
                  console.log('particle');
                  break;
                }
                case 'pressure': {
                  this.setState({ icons : pressure });
                  console.log('pressure');
                  break;
                }
                case 'speed': {
                  this.setState({ icons : speed });
                  console.log('speed');
                  break;
                }
                case 'toc': {
                  this.setState({ icons : toc });
                  console.log('toc');
                  break;
                }
                case 'tor': {
                  this.setState({ icons : tor });
                  console.log('tor');
                  break;
                }
              }
            }

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
                      icons={this.state.icons}
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