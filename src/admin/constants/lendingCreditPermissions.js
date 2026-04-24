/**
 * 授信中心权限点（与后端 RBAC 对齐时保持 key 一致即可）。
 * 页面仅保留「额度模板」与「评分与规则」两区；以下 VIEW_/SYNC 可保留兼容旧 RBAC。
 */
export const LENDING_CREDIT_PERM = {
  /** @deprecated 总览 Tab 已移除，可继续下发以兼容旧角色 */
  VIEW_OVERVIEW: 'lending.credit.view_overview',
  /** 额度模板：minScale、账户/子币种上限 */
  EDIT_LIMITS: 'lending.credit.edit_limits',
  /** 评分与规则：卡内权重、分档配置等 */
  EDIT_SCORECARD: 'lending.credit.edit_scorecard',
  /** @deprecated 生效预览 Tab 已移除 */
  VIEW_PREVIEW: 'lending.credit.view_preview',
  /** @deprecated 管理端「同步到演示额度」已移除；前台仍可在进入借贷页时折算 policy */
  SYNC: 'lending.credit.sync'
}

/** 授信模块全部权限（超管 / 本地演示「全开」） */
export const LENDING_CREDIT_ALL_PERMISSIONS = Object.freeze(Object.values(LENDING_CREDIT_PERM))
