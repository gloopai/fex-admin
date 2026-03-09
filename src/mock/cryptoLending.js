// 加密货币抵押借贷 Mock 数据
import {
  PRODUCT_STATUS,
  LOAN_ORDER_STATUS,
  REPAYMENT_STATUS,
  REPAYMENT_TYPE,
  LIQUIDATION_STATUS,
  LIQUIDATION_TRIGGER,
  RISK_LEVEL,
  INTEREST_RATE_TYPE
} from '../constants/cryptoLending'

// 产品管理 Mock 数据
export const mockProducts = [
  {
    productId: 'LND-001',
    productName: 'BTC标准借贷',
    collateralType: 'BTC',
    loanCurrency: 'USDT',
    minLoanAmount: 1000,
    maxLoanAmount: 1000000,
    interestRate: 8.5,
    interestRateType: INTEREST_RATE_TYPE.FIXED,
    ltvRatio: 70,
    liquidationThreshold: 85,
    minLoanDuration: 7,
    maxLoanDuration: 365,
    liquidationPenalty: 5,
    status: PRODUCT_STATUS.ACTIVE,
    totalLent: 15000000,
    availableLiquidity: 5000000,
    activeUsers: 1523,
    activeOrders: 2347,
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-03-01 15:30:00'
  },
  {
    productId: 'LND-002',
    productName: 'ETH灵活借贷',
    collateralType: 'ETH',
    loanCurrency: 'USDT',
    minLoanAmount: 500,
    maxLoanAmount: 500000,
    interestRate: 9.2,
    interestRateType: INTEREST_RATE_TYPE.FLOATING,
    ltvRatio: 65,
    liquidationThreshold: 80,
    minLoanDuration: 1,
    maxLoanDuration: 180,
    liquidationPenalty: 5,
    status: PRODUCT_STATUS.ACTIVE,
    totalLent: 8500000,
    availableLiquidity: 3200000,
    activeUsers: 856,
    activeOrders: 1289,
    createTime: '2024-02-01 14:20:00',
    updateTime: '2024-03-05 09:15:00'
  },
  {
    productId: 'LND-003',
    productName: 'USDT稳定币借贷',
    collateralType: 'USDT',
    loanCurrency: 'USDC',
    minLoanAmount: 100,
    maxLoanAmount: 100000,
    interestRate: 6.8,
    interestRateType: INTEREST_RATE_TYPE.FIXED,
    ltvRatio: 90,
    liquidationThreshold: 95,
    minLoanDuration: 7,
    maxLoanDuration: 90,
    liquidationPenalty: 2,
    status: PRODUCT_STATUS.ACTIVE,
    totalLent: 3200000,
    availableLiquidity: 1800000,
    activeUsers: 445,
    activeOrders: 623,
    createTime: '2024-01-20 11:30:00',
    updateTime: '2024-02-28 16:45:00'
  },
  {
    productId: 'LND-004',
    productName: 'BNB高额借贷',
    collateralType: 'BNB',
    loanCurrency: 'BUSD',
    minLoanAmount: 5000,
    maxLoanAmount: 2000000,
    interestRate: 10.5,
    interestRateType: INTEREST_RATE_TYPE.TIERED,
    ltvRatio: 60,
    liquidationThreshold: 75,
    minLoanDuration: 30,
    maxLoanDuration: 365,
    liquidationPenalty: 8,
    status: PRODUCT_STATUS.ACTIVE,
    totalLent: 12000000,
    availableLiquidity: 4500000,
    activeUsers: 324,
    activeOrders: 456,
    createTime: '2024-01-10 09:00:00',
    updateTime: '2024-03-07 10:20:00'
  },
  {
    productId: 'LND-005',
    productName: 'ETH超短期借贷',
    collateralType: 'ETH',
    loanCurrency: 'USDC',
    minLoanAmount: 200,
    maxLoanAmount: 50000,
    interestRate: 12.0,
    interestRateType: INTEREST_RATE_TYPE.FIXED,
    ltvRatio: 50,
    liquidationThreshold: 65,
    minLoanDuration: 1,
    maxLoanDuration: 30,
    liquidationPenalty: 10,
    status: PRODUCT_STATUS.SUSPENDED,
    totalLent: 850000,
    availableLiquidity: 150000,
    activeUsers: 89,
    activeOrders: 134,
    createTime: '2024-02-15 13:45:00',
    updateTime: '2024-03-06 11:00:00'
  }
]

