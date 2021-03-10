export function getApiUrl(state) {
  return state.ApiUrl
}

export function getAppSearchUrl(state) {
  return state.AppSearchUrl
}

export function getUserId(state) {
  return state.userId
}

export function getUserHivebriteId(state) {
  return state.hivebriteId
}

export function getUserType(state) {
  return state.type
}

export function getUserEmail(state) {
  return state.email
}

export function getUsername(state) {
  return state.username
}

export function getUserToken(state) {
  return state.token
}

export function getUserPhoto(state) {
  return state.userPhoto
}

export function getUserBusinessPipeline(state) {
  return state.userBusinessPipeline
}

export function isUserLoggedIn(state) {
  return state.token && state.token !== ""
}

export function isHeaderShow(state) {
  return state.headerShow
}

export function getIsMobile(state) {
  return state.isMobile
}

export function getConfirmModal(state) {
  return state.confirmModal
}

export function getInsufficientRightDialog(state) {
  return state.insufficientRightDialog
}

export function getDataCpvs(state) {
  return state.dataCpvs
}

export function getDataOpportunity(state) {
  return state.dataOpportunity
}

export function getDataUserNotifys(state) {
  return state.dataUserNotifys
}

export function getDataTenderGroups(state) {
  return state.dataTenderGroups
}

export function getCpvsLogoFromLabel(state, cpvs) {
  let logo = 'https://tender-document-bucket-v2.s3-eu-west-1.amazonaws.com/images/default.png'
  let cpvsArray = cpvs
  if (!cpvs) {
    cpvs = ""
  }
  if (!Array.isArray(cpvs)) {
    cpvsArray = cpvs.split(",").map(a => a)
  }
  if (cpvsArray && cpvsArray.length) {
    const cpv = state.dataCpvs.data.find(
        a => cpvsArray.includes(a.label) && a.active && a.logo && a.logo.trim() !== '' && !a.logo.endsWith('default.png')
    )
    if (cpv) {
      logo = cpv.logo
    }
  }
  return logo
}

export function getCpvsLogoFromCode(state, cpvs) {
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
    a => cpvsArray.includes(a.code) && a.active)
    if (cpv && cpv.logo && cpv.logo !== "") {
      logo = cpv.logo
    }
  }
  return logo
}

export function getScreenTenders(state) {
  return state.screenTenders
}

export function getScreenBusinessPlus(state) {
  return state.screenBusinessPlus
}

export function getUserMembership(state) {
  return state.userMembership
}

export function getIsFreeMembership(state) {
  return state.userMembership.isFree
}

export function getIsPremiumMembership(state) {
  return state.userMembership.isPremium
}

export function getIsBusinessMembership (state) {
return state.userMembership.isBusiness || state.type === 1
}
