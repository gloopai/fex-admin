export const PERPETUAL_COMMON_FILTER_ALL = 'all'

export const PERPETUAL_STATUS = {
  ENABLED: 'enabled',
  DISABLED: 'disabled'
}

export const PERPETUAL_CONTRACT_STEP = {
  BASE: 'base',
  LEVERAGE: 'leverage',
  LIMIT: 'limit',
  FEE: 'fee'
}

export function sortPerpetualProducts(products = []) {
  const sortValue = (product) => {
    const raw = product?.sortOrder
    if (raw === '' || raw == null) return null
    const value = Number(raw)
    return Number.isFinite(value) ? value : null
  }

  return [...products].sort((a, b) => {
    const aValue = sortValue(a)
    const bValue = sortValue(b)
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return 1
    if (bValue == null) return -1
    return bValue - aValue
  })
}