// 订单管理 Mock 数据
export const mockOrders = [
  {
    orderId: 'ORD-20240308-101',
    userId: 'USR-10101',
    userName: '周杰伦',
    email: 'jay@example.com',
    phone: '+86 138****8888',
    creditScore: 850,
    productId: 'LND-001',
    productName: 'BTC标准借贷',
    collateralType: 'BTC',
    collateralAmount: 3.5,
    collateralValue: 175000,
    loanCurrency: 'USDT',
    loanAmount: 122500,
    requestedAmount: 122500,
    initialLtv: 70,
    currentLtv: 70,
    interestRate: 8.5,
    interestAccrued: 0,
    totalDebt: 122500,
    liquidationPrice: 35000,
    currentPrice: 50000,
    liquidationThreshold: 85,
    status: LOAN_ORDER_STATUS.PENDING,
    loanDuration: 180,
    daysElapsed: 0,
    daysRemaining: 180,
    createTime: '2024-03-08 14:30:00',
    updateTime: '2024-03-08 14:30:00',
    maturityDate: '2024-09-04 14:30:00',
    riskLevel: RISK_LEVEL.LOW,
    purpose: '个人投资周转',
    remarks: '用户信用良好，历史借贷记录无逾期'
  },
  {
    orderId: 'ORD-20240308-102',
    userId: 'USR-10102',
    userName: '林心如',
    email: 'ruby@example.com',
    phone: '+86 139****6666',
    creditScore: 720,
    productId: 'LND-002',
    productName: 'ETH灵活借贷',
    collateralType: 'ETH',
    collateralAmount: 80,
    collateralValue: 240000,
    loanCurrency: 'USDT',
    loanAmount: 156000,
    requestedAmount: 156000,
    initialLtv: 65,
    currentLtv: 65,
    interestRate: 9.2,
    interestAccrued: 0,
    totalDebt: 156000,
    liquidationPrice: 2450,
    currentPrice: 3000,
    liquidationThreshold: 80,
    status: LOAN_ORDER_STATUS.PENDING,
    loanDuration: 90,
    daysElapsed: 0,
    daysRemaining: 90,
    createTime: '2024-03-08 13:15:00',
    updateTime: '2024-03-08 13:15:00',
    maturityDate: '2024-06-06 13:15:00',
    riskLevel: RISK_LEVEL.MEDIUM,
    purpose: '短期资金周转',
    remarks: '首次借贷用户，资产充足'
  },
  {
    orderId: 'ORD-20240308-103',
    userId: 'USR-10103',
    userName: '陈冠希',
    email: 'edison@example.com',
    phone: '+86 137****7777',
    creditScore: 650,
    productId: 'LND-004',
    productName: 'BNB高额借贷',
    collateralType: 'BNB',
    collateralAmount: 800,
    collateralValue: 320000,
    loanCurrency: 'BUSD',
    loanAmount: 192000,
    requestedAmount: 192000,
    initialLtv: 60,
    currentLtv: 60,
    interestRate: 10.5,
    interestAccrued: 0,
    totalDebt: 192000,
    liquidationPrice: 320,
    currentPrice: 400,
    liquidationThreshold: 75,
    status: LOAN_ORDER_STATUS.PENDING,
    loanDuration: 365,
    daysElapsed: 0,
    daysRemaining: 365,
    createTime: '2024-03-08 11:45:00',
    updateTime: '2024-03-08 11:45:00',
    maturityDate: '2025-03-08 11:45:00',
    riskLevel: RISK_LEVEL.HIGH,
    purpose: '商业投资',
    remarks: '大额借贷，需重点审核抵押资产来源'
  },
  {
    orderId: 'ORD-20240308-001',
    userId: 'USR-10001',
    userName: '张三',
    email: 'zhangsan@example.com',
    phone: '+86 138****1234',
    creditScore: 780,
    productId: 'LND-001',
    productName: 'BTC标准借贷',
    collateralType: 'BTC',
    collateralAmount: 2.5,
    collateralValue: 125000,
    loanCurrency: 'USDT',
    loanAmount: 87500,
    requestedAmount: 87500,
    initialLtv: 70,
    currentLtv: 68,
    interestRate: 8.5,
    interestAccrued: 245.5,
    totalDebt: 87745.5,
    liquidationPrice: 35000,
    currentPrice: 50000,
    liquidationThreshold: 85,
    status: LOAN_ORDER_STATUS.ACTIVE,
    loanDuration: 90,
    daysElapsed: 12,
    daysRemaining: 78,
    createTime: '2024-02-25 10:30:00',
    updateTime: '2024-03-08 09:15:00',
    maturityDate: '2024-05-25 10:30:00',
    riskLevel: RISK_LEVEL.LOW,
    purpose: '个人理财资金周转',
    remarks: '老客户，信用记录良好，按时还款'
  },
  {
    orderId: 'ORD-20240308-002',
    userId: 'USR-10002',
    userName: '李四',
    email: 'lisi@example.com',
    phone: '+86 139****5678',
    creditScore: 690,
    productId: 'LND-002',
    productName: 'ETH灵活借贷',
    collateralType: 'ETH',
    collateralAmount: 50,
    collateralValue: 150000,
    loanCurrency: 'USDT',
    loanAmount: 97500,
    requestedAmount: 97500,
    initialLtv: 65,
    currentLtv: 72,
    interestRate: 9.2,
    interestAccrued: 567.8,
    totalDebt: 98067.8,
    liquidationPrice: 2450,
    currentPrice: 3000,
    liquidationThreshold: 80,
    status: LOAN_ORDER_STATUS.ACTIVE,
    loanDuration: 60,
    daysElapsed: 25,
    daysRemaining: 35,
    createTime: '2024-02-12 14:20:00',
    updateTime: '2024-03-08 09:15:00',
    maturityDate: '2024-04-13 14:20:00',
    riskLevel: RISK_LEVEL.MEDIUM,
    purpose: '流动性需求，短期周转',
    remarks: '市场波动较大，需关注LTV变化'
  },
  {
    orderId: 'ORD-20240307-003',
    userId: 'USR-10003',
    userName: '王五',
    email: 'wangwu@example.com',
    phone: '+86 136****9012',
    creditScore: 820,
    productId: 'LND-003',
    productName: 'USDT稳定币借贷',
    collateralType: 'USDT',
    collateralAmount: 50000,
    collateralValue: 50000,
    loanCurrency: 'USDC',
    loanAmount: 45000,
    requestedAmount: 45000,
    initialLtv: 90,
    currentLtv: 90,
    interestRate: 6.8,
    interestAccrued: 102.3,
    totalDebt: 45102.3,
    liquidationPrice: 0.95,
    currentPrice: 1.00,
    liquidationThreshold: 95,
    status: LOAN_ORDER_STATUS.REPAYING,
    loanDuration: 30,
    daysElapsed: 12,
    daysRemaining: 18,
    createTime: '2024-02-24 11:00:00',
    updateTime: '2024-03-08 09:15:00',
    maturityDate: '2024-03-25 11:00:00',
    riskLevel: RISK_LEVEL.LOW,
    purpose: '稳定币短期借贷',
    remarks: '稳定币抵押，风险极低'
  },
  {
    orderId: 'ORD-20240305-004',
    userId: 'USR-10004',
    userName: '赵六',
    email: 'zhaoliu@example.com',
    phone: '+86 135****3456',
    creditScore: 760,
    productId: 'LND-001',
    productName: 'BTC标准借贷',
    collateralType: 'BTC',
    collateralAmount: 1.2,
    collateralValue: 60000,
    loanCurrency: 'USDT',
    loanAmount: 42000,
    requestedAmount: 42000,
    initialLtv: 70,
    currentLtv: 70,
    interestRate: 8.5,
    interestAccrued: 0,
    totalDebt: 42000,
    liquidationPrice: 35294,
    currentPrice: 50000,
    liquidationThreshold: 85,
    status: LOAN_ORDER_STATUS.COMPLETED,
    loanDuration: 45,
    daysElapsed: 45,
    daysRemaining: 0,
    createTime: '2024-01-20 09:30:00',
    updateTime: '2024-03-05 16:45:00',
    maturityDate: '2024-03-05 09:30:00',
    riskLevel: RISK_LEVEL.LOW,
    purpose: '短期资金需求',
    remarks: '已按时全额还款，信用优秀'
  },
  {
    orderId: 'ORD-20240301-005',
    userId: 'USR-10005',
    userName: '孙七',
    email: 'sunqi@example.com',
    phone: '+86 137****7890',
    creditScore: 620,
    productId: 'LND-004',
    productName: 'BNB高额借贷',
    collateralType: 'BNB',
    collateralAmount: 500,
    collateralValue: 200000,
    loanCurrency: 'BUSD',
    loanAmount: 120000,
    requestedAmount: 120000,
    initialLtv: 60,
    currentLtv: 82,
    interestRate: 10.5,
    interestAccrued: 1890.4,
    totalDebt: 121890.4,
    liquidationPrice: 324,
    currentPrice: 400,
    liquidationThreshold: 75,
    status: LOAN_ORDER_STATUS.LIQUIDATED,
    loanDuration: 180,
    daysElapsed: 65,
    daysRemaining: 0,
    createTime: '2024-01-02 10:00:00',
    updateTime: '2024-03-08 06:30:00',
    maturityDate: '2024-07-01 10:00:00',
    liquidationTime: '2024-03-08 06:30:00',
    riskLevel: RISK_LEVEL.HIGH,
    purpose: '投资扩张资金',
    remarks: '抵押资产价格大幅下跌，触发清算'
  }
]

