<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">现货产品管理</h1>
        <p class="mt-1 text-sm text-slate-500">管理现货交易产品、交易对及费率配置</p>
      </div>
      <button type="button" class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" @click="showAddProduct">
        + 添加产品
      </button>
    </header>

    <article class="rounded-xl border border-slate-200 bg-white">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4">
        <div class="flex flex-wrap items-center gap-2">
          <select v-model="filters.status" class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500">
            <option value="">全部状态</option>
            <option value="trading">交易中</option>
            <option value="suspended">暂停交易</option>
            <option value="delisted">已下架</option>
          </select>
          <button type="button" class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" @click="resetFilters">重置</button>
        </div>

        <div class="relative w-full max-w-sm">
          <input
            v-model="searchKeyword"
            type="text"
            class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            placeholder="搜索产品名称或交易对..."
          />
          <svg viewBox="0 0 20 20" class="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none">
            <circle cx="9" cy="9" r="5.8" stroke="currentColor" stroke-width="1.6" />
            <path d="M13.6 13.6L16.4 16.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </div>
      </div>

      <div class="space-y-4 p-4">
        <article v-for="product in filteredProducts" :key="product.productId" class="rounded-xl border border-slate-200 bg-white">
          <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-4">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-semibold text-slate-900">{{ product.productName }}</h3>
                <span class="text-sm text-slate-500">{{ product.productId }}</span>
                <span 
                  class="rounded-md px-2 py-0.5 text-xs font-medium"
                  :class="{
                    'bg-emerald-50 text-emerald-700': product.status === 'trading',
                    'bg-amber-50 text-amber-700': product.status === 'suspended',
                    'bg-slate-100 text-slate-600': product.status === 'delisted'
                  }"
                >
                  {{ statusLabel(product.status) }}
                </span>
              </div>
              <p class="mt-2 text-sm text-slate-700">
                交易对：<span class="font-medium">{{ product.baseCurrency }}/{{ product.quoteCurrency }}</span>
                <span class="mx-3 text-slate-300">|</span>
                价格精度：<span class="font-medium">{{ product.pricePrecision }}</span>
                <span class="mx-3 text-slate-300">|</span>
                数量精度：<span class="font-medium">{{ product.quantityPrecision }}</span>
                <span class="mx-3 text-slate-300">|</span>
                最小交易量：<span class="font-medium">{{ product.minOrderQuantity }}</span>
                <span class="mx-3 text-slate-300">|</span>
                买入费率：<span class="font-medium">{{ product.buyFee }}%</span>
                <span class="mx-3 text-slate-300">|</span>
                卖出费率：<span class="font-medium">{{ product.sellFee }}%</span>
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button 
                type="button" 
                class="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-100"
                @click="editProduct(product)"
              >
                编辑
              </button>
              <button 
                type="button" 
                class="rounded-lg border px-3 py-1.5 text-sm"
                :class="product.status === 'trading' ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100' : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'"
                @click="toggleProductStatus(product)"
              >
                {{ product.status === 'trading' ? '暂停' : '恢复' }}
              </button>
            </div>
          </div>

          <div class="grid gap-0 md:grid-cols-4">
            <div class="border-b border-slate-200 p-4 md:border-b-0 md:border-r">
              <p class="text-sm text-slate-500">费率信息</p>
              <ul class="mt-2 space-y-1 text-sm text-slate-700">
                <li><span class="font-medium">买入:</span> {{ product.buyFee }}%</li>
                <li><span class="font-medium">卖出:</span> {{ product.sellFee }}%</li>
              </ul>
            </div>
            <div class="border-b border-slate-200 p-4 md:border-b-0 md:border-r">
              <p class="text-sm text-slate-500">交易限制</p>
              <ul class="mt-2 space-y-1 text-sm text-slate-700">
                <li><span class="font-medium">最小金额:</span> {{ formatCurrency(product.minOrderValue) }}</li>
                <li><span class="font-medium">最大金额:</span> {{ formatCurrency(product.maxOrderValue) }}</li>
              </ul>
            </div>
            <div class="border-b border-slate-200 p-4 md:border-b-0 md:border-r">
              <p class="text-sm text-slate-500">市场数据</p>
              <ul class="mt-2 space-y-1 text-sm text-slate-700">
                <li><span class="font-medium">24h 成交量:</span> {{ formatVolume(product.volume24h) }}</li>
                <li><span class="font-medium">24h 涨跌:</span> <span :class="product.priceChange24h >= 0 ? 'text-red-600' : 'text-green-600'">{{ product.priceChange24h }}%</span></li>
              </ul>
            </div>
            <div class="p-4">
              <p class="text-sm text-slate-500">流动性</p>
              <ul class="mt-2 space-y-1 text-sm text-slate-700">
                <li><span class="font-medium">买单深度:</span> {{ formatCurrency(product.bidDepth) }}</li>
                <li><span class="font-medium">卖单深度:</span> {{ formatCurrency(product.askDepth) }}</li>
              </ul>
            </div>
          </div>
        </article>

        <p v-if="filteredProducts.length === 0" class="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          没有匹配的现货产品
        </p>
      </div>
    </article>

    <!-- 产品编辑模态框 -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" @click.self="closeModal">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <!-- 弹窗头部 -->
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">{{ isEditing ? '编辑产品' : '新增产品' }}</h2>
            <p class="text-sm text-slate-500 mt-1">配置现货产品参数并实时预览</p>
          </div>
          <button type="button" class="text-slate-400 hover:text-slate-600" @click="closeModal">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 弹窗主体：左右分栏 -->
        <div class="flex-1 flex overflow-hidden">
          <!-- 左侧：产品设置区域 (60%) -->
          <div class="w-3/5 border-r border-slate-200 flex flex-col">
            <!-- Tab 导航 -->
            <div class="border-b border-slate-200 px-6">
              <div class="flex gap-1">
                <button
                  type="button"
                  @click="activeTab = 'basic'"
                  class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
                  :class="activeTab === 'basic' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-600 hover:text-slate-900'"
                >
                  基本配置
                </button>
                <button
                  type="button"
                  @click="activeTab = 'fee'"
                  class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
                  :class="activeTab === 'fee' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-600 hover:text-slate-900'"
                >
                  费率设置
                </button>
                <button
                  type="button"
                  @click="activeTab = 'limit'"
                  class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
                  :class="activeTab === 'limit' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-600 hover:text-slate-900'"
                >
                  交易限制
                </button>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-6">
              <!-- Tab 1: 基本配置 -->
              <div v-show="activeTab === 'basic'" class="space-y-6">
                <!-- 基本信息 -->
                <div>
                  <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                    </svg>
                    基本信息
                  </h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1.5">产品名称</label>
                      <input 
                        v-model="formData.productName" 
                        type="text" 
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="例如：BTC/USDT"
                      />
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1.5">基础币种</label>
                        <select 
                          v-model="formData.baseCurrency" 
                          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">请选择</option>
                          <option value="BTC">BTC</option>
                          <option value="ETH">ETH</option>
                          <option value="BNB">BNB</option>
                          <option value="SOL">SOL</option>
                          <option value="XRP">XRP</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1.5">计价币种</label>
                        <select 
                          v-model="formData.quoteCurrency" 
                          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">请选择</option>
                          <option value="USDT">USDT</option>
                          <option value="BTC">BTC</option>
                          <option value="ETH">ETH</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1.5">价格精度</label>
                        <input 
                          v-model.number="formData.pricePrecision" 
                          type="number" 
                          min="0"
                          max="8"
                          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="2"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1.5">数量精度</label>
                        <input 
                          v-model.number="formData.quantityPrecision" 
                          type="number" 
                          min="0"
                          max="8"
                          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="6"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 交易状态 -->
                <div>
                  <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
                    </svg>
                    交易状态
                  </h3>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">状态</label>
                    <select 
                      v-model="formData.status" 
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="trading">交易中</option>
                      <option value="suspended">暂停交易</option>
                      <option value="delisted">已下架</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Tab 2: 费率设置 -->
              <div v-show="activeTab === 'fee'" class="space-y-6">
                <!-- 费率配置 -->
                <div>
                  <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                    </svg>
                    交易费率
                  </h3>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1.5">买入费率 (%)</label>
                      <input 
                        v-model.number="formData.buyFee" 
                        type="number" 
                        step="0.001"
                        min="0"
                        max="1"
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.1"
                      />
                      <p class="mt-1 text-xs text-slate-500">买入手续费率，建议 0-0.1%</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1.5">卖出费率 (%)</label>
                      <input 
                        v-model.number="formData.sellFee" 
                        type="number" 
                        step="0.001"
                        min="0"
                        max="1"
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.1"
                      />
                      <p class="mt-1 text-xs text-slate-500">卖出手续费率，建议 0-0.1%</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab 3: 交易限制 -->
              <div v-show="activeTab === 'limit'" class="space-y-6">
                <!-- 订单限制 -->
                <div>
                  <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                    </svg>
                    订单限制
                  </h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1.5">最小交易量</label>
                      <input 
                        v-model.number="formData.minOrderQuantity" 
                        type="number" 
                        step="0.000001"
                        min="0"
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00001"
                      />
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1.5">最小订单金额</label>
                        <input 
                          v-model.number="formData.minOrderValue" 
                          type="number" 
                          step="0.01"
                          min="0"
                          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1.5">最大订单金额</label>
                        <input 
                          v-model.number="formData.maxOrderValue" 
                          type="number" 
                          step="0.01"
                          min="0"
                          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="1000000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 左侧底部按钮 -->
            <div class="flex items-center justify-end gap-3 border-t border-slate-200 p-4">
              <button 
                type="button" 
                class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                @click="closeModal"
              >
                取消
              </button>
              <button 
                type="button" 
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                @click="saveProduct"
              >
                {{ isEditing ? '保存修改' : '创建产品' }}
              </button>
            </div>
          </div>

          <!-- 右侧：实时预览区域 (40%) -->
          <div class="w-2/5 bg-slate-50 flex flex-col">
            <div class="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <h4 class="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                  </svg>
                  产品预览
                </h4>

                <!-- 产品卡片预览 -->
                <article class="rounded-xl border border-slate-200 bg-white">
                  <div class="border-b border-slate-200 p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <h3 class="text-lg font-semibold text-slate-900">
                        {{ formData.productName || '未命名产品' }}
                      </h3>
                      <span 
                        class="rounded-md px-2 py-0.5 text-xs font-medium"
                        :class="{
                          'bg-emerald-50 text-emerald-700': formData.status === 'trading',
                          'bg-amber-50 text-amber-700': formData.status === 'suspended',
                          'bg-slate-100 text-slate-600': formData.status === 'delisted'
                        }"
                      >
                        {{ statusLabel(formData.status) }}
                      </span>
                    </div>
                    <p class="text-sm text-slate-700">
                      交易对：<span class="font-medium">{{ formData.baseCurrency || '-' }}/{{ formData.quoteCurrency || '-' }}</span>
                    </p>
                  </div>

                  <div class="p-4 space-y-3">
                    <div class="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span class="text-xs text-slate-600">价格精度</span>
                      <span class="text-sm font-semibold text-slate-900">{{ formData.pricePrecision || 0 }}</span>
                    </div>
                    <div class="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span class="text-xs text-slate-600">数量精度</span>
                      <span class="text-sm font-semibold text-slate-900">{{ formData.quantityPrecision || 0 }}</span>
                    </div>
                    <div class="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span class="text-xs text-slate-600">最小交易量</span>
                      <span class="text-sm font-semibold text-slate-900">{{ formData.minOrderQuantity || 0 }}</span>
                    </div>
                    <div class="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span class="text-xs text-slate-600">买入费率</span>
                      <span class="text-sm font-semibold text-green-600">{{ formData.buyFee || 0 }}%</span>
                    </div>
                    <div class="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span class="text-xs text-slate-600">卖出费率</span>
                      <span class="text-sm font-semibold text-green-600">{{ formData.sellFee || 0 }}%</span>
                    </div>
                    <div class="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span class="text-xs text-slate-600">最小订单金额</span>
                      <span class="text-sm font-semibold text-slate-900">{{ formatCurrency(formData.minOrderValue) }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-xs text-slate-600">最大订单金额</span>
                      <span class="text-sm font-semibold text-slate-900">{{ formatCurrency(formData.maxOrderValue) }}</span>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { mockSpotProducts } from '../../mock/spot'

const products = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const editingProductId = ref(null)
const searchKeyword = ref('')
const activeTab = ref('basic')

const filters = ref({
  status: ''
})

const formData = ref({
  productName: '',
  baseCurrency: '',
  quoteCurrency: '',
  pricePrecision: 2,
  quantityPrecision: 6,
  minOrderQuantity: 0.00001,
  minOrderValue: 10,
  maxOrderValue: 1000000,
  buyFee: 0.1,
  sellFee: 0.1,
  status: 'trading',
  volume24h: 0,
  priceChange24h: 0,
  bidDepth: 0,
  askDepth: 0
})

onMounted(() => {
  products.value = mockSpotProducts
})

const filteredProducts = computed(() => {
  let result = products.value

  if (filters.value.status) {
    result = result.filter(p => p.status === filters.value.status)
  }
  
  // 搜索关键词过滤
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (keyword) {
    result = result.filter(p => 
      p.productName.toLowerCase().includes(keyword) ||
      p.productId.toLowerCase().includes(keyword) ||
      p.baseCurrency.toLowerCase().includes(keyword) ||
      p.quoteCurrency.toLowerCase().includes(keyword)
    )
  }

  return result
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value)
}

const formatVolume = (value) => {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(2) + 'B'
  }
  if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + 'M'
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(2) + 'K'
  }
  return value.toFixed(2)
}

