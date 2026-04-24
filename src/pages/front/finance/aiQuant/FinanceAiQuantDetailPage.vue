<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import FrontStrokeIcon from '../../../../components/front/FrontStrokeIcon.vue'
import { createAiQuantProductsMock } from '../../../../admin/mock/aiQuant'
import {
  PRODUCT_STATUS,
  aiQuantAnnualFromDailyPct,
  operationModeMeta,
  productStatusMeta,
  settlementPeriodMeta,
  vipLevelMeta
} from '../../../../admin/constants/aiQuant'

const route = useRoute()
const prefix = '/front'

const product = computed(() => {
  const id = String(route.params.productId || '')
  return createAiQuantProductsMock().find((p) => p.id === id) ?? null
})

function statusPill(s) {
  const m = productStatusMeta[s]
  if (!m?.color) return 'bg-white/10 text-white/55'
  if (m.color.includes('green')) return 'bg-emerald-400/15 text-emerald-200'
  if (m.color.includes('orange')) return 'bg-amber-400/15 text-amber-200'
  if (m.color.includes('blue')) return 'bg-sky-400/15 text-sky-200'
  return 'bg-white/10 text-white/55'
}

const settlementLabel = computed(() => {
  const p = product.value
  if (!p) return ''
  let s = settlementPeriodMeta[p.settlementPeriod]?.label ?? ''
  if (p.settlementPeriod === 'custom' && p.customDays) s += `（${p.customDays} 天）`
  return s
})
</script>

