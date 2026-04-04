export const frontDesktopRoutes = [
  {
    path: '',
    redirect: '/front/personal-center'
  },
  {
    path: 'assets',
    redirect: '/front/personal-center/assets'
  },
  {
    path: 'personal-center',
    component: () => import('../../layouts/PersonalCenterShellLayout.vue'),
    children: [
      {
        path: '',
        name: 'front-personal-center-desktop',
        component: () => import('../../pages/front/personal-center/PersonalCenterHomePage.vue'),
        meta: {
          title: '个人中心'
        }
      },
      {
        path: 'security',
        name: 'front-security-center-desktop',
        component: () => import('../../pages/front/personal-center/SecurityCenterPage.vue'),
        meta: {
          title: '安全中心'
        }
      },
      {
        path: 'verification',
        name: 'front-personal-verification-desktop',
        component: () => import('../../pages/front/pc/VerificationFlowTemplatePage.vue'),
        meta: {
          title: '身份认证'
        }
      },
      {
        path: 'assets',
        name: 'front-personal-assets-desktop',
        component: () => import('../../pages/front/FrontAssetsPage.vue'),
        meta: { title: '资产' }
      },
      {
        path: 'api-keys',
        redirect: '/front/personal-center'
      },
      {
        path: 'withdraw-addresses',
        name: 'front-personal-withdraw-addresses-desktop',
        component: () => import('../../pages/front/personal-center/WithdrawAddressPage.vue'),
        meta: { title: '提币地址' }
      },
      {
        path: 'fees-vip',
        name: 'front-personal-fees-vip-desktop',
        component: () => import('../../pages/front/personal-center/FeesVipPage.vue'),
        meta: { title: '费率与 VIP' }
      },
      {
        path: 'referral',
        name: 'front-personal-referral-desktop',
        component: () => import('../../pages/front/personal-center/ReferralPage.vue'),
        meta: { title: '邀请返佣' }
      },
      {
        path: 'notifications',
        name: 'front-personal-notifications-desktop',
        component: () => import('../../pages/front/personal-center/NotificationsPage.vue'),
        meta: { title: '消息通知' }
      },
      {
        path: 'preferences',
        name: 'front-personal-preferences-desktop',
        component: () => import('../../pages/front/personal-center/PreferencesPage.vue'),
        meta: { title: '账户设置' }
      }
    ]
  },
  {
    path: 'verification-flow',
    redirect: '/front/personal-center/verification'
  },
  {
    path: 'verification-permission-demo',
    name: 'front-verification-permission-demo-desktop',
    component: () => import('../../pages/front/VerificationPermissionDemoPage.vue'),
    meta: {
      title: '账户权限（PC）'
    }
  },
  {
    path: 'verification-popup-demo',
    name: 'front-verification-popup-demo-desktop',
    component: () => import('../../pages/front/VerificationPopupDemoPage.vue'),
    meta: {
      title: '安全与验证（PC）'
    }
  }
]

export const frontMobileRoutes = [
  {
    path: '',
    redirect: '/m/personal-center'
  },
  {
    path: 'assets',
    redirect: '/m/personal-center/assets'
  },
  {
    path: 'personal-center',
    component: () => import('../../layouts/PersonalCenterShellLayout.vue'),
    children: [
      {
        path: '',
        name: 'front-personal-center-mobile',
        component: () => import('../../pages/front/personal-center/PersonalCenterHomePage.vue'),
        meta: {
          title: '个人中心'
        }
      },
      {
        path: 'security',
        name: 'front-security-center-mobile',
        component: () => import('../../pages/front/personal-center/SecurityCenterPage.vue'),
        meta: {
          title: '安全中心'
        }
      },
      {
        path: 'verification',
        name: 'front-personal-verification-mobile',
        component: () => import('../../pages/front/m/VerificationFlowTemplatePage.vue'),
        meta: {
          title: '身份认证'
        }
      },
      {
        path: 'assets',
        name: 'front-personal-assets-mobile',
        component: () => import('../../pages/front/FrontAssetsPage.vue'),
        meta: { title: '资产' }
      },
      {
        path: 'api-keys',
        redirect: '/m/personal-center'
      },
      {
        path: 'withdraw-addresses',
        name: 'front-personal-withdraw-addresses-mobile',
        component: () => import('../../pages/front/personal-center/WithdrawAddressPage.vue'),
        meta: { title: '提币地址' }
      },
      {
        path: 'fees-vip',
        name: 'front-personal-fees-vip-mobile',
        component: () => import('../../pages/front/personal-center/FeesVipPage.vue'),
        meta: { title: '费率与 VIP' }
      },
      {
        path: 'referral',
        name: 'front-personal-referral-mobile',
        component: () => import('../../pages/front/personal-center/ReferralPage.vue'),
        meta: { title: '邀请返佣' }
      },
      {
        path: 'notifications',
        name: 'front-personal-notifications-mobile',
        component: () => import('../../pages/front/personal-center/NotificationsPage.vue'),
        meta: { title: '消息通知' }
      },
      {
        path: 'preferences',
        name: 'front-personal-preferences-mobile',
        component: () => import('../../pages/front/personal-center/PreferencesPage.vue'),
        meta: { title: '账户设置' }
      }
    ]
  },
  {
    path: 'verification-flow',
    redirect: '/m/personal-center/verification'
  },
  {
    path: 'verification-permission-demo',
    name: 'front-verification-permission-demo-mobile',
    component: () => import('../../pages/front/VerificationPermissionDemoPage.vue'),
    meta: {
      title: '账户权限（移动）'
    }
  },
  {
    path: 'verification-popup-demo',
    name: 'front-verification-popup-demo-mobile',
    component: () => import('../../pages/front/VerificationPopupDemoPage.vue'),
    meta: {
      title: '安全与验证（移动）'
    }
  }
]
