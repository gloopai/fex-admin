<script setup>
import { computed, onUnmounted, ref, watch, watchEffect } from 'vue'
import FrontAdaptiveSelect from '../../../components/front/FrontAdaptiveSelect.vue'
import FrontLimeButton from '../../../components/front/FrontLimeButton.vue'
import FrontStrokeIcon from '../../../components/front/FrontStrokeIcon.vue'

function optionLabel(options, value) {
  return options.find((o) => o.value === value)?.label ?? ''
}

const prefix = '/front'

/** 每页条数（桌面分页） */
const pageSize = ref(10)
/** 移动端每次追加条数 */
const MOBILE_CHUNK = 12

/** 已应用条件（列表、摘要、分页以此为准） */
const appliedAccountRole = ref('real')
const appliedLedgerType = ref('all')
const appliedAccountKind = ref('spot')
const appliedCurrencyCode = ref('')

/** 表单草稿（桌面与筛选弹层共用，点「完成」/「应用筛选」后写入 applied*） */
const draftAccountRole = ref('real')
const draftLedgerType = ref('all')
const draftAccountKind = ref('spot')
const draftCurrencyCode = ref('')

const page = ref(1)
const mobileLoadedCount = ref(MOBILE_CHUNK)
const loadMoreSentinel = ref(null)
const filterSheetOpen = ref(false)

const accountRoleOptions = [
  { value: 'real', label: '实际账户' },
  { value: 'demo', label: '模拟账户' }
]

const ledgerTypeOptions = [
  { value: 'all', label: '全部' },
  { value: 'deposit', label: '充币' },
  { value: 'withdraw', label: '提现' },
  { value: 'trade', label: '交易' },
  { value: 'transfer', label: '划转' },
  { value: 'swap', label: '闪兑' }
]

const accountKindOptions = [
  { value: 'spot', label: '币币' },
  { value: 'futures', label: '合约' },
  { value: 'margin', label: '杠杆' }
]

const currencyOptions = [
  { value: '', label: '请选择' },
  { value: 'USDT', label: 'USDT' },
  { value: 'BTC', label: 'BTC' },
  { value: 'ETH', label: 'ETH' }
]

function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatDateTime(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

/** 可筛选的本地示例数据，接入接口后替换 */
function buildDemoRows() {
  const types = ['deposit', 'withdraw', 'trade', 'transfer', 'swap']
  const kinds = ['spot', 'futures', 'margin']
  const currencies = ['USDT', 'BTC', 'ETH']
  const roles = ['real', 'demo']
  const rows = []
  const base = new Date('2026-03-28T09:30:00').getTime()

  for (let i = 0; i < 52; i++) {
    const type = types[i % types.length]
    const accountKindR = kinds[i % kinds.length]
    const currency = currencies[i % currencies.length]
    const role = i % 7 === 0 ? 'demo' : 'real'

    let deltaNum
    if (type === 'deposit') deltaNum = 80 + (i % 12) * 125 + (i % 3) * 17.5
    else if (type === 'withdraw') deltaNum = -(40 + (i % 9) * 55.2)
    else if (type === 'trade') deltaNum = (i % 2 === 0 ? 1 : -1) * (0.5 + (i % 20) * 13.8)
    else if (type === 'transfer') deltaNum = (i % 2 === 0 ? 1 : -1) * (25 + (i % 8) * 12)
    else deltaNum = (i % 2 === 0 ? 1 : -1) * (3.2 + (i % 6) * 6.1)

    const decimals = currency === 'USDT' ? 2 : 6
    const sign = deltaNum >= 0 ? '+' : ''
    const delta = `${sign}${deltaNum.toFixed(decimals)} ${currency}`
    const balBase = 2000 + i * 41.37 + (currency === 'BTC' ? 0.02 * i : currency === 'ETH' ? 0.15 * i : 0)
    const balance = `${balBase.toFixed(decimals)} ${currency}`

    const t = new Date(base - i * 47 * 60 * 1000 - (i % 5) * 3600000)
    rows.push({
      role,
      type,
      accountKind: accountKindR,
      currency,
      delta,
      balance,
      time: formatDateTime(t)
    })
  }

  return rows
}

const allRows = ref(buildDemoRows())

const filteredRows = computed(() =>
  allRows.value.filter((row) => {
    if (row.role !== appliedAccountRole.value) return false
    if (appliedLedgerType.value !== 'all' && row.type !== appliedLedgerType.value) return false
    if (row.accountKind !== appliedAccountKind.value) return false
    if (appliedCurrencyCode.value && row.currency !== appliedCurrencyCode.value) return false
    return true
  })
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value))
)

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

