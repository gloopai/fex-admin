/**
 * 前台顶部导航配置（PC /front、移动 /m 共用条目，仅前缀不同）。
 * primary: 常驻主入口；more: 收入「更多」下拉，避免顶栏排满。
 */
export function getFrontNavItems(prefix) {
  return [
    { key: 'personal', label: '个人中心', to: `${prefix}/personal-center`, primary: true },
    { key: 'assets', label: '资产', to: `${prefix}/personal-center/assets`, primary: true },
    { key: 'verify', label: '身份认证', to: `${prefix}/personal-center/verification`, primary: false },
    { key: 'perm', label: '账户权限', to: `${prefix}/verification-permission-demo`, primary: false },
    { key: 'popup', label: '安全与验证', to: `${prefix}/verification-popup-demo`, primary: false }
  ]
}
