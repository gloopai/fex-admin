<script setup>
import { computed, ref } from 'vue'
import { createLockedProductsMock, createLockedOrdersMock } from '../../../../admin/mock/liquidityLocked'
import {
  PRODUCT_STATUS,
  productStatusMeta,
  orderStatusMeta,
  ORDER_STATUS,
  lockYieldAnnualPct,
  lockedMinKycRequirementPhrase
} from '../../../../admin/constants/liquidityLocked'

const prefix = '/front'

const search = ref('')
const currencyTab = ref('')
const orderTab = ref('active')
/** Hero 切换：产品列表 / 我的订单 */
const pagePanel = ref('products')

const products = ref(createLockedProductsMock())
const orders = ref(createLockedOrdersMock())

const currenciesFromProducts = computed(() => {
  const set = new Set(products.value.map((p) => p.currency).filter(Boolean))
  return [...set].sort()
})

const filteredProducts = computed(() => {
  let rows = products.value
  if (currencyTab.value) {
    rows = rows.filter((p) => p.currency === currencyTab.value)
  }
  const q = search.value.trim().toLowerCase()
  if (q) {
    rows = rows.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.currency.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    )
  }
  return rows
})

const periodRows = computed(() => {
  const out = []
  for (const p of filteredProducts.value) {
    const periods = p.periods ?? []
    for (const row of periods) {
      out.push({
        key: `${p.id}-${row.days}`,
        product: p,
        period: row,
        annual: lockYieldAnnualPct(row)
      })
    }
  }
  return out
})

const activeOrders = computed(() =>
  orders.value.filter((o) => o.status === ORDER_STATUS.LOCKED)
)
const redeemedOrders = computed(() =>
  orders.value.filter(
    (o) => o.status === ORDER_STATUS.COMPLETED || o.status === ORDER_STATUS.EARLY_REDEEMED
  )
)
const ordersForTab = computed(() => (orderTab.value === 'active' ? activeOrders.value : redeemedOrders.value))

function statusPillClass(status) {
  if (status === PRODUCT_STATUS.ENABLED) return 'bg-emerald-400/15 text-emerald-200'
  if (status === PRODUCT_STATUS.SOLD_OUT) return 'bg-amber-400/15 text-amber-200'
  return 'bg-white/10 text-white/55'
}

function orderStatusClass(status) {
  return orderStatusMeta[status]?.class ?? 'bg-white/10 text-white/60'
}

function detailPath(productId, days) {
  return {
    path: `${prefix}/finance/liquidity/${productId}`,
    query: days != null ? { days: String(days) } : {}
  }
}
</script>

