export default [
  {
    path: "*",
    meta: {
      public: true
    },
    redirect: {
      path: "/404"
    }
  },
  {
    path: "/404",
    meta: {
      public: true
    },
    name: "NotFound",
    component: () => import(`@/views/NotFound.vue`)
  },
  {
    path: "/403",
    meta: {
      public: true
    },
    name: "AccessDenied",
    component: () => import(`@/views/Deny.vue`)
  },
  {
    path: "/500",
    meta: {
      public: true
    },
    name: "ServerError",
    component: () => import(`@/views/Error.vue`)
  },
  {
    path: "/login",
    meta: {
      public: true
    },
    name: "Login",
    component: () => import(`@/views/Login.vue`)
  },
  {
    path: "/tenders/",
    meta: {
      public: true
    },
    name: "Tenders",
    component: () => import(`@/views/tender/tenders.vue`)
  },
  {
    path: "/tender/add",
    meta: {
      public: true
    },
    name: "TenderAdd",
    component: () => import(`@/views/tender/Add.vue`)
  },
  {
    path: "/tender/info",
    meta: {
      public: true
    },
    name: "TenderInfo",
    component: () => import(`@/views/tender/Info.vue`)
  },
  {
    path: "/privateDeals",
    meta: {
      public: true
    },
    name: "PrivateDeals",
    component: () => import(`@/views/PrivateDeal/PrivateDeals.vue`)
  },
  {
    path: "/setting",
    meta: {
      public: true
    },
    name: "Setting",
    component: () => import(`@/views/setting/index.vue`),
    children: [
      {
        path: "/setting/user",
        meta: {
          public: true
        },
        name: "SettingUser",
        props: true,
        component: () => import(`@/views/setting/SettingUser.vue`)
      },
      {
        path: "/setting/organization",
        meta: {
          public: true
        },
        name: "SettingOrganization",
        component: () => import(`@/views/setting/SettingOrganization.vue`)
      },
      {
        path: "/setting/cpv",
        meta: {
          public: true
        },
        name: "SettingCpv",
        component: () => import(`@/views/setting/SettingCpv.vue`)
      },
      {
        path: "/setting/annonce",
        meta: {
          public: true
        },
        name: "SettingAnnonce",
        component: () => import(`@/views/setting/SettingAnnonce.vue`)
      },
      {
        path: "/setting/notify",
        meta: {
          public: true
        },
        name: "SettingNotify",
        component: () => import(`@/views/setting/SettingNotify.vue`)
      },
      {
        path: "/setting/other",
        meta: {
          public: true
        },
        name: "SettingOther",
        component: () => import(`@/views/setting/SettingOther.vue`)
      }
    ]
  },
];
