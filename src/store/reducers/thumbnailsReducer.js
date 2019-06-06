const initialState = { thumbnails: [] }

function updateThumbnails(state = initialState, action){
    let nextState
    switch (action.type) {
        case 'UPDATE_THUMBNAILS':
            const thumbnailsIndex = state.thumbnails.findIndex(item => item.id === action.value.id)
            if(thumbnailsIndex !== -1){
                // la vignette est déjà a jour, on le supprime
                nextState = {
                    ...state,
                    thumbnails: state.thumbnails.filter( (item, index) => index !== thumbnailsIndex)
                }
            }
            else {
                // la vignette n'es pas à jour, on l'ajoute
                nextState = {
                    ...state,
                    thumbnails: [...state.thumbnails, action.value]
                }
            }
            return nextState || state
        default:
            return state
    }
}

export default updateThumbnails