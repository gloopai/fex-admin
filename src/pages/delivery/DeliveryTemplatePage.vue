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

const statusClass = (status) =>
  status === DELIVERY_STATUS.ENABLED
    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
    : 'bg-rose-50 text-rose-600 border-rose-100'
</script>

<template>
  <section class="space-y-4">
    <!-- Page Header -->
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">周期模板管理</h1>
        <p class="mt-1 text-sm text-slate-500">统一管理交割合约产品的结算周期与对应的收益率预设模板</p>
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
      <!-- 筛选栏 -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="inline-flex items-center gap-2 text-sm">
            <button
              type="button"
              class="font-medium"
              :class="statusTab === COMMON_FILTER_ALL ? 'text-blue-600' : 'text-slate-500'"
              @click="statusTab = COMMON_FILTER_ALL"
            >
              全部
            </button>
            <button
              type="button"
              class="font-medium"
              :class="statusTab === DELIVERY_STATUS.ENABLED ? 'text-blue-600' : 'text-slate-500'"
              @click="statusTab = DELIVERY_STATUS.ENABLED"
            >
              已启用
            </button>
            <button
              type="button"
              class="font-medium"
              :class="statusTab === DELIVERY_STATUS.DISABLED ? 'text-blue-600' : 'text-slate-500'"
              @click="statusTab = DELIVERY_STATUS.DISABLED"
            >
              已禁用
            </button>
          </div>
        </div>

        <div class="flex w-full max-w-2xl flex-wrap items-center justify-end gap-2">
          <div class="relative w-full max-w-sm">
            <input
              v-model="search"
              type="text"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
              placeholder="搜索模板名称..."
            />
            <svg viewBox="0 0 20 20" class="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none">
              <circle cx="9" cy="9" r="5.8" stroke="currentColor" stroke-width="1.6" />
              <path d="M13.6 13.6L16.4 16.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 列表内容 -->
      <div class="p-4 space-y-4">
        <article
          v-for="tpl in filteredTemplates"
          :key="tpl.id"
          class="rounded-xl border border-slate-200 bg-white transition-all hover:border-blue-500/30 hover:shadow-sm"
        >
          <div class="flex items-center justify-between border-b border-slate-100 p-4">
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-semibold text-slate-900">{{ tpl.name }}</h3>
              <span
                class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md"
                :class="statusClass(tpl.status)"
              >
                {{ tpl.status === DELIVERY_STATUS.ENABLED ? '已启用' : '已禁用' }}
              </span>
              <span class="text-xs text-slate-500">{{ tpl.cycles.length }} 个预设周期</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="tpl.cycles.length > 8"
                type="button"
                class="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1"
                @click="toggleExpand(tpl.id)"
              >
                <span>{{ isExpanded(tpl.id) ? '收起' : '展开全部' }}</span>
                <svg
                  class="w-3 h-3 transition-transform duration-200"
                  :class="{ 'rotate-180': isExpanded(tpl.id) }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div class="w-px h-3 bg-slate-200 mx-1"></div>
              <button
                type="button"
                class="text-blue-600 hover:text-blue-700 text-xs font-medium"
                @click="openEditTemplate(tpl)"
              >
                编辑配置
              </button>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 p-4 bg-slate-50/50">
            <div
              v-for="cycle in isExpanded(tpl.id) ? tpl.cycles : tpl.cycles.slice(0, 8)"
              :key="cycle.id"
              class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
            >
              <span class="text-slate-500">时长:</span>
              <span class="font-medium text-slate-900">{{ durationLabel(cycle.durationSec) }}</span>
              <span class="text-slate-200">|</span>
              <span class="text-slate-500">收益:</span>
              <span class="font-bold text-emerald-600">{{ cycle.payoutPct.toFixed(1) }}%</span>
            </div>
            <div
              v-if="!isExpanded(tpl.id) && tpl.cycles.length > 8"
              class="inline-flex items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 cursor-pointer hover:bg-slate-100 transition-all text-xs text-slate-500"
              @click="toggleExpand(tpl.id)"
            >
              还有 {{ tpl.cycles.length - 8 }} 个周期...
            </div>
          </div>
        </article>
      </div>

      <!-- 分页组件 -->
      <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-slate-100 p-4">
        <div class="text-sm text-slate-500">
          共 <span class="font-medium text-slate-900">{{ allFilteredTemplates.length }}</span> 个模板，第
          <span class="font-medium text-slate-900">{{ pagination.currentPage }}</span> / {{ totalPages }} 页
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="pagination.currentPage === 1"
            @click="pagination.currentPage--"
          >
            上一页
          </button>
          <button
            type="button"
            class="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="pagination.currentPage === totalPages"
            @click="pagination.currentPage++"
          >
            下一页
          </button>
        </div>
      </div>
    </article>

    <!-- 编辑模态框 -->
    <Transition name="modal">
      <div
        v-if="showTemplateModal"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
        @click.self="showTemplateModal = false"
      >
        <section
          class="flex flex-col w-full max-w-4xl h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl border border-slate-200"
        >
          <header class="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-6 py-4">
            <div>
              <h2 class="text-xl font-semibold text-slate-900">{{ editingTemplateId ? '编辑周期模板' : '新增周期模板' }}</h2>
              <p class="mt-0.5 text-xs text-slate-500">配置交割合约的结算周期与对应的收益率</p>
            </div>
            <button
              type="button"
              class="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none"
              @click="showTemplateModal = false"
            >
              ×
            </button>
          </header>

          <div class="flex-1 overflow-y-auto bg-slate-50/30 p-6 space-y-6">
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-900">模板名称 <span class="text-rose-500">*</span></label>
                  <input
                    v-model="templateForm.name"
                    type="text"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-sm"
                    placeholder="如：标准收益模板"
                  />
                </div>
                <div class="space-y-2">
                  <span class="text-sm font-medium text-slate-900">模板状态</span>
                  <div class="flex rounded-lg border border-slate-200 bg-slate-50 p-1 w-fit">
                    <button
                      type="button"
                      class="rounded-md px-4 py-1.5 text-sm transition-all"
                      :class="
                        templateForm.status === DELIVERY_STATUS.ENABLED
                          ? 'bg-white shadow-sm font-medium text-blue-600'
                          : 'text-slate-500 hover:text-slate-700'
                      "
                      @click="templateForm.status = DELIVERY_STATUS.ENABLED"
                    >
                      已启用
                    </button>
                    <button
                      type="button"
                      class="rounded-md px-4 py-1.5 text-sm transition-all"
                      :class="
                        templateForm.status === DELIVERY_STATUS.DISABLED
                          ? 'bg-white shadow-sm font-medium text-blue-600'
                          : 'text-slate-500 hover:text-slate-700'
                      "
                      @click="templateForm.status = DELIVERY_STATUS.DISABLED"
                    >
                      已禁用
                    </button>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <h3 class="text-base font-semibold text-slate-900">周期明细配置</h3>
                    <span class="rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-600">{{ templateForm.cycles.length }} 个档位</span>
                  </div>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                    @click="addCycle"
                  >
                    <span>+</span>
                    <span>添加结算周期</span>
                  </button>
                </div>

                <div class="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-50/80 text-[11px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th class="px-4 py-3 w-16 text-center">序号</th>
                        <th class="px-4 py-3">周期时长 (秒)</th>
                        <th class="px-4 py-3">收益率 (%)</th>
                        <th class="px-4 py-3">实时预览</th>
                        <th class="px-4 py-3 w-20 text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      <tr v-for="(cycle, index) in templateForm.cycles" :key="cycle.id" class="text-sm hover:bg-slate-50/50 transition-colors">
                        <td class="px-4 py-4 text-center">
                          <span class="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-[10px] text-slate-500 font-bold">
                            {{ index + 1 }}
                          </span>
                        </td>
                        <td class="px-4 py-4">
                          <input
                            v-model.number="cycle.durationSec"
                            type="number"
                            class="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                          />
                        </td>
                        <td class="px-4 py-4">
                          <div class="relative">
                            <input
                              v-model.number="cycle.payoutPct"
                              type="number"
                              step="0.1"
                              class="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 pr-6"
                            />
                            <span class="absolute right-2 top-1.5 text-slate-400 text-[10px]">%</span>
                          </div>
                        </td>
                        <td class="px-4 py-4">
                          <div class="flex items-center gap-2">
                            <span class="text-xs font-semibold text-blue-600">{{ durationLabel(cycle.durationSec) }}</span>
                            <span class="text-slate-300">/</span>
                            <span class="text-xs font-bold text-emerald-600">{{ Number(cycle.payoutPct).toFixed(1) }}%</span>
                          </div>
                        </td>
                        <td class="px-4 py-4 text-center">
                          <button
                            type="button"
                            class="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-md hover:bg-rose-50"
                            @click="removeCycle(cycle.id)"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div v-if="templateForm.cycles.length === 0" class="p-8 text-center text-slate-400 text-sm italic bg-slate-50/30">
                    暂无配置，请点击上方按钮添加周期
                  </div>
                </div>
              </div>

              <div class="rounded-xl bg-blue-50/50 border border-blue-100 p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div class="flex items-center gap-6">
                  <span class="text-slate-600">模板名称: <span class="text-slate-900 font-semibold">{{ templateForm.name || '未填写' }}</span></span>
                  <span class="text-slate-600">周期总数: <span class="text-blue-600 font-bold">{{ templateForm.cycles.length }}</span></span>
                </div>
                <p class="text-slate-400 italic flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  所有修改将在保存后立即生效
                </p>
              </div>
            </div>
          </div>

          <footer class="flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
            <button
              type="button"
              class="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              @click="showTemplateModal = false"
            >
              取消
            </button>
            <button
              type="button"
              class="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors"
              @click="saveTemplate"
            >
              保存模板
            </button>
          </footer>
        </section>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