<template>
  <div v-if="product">
    <header class="relative overflow-hidden border-b border-white/[0.06] bg-[#050505]">
      <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          class="absolute -left-1/4 top-0 h-[18rem] w-[18rem] rounded-full bg-lime-400/[0.08] blur-[100px] sm:h-[24rem] sm:w-[24rem]"
        />
        <div
          class="absolute -right-1/4 bottom-0 h-[14rem] w-[14rem] rounded-full bg-lime-400/[0.05] blur-[90px]"
        />
        <div
          class="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#050505_55%,#050505_100%)]"
        />
      </div>
      <div class="relative mx-auto max-w-7xl px-4 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8 lg:px-10 lg:pb-10 lg:pt-10">
        <nav class="text-xs text-white/40 sm:text-sm">
          <RouterLink :to="`${prefix}/finance`" class="transition hover:text-lime-300">金融</RouterLink>
          <span class="mx-1.5 text-white/20 sm:mx-2">/</span>
          <RouterLink :to="`${prefix}/finance/ai-quant`" class="transition hover:text-lime-300">AI 量化</RouterLink>
          <span class="mx-1.5 text-white/20 sm:mx-2">/</span>
          <span class="text-white/75">{{ product.name }}</span>
        </nav>

        <div class="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-3">
              <span
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.03] text-lime-300/90"
                aria-hidden="true"
              >
                <FrontStrokeIcon name="cpu" size-class="h-7 w-7" />
              </span>
              <h1 class="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">{{ product.name }}</h1>
              <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="statusPill(product.status)">
                {{ productStatusMeta[product.status]?.label }}
              </span>
            </div>
            <p class="mt-3 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base md:text-lg">
              {{ operationModeMeta[product.operationMode]?.label }} —
              {{ operationModeMeta[product.operationMode]?.description }}
            </p>
          </div>
          <div class="flex shrink-0 flex-wrap gap-2 lg:pb-0.5">
            <RouterLink
              v-if="product.status === PRODUCT_STATUS.ENABLED"
              :to="{ path: `${prefix}/login`, query: { redirect: route.fullPath } }"
              class="inline-flex min-h-11 items-center justify-center rounded-xl bg-lime-400 px-5 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-lime-300"
            >
              立即租用
            </RouterLink>
            <p
              v-else
              class="max-w-sm rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-sm leading-relaxed text-white/55"
            >
              当前策略不可租用（{{ productStatusMeta[product.status]?.label ?? product.status }}）；请返回列表查看其他策略。
            </p>
            <RouterLink
              :to="`${prefix}/finance/ai-quant`"
              class="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/10"
            >
              返回列表
            </RouterLink>
          </div>
        </div>

        <dl class="mt-6 grid max-w-2xl grid-cols-1 gap-3 border-t border-white/[0.08] pt-6 sm:grid-cols-2 sm:gap-4 lg:mt-8 lg:pt-8">
          <div class="rounded-xl border border-white/[0.06] bg-black/25 px-3 py-3 sm:px-4">
            <dt class="text-[11px] font-medium uppercase tracking-wide text-white/40">结算</dt>
            <dd class="mt-1 text-sm font-semibold leading-snug text-white/90">{{ settlementLabel }}</dd>
          </div>
          <div class="rounded-xl border border-white/[0.06] bg-black/25 px-3 py-3 sm:px-4">
            <dt class="text-[11px] font-medium uppercase tracking-wide text-white/40">币种</dt>
            <dd class="mt-1 text-lg font-bold tabular-nums text-lime-200/90">{{ product.currency }}</dd>
          </div>
        </dl>
      </div>
    </header>

    <div class="mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
      <div class="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <section class="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 lg:rounded-3xl lg:p-8">
          <h2 class="text-base font-semibold text-white lg:text-lg">收益档位</h2>
          <p class="mt-1 text-sm text-white/45">
            按持仓规模分档展示参考年化，仅供参考，实际以合同约定为准。
          </p>
          <div class="mt-5 overflow-hidden rounded-xl border border-white/[0.06]">
            <div
              class="hidden grid-cols-[1fr_auto_1fr] gap-2 border-b border-white/[0.06] bg-white/[0.04] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white/45 sm:grid"
            >
              <span>档位</span>
              <span class="text-center">参考年化</span>
              <span class="text-right">区间（{{ product.currency }}）</span>
            </div>
            <ul class="divide-y divide-white/[0.06]">
              <li
                v-for="(t, idx) in product.tiers"
                :key="idx"
                class="grid grid-cols-1 gap-1 px-4 py-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-2 sm:py-3"
              >
                <span class="text-sm font-medium text-white sm:text-base">{{ t.label || `档位 ${idx + 1}` }}</span>
                <span class="text-base font-semibold tabular-nums text-lime-300/95 sm:text-center">
                  {{ aiQuantAnnualFromDailyPct(t.dailyRate).toFixed(2) }}%
                </span>
                <span class="text-sm tabular-nums text-white/50 sm:text-right">
                  {{ t.minAmount }} – {{ t.maxAmount }} {{ product.currency }}
                </span>
              </li>
            </ul>
          </div>
        </section>

        <section class="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 lg:rounded-3xl lg:p-8">
          <h2 class="text-base font-semibold text-white lg:text-lg">赎回与限额</h2>
          <ul class="mt-4 space-y-3 text-[15px] leading-relaxed text-white/65">
            <li class="flex gap-3">
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/35" aria-hidden="true" />
              <span>
                最低等级：<strong class="font-medium text-white/85">{{
                  vipLevelMeta[product.minVipLevel]?.label ?? 'VIP' + product.minVipLevel
                }}</strong>
              </span>
            </li>
            <li class="flex gap-3">
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400/70" aria-hidden="true" />
              <span>
                提前赎回：{{
                  product.earlyRedeemEnabled
                    ? `支持，手续费约 ${product.earlyRedeemFeePercent}%`
                    : '不支持'
                }}
              </span>
            </li>
            <li v-if="product.limitAmount" class="flex gap-3">
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/35" aria-hidden="true" />
              <span>单用户持仓上限约 {{ product.limitAmount }} {{ product.currency }}</span>
            </li>
            <li v-if="product.limitCount != null" class="flex gap-3">
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/35" aria-hidden="true" />
              <span>总申购笔数上限 {{ product.limitCount }}</span>
            </li>
            <li v-if="product.monthlyLimitCount != null" class="flex gap-3">
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/35" aria-hidden="true" />
              <span>每月申购上限 {{ product.monthlyLimitCount }} 笔</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>

  <div
    v-else
    class="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-6 py-24 text-center"
  >
    <p class="text-lg text-white/60">未找到该策略</p>
    <RouterLink
      :to="`${prefix}/finance/ai-quant`"
      class="mt-6 inline-flex rounded-xl border border-white/[0.12] bg-white/[0.05] px-5 py-2.5 text-sm font-semibold text-lime-300 transition hover:bg-white/[0.08]"
    >
      返回 AI 量化列表
    </RouterLink>
  </div>
</template>
