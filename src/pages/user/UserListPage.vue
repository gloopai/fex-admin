<script setup>
import { ref, computed } from 'vue'
import UserCard from '../../components/UserCard.vue'
import { usersList } from '../../mock/user'
import { USER_STATUS, USER_ROLE, USER_KYC_STATUS } from '../../constants/user'

// 搜索关键词
const searchKeyword = ref('')

// 模态弹窗状态
const showModal = ref(false)
const selectedUser = ref(null)

// 获取过滤后的用户列表
const filteredUsers = computed(() => {
  let users = [...usersList]
  
  // 搜索关键词筛选
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    users = users.filter(user => 
      user.username.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword) ||
      user.phone.includes(keyword) ||
      user.id.toLowerCase().includes(keyword)
    )
  }
  
  return users
})

// 统计信息
const statistics = computed(() => {
  const total = usersList.length
  const active = usersList.filter(u => u.status === USER_STATUS.ACTIVE).length
  const vip = usersList.filter(u => u.isVip).length
  const agents = usersList.filter(u => u.role === USER_ROLE.AGENT).length
  
  return [
    {
      label: '总用户数',
      value: total.toLocaleString(),
      trend: '+8.2% 较上月',
      good: true
    },
    {
      label: '活跃用户',
      value: active.toLocaleString(),
      trend: `${((active / total) * 100).toFixed(1)}% 占比`,
      good: true
    },
    {
      label: 'VIP用户',
      value: vip.toLocaleString(),
      trend: '+12 本月新增',
      good: true
    },
    {
      label: '代理用户',
      value: agents.toLocaleString(),
      trend: `${((agents / total) * 100).toFixed(1)}% 占比`,
      good: true
    }
  ]
})

// 状态配置
const statusConfig = {
  [USER_STATUS.ACTIVE]: { text: '活跃', class: 'bg-emerald-100 text-emerald-700' },
  [USER_STATUS.INACTIVE]: { text: '不活跃', class: 'bg-gray-100 text-gray-700' },
  [USER_STATUS.SUSPENDED]: { text: '暂停', class: 'bg-amber-100 text-amber-700' },
  [USER_STATUS.BANNED]: { text: '禁用', class: 'bg-rose-100 text-rose-700' }
}

const roleConfig = {
  [USER_ROLE.USER]: { text: '普通用户', class: 'bg-blue-100 text-blue-700' },
  [USER_ROLE.AGENT]: { text: '代理', class: 'bg-purple-100 text-purple-700' }
}

const kycConfig = {
  [USER_KYC_STATUS.NOT_VERIFIED]: { text: '未认证', class: 'bg-gray-100 text-gray-700' },
  [USER_KYC_STATUS.PENDING]: { text: '审核中', class: 'bg-blue-100 text-blue-700' },
  [USER_KYC_STATUS.VERIFIED]: { text: '已认证', class: 'bg-emerald-100 text-emerald-700' },
  [USER_KYC_STATUS.REJECTED]: { text: '已拒绝', class: 'bg-rose-100 text-rose-700' }
}

// 格式化货币
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 打开用户详情
const openUserDetail = (user) => {
  selectedUser.value = user
  showModal.value = true
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
  selectedUser.value = null
}
</script>

<template>
  <section class="space-y-6">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900">用户管理</h1>
      <p class="text-sm text-slate-500 mt-1">管理系统用户、查看用户信息和统计数据</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="stat in statistics"
        :key="stat.label"
        class="rounded-xl border border-slate-200 bg-white p-4"
      >
        <p class="text-sm text-slate-500">{{ stat.label }}</p>
        <p class="mt-2 text-2xl font-semibold text-slate-900">{{ stat.value }}</p>
        <p class="mt-2 text-sm font-medium" :class="stat.good ? 'text-emerald-600' : 'text-rose-600'">
          {{ stat.trend }}
        </p>
      </article>
    </div>

    <!-- 筛选和搜索区域 -->
    <div class="rounded-xl border border-slate-200 bg-white p-5">
      <!-- 搜索框 -->
      <div class="relative">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索用户名、邮箱、手机号或ID..."
          class="w-full px-4 py-2 pl-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
    </div>

    <!-- 用户表格 -->
    <div v-if="filteredUsers.length > 0" class="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">用户名</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">邮箱</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">角色</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">VIP</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">信用分</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">状态</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">账户余额</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">上级</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr 
              v-for="user in filteredUsers" 
              :key="user.id"
              class="hover:bg-slate-50 transition-colors cursor-pointer"
              @click="openUserDetail(user)"
            >
              <!-- ID -->
              <td class="px-4 py-3">
                <span class="text-xs font-mono text-slate-600">{{ user.id }}</span>
              </td>

              <!-- 用户名 -->
              <td class="px-4 py-3">
                <p class="text-sm font-medium text-slate-900">{{ user.username }}</p>
              </td>

              <!-- 邮箱 -->
              <td class="px-4 py-3">
                <p class="text-sm text-slate-600">{{ user.email }}</p>
              </td>

              <!-- 角色 -->
              <td class="px-4 py-3">
                <span 
                  :class="roleConfig[user.role].class"
                  class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ roleConfig[user.role].text }}
                </span>
              </td>

              <!-- VIP -->
              <td class="px-4 py-3 text-center">
                <span v-if="user.isVip" class="inline-flex items-center justify-center">
                  <svg class="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </span>
                <span v-else class="text-xs text-slate-400">-</span>
              </td>

              <!-- 信用分 -->
              <td class="px-4 py-3 text-center">
                <span 
                  class="inline-flex px-2 py-1 text-sm font-semibold rounded-md"
                  :class="{
                    'bg-emerald-100 text-emerald-700': user.creditScore >= 700,
                    'bg-blue-100 text-blue-700': user.creditScore >= 600 && user.creditScore < 700,
                    'bg-amber-100 text-amber-700': user.creditScore >= 500 && user.creditScore < 600,
                    'bg-rose-100 text-rose-700': user.creditScore < 500
                  }"
                >
                  {{ user.creditScore }}
                </span>
              </td>

              <!-- 状态 -->
              <td class="px-4 py-3">
                <span 
                  :class="statusConfig[user.status].class"
                  class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ statusConfig[user.status].text }}
                </span>
              </td>

              <!-- 账户余额 -->
              <td class="px-4 py-3 text-right">
                <span class="text-sm font-medium text-slate-900">
                  {{ formatCurrency(user.balance) }}
                </span>
              </td>

              <!-- 上级 -->
              <td class="px-4 py-3">
                <span v-if="user.parentUsername" class="text-sm text-slate-600">
                  {{ user.parentUsername }}
                </span>
                <span v-else class="text-xs text-slate-400">-</span>
              </td>

              <!-- 操作按钮 -->
              <td class="px-4 py-3">
                <button
                  @click.stop="openUserDetail(user)"
                  class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  查看详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="rounded-xl border border-slate-200 bg-white p-12 text-center">
      <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
      </svg>
      <h3 class="mt-4 text-lg font-semibold text-slate-900">未找到用户</h3>
      <p class="mt-2 text-sm text-slate-500">请尝试调整搜索关键词</p>
      <button
        v-if="searchKeyword"
        @click="searchKeyword = ''"
        class="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        清空搜索
      </button>
    </div>

    <!-- 用户详情弹窗 -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          @click.self="closeModal"
        >
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="showModal"
              class="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <!-- 关闭按钮 -->
              <button
                @click="closeModal"
                class="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 transition-colors shadow-lg"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>

              <!-- 用户详情卡片 -->
              <UserCard v-if="selectedUser" :user="selectedUser" />
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>
