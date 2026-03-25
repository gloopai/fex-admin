import { VERIFICATION_LEVEL } from '../constants/verification'

/** 等级高低顺序：数值越大等级越高 */
export const VERIFICATION_LEVEL_RANK = {
  [VERIFICATION_LEVEL.NONE]: 0,
  [VERIFICATION_LEVEL.BASIC]: 1,
  [VERIFICATION_LEVEL.ADVANCED]: 2
}

const LABEL_BY_LEVEL = {
  [VERIFICATION_LEVEL.NONE]: '未认证',
  [VERIFICATION_LEVEL.BASIC]: '初级认证',
  [VERIFICATION_LEVEL.ADVANCED]: '高级认证'
}

/**
 * 用户当前认证等级是否满足业务要求的最低等级（含相等）
 * @param {string} userLevel VERIFICATION_LEVEL.*
 * @param {string} requiredLevel VERIFICATION_LEVEL.*
 */
export function userMeetsVerificationLevel(userLevel, requiredLevel) {
  const u = VERIFICATION_LEVEL_RANK[userLevel] ?? 0
  const r = VERIFICATION_LEVEL_RANK[requiredLevel] ?? 0
  return u >= r
}

export function getVerificationLevelLabel(level) {
  return LABEL_BY_LEVEL[level] ?? level ?? '—'
}

/**
 * 下一档认证等级（用于兼容旧逻辑）；已是最高则返回 null
 */
export function getNextVerificationLevel(currentLevel) {
  if (currentLevel === VERIFICATION_LEVEL.NONE) return VERIFICATION_LEVEL.BASIC
  if (currentLevel === VERIFICATION_LEVEL.BASIC) return VERIFICATION_LEVEL.ADVANCED
  return null
}

/**
 * 未满足 requiredLevel 时的完整说明句（已同时考虑当前等级与目标等级，避免「需要高级却提示先完成初级」的歧义）
 */
export function getVerificationUpgradeDetailLine(userLevel, requiredLevel) {
  const u = VERIFICATION_LEVEL_RANK[userLevel] ?? 0
  const r = VERIFICATION_LEVEL_RANK[requiredLevel] ?? 0
  if (u >= r) return ''

  if (userLevel === VERIFICATION_LEVEL.NONE) {
    if (requiredLevel === VERIFICATION_LEVEL.BASIC) {
      return '请先完成初级认证。'
    }
    if (requiredLevel === VERIFICATION_LEVEL.ADVANCED) {
      return '请先完成初级认证，再完成高级认证。'
    }
  }
  if (userLevel === VERIFICATION_LEVEL.BASIC && requiredLevel === VERIFICATION_LEVEL.ADVANCED) {
    return '请先完成高级认证。'
  }

  return `请先完成「${getVerificationLevelLabel(requiredLevel)}」。`
}
