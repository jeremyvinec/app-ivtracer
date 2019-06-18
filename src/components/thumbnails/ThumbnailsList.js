import React from 'react'
import { StyleSheet, FlatList } from 'react-native'
import ThumbnailsItem from './ThumbnailsItem'

class ThumbnailsList extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      thumbnails: [],
    }
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
