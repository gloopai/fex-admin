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
  slippagePct: 0.15,
  latencyMs: 50,
  maxLeverage: 100,
  autoTriggerEnabled: true
})

const form = reactive(defaults())
const selectedPreset = ref('custom')

const presetKeys = ['conservative', 'balanced', 'aggressive']

const presetMap = {
  conservative: {
    label: '保守',
    desc: '低干预，优先稳定',
    values: { priceOffset: 2, offsetDirection: 'random', slippagePct: 0.1, latencyMs: 30, maxLeverage: 75 }
  },
  balanced: {
    label: '均衡',
    desc: '默认建议配置',
    values: { priceOffset: 5, offsetDirection: 'random', slippagePct: 0.2, latencyMs: 80, maxLeverage: 100 }
  },
  aggressive: {
    label: '激进',
    desc: '高干预，快速控险',
    values: { priceOffset: 10, offsetDirection: 'against', slippagePct: 0.35, latencyMs: 150, maxLeverage: 50 }
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
      nearlyEqual(form.slippagePct, p.slippagePct) &&
      nearlyEqual(form.latencyMs, p.latencyMs) &&
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
  form.slippagePct = Number(value.slippagePct)
  form.latencyMs = Number(value.latencyMs)
  form.maxLeverage = Number(value.maxLeverage)
  form.autoTriggerEnabled = Boolean(value.autoTriggerEnabled)
}

watch(
  () => [props.open, props.config],
  ([isOpen]) => {
    if (isOpen) {
      hydrateForm(props.config)
      selectedPreset.value = detectPreset()
    }
  },
  { immediate: true }
)

const clamp = (val, min, max) => Math.min(max, Math.max(min, Number(val || 0)))

const normalize = () => {
  form.priceOffset = clamp(form.priceOffset, 0, 50)
  form.slippagePct = clamp(form.slippagePct, 0, 2)
  form.latencyMs = clamp(form.latencyMs, 0, 5000)
  form.maxLeverage = clamp(form.maxLeverage, 1, 125)
}

const applyPreset = (preset) => {
  const values = presetMap[preset]?.values
  if (!values) return
  form.priceOffset = values.priceOffset
  form.offsetDirection = values.offsetDirection
  form.slippagePct = values.slippagePct
  form.latencyMs = values.latencyMs
  form.maxLeverage = values.maxLeverage
  selectedPreset.value = preset
}

const selectPreset = (preset) => {
  if (!presetMap[preset]) return
  applyPreset(preset)
}

watch(
  () => [form.priceOffset, form.offsetDirection, form.slippagePct, form.latencyMs, form.maxLeverage],
  () => {
    selectedPreset.value = detectPreset()
  }
)

const riskScore = computed(() => {
  const score = form.maxLeverage * 0.35 + form.slippagePct * 55 + form.priceOffset * 1.2 + form.latencyMs * 0.04
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
    `滑点率: ${form.slippagePct.toFixed(2)}%`,
    `成交延迟: ${form.latencyMs}ms`,
    `杠杆上限: ${form.maxLeverage}x`,
    `自动触发规则: ${form.autoTriggerEnabled ? '启用' : '关闭'}`
  ]
})

// 示例计算
const examplePrice = 50000 // BTC示例价格
const exampleAmount = 1 // 示例数量

const exampleCalc = computed(() => {
  const basePrice = examplePrice
  const offset = form.priceOffset
  let adjustedPrice = basePrice
  
  // 根据偏移方向计算价格
  if (form.offsetDirection === 'up') {
    adjustedPrice = basePrice + offset
  } else if (form.offsetDirection === 'down') {
    adjustedPrice = basePrice - offset
  } else if (form.offsetDirection === 'random') {
    adjustedPrice = basePrice + (Math.random() > 0.5 ? offset : -offset)
  } else if (form.offsetDirection === 'against') {
    adjustedPrice = basePrice - offset // 假设逆势
  }
  
  // 计算滑点影响
  const slippageAmount = adjustedPrice * (form.slippagePct / 100)
  const finalPrice = adjustedPrice + slippageAmount
  
  // 计算实际成本
  const baseCost = basePrice * exampleAmount
  const actualCost = finalPrice * exampleAmount
  const difference = actualCost - baseCost
  const differencePercent = ((difference / baseCost) * 100).toFixed(2)
  
  return {
    basePrice: basePrice.toFixed(2),
    adjustedPrice: adjustedPrice.toFixed(2),
    slippageAmount: slippageAmount.toFixed(2),
    finalPrice: finalPrice.toFixed(2),
    baseCost: baseCost.toFixed(2),
    actualCost: actualCost.toFixed(2),
    difference: difference.toFixed(2),
    differencePercent,
    delayTime: form.latencyMs
  }
})

const save = () => {
  normalize()
  emit('save', {
    priceOffset: Number(form.priceOffset),
    offsetDirection: form.offsetDirection,
    slippagePct: Number(form.slippagePct),
    latencyMs: Number(form.latencyMs),
    maxLeverage: Number(form.maxLeverage),
    autoTriggerEnabled: Boolean(form.autoTriggerEnabled)
  })
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" @click.self="emit('close')">
    <section class="flex h-[88vh] w-full max-w-7xl overflow-hidden rounded-xl bg-white shadow-2xl">
      <!-- 左侧配置区域 -->
      <div class="flex grow flex-col border-r border-slate-200">
        <header class="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">配置 {{ symbol }} 线控参数</h2>
            <p class="mt-0.5 text-xs text-slate-500">调整参数后可在右侧查看实时影响</p>
          </div>
          <button type="button" class="text-2xl text-slate-400 hover:text-slate-600 transition-colors" @click="emit('close')">×</button>
        </header>

        <div class="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <!-- 快速预设 -->
          <section class="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <svg class="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-base font-semibold text-slate-900">快速预设</h3>
                <p class="text-xs text-slate-500">选择预设方案快速配置</p>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-3">
              <button
                v-for="key in presetKeys"
                :key="key"
                type="button"
                class="group relative overflow-hidden rounded-lg border p-4 text-left transition-all hover:shadow-md"
                :class="selectedPreset === key ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-300 bg-white hover:border-slate-400'"
                @click="selectPreset(key)"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <p class="text-sm font-semibold text-slate-900">{{ presetMap[key].label }}</p>
                    <p class="mt-1 text-xs text-slate-500">{{ presetMap[key].desc }}</p>
                  </div>
                  <span
                    class="h-3 w-3 rounded-full border-2 transition-colors"
                    :class="selectedPreset === key ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white group-hover:border-slate-400'"
                  />
                </div>
              </button>
            </div>

            <p class="text-xs text-slate-500">
              <svg class="inline h-3 w-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              点选预设会覆盖当前参数；手动修改任一参数会自动切换为"自定义"
            </p>
          </section>

          <!-- 价格控制 -->
          <section class="space-y-4 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
                <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-base font-semibold text-slate-900">价格控制</h3>
                <p class="text-xs text-slate-600">影响用户看到的价格</p>
              </div>
            </div>

            <div class="space-y-4 rounded-lg bg-white p-4">
              <label class="block space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium text-slate-700">价格偏移 (点)</span>
                  <input
                    v-model.number="form.priceOffset"
                    type="number"
                    min="0"
                    max="50"
                    class="w-20 rounded-md border border-slate-300 px-2 py-1 text-right text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <input v-model.number="form.priceOffset" type="range" min="0" max="50" step="1" class="w-full accent-blue-600" />
                <p class="text-xs text-slate-500">范围 0-50，建议先从 3-10 点测试</p>
              </label>

              <label class="block space-y-2">
                <span class="text-sm font-medium text-slate-700">偏移方向</span>
                <select v-model="form.offsetDirection" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                  <option value="random">随机偏移</option>
                  <option value="against">逆势偏移</option>
                  <option value="up">向上偏移</option>
                  <option value="down">向下偏移</option>
                </select>
              </label>
            </div>
          </section>

          <!-- 成交控制 -->
          <section class="space-y-4 rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50 p-5 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-base font-semibold text-slate-900">成交控制</h3>
                <p class="text-xs text-slate-600">影响订单成交质量和速度</p>
              </div>
            </div>

            <div class="space-y-4 rounded-lg bg-white p-4">
              <label class="block space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium text-slate-700">滑点率 (%)</span>
                  <input
                    v-model.number="form.slippagePct"
                    type="number"
                    min="0"
                    max="2"
                    step="0.01"
                    class="w-20 rounded-md border border-slate-300 px-2 py-1 text-right text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <input v-model.number="form.slippagePct" type="range" min="0" max="2" step="0.01" class="w-full accent-violet-600" />
              </label>

              <label class="block space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium text-slate-700">成交延迟 (ms)</span>
                  <input
                    v-model.number="form.latencyMs"
                    type="number"
                    min="0"
                    max="5000"
                    step="10"
                    class="w-20 rounded-md border border-slate-300 px-2 py-1 text-right text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <input v-model.number="form.latencyMs" type="range" min="0" max="5000" step="10" class="w-full accent-violet-600" />
              </label>
            </div>
          </section>

          <!-- 杠杆限制 -->
          <section class="space-y-4 rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
                <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-base font-semibold text-slate-900">杠杆限制</h3>
                <p class="text-xs text-slate-600">限制该合约可使用的最大杠杆倍数</p>
              </div>
            </div>

            <div class="space-y-4 rounded-lg bg-white p-4">
              <label class="block space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium text-slate-700">最大杠杆限制</span>
                  <input
                    v-model.number="form.maxLeverage"
                    type="number"
                    min="1"
                    max="125"
                    step="1"
                    class="w-20 rounded-md border border-slate-300 px-2 py-1 text-right text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <input v-model.number="form.maxLeverage" type="range" min="1" max="125" step="1" class="w-full accent-amber-600" />
                <p class="text-xs text-slate-500">范围 1-125x，保存后对新开仓位生效</p>
              </label>
            </div>
          </section>

          <!-- 自动触发 -->
          <section class="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <svg class="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-base font-semibold text-slate-900">自动触发</h3>
                <p class="text-xs text-slate-500">是否自动应用规则到交易</p>
              </div>
            </div>

            <label class="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100">
              <div>
                <span class="text-sm font-medium text-slate-900">启用自动触发规则</span>
                <p class="mt-1 text-xs text-slate-500">开启后会在当前参数基础上应用自动规则；关闭后仅使用当前手动参数</p>
              </div>
              <div class="relative">
                <input v-model="form.autoTriggerEnabled" type="checkbox" class="peer sr-only" />
                <div class="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300"></div>
              </div>
            </label>
          </section>
        </div>

        <footer class="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50" @click="emit('close')">取消</button>
          <button type="button" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" @click="save">保存</button>
        </footer>
      </div>
      <!-- 右侧示例计算 -->
      <div class="flex w-[20%] flex-col bg-gradient-to-br from-indigo-50 to-purple-50">
        <header class="border-b border-slate-200 px-5 py-4">
          <h3 class="text-lg font-semibold text-slate-900">计算示例</h3>
          <p class="mt-0.5 text-xs text-slate-500">模拟订单的实际影响</p>
        </header>

        <div class="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <!-- 订单示例 -->
          <div class="rounded-lg border border-indigo-200 bg-white p-4 shadow-sm">
            <h4 class="text-sm font-semibold text-slate-900">订单示例</h4>
            <div class="mt-3 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-600">交易对</span>
                <span class="font-semibold text-slate-900">BTC/USDT</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-600">订单类型</span>
                <span class="font-semibold text-slate-900">市价买入</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-600">数量</span>
                <span class="font-semibold text-slate-900">{{ exampleAmount }} BTC</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-600">杠杆</span>
                <span class="font-semibold text-slate-900">{{ Math.min(form.maxLeverage, 10) }}x</span>
              </div>
            </div>
          </div>

          <!-- 价格计算 -->
          <div class="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
            <h4 class="text-sm font-semibold text-slate-900">价格计算过程</h4>
            <div class="mt-3 space-y-2.5">
              <div class="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2">
                <span class="text-xs text-slate-600">市场价格</span>
                <span class="text-xs font-bold text-slate-900">${{ exampleCalc.basePrice }}</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="h-3 w-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span class="text-xs text-blue-600">应用价格偏移 {{ form.priceOffset }} 点</span>
              </div>
              <div class="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2">
                <span class="text-xs text-slate-600">调整后价格</span>
                <span class="text-xs font-bold text-blue-700">${{ exampleCalc.adjustedPrice }}</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="h-3 w-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span class="text-xs text-blue-600">应用滑点 {{ form.slippagePct.toFixed(2) }}%</span>
              </div>
              <div class="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2 ring-2 ring-blue-400">
                <span class="text-xs font-semibold text-slate-700">最终成交价</span>
                <span class="text-sm font-bold text-blue-700">${{ exampleCalc.finalPrice }}</span>
              </div>
            </div>
          </div>

          <!-- 成本对比 -->
          <div class="rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-4">
            <h4 class="text-sm font-semibold text-slate-900">成本对比</h4>
            <div class="mt-3 space-y-2.5">
              <div class="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2">
                <span class="text-xs text-slate-600">理论成本</span>
                <span class="text-xs font-bold text-slate-900">${{ exampleCalc.baseCost }}</span>
              </div>
              <div class="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2">
                <span class="text-xs text-slate-600">实际成本</span>
                <span class="text-xs font-bold text-violet-700">${{ exampleCalc.actualCost }}</span>
              </div>
              <div class="h-px bg-slate-300"></div>
              <div class="flex items-center justify-between rounded-lg px-3 py-2" :class="parseFloat(exampleCalc.difference) > 0 ? 'bg-rose-100' : 'bg-emerald-100'">
                <span class="text-xs font-semibold" :class="parseFloat(exampleCalc.difference) > 0 ? 'text-rose-700' : 'text-emerald-700'">成本差异</span>
                <div class="text-right">
                  <div class="text-sm font-bold" :class="parseFloat(exampleCalc.difference) > 0 ? 'text-rose-700' : 'text-emerald-700'">
                    {{ parseFloat(exampleCalc.difference) > 0 ? '+' : '' }}${{ exampleCalc.difference }}
                  </div>
                  <div class="text-xs" :class="parseFloat(exampleCalc.difference) > 0 ? 'text-rose-600' : 'text-emerald-600'">
                    {{ parseFloat(exampleCalc.differencePercent) > 0 ? '+' : '' }}{{ exampleCalc.differencePercent }}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 执行时间 -->
          <div class="rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
            <h4 class="text-sm font-semibold text-slate-900">执行延迟</h4>
            <div class="mt-3">
              <div class="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2.5">
                <div class="flex items-center gap-2">
                  <svg class="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-xs text-slate-600">预计延迟</span>
                </div>
                <span class="text-sm font-bold text-amber-700">{{ exampleCalc.delayTime }}ms</span>
              </div>
              <p class="mt-2 text-xs text-amber-800">
                订单提交后将延迟 {{ exampleCalc.delayTime }}ms 执行，在此期间市场价格可能波动。
              </p>
            </div>
          </div>

          <!-- 说明 -->
          <div class="rounded-lg border border-slate-200 bg-white p-3">
            <p class="text-xs leading-relaxed text-slate-600">
              <svg class="inline h-3 w-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              以上为模拟计算，实际成交价格和成本会根据市场行情实时变化。
            </p>
          </div>
        </div>
      </div>
      <!-- 中间预览区域 -->
      <div class="flex w-[20%] flex-col border-r border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
       <header class="border-b border-slate-200 px-5 py-4">
          <h3 class="text-lg font-semibold text-slate-900">实时预览</h3>
          <p class="mt-0.5 text-xs text-slate-500">当前配置的影响和风险评估</p>
        </header>

        <div class="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <!-- 参数配置 -->
          <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-slate-900">参数配置</h4>
              <span class="rounded-md px-2 py-1 text-xs font-medium" :class="selectedPreset === 'custom' ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-700'">
                {{ selectedPreset === 'custom' ? '自定义' : presetMap[selectedPreset].label }}
              </span>
            </div>
            <div class="mt-3 space-y-2">
              <div class="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
                <span class="text-xs text-blue-700">价格偏移</span>
                <span class="text-xs font-bold text-blue-900">{{ form.priceOffset }} 点</span>
              </div>
              <div class="flex items-center justify-between rounded-lg bg-violet-50 px-3 py-2">
                <span class="text-xs text-violet-700">滑点率</span>
                <span class="text-xs font-bold text-violet-900">{{ form.slippagePct.toFixed(2) }}%</span>
              </div>
              <div class="flex items-center justify-between rounded-lg bg-violet-50 px-3 py-2">
                <span class="text-xs text-violet-700">成交延迟</span>
                <span class="text-xs font-bold text-violet-900">{{ form.latencyMs }}ms</span>
              </div>
              <div class="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
                <span class="text-xs text-amber-700">最大杠杆</span>
                <span class="text-xs font-bold text-amber-900">{{ form.maxLeverage }}x</span>
              </div>
              <div class="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span class="text-xs text-slate-700">自动触发</span>
                <span class="text-xs font-bold" :class="form.autoTriggerEnabled ? 'text-emerald-600' : 'text-slate-600'">
                  {{ form.autoTriggerEnabled ? '已启用' : '已关闭' }}
                </span>
              </div>
            </div>
          </div>

          <!-- 风险评估 -->
          <div class="rounded-lg border-2 p-4 shadow-sm" 
            :class="{
              'border-rose-300 bg-gradient-to-br from-rose-50 to-pink-50': riskLabel.text === '高风险',
              'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50': riskLabel.text === '中风险',
              'border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50': riskLabel.text === '低风险'
            }"
          >
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-slate-900">风险评估</h4>
              <span class="rounded-lg px-2.5 py-1 text-xs font-bold shadow-sm" 
                :class="{
                  'bg-gradient-to-r from-rose-500 to-pink-500 text-white': riskLabel.text === '高风险',
                  'bg-gradient-to-r from-amber-500 to-orange-500 text-white': riskLabel.text === '中风险',
                  'bg-gradient-to-r from-emerald-500 to-teal-500 text-white': riskLabel.text === '低风险'
                }"
              >
                {{ riskLabel.text === '高风险' ? '⚠ 高风险' : riskLabel.text === '中风险' ? '⚠ 中风险' : '✓ 低风险' }}
              </span>
            </div>

            <div class="mt-3 space-y-3">
              <div class="rounded-lg bg-white/70 px-3 py-2.5">
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-xs font-medium text-slate-700">综合风险评分</span>
                  <span class="text-xs font-bold" :class="riskLabel.className">
                    {{ riskScore }} / 100
                  </span>
                </div>
                <div class="h-2 w-full rounded-full bg-slate-200">
                  <div class="h-full rounded-full transition-all duration-300" 
                    :class="{
                      'bg-gradient-to-r from-rose-500 to-pink-500': riskLabel.text === '高风险',
                      'bg-gradient-to-r from-amber-500 to-orange-500': riskLabel.text === '中风险',
                      'bg-gradient-to-r from-emerald-500 to-teal-500': riskLabel.text === '低风险'
                    }"
                    :style="{ width: `${Math.min(riskScore, 100)}%` }"
                  ></div>
                </div>
              </div>

              <div class="flex items-start gap-2 rounded-lg bg-white/70 px-3 py-2.5">
                <svg class="mt-0.5 h-3.5 w-3.5 flex-shrink-0" 
                  :class="{
                    'text-rose-600': riskLabel.text === '高风险',
                    'text-amber-600': riskLabel.text === '中风险',
                    'text-emerald-600': riskLabel.text === '低风险'
                  }"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-xs leading-relaxed" 
                  :class="{
                    'text-rose-800': riskLabel.text === '高风险',
                    'text-amber-800': riskLabel.text === '中风险',
                    'text-emerald-800': riskLabel.text === '低风险'
                  }"
                >
                  <span v-if="riskLabel.text === '低风险'">参数配置较为温和，风险可控，适合日常使用。</span>
                  <span v-else-if="riskLabel.text === '中风险'">参数配置会明显影响交易，建议在必要时使用。</span>
                  <span v-else>参数配置较为激进，会显著影响用户体验，建议谨慎使用。</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  </div>
</template>
