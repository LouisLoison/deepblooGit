
export function UPDATE_SEARCH_RESULT(state, searchResult) {
  state.searchResult = searchResult.results
}

export function UPDATE_TENDER_PREVIEW(state, tenders) {
  state.tenderPreview = tenders
}

//-----------------------------------------------------------------

export function UPDATE_PREVIEW_STATE(state, prevState) {
  state.preview.state = prevState
}

export function UPDATE_PREVIEW_DATA(state, data) {
  state.preview.data = data
}

export function UPDATE_PREVIEW(state, { prevState, uuid }) {
  state.preview.state = prevState
  state.preview.uuid = uuid
}

//-----------------------------------------------------------------

export function UPDATE_PIPELINE_DIALOG(state, { isVisible, tender }) {
  state.pipelineDialog.isVisible = isVisible
  state.pipelineDialog.tender = tender
}

export function UPDATE_PIPELINE_STATE(state, isVisible) {
  state.pipelineDialog.isVisible = isVisible
}
