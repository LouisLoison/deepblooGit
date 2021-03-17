import axios from 'axios'

//------------------------------------------------------------------------------

export function setPipelineDialog ({ commit }, { isVisible, tender }) {
  commit('UPDATE_PIPELINE_DIALOG', { isVisible: isVisible, tender: tender})
}

//------------------------------------------------------------------------------

export function setPreviewTender ({ commit }, { prevState, data }) {
    let tenderUuid = null

    if (data.tender_uuid && data.tender_uuid.raw) {
      tenderUuid = data.tender_uuid.raw
    }
    else if (data.id) {
      tenderUuid = data.id
      if (data.id.raw) {
        tenderUuid = data.id.raw
      }
    }
    commit('UPDATE_PREVIEW', { prevState: prevState, uuid: tenderUuid})
}

//------------------------------------------------------------------------------

export async function addCercle({ state }, country) {
  axios.get('https://api.opencagedata.com/geocode/v1/json?q=' + country.raw + '&key=ee798bc1ea2d4590a7831a9487caa208&language=en&pretty=1')
    .then(response => {
      const index = state.cercleZone.find(x => {
        return x.country === country.raw
      })
      if (index === undefined) {
        state.cercleZone.push({
          type: 'Cercle',
          country: country.raw,
          nb: 1,
          lat: response.data.results[0].geometry.lat,
          lng: response.data.results[0].geometry.lng
        })
      } else {
        index.nb += 1
      }
    })
}

export async function setPosData({ state, dispatch }) {
  state.cercleZone = []
  state.searchResult.map( x => {
    if (x.country.raw === 'Spain') {
      x.pos = {
        type: 'Pos',
        lat: Math.random() + 40.463667  ,
        lng: Math.random() + -3.749220
      }
    } else if (x.pos === undefined) {
      dispatch('addCercle', x.country)
    }
    return x
  })
}

//------------------------------------------------------------------------------
