import React from 'react'
import { StyleSheet, Image } from 'react-native'
import { connect } from 'react-redux'

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

class IconsType extends React.Component{
    constructor(props){
        super(props)
        this._iconsType = this._iconsType.bind(this)
    }

    _iconsType(){
        getThumbnails().then(data => {
            console.log(data.thumbnails)

            // récupérer les icons en fonctions de leurs types
            /*for(i in data.thumbnails){
                switch (data.thumbnails[i].type){
                  case 'temperature': {
                    this.icons = temperature
                    //this.setState({ icons : temperature });
                    console.log('temperature');
                    break;
                  }
                  case 'hygrometry': {
                    this.icons = hygrometry
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
              
              // récupérer le backgroundColor
              for(i in data.thumbnails){
                let states = data.thumbnails[i].states;
                let words = states.split(' ')
                console.log([...words])
                switch([...words]){
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
                }
              }*/
        })
    }

    render(){
        /* A présent on récupérer notre icons dans les props. Souvenez-vous Redux mappe notre state global et ses données dans les props de notre component. */
        return(
            <Image style={styles.imageButton} source={this._iconsType()}/>
        )
    }
}


const styles = StyleSheet.create({
    imageButton: {
        height: 40,
        width: 40,
        margin: 2
    }
})

const mapStateToProps = state => {
    return{
        icons: state.iconsType.icons
    }
}

export default connect(mapStateToProps)(IconsType)