// 还款管理 Mock 数据
export const mockRepayments = [
  {
    repaymentId: 'REP-20240308-001',
    orderId: 'ORD-20240308-001',
    userId: 'USR-10001',
    userName: '张三',
    productName: 'BTC标准借贷',
    repaymentType: REPAYMENT_TYPE.INTEREST_ONLY,
    amount: 245.5,
    interestPaid: 245.5,
    principalPaid: 0,
    remainingDebt: 87500,
    status: REPAYMENT_STATUS.COMPLETED,
    paymentMethod: '钱包余额',
    transactionId: 'TXN-20240308-100001',
    repaymentTime: '2024-03-08 10:30:00',
    createTime: '2024-03-08 10:25:00'
  },
  {
    repaymentId: 'REP-20240307-002',
    orderId: 'ORD-20240307-003',
    userId: 'USR-10003',
    userName: '王五',
    productName: 'USDT稳定币借贷',
    repaymentType: REPAYMENT_TYPE.PARTIAL,
    amount: 15000,
    interestPaid: 102.3,
    principalPaid: 14897.7,
    remainingDebt: 30102.3,
    status: REPAYMENT_STATUS.COMPLETED,
    paymentMethod: '加密钱包',
    transactionId: 'TXN-20240307-100002',
    repaymentTime: '2024-03-07 15:45:00',
    createTime: '2024-03-07 15:40:00'
  },
  {
    repaymentId: 'REP-20240306-003',
    orderId: 'ORD-20240308-002',
    userId: 'USR-10002',
    userName: '李四',
    productName: 'ETH灵活借贷',
    repaymentType: REPAYMENT_TYPE.INTEREST_ONLY,
    amount: 567.8,
    interestPaid: 567.8,
    principalPaid: 0,
    remainingDebt: 97500,
    status: REPAYMENT_STATUS.PROCESSING,
    paymentMethod: '钱包余额',
    transactionId: 'TXN-20240306-100003',
    repaymentTime: null,
    createTime: '2024-03-06 11:20:00'
  },
  {
    repaymentId: 'REP-20240305-004',
    orderId: 'ORD-20240305-004',
    userId: 'USR-10004',
    userName: '赵六',
    productName: 'BTC标准借贷',
    repaymentType: REPAYMENT_TYPE.FULL,
    amount: 42468.5,
    interestPaid: 468.5,
    principalPaid: 42000,
    remainingDebt: 0,
    status: REPAYMENT_STATUS.COMPLETED,
    paymentMethod: '钱包余额',
    transactionId: 'TXN-20240305-100004',
    repaymentTime: '2024-03-05 16:45:00',
    createTime: '2024-03-05 16:40:00'
  },
  {
    repaymentId: 'REP-20240228-005',
    orderId: 'ORD-20240308-001',
    userId: 'USR-10001',
    userName: '张三',
    productName: 'BTC标准借贷',
    repaymentType: REPAYMENT_TYPE.AUTO,
    amount: 197.5,
    interestPaid: 197.5,
    principalPaid: 0,
    remainingDebt: 87500,
    status: REPAYMENT_STATUS.FAILED,
    paymentMethod: '自动扣款',
    transactionId: null,
    repaymentTime: null,
    createTime: '2024-02-28 00:00:00',
    failureReason: '余额不足'
  }
]

// 清算管理 Mock 数据
export const mockLiquidations = [
  {
    liquidationId: 'LIQ-20240308-001',
    orderId: 'ORD-20240301-005',
    userId: 'USR-10005',
    userName: '孙七',
    productName: 'BNB高额借贷',
    collateralType: 'BNB',
    triggerType: LIQUIDATION_TRIGGER.LTV_THRESHOLD,
    triggerLtv: 82,
    liquidationThreshold: 75,
    collateralSold: 350,
    collateralRemaining: 150,
    liquidationPrice: 348.26,
    marketPrice: 400,
    liquidationValue: 121890.4,
    debtRecovered: 121890.4,
    penalty: 9751.2,
    netProceeds: 0,
    status: LIQUIDATION_STATUS.COMPLETED,
    liquidationTime: '2024-03-08 06:30:00',
    createTime: '2024-03-08 06:25:00',
    executedBy: 'SYSTEM_AUTO'
  },
  {
    liquidationId: 'LIQ-20240305-002',
    orderId: 'ORD-20240220-015',
    userId: 'USR-10015',
    userName: '周八',
    productName: 'ETH灵活借贷',
    collateralType: 'ETH',
    triggerType: LIQUIDATION_TRIGGER.PRICE_DROP,
    triggerLtv: 88,
    liquidationThreshold: 80,
    collateralSold: 25,
    collateralRemaining: 5,
    liquidationPrice: 2400,
    marketPrice: 2450,
    liquidationValue: 60000,
    debtRecovered: 58500,
    penalty: 4680,
    netProceeds: 0,
    status: LIQUIDATION_STATUS.COMPLETED,
    liquidationTime: '2024-03-05 08:45:00',
    createTime: '2024-03-05 08:40:00',
    executedBy: 'ADMIN_001'
  },
  {
    liquidationId: 'LIQ-20240302-003',
    orderId: 'ORD-20240115-025',
    userId: 'USR-10025',
    userName: '吴九',
    productName: 'BTC标准借贷',
    collateralType: 'BTC',
    triggerType: LIQUIDATION_TRIGGER.OVERDUE,
    triggerLtv: 75,
    liquidationThreshold: 85,
    collateralSold: 0.8,
    collateralRemaining: 0.2,
    liquidationPrice: 48000,
    marketPrice: 49500,
    liquidationValue: 38400,
    debtRecovered: 35000,
    penalty: 2800,
    netProceeds: 600,
    status: LIQUIDATION_STATUS.PARTIAL,
    liquidationTime: '2024-03-02 10:15:00',
    createTime: '2024-03-02 10:00:00',
    executedBy: 'SYSTEM_AUTO'
  },
  {
    liquidationId: 'LIQ-20240228-004',
    orderId: 'ORD-20240110-032',
    userId: 'USR-10032',
    userName: '郑十',
    productName: 'BNB高额借贷',
    collateralType: 'BNB',
    triggerType: LIQUIDATION_TRIGGER.MANUAL,
    triggerLtv: 79,
    liquidationThreshold: 75,
    collateralSold: 200,
    collateralRemaining: 0,
    liquidationPrice: 385,
    marketPrice: 390,
    liquidationValue: 77000,
    debtRecovered: 75000,
    penalty: 6000,
    netProceeds: 0,
    status: LIQUIDATION_STATUS.FAILED,
    liquidationTime: null,
    createTime: '2024-02-28 14:30:00',
    executedBy: 'ADMIN_002',
    failureReason: '市场流动性不足'
  }
]

