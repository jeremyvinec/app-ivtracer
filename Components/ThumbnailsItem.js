import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native'

class ThumbnailsItem extends React.Component {
    render() {
        const { thumbnails } = this.props
      return (
        <TouchableOpacity onPress={() => {this.notif.localNotif()}}>
          <View style={[styles.button, styles.main_container]}>
          <Image style={styles.imageButton} source={require('../Images/hygrometry.png')}/>
            <View style={styles.content_container}>
              <View style={styles.header_container}>
                <Text style={styles.title_text}>11 UU97533-12008</Text>
              </View>
              <View style={styles.percentage_container}>
                <Text style={styles.textButton}>67%</Text>
                <Image source={require('../Images/ArrowUp.png')}/>
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
  
  export default ThumbnailsItem