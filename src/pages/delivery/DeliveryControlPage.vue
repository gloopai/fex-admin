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
</script>

<template>
  <section class="space-y-5">
    <header>
      <h1 class="text-3xl font-semibold text-slate-900">交割合约场控</h1>
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
    <section class="w-full max-w-2xl rounded-xl bg-white">
      <header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <h2 class="text-xl font-semibold text-slate-900">持仓场控</h2>
        <button type="button" class="text-2xl text-slate-400" @click="showActionModal = false">×</button>
      </header>

      <div class="space-y-4 px-6 py-5">
        <div class="rounded-lg bg-slate-50 p-4" v-if="activePosition">
          <div class="flex items-center gap-2">
            <p class="text-lg font-semibold text-slate-900">{{ activePosition.symbol }}</p>
            <span class="rounded-md px-2 py-0.5 text-xs" :class="sideClass(activePosition.side)">{{ activePosition.side === 'long' ? '做多' : '做空' }}</span>
          </div>
          <p class="mt-2 text-sm text-slate-600">开仓价: ${{ activePosition.entryPrice }}　当前价: ${{ activePosition.currentPrice }}　剩余: {{ activePosition.remainSec }}s</p>
        </div>

        <label class="block space-y-1"><span class="text-sm">场控操作</span><select v-model="actionForm.action" class="w-full max-w-[220px] rounded-lg border border-slate-300 px-3 py-2"><option :value="DELIVERY_ACTION.FORCE_LOSS">强制亏损</option><option :value="DELIVERY_ACTION.FORCE_PROFIT">强制盈利</option><option :value="DELIVERY_ACTION.LOCK_POSITION">冻结持仓</option></select></label>
        <label class="block space-y-1"><span class="text-sm">目标结算价 (USDT)</span><input v-model="actionForm.targetPrice" type="number" class="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
        <label class="block space-y-1"><span class="text-sm">操作原因</span><textarea v-model="actionForm.reason" rows="3" class="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="请输入操作原因"></textarea></label>
      </div>

      <footer class="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
        <button type="button" class="rounded-lg border border-slate-300 px-4 py-2" @click="showActionModal = false">取消</button>
        <button type="button" class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white">确认执行</button>
      </footer>
    </section>
  </div>
</template>
