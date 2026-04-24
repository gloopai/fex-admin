<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  LOCKED_MIN_VIP_OPTIONS,
  PRODUCT_STATUS,
  productStatusMeta,
  PURCHASE_LIMIT_TYPE,
  DEFAULT_LOCKED_LENDABLE_RATIO,
  lockYieldAnnualPct,
  lockedMinKycLabel,
  lockedMinKycRequirementPhrase
} from '../../../../admin/constants/liquidityLocked'
import { lockedProductsCatalog } from '../../../../admin/state/financeCatalogs'

const route = useRoute()
const prefix = '/front'

const product = computed(() => {
  const id = String(route.params.productId || '')
  return lockedProductsCatalog.value.find((p) => p.id === id) ?? null
})

function purchaseLimitLine(p) {
  if (!p) return ''
  if (p.purchaseLimitType === PURCHASE_LIMIT_TYPE.LIFETIME) {
    return `终身累计申购上限 ${p.lifetimeLimit?.toLocaleString?.() ?? p.lifetimeLimit} ${p.currency}`
  }
  if (p.purchaseLimitType === PURCHASE_LIMIT_TYPE.PERIOD) {
    return `每 ${p.periodDays} 天周期内上限 ${p.periodLimit?.toLocaleString?.() ?? p.periodLimit} ${p.currency}`
  }
  return '不设个人申购上限（以实际风控为准）'
}

const lendableRatioDisplay = computed(() => {
  const p = product.value
  if (!p) return DEFAULT_LOCKED_LENDABLE_RATIO
  const n = Number(p.lendableRatio)
  return Number.isFinite(n) ? n : DEFAULT_LOCKED_LENDABLE_RATIO
})

function statusPill(s) {
  if (s === PRODUCT_STATUS.ENABLED) return 'bg-emerald-400/15 text-emerald-200'
  if (s === PRODUCT_STATUS.SOLD_OUT) return 'bg-amber-400/15 text-amber-200'
  return 'bg-white/10 text-white/55'
}

const minVipLabel = computed(() => {
  const p = product.value
  if (!p) return ''
  const hit = LOCKED_MIN_VIP_OPTIONS.find((o) => o.value === p.minVipLevel)
  return hit?.label ?? `VIP ${p.minVipLevel}`
})

const kycAdminLabel = computed(() => {
  const p = product.value
  if (!p) return ''
  return lockedMinKycLabel(p.minKycLevel)
})
</script>

