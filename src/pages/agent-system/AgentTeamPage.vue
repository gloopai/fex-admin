<script setup>
import { computed, ref } from 'vue'
import AgentListPaginationBar from '../../components/agent-system/AgentListPaginationBar.vue'
import { useAgentPagedList } from '../../composables/useAgentListPagination'
import { TEAM_MEMBER_STATUS_LEGEND } from '../../constants/agentSystemStatusHelp'
import { agentTeamMembers } from '../../admin/mock/agentPortal'

const q = ref('')

const members = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return agentTeamMembers
  return agentTeamMembers.filter((r) => r.uid.includes(s) || r.id.toLowerCase().includes(s))
})

const summary = computed(() => {
  const list = agentTeamMembers
  const n = list.length
  const monthVol = list.reduce((a, r) => a + r.monthTrade, 0)
  const active = list.filter((r) => r.userStatus === '活跃' || r.userStatus === '新开').length
  return { n, monthVol, active }
})

const { pageSize, currentPage, totalCount, totalPages, pagedList } = useAgentPagedList(members)
</script>

<template>
  <div class="space-y-4">
    <div>
      <p class="text-sm font-medium text-white/90">直邀团队</p>
      <p class="mt-1 text-sm leading-relaxed text-white/50">
        当前为<strong class="text-emerald-200/90">一级代理模式</strong>：列表为通过您的邀请码/链接注册、且与后台「代理管理」中您名下 UID 关联的直邀用户。
      </p>
    </div>

    <div class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
        <p class="text-xs text-white/45">直邀人数</p>
        <p class="mt-1 text-2xl font-semibold tabular-nums text-white">{{ summary.n }}</p>
      </div>
      <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
        <p class="text-xs text-white/45">本月团队交易量（USDT）</p>
        <p class="mt-1 text-2xl font-semibold tabular-nums text-emerald-200/95">
          {{ summary.monthVol.toLocaleString('zh-CN') }}
        </p>
      </div>
      <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
        <p class="text-xs text-white/45">活跃 + 新开人数</p>
        <p class="mt-1 text-2xl font-semibold tabular-nums text-white">{{ summary.active }}</p>
      </div>
    </div>

    <div>
      <label class="block text-xs text-white/45">搜索 UID</label>
      <input
        v-model="q"
        type="search"
        class="mt-1 max-w-md rounded-lg border border-white/10 bg-[#0c1219] px-3 py-2 text-sm text-white placeholder:text-white/25"
        placeholder="输入 UID 片段筛选"
      />
    </div>

    <div class="overflow-hidden rounded-xl border border-white/[0.06]">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[36rem] border-collapse text-left text-sm">
        <thead class="bg-white/[0.04] text-xs text-white/50">
          <tr>
            <th class="px-4 py-3 font-medium">UID</th>
            <th class="px-4 py-3 font-medium">注册时间</th>
            <th class="px-4 py-3 font-medium">用户状态</th>
            <th class="px-4 py-3 font-medium text-right">近月交易（USDT）</th>
            <th class="px-4 py-3 font-medium text-right">累计交易（USDT）</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/[0.05]">
          <tr v-for="r in pagedList" :key="r.id" class="hover:bg-white/[0.02]">
            <td class="px-4 py-3 font-mono text-emerald-200/95">{{ r.uid }}</td>
            <td class="px-4 py-3 text-white/70">{{ r.registerAt }}</td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2 py-0.5 text-xs"
                :class="
                  r.userStatus === '活跃'
                    ? 'bg-emerald-500/15 text-emerald-200'
                    : r.userStatus === '新开'
                      ? 'bg-sky-500/15 text-sky-200'
                      : r.userStatus === '沉默'
                        ? 'bg-white/10 text-white/55'
                        : 'bg-amber-500/15 text-amber-100'
                "
              >
                {{ r.userStatus }}
              </span>
            </td>
            <td class="px-4 py-3 text-right tabular-nums">{{ r.monthTrade.toLocaleString('zh-CN') }}</td>
            <td class="px-4 py-3 text-right tabular-nums text-white/75">
              {{ r.totalTrade.toLocaleString('zh-CN') }}
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
    <p v-if="!members.length" class="text-center text-sm text-white/45">无匹配用户</p>

    <details
      class="rounded-lg border border-white/[0.06] bg-white/[0.015] text-xs [&_summary::-webkit-details-marker]:hidden"
    >
      <summary
        class="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-white/55 transition hover:text-white/75"
      >
        <span class="text-[10px] text-white/35" aria-hidden="true">▸</span>
        <span class="font-medium">用户状态说明</span>
        <span class="text-[10px] text-white/30">展开查看各状态含义</span>
      </summary>
      <dl class="space-y-1.5 border-t border-white/[0.06] px-3 pb-2.5 pt-2 leading-snug text-[11px] text-white/45">
        <div v-for="item in TEAM_MEMBER_STATUS_LEGEND" :key="item.value" class="flex gap-2 sm:gap-2.5">
          <dt class="w-11 shrink-0 font-medium text-emerald-200/85 sm:w-12">{{ item.value }}</dt>
          <dd class="min-w-0">{{ item.text }}</dd>
        </div>
      </dl>
    </details>
  </div>
</template>
