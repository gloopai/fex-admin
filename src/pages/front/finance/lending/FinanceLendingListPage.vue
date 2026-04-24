<script setup>
import { computed, ref } from 'vue'
import { mockProducts } from '../../../../admin/mock/cryptoLending'
import {
  PRODUCT_STATUS,
  PRODUCT_STATUS_LABELS,
  INTEREST_RATE_TYPE_LABELS
} from '../../../../admin/constants/cryptoLending'

const prefix = '/front'
const collateral = ref('')
const products = ref([...mockProducts])

const filtered = computed(() => {
  if (!collateral.value) return products.value
  return products.value.filter((p) => p.collateralType === collateral.value)
})

function statusClass(s) {
  if (s === PRODUCT_STATUS.ACTIVE) return 'bg-emerald-400/15 text-emerald-200'
  if (s === PRODUCT_STATUS.SUSPENDED) return 'bg-amber-400/15 text-amber-200'
  return 'bg-white/10 text-white/50'
}
</script>

<template>
  <div>
    <header class="relative overflow-hidden border-b border-white/[0.06] bg-[#050505]">
      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-950/90 via-[#070c12] to-[#030304]"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -right-16 top-1/4 h-80 w-80 rounded-full bg-sky-400/12 blur-3xl"
        aria-hidden="true"
      />
      <div class="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16 md:py-20 lg:px-10 lg:py-24">
        <nav class="text-sm text-white/40">
          <RouterLink :to="`${prefix}/finance`" class="transition hover:text-lime-300">金融</RouterLink>
          <span class="mx-2 text-white/20">/</span>
          <span class="text-white/70">抵押借贷</span>
        </nav>
        <p class="mt-6 text-[11px] font-bold uppercase tracking-[0.3em] text-sky-300/90">Borrow · 质押借币</p>
        <h1 class="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-[3.25rem] lg:leading-tight">
          抵押借贷
        </h1>
        <p class="mt-5 max-w-2xl text-lg leading-relaxed text-white/55 md:text-xl">
          释放持仓流动性；列表与详情中的借款利率均为参考年化（演示）。
        </p>
      </div>
    </header>

    <div class="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-medium text-white/45">抵押币种</span>
        <select
          v-model="collateral"
          class="rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-base text-white focus:border-sky-400/40 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
        >
          <option value="">全部</option>
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
          <option value="USDT">USDT</option>
          <option value="BNB">BNB</option>
        </select>
      </div>

      <ul class="mt-10 space-y-4">
        <li v-for="p in filtered" :key="p.productId">
          <RouterLink
            :to="`${prefix}/finance/lending/${p.productId}`"
            class="block rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 transition hover:border-sky-400/25 hover:bg-white/[0.04] sm:p-7 lg:rounded-3xl"
          >
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div class="flex flex-wrap items-center gap-3">
                  <span class="text-xl font-semibold text-white">{{ p.productName }}</span>
                  <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="statusClass(p.status)">
                    {{ PRODUCT_STATUS_LABELS[p.status] }}
                  </span>
                </div>
                <p class="mt-3 text-base text-white/55">
                  抵押 {{ p.collateralType }} → 借出 {{ p.loanCurrency }}
                </p>
                <p class="mt-2 text-sm text-white/40">
                  {{ INTEREST_RATE_TYPE_LABELS[p.interestRateType] }} · 可借
                  {{ p.minLoanAmount?.toLocaleString() }} – {{ p.maxLoanAmount?.toLocaleString() }}
                  {{ p.loanCurrency }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs font-medium uppercase tracking-wider text-white/35">参考年化</p>
                <p class="mt-1 text-3xl font-bold text-sky-300 tabular-nums">{{ p.interestRate }}%</p>
              </div>
            </div>
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>
