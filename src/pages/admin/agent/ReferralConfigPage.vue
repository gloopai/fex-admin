<script setup>
import { ref, onMounted } from 'vue'
import { mockReferralConfig, referralApi } from '../../../admin/mock/referral'
import { DEFAULT_REFERRAL_CONFIG } from '../../../admin/constants/referral'

const config = ref({ ...mockReferralConfig })
const isSaving = ref(false)
const demoBaseAmount = ref(10000)

const PRODUCT_LINES = [
  {
    key: 'deposit',
    enabledKey: 'commissionDepositEnabled',
    ratesKey: 'depositCommissionRates',
    title: '充值',
    baseDesc: '计佣基数 A = 单次充值到账金额（USDT）',
    formula: '佣金ᵢ = 充值金额 A × rᵢ',
    firstDepositExtra: true,
    theme: 'blue'
  },
  {
    key: 'perpetual',
    enabledKey: 'commissionPerpetualEnabled',
    ratesKey: 'perpetualCommissionRates',
    title: '永续合约',
    baseDesc: '计佣基数 A = 该笔永续订单手续费或成交额（以业务规则为准，USDT）',
    formula: '佣金ᵢ = 计佣基数 A × rᵢ',
    theme: 'indigo'
  },
  {
    key: 'delivery',
    enabledKey: 'commissionDeliveryEnabled',
    ratesKey: 'deliveryCommissionRates',
    title: '交割合约',
    baseDesc: '计佣基数 A = 该笔交割订单参与分佣的金额（USDT）',
    formula: '佣金ᵢ = 计佣基数 A × rᵢ',
    theme: 'violet'
  },
  {
    key: 'spot',
    enabledKey: 'commissionSpotEnabled',
    ratesKey: 'spotCommissionRates',
    title: '现货',
    baseDesc: '计佣基数 A = 该笔现货订单手续费或成交额（以业务规则为准，USDT）',
    formula: '佣金ᵢ = 计佣基数 A × rᵢ',
    theme: 'orange'
  },
  {
    key: 'aiQuant',
    enabledKey: 'commissionAiQuantEnabled',
    ratesKey: 'aiQuantCommissionRates',
    title: 'AI 量化',
    baseDesc: '计佣基数 A = AI 量化订单参与分佣的金额（USDT）',
    formula: '佣金ᵢ = 计佣基数 A × rᵢ',
    theme: 'amber'
  },
  {
    key: 'lending',
    enabledKey: 'commissionLendingEnabled',
    ratesKey: 'lendingCommissionRates',
    title: '理财产品',
    baseDesc: '计佣基数 A = 理财订单计佣本金或结算基数（USDT）',
    formula: '佣金ᵢ = 计佣基数 A × rᵢ',
    theme: 'emerald'
  },
  {
    key: 'borrowing',
    enabledKey: 'commissionBorrowingEnabled',
    ratesKey: 'borrowingCommissionRates',
    title: '借贷产品',
    baseDesc: '计佣基数 A = 抵押借贷订单计佣本金或利息基数（以业务规则为准，USDT）',
    formula: '佣金ᵢ = 计佣基数 A × rᵢ',
    theme: 'rose'
  }
]

/** 分组展示，阅读顺序更清晰 */
const PRODUCT_GROUPS = [
  {
    id: 'fund',
    name: '入金',
    blurb: '用户链上 / 站内充值',
    lineKeys: ['deposit']
  },
  {
    id: 'trade',
    name: '交易',
    blurb: '合约与现货订单',
    lineKeys: ['perpetual', 'delivery', 'spot']
  },
  {
    id: 'fin',
    name: '产品与策略',
    blurb: '量化、理财、借贷',
    lineKeys: ['aiQuant', 'lending', 'borrowing']
  }
]

const BORDER_ACCENT = {
  blue: 'border-l-blue-500',
  indigo: 'border-l-indigo-500',
  violet: 'border-l-violet-500',
  orange: 'border-l-orange-500',
  amber: 'border-l-amber-500',
  emerald: 'border-l-emerald-500',
  rose: 'border-l-rose-500'
}

function lineByKey(key) {
  return PRODUCT_LINES.find((p) => p.key === key)
}

function linesInGroup(group) {
  return group.lineKeys.map((k) => lineByKey(k)).filter(Boolean)
}

/** 全宽布局下按每组卡片数量拉满列数 */
function groupGridClass(group) {
  const n = group.lineKeys.length
  if (n <= 1) return 'grid-cols-1'
  if (n === 2) return 'grid-cols-1 md:grid-cols-2'
  return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
}

function parseRatesString(str) {
  if (!str || typeof str !== 'string' || !str.trim()) return []
  return str
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => parseFloat(v))
    .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 1)
}

function ratesFor(line) {
  return parseRatesString(config.value[line.ratesKey])
}

function formatUsdt(n) {
  const x = Number(n)
  if (Number.isNaN(x)) return '—'
  return x.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function commissionPreviewLines(rates, base) {
  const b = Number(base)
  if (Number.isNaN(b) || b <= 0) return []
  return rates.map((r, i) => ({
    level: i + 1,
    rate: r,
    ratePct: (r * 100).toFixed(2),
    commission: b * r
  }))
}

function isLineEnabled(line) {
  return config.value[line.enabledKey] === true
}

function toggleLine(line) {
  config.value[line.enabledKey] = !config.value[line.enabledKey]
}

const loadConfig = async () => {
  try {
    const result = await referralApi.getReferralConfig()
    if (result.success) {
      config.value = result.data
    }
  } catch (error) {
    console.error('Failed to load config:', error)
  }
}

const saveConfig = async () => {
  const validateRates = (rates) => {
    if (!rates || !String(rates).trim()) return true
    const values = String(rates)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
    return values.every((v) => {
      const num = parseFloat(v)
      return !Number.isNaN(num) && num >= 0 && num <= 1
    })
  }

  for (const line of PRODUCT_LINES) {
    if (!config.value[line.enabledKey]) continue
    const rates = config.value[line.ratesKey]
    if (!rates || !String(rates).trim()) {
      alert(`「${line.title}」已开启记佣，请填写多级比例，或关闭该业务线的记佣开关。`)
      return
    }
    if (!validateRates(rates)) {
      alert(`「${line.title}」佣金比例格式错误：请输入 0～1 之间的小数，多级用英文逗号分隔。`)
      return
    }
  }

  for (const line of PRODUCT_LINES) {
    if (config.value[line.enabledKey]) continue
    const rates = config.value[line.ratesKey]
    if (rates && String(rates).trim() && !validateRates(rates)) {
      alert(`「${line.title}」比例格式有误，请修正或清空。`)
      return
    }
  }

  isSaving.value = true
  try {
    const result = await referralApi.updateReferralConfig(config.value)
    if (result.success) {
      alert(result.message)
    }
  } catch (error) {
    alert('保存失败：' + error.message)
  } finally {
    isSaving.value = false
  }
}

const resetConfig = () => {
  if (confirm('确认重置为默认配置？')) {
    config.value = { ...DEFAULT_REFERRAL_CONFIG }
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<template>
  <div class="w-full min-w-0 space-y-8 pb-8">
    <!-- 页头 -->
    <header class="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0 flex-1">
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">裂变分销设置</h1>
        <p class="mt-2 text-sm leading-relaxed text-slate-600">
          配置步骤：<span class="font-medium text-slate-800">① 理解计佣公式</span> →
          <span class="font-medium text-slate-800">② 设置全局规则</span> →
          <span class="font-medium text-slate-800">③ 按产品线打开记佣并填写多级比例</span>。
        </p>
      </div>
      <div class="flex shrink-0 gap-2">
        <button type="button" class="ant-btn" @click="resetConfig">重置为默认</button>
        <button type="button" class="ant-btn ant-btn-primary" :disabled="isSaving" @click="saveConfig">
          {{ isSaving ? '保存中…' : '保存配置' }}
        </button>
      </div>
    </header>

    <!-- ① 公式说明 -->
    <section class="rounded-xl border border-slate-200 bg-white">
      <div class="flex items-baseline gap-2 border-b border-slate-100 px-5 py-4">
        <span class="text-xs font-semibold text-slate-400">①</span>
        <h2 class="text-base font-semibold text-slate-900">计佣公式</h2>
      </div>
      <div class="grid gap-6 p-5 lg:grid-cols-2 lg:gap-8">
        <div class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">核心式</p>
          <p class="mt-3 font-mono text-sm leading-relaxed text-slate-900">
            第 i 级上级佣金
            <span class="block pt-2 text-base">
              <span class="text-violet-600">佣金ᵢ</span>
              <span class="mx-2 text-slate-400">=</span>
              <span class="text-sky-600">A</span>
              <span class="mx-2 text-slate-400">×</span>
              <span class="text-emerald-600">rᵢ</span>
            </span>
          </p>
          <p class="mt-3 text-xs leading-relaxed text-slate-600">
            <strong class="text-slate-700">A</strong>：本条订单的计佣基数（各产品线含义见下方卡片）。<br />
            <strong class="text-slate-700">rᵢ</strong>：配置里从左数第 i 个比例，取值 0～1（如 0.1 = 10%）。
          </p>
        </div>
        <div class="text-sm leading-relaxed text-slate-600">
          <p class="font-medium text-slate-800">操作要点</p>
          <ul class="mt-3 space-y-2.5">
            <li class="flex gap-2">
              <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              <span>每条产品线可单独<strong class="text-slate-800">关闭记佣</strong>；关闭后该业务不产生裂变佣金（比例可保留）。</span>
            </li>
            <li class="flex gap-2">
              <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              <span>多级比例用<strong class="text-slate-800">英文逗号</strong>分隔，依次为一级、二级、三级…</span>
            </li>
            <li class="flex gap-2">
              <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              <span>下方「示例」用同一假设基数，仅便于核对公式，实际以订单为准。</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ② 全局规则 -->
    <section class="rounded-xl border border-slate-200 bg-white">
      <div class="flex items-baseline gap-2 border-b border-slate-100 px-5 py-4">
        <span class="text-xs font-semibold text-slate-400">②</span>
        <h2 class="text-base font-semibold text-slate-900">全局规则</h2>
      </div>
      <div class="divide-y divide-slate-100">
        <div class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm font-medium text-slate-900">自动执行分佣</p>
            <p class="mt-1 text-sm text-slate-500">满足条件时系统自动计算并发放；关闭则需人工处理分佣记录。</p>
          </div>
          <button
            type="button"
            :class="config.autoExecute ? 'bg-blue-600' : 'bg-slate-200'"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none"
            @click="config.autoExecute = !config.autoExecute"
          >
            <span
              :class="config.autoExecute ? 'translate-x-5' : 'translate-x-0'"
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition"
            />
          </button>
        </div>
        <div class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm font-medium text-slate-900">仅首笔充值参与分销</p>
            <p class="mt-1 text-sm text-slate-500">仅影响「充值」产品线：开启后只对用户首次成功充值按该线比例计佣。</p>
          </div>
          <button
            type="button"
            :class="config.depositFirstOnly ? 'bg-blue-600' : 'bg-slate-200'"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none"
            @click="config.depositFirstOnly = !config.depositFirstOnly"
          >
            <span
              :class="config.depositFirstOnly ? 'translate-x-5' : 'translate-x-0'"
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition"
            />
          </button>
        </div>
      </div>
    </section>

    <!-- ③ 产品线 -->
    <section class="rounded-xl border border-slate-200 bg-white">
      <div class="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-baseline gap-2">
          <span class="text-xs font-semibold text-slate-400">③</span>
          <div>
            <h2 class="text-base font-semibold text-slate-900">产品线记佣</h2>
            <p class="mt-0.5 text-sm text-slate-500">按分组找到业务 → 打开「参与记佣」→ 填写多级比例。</p>
          </div>
        </div>
        <div class="flex flex-col gap-1 sm:items-end">
          <label class="flex items-center gap-2 text-sm text-slate-600">
            <span class="whitespace-nowrap">示例基数（USDT）</span>
            <input
              v-model.number="demoBaseAmount"
              type="number"
              min="0"
              step="100"
              class="ant-input w-36 text-right"
            />
          </label>
          <span class="text-xs text-slate-400">下方各线「示例佣金」均按此基数 × rᵢ 计算</span>
        </div>
      </div>

      <div class="space-y-10 p-5">
        <div v-for="group in PRODUCT_GROUPS" :key="group.id">
          <div class="mb-4 flex flex-wrap items-end gap-2 border-b border-slate-100 pb-2">
            <h3 class="text-sm font-semibold text-slate-900">{{ group.name }}</h3>
            <span class="text-xs text-slate-500">{{ group.blurb }}</span>
          </div>

          <div class="grid w-full gap-4" :class="groupGridClass(group)">
            <div
              v-for="line in linesInGroup(group)"
              :key="line.key"
              class="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
              :class="['border-l-4', BORDER_ACCENT[line.theme]]"
            >
              <div class="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-3">
                <div class="min-w-0">
                  <h4 class="text-sm font-semibold text-slate-900">{{ line.title }}</h4>
                  <p class="mt-1 text-xs leading-snug text-slate-600">{{ line.baseDesc }}</p>
                </div>
                <div class="flex shrink-0 flex-col items-end gap-0.5">
                  <span class="text-[10px] font-medium uppercase tracking-wide text-slate-400">记佣</span>
                  <button
                    type="button"
                    :class="isLineEnabled(line) ? 'bg-blue-600' : 'bg-slate-200'"
                    class="relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none"
                    @click="toggleLine(line)"
                  >
                    <span
                      :class="isLineEnabled(line) ? 'translate-x-5' : 'translate-x-0'"
                      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition"
                    />
                  </button>
                </div>
              </div>

              <div class="flex flex-1 flex-col p-4" :class="{ 'bg-slate-50/40': !isLineEnabled(line) }">
                <div class="rounded border border-slate-100 bg-white px-3 py-2 font-mono text-[11px] leading-relaxed text-slate-700">
                  {{ line.formula }}
                  <span v-if="line.firstDepositExtra && line.key === 'deposit'" class="mt-1 block text-slate-500">
                    若已开「仅首笔充值」，仅首充成功订单取 A。
                  </span>
                </div>

                <template v-if="isLineEnabled(line)">
                  <label class="mt-4 block text-xs font-medium text-slate-700">多级比例（0～1，逗号分隔）</label>
                  <input
                    v-model="config[line.ratesKey]"
                    type="text"
                    class="ant-input mt-1.5 w-full text-sm"
                    placeholder="例：0.1, 0.05, 0.03"
                  />

                  <template v-if="ratesFor(line).length">
                    <div class="mt-4 space-y-2">
                      <p class="text-[11px] font-medium text-slate-500">比例预览</p>
                      <div class="flex flex-wrap gap-1.5">
                        <span
                          v-for="(rate, index) in ratesFor(line)"
                          :key="line.key + '-r-' + index"
                          class="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                        >
                          {{ index + 1 }} 级 {{ (rate * 100).toFixed(2) }}%
                        </span>
                      </div>
                      <div class="rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-slate-800">
                        <p class="font-medium text-slate-700">示例 · 基数 {{ formatUsdt(demoBaseAmount) }} USDT</p>
                        <ul class="mt-1.5 space-y-0.5 font-mono text-[11px]">
                          <li
                            v-for="row in commissionPreviewLines(ratesFor(line), demoBaseAmount)"
                            :key="line.key + '-ex-' + row.level"
                          >
                            {{ row.level }} 级上级：{{ formatUsdt(row.commission) }} USDT
                          </li>
                        </ul>
                      </div>
                    </div>
                  </template>
                  <p v-else class="mt-3 text-xs text-amber-700">已开启记佣，请填写比例。</p>
                </template>
                <p v-else class="mt-3 text-sm text-slate-500">未参与记佣，不产生裂变佣金。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 底部说明 -->
    <footer class="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
      <p class="font-medium text-slate-800">保存前请确认</p>
      <ul class="mt-2 list-inside list-disc space-y-1 text-slate-600">
        <li>已开启记佣的产品线必须填写至少一级比例，否则会提示无法保存。</li>
        <li>比例为 0～1 的小数；关闭记佣后已填比例可保留，但不会参与结算。</li>
      </ul>
    </footer>
  </div>
</template>

<style scoped>
button:focus {
  outline: none;
}
</style>
