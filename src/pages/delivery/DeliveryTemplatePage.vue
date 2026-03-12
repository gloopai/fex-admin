<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { COMMON_FILTER_ALL, DELIVERY_STATUS } from '../../constants/delivery'
import { createDeliveryTemplatesMock } from '../../mock/delivery'

const statusTab = ref(COMMON_FILTER_ALL)
const search = ref('')
const expandedTemplateIds = ref(new Set())

const toggleExpand = (id) => {
  if (expandedTemplateIds.value.has(id)) {
    expandedTemplateIds.value.delete(id)
  } else {
    expandedTemplateIds.value.add(id)
  }
}

const isExpanded = (id) => expandedTemplateIds.value.has(id)

const templates = ref(createDeliveryTemplatesMock())

// 分页状态
const pagination = reactive({
  currentPage: 1,
  pageSize: 5,
  total: 0
})

const allFilteredTemplates = computed(() => {
  const kw = search.value.trim().toLowerCase()
  return templates.value.filter((t) => {
    const hitStatus = statusTab.value === COMMON_FILTER_ALL || t.status === statusTab.value
    const hitKw = !kw || t.name.toLowerCase().includes(kw)
    return hitStatus && hitKw
  })
})

const filteredTemplates = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return allFilteredTemplates.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(allFilteredTemplates.value.length / pagination.pageSize))

// 监听筛选变化，重置页码
watch([statusTab, search], () => {
  pagination.currentPage = 1
})

const durationLabel = (sec) => {
  if (sec < 60) return `${sec}秒`
  if (sec % 60 === 0) return `${sec / 60}分钟`
  return `${sec}s`
}

const showTemplateModal = ref(false)
const editingTemplateId = ref('')
const templateForm = reactive({
  name: '',
  status: DELIVERY_STATUS.ENABLED,
  cycles: []
})

const openCreateTemplate = () => {
  editingTemplateId.value = ''
  templateForm.name = ''
  templateForm.status = DELIVERY_STATUS.ENABLED
  templateForm.cycles = [{ id: `cy-${Date.now()}`, durationSec: 30, payoutPct: 7 }]
  showTemplateModal.value = true
}

const openEditTemplate = (tpl) => {
  editingTemplateId.value = tpl.id
  templateForm.name = tpl.name
  templateForm.status = tpl.status
  templateForm.cycles = tpl.cycles.map((item) => ({ ...item }))
  showTemplateModal.value = true
}

const addCycle = () => {
  templateForm.cycles.push({ id: `cy-${Date.now()}`, durationSec: 60, payoutPct: 10 })
}

const removeCycle = (id) => {
  templateForm.cycles = templateForm.cycles.filter((c) => c.id !== id)
}

const saveTemplate = () => {
  const payload = {
    name: templateForm.name.trim(),
    status: templateForm.status,
    cycles: templateForm.cycles.map((c) => ({ ...c, durationSec: Number(c.durationSec), payoutPct: Number(c.payoutPct) }))
  }

  if (editingTemplateId.value) {
    templates.value = templates.value.map((tpl) => (tpl.id === editingTemplateId.value ? { ...tpl, ...payload } : tpl))
  } else {
    templates.value.unshift({ id: `tpl-${Date.now()}`, ...payload })
  }

  showTemplateModal.value = false
}

