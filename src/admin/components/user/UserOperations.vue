<script setup>
import { computed, ref } from 'vue'
import { USER_STATUS } from '../../constants/user'

const props = defineProps({
  user: { type: Object, required: true },
  assets: { type: Object, default: null }
})

const emit = defineEmits(['submit'])

const statusConfig = {
  [USER_STATUS.ACTIVE]: { text: '正常', class: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  [USER_STATUS.INACTIVE]: { text: '不活跃', class: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200' },
  [USER_STATUS.SUSPENDED]: { text: '暂停', class: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  [USER_STATUS.BANNED]: { text: '禁用', class: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' }
}

const formatMoney = (value, opts = {}) => {
  const num = Number(value || 0)
  const { min = 0, max = 2 } = opts
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: min,
    maximumFractionDigits: max
  }).format(num)
}

const actionType = ref(null)
const showActionModal = ref(false)

const actionForm = ref({
  depositAmount: '',
  depositAccountKey: 'market',
  remark: '',
  transferFromAccountKey: 'market',
  transferToAccountKey: 'trading',
  transferCoinKey: '',
  transferAmount: ''
})

const toast = ref({ visible: false, message: '' })
let toastTimer = null

const showToast = (message) => {
  toast.value.message = message
  toast.value.visible = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value.visible = false
  }, 2500)
}

const closeActionModal = () => {
  showActionModal.value = false
  actionType.value = null
}

const openAction = (type) => {
  actionType.value = type
  actionForm.value = {
    depositAmount: '',
    depositAccountKey: 'market',
    remark: '',
    transferFromAccountKey: 'market',
    transferToAccountKey: 'trading',
    transferCoinKey: '',
    transferAmount: ''
  }
  showActionModal.value = true
}

const freezeDialog = computed(() => {
  const current = props.user?.status
  const isUnfreeze = [USER_STATUS.SUSPENDED, USER_STATUS.BANNED].includes(current)
  const targetStatus = isUnfreeze ? USER_STATUS.ACTIVE : USER_STATUS.SUSPENDED
  const targetText = statusConfig[targetStatus]?.text || (isUnfreeze ? '正常' : '暂停')

  return {
    isUnfreeze,
    targetStatus,
    targetText,
    confirmText: isUnfreeze ? '确认解锁' : '确认封户',
    confirmButtonClass: isUnfreeze
      ? 'bg-emerald-600 hover:bg-emerald-700'
      : 'bg-rose-600 hover:bg-rose-700'
  }
})

const actionConfirmText = computed(() => {
  if (actionType.value === 'deposit') return '确认入金操作'
  if (actionType.value === 'transfer') return '划转'
  if (actionType.value === 'freeze') return freezeDialog.value.confirmText
  return '确认'
})

const actionConfirmButtonClass = computed(() => {
  if (actionType.value === 'freeze') return freezeDialog.value.confirmButtonClass
  return 'bg-blue-600 hover:bg-blue-700'
})

const depositAccountOptions = computed(() => {
  const a = props.assets
  if (!a) return []
  return [
    { key: 'market', label: '市币账户', value: a.marketAccount },
    { key: 'wealth', label: '理财账户', value: a.wealthAccount },
    { key: 'trading', label: '交易合约', value: a.tradingContract },
    { key: 'perp', label: '永续合约', value: a.perpetualContract }
  ]
})

const transferAccountOptions = computed(() => {
  const a = props.assets
  if (!a) return []
  return [
    { key: 'market', label: '市币' },
    { key: 'wealth', label: '理财' },
    { key: 'trading', label: '交易合约' },
    { key: 'perp', label: '永续合约' }
  ]
})

const coinOptions = [
  { key: 'USDT', label: 'USDT' },
  { key: 'USDC', label: 'USDC' },
  { key: 'ETH', label: 'ETH' }
]

const transferFromBalance = computed(() => {
  const a = props.assets
  if (!a) return null
  const fromKey = actionForm.value.transferFromAccountKey
  if (fromKey === 'market') return a.marketAccount
  if (fromKey === 'wealth') return a.wealthAccount
  if (fromKey === 'trading') return a.tradingContract
  if (fromKey === 'perp') return a.perpetualContract
  return null
})

const setTransferAll = () => {
  const v = transferFromBalance.value
  if (v === null) return
  actionForm.value.transferAmount = String(v.toFixed(2))
}

