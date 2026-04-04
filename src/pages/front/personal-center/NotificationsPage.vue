<script setup>
import { computed, ref, watch } from 'vue'

const tab = ref('all')
const page = ref(1)
const pageSize = ref(10)

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'security', label: '安全' },
  { key: 'system', label: '系统' },
  { key: 'promo', label: '活动' }
]

function padDemoBody(type, idx) {
  if (type === 'security') {
    return `安全提醒示例 ${idx}：请确认账户操作，如有异常请及时修改密码并联系客服。`
  }
  if (type === 'system') {
    return `系统公告示例 ${idx}：功能升级或维护窗口可能影响部分服务，请以实际公告为准。`
  }
  return `活动通知示例 ${idx}：参与活动前请阅读规则，奖励发放以活动页说明为准。`
}

/** 示例列表；接入接口后替换为接口分页 */
function buildDemoItems() {
  const types = ['security', 'system', 'promo']
  const titles = {
    security: ['新设备登录提醒', '异地登录风险提示', '密码修改成功', '提币地址新增确认', '两步验证已开启'],
    system: [
      '系统维护通知',
      '现货费率调整说明',
      '合约风险限额更新',
      'API 限流策略调整',
      '钱包服务升级完成'
    ],
    promo: [
      '合约交易赛开启',
      '新用户充值返佣',
      '邀请好友双重奖',
      '理财加息活动',
      '限时手续费折扣'
    ]
  }
  const rows = []
  let id = 1
  for (let round = 0; round < 5; round++) {
    for (const type of types) {
      const pool = titles[type]
      const title = pool[(id + round) % pool.length]
      const d = new Date('2026-04-04T12:00:00')
      d.setHours(d.getHours() - id * 3)
      const time = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      rows.push({
        id: `n${id}`,
        type,
        title: `${title}${round > 0 ? ` (${round + 1})` : ''}`,
        body: padDemoBody(type, id),
        time,
        read: id % 5 === 0
      })
      id++
    }
  }
  return rows
}

const items = ref(buildDemoItems())

const filtered = computed(() => {
  if (tab.value === 'all') return items.value
  return items.value.filter((i) => i.type === tab.value)
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / pageSize.value))
)

const pagedItems = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

watch(tab, () => {
  page.value = 1
})

watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp
})

function markRead(id) {
  const row = items.value.find((i) => i.id === id)
  if (row) row.read = true
}

function markAllRead() {
  items.value.forEach((i) => {
    i.read = true
  })
}

function prevPage() {
  if (page.value > 1) page.value -= 1
}

function nextPage() {
  if (page.value < totalPages.value) page.value += 1
}
</script>

<template>
  <div>
    <header class="mb-5 md:mb-6">
      <h1 class="text-2xl font-bold tracking-tight text-white md:text-3xl">消息通知</h1>
      <p class="mt-1 text-sm text-white/55">
        系统、安全与活动消息统一在此查看，重要安全提醒也会通过短信或邮件发送。
      </p>
    </header>

    <div class="flex flex-col gap-5 md:gap-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="t in tabs"
          :key="t.key"
          type="button"
          class="rounded-full border px-3.5 py-1.5 text-xs font-medium transition"
          :class="
            tab === t.key
              ? 'border-lime-400/50 bg-lime-400/15 text-lime-100'
              : 'border-white/15 text-white/65 hover:bg-white/[0.06]'
          "
          @click="tab = t.key"
        >
          {{ t.label }}
        </button>
      </div>
      <button
        type="button"
        class="text-xs font-medium text-sky-300/90 hover:text-sky-200"
        @click="markAllRead"
      >
        全部标为已读
      </button>
    </div>

    <div
      class="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]"
    >
      <div class="space-y-2 p-2 md:p-3">
        <article
          v-for="row in pagedItems"
          :key="row.id"
          class="cursor-pointer rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-white/20 md:p-5"
          :class="!row.read ? 'ring-1 ring-lime-400/20' : ''"
          @click="markRead(row.id)"
        >
          <div class="flex flex-wrap items-start justify-between gap-2">
            <div class="flex items-center gap-2">
              <span
                v-if="!row.read"
                class="h-2 w-2 shrink-0 rounded-full bg-lime-400"
                aria-hidden="true"
              />
              <h2 class="text-sm font-semibold text-white/92">{{ row.title }}</h2>
            </div>
            <span class="text-[11px] text-white/38">{{ row.time }}</span>
          </div>
          <p class="mt-2 text-xs leading-relaxed text-white/55">{{ row.body }}</p>
          <p class="mt-2 text-[11px] text-white/35">
            {{
              row.type === 'security'
                ? '安全'
                : row.type === 'system'
                  ? '系统'
                  : '活动'
            }}
          </p>
        </article>
        <p v-if="!filtered.length" class="py-12 text-center text-sm text-white/45">暂无消息</p>
      </div>

      <div
        v-if="filtered.length > 0"
        class="flex flex-col gap-2 border-t border-white/[0.06] px-3 py-3 touch-manipulation sm:flex-row sm:items-center sm:justify-between sm:px-4"
      >
        <p class="text-center text-xs text-white/40 sm:text-left">
          共 {{ filtered.length }} 条 · 第 {{ page }} / {{ totalPages }} 页
        </p>
        <div class="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] text-base text-white/55 transition hover:border-lime-400/25 hover:text-white/80 active:bg-white/[0.05] disabled:pointer-events-none disabled:opacity-30 sm:h-8 sm:w-8 sm:rounded-lg sm:text-sm"
            :disabled="page <= 1"
            aria-label="上一页"
            @click="prevPage"
          >
            &lt;
          </button>

          <span
            class="inline-flex min-h-10 min-w-[2.25rem] items-center justify-center rounded-xl border border-lime-400/35 bg-lime-400/[0.06] px-2 text-sm font-medium tabular-nums text-[#eaecef] sm:min-h-8"
            aria-current="page"
          >
            {{ page }}
          </span>

          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] text-base text-white/55 transition hover:border-lime-400/25 hover:text-white/80 active:bg-white/[0.05] disabled:pointer-events-none disabled:opacity-30 sm:h-8 sm:w-8 sm:rounded-lg sm:text-sm"
            :disabled="page >= totalPages"
            aria-label="下一页"
            @click="nextPage"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>
