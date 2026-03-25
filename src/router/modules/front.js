export const frontDesktopRoutes = [
  {
    path: '',
    redirect: '/front/personal-center'
  },
  {
    path: 'personal-center',
    name: 'front-personal-center-desktop',
    component: () => import('../../pages/front/pc/PersonalCenterTemplatePage.vue'),
    meta: {
      title: '前台个人中心模板（PC）'
    }
  },
  {
    path: 'verification-flow',
    name: 'front-verification-flow-desktop',
    component: () => import('../../pages/front/pc/VerificationFlowTemplatePage.vue'),
    meta: {
      title: '前台认证流程模板（PC）'
    }
  },
  {
    path: 'verification-permission-demo',
    name: 'front-verification-permission-demo-desktop',
    component: () => import('../../pages/front/VerificationPermissionDemoPage.vue'),
    meta: {
      title: '认证权限提示（PC）'
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
    component: () => import('../../pages/front/m/PersonalCenterTemplatePage.vue'),
    meta: {
      title: '前台个人中心模板（移动）'
    }
  },
  {
    path: 'verification-flow',
    name: 'front-verification-flow-mobile',
    component: () => import('../../pages/front/m/VerificationFlowTemplatePage.vue'),
    meta: {
      title: '前台认证流程模板（移动）'
    }
  },
  {
    path: 'verification-permission-demo',
    name: 'front-verification-permission-demo-mobile',
    component: () => import('../../pages/front/VerificationPermissionDemoPage.vue'),
    meta: {
      title: '认证权限提示（移动）'
    }
  }
]
