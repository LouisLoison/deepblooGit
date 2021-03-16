
export function getSearchResult(state) {
  return state.searchResult
}

export function getCercleZone(state) {
  return state.cercleZone
}

export function getTenders(state) {
  return state.tenderPreview
}

export function getPreviewInfo(state) {
  return state.preview
}

export function getPreviewState(state) {
  return state.preview.state
}

export function getPreviewUUID(state) {
  console.log('get: ', state.preview.uuid)
  return state.preview.uuid
}
