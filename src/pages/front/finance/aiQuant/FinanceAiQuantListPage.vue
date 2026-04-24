<script setup>
import { computed, ref } from 'vue'
import { createAiQuantProductsMock } from '../../../../admin/mock/aiQuant'
import {
  aiQuantAnnualFromDailyPct,
  operationModeMeta,
  productStatusMeta,
  settlementPeriodMeta,
  vipLevelMeta
} from '../../../../admin/constants/aiQuant'

const prefix = '/front'
const search = ref('')
const products = ref(createAiQuantProductsMock())

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return products.value
  return products.value.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.currency.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
  )
})

function tierSummary(p) {
  if (!p.tiers?.length) return '—'
  const annuals = p.tiers.map((t) => aiQuantAnnualFromDailyPct(t.dailyRate))
  const min = Math.min(...annuals)
  const max = Math.max(...annuals)
  return min === max
    ? `参考年化约 ${min.toFixed(2)}%`
    : `参考年化约 ${min.toFixed(2)}% – ${max.toFixed(2)}%`
}

function statusPill(s) {
  const m = productStatusMeta[s]
  if (!m?.color) return 'bg-white/10 text-white/55'
  if (m.color.includes('green')) return 'bg-emerald-400/15 text-emerald-200'
  if (m.color.includes('orange')) return 'bg-amber-400/15 text-amber-200'
  if (m.color.includes('blue')) return 'bg-sky-400/15 text-sky-200'
  return 'bg-white/10 text-white/55'
}
</script>

<template>
  <div>
    <header class="relative overflow-hidden border-b border-white/[0.06] bg-[#050505]">
      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-950/90 via-[#0c0814] to-[#030304]"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute left-1/2 top-0 h-72 w-[min(100%,28rem)] -translate-x-1/2 rounded-full bg-fuchsia-500/15 blur-3xl"
        aria-hidden="true"
      />
      <div class="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16 md:py-20 lg:px-10 lg:py-24">
        <nav class="text-sm text-white/40">
          <RouterLink :to="`${prefix}/finance`" class="transition hover:text-lime-300">金融</RouterLink>
          <span class="mx-2 text-white/20">/</span>
          <span class="text-white/70">AI 量化</span>
        </nav>
        <p class="mt-6 text-[11px] font-bold uppercase tracking-[0.3em] text-violet-300/90">Quant · 策略托管</p>
        <h1 class="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-[3.25rem] lg:leading-tight">
          AI 量化交易
        </h1>
        <p class="mt-5 max-w-2xl text-lg leading-relaxed text-white/55 md:text-xl">
          结算周期、运作方式与分档参考年化在策略详情中结构化呈现；年化由配置日化×365 推算（演示数据）。
        </p>
      </div>
    </header>

    <div class="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
      <label class="block max-w-xl">
        <span class="sr-only">搜索策略</span>
        <input
          v-model="search"
          type="search"
          placeholder="搜索策略名称或币种"
          class="w-full rounded-2xl border border-white/[0.1] bg-white/[0.04] px-5 py-3.5 text-base text-white placeholder:text-white/35 focus:border-violet-400/40 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
        />
      </label>

      <ul class="mt-10 space-y-4">
        <li v-for="p in filtered" :key="p.id">
          <RouterLink
            :to="`${prefix}/finance/ai-quant/${p.id}`"
            class="block rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 transition hover:border-violet-400/25 hover:bg-white/[0.04] sm:p-7 lg:rounded-3xl"
          >
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-3">
                  <span class="text-2xl" aria-hidden="true">{{ p.icon }}</span>
                  <span class="text-xl font-semibold text-white">{{ p.name }}</span>
                  <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="statusPill(p.status)">
                    {{ productStatusMeta[p.status]?.label }}
                  </span>
                </div>
                <p class="mt-3 text-base text-white/55">
                  {{ operationModeMeta[p.operationMode]?.label }} ·
                  {{ settlementPeriodMeta[p.settlementPeriod]?.label }}
                  <template v-if="p.settlementPeriod === 'custom' && p.customDays">（{{ p.customDays }} 天）</template>
                  · 最低 {{ vipLevelMeta[p.minVipLevel]?.label ?? 'VIP' + p.minVipLevel }}
                </p>
                <p class="mt-2 text-sm font-medium text-violet-300/90">{{ tierSummary(p) }}</p>
              </div>
            </div>
          </RouterLink>
        </li>
      </ul>

      <p v-if="filtered.length === 0" class="py-20 text-center text-base text-white/45">暂无匹配策略</p>
    </div>
  </div>
</template>
