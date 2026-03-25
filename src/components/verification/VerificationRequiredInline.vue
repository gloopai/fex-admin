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
  featureName: { type: String, default: '此操作' },
  verifyHref: { type: String, default: '/front/verification-flow' },
  dark: { type: Boolean, default: true }
})

defineEmits(['go-verify'])

const blocked = computed(() => !userMeetsVerificationLevel(props.userLevel, props.requiredLevel))

const requiredLabel = computed(() => getVerificationLevelLabel(props.requiredLevel))

const detailLine = computed(() =>
  getVerificationUpgradeDetailLine(props.userLevel, props.requiredLevel)
)

const barClass = computed(() =>
  props.dark
    ? 'border border-emerald-400/25 border-l-4 border-l-lime-400 bg-emerald-400/10 text-emerald-50'
    : 'border border-emerald-200 border-l-4 border-l-emerald-500 bg-emerald-50 text-emerald-900'
)
</script>

<template>
  <div
    v-if="blocked"
    class="flex items-start gap-3 rounded-lg py-3 pl-3 pr-3 sm:pl-4"
    :class="barClass"
    role="status"
  >
    <span class="text-base leading-none text-lime-300/90" aria-hidden="true">🔒</span>
    <div class="min-w-0 flex-1 text-xs leading-relaxed sm:text-sm">
      <p>
        <span class="font-medium">「{{ featureName }}」</span>需完成「<span
          class="font-semibold"
          :class="dark ? 'text-lime-200' : 'text-emerald-800'"
          >{{ requiredLabel }}</span
        >」后方可继续。
      </p>
      <p
        class="mt-1 text-[11px] leading-relaxed sm:text-xs"
        :class="dark ? 'text-emerald-100/80' : 'text-emerald-800/75'"
      >
        您当前为「{{ getVerificationLevelLabel(userLevel) }}」。{{ detailLine }}
      </p>
    </div>
    <a
      :href="verifyHref"
      class="shrink-0 text-xs font-semibold underline underline-offset-2 sm:text-sm"
      :class="dark ? 'text-lime-300 hover:text-lime-200' : 'text-emerald-700 hover:text-emerald-900'"
      @click="$emit('go-verify')"
    >
      去认证
    </a>
  </div>
</template>
