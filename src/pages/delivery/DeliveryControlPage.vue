<script setup>
import { computed, reactive, ref } from 'vue'
import { COMMON_FILTER_ALL, DELIVERY_ACTION, DELIVERY_CONTROL_STATUS } from '../../constants/delivery'
import { createDeliveryControlUsersMock } from '../../mock/delivery'

const keyword = ref('')
const statusFilter = ref(COMMON_FILTER_ALL)
const showPositionsModal = ref(false)
const showActionModal = ref(false)
const activeUser = ref(null)
const activePosition = ref(null)

const users = ref(createDeliveryControlUsersMock())

const summary = computed(() => {
  const controlled = users.value.filter((u) => u.lockStatus === DELIVERY_CONTROL_STATUS.CONTROLLED).length
  const locked = users.value.filter((u) => u.lockStatus === DELIVERY_CONTROL_STATUS.LOCKED).length
  const ops = 47
  const pnlImpact = -125000
  return [
    { label: '被控用户', value: controlled, sub: '控盈 8 / 控亏 12', tone: 'normal' },
    { label: '锁定用户', value: locked, sub: '', tone: 'normal' },
    { label: '今日操作', value: ops, sub: '次', tone: 'normal' },
    { label: '今日盈亏影响', value: pnlImpact.toLocaleString(), sub: 'USDT', tone: pnlImpact < 0 ? 'down' : 'up' }
  ]
})

const filteredUsers = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return users.value.filter((u) => {
    const hitStatus = statusFilter.value === COMMON_FILTER_ALL || u.lockStatus === statusFilter.value
    const hitKw = !kw || `${u.id} ${u.name} ${u.phone}`.toLowerCase().includes(kw)
    return hitStatus && hitKw
  })
})

const tagClass = (tag) => {
  if (tag.includes('高风险') || tag.includes('控亏')) return 'bg-orange-100 text-orange-700'
  if (tag.includes('中风险')) return 'bg-amber-100 text-amber-700'
  if (tag.includes('已锁定')) return 'bg-violet-100 text-violet-700'
  if (tag === 'VIP') return 'bg-blue-100 text-blue-700'
  return 'bg-slate-100 text-slate-700'
}

const metricClass = (num) => (Number(num) >= 0 ? 'text-emerald-600' : 'text-rose-600')
const sideClass = (side) => (side === 'long' ? 'bg-blue-600 text-white' : 'bg-rose-300 text-white')

const openPositions = (user) => {
  activeUser.value = user
  showPositionsModal.value = true
}

const openAction = (user, position) => {
  activeUser.value = user
  activePosition.value = position
  showActionModal.value = true
}

const actionForm = reactive({
  action: DELIVERY_ACTION.FORCE_LOSS,
  targetPrice: '',
  reason: ''
})

// 表单验证
const isFormValid = computed(() => {
  if (!actionForm.reason.trim()) return false
  if (actionForm.action === DELIVERY_ACTION.LOCK_POSITION) return true
  return actionForm.targetPrice && Number(actionForm.targetPrice) > 0
})

// 计算场控影响
const calculatedImpact = computed(() => {
  if (!activePosition.value || !actionForm.targetPrice) {
    return {
      priceDiff: '-',
      estimatedPnl: '0',
      pnlChange: 0,
      severity: 'low'
    }
  }

  const currentPrice = Number(activePosition.value.currentPrice)
  const targetPrice = Number(actionForm.targetPrice)
  const entryPrice = Number(activePosition.value.entryPrice)
  const qty = Number(activePosition.value.qty)
  const isLong = activePosition.value.side === 'long'

  // 计算价格差异
  const priceDiff = Math.abs(currentPrice - targetPrice).toFixed(2)

  // 计算预估盈亏
  let estimatedPnl = 0
  if (isLong) {
    estimatedPnl = ((targetPrice - entryPrice) * qty).toFixed(2)
  } else {
    estimatedPnl = ((entryPrice - targetPrice) * qty).toFixed(2)
  }

  // 计算盈亏变化
  const currentPnl = Number(activePosition.value.pnl)
  const pnlChange = (Number(estimatedPnl) - currentPnl).toFixed(2)

  // 计算影响严重程度
  const pnlChangeAbs = Math.abs(Number(pnlChange))
  let severity = 'low'
  if (pnlChangeAbs > 100) severity = 'high'
  else if (pnlChangeAbs > 50) severity = 'medium'

  return {
    priceDiff: `$${priceDiff}`,
    estimatedPnl: Number(estimatedPnl).toFixed(2),
    pnlChange: Number(pnlChange).toFixed(2),
    severity
  }
})
</script>

