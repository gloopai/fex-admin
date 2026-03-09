<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <h1 class="text-3xl font-bold text-slate-900">用户监控</h1>
      <div class="flex flex-wrap gap-3">
        <button 
          @click="showRiskUsers"
          class="px-4 py-2 border border-rose-300 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 hover:border-rose-400 transition-colors text-sm font-medium"
        >
          高风险用户
        </button>
        <button 
          @click="exportUsers"
          class="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors text-sm font-medium"
        >
          导出数据
        </button>
      </div>
    </header>

    <!-- 风险分布图表 -->
    <article class="rounded-xl border border-slate-200 bg-white p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-lg font-semibold text-slate-900">风险等级分布</h3>
          <p class="text-sm text-slate-500 mt-1">实时监控 {{ users.length }} 位用户的风险状况</p>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg">
          <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <span class="text-sm font-medium text-slate-700">{{ users.length }} 用户</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          v-for="item in riskDistribution" 
          :key="item.level"
          @click="filterByRisk(item.level)"
          class="relative rounded-xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer group"
          :class="{
            'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-2 border-emerald-200': item.level === 'low',
            'bg-gradient-to-br from-amber-50 to-amber-100/50 border-2 border-amber-200': item.level === 'medium',
            'bg-gradient-to-br from-orange-50 to-orange-100/50 border-2 border-orange-200': item.level === 'high',
            'bg-gradient-to-br from-rose-50 to-rose-100/50 border-2 border-rose-200': item.level === 'critical'
          }"
        >
          <!-- 装饰性背景图案 -->
          <div class="absolute top-0 right-0 w-20 h-20 opacity-10">
            <svg viewBox="0 0 100 100" class="w-full h-full">
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="3"
                :class="{
                  'text-emerald-600': item.level === 'low',
                  'text-amber-600': item.level === 'medium',
                  'text-orange-600': item.level === 'high',
                  'text-rose-600': item.level === 'critical'
                }"
              />
            </svg>
          </div>

          <div class="relative space-y-3">
            <!-- 图标和标签 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div 
                  class="w-10 h-10 rounded-lg flex items-center justify-center"
                  :class="{
                    'bg-emerald-500': item.level === 'low',
                    'bg-amber-500': item.level === 'medium',
                    'bg-orange-500': item.level === 'high',
                    'bg-rose-500': item.level === 'critical'
                  }"
                >
                  <svg v-if="item.level === 'low'" class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <svg v-else-if="item.level === 'medium'" class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                  </svg>
                  <svg v-else-if="item.level === 'high'" class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  <svg v-else class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <span 
                  class="text-sm font-semibold"
                  :class="{
                    'text-emerald-700': item.level === 'low',
                    'text-amber-700': item.level === 'medium',
                    'text-orange-700': item.level === 'high',
                    'text-rose-700': item.level === 'critical'
                  }"
                >
                  {{ item.label }}
                </span>
              </div>
              <div 
                class="text-xs font-medium px-2 py-1 rounded-full"
                :class="{
                  'bg-emerald-200 text-emerald-700': item.level === 'low',
                  'bg-amber-200 text-amber-700': item.level === 'medium',
                  'bg-orange-200 text-orange-700': item.level === 'high',
                  'bg-rose-200 text-rose-700': item.level === 'critical'
                }"
              >
                {{ ((item.count / users.length) * 100).toFixed(1) }}%
              </div>
            </div>

            <!-- 数量显示 -->
            <div class="flex items-baseline gap-2">
              <span 
                class="text-3xl font-bold"
                :class="{
                  'text-emerald-700': item.level === 'low',
                  'text-amber-700': item.level === 'medium',
                  'text-orange-700': item.level === 'high',
                  'text-rose-700': item.level === 'critical'
                }"
              >
                {{ item.count }}
              </span>
              <span class="text-sm text-slate-500">位用户</span>
            </div>

            <!-- 进度条 -->
            <div class="space-y-1">
              <div class="h-2 bg-white/60 rounded-full overflow-hidden">
                <div 
                  class="h-full transition-all duration-500 rounded-full"
                  :class="{
                    'bg-emerald-500': item.level === 'low',
                    'bg-amber-500': item.level === 'medium',
                    'bg-orange-500': item.level === 'high',
                    'bg-rose-500': item.level === 'critical'
                  }"
                  :style="{width: `${(item.count / users.length) * 100}%`}"
                ></div>
              </div>
            </div>

            <!-- 趋势指示 -->
            <div class="flex items-center gap-1 text-xs text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <span>点击筛选</span>
            </div>
          </div>
        </div>
      </div>
    </article>

    <article class="rounded-xl border border-slate-200 bg-white p-6">
      <div class="flex flex-wrap items-end gap-4 mb-6">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-600">风险等级</label>
          <select v-model="filters.riskLevel" class="px-3 py-2 rounded-lg border border-slate-200 text-sm min-w-[150px]">
            <option value="">全部</option>
            <option value="low">低风险</option>
            <option value="medium">中风险</option>
            <option value="high">高风险</option>
            <option value="critical">极高风险</option>
          </select>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-600">KYC状态</label>
          <select v-model="filters.kycStatus" class="px-3 py-2 rounded-lg border border-slate-200 text-sm min-w-[150px]">
            <option value="">全部</option>
            <option value="已认证">已认证</option>
            <option value="未认证">未认证</option>
          </select>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-600">VIP等级</label>
          <select v-model="filters.vipLevel" class="px-3 py-2 rounded-lg border border-slate-200 text-sm min-w-[150px]">
            <option value="">全部</option>
            <option value="Platinum">Platinum</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
            <option value="Bronze">Bronze</option>
          </select>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-600">搜索</label>
          <input 
            v-model="filters.searchText" 
            class="px-3 py-2 rounded-lg border border-slate-200 text-sm min-w-[150px]"
            placeholder="用户ID/邮箱"
          />
        </div>
        <button 
          @click="resetFilters"
          class="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
        >
          重置
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b-2 border-slate-200">
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 bg-slate-50">用户信息</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 bg-slate-50">总抵押/债务</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 bg-slate-50">平均LTV</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 bg-slate-50">风险等级</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 bg-slate-50">订单统计</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 bg-slate-50">逾期金额</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 bg-slate-50">累计利息</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 bg-slate-50">信用评分</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 bg-slate-50">VIP等级</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 bg-slate-50">最后活动</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 bg-slate-50">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="user in filteredUsers" 
              :key="user.userId"
              class="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              :class="{
                'bg-rose-50': user.riskLevel === 'critical',
                'bg-orange-50': user.riskLevel === 'high'
              }"
            >
              <td class="px-4 py-4">
                <div class="space-y-1">
                  <div class="text-sm font-medium text-slate-900">{{ user.userId }}</div>
                  <div class="text-sm text-slate-700">{{ user.userName }}</div>
                  <div class="text-xs text-slate-500">{{ user.email }}</div>
                  <div class="flex items-center gap-2 mt-1.5">
                    <span 
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      :class="{
                        'bg-emerald-100 text-emerald-700': user.kycStatus === '已认证',
                        'bg-slate-100 text-slate-600': user.kycStatus === '未认证'
                      }"
                    >
                      {{ user.kycStatus }}
                    </span>
                    <span class="text-xs text-slate-500">{{ user.accountAge }}天</span>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="space-y-1 text-xs">
                  <div class="text-slate-600">
                    <span class="text-slate-500">抵押:</span>
                    <strong class="text-slate-900 ml-1">{{ formatCurrency(user.totalCollateral) }}</strong>
                  </div>
                  <div class="text-slate-600">
                    <span class="text-slate-500">债务:</span>
                    <strong class="ml-1" :class="{'text-rose-600': user.totalDebt > 0, 'text-slate-900': user.totalDebt === 0}">
                      {{ formatCurrency(user.totalDebt) }}
                    </strong>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="space-y-1">
                  <div 
                    class="text-sm font-bold"
                    :class="{
                      'text-emerald-600': user.averageLtv < 60,
                      'text-amber-600': user.averageLtv >= 60 && user.averageLtv < 70,
                      'text-orange-600': user.averageLtv >= 70 && user.averageLtv < 80,
                      'text-rose-600': user.averageLtv >= 80
                    }"
                  >
                    {{ user.averageLtv }}%
                  </div>
                  <div class="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      class="h-full transition-all"
                      :class="{
                        'bg-emerald-500': user.averageLtv < 60,
                        'bg-amber-500': user.averageLtv >= 60 && user.averageLtv < 70,
                        'bg-orange-500': user.averageLtv >= 70 && user.averageLtv < 80,
                        'bg-rose-500': user.averageLtv >= 80
                      }"
                      :style="{width: `${user.averageLtv}%`}"
                    ></div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <span 
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-emerald-100 text-emerald-700': user.riskLevel === 'low',
                    'bg-amber-100 text-amber-700': user.riskLevel === 'medium',
                    'bg-orange-100 text-orange-700': user.riskLevel === 'high',
                    'bg-rose-100 text-rose-700': user.riskLevel === 'critical'
                  }"
                >
                  {{ riskLevelLabel(user.riskLevel) }}
                </span>
              </td>
              <td class="px-4 py-4">
                <div class="space-y-0.5 text-xs">
                  <div class="text-slate-600">
                    <span class="text-slate-500">活跃:</span>
                    <strong class="text-blue-600 ml-1">{{ user.activeOrders }}</strong>
                  </div>
                  <div class="text-slate-600">
                    <span class="text-slate-500">完成:</span>
                    <span class="ml-1">{{ user.completedOrders }}</span>
                  </div>
                  <div v-if="user.liquidatedOrders > 0" class="text-slate-600">
                    <span class="text-slate-500">清算:</span>
                    <strong class="text-rose-600 ml-1">{{ user.liquidatedOrders }}</strong>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <div 
                  class="text-sm font-medium"
                  :class="{'text-rose-600': user.overdueAmount > 0, 'text-slate-900': user.overdueAmount === 0}"
                >
                  {{ formatCurrency(user.overdueAmount) }}
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="text-sm font-medium text-slate-900">
                  {{ formatCurrency(user.totalInterestPaid) }}
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="space-y-1">
                  <div 
                    class="text-sm font-bold"
                    :class="{
                      'text-emerald-600': user.creditScore >= 800,
                      'text-blue-600': user.creditScore >= 700 && user.creditScore < 800,
                      'text-amber-600': user.creditScore >= 600 && user.creditScore < 700,
                      'text-rose-600': user.creditScore < 600
                    }"
                  >
                    {{ user.creditScore }}
                  </div>
                  <div class="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      class="h-full transition-all"
                      :class="{
                        'bg-emerald-500': user.creditScore >= 800,
                        'bg-blue-500': user.creditScore >= 700 && user.creditScore < 800,
                        'bg-amber-500': user.creditScore >= 600 && user.creditScore < 700,
                        'bg-rose-500': user.creditScore < 600
                      }"
                      :style="{width: `${(user.creditScore / 1000) * 100}%`}"
                    ></div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <span 
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-purple-100 text-purple-700': user.vipLevel === 'Platinum',
                    'bg-amber-100 text-amber-700': user.vipLevel === 'Gold',
                    'bg-slate-200 text-slate-700': user.vipLevel === 'Silver',
                    'bg-orange-100 text-orange-700': user.vipLevel === 'Bronze'
                  }"
                >
                  {{ user.vipLevel }}
                </span>
              </td>
              <td class="px-4 py-4">
                <div class="text-sm text-slate-700">
                  {{ formatDate(user.lastActivity) }}
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <button 
                    @click="viewUserDetail(user)"
                    class="px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors"
                  >
                    详情
                  </button>
                  <button 
                    @click="viewUserOrders(user)"
                    class="px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors"
                  >
                    订单
                  </button>
                  <button 
                    v-if="user.riskLevel === 'high' || user.riskLevel === 'critical'" 
                    @click="sendWarning(user)"
                    class="px-3 py-1.5 text-xs font-medium text-rose-700 border border-rose-300 bg-rose-50 rounded-md hover:bg-rose-100 hover:border-rose-400 transition-colors"
                  >
                    预警
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-slate-200">
        <button 
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          上一页
        </button>
        <span class="text-sm text-slate-600">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
        <button 
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          下一页
        </button>
      </div>
    </article>

    <!-- 用户详情模态框 -->
    <div 
      v-if="modals.userDetail.visible" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="modals.userDetail.visible = false"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-slate-900">用户详情</h2>
          <button 
            @click="modals.userDetail.visible = false"
            class="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div v-if="modals.userDetail.data" class="p-6 space-y-6">
          <section class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <div class="text-xs text-slate-500">用户ID</div>
              <div class="text-sm font-medium text-slate-900">{{ modals.userDetail.data.userId }}</div>
            </div>
            <div class="space-y-1">
              <div class="text-xs text-slate-500">用户名</div>
              <div class="text-sm font-medium text-slate-900">{{ modals.userDetail.data.userName }}</div>
            </div>
            <div class="space-y-1">
              <div class="text-xs text-slate-500">邮箱</div>
              <div class="text-sm font-medium text-slate-900">{{ modals.userDetail.data.email }}</div>
            </div>
            <div class="space-y-1">
              <div class="text-xs text-slate-500">KYC状态</div>
              <span 
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                :class="{
                  'bg-emerald-100 text-emerald-700': modals.userDetail.data.kycStatus === '已认证',
                  'bg-slate-100 text-slate-600': modals.userDetail.data.kycStatus === '未认证'
                }"
              >
                {{ modals.userDetail.data.kycStatus }}
              </span>
            </div>
            <div class="space-y-1">
              <div class="text-xs text-slate-500">VIP等级</div>
              <span 
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-purple-100 text-purple-700': modals.userDetail.data.vipLevel === 'Platinum',
                  'bg-amber-100 text-amber-700': modals.userDetail.data.vipLevel === 'Gold',
                  'bg-slate-200 text-slate-700': modals.userDetail.data.vipLevel === 'Silver',
                  'bg-orange-100 text-orange-700': modals.userDetail.data.vipLevel === 'Bronze'
                }"
              >
                {{ modals.userDetail.data.vipLevel }}
              </span>
            </div>
            <div class="space-y-1">
              <div class="text-xs text-slate-500">账户年龄</div>
              <div class="text-sm font-medium text-slate-900">{{ modals.userDetail.data.accountAge }} 天</div>
            </div>
          </section>

          <section class="border-t border-slate-200 pt-6">
            <h3 class="text-sm font-semibold text-slate-900 mb-4">财务信息</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-slate-50 rounded-lg p-4 space-y-1">
                <div class="text-xs text-slate-500">总抵押</div>
                <div class="text-lg font-bold text-slate-900">{{ formatCurrency(modals.userDetail.data.totalCollateral) }}</div>
              </div>
              <div class="bg-slate-50 rounded-lg p-4 space-y-1">
                <div class="text-xs text-slate-500">总债务</div>
                <div class="text-lg font-bold text-rose-600">{{ formatCurrency(modals.userDetail.data.totalDebt) }}</div>
              </div>
              <div class="bg-slate-50 rounded-lg p-4 space-y-1">
                <div class="text-xs text-slate-500">平均LTV</div>
                <div class="text-lg font-bold" :class="{
                  'text-emerald-600': modals.userDetail.data.averageLtv < 60,
                  'text-amber-600': modals.userDetail.data.averageLtv >= 60 && modals.userDetail.data.averageLtv < 70,
                  'text-orange-600': modals.userDetail.data.averageLtv >= 70 && modals.userDetail.data.averageLtv < 80,
                  'text-rose-600': modals.userDetail.data.averageLtv >= 80
                }">{{ modals.userDetail.data.averageLtv }}%</div>
              </div>
              <div class="bg-slate-50 rounded-lg p-4 space-y-1">
                <div class="text-xs text-slate-500">信用评分</div>
                <div class="text-lg font-bold" :class="{
                  'text-emerald-600': modals.userDetail.data.creditScore >= 800,
                  'text-blue-600': modals.userDetail.data.creditScore >= 700 && modals.userDetail.data.creditScore < 800,
                  'text-amber-600': modals.userDetail.data.creditScore >= 600 && modals.userDetail.data.creditScore < 700,
                  'text-rose-600': modals.userDetail.data.creditScore < 600
                }">{{ modals.userDetail.data.creditScore }}</div>
              </div>
              <div class="bg-slate-50 rounded-lg p-4 space-y-1">
                <div class="text-xs text-slate-500">逾期金额</div>
                <div class="text-lg font-bold text-rose-600">{{ formatCurrency(modals.userDetail.data.overdueAmount) }}</div>
              </div>
              <div class="bg-slate-50 rounded-lg p-4 space-y-1">
                <div class="text-xs text-slate-500">累计利息</div>
                <div class="text-lg font-bold text-slate-900">{{ formatCurrency(modals.userDetail.data.totalInterestPaid) }}</div>
              </div>
            </div>
          </section>

          <section class="border-t border-slate-200 pt-6">
            <h3 class="text-sm font-semibold text-slate-900 mb-4">订单统计</h3>
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{{ modals.userDetail.data.activeOrders }}</div>
                <div class="text-xs text-slate-600 mt-1">活跃订单</div>
              </div>
              <div class="text-center p-4 bg-emerald-50 rounded-lg">
                <div class="text-2xl font-bold text-emerald-600">{{ modals.userDetail.data.completedOrders }}</div>
                <div class="text-xs text-slate-600 mt-1">完成订单</div>
              </div>
              <div class="text-center p-4 bg-rose-50 rounded-lg">
                <div class="text-2xl font-bold text-rose-600">{{ modals.userDetail.data.liquidatedOrders }}</div>
                <div class="text-xs text-slate-600 mt-1">清算订单</div>
              </div>
            </div>
          </section>

          <section class="border-t border-slate-200 pt-6">
            <div class="flex items-center justify-between">
              <div class="space-y-1">
                <div class="text-xs text-slate-500">最后活动时间</div>
                <div class="text-sm font-medium text-slate-900">{{ modals.userDetail.data.lastActivity }}</div>
              </div>
              <span 
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-emerald-100 text-emerald-700': modals.userDetail.data.riskLevel === 'low',
                  'bg-amber-100 text-amber-700': modals.userDetail.data.riskLevel === 'medium',
                  'bg-orange-100 text-orange-700': modals.userDetail.data.riskLevel === 'high',
                  'bg-rose-100 text-rose-700': modals.userDetail.data.riskLevel === 'critical'
                }"
              >
                {{ riskLevelLabel(modals.userDetail.data.riskLevel) }}
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- 用户订单模态框 -->
    <div 
      v-if="modals.userOrders.visible" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="modals.userOrders.visible = false"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-slate-900">用户订单</h2>
            <p v-if="modals.userOrders.data" class="text-sm text-slate-500 mt-1">
              {{ modals.userOrders.data.userName }} ({{ modals.userOrders.data.userId }})
            </p>
          </div>
          <button 
            @click="modals.userOrders.visible = false"
            class="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="p-6">
          <div class="space-y-3">
            <div v-for="order in paginatedOrders" :key="order.orderId" 
              class="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="space-y-2 flex-1">
                  <div class="flex items-center gap-3">
                    <span class="text-sm font-medium text-slate-900">订单 #{{ order.orderId }}</span>
                    <span 
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      :class="{
                        'bg-blue-100 text-blue-700': order.status === '进行中',
                        'bg-emerald-100 text-emerald-700': order.status === '已完成',
                        'bg-rose-100 text-rose-700': order.status === '已清算'
                      }"
                    >
                      {{ order.status }}
                    </span>
                  </div>
                  <div class="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                    <div class="text-slate-600">
                      <span class="text-slate-500">抵押资产:</span>
                      <span class="ml-1 font-medium">{{ order.collateralAsset }} {{ order.collateralAmount }}</span>
                    </div>
                    <div class="text-slate-600">
                      <span class="text-slate-500">借贷资产:</span>
                      <span class="ml-1 font-medium">{{ order.loanAsset }} {{ order.loanAmount }}</span>
                    </div>
                    <div class="text-slate-600">
                      <span class="text-slate-500">LTV:</span>
                      <span class="ml-1 font-medium">{{ order.ltv }}%</span>
                    </div>
                    <div class="text-slate-600">
                      <span class="text-slate-500">利率:</span>
                      <span class="ml-1 font-medium">{{ order.interestRate }}%</span>
                    </div>
                    <div class="text-slate-600">
                      <span class="text-slate-500">开始时间:</span>
                      <span class="ml-1">{{ order.startTime }}</span>
                    </div>
                    <div class="text-slate-600">
                      <span class="text-slate-500">到期时间:</span>
                      <span class="ml-1">{{ order.endTime }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="mockOrders.length === 0" class="text-center py-12 text-slate-500">
            暂无订单数据
          </div>
          
          <!-- 订单分页 -->
          <div v-if="mockOrders.length > 0" class="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
            <div class="text-sm text-slate-600">
              共 {{ mockOrders.length }} 条订单 · 第 {{ orderCurrentPage }} / {{ orderTotalPages }} 页
            </div>
            <div class="flex items-center gap-3">
              <button 
                @click="orderPrevPage"
                :disabled="orderCurrentPage === 1"
                class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                上一页
              </button>
              <button 
                @click="orderNextPage"
                :disabled="orderCurrentPage === orderTotalPages"
                class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预警确认模态框 -->
    <div 
      v-if="modals.warning.visible" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="modals.warning.visible = false"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        <div class="bg-rose-50 border-b border-rose-200 px-6 py-4">
          <h2 class="text-xl font-bold text-rose-900">发送风险预警</h2>
        </div>
        <div v-if="modals.warning.data" class="p-6 space-y-4">
          <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div class="flex gap-3">
              <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="text-sm font-medium text-amber-900">即将向以下用户发送风险预警</div>
                <div class="text-xs text-amber-700 mt-1">预警将通过邮件和站内信发送</div>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">用户名</span>
              <span class="font-medium text-slate-900">{{ modals.warning.data.userName }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">用户ID</span>
              <span class="font-medium text-slate-900">{{ modals.warning.data.userId }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">邮箱</span>
              <span class="font-medium text-slate-900">{{ modals.warning.data.email }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">风险等级</span>
              <span 
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                :class="{
                  'bg-orange-100 text-orange-700': modals.warning.data.riskLevel === 'high',
                  'bg-rose-100 text-rose-700': modals.warning.data.riskLevel === 'critical'
                }"
              >
                {{ riskLevelLabel(modals.warning.data.riskLevel) }}
              </span>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-slate-700">预警消息</label>
            <textarea 
              v-model="warningMessage"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              rows="4"
              placeholder="请输入预警消息内容..."
            ></textarea>
          </div>

          <div class="flex gap-3 pt-4">
            <button 
              @click="confirmSendWarning"
              class="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium"
            >
              确认发送
            </button>
            <button 
              @click="modals.warning.visible = false"
              class="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 成功提示 Toast -->
    <div 
      v-if="toast.visible"
      class="fixed top-4 right-4 z-50 bg-white border border-emerald-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 animate-slide-in"
    >
      <div class="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <span class="text-sm font-medium text-slate-900">{{ toast.message }}</span>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { mockUserMonitoring } from '../../mock/cryptoLending'
import { RISK_LEVEL_LABELS } from '../../constants/cryptoLending'

const users = ref([])
const currentPage = ref(1)
const pageSize = ref(10)

const filters = ref({
  riskLevel: '',
  kycStatus: '',
  vipLevel: '',
  searchText: ''
})

// 模态框状态管理
const modals = ref({
  userDetail: {
    visible: false,
    data: null
  },
  userOrders: {
    visible: false,
    data: null
  },
  warning: {
    visible: false,
    data: null
  }
})

// Toast提示
const toast = ref({
  visible: false,
  message: ''
})

// 预警消息
const warningMessage = ref('')

// 订单分页
const orderCurrentPage = ref(1)
const orderPageSize = ref(5)

// 模拟订单数据
const mockOrders = ref([
  {
    orderId: 'ORD-2024-001',
    status: '进行中',
    collateralAsset: 'BTC',
    collateralAmount: '0.5',
    loanAsset: 'USDT',
    loanAmount: '15000',
    ltv: '65',
    interestRate: '8.5',
    startTime: '2024-01-15',
    endTime: '2024-07-15'
  },
  {
    orderId: 'ORD-2024-002',
    status: '已完成',
    collateralAsset: 'ETH',
    collateralAmount: '5',
    loanAsset: 'USDT',
    loanAmount: '8000',
    ltv: '60',
    interestRate: '7.2',
    startTime: '2023-12-01',
    endTime: '2024-03-01'
  },
  {
    orderId: 'ORD-2023-089',
    status: '已清算',
    collateralAsset: 'BTC',
    collateralAmount: '0.3',
    loanAsset: 'USDT',
    loanAmount: '9000',
    ltv: '85',
    interestRate: '9.0',
    startTime: '2023-10-10',
    endTime: '2024-01-10'
  },
  {
    orderId: 'ORD-2024-003',
    status: '进行中',
    collateralAsset: 'ETH',
    collateralAmount: '10',
    loanAsset: 'USDC',
    loanAmount: '12000',
    ltv: '55',
    interestRate: '6.8',
    startTime: '2024-02-01',
    endTime: '2024-08-01'
  },
  {
    orderId: 'ORD-2024-004',
    status: '已完成',
    collateralAsset: 'BNB',
    collateralAmount: '50',
    loanAsset: 'USDT',
    loanAmount: '5000',
    ltv: '50',
    interestRate: '6.5',
    startTime: '2023-11-15',
    endTime: '2024-02-15'
  },
  {
    orderId: 'ORD-2024-005',
    status: '进行中',
    collateralAsset: 'SOL',
    collateralAmount: '100',
    loanAsset: 'USDT',
    loanAmount: '7500',
    ltv: '62',
    interestRate: '7.8',
    startTime: '2024-01-20',
    endTime: '2024-07-20'
  },
  {
    orderId: 'ORD-2023-078',
    status: '已完成',
    collateralAsset: 'BTC',
    collateralAmount: '0.8',
    loanAsset: 'USDC',
    loanAmount: '20000',
    ltv: '58',
    interestRate: '8.2',
    startTime: '2023-09-01',
    endTime: '2024-01-01'
  }
])

onMounted(() => {
  users.value = mockUserMonitoring
})

const filteredUsers = computed(() => {
  let result = users.value

  if (filters.value.riskLevel) {
    result = result.filter(u => u.riskLevel === filters.value.riskLevel)
  }
  if (filters.value.kycStatus) {
    result = result.filter(u => u.kycStatus === filters.value.kycStatus)
  }
  if (filters.value.vipLevel) {
    result = result.filter(u => u.vipLevel === filters.value.vipLevel)
  }
  if (filters.value.searchText) {
    const search = filters.value.searchText.toLowerCase()
    result = result.filter(u => 
      u.userId.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search) ||
      u.userName.toLowerCase().includes(search)
    )
  }

  return result
})

const riskDistribution = computed(() => {
  return [
    { 
      level: 'low', 
      label: '低风险', 
      count: users.value.filter(u => u.riskLevel === 'low').length 
    },
    { 
      level: 'medium', 
      label: '中风险', 
      count: users.value.filter(u => u.riskLevel === 'medium').length 
    },
    { 
      level: 'high', 
      label: '高风险', 
      count: users.value.filter(u => u.riskLevel === 'high').length 
    },
    { 
      level: 'critical', 
      label: '极高风险', 
      count: users.value.filter(u => u.riskLevel === 'critical').length 
    }
  ]
})

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / pageSize.value)
})

