<script setup>
import { ref, onMounted } from 'vue'
import {
  mockAgentCommissionConfig,
  agentCommissionApi,
  normalizeAgentGlobalCommission
} from '../../../admin/mock/agentCommission'
import { DEFAULT_AGENT_GLOBAL_COMMISSION, normalizeAgentLineRate } from '../../../admin/constants/agentCommission'

const config = ref(normalizeAgentGlobalCommission({ ...mockAgentCommissionConfig }))
const isSaving = ref(false)
const demoBaseAmount = ref(10000)

const PRODUCT_LINES = [
  {
    key: 'deposit',
    enabledKey: 'agentDepositCommissionEnabled',
    rateKey: 'agentDepositCommissionRate',
    title: '充值',
    baseDesc: '计佣基数 A = 代理名下客户单笔充值到账金额（USDT）',
    formula: '佣金 = 充值金额 A × r',
    firstDepositExtra: true,
    theme: 'blue'
  },
  {
    key: 'perpetual',
    enabledKey: 'agentPerpetualCommissionEnabled',
    rateKey: 'agentPerpetualCommissionRate',
    title: '永续合约',
    baseDesc: '计佣基数 A = 代理客户该笔永续订单参与代理结算的金额（USDT）',
    formula: '佣金 = 计佣基数 A × r',
    theme: 'indigo'
  },
  {
    key: 'delivery',
    enabledKey: 'agentDeliveryCommissionEnabled',
    rateKey: 'agentDeliveryCommissionRate',
    title: '交割合约',
    baseDesc: '计佣基数 A = 代理客户该笔交割订单参与代理结算的金额（USDT）',
    formula: '佣金 = 计佣基数 A × r',
    theme: 'violet'
  },
  {
    key: 'spot',
    enabledKey: 'agentSpotCommissionEnabled',
    rateKey: 'agentSpotCommissionRate',
    title: '现货',
    baseDesc: '计佣基数 A = 代理客户该笔现货订单参与代理结算的金额（USDT）',
    formula: '佣金 = 计佣基数 A × r',
    theme: 'orange'
  },
  {
    key: 'aiQuant',
    enabledKey: 'agentAiQuantCommissionEnabled',
    rateKey: 'agentAiQuantCommissionRate',
    title: 'AI 量化',
    baseDesc: '计佣基数 A = 代理客户 AI 量化订单参与代理结算的金额（USDT）',
    formula: '佣金 = 计佣基数 A × r',
    theme: 'amber'
  },
  {
    key: 'lending',
    enabledKey: 'agentLendingCommissionEnabled',
    rateKey: 'agentLendingCommissionRate',
    title: '理财产品',
    baseDesc: '计佣基数 A = 代理客户理财订单参与代理结算的本金或结算基数（USDT）',
    formula: '佣金 = 计佣基数 A × r',
    theme: 'emerald'
  },
  {
    key: 'borrowing',
    enabledKey: 'agentBorrowingCommissionEnabled',
    rateKey: 'agentBorrowingCommissionRate',
    title: '借贷产品',
    baseDesc: '计佣基数 A = 代理客户借贷订单参与代理结算的金额（USDT）',
    formula: '佣金 = 计佣基数 A × r',
    theme: 'rose'
  }
]

