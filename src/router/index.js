import { createRouter, createWebHistory } from 'vue-router'
import ConsoleLayout from '../layouts/ConsoleLayout.vue'

const page = () => import('../pages/system/SectionPage.vue')

const routes = [
  {
    path: '/',
    component: ConsoleLayout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: page,
        meta: {
          title: '仪表盘',
          desc: '展示系统关键指标和实时健康度。'
        }
      },
      // 用户管理路由
      {
        path: 'users',
        redirect: '/users/list'
      },
      {
        path: 'users/list',
        name: 'users-list',
        component: () => import('../pages/user/UserListPage.vue')
      },
      {
        path: 'perpetual/overview',
        name: 'perpetual-overview',
        component: () => import('../pages/perpetual/PerpetualManagementPage.vue')
      },
      {
        path: 'perpetual/user-monitor',
        name: 'perpetual-user-monitor',
        redirect: '/perpetual/contract-monitor'
      },
      {
        path: 'perpetual/contract-monitor',
        name: 'perpetual-contract-monitor',
        component: () => import('../pages/perpetual/PerpetualControlEditorPage.vue')
      },
      {
        path: 'perpetual/contract-log',
        name: 'perpetual-contract-log',
        component: () => import('../pages/perpetual/PerpetualControlLogPage.vue')
      },
      {
        path: 'perpetual/report',
        name: 'perpetual-report',
        component: () => import('../pages/perpetual/PerpetualReportPage.vue')
      },
      {
        path: 'perpetual/guide',
        name: 'perpetual-guide',
        component: () => import('../pages/perpetual/GuidePage.vue')
      },
      {
        path: 'delivery',
        redirect: '/delivery/contracts'
      },
      {
        path: 'delivery/contracts',
        name: 'delivery-contracts',
        component: () => import('../pages/delivery/DeliveryManagementPage.vue')
      },
      {
        path: 'delivery/auto-rules',
        name: 'delivery-auto-rules',
        component: () => import('../pages/delivery/DeliveryAutoRuleListPage.vue')
      },
      {
        path: 'delivery/rule-history',
        name: 'delivery-rule-history',
        component: () => import('../pages/delivery/DeliveryRuleHistoryPage.vue')
      },
      {
        path: 'delivery/rule-statistics',
        name: 'delivery-rule-statistics',
        component: () => import('../pages/delivery/DeliveryRuleStatisticsPage.vue')
      },
      {
        path: 'delivery/report',
        name: 'delivery-report',
        component: () => import('../pages/delivery/DeliveryReportPage.vue')
      },
      {
        path: 'delivery/guide',
        name: 'delivery-guide',
        component: () => import('../pages/delivery/DeliveryGuidePage.vue')
      },
      {
        path: 'delivery/overview',
        redirect: '/delivery/contracts'
      },
      {
        path: 'delivery/config',
        redirect: '/delivery/control'
      },
      {
        path: 'assets',
        redirect: '/assets/currencies'
      },
      {
        path: 'assets/currencies',
        name: 'assets-currencies',
        component: () => import('../pages/assets/AssetsCurrencyPage.vue')
      },
      {
        path: 'assets/manual-collect',
        name: 'assets-manual-collect',
        component: () => import('../pages/assets/AssetsManualCollectPage.vue')
      },
      {
        path: 'assets/collect-records',
        name: 'assets-collect-records',
        component: () => import('../pages/assets/AssetsCollectRecordsPage.vue')
      },
      {
        path: 'assets/address-logs',
        name: 'assets-address-logs',
        component: () => import('../pages/assets/AssetsAddressLogsPage.vue')
      },
      {
        path: 'assets/overview',
        redirect: '/assets/currencies'
      },
      {
        path: 'assets/transfer',
        redirect: '/assets/manual-collect'
      },
      {
        path: 'liquidity/versus/params',
        name: 'liquidity-versus-params',
        component: page,
        meta: {
          title: '流动性挖矿 / 对赌版 / 参数看板',
          desc: '查看对赌版参数模板和当前生效值。'
        }
      },
      {
        path: 'liquidity/versus/logs',
        name: 'liquidity-versus-logs',
        component: page,
        meta: {
          title: '流动性挖矿 / 对赌版 / 触发日志',
          desc: '审计策略触发与执行回执。'
        }
      },
      {
        path: 'liquidity/locked/products',
        name: 'liquidity-locked-products',
        component: () => import('../pages/liquidity/LiquidityLockedProductsPage.vue')
      },
      {
        path: 'liquidity/locked/orders',
        name: 'liquidity-locked-orders',
        component: () => import('../pages/liquidity/LiquidityLockedOrdersPage.vue')
      },
      {
        path: 'liquidity/locked/yield-control',
        name: 'liquidity-locked-yield-control',
        component: () => import('../pages/liquidity/LiquidityLockedYieldControlPage.vue')
      },
      {
        path: 'liquidity/locked/expiry-alerts',
        name: 'liquidity-locked-expiry-alerts',
        component: () => import('../pages/liquidity/LiquidityLockedAlertsPage.vue')
      },
      {
        path: 'liquidity/locked/rules',
        name: 'liquidity-locked-rules',
        component: () => import('../pages/liquidity/LiquidityLockedRulesPage.vue')
      },
      {
        path: 'liquidity/locked/positions',
        redirect: '/liquidity/locked/products'
      },
      {
        path: 'liquidity/locked/risk',
        redirect: '/liquidity/locked/rules'
      },
      
      // 加密货币抵押借贷路由
      {
        path: 'lending',
        redirect: '/lending/products'
      },
      {
        path: 'lending/products',
        name: 'lending-products',
        component: () => import('../pages/lending/LendingProductPage.vue')
      },
      {
        path: 'lending/orders',
        name: 'lending-orders',
        component: () => import('../pages/lending/LendingOrderPage.vue')
      },
      {
        path: 'lending/repayment',
        name: 'lending-repayment',
        component: () => import('../pages/lending/LendingRepaymentPage.vue')
      },
      {
        path: 'lending/liquidation',
        name: 'lending-liquidation',
        component: () => import('../pages/lending/LendingLiquidationPage.vue')
      },
      {
        path: 'lending/user-monitoring',
        name: 'lending-user-monitoring',
        component: () => import('../pages/lending/LendingUserMonitoringPage.vue')
      },
      {
        path: 'lending/guide',
        name: 'lending-guide',
        component: () => import('../pages/lending/LendingGuidePage.vue')
      },
      
      // AI量化交易路由
      {
        path: 'ai-quant',
        redirect: '/ai-quant/products'
      },
      {
        path: 'ai-quant/products',
        name: 'ai-quant-products',
        component: () => import('../pages/aiQuant/AiQuantProductPage.vue')
      },
      {
        path: 'ai-quant/orders',
        name: 'ai-quant-orders',
        component: () => import('../pages/aiQuant/AiQuantOrderPage.vue')
      },
      {
        path: 'ai-quant/yield-adjustment',
        name: 'ai-quant-yield-adjustment',
        component: () => import('../pages/aiQuant/AiQuantYieldAdjustmentPage.vue')
      },
      {
        path: 'ai-quant/control',
        name: 'ai-quant-control',
        component: () => import('../pages/aiQuant/AiQuantControlPage.vue')
      },
      {
        path: 'ai-quant/rules',
        name: 'ai-quant-rules',
        component: () => import('../pages/aiQuant/AiQuantRulePage.vue')
      },
      
      // 用户管理路由
      {
        path: 'users',
        redirect: '/users/list'
      },
      {
        path: 'users/list',
        name: 'users-list',
        component: () => import('../pages/user/UserListPage.vue')
      },
      {
        path: 'users/vip-config',
        name: 'users-vip-config',
        component: () => import('../pages/user/VipConfigPage.vue')
      },
      {
        path: 'users/vip-upgrades',
        name: 'users-vip-upgrades',
        component: () => import('../pages/user/CreditScoreUpgradesPage.vue')
      },
      {
        path: 'users/credit-score-config',
        name: 'users-credit-score-config',
        component: () => import('../pages/user/CreditScoreConfigPage.vue')
      },
      {
        path: 'users/credit-score-changes',
        name: 'users-credit-score-changes',
        component: () => import('../pages/user/CreditScoreChangesPage.vue')
      },
      {
        path: 'users/credit-score-audit',
        name: 'users-credit-score-audit',
        component: () => import('../pages/user/CreditScoreAuditPage.vue')
      },
      {
        path: 'users/verification-config',
        name: 'users-verification-config',
        component: () => import('../pages/user/VerificationConfigPage.vue')
      },
      {
        path: 'users/verification-audit',
        name: 'users-verification-audit',
        component: () => import('../pages/user/VerificationAuditPage.vue')
      },
      {
        path: 'users/verification-log',
        name: 'users-verification-log',
        component: () => import('../pages/user/VerificationLogPage.vue')
      },
      
      // 代理与分销管理路由
      {
        path: 'agent',
        redirect: '/agent/management'
      },
      {
        path: 'agent/management',
        name: 'agent-management',
        component: () => import('../pages/agent/AgentManagementPage.vue')
      },
      {
        path: 'agent/applications',
        name: 'agent-applications',
        component: () => import('../pages/agent/AgentApplicationPage.vue')
      },
      {
        path: 'agent/referral-config',
        name: 'agent-referral-config',
        component: () => import('../pages/agent/ReferralConfigPage.vue')
      },
      {
        path: 'agent/referral-commission',
        name: 'agent-referral-commission',
        component: () => import('../pages/agent/ReferralCommissionPage.vue')
      },
      {
        path: 'agent/referral-statistics',
        name: 'agent-referral-statistics',
        component: () => import('../pages/agent/ReferralStatisticsPage.vue')
      },
      // 兼容旧路由
      {
        path: 'referral',
        redirect: '/agent/referral-config'
      },
      {
        path: 'referral/config',
        redirect: '/agent/referral-config'
      },
      {
        path: 'referral/commission',
        redirect: '/agent/referral-commission'
      },
      {
        path: 'referral/statistics',
        redirect: '/agent/referral-statistics'
      }
    ]
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