<template>
  <div v-if="product" class="min-h-[calc(100dvh-3.5rem)] bg-[#050505] pb-10">
    <header class="relative overflow-hidden border-b border-white/[0.06] bg-[#050505]">
      <div
        class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#050505_55%,#050505_100%)]"
        aria-hidden="true"
      />
      <div class="relative mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-8 sm:pt-8 lg:px-10 lg:pb-10 lg:pt-10">
        <nav class="text-xs text-white/40 sm:text-sm">
          <RouterLink :to="`${prefix}/finance`" class="transition hover:text-lime-300">金融</RouterLink>
          <span class="mx-1.5 text-white/20 sm:mx-2">/</span>
          <RouterLink :to="`${prefix}/finance/liquidity`" class="transition hover:text-lime-300">流动性挖矿</RouterLink>
          <span class="mx-1.5 text-white/20 sm:mx-2">/</span>
          <span class="text-white/70">{{ product.name }}</span>
        </nav>

        <div class="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div class="min-w-0 flex items-start gap-4">
            <span
              class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.04] text-3xl leading-none text-lime-200/90"
              aria-hidden="true"
            >{{ product.icon }}</span>
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 class="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">{{ product.name }}</h1>
                <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="statusPill(product.status)">
                  {{ productStatusMeta[product.status]?.label ?? product.status }}
                </span>
              </div>
              <p class="mt-2 text-sm text-white/50 sm:text-base">
                {{ product.currency }} · {{ minVipLabel }} · {{ lockedMinKycRequirementPhrase(product.minKycLevel) }}
              </p>
            </div>
          </div>
          <div class="flex shrink-0 flex-wrap gap-2">
            <RouterLink
              :to="`${prefix}/finance/liquidity`"
              class="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/10"
            >
              返回列表
            </RouterLink>
            <RouterLink
              v-if="product.status === PRODUCT_STATUS.ENABLED"
              :to="{ path: `${prefix}/login`, query: { redirect: `${prefix}/finance/liquidity` } }"
              class="inline-flex min-h-11 items-center justify-center rounded-xl bg-lime-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-lime-300"
            >
              登录后申购
            </RouterLink>
          </div>
        </div>
      </div>
    </header>

    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
      <div class="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <section class="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 lg:rounded-3xl lg:p-8">
          <h2 class="text-base font-semibold text-lime-200/95 lg:text-lg">期限与参考年化</h2>
          <div class="mt-4 overflow-hidden rounded-xl border border-white/[0.08]">
            <table class="w-full border-collapse text-left text-sm text-white/90">
              <thead>
                <tr class="border-b border-white/[0.08] text-[11px] font-semibold uppercase tracking-wide text-white/40">
                  <th class="px-3 py-2.5">天数</th>
                  <th class="px-3 py-2.5">参考年化</th>
                  <th class="px-3 py-2.5 text-right">申购区间</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in product.periods || []"
                  :key="row.days"
                  class="border-b border-white/[0.06] last:border-b-0"
                >
                  <td class="px-3 py-3 tabular-nums text-white/80">{{ row.days }} 天</td>
                  <td class="px-3 py-3 font-semibold tabular-nums text-lime-300">
                    {{ lockYieldAnnualPct(row).toFixed(2) }}%
                  </td>
                  <td class="px-3 py-3 text-right tabular-nums text-white/55">
                    {{ row.minAmount }} – {{ row.maxAmount }} {{ product.currency }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 lg:rounded-3xl lg:p-8">
          <h2 class="text-base font-semibold text-lime-200/95 lg:text-lg">赎回与说明</h2>
          <dl class="mt-4 space-y-3 text-sm text-white/70">
            <div class="rounded-xl border border-white/[0.06] bg-black/25 px-3 py-3">
              <dt class="text-xs font-medium uppercase tracking-wide text-white/40">提前赎回</dt>
              <dd class="mt-1 leading-relaxed">
                {{
                  product.earlyRedeemEnabled
                    ? `支持；提前赎回手续费约 ${product.earlyRedeemFee ?? 0}%（以产品协议为准）`
                    : '本产品不支持提前赎回，请持有至到期。'
                }}
              </dd>
            </div>
            <div class="rounded-xl border border-white/[0.06] bg-black/25 px-3 py-3">
              <dt class="text-xs font-medium uppercase tracking-wide text-white/40">限购与门槛</dt>
              <dd class="mt-1 leading-relaxed text-white/75">
                {{ purchaseLimitLine(product) }}
                <span class="mt-2 block text-white/55">{{ minVipLabel }} · {{ kycAdminLabel }}</span>
              </dd>
            </div>
            <div class="rounded-xl border border-white/[0.06] bg-black/25 px-3 py-3">
              <dt class="text-xs font-medium uppercase tracking-wide text-white/40">可借贷比例</dt>
              <dd class="mt-1 font-semibold tabular-nums text-white/85">
                {{ lendableRatioDisplay }}%（与同币种信用借贷可借额度联动）
              </dd>
            </div>
            <div class="rounded-xl border border-white/[0.06] bg-black/25 px-3 py-3">
              <dt class="text-xs font-medium uppercase tracking-wide text-white/40">运营数据</dt>
              <dd class="mt-1 space-y-1 tabular-nums text-white/75">
                <div>锁仓规模 {{ product.totalLocked?.toLocaleString?.() ?? product.totalLocked }} {{ product.currency }}</div>
                <div>累计订单 {{ product.totalOrders?.toLocaleString?.() ?? product.totalOrders }} 笔</div>
              </dd>
            </div>
            <p class="text-xs leading-relaxed text-white/40">
              计息规则、到账时效与申购限额以产品协议及平台公示为准。
            </p>
          </dl>
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
      返回流动性挖矿
    </RouterLink>
  </div>
</template>
