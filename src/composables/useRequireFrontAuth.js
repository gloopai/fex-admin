import { useRouter } from 'vue-router'
import { useFrontAuthStore } from '../stores/frontAuth'

/**
 * 前台需登录的操作。未登录时跳转 `/front/login` 并携带 redirect。
 * @param {{ redirectPath?: string }} [opts] 未传则用当前路由 fullPath
 * @returns {boolean} 是否已登录
 */
export function useRequireFrontAuth() {
  const router = useRouter()
  const auth = useFrontAuthStore()

  function requireAuth(opts = {}) {
    auth.ensureHydrated()
    if (auth.isLoggedIn) return true
    let path = opts.redirectPath
    if (path == null || path === '') {
      path = router.currentRoute.value.fullPath
    }
    if (typeof path !== 'string' || !path.startsWith('/front')) {
      path = '/front/home'
    }
    router.push({
      path: '/front/login',
      query: { redirect: path }
    })
    return false
  }

  return { requireAuth }
}

/** 退出登录后若当前页需登录，应回到首页（与 router meta.requiresAuth 对齐） */
export function pathNeedsFrontAuth(path) {
  if (typeof path !== 'string') return false
  if (path.startsWith('/front/personal-center')) return true
  if (path.startsWith('/front/finance')) return true
  if (path.startsWith('/front/trade/')) return true
  if (path === '/front/verification-permission-demo') return true
  if (path.startsWith('/front/verification-permission-demo/')) return true
  if (path === '/front/verification-popup-demo') return true
  if (path.startsWith('/front/verification-popup-demo/')) return true
  return false
}
