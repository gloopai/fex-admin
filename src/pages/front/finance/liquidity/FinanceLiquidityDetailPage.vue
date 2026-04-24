<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { createLockedProductsMock } from '../../../../admin/mock/liquidityLocked'
import {
  LOCKED_MIN_VIP_OPTIONS,
  PRODUCT_STATUS,
  productStatusMeta,
  PURCHASE_LIMIT_TYPE,
  lockYieldAnnualPct,
  lockedMinKycRequirementPhrase
} from '../../../../admin/constants/liquidityLocked'

const route = useRoute()
const prefix = '/front'

/** 与参考端「可用资金」演示一致 */
const DEMO_AVAILABLE_FUNDS = 5.562875

const product = computed(() => {
  const id = String(route.params.productId || '')
  return createLockedProductsMock().find((p) => p.id === id) ?? null
})

const selectedPeriod = computed(() => {
  const p = product.value
  if (!p?.periods?.length) return null
  const d = Number(route.query.days)
  if (Number.isFinite(d)) {
    const hit = p.periods.find((x) => x.days === d)
    if (hit) return hit
  }
  return p.periods[0]
})

const purchaseAmount = ref('')

const parsedPurchase = computed(() => {
  const n = Number(String(purchaseAmount.value).replace(/,/g, ''))
  return Number.isFinite(n) && n >= 0 ? n : 0
})

const estimatedYield = computed(() => {
  const row = selectedPeriod.value
  if (!row) return 0
  const apr = lockYieldAnnualPct(row) / 100
  return parsedPurchase.value * apr * (row.days / 365)
})

function fillAllPurchase() {
  const row = selectedPeriod.value
  if (!row) return
  const cap = Math.min(DEMO_AVAILABLE_FUNDS, Number(row.maxAmount) || DEMO_AVAILABLE_FUNDS)
  purchaseAmount.value = String(cap)
}

const limitDesc = computed(() => {
  const p = product.value
  if (!p) return ''
  if (p.purchaseLimitType === PURCHASE_LIMIT_TYPE.LIFETIME) {
    return `终身累计申购上限 ${p.lifetimeLimit?.toLocaleString?.() ?? p.lifetimeLimit} ${p.currency}`
  }
  if (p.purchaseLimitType === PURCHASE_LIMIT_TYPE.PERIOD) {
    return `每 ${p.periodDays} 天周期内上限 ${p.periodLimit?.toLocaleString?.() ?? p.periodLimit} ${p.currency}`
  }
  return '当前产品不设个人申购上限（以实际风控为准）'
})

const maxAnnual = computed(() => {
  const p = product.value
  if (!p?.periods?.length) return 0
  return Math.max(...p.periods.map((x) => lockYieldAnnualPct(x)))
})

const selectedAnnualPct = computed(() => {
  const row = selectedPeriod.value
  return row ? lockYieldAnnualPct(row) : 0
})

const minVipLabel = computed(() => {
  const p = product.value
  if (!p) return ''
  const hit = LOCKED_MIN_VIP_OPTIONS.find((o) => o.value === p.minVipLevel)
  return hit?.label ?? `VIP ${p.minVipLevel}`
})

function statusPillClass(status) {
  if (status === PRODUCT_STATUS.ENABLED) return 'bg-emerald-400/15 text-emerald-200'
  if (status === PRODUCT_STATUS.SOLD_OUT) return 'bg-amber-400/15 text-amber-200'
  return 'bg-white/10 text-white/55'
}
</script>

