
export function UPDATE_PIPELINE_DIALOG(state, { isVisible, tender }) {
  state.pipelineDialog.isVisible = isVisible
  state.pipelineDialog.tender = tender
}

export function UPDATE_PIPELINE_STATE(state, isVisible) {
  state.pipelineDialog.isVisible = isVisible
}
