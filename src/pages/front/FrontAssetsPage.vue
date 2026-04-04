<script setup>
import { computed, ref } from 'vue'
import FrontStrokeIcon from '../../components/front/FrontStrokeIcon.vue'

/** 示例估值，对接接口后替换 */
const hideBalance = ref(false)
const totalBtc = ref('0')
const totalUsd = ref('0')
const todayPnl = ref('0')

const subAccounts = ref([
  {
    key: 'spot',
    title: '币币账户资产',
    btc: '0',
    usd: '0',
    dayPnl: '0'
  },
  {
    key: 'perp',
    title: '永续合约账户资产',
    btc: '0',
    usd: '0',
    dayPnl: '0'
  },
  {
    key: 'delivery',
    title: '交割合约账户资产',
    btc: '0',
    usd: '0',
    dayPnl: '0'
  },
  {
    key: 'earn',
    title: '理财账户资产',
    btc: '0',
    usd: '0',
    dayPnl: '0'
  }
])

const masked = computed(() => hideBalance.value)

function toggleEye() {
  hideBalance.value = !hideBalance.value
}

function displayVal(val) {
  return masked.value ? '****' : val
}
</script>

<template>
  <div>
    <!-- 总资产 -->
    <section
      class="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4 md:p-6"
    >
      <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-sm font-medium text-white/55">账户总资产</h1>
            <button
              type="button"
              class="rounded p-1 text-white/45 hover:bg-white/10 hover:text-white/75"
              :aria-label="hideBalance ? '显示余额' : '隐藏余额'"
              @click="toggleEye"
            >
              <FrontStrokeIcon
                :name="masked ? 'eye-off' : 'eye'"
                size-class="h-[18px] w-[18px]"
              />
            </button>
          </div>
          <p class="mt-3 font-mono text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {{ displayVal(totalBtc) }}
          </p>
          <p class="mt-1 text-sm text-white/45">≈ $ {{ displayVal(totalUsd) }}</p>
          <div class="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/50">
            <span>今日收益: {{ displayVal(todayPnl) }}</span>
            <button
              type="button"
              class="rounded p-1 text-white/40 hover:text-lime-300/90"
              aria-label="刷新估值"
            >
              <FrontStrokeIcon name="refresh" size-class="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 md:shrink-0 md:justify-end">
          <button
            type="button"
            class="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/[0.06]"
          >
            提币
          </button>
          <button
            type="button"
            class="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/[0.06]"
          >
            充币
          </button>
          <button
            type="button"
            class="rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-semibold text-black hover:bg-lime-300"
          >
            划转
          </button>
          <button
            type="button"
            class="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/[0.06]"
          >
            闪兑
          </button>
        </div>
      </div>
    </section>

    <!-- 子账户 -->
    <h2 class="mt-8 text-xs font-medium uppercase tracking-wider text-white/40">账户分布</h2>
    <div class="mt-3 grid gap-3 sm:grid-cols-2">
      <article
        v-for="acc in subAccounts"
        :key="acc.key"
        class="rounded-2xl border border-white/10 bg-white/[0.04] p-3 md:p-5"
      >
        <p class="text-sm font-medium text-white/75">{{ acc.title }}</p>
        <p class="mt-4 font-mono text-2xl font-semibold text-white">
          {{ displayVal(acc.btc) }}
        </p>
        <p class="mt-1 text-xs text-white/45">≈ $ {{ displayVal(acc.usd) }}</p>
        <p class="mt-4 text-xs text-white/40">今日收益: {{ displayVal(acc.dayPnl) }}</p>
      </article>
    </div>
  </div>
</template>
