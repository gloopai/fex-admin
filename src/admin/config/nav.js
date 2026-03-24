export const navTree = [
  {
    title: '仪表盘',
    icon: 'dashboard',
    path: '/admin'
  },
  { title: '合约场控面板', icon: 'contract', path: '/admin/contracts/panel' },
  {
    title: '用户管理',
    icon: 'users',
    children: [
      { title: '用户列表', path: '/admin/users/list' },
      { title: '用户标签规则', path: '/admin/users/tag-rules' }
    ]
  },
  {
    title: '会员管理',
    icon: 'vip',
    children: [
      { title: 'VIP等级配置', path: '/admin/users/vip-config' },
      { title: 'VIP升级日志', path: '/admin/users/vip-upgrades' },
      { title: '信用分配置', path: '/admin/users/credit-score-config' },
      { title: '信用分变动日志', path: '/admin/users/credit-score-changes' },
      { title: '信用分变动审核', path: '/admin/users/credit-score-audit' },
      { title: '认证等级配置', path: '/admin/users/verification-config' },
      { title: '认证身份审核', path: '/admin/users/verification-audit' },
      { title: '认证审核日志', path: '/admin/users/verification-log' }
    ]
  },
  {
    title: '代理/分销',
    icon: 'users-group',
    children: [
      { title: '代理列表', path: '/admin/agent/management' },
      { title: '代理申请审核', path: '/admin/agent/applications' },
      { title: '裂变分销配置', path: '/admin/agent/referral-config' },
      { title: '裂变分佣记录', path: '/admin/agent/referral-commission' },
      { title: '裂变分销统计', path: '/admin/agent/referral-statistics' }
    ]
  },
  {
    title: '永续合约',
    icon: 'contract',
    defaultOpen: true,
    children: [
      { title: '合约产品', path: '/admin/perpetual/overview' },
      { title: '杠杆模板', path: '/admin/perpetual/leverage-template' },
      { title: '订单管理', path: '/admin/perpetual/orders' },
      { title: '合约线控', path: '/admin/perpetual/contract-monitor' },
      { title: '手动插线', path: '/admin/perpetual/manual-line' },
      { title: '合约线控日志', path: '/admin/perpetual/contract-log' },
      { title: '线控决策报表', path: '/admin/perpetual/report' },
      { title: '使用指南', path: '/admin/perpetual/guide' }
    ]
  },
  {
    title: '交割合约',
    icon: 'delivery',
    children: [
      { title: '合约产品', path: '/admin/delivery/contracts' },
      { title: '周期模板', path: '/admin/delivery/templates' },
      { title: '订单管理', path: '/admin/delivery/orders' },
      { title: '自动化场控', path: '/admin/delivery/auto-rules' },
      { title: '手动场控', path: '/admin/delivery/control' },
      { title: '手动场控（Radar）', path: '/admin/delivery/harvest-control' },
      { title: '场控触发日志', path: '/admin/delivery/rule-history' },
      // { title: '规则效果统计', path: '/admin/delivery/rule-statistics' },
      { title: '场控决策报表', path: '/admin/delivery/report' },
      { title: '使用指南', path: '/admin/delivery/guide' }
    ]
  },
   {
    title: '现货交易',
    icon: 'exchange',
    children: [
      { title: '产品管理', path: '/admin/spot/products' },
      { title: '订单管理', path: '/admin/spot/orders' }
    ]
  },
  {
    title: '资产管理',
    icon: 'wallet',
    children: [
      { title: '币种管理', path: '/admin/assets/currencies' },
      { title: '交易对管理', path: '/admin/spot/symbols' },
      { title: '手动归集', path: '/admin/assets/manual-collect' },
      { title: '归集记录', path: '/admin/assets/collect-records' },
      { title: '链上交易日志', path: '/admin/assets/address-logs' },
      { title: '闪兑汇率管理', path: '/admin/assets/exchange-rate' },
      { title: '闪兑费率模板', path: '/admin/assets/fee-template' },
    ]
  },
  {
    title: '流动性挖矿',
    icon: 'droplet',
    children: [
      { title: '产品管理', path: '/admin/liquidity/locked/products' },
      { title: '订单管理', path: '/admin/liquidity/locked/orders' },
      { title: '收益控制', path: '/admin/liquidity/locked/yield-control' },
      { title: '到期预警', path: '/admin/liquidity/locked/expiry-alerts' },
      { title: '规则说明', path: '/admin/liquidity/locked/rules' }
    ]
  },
  {
    title: '抵押借贷',
    icon: 'loan',
    children: [
      { title: '产品管理', path: '/admin/lending/products' },
      { title: '订单管理', path: '/admin/lending/orders' },
      { title: '还款管理', path: '/admin/lending/repayment' },
      { title: '清算管理', path: '/admin/lending/liquidation' },
      { title: '用户监控', path: '/admin/lending/user-monitoring' },
      { title: '规则说明', path: '/admin/lending/guide' }
    ]
  },
  {
    title: 'AI量化交易',
    icon: 'robot',
    children: [
      { title: '产品管理', path: '/admin/ai-quant/products' },
      { title: '订单管理', path: '/admin/ai-quant/orders' },
      { title: '收益调整', path: '/admin/ai-quant/yield-adjustment' },
      { title: '调控管理', path: '/admin/ai-quant/control' },
      { title: '规则说明', path: '/admin/ai-quant/rules' }
    ]
  },

  {
    title: '系统设置',
    icon: 'spark',
    children: [
      
      { title: '错误码管理', path: '/admin/system/error-codes' }
    ]
  },
  {
    title: '前台模板',
    icon: 'spark',
    children: [
      { title: '个人中心（PC）', path: '/front/personal-center' },
      { title: '个人中心（移动）', path: '/m/personal-center' },
      { title: '认证流程（PC）', path: '/front/verification-flow' },
      { title: '认证流程（移动）', path: '/m/verification-flow' }
    ]
  },
 
]
