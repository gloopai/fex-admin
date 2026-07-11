<script setup>
import { portfolioOperationLogs } from '../../../admin/state/portfolioOperationLogs'
</script>

<template>
  <section class="space-y-5">
    <header>
      <h1 class="text-3xl font-semibold text-slate-900">投资组合操作日志</h1>
      <p class="mt-1 text-sm text-slate-500">审计产品配置、上下架、收益与赎回规则调整</p>
    </header>

    <article class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table class="w-full">
        <thead class="border-b border-slate-200 bg-slate-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">时间</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">操作人</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">动作</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">对象</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">摘要</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="log in portfolioOperationLogs" :key="log.id" class="hover:bg-slate-50">
            <td class="px-6 py-4 text-sm text-slate-600">{{ log.createdAt }}</td>
            <td class="px-6 py-4 text-sm text-slate-900">{{ log.operator }}</td>
            <td class="px-6 py-4 text-sm text-blue-600">{{ log.action }}</td>
            <td class="px-6 py-4 text-sm text-slate-700">{{ log.target }}</td>
            <td class="px-6 py-4 text-sm text-slate-600">{{ log.summary }}</td>
          </tr>
        </tbody>
      </table>
    </article>
  </section>
</template>
