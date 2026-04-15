<script setup>
import { computed, ref } from 'vue'
import AgentListPaginationBar from '../../components/agent-system/AgentListPaginationBar.vue'
import { useAgentPagedList } from '../../composables/useAgentListPagination'
import { agentVerificationQueue } from '../../admin/mock/agentPortal'

const queue = ref([...agentVerificationQueue])

const queueList = computed(() => queue.value)
const { pageSize, currentPage, totalCount, totalPages, pagedList } = useAgentPagedList(queueList)

function submitAudit(id, action) {
  queue.value = queue.value.filter((r) => r.id !== id)
  const label = action === 'approve' ? '已通过' : '已驳回'
  alert(`${label}\n单号 ${id}`)
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-white/55">
      处理您邀请的用户发起的身份认证申请。以下为待办队列；审核提交后将从当前列表移除。
    </p>

    <div class="overflow-hidden rounded-xl border border-white/[0.06]">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[44rem] border-collapse text-left text-sm">
        <thead class="bg-white/[0.04] text-xs text-white/50">
          <tr>
            <th class="px-4 py-3 font-medium">单号</th>
            <th class="px-4 py-3 font-medium">UID</th>
            <th class="px-4 py-3 font-medium">姓名</th>
            <th class="px-4 py-3 font-medium">证件类型</th>
            <th class="px-4 py-3 font-medium">提交时间</th>
            <th class="px-4 py-3 font-medium">渠道</th>
            <th class="px-4 py-3 font-medium text-right">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/[0.05]">
          <tr v-for="r in pagedList" :key="r.id" class="hover:bg-white/[0.02]">
            <td class="px-4 py-3 font-mono text-xs text-white/65">{{ r.id }}</td>
            <td class="px-4 py-3 font-mono text-emerald-200/95">{{ r.uid }}</td>
            <td class="px-4 py-3">{{ r.name }}</td>
            <td class="px-4 py-3">{{ r.idType }}</td>
            <td class="px-4 py-3 text-white/65">{{ r.submitAt }}</td>
            <td class="px-4 py-3">{{ r.channel }}</td>
            <td class="px-4 py-3 text-right">
              <button
                type="button"
                class="mr-2 rounded-lg border border-white/12 px-2.5 py-1 text-xs text-white/85 hover:bg-white/[0.06]"
                @click="submitAudit(r.id, 'reject')"
              >
                驳回
              </button>
              <button
                type="button"
                class="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-500"
                @click="submitAudit(r.id, 'approve')"
              >
                通过
              </button>
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
    <p v-if="!queue.length" class="text-center text-sm text-white/45">暂无待审核</p>
  </div>
</template>
