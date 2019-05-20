import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native'
import { getThumbnails } from '../../utils/api/Api'

class ThumbnailsItem extends React.Component {

    constructor(props) {
      super(props)
      this.state = {
        thumbnails: [],
        backgroundColor: 'white'
      }
    }

    componentWillMount(){
      this.backgroundColor()
    }

    backgroundColor(){
      getThumbnails().then(data => {
        if(data.thumbnails[0].states === "prod"){
          this.setState({
            backgroundColor: '#8ee06d' // vert
          })
        }
        if(data.thumbnails[0].states === "qaa"){
          this.setState({
            backgroundColor: 'green' // vert
          })
        }
        if(data.thumbnails[0].states === "high"){
          this.setState({
            backgroundColor: '#fd5d54'
          })
        }if(data.thumbnails[0].states === "hs"){
          this.setState({
            backgroundColor: '##9a9a9a'
          })
        }else{
          this.setState({
            backgroundColor: 'white'
          })
        }
      })
    }

    render() {
        const { thumbnails } = this.props;
        const { backgroundColor } = this.state;
      return (
        <TouchableOpacity onPress={() => {this.notif.localNotif()}}>
          <View style={[{backgroundColor: backgroundColor},styles.button, styles.main_container]}>
          <Image style={styles.imageButton} source={require('../../assets/images/hygrometry.png')}/>
            <View style={styles.content_container}>
              <View style={styles.header_container}>
                <Text style={styles.title_text}>{thumbnails.name}</Text>
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
      //borderWidth: 5,
      //borderColor: "#fff",
      margin: 5,
      padding: 5,
      width: 200,
      height: 90,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
      /*'hover': {
        border: '1px solid black',
        //borderWidth: 5,
        borderColor: "#fff",
      },*/
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