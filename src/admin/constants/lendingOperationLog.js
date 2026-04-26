/** 信用借贷 · 管理端操作日志（与授信中心、产品、订单等页联动） */

export const LENDING_OP_MODULE = {
  CREDIT_LIMITS: 'credit_limits',
  CREDIT_SCORECARD: 'credit_scorecard',
  PRODUCT: 'product',
  ORDER: 'order'
}

export const LENDING_OP_MODULE_LABEL = {
  [LENDING_OP_MODULE.CREDIT_LIMITS]: '授信 · 额度模板',
  [LENDING_OP_MODULE.CREDIT_SCORECARD]: '授信 · 评分与规则',
  [LENDING_OP_MODULE.PRODUCT]: '借贷产品',
  [LENDING_OP_MODULE.ORDER]: '借贷订单'
}

export const LENDING_OP_ACTION = {
  SAVE_LIMITS: 'save_limits',
  SAVE_SCORECARD: 'save_scorecard',
  PRODUCT_CREATE: 'product_create',
  PRODUCT_UPDATE: 'product_update',
  PRODUCT_STATUS: 'product_status',
  ORDER_APPROVE: 'order_approve',
  ORDER_REJECT: 'order_reject'
}

export const LENDING_OP_ACTION_LABEL = {
  [LENDING_OP_ACTION.SAVE_LIMITS]: '保存额度模板',
  [LENDING_OP_ACTION.SAVE_SCORECARD]: '保存评分维度',
  [LENDING_OP_ACTION.PRODUCT_CREATE]: '新建产品',
  [LENDING_OP_ACTION.PRODUCT_UPDATE]: '编辑产品',
  [LENDING_OP_ACTION.PRODUCT_STATUS]: '变更产品状态',
  [LENDING_OP_ACTION.ORDER_APPROVE]: '批准放款',
  [LENDING_OP_ACTION.ORDER_REJECT]: '拒绝申请'
}
