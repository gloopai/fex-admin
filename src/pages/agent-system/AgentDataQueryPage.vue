<script setup>
import { computed, ref } from 'vue'
import AgentListPaginationBar from '../../components/agent-system/AgentListPaginationBar.vue'
import { useAgentPagedList } from '../../composables/useAgentListPagination'
import { DATA_QUERY_ACCOUNT_STATUS_LEGEND } from '../../constants/agentSystemStatusHelp'
import { agentDataQueryRows } from '../../admin/mock/agentPortal'

const statusFilter = ref('全部')
const q = ref('')

const rows = computed(() => {
  let list = agentDataQueryRows
  if (statusFilter.value !== '全部') {
    list = list.filter((r) => r.status === statusFilter.value)
  }
  const s = q.value.trim().toLowerCase()
  if (s) {
    list = list.filter((r) => r.uid.includes(s) || r.id.toLowerCase().includes(s))
  }
  return list
})

const { pageSize, currentPage, totalCount, totalPages, pagedList } = useAgentPagedList(rows)
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-white/55">
      查询您<strong class="text-white/75">直接邀请</strong>的用户及交易概况（邀请关系在注册时绑定您的代理 UID）；一级代理不包含下级代理链路。
    </p>

    <div class="flex flex-wrap items-end gap-3">
      <div>
        <label class="block text-xs text-white/45">账户状态</label>
        <select
          v-model="statusFilter"
          class="mt-1 rounded-lg border border-white/10 bg-[#0c1219] px-3 py-2 text-sm text-white"
        >
          <option>全部</option>
          <option>正常</option>
          <option>观察</option>
        </select>
      </div>
      <div class="min-w-[12rem] flex-1">
        <label class="block text-xs text-white/45">UID / 关键字</label>
        <input
          v-model="q"
          type="search"
          class="mt-1 w-full rounded-lg border border-white/10 bg-[#0c1219] px-3 py-2 text-sm text-white placeholder:text-white/25"
          placeholder="88392…"
        />
      </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-white/[0.06]">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[36rem] border-collapse text-left text-sm">
        <thead class="bg-white/[0.04] text-xs text-white/50">
          <tr>
            <th class="px-4 py-3 font-medium">UID</th>
            <th class="px-4 py-3 font-medium">注册日期</th>
            <th class="px-4 py-3 font-medium text-right">近月交易（USDT）</th>
            <th class="px-4 py-3 font-medium">账户状态</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/[0.05]">
          <tr v-for="r in pagedList" :key="r.id" class="hover:bg-white/[0.02]">
            <td class="px-4 py-3 font-mono text-emerald-200/95">{{ r.uid }}</td>
            <td class="px-4 py-3 text-white/70">{{ r.registerAt }}</td>
            <td class="px-4 py-3 text-right tabular-nums">{{ r.monthTrade.toLocaleString('zh-CN') }}</td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2 py-0.5 text-xs"
                :class="r.status === '正常' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-amber-500/15 text-amber-100'"
              >
                {{ r.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
      <AgentListPaginationBar
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-count="totalCount"
        :page-size="pageSize"
        @update:current-page="currentPage = $event"
        @update:page-size="pageSize = $event"
      />
    </div>

    <details
      class="rounded-lg border border-white/[0.06] bg-white/[0.015] text-xs [&_summary::-webkit-details-marker]:hidden"
    >
      <summary
        class="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-white/55 transition hover:text-white/75"
      >
        <span class="text-[10px] text-white/35" aria-hidden="true">▸</span>
        <span class="font-medium">账户状态说明</span>
        <span class="text-[10px] text-white/30">展开查看各状态含义</span>
      </summary>
      <dl class="space-y-1.5 border-t border-white/[0.06] px-3 pb-2.5 pt-2 leading-snug text-[11px] text-white/45">
        <div v-for="item in DATA_QUERY_ACCOUNT_STATUS_LEGEND" :key="item.value" class="flex gap-2 sm:gap-2.5">
          <dt class="w-11 shrink-0 font-medium text-emerald-200/85 sm:w-12">{{ item.value }}</dt>
          <dd class="min-w-0">{{ item.text }}</dd>
        </div>
      </dl>
    </details>
  </div>
</template>