// 用户监控 Mock 数据
export const mockUserMonitoring = [
  {
    userId: 'USR-10001',
    userName: '张三',
    email: 'zhangsan@example.com',
    totalCollateral: 125000,
    totalDebt: 87745.5,
    averageLtv: 68,
    riskLevel: RISK_LEVEL.LOW,
    activeOrders: 1,
    completedOrders: 3,
    liquidatedOrders: 0,
    overdueAmount: 0,
    totalInterestPaid: 1250.5,
    creditScore: 850,
    accountAge: 365,
    lastActivity: '2024-03-08 10:30:00',
    registrationDate: '2023-03-08 09:00:00',
    kycStatus: '已认证',
    vipLevel: 'Gold'
  },
  {
    userId: 'USR-10002',
    userName: '李四',
    email: 'lisi@example.com',
    totalCollateral: 150000,
    totalDebt: 98067.8,
    averageLtv: 72,
    riskLevel: RISK_LEVEL.MEDIUM,
    activeOrders: 1,
    completedOrders: 2,
    liquidatedOrders: 0,
    overdueAmount: 0,
    totalInterestPaid: 890.3,
    creditScore: 720,
    accountAge: 280,
    lastActivity: '2024-03-08 09:15:00',
    registrationDate: '2023-06-01 14:30:00',
    kycStatus: '已认证',
    vipLevel: 'Silver'
  },
  {
    userId: 'USR-10003',
    userName: '王五',
    email: 'wangwu@example.com',
    totalCollateral: 50000,
    totalDebt: 30102.3,
    averageLtv: 60,
    riskLevel: RISK_LEVEL.LOW,
    activeOrders: 1,
    completedOrders: 5,
    liquidatedOrders: 0,
    overdueAmount: 0,
    totalInterestPaid: 2100.8,
    creditScore: 810,
    accountAge: 420,
    lastActivity: '2024-03-07 15:45:00',
    registrationDate: '2022-12-15 10:20:00',
    kycStatus: '已认证',
    vipLevel: 'Platinum'
  },
  {
    userId: 'USR-10005',
    userName: '孙七',
    email: 'sunqi@example.com',
    totalCollateral: 0,
    totalDebt: 0,
    averageLtv: 0,
    riskLevel: RISK_LEVEL.CRITICAL,
    activeOrders: 0,
    completedOrders: 0,
    liquidatedOrders: 1,
    overdueAmount: 0,
    totalInterestPaid: 1890.4,
    creditScore: 450,
    accountAge: 180,
    lastActivity: '2024-03-08 06:30:00',
    registrationDate: '2023-09-10 11:00:00',
    kycStatus: '已认证',
    vipLevel: 'Bronze'
  },
  {
    userId: 'USR-10015',
    userName: '周八',
    email: 'zhouba@example.com',
    totalCollateral: 15000,
    totalDebt: 0,
    averageLtv: 0,
    riskLevel: RISK_LEVEL.HIGH,
    activeOrders: 0,
    completedOrders: 1,
    liquidatedOrders: 1,
    overdueAmount: 0,
    totalInterestPaid: 567.2,
    creditScore: 580,
    accountAge: 150,
    lastActivity: '2024-03-05 08:45:00',
    registrationDate: '2023-10-08 15:30:00',
    kycStatus: '已认证',
    vipLevel: 'Bronze'
  }
]

