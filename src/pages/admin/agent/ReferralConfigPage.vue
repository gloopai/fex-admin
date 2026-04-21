<script setup>
import { ref, onMounted } from 'vue'
import {
  mockReferralConfig,
  referralApi,
  normalizeReferralConfig,
  normalizeCommissionRatesTriple
} from '../../../admin/mock/referral'
import {
  DEFAULT_REFERRAL_CONFIG,
  REFERRAL_MAX_LEVELS,
  REFERRAL_COMMISSION_CREDIT_TO_OPTIONS
} from '../../../admin/constants/referral'

const config = ref(normalizeReferralConfig({ ...mockReferralConfig }))
/** 分佣规则 | 资金入账 */
const activeTab = ref('rules')

const RATE_LEVEL_INDEXES = [0, 1, 2]
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

/** 固定三级，每项为 0～1 */
function parseRatesString(str) {
  const normalized = normalizeCommissionRatesTriple(str)
  return normalized.split(',').map((v) => parseFloat(v))
}

function ratesFor(line) {
  return parseRatesString(config.value[line.ratesKey])
}

function clampRate01(n) {
  if (!Number.isFinite(n) || Number.isNaN(n)) return 0
  return Math.max(0, Math.min(1, n))
}

function setRateAt(line, index, raw) {
  const parts = parseRatesString(config.value[line.ratesKey])
  const v = raw == null ? '' : String(raw).trim()
  let n = parseFloat(v)
  if (v === '' || Number.isNaN(n)) n = 0
  parts[index] = clampRate01(n)
  config.value[line.ratesKey] = parts.join(',')
}

