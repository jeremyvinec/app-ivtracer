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
          style={styles.list}
          data={this.props.thumbnails}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({item}) => (
            <ThumbnailsItem
              thumbnails={item}
            />
          )}
          onEndReachedThreshold={0.5}
          onEndReached={() => {this.props.recoverThumbnails()}}
        />
    )
  }
}

const styles = StyleSheet.create({
  list: {
    flex: 1
  }
})

export default ThumbnailsList
