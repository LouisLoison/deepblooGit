
export function setPipelineDialog ({ commit }, { isVisible, tender }) {
  commit('UPDATE_PIPELINE_DIALOG', { isVisible: isVisible, tender: tender})
}
