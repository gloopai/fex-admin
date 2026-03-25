<script setup>
import { computed } from 'vue'
import {
  userMeetsVerificationLevel,
  getVerificationLevelLabel,
  getVerificationUpgradeDetailLine
} from '../../utils/verificationAccess'

const props = defineProps({
  /** 用户当前认证等级 */
  userLevel: { type: String, required: true },
  /** 业务要求的最低认证等级 */
  requiredLevel: { type: String, required: true },
  /** 功能名称，用于标题 */
  featureName: { type: String, default: '此功能' },
  /** 「去认证」跳转，默认前台认证流程 */
  verifyHref: { type: String, default: '/front/verification-flow' },
  /** 暗色主题（与前台 /front、/m 默认背景一致） */
  dark: { type: Boolean, default: true }
})

defineEmits(['go-verify'])

const blocked = computed(() => !userMeetsVerificationLevel(props.userLevel, props.requiredLevel))

const requiredLabel = computed(() => getVerificationLevelLabel(props.requiredLevel))

const detailLine = computed(() =>
  getVerificationUpgradeDetailLine(props.userLevel, props.requiredLevel)
)

const boxClass = computed(() =>
  props.dark
    ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-50'
    : 'border-emerald-200 bg-emerald-50 text-emerald-950'
)
</script>

<template>
  <div
    v-if="blocked"
    class="rounded-xl border px-4 py-3 sm:px-5 sm:py-4"
    :class="boxClass"
    role="alert"
  >
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div class="flex gap-3 min-w-0">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-400/35 bg-emerald-400/10 text-lg text-lime-200"
          aria-hidden="true"
        >
          🔒
        </div>
        <div class="min-w-0">
          <p class="text-sm font-semibold leading-snug">
            「{{ featureName }}」需完成「{{ requiredLabel }}」后方可使用
          </p>
          <p
            class="mt-1.5 text-xs leading-relaxed opacity-90"
            :class="dark ? 'text-emerald-100/90' : 'text-emerald-800/90'"
          >
            您当前为「{{ getVerificationLevelLabel(userLevel) }}」。{{ detailLine }}
          </p>
        </div>
      </div>
      <div class="flex shrink-0 flex-wrap gap-2 sm:pt-0.5">
        <a
          :href="verifyHref"
          class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition sm:min-w-[7rem]"
          :class="
            dark
              ? 'bg-lime-400 text-black hover:bg-lime-300'
              : 'bg-lime-600 text-white hover:bg-lime-700'
          "
          @click="$emit('go-verify')"
        >
          去认证
        </a>
      </div>
    </div>
  </div>
</template>
