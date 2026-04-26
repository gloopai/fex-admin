<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">还款记录</h1>
        <p class="mt-1 max-w-3xl text-sm text-slate-500">
          与前台还款记录字段一致；用户主动还款为<strong>站内账户</strong>，类型由冲减规则推导。更多说明见详情弹窗。
        </p>
      </div>
    </header>

    <article class="rounded-xl border border-slate-200 bg-white">
      <div class="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-3">
        <div class="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <select
            v-model="filters.status"
            class="min-w-[8.5rem] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">全部状态</option>
            <option value="pending">待还款</option>
            <option value="processing">处理中</option>
            <option value="completed">已完成</option>
            <option value="failed">失败</option>
            <option value="overdue">逾期</option>
          </select>
          <select
            v-model="filters.repaymentType"
            class="min-w-[8.5rem] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">全部类型</option>
            <option value="partial">部分还款</option>
            <option value="full">全额还款</option>
            <option value="auto">自动还款</option>
          </select>
          <select
            v-model="filters.timeRange"
            class="min-w-[7.5rem] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="today">今天</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
            <option value="all">全部时间</option>
          </select>
          <input
            v-model="filters.searchText"
            type="search"
            class="min-w-[10rem] max-w-md flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            placeholder="还款单号、订单号、用户…"
            autocomplete="off"
          />
          <button
            type="button"
            class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            @click="resetFilters"
          >
            重置
          </button>
        </div>
        <div
          v-if="selectedRepaymentIds.length"
          class="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2 border-l border-slate-200 pl-3 text-sm"
        >
          <span class="font-medium text-slate-800">已选 {{ selectedRepaymentIds.length }} 条</span>
          <span class="text-slate-400">|</span>
          <button
            type="button"
            class="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-45"
            :disabled="selectedFailedRows.length === 0"
            @click="batchRetrySelected"
          >
            批量重试
            <span v-if="selectedFailedRows.length" class="tabular-nums">（{{ selectedFailedRows.length }}）</span>
          </button>
          <button
            type="button"
            class="rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-900 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-45"
            :disabled="selectedRemindRows.length === 0"
            @click="openRemindModalForBatch"
          >
            批量提醒
            <span v-if="selectedRemindRows.length" class="tabular-nums">（{{ selectedRemindRows.length }}）</span>
          </button>
          <button type="button" class="text-xs text-slate-600 underline-offset-2 hover:underline" @click="clearSelection">
            清除选择
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[58rem] text-sm">
          <thead class="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr class="border-b border-slate-200">
              <th class="w-10 px-2 py-2.5 text-left">
                <input
                  ref="headerCheckboxRef"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  title="全选本页"
                  :checked="allPageSelected"
                  @change="onToggleSelectAllPage"
                />
              </th>
              <th class="px-4 py-2.5 text-left">还款单</th>
              <th class="px-4 py-2.5 text-left">订单 / 用户</th>
              <th class="px-4 py-2.5 text-left">产品</th>
              <th class="px-4 py-2.5 text-left">还款明细</th>
              <th class="px-4 py-2.5 text-left">状态</th>
              <th class="px-4 py-2.5 text-right min-w-[9rem]">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!repaymentsPaged.length">
              <td colspan="7" class="px-4 py-12 text-center text-slate-500">暂无符合条件的还款记录</td>
            </tr>
            <tr
              v-for="repayment in repaymentsPaged"
              :key="repayment.repaymentId"
              class="border-b border-slate-100 transition-colors hover:bg-slate-50/80"
            >
              <td class="px-2 py-3 align-top">
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  :checked="isRepaymentSelected(repayment.repaymentId)"
                  @change="toggleRepaymentSelect(repayment.repaymentId)"
                />
              </td>
              <td class="px-4 py-3 align-top">
                <div class="font-mono text-xs font-medium text-slate-800">{{ repayment.repaymentId }}</div>
                <div class="mt-0.5 text-xs text-slate-500 tabular-nums">
                  {{ repayment.repaymentTime ? formatDateTime(repayment.repaymentTime) : `创建 ${formatDateTime(repayment.createTime)}` }}
                </div>
              </td>
              <td class="px-4 py-3 align-top">
                <div class="font-mono text-xs text-blue-600">{{ repayment.orderId }}</div>
                <div class="mt-0.5 text-xs text-slate-600">
                  <span class="text-slate-500">{{ repayment.userId }}</span>
                  <span class="text-slate-400"> · </span>
                  {{ repayment.userName }}
                </div>
              </td>
              <td class="px-4 py-3 align-top max-w-[11rem]">
                <div class="truncate font-medium text-slate-900" :title="repayment.productName">{{ repayment.productName }}</div>
                <span
                  class="mt-1 inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-700"
                >
                  {{ repayment.loanCurrency || '—' }}
                </span>
              </td>
              <td class="px-4 py-3 align-top min-w-[14rem]">
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[11px] font-medium"
                    :class="{
                      'bg-blue-100 text-blue-800': repayment.repaymentType === 'partial',
                      'bg-emerald-100 text-emerald-800': repayment.repaymentType === 'full',
                      'bg-violet-100 text-violet-800': repayment.repaymentType === 'auto'
                    }"
                  >
                    {{ repaymentTypeLabel(repayment.repaymentType) }}
                  </span>
                  <span class="font-semibold tabular-nums text-slate-900">
                    {{ formatLedgerAmount(repayment.amount, repayment.loanCurrency) }}
                  </span>
                </div>
                <div class="mt-1 text-[11px] tabular-nums text-slate-500">
                  息 {{ formatLedgerNumber(repayment.interestPaid) }} · 本 {{ formatLedgerNumber(repayment.principalPaid) }} · 余
                  {{ formatLedgerNumber(repayment.remainingDebt) }}
                  <span class="text-slate-400">{{ repayment.loanCurrency || 'USDT' }}</span>
                </div>
                <div class="mt-1 text-[11px] text-slate-500">
                  {{ repayment.paymentMethod }}
                  <span v-if="repayment.transactionId" class="ml-1 font-mono text-slate-400" :title="repayment.transactionId">
                    {{ truncateMiddle(repayment.transactionId, 10) }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 align-top">
                <span
                  class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
                  :class="{
                    'bg-amber-50 text-amber-800': repayment.status === 'pending',
                    'bg-sky-50 text-sky-800': repayment.status === 'processing',
                    'bg-emerald-50 text-emerald-800': repayment.status === 'completed',
                    'bg-rose-50 text-rose-800': repayment.status === 'failed',
                    'bg-red-50 text-red-800': repayment.status === 'overdue'
                  }"
                >
                  {{ statusLabel(repayment.status) }}
                </span>
                <p v-if="repayment.failureReason" class="mt-1 line-clamp-2 text-[11px] text-rose-600" :title="repayment.failureReason">
                  {{ repayment.failureReason }}
                </p>
              </td>
              <td class="px-4 py-3 align-top text-right">
                <div class="flex flex-wrap justify-end gap-1">
                  <button
                    type="button"
                    class="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-50"
                    @click="viewDetails(repayment)"
                  >
                    详情
                  </button>
                  <button
                    v-if="repayment.status === 'failed'"
                    type="button"
                    class="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
                    @click="retryRepayment(repayment)"
                  >
                    重试
                  </button>
                  <button
                    v-if="repayment.status === 'pending' || repayment.status === 'overdue'"
                    type="button"
                    class="rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800 hover:bg-violet-100"
                    @click="sendReminder(repayment)"
                  >
                    提醒用户
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AdminListPaginationBar
        :current-page="listPage"
        :total-pages="totalPages"
        :total-count="filteredRepayments.length"
        :page-size="pageSize"
        @update:current-page="listPage = $event"
        @update:page-size="onPageSizeChange"
      />
    </article>

    <!-- 还款详情 -->
    <div
      v-if="showDetailModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="closeDetailModal"
    >
      <article
        class="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl min-h-0"
      >
        <header class="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-slate-900">还款详情</h2>
              <p class="text-sm text-slate-500">{{ currentDetailRepayment?.repaymentId }}</p>
            </div>
          </div>
          <button type="button" class="text-slate-400 hover:text-slate-600 transition-colors" @click="closeDetailModal">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-6 space-y-5">
          <div class="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-blue-700">还款状态</p>
                <p class="mt-1 text-2xl font-bold text-blue-900">{{ statusLabel(currentDetailRepayment?.status) }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-blue-700">还款金额</p>
                <p class="mt-1 text-2xl font-bold text-blue-900 tabular-nums">
                  {{ formatLedgerAmount(currentDetailRepayment?.amount, currentDetailRepayment?.loanCurrency) }}
                </p>
              </div>
            </div>
            <div v-if="currentDetailRepayment?.failureReason" class="mt-3 rounded-lg bg-white/60 px-3 py-2">
              <p class="text-xs text-rose-600">失败原因: {{ currentDetailRepayment.failureReason }}</p>
            </div>
          </div>

          <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
                <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              <span>还款信息</span>
            </h3>
            <div class="grid gap-4 md:grid-cols-3">
              <div>
                <label class="text-xs font-medium text-slate-500">还款类型</label>
                <p class="mt-1 text-sm font-medium text-slate-900">
                  {{ repaymentTypeLabel(currentDetailRepayment?.repaymentType) }}
                </p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">支付方式</label>
                <p class="mt-1 text-sm font-medium text-slate-900">{{ currentDetailRepayment?.paymentMethod }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">交易单号</label>
                <p class="mt-1 text-sm font-mono text-slate-900">{{ currentDetailRepayment?.transactionId || '—' }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">已还利息</label>
                <p class="mt-1 text-sm font-semibold text-amber-600 tabular-nums">
                  {{ formatLedgerAmount(currentDetailRepayment?.interestPaid, currentDetailRepayment?.loanCurrency) }}
                </p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">已还本金</label>
                <p class="mt-1 text-sm font-semibold text-emerald-600 tabular-nums">
                  {{ formatLedgerAmount(currentDetailRepayment?.principalPaid, currentDetailRepayment?.loanCurrency) }}
                </p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">剩余债务</label>
                <p class="mt-1 text-sm font-semibold text-slate-900 tabular-nums">
                  {{ formatLedgerAmount(currentDetailRepayment?.remainingDebt, currentDetailRepayment?.loanCurrency) }}
                </p>
              </div>
            </div>
          </section>

          <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-100">
                <svg class="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </span>
              <span>关联订单</span>
            </h3>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="text-xs font-medium text-slate-500">订单编号</label>
                <p class="mt-1 text-sm font-medium text-blue-600">{{ currentDetailRepayment?.orderId }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">产品名称</label>
                <p class="mt-1 text-sm font-medium text-slate-900">{{ currentDetailRepayment?.productName }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">借出币种</label>
                <p class="mt-1 text-sm font-mono font-medium text-slate-900">{{ currentDetailRepayment?.loanCurrency || '—' }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">用户ID</label>
                <p class="mt-1 text-sm font-mono text-slate-900">{{ currentDetailRepayment?.userId }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">用户姓名</label>
                <p class="mt-1 text-sm font-medium text-slate-900">{{ currentDetailRepayment?.userName }}</p>
              </div>
            </div>
          </section>

          <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
                <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span>时间记录</span>
            </h3>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="text-xs font-medium text-slate-500">创建时间</label>
                <p class="mt-1 text-sm text-slate-900">{{ formatDateTime(currentDetailRepayment?.createTime) }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">完成时间</label>
                <p class="mt-1 text-sm text-slate-900">
                  {{ currentDetailRepayment?.repaymentTime ? formatDateTime(currentDetailRepayment.repaymentTime) : '—' }}
                </p>
              </div>
            </div>
          </section>
        </div>

        <footer class="shrink-0 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4">
          <div class="flex items-center justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              @click="closeDetailModal"
            >
              关闭
            </button>
          </div>
        </footer>
      </article>
    </div>

    <!-- 提醒方式（单条 / 批量） -->
    <div
      v-if="remindModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="closeRemindModal"
    >
      <article class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 class="text-lg font-semibold text-slate-900">发送还款提醒</h2>
        <p class="mt-1 text-sm text-slate-500">
          将对 <span class="font-medium text-slate-800 tabular-nums">{{ remindTargets.length }}</span> 笔还款记录关联用户发送提醒
        </p>
        <fieldset class="mt-5 space-y-2">
          <legend class="text-xs font-medium uppercase tracking-wide text-slate-500">提醒方式</legend>
          <label
            v-for="opt in remindChannelOptions"
            :key="opt.value"
            class="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 has-[:checked]:border-violet-300 has-[:checked]:bg-violet-50/50"
          >
            <input v-model="remindChannel" type="radio" name="remindChannel" class="text-violet-600 focus:ring-violet-500" :value="opt.value" />
            <span class="text-slate-800">{{ opt.label }}</span>
          </label>
        </fieldset>
        <footer class="mt-6 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            @click="closeRemindModal"
          >
            取消
          </button>
          <button
            type="button"
            class="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            @click="confirmRemindSend"
          >
            发送
          </button>
        </footer>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { mockRepayments } from '../../../admin/mock/cryptoLending'
import {
  REPAYMENT_STATUS_LABELS,
  REPAYMENT_TYPE_LABELS,
  REPAYMENT_STATUS,
  REPAYMENT_REMINDER_CHANNEL,
  REPAYMENT_REMINDER_CHANNEL_LABELS
} from '../../../admin/constants/cryptoLending'
import AdminListPaginationBar from '../../../admin/components/AdminListPaginationBar.vue'

const repayments = ref([])
const listPage = ref(1)
const pageSize = ref(10)
const showDetailModal = ref(false)
const currentDetailRepayment = ref(null)

const selectedRepaymentIds = ref([])
const headerCheckboxRef = ref(null)
const remindModalOpen = ref(false)
const remindTargets = ref([])
const remindChannel = ref(REPAYMENT_REMINDER_CHANNEL.IN_APP)

const remindChannelOptions = [
  { value: REPAYMENT_REMINDER_CHANNEL.IN_APP, label: REPAYMENT_REMINDER_CHANNEL_LABELS[REPAYMENT_REMINDER_CHANNEL.IN_APP] },
  { value: REPAYMENT_REMINDER_CHANNEL.SMS, label: REPAYMENT_REMINDER_CHANNEL_LABELS[REPAYMENT_REMINDER_CHANNEL.SMS] },
  { value: REPAYMENT_REMINDER_CHANNEL.EMAIL, label: REPAYMENT_REMINDER_CHANNEL_LABELS[REPAYMENT_REMINDER_CHANNEL.EMAIL] },
  { value: REPAYMENT_REMINDER_CHANNEL.ALL, label: REPAYMENT_REMINDER_CHANNEL_LABELS[REPAYMENT_REMINDER_CHANNEL.ALL] }
]

const filters = ref({
  status: '',
  repaymentType: '',
  timeRange: 'all',
  searchText: ''
})

onMounted(() => {
  repayments.value = [...mockRepayments]
})

function parseRowTimeMs(r) {
  const s = r.repaymentTime || r.createTime
  if (!s) return null
  const t = Date.parse(String(s).replace(' ', 'T'))
  return Number.isNaN(t) ? null : t
}

function startOfTodayMs() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function startOfWeekMondayMs() {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const s = new Date(d)
  s.setDate(d.getDate() + diff)
  s.setHours(0, 0, 0, 0)
  return s.getTime()
}

function startOfMonthMs() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0).getTime()
}

const filteredRepayments = computed(() => {
  let result = repayments.value

  if (filters.value.status) {
    result = result.filter((r) => r.status === filters.value.status)
  }
  if (filters.value.repaymentType) {
    result = result.filter((r) => r.repaymentType === filters.value.repaymentType)
  }
  if (filters.value.searchText) {
    const search = filters.value.searchText.toLowerCase().trim()
    result = result.filter((r) => {
      const cur = (r.loanCurrency || '').toLowerCase()
      return (
        r.repaymentId.toLowerCase().includes(search) ||
        r.orderId.toLowerCase().includes(search) ||
        r.userId.toLowerCase().includes(search) ||
        (r.userName && r.userName.toLowerCase().includes(search)) ||
        (cur && cur.includes(search))
      )
    })
  }

  const tr = filters.value.timeRange
  if (tr && tr !== 'all') {
    const now = Date.now()
    let from = 0
    if (tr === 'today') from = startOfTodayMs()
    else if (tr === 'week') from = startOfWeekMondayMs()
    else if (tr === 'month') from = startOfMonthMs()
    result = result.filter((r) => {
      const t = parseRowTimeMs(r)
      return t != null && t >= from && t <= now
    })
  }

  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRepayments.value.length / pageSize.value)))

const repaymentsPaged = computed(() => {
  const list = filteredRepayments.value
  const page = Math.min(listPage.value, totalPages.value)
  const start = (page - 1) * pageSize.value
  return list.slice(start, start + pageSize.value)
})

const selectedRepaymentRows = computed(() =>
  repayments.value.filter((r) => selectedRepaymentIds.value.includes(r.repaymentId))
)

const selectedFailedRows = computed(() =>
  selectedRepaymentRows.value.filter((r) => r.status === REPAYMENT_STATUS.FAILED)
)

const selectedRemindRows = computed(() =>
  selectedRepaymentRows.value.filter(
    (r) => r.status === REPAYMENT_STATUS.PENDING || r.status === REPAYMENT_STATUS.OVERDUE
  )
)

const pageRepaymentIds = computed(() => repaymentsPaged.value.map((r) => r.repaymentId))

const allPageSelected = computed(() => {
  const ids = pageRepaymentIds.value
  if (!ids.length) return false
  return ids.every((id) => selectedRepaymentIds.value.includes(id))
})

function isRepaymentSelected(id) {
  return selectedRepaymentIds.value.includes(id)
}

function toggleRepaymentSelect(id) {
  const cur = selectedRepaymentIds.value
  const i = cur.indexOf(id)
  if (i === -1) selectedRepaymentIds.value = [...cur, id]
  else selectedRepaymentIds.value = cur.filter((x) => x !== id)
}

function onToggleSelectAllPage(e) {
  const checked = e.target.checked
  const ids = pageRepaymentIds.value
  if (checked) {
    const set = new Set([...selectedRepaymentIds.value, ...ids])
    selectedRepaymentIds.value = [...set]
  } else {
    const idSet = new Set(ids)
    selectedRepaymentIds.value = selectedRepaymentIds.value.filter((x) => !idSet.has(x))
  }
}

function clearSelection() {
  selectedRepaymentIds.value = []
}

watchEffect(() => {
  const el = headerCheckboxRef.value
  if (!el) return
  const ids = pageRepaymentIds.value
  const sel = selectedRepaymentIds.value
  const onPage = ids.filter((id) => sel.includes(id)).length
  el.indeterminate = ids.length > 0 && onPage > 0 && onPage < ids.length
})

watch(
  () => repayments.value.map((r) => r.repaymentId).join('\0'),
  () => {
    const valid = new Set(repayments.value.map((r) => r.repaymentId))
    selectedRepaymentIds.value = selectedRepaymentIds.value.filter((id) => valid.has(id))
  }
)

watch(
  () => [filters.value.status, filters.value.repaymentType, filters.value.timeRange, filters.value.searchText],
  () => {
    listPage.value = 1
  }
)

watch([() => filteredRepayments.value.length, pageSize], () => {
  const tp = Math.max(1, Math.ceil(filteredRepayments.value.length / pageSize.value))
  if (listPage.value > tp) listPage.value = tp
})

const formatLedgerAmount = (value, loanCurrency) => {
  if (value == null || !Number.isFinite(Number(value))) return '—'
  const cur = loanCurrency || 'USDT'
  return `${Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 6 })} ${cur}`
}

const formatLedgerNumber = (value) => {
  if (value == null || !Number.isFinite(Number(value))) return '—'
  return Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 6 })
}

function truncateMiddle(s, max = 14) {
  if (s == null || s === '') return ''
  if (s.length <= max) return s
  const keep = max - 1
  const head = Math.ceil(keep / 2)
  const tail = Math.floor(keep / 2)
  return `${s.slice(0, head)}…${s.slice(-tail)}`
}

const formatDateTime = (dateStr) => dateStr || '—'

const statusLabel = (status) => REPAYMENT_STATUS_LABELS[status] || status

const repaymentTypeLabel = (type) => REPAYMENT_TYPE_LABELS[type] || type

const resetFilters = () => {
  filters.value = {
    status: '',
    repaymentType: '',
    timeRange: 'all',
    searchText: ''
  }
}

const onPageSizeChange = (n) => {
  pageSize.value = n
  listPage.value = 1
}

const viewDetails = (repayment) => {
  currentDetailRepayment.value = repayment
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  currentDetailRepayment.value = null
}

const retryRepayment = (repayment) => {
  if (!confirm(`确定重新发起还款 ${repayment.repaymentId} 吗？`)) return
  const index = repayments.value.findIndex((r) => r.repaymentId === repayment.repaymentId)
  if (index === -1) return
  repayments.value[index] = {
    ...repayments.value[index],
    status: REPAYMENT_STATUS.PROCESSING,
    failureReason: null
  }
  alert('已重新发起还款')
}

function applyRetryToRepayments(ids) {
  const idSet = new Set(ids)
  repayments.value = repayments.value.map((r) =>
    idSet.has(r.repaymentId)
      ? { ...r, status: REPAYMENT_STATUS.PROCESSING, failureReason: null }
      : r
  )
}

function batchRetrySelected() {
  const rows = selectedFailedRows.value
  if (!rows.length) {
    alert('所选记录中没有可重试的失败还款')
    return
  }
  if (!confirm(`确定对 ${rows.length} 条失败记录重新发起还款吗？`)) return
  applyRetryToRepayments(rows.map((r) => r.repaymentId))
  alert(`已重新发起 ${rows.length} 条还款`)
}

function openRemindModal(rows) {
  if (!rows.length) return
  remindTargets.value = rows
  remindChannel.value = REPAYMENT_REMINDER_CHANNEL.IN_APP
  remindModalOpen.value = true
}

function closeRemindModal() {
  remindModalOpen.value = false
  remindTargets.value = []
}

function openRemindModalForBatch() {
  const rows = selectedRemindRows.value
  if (!rows.length) {
    alert('所选记录中没有待还款或逾期记录')
    return
  }
  openRemindModal(rows)
}

function confirmRemindSend() {
  const rows = remindTargets.value
  if (!rows.length) return
  const ch = remindChannel.value
  const label = REPAYMENT_REMINDER_CHANNEL_LABELS[ch] || ch
  const users = [...new Set(rows.map((r) => r.userName || r.userId))]
  const userPart =
    users.length <= 5 ? users.join('、') : `${users.slice(0, 5).join('、')} 等 ${users.length} 人`
  alert(`已通过「${label}」向 ${rows.length} 笔还款关联用户发送提醒（${userPart}）`)
  closeRemindModal()
}

const sendReminder = (repayment) => {
  openRemindModal([repayment])
}

</script>