const mobileRows = computed(() => filteredRows.value.slice(0, mobileLoadedCount.value))

const mobileHasMore = computed(
  () => mobileLoadedCount.value < filteredRows.value.length
)

const hasRows = computed(() => filteredRows.value.length > 0)

const mobileFilterSummary = computed(() => {
  const cur = appliedCurrencyCode.value
    ? optionLabel(currencyOptions, appliedCurrencyCode.value)
    : '全部币种'
  return [
    optionLabel(accountRoleOptions, appliedAccountRole.value),
    optionLabel(ledgerTypeOptions, appliedLedgerType.value),
    optionLabel(accountKindOptions, appliedAccountKind.value),
    cur
  ].join(' · ')
})

function syncDraftFromApplied() {
  draftAccountRole.value = appliedAccountRole.value
  draftLedgerType.value = appliedLedgerType.value
  draftAccountKind.value = appliedAccountKind.value
  draftCurrencyCode.value = appliedCurrencyCode.value
}

function commitDraftToApplied() {
  appliedAccountRole.value = draftAccountRole.value
  appliedLedgerType.value = draftLedgerType.value
  appliedAccountKind.value = draftAccountKind.value
  appliedCurrencyCode.value = draftCurrencyCode.value
}

function closeFilterSheetWithoutApply() {
  syncDraftFromApplied()
  filterSheetOpen.value = false
}

function confirmFilterSheet() {
  commitDraftToApplied()
  filterSheetOpen.value = false
}

watch(
  [appliedAccountRole, appliedLedgerType, appliedAccountKind, appliedCurrencyCode],
  () => {
    page.value = 1
    mobileLoadedCount.value = MOBILE_CHUNK
  }
)

watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp
})

watch(filterSheetOpen, (v) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = v ? 'hidden' : ''
})

onUnmounted(() => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = ''
})

function loadMoreMobile() {
  if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
    return
  }
  if (!mobileHasMore.value) return
  mobileLoadedCount.value = Math.min(
    mobileLoadedCount.value + MOBILE_CHUNK,
    filteredRows.value.length
  )
}

watchEffect((onCleanup) => {
  const el = loadMoreSentinel.value
  if (!el || typeof IntersectionObserver === 'undefined') return

  const obs = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) return
      loadMoreMobile()
    },
    { root: null, rootMargin: '120px', threshold: 0 }
  )
  obs.observe(el)
  onCleanup(() => obs.disconnect())
})

function formatLedgerType(v) {
  const m = Object.fromEntries(ledgerTypeOptions.map((o) => [o.value, o.label]))
  return m[v] ?? v
}

function formatRole(v) {
  return v === 'demo' ? '模拟账户' : '实际账户'
}

function formatAccountKind(v) {
  const m = Object.fromEntries(accountKindOptions.map((o) => [o.value, o.label]))
  return m[v] ?? v
}

function prevPage() {
  if (page.value > 1) page.value -= 1
}

function nextPage() {
  if (page.value < totalPages.value) page.value += 1
}
</script>

