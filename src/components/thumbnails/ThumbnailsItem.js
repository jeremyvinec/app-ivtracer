import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Image, Animated } from 'react-native'

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
      this.color = '#fff',
      this.fontStyle = 'normal',
      this.fontWeight = 'normal'
      const states = this.props.thumbnails.states
      this.value = states.split(' ')
      this._arrow = this._arrow.bind(this)
      this.state = {
        opacity: new Animated.Value(0.7)
      }
    }

    componentWillMount(){
      this._getImageFromType()
      this._backgroundColor()
      this._color()
      this._arrow()
      this._animate()
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
      value = this.value
      //console.log(states)
      if(value.includes('hs')){
        this.backgroundColor = '#ddd' // lighten-grey
      } else if(value.includes('alarme')){
        this.backgroundColor = '#ffe4dd' // $pale-red
      } else if(value.includes('prealarme')){
        this.backgroundColor = '#ffe5b4' // $pale-orange
      } else if(value.includes('prod')){
        this.backgroundColor = '#e8ffcd' // $pale-green
      }
    }

    _color(){
      value = this.value
      if(value.includes('qaa')){
        this.color = '#005dbf' //$lime-blue
      } else if(value.includes('qai')){
        this.color = '#005dbf' //$lime-blue
      } else if(value.includes('qai')){
        this.color = '#005dbf', //$lime-blue
        this.fontStyle = 'italic'
      } else if(value.includes('hs')){
        this.color = '#9a9a9a' // $grey
      } else if(value.includes('notack')){
        this.fontWeight = 'bold'
      }
    }

    _arrow(){
      value = this.value       
      if(value.includes('high')){
        return(
          <Image className="float-sm-right" style={styles.arrow} source={require('../../assets/images/ArrowUp.png')}/>
        )
      } else if(value.includes('low')){
        return(
          <Image className="float-sm-right" style={styles.arrow} source={require('../../assets/images/ArrowDown.png')}/>
        )
      }
    }

    _animate(){
      value = this.value
      Animated.sequence([
        Animated.timing(this.state.opacity, {
            delay: 1500,
            duration: 1000,
            toValue: 0.7,
            animationIterationCount : 'infinite'
        }),
        Animated.timing(this.state.opacity, {
            delay: 500,
            duration: 500,
            toValue: 1.0,
            animationIterationCount : 'infinite'
        })
      ]).start();
    }

    render() {
        const { thumbnails } = this.props;
      return (
        <TouchableOpacity>
          <Animated.View style={[{backgroundColor: this.backgroundColor, opacity: this.state.opacity},styles.button, styles.main_container]}>
          <Image className={thumbnails.type} style={styles.imageButton} source={this.icons}/>
            <View style={styles.content_container}>
              <View style={styles.header_container}>
                <Text style={[{color: this.color, fontStyle: this.fontStyle, fontWeight: this.fontWeight},styles.title_text]}>{thumbnails.name}</Text>
              </View>
              <View style={styles.percentage_container}>
                <Text className="float-sm-left" style={[{color: this.color}, styles.textButton]}>{thumbnails.value}{' '}{thumbnails.unit}</Text>
                {this._arrow()}
              </View>
            </View>
          </Animated.View>
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
      marginTop: 5
    },
    textButton:{
      fontSize: 17,
      fontWeight: '700',
    },
    imageButton: {
      height: 40,
      width: 40,
      margin: 2,
    },
    spacer: {
      height: 10,
    },
    arrow: {
      height: 20,
      width: 20
    }
  });
  
  export default ThumbnailsItem