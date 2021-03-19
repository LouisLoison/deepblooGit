
export function UPDATE_SEARCH_RESULT(state, searchResult) {
  state.searchResult = searchResult
  state.tenderPreview = searchResult
}

export function UPDATE_TENDERS_PREVIEW(state, tenders) {
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