<template>
  <section class="space-y-5">
    <header>
      <h1 class="text-3xl font-semibold text-slate-900">单人场控操作</h1>
    </header>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article v-for="card in summary" :key="card.label" class="rounded-xl border border-slate-200 bg-white p-4">
        <p class="text-sm text-slate-500">{{ card.label }}</p>
        <p class="mt-2 text-3xl font-semibold" :class="card.tone === 'down' ? 'text-rose-600' : card.tone === 'up' ? 'text-emerald-600' : 'text-slate-900'">{{ card.value }}</p>
        <p class="mt-1 text-sm text-slate-500">{{ card.sub }}</p>
      </article>
    </div>

    <article class="rounded-xl border border-slate-200 bg-white p-4">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-xl font-semibold text-slate-900">用户列表</h2>
        <div class="flex items-center gap-2">
          <input v-model="keyword" type="text" placeholder="搜索用户ID、姓名、手机号..." class="w-full min-w-[280px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
          <select v-model="statusFilter" class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <option :value="COMMON_FILTER_ALL">全部状态</option>
            <option :value="DELIVERY_CONTROL_STATUS.CONTROLLED">场控中</option>
            <option :value="DELIVERY_CONTROL_STATUS.LOCKED">已锁定</option>
          </select>
        </div>
      </div>

      <div class="space-y-3">
        <article v-for="user in filteredUsers" :key="user.id" class="rounded-xl border border-slate-200 p-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-xl font-semibold text-slate-900">{{ user.name }}</h3>
                <span class="text-base text-slate-500">{{ user.id }}</span>
                <span class="text-base text-slate-500">{{ user.phone }}</span>
                <span v-for="tag in user.tags" :key="tag" class="rounded-md px-2 py-0.5 text-xs" :class="tagClass(tag)">{{ tag }}</span>
              </div>
            </div>

            <div class="flex items-center gap-4 text-sm">
              <button type="button" class="font-medium text-slate-700" @click="openPositions(user)">持仓</button>
              <button type="button" class="font-medium text-blue-600" @click="openAction(user, user.positions[0])">场控</button>
            </div>
          </div>

          <div class="mt-3 grid gap-2 lg:grid-cols-8">
            <div class="rounded-lg bg-slate-50 p-2.5"><p class="text-xs text-slate-500">账户余额</p><p class="font-semibold">${{ user.balance.toLocaleString() }}</p></div>
            <div class="rounded-lg bg-slate-50 p-2.5"><p class="text-xs text-slate-500">净入金</p><p class="font-semibold">${{ user.netDeposit.toLocaleString() }}</p></div>
            <div class="rounded-lg bg-slate-50 p-2.5"><p class="text-xs text-slate-500">持仓数</p><p class="font-semibold">{{ user.positionsCount }}</p></div>
            <div class="rounded-lg bg-slate-50 p-2.5"><p class="text-xs text-slate-500">持仓价值</p><p class="font-semibold">${{ user.positionsValue.toLocaleString() }}</p></div>
            <div class="rounded-lg bg-slate-50 p-2.5"><p class="text-xs text-slate-500">未实现盈亏</p><p class="font-semibold" :class="metricClass(user.unrealizedPnl)">{{ user.unrealizedPnl >= 0 ? '+' : '' }}{{ user.unrealizedPnl.toLocaleString() }}</p></div>
            <div class="rounded-lg bg-slate-50 p-2.5"><p class="text-xs text-slate-500">交易次数</p><p class="font-semibold">{{ user.tradeCount }}</p></div>
            <div class="rounded-lg bg-slate-50 p-2.5"><p class="text-xs text-slate-500">当前胜率</p><p class="font-semibold">{{ user.winRate }}</p></div>
            <div class="rounded-lg bg-slate-50 p-2.5"><p class="text-xs text-slate-500">累计盈亏</p><p class="font-semibold" :class="metricClass(user.totalPnl)">{{ user.totalPnl >= 0 ? '+' : '' }}{{ user.totalPnl.toLocaleString() }}</p></div>
          </div>

          <p class="mt-3 text-sm text-slate-500">{{ user.ruleText }}</p>
        </article>
      </div>
    </article>
  </section>

  <div v-if="showPositionsModal && activeUser" class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" @click.self="showPositionsModal = false">
    <section class="w-full max-w-3xl rounded-xl bg-white">
      <header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <h2 class="text-xl font-semibold text-slate-900">{{ activeUser.name }} 的持仓 ({{ activeUser.id }})</h2>
        <button type="button" class="text-2xl text-slate-400" @click="showPositionsModal = false">×</button>
      </header>

      <div class="space-y-3 p-5">
        <article v-for="pos in activeUser.positions" :key="pos.id" class="rounded-xl border border-slate-200 p-4" :class="pos.controlled ? 'border-orange-300' : ''">
          <div class="flex items-center justify-between">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-xl font-semibold text-slate-900">{{ pos.symbol }}</h3>
              <span class="rounded-md px-2 py-0.5 text-xs" :class="sideClass(pos.side)">{{ pos.side === 'long' ? '做多' : '做空' }}</span>
              <span class="text-slate-500">{{ pos.leverage }}</span>
              <span v-if="pos.liquidated" class="rounded-md bg-orange-100 px-2 py-0.5 text-xs text-orange-700">已场控</span>
            </div>
            <button type="button" class="text-sm font-medium text-blue-600" @click="openAction(activeUser, pos)">场控</button>
          </div>

          <div class="mt-3 grid gap-2 md:grid-cols-7">
            <div class="rounded-md bg-slate-50 p-2"><p class="text-xs text-slate-500">开仓价</p><p class="font-semibold">${{ pos.entryPrice }}</p></div>
            <div class="rounded-md bg-slate-50 p-2"><p class="text-xs text-slate-500">当前价</p><p class="font-semibold">${{ pos.currentPrice }}</p></div>
            <div class="rounded-md bg-slate-50 p-2"><p class="text-xs text-slate-500">数量</p><p class="font-semibold">{{ pos.qty }}</p></div>
            <div class="rounded-md bg-slate-50 p-2"><p class="text-xs text-slate-500">保证金</p><p class="font-semibold">${{ pos.margin }}</p></div>
            <div class="rounded-md bg-slate-50 p-2"><p class="text-xs text-slate-500">本次盈亏</p><p class="font-semibold text-emerald-600">${{ pos.pnl }}</p></div>
            <div class="rounded-md bg-slate-50 p-2"><p class="text-xs text-slate-500">周期</p><p class="font-semibold">{{ pos.cycleSec }}s</p></div>
            <div class="rounded-md bg-slate-50 p-2"><p class="text-xs text-slate-500">剩余</p><p class="font-semibold text-rose-600">{{ pos.remainSec }}s</p></div>
          </div>
        </article>
      </div>
    </section>
  </div>

  <div v-if="showActionModal && activeUser" class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" @click.self="showActionModal = false">
    <section class="flex h-[88vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
      <!-- 左侧操作区域 -->
      <div class="flex w-3/5 flex-col border-r border-slate-200">
        <header class="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">持仓场控操作</h2>
            <p class="mt-0.5 text-xs text-slate-500">配置场控参数并查看预估影响</p>
          </div>
          <button type="button" class="text-2xl text-slate-400 hover:text-slate-600 transition-colors" @click="showActionModal = false">×</button>
        </header>

        <div class="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <!-- 用户与持仓信息 -->
          <section class="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <svg class="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 class="text-base font-semibold text-slate-900">用户信息</h3>
            </div>
            
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-lg font-semibold text-slate-900">{{ activeUser.name }}</span>
                <span class="text-sm text-slate-500">{{ activeUser.id }}</span>
                <span v-for="tag in activeUser.tags" :key="tag" class="rounded-md px-2 py-0.5 text-xs" :class="tagClass(tag)">{{ tag }}</span>
              </div>
              <div class="mt-3 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p class="text-xs text-slate-500">账户余额</p>
                  <p class="mt-1 font-semibold text-slate-900">${{ activeUser.balance.toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500">累计盈亏</p>
                  <p class="mt-1 font-semibold" :class="metricClass(activeUser.totalPnl)">{{ activeUser.totalPnl >= 0 ? '+' : '' }}${{ activeUser.totalPnl.toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500">当前胜率</p>
                  <p class="mt-1 font-semibold text-slate-900">{{ activeUser.winRate }}</p>
                </div>
              </div>
            </div>

            <div v-if="activePosition" class="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div class="flex items-center gap-2">
                <p class="text-base font-semibold text-slate-900">{{ activePosition.symbol }}</p>
                <span class="rounded-md px-2 py-0.5 text-xs" :class="sideClass(activePosition.side)">{{ activePosition.side === 'long' ? '做多' : '做空' }}</span>
                <span class="text-sm text-slate-600">{{ activePosition.leverage }}</span>
              </div>
              <div class="mt-3 grid grid-cols-4 gap-3 text-sm">
                <div>
                  <p class="text-xs text-slate-600">开仓价</p>
                  <p class="mt-1 font-semibold text-slate-900">${{ activePosition.entryPrice }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-600">当前价</p>
                  <p class="mt-1 font-semibold text-slate-900">${{ activePosition.currentPrice }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-600">保证金</p>
                  <p class="mt-1 font-semibold text-slate-900">${{ activePosition.margin }}</p>
                </div>
                <div>
                  <p class="text-xs text-rose-600">剩余时间</p>
                  <p class="mt-1 font-semibold text-rose-600">{{ activePosition.remainSec }}s</p>
                </div>
              </div>
            </div>
          </section>

          <!-- 场控操作配置 -->
          <section class="space-y-4 rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-5 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600">
                <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 class="text-base font-semibold text-slate-900">场控参数</h3>
            </div>

            <div class="space-y-4">
              <label class="block space-y-2">
                <span class="text-sm font-medium text-slate-700">场控操作 <span class="text-rose-500">*</span></span>
                <select v-model="actionForm.action" class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100">
                  <option :value="DELIVERY_ACTION.FORCE_LOSS">强制亏损</option>
                  <option :value="DELIVERY_ACTION.FORCE_PROFIT">强制盈利</option>
                  <option :value="DELIVERY_ACTION.LOCK_POSITION">冻结持仓</option>
                </select>
                <div class="flex items-start gap-1.5 rounded-md bg-orange-50 px-3 py-2">
                  <svg class="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-xs text-orange-700">
                    <span v-if="actionForm.action === DELIVERY_ACTION.FORCE_LOSS">该持仓将在结算时强制产生亏损</span>
                    <span v-else-if="actionForm.action === DELIVERY_ACTION.FORCE_PROFIT">该持仓将在结算时强制产生盈利</span>
                    <span v-else>该持仓将被冻结，禁止任何操作</span>
                  </span>
                </div>
              </label>

              <label v-if="actionForm.action !== DELIVERY_ACTION.LOCK_POSITION" class="block space-y-2">
                <span class="text-sm font-medium text-slate-700">目标结算价 (USDT) <span class="text-rose-500">*</span></span>
                <input
                  v-model.number="actionForm.targetPrice"
                  type="number"
                  step="0.01"
                  class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="输入目标结算价格"
                />
                <div class="flex items-start gap-1.5 rounded-md bg-blue-50 px-3 py-2">
                  <svg class="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-xs text-blue-700">
                    当前价: ${{ activePosition?.currentPrice || '0' }}，开仓价: ${{ activePosition?.entryPrice || '0' }}
                  </span>
                </div>
              </label>

              <label class="block space-y-2">
                <span class="text-sm font-medium text-slate-700">操作原因 <span class="text-rose-500">*</span></span>
                <textarea
                  v-model="actionForm.reason"
                  rows="3"
                  class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="请详细说明执行该场控操作的原因..."
                ></textarea>
              </label>
            </div>
          </section>
        </div>

        <footer class="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button type="button" class="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white hover:shadow-sm" @click="showActionModal = false">取消</button>
          <button
            type="button"
            class="rounded-lg px-5 py-2.5 text-sm font-medium text-white transition shadow-sm"
            :class="isFormValid ? 'bg-orange-600 hover:bg-orange-700 hover:shadow-md' : 'bg-orange-300 cursor-not-allowed'"
            :disabled="!isFormValid"
          >
            <span class="flex items-center gap-2">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              确认执行
            </span>
          </button>
        </footer>
      </div>

      <!-- 右侧预估计算区域 -->
      <div class="flex w-2/5 flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        <header class="border-b border-slate-200 px-5 py-4">
          <h3 class="text-lg font-semibold text-slate-900">预估计算</h3>
          <p class="mt-0.5 text-xs text-slate-500">实时显示场控操作影响</p>
        </header>

        <div class="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <!-- 持仓当前状态 -->
          <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" v-if="activePosition">
            <h4 class="text-sm font-semibold text-slate-900">当前持仓状态</h4>
            <div class="mt-3 space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">合约</span>
                <span class="font-medium text-slate-900">{{ activePosition.symbol }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">方向</span>
                <span class="rounded-md px-2 py-0.5 text-xs" :class="sideClass(activePosition.side)">{{ activePosition.side === 'long' ? '做多' : '做空' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">数量</span>
                <span class="font-medium text-slate-900">{{ activePosition.qty }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">当前盈亏</span>
                <span class="font-medium text-emerald-600">${{ activePosition.pnl }}</span>
              </div>
            </div>
          </div>

          <!-- 场控影响预估 -->
          <div class="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-orange-900">场控影响预估</h4>
              <span class="rounded-md px-2 py-1 text-xs font-medium" :class="calculatedImpact.severity === 'high' ? 'bg-rose-100 text-rose-700' : calculatedImpact.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'">
                {{ calculatedImpact.severity === 'high' ? '高影响' : calculatedImpact.severity === 'medium' ? '中影响' : '低影响' }}
              </span>
            </div>
            <div class="mt-3 space-y-3">
              <!-- 结算价格影响 -->
              <div v-if="actionForm.action !== DELIVERY_ACTION.LOCK_POSITION" class="rounded-md border border-orange-200 bg-white p-3">
                <p class="text-xs font-medium text-slate-500">结算价格变化</p>
                <div class="mt-2 space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-600">市场当前价</span>
                    <span class="font-semibold text-slate-900">${{ activePosition?.currentPrice || '0' }}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-600">目标结算价</span>
                    <span class="font-semibold" :class="actionForm.targetPrice ? 'text-orange-600' : 'text-slate-400'">
                      ${{ actionForm.targetPrice || '-' }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between rounded bg-orange-50 px-2 py-1 text-sm border-t border-orange-200 pt-2">
                    <span class="font-medium text-orange-700">价格差异</span>
                    <span class="font-bold text-orange-700">{{ calculatedImpact.priceDiff }}</span>
                  </div>
                </div>
              </div>

              <!-- 盈亏影响 -->
              <div v-if="actionForm.action !== DELIVERY_ACTION.LOCK_POSITION" class="rounded-md border border-orange-200 bg-white p-3">
                <p class="text-xs font-medium text-slate-500">盈亏变化预估</p>
                <div class="mt-2 space-y-1.5">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-600">当前盈亏</span>
                    <span class="font-semibold text-emerald-600">${{ activePosition?.pnl || '0' }}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-600">场控后盈亏</span>
                    <span class="font-semibold" :class="calculatedImpact.estimatedPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                      {{ calculatedImpact.estimatedPnl >= 0 ? '+' : '' }}${{ calculatedImpact.estimatedPnl }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between rounded px-2 py-1 text-sm border-t border-orange-200 pt-2" :class="calculatedImpact.pnlChange >= 0 ? 'bg-emerald-50' : 'bg-rose-50'">
                    <span class="font-medium" :class="calculatedImpact.pnlChange >= 0 ? 'text-emerald-700' : 'text-rose-700'">盈亏变化</span>
                    <span class="font-bold" :class="calculatedImpact.pnlChange >= 0 ? 'text-emerald-700' : 'text-rose-700'">
                      {{ calculatedImpact.pnlChange >= 0 ? '+' : '' }}${{ calculatedImpact.pnlChange }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 操作说明 -->
              <div class="rounded-md border border-orange-200 bg-white p-3">
                <p class="text-xs font-medium text-slate-500">操作说明</p>
                <p class="mt-2 text-xs text-slate-600 leading-relaxed">
                  <span v-if="actionForm.action === DELIVERY_ACTION.FORCE_LOSS">
                    该持仓将按目标结算价 ${{ actionForm.targetPrice || '-' }} 强制结算，使用户产生亏损。
                  </span>
                  <span v-else-if="actionForm.action === DELIVERY_ACTION.FORCE_PROFIT">
                    该持仓将按目标结算价 ${{ actionForm.targetPrice || '-' }} 强制结算，使用户产生盈利。
                  </span>
                  <span v-else>
                    该持仓将被冻结，用户无法进行任何操作，直至管理员手动解除。
                  </span>
                </p>
              </div>
            </div>
          </div>

          <!-- 注意事项 -->
          <div class="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div class="flex items-start gap-2">
              <svg class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <div class="text-xs text-amber-900">
                <p class="font-medium">注意事项</p>
                <ul class="mt-2 space-y-1 list-disc list-inside">
                  <li>场控操作不可撤销，请谨慎执行</li>
                  <li>操作将被记录在操作日志中</li>
                  <li>建议填写详细的操作原因</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
