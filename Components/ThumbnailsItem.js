import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'

class ThumbnailsItem extends React.Component {
    render() {
        const { thumbnails } = this.props
      return (
        <TouchableOpacity style={styles.main_container}>
            <View style={styles.content_container}>
            <View style={styles.header_container}>
                <Text style={styles.title_text}>{thumbnails.name}</Text>
                <Text style={styles.vote_text}>{thumbnails.id}</Text>
            </View>
            <View style={styles.description_container}>
                <Text style={styles.description_text} numberOfLines={6}>{thumbnails.value}</Text>
            </View>
            </View>
      </TouchableOpacity>
      )
    }
  }
  
  const styles = StyleSheet.create({
    main_container: {
        height: 190,
        flexDirection: 'row'
      },
      content_container: {
        flex: 1,
        margin: 5
      },
      header_container: {
        flex: 3,
        flexDirection: 'row'
      },
      title_text: {
        fontWeight: 'bold',
        fontSize: 20,
        flex: 1,
        flexWrap: 'wrap',
        paddingRight: 5
      }
  })
  
  export default ThumbnailsItem