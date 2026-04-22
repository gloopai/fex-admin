<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AgentListPaginationBar from '../../components/agent-system/AgentListPaginationBar.vue'
import { useAgentPagedList } from '../../composables/useAgentListPagination'
import { useAgentAuthStore } from '../../stores/agentAuth'
import { agentSettlementApi } from '../../admin/mock/agentSettlement'
import { agentPortalSettlementHeadline } from '../../admin/constants/agentSettlement'

const auth = useAgentAuthStore()
const loading = ref(true)
const batches = ref([])
const expandedId = ref(null)

async function load() {
  loading.value = true
  try {
    const res = await agentSettlementApi.listForAgent(auth.uid)
    if (res.success) batches.value = res.data.list || []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
})

const allRecords = computed(() => batches.value)
const { pageSize, currentPage, totalCount, totalPages, pagedList } = useAgentPagedList(allRecords)

function headline(status) {
  return agentPortalSettlementHeadline(status)
}

function paidColumn(row) {
  if (row.status === 'completed' && row.completedAt) {
    return row.creditTxnId ? `${row.completedAt} · ${row.creditTxnId}` : row.completedAt
  }
  if (row.status === 'rejected') return '—'
  return '待入账'
}

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-white/55">
      以下为账期结算批次及处理进度（与运营后台「代理佣金结算」联动演示）。记佣产品线与比例见
      <RouterLink class="text-emerald-400/90 hover:underline" to="/agent-system/commission-rates">记佣比例</RouterLink>
      。
    </p>

    <div class="overflow-hidden rounded-xl border border-white/[0.06]">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-sm">
          <thead class="bg-white/[0.04] text-xs text-white/50">
            <tr>
              <th class="w-10 px-2 py-3 font-medium" />
              <th class="px-4 py-3 font-medium">账期</th>
              <th class="px-4 py-3 font-medium">批次</th>
              <th class="px-4 py-3 font-medium text-right">金额（USDT）</th>
              <th class="px-4 py-3 font-medium">进度</th>
              <th class="px-4 py-3 font-medium">入账 / 流水</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.05]">
            <tr v-if="loading">
              <td colspan="6" class="px-4 py-8 text-center text-white/45">加载中…</td>
            </tr>
            <template v-else-if="pagedList.length">
              <template v-for="row in pagedList" :key="row.id">
                <tr class="hover:bg-white/[0.02]">
                  <td class="px-2 py-3">
                    <button
                      type="button"
                      class="text-white/50 hover:text-emerald-300"
                      :aria-expanded="expandedId === row.id"
                      :aria-label="expandedId === row.id ? '收起详情' : '展开详情'"
                      @click="toggleExpand(row.id)"
                    >
                      {{ expandedId === row.id ? '▼' : '▶' }}
                    </button>
                  </td>
                  <td class="px-4 py-3 font-mono">{{ row.period }}</td>
                  <td class="px-4 py-3 font-mono text-xs text-white/65">{{ row.batchNo }}</td>
                  <td class="px-4 py-3 text-right tabular-nums text-emerald-200/95">
                    {{ row.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}
                  </td>
                  <td class="px-4 py-3">
                    <span
                      class="rounded-full px-2 py-0.5 text-xs"
                      :class="
                        row.status === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-200'
                          : row.status === 'rejected'
                            ? 'bg-red-500/15 text-red-200'
                            : 'bg-amber-500/15 text-amber-100'
                      "
                    >
                      {{ headline(row.status) }}
                    </span>
                  </td>
                  <td class="max-w-[14rem] truncate px-4 py-3 text-xs text-white/65" :title="paidColumn(row)">
                    {{ paidColumn(row) }}
                  </td>
                </tr>
                <tr v-if="expandedId === row.id" class="bg-black/20">
                  <td colspan="6" class="px-4 py-4">
                    <p class="text-xs font-medium text-white/45">结算步骤</p>
                    <ol class="mt-2 space-y-2">
                      <li
                        v-for="step in row.steps"
                        :key="step.key"
                        class="flex flex-wrap items-baseline gap-2 text-xs"
                        :class="
                          step.failed
                            ? 'text-red-300/95'
                            : step.done
                              ? 'text-emerald-200/90'
                              : step.current
                                ? 'text-amber-200/95'
                                : 'text-white/35'
                        "
                      >
                        <span class="font-mono text-[10px] text-white/30">{{ step.done ? '✓' : step.current ? '◉' : '○' }}</span>
                        <span>{{ step.label }}</span>
                        <span v-if="step.at" class="text-white/40">{{ step.at }}</span>
                        <span v-if="step.txnId" class="font-mono text-white/50">{{ step.txnId }}</span>
                        <span v-if="step.note" class="text-red-200/80">（{{ step.note }}）</span>
                        <span v-if="step.skipped" class="text-white/30">（已跳过）</span>
                      </li>
                    </ol>
                  </td>
                </tr>
              </template>
            </template>
            <tr v-else>
              <td colspan="6" class="px-4 py-8 text-center text-white/45">暂无结算记录</td>
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
