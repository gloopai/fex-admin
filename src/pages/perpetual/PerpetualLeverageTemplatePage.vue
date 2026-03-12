<script setup>
import { computed, reactive, ref, watch } from 'vue'
import {
  PERPETUAL_COMMON_FILTER_ALL,
  PERPETUAL_STATUS
} from '../../constants/perpetual'
import {
  createPerpetualProductsMock,
  createPerpetualTemplatesMock,
  perpetualLeverageLevels
} from '../../mock/perpetual'

const statusTab = ref(PERPETUAL_COMMON_FILTER_ALL)
const search = ref('')

const pagination = reactive({
  currentPage: 1,
  pageSize: 5
})

const leverageLevels = perpetualLeverageLevels

const parseNumeric = (text) => String(text || '').replace(/[^0-9.]/g, '')

const templates = ref(createPerpetualTemplatesMock())
const products = ref(createPerpetualProductsMock())

const buildLeverageBadges = (levels = []) => {
  const visible = levels.slice(0, 6)
  const more = levels.length - visible.length
  return more > 0 ? [...visible, `+${more}`] : visible
}

const syncProductsWithTemplates = () => {
  products.value = products.value.map((item) => {
    const template = templates.value.find((tpl) => tpl.id === item.templateId) || templates.value.find((tpl) => tpl.name === item.templateName)
    if (!template) return item
    return {
      ...item,
      templateId: template.id,
      templateName: template.name,
      leverageRange: template.leverageRange,
      leverageBadges: buildLeverageBadges(template.levels)
    }
  })
}

const refreshTemplateUsage = () => {
  templates.value = templates.value.map((tpl) => {
    const linked = products.value.filter((item) => item.templateId === tpl.id)
    return {
      ...tpl,
      inUseCount: linked.length,
      contracts: linked.map((item) => item.name)
    }
  })
}

refreshTemplateUsage()

const filteredTemplates = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return templates.value.filter((item) => {
    const matchesStatus = statusTab.value === PERPETUAL_COMMON_FILTER_ALL || item.status === statusTab.value
    const matchesKeyword = !keyword || item.name.toLowerCase().includes(keyword)
    return matchesStatus && matchesKeyword
  })
})

const paginatedTemplates = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredTemplates.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredTemplates.value.length / pagination.pageSize))

watch([search, statusTab], () => {
  pagination.currentPage = 1
})

const showTemplateModal = ref(false)
const editingTemplateId = ref(null)
const newTemplateName = ref('')
const selectedLeverages = ref([])

const toggleLeverage = (value) => {
  if (selectedLeverages.value.includes(value)) {
    selectedLeverages.value = selectedLeverages.value.filter((item) => item !== value)
    return
  }
  selectedLeverages.value = [...selectedLeverages.value, value].sort((a, b) => a - b)
}

const pickLeveragePack = (type) => {
  if (type === 'all') selectedLeverages.value = [...leverageLevels]
  if (type === 'clear') selectedLeverages.value = []
  if (type === 'low') selectedLeverages.value = leverageLevels.filter((item) => item <= 10)
  if (type === 'mid') selectedLeverages.value = leverageLevels.filter((item) => item >= 10 && item <= 50)
  if (type === 'high') selectedLeverages.value = leverageLevels.filter((item) => item >= 50)
}

const openCreateTemplate = () => {
  editingTemplateId.value = null
  newTemplateName.value = ''
  selectedLeverages.value = []
  showTemplateModal.value = true
}

const openEditTemplate = (template) => {
  editingTemplateId.value = template.id
  newTemplateName.value = template.name
  selectedLeverages.value = template.levels.map((item) => Number(parseNumeric(item))).filter((item) => Number.isFinite(item))
  showTemplateModal.value = true
}