function formatUsdt(n) {
  const x = Number(n)
  if (Number.isNaN(x)) return '—'
  return x.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function commissionPreviewLines(rates, base) {
  const b = Number(base)
  if (Number.isNaN(b) || b <= 0) return []
  const triple = rates.slice(0, REFERRAL_MAX_LEVELS)
  while (triple.length < REFERRAL_MAX_LEVELS) triple.push(0)
  return triple.map((r, i) => ({
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
      config.value = normalizeReferralConfig(result.data)
    }
  } catch (error) {
    console.error('Failed to load config:', error)
  }
}

const saveConfig = async () => {
  const validateTriple = (ratesStr) => {
    const triple = parseRatesString(ratesStr)
    return (
      triple.length === REFERRAL_MAX_LEVELS &&
      triple.every((n) => !Number.isNaN(n) && n >= 0 && n <= 1)
    )
  }

  for (const line of PRODUCT_LINES) {
    if (!config.value[line.enabledKey]) continue
    const rates = normalizeCommissionRatesTriple(config.value[line.ratesKey])
    config.value[line.ratesKey] = rates
    if (!validateTriple(rates)) {
      alert(`「${line.title}」已开启记佣：一级 / 二级 / 三级比例须均为 0～1 之间的小数。`)
      return
    }
  }

  for (const line of PRODUCT_LINES) {
    if (config.value[line.enabledKey]) continue
    const raw = config.value[line.ratesKey]
    if (raw != null && String(raw).trim() && !validateTriple(normalizeCommissionRatesTriple(raw))) {
      alert(`「${line.title}」比例格式有误，请修正或清空。`)
      return
    }
  }

  const payload = normalizeReferralConfig({ ...config.value })

  isSaving.value = true
  try {
    const result = await referralApi.updateReferralConfig(payload)
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
    config.value = normalizeReferralConfig({ ...DEFAULT_REFERRAL_CONFIG })
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
          邀请链分佣比例、全局开关与佣金入账位置。使用下方 Tab 切换。
        </p>
      </div>
      <div class="flex shrink-0 gap-2">
        <button type="button" class="ant-btn" @click="resetConfig">重置为默认</button>
        <button type="button" class="ant-btn ant-btn-primary" :disabled="isSaving" @click="saveConfig">
          {{ isSaving ? '保存中…' : '保存配置' }}
        </button>
      </div>
    </header>

    <nav class="flex gap-0 border-b border-slate-200" aria-label="裂变分销设置分区">
      <button
        type="button"
        class="border-b-2 px-4 py-3 text-sm font-medium transition-colors -mb-px"
        :class="
          activeTab === 'rules'
            ? 'border-blue-600 text-blue-700'
            : 'border-transparent text-slate-500 hover:text-slate-800'
        "
        @click="activeTab = 'rules'"
      >
        分佣规则
      </button>
      <button
        type="button"
        class="border-b-2 px-4 py-3 text-sm font-medium transition-colors -mb-px"
        :class="
          activeTab === 'settlement'
            ? 'border-blue-600 text-blue-700'
            : 'border-transparent text-slate-500 hover:text-slate-800'
        "
        @click="activeTab = 'settlement'"
      >
        资金入账
      </button>
    </nav>

    <div v-show="activeTab === 'rules'" class="space-y-8">
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
            <strong class="text-slate-700">rᵢ</strong>：第 i 级上级对应比例（i 为 1～3），取值 0～1（如 0.1 = 10%）。
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
              <span>每条产品线固定<strong class="text-slate-800">三个比例</strong>：一级、二级、三级上级；某级可为 0。</span>
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
        <h2 class="text-base font-semibold text-slate-900">裂变全局规则</h2>
        <p class="mt-1 text-xs text-slate-500">以下开关仅作用于邀请链分佣。</p>
      </div>
      <div class="divide-y divide-slate-100">
        <div class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm font-medium text-slate-900">自动执行裂变分佣</p>
            <p class="mt-1 text-sm text-slate-500">满足条件时系统自动计算并发放邀请链佣金；关闭则需人工处理分佣记录。</p>
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
            <p class="text-sm font-medium text-slate-900">仅首笔充值参与裂变分佣</p>
            <p class="mt-1 text-sm text-slate-500">仅影响「充值」产品线的邀请链计佣：开启后只对被邀请用户首次成功充值按该线比例计佣。</p>
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
            <h2 class="text-base font-semibold text-slate-900">产品线 · 邀请链记佣</h2>
            <p class="mt-0.5 text-sm text-slate-500">按邀请关系为三级上级设置分佣比例。</p>
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
                  <p class="mt-4 text-xs font-medium text-slate-700">三级比例（0～1，可为 0）</p>
                  <div class="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <label
                      v-for="idx in RATE_LEVEL_INDEXES"
                      :key="line.key + '-lvl-' + idx"
                      :for="line.key + '-rate-' + idx"
                      class="block"
                    >
                      <span class="text-xs text-slate-600">{{ idx + 1 }} 级上级</span>
                      <input
                        :id="line.key + '-rate-' + idx"
                        type="number"
                        min="0"
                        max="1"
                        step="0.001"
                        class="ant-input mt-1 w-full text-sm"
                        :value="ratesFor(line)[idx]"
                        @input="setRateAt(line, idx, $event.target.value)"
                      />
                    </label>
                  </div>

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
                <p v-else class="mt-3 text-sm text-slate-500">未参与记佣，不产生裂变佣金。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <footer class="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
      <p class="font-medium text-slate-800">保存前请确认</p>
      <ul class="mt-2 list-inside list-disc space-y-1 text-slate-600">
        <li>已开启记佣的产品线须填写一级、二级、三级比例（均为 0～1，某级可为 0）。</li>
        <li>裂变分销固定三级；入账、日结时刻与结算后通知请在「资金入账」Tab 配置。</li>
      </ul>
    </footer>
    </div>

    <div v-show="activeTab === 'settlement'" class="space-y-6">
      <section class="rounded-xl border border-slate-200 bg-white">
        <div class="border-b border-slate-100 px-5 py-4">
          <h2 class="text-base font-semibold text-slate-900">资金入账</h2>
          <p class="mt-1 text-sm text-slate-500">
            保存后，在「分佣记录」中执行发放时将按此处写入入账快照；日结按每自然日、在下方指定时刻触发（平台默认时区）。
          </p>
        </div>
        <div class="max-w-md space-y-5 p-5">
          <div>
            <label class="block text-sm font-medium text-slate-800">入账位置</label>
            <select v-model="config.referralCommissionCreditTo" class="ant-input mt-2 w-full text-sm">
              <option
                v-for="opt in REFERRAL_COMMISSION_CREDIT_TO_OPTIONS"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
            <p class="mt-1.5 text-xs leading-relaxed text-slate-500">
              {{
                REFERRAL_COMMISSION_CREDIT_TO_OPTIONS.find((o) => o.value === config.referralCommissionCreditTo)
                  ?.hint
              }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-800">日结时刻</label>
            <p class="mt-1 text-xs text-slate-500">结算周期固定为每自然日，请选择当日执行日结的时间（24 小时制，与平台默认时区一致）。</p>
            <input
              v-model="config.referralSettlementTimeLocal"
              type="time"
              step="60"
              class="ant-input mt-2 w-full max-w-[12rem] text-sm"
            />
          </div>
          <div class="rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-3">
            <p class="text-sm font-medium text-slate-800">结算完成后通知用户</p>
            <p class="mt-1 text-xs text-slate-500">日结入账完成后，按勾选渠道向获得佣金的用户发送通知（需站内消息/短信/邮件服务已开通）。</p>
            <ul class="mt-3 space-y-2 text-sm text-slate-700">
              <li class="flex items-center gap-2">
                <input
                  id="ref-notify-email"
                  v-model="config.referralNotifyAfterSettlementEmail"
                  type="checkbox"
                  class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label for="ref-notify-email" class="cursor-pointer select-none">发送邮件</label>
              </li>
              <li class="flex items-center gap-2">
                <input
                  id="ref-notify-site"
                  v-model="config.referralNotifyAfterSettlementSite"
                  type="checkbox"
                  class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label for="ref-notify-site" class="cursor-pointer select-none">发送站内信</label>
              </li>
              <li class="flex items-center gap-2">
                <input
                  id="ref-notify-sms"
                  v-model="config.referralNotifyAfterSettlementSms"
                  type="checkbox"
                  class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label for="ref-notify-sms" class="cursor-pointer select-none">发送手机短信</label>
              </li>
            </ul>
          </div>
        </div>
      </section>
      <p class="text-xs text-slate-500">与「分佣规则」共用右上角保存；重置会恢复入账、日结时刻与通知默认值。</p>
    </div>
  </div>
</template>

<style scoped>
button:focus {
  outline: none;
}
</style>
