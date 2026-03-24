<script setup>
import { ref, computed } from 'vue'

// 产品数据
const products = ref([
  {
    id: 'prod-001',
    name: 'USDT活期宝',
    currency: 'USDT',
    baseRate: 0.3,
    currentMultiplier: 1.0,
    adjustmentRate: 0,
    totalOrders: 156,
    totalAmount: 2580000,
    status: 'active'
  },
  {
    id: 'prod-002',
    name: 'BTC定期宝',
    currency: 'BTC',
    baseRate: 0.25,
    currentMultiplier: 1.2,
    adjustmentRate: 20,
    totalOrders: 89,
    totalAmount: 890000,
    status: 'active'
  },
  {
    id: 'prod-003',
    name: 'ETH增益计划',
    currency: 'ETH',
    baseRate: 0.28,
    currentMultiplier: 0.9,
    adjustmentRate: -10,
    totalOrders: 124,
    totalAmount: 1560000,
    status: 'active'
  }
])

// 搜索
const keyword = ref('')
const filteredProducts = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return products.value
  return products.value.filter((item) => 
    `${item.name} ${item.currency}`.toLowerCase().includes(kw)
  )
})

// 汇总数据
const summary = computed(() => {
  const total = products.value.length
  const active = products.value.filter((item) => item.status === 'active').length
  const adjusted = products.value.filter((item) => item.adjustmentRate !== 0).length
  const totalAmount = products.value.reduce((sum, item) => sum + item.totalAmount, 0)
  
  return [
    { label: '产品总数', value: String(total) },
    { label: '运行中', value: String(active) },
    { label: '已调整', value: String(adjusted) },
    { label: '资金规模', value: `$${(totalAmount / 1000000).toFixed(2)}M` }
  ]
})

// 控制弹窗
const showControlModal = ref(false)
const activeProductId = ref('')
const activeProduct = computed(() => 
  products.value.find((item) => item.id === activeProductId.value)
)

const controlForm = ref({
  adjustmentRate: 0,
  reason: '',
  duration: 0
})

const openControl = (productId) => {
  const product = products.value.find((p) => p.id === productId)
  activeProductId.value = productId
  controlForm.value = {
    adjustmentRate: product.adjustmentRate,
    reason: '',
    duration: 0
  }
  showControlModal.value = true
}

const saveControl = () => {
  products.value = products.value.map((product) => {
    if (product.id === activeProductId.value) {
      const newMultiplier = 1 + (controlForm.value.adjustmentRate / 100)
      return {
        ...product,
        adjustmentRate: controlForm.value.adjustmentRate,
        currentMultiplier: newMultiplier
      }
    }
    return product
  })
  showControlModal.value = false
}

const resetControl = (productId) => {
  products.value = products.value.map((product) => {
    if (product.id === productId) {
      return {
        ...product,
        adjustmentRate: 0,
        currentMultiplier: 1.0
      }
    }
    return product
  })
}

// 调整历史记录
const showHistoryModal = ref(false)
const historyProductId = ref('')
const historyRecords = ref([
  {
    id: 'log-001',
    productId: 'prod-002',
    productName: 'BTC定期宝',
    beforeRate: 0,
    afterRate: 20,
    operator: 'admin',
    reason: '市场利率上升，调高收益吸引用户',
    createdAt: '2026-03-07 14:30:25'
  },
  {
    id: 'log-002',
    productId: 'prod-003',
    productName: 'ETH增益计划',
    beforeRate: 0,
    afterRate: -10,
    operator: 'admin',
    reason: '成本控制，降低收益',
    createdAt: '2026-03-06 10:15:10'
  }
])

const filteredHistory = computed(() => {
  if (!historyProductId.value) return historyRecords.value
  return historyRecords.value.filter((item) => item.productId === historyProductId.value)
})

const openHistory = (productId = '') => {
  historyProductId.value = productId
  showHistoryModal.value = true
}

// 格式化显示
const formatRate = (rate) => {
  if (rate > 0) return `+${rate}%`
  if (rate < 0) return `${rate}%`
  return '0%'
}

const getRateColor = (rate) => {
  if (rate > 0) return 'text-green-600'
  if (rate < 0) return 'text-red-600'
  return 'text-gray-600'
}
</script>

