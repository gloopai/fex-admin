<script setup>
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  symbol: {
    type: String,
    default: ''
  },
  config: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'save'])

const defaults = () => ({
  priceOffset: 5,
  offsetDirection: 'random',
  spreadMultiplier: 1.2,
  slippagePct: 0.15,
  latencyMs: 50,
  rejectRatePct: 2,
  maxLeverage: 100,
  autoTriggerEnabled: true
})

const form = reactive(defaults())
const activeTab = ref('basic')
const selectedPreset = ref('custom')

const tabs = [
  { key: 'basic', label: '基础设置' },
  { key: 'price', label: '价格控制' },
  { key: 'execution', label: '成交控制' },
  { key: 'leverage', label: '杠杆限制' }
]

const presetKeys = ['conservative', 'balanced', 'aggressive']

const presetMap = {
  conservative: {
    label: '保守',
    desc: '低干预，优先稳定',
    values: { priceOffset: 2, offsetDirection: 'random', spreadMultiplier: 1.1, slippagePct: 0.1, latencyMs: 30, rejectRatePct: 1, maxLeverage: 75 }
  },
  balanced: {
    label: '均衡',
    desc: '默认建议配置',
    values: { priceOffset: 5, offsetDirection: 'random', spreadMultiplier: 1.3, slippagePct: 0.2, latencyMs: 80, rejectRatePct: 3, maxLeverage: 100 }
  },
  aggressive: {
    label: '激进',
    desc: '高干预，快速控险',
    values: { priceOffset: 10, offsetDirection: 'against', spreadMultiplier: 1.8, slippagePct: 0.35, latencyMs: 150, rejectRatePct: 6, maxLeverage: 50 }
  }
}

const nearlyEqual = (a, b, eps = 1e-6) => Math.abs(Number(a) - Number(b)) <= eps

const detectPreset = () => {
  const keys = ['conservative', 'balanced', 'aggressive']
  for (const key of keys) {
    const p = presetMap[key].values
    if (
      form.offsetDirection === p.offsetDirection &&
      nearlyEqual(form.priceOffset, p.priceOffset) &&
      nearlyEqual(form.spreadMultiplier, p.spreadMultiplier) &&
      nearlyEqual(form.slippagePct, p.slippagePct) &&
      nearlyEqual(form.latencyMs, p.latencyMs) &&
      nearlyEqual(form.rejectRatePct, p.rejectRatePct) &&
      nearlyEqual(form.maxLeverage, p.maxLeverage)
    ) {
      return key
    }
  }
  return 'custom'
}

const hydrateForm = (next = {}) => {
  const value = { ...defaults(), ...next }
  form.priceOffset = Number(value.priceOffset)
  form.offsetDirection = value.offsetDirection
  form.spreadMultiplier = Number(value.spreadMultiplier)
  form.slippagePct = Number(value.slippagePct)
  form.latencyMs = Number(value.latencyMs)
  form.rejectRatePct = Number(value.rejectRatePct)
  form.maxLeverage = Number(value.maxLeverage)
  form.autoTriggerEnabled = Boolean(value.autoTriggerEnabled)
}

watch(
  () => [props.open, props.config],
  ([isOpen]) => {
    if (isOpen) {
      hydrateForm(props.config)
      activeTab.value = 'basic'
      selectedPreset.value = detectPreset()
    }
  },
  { immediate: true }
)

const clamp = (val, min, max) => Math.min(max, Math.max(min, Number(val || 0)))

const normalize = () => {
  form.priceOffset = clamp(form.priceOffset, 0, 50)
  form.spreadMultiplier = clamp(form.spreadMultiplier, 1, 5)
  form.slippagePct = clamp(form.slippagePct, 0, 2)
  form.latencyMs = clamp(form.latencyMs, 0, 5000)
  form.rejectRatePct = clamp(form.rejectRatePct, 0, 20)
  form.maxLeverage = clamp(form.maxLeverage, 1, 125)
}

const applyPreset = (preset) => {
  const values = presetMap[preset]?.values
  if (!values) return
  form.priceOffset = values.priceOffset
  form.offsetDirection = values.offsetDirection
  form.spreadMultiplier = values.spreadMultiplier
  form.slippagePct = values.slippagePct
  form.latencyMs = values.latencyMs
  form.rejectRatePct = values.rejectRatePct
  form.maxLeverage = values.maxLeverage
  selectedPreset.value = preset
}

const selectPreset = (preset) => {
  if (!presetMap[preset]) return
  applyPreset(preset)
}

watch(
  () => [form.priceOffset, form.offsetDirection, form.spreadMultiplier, form.slippagePct, form.latencyMs, form.rejectRatePct, form.maxLeverage],
  () => {
    selectedPreset.value = detectPreset()
  }
)

const riskScore = computed(() => {
  const score = form.maxLeverage * 0.35 + form.slippagePct * 55 + form.rejectRatePct * 5 + form.priceOffset * 1.2 + form.latencyMs * 0.04
  return Math.round(score)
})

const riskLabel = computed(() => {
  if (riskScore.value < 45) return { text: '低风险', className: 'text-emerald-600' }
  if (riskScore.value < 75) return { text: '中风险', className: 'text-amber-600' }
  return { text: '高风险', className: 'text-rose-600' }
})

const summary = computed(() => {
  const directionText = {
    random: '随机偏移',
    up: '向上偏移',
    down: '向下偏移',
    against: '逆势偏移'
  }[form.offsetDirection] || '随机偏移'
  return [
    `价格偏移: ${form.priceOffset} 点 (${directionText})`,
    `点差倍数: ${form.spreadMultiplier.toFixed(1)}x`,
    `滑点率: ${form.slippagePct.toFixed(2)}%`,
    `成交延迟: ${form.latencyMs}ms`,
    `拒单率: ${form.rejectRatePct.toFixed(1)}%`,
    `杠杆上限: ${form.maxLeverage}x`,
    `自动触发规则: ${form.autoTriggerEnabled ? '启用' : '关闭'}`
  ]
})

const save = () => {
  normalize()
  emit('save', {
    priceOffset: Number(form.priceOffset),
    offsetDirection: form.offsetDirection,
    spreadMultiplier: Number(form.spreadMultiplier),
    slippagePct: Number(form.slippagePct),
    latencyMs: Number(form.latencyMs),
    rejectRatePct: Number(form.rejectRatePct),
    maxLeverage: Number(form.maxLeverage),
    autoTriggerEnabled: Boolean(form.autoTriggerEnabled)
  })
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" @click.self="emit('close')">
    <section class="w-full max-w-4xl rounded-xl bg-white">
      <header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <h2 class="text-2xl font-semibold text-slate-900">配置 {{ symbol }} 线控参数</h2>
          <p class="text-sm text-slate-500">先选择预设，再微调参数，最后确认风险等级与配置摘要</p>
        </div>
        <button type="button" class="text-2xl text-slate-400 hover:text-slate-700" @click="emit('close')">×</button>
      </header>

      <div class="max-h-[72vh] space-y-5 overflow-y-auto px-6 py-5">
        <nav class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="rounded-md px-3 py-1.5 text-sm"
            :class="activeTab === tab.key ? 'bg-white font-medium text-blue-600 shadow-sm' : 'text-slate-600'"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </nav>

        <section v-if="activeTab === 'basic'" class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div class="grid gap-4">
            <div class="rounded-lg border border-slate-200 bg-white p-3">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-slate-700">快速预设</p>
                <span class="text-xs text-slate-500">
                  当前:
                  <span class="font-medium text-slate-700">{{ selectedPreset === 'custom' ? '自定义' : presetMap[selectedPreset].label }}</span>
                </span>
              </div>
              <div class="mt-2 grid gap-2 md:grid-cols-3">
                <button
                  v-for="key in presetKeys"
                  :key="key"
                  type="button"
                  class="rounded-lg border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                  :class="
                    selectedPreset === key
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
                  "
                  @click="selectPreset(key)"
                >
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-slate-900">{{ presetMap[key].label }}</p>
                    <span
                      class="h-2.5 w-2.5 rounded-full border"
                      :class="selectedPreset === key ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'"
                    />
                  </div>
                  <p class="mt-0.5 text-xs text-slate-500">{{ presetMap[key].desc }}</p>
                </button>
              </div>
              <p class="mt-2 text-xs text-slate-500">提示：点选预设会覆盖当前参数；手动修改任一参数会自动切换为“自定义”。</p>
            </div>
          </div>

          <div class="mt-4 rounded-lg border border-slate-200 bg-white p-3">
            <div class="grid gap-3 lg:grid-cols-[1fr,280px] lg:items-start">
              <div>
                <label class="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input v-model="form.autoTriggerEnabled" type="checkbox" class="h-4 w-4" />
                  启用自动触发规则
                </label>
                <p class="mt-2 text-xs text-slate-500">开启后会在当前参数基础上应用自动规则；关闭后仅使用当前手动参数。</p>
              </div>
              <div class="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                <p class="font-medium text-slate-800">风险评分: {{ riskScore }}</p>
                <p class="mt-1" :class="riskLabel.className">当前风控等级: {{ riskLabel.text }}</p>
              </div>
            </div>
          </div>

          <article class="mt-4 rounded-lg border border-slate-200 bg-white p-3 text-sm">
            <p class="font-medium text-slate-800">配置摘要</p>
            <ul class="mt-1 space-y-0.5 text-slate-600">
              <li v-for="line in summary" :key="line">- {{ line }}</li>
            </ul>
          </article>
        </section>

        <section v-if="activeTab === 'price'" class="rounded-lg border border-slate-200 p-4">
          <h3 class="text-lg font-semibold text-slate-900">价格控制</h3>
          <p class="mt-1 text-sm text-slate-500">影响用户看到的价格和交易成本。</p>

          <div class="mt-3 space-y-4">
            <label class="block space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-slate-700">价格偏移 (点)</span>
                <input v-model.number="form.priceOffset" type="number" min="0" max="50" class="w-24 rounded border border-slate-300 px-2 py-1 text-right" />
              </div>
              <input v-model.number="form.priceOffset" type="range" min="0" max="50" step="1" class="w-full accent-blue-600" />
              <p class="text-xs text-slate-500">范围 0-50，建议先从 3-10 点测试。</p>
            </label>

            <label class="block max-w-[260px] space-y-2">
              <span class="text-sm font-medium text-slate-700">偏移方向</span>
              <select v-model="form.offsetDirection" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500">
                <option value="random">随机偏移</option>
                <option value="against">逆势偏移</option>
                <option value="up">向上偏移</option>
                <option value="down">向下偏移</option>
              </select>
            </label>

            <label class="block space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-slate-700">点差倍数</span>
                <input v-model.number="form.spreadMultiplier" type="number" min="1" max="5" step="0.1" class="w-24 rounded border border-slate-300 px-2 py-1 text-right" />
              </div>
              <input v-model.number="form.spreadMultiplier" type="range" min="1" max="5" step="0.1" class="w-full accent-blue-600" />
              <p class="text-xs text-slate-500">1.0x 为正常点差，1.5x 表示扩大 50%。</p>
            </label>
          </div>
        </section>

        <section v-if="activeTab === 'execution'" class="rounded-lg border border-slate-200 p-4">
          <h3 class="text-lg font-semibold text-slate-900">成交控制</h3>
          <p class="mt-1 text-sm text-slate-500">影响订单成交质量和成交速度。</p>

          <div class="mt-3 grid gap-4 md:grid-cols-2">
            <label class="block space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-slate-700">滑点率 (%)</span>
                <input v-model.number="form.slippagePct" type="number" min="0" max="2" step="0.01" class="w-24 rounded border border-slate-300 px-2 py-1 text-right" />
              </div>
              <input v-model.number="form.slippagePct" type="range" min="0" max="2" step="0.01" class="w-full accent-blue-600" />
            </label>

            <label class="block space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-slate-700">成交延迟 (ms)</span>
                <input v-model.number="form.latencyMs" type="number" min="0" max="5000" step="10" class="w-24 rounded border border-slate-300 px-2 py-1 text-right" />
              </div>
              <input v-model.number="form.latencyMs" type="range" min="0" max="5000" step="10" class="w-full accent-blue-600" />
            </label>

            <label class="block space-y-2 md:col-span-2">
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-slate-700">拒单率 (%)</span>
                <input v-model.number="form.rejectRatePct" type="number" min="0" max="20" step="0.1" class="w-24 rounded border border-slate-300 px-2 py-1 text-right" />
              </div>
              <input v-model.number="form.rejectRatePct" type="range" min="0" max="20" step="0.1" class="w-full accent-blue-600" />
            </label>
          </div>
        </section>

        <section v-if="activeTab === 'leverage'" class="rounded-lg border border-slate-200 p-4">
          <h3 class="text-lg font-semibold text-slate-900">杠杆限制</h3>
          <p class="mt-1 text-sm text-slate-500">限制该合约可使用的最大杠杆倍数。</p>

          <div class="mt-3 space-y-4">
            <label class="block space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-slate-700">最大杠杆限制</span>
                <input v-model.number="form.maxLeverage" type="number" min="1" max="125" step="1" class="w-24 rounded border border-slate-300 px-2 py-1 text-right" />
              </div>
              <input v-model.number="form.maxLeverage" type="range" min="1" max="125" step="1" class="w-full accent-blue-600" />
              <p class="text-xs text-slate-500">范围 1-125x，保存后对新开仓位生效。</p>
            </label>
          </div>
        </section>

      </div>

      <footer class="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
        <button type="button" class="rounded-lg border border-slate-300 px-4 py-2" @click="emit('close')">取消</button>
        <button type="button" class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700" @click="save">保存</button>
      </footer>
    </section>
  </div>
</template>