const statusClass = (status) => (status === DELIVERY_STATUS.ENABLED ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600')
</script>

<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">周期模板管理</h1>
        <p class="mt-1 text-sm text-slate-500">管理交割合约的交易周期与收益率模板</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        @click="openCreateTemplate"
      >
        <span class="text-base">+</span>
        <span>新增模板</span>
      </button>
    </header>

    <article class="rounded-xl border border-slate-200 bg-white">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4">
        <div class="flex items-center gap-4">
          <div class="inline-flex items-center gap-3 text-sm">
            <button type="button" class="font-medium" :class="statusTab === COMMON_FILTER_ALL ? 'text-blue-600' : 'text-slate-500'" @click="statusTab = COMMON_FILTER_ALL">全部</button>
            <button type="button" class="font-medium" :class="statusTab === DELIVERY_STATUS.ENABLED ? 'text-blue-600' : 'text-slate-500'" @click="statusTab = DELIVERY_STATUS.ENABLED">已启用</button>
            <button type="button" class="font-medium" :class="statusTab === DELIVERY_STATUS.DISABLED ? 'text-blue-600' : 'text-slate-500'" @click="statusTab = DELIVERY_STATUS.DISABLED">已禁用</button>
          </div>
        </div>

        <input v-model="search" type="text" placeholder="搜索模板名称..." class="w-full max-w-sm rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500" />
      </div>

      <div class="space-y-4 p-4">
        <article v-for="tpl in filteredTemplates" :key="tpl.id" class="rounded-xl border border-slate-200 bg-white">
          <div class="flex items-center justify-between border-b border-slate-200 p-4">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-slate-900">{{ tpl.name }}</h3>
              <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="statusClass(tpl.status)">{{ tpl.status === DELIVERY_STATUS.ENABLED ? '已启用' : '已禁用' }}</span>
              <span class="text-sm text-slate-500">{{ tpl.cycles.length }} 个周期</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="tpl.cycles.length > 8"
                type="button"
                class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-blue-600 hover:bg-slate-50 flex items-center gap-1"
                @click="toggleExpand(tpl.id)"
              >
                <span>{{ isExpanded(tpl.id) ? '收起' : '展开全部' }}</span>
                <svg
                  class="w-4 h-4 transition-transform duration-200"
                  :class="{ 'rotate-180': isExpanded(tpl.id) }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button type="button" class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" @click="openEditTemplate(tpl)">编辑</button>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 p-4">
            <div
              v-for="cycle in (isExpanded(tpl.id) ? tpl.cycles : tpl.cycles.slice(0, 8))"
              :key="cycle.id"
              class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm"
            >
              <span class="text-xs text-slate-400 font-medium">时长</span>
              <span class="font-semibold text-slate-900">{{ durationLabel(cycle.durationSec) }}</span>
              <span class="text-slate-300 mx-0.5">|</span>
              <span class="text-xs text-slate-400 font-medium">收益</span>
              <span class="font-bold text-emerald-600">{{ cycle.payoutPct.toFixed(1) }}%</span>
            </div>
            <div
              v-if="!isExpanded(tpl.id) && tpl.cycles.length > 8"
              class="inline-flex items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/50 px-3 py-1.5 cursor-pointer hover:bg-slate-50 text-sm text-slate-400"
              @click="toggleExpand(tpl.id)"
            >
              还有 {{ tpl.cycles.length - 8 }} 个周期...
            </div>
          </div>
        </article>
      </div>

      <!-- 分页组件 -->
      <div v-if="totalPages > 1" class="border-t border-slate-200 px-6 py-4 flex items-center justify-between">
        <div class="text-sm text-slate-600">
          共 <span class="font-medium">{{ allFilteredTemplates.length }}</span> 条记录，第 <span class="font-medium">{{ pagination.currentPage }}</span> / <span class="font-medium">{{ totalPages }}</span> 页
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="pagination.currentPage--"
            :disabled="pagination.currentPage === 1"
            class="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            上一页
          </button>
          <button
            type="button"
            @click="pagination.currentPage++"
            :disabled="pagination.currentPage === totalPages"
            class="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            下一页
          </button>
        </div>
      </div>
    </article>
  </section>

  <div v-if="showTemplateModal" class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" @click.self="showTemplateModal = false">
    <section class="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white">
      <header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <h2 class="text-xl font-semibold text-slate-900">{{ editingTemplateId ? '编辑周期模板' : '新增周期模板' }}</h2>
        <button type="button" class="text-2xl text-slate-400" @click="showTemplateModal = false">×</button>
      </header>

      <div class="flex-1 space-y-4 overflow-y-auto px-6 py-5">
        <div class="grid gap-3 md:grid-cols-[1fr,180px]">
          <label class="space-y-1"><span class="text-sm">模板名称</span><input v-model="templateForm.name" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <label class="space-y-1"><span class="text-sm">状态</span><select v-model="templateForm.status" class="w-full rounded-lg border border-slate-300 px-3 py-2"><option :value="DELIVERY_STATUS.ENABLED">已启用</option><option :value="DELIVERY_STATUS.DISABLED">已禁用</option></select></label>
        </div>

        <div class="rounded-lg border border-slate-200 p-4">
          <div class="mb-3 flex items-center justify-between">
            <p class="font-medium text-slate-900">周期配置</p>
            <button type="button" class="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white" @click="addCycle">+ 添加周期</button>
          </div>

          <div class="max-h-[38vh] space-y-2 overflow-y-auto pr-1">
            <div class="sticky top-0 z-10 grid grid-cols-[60px,1fr,1fr,1fr,40px] gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-500 shadow-sm">
              <span>序号</span><span>周期时长(秒)</span><span>收益率(%)</span><span>预览</span><span></span>
            </div>
            <div v-for="(cycle, index) in templateForm.cycles" :key="cycle.id" class="grid grid-cols-[60px,1fr,1fr,1fr,40px] gap-2 px-3 py-1.5">
              <div class="grid place-items-center"><span class="h-6 w-6 rounded-full bg-blue-600 text-center text-xs leading-6 text-white">{{ index + 1 }}</span></div>
              <input v-model.number="cycle.durationSec" type="number" class="rounded-lg border border-slate-300 px-3 py-2" />
              <input v-model.number="cycle.payoutPct" type="number" step="0.01" class="rounded-lg border border-slate-300 px-3 py-2" />
              <p class="self-center text-slate-600">{{ durationLabel(cycle.durationSec) }} / {{ Number(cycle.payoutPct).toFixed(2) }}%</p>
              <button type="button" class="self-center text-rose-500" @click="removeCycle(cycle.id)">删</button>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-slate-700">
          <p>模板名称: <span class="font-semibold text-slate-900">{{ templateForm.name || '-' }}</span></p>
          <p class="mt-1 text-right">共 <span class="font-semibold text-blue-600">{{ templateForm.cycles.length }}</span> 个周期</p>
        </div>
      </div>

      <footer class="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
        <button type="button" class="rounded-lg border border-slate-300 px-4 py-2" @click="showTemplateModal = false">取消</button>
        <button type="button" class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white" @click="saveTemplate">保存</button>
      </footer>
    </section>
  </div>
</template>