<style scoped>
/* 美化滑块样式 */
.slider {
  -webkit-appearance: none;
  appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* 滑块轨道增强 */
.slider::-webkit-slider-runnable-track {
  background: linear-gradient(to right, #fca5a5 0%, #e5e7eb 50%, #86efac 100%);
  height: 8px;
  border-radius: 4px;
}

.slider::-moz-range-track {
  background: linear-gradient(to right, #fca5a5 0%, #e5e7eb 50%, #86efac 100%);
  height: 8px;
  border-radius: 4px;
}
</style>

<template>
  <div class="p-6 space-y-6">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-2xl font-semibold text-gray-900">收益控制</h1>
      <p class="mt-1 text-sm text-gray-500">调整流动性挖矿产品的收益倍数，控制平台成本和用户收益</p>
    </div>

    <!-- 汇总卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div
        v-for="item in summary"
        :key="item.label"
        class="bg-white rounded-lg border border-gray-200 p-4"
      >
        <div class="text-sm text-gray-500">{{ item.label }}</div>
        <div class="mt-2 text-2xl font-semibold text-gray-900">{{ item.value }}</div>
      </div>
    </div>

    <!-- 主卡片 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <!-- 工具栏 -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索产品名称或币种..."
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
          />
        </div>
        <button
          @click="openHistory('')"
          class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          查看历史记录
        </button>
      </div>

      <!-- 产品列表 -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">产品信息</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">基础利率</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">调整比例</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">实际倍数</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订单数</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">资金规模</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="product in filteredProducts"
              :key="product.id"
              class="hover:bg-blue-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ product.name }}</div>
                <div class="text-sm text-gray-500">{{ product.currency }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-900">
                {{ product.baseRate }}% / 日
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['font-medium', getRateColor(product.adjustmentRate)]">
                  {{ formatRate(product.adjustmentRate) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="font-medium text-gray-900">{{ product.currentMultiplier.toFixed(2) }}x</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-700">
                {{ product.totalOrders }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-700">
                ${{ product.totalAmount.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                >
                  {{ product.status === 'active' ? '运行中' : '已停用' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                <button
                  @click="openControl(product.id)"
                  class="text-blue-600 hover:text-blue-800 font-medium mr-3"
                >
                  调整
                </button>
                <button
                  v-if="product.adjustmentRate !== 0"
                  @click="resetControl(product.id)"
                  class="text-gray-600 hover:text-gray-800 font-medium mr-3"
                >
                  重置
                </button>
                <button
                  @click="openHistory(product.id)"
                  class="text-gray-600 hover:text-gray-800 font-medium"
                >
                  历史
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredProducts.length === 0" class="p-12 text-center text-gray-500">
        <div class="text-lg">未找到匹配的产品</div>
        <div class="mt-2 text-sm">请尝试其他搜索关键词</div>
      </div>
    </div>

    <!-- 收益控制弹窗 -->
    <div
      v-if="showControlModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showControlModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <!-- 弹窗头部 -->
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">收益控制调整</h3>
            <p class="text-sm text-gray-500 mt-1">{{ activeProduct?.name }} ({{ activeProduct?.currency }})</p>
          </div>
          <button
            @click="showControlModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 弹窗主体：左右分栏 -->
        <div class="flex-1 flex overflow-hidden">
          <!-- 左侧：调整设置区域 (60%) -->
          <div class="w-3/5 border-r border-gray-200 flex flex-col">
            <!-- 内容可滚动区域 -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6">
              <!-- 可视化滑块调整 -->
              <div>
                <h4 class="text-sm font-medium text-gray-900 mb-3">可视化滑块调整</h4>
                <div class="flex items-center justify-between mb-3">
                  <label class="text-sm text-gray-700">拖动调整收益倍数</label>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-500">当前:</span>
                    <span class="text-base font-bold" :class="getRateColor(controlForm.adjustmentRate)">
                      {{ formatRate(controlForm.adjustmentRate) }}
                    </span>
                    <span class="text-xs text-gray-500">({{ (1 + (controlForm.adjustmentRate / 100)).toFixed(2) }}x)</span>
                  </div>
                </div>
                
                <!-- 滑块 -->
                <div class="relative">
                  <input
                    v-model.number="controlForm.adjustmentRate"
                    type="range"
                    min="-100"
                    max="100"
                    step="5"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div class="flex justify-between mt-1 text-xs text-gray-500">
                    <span>-100% (0.0x)</span>
                    <span>0% (1.0x)</span>
                    <span>+100% (2.0x)</span>
                  </div>
                </div>

                <!-- 视觉化指示器 -->
                <div class="mt-3 p-3 bg-gradient-to-r from-red-50 via-gray-50 to-green-50 rounded-lg border border-gray-200">
                  <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-1 text-red-600">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                      </svg>
                      <span>降低收益</span>
                    </div>
                    <div class="text-gray-600">
                      <span>基准</span>
                    </div>
                    <div class="flex items-center gap-1 text-green-600">
                      <span>提高收益</span>
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 场景快捷选择 -->
              <div>
                <h4 class="text-sm font-medium text-gray-900 mb-3">常用调整场景</h4>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    @click="controlForm.adjustmentRate = 50"
                    class="px-4 py-3 text-sm border-2 rounded-lg text-left hover:shadow-md transition-all"
                    :class="controlForm.adjustmentRate === 50 
                      ? 'border-green-500 bg-green-50 shadow-sm' 
                      : 'border-gray-300 hover:border-green-400'"
                  >
                    <div class="flex items-center gap-2 font-medium text-gray-900 mb-1">
                      <span class="text-lg">🔥</span>
                      <span>市场热度高</span>
                    </div>
                    <div class="text-xs text-gray-500">提升50%收益吸引用户</div>
                  </button>
                  <button
                    @click="controlForm.adjustmentRate = 20"
                    class="px-4 py-3 text-sm border-2 rounded-lg text-left hover:shadow-md transition-all"
                    :class="controlForm.adjustmentRate === 20 
                      ? 'border-blue-500 bg-blue-50 shadow-sm' 
                      : 'border-gray-300 hover:border-blue-400'"
                  >
                    <div class="flex items-center gap-2 font-medium text-gray-900 mb-1">
                      <span class="text-lg">📈</span>
                      <span>适度激励</span>
                    </div>
                    <div class="text-xs text-gray-500">提升20%稳健增长</div>
                  </button>
                  <button
                    @click="controlForm.adjustmentRate = -20"
                    class="px-4 py-3 text-sm border-2 rounded-lg text-left hover:shadow-md transition-all"
                    :class="controlForm.adjustmentRate === -20 
                      ? 'border-orange-500 bg-orange-50 shadow-sm' 
                      : 'border-gray-300 hover:border-orange-400'"
                  >
                    <div class="flex items-center gap-2 font-medium text-gray-900 mb-1">
                      <span class="text-lg">💰</span>
                      <span>成本控制</span>
                    </div>
                    <div class="text-xs text-gray-500">降低20%控制支出</div>
                  </button>
                  <button
                    @click="controlForm.adjustmentRate = -40"
                    class="px-4 py-3 text-sm border-2 rounded-lg text-left hover:shadow-md transition-all"
                    :class="controlForm.adjustmentRate === -40 
                      ? 'border-red-500 bg-red-50 shadow-sm' 
                      : 'border-gray-300 hover:border-red-400'"
                  >
                    <div class="flex items-center gap-2 font-medium text-gray-900 mb-1">
                      <span class="text-lg">⚠️</span>
                      <span>紧急控费</span>
                    </div>
                    <div class="text-xs text-gray-500">降低40%严控成本</div>
                  </button>
                </div>
              </div>

              <!-- 精确数值设置 -->
              <div>
                <h4 class="text-sm font-medium text-gray-900 mb-3">精确数值设置</h4>
                <div class="space-y-4">
                  <!-- 精确输入 -->
                  <div>
                    <label class="block text-sm text-gray-700 mb-2">调整比例 (%)</label>
                    <div class="flex items-center gap-3">
                      <input
                        v-model.number="controlForm.adjustmentRate"
                        type="number"
                        step="1"
                        min="-100"
                        max="100"
                        class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="输入 -100 到 100"
                      />
                      <button
                        @click="controlForm.adjustmentRate = 0"
                        class="px-4 py-2.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        重置
                      </button>
                    </div>
                    <div class="mt-2 text-xs text-gray-500">
                      范围: -100% ~ +100%，对应收益倍数 0.0x ~ 2.0x
                    </div>
                  </div>

                  <!-- 生效时长 -->
                  <div>
                    <label class="block text-sm text-gray-700 mb-2">生效时长</label>
                    <select
                      v-model.number="controlForm.duration"
                      class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option :value="0">⏰ 持续生效（需手动恢复）</option>
                      <option :value="3600">⏱️ 1 小时后自动恢复</option>
                      <option :value="21600">⏱️ 6 小时后自动恢复</option>
                      <option :value="43200">⏱️ 12 小时后自动恢复</option>
                      <option :value="86400">📅 24 小时（1天）后恢复</option>
                      <option :value="259200">📅 3 天后自动恢复</option>
                      <option :value="604800">📅 7 天后自动恢复</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- 调整原因说明 -->
              <div>
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                    </svg>
                    调整原因说明
                    <span class="text-red-500 text-xs">（必填）</span>
                  </h4>
                  <span class="text-xs text-gray-500">
                    {{ controlForm.reason.length }} / 200
                  </span>
                </div>

                <!-- 常用原因模板 -->
                <div class="mb-3">
                  <label class="block text-xs text-gray-600 mb-2">常用原因模板（点击快速填入）</label>
                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      @click="controlForm.reason = '根据市场行情波动，适度提升产品收益率以提高竞争力'"
                      class="px-3 py-1.5 text-xs bg-white border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 rounded transition-colors"
                    >
                      📊 市场调整
                    </button>
                    <button
                      type="button"
                      @click="controlForm.reason = '为控制平台成本，需要降低产品收益率'"
                      class="px-3 py-1.5 text-xs bg-white border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 rounded transition-colors"
                    >
                      💰 成本控制
                    </button>
                    <button
                      type="button"
                      @click="controlForm.reason = '促销活动期间，临时提升收益吸引用户参与'"
                      class="px-3 py-1.5 text-xs bg-white border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 rounded transition-colors"
                    >
                      🎉 营销活动
                    </button>
                    <button
                      type="button"
                      @click="controlForm.reason = '风险管控需要，暂时降低收益率'"
                      class="px-3 py-1.5 text-xs bg-white border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 rounded transition-colors"
                    >
                      ⚠️ 风险控制
                    </button>
                  </div>
                </div>

                <textarea
                  v-model="controlForm.reason"
                  rows="6"
                  maxlength="200"
                  class="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  :class="!controlForm.reason.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'"
                  placeholder="请详细说明本次调整的原因，包括：&#10;&#10;1. 调整背景（市场情况、业务需求等）&#10;2. 调整目的（吸引用户、控制成本、风险管控等）&#10;3. 预期效果（持续时间、目标达成等）"
                ></textarea>
                
                <div v-if="!controlForm.reason.trim()" class="mt-2 text-xs text-red-600 flex items-center gap-1 bg-red-50 px-3 py-2 rounded">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  必须填写调整原因才能提交，用于审计和历史追溯
                </div>
                <div v-else class="mt-2 text-xs text-green-600 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  已填写原因，可以提交调整
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：实时预览区域 (40%) -->
          <div class="w-2/5 bg-gray-50 flex flex-col">
            <div class="flex-1 overflow-y-auto p-6 space-y-4">
              <!-- 当前状态 -->
              <div>
                <h4 class="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                  </svg>
                  当前状态
                </h4>
                <div class="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                  <div class="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span class="text-xs text-gray-600">基础利率</span>
                    <span class="text-sm font-semibold text-gray-900">{{ activeProduct?.baseRate }}% /日</span>
                  </div>
                  <div class="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span class="text-xs text-gray-600">当前调整</span>
                    <span class="text-sm font-semibold" :class="getRateColor(activeProduct?.adjustmentRate)">
                      {{ formatRate(activeProduct?.adjustmentRate) }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span class="text-xs text-gray-600">实际倍数</span>
                    <span class="text-sm font-semibold text-blue-600">
                      {{ activeProduct?.currentMultiplier.toFixed(2) }}x
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-600">实际日利率</span>
                    <span class="text-sm font-semibold text-green-600">
                      {{ (activeProduct?.baseRate * activeProduct?.currentMultiplier).toFixed(4) }}%
                    </span>
                  </div>
                </div>
              </div>

              <!-- 调整后预览 -->
              <div>
                <h4 class="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                  </svg>
                  调整后预览
                </h4>

                <!-- 对比卡片 -->
                <div class="space-y-3">
                  <!-- 调整前 -->
                  <div class="bg-gray-100 border border-gray-300 rounded-lg p-3">
                    <div class="text-xs font-medium text-gray-600 mb-2">调整前</div>
                    <div class="space-y-2">
                      <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600">日利率</span>
                        <span class="font-semibold text-gray-900">
                          {{ (activeProduct?.baseRate * activeProduct?.currentMultiplier).toFixed(4) }}%
                        </span>
                      </div>
                      <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600">30天收益</span>
                        <span class="font-semibold text-gray-900">
                          {{ (10000 * (activeProduct?.baseRate / 100) * activeProduct?.currentMultiplier * 30).toFixed(2) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- 箭头 -->
                  <div class="flex justify-center">
                    <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                    </svg>
                  </div>

                  <!-- 调整后 -->
                  <div class="border-2 rounded-lg p-3" 
                    :class="controlForm.adjustmentRate > 0 
                      ? 'bg-green-50 border-green-400' 
                      : controlForm.adjustmentRate < 0 
                      ? 'bg-red-50 border-red-400' 
                      : 'bg-blue-50 border-blue-400'">
                    <div class="text-xs font-medium mb-2" 
                      :class="controlForm.adjustmentRate > 0 
                        ? 'text-green-700' 
                        : controlForm.adjustmentRate < 0 
                        ? 'text-red-700' 
                        : 'text-blue-700'">
                      调整后
                    </div>
                    <div class="space-y-2">
                      <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600">日利率</span>
                        <span class="font-bold" 
                          :class="controlForm.adjustmentRate > 0 
                            ? 'text-green-700' 
                            : controlForm.adjustmentRate < 0 
                            ? 'text-red-700' 
                            : 'text-blue-700'">
                          {{ (activeProduct?.baseRate * (1 + (controlForm.adjustmentRate / 100))).toFixed(4) }}%
                        </span>
                      </div>
                      <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600">30天收益</span>
                        <span class="font-bold" 
                          :class="controlForm.adjustmentRate > 0 
                            ? 'text-green-700' 
                            : controlForm.adjustmentRate < 0 
                            ? 'text-red-700' 
                            : 'text-blue-700'">
                          {{ (10000 * (activeProduct?.baseRate / 100) * (1 + (controlForm.adjustmentRate / 100)) * 30).toFixed(2) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 收益差额 -->
                <div class="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                  <div class="text-xs text-gray-600 mb-1">收益变化（10,000 {{ activeProduct?.currency }} × 30天）</div>
                  <div class="text-base font-bold" 
                    :class="controlForm.adjustmentRate > 0 
                      ? 'text-green-600' 
                      : controlForm.adjustmentRate < 0 
                      ? 'text-red-600' 
                      : 'text-gray-600'">
                    {{ controlForm.adjustmentRate > 0 ? '+' : '' }}{{ ((10000 * (activeProduct?.baseRate / 100) * (1 + (controlForm.adjustmentRate / 100)) * 30) - (10000 * (activeProduct?.baseRate / 100) * activeProduct?.currentMultiplier * 30)).toFixed(2) }} {{ activeProduct?.currency }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ controlForm.adjustmentRate > 0 ? '用户收益增加' : controlForm.adjustmentRate < 0 ? '平台成本降低' : '无变化' }}
                  </div>
                </div>
              </div>

              <!-- 提示信息 -->
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  <div class="flex-1">
                    <div class="text-xs font-medium text-yellow-900 mb-1">温馨提示</div>
                    <div class="text-xs text-yellow-700">
                      调整将立即生效并影响所有使用该产品的用户。请确保已填写调整原因。
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 弹窗底部 - 固定 -->
        <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0 bg-gray-50">
          <div class="text-xs text-gray-500 flex items-center gap-1">
            <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            必须填写调整原因才能提交
          </div>
          <div class="flex gap-3">
            <button
              @click="showControlModal = false"
              class="px-5 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-white transition-colors"
            >
              取消
            </button>
            <button
              @click="saveControl"
              :disabled="!controlForm.reason.trim()"
              class="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              确认调整
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史记录弹窗 -->
    <div
      v-if="showHistoryModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showHistoryModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] flex flex-col">
        <!-- 弹窗头部 -->
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">调整历史记录</h3>
          <button
            @click="showHistoryModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 历史记录列表 -->
        <div class="flex-1 overflow-y-auto p-6">
          <div class="space-y-4">
            <div
              v-for="record in filteredHistory"
              :key="record.id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-start justify-between mb-3">
                <div>
                  <div class="font-medium text-gray-900">{{ record.productName }}</div>
                  <div class="text-sm text-gray-500 mt-1">{{ record.createdAt }}</div>
                </div>
                <div class="text-sm text-gray-500">操作人: {{ record.operator }}</div>
              </div>
              <div class="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <span class="text-sm text-gray-600">调整前: </span>
                  <span :class="['font-medium', getRateColor(record.beforeRate)]">
                    {{ formatRate(record.beforeRate) }}
                  </span>
                </div>
                <div>
                  <span class="text-sm text-gray-600">调整后: </span>
                  <span :class="['font-medium', getRateColor(record.afterRate)]">
                    {{ formatRate(record.afterRate) }}
                  </span>
                </div>
              </div>
              <div class="text-sm text-gray-700 bg-gray-50 rounded p-3">
                <span class="font-medium">原因:</span> {{ record.reason }}
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="filteredHistory.length === 0" class="text-center py-12 text-gray-500">
            <div class="text-lg">暂无调整记录</div>
          </div>
        </div>

        <!-- 弹窗底部 -->
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            @click="showHistoryModal = false"
            class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