// 规则说明数据
export const guideData = {
  introduction: {
    title: '加密货币抵押借贷产品介绍',
    content: `
      <h2>什么是加密货币抵押借贷？</h2>
      <p>加密货币抵押借贷是一种去中心化金融（DeFi）服务，用户可以通过抵押自己的加密货币资产来借入稳定币或其他数字货币，无需出售原有资产即可获得流动性。</p>
      
      <h3>核心优势</h3>
      <ul>
        <li><strong>无需出售资产：</strong>保留加密货币的升值潜力</li>
        <li><strong>快速审批：</strong>自动化流程，即时放款</li>
        <li><strong>灵活还款：</strong>支持部分还款、利息先还等多种方式</li>
        <li><strong>透明度高：</strong>所有费率和条款公开透明</li>
        <li><strong>市场化定价：</strong>利率根据市场供需实时调整</li>
      </ul>
      
      <h3>产品类型</h3>
      <ul>
        <li><strong>标准借贷：</strong>适合长期持有者，固定利率，期限灵活</li>
        <li><strong>灵活借贷：</strong>浮动利率，可随时提前还款，无违约金</li>
        <li><strong>高额借贷：</strong>针对大额用户，更高的贷款额度</li>
        <li><strong>稳定币借贷：</strong>稳定币对稳定币，低风险低利率</li>
        <li><strong>超短期借贷：</strong>适合短期资金需求，日息计算</li>
      </ul>
    `
  },
  
  terminology: {
    title: '名词解释',
    terms: [
      {
        term: 'LTV (Loan-to-Value Ratio)',
        definition: '贷款价值比，表示借款金额与抵押品价值的比率。例如：抵押10万美元的BTC，借出7万USDT，LTV为70%。',
        example: '如果您抵押价值100,000 USDT的BTC，在LTV为70%的产品中，最多可借出70,000 USDT。'
      },
      {
        term: '清算阈值 (Liquidation Threshold)',
        definition: '触发强制清算的LTV临界值。当抵押品价值下降导致LTV超过此阈值时，系统将自动清算部分或全部抵押品。',
        example: '清算阈值为85%时，如果BTC价格下跌导致LTV达到85%，系统将启动清算程序。'
      },
      {
        term: '年化利率 (APR)',
        definition: '按年计算的借款利息率，不包括复利效果。实际利息按日计算。',
        example: '年化利率8.5%，借款10,000 USDT 30天，利息约为 10,000 × 8.5% × 30/365 = 69.86 USDT。'
      },
      {
        term: '清算罚金',
        definition: '清算时收取的额外费用，作为风险补偿。通常为清算金额的5-10%。',
        example: '清算罚金5%时，清算10,000 USDT的债务，需额外支付500 USDT罚金。'
      },
      {
        term: '健康度 (Health Factor)',
        definition: '衡量借贷头寸安全性的指标，计算公式：(抵押品价值 × 清算阈值) / 总债务。健康度低于1时将被清算。',
        example: '抵押10万USDT，借5万，清算阈值85%，健康度 = (100,000 × 85%) / 50,000 = 1.7'
      },
      {
        term: '信用评分',
        definition: '基于历史借还记录、逾期情况、清算次数等因素计算的用户信用评级，影响可借额度和利率。',
        example: '信用评分850分的用户可享受更低利率和更高贷款额度。'
      }
    ]
  },
  
  operationGuide: {
    title: '操作指引',
    steps: [
      {
        title: '1. 申请借贷',
        content: `
          <ol>
            <li>选择合适的借贷产品</li>
            <li>输入抵押币种和数量</li>
            <li>系统自动计算可借金额</li>
            <li>选择借款金额和期限</li>
            <li>确认利率、LTV和清算阈值</li>
            <li>提交申请，转入抵押资产</li>
            <li>自动审核通过后即时放款</li>
          </ol>
          <p class="tip">💡 提示：建议LTV保持在60%以下，预留足够的安全空间。</p>
        `
      },
      {
        title: '2. 监控头寸',
        content: `
          <ol>
            <li>定期查看"我的订单"页面</li>
            <li>关注当前LTV和健康度</li>
            <li>设置价格预警通知</li>
            <li>市场波动时及时追加抵押品</li>
          </ol>
          <p class="warning">⚠️ 警告：当LTV接近清算阈值时，系统会发送预警通知。</p>
        `
      },
      {
        title: '3. 还款操作',
        content: `
          <h4>还款方式：</h4>
          <ul>
            <li><strong>仅还利息：</strong>保持本金不变，延长借款期限</li>
            <li><strong>部分还款：</strong>降低债务和LTV，减少清算风险</li>
            <li><strong>全额还款：</strong>清偿所有债务，取回全部抵押品</li>
            <li><strong>自动还款：</strong>设置自动扣款，避免逾期</li>
          </ul>
          <p class="tip">💡 提示：提前还款无违约金，建议根据市场情况灵活调整。</p>
        `
      },
      {
        title: '4. 追加抵押',
        content: `
          <p>当抵押品价格下跌时，可通过追加抵押降低LTV：</p>
          <ol>
            <li>进入订单详情页</li>
            <li>点击"追加抵押"</li>
            <li>输入追加数量</li>
            <li>确认后转入资产</li>
            <li>LTV实时更新</li>
          </ol>
        `
      },
      {
        title: '5. 清算处理',
        content: `
          <p>当LTV达到清算阈值时：</p>
          <ul>
            <li>系统自动启动清算程序</li>
            <li>按市价出售部分抵押品</li>
            <li>偿还债务和清算罚金</li>
            <li>剩余抵押品退回用户</li>
          </ul>
          <p class="warning">⚠️ 清算后会影响信用评分，建议提前追加抵押或还款避免清算。</p>
        `
      }
    ]
  },
  
  examples: {
    title: '操作示例',
    cases: [
      {
        title: '示例1：BTC标准借贷',
        scenario: '用户持有2个BTC（当前价格50,000 USDT/BTC），需要70,000 USDT的流动性',
        steps: [
          '选择"BTC标准借贷"产品（LTV 70%，清算阈值85%，年化利率8.5%）',
          '抵押2个BTC，价值100,000 USDT',
          '可借金额：100,000 × 70% = 70,000 USDT',
          '选择借款期限90天',
          '预计利息：70,000 × 8.5% × 90/365 = 1,465 USDT',
          '清算价格：70,000 / (2 × 0.85) = 41,176 USDT/BTC'
        ],
        result: '立即获得70,000 USDT，保留BTC升值潜力，BTC价格跌破41,176时触发清算。'
      },
      {
        title: '示例2：市场下跌应对策略',
        scenario: 'BTC价格从50,000跌至45,000，LTV从70%升至77.8%',
        steps: [
          '原始状态：抵押2 BTC (100,000 USDT)，借款70,000 USDT，LTV 70%',
          'BTC跌至45,000：抵押品价值90,000 USDT，LTV = 70,000/90,000 = 77.8%',
          '距离清算阈值85%还有7.2%的空间',
          '策略1：追加0.35 BTC抵押，LTV降至70%',
          '策略2：部分还款10,000 USDT，LTV降至66.7%',
          '策略3：不操作，继续监控市场'
        ],
        result: '选择策略后，安全空间增大，避免清算风险。'
      },
      {
        title: '示例3：还款策略优化',
        scenario: '已借款30天，累计利息465 USDT，考虑还款方案',
        steps: [
          '当前债务：70,000 + 465 = 70,465 USDT',
          '方案1：仅还利息465 USDT，保持借款本金',
          '方案2：还款20,465 USDT（利息+部分本金），降低LTV至55.6%',
          '方案3：全额还款70,465 USDT，取回全部BTC',
          '方案4：设置自动还款，每月支付利息'
        ],
        result: '根据市场预期和资金状况选择最优方案。'
      }
    ]
  },
  
  faq: {
    title: '常见问题',
    questions: [
      {
        question: '借款需要多长时间到账？',
        answer: '审核和放款过程完全自动化，通常在您转入抵押资产后1-5分钟内到账，具体时间取决于区块链网络确认速度。'
      },
      {
        question: '可以提前还款吗？有违约金吗？',
        answer: '支持随时提前还款，没有任何违约金或提前还款费用。还款后多余的抵押品会立即解锁。'
      },
      {
        question: '清算是如何进行的？',
        answer: '当LTV达到清算阈值时，智能合约会自动触发清算。系统会在市场上出售部分抵押品，用于偿还债务、利息和清算罚金。剩余抵押品会退回到您的账户。'
      },
      {
        question: '如何避免被清算？',
        answer: '1) 保持较低的LTV（建议60%以下）；2) 设置价格预警；3) 市场波动时及时追加抵押；4) 部分还款降低债务；5) 选择清算阈值更高的产品。'
      },
      {
        question: '利息是如何计算的？',
        answer: '利息按日计算：每日利息 = 借款金额 × 年化利率 / 365。利息每日累计，可以随时还款。'
      },
      {
        question: '抵押的资产安全吗？',
        answer: '所有抵押资产存储在经过审计的智能合约中，采用多重签名和冷热钱包分离策略。平台有完善的风险准备金机制。'
      },
      {
        question: '信用评分如何影响借贷？',
        answer: '信用评分高的用户可以享受：1) 更低的借款利率；2) 更高的贷款额度；3) 更高的LTV比率；4) 优先审核和服务。'
      },
      {
        question: '可以同时有多个借贷订单吗？',
        answer: '可以。您可以针对不同的抵押资产创建多个借贷订单，但需要确保每个订单的LTV在安全范围内。'
      },
      {
        question: '如果逾期未还款会怎样？',
        answer: '逾期后会产生额外的逾期费用（通常为日利率的1.5倍），持续逾期可能导致系统强制清算，并影响信用评分。'
      },
      {
        question: '浮动利率是如何调整的？',
        answer: '浮动利率根据市场供需关系自动调整，通常每24小时更新一次。当借款需求增加时利率上升，反之下降。'
      }
    ]
  },
  
  riskWarning: {
    title: '风险提示',
    warnings: [
      {
        level: '市场风险',
        description: '加密货币价格波动剧烈，可能在短时间内大幅下跌，导致LTV快速上升触发清算。'
      },
      {
        level: '清算风险',
        description: '当抵押品价值不足以覆盖债务时，系统会自动清算，您可能损失部分或全部抵押品。'
      },
      {
        level: '利率风险',
        description: '浮动利率产品的借款成本可能随市场变化而增加。'
      },
      {
        level: '智能合约风险',
        description: '虽然合约经过审计，但仍存在技术漏洞的可能性。'
      },
      {
        level: '流动性风险',
        description: '极端市场条件下，清算可能无法以理想价格执行。'
      }
    ],
    disclaimer: '请充分了解产品风险后谨慎投资，不要借入超过您承受能力的金额。'
  }
}
