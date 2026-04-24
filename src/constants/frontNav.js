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

/** 左侧主导航：首页、行情、资产（「金融」为顶栏下拉，见 getFrontFinanceChannelEntries） */
export function getFrontMainNavLinks(prefix) {
  return [
    { key: 'home', label: '首页', to: `${prefix}/home` },
    { key: 'market', label: '行情', to: `${prefix}/market` },
    { key: 'assets', label: '资产', to: `${prefix}/personal-center/assets` }
  ]
}

/** 金融总览落地页 */
export function getFrontFinanceHubPath(prefix) {
  return `${prefix}/finance`
}

/**
 * 顶栏「金融」下拉：三个产品频道（站点化入口）
 * @param {string} prefix 如 `/front`
 */
export function getFrontFinanceChannelEntries(prefix) {
  const b = `${prefix}/finance`
  return [
    {
      key: 'liquidity',
      label: '流动性挖矿',
      tag: 'Earn',
      desc: '多期限锁仓，年化分档透明，到期与提前赎回规则可查。',
      to: `${b}/liquidity`
    },
    {
      key: 'lending',
      label: '信用借贷',
      tag: 'Borrow',
      desc: '质押持仓释放借出币种流动性，利率与期限结构化展示。',
      to: `${b}/lending`
    },
    {
      key: 'ai-quant',
      label: 'AI 量化',
      tag: 'Quant',
      desc: '策略托管与结算周期可配，分档参考年化，结构清晰。',
      to: `${b}/ai-quant`
    }
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
