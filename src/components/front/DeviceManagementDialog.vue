<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import FrontPopupShell from './FrontPopupShell.vue'
import FrontStrokeIcon from './FrontStrokeIcon.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'backdrop-close', 'revoke', 'revoke-all'])

/** 会话列表示例；接入接口后由 props 或请求替换 */
const initialSessions = () => [
  {
    id: 's1',
    label: '本机 · Chrome',
    sub: 'Windows 11 · 北京市',
    lastActive: '当前会话 · 刚刚',
    current: true,
    icon: 'monitor'
  },
  {
    id: 's2',
    label: 'Safari · iPhone',
    sub: 'iOS 18 · 上海市',
    lastActive: '2026-04-03 22:18',
    current: false,
    icon: 'smartphone'
  },
  {
    id: 's3',
    label: 'Chrome · macOS',
    sub: 'macOS · 广东省深圳市',
    lastActive: '2026-03-28 09:42',
    current: false,
    icon: 'monitor'
  }
]

const sessions = ref(initialSessions())
const confirmRevokeId = ref('')
const confirmRevokeAll = ref(false)
const toast = ref('')

watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      nextTick(() => {
        confirmRevokeId.value = ''
        confirmRevokeAll.value = false
        toast.value = ''
        sessions.value = initialSessions()
      })
    }
  }
)

function close() {
  emit('update:modelValue', false)
}

const otherCount = computed(() => sessions.value.filter((s) => !s.current).length)

function requestRevoke(id) {
  confirmRevokeAll.value = false
  confirmRevokeId.value = confirmRevokeId.value === id ? '' : id
}

function confirmRevoke(id) {
  const row = sessions.value.find((s) => s.id === id)
  if (!row || row.current) return
  sessions.value = sessions.value.filter((s) => s.id !== id)
  confirmRevokeId.value = ''
  emit('revoke', id)
  toast.value = '已结束该设备的登录状态'
  window.setTimeout(() => {
    toast.value = ''
  }, 2400)
}

function revokeAllOthers() {
  if (!confirmRevokeAll.value) {
    confirmRevokeId.value = ''
    confirmRevokeAll.value = true
    return
  }
  sessions.value = sessions.value.filter((s) => s.current)
  confirmRevokeAll.value = false
  emit('revoke-all')
  toast.value = '已结束其他全部会话，请在可信设备上重新登录'
  window.setTimeout(() => {
    toast.value = ''
  }, 2800)
}
</script>

<template>
  <FrontPopupShell
    :model-value="modelValue"
    aria-labelledby="device-mgmt-title"
    @update:model-value="emit('update:modelValue', $event)"
    @backdrop-click="emit('backdrop-close')"
  >
    <div
      class="popup-card relative z-[121] flex max-h-[min(92vh,760px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#121212] shadow-2xl sm:max-w-lg"
      @click.stop
    >
      <div class="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <h2 id="device-mgmt-title" class="text-base font-semibold text-white">登录设备管理</h2>
          <p class="mt-0.5 text-xs text-white/45">查看最近登录会话，结束可疑或非本人设备</p>
        </div>
        <button
          type="button"
          class="rounded-lg px-2 py-1.5 text-sm text-white/55 hover:bg-white/10 hover:text-white/85"
          aria-label="关闭"
          @click="close"
        >
          <FrontStrokeIcon name="x" size-class="h-5 w-5" />
        </button>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <p
          v-if="toast"
          class="mb-3 rounded-lg border border-lime-400/25 bg-lime-400/10 px-3 py-2 text-xs text-lime-100/90"
          role="status"
        >
          {{ toast }}
        </p>

        <div class="space-y-2">
          <div
            v-for="row in sessions"
            :key="row.id"
            class="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3"
          >
            <div class="flex gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-sky-300/90"
                aria-hidden="true"
              >
                <FrontStrokeIcon :name="row.icon" size-class="h-5 w-5" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-sm font-medium text-white/92">{{ row.label }}</p>
                  <span
                    v-if="row.current"
                    class="rounded-full border border-lime-400/35 bg-lime-400/10 px-2 py-0.5 text-[10px] font-medium text-lime-200"
                  >
                    本设备
                  </span>
                </div>
                <p class="mt-0.5 text-xs text-white/45">{{ row.sub }}</p>
                <p class="mt-1 text-[11px] text-white/38">{{ row.lastActive }}</p>
              </div>
            </div>

            <template v-if="!row.current">
              <div class="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-white/[0.06] pt-3">
                <template v-if="confirmRevokeId === row.id">
                  <span class="text-xs text-white/50">确认结束该设备会话？</span>
                  <button
                    type="button"
                    class="rounded-lg border border-white/18 px-3 py-1.5 text-xs text-white/75 hover:bg-white/[0.06]"
                    @click="confirmRevokeId = ''"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    class="rounded-lg bg-rose-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500"
                    @click="confirmRevoke(row.id)"
                  >
                    确认结束
                  </button>
                </template>
                <button
                  v-else
                  type="button"
                  class="text-xs font-medium text-sky-300/90 hover:text-sky-200"
                  @click="requestRevoke(row.id)"
                >
                  结束会话
                </button>
              </div>
            </template>
          </div>
        </div>

        <p
          v-if="!sessions.length"
          class="py-8 text-center text-sm text-white/45"
        >
          暂无会话记录
        </p>
      </div>

      <div
        class="shrink-0 border-t border-white/10 px-4 py-4"
      >
        <template v-if="otherCount > 0">
          <template v-if="confirmRevokeAll">
            <p class="mb-2 text-center text-xs text-white/55">将结束除本设备外全部 {{ otherCount }} 个会话，是否继续？</p>
            <div class="flex gap-2">
              <button
                type="button"
                class="flex-1 rounded-lg border border-white/18 py-2.5 text-sm text-white/80 hover:bg-white/[0.06]"
                @click="confirmRevokeAll = false"
              >
                取消
              </button>
              <button
                type="button"
                class="flex-1 rounded-lg bg-rose-500/90 py-2.5 text-sm font-medium text-white hover:bg-rose-500"
                @click="revokeAllOthers"
              >
                确认全部结束
              </button>
            </div>
          </template>
          <button
            v-else
            type="button"
            class="w-full rounded-lg border border-rose-400/35 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-100/95 hover:bg-rose-500/20"
            @click="revokeAllOthers"
          >
            结束其他全部会话（{{ otherCount }}）
          </button>
        </template>
        <p v-else class="text-center text-xs text-white/40">
          仅检测到当前设备，无其他在线会话
        </p>
        <p class="mt-3 text-center text-[11px] leading-relaxed text-white/35">
          结束后对应设备需重新验证身份才能访问账户
        </p>
      </div>
    </div>
  </FrontPopupShell>
</template>
