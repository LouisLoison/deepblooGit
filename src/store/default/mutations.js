export function UPDATE_APIURL(state, ApiUrl) {
  state.ApiUrl = ApiUrl
}

export function UPDATE_USER(state, payload) {
  state.userId = payload.userId !== undefined ? payload.userId : state.userId
  state.hivebriteId = payload.hivebriteId !== undefined ? payload.hivebriteId : state.hivebriteId
  state.type = payload.type !== undefined ? payload.type : state.type
  state.email = payload.email !== undefined ? payload.email : state.email
  state.username = payload.username !== undefined ? payload.username : state.username
  state.password = payload.password !== undefined ? payload.password : state.password
  state.userPhoto = payload.photo !== undefined ? payload.photo : state.photo
  state.token = payload.token !== undefined ? payload.token : state.token
}

export function UPDATE_TenderGroup(state, payload) {
  const tenderGroup = state.dataTenderGroups.data.find(a => a.tenderGroupId === payload.tenderGroupId)
  if (tenderGroup) {
    Object.assign(tenderGroup, payload)
  } else {
    state.dataTenderGroups.data.push(payload)
  }
}

export function UPDATE_USER_BusinessPipeline(state, value) {
  state.userBusinessPipeline = value
}

export function UPDATE_SCREEN_TENDERS(state, payload) {
  state.screenTenders = {
    ...state.screenTenders,
    ...payload,
  }
}

export function UPDATE_SCREEN_BUSINESSPLUS(state, payload) {
  state.screenBusinessPlus = {
    ...state.screenBusinessPlus,
    ...payload,
  }
}

export function USER_LOGOUT(state) {
  state.userId = ''
  state.hivebriteId = ''
  state.type = ''
  state.email = ''
  state.username = ''
  state.password = ''
  state.userPhoto = ''
  state.token = ''
}

export function UPDATE_HEADERSHOW(state, headerShow) {
  state.headerShow = headerShow
}

export function UPDATE_IsMobile(state, value) {
  state.isMobile = value ? value : false
}

export function UPDATE_ConfirmModal(state, confirmModal) {
  state.confirmModal = confirmModal ? confirmModal : state.confirmModal
}

export function UPDATE_InsufficientRightDialog(state, value) {
  state.insufficientRightDialog = value
}
