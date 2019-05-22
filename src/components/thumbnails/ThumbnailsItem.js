import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native'
import { getThumbnails } from '../../utils/api/Api'
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

class ThumbnailsItem extends React.Component {

    constructor(props) {
      super(props)
      this.icons = [],
      this.state = {
        thumbnails: [],
        backgroundColor: 'transparent',
        color: '#fff',
        icons: [],
      }
      this.backgroundColor = this.backgroundColor.bind(this)
    }

    componentWillMount(){
      //this.backgroundColor();
      this._typeIcon()
    }

    _typeIcon(){
      getThumbnails().then(data => {
        for(i in data.thumbnails){
          if(data.thumbnails[i].type === "temperature"){
            this.icons = temperature
          } else if(data.thumbnails[i].type == "hygrometry"){
            this.icons = hygrometry
          }
          /*switch (data.thumbnails[i].type){
            case 'temperature': {
              this.setState({ icons : temperature });
              //console.log('temperature');
              break;
            }
            case 'hygrometry': {
              this.setState({ icons : hygrometry });
              //console.log('hygometry');
              break;
            }
            case 'concentration': {
              this.setState({ icons : concentration });
              //console.log('concentration');
              break;
            }
            case 'conductivity': {
              this.setState({ icons : conductivity });
              //console.log('conductivity');
              break;
            }
            case 'flow': {
              this.setState({ icons : flow });
              //console.log('flow');
              break;
            }
            case 'generic': {
              this.setState({ icons : generic });
              //console.log('generic');
              break;
            }
            case 'particle': {
              this.setState({ icons : particle });
              //console.log('particle');
              break;
            }
            case 'pressure': {
              this.setState({ icons : pressure });
              //console.log('pressure');
              break;
            }
            case 'speed': {
              this.setState({ icons : speed });
              //console.log('speed');
              break;
            }
            case 'toc': {
              this.setState({ icons : toc });
              //console.log('toc');
              break;
            }
            case 'tor': {
              this.setState({ icons : tor });
              //console.log('tor');
              break;
            }
          }*/
        }
      })
    }

    backgroundColor(){
      getThumbnails().then(data => {
        //console.log(data.thumbnails)
        for(i in data.thumbnails){
          let states = data.thumbnails[i].states
          let words = states.split(" ")
          if(words == "high"){
            this.setState({ backgroundColor: '#fd5d54' });
            console.log('high')
          } else if(words == "prod"){
            this.setState({ backgroundColor: '#8ee06d' });
          }
          //console.log(data.thumbnails[i].states)
          //let states = data.thumbnails[i].states
          //let words = states.split(" ")
          //console.log(words)
          /*switch(data.thumbnails[i].states){
            case 'high': {
              this.setState({ backgroundColor: '#fd5d54' });
              console.log('high');
              break;
            }
            case 'prod': {
              this.setState({ backgroundColor: '#8ee06d' });
              console.log('prod');
              break;
            }
            case 'hs': {
              this.setState({ backgroundColor: '#ddd' });
              console.log('hs');
              break;
            }
            case 'prealarme': {
              this.setState({ backgroundColor: '#fdb44b' });
              console.log('prealarme');
              break;
            }
            default: { 
              console.log('nothing');
              break; 
            }
          }*/
        }
      })
    }

    render() {
        const { thumbnails } = this.props;
        const { backgroundColor, color, icons } = this.state;
      return (
        <TouchableOpacity onPress={() => {this.notif.localNotif()}}>
          <View style={[{backgroundColor: backgroundColor},styles.button, styles.main_container]}>
          <Image style={styles.imageButton} source={this.icons}/>
            <View style={styles.content_container}>
              <View style={styles.header_container}>
                <Text style={[{color: color},styles.title_text]}>{thumbnails.name}</Text>
              </View>
              <View style={styles.percentage_container}>
                <Text className="float-sm-left" style={styles.textButton}>{thumbnails.value}{' '}{thumbnails.unit}</Text>
                <Image className="float-sm-right" style={styles.arrow} source={require('../../assets/images/ArrowUp.png')}/>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )
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
      marginTop: 1,
      justifyContent: 'space-between'
    },
    button: {
      margin: 5,
      padding: 5,
      width: 200,
      height: 90,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
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
    arrow: {
      height: 20,
      width: 20
    }
  });
  
  export default ThumbnailsItem