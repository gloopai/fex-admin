/**
 * 前台路由（/front）。
 * 需登录：personal-center 整树、trade/:assetClass/:tradeMode、verification-*-demo。
 * 公开：home、market、login、register。
 * 守卫与组合式函数：router/index.js、src/composables/useRequireFrontAuth.js
 */
import { FRONT_DEPOSIT_DEFAULT_SYMBOL_LOWER } from '../../constants/frontAssetCenterDemo'
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
    path: 'trade',
    redirect: '/front/trade/crypto/perpetual'
  },
  {
    path: 'trade/spot',
    redirect: '/front/trade/crypto/spot'
  },
  {
    path: 'trade/perpetual',
    redirect: '/front/trade/crypto/perpetual'
  },
  {
    path: 'trade/delivery',
    redirect: '/front/trade/crypto/delivery'
  },
  {
    path: 'trade/:assetClass/:tradeMode',
    name: 'front-trade-desktop',
    component: () => import('../../pages/front/FrontTradePage.vue'),
    meta: { title: '交易', requiresAuth: true },
    beforeEnter(to) {
      const okA = new Set(['crypto', 'forex', 'metal'])
      const okM = new Set(['spot', 'perpetual', 'delivery'])
      if (!okA.has(to.params.assetClass) || !okM.has(to.params.tradeMode)) {
        return { path: '/front/trade/crypto/perpetual' }
      }
    }
  },
  {
    path: 'assets',
    redirect: '/front/personal-center/assets'
  },
  {
    path: 'login',
    name: 'front-login',
    component: () => import('../../pages/front/FrontAuthPage.vue'),
    meta: { title: '登录', guestOnly: true }
  },
  {
    path: 'register',
    name: 'front-register',
    component: () => import('../../pages/front/FrontAuthPage.vue'),
    meta: { title: '注册', guestOnly: true }
  },
  {
    path: 'personal-center',
    meta: { requiresAuth: true },
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
        path: 'assets/withdraw',
        name: 'front-personal-assets-withdraw',
        component: () => import('../../pages/front/personal-center/AssetsWithdrawPage.vue'),
        meta: { title: '提币' }
      },
      {
        path: 'assets/deposit',
        name: 'front-personal-assets-deposit',
        redirect: () => ({
          name: 'front-personal-assets-deposit-detail',
          params: { symbol: FRONT_DEPOSIT_DEFAULT_SYMBOL_LOWER }
        }),
        meta: { title: '充币' }
      },
      {
        path: 'assets/deposit/:symbol',
        name: 'front-personal-assets-deposit-detail',
        component: () => import('../../pages/front/personal-center/AssetsDepositDetailPage.vue'),
        meta: { title: '充币' }
      },
      {
        path: 'ledger',
        name: 'front-personal-ledger-desktop',
        component: () => import('../../pages/front/personal-center/PersonalCenterLedgerPage.vue'),
        meta: { title: '账变记录' }
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
      title: '账户权限（PC）',
      requiresAuth: true
    }
  },
  {
    path: 'verification-popup-demo',
    name: 'front-verification-popup-demo-desktop',
    component: () => import('../../pages/front/VerificationPopupDemoPage.vue'),
    meta: {
      title: '安全与验证（PC）',
      requiresAuth: true
    }
  }
]