const submitAction = () => {
  if (!props.user) return

  if (actionType.value === 'freeze') {
    emit('submit', { type: 'freeze', targetStatus: freezeDialog.value.targetStatus })
    showToast(`已提交${freezeDialog.value.confirmText}`)
    closeActionModal()
    return
  }

  if (actionType.value === 'deposit') {
    const amount = String(actionForm.value.depositAmount || '').trim()
    const key = String(actionForm.value.depositAccountKey || '').trim()
    if (!amount || Number.isNaN(Number(amount))) {
      showToast('请输入有效的入金金额')
      return
    }
    if (!key) {
      showToast('请选择入金账户')
      return
    }
    emit('submit', { type: 'deposit', amount, accountKey: key, remark: actionForm.value.remark || '' })
    showToast(`已提交入金：${amount}`)
    closeActionModal()
    return
  }

  if (actionType.value === 'transfer') {
    const amount = String(actionForm.value.transferAmount || '').trim()
    const fromKey = String(actionForm.value.transferFromAccountKey || '').trim()
    const toKey = String(actionForm.value.transferToAccountKey || '').trim()
    const coinKey = String(actionForm.value.transferCoinKey || '').trim()

    if (!fromKey) return showToast('请选择“从”账户')
    if (!amount || Number.isNaN(Number(amount))) return showToast('请输入有效的划转数量')
    if (!toKey) return showToast('请选择“到”账户')
    if (!coinKey) return showToast('请选择币种')

    emit('submit', { type: 'transfer', amount, fromAccountKey: fromKey, toAccountKey: toKey, coinKey })
    showToast(`已提交划转：${amount} ${coinOptions.find((c) => c.key === coinKey)?.label || coinKey}`)
    closeActionModal()
  }
}
</script>

