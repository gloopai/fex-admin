<script setup>
import { ref, onMounted } from 'vue'
import { AGENT_LEVEL, AGENT_LEVEL_OPTIONS, DEFAULT_AGENT_LEVEL_COMMISSION_RATES } from '../../../admin/constants/agent'
import { agentApi } from '../../../admin/mock/agent'

const rates = ref(
  Object.fromEntries(Object.values(AGENT_LEVEL).map((k) => [k, DEFAULT_AGENT_LEVEL_COMMISSION_RATES[k]]))
)
const loading = ref(false)
const saving = ref(false)

function seedRates(data) {
  const base = { ...DEFAULT_AGENT_LEVEL_COMMISSION_RATES, ...data }
  const out = {}
  for (const k of Object.values(AGENT_LEVEL)) {
    out[k] = base[k] ?? 0
  }
  rates.value = out
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await agentApi.getAgentLevelCommissionRates()
    if (res.success) seedRates(res.data)
    else seedRates({})
  } catch (e) {
    console.error(e)
    seedRates({})
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  for (const k of Object.values(AGENT_LEVEL)) {
    const v = rates.value[k]
    if (typeof v !== 'number' || Number.isNaN(v) || v < 0 || v > 1) {
      alert(`「${k}」佣金比例须为 0～1 之间的小数（例如 0.35 表示 35%）`)
      return
    }
  }
  saving.value = true
  try {
    const res = await agentApi.saveAgentLevelCommissionRates({ ...rates.value })
    if (res.success) alert(res.message)
  } catch (e) {
    alert(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">代理等级佣金比例</h1>
      <p class="mt-1 text-sm text-slate-500">
        维护一级～五级代理各自对应的佣金比例（0～1）。代理列表里「添加代理」下拉的说明文案会随此处更新。
      </p>
      <p class="mt-2 text-sm text-slate-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
        各产品线、裂变链路上下级之间的<strong class="text-slate-800">实际分佣比例</strong>仍以
        <router-link to="/admin/agent/referral-config" class="text-violet-700 font-medium hover:underline">裂变分销配置</router-link>
        为准；若业务将「代理等级」与产品线分佣系数绑定，请在后端统一口径。
      </p>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[200px]">
      <div v-if="loading" class="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
      </div>

      <div class="border-b border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50/50">
        <h2 class="text-base font-semibold text-slate-900">等级与比例</h2>
        <button
          type="button"
          class="ant-btn ant-btn-primary"
          :disabled="saving || loading"
          @click="handleSave"
        >
          {{ saving ? '保存中…' : '保存' }}
        </button>
      </div>

      <div class="p-6">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">代理等级</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">佣金比例（小数）</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">约等于</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="row in AGENT_LEVEL_OPTIONS" :key="row.value" class="hover:bg-slate-50/80">
              <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ row.label }}</td>
              <td class="px-4 py-3">
                <input
                  v-model.number="rates[row.value]"
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  class="ant-input max-w-[140px]"
                />
              </td>
              <td class="px-4 py-3 text-sm text-slate-600">
                {{ ((rates[row.value] ?? 0) * 100).toFixed(1) }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
