<script setup>
import { ref } from 'vue'
import { createRuleHitHistoryMock } from '../../mock/deliveryControl'

const hitHistory = ref(createRuleHitHistoryMock())
const keyword = ref('')
const ruleFilter = ref('all')
const resultFilter = ref('all')

// 获取唯一的规则列表
const uniqueRules = [...new Set(hitHistory.value.map(h => h.ruleName))]
</script>

<template>
  <section class="space-y-5">
    <header>
      <h1 class="text-3xl font-semibold text-slate-900">规则触发历史</h1>
      <p class="mt-1 text-sm text-slate-500">查看自动化规则的触发记录和执行结果</p>
    </header>

    <!-- 筛选栏 -->
    <div class="flex flex-wrap items-center gap-3">
      <input
        v-model="keyword"
        type="text"
        placeholder="搜索用户名或用户ID..."
        class="w-full max-w-xs rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
      />
      <select v-model="ruleFilter" class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
        <option value="all">全部规则</option>
        <option v-for="rule in uniqueRules" :key="rule" :value="rule">{{ rule }}</option>
      </select>
      <select v-model="resultFilter" class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
        <option value="all">全部结果</option>
        <option value="success">成功</option>
        <option value="failed">失败</option>
      </select>
    </div>

    <!-- 历史记录表格 -->
    <article class="rounded-xl border border-slate-200 bg-white">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b border-slate-200 bg-slate-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">时间</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">规则</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">用户</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">触发值</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">执行动作</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-900 uppercase">结果</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-900 uppercase">影响持仓</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr 
              v-for="hit in hitHistory" 
              :key="hit.id" 
              class="hover:bg-slate-50 transition"
            >
              <td class="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{{ hit.triggerTime }}</td>
              <td class="px-6 py-4 text-sm font-medium text-slate-900">{{ hit.ruleName }}</td>
              <td class="px-6 py-4 text-sm">
                <div class="font-medium text-slate-900">{{ hit.userName }}</div>
                <div class="text-slate-500">{{ hit.userId }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ hit.triggerValue }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ hit.action }}</td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="rounded-md px-2 py-1 text-xs font-medium"
                  :class="hit.result === 'success' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-rose-100 text-rose-700'"
                >
                  {{ hit.result === 'success' ? '成功' : '失败' }}
                </span>
              </td>
              <td class="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                {{ hit.affectedPositions }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="border-t border-slate-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-slate-600">
            显示 <span class="font-medium">{{ hitHistory.length }}</span> 条记录
          </p>
          <div class="flex gap-2">
            <button 
              type="button"
              class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              上一页
            </button>
            <button 
              type="button"
              class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>
