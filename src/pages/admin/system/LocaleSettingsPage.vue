<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  DEFAULT_I18N_BLOCK,
  FRONT_LOCALE_CATALOG,
  PHONE_DIAL_PRESETS
} from '../../../admin/constants/i18nCatalog'
import { DEFAULT_SITE_CONFIG, DEFAULT_SMTP_CONFIG, siteConfigApi } from '../../../admin/mock/siteConfig'

const config = ref({
  ...DEFAULT_SITE_CONFIG,
  smtp: { ...DEFAULT_SMTP_CONFIG },
  i18n: { ...DEFAULT_I18N_BLOCK }
})
const loading = ref(true)
const isSaving = ref(false)

/** 多语言 | 手机区号 */
const activeTab = ref('language')
const localeTabs = [
  { key: 'language', label: '多语言' },
  { key: 'dial', label: '手机区号' }
]

const loadConfig = async () => {
  loading.value = true
  try {
    const result = await siteConfigApi.getSiteConfig()
    if (result.success) {
      config.value = { ...DEFAULT_SITE_CONFIG, ...result.data }
      config.value.smtp = { ...DEFAULT_SMTP_CONFIG, ...(config.value.smtp || {}) }
      config.value.i18n = { ...DEFAULT_I18N_BLOCK, ...(config.value.i18n || {}) }
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
  if (checked) cur.add(code)
  else cur.delete(code)
  let next = [...cur]
  if (next.length === 0) next = ['zh-CN']
  config.value.i18n.enabledLocales = next
  if (!next.includes(config.value.i18n.defaultLocale)) {
    config.value.i18n.defaultLocale = next[0]
  }
}

function toggleDial(dial, checked) {
  const cur = new Set(config.value.allowedDialCodes || [])
  if (checked) cur.add(dial)
  else cur.delete(dial)
  config.value.allowedDialCodes = [...cur]
}

function setDefaultLocale(code) {
  if (!config.value.i18n.enabledLocales?.includes(code)) return
  config.value.i18n.defaultLocale = code
}

function toggleAllLocales(checked) {
  if (checked) {
    config.value.i18n.enabledLocales = FRONT_LOCALE_CATALOG.map((l) => l.code)
  } else {
    config.value.i18n.enabledLocales = ['zh-CN']
  }
  if (!config.value.i18n.enabledLocales.includes(config.value.i18n.defaultLocale)) {
    config.value.i18n.defaultLocale = config.value.i18n.enabledLocales[0]
  }
}

function toggleAllDials(checked) {
  if (checked) {
    config.value.allowedDialCodes = PHONE_DIAL_PRESETS.map((p) => p.dial)
  } else {
    config.value.allowedDialCodes = ['+86']
  }
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
                <button type="button" class="text-blue-600 hover:underline" @click="toggleAllLocales(true)">
                  全选
                </button>
                <span class="text-slate-300">|</span>
                <button type="button" class="text-blue-600 hover:underline" @click="toggleAllLocales(false)">
                  仅保留简体中文
                </button>
              </div>
            </div>
            <div class="overflow-x-auto overflow-hidden rounded-lg border border-slate-200">
              <table class="w-full min-w-[28rem] border-collapse text-left text-sm">
                <thead class="bg-slate-50 text-slate-600">
                  <tr>
                    <th class="px-4 py-2.5 font-medium">语言名称</th>
                    <th class="w-32 px-4 py-2.5 font-medium">语言代码</th>
                    <th class="w-24 px-4 py-2.5 text-center font-medium">启用</th>
                    <th class="w-28 px-4 py-2.5 text-center font-medium">默认</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white">
                  <tr v-for="loc in FRONT_LOCALE_CATALOG" :key="loc.code" class="hover:bg-slate-50/80">
                    <td class="px-4 py-2.5 text-slate-800">{{ loc.label }}</td>
                    <td class="px-4 py-2.5 font-mono text-xs text-slate-500">{{ loc.code }}</td>
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
            <p class="text-xs text-slate-500">新访客与未保存过偏好的用户将使用「默认」语言；需在已启用的语言中指定其一。</p>

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
            v-if="!config.loginSettingsEnabled"
            class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            当前未启用「自定义登录配置」，前台手机区号固定为 +86。需要按下方列表展示时，请前往
            <RouterLink class="font-medium text-blue-800 underline-offset-2 hover:underline" to="/admin/system/site-config">
              登录设置
            </RouterLink>
            开启。
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-sm font-medium text-slate-700">可选区号列表</span>
            <div class="flex flex-wrap gap-2 text-xs">
              <button type="button" class="text-blue-600 hover:underline" @click="toggleAllDials(true)">全选</button>
              <span class="text-slate-300">|</span>
              <button type="button" class="text-blue-600 hover:underline" @click="toggleAllDials(false)">
                仅中国大陆 +86
              </button>
            </div>
          </div>
          <div class="overflow-x-auto overflow-hidden rounded-lg border border-slate-200">
            <table class="w-full min-w-[28rem] border-collapse text-left text-sm">
              <thead class="bg-slate-50 text-slate-600">
                <tr>
                  <th class="px-4 py-2.5 font-medium">地区与区号</th>
                  <th class="w-28 px-4 py-2.5 font-medium">国际区号</th>
                  <th class="w-24 px-4 py-2.5 text-center font-medium">启用</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                <tr v-for="row in PHONE_DIAL_PRESETS" :key="row.dial" class="hover:bg-slate-50/80">
                  <td class="px-4 py-2.5 text-slate-800">{{ row.label }}</td>
                  <td class="px-4 py-2.5 font-mono text-sm text-slate-600">{{ row.dial }}</td>
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
          <p class="text-xs text-slate-500">至少保留一个区号；若全部取消，保存后会自动保留 +86。</p>
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
