// 信用分变动类型
export const CREDIT_SCORE_CHANGE_TYPE = {
  RECHARGE: 'recharge',           // 充值
  PRIMARY_KYC: 'primary_kyc',     // 初级认证
  ADVANCED_KYC: 'advanced_kyc',   // 高级认证
  MANUAL_ADJUST: 'manual_adjust', // 手动调整
  AUTO_UPGRADE: 'auto_upgrade',   // 自动升级
  PENALTY: 'penalty',             // 惩罚
  REWARD: 'reward'                // 奖励
}

// 信用分变动类型选项
export const CREDIT_SCORE_CHANGE_TYPE_OPTIONS = [
  { value: CREDIT_SCORE_CHANGE_TYPE.RECHARGE, label: '充值' },
  { value: CREDIT_SCORE_CHANGE_TYPE.PRIMARY_KYC, label: '初级认证' },
  { value: CREDIT_SCORE_CHANGE_TYPE.ADVANCED_KYC, label: '高级认证' },
  { value: CREDIT_SCORE_CHANGE_TYPE.MANUAL_ADJUST, label: '手动调整' },
  { value: CREDIT_SCORE_CHANGE_TYPE.AUTO_UPGRADE, label: '自动升级' },
  { value: CREDIT_SCORE_CHANGE_TYPE.PENALTY, label: '惩罚' },
  { value: CREDIT_SCORE_CHANGE_TYPE.REWARD, label: '奖励' }
]

// 信用分升级原因
export const CREDIT_SCORE_UPGRADE_REASON = {
  CREDIT_SCORE: 'credit_score',   // 信用分达标
  RECHARGE: 'recharge',           // 充值升级
  MANUAL: 'manual'                // 手动升级
}

// 信用分升级原因选项
export const CREDIT_SCORE_UPGRADE_REASON_OPTIONS = [
  { value: CREDIT_SCORE_UPGRADE_REASON.CREDIT_SCORE, label: '信用分达标' },
  { value: CREDIT_SCORE_UPGRADE_REASON.RECHARGE, label: '充值升级' },
  { value: CREDIT_SCORE_UPGRADE_REASON.MANUAL, label: '手动升级' }
]

// 信用分扣除原因
export const CREDIT_SCORE_DEDUCTION_REASON = {
  VIOLATION: 'violation',                 // 违规行为
  ABNORMAL_TRADE: 'abnormal_trade',      // 异常交易
  INACTIVE: 'inactive',                  // 长期不活跃
  WITHDRAW_FAIL: 'withdraw_fail',        // 提现失败
  DISPUTE: 'dispute',                    // 交易纠纷
  MALICIOUS: 'malicious',                // 恶意行为
  RISK_ALERT: 'risk_alert'               // 风控预警
}

// 信用分扣除原因选项
export const CREDIT_SCORE_DEDUCTION_REASON_OPTIONS = [
  { value: CREDIT_SCORE_DEDUCTION_REASON.VIOLATION, label: '违规行为' },
  { value: CREDIT_SCORE_DEDUCTION_REASON.ABNORMAL_TRADE, label: '异常交易' },
  { value: CREDIT_SCORE_DEDUCTION_REASON.INACTIVE, label: '长期不活跃' },
  { value: CREDIT_SCORE_DEDUCTION_REASON.WITHDRAW_FAIL, label: '提现失败' },
  { value: CREDIT_SCORE_DEDUCTION_REASON.DISPUTE, label: '交易纠纷' },
  { value: CREDIT_SCORE_DEDUCTION_REASON.MALICIOUS, label: '恶意行为' },
  { value: CREDIT_SCORE_DEDUCTION_REASON.RISK_ALERT, label: '风控预警' }
]

// 信用分配置键
export const CREDIT_SCORE_CONFIG_KEYS = {
  ENABLED: 'creditScore.enabled',                           // 信用分开关
  MAX_SCORE: 'creditScore.maxScore',                       // 最大分数
  INITIAL_SCORE: 'creditScore.initialScore',               // 初始值
  RECHARGE_AMOUNT: 'creditScore.rechargeAmount',           // 充值金额
  PRIMARY_KYC_SCORE: 'creditScore.primaryKycScore',        // 初级认证分数
  ADVANCED_KYC_SCORE: 'creditScore.advancedKycScore',      // 高级认证分数
  AUTO_UPGRADE_VIP1_ENABLED: 'creditScore.autoUpgradeVip1Enabled', // 自动升级VIP1开关
  AUTO_UPGRADE_VIP1_SCORE: 'creditScore.autoUpgradeVip1Score',     // 自动升级VIP1分数线
  VIP_UPGRADE_RECHARGE_AMOUNT: 'creditScore.vipUpgradeRechargeAmount', // VIP升级充值金额
  
  // 扣除规则
  DEDUCTION_ENABLED: 'creditScore.deductionEnabled',       // 扣除规则开关
  VIOLATION_SCORE: 'creditScore.violationScore',           // 违规行为扣分
  ABNORMAL_TRADE_SCORE: 'creditScore.abnormalTradeScore',  // 异常交易扣分
  INACTIVE_DAYS: 'creditScore.inactiveDays',               // 不活跃天数阈值
  INACTIVE_SCORE: 'creditScore.inactiveScore',             // 不活跃扣分
  WITHDRAW_FAIL_SCORE: 'creditScore.withdrawFailScore',    // 提现失败扣分
  DISPUTE_SCORE: 'creditScore.disputeScore',               // 交易纠纷扣分
  MALICIOUS_SCORE: 'creditScore.maliciousScore',           // 恶意行为扣分
  RISK_ALERT_SCORE: 'creditScore.riskAlertScore',          // 风控预警扣分
  MIN_SCORE: 'creditScore.minScore'                        // 最低分数（扣分不低于此值）
}
