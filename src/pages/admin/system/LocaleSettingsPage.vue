<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { FRONT_LOCALE_CATALOG, PHONE_DIAL_PRESETS } from '../../../admin/constants/i18nCatalog'
import { DEFAULT_SITE_CONFIG, normalizeSiteConfig, siteConfigApi } from '../../../admin/mock/siteConfig'

const config = ref(normalizeSiteConfig({ ...DEFAULT_SITE_CONFIG }))
const loading = ref(true)
const isSaving = ref(false)

/** 多语言 | 手机区号 */
const activeTab = ref('language')
const localeTabs = [
  { key: 'language', label: '多语言' },
  { key: 'dial', label: '手机区号' }
]

const localesTableRows = computed(() => {
  const order = config.value.i18n?.localeSortOrder || {}
  return [...FRONT_LOCALE_CATALOG].sort((a, b) => {
    const da = Number.isFinite(order[a.code]) ? order[a.code] : 999999
    const db = Number.isFinite(order[b.code]) ? order[b.code] : 999999
    if (da !== db) return da - db
    return FRONT_LOCALE_CATALOG.findIndex((x) => x.code === a.code) - FRONT_LOCALE_CATALOG.findIndex((x) => x.code === b.code)
  })
})

const dialsTableRows = computed(() => {
  const order = config.value.dialSortOrder || {}
  return [...PHONE_DIAL_PRESETS].sort((a, b) => {
    const da = Number.isFinite(order[a.dial]) ? order[a.dial] : 999999
    const db = Number.isFinite(order[b.dial]) ? order[b.dial] : 999999
    if (da !== db) return da - db
    return PHONE_DIAL_PRESETS.findIndex((x) => x.dial === a.dial) - PHONE_DIAL_PRESETS.findIndex((x) => x.dial === b.dial)
  })
})

function ensureLocaleSortMap() {
  if (!config.value.i18n.localeSortOrder || typeof config.value.i18n.localeSortOrder !== 'object') {
    config.value.i18n.localeSortOrder = {}
  }
  const m = config.value.i18n.localeSortOrder
  FRONT_LOCALE_CATALOG.forEach((l, i) => {
    if (!Number.isFinite(m[l.code])) m[l.code] = i * 10
  })
}

function ensureDialSortMap() {
  if (!config.value.dialSortOrder || typeof config.value.dialSortOrder !== 'object') {
    config.value.dialSortOrder = {}
  }
  const m = config.value.dialSortOrder
  PHONE_DIAL_PRESETS.forEach((p, i) => {
    if (!Number.isFinite(m[p.dial])) m[p.dial] = i * 10
  })
}

function onLocaleSortInput(code, raw) {
  ensureLocaleSortMap()
  const n = parseInt(String(raw ?? '').trim(), 10)
  config.value.i18n.localeSortOrder[code] = Number.isFinite(n) ? n : 0
}

function onDialSortInput(dial, raw) {
  ensureDialSortMap()
  const n = parseInt(String(raw ?? '').trim(), 10)
  config.value.dialSortOrder[dial] = Number.isFinite(n) ? n : 0
}

const loadConfig = async () => {
  loading.value = true
  try {
    const result = await siteConfigApi.getSiteConfig()
    if (result.success) {
      config.value = normalizeSiteConfig({ ...DEFAULT_SITE_CONFIG, ...result.data })
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  config.value.languageSettingsEnabled = true
  const i18n = config.value.i18n
  if (!i18n?.enabledLocales?.length) {
    alert('请至少在前台启用一种语言')
    activeTab.value = 'language'
    return
  }
  if (!i18n.enabledLocales.includes(i18n.defaultLocale)) {
    alert('默认语言必须从已启用的语言中选择')
    activeTab.value = 'language'
    return
  }
  isSaving.value = true
  try {
    const result = await siteConfigApi.updateSiteConfig(config.value)
    if (result.success) {
      window.dispatchEvent(new CustomEvent('admin-site-config-updated'))
      alert(result.message)
    }
  } catch (e) {
    alert('保存失败：' + (e?.message || '未知错误'))
  } finally {
    isSaving.value = false
  }
}

function toggleLocale(code, checked) {
  const cur = new Set(config.value.i18n.enabledLocales || [])
  if (checked) {
    cur.add(code)
    ensureLocaleSortMap()
    if (!Number.isFinite(config.value.i18n.localeSortOrder[code])) {
      const vals = Object.values(config.value.i18n.localeSortOrder).filter((n) => Number.isFinite(n))
      const max = vals.length ? Math.max(...vals) : 0
      config.value.i18n.localeSortOrder[code] = max + 10
    }
  } else {
    cur.delete(code)
  }
  let next = [...cur]
  if (next.length === 0) next = ['zh-CN']
  config.value.i18n.enabledLocales = next
  if (!next.includes(config.value.i18n.defaultLocale)) {
    config.value.i18n.defaultLocale = next[0]
  }
}

function toggleDial(dial, checked) {
  const cur = new Set(config.value.allowedDialCodes || [])
  if (checked) {
    cur.add(dial)
    ensureDialSortMap()
    if (!Number.isFinite(config.value.dialSortOrder[dial])) {
      const vals = Object.values(config.value.dialSortOrder).filter((n) => Number.isFinite(n))
      const max = vals.length ? Math.max(...vals) : 0
      config.value.dialSortOrder[dial] = max + 10
    }
  } else {
    cur.delete(dial)
  }
  config.value.allowedDialCodes = [...cur]
}

function setDefaultLocale(code) {
  if (!config.value.i18n.enabledLocales?.includes(code)) return
  config.value.i18n.defaultLocale = code
}

function selectAllLocales() {
  config.value.i18n.enabledLocales = FRONT_LOCALE_CATALOG.map((l) => l.code)
  ensureLocaleSortMap()
  FRONT_LOCALE_CATALOG.forEach((l, i) => {
    if (!Number.isFinite(config.value.i18n.localeSortOrder[l.code])) {
      config.value.i18n.localeSortOrder[l.code] = i * 10
    }
  })
  if (!config.value.i18n.enabledLocales.includes(config.value.i18n.defaultLocale)) {
    config.value.i18n.defaultLocale = config.value.i18n.enabledLocales[0]
  }
}

function selectAllDialCodes() {
  config.value.allowedDialCodes = PHONE_DIAL_PRESETS.map((p) => p.dial)
  ensureDialSortMap()
  PHONE_DIAL_PRESETS.forEach((p, i) => {
    if (!Number.isFinite(config.value.dialSortOrder[p.dial])) {
      config.value.dialSortOrder[p.dial] = i * 10
    }
  })
}

onMounted(() => {
  loadConfig()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">语言与区号</h1>
    </div>

    <div v-if="loading" class="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
      加载中…
    </div>

    <div v-else class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div
        class="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div
          class="flex flex-wrap gap-1 rounded-lg bg-slate-100/90 p-1"
          role="tablist"
          aria-label="语言与区号配置分区"
        >
          <button
            v-for="t in localeTabs"
            :key="t.key"
            type="button"
            role="tab"
            :aria-selected="activeTab === t.key"
            class="rounded-md px-3 py-1.5 text-sm font-medium transition"
            :class="
              activeTab === t.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            "
            @click="activeTab = t.key"
          >
            {{ t.label }}
          </button>
        </div>
        <button
          type="button"
          class="ant-btn ant-btn-primary shrink-0"
          :disabled="isSaving"
          @click="saveConfig"
        >
          {{ isSaving ? '保存中…' : '保存' }}
        </button>
      </div>

      <div class="space-y-6 p-6">
        <!-- 多语言 -->
        <section v-show="activeTab === 'language'" class="space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <label class="text-sm font-medium text-slate-700">系统支持的语言</label>
              <div class="flex flex-wrap gap-2 text-xs">
                <button type="button" class="text-blue-600 hover:underline" @click="selectAllLocales">
                  全选
                </button>
              </div>
            </div>
            <div class="overflow-x-auto overflow-hidden rounded-lg border border-slate-200">
              <table class="w-full min-w-[28rem] border-collapse text-left text-sm">
                <thead class="bg-slate-50 text-slate-600">
                  <tr>
                    <th class="px-4 py-2.5 font-medium">语言名称</th>
                    <th class="w-32 px-4 py-2.5 font-medium">语言代码</th>
                    <th class="w-28 px-4 py-2.5 font-medium">排序</th>
                    <th class="w-24 px-4 py-2.5 text-center font-medium">启用</th>
                    <th class="w-28 px-4 py-2.5 text-center font-medium">默认</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white">
                  <tr v-for="loc in localesTableRows" :key="loc.code" class="hover:bg-slate-50/80">
                    <td class="px-4 py-2.5 text-slate-800">{{ loc.label }}</td>
                    <td class="px-4 py-2.5 font-mono text-xs text-slate-500">{{ loc.code }}</td>
                    <td class="px-4 py-2.5">
                      <input
                        type="number"
                        step="1"
                        class="ant-input w-full max-w-[6.5rem] text-right text-sm tabular-nums"
                        :value="config.i18n.localeSortOrder?.[loc.code] ?? 0"
                        @input="onLocaleSortInput(loc.code, $event.target.value)"
                      />
                    </td>
                    <td class="px-4 py-2.5 text-center">
                      <input
                        type="checkbox"
                        class="rounded border-slate-300"
                        :checked="config.i18n.enabledLocales?.includes(loc.code)"
                        @change="toggleLocale(loc.code, $event.target.checked)"
                      />
                    </td>
                    <td class="px-4 py-2.5 text-center">
                      <input
                        type="radio"
                        class="border-slate-300"
                        name="admin-default-locale-pick"
                        :value="loc.code"
                        :checked="config.i18n.defaultLocale === loc.code"
                        :disabled="!config.i18n.enabledLocales?.includes(loc.code)"
                        @change="setDefaultLocale(loc.code)"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="text-xs text-slate-500">「排序」填整数，数字越小在前台语言列表中越靠前；未改动时按内置目录默认间隔 10 递增。</p>

            <div class="flex items-start justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-3">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-slate-900">前台显示语言切换</p>
                <p class="mt-1 text-xs text-slate-500">
                  关闭后顶栏与移动端菜单中的语言入口将隐藏（仍使用默认语言展示页面）。
                </p>
              </div>
              <button
                type="button"
                :class="config.i18n.languageSwitcherEnabled ? 'bg-blue-600' : 'bg-slate-200'"
                class="relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
                :aria-pressed="config.i18n.languageSwitcherEnabled"
                @click="config.i18n.languageSwitcherEnabled = !config.i18n.languageSwitcherEnabled"
              >
                <span
                  :class="config.i18n.languageSwitcherEnabled ? 'translate-x-5' : 'translate-x-0'"
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                />
              </button>
            </div>
        </section>

        <!-- 手机区号 -->
        <section v-show="activeTab === 'dial'" class="space-y-4">
          <div
            v-if="!config.phoneLoginEnabled"
            class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            当前未启用「手机号码登录」，前台手机区号固定为 +86。需要按下方列表展示时，请前往
            <RouterLink class="font-medium text-blue-800 underline-offset-2 hover:underline" to="/admin/system/site-config">
              登录设置
            </RouterLink>
            开启。
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-sm font-medium text-slate-700">可选区号列表</span>
            <div class="flex flex-wrap gap-2 text-xs">
              <button type="button" class="text-blue-600 hover:underline" @click="selectAllDialCodes">全选</button>
            </div>
          </div>
          <div class="overflow-x-auto overflow-hidden rounded-lg border border-slate-200">
            <table class="w-full min-w-[28rem] border-collapse text-left text-sm">
                <thead class="bg-slate-50 text-slate-600">
                <tr>
                  <th class="px-4 py-2.5 font-medium">地区与区号</th>
                  <th class="w-28 px-4 py-2.5 font-medium">国际区号</th>
                  <th class="w-28 px-4 py-2.5 font-medium">排序</th>
                  <th class="w-24 px-4 py-2.5 text-center font-medium">启用</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                <tr v-for="row in dialsTableRows" :key="row.dial" class="hover:bg-slate-50/80">
                  <td class="px-4 py-2.5 text-slate-800">{{ row.label }}</td>
                  <td class="px-4 py-2.5 font-mono text-sm text-slate-600">{{ row.dial }}</td>
                  <td class="px-4 py-2.5">
                    <input
                      type="number"
                      step="1"
                      class="ant-input w-full max-w-[6.5rem] text-right text-sm tabular-nums"
                      :value="config.dialSortOrder?.[row.dial] ?? 0"
                      @input="onDialSortInput(row.dial, $event.target.value)"
                    />
                  </td>
                  <td class="px-4 py-2.5 text-center">
                    <input
                      type="checkbox"
                      class="rounded border-slate-300"
                      :checked="config.allowedDialCodes?.includes(row.dial)"
                      @change="toggleDial(row.dial, $event.target.checked)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-xs text-slate-500">「排序」填整数，数字越小在区号下拉中越靠前；保存后前台登录与绑定手机等处的区号顺序与此一致。</p>
        </section>
      </div>

      <div class="flex justify-end border-t border-slate-200 bg-slate-50/50 px-4 py-4">
        <button type="button" class="ant-btn ant-btn-primary" :disabled="isSaving" @click="saveConfig">
          {{ isSaving ? '保存中…' : '保存' }}
        </button>
      </div>
    </div>
  </div>
</template>
