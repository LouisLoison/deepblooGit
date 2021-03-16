export default function () {
  return {
    isMobile: false,
    confirmModal: {
      visible: false,
      headerClass: null,
      headerIcon: null,
      title: '',
      message: '',
      buttons: null,
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
    userBusinessPipeline: null,
    token: null,
    userMembership: {
      loading: false,
      data: null,
      hasFree: false,
      isFree: false,
      isPremium: false,
      isBusiness: false,
    },
    headerShow: false,
    dataCpvs: {
      loading: null,
      data: null,
      error: null,
    },
    dataOpportunity: {
      loading: null,
      data: null,
    },
    dataUserNotifys: {
      loading: null,
      data: null,
    },
    dataTenderGroups: {
      loading: null,
      data: null,
    },
    screenTenders: {
      displayType: null,
      panels: null,
      tenderGroupId: null,
    },
    screenBusinessPlus: {
      displayType: null,
      panels: null,
    },
    AppSearchUrl: 'https://7bbe91f62e1e4ff6b41e5ee2fba2cdbd.app-search.eu-west-1.aws.found.io/'
  }
}
