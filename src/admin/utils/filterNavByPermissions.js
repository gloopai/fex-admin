/**
 * 按权限过滤侧栏树。叶子可带 `permAny: string[]`：具备其中任一权限即展示；未配置则默认展示。
 * @param {object[]} items
 * @param {(keys: string[]) => boolean} canAny
 * @returns {object[]}
 */
export function filterNavTreeByPermissions(items, canAny) {
  if (!Array.isArray(items)) return []

  const out = []
  for (const item of items) {
    const hasChildren = Array.isArray(item.children) && item.children.length > 0

    if (hasChildren) {
      const children = filterNavTreeByPermissions(item.children, canAny)
      if (children.length === 0) continue
      out.push({ ...item, children })
      continue
    }

    if (item.path) {
      if (item.permAny && !canAny(item.permAny)) continue
      out.push(item)
      continue
    }

    out.push(item)
  }
  return out
}
