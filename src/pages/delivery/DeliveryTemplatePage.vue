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
    </header>

    <article class="rounded-xl border border-slate-200 bg-white">
      <!-- 筛选栏 -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4">
        <div class="flex flex-wrap items-center gap-6">
          <div class="inline-flex items-center gap-6 text-sm">
            <button
              type="button"
              class="relative py-2 font-medium transition-colors"
              :class="statusTab === COMMON_FILTER_ALL ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600' : 'text-slate-500 hover:text-slate-700'"
              @click="statusTab = COMMON_FILTER_ALL"
            >
              全部
            </button>
            <button
              type="button"
              class="relative py-2 font-medium transition-colors"
              :class="statusTab === DELIVERY_STATUS.ENABLED ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600' : 'text-slate-500 hover:text-slate-700'"
              @click="statusTab = DELIVERY_STATUS.ENABLED"
            >
              已启用
            </button>
            <button
              type="button"
              class="relative py-2 font-medium transition-colors"
              :class="statusTab === DELIVERY_STATUS.DISABLED ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600' : 'text-slate-500 hover:text-slate-700'"
              @click="statusTab = DELIVERY_STATUS.DISABLED"
            >
              已禁用
            </button>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <div class="relative w-64">
            <input
              v-model="search"
              type="text"
              class="ant-input w-full pl-9"
              placeholder="搜索模板名称..."
            />
            <svg viewBox="0 0 20 20" class="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none">
              <circle cx="9" cy="9" r="5.8" stroke="currentColor" stroke-width="1.6" />
              <path d="M13.6 13.6L16.4 16.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </div>
          <button
            type="button"
            class="ant-btn ant-btn-primary inline-flex items-center gap-1.5"
            @click="openCreateTemplate"
          >
            <span class="text-lg leading-none">+</span>
            <span>新增模板</span>
          </button>
        </div>
      </div>

      <!-- 列表内容 -->
      <div class="p-4 space-y-4">
        <article
          v-for="tpl in filteredTemplates"
          :key="tpl.id"
          class="rounded-lg border border-slate-200 bg-white transition-all hover:border-blue-500/30 hover:shadow-md"
        >
          <div class="flex items-center justify-between border-b border-slate-100 p-4">
            <div class="flex items-center gap-3">
              <h3 class="text-base font-semibold text-slate-900">{{ tpl.name }}</h3>
              <span
                class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border"
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
                class="ant-btn ant-btn-link text-xs flex items-center gap-1"
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
                class="ant-btn ant-btn-link text-xs"
                @click="openEditTemplate(tpl)"
              >
                编辑配置
              </button>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 p-4 bg-slate-50/30">
            <div
              v-for="cycle in isExpanded(tpl.id) ? tpl.cycles : tpl.cycles.slice(0, 8)"
              :key="cycle.id"
              class="inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-xs"
            >
              <span class="text-slate-500">时长:</span>
              <span class="font-medium text-slate-900">{{ durationLabel(cycle.durationSec) }}</span>
              <span class="text-slate-200">|</span>
              <span class="text-slate-500">收益:</span>
              <span class="font-bold text-emerald-600">{{ cycle.payoutPct.toFixed(1) }}%</span>
            </div>
            <div
              v-if="!isExpanded(tpl.id) && tpl.cycles.length > 8"
              class="inline-flex items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 px-3 py-2 cursor-pointer hover:bg-slate-100 transition-all text-xs text-slate-500"
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
          共 <span class="font-medium text-slate-900">{{ allFilteredTemplates.length }}</span> 个模板
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="ant-btn ant-btn-sm"
            :disabled="pagination.currentPage === 1"
            @click="pagination.currentPage--"
          >
            上一页
          </button>
          <div class="flex items-center gap-1">
            <button
              v-for="p in totalPages"
              :key="p"
              type="button"
              class="ant-btn ant-btn-sm w-8 p-0"
              :class="pagination.currentPage === p ? 'ant-btn-primary' : ''"
              @click="pagination.currentPage = p"
            >
              {{ p }}
            </button>
          </div>
          <button
            type="button"
            class="ant-btn ant-btn-sm"
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
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
        @click.self="showTemplateModal = false"
      >
        <section
          class="flex flex-col w-full max-w-4xl h-[85vh] overflow-hidden rounded-lg bg-white shadow-xl"
        >
          <header class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">{{ editingTemplateId ? '编辑周期模板' : '新增周期模板' }}</h2>
            </div>
            <button
              type="button"
              class="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none"
              @click="showTemplateModal = false"
            >
              ×
            </button>
          </header>

          <div class="flex-1 overflow-y-auto bg-white p-6 space-y-6">
            <div class="space-y-6">
              <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-1.5">
                  <label class="text-sm text-slate-900">模板名称 <span class="text-rose-500">*</span></label>
                  <input
                    v-model="templateForm.name"
                    type="text"
                    class="ant-input"
                    placeholder="如：标准收益模板"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-sm text-slate-900">模板状态</label>
                  <div class="inline-flex rounded border border-slate-200 p-0.5 bg-slate-50 mt-1">
                    <button
                      type="button"
                      class="px-4 py-1 text-xs rounded transition-all"
                      :class="
                        templateForm.status === DELIVERY_STATUS.ENABLED
                          ? 'bg-white shadow-sm text-blue-600 font-medium'
                          : 'text-slate-500 hover:text-slate-700'
                      "
                      @click="templateForm.status = DELIVERY_STATUS.ENABLED"
                    >
                      已启用
                    </button>
                    <button
                      type="button"
                      class="px-4 py-1 text-xs rounded transition-all"
                      :class="
                        templateForm.status === DELIVERY_STATUS.DISABLED
                          ? 'bg-white shadow-sm text-blue-600 font-medium'
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
                    <h3 class="text-sm font-semibold text-slate-900">周期明细配置</h3>
                    <span class="rounded bg-blue-50 px-2 py-0.5 text-[10px] text-blue-600">{{ templateForm.cycles.length }} 个档位</span>
                  </div>
                  <button
                    type="button"
                    class="ant-btn ant-btn-sm ant-btn-primary inline-flex items-center gap-1"
                    @click="addCycle"
                  >
                    <span>+</span>
                    <span>添加结算周期</span>
                  </button>
                </div>

                <div class="border border-slate-200 rounded overflow-hidden">
                  <table class="w-full text-left border-collapse ant-table">
                    <thead class="ant-table-thead">
                      <tr>
                        <th class="w-16 text-center">序号</th>
                        <th>周期时长 (秒)</th>
                        <th>收益率 (%)</th>
                        <th>实时预览</th>
                        <th class="w-20 text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody class="ant-table-tbody">
                      <tr v-for="(cycle, index) in templateForm.cycles" :key="cycle.id" class="text-sm">
                        <td class="text-center">
                          <span class="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-[10px] text-slate-500 font-bold">
                            {{ index + 1 }}
                          </span>
                        </td>
                        <td>
                          <input
                            v-model.number="cycle.durationSec"
                            type="number"
                            class="ant-input !py-1 text-xs"
                          />
                        </td>
                        <td>
                          <div class="relative">
                            <input
                              v-model.number="cycle.payoutPct"
                              type="number"
                              step="0.1"
                              class="ant-input !py-1 text-xs pr-6"
                            />
                            <span class="absolute right-2 top-1.5 text-slate-400 text-[10px]">%</span>
                          </div>
                        </td>
                        <td>
                          <div class="flex items-center gap-2">
                            <span class="text-xs font-semibold text-blue-600">{{ durationLabel(cycle.durationSec) }}</span>
                            <span class="text-slate-300">/</span>
                            <span class="text-xs font-bold text-emerald-600">{{ Number(cycle.payoutPct).toFixed(1) }}%</span>
                          </div>
                        </td>
                        <td class="text-center">
                          <button
                            type="button"
                            class="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded hover:bg-rose-50"
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
                  <div v-if="templateForm.cycles.length === 0" class="p-8 text-center text-slate-400 text-xs italic bg-slate-50/30">
                    暂无配置，请点击上方按钮添加周期
                  </div>
                </div>
              </div>

              <div class="rounded bg-blue-50/50 border border-blue-100 p-3 flex flex-wrap items-center justify-between gap-4 text-[11px]">
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

          <footer class="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
            <button
              type="button"
              class="ant-btn"
              @click="showTemplateModal = false"
            >
              取消
            </button>
            <button
              type="button"
              class="ant-btn ant-btn-primary"
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
