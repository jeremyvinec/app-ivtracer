import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native'

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

class ThumbnailsItem extends React.Component {
    constructor(props){
      super(props)
      this.icons = [],
      this.backgroundColor = '#8ee06d',
      this.color = '#fff'
    }

    componentWillMount(){
      this._getImageFromType()
      this._backgroundColor()
      this._color()
      this._arrow()
    }

    _getImageFromType(){
      const type = this.props.thumbnails.type
      //console.log(type)
      if(type === 'temperature'){
        this.icons = temperature
      } else if(type === 'hygrometry'){
        this.icons = hygrometry
      } else if(type === 'concentration'){
        this.icons = concentration
      } else if(type === 'conductivity'){
        this.icons = conductivity
      } else if(type === 'flow'){
        this.icons = flow
      } else if(type === 'generic'){
        this.icons = generic
      } else if(type === 'particle'){
        this.icons = particle
      } else if(type === 'pressure'){
        this.icons = pressure
      } else if(type === 'speed'){
        this.icons = speed
      } else if(type === 'toc'){
        this.icons = toc
      } else if(type === 'tor'){
        this.icons = tor
      }
    }

    _backgroundColor(){
      const states = this.props.thumbnails.states
      const bg = states.split(' ')
      //console.log(states)
      //console.log(bg.includes('hs'))
      if(bg.includes('hs')){
        this.backgroundColor = '#808080'
      } else if(bg.includes('high')){
        this.backgroundColor = '#fd5d54'
      } else if(bg.includes('low')){
        this.backgroundColor = '#fd5d54'
      } else if(bg.includes('alarme')){
        this.backgroundColor = '#ffe4dd' // $pale-red
      } else if(bg.includes('prealarme')){
        this.backgroundColor = '#ffe5b4' // $pale-orange
      } else if(bg.includes('prod')){
        this.backgroundColor = '#e8ffcd' // $pale-green
      }
    }

    _color(){
      const states = this.props.thumbnails.states
      const color = states.split(' ')
      //console.log(color)
      if(color.includes('qaa')){
        this.color = '#005dbf' //$lime-blue
      } else if(color.includes('qai')){
        this.color = '#005dbf' //$lime-blue
      } else if(color.includes('qai')){
        this.color = '#005dbf'
      }
    }

    _arrow(){
      const values = this.props.thumbnails.value
      
      if(values){
        require('../../assets/images/ArrowUp.png')
      } else{
        require('../../assets/images/ArrowDown.png')
      }
    }

    render() {
        const { thumbnails } = this.props;
      return (
        <TouchableOpacity onPress={() => {this.notif.localNotif()}}>
          <View style={[{backgroundColor: this.backgroundColor},styles.button, styles.main_container]}>
          <Image className={thumbnails.type} style={styles.imageButton} source={this.icons}/>
            <View style={styles.content_container}>
              <View style={styles.header_container}>
                <Text style={[{color: this.color},styles.title_text]}>{thumbnails.name}</Text>
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