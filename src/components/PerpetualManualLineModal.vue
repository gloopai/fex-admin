<script setup>
import { computed, reactive, watch } from 'vue'
import { PERP_CONTROL_OFFSET_DIRECTION } from '../constants/perpetualControl'

defineOptions({ name: 'PerpetualManualLineModal' })

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  contractId: {
    type: String,
    default: ''
  },
  contractLabel: {
    type: String,
    default: ''
  },
  basePrice: {
    type: Number,
    default: 0
  },
  lastRefreshAt: {
    type: String,
    default: ''
  },
  metrics: {
    type: Object,
    default: () => ({
      volume: '-',
      users: '-',
      long: '-',
      short: '-',
      net: '-',
      ratio: '-',
      platformPnl: '-'
    })
  },
  initialConfig: {
    type: Object,
    default: () => ({})
  },
  initialDurationSec: {
    type: Number,
    default: 1800
  },
  allowRemove: {
    type: Boolean,
    default: false
  },
  isManualActive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save', 'remove'])

const form = reactive({
  priceOffset: 5,
  offsetDirection: PERP_CONTROL_OFFSET_DIRECTION.AGAINST,
  slippagePct: 0.,
  latencyMs: 80,
  durationSec: 1800
})

const quickManualInputs = {
  priceOffset: [0, 2, 5, 10, 15],
  slippagePct: [0, 0.1, 0.2, 0.3, 0.5],
  latencyMs: [0, 50, 100, 200, 500],
  durationSec: [0, 300, 900, 1800, 3600, 7200]
}

const applyQuick = (key, value) => {
  if (key === 'priceOffset') form.priceOffset = Number(value)
  if (key === 'slippagePct') form.slippagePct = Number(value)
  if (key === 'latencyMs') form.latencyMs = Number(value)
  if (key === 'durationSec') form.durationSec = Number(value)
}

const parseCompactUsd = (raw) => {
  if (raw == null) return 0
  const text = String(raw).trim().replaceAll(',', '')
  if (!text) return 0
  let sign = 1
  let s = text
  if (s.startsWith('+')) {
    sign = 1
    s = s.slice(1)
  } else if (s.startsWith('-')) {
    sign = -1
    s = s.slice(1)
  }
  if (s.startsWith('$')) s = s.slice(1)
  const unit = s.slice(-1).toUpperCase()
  const base = Number(unit === 'K' || unit === 'M' || unit === 'B' ? s.slice(0, -1) : s)
  if (!Number.isFinite(base)) return 0
  const scale = unit === 'K' ? 1e3 : unit === 'M' ? 1e6 : unit === 'B' ? 1e9 : 1
  return sign * base * scale
}

const initFromProps = () => {
  const cfg = props.initialConfig || {}
  form.priceOffset = Number(cfg.priceOffset ?? 5)
  form.offsetDirection = cfg.offsetDirection ?? PERP_CONTROL_OFFSET_DIRECTION.AGAINST
  form.slippagePct = Number(cfg.slippagePct ?? 0.2)
  form.latencyMs = Number(cfg.latencyMs ?? 80)
  form.durationSec = Number(props.initialDurationSec ?? 1800)
}

watch(
  () => [props.open, props.contractId],
  ([open]) => {
    if (open) initFromProps()
  },
  { immediate: true }
)

const manualOffsetDirectionLabel = computed(() => {
  const map = {
    [PERP_CONTROL_OFFSET_DIRECTION.AGAINST]: '逆势',
    [PERP_CONTROL_OFFSET_DIRECTION.FOLLOW]: '顺势',
    [PERP_CONTROL_OFFSET_DIRECTION.RANDOM]: '随机',
    [PERP_CONTROL_OFFSET_DIRECTION.UP]: '向上',
    [PERP_CONTROL_OFFSET_DIRECTION.DOWN]: '向下'
  }
  return map[form.offsetDirection] || '随机'
})

const manualPreview = computed(() => {
  const basePrice = Number(props.basePrice || 0)
  const offset = Number(form.priceOffset || 0)
  const slippage = Number(form.slippagePct || 0) / 100
  const orderAmount = 10000
  const baseAmount = basePrice > 0 ? orderAmount / basePrice : 0

  let buyBase = basePrice
  let sellBase = basePrice

  if (form.offsetDirection === PERP_CONTROL_OFFSET_DIRECTION.AGAINST) {
    buyBase = basePrice + offset
    sellBase = basePrice - offset
  } else if (form.offsetDirection === PERP_CONTROL_OFFSET_DIRECTION.FOLLOW) {
    buyBase = basePrice - offset
    sellBase = basePrice + offset
  } else if (form.offsetDirection === PERP_CONTROL_OFFSET_DIRECTION.UP) {
    buyBase = basePrice + offset
    sellBase = basePrice + offset
  } else if (form.offsetDirection === PERP_CONTROL_OFFSET_DIRECTION.DOWN) {
    buyBase = basePrice - offset
    sellBase = basePrice - offset
  }

  const buySlippage = buyBase * slippage
  const sellSlippage = sellBase * slippage
  const buyPrice = buyBase + buySlippage
  const sellPrice = sellBase - sellSlippage

  const priceOffsetCost = Math.abs((buyBase - basePrice) + (basePrice - sellBase)) * baseAmount / 2
  const slippageCost = (buySlippage + sellSlippage) * baseAmount / 2
  const totalExtraCost = priceOffsetCost + slippageCost
  const totalExtraCostPct = orderAmount > 0 ? (totalExtraCost / orderAmount) * 100 : 0

  return {
    basePrice,
    buyPrice,
    sellPrice,
    priceOffsetCost,
    slippageCost,
    totalExtraCost,
    totalExtraCostPct
  }
})

const close = () => emit('close')
const save = () =>
  emit('save', {
    contractId: props.contractId,
    payload: {
      priceOffset: Number(form.priceOffset || 0),
      offsetDirection: form.offsetDirection,
      slippagePct: Number(form.slippagePct || 0),
      latencyMs: Number(form.latencyMs || 0),
      durationSec: Number(form.durationSec || 0)
    }
  })
const remove = () => emit('remove', { contractId: props.contractId })

const netPositive = computed(() => parseCompactUsd(props.metrics?.net) >= 0)
const platformPnlPositive = computed(() => parseCompactUsd(props.metrics?.platformPnl) >= 0)
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" @click.self="close">
    <section class="flex h-[88vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
      <div class="flex w-3/5 flex-col border-r border-slate-200">
        <header class="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-rose-50 to-amber-50 px-6 py-4">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">手动插线</h2>
            <p class="mt-0.5 text-xs text-slate-500">
              对 {{ contractId || '-' }} 快速应用线控参数，可设置到期自动恢复
              <span v-if="contractLabel" class="ml-2 text-slate-400">{{ contractLabel }}</span>
            </p>
          </div>
          <button type="button" class="text-2xl text-slate-400 hover:text-slate-600 transition-colors" @click="close">×</button>
        </header>

        <div class="flex-1 space-y-5 overflow-y-auto px-6 py-5">
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
                  <input v-model.number="form.priceOffset" type="number" min="0" max="50" class="ant-input !w-20 !h-8 !px-2 !text-right" />
                </div>
                <input v-model.number="form.priceOffset" type="range" min="0" max="50" step="1" class="w-full accent-blue-600" />
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="v in quickManualInputs.priceOffset"
                    :key="`q-offset-${v}`"
                    type="button"
                    class="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    @click="applyQuick('priceOffset', v)"
                  >
                    {{ v }}
                  </button>
                </div>
              </label>

              <label class="block space-y-2">
                <span class="text-sm font-medium text-slate-700">偏移方向</span>
                <select v-model="form.offsetDirection" class="ant-select">
                  <option :value="PERP_CONTROL_OFFSET_DIRECTION.AGAINST">逆势</option>
                  <option :value="PERP_CONTROL_OFFSET_DIRECTION.FOLLOW">顺势</option>
                  <option :value="PERP_CONTROL_OFFSET_DIRECTION.RANDOM">随机</option>
                  <option :value="PERP_CONTROL_OFFSET_DIRECTION.UP">向上</option>
                  <option :value="PERP_CONTROL_OFFSET_DIRECTION.DOWN">向下</option>
                </select>
                <div class="text-xs text-slate-500">
                  备注：逆势=买价上调/卖价下调；顺势=买价下调/卖价上调；向上/向下=买卖同向偏移；随机=系统随机选择方向
                </div>
              </label>
            </div>
          </section>

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
                  <span class="font-medium text-slate-700">滑点 (%)</span>
                  <input v-model.number="form.slippagePct" type="number" min="0" max="2" step="0.01" class="ant-input !w-20 !h-8 !px-2 !text-right" />
                </div>
                <input v-model.number="form.slippagePct" type="range" min="0" max="2" step="0.01" class="w-full accent-violet-600" />
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="v in quickManualInputs.slippagePct"
                    :key="`q-slip-${v}`"
                    type="button"
                    class="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    @click="applyQuick('slippagePct', v)"
                  >
                    {{ v }}%
                  </button>
                </div>
              </label>

              <label class="block space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium text-slate-700">成交延迟 (ms)</span>
                  <input v-model.number="form.latencyMs" type="number" min="0" max="5000" step="10" class="ant-input !w-20 !h-8 !px-2 !text-right" />
                </div>
                <input v-model.number="form.latencyMs" type="range" min="0" max="5000" step="10" class="w-full accent-violet-600" />
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="v in quickManualInputs.latencyMs"
                    :key="`q-lat-${v}`"
                    type="button"
                    class="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    @click="applyQuick('latencyMs', v)"
                  >
                    {{ v }}ms
                  </button>
                </div>
              </label>
            </div>
          </section>

          <section class="space-y-4 rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
                <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-base font-semibold text-slate-900">持续时间</h3>
                <p class="text-xs text-slate-600">到期自动恢复（0=持续生效）</p>
              </div>
            </div>

            <div class="space-y-4 rounded-lg bg-white p-4">
              <label class="block space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium text-slate-700">持续时间 (秒)</span>
                  <input v-model.number="form.durationSec" type="number" min="0" step="1" class="ant-input !w-24 !h-8 !px-2 !text-right" />
                </div>
                <input v-model.number="form.durationSec" type="range" min="0" max="7200" step="60" class="w-full accent-amber-600" />
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="v in quickManualInputs.durationSec"
                    :key="`q-dur-${v}`"
                    type="button"
                    class="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    @click="applyQuick('durationSec', v)"
                  >
                    {{ v === 0 ? '持续' : `${v}s` }}
                  </button>
                </div>
              </label>
            </div>
          </section>
        </div>

        <footer class="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button v-if="allowRemove && isManualActive" type="button" class="ant-btn !h-10 !px-6" @click="remove">解除手动</button>
          <button type="button" class="ant-btn !h-10 !px-6" @click="close">取消</button>
          <button type="button" class="ant-btn ant-btn-primary !h-10 !px-8" @click="save">保存并生效</button>
        </footer>
      </div>

      <div class="flex w-2/5 flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        <header class="border-b border-slate-200 px-5 py-4">
          <h3 class="text-lg font-semibold text-slate-900">实时预览</h3>
          <p class="mt-0.5 text-xs text-slate-500">参数变化即时反映到价格与成本估算</p>
        </header>

        <div class="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-slate-900">配置概览</h4>
              <span class="rounded-md px-2 py-1 text-xs font-medium bg-rose-100 text-rose-700">手动插线</span>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              <span class="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">偏移 {{ Number(form.priceOffset || 0) }} 点</span>
              <span class="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">方向 {{ manualOffsetDirectionLabel }}</span>
              <span class="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">滑点 {{ Number(form.slippagePct || 0).toFixed(2) }}%</span>
              <span class="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">延迟 {{ Number(form.latencyMs || 0) }}ms</span>
              <span class="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                {{ Number(form.durationSec || 0) === 0 ? '持续生效' : `持续 ${Number(form.durationSec || 0)}s` }}
              </span>
            </div>
          </div>

          <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-slate-900">实时数据</h4>
              <span class="text-xs text-slate-500">更新：{{ lastRefreshAt || '-' }}</span>
            </div>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <div class="rounded-lg bg-slate-50 p-3">
                <p class="text-xs font-semibold text-slate-500">24h交易量</p>
                <p class="mt-1 text-base font-bold text-slate-900">{{ metrics.volume }}</p>
              </div>
              <div class="rounded-lg bg-slate-50 p-3">
                <p class="text-xs font-semibold text-slate-500">活跃用户</p>
                <p class="mt-1 text-base font-bold text-slate-900">{{ metrics.users }}</p>
              </div>
              <div class="rounded-lg bg-slate-50 p-3">
             
                <p class="text-xs font-semibold text-slate-500">平台盈亏</p>
                <p class="mt-1 text-sm font-bold">
                  <span :class="platformPnlPositive ? 'text-emerald-600' : 'text-rose-600'">
                    {{ metrics.platformPnl }}
                  </span>
                </p>
              </div>
              <div class="rounded-lg bg-slate-50 p-3">
                <p class="text-xs font-semibold text-slate-500">多空比</p>
                <p class="mt-1 text-base font-bold text-slate-900">{{ metrics.ratio }}</p>
              </div>
              <div class="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                   <p class="text-xs font-semibold text-slate-500">持仓(做多/做空/净持仓)</p>
                <p class="mt-1 text-sm font-bold text-slate-900">
                  {{ metrics.long }} /
                  {{ metrics.short }} /
                  <span :class="netPositive ? 'text-emerald-600' : 'text-rose-600'">
                    {{ metrics.net }}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h4 class="text-sm font-semibold text-slate-900">价格预览</h4>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <div class="rounded-lg bg-slate-50 p-3">
                <p class="text-xs font-semibold text-slate-500">市场价</p>
                <p class="mt-1 text-lg font-bold text-slate-900">${{ manualPreview.basePrice.toLocaleString() }}</p>
              </div>
              <div class="rounded-lg bg-slate-50 p-3">
                <p class="text-xs font-semibold text-slate-500">买入价 (含滑点)</p>
                <p class="mt-1 text-lg font-bold text-slate-900">${{ manualPreview.buyPrice.toFixed(2) }}</p>
              </div>
              <div class="rounded-lg bg-slate-50 p-3">
                <p class="text-xs font-semibold text-slate-500">卖出价 (含滑点)</p>
                <p class="mt-1 text-lg font-bold text-slate-900">${{ manualPreview.sellPrice.toFixed(2) }}</p>
              </div>
              <div class="rounded-lg bg-slate-50 p-3">
                <p class="text-xs font-semibold text-slate-500">成交延迟</p>
                <p class="mt-1 text-lg font-bold text-slate-900">{{ Number(form.latencyMs || 0) }} ms</p>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h4 class="text-sm font-semibold text-slate-900">成本估算</h4>
            <p class="mt-1 text-xs text-slate-500">按 10,000 USDT 订单金额估算</p>
            <div class="mt-3 space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-600">偏移成本</span>
                <span class="font-semibold text-slate-900">${{ manualPreview.priceOffsetCost.toFixed(2) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-600">滑点成本</span>
                <span class="font-semibold text-slate-900">${{ manualPreview.slippageCost.toFixed(2) }}</span>
              </div>
              <div class="h-px bg-slate-200" />
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-700 font-semibold">合计</span>
                <span class="font-bold text-slate-900">${{ manualPreview.totalExtraCost.toFixed(2) }}（{{ manualPreview.totalExtraCostPct.toFixed(2) }}%）</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