const paginatedOrders = computed(() => {
  const start = (orderCurrentPage.value - 1) * orderPageSize.value
  const end = start + orderPageSize.value
  return mockOrders.value.slice(start, end)
})

const orderTotalPages = computed(() => {
  return Math.ceil(mockOrders.value.length / orderPageSize.value)
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(value)
}

const formatDate = (dateStr) => {
  return dateStr.split(' ')[0]
}

const riskLevelLabel = (level) => {
  return RISK_LEVEL_LABELS[level] || level
}

const resetFilters = () => {
  filters.value = {
    riskLevel: '',
    kycStatus: '',
    vipLevel: '',
    searchText: ''
  }
}

const showRiskUsers = () => {
  filters.value.riskLevel = 'high'
  // 平滑滚动到表格位置
  setTimeout(() => {
    const table = document.querySelector('table')
    if (table) {
      table.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 100)
}

const filterByRisk = (level) => {
  filters.value.riskLevel = level
  // 平滑滚动到表格位置
  setTimeout(() => {
    const table = document.querySelector('table')
    if (table) {
      table.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 100)
}

const exportUsers = () => {
  showToast('数据导出功能开发中...')
}

const viewUserDetail = (user) => {
  modals.value.userDetail.data = user
  modals.value.userDetail.visible = true
}

const viewUserOrders = (user) => {
  modals.value.userOrders.data = user
  modals.value.userOrders.visible = true
  orderCurrentPage.value = 1 // 重置到第一页
}

const sendWarning = (user) => {
  modals.value.warning.data = user
  warningMessage.value = `尊敬的用户 ${user.userName}，您的账户风险等级为${riskLevelLabel(user.riskLevel)}，请及时关注您的仓位情况，避免爆仓风险。`
  modals.value.warning.visible = true
}

const confirmSendWarning = () => {
  const userName = modals.value.warning.data.userName
  modals.value.warning.visible = false
  showToast(`风险预警已发送给 ${userName}`)
  warningMessage.value = ''
}

const showToast = (message) => {
  toast.value.message = message
  toast.value.visible = true
  setTimeout(() => {
    toast.value.visible = false
  }, 3000)
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const orderPrevPage = () => {
  if (orderCurrentPage.value > 1) orderCurrentPage.value--
}

const orderNextPage = () => {
  if (orderCurrentPage.value < orderTotalPages.value) orderCurrentPage.value++
}
</script>

<style scoped>
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
</style>
