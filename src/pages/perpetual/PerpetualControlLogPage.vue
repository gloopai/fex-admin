<script setup>
import { computed, ref } from 'vue'

const contractFilter = ref('all')
const actionFilter = ref('all')
const resultFilter = ref('all')
const keyword = ref('')

const logs = ref([
  {
    id: 'L-10039',
    time: '2026-03-08 10:31:12',
    contract: 'BTCUSDT',
    action: '触发规则',
    rule: '多头过重自动调整',
    operator: 'system',
    result: 'success',
    detail: '净多头超过阈值，自动增加价格偏移和滑点'
  },
  {
    id: 'L-10038',
    time: '2026-03-08 10:02:44',
    contract: 'ETHUSDT',
    action: '编辑参数',
    rule: '手动调整',
    operator: 'ops_admin',
    result: 'success',
    detail: '滑点率由 0.08% 调整到 0.10%'
  },
  {
    id: 'L-10037',
    time: '2026-03-08 09:18:02',
    contract: 'BTCUSDT',
    action: '暂停线控',
    rule: '手动操作',
    operator: 'risk_manager',
    result: 'success',
    detail: '临时暂停合约线控，等待风控参数回滚'
  },
  {
    id: 'L-10036',
    time: '2026-03-08 08:55:17',
    contract: 'SOLUSDT',
    action: '新增规则',
    rule: '回撤率触发保护',
    operator: 'ops_admin',
    result: 'failed',
    detail: '新增失败：规则条件表达式校验未通过'
  }
])

const filteredLogs = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return logs.value.filter((log) => {
    const matchContract = contractFilter.value === 'all' || log.contract === contractFilter.value
    const matchAction = actionFilter.value === 'all' || log.action === actionFilter.value
    const matchResult = resultFilter.value === 'all' || log.result === resultFilter.value
    const matchKeyword = !kw || [log.id, log.rule, log.operator, log.detail].join(' ').toLowerCase().includes(kw)
    return matchContract && matchAction && matchResult && matchKeyword
  })
})
</script>

<template>
  <section class="space-y-5">
    <header>
      <h1 class="text-3xl font-semibold text-slate-900">合约线控日志</h1>
      <p class="mt-1 text-sm text-slate-500">审计线控策略的新增、编辑、触发、暂停等关键操作</p>
    </header>

    <article class="rounded-xl border border-slate-200 bg-white p-4">
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <select v-model="contractFilter" class="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500">
          <option value="all">全部合约</option>
          <option value="BTCUSDT">BTCUSDT</option>
          <option value="ETHUSDT">ETHUSDT</option>
          <option value="SOLUSDT">SOLUSDT</option>
        </select>

        <select v-model="actionFilter" class="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500">
          <option value="all">全部动作</option>
          <option value="触发规则">触发规则</option>
          <option value="编辑参数">编辑参数</option>
          <option value="暂停线控">暂停线控</option>
          <option value="新增规则">新增规则</option>
        </select>

        <select v-model="resultFilter" class="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500">
          <option value="all">全部结果</option>
          <option value="success">成功</option>
          <option value="failed">失败</option>
        </select>

        <input
          v-model="keyword"
          type="text"
          placeholder="搜索日志ID/规则/操作人..."
          class="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
      </div>
    </article>

    <article class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[980px] text-left text-sm">
          <thead class="bg-slate-50 text-slate-500">
            <tr>
              <th class="px-4 py-3 font-medium">时间</th>
              <th class="px-4 py-3 font-medium">日志ID</th>
              <th class="px-4 py-3 font-medium">合约</th>
              <th class="px-4 py-3 font-medium">动作</th>
              <th class="px-4 py-3 font-medium">规则/对象</th>
              <th class="px-4 py-3 font-medium">操作人</th>
              <th class="px-4 py-3 font-medium">结果</th>
              <th class="px-4 py-3 font-medium">详情</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in filteredLogs" :key="log.id" class="border-t border-slate-100 align-top">
              <td class="px-4 py-3 text-slate-600">{{ log.time }}</td>
              <td class="px-4 py-3 font-medium text-slate-900">{{ log.id }}</td>
              <td class="px-4 py-3 text-slate-700">{{ log.contract }}</td>
              <td class="px-4 py-3 text-slate-700">{{ log.action }}</td>
              <td class="px-4 py-3 text-slate-700">{{ log.rule }}</td>
              <td class="px-4 py-3 text-slate-700">{{ log.operator }}</td>
              <td class="px-4 py-3">
                <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="log.result === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                  {{ log.result === 'success' ? '成功' : '失败' }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-600">{{ log.detail }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="filteredLogs.length === 0" class="p-8 text-center text-sm text-slate-500">没有符合条件的日志记录</p>
    </article>
  </section>
</template>
