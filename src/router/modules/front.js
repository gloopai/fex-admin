export const frontDesktopRoutes = [
  {
    path: '',
    redirect: '/front/home'
  },
  {
    path: 'home',
    name: 'front-home-desktop',
    component: () => import('../../pages/front/FrontHomePage.vue'),
    meta: { title: '首页' }
  },
  {
    path: 'market',
    name: 'front-market-desktop',
    component: () => import('../../pages/front/FrontMarketPage.vue'),
    meta: { title: '行情' }
  },
  {
    path: 'trade/spot',
    name: 'front-trade-spot-desktop',
    component: () => import('../../pages/front/FrontPlaceholderPage.vue'),
    meta: { title: '现货交易' }
  },
  {
    path: 'trade/perpetual',
    name: 'front-trade-perpetual-desktop',
    component: () => import('../../pages/front/FrontPlaceholderPage.vue'),
    meta: { title: '永续合约' }
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
