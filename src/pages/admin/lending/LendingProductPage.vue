<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">产品管理</h1>
        <p class="mt-1 text-sm text-slate-500">借贷产品：借出币种、额度、利率与流动性；与弹窗内预览一致。</p>
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
            <option value="active">活跃</option>
            <option value="inactive">停用</option>
            <option value="suspended">暂停</option>
          </select>
          <button type="button" class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" @click="resetFilters">重置</button>
        </div>

        <div class="relative w-full max-w-sm">
          <input
            v-model="searchKeyword"
            type="text"
            class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            placeholder="搜索产品名称或代码..."
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
                    'bg-emerald-50 text-emerald-700': product.status === 'active',
                    'bg-slate-100 text-slate-600': product.status === 'inactive',
                    'bg-amber-50 text-amber-700': product.status === 'suspended'
                  }"
                >
                  {{ statusLabel(product.status) }}
                </span>
              </div>
              <p class="mt-2 text-sm text-slate-700">
                借出币种: <span class="font-medium">{{ product.loanCurrency }}</span>
                <span class="mx-3 text-slate-300">|</span>
                年化利率: <span class="font-medium text-emerald-600">{{ product.interestRate ?? 0 }}%</span>
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
                :class="product.status === 'active' ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100' : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'"
                @click="toggleProductStatus(product)"
              >
                {{ product.status === 'active' ? '暂停' : '启用' }}
              </button>
            </div>
          </div>

          <div class="grid gap-0 md:grid-cols-3">
            <div class="border-b border-slate-200 p-4 md:border-b-0 md:border-r">
              <p class="text-sm text-slate-500">借款范围</p>
              <ul class="mt-2 space-y-1 text-sm text-slate-700">
                <li><span class="font-medium">最小:</span> {{ formatCurrency(product.minLoanAmount) }}</li>
                <li><span class="font-medium">最大:</span> {{ formatCurrency(product.maxLoanAmount) }}</li>
              </ul>
            </div>
            <div class="border-b border-slate-200 p-4 md:border-b-0 md:border-r">
              <p class="text-sm text-slate-500">资金状况</p>
              <ul class="mt-2 space-y-1 text-sm text-slate-700">
                <li><span class="font-medium">总借出:</span> {{ formatCurrency(product.totalLent) }}</li>
                <li><span class="font-medium">可用流动性:</span> <span class="text-emerald-600">{{ formatCurrency(product.availableLiquidity) }}</span></li>
              </ul>
            </div>
            <div class="p-4">
              <p class="text-sm text-slate-500">使用情况</p>
              <ul class="mt-2 space-y-1 text-sm text-slate-700">
                <li><span class="font-medium">活跃用户:</span> {{ product.activeUsers }} 人</li>
                <li><span class="font-medium">活跃订单:</span> {{ product.activeOrders || 0 }} 单</li>
              </ul>
            </div>
          </div>
        </article>

        <p v-if="filteredProducts.length === 0" class="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          没有匹配的借贷产品
        </p>
      </div>
    </article>

    <!-- 产品编辑模态框 - 左右布局 -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div class="flex h-[min(88vh,56rem)] w-full max-w-6xl max-h-[95vh] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <!-- 弹窗头部 -->
        <div class="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">{{ isEditing ? '编辑产品' : '新增产品' }}</h2>
            <p class="mt-1 text-sm text-slate-500">左侧维护参数，右侧实时预览；保存后与列表展示一致。</p>
          </div>
          <button type="button" class="text-slate-400 hover:text-slate-600" @click="closeModal">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 弹窗主体：左右分栏（固定高度，仅内部滚动，避免切换 Tab 时整窗伸缩） -->
        <div class="flex min-h-0 flex-1 overflow-hidden">
          <!-- 左侧：产品设置区域 (60%) -->
          <div class="flex min-h-0 min-w-0 w-3/5 flex-col border-r border-slate-200">
            <!-- Tab 导航 -->
            <div class="shrink-0 border-b border-slate-200 px-6">
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
                  @click="activeTab = 'details'"
                  class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
                  :class="activeTab === 'details'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'"
                >
                  详细配置
                </button>
              </div>
            </div>

            <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6">
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
                        placeholder="例如：USDT 灵活借贷"
                      />
                    </div>
                    <div>
                      <label class="mb-1.5 block text-sm font-medium text-slate-700">借出币种</label>
                      <select
                        v-model="formData.loanCurrency"
                        class="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">请选择</option>
                        <option value="USDT">USDT</option>
                        <option value="USDC">USDC</option>
                        <option value="DAI">DAI</option>
                        <option value="BTC">BTC</option>
                        <option value="ETH">ETH</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- 借款额度 -->
                <div>
                  <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
                    </svg>
                    借款额度
                  </h3>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1.5">最小借款额</label>
                      <input 
                        v-model.number="formData.minLoanAmount" 
                        type="number" 
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1000"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1.5">最大借款额</label>
                      <input 
                        v-model.number="formData.maxLoanAmount" 
                        type="number" 
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="500000"
                      />
                    </div>
                  </div>
                </div>

                <!-- 期限设置 -->
                <div>
                  <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                    </svg>
                    期限设置
                  </h3>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1.5">最短期限 (天)</label>
                      <input 
                        v-model.number="formData.minLoanDuration" 
                        type="number" 
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="7"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1.5">最长期限 (天)</label>
                      <input 
                        v-model.number="formData.maxLoanDuration" 
                        type="number" 
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="90"
                      />
                    </div>
                  </div>
                </div>

                <!-- 产品状态 -->
                <div>
                  <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
                    </svg>
                    产品状态
                  </h3>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">状态</label>
                    <select 
                      v-model="formData.status" 
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">活跃</option>
                      <option value="inactive">停用</option>
                      <option value="suspended">暂停</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Tab 2: 利率 + 流动性 + 其他 -->
              <div v-show="activeTab === 'details'" class="space-y-8">
                <div>
                  <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <svg class="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                    </svg>
                    利率设置
                  </h3>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">年化利率（%）</label>
                  <input
                    v-model.number="formData.interestRate"
                    type="number"
                    step="0.01"
                    min="0"
                    class="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如 8.5"
                  />
                  <p class="mt-2 text-xs text-slate-500">按年化展示；保存后产品统一为固定利率，与列表、订单计息一致。</p>
                </div>

                <div>
                  <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <svg class="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                    </svg>
                    流动性
                  </h3>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">可用流动性</label>
                  <input
                    v-model.number="formData.availableLiquidity"
                    type="number"
                    class="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1000000"
                  />
                  <p class="mt-1 text-xs text-slate-500">该产品可用于借贷的资金池规模（演示字段）。</p>
                </div>

                <div>
                  <h3 class="mb-3 text-sm font-semibold text-slate-900">其他信息</h3>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">产品描述</label>
                  <textarea
                    v-model="formData.description"
                    rows="3"
                    class="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="可选：产品特点、适用场景等"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- 左侧底部按钮 -->
            <div class="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 p-4">
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
          <div class="flex min-h-0 min-w-0 w-2/5 flex-col bg-slate-50">
            <div class="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-6">
              <div>
                <div class="mb-3">
                  <h4 class="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <svg class="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                    </svg>
                    实时预览
                  </h4>
                  <p class="mt-1 text-xs text-slate-500">与左侧表单同步，仅作展示示意。</p>
                </div>

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
                          'bg-emerald-50 text-emerald-700': formData.status === 'active',
                          'bg-slate-100 text-slate-600': formData.status === 'inactive',
                          'bg-amber-50 text-amber-700': formData.status === 'suspended'
                        }"
                      >
                        {{ statusLabel(formData.status) }}
                      </span>
                    </div>
                    <p class="text-sm text-slate-700">
                      借出币种: <span class="font-medium">{{ formData.loanCurrency || '—' }}</span>
                    </p>
                  </div>

                  <div class="space-y-3 p-4">
                    <div class="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span class="text-xs text-slate-600">年化利率（固定）</span>
                      <span class="text-sm font-semibold text-emerald-600">{{ formData.interestRate ?? 0 }}%</span>
                    </div>

                    <div class="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span class="text-xs text-slate-600">借款范围</span>
                      <span class="text-sm font-semibold text-slate-900">
                        {{ formatCurrency(formData.minLoanAmount) }} - {{ formatCurrency(formData.maxLoanAmount) }}
                      </span>
                    </div>
                    <div class="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span class="text-xs text-slate-600">期限范围</span>
                      <span class="text-sm font-semibold text-slate-900">
                        {{ formData.minLoanDuration || 0 }} - {{ formData.maxLoanDuration || 0 }} 天
                      </span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-xs text-slate-600">可用流动性</span>
                      <span class="text-sm font-semibold text-blue-600">
                        {{ formatCurrency(formData.availableLiquidity) }}
                      </span>
                    </div>
                  </div>
                </article>

                <!-- 描述预览 -->
                <div v-if="formData.description" class="bg-white border border-slate-200 rounded-lg p-4">
                  <h5 class="text-xs font-medium text-slate-600 mb-2">产品描述</h5>
                  <p class="text-sm text-slate-700 leading-relaxed">{{ formData.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { lendingProductsCatalog } from '../../../admin/state/financeCatalogs'
import { PRODUCT_STATUS_LABELS, INTEREST_RATE_TYPE } from '../../../admin/constants/cryptoLending'

const products = lendingProductsCatalog
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
  loanCurrency: '',
  minLoanAmount: 0,
  maxLoanAmount: 0,
  interestRate: 0,
  minLoanDuration: 7,
  maxLoanDuration: 90,
  availableLiquidity: 0,
  status: 'active',
  description: ''
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
      (p.loanCurrency || '').toLowerCase().includes(keyword)
    )
  }

  return result
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(value)
}

