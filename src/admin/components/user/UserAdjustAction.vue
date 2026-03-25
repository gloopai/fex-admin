<script setup>
import { computed, ref } from 'vue'
import { vipLevels, getVipLevelByCreditScore } from '../../mock/vip'
import { getAllCreditScoreConfig } from '../../mock/creditScore'
import { CREDIT_SCORE_CONFIG_KEYS, CREDIT_SCORE_CHANGE_TYPE } from '../../constants/creditScore'

const props = defineProps({
  user: { type: Object, required: true }
})

const emit = defineEmits(['submit'])

const config = computed(() => getAllCreditScoreConfig())
const minScore = computed(() => Number(config.value[CREDIT_SCORE_CONFIG_KEYS.MIN_SCORE] ?? 0))
const maxScore = computed(() => Number(config.value[CREDIT_SCORE_CONFIG_KEYS.MAX_SCORE] ?? 100))
const manualAuditEnabled = computed(() => Boolean(config.value[CREDIT_SCORE_CONFIG_KEYS.MANUAL_AUDIT_ENABLED]))
const manualAuditThreshold = computed(() => Number(config.value[CREDIT_SCORE_CONFIG_KEYS.MANUAL_AUDIT_THRESHOLD] ?? 10))
const manualAuditTypes = computed(() => config.value[CREDIT_SCORE_CONFIG_KEYS.MANUAL_AUDIT_TYPES] || [])

const activeVipOptions = computed(() => {
  return [...vipLevels]
    .filter((v) => v.status === 'enabled')
    .sort((a, b) => a.level - b.level)
    .map((v) => ({
      level: v.level,
      label: v.level === 0 ? '普通用户' : `VIP${v.level}（${v.displayName}）`,
      minCreditScore: v.minCreditScore
    }))
})

const currentVipLevel = computed(() => {
  const score = Number(props.user?.creditScore ?? 0)
  return getVipLevelByCreditScore(score)?.level ?? 0
})

