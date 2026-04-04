<script setup>
import { computed } from 'vue'
import {
  userMeetsVerificationLevel,
  getVerificationLevelLabel,
  getVerificationUpgradeDetailLine
} from '../../utils/verificationAccess'

const props = defineProps({
  userLevel: { type: String, required: true },
  requiredLevel: { type: String, required: true },
  /** 业务功能名称，用于标题 */
  featureName: { type: String, default: '此功能' },
  verifyHref: { type: String, default: '/front/personal-center/verification' },
  dark: { type: Boolean, default: true },
  /**
   * 是否撑满父级剩余区域（列表/Tab 内空状态时常用 min-height）
   */
  fill: { type: Boolean, default: false }
})

defineEmits(['go-verify'])

const blocked = computed(() => !userMeetsVerificationLevel(props.userLevel, props.requiredLevel))

const requiredLabel = computed(() => getVerificationLevelLabel(props.requiredLevel))

const detailLine = computed(() =>
  getVerificationUpgradeDetailLine(props.userLevel, props.requiredLevel)
)

const wrapClass = computed(() => {
  const base = 'flex flex-col items-center justify-center rounded-2xl px-5 text-center'
  const size = props.fill ? 'min-h-[min(70vh,28rem)] py-10 sm:py-14' : 'py-12 sm:py-16'
  return `${base} ${size}`
})

const panelClass = computed(() =>
  props.dark
    ? 'border-emerald-400/25 bg-emerald-400/[0.06] text-emerald-50'
    : 'border-emerald-200 bg-white text-emerald-950 shadow-sm'
)

const iconWrapClass = computed(() =>
  props.dark
    ? 'border border-emerald-400/30 bg-emerald-400/10 text-lime-300'
    : 'border border-emerald-300/60 bg-emerald-100 text-emerald-700'
)
</script>

<template>
  <div v-if="blocked" class="w-full" :class="[wrapClass, panelClass]" role="status">
    <div
      class="flex h-16 w-16 items-center justify-center rounded-2xl sm:h-[4.5rem] sm:w-[4.5rem]"
      :class="iconWrapClass"
      aria-hidden="true"
    >
      <svg class="h-9 w-9 sm:h-10 sm:w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.75"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    </div>

    <h3 class="mt-5 max-w-sm text-base font-semibold leading-snug sm:text-lg">
      「{{ featureName }}」暂不可用
    </h3>
    <p
      class="mt-2 max-w-sm text-sm leading-relaxed"
      :class="dark ? 'text-emerald-100/80' : 'text-emerald-800/85'"
    >
      「{{ featureName }}」需完成「<span
        class="font-medium"
        :class="dark ? 'text-lime-200' : 'text-emerald-700'"
        >{{ requiredLabel }}</span
      >」后方可使用。您当前为「{{ getVerificationLevelLabel(userLevel) }}」。{{ detailLine }}
    </p>

    <a
      :href="verifyHref"
      class="mt-7 inline-flex min-w-[8.5rem] items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold transition"
      :class="
        dark
          ? 'bg-lime-400 text-black hover:bg-lime-300'
          : 'bg-lime-600 text-white hover:bg-lime-700'
      "
      @click="$emit('go-verify')"
    >
      前往身份认证
    </a>
  </div>
</template>