<template>
  <div v-if="product">
    <header class="relative overflow-hidden border-b border-white/[0.06] bg-[#050505]">
      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-[#06100c] to-[#030304]"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-emerald-400/12 blur-3xl"
        aria-hidden="true"
      />
      <div class="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
        <nav class="text-sm text-white/45">
          <RouterLink :to="`${prefix}/finance`" class="transition hover:text-lime-300">金融</RouterLink>
          <span class="mx-2 text-white/20">/</span>
          <RouterLink :to="`${prefix}/finance/liquidity`" class="transition hover:text-lime-300">流动性挖矿</RouterLink>
          <span class="mx-2 text-white/20">/</span>
          <span class="text-white/75">{{ product.name }}</span>
        </nav>

        <div class="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-3">
              <span class="text-3xl leading-none" aria-hidden="true">{{ product.icon }}</span>
              <h1 class="text-3xl font-bold tracking-tight text-white md:text-4xl">{{ product.name }}</h1>
              <span
                class="rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="statusPillClass(product.status)"
              >
                {{ productStatusMeta[product.status]?.label }}
              </span>
            </div>
            <p class="mt-3 max-w-2xl text-base leading-relaxed text-white/55 md:text-lg">
              币种 <span class="font-medium text-white/75">{{ product.currency }}</span>
            </p>
          </div>
          <div class="flex shrink-0 flex-wrap gap-2 lg:pb-0.5">
            <RouterLink
              :to="{ path: `${prefix}/login`, query: { redirect: route.fullPath } }"
              class="inline-flex items-center justify-center rounded-xl bg-lime-400 px-5 py-2.5 text-sm font-semibold text-[#0b0e11] transition hover:bg-lime-300"
            >
              登录后申购
            </RouterLink>
          </div>
        </div>

        <dl class="mt-8 grid max-w-2xl grid-cols-1 gap-3 border-t border-white/[0.08] pt-8 sm:grid-cols-2 sm:gap-4">
          <div class="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-3 sm:px-4">
            <dt class="text-[11px] font-medium uppercase tracking-wide text-white/40">参考年化（最高档）</dt>
            <dd class="mt-1 text-lg font-bold tabular-nums text-emerald-300 sm:text-xl">{{ maxAnnual.toFixed(2) }}%</dd>
          </div>
          <div class="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-3 sm:px-4">
            <dt class="text-[11px] font-medium uppercase tracking-wide text-white/40">期限档</dt>
            <dd class="mt-1 text-lg font-bold tabular-nums text-white sm:text-xl">{{ product.periods?.length ?? 0 }}</dd>
          </div>
        </dl>
      </div>
    </header>

    <div class="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
      <section
        class="mb-8 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 lg:rounded-3xl lg:p-8"
        aria-labelledby="liquidity-summary-heading"
      >
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="liquidity-summary-heading" class="text-base font-semibold text-white lg:text-lg">
              产品概要（当前档位）
            </h2>
            <p class="mt-1 text-sm text-white/45">
              列表「立即挖矿」会带上期限参数；也可在下方「期限与年化」中切换档位。
            </p>
          </div>
          <div class="flex items-center gap-2 text-2xl leading-none text-white" aria-hidden="true">
            <span>{{ product.icon }}</span>
            <span class="text-lg font-semibold">{{ product.currency }}</span>
          </div>
        </div>
        <dl
          v-if="selectedPeriod"
          class="mt-6 grid grid-cols-1 gap-4 border-t border-white/[0.06] pt-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div class="flex justify-between gap-3 sm:flex-col sm:justify-start">
            <dt class="text-xs font-medium uppercase tracking-wide text-white/40">参考年化</dt>
            <dd class="text-lg font-bold tabular-nums text-emerald-300">{{ selectedAnnualPct.toFixed(2) }}%</dd>
          </div>
          <div class="flex justify-between gap-3 sm:flex-col sm:justify-start">
            <dt class="text-xs font-medium uppercase tracking-wide text-white/40">锁仓期限</dt>
            <dd class="text-lg font-semibold tabular-nums text-white">{{ selectedPeriod.days }} 天</dd>
          </div>
          <div class="flex justify-between gap-3 sm:flex-col sm:justify-start">
            <dt class="text-xs font-medium uppercase tracking-wide text-white/40">挖币币种</dt>
            <dd class="text-lg font-semibold text-white">{{ product.currency }}</dd>
          </div>
          <div class="flex justify-between gap-3 sm:flex-col sm:justify-start">
            <dt class="text-xs font-medium uppercase tracking-wide text-white/40">单档最小申购</dt>
            <dd class="text-lg font-semibold tabular-nums text-white">
              {{ selectedPeriod.minAmount }} {{ product.currency }}
            </dd>
          </div>
        </dl>

        <div
          v-if="product.earlyRedeemEnabled && product.earlyRedeemFee > 0"
          class="mt-6 rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-3 text-center text-sm font-medium text-violet-200"
        >
          提前赎回手续费：约 {{ product.earlyRedeemFee }}%（演示说明，以实际规则为准）
        </div>

        <div class="mt-8 border-t border-white/[0.06] pt-8">
          <div class="flex flex-wrap items-end justify-between gap-4">
            <label class="block min-w-[200px] flex-1">
              <span class="text-sm font-medium text-white/70">购买金额（{{ product.currency }}）</span>
              <span class="mt-1 block text-xs text-white/40">
                演示可用资金：{{ DEMO_AVAILABLE_FUNDS }}
              </span>
              <div class="mt-2 flex gap-2">
                <input
                  v-model="purchaseAmount"
                  type="text"
                  inputmode="decimal"
                  :placeholder="`请输入金额，最小 ${selectedPeriod?.minAmount ?? ''}`"
                  class="min-w-0 flex-1 rounded-xl border border-white/[0.12] bg-black/30 px-4 py-3 text-base text-white placeholder:text-white/30 focus:border-violet-400/40 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
                />
                <button
                  type="button"
                  class="shrink-0 rounded-xl border border-white/[0.15] bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.1]"
                  @click="fillAllPurchase"
                >
                  全部
                </button>
              </div>
            </label>
          </div>
          <p class="mt-3 text-sm tabular-nums text-white/50">
            预计收益（按当前档位年化粗算，演示）：
            <span class="font-semibold text-emerald-300/90">
              {{ estimatedYield.toFixed(6) }} {{ product.currency }}
            </span>
          </p>
          <div class="mt-6 flex flex-wrap justify-end gap-3">
            <RouterLink
              :to="`${prefix}/finance/liquidity`"
              class="inline-flex items-center justify-center rounded-xl border border-white/[0.15] bg-transparent px-5 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/[0.06]"
            >
              返回列表
            </RouterLink>
            <RouterLink
              :to="{ path: `${prefix}/login`, query: { redirect: route.fullPath } }"
              class="inline-flex items-center justify-center rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-400"
            >
              立即挖矿
            </RouterLink>
          </div>
        </div>
      </section>

      <div class="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <section class="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 lg:rounded-3xl lg:p-8">
          <h2 class="text-base font-semibold text-white lg:text-lg">期限与年化</h2>
          <p class="mt-1 text-sm text-white/45">各锁定期对应年化与申购区间</p>
          <div class="mt-5 overflow-hidden rounded-xl border border-white/[0.06]">
            <div
              class="hidden grid-cols-[1fr_auto_1fr] gap-2 border-b border-white/[0.06] bg-white/[0.04] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white/45 sm:grid"
            >
              <span>期限</span>
              <span class="text-center">年化</span>
              <span class="text-right">申购区间（{{ product.currency }}）</span>
            </div>
            <ul class="divide-y divide-white/[0.06]">
              <li v-for="(row, idx) in product.periods" :key="idx" class="sm:py-0">
                <RouterLink
                  :to="{ path: route.path, query: { days: String(row.days) } }"
                  class="grid grid-cols-1 gap-1 px-4 py-4 transition sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-2 sm:py-3"
                  :class="
                    selectedPeriod?.days === row.days
                      ? 'bg-emerald-400/[0.08] ring-1 ring-inset ring-emerald-400/20'
                      : 'hover:bg-white/[0.03]'
                  "
                >
                  <span class="text-sm font-medium text-white sm:text-base">{{ row.days }} 天</span>
                  <span class="text-base font-semibold tabular-nums text-emerald-300 sm:text-center">
                    {{ lockYieldAnnualPct(row).toFixed(2) }}%
                  </span>
                  <span class="text-sm tabular-nums text-white/50 sm:text-right">
                    {{ row.minAmount }} – {{ row.maxAmount }} {{ product.currency }}
                  </span>
                </RouterLink>
              </li>
            </ul>
          </div>
        </section>

        <section class="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 lg:rounded-3xl lg:p-8">
          <h2 class="text-base font-semibold text-white lg:text-lg">赎回与限购</h2>
          <ul class="mt-4 space-y-3 text-[15px] leading-relaxed text-white/65">
            <li class="flex gap-3">
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/35" aria-hidden="true" />
              <span>
                VIP 限制：<strong class="font-medium text-white/85">{{ minVipLabel }}</strong>
              </span>
            </li>
            <li class="flex gap-3">
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/35" aria-hidden="true" />
              <span>
                认证要求：<strong class="font-medium text-white/85">{{
                  lockedMinKycRequirementPhrase(product.minKycLevel)
                }}</strong>
              </span>
            </li>
            <li class="flex gap-3">
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/70" aria-hidden="true" />
              <span>
                提前赎回：{{
                  product.earlyRedeemEnabled
                    ? `支持，违约金约为本金的 ${product.earlyRedeemFee}%`
                    : '不支持'
                }}
              </span>
            </li>
            <li class="flex gap-3">
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/35" aria-hidden="true" />
              <span>{{ limitDesc }}</span>
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
    <p class="text-lg text-white/60">未找到该产品</p>
    <RouterLink
      :to="`${prefix}/finance/liquidity`"
      class="mt-6 inline-flex rounded-xl border border-white/[0.12] bg-white/[0.05] px-5 py-2.5 text-sm font-semibold text-lime-300 transition hover:bg-white/[0.08]"
    >
      返回流动性挖矿列表
    </RouterLink>
  </div>
</template>