const PRODUCT_GROUPS = [
  { id: 'fund', name: '入金', blurb: '用户链上 / 站内充值', lineKeys: ['deposit'] },
  { id: 'trade', name: '交易', blurb: '合约与现货订单', lineKeys: ['perpetual', 'delivery', 'spot'] },
  { id: 'fin', name: '产品与策略', blurb: '量化、理财、借贷', lineKeys: ['aiQuant', 'lending', 'borrowing'] }
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

function groupGridClass(group) {
  const n = group.lineKeys.length
  if (n <= 1) return 'grid-cols-1'
  if (n === 2) return 'grid-cols-1 md:grid-cols-2'
  return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
}

function rateNum(line) {
  return parseFloat(normalizeAgentLineRate(config.value[line.rateKey]))
}

function setRate(line, raw) {
  config.value[line.rateKey] = normalizeAgentLineRate(raw)
}

function formatUsdt(n) {
  const x = Number(n)
  if (Number.isNaN(x)) return '—'
  return x.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function previewCommission(line, base) {
  const b = Number(base)
  if (Number.isNaN(b) || b <= 0) return null
  const r = rateNum(line)
  return b * r
}

function isLineEnabled(line) {
  return config.value[line.enabledKey] === true
}

function toggleLine(line) {
  config.value[line.enabledKey] = !config.value[line.enabledKey]
}

const loadConfig = async () => {
  try {
    const result = await agentCommissionApi.getAgentCommissionConfig()
    if (result.success) {
      config.value = normalizeAgentGlobalCommission(result.data)
    }
  } catch (error) {
    console.error('Failed to load agent commission config:', error)
  }
}

const saveConfig = async () => {
  const validateOne = (rateStr) => {
    const n = parseFloat(normalizeAgentLineRate(rateStr))
    return !Number.isNaN(n) && n >= 0 && n <= 1
  }

  for (const line of PRODUCT_LINES) {
    if (!config.value[line.enabledKey]) continue
    config.value[line.rateKey] = normalizeAgentLineRate(config.value[line.rateKey])
    if (!validateOne(config.value[line.rateKey])) {
      alert(`「${line.title}」已开启记佣：比例须为 0～1 之间的小数。`)
      return
    }
  }

  for (const line of PRODUCT_LINES) {
    if (config.value[line.enabledKey]) continue
    const raw = config.value[line.rateKey]
    if (raw != null && String(raw).trim() && !validateOne(raw)) {
      alert(`「${line.title}」比例格式有误，请修正或清空。`)
      return
    }
  }

  const payload = normalizeAgentGlobalCommission({ ...config.value })

  isSaving.value = true
  try {
    const result = await agentCommissionApi.updateAgentCommissionConfig(payload)
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
  if (confirm('确认重置为代理记佣默认配置？')) {
    config.value = normalizeAgentGlobalCommission({ ...DEFAULT_AGENT_GLOBAL_COMMISSION })
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<template>
  <div class="w-full min-w-0 space-y-8 pb-8">
    <header class="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0 flex-1">
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">代理记佣配置</h1>
        <p class="mt-2 text-sm leading-relaxed text-slate-600">
          配置代理业务各产品线的一级分佣比例，以及代理线结算相关全局开关；作为全站默认，也可在代理列表里对单个代理覆盖。
        </p>
        <p class="mt-2 text-sm leading-relaxed text-slate-600">
          配置步骤：<span class="font-medium text-slate-800">① 理解计佣公式</span> →
          <span class="font-medium text-slate-800">② 代理线全局规则</span> →
          <span class="font-medium text-slate-800">③ 各产品线一级比例</span>。
        </p>
      </div>
      <div class="flex shrink-0 gap-2">
        <button type="button" class="ant-btn" @click="resetConfig">重置为默认</button>
        <button type="button" class="ant-btn ant-btn-primary" :disabled="isSaving" @click="saveConfig">
          {{ isSaving ? '保存中…' : '保存配置' }}
        </button>
      </div>
    </header>

    <section class="rounded-xl border border-slate-200 bg-white">
      <div class="flex items-baseline gap-2 border-b border-slate-100 px-5 py-4">
        <span class="text-xs font-semibold text-slate-400">①</span>
        <h2 class="text-base font-semibold text-slate-900">计佣公式</h2>
      </div>
      <div class="grid gap-6 p-5 lg:grid-cols-2 lg:gap-8">
        <div class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">核心式（代理线）</p>
          <p class="mt-3 font-mono text-sm leading-relaxed text-slate-900">
            <span class="text-violet-600">佣金</span>
            <span class="mx-2 text-slate-400">=</span>
            <span class="text-sky-600">A</span>
            <span class="mx-2 text-slate-400">×</span>
            <span class="text-emerald-600">r</span>
          </p>
          <p class="mt-3 text-xs leading-relaxed text-slate-600">
            <strong class="text-slate-700">A</strong>：本条订单的计佣基数（各产品线含义见下方卡片）。<br />
            <strong class="text-slate-700">r</strong>：该产品线代理一级比例，取值 0～1。
          </p>
        </div>
        <div class="text-sm leading-relaxed text-slate-600">
          <p class="font-medium text-slate-800">操作要点</p>
          <ul class="mt-3 space-y-2.5">
            <li class="flex gap-2">
              <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              <span>每条产品线可单独关闭记佣；关闭后该业务不产生代理线佣金（比例可保留）。</span>
            </li>

            <li class="flex gap-2">
              <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              <span>下方示例仅用于核对公式，实际以订单与结算规则为准。</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white">
      <div class="flex items-baseline gap-2 border-b border-slate-100 px-5 py-4">
        <span class="text-xs font-semibold text-slate-400">②</span>
        <h2 class="text-base font-semibold text-slate-900">代理线全局规则</h2>
        <p class="mt-1 text-xs text-slate-500">仅影响代理渠道分佣与结算。</p>
      </div>
      <div class="divide-y divide-slate-100">
        <div class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm font-medium text-slate-900">自动执行代理线分佣</p>
            <p class="mt-1 text-sm text-slate-500">满足条件时系统自动计算并发放代理线佣金；关闭则需人工处理。</p>
          </div>
          <button
            type="button"
            :class="config.agentCommissionAutoExecute ? 'bg-blue-600' : 'bg-slate-200'"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none"
            @click="config.agentCommissionAutoExecute = !config.agentCommissionAutoExecute"
          >
            <span
              :class="config.agentCommissionAutoExecute ? 'translate-x-5' : 'translate-x-0'"
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition"
            />
          </button>
        </div>
        <div class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm font-medium text-slate-900">仅首笔充值参与代理线记佣</p>
            <p class="mt-1 text-sm text-slate-500">仅影响「充值」产品线的代理计佣：开启后只对客户首次成功充值按该线比例记佣。</p>
          </div>
          <button
            type="button"
            :class="config.agentCommissionDepositFirstOnly ? 'bg-blue-600' : 'bg-slate-200'"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none"
            @click="config.agentCommissionDepositFirstOnly = !config.agentCommissionDepositFirstOnly"
          >
            <span
              :class="config.agentCommissionDepositFirstOnly ? 'translate-x-5' : 'translate-x-0'"
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition"
            />
          </button>
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white">
      <div class="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-baseline gap-2">
          <span class="text-xs font-semibold text-slate-400">③</span>
          <div>
            <h2 class="text-base font-semibold text-slate-900">产品线 · 代理记佣（全局默认）</h2>
            <p class="mt-0.5 text-sm text-slate-500">每条线一个比例 r；新代理缺省对齐此处，可在代理列表中按人修改。</p>
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
          <span class="text-xs text-slate-400">示例佣金 = 基数 × r</span>
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
                  <label class="mt-4 block text-xs font-medium text-slate-700" :for="'agcr-' + line.key">比例 r（0～1）</label>
                  <input
                    :id="'agcr-' + line.key"
                    type="number"
                    min="0"
                    max="1"
                    step="0.001"
                    class="ant-input mt-1 w-full max-w-[220px] text-sm"
                    :value="rateNum(line)"
                    @input="setRate(line, $event.target.value)"
                  />
                  <div class="mt-3 flex flex-wrap gap-1.5">
                    <span class="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      r = {{ (rateNum(line) * 100).toFixed(2) }}%
                    </span>
                  </div>
                  <div class="mt-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-slate-800">
                    <p class="font-medium text-slate-700">示例 · 基数 {{ formatUsdt(demoBaseAmount) }} USDT</p>
                    <p class="mt-1 font-mono">
                      佣金 ≈ {{ formatUsdt(previewCommission(line, demoBaseAmount) ?? 0) }} USDT
                    </p>
                  </div>
                </template>
                <p v-else class="mt-3 text-sm text-slate-500">未参与记佣，不产生代理线佣金。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <footer class="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
      <p class="font-medium text-slate-800">保存前请确认</p>
      <ul class="mt-2 list-inside list-disc space-y-1 text-slate-600">
        <li>已开启记佣的产品线须填写比例 r（0～1）。</li>
        <li>此处为代理体系全局默认；单个代理的覆盖请在代理列表「记佣配置」中维护。</li>
      </ul>
    </footer>
  </div>
</template>

<style scoped>
button:focus {
  outline: none;
}
</style>