<template>
  <div>
    <header
      class="relative overflow-hidden border-b border-white/[0.06] bg-[#050505]"
    >
      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-[#06100c] to-[#030304]"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl"
        aria-hidden="true"
      />
      <div class="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16 md:py-20 lg:px-10 lg:py-24">
        <nav class="text-sm text-white/40">
          <RouterLink :to="`${prefix}/finance`" class="transition hover:text-lime-300">金融</RouterLink>
          <span class="mx-2 text-white/20">/</span>
          <span class="text-white/70">流动性挖矿</span>
        </nav>
        <p class="mt-6 text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-300/90">Earn · 锁仓理财</p>
        <h1 class="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-[3.25rem] lg:leading-tight">
          流动性挖矿
        </h1>

        <div class="mt-9 w-full max-w-lg" role="tablist" aria-label="页面主入口">
          <div class="flex gap-0 border-b border-white/[0.1]">
            <button
              type="button"
              role="tab"
              :aria-selected="pagePanel === 'products'"
              class="group relative min-h-[3rem] flex-1 px-2 pb-3.5 pt-1 text-center text-[15px] font-semibold tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] sm:min-w-[7.5rem] sm:flex-none sm:px-6 sm:text-base"
              :class="pagePanel === 'products' ? 'text-white' : 'text-white/45 hover:text-white/75'"
              @click="pagePanel = 'products'"
            >
              <span class="relative z-10 inline-block">挖矿产品</span>
              <span
                aria-hidden="true"
                class="pointer-events-none absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-lime-300 shadow-[0_0_14px_rgba(52,211,153,0.45)] transition duration-300 ease-out sm:inset-x-5"
                :class="pagePanel === 'products' ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'"
              />
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="pagePanel === 'orders'"
              class="group relative min-h-[3rem] flex-1 px-2 pb-3.5 pt-1 text-center text-[15px] font-semibold tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] sm:min-w-[7.5rem] sm:flex-none sm:px-6 sm:text-base"
              :class="pagePanel === 'orders' ? 'text-white' : 'text-white/45 hover:text-white/75'"
              @click="pagePanel = 'orders'"
            >
              <span class="relative z-10 inline-block">我的订单</span>
              <span
                aria-hidden="true"
                class="pointer-events-none absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-lime-300 shadow-[0_0_14px_rgba(52,211,153,0.45)] transition duration-300 ease-out sm:inset-x-5"
                :class="pagePanel === 'orders' ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'"
              />
            </button>
          </div>
        </div>

        <!-- 订单状态筛选放在 Hero，避免与主 Tab 叠成「两层导航」 -->
        <div
          v-if="pagePanel === 'orders'"
          class="mt-5 flex flex-wrap items-center gap-3"
        >
          <div
            class="inline-flex rounded-full border border-white/[0.1] bg-black/30 p-1 shadow-inner backdrop-blur-sm"
            role="tablist"
            aria-label="订单状态"
          >
            <button
              type="button"
              role="tab"
              :aria-selected="orderTab === 'active'"
              class="min-h-[2.5rem] min-w-[5.75rem] rounded-full px-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
              :class="
                orderTab === 'active'
                  ? 'bg-emerald-500/25 text-emerald-100 shadow-sm ring-1 ring-emerald-400/20'
                  : 'text-white/45 hover:bg-white/[0.06] hover:text-white/80'
              "
              @click="orderTab = 'active'"
            >
              进行中
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="orderTab === 'redeemed'"
              class="min-h-[2.5rem] min-w-[5.75rem] rounded-full px-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
              :class="
                orderTab === 'redeemed'
                  ? 'bg-emerald-500/25 text-emerald-100 shadow-sm ring-1 ring-emerald-400/20'
                  : 'text-white/45 hover:bg-white/[0.06] hover:text-white/80'
              "
              @click="orderTab = 'redeemed'"
            >
              已赎回
            </button>
          </div>
        </div>

        <p v-if="pagePanel === 'products'" class="mt-6 max-w-2xl text-lg leading-relaxed text-white/55 md:text-xl">
          按币种浏览产品；每一行对应一个锁定期档位。收益为年化口径（演示数据）。
        </p>
        <p v-else class="mt-4 max-w-2xl text-sm leading-relaxed text-white/45 sm:text-[15px]">
          下方为演示列表，与真实账户无关；接入接口后将按登录用户展示。
        </p>
      </div>
    </header>

    <div
      class="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"
      :class="pagePanel === 'orders' ? 'py-6 sm:py-8 lg:py-10' : 'py-10 sm:py-14 lg:py-16'"
    >
      <template v-if="pagePanel === 'products'">
        <label class="block max-w-xl">
          <span class="sr-only">搜索产品</span>
          <input
            v-model="search"
            type="search"
            placeholder="搜索名称、币种或产品 ID"
            class="w-full rounded-2xl border border-white/[0.1] bg-white/[0.04] px-5 py-3.5 text-base text-white placeholder:text-white/35 focus:border-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
          />
        </label>

        <div class="mt-8">
          <p class="text-xs font-semibold uppercase tracking-wider text-white/35">按币种</p>
          <div class="-mx-1 mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              class="rounded-full border px-4 py-2 text-sm font-medium transition"
              :class="
                currencyTab === ''
                  ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-200'
                  : 'border-white/[0.1] bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white/80'
              "
              @click="currencyTab = ''"
            >
              全部
            </button>
            <button
              v-for="c in currenciesFromProducts"
              :key="c"
              type="button"
              class="rounded-full border px-4 py-2 text-sm font-medium transition"
              :class="
                currencyTab === c
                  ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-200'
                  : 'border-white/[0.1] bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white/80'
              "
              @click="currencyTab = c"
            >
              {{ c }}
            </button>
          </div>
        </div>

        <div class="mt-10 overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.02] lg:rounded-3xl">
            <table class="min-w-[640px] w-full border-collapse text-left text-sm">
              <thead>
                <tr class="border-b border-white/[0.08] bg-white/[0.04] text-[11px] font-semibold uppercase tracking-wide text-white/45">
                  <th class="px-5 py-3.5 font-semibold">币对 / 产品</th>
                  <th class="px-4 py-3.5 font-semibold">参考年化</th>
                  <th class="px-4 py-3.5 font-semibold">锁仓期限</th>
                  <th class="hidden px-4 py-3.5 font-semibold md:table-cell">申购区间</th>
                  <th class="px-5 py-3.5 text-right font-semibold">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="r in periodRows"
                  :key="r.key"
                  class="border-b border-white/[0.05] transition hover:bg-white/[0.03]"
                >
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      <span class="text-2xl leading-none" aria-hidden="true">{{ r.product.icon }}</span>
                      <div class="min-w-0">
                        <div class="flex flex-wrap items-center gap-2">
                          <span class="font-semibold text-white">{{ r.product.name }}</span>
                          <span
                            class="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            :class="statusPillClass(r.product.status)"
                          >
                            {{ productStatusMeta[r.product.status]?.label ?? r.product.status }}
                          </span>
                        </div>
                        <p class="mt-0.5 text-xs text-white/40">
                          {{ r.product.currency }} · VIP{{ r.product.minVipLevel }} ·
                          {{ lockedMinKycRequirementPhrase(r.product.minKycLevel) }}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-4">
                    <span class="text-base font-bold tabular-nums text-emerald-300">{{ r.annual.toFixed(2) }}%</span>
                  </td>
                  <td class="px-4 py-4 tabular-nums text-white/85">{{ r.period.days }} 天</td>
                  <td class="hidden px-4 py-4 tabular-nums text-white/50 md:table-cell">
                    {{ r.period.minAmount }} – {{ r.period.maxAmount }} {{ r.product.currency }}
                  </td>
                  <td class="px-5 py-4 text-right">
                    <RouterLink
                      v-if="r.product.status === PRODUCT_STATUS.ENABLED"
                      :to="detailPath(r.product.id, r.period.days)"
                      class="inline-flex items-center justify-center rounded-xl bg-violet-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-400 sm:text-sm"
                    >
                      立即挖矿
                    </RouterLink>
                    <RouterLink
                      v-else
                      :to="detailPath(r.product.id, r.period.days)"
                      class="inline-flex items-center justify-center rounded-xl border border-white/[0.15] bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white/55 sm:text-sm"
                    >
                      查看详情
                    </RouterLink>
                  </td>
                </tr>
              </tbody>
            </table>
        </div>

        <p v-if="periodRows.length === 0" class="py-16 text-center text-base text-white/45">暂无匹配档位</p>
      </template>

      <section
        v-else
        id="my-liquidity-orders"
        class="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] lg:rounded-3xl"
        aria-label="锁仓订单列表"
      >
        <div
          v-if="ordersForTab.length > 0"
          class="flex items-center justify-end border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5 sm:px-5"
        >
          <span class="text-xs tabular-nums text-white/40">本页 {{ ordersForTab.length }} 条（演示）</span>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-[720px] w-full border-collapse text-left text-sm">
            <thead>
              <tr class="border-b border-white/[0.06] bg-white/[0.03] text-[11px] font-semibold uppercase tracking-wide text-white/40">
                <th class="px-4 py-3">产品名称</th>
                <th class="px-4 py-3">锁仓期限</th>
                <th class="px-4 py-3">下单时间</th>
                <th class="px-4 py-3">金额</th>
                <th class="px-4 py-3">到期时间</th>
                <th class="px-4 py-3">收益</th>
                <th class="px-4 py-3">状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in ordersForTab" :key="o.id" class="border-b border-white/[0.05]">
                <td class="px-4 py-3 text-white/90">{{ o.productName }}</td>
                <td class="px-4 py-3 tabular-nums text-white/70">{{ o.lockDays }} 天</td>
                <td class="px-4 py-3 tabular-nums text-white/50">{{ o.lockedAt }}</td>
                <td class="px-4 py-3 tabular-nums text-white/70">{{ o.amount }} {{ o.currency }}</td>
                <td class="px-4 py-3 tabular-nums text-white/50">{{ o.unlockAt }}</td>
                <td class="px-4 py-3 tabular-nums text-emerald-300/90">{{ o.totalInterest }} {{ o.currency }}</td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    :class="orderStatusClass(o.status)"
                  >
                    {{ orderStatusMeta[o.status]?.label ?? o.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="ordersForTab.length === 0" class="py-14 text-center text-sm text-white/40">当前分类暂无订单</p>
      </section>
    </div>
  </div>
</template>