const statusLabel = (status) => {
  return PRODUCT_STATUS_LABELS[status] || status
}

const resetFilters = () => {
  filters.value = {
    status: ''
  }
}

const resetFormData = () => {
  formData.value = {
    productName: '',
    loanCurrency: '',
    minLoanAmount: 0,
    maxLoanAmount: 0,
    interestRate: 0,
    minLoanDuration: 7,
    maxLoanDuration: 90,
    availableLiquidity: 0,
    status: 'active',
    description: ''
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
    loanCurrency: product.loanCurrency,
    minLoanAmount: product.minLoanAmount,
    maxLoanAmount: product.maxLoanAmount,
    interestRate: Number(product.interestRate) || 0,
    minLoanDuration: product.minLoanDuration,
    maxLoanDuration: product.maxLoanDuration,
    availableLiquidity: product.availableLiquidity,
    status: product.status,
    description: product.description || ''
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
  if (!formData.value.loanCurrency) {
    alert('请选择借出币种')
    return
  }
  if (formData.value.minLoanAmount >= formData.value.maxLoanAmount) {
    alert('最大借款额必须大于最小借款额')
    return
  }

  const rate = Number(formData.value.interestRate)
  if (!Number.isFinite(rate) || rate < 0) {
    alert('请填写有效的年化利率')
    return
  }

  const payload = {
    ...formData.value,
    interestRate: rate,
    interestRateType: INTEREST_RATE_TYPE.FIXED
  }

  if (isEditing.value) {
    const index = products.value.findIndex(p => p.productId === editingProductId.value)
    if (index !== -1) {
      const prev = products.value[index]
      const next = { ...prev, ...payload }
      delete next.floatingRateConfig
      delete next.tieredRateConfig
      delete next.collateralType
      delete next.ltvRatio
      delete next.liquidationThreshold
      products.value[index] = next
      alert('产品修改成功')
    }
  } else {
    const newProduct = {
      productId: `PROD${String(products.value.length + 1).padStart(3, '0')}`,
      ...payload,
      totalLent: 0,
      activeUsers: 0,
      activeOrders: 0
    }
    products.value.unshift(newProduct)
    alert('产品创建成功')
  }

  closeModal()
}

const toggleProductStatus = (product) => {
  const index = products.value.findIndex(p => p.productId === product.productId)
  if (index !== -1) {
    const newStatus = products.value[index].status === 'active' ? 'suspended' : 'active'
    products.value[index].status = newStatus
  }
}
</script>
