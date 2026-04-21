<script setup>
defineProps({
  searchKeyword: { type: String, default: '' },
  filterLevel: { type: String, default: 'all' },
  dateRange: { type: Object, default: () => ({ start: '', end: '' }) },
  levelOptions: { type: Array, default: () => [] },
  variant: { type: String, default: 'admin' },
  /** 代理认证页：与筛选同行展示导出 */
  showExportButton: { type: Boolean, default: false }
})

const emit = defineEmits([
  'update:search-keyword',
  'update:filter-level',
  'update:date-range',
  'reset',
  'export-request'
])

const agentLabel =
  'mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-white/36'
/** 与按钮统一高度，padding 收紧 */
const agentField =
  'box-border h-9 w-full rounded-lg border border-white/[0.09] bg-[#080c10]/90 px-3 text-[13px] text-white/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] outline-none transition placeholder:text-white/26 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/25 hover:border-white/[0.14]'
const agentBtnGhost =
  'box-border inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 text-[13px] font-medium text-white/68 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition hover:border-emerald-500/30 hover:bg-emerald-500/[0.07] hover:text-emerald-50 active:scale-[0.98]'
const agentBtnPrimary =
  'box-border inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-b from-emerald-500/95 to-emerald-600 px-3.5 text-[13px] font-medium text-white shadow-sm shadow-emerald-950/30 ring-1 ring-emerald-400/20 transition hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.98]'
</script>

<template>
  <div
    :class="
      variant === 'agent'
        ? 'border-b border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent px-4 py-3.5'
        : 'border-b border-slate-100 bg-slate-50/30 p-4'
    "
  >
    <div
      :class="
        variant === 'agent'
          ? 'grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.82fr)_minmax(0,22rem)_auto] lg:items-end'
          : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'
      "
    >
      <div>
        <label :class="variant === 'agent' ? agentLabel : 'mb-1.5 block text-sm font-medium text-slate-700'">搜索</label>
        <input
          :value="searchKeyword"
          type="text"
          placeholder="用户名、邮箱、姓名…"
          :class="variant === 'agent' ? agentField : 'ant-input !py-1.5'"
          @input="emit('update:search-keyword', $event.target.value)"
        />
      </div>

      <div>
        <label :class="variant === 'agent' ? agentLabel : 'mb-1.5 block text-sm font-medium text-slate-700'">认证等级</label>
        <select
          :value="filterLevel"
          :class="variant === 'agent' ? `${agentField} cursor-pointer` : 'ant-select !py-1.5'"
          @change="emit('update:filter-level', $event.target.value)"
        >
          <option value="all">全部等级</option>
          <option v-for="option in levelOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div :class="variant === 'agent' ? '' : 'lg:col-span-2'">
        <label :class="variant === 'agent' ? agentLabel : 'mb-1.5 block text-sm font-medium text-slate-700'">申请时间范围</label>
        <div class="flex flex-wrap items-center gap-2">
          <input
            :value="dateRange.start"
            type="date"
            :class="
              variant === 'agent'
                ? `${agentField} min-w-0 flex-1 sm:max-w-[10.5rem] [&::-webkit-calendar-picker-indicator]:opacity-35 [&::-webkit-calendar-picker-indicator]:hover:opacity-65`
                : 'ant-input !py-1.5'
            "
            @input="emit('update:date-range', { ...dateRange, start: $event.target.value })"
          />
          <span
            :class="
              variant === 'agent'
                ? 'shrink-0 text-[10px] font-medium uppercase tracking-wider text-white/28'
                : 'text-slate-400'
            "
            >至</span>
          <input
            :value="dateRange.end"
            type="date"
            :class="
              variant === 'agent'
                ? `${agentField} min-w-0 flex-1 sm:max-w-[10.5rem] [&::-webkit-calendar-picker-indicator]:opacity-35 [&::-webkit-calendar-picker-indicator]:hover:opacity-65`
                : 'ant-input !py-1.5'
            "
            @input="emit('update:date-range', { ...dateRange, end: $event.target.value })"
          />
        </div>
      </div>

      <div
        v-if="variant !== 'agent'"
        class="flex items-end gap-2"
      >
        <button
          title="重置筛选"
          type="button"
          class="rounded-lg bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200"
          @click="emit('reset')"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <div v-else class="flex flex-col gap-1.5">
        <div class="mb-1.5 h-[15px] shrink-0" aria-hidden="true" />
        <div class="flex flex-wrap items-center gap-2 sm:justify-start lg:justify-end">
          <button type="button" :class="agentBtnGhost" title="重置筛选条件" @click="emit('reset')">
            <svg class="h-3.5 w-3.5 shrink-0 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            重置
          </button>
          <button
            v-if="showExportButton"
            type="button"
            :class="agentBtnPrimary"
            title="导出审核记录"
            @click="emit('export-request')"
          >
            <svg class="h-3.5 w-3.5 shrink-0 opacity-95" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            导出
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
