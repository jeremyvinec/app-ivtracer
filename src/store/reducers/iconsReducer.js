const initialState = { icons: [] }

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

import { getThumbnails } from '../../utils/api/Api'

function iconsType(state = initialState, action) {
  let nextState
  getThumbnails().then(data => {
    for(i in data.thumbnails){
      switch(data.thumbnails[i].type){
        case 'temperature': nextState = {
          ...state,
          icons: [...state.icons, temperature]
        }
        default:
          return state
      }
    }
  })
  switch (action.type) {
    case 'ICONS_TYPE':
        getImageFromType()
      return nextState || state
  default:
    return state;
  }
}

export default iconsType
