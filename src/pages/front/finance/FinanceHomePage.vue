<script setup>
import { computed } from 'vue'
import { createLockedProductsMock } from '../../../admin/mock/liquidityLocked'
import { mockProducts as lendingProducts } from '../../../admin/mock/cryptoLending'
import { createAiQuantProductsMock } from '../../../admin/mock/aiQuant'
import { PRODUCT_STATUS as LOCK_PRODUCT_STATUS } from '../../../admin/constants/liquidityLocked'
import { PRODUCT_STATUS as LEND_STATUS } from '../../../admin/constants/cryptoLending'
import { PRODUCT_STATUS as AIQ_STATUS } from '../../../admin/constants/aiQuant'
import { getFrontFinanceChannelEntries } from '../../../constants/frontNav'

const prefix = '/front'

const channels = computed(() => getFrontFinanceChannelEntries(prefix))

const liquidityCount = computed(
  () => createLockedProductsMock().filter((p) => p.status === LOCK_PRODUCT_STATUS.ENABLED).length
)
const lendingCount = computed(() => lendingProducts.filter((p) => p.status === LEND_STATUS.ACTIVE).length)
const aiCount = computed(
  () => createAiQuantProductsMock().filter((p) => p.status === AIQ_STATUS.ENABLED).length
)

const statByKey = computed(() => ({
  liquidity: `${liquidityCount.value} 款在售`,
  lending: `${lendingCount.value} 款借贷产品`,
  'ai-quant': `${aiCount.value} 款策略`
}))

const channelVisual = {
  liquidity: {
    mesh: 'from-emerald-500/30 via-teal-600/10 to-transparent',
    border: 'group-hover:border-emerald-400/35',
    glow: 'bg-emerald-400/20'
  },
  lending: {
    mesh: 'from-sky-500/25 via-blue-600/10 to-transparent',
    border: 'group-hover:border-sky-400/35',
    glow: 'bg-sky-400/18'
  },
  'ai-quant': {
    mesh: 'from-lime-500/28 via-emerald-600/12 to-transparent',
    border: 'group-hover:border-lime-400/35',
    glow: 'bg-lime-400/20'
  }
}
</script>

<template>
  <div class="relative overflow-hidden">
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        class="absolute -left-[20%] top-0 h-[min(85vh,720px)] w-[70%] rounded-full bg-gradient-to-br from-lime-500/12 via-emerald-600/5 to-transparent blur-3xl"
      />
      <div
        class="absolute -right-[10%] top-1/4 h-[min(70vh,560px)] w-[55%] rounded-full bg-gradient-to-bl from-lime-500/10 via-emerald-600/5 to-transparent blur-3xl"
      />
      <div
        class="absolute bottom-0 left-1/3 h-40 w-[120%] -translate-x-1/2 bg-gradient-to-t from-[#030304] to-transparent"
      />
    </div>

    <section class="relative mx-auto max-w-7xl px-5 pb-10 pt-8 sm:px-8 sm:pb-12 sm:pt-10 lg:px-10 lg:pb-14 lg:pt-12">
      <p
        class="text-center text-[11px] font-bold uppercase tracking-[0.35em] text-lime-400/85 sm:text-left"
      >
        CryptoX Finance
      </p>
      <h1
        class="mt-4 text-center text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.08] tracking-tight text-white text-balance sm:text-left"
      >
        一站配置
        <span class="bg-gradient-to-r from-lime-200 to-emerald-300/90 bg-clip-text text-transparent">
          数字资产金融
        </span>
      </h1>

      <div
        class="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:mt-14 lg:grid-cols-3 lg:gap-8"
      >
        <RouterLink
          v-for="ch in channels"
          :key="ch.key"
          :to="ch.to"
          class="group relative flex min-h-[240px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.85)] transition [-webkit-tap-highlight-color:transparent] sm:min-h-[260px] sm:p-8 lg:rounded-3xl lg:p-9"
          :class="channelVisual[ch.key]?.border"
        >
          <div
            class="pointer-events-none absolute -right-4 -top-4 h-40 w-40 rounded-full opacity-70 blur-2xl transition duration-500 group-hover:opacity-100"
            :class="[channelVisual[ch.key]?.glow, channelVisual[ch.key]?.mesh]"
            aria-hidden="true"
          />
          <div class="relative flex flex-1 flex-col">
            <span
              class="inline-flex w-fit rounded-full border border-white/[0.08] bg-black/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-lime-300/90"
            >
              {{ ch.tag }}
            </span>
            <h2 class="mt-5 text-2xl font-bold tracking-tight text-white sm:text-[1.65rem]">
              {{ ch.label }}
            </h2>
            <p class="mt-3 flex-1 text-sm leading-relaxed text-white/50 sm:text-[0.9375rem]">
              {{ ch.desc }}
            </p>
            <p class="mt-6 text-xs font-medium uppercase tracking-wider text-white/35">
              {{ statByKey[ch.key] }}
            </p>
            <span
              class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-lime-300 transition group-hover:gap-3"
            >
              进入频道
              <span class="text-lg leading-none" aria-hidden="true">→</span>
            </span>
          </div>
        </RouterLink>
      </div>

      <div
        class="mx-auto mt-14 max-w-3xl rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/[0.07] to-transparent px-5 py-4 text-center text-sm leading-relaxed text-amber-100/90 sm:mt-16 sm:text-left"
        role="note"
      >
        <span class="font-semibold text-amber-200">风险提示：</span>
        数字资产与策略收益波动较大，锁仓、借贷及量化产品均可能造成本金损失。参与前请确认理解费率、赎回与清算机制。
      </div>
    </section>
  </div>
</template>
