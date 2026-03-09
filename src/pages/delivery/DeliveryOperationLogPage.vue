<script setup>
import { computed, ref } from 'vue'
import { COMMON_FILTER_ALL, DELIVERY_LOG_STATUS } from '../../constants/delivery'
import { createDeliveryOperationLogsMock } from '../../mock/delivery'

const statusTab = ref(COMMON_FILTER_ALL)
const keyword = ref('')

const logs = ref(createDeliveryOperationLogsMock())

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return logs.value.filter((i) => {
    const hitStatus = statusTab.value === COMMON_FILTER_ALL || i.status === statusTab.value
    const hitKw = !kw || `${i.operator} ${i.action} ${i.target}`.toLowerCase().includes(kw)
    return hitStatus && hitKw
  })
})

const badgeClass = (status) => (status === DELIVERY_LOG_STATUS.SUCCESS ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')
</script>

<template>
  <section class="space-y-4">
    <header>
      <h1 class="text-3xl font-semibold text-slate-900">交割合约操作日志</h1>
      <p class="mt-1 text-sm text-slate-500">审计交割合约配置、周期模板与场控操作记录</p>
    </header>

    <article class="rounded-xl border border-slate-200 bg-white">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
        <div class="inline-flex items-center gap-4 text-sm">
          <button type="button" class="font-medium" :class="statusTab === COMMON_FILTER_ALL ? 'text-blue-600' : 'text-slate-500'" @click="statusTab = COMMON_FILTER_ALL">全部</button>
          <button type="button" class="font-medium" :class="statusTab === DELIVERY_LOG_STATUS.SUCCESS ? 'text-blue-600' : 'text-slate-500'" @click="statusTab = DELIVERY_LOG_STATUS.SUCCESS">成功</button>
          <button type="button" class="font-medium" :class="statusTab === DELIVERY_LOG_STATUS.FAILED ? 'text-blue-600' : 'text-slate-500'" @click="statusTab = DELIVERY_LOG_STATUS.FAILED">失败</button>
        </div>
        <input v-model="keyword" type="text" placeholder="搜索操作人、动作、对象..." class="w-full max-w-sm rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
      </div>

      <div class="overflow-x-auto p-4">
        <table class="min-w-full text-left text-sm">
          <thead>
            <tr class="bg-slate-50 text-slate-500">
              <th class="px-4 py-3 font-medium">时间</th>
              <th class="px-4 py-3 font-medium">操作人</th>
              <th class="px-4 py-3 font-medium">动作</th>
              <th class="px-4 py-3 font-medium">对象</th>
              <th class="px-4 py-3 font-medium">详情</th>
              <th class="px-4 py-3 font-medium">状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in filtered" :key="row.id" class="border-b border-slate-100">
              <td class="px-4 py-3 text-slate-700">{{ row.time }}</td>
              <td class="px-4 py-3 text-slate-700">{{ row.operator }}</td>
              <td class="px-4 py-3 text-slate-700">{{ row.action }}</td>
              <td class="px-4 py-3 text-slate-700">{{ row.target }}</td>
              <td class="px-4 py-3 text-slate-700">{{ row.detail }}</td>
              <td class="px-4 py-3"><span class="rounded-md px-2 py-0.5 text-xs" :class="badgeClass(row.status)">{{ row.status === DELIVERY_LOG_STATUS.SUCCESS ? '成功' : '失败' }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>
