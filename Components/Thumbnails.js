import React from 'react'
import { StyleSheet, Button, View, Text } from 'react-native'
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
    
      _recoverThumbnails() {
        getThumbnails().then(data => {
            const returnedTarget = JSON.stringify(Object.assign(data));
            console.log(returnedTarget)
            console.log(data['thumbnails'][0])
            this.setState({
                thumbnails: this.state.thumbnails.concat(data.thumbnails) // ajouter les vignettes à ceux que l'on a déjà récupérés, deux copies de nos tableaux pour que la concaténation fonctionne
              })
        })
      } 

    render(){
        return(
            <View style={styles.main_container}>
                <Button title='rechercher' onPress={() => {this._recoverThumbnails()}} />
                <ThumbnailsList
                    thumbnails={this.state.thumbnails}
                    recoverThumbnails={this._recoverThumbnails}
                 />
          </View>
        )
    }
}

const styles = StyleSheet.create({
    list: {
        flex: 1
    },
    main_container: {
        flex: 1,
        marginTop: 20,
    }
})

export default Thumbnails