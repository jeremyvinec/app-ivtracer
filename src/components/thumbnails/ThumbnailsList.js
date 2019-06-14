import React from 'react'
import { StyleSheet, FlatList } from 'react-native'
import ThumbnailsItem from './ThumbnailsItem'
import NotifService from './NotifService'

class ThumbnailsList extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      thumbnails: [],
    }
    this.notif = new NotifService()
  }

  _displayNotif(){
    console.log('ok')
    this.notif.localNotif()
  }

  render() {
    return (
        <FlatList
          contentInset={{bottom: 90}}
          style={styles.list}
          data={this.props.thumbnails}
          extraData={this.state}
          keyExtractor={(item) => item.id}
          renderItem={({item}) => ( 
            <ThumbnailsItem 
              thumbnails={item}
              displayNotif={this._displayNotif} 
            />
          )}
        />
    )
  }
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
})

export default ThumbnailsList
