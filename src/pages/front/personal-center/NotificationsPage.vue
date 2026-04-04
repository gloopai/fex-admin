<script setup>
import { computed, ref } from 'vue'

const tab = ref('all')

const items = ref([
  {
    id: 'n1',
    type: 'security',
    title: '新设备登录提醒',
    body: '检测到来自 上海市 的新设备登录，如非本人操作请立即修改密码并结束会话。',
    time: '2026-04-04 11:20',
    read: false
  },
  {
    id: 'n2',
    type: 'system',
    title: '系统维护通知',
    body: '计划于 4 月 6 日 02:00–04:00 进行合约撮合升级，期间部分合约可能短暂无法下单。',
    time: '2026-04-03 18:00',
    read: false
  },
  {
    id: 'n3',
    type: 'promo',
    title: '合约交易赛开启',
    body: '本期奖池 50,000 USDT，报名截止 4 月 10 日。',
    time: '2026-04-01 10:00',
    read: true
  }
])

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'security', label: '安全' },
  { key: 'system', label: '系统' },
  { key: 'promo', label: '活动' }
]

const filtered = computed(() => {
  if (tab.value === 'all') return items.value
  return items.value.filter((i) => i.type === tab.value)
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
</script>

<template>
  <div>
    <header class="mb-6 md:mb-8">
      <h1 class="text-2xl font-bold tracking-tight text-white md:text-3xl">消息通知</h1>
      <p class="mt-1 text-sm text-white/55">
        系统、安全与活动消息统一在此查看，重要安全提醒也会通过短信或邮件发送。
      </p>
    </header>

    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
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

    <div class="space-y-2">
      <article
        v-for="row in filtered"
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
  </div>
</template>
