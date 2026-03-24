<script setup>
defineProps({
  loading: { type: Boolean, default: false },
  auditList: { type: Array, default: () => [] },
  statusConfig: { type: Object, default: () => ({}) },
  levelConfig: { type: Object, default: () => ({}) },
  totalPages: { type: Number, default: 0 },
  pagination: { type: Object, default: () => ({ currentPage: 1, total: 0 }) },
  formatDate: { type: Function, required: true }
})

const emit = defineEmits(['view-detail', 'prev-page', 'next-page'])
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full">
      <thead class="bg-slate-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">用户信息</th>
          <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">认证等级</th>
          <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">提交材料</th>
          <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">状态</th>
          <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">提交时间</th>
          <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">审核时间</th>
          <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">操作</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200 bg-white">
        <tr v-for="audit in auditList" :key="audit.id" class="hover:bg-gray-50">
          <td class="whitespace-nowrap px-6 py-4">
            <div class="flex flex-col">
              <div class="text-sm font-medium text-gray-900">{{ audit.username }}</div>
              <div class="text-sm text-gray-500">{{ audit.basicInfo.realName }}</div>
              <div class="text-xs text-gray-400">{{ audit.email }}</div>
            </div>
          </td>
          <td class="whitespace-nowrap px-6 py-4">
            <div class="flex flex-col space-y-1">
              <span :class="levelConfig[audit.currentLevel].class" class="inline-flex rounded-full px-2 py-1 text-xs font-semibold">
                {{ levelConfig[audit.currentLevel].text }}
              </span>
              <div class="flex items-center text-xs text-gray-400"><span>↓ 申请</span></div>
              <span :class="levelConfig[audit.applyLevel].class" class="inline-flex rounded-full px-2 py-1 text-xs font-semibold">
                {{ levelConfig[audit.applyLevel].text }}
              </span>
            </div>
          </td>
          <td class="whitespace-nowrap px-6 py-4">
            <div class="text-sm text-slate-700">
              {{ audit.documents?.length || 0 }} 份
            </div>
          </td>
          <td class="whitespace-nowrap px-6 py-4">
            <span :class="statusConfig[audit.status].class" class="rounded-full px-2 py-1 text-xs font-semibold">{{ statusConfig[audit.status].text }}</span>
          </td>
          <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ formatDate(audit.submitTime) }}</td>
          <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ formatDate(audit.auditTime) }}</td>
          <td class="whitespace-nowrap px-6 py-4 text-sm font-medium">
            <button class="text-blue-600 hover:text-blue-900" @click="emit('view-detail', audit)">查看详情</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-if="!loading && auditList.length === 0" class="py-12 text-center">
    <p class="text-gray-500">暂无审核记录</p>
  </div>

  <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-gray-200 px-6 py-3">
    <div class="text-sm text-gray-600">
      共 <span class="font-medium">{{ pagination.total }}</span> 条记录，第
      <span class="font-medium">{{ pagination.currentPage }}</span> / <span class="font-medium">{{ totalPages }}</span> 页
    </div>
    <div class="flex items-center gap-2">
      <button
        :disabled="pagination.currentPage === 1 || loading"
        class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        @click="emit('prev-page')"
      >
        上一页
      </button>
      <button
        :disabled="pagination.currentPage === totalPages || loading"
        class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        @click="emit('next-page')"
      >
        下一页
      </button>
    </div>
  </div>
</template>
