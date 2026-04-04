/**
 * 前台顶部导航配置（PC /front、移动 /m 共用条目，仅前缀不同）。
 * primary: 常驻主入口；more: 收入「更多」下拉，避免顶栏排满。
 */
export function getFrontNavItems(prefix) {
  return [
    { key: 'personal', label: '个人中心', to: `${prefix}/personal-center`, primary: true },
    { key: 'verify', label: '认证流程', to: `${prefix}/verification-flow`, primary: false },
    { key: 'perm', label: '认证权限提示', to: `${prefix}/verification-permission-demo`, primary: false },
    { key: 'popup', label: '弹窗演示', to: `${prefix}/verification-popup-demo`, primary: false }
  ]
}
