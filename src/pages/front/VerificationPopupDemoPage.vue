<script setup>
import { computed, ref } from 'vue'

/**
 * 弹窗演示页面：当前仅包含「提币数量不符合范围」校验提示
 * 后续可继续扩展更多弹窗类型，保持与权限提示页面解耦
 */
const popupDemoType = ref('withdraw_invalid_amount')

// 示例：提币数量允许范围（包含边界）
const withdrawAmountMin = 10
const withdrawAmountMax = 1000

const amountPopupOpen = ref(false)
const amountActionLog = ref('')

const withdrawAmountDialogTitle = computed(() => '提币数量不在允许范围内')

const withdrawAmountDialogMessage = computed(() => {
  return `本次提币数量不符合要求，允许范围为 ${withdrawAmountMin} ~ ${withdrawAmountMax}（包含最小与最大值）。请调整后重试。`
})

function openWithdrawInvalidAmountDialog() {
  amountActionLog.value = ''
  amountPopupOpen.value = true
}

function confirmWithdrawAction() {
  amountPopupOpen.value = false
  amountActionLog.value = '已继续提币（演示：这里可跳转到提币页面或触发下一步流程）。'
}

function cancelWithdrawAction() {
  amountPopupOpen.value = false
  amountActionLog.value = '已返回修改（演示）。'
}
</script>

<template>
  <div class="mx-auto min-h-screen w-full max-w-md px-4 py-8 pb-24 text-white md:max-w-3xl md:px-6">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-white">弹窗演示</h1>
      <p class="mt-2 text-sm text-white/60">
        当前展示：提币数量校验失败时的提示弹窗。
      </p>
    </header>

    <section class="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <label class="block text-xs text-white/60">
        选择弹窗类型
        <select
          v-model="popupDemoType"
          class="mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
        >
          <option value="withdraw_invalid_amount">提币：数量不符合范围</option>
        </select>
      </label>

      <div v-if="popupDemoType === 'withdraw_invalid_amount'" class="mt-4 space-y-3">
        <p class="text-xs text-white/60 leading-relaxed">
          当前弹窗为「提币数量不在允许范围」示例。允许范围为
          <span class="text-lime-200/90 font-medium">{{ withdrawAmountMin }} ~ {{ withdrawAmountMax }}</span>
          （包含最小与最大值）。点击下方按钮直接展示弹窗。
        </p>

        <button
          type="button"
          class="w-full rounded-lg bg-lime-400 px-5 py-3 text-sm font-semibold text-black hover:bg-lime-300"
          @click="openWithdrawInvalidAmountDialog"
        >
          展示弹窗提示
        </button>

        <p v-if="amountActionLog" class="text-xs text-white/55">
          {{ amountActionLog }}
        </p>
      </div>
    </section>
  </div>

  <!-- 提币数量不合法弹窗 -->
  <Teleport to="body">
    <div
      v-if="amountPopupOpen"
      class="fixed inset-0 z-[120] flex items-end justify-center px-4 pb-4 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="absolute inset-0 bg-black/60 backdrop-blur-[2px]" @click="cancelWithdrawAction" />

      <div
        class="relative z-[121] w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#121212] px-4 pb-6 pt-5 text-white shadow-2xl"
        @click.stop
      >
        <div class="flex items-start gap-3">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/15 text-xl text-lime-200"
          >
            !
          </div>

          <div class="min-w-0 flex-1">
            <h3 class="text-lg font-semibold leading-snug">
              {{ withdrawAmountDialogTitle }}
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-emerald-100/85">
              {{ withdrawAmountDialogMessage }}
            </p>
          </div>
        </div>

        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
            @click="cancelWithdrawAction"
          >
            返回修改
          </button>
          <button
            type="button"
            class="rounded-lg bg-lime-400 px-4 py-2.5 text-sm font-semibold text-black hover:bg-lime-300"
            @click="confirmWithdrawAction"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

