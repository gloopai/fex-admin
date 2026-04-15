/**
 * 前台导航链接（/front）。「更多」入口在右下角 CrossPlatformFloatNav；平台入口另含管理台、代理系统。
 * @param {'/front'} prefix
 */

/** 交易品种（与路由段一致） */
export const TRADE_ASSET_CLASS_KEYS = ['crypto', 'forex', 'metal']

/** 产品形态（与路由段一致） */
export const TRADE_PRODUCT_MODE_KEYS = ['spot', 'perpetual', 'delivery']

export const TRADE_ASSET_CLASS_META = {
  crypto: { key: 'crypto', label: '加密货币' },
  forex: { key: 'forex', label: '外汇' },
  metal: { key: 'metal', label: '贵金属' }
}

export const TRADE_PRODUCT_MODE_META = {
  spot: { key: 'spot', label: '现货' },
  perpetual: { key: 'perpetual', label: '永续' },
  delivery: { key: 'delivery', label: '交割' }
}

/**
 * 顶栏「交易」下拉：按品种分组，每组内现货 / 永续 / 交割
 * @param {string} prefix 如 `/front`
 */
export function getFrontTradeMenuGroups(prefix) {
  return TRADE_ASSET_CLASS_KEYS.map((ac) => {
    const asset = TRADE_ASSET_CLASS_META[ac]
    return {
      key: ac,
      label: asset.label,
      items: TRADE_PRODUCT_MODE_KEYS.map((pm) => {
        const mode = TRADE_PRODUCT_MODE_META[pm]
        return {
          key: `${ac}-${pm}`,
          label: mode.label,
          to: `${prefix}/trade/${ac}/${pm}`,
          assetClass: ac,
          tradeMode: pm
        }
      })
    }
  })
}

/** 扁平列表（抽屉、active 检测等） */
export function getFrontTradeNavLinksFlat(prefix) {
  return getFrontTradeMenuGroups(prefix).flatMap((g) => g.items)
}

/** 默认交易落地页 */
export function getFrontTradeDefaultPath(prefix) {
  return `${prefix}/trade/crypto/perpetual`
}

/** @deprecated 请用 getFrontTradeMenuGroups / getFrontTradeNavLinksFlat */
export function getFrontTradeNavLinks(prefix) {
  return getFrontTradeNavLinksFlat(prefix)
}

/** 左侧主导航：首页、行情、资产 */
export function getFrontMainNavLinks(prefix) {
  return [
    { key: 'home', label: '首页', to: `${prefix}/home` },
    { key: 'market', label: '行情', to: `${prefix}/market` },
    { key: 'assets', label: '资产', to: `${prefix}/personal-center/assets` }
  ]
}

/**
 * 底部 Tab（窄屏 <lg）
 * @param {'/front'} prefix
 */
export function getFrontBottomTabs(prefix) {
  return [
    { key: 'home', label: '首页', to: `${prefix}/home` },
    { key: 'market', label: '行情', to: `${prefix}/market` },
    { key: 'trade', label: '交易', to: getFrontTradeDefaultPath(prefix) },
    { key: 'assets', label: '资产', to: `${prefix}/personal-center/assets` },
    { key: 'me', label: '我的', to: `${prefix}/personal-center` }
  ]
}

/** 更多链接（工具与扩展页） */
export function getFrontMoreDemoLinks(prefix) {
  return [
    { key: 'verify', label: '身份认证', to: `${prefix}/personal-center/verification` },
    { key: 'perm', label: '账户权限', to: `${prefix}/verification-permission-demo` },
    { key: 'popup', label: '安全与验证', to: `${prefix}/verification-popup-demo` }
  ]
}

/** @deprecated 仅兼容旧用法 */
export function getFrontNavItems(prefix) {
  return [
    ...getFrontMainNavLinks(prefix).map((i) => ({ ...i, primary: true })),
    { key: 'personal', label: '个人中心', to: `${prefix}/personal-center`, primary: true },
    ...getFrontMoreDemoLinks(prefix).map((i) => ({ ...i, primary: false }))
  ]
}
