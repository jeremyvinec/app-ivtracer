import React from 'react'
import { StyleSheet, FlatList, Button, View, Text } from 'react-native'
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
            console.log(data['thumbnails'][0])
        })
      } 

    render(){
        return(
            <View style={styles.main_container}>
                <Button title='rechercher' onPress={() => {this._recoverThumbnails()}} />
                <Text>{this.state.thumbnails}</Text>
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