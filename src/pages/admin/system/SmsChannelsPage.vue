<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { DEFAULT_I18N_BLOCK, PHONE_DIAL_PRESETS } from '../../../admin/constants/i18nCatalog'
import { DEFAULT_SITE_CONFIG, normalizeSmsChannelsList, siteConfigApi } from '../../../admin/mock/siteConfig'

const dialLabelMap = Object.fromEntries(PHONE_DIAL_PRESETS.map((p) => [p.dial, p.label]))

const config = ref({
  ...DEFAULT_SITE_CONFIG,
  i18n: { ...DEFAULT_I18N_BLOCK }
})
const loading = ref(true)
const isSaving = ref(false)

/** @type {import('vue').Ref<string>} */
const dialFilter = ref('')

const filteredRows = computed(() => {
  const list = config.value.smsChannels || []
  const d = dialFilter.value
  if (!d) return list
  return list.filter((r) => r.dial === d)
})

const showModal = ref(false)
/** @type {import('vue').Ref<string | null>} */
const editingId = ref(null)
const formDial = ref('+86')
const formName = ref('')
const formProvider = ref('')
const formEnabled = ref(true)
const formConfigJson = ref('{}')

function resetForm() {
  editingId.value = null
  formDial.value = '+86'
  formName.value = ''
  formProvider.value = ''
  formEnabled.value = true
  formConfigJson.value = '{}'
}

function openAdd() {
  resetForm()
  showModal.value = true
}

function openEdit(row) {
  editingId.value = row.id
  formDial.value = row.dial
  formName.value = row.name || ''
  formProvider.value = row.provider || ''
  formEnabled.value = row.enabled
  formConfigJson.value = JSON.stringify(row.config || {}, null, 2)
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function load() {
  loading.value = true
  try {
    const result = await siteConfigApi.getSiteConfig()
    if (result.success) {
      config.value = { ...DEFAULT_SITE_CONFIG, ...result.data }
      config.value.i18n = { ...DEFAULT_I18N_BLOCK, ...(config.value.i18n || {}) }
      config.value.smsChannels = normalizeSmsChannelsList(
        config.value.smsChannels,
        true,
        config.value.smsChannelsByDial
      )
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function parseConfigJson() {
  const text = String(formConfigJson.value ?? '').trim()
  if (!text) return {}
  const v = JSON.parse(text)
  if (v === null || typeof v !== 'object' || Array.isArray(v)) {
    throw new Error('接口配置须为 JSON 对象（不可为数组或原始值）')
  }
  return v
}

async function submitModal() {
  if (formEnabled.value && !String(formProvider.value ?? '').trim()) {
    alert('已勾选启用时，请填写通道类型（如 aliyun、twilio、custom）')
    return
  }
  let parsed
  try {
    parsed = parseConfigJson()
  } catch (e) {
    alert(e?.message || 'JSON 无效')
    return
  }

  const list = [...(config.value.smsChannels || [])]
  const base = {
    dial: formDial.value,
    name: String(formName.value ?? '').trim(),
    enabled: formEnabled.value,
    provider: String(formProvider.value ?? '').trim(),
    config: parsed
  }
  if (editingId.value) {
    const i = list.findIndex((x) => x.id === editingId.value)
    if (i >= 0) {
      list[i] = { ...list[i], ...base }
    }
  } else {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `sms_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    list.push({ id, ...base })
  }
  config.value.smsChannels = normalizeSmsChannelsList(list, true, undefined)
  await persist()
  closeModal()
}

async function persist() {
  isSaving.value = true
  try {
    const result = await siteConfigApi.updateSiteConfig(config.value)
    if (result.success) {
      window.dispatchEvent(new CustomEvent('admin-site-config-updated'))
      await load()
    }
  } catch (e) {
    alert('保存失败：' + (e?.message || '未知错误'))
  } finally {
    isSaving.value = false
  }
}

async function removeRow(row) {
  if (!confirm(`确定删除该短信通道？（${dialLabelMap[row.dial] || row.dial}）`)) return
  config.value.smsChannels = (config.value.smsChannels || []).filter((x) => x.id !== row.id)
  await persist()
}

onMounted(() => {
  load()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">短信通道</h1>
        <p class="mt-1 text-sm text-slate-500">
          按国际区号维护多条短信通道；配置存于本地站点数据（演示），生产环境应由服务端保管密钥。前台可选区号见
          <RouterLink to="/admin/system/locale-settings" class="text-indigo-600 hover:underline">
            语言与区号
          </RouterLink>
          。
        </p>
      </div>
      <button type="button" class="ant-btn ant-btn-primary shrink-0" :disabled="loading" @click="openAdd">
        添加通道
      </button>
    </div>

    <div v-if="loading" class="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
      加载中…
    </div>

    <div v-else class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div class="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
        <label class="text-sm font-medium text-slate-700">按区号筛选</label>
        <select v-model="dialFilter" class="ant-input max-w-xs text-sm">
          <option value="">全部区号</option>
          <option v-for="p in PHONE_DIAL_PRESETS" :key="p.dial" :value="p.dial">{{ p.label }}</option>
        </select>
        <span class="text-xs text-slate-500">同一区号可配置多条通道。</span>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50/80">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-slate-700">名称</th>
              <th class="px-4 py-3 text-left font-medium text-slate-700">区号</th>
              <th class="px-4 py-3 text-left font-medium text-slate-700">通道类型</th>
              <th class="px-4 py-3 text-left font-medium text-slate-700">状态</th>
              <th class="px-4 py-3 text-right font-medium text-slate-700">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="row in filteredRows" :key="row.id">
              <td class="px-4 py-3 text-slate-900">{{ row.name || '—' }}</td>
              <td class="px-4 py-3">
                <span class="font-mono text-xs text-slate-600">{{ row.dial }}</span>
                <span class="ml-2 text-xs text-slate-500">{{ dialLabelMap[row.dial] || '' }}</span>
              </td>
              <td class="px-4 py-3 font-mono text-xs text-slate-800">{{ row.provider || '—' }}</td>
              <td class="px-4 py-3">
                <span
                  :class="
                    row.enabled ? 'rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-800' : 'text-slate-500'
                  "
                >
                  {{ row.enabled ? '启用' : '停用' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <button type="button" class="text-indigo-600 hover:underline" @click="openEdit(row)">编辑</button>
                <span class="mx-2 text-slate-300">|</span>
                <button type="button" class="text-red-600 hover:underline" @click="removeRow(row)">删除</button>
              </td>
            </tr>
            <tr v-if="filteredRows.length === 0">
              <td colspan="5" class="px-4 py-10 text-center text-sm text-slate-500">
                暂无通道，请点击「添加通道」。
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 添加/编辑：Teleport 到 body，避免 main overflow 导致 fixed 遮罩只盖住内容区 -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-[100] grid place-items-center bg-black/45 p-4"
        @click.self="closeModal"
      >
      <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
        <div class="border-b border-slate-200 px-5 py-4">
          <h2 class="text-lg font-semibold text-slate-900">{{ editingId ? '编辑通道' : '添加通道' }}</h2>
        </div>
        <div class="space-y-4 px-5 py-4">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">国际区号</label>
            <select v-model="formDial" class="ant-input w-full">
              <option v-for="p in PHONE_DIAL_PRESETS" :key="p.dial" :value="p.dial">{{ p.label }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">通道名称（可选）</label>
            <input v-model="formName" type="text" class="ant-input w-full" placeholder="列表中展示用" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">通道类型</label>
            <input
              v-model="formProvider"
              type="text"
              class="ant-input w-full"
              placeholder="如 aliyun、twilio、custom"
              autocomplete="off"
            />
          </div>
          <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input v-model="formEnabled" type="checkbox" class="rounded border-slate-300" />
            启用
          </label>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">接口配置（JSON 对象）</label>
            <textarea
              v-model="formConfigJson"
              rows="10"
              spellcheck="false"
              class="ant-input w-full resize-y font-mono text-xs leading-relaxed"
              placeholder='例如：{ "accessKeyId": "", "signName": "", "templateCode": "" }'
            />
          </div>
        </div>
        <div class="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button type="button" class="ant-btn" @click="closeModal">取消</button>
          <button type="button" class="ant-btn ant-btn-primary" :disabled="isSaving" @click="submitModal">
            {{ isSaving ? '保存中…' : '保存' }}
          </button>
        </div>
      </div>
      </div>
    </Teleport>
  </div>
</template>
