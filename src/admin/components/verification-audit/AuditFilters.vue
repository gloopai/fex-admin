<script setup>
defineProps({
  searchKeyword: { type: String, default: '' },
  filterLevel: { type: String, default: 'all' },
  dateRange: { type: Object, default: () => ({ start: '', end: '' }) },
  levelOptions: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'update:search-keyword',
  'update:filter-level',
  'update:date-range',
  'reset'
])
</script>

<template>
  <div class="border-b border-slate-100 bg-slate-50/30 p-4">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-slate-700">搜索</label>
        <input
          :value="searchKeyword"
          type="text"
          placeholder="用户名、邮箱、姓名..."
          class="ant-input !py-1.5"
          @input="emit('update:search-keyword', $event.target.value)"
        >
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-slate-700">认证等级</label>
        <select
          :value="filterLevel"
          class="ant-select !py-1.5"
          @change="emit('update:filter-level', $event.target.value)"
        >
          <option value="all">全部等级</option>
          <option v-for="option in levelOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-slate-700">开始日期</label>
        <input
          :value="dateRange.start"
          type="date"
          class="ant-input !py-1.5"
          @input="emit('update:date-range', { ...dateRange, start: $event.target.value })"
        >
      </div>

      <div class="flex items-end gap-2">
        <div class="flex-1">
          <label class="mb-1.5 block text-sm font-medium text-slate-700">结束日期</label>
          <input
            :value="dateRange.end"
            type="date"
            class="ant-input !py-1.5"
            @input="emit('update:date-range', { ...dateRange, end: $event.target.value })"
          >
        </div>
        <button
          title="重置筛选"
          class="rounded-lg bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200"
          @click="emit('reset')"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