const statusLabel = (status) => {
  const labels = {
    trading: '交易中',
    suspended: '暂停交易',
    delisted: '已下架'
  }
  return labels[status] || status
}

const marketTypeLabel = (type) => {
  return type
}

const resetFilters = () => {
  filters.value = {
    status: ''
  }
}

const resetFormData = () => {
  formData.value = {
    productName: '',
    baseCurrency: '',
    quoteCurrency: '',
    pricePrecision: 2,
    quantityPrecision: 6,
    minOrderQuantity: 0.00001,
    minOrderValue: 10,
    maxOrderValue: 1000000,
    buyFee: 0.1,
    sellFee: 0.1,
    status: 'trading',
    volume24h: 0,
    priceChange24h: 0,
    bidDepth: 0,
    askDepth: 0
  }
}

const showAddProduct = () => {
  isEditing.value = false
  editingProductId.value = null
  resetFormData()
  activeTab.value = 'basic'
  showModal.value = true
}

const editProduct = (product) => {
  isEditing.value = true
  editingProductId.value = product.productId
  formData.value = {
    productName: product.productName,
    baseCurrency: product.baseCurrency,
    quoteCurrency: product.quoteCurrency,
    pricePrecision: product.pricePrecision,
    quantityPrecision: product.quantityPrecision,
    minOrderQuantity: product.minOrderQuantity,
    minOrderValue: product.minOrderValue,
    maxOrderValue: product.maxOrderValue,
    buyFee: product.buyFee,
    sellFee: product.sellFee,
    status: product.status,
    volume24h: product.volume24h,
    priceChange24h: product.priceChange24h,
    bidDepth: product.bidDepth,
    askDepth: product.askDepth
  }
  activeTab.value = 'basic'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  activeTab.value = 'basic'
  resetFormData()
}

const saveProduct = () => {
  // 表单验证
  if (!formData.value.productName) {
    alert('请输入产品名称')
    return
  }
  if (!formData.value.baseCurrency || !formData.value.quoteCurrency) {
    alert('请选择基础币种和计价币种')
    return
  }
  if (formData.value.minOrderValue >= formData.value.maxOrderValue) {
    alert('最大订单金额必须大于最小订单金额')
    return
  }
  if (formData.value.buyFee < 0 || formData.value.sellFee < 0) {
    alert('费率不能为负数')
    return
  }

  if (isEditing.value) {
    // 编辑产品
    const index = products.value.findIndex(p => p.productId === editingProductId.value)
    if (index !== -1) {
      products.value[index] = {
        ...products.value[index],
        ...formData.value
      }
      alert('产品修改成功')
    }
  } else {
    // 新增产品
    const newProduct = {
      productId: `SPOT${String(products.value.length + 1).padStart(3, '0')}`,
      ...formData.value,
      volume24h: Math.random() * 10000000,
      priceChange24h: (Math.random() - 0.5) * 20,
      bidDepth: Math.random() * 1000000,
      askDepth: Math.random() * 1000000
    }
    products.value.unshift(newProduct)
    alert('产品创建成功')
  }

  closeModal()
}

const toggleProductStatus = (product) => {
  const index = products.value.findIndex(p => p.productId === product.productId)
  if (index !== -1) {
    const newStatus = products.value[index].status === 'trading' ? 'suspended' : 'trading'
    products.value[index].status = newStatus
  }
}
</script>
