import { VERIFICATION_LEVEL } from '../constants/verification'

/** 与后台「认证权限配置」资金与交易权限表同一套 key */
export const VERIFICATION_PERMISSION_KEYS = [
  'canDeposit',
  'canWithdraw',
  'canSpotTrade',
  'canDeliveryContract',
  'canPerpetualContract'
]

/** 与 VerificationConfigPage PERMISSION_FIELDS.label 一致 */
export const VERIFICATION_PERMISSION_ADMIN_LABEL = {
  canDeposit: '允许入金',
  canWithdraw: '允许出金',
  canSpotTrade: '允许现货交易',
  canDeliveryContract: '允许交割合约',
  canPerpetualContract: '允许永续合约'
}

/** 各权限在前台不同组件中的短文案（按模块区分场景） */
export const VERIFICATION_MODULE_PROMPTS = {
  canDeposit: {
    bannerFeature: '充币',
    inlineFeature: '发起充币',
    emptyFeature: '充值与充币',
    dialogFeature: '充币',
    contextHint: '资产 · 充币与入账',
    /** 空状态 fill 示例副标题：模拟列表场景名 */
    emptyListDemoTitle: '充币记录'
  },
  canWithdraw: {
    bannerFeature: '提币',
    inlineFeature: '提交提币申请',
    emptyFeature: '提币',
    dialogFeature: '提币',
    contextHint: '资产 · 提币',
    emptyListDemoTitle: '提币记录'
  },
  canSpotTrade: {
    bannerFeature: '现货交易',
    inlineFeature: '现货下单',
    emptyFeature: '现货交易',
    dialogFeature: '现货交易',
    contextHint: '现货 · 行情与下单',
    emptyListDemoTitle: '现货成交'
  },
  canDeliveryContract: {
    bannerFeature: '交割合约交易',
    inlineFeature: '交割合约交易',
    emptyFeature: '交割合约',
    dialogFeature: '交割合约交易',
    contextHint: '交割合约 · 持仓与下单',
    emptyListDemoTitle: '交割持仓'
  },
  canPerpetualContract: {
    bannerFeature: '永续合约交易',
    inlineFeature: '永续合约交易',
    emptyFeature: '永续合约',
    dialogFeature: '永续合约交易',
    contextHint: '永续合约 · 持仓与下单',
    emptyListDemoTitle: '永续委托'
  }
}

const LEVEL_ORDER = [VERIFICATION_LEVEL.NONE, VERIFICATION_LEVEL.BASIC, VERIFICATION_LEVEL.ADVANCED]

/**
 * 根据认证权限配置，解析某权限项最早在哪个等级被允许
 * @param {Record<string, Record<string, boolean>>} config verificationConfig 结构
 * @param {string} permissionKey canDeposit | canWithdraw | …
 */
export function getMinLevelForPermission(config, permissionKey) {
  for (const level of LEVEL_ORDER) {
    if (config[level]?.[permissionKey] === true) {
      return level
    }
  }
  return VERIFICATION_LEVEL.ADVANCED
}

/**
 * 组装演示/业务用：最低等级 + 各组件 feature 文案 + 后台字段名
 */
export function getVerificationModulePromptBundle(config, permissionKey) {
  const prompts = VERIFICATION_MODULE_PROMPTS[permissionKey] || VERIFICATION_MODULE_PROMPTS.canPerpetualContract
  const requiredLevel = getMinLevelForPermission(config, permissionKey)
  return {
    permissionKey,
    adminLabel: VERIFICATION_PERMISSION_ADMIN_LABEL[permissionKey] || permissionKey,
    requiredLevel,
    ...prompts,
    /** 未认证即开放时，前台不会出现拦截（可与用户说明） */
    alwaysOpen: requiredLevel === VERIFICATION_LEVEL.NONE
  }
}