<template>
  <div class="pt-1 flex flex-col gap-2 flex-shrink-0">
    <button
      type="button"
      class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg ring-1 bg-white transition-colors"
      :class="freezeDialog.isUnfreeze ? 'ring-emerald-200 text-emerald-700 hover:bg-emerald-50' : 'ring-rose-200 text-rose-700 hover:bg-rose-50'"
      @click="openAction('freeze')"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {{ freezeDialog.isUnfreeze ? '解封' : '封户' }}
    </button>

    <button
      type="button"
      class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg ring-1 ring-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
      @click="openAction('deposit')"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 1v22" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M17 5l-5-4-5 4" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M7 19l5 4 5-4" />
      </svg>
      入金
    </button>

    <button
      type="button"
      class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      @click="openAction('transfer')"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h10v10" />
      </svg>
      划转
    </button>
  </div>

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
        v-if="showActionModal"
        class="fixed inset-0 z-[60] bg-black/40 grid place-items-center p-4"
        @click.self="closeActionModal"
      >
        <section class="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <header class="px-5 py-3 border-b border-slate-100 bg-white">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="text-xs font-medium tracking-wide text-slate-500">操作</div>
                <div class="mt-1 text-base font-semibold text-slate-900">
                  {{
                    actionType === 'freeze'
                      ? '确认操作'
                      : actionType === 'deposit'
                        ? '入金'
                        : actionType === 'transfer'
                          ? '划转'
                          : '操作'
                  }}
                </div>
              </div>
              <button
                type="button"
                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                @click="closeActionModal"
                aria-label="关闭弹窗"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          <form class="px-5 py-4" @submit.prevent="submitAction">
            <div v-if="actionType === 'freeze'" class="space-y-3">
              <div class="text-sm text-slate-700 leading-6">
                您确定要将账户
                <span class="font-semibold text-slate-900">{{ user.username }}</span>
                的状态更改为
                <span class="font-semibold text-slate-900">{{ freezeDialog.targetText }}</span>
                吗？
              </div>
            </div>

            <div v-else-if="actionType === 'deposit'" class="space-y-3">
              <section class="rounded-xl bg-slate-100 p-5">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <div class="text-base font-semibold text-slate-900">
                      {{ user.username }} 账户资产
                    </div>
                    <div class="mt-4 grid grid-cols-2 gap-y-3">
                      <div class="flex items-center gap-2">
                        <div class="text-sm text-slate-600 whitespace-nowrap">市币账户：</div>
                        <div class="text-sm font-semibold text-slate-900">
                          {{ assets ? formatMoney(assets.marketAccount, { min: 2, max: 2 }) : '-' }}
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <div class="text-sm text-slate-600 whitespace-nowrap">理财账户：</div>
                        <div class="text-sm font-semibold text-slate-900">
                          {{ assets ? formatMoney(assets.wealthAccount, { min: 2, max: 2 }) : '-' }}
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <div class="text-sm text-slate-600 whitespace-nowrap">交易合约：</div>
                        <div class="text-sm font-semibold text-slate-900">
                          {{ assets ? formatMoney(assets.tradingContract, { min: 2, max: 2 }) : '-' }}
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <div class="text-sm text-slate-600 whitespace-nowrap">永续合约：</div>
                        <div class="text-sm font-semibold text-slate-900">
                          {{ assets ? formatMoney(assets.perpetualContract, { min: 2, max: 2 }) : '-' }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div>
                <div class="text-sm font-medium text-slate-700 mb-2">选择入金账户：</div>
                <select
                  v-model="actionForm.depositAccountKey"
                  class="w-full rounded-xl border-2 border-blue-600 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option v-for="opt in depositAccountOptions" :key="opt.key" :value="opt.key">
                    {{ opt.label }}
                  </option>
                </select>
              </div>

              <div>
                <div class="text-sm font-medium text-slate-700 mb-2">操作入金数量：</div>
                <input
                  v-model="actionForm.depositAmount"
                  type="number"
                  step="0.01"
                  class="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm outline-none focus:bg-white border border-slate-100"
                  placeholder="请输入入金数量"
                />
              </div>

              <div>
                <div class="text-sm font-medium text-slate-700 mb-2">备注：</div>
                <textarea
                  v-model="actionForm.remark"
                  rows="4"
                  class="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm outline-none focus:bg-white border border-slate-100"
                  placeholder="请输入备注信息（可选）"
                />
              </div>
            </div>

            <div v-else-if="actionType === 'transfer'" class="space-y-4">
              <div>
                <div class="text-sm font-medium text-slate-700 mb-2">从</div>
                <select
                  v-model="actionForm.transferFromAccountKey"
                  class="w-full rounded-xl border-2 border-blue-600 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option v-for="opt in transferAccountOptions" :key="opt.key" :value="opt.key">
                    {{ opt.label }}
                  </option>
                </select>
              </div>

              <div>
                <div class="text-sm font-medium text-slate-700 mb-2">到</div>
                <select
                  v-model="actionForm.transferToAccountKey"
                  class="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm outline-none"
                >
                  <option v-for="opt in transferAccountOptions" :key="opt.key" :value="opt.key">
                    {{ opt.label }}
                  </option>
                </select>
              </div>

              <div>
                <div class="text-sm font-medium text-slate-700 mb-2">币种</div>
                <select
                  v-model="actionForm.transferCoinKey"
                  class="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm outline-none"
                >
                  <option disabled value="">请选择</option>
                  <option v-for="c in coinOptions" :key="c.key" :value="c.key">
                    {{ c.label }}
                  </option>
                </select>
              </div>

              <div>
                <div class="flex items-center justify-between mb-2">
                  <div class="text-sm font-medium text-slate-700">划转数量</div>
                </div>

                <div class="relative">
                  <input
                    v-model="actionForm.transferAmount"
                    type="number"
                    step="0.01"
                    class="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm outline-none border border-slate-100 pr-28"
                    placeholder="请输入划转的数量"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 hover:text-blue-700"
                    @click="setTransferAll"
                  >
                    全部
                  </button>
                </div>

                <div class="mt-2 text-sm text-slate-600">
                  余额:
                  {{
                    transferFromBalance !== null
                      ? formatMoney(transferFromBalance, { min: 2, max: 2 })
                      : '-'
                  }}
                </div>
              </div>
            </div>

            <div class="mt-5 flex justify-end gap-3" :class="actionType === 'transfer' ? 'justify-stretch' : ''">
              <button
                v-if="actionType !== 'transfer'"
                type="button"
                class="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                @click="closeActionModal"
              >
                取消
              </button>
              <button
                type="submit"
                class="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors"
                :class="actionType === 'transfer' ? 'w-full px-6 py-4 rounded-xl text-base' : actionConfirmButtonClass"
              >
                {{ actionConfirmText }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </Transition>
  </Teleport>

  <div
    v-if="toast.visible"
    class="fixed top-4 right-4 z-[70] bg-white border border-blue-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3"
  >
    <div class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
      <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <span class="text-sm font-medium text-slate-900">{{ toast.message }}</span>
  </div>
</template>

