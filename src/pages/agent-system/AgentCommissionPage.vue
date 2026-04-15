<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AgentListPaginationBar from '../../components/agent-system/AgentListPaginationBar.vue'
import { useAgentPagedList } from '../../composables/useAgentListPagination'
import { agentCommissionRecords } from '../../admin/mock/agentPortal'

const allRecords = computed(() => agentCommissionRecords)
const { pageSize, currentPage, totalCount, totalPages, pagedList } = useAgentPagedList(allRecords)
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-white/55">
      各账期佣金金额、结算状态与打款时间；记佣产品线与比例见
      <RouterLink class="text-emerald-400/90 hover:underline" to="/agent-system/commission-rates">记佣比例</RouterLink>
      。
    </p>

    <div class="overflow-hidden rounded-xl border border-white/[0.06]">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-sm">
          <thead class="bg-white/[0.04] text-xs text-white/50">
            <tr>
              <th class="px-4 py-3 font-medium">账期</th>
              <th class="px-4 py-3 font-medium text-right">金额（USDT）</th>
              <th class="px-4 py-3 font-medium">状态</th>
              <th class="px-4 py-3 font-medium">打款 / 预计</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.05]">
            <tr v-for="r in pagedList" :key="r.id" class="hover:bg-white/[0.02]">
              <td class="px-4 py-3 font-mono">{{ r.period }}</td>
              <td class="px-4 py-3 text-right tabular-nums text-emerald-200/95">
                {{ r.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2 py-0.5 text-xs"
                  :class="
                    r.status === '已结算' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-amber-500/15 text-amber-100'
                  "
                >
                  {{ r.status }}
                </span>
              </td>
              <td class="px-4 py-3 text-white/65">{{ r.paidAt }}</td>
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
  </div>
</template>
