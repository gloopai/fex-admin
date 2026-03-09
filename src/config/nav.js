export const navTree = [
  {
    title: '仪表盘',
    icon: 'dashboard',
    path: '/'
  },
  {
    title: '用户管理',
    icon: 'users',
    children: [
      { title: '用户列表', path: '/users/list' }
    ]
  },
  {
    title: '会员管理',
    icon: 'vip',
    children: [
      { title: 'VIP等级配置', path: '/users/vip-config' },
      { title: 'VIP升级日志', path: '/users/vip-upgrades' },
      { title: '信用分配置', path: '/users/credit-score-config' },
      { title: '信用分变动日志', path: '/users/credit-score-changes' },
      { title: '认证等级配置', path: '/users/verification-config' },
      { title: '认证身份审核', path: '/users/verification-audit' },
      { title: '认证审核日志', path: '/users/verification-log' }
    ]
  },
  {
    title: '代理/分销',
    icon: 'users-group',
    children: [
      { title: '代理列表', path: '/agent/management' },
      { title: '代理申请审核', path: '/agent/applications' },
      { title: '裂变分销配置', path: '/agent/referral-config' },
      { title: '裂变分佣记录', path: '/agent/referral-commission' },
      { title: '裂变分销统计', path: '/agent/referral-statistics' }
    ]
  },
  {
    title: '永续合约',
    icon: 'contract',
    defaultOpen: true,
    children: [
      { title: '合约产品', path: '/perpetual/overview' },
      { title: '合约线控', path: '/perpetual/contract-monitor' },
      { title: '合约线控日志', path: '/perpetual/contract-log' },
      { title: '使用指南', path: '/perpetual/guide' }
    ]
  },
  {
    title: '交割合约',
    icon: 'delivery',
    children: [
      { title: '交割合约', path: '/delivery/contracts' },
      { title: '场控操作', path: '/delivery/control' },
      { title: '操作日志', path: '/delivery/logs' },
      { title: '使用指南', path: '/delivery/guide' }
    ]
  },
  {
    title: '资金管理',
    icon: 'wallet',
    children: [
      { title: '币种管理', path: '/assets/currencies' },
      { title: '手动归集', path: '/assets/manual-collect' },
      { title: '归集记录', path: '/assets/collect-records' },
      { title: '地址日志', path: '/assets/address-logs' }
    ]
  },
  {
    title: '流动性挖矿',
    icon: 'droplet',
    children: [
      { title: '产品管理', path: '/liquidity/locked/products' },
      { title: '订单管理', path: '/liquidity/locked/orders' },
      { title: '收益控制', path: '/liquidity/locked/yield-control' },
      { title: '到期预警', path: '/liquidity/locked/expiry-alerts' },
      { title: '规则说明', path: '/liquidity/locked/rules' }
    ]
  },
  {
    title: '抵押借贷',
    icon: 'loan',
    children: [
      { title: '产品管理', path: '/lending/products' },
      { title: '订单管理', path: '/lending/orders' },
      { title: '还款管理', path: '/lending/repayment' },
      { title: '清算管理', path: '/lending/liquidation' },
      { title: '用户监控', path: '/lending/user-monitoring' },
      { title: '规则说明', path: '/lending/guide' }
    ]
  },
  {
    title: 'AI量化交易',
    icon: 'robot',
    children: [
      { title: '产品管理', path: '/ai-quant/products' },
      { title: '订单管理', path: '/ai-quant/orders' },
      { title: '收益调整', path: '/ai-quant/yield-adjustment' },
      { title: '调控管理', path: '/ai-quant/control' },
      { title: '规则说明', path: '/ai-quant/rules' }
    ]
  }
]
