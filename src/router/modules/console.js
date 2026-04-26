const sectionPage = () => import('../../pages/admin/system/SectionPage.vue')

export const consoleRoutes = [
  {
    path: '',
    name: 'dashboard',
    component: sectionPage,
    meta: {
      title: '仪表盘',
      desc: '展示系统关键指标和实时健康度。'
    }
  },
  {
    path: 'users',
    redirect: '/admin/users/list'
  },
  {
    path: 'users/list',
    name: 'users-list',
    component: () => import('../../pages/admin/user/UserListPage.vue')
  },
  {
    path: 'contracts/panel',
    name: 'contracts-panel',
    component: () => import('../../pages/admin/contracts/ContractsPanelPage.vue')
  },
  {
    path: 'perpetual/overview',
    name: 'perpetual-overview',
    component: () => import('../../pages/admin/perpetual/PerpetualManagementPage.vue')
  },
  {
    path: 'perpetual/leverage-template',
    name: 'perpetual-leverage-template',
    component: () => import('../../pages/admin/perpetual/PerpetualLeverageTemplatePage.vue')
  },
  {
    path: 'perpetual/user-monitor',
    name: 'perpetual-user-monitor',
    redirect: '/admin/perpetual/contract-monitor'
  },
  {
    path: 'perpetual/contract-monitor',
    name: 'perpetual-contract-monitor',
    component: () => import('../../pages/admin/perpetual/PerpetualContractMonitorPage.vue')
  },
  {
    path: 'perpetual/manual-line',
    name: 'perpetual-manual-line',
    component: () => import('../../pages/admin/perpetual/PerpetualManualLinePage.vue')
  },
  {
    path: 'perpetual/contract-log',
    name: 'perpetual-contract-log',
    component: () => import('../../pages/admin/perpetual/PerpetualControlLogPage.vue')
  },
  {
    path: 'perpetual/report',
    name: 'perpetual-report',
    component: () => import('../../pages/admin/perpetual/PerpetualReportPage.vue')
  },
  {
    path: 'perpetual/guide',
    name: 'perpetual-guide',
    component: () => import('../../pages/admin/perpetual/GuidePage.vue')
  },
  {
    path: 'perpetual/orders',
    name: 'perpetual-orders',
    component: () => import('../../pages/admin/perpetual/PerpetualOrderPage.vue')
  },
  {
    path: 'delivery',
    redirect: '/admin/delivery/contracts'
  },
  {
    path: 'delivery/contracts',
    name: 'delivery-contracts',
    component: () => import('../../pages/admin/delivery/DeliveryManagementPage.vue')
  },
  {
    path: 'delivery/templates',
    name: 'delivery-templates',
    component: () => import('../../pages/admin/delivery/DeliveryTemplatePage.vue')
  },
  {
    path: 'delivery/auto-rules',
    name: 'delivery-auto-rules',
    component: () => import('../../pages/admin/delivery/DeliveryAutoRuleListPage.vue')
  },
  {
    path: 'delivery/control',
    name: 'delivery-control',
    component: () => import('../../pages/admin/delivery/DeliveryManualControlPage.vue'),
    meta: {
      title: '交割合约 / 手动场控',
      desc: '三栏式收割中心：全盘风险热力、价格拨盘与大户追踪。'
    }
  },
  {
    path: 'delivery/harvest-control',
    name: 'delivery-harvest-control',
    component: () => import('../../pages/admin/delivery/DeliveryHarvestControlPage.vue'),
    meta: {
      title: '交割合约 / 手动场控（Radar）',
      desc: '两层式场控：L1 全局收割监控，L2 单档位精准操盘。'
    }
  },
  {
    path: 'delivery/rule-history',
    name: 'delivery-rule-history',
    component: () => import('../../pages/admin/delivery/DeliveryRuleHistoryPage.vue')
  },
  {
    path: 'delivery/rule-statistics',
    name: 'delivery-rule-statistics',
    component: () => import('../../pages/admin/delivery/DeliveryRuleStatisticsPage.vue')
  },
  {
    path: 'delivery/report',
    name: 'delivery-report',
    component: () => import('../../pages/admin/delivery/DeliveryReportPage.vue')
  },
  {
    path: 'delivery/guide',
    name: 'delivery-guide',
    component: () => import('../../pages/admin/delivery/DeliveryGuidePage.vue')
  },
  {
    path: 'delivery/orders',
    name: 'delivery-orders',
    component: () => import('../../pages/admin/delivery/DeliveryOrderPage.vue')
  },
  {
    path: 'delivery/overview',
    redirect: '/admin/delivery/contracts'
  },
  {
    path: 'delivery/config',
    redirect: '/admin/delivery/control'
  },
  {
    path: 'assets',
    redirect: '/admin/assets/currencies'
  },
  {
    path: 'assets/currencies',
    redirect: '/admin/system/currencies'
  },
  {
    path: 'assets/exchange-rate',
    name: 'assets-exchange-rate',
    component: () => import('../../pages/admin/assets/AssetsExchangeRatePage.vue')
  },
  {
    path: 'assets/fee-template',
    name: 'assets-fee-template',
    component: () => import('../../pages/admin/assets/AssetsFeeTemplatePage.vue')
  },
  {
    path: 'assets/manual-collect',
    name: 'assets-manual-collect',
    component: () => import('../../pages/admin/assets/AssetsManualCollectPage.vue')
  },
  {
    path: 'assets/collect-records',
    name: 'assets-collect-records',
    component: () => import('../../pages/admin/assets/AssetsCollectRecordsPage.vue')
  },
  {
    path: 'assets/address-logs',
    name: 'assets-address-logs',
    component: () => import('../../pages/admin/assets/AssetsAddressLogsPage.vue')
  },
  {
    path: 'assets/overview',
    redirect: '/admin/assets/currencies'
  },
  {
    path: 'assets/transfer',
    redirect: '/admin/assets/manual-collect'
  },
  {
    path: 'system/currencies',
    name: 'system-currencies',
    component: () => import('../../pages/admin/assets/AssetsCurrencyPage.vue'),
    meta: {
      title: '系统设置 / 币种管理',
      desc: '统一维护平台支持的币种、精度与网络配置'
    }
  },
  {
    path: 'liquidity/versus/params',
    name: 'liquidity-versus-params',
    component: sectionPage,
    meta: {
      title: '流动性挖矿 / 对赌版 / 参数看板',
      desc: '查看对赌版参数模板和当前生效值。'
    }
  },
  {
    path: 'liquidity/versus/logs',
    name: 'liquidity-versus-logs',
    component: sectionPage,
    meta: {
      title: '流动性挖矿 / 对赌版 / 触发日志',
      desc: '审计策略触发与执行回执。'
    }
  },
  {
    path: 'liquidity/locked/products',
    name: 'liquidity-locked-products',
    component: () => import('../../pages/admin/liquidity/LiquidityLockedProductsPage.vue')
  },
  {
    path: 'liquidity/locked/orders',
    name: 'liquidity-locked-orders',
    component: () => import('../../pages/admin/liquidity/LiquidityLockedOrdersPage.vue')
  },
  {
    path: 'liquidity/locked/yield-control',
    name: 'liquidity-locked-yield-control',
    component: () => import('../../pages/admin/liquidity/LiquidityLockedYieldControlPage.vue')
  },
  {
    path: 'liquidity/locked/expiry-alerts',
    name: 'liquidity-locked-expiry-alerts',
    component: () => import('../../pages/admin/liquidity/LiquidityLockedAlertsPage.vue')
  },
  {
    path: 'liquidity/locked/rules',
    name: 'liquidity-locked-rules',
    component: () => import('../../pages/admin/liquidity/LiquidityLockedRulesPage.vue')
  },
  {
    path: 'liquidity/locked/positions',
    redirect: '/admin/liquidity/locked/products'
  },
  {
    path: 'liquidity/locked/risk',
    redirect: '/admin/liquidity/locked/rules'
  },
  {
    path: 'lending',
    redirect: '/admin/lending/products'
  },
  {
    path: 'lending/products',
    name: 'lending-products',
    component: () => import('../../pages/admin/lending/LendingProductPage.vue')
  },
  {
    path: 'lending/orders',
    name: 'lending-orders',
    component: () => import('../../pages/admin/lending/LendingOrderPage.vue')
  },
  {
    path: 'lending/repayment',
    name: 'lending-repayment',
    component: () => import('../../pages/admin/lending/LendingRepaymentPage.vue')
  },
  {
    path: 'lending/liquidation',
    name: 'lending-liquidation',
    component: () => import('../../pages/admin/lending/LendingLiquidationPage.vue')
  },
  {
    path: 'lending/user-monitoring',
    name: 'lending-user-monitoring',
    component: () => import('../../pages/admin/lending/LendingUserMonitoringPage.vue')
  },
  {
    path: 'lending/guide',
    name: 'lending-guide',
    component: () => import('../../pages/admin/lending/LendingGuidePage.vue')
  },
  {
    path: 'lending/credit-policy',
    name: 'lending-credit-policy',
    component: () => import('../../pages/admin/lending/LendingCreditPolicyPage.vue')
  },
  {
    path: 'ai-quant',
    redirect: '/admin/ai-quant/products'
  },
  {
    path: 'ai-quant/products',
    name: 'ai-quant-products',
    component: () => import('../../pages/admin/aiQuant/AiQuantProductPage.vue')
  },
  {
    path: 'ai-quant/orders',
    name: 'ai-quant-orders',
    component: () => import('../../pages/admin/aiQuant/AiQuantOrderPage.vue')
  },
  {
    path: 'ai-quant/yield-records',
    name: 'ai-quant-yield-records',
    component: () => import('../../pages/admin/aiQuant/AiQuantYieldAdjustmentRecordsPage.vue')
  },
  {
    path: 'ai-quant/yield-adjustment',
    redirect: '/admin/ai-quant/yield-records'
  },
  {
    path: 'ai-quant/control',
    name: 'ai-quant-control',
    component: () => import('../../pages/admin/aiQuant/AiQuantControlPage.vue')
  },
  {
    path: 'ai-quant/rules',
    name: 'ai-quant-rules',
    component: () => import('../../pages/admin/aiQuant/AiQuantRulePage.vue')
  },
  {
    path: 'spot',
    redirect: '/admin/spot/products'
  },
  {
    path: 'spot/products',
    name: 'spot-products',
    component: () => import('../../pages/admin/spot/SpotProductPage.vue')
  },
  {
    path: 'spot/symbols',
    name: 'spot-symbols',
    component: () => import('../../pages/admin/spot/SpotSymbolPage.vue')
  },
  {
    path: 'spot/orders',
    name: 'spot-orders',
    component: () => import('../../pages/admin/spot/SpotOrderPage.vue')
  },
  {
    path: 'users/tag-rules',
    name: 'users-tag-rules',
    component: () => import('../../pages/admin/user/UserTagRulePage.vue')
  },
  {
    path: 'users/vip-config',
    name: 'users-vip-config',
    component: () => import('../../pages/admin/user/VipConfigPage.vue')
  },
  {
    path: 'users/withdraw-policy',
    name: 'users-withdraw-policy',
    component: () => import('../../pages/admin/user/WithdrawPolicyPage.vue')
  },
  {
    path: 'users/vip-upgrades',
    name: 'users-vip-upgrades',
    component: () => import('../../pages/admin/user/CreditScoreUpgradesPage.vue')
  },
  {
    path: 'users/credit-score-config',
    name: 'users-credit-score-config',
    component: () => import('../../pages/admin/user/CreditScoreConfigPage.vue')
  },
  {
    path: 'users/credit-score-changes',
    name: 'users-credit-score-changes',
    component: () => import('../../pages/admin/user/CreditScoreChangesPage.vue')
  },
  {
    path: 'users/credit-score-audit',
    name: 'users-credit-score-audit',
    component: () => import('../../pages/admin/user/CreditScoreAuditPage.vue')
  },
  {
    path: 'users/verification-config',
    name: 'users-verification-config',
    component: () => import('../../pages/admin/user/VerificationConfigPage.vue')
  },
  {
    path: 'users/verification-audit',
    name: 'users-verification-audit',
    component: () => import('../../pages/admin/user/VerificationAuditPage.vue')
  },
  {
    path: 'users/verification-log',
    name: 'users-verification-log',
    component: () => import('../../pages/admin/user/VerificationLogPage.vue')
  },
  {
    path: 'agent',
    redirect: '/admin/agent/management'
  },
  {
    path: 'agent/management',
    name: 'agent-management',
    component: () => import('../../pages/admin/agent/AgentManagementPage.vue')
  },
  {
    path: 'agent/agent-report',
    name: 'agent-agent-report',
    component: () => import('../../pages/admin/agent/AgentReportPage.vue'),
    meta: {
      title: '代理/分销 / 代理报表',
      desc: '按日查看代理渠道佣金汇总，并查看当日产生佣金的代理列表。'
    }
  },
  {
    path: 'agent/level-commission',
    redirect: '/admin/agent/management'
  },
  {
    path: 'agent/applications',
    redirect: '/admin/agent/management'
  },
  {
    path: 'agent/agent-commission-config',
    name: 'agent-commission-config',
    component: () => import('../../pages/admin/agent/AgentCommissionConfigPage.vue'),
    meta: {
      title: '代理/分销 / 代理记佣配置',
      desc: '代理业务分佣默认比例与全局规则。'
    }
  },
  {
    path: 'agent/agent-commission-settlement',
    name: 'agent-commission-settlement',
    component: () => import('../../pages/admin/agent/AgentCommissionSettlementPage.vue'),
    meta: {
      title: '代理/分销 / 代理佣金结算',
      desc: '代理账期佣金复核、出款与入账处理。'
    }
  },
  {
    path: 'agent/referral-config',
    name: 'agent-referral-config',
    component: () => import('../../pages/admin/agent/ReferralConfigPage.vue'),
    meta: {
      title: '代理/分销 / 裂变分销配置',
      desc: '邀请裂变多级分佣规则配置。'
    }
  },
  {
    path: 'agent/referral-commission',
    name: 'agent-referral-commission',
    component: () => import('../../pages/admin/agent/ReferralCommissionPage.vue'),
    meta: {
      title: '代理/分销 / 裂变分佣记录',
      desc: '裂变分佣记录查询与状态管理。'
    }
  },
  {
    path: 'agent/referral-statistics',
    name: 'agent-referral-statistics',
    component: () => import('../../pages/admin/agent/ReferralStatisticsPage.vue'),
    meta: {
      title: '代理/分销 / 裂变分销统计',
      desc: '裂变分佣与订单汇总统计。'
    }
  },
  {
    path: 'system/site-config',
    name: 'system-site-config',
    component: () => import('../../pages/admin/system/SiteConfigPage.vue'),
    meta: {
      title: '系统设置 / 站点配置',
      desc: '维护站点名称、Logo 等品牌展示信息。'
    }
  },
  {
    path: 'system/sms-channels',
    name: 'system-sms-channels',
    component: () => import('../../pages/admin/system/SmsChannelsPage.vue'),
    meta: {
      title: '系统设置 / 短信通道',
      desc: '按国际区号配置短信服务商与接口参数。'
    }
  },
  {
    path: 'system/smtp-settings',
    name: 'system-smtp-settings',
    component: () => import('../../pages/admin/system/SmtpSettingsPage.vue'),
    meta: {
      title: '系统设置 / 邮件服务 (SMTP)',
      desc: '配置多条 SMTP 发信账户并分别启用。'
    }
  },
  {
    path: 'system/locale-settings',
    name: 'system-locale-settings',
    component: () => import('../../pages/admin/system/LocaleSettingsPage.vue'),
    meta: {
      title: '系统设置 / 语言与区号',
      desc: '配置前台可选语言、默认语言与手机国际区号。'
    }
  },
  {
    path: 'system/error-codes',
    name: 'system-error-codes',
    component: () => import('../../pages/admin/system/ErrorCodePage.vue')
  }
]
