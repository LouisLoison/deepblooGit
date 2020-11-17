import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'

Vue.use(Vuex)
const vuexPersist = new VuexPersist({
  key: 'DeepblooFront',
  storage: localStorage
})

export default new Vuex.Store({
  plugins: [vuexPersist.plugin],
  state: {
    isMobile: false,
    confirmModal: {
      visible: false,
      headerClass: null,
      headerIcon: null,
      title: "",
      message: "",
      buttons: null
    },
    insufficientRightDialog: false,
    ApiUrl: null,
    userId: null,
    hivebriteId: null,
    type: null,
    email: null,
    username: null,
    password: null,
    userPhoto: null,
    token: null,
    userMembership: {
      loading: false,
      data: null,
      hasFree: false,
      isFree: false,
      isPremium: false,
      isBusiness: false
    },
    headerShow: false,
    dataCpvs: {
      loading: null,
      data: null,
      error: null
    },
    dataGroups: {
      loading: null,
      data: null,
      error: null
    },
    dataOpportunity: {
      loading: null,
      data: null
    },
    dataUserNotifys: {
      loading: null,
      data: null
    },
    screenTenders: {
      displayType: null,
      panels: null,
      tenderGroupId: null
    },
    screenBusinessPlus: {
      displayType: null,
      panels: null
    },
    AppSearchUrl: 'https://7bbe91f62e1e4ff6b41e5ee2fba2cdbd.app-search.eu-west-1.aws.found.io/',
  },
  getters: {
    getApiUrl(state) {
      return state.ApiUrl
    },

    getAppSearchUrl(state) {
      return state.AppSearchUrl
    },

    getUserId(state) {
      return state.userId
    },

    getUserHivebriteId(state) {
      return state.hivebriteId
    },

    getUserType(state) {
      return state.type
    },

    getUserEmail(state) {
      return state.email
    },

    getUsername(state) {
      return state.username
    },

    getUserToken(state) {
      return state.token
    },

    getUserPhoto(state) {
      return state.userPhoto
    },

    isUserLoggedIn(state) {
      return state.token && state.token !== ""
    },

    isHeaderShow(state) {
      return state.headerShow
    },

    getIsMobile(state) {
      return state.isMobile
    },

    getConfirmModal(state) {
      return state.confirmModal
    },

    getInsufficientRightDialog(state) {
      return state.insufficientRightDialog
    },

    getDataCpvs(state) {
      return state.dataCpvs
    },

    getDataGroups(state) {
      return state.dataGroups
    },

    getDataOpportunity(state) {
      return state.dataOpportunity
    },

    getDataUserNotifys(state) {
      return state.dataUserNotifys
    },

    getCpvsLogoFromLabel: state => cpvs => {
      let logo = "https://tender-document-bucket-v2.s3-eu-west-1.amazonaws.com/images/default.png"
      let cpvsArray = cpvs
      if (!cpvs) {
        cpvs = ""
      }
      if (!Array.isArray(cpvs)) {
        cpvsArray = cpvs.split(",").map(a => a)
      }
      if (cpvsArray && cpvsArray.length) {
        const cpv = state.dataCpvs.data.find(
          a => cpvsArray.includes(a.label) && a.active
        )
        if (cpv && cpv.logo && cpv.logo !== "") {
          logo = cpv.logo
        }
      }
      return logo
    },

    getCpvsLogoFromCode: state => cpvs => {
      let logo = "https://tender-document-bucket-v2.s3-eu-west-1.amazonaws.com/images/default.png"
      let cpvsArray = cpvs
      if (!cpvs) {
        cpvs = ""
      }
      if (!Array.isArray(cpvs)) {
        cpvsArray = cpvs.split(",").map(a => parseInt(a, 10))
      }
      if (cpvsArray && cpvsArray.length) {
        const cpv = state.dataCpvs.data.find(
          a => cpvsArray.includes(a.code) && a.active
        )
        if (cpv && cpv.logo && cpv.logo !== "") {
          logo = cpv.logo
        }
      }
      return logo
    },

    getScreenTenders(state) {
      return state.screenTenders
    },

    getScreenBusinessPlus(state) {
      return state.screenBusinessPlus
    },

    getUserMembership(state) {
      return state.userMembership
    },

    getIsFreeMembership(state) {
      return state.userMembership.isFree
    },

    getIsPremiumMembership(state) {
      return state.userMembership.isPremium
    },

    getIsBusinessMembership(state) {
      return state.userMembership.isBusiness || state.type === 1
    },
  },
  mutations: {
    UPDATE_APIURL(state, ApiUrl) {
      state.ApiUrl = ApiUrl
    },

    UPDATE_USER(state, payload) {
      state.userId =
        payload.userId !== undefined ? payload.userId : state.userId
      state.hivebriteId =
        payload.hivebriteId !== undefined
          ? payload.hivebriteId
          : state.hivebriteId
      state.type = payload.type !== undefined ? payload.type : state.type
      state.email = payload.email !== undefined ? payload.email : state.email
      state.username =
        payload.username !== undefined ? payload.username : state.username
      state.password =
        payload.password !== undefined ? payload.password : state.password
      state.userPhoto =
        payload.photo !== undefined ? payload.photo : state.photo
      state.token = payload.token !== undefined ? payload.token : state.token
    },

    UPDATE_SCREEN_TENDERS(state, payload) {
      state.screenTenders = {
        ...state.screenTenders,
        ...payload
      }
    },

    UPDATE_SCREEN_BUSINESSPLUS(state, payload) {
      state.screenBusinessPlus = {
        ...state.screenBusinessPlus,
        ...payload
      }
    },

    USER_LOGOUT(state) {
      state.userId = ''
      state.hivebriteId = ''
      state.type = ''
      state.email = ''
      state.username = ''
      state.password = ''
      state.userPhoto = ''
      state.token = ''
    },

    UPDATE_HEADERSHOW(state, headerShow) {
      state.headerShow = headerShow
    },

    UPDATE_IsMobile(state, value) {
      state.isMobile = value ? value : false
    },

    UPDATE_ConfirmModal(state, confirmModal) {
      state.confirmModal = confirmModal ? confirmModal : state.confirmModal
    },

    UPDATE_InsufficientRightDialog(state, value) {
      state.insufficientRightDialog = value
    },
  },
  actions: {
    initIsMobile({ commit }, value) {
      commit("UPDATE_IsMobile", value)
    },
    
    async userLogin({ commit }, value) {
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
          token: res.token
        })
      } catch (err) {
        Vue.api.error(err, this)
      }
    },

    showConfirmModal({ commit }, confirmModal) {
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
    },

    hideConfirmModal({ commit }) {
      const confirmModal = {
        visible: false
      }
      commit("UPDATE_ConfirmModal", confirmModal)
    },

    showInsufficientRightDialog ({ commit }) {
      commit('UPDATE_InsufficientRightDialog', true)
    },

    hideInsufficientRightDialog ({ commit }) {
      commit('UPDATE_InsufficientRightDialog', false)
    },

    loadUser({ commit }, user) {
      commit("UPDATE_USER", user)
    },

    logoutUser({ commit, state }) {
      commit("USER_LOGOUT")
      state.userMembership.hasFree = false
      state.userMembership.isFree = false
      state.userMembership.isPremium = false
      state.userMembership.isBusiness = false
      state.dataGroups.data = []
    },

    async loadUserMemberships({ state }) {
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
    },

    setHeaderShow({ commit }, headerShow) {
      commit("UPDATE_HEADERSHOW", headerShow)
    },

    async setUserConnexion({ state }, zone) {
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
    },

    async loadCpvs({ state }) {
      try {
        state.dataCpvs.loading = 0
        const res = await Vue.api.post("/Cpv/CpvList")
        if (!res.success) {
          throw new Error(res.Error)
        }
        state.dataCpvs.data = res.data
        state.dataCpvs.loading = 1
      } catch (err) {
        console.log('-- err')
        console.log(err)
        state.dataCpvs.loading = -1
        Vue.api.error(err, this)
      }
    },

    async loadGroups({ state }) {
      try {
        state.dataGroups.loading = 0
        if (!state.userId) {
          state.dataGroups.data = []
          state.dataGroups.loading = 1
          return
        }
        const res = await Vue.api.post("/Tender/TenderGroupList", {
          userId: state.userId
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
        state.dataGroups.data = res.data
        state.dataGroups.loading = 1
      } catch (err) {
        state.dataGroups.loading = -1
        Vue.api.error(err, this)
      }
    },

    async loadOpportunity({ state }) {
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
    },

    async loadUserNotifys({ state }) {
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
    },

    setScreenTenders({ commit }, values) {
      commit("UPDATE_SCREEN_TENDERS", values)
    },

    setScreenBusinessPlus({ commit }, values) {
      commit("UPDATE_SCREEN_BUSINESSPLUS", values)
    }
  }
})