const submitTemplate = () => {
  if (!newTemplateName.value.trim() || selectedLeverages.value.length === 0) return
  const payload = {
    name: newTemplateName.value.trim(),
    status: PERPETUAL_STATUS.ENABLED,
    leverageRange: `${Math.min(...selectedLeverages.value)}x - ${Math.max(...selectedLeverages.value)}x`,
    leverageCount: selectedLeverages.value.length,
    levels: selectedLeverages.value.map((item) => `${item}x`)
  }
  if (editingTemplateId.value) {
    templates.value = templates.value.map((item) => (item.id === editingTemplateId.value ? { ...item, ...payload } : item))
  } else {
    templates.value.unshift({
      id: `tpl-${Date.now()}`,
      ...payload,
      inUseCount: 0,
      contracts: []
    })
  }
  syncProductsWithTemplates()
  refreshTemplateUsage()
  showTemplateModal.value = false
  editingTemplateId.value = null
  newTemplateName.value = ''
  selectedLeverages.value = []
}
</script>

<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">杠杆模板管理</h1>
        <p class="mt-1 text-sm text-slate-500">管理永续合约可用的杠杆倍数档位模板</p>
      </div>
    </header>

    <article class="rounded-xl border border-slate-200 bg-white">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="inline-flex items-center gap-2 text-sm">
            <button type="button" class="font-medium" :class="statusTab === PERPETUAL_COMMON_FILTER_ALL ? 'text-blue-600' : 'text-slate-500'" @click="statusTab = PERPETUAL_COMMON_FILTER_ALL">全部</button>
            <button
              type="button"
              class="font-medium"
              :class="statusTab === PERPETUAL_STATUS.ENABLED ? 'text-blue-600' : 'text-slate-500'"
              @click="statusTab = PERPETUAL_STATUS.ENABLED"
            >
              已启用
            </button>
            <button
              type="button"
              class="font-medium"
              :class="statusTab === PERPETUAL_STATUS.DISABLED ? 'text-blue-600' : 'text-slate-500'"
              @click="statusTab = PERPETUAL_STATUS.DISABLED"
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
          <button
            type="button"
            class="ant-btn ant-btn-primary"
            @click="openCreateTemplate"
          >
            <span>+ 新增模板</span>
          </button>
        </div>
      </div>

      <div class="space-y-4 p-4">
        <article v-for="tpl in paginatedTemplates" :key="tpl.id" class="rounded-xl border border-slate-200 p-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-lg font-semibold text-slate-900">{{ tpl.name }}</h3>
                <span class="rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-600">{{ tpl.leverageCount }} 个档位</span>
                <span class="rounded-md bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">{{ tpl.inUseCount }} 个合约使用中</span>
              </div>
              <p class="mt-3 text-sm text-slate-600">杠杆范围: <span class="font-medium text-slate-900">{{ tpl.leverageRange }}</span></p>
            </div>
            <button type="button" class="ant-btn !h-8 !px-3 !text-xs" @click="openEditTemplate(tpl)">编辑模板</button>
          </div>

          <div class="mt-4">
            <p class="text-sm text-slate-500">可用杠杆档位:</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span v-for="lv in tpl.levels" :key="lv" class="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">{{ lv }}</span>
            </div>
          </div>

          <div class="mt-4">
            <p class="text-sm text-slate-500">使用此模板的合约:</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="contract in tpl.contracts"
                :key="contract"
                class="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700"
              >
                {{ contract }}
              </span>
              <span v-if="tpl.contracts.length === 0" class="text-sm text-slate-400">暂无</span>
            </div>
          </div>
        </article>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <div class="text-sm text-slate-500">
            共 <span class="font-medium">{{ filteredTemplates.length }}</span> 个模板，第 <span class="font-medium">{{ pagination.currentPage }}</span> / <span class="font-medium">{{ totalPages }}</span> 页
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="ant-btn !h-8 !px-3 !text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :disabled="pagination.currentPage === 1"
              @click="pagination.currentPage--"
            >
              上一页
            </button>
            <button
              type="button"
              class="ant-btn !h-8 !px-3 !text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :disabled="pagination.currentPage === totalPages"
              @click="pagination.currentPage++"
            >
              下一页
            </button>
          </div>
        </div>

        <p v-if="filteredTemplates.length === 0" class="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">没有匹配的杠杆模板</p>
      </div>
    </article>
  </section>

  <div v-if="showTemplateModal" class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" @click.self="showTemplateModal = false">
    <section class="w-full max-w-3xl rounded-xl bg-white">
      <header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <h2 class="text-2xl font-semibold text-slate-900">{{ editingTemplateId ? '编辑杠杆模板' : '新增杠杆模板' }}</h2>
        <button type="button" class="text-2xl text-slate-400 hover:text-slate-700" @click="showTemplateModal = false">×</button>
      </header>

      <div class="space-y-5 px-6 py-5">
        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-700">模板名称 <span class="text-rose-500">*</span></span>
          <input
            v-model="newTemplateName"
            type="text"
            class="ant-input"
            placeholder="请输入模板名称"
          />
        </label>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-slate-700">选择杠杆档位 <span class="text-rose-500">*</span></p>
            <p class="text-sm text-slate-500">已选择: <span class="font-semibold text-blue-600">{{ selectedLeverages.length }}</span> 个档位</p>
          </div>

          <div class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            <button
              v-for="lv in leverageLevels"
              :key="lv"
              type="button"
              class="rounded-lg border px-3 py-2 text-sm transition-all"
              :class="selectedLeverages.includes(lv) ? 'border-blue-300 bg-blue-50 font-medium text-blue-600 shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
              "
              @click="toggleLeverage(lv)"
            >
              {{ lv }}x
            </button>
          </div>

          <div class="flex flex-wrap gap-2">
            <button type="button" class="ant-btn !h-8 !px-3 !text-xs" @click="pickLeveragePack('all')">全选</button>
            <button type="button" class="ant-btn !h-8 !px-3 !text-xs" @click="pickLeveragePack('clear')">清空</button>
            <button type="button" class="ant-btn !h-8 !px-3 !text-xs" @click="pickLeveragePack('low')">低杠杆 (1-10x)</button>
            <button type="button" class="ant-btn !h-8 !px-3 !text-xs" @click="pickLeveragePack('mid')">中等杠杆 (10-50x)</button>
            <button type="button" class="ant-btn !h-8 !px-3 !text-xs" @click="pickLeveragePack('high')">高杠杆 (50-125x)</button>
          </div>

          <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p class="font-medium text-slate-800">当前选择的杠杆档位</p>
            <div v-if="selectedLeverages.length" class="mt-2 flex flex-wrap gap-2">
              <span v-for="lv in selectedLeverages" :key="`picked-${lv}`" class="rounded-md bg-white px-2 py-0.5 text-sm text-blue-600">{{ lv }}x</span>
            </div>
            <p v-else class="mt-2 text-sm text-slate-500">暂无选择任何档位</p>
          </div>

          <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p class="font-medium">杠杆档位说明:</p>
            <p class="mt-2">- 1-10x: 低风险，适合稳健投资者</p>
            <p>- 10-50x: 中等风险，需要一定的风险承受能力</p>
            <p>- 50-125x: 高风险，仅适合专业交易者</p>
            <p class="mt-2 font-medium text-rose-500">杠杆越高，强制平仓风险越大</p>
          </div>
        </div>
      </div>

      <footer class="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
        <button type="button" class="ant-btn" @click="showTemplateModal = false">取消</button>
        <button
          type="button"
          class="ant-btn ant-btn-primary"
          :disabled="!newTemplateName.trim() || !selectedLeverages.length"
          @click="submitTemplate"
        >
          {{ editingTemplateId ? '保存模板' : '创建模板' }}
        </button>
      </footer>
    </section>
  </div>
</template>
