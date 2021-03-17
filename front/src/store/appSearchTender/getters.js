
export function getSearchResult(state) {
  return state.searchResult
}

export function getCercleZone(state) {
  return state.cercleZone
}

export function getTenders(state) {
  return state.tenderPreview
}

//------------------------------------------------------------------------------

export function getPreviewInfo(state) {
  return state.preview
}

export function getPreviewState(state) {
  return state.preview.state
}

export function getPreviewUUID(state) {
  return state.preview.uuid
}

//------------------------------------------------------------------------------

export function getPipelineDialogState(state) {
  return state.pipelineDialog.isVisible
}

export function getPipelineDialogTender(state) {
  return state.pipelineDialog.tender
}

//------------------------------------------------------------------------------
