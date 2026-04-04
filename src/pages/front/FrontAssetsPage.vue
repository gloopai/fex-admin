<script setup>
import { computed, ref } from 'vue'
import FrontStrokeIcon from '../../components/front/FrontStrokeIcon.vue'

const prefix = '/front'

/** 示例估值，对接接口后替换 */
const hideBalance = ref(false)
const totalBtc = ref('0')
const totalUsd = ref('0')
const todayPnl = ref('0')

/** 移动端底部四宫格（对齐常见交易所 App） */
const assetQuickActions = [
  {
    key: 'withdraw',
    label: '提币',
    icon: 'arrow-right',
    to: `${prefix}/personal-center/withdraw-addresses`
  },
  {
    key: 'deposit',
    label: '充币',
    icon: 'arrow-left',
    to: `${prefix}/personal-center/assets`
  },
  {
    key: 'transfer',
    label: '划转',
    icon: 'arrows-swap',
    to: `${prefix}/personal-center/assets`
  },
  {
    key: 'convert',
    label: '闪兑',
    icon: 'bolt',
    to: `${prefix}/personal-center/assets`
  }
]

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
  <div class="text-white">
    <div class="flex flex-col gap-5 md:gap-6">
    <!-- ——— 移动端：总资卡片 + 卡片外四宫格图标（参考主流 App） ——— -->
    <div class="flex flex-col gap-5 md:hidden">
      <section
        class="rounded-2xl bg-[#1c1c1e] px-4 py-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
        aria-label="账户总资产"
      >
        <div class="flex items-center gap-2">
          <h1 class="text-[13px] font-normal text-white/45">账户总资产</h1>
          <button
            type="button"
            class="-mr-1 rounded-md p-1 text-white/40 transition hover:bg-white/10 hover:text-white/75 [-webkit-tap-highlight-color:transparent]"
            :aria-label="hideBalance ? '显示余额' : '隐藏余额'"
            @click="toggleEye"
          >
            <FrontStrokeIcon
              :name="masked ? 'eye-off' : 'eye'"
              size-class="h-[1.125rem] w-[1.125rem]"
            />
          </button>
        </div>
        <p class="mt-4 font-mono text-[2rem] font-semibold leading-none tracking-tight text-white">
          {{ displayVal(totalBtc) }}
        </p>
        <p class="mt-2 text-[13px] text-white/38">≈ $ {{ displayVal(totalUsd) }}</p>
        <div class="mt-4 flex items-center gap-2 text-[13px] text-white/45">
          <span>今日收益: {{ displayVal(todayPnl) }}</span>
          <button
            type="button"
            class="-m-1 rounded-md p-1 text-white/35 transition hover:bg-white/10 hover:text-white/70 [-webkit-tap-highlight-color:transparent]"
            aria-label="刷新估值"
          >
            <FrontStrokeIcon name="refresh" size-class="h-[1.125rem] w-[1.125rem]" />
          </button>
        </div>
      </section>

      <nav
        class="grid grid-cols-4 gap-x-1 gap-y-2 px-0.5"
        aria-label="资产快捷操作"
      >
        <RouterLink
          v-for="a in assetQuickActions"
          :key="a.key"
          :to="a.to"
          class="flex flex-col items-center gap-2 [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <span
            class="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] text-white transition active:scale-[0.97] hover:border-white/[0.18] hover:bg-white/[0.07]"
          >
            <FrontStrokeIcon :name="a.icon" size-class="h-[1.35rem] w-[1.35rem]" />
          </span>
          <span class="max-w-[4.5rem] text-center text-[11px] font-medium leading-tight text-white/88">
            {{ a.label }}
          </span>
        </RouterLink>
      </nav>
    </div>

    <!-- ——— 桌面端：渐变卡 + 横排按钮 ——— -->
    <section
      class="hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4 md:block md:p-6"
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
              <FrontStrokeIcon :name="masked ? 'eye-off' : 'eye'" size-class="h-[18px] w-[18px]" />
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
          <RouterLink
            :to="`${prefix}/personal-center/withdraw-addresses`"
            class="rounded-xl border border-white/[0.11] px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.06]"
          >
            提币
          </RouterLink>
          <button
            type="button"
            class="rounded-xl border border-white/[0.11] px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/[0.06]"
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
            class="rounded-xl border border-white/[0.11] px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/[0.06]"
          >
            闪兑
          </button>
        </div>
      </div>
    </section>

    <!-- 子账户 -->
    <div class="flex flex-col gap-3">
    <h2 class="text-xs font-medium uppercase tracking-wider text-white/40">
      账户分布
    </h2>
    <div class="grid gap-3 sm:grid-cols-2">
      <article
        v-for="acc in subAccounts"
        :key="acc.key"
        class="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-3 md:p-5"
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
    </div>
  </div>
</template>
