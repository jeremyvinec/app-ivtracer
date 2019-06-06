import { createStore } from 'redux'
import updateThumbnails from './reducers/thumbnailsReducer'

export default createStore(updateThumbnails)