import { defineStore } from 'pinia'
import {
  LENDING_CREDIT_ALL_PERMISSIONS,
  LENDING_CREDIT_PERM
} from '../constants/lendingCreditPermissions'

const STORAGE_PRESET_KEY = 'admin-demo-permission-preset'

/** 演示用角色 → 权限集合（生产改为登录后由接口下发 permissions[]） */
const PRESET_GRANTS = {
  /** 全部授信相关能力 */
  super: [...LENDING_CREDIT_ALL_PERMISSIONS],
  /** 运营：只配评分卡（权重 + 演示分 + 分档） */
  ops_scorecard: [LENDING_CREDIT_PERM.EDIT_SCORECARD],
  /** 风控/资金：额度模板与保底比例 */
  risk_limits: [LENDING_CREDIT_PERM.EDIT_LIMITS]
}

function readStoredPreset() {
  try {
    const v = localStorage.getItem(STORAGE_PRESET_KEY)
    if (v && Object.prototype.hasOwnProperty.call(PRESET_GRANTS, v)) return v
  } catch {
    /* ignore */
  }
  return 'super'
}

export const useAdminPermissionsStore = defineStore('adminPermissions', {
  state: () => ({
    /** 当前生效的权限 key 列表 */
    grants: [...PRESET_GRANTS[readStoredPreset()]],
    /** 演示：super | ops_scorecard | risk_limits */
    activePreset: readStoredPreset()
  }),
  getters: {
    can:
      (state) =>
      (key) =>
        state.grants.includes(key),
    canAny:
      (state) =>
      (keys) =>
        Array.isArray(keys) && keys.some((k) => state.grants.includes(k))
  },
  actions: {
    /** 切换演示角色（生产删除或改为仅开发环境） */
    setDemoPreset(preset) {
      if (!Object.prototype.hasOwnProperty.call(PRESET_GRANTS, preset)) return
      this.activePreset = preset
      this.grants = [...PRESET_GRANTS[preset]]
      try {
        localStorage.setItem(STORAGE_PRESET_KEY, preset)
      } catch {
        /* ignore */
      }
    },
    /**
     * 生产接入：用登录接口返回的 permissions 覆盖本地演示集。
     * @param {string[]} permissions
     */
    hydrateFromApi(permissions) {
      if (!Array.isArray(permissions)) return
      this.grants = [...new Set(permissions)]
      this.activePreset = ''
    }
  }
})