<template>
  <div class="pb-3">
    <header class="mb-4 md:mb-8">
      <h1 class="text-xl font-bold tracking-tight text-white md:text-2xl lg:text-3xl">账变记录</h1>
      <p class="mt-1 hidden text-sm text-white/55 sm:block">
        选好条件后点击「应用筛选」查询；当前为示例数据，接入接口后替换。
      </p>
      <p class="mt-1 text-xs leading-relaxed text-white/45 sm:hidden">
        「筛选」内改条件后点「完成」生效；列表下滑加载更多。
      </p>
    </header>

    <!-- 移动端：摘要 + 打开筛选面板 -->
    <div
      class="sticky top-0 z-30 mb-3 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0b0e11]/92 px-2.5 py-2 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md lg:hidden"
    >
      <p class="min-w-0 flex-1 truncate text-[11px] leading-relaxed text-white/55">
        <span class="tabular-nums text-white/40">{{ filteredRows.length }} 条</span>
        <span class="mx-1 text-white/25">|</span>
        {{ mobileFilterSummary }}
      </p>
      <button
        type="button"
        class="flex shrink-0 items-center gap-1 rounded-lg border border-white/[0.1] bg-white/[0.05] px-2.5 py-1.5 text-xs font-medium text-[#eaecef] [-webkit-tap-highlight-color:transparent] active:bg-white/[0.08]"
        aria-haspopup="dialog"
        :aria-expanded="filterSheetOpen"
        @click="filterSheetOpen = true"
      >
        <svg
          class="h-3.5 w-3.5 text-white/55"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 6h16M8 12h8m-5 6h2"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
          />
        </svg>
        筛选
      </button>
    </div>

    <!-- 桌面：筛选在正文流内 -->
    <section
      class="mb-4 hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 sm:mb-5 sm:border-0 sm:bg-transparent sm:p-0 lg:block"
      aria-label="筛选条件"
    >
      <div class="flex flex-row items-end gap-3">
        <div
          class="grid min-w-0 flex-1 grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4 lg:gap-4"
        >
          <FrontAdaptiveSelect
            v-model="draftAccountRole"
            field-key="account-role"
            label="账户角色"
            :options="accountRoleOptions"
            aria-label="账户角色"
          />
          <FrontAdaptiveSelect
            v-model="draftLedgerType"
            field-key="ledger-type"
            label="账变类型"
            :options="ledgerTypeOptions"
            aria-label="账变类型"
          />
          <FrontAdaptiveSelect
            v-model="draftAccountKind"
            field-key="account-kind"
            label="账户类型"
            :options="accountKindOptions"
            aria-label="账户类型"
          />
          <FrontAdaptiveSelect
            v-model="draftCurrencyCode"
            field-key="currency"
            label="币种类型"
            :options="currencyOptions"
            aria-label="币种类型"
          />
        </div>
        <button
          type="button"
          class="inline-flex shrink-0 items-center justify-center rounded-lg bg-lime-400 px-3 py-1.5 text-xs font-semibold text-black transition [-webkit-tap-highlight-color:transparent] hover:bg-lime-300 active:bg-lime-500/85"
          @click="commitDraftToApplied"
        >
          应用筛选
        </button>
      </div>
    </section>

    <!-- 列表区 -->
    <div
      class="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] max-lg:rounded-xl"
    >
      <template v-if="!hasRows">
        <div
          class="flex min-h-[11rem] flex-col items-center justify-center gap-2 px-4 py-10 sm:min-h-[12.5rem]"
        >
          <p class="rounded-xl border border-white/[0.06] bg-[#0a0d11]/90 px-6 py-4 text-sm text-white/45">
            暂无数据
          </p>
          <p class="text-center text-[11px] text-white/35 lg:hidden">暂无符合筛选的记录</p>
        </div>
      </template>

      <template v-else>
        <div class="hidden overflow-x-auto lg:block">
          <table class="min-w-[720px] w-full border-collapse text-left text-sm">
            <thead>
              <tr class="border-b border-white/[0.06]">
                <th
                  class="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-white/45"
                >
                  账户角色
                </th>
                <th
                  class="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-white/45"
                >
                  账变类型
                </th>
                <th
                  class="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-white/45"
                >
                  账户类型
                </th>
                <th
                  class="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-white/45"
                >
                  变化金额
                </th>
                <th
                  class="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-white/45"
                >
                  账变余额
                </th>
                <th
                  class="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-white/45"
                >
                  时间
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, idx) in pagedRows"
                :key="`d-${idx}-${row.time}`"
                class="border-b border-white/[0.04] last:border-0"
              >
                <td class="px-4 py-3.5 text-white/88">{{ formatRole(row.role) }}</td>
                <td class="px-4 py-3.5 text-white/88">{{ formatLedgerType(row.type) }}</td>
                <td class="px-4 py-3.5 text-white/88">{{ formatAccountKind(row.accountKind) }}</td>
                <td class="px-4 py-3.5 tabular-nums text-white/88">{{ row.delta }}</td>
                <td class="px-4 py-3.5 tabular-nums text-white/88">{{ row.balance }}</td>
                <td class="px-4 py-3.5 text-white/55">{{ row.time }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="divide-y divide-white/[0.06] lg:hidden">
          <article
            v-for="(row, idx) in mobileRows"
            :key="`m-${idx}-${row.time}`"
            class="touch-manipulation px-3 py-4 active:bg-white/[0.03]"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-medium text-white/90">
                  {{ formatLedgerType(row.type) }}
                </p>
                <p class="mt-0.5 text-[11px] text-white/45">
                  {{ formatRole(row.role) }} · {{ formatAccountKind(row.accountKind) }} · {{ row.currency }}
                </p>
              </div>
              <time
                class="shrink-0 text-right text-[11px] tabular-nums text-white/40"
                :datetime="row.time"
              >
                {{ row.time }}
              </time>
            </div>
            <dl class="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              <div>
                <dt class="text-white/38">变化金额</dt>
                <dd class="mt-0.5 font-medium tabular-nums text-lime-200/90">{{ row.delta }}</dd>
              </div>
              <div>
                <dt class="text-white/38">账变余额</dt>
                <dd class="mt-0.5 font-medium tabular-nums text-white/85">{{ row.balance }}</dd>
              </div>
            </dl>
          </article>
        </div>

        <!-- 移动端：滚动到底自动加载 -->
        <div
          ref="loadMoreSentinel"
          class="border-t border-white/[0.05] px-3 py-4 text-center lg:hidden"
        >
          <p v-if="mobileHasMore" class="text-[11px] text-white/40">向下滑动加载更多</p>
          <p v-else class="text-[11px] text-white/32">已显示全部 {{ filteredRows.length }} 条</p>
        </div>
      </template>

      <!-- 桌面分页：淡底 + 绿边当前状态 -->
      <div
        class="hidden border-t border-white/[0.06] px-3 py-3 touch-manipulation sm:px-4 lg:flex lg:flex-row lg:items-center lg:justify-between"
      >
        <p class="text-xs text-white/40">
          共 {{ filteredRows.length }} 条 · 第 {{ page }} / {{ totalPages }} 页
        </p>
        <div class="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.1] text-sm text-white/55 transition hover:border-lime-400/25 hover:text-white/80 active:bg-white/[0.05] disabled:pointer-events-none disabled:opacity-30"
            :disabled="page <= 1"
            aria-label="上一页"
            @click="prevPage"
          >
            &lt;
          </button>

          <span
            class="inline-flex min-h-8 min-w-[2.25rem] items-center justify-center rounded-lg border border-lime-400/35 bg-lime-400/[0.06] px-2 text-sm font-medium tabular-nums text-[#eaecef]"
            aria-current="page"
          >
            {{ page }}
          </span>

          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.1] text-sm text-white/55 transition hover:border-lime-400/25 hover:text-white/80 active:bg-white/[0.05] disabled:pointer-events-none disabled:opacity-30"
            :disabled="page >= totalPages"
            aria-label="下一页"
            @click="nextPage"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="ledger-sheet">
        <div
          v-if="filterSheetOpen"
          class="fixed inset-0 z-[125] flex flex-col justify-end lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ledger-filter-title"
        >
          <div
            class="absolute inset-0 bg-black/55 backdrop-blur-[1px]"
            aria-hidden="true"
            @click="closeFilterSheetWithoutApply"
          />
          <div
            class="ledger-sheet-panel relative mx-auto flex w-full max-w-md max-h-[min(88vh,520px)] flex-col rounded-t-2xl border border-white/10 bg-[#121212] text-white shadow-2xl sm:max-w-lg"
            :style="{ boxShadow: '0 -8px 40px -12px rgba(0,0,0,0.55)' }"
            @click.stop
          >
            <div class="shrink-0 pt-2.5">
              <div class="mx-auto h-1 w-9 rounded-full bg-white/20" aria-hidden="true" />
            </div>
            <div
              class="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] px-3 py-2.5"
            >
              <h2 id="ledger-filter-title" class="text-base font-semibold tracking-tight text-white">
                筛选条件
              </h2>
              <button
                type="button"
                class="rounded-lg p-1.5 text-[#848e9c] transition hover:bg-white/[0.08] hover:text-white"
                aria-label="关闭"
                @click="closeFilterSheetWithoutApply"
              >
                <FrontStrokeIcon name="x" size-class="h-4 w-4" />
              </button>
            </div>
            <div
              class="scrollbar-ledger min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3"
            >
              <FrontAdaptiveSelect
                v-model="draftAccountRole"
                :manage-body-scroll="false"
                field-key="sheet-account-role"
                label="账户角色"
                :options="accountRoleOptions"
                aria-label="账户角色"
              />
              <FrontAdaptiveSelect
                v-model="draftLedgerType"
                :manage-body-scroll="false"
                field-key="sheet-ledger-type"
                label="账变类型"
                :options="ledgerTypeOptions"
                aria-label="账变类型"
              />
              <FrontAdaptiveSelect
                v-model="draftAccountKind"
                :manage-body-scroll="false"
                field-key="sheet-account-kind"
                label="账户类型"
                :options="accountKindOptions"
                aria-label="账户类型"
              />
              <FrontAdaptiveSelect
                v-model="draftCurrencyCode"
                :manage-body-scroll="false"
                field-key="sheet-currency"
                label="币种类型"
                :options="currencyOptions"
                aria-label="币种类型"
              />
            </div>
            <div
              class="shrink-0 border-t border-white/[0.06] px-3 pt-2"
              :style="{ paddingBottom: 'max(0.65rem, env(safe-area-inset-bottom, 0px))' }"
            >
              <FrontLimeButton
                class="w-full py-2.5 [-webkit-tap-highlight-color:transparent]"
                @click="confirmFilterSheet"
              >
                完成
              </FrontLimeButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <div
      class="mt-6 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <RouterLink
        :to="`${prefix}/personal-center`"
        class="group inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-[#848e9c] transition [-webkit-tap-highlight-color:transparent] hover:bg-white/[0.04] hover:text-lime-300/95 active:bg-white/[0.06]"
      >
        <svg
          class="h-4 w-4 shrink-0 text-[#848e9c]/90 transition group-hover:text-lime-400/90"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        返回个人中心
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.ledger-sheet-enter-active,
.ledger-sheet-leave-active {
  transition: opacity 0.2s ease;
}

.ledger-sheet-enter-active .ledger-sheet-panel,
.ledger-sheet-leave-active .ledger-sheet-panel {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.ledger-sheet-enter-from,
.ledger-sheet-leave-to {
  opacity: 0;
}

.ledger-sheet-enter-from .ledger-sheet-panel,
.ledger-sheet-leave-to .ledger-sheet-panel {
  transform: translateY(100%);
}

.scrollbar-ledger {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
}

.scrollbar-ledger::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-ledger::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}

@media (prefers-reduced-motion: reduce) {
  .ledger-sheet-enter-active,
  .ledger-sheet-leave-active,
  .ledger-sheet-enter-active .ledger-sheet-panel,
  .ledger-sheet-leave-active .ledger-sheet-panel {
    transition-duration: 0.01ms !important;
  }

  .ledger-sheet-enter-from .ledger-sheet-panel,
  .ledger-sheet-leave-to .ledger-sheet-panel {
    transform: none !important;
  }
}
</style>
