<script setup>
import { computed, ref } from 'vue'
import { getVipLevelByLevel } from '../../../admin/mock/vip'
import FrontStrokeIcon from '../../../components/front/FrontStrokeIcon.vue'

const vipLevel = ref(2)
const vipMeta = computed(() => getVipLevelByLevel(vipLevel.value))

/** 近 30 日现货 USDT 折合成交量（示例） */
const volume30dUsd = ref(2_860_000)
const nextTierVolume = 5_000_000
const progress = computed(() =>
  Math.min(100, Math.round((volume30dUsd.value / nextTierVolume) * 100))
)

const tiers = [
  { level: 'VIP 0', maker: '0.10%', taker: '0.10%', note: '默认' },
  { level: 'VIP 1', maker: '0.08%', taker: '0.09%', note: '' },
  { level: 'VIP 2', maker: '0.06%', taker: '0.08%', note: '当前档位' },
  { level: 'VIP 3', maker: '0.04%', taker: '0.07%', note: '' }
]
</script>

<template>
  <div>
    <header class="mb-5 md:mb-6">
      <h1 class="text-2xl font-bold tracking-tight text-white md:text-3xl">费率与 VIP</h1>
      <p class="mt-1 text-sm text-white/55">
        手续费与 VIP 等级、近 30 日交易量挂钩，具体以平台规则与合约说明为准。
      </p>
    </header>

    <div class="flex flex-col gap-5 md:gap-6">
    <section
      class="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-950/30 to-[#121212] p-4 md:flex md:items-center md:justify-between md:p-6"
    >
      <div class="flex items-start gap-4">
        <div
          class="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-amber-400/35 bg-amber-400/15 text-amber-200/90"
          aria-hidden="true"
        >
          <img
            v-if="vipMeta?.iconUrl"
            :src="vipMeta.iconUrl"
            alt=""
            class="h-9 w-9 object-contain"
            loading="lazy"
          />
          <FrontStrokeIcon v-else name="star" size-class="h-7 w-7 text-amber-200/90" />
        </div>
        <div>
          <p class="text-xs uppercase tracking-wider text-amber-200/70">当前等级</p>
          <p class="mt-1 text-2xl font-bold text-white">VIP {{ vipLevel }}</p>
          <p class="mt-2 text-xs text-white/50">
            现货 Maker / Taker 示例：
            <span class="text-white/75">0.06% / 0.08%</span>
          </p>
        </div>
      </div>
      <div class="mt-5 min-w-[240px] md:mt-0">
        <p class="text-xs text-white/50">近 30 日现货成交量（USDT 折合）</p>
        <p class="mt-1 text-lg font-semibold tabular-nums text-lime-200">
          {{ volume30dUsd.toLocaleString() }}
        </p>
        <div class="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            class="h-full rounded-full bg-gradient-to-r from-lime-400/90 to-lime-300/60 transition-[width]"
            :style="{ width: `${progress}%` }"
          />
        </div>
        <p class="mt-2 text-[11px] text-white/40">
          距离 VIP 3 参考门槛约 {{ (nextTierVolume - volume30dUsd).toLocaleString() }} USDT 成交量
        </p>
      </div>
    </section>

    <section class="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      <div class="border-b border-white/10 px-3 py-3 md:px-4">
        <h2 class="text-sm font-semibold text-white/90">现货阶梯费率（示例）</h2>
      </div>
      <div class="hidden md:grid md:grid-cols-4 md:gap-3 md:border-b md:border-white/10 md:px-4 md:py-2.5">
        <span class="text-xs font-medium text-white/45">等级</span>
        <span class="text-xs font-medium text-white/45">Maker</span>
        <span class="text-xs font-medium text-white/45">Taker</span>
        <span class="text-xs font-medium text-white/45">说明</span>
      </div>
      <div
        v-for="row in tiers"
        :key="row.level"
        class="border-b border-white/[0.06] px-3 py-3 last:border-0 md:grid md:grid-cols-4 md:items-center md:gap-3 md:px-4 md:py-3"
        :class="row.note === '当前档位' ? 'bg-lime-400/[0.06]' : ''"
      >
        <p class="text-sm font-medium text-white/90">{{ row.level }}</p>
        <p class="mt-1 font-mono text-sm text-white/70 md:text-white/75">{{ row.maker }}</p>
        <p class="mt-1 font-mono text-sm text-white/70 md:mt-0">{{ row.taker }}</p>
        <p class="mt-1 text-xs text-white/45 md:mt-0">{{ row.note || '—' }}</p>
      </div>
    </section>
    </div>
  </div>
</template>
