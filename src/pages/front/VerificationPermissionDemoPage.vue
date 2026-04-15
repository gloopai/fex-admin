<script setup>
/**
 * 账户权限说明页：横幅、内联条、空状态、弹窗等形态。
 * 与后台「认证权限配置」中的权限项对应；支持切换当前等级与目标等级以查看文案。
 * /front/verification-permission-demo
 */
import { ref, computed, watch } from 'vue'
import { VERIFICATION_LEVEL } from '../../constants/verification'
import { verificationConfig } from '../../admin/mock/verification'
import {
  VERIFICATION_PERMISSION_KEYS,
  VERIFICATION_PERMISSION_ADMIN_LABEL,
  getVerificationModulePromptBundle
} from '../../utils/verificationPermissionModules'
import { getVerificationLevelLabel } from '../../utils/verificationAccess'
import VerificationRequiredBanner from '../../components/verification/VerificationRequiredBanner.vue'
import VerificationRequiredInline from '../../components/verification/VerificationRequiredInline.vue'
import VerificationRequiredDialog from '../../components/verification/VerificationRequiredDialog.vue'
import VerificationRequiredEmpty from '../../components/verification/VerificationRequiredEmpty.vue'
import PolicyBlockedEmpty from '../../components/verification/PolicyBlockedEmpty.vue'
import FrontStrokeIcon from '../../components/front/FrontStrokeIcon.vue'

const verifyHref = '/front/personal-center/verification'

/** 下拉框专用：与真实权限 key 区分，表示「已完成认证但后台关闭提币」策略弹窗演示 */
const DEMO_POLICY_WITHDRAW_KEY = 'demoPolicyWithdrawDisabled'

/** 模拟当前用户认证等级 */
const simulatedUserLevel = ref(VERIFICATION_LEVEL.NONE)

/** 模拟目标认证等级（业务要求的最低等级），传入各 VerificationRequired* 的 requiredLevel */
const simulatedTargetLevel = ref(VERIFICATION_LEVEL.ADVANCED)

/** 与后台配置表同一套权限项（canDeposit / canWithdraw / …） */
const selectedPermissionKey = ref('canPerpetualContract')

const moduleBundle = computed(() => {
  if (selectedPermissionKey.value === DEMO_POLICY_WITHDRAW_KEY) {
    const b = getVerificationModulePromptBundle(verificationConfig, 'canWithdraw')
    return {
      ...b,
      isPolicyWithdrawDemo: true,
      adminLabel: '允许提币（策略关闭 · 演示）'
    }
  }
  return {
    ...getVerificationModulePromptBundle(verificationConfig, selectedPermissionKey.value),
    isPolicyWithdrawDemo: false
  }
})

/** 配置推导的最低等级（随模块变化，可与模拟目标对照） */
const configDerivedLevel = computed(() => moduleBundle.value.requiredLevel)

const configDerivedLevelLabel = computed(() => getVerificationLevelLabel(configDerivedLevel.value))

const targetLevelLabel = computed(() => getVerificationLevelLabel(simulatedTargetLevel.value))

/**
 * 配置推导为「未认证即可」时，若仍把目标设为未认证，则 userLevel 恒满足、弹窗会被 onlyWhenBlocked 立即关掉。
 * 此页在推导为未认证时自动将目标提升到「初级认证」，以便预览需认证场景下的提示（可再改回「未认证」）。
 */
function effectiveTargetFromConfig(level) {
  return level === VERIFICATION_LEVEL.NONE ? VERIFICATION_LEVEL.BASIC : level
}

/** 切换业务模块时，将目标等级同步为配置推导值（未认证即可时按上条规则处理） */
watch(
  configDerivedLevel,
  (level) => {
    simulatedTargetLevel.value = effectiveTargetFromConfig(level)
  },
  { immediate: true }
)

function syncTargetToConfig() {
  simulatedTargetLevel.value = effectiveTargetFromConfig(configDerivedLevel.value)
}

const permissionOptions = computed(() => [
  ...VERIFICATION_PERMISSION_KEYS.map((key) => ({
    value: key,
    label: VERIFICATION_PERMISSION_ADMIN_LABEL[key]
  })),
  { value: DEMO_POLICY_WITHDRAW_KEY, label: '演示：高级认证但后台关闭提币' }
])

const showDialog = ref(false)
const showPolicyWithdrawDialog = ref(false)

