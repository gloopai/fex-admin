export function sortSpotProducts(products = []) {
  const sortValue = (product) => {
    const raw = product?.sortOrder
    if (raw === '' || raw == null) return null
    const value = Number(raw)
    return Number.isFinite(value) ? value : null
  }

  return [...products].sort((left, right) => {
    const leftValue = sortValue(left)
    const rightValue = sortValue(right)
    if (leftValue == null && rightValue == null) return 0
    if (leftValue == null) return 1
    if (rightValue == null) return -1
    return rightValue - leftValue
  })
}
