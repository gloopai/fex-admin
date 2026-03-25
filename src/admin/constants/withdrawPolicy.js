/** 出金策略：用于匹配的维度（与 VIP / 认证 / 信用分 配置联动） */
export const WITHDRAW_POLICY_DIMENSION = {
  VIP: 'vip',
  VERIFICATION: 'verification',
  CREDIT_SCORE: 'credit_score'
}

export const WITHDRAW_POLICY_DIMENSION_LABEL = {
  [WITHDRAW_POLICY_DIMENSION.VIP]: 'VIP 等级',
  [WITHDRAW_POLICY_DIMENSION.VERIFICATION]: '账户认证等级',
  [WITHDRAW_POLICY_DIMENSION.CREDIT_SCORE]: '信用分区间'
}