function closePolicyWithdrawDialog() {
  showPolicyWithdrawDialog.value = false
}

const levelOptions = [
  { value: VERIFICATION_LEVEL.NONE, label: '未认证' },
  { value: VERIFICATION_LEVEL.BASIC, label: '初级认证' },
  { value: VERIFICATION_LEVEL.ADVANCED, label: '高级认证' }
]

</script>

<template>
  <div
    class="mx-auto min-h-screen w-full max-w-md px-4 py-8 pb-24 text-white md:max-w-3xl md:px-6"
  >
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-white">账户权限</h1>
      <p class="mt-2 text-sm text-white/60">
        与后台「认证权限配置」一致。可选择<strong class="font-medium text-white/80">当前用户等级</strong>与<strong class="font-medium text-white/80">目标认证等级</strong>（业务要求），查看各场景下的提示文案。
      </p>
      <p class="mt-1 text-xs text-white/45">
        去认证跳转：{{ verifyHref }}
      </p>
    </header>

    <section class="mb-6 rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h2 class="text-sm font-semibold text-white/90">模拟数据</h2>
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <label class="block text-xs text-white/60">
          当前用户认证等级
          <select
            v-model="simulatedUserLevel"
            class="mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
          >
            <option v-for="o in levelOptions" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
        </label>
        <label class="block text-xs text-white/60">
          模拟业务模块（与认证权限配置一致）
          <select
            v-model="selectedPermissionKey"
            class="mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
          >
            <option v-for="o in permissionOptions" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
        </label>
      </div>
      <div class="mt-4">
        <label class="block text-xs text-white/60">
          模拟目标认证等级（业务要求的最低等级）
          <select
            v-model="simulatedTargetLevel"
            class="mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white sm:max-w-md"
          >
            <option v-for="o in levelOptions" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
        </label>
        <button
          type="button"
          class="mt-2 text-xs font-medium text-lime-300/90 underline decoration-lime-300/40 underline-offset-2 hover:text-lime-200"
          @click="syncTargetToConfig"
        >
          与当前模块的配置推导等级一致（{{ configDerivedLevelLabel }}）
        </button>
      </div>
      <div class="mt-4 rounded-lg border border-white/10 bg-black/25 px-3 py-2.5 text-xs leading-relaxed text-white/70">
        <p>
          <span class="text-white/50">配置项：</span>{{ moduleBundle.adminLabel }}
        </p>
        <p class="mt-1">
          <span class="text-white/50">配置推导最低等级：</span>
          <span class="font-medium text-white/85">{{ configDerivedLevelLabel }}</span>
        </p>
        <p class="mt-1">
          <span class="text-white/50">当前模拟目标等级：</span>
          <span class="font-medium text-lime-200/90">{{ targetLevelLabel }}</span>
          <span v-if="simulatedTargetLevel !== configDerivedLevel" class="text-white/45">（已与配置不一致，用于任意组合模拟）</span>
        </p>
        <p class="mt-1 text-white/55">
          {{ moduleBundle.contextHint }}
        </p>
        <p
          v-if="moduleBundle.isPolicyWithdrawDemo"
          class="mt-2 border-t border-white/10 pt-2 text-amber-200/90"
        >
          当前为<strong class="font-medium text-amber-100/95">策略限制演示</strong>：认证等级已够，但后台关闭「允许提币」。第 3 节空状态为
          <code class="rounded bg-white/10 px-1 py-0.5 text-amber-200/90">PolicyBlockedEmpty</code>；第 5 节为同名策略弹窗（非「去认证」类拦截）。
        </p>
        <p
          v-if="simulatedTargetLevel === VERIFICATION_LEVEL.NONE"
          class="mt-2 border-t border-white/10 pt-2 text-amber-200/90"
        >
          目标等级为「未认证」时，判定为无额外门槛，弹窗与拦截类组件均不展示。
        </p>
        <p
          v-else-if="moduleBundle.alwaysOpen"
          class="mt-2 border-t border-white/10 pt-2 text-amber-200/90"
        >
          配置为未认证即可使用本权限；当前页面默认将目标设为「初级认证」以便查看弹窗与拦截。若改回「未认证」，将无拦截。
        </p>
      </div>
    </section>

    <!-- 1. 页内横幅 -->
    <section class="mb-10">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
        1. 页内横幅（嵌入内容区顶部）
      </h2>
      <VerificationRequiredBanner
        :user-level="simulatedUserLevel"
        :required-level="simulatedTargetLevel"
        :feature-name="moduleBundle.bannerFeature"
        :verify-href="verifyHref"
        :dark="true"
      />
      <p class="mt-3 text-xs text-white/45">
        满足等级时整块不渲染。场景：{{ moduleBundle.contextHint }}。
      </p>
    </section>

    <!-- 2. 内联条 -->
    <section class="mb-10">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
        2. 内联提示条（表单旁、按钮上方）
      </h2>
      <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p class="mb-3 text-sm text-white/70">示例：{{ moduleBundle.contextHint }}</p>
        <VerificationRequiredInline
          :user-level="simulatedUserLevel"
          :required-level="simulatedTargetLevel"
          :feature-name="moduleBundle.inlineFeature"
          :verify-href="verifyHref"
          :dark="true"
        />
        <div class="mt-4 grid gap-2 opacity-40">
          <div class="h-10 rounded-lg bg-white/10" />
          <div class="h-10 rounded-lg bg-white/10" />
        </div>
      </div>
    </section>

    <!-- 3. 空状态（整页或列表占位） -->
    <section class="mb-10">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
        3. 空状态（居中占位）
      </h2>
      <p class="mb-3 text-xs text-white/50">
        <span v-if="moduleBundle.isPolicyWithdrawDemo">
          当前为<strong class="text-amber-200/90">策略限制 · 提币</strong>：展示
          <code class="rounded bg-white/10 px-1 py-0.5 text-[11px] text-amber-200/90">PolicyBlockedEmpty</code>（琥珀色，无「去认证」）。
        </span>
        <span v-else>
          认证不足时展示
          <code class="rounded bg-white/10 px-1 py-0.5 text-[11px] text-lime-200/90">VerificationRequiredEmpty</code>（翠绿）。
        </span>
        在上方 select 选择「演示：高级认证但后台关闭提币」可切换为策略空状态。
      </p>

      <PolicyBlockedEmpty v-if="moduleBundle.isPolicyWithdrawDemo" :dark="true" />
      <VerificationRequiredEmpty
        v-else
        :user-level="simulatedUserLevel"
        :required-level="simulatedTargetLevel"
        :feature-name="moduleBundle.emptyFeature"
        :verify-href="verifyHref"
        :dark="true"
      />
      <p class="mt-3 text-xs text-white/45">
        认证类空状态：满足等级时不渲染。策略类空状态：在业务判断为「策略关闭提币」时展示，与认证是否完成无关。
      </p>
      <div class="mt-6 rounded-xl border border-dashed border-white/20 bg-black/20 p-2">
        <p class="mb-2 px-2 pt-1 text-[11px] text-white/40">fill 示例（模拟「{{ moduleBundle.emptyListDemoTitle }}」列表区域）</p>
        <PolicyBlockedEmpty v-if="moduleBundle.isPolicyWithdrawDemo" :dark="true" fill />
        <VerificationRequiredEmpty
          v-else
          :user-level="simulatedUserLevel"
          :required-level="simulatedTargetLevel"
          :feature-name="moduleBundle.emptyListDemoTitle"
          :verify-href="verifyHref"
          :dark="true"
          fill
        />
      </div>
    </section>

    <!-- 4. 弹窗 / 移动端底部抽屉 -->
    <section class="mb-6">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
        4. 弹窗（PC 居中 / 移动端底部抽屉）
      </h2>
      <button
        type="button"
        class="rounded-lg border border-lime-300/40 bg-lime-300/15 px-4 py-2 text-sm font-medium text-lime-200 hover:bg-lime-300/25"
        @click="showDialog = true"
      >
        打开权限提示
      </button>
      <p class="mt-3 text-xs text-white/45">
        适用于用户点击「下单」「提币」等按钮时拦截；当前模块：{{ moduleBundle.dialogFeature }}。当
        <code class="rounded bg-white/10 px-1 py-0.5 text-[11px] text-lime-200/90">only-when-blocked</code>
        设为 false：当前等级与目标一致时弹窗展示「认证已满足」；未满足时仍为升级提示。生产拦截场景可保持默认 true。
      </p>
    </section>

    <!-- 5. 与认证等级无关：后台关闭「允许提币」（弹窗，与第 4 节同形态） -->
    <section class="mb-10">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
        5. 弹窗：已完成高级认证，但后台不允许提币
      </h2>
      <p class="mb-4 text-xs leading-relaxed text-white/55">
        与「未满足认证等级」不同：用户可能已是<strong class="font-medium text-white/75">高级认证</strong>，但后台关闭了<strong class="font-medium text-amber-200/90">允许提币</strong>。请在上方「模拟业务模块」选择<strong class="text-white/80">「演示：高级认证但后台关闭提币」</strong>后，点击下方按钮预览弹窗（无「去认证」引导）。
      </p>

      <button
        type="button"
        class="rounded-lg border border-amber-400/45 bg-amber-400/15 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-400/25 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="!moduleBundle.isPolicyWithdrawDemo"
        @click="showPolicyWithdrawDialog = true"
      >
        打开提币策略提示
      </button>
      <p v-if="!moduleBundle.isPolicyWithdrawDemo" class="mt-2 text-xs text-white/40">
        请先在上文 select 中选择「演示：高级认证但后台关闭提币」。
      </p>
      <p v-else class="mt-2 text-xs text-white/45">
        模拟用户点击「提币」被策略拦截；布局与第 4 节 <code class="rounded bg-white/10 px-1 py-0.5 text-[11px] text-lime-200/90">VerificationRequiredDialog</code> 一致（PC 居中 / 移动端底部抽屉）。
      </p>
    </section>

    <Teleport to="body">
      <Transition name="policy-wd-dlg">
        <div
          v-if="showPolicyWithdrawDialog"
          class="fixed inset-0 z-[100] flex min-h-[100dvh] w-screen max-w-[100vw] items-end justify-center px-4 pb-4 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="policy-wd-dialog-title"
        >
          <div
            class="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            aria-hidden="true"
            @click="closePolicyWithdrawDialog"
          />
          <div
            class="relative z-[101] w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl border border-amber-400/25 bg-[#121212] px-4 pb-6 pt-5 text-white shadow-2xl sm:rounded-2xl sm:p-6 sm:px-6"
            @click.stop
          >
            <div class="mx-auto mb-4 hidden h-1 w-10 rounded-full bg-white/20 sm:hidden" aria-hidden="true" />

            <div class="flex items-start justify-between gap-3">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/35 bg-amber-500/15 text-amber-200"
                aria-hidden="true"
              >
                <FrontStrokeIcon name="shield" size-class="h-5 w-5" />
              </div>
              <button
                type="button"
                class="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
                aria-label="关闭"
                @click="closePolicyWithdrawDialog"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <h2 id="policy-wd-dialog-title" class="mt-2 text-lg font-semibold leading-snug text-amber-50">
              暂无法提币
            </h2>
            <p class="mt-2 text-sm leading-relaxed text-amber-100/85">
              您已完成高级身份认证，但当前账户根据平台策略暂不可发起提币。如有疑问请联系客服或等待审核结果。
            </p>
            <p
              v-if="simulatedUserLevel === VERIFICATION_LEVEL.ADVANCED"
              class="mt-2 text-xs text-white/50"
            >
              当前模拟等级为「高级认证」，与此场景一致。
            </p>

            <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                class="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
                @click="closePolicyWithdrawDialog"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <VerificationRequiredDialog
      v-model="showDialog"
      :user-level="simulatedUserLevel"
      :required-level="simulatedTargetLevel"
      :feature-name="moduleBundle.dialogFeature"
      :verify-href="verifyHref"
      :only-when-blocked="false"
    />

</div>
</template>

<style scoped>
.policy-wd-dlg-enter-active,
.policy-wd-dlg-leave-active {
  transition: opacity 0.2s ease;
}
.policy-wd-dlg-enter-active .relative,
.policy-wd-dlg-leave-active .relative {
  transition: transform 0.25s ease, opacity 0.2s ease;
}
.policy-wd-dlg-enter-from,
.policy-wd-dlg-leave-to {
  opacity: 0;
}
.policy-wd-dlg-enter-from .relative,
.policy-wd-dlg-leave-to .relative {
  transform: translateY(12px);
}
@media (min-width: 640px) {
  .policy-wd-dlg-enter-from .relative,
  .policy-wd-dlg-leave-to .relative {
    transform: scale(0.96);
  }
}
</style>
