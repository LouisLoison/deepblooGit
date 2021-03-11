import Vue from 'vue'

export function initIsMobile({ commit }, value) {
  commit("UPDATE_IsMobile", value)
}

export async function userLogin({ commit }, value) {
  try {
    this.loading = true
    this.error = false
    const res = await Vue.api.post("/User/Login", value)
    if (!res.success) {
      throw new Error(res.Error)
    }
    commit("UPDATE_USER", {
      userId: res.user.userId,
      hivebriteId: res.user.hivebriteId,
      type: res.user.type,
      email: res.user.email,
      username: res.user.username,
      password: this.password,
      photo: res.user.photo,
      token: res.token,
    })
  } catch (err) {
    Vue.api.error(err, this)
  }
}

export function showConfirmModal({ commit }, confirmModal) {
  confirmModal.visible = true
  if (!confirmModal.title) {
    confirmModal.title = "Information"
  }
  if (!confirmModal.headerClass) {
    confirmModal.headerClass = "blue lighten-4"
  }
  if (!confirmModal.headerIcon) {
    confirmModal.headerIcon = "fa-question-circle"
  }
  if (!confirmModal.DocUrl) {
    confirmModal.DocUrl = null
  }
  commit("UPDATE_ConfirmModal", confirmModal)
}

export function hideConfirmModal({ commit }) {
  const confirmModal = {
    visible: false
  }
  commit("UPDATE_ConfirmModal", confirmModal)
}

export function showInsufficientRightDialog ({ commit }) {
  commit('UPDATE_InsufficientRightDialog', true)
}

export function hideInsufficientRightDialog ({ commit }) {
  commit('UPDATE_InsufficientRightDialog', false)
}

export function loadUser({ commit }, user) {
  commit("UPDATE_USER", user)
}

export function logoutUser({ commit, state }) {
  commit("USER_LOGOUT")
  state.userMembership.hasFree = false
  state.userMembership.isFree = false
  state.userMembership.isPremium = false
  state.userMembership.isBusiness = false
  state.dataTenderGroups.data = []
}

export async function loadUserMemberships({ state }) {
  try {
if (!state.userId) {
  return
}
state.userMembership.loading = 0
const res = await Vue.api.post("/User/Memberships", {
  userId: state.userId
})
if (!res.success) {
  throw new Error(res.Error)
}
state.userMembership.data = res.data
state.userMembership.hasFree = res.data.hasFree
state.userMembership.isFree = res.data.isFreeMembership
state.userMembership.isPremium = res.data.isPremiumMembership
state.userMembership.isBusiness = res.data.isBusinessMembership
state.userMembership.loading = 1
  } catch (err) {
state.userMembership.loading = -1
Vue.api.error(err, this)
  }
}

export async function loadBusinessPipeline({ commit, state }) {
  try {
if (!state.userId) {
  return
}
const res = await Vue.api.post("/User/User", {
  userId: state.userId
})
if (!res.success) {
  throw new Error(res.Error)
}
if (
  res.Utilisateur
  && res.Utilisateur.businessPipeline
) {
  commit('UPDATE_USER_BusinessPipeline', JSON.parse(res.Utilisateur.businessPipeline))
} else {
  commit('UPDATE_USER_BusinessPipeline', null)
}
  } catch (err) {
Vue.api.error(err, this)
  }
}

export async function updateBusinessPipeline({ commit, state }, businessPipeline) {
  try {
if (!state.userId) {
  return
}
const user = { userId: state.userId }
user.businessPipeline = JSON.stringify(businessPipeline)
const res = await Vue.api.post("/User/AddUpdate", { user })
if (!res.success) {
  throw new Error(res.Error)
}
commit("UPDATE_USER_BusinessPipeline", businessPipeline)
  } catch (err) {
Vue.api.error(err, this)
  }
}

export function setHeaderShow({ commit }, headerShow) {
  commit("UPDATE_HEADERSHOW", headerShow)
}

export async function setUserConnexion({ state }, zone) {
  try {
if (!state.userId) {
  return
}
const user = { userId: state.userId }
user[zone] = new Date()
const res = await Vue.api.post("/User/AddUpdate", { user })
if (!res.success) {
  throw new Error(res.Error)
}
  } catch (err) {
Vue.api.error(err, this)
  }
}

export async function loadCpvs({ state }) {
  try {
state.dataCpvs.loading = 0
const res = await Vue.api.post("/Cpv/CpvList")
if (!res.success) {
  throw new Error(res.Error)
}
state.dataCpvs.data = res.data
state.dataCpvs.loading = 1
  } catch (err) {
console.log(err)
state.dataCpvs.loading = -1
Vue.api.error(err, this)
  }
}

export async function loadOpportunity({ state }) {
  try {
state.dataOpportunity.loading = 0
if (!state.userId) {
  state.dataOpportunity.data = []
  state.dataOpportunity.loading = 1
  return
}
const res = await Vue.api.post("/User/Opportunity", {
  userId: state.userId
})
if (!res.success) {
  throw new Error(res.Error)
}
state.dataOpportunity.data = res.data
if (state.dataOpportunity.data.organization) {
  state.dataOpportunity.data.organization.users.sort((a, b) => {
let na = a.username.toLowerCase()
let nb = b.username.toLowerCase()
return na < nb ? -1 : na > nb ? 1 : 0
  })
}
state.dataOpportunity.loading = 1
  } catch (err) {
state.dataOpportunity.loading = -1
Vue.api.error(err, this)
  }
}

export async function loadUserNotifys({ state }) {
  try {
state.dataUserNotifys.loading = 0
if (!state.userId) {
  state.dataUserNotifys.data = []
  state.dataUserNotifys.loading = 1
  return
}
const res = await Vue.api.post("/User/userNotifyList", {
  filter: {
userId: state.userId
  }
})
if (!res.success) {
  throw new Error(res.Error)
}
state.dataUserNotifys.data = res.data
state.dataUserNotifys.loading = 1
  } catch (err) {
state.dataUserNotifys.loading = -1
Vue.api.error(err, this)
  }
}

export async function loadTenderGroups({ state }) {
  try {
state.dataTenderGroups.loading = 0
if (!state.userId) {
  state.dataTenderGroups.data = []
  state.dataTenderGroups.loading = 1
  return
}
const res = await Vue.api.post("/Tender/TenderGroupList", {
  userId: state.userId
})
if (!res.success) {
  throw new Error(res.Error)
}
state.dataTenderGroups.data = res.data
state.dataTenderGroups.loading = 1
  } catch (err) {
state.dataTenderGroups.loading = -1
Vue.api.error(err, this)
  }
}

export async function updateTenderGroup({ commit }, tenderGroup) {
  try {
const res = await Vue.api.post("/Tender/TenderGroupAddUpdate", { tenderGroup })
if (!res.success) {
  throw new Error(res.Error)
}
commit("UPDATE_TenderGroup", tenderGroup)
  } catch (err) {
Vue.api.error(err, this)
  }
}

export function setScreenTenders({ commit }, values) {
  commit("UPDATE_SCREEN_TENDERS", values)
}

export function setScreenBusinessPlus({ commit }, values) {
  commit("UPDATE_SCREEN_BUSINESSPLUS", values)
}