const showModal = ref(false)
const form = ref({
  vipTargetLevel: null,
  scoreDirection: 'increase', // increase | decrease
  scoreDelta: '',
  remark: ''
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

const open = () => {
  form.value = {
    vipTargetLevel: currentVipLevel.value,
    scoreDirection: 'increase',
    scoreDelta: '',
    remark: ''
  }
  showModal.value = true
}

const close = () => {
  showModal.value = false
}

const parsedDelta = computed(() => {
  const n = Number(form.value.scoreDelta)
  if (!Number.isFinite(n)) return null
  if (n <= 0) return null
  return Math.floor(n)
})

const scoreBefore = computed(() => Number(props.user?.creditScore ?? 0))
const scoreDeltaSigned = computed(() => {
  const d = parsedDelta.value
  if (d === null) return 0
  return form.value.scoreDirection === 'decrease' ? -d : d
})

const scoreAfter = computed(() => {
  const after = scoreBefore.value + scoreDeltaSigned.value
  return Math.max(minScore.value, Math.min(maxScore.value, after))
})

const willChangeVip = computed(() => {
  const target = Number(form.value.vipTargetLevel)
  return Number.isFinite(target) && target !== currentVipLevel.value
})

const willChangeScore = computed(() => parsedDelta.value !== null)

const auditHint = computed(() => {
  if (!manualAuditEnabled.value) return null
  if (!willChangeScore.value) return null
  const absDelta = Math.abs(scoreDeltaSigned.value)
  const needsByThreshold = absDelta >= manualAuditThreshold.value
  const allowedType = manualAuditTypes.value.includes(CREDIT_SCORE_CHANGE_TYPE.MANUAL_ADJUST)
  if (needsByThreshold && allowedType) return `提示：本次信用分变动绝对值为 ${absDelta}，达到审核阈值 ${manualAuditThreshold.value}，可能需要进入人工审核流程。`
  return null
})

const confirm = () => {
  if (!willChangeVip.value && !willChangeScore.value) {
    showToast('没有可提交的变更')
    return
  }

  if (willChangeScore.value && parsedDelta.value === null) {
    showToast('请输入有效的信用分调整数量')
    return
  }

  const payload = {
    type: 'adjust',
    userId: props.user?.id,
    vip: willChangeVip.value
      ? { from: currentVipLevel.value, to: Number(form.value.vipTargetLevel) }
      : null,
    creditScore: willChangeScore.value
      ? {
          changeType: CREDIT_SCORE_CHANGE_TYPE.MANUAL_ADJUST,
          before: scoreBefore.value,
          delta: scoreDeltaSigned.value,
          after: scoreAfter.value
        }
      : null,
    remark: String(form.value.remark || '').trim()
  }

  emit('submit', payload)
  showToast('已提交调整')
  close()
}
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center justify-center gap-2 h-8 px-3 text-sm font-medium rounded-lg ring-1 ring-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
    @click="open"
  >
    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 16v-2M6 12H4m16 0h-2" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M7.757 7.757L6.343 6.343m11.314 11.314l-1.414-1.414" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M16.243 7.757l1.414-1.414M6.343 17.657l1.414-1.414" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
    调整
  </button>

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
        class="fixed inset-0 z-[60] bg-black/40 grid place-items-center p-4"
        @click.self="close"
      >
        <section class="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <header class="px-5 py-4 bg-white">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="text-xs font-medium tracking-wide text-slate-500">操作</div>
                <div class="mt-1 text-lg font-semibold text-slate-900">手动调整</div>
              </div>
              <button
                type="button"
                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                @click="close"
                aria-label="关闭弹窗"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          <div class="px-5 pb-5 space-y-5">
            <section class="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div class="text-sm font-semibold text-slate-900">VIP 等级调整</div>
              <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div class="rounded-lg bg-white border border-slate-200 px-3 py-2">
                  <div class="text-xs text-slate-500">当前等级</div>
                  <div class="mt-1 text-sm font-semibold text-slate-900">
                    {{ currentVipLevel === 0 ? '普通用户' : `VIP${currentVipLevel}` }}
                  </div>
                </div>
                <div>
                  <div class="text-sm font-medium text-slate-700 mb-2">调整为</div>
                  <select
                    v-model.number="form.vipTargetLevel"
                    class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    <option v-for="o in activeVipOptions" :key="o.level" :value="o.level">
                      {{ o.label }}
                    </option>
                  </select>
                </div>
              </div>
              <div v-if="willChangeVip" class="mt-3 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                将从 {{ currentVipLevel === 0 ? '普通用户' : `VIP${currentVipLevel}` }} 调整为 {{ form.vipTargetLevel === 0 ? '普通用户' : `VIP${form.vipTargetLevel}` }}
              </div>
            </section>

            <section class="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div class="text-sm font-semibold text-slate-900">信用分调整</div>
              <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div class="rounded-lg bg-white border border-slate-200 px-3 py-2">
                  <div class="text-xs text-slate-500">当前信用分</div>
                  <div class="mt-1 text-sm font-semibold text-slate-900">
                    {{ scoreBefore }}
                  </div>
                  <div class="mt-1 text-[11px] text-slate-500">
                    范围：{{ minScore }} ~ {{ maxScore }}
                  </div>
                </div>

                <div>
                  <div class="text-sm font-medium text-slate-700 mb-2">类型</div>
                  <div class="flex items-center gap-2">
                    <label class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm cursor-pointer">
                      <input v-model="form.scoreDirection" type="radio" value="increase" />
                      增加
                    </label>
                    <label class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm cursor-pointer">
                      <input v-model="form.scoreDirection" type="radio" value="decrease" />
                      扣减
                    </label>
                  </div>
                </div>

                <div>
                  <div class="text-sm font-medium text-slate-700 mb-2">数量</div>
                  <input
                    v-model="form.scoreDelta"
                    type="number"
                    min="1"
                    step="1"
                    class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    placeholder="例如 5"
                  />
                </div>
              </div>

              <div class="mt-3 rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm text-slate-700">
                预览：{{ scoreBefore }} {{ scoreDeltaSigned >= 0 ? '+' : '' }}{{ scoreDeltaSigned }} = <span class="font-semibold text-slate-900">{{ scoreAfter }}</span>
              </div>

              <div v-if="auditHint" class="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {{ auditHint }}
              </div>
            </section>

            <div>
              <div class="text-sm font-medium text-slate-700 mb-2">备注（可选）</div>
              <textarea
                v-model="form.remark"
                rows="3"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="请输入本次调整原因/说明…"
              />
            </div>

            <div class="flex justify-end gap-3 pt-1">
              <button
                type="button"
                class="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                @click="close"
              >
                取消
              </button>
              <button
                type="button"
                class="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                @click="confirm"
              >
                确认调整
              </button>
            </div>
          </div>
        </section>
      </div>
    </Transition>

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
  </Teleport>
</template>

