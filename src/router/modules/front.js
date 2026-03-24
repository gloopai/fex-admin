export const frontDesktopRoutes = [
  {
    path: '',
    redirect: '/front/personal-center'
  },
  {
    path: 'personal-center',
    name: 'front-personal-center-desktop',
    component: () => import('../../pages/front/PersonalCenterDesktopTemplatePage.vue'),
    meta: {
      title: '前台个人中心模板（PC）'
    }
  },
  {
    path: 'verification-flow',
    name: 'front-verification-flow-desktop',
    component: () => import('../../pages/front/VerificationFlowDesktopTemplatePage.vue'),
    meta: {
      title: '前台认证流程模板（PC）'
    }
  }
]

export const frontMobileRoutes = [
  {
    path: '',
    redirect: '/m/personal-center'
  },
  {
    path: 'personal-center',
    name: 'front-personal-center-mobile',
    component: () => import('../../pages/front/PersonalCenterMobileTemplatePage.vue'),
    meta: {
      title: '前台个人中心模板（移动）'
    }
  },
  {
    path: 'verification-flow',
    name: 'front-verification-flow-mobile',
    component: () => import('../../pages/front/VerificationFlowMobileTemplatePage.vue'),
    meta: {
      title: '前台认证流程模板（移动）'
    }
  }
]
