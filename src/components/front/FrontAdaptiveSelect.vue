<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import FrontStrokeIcon from './FrontStrokeIcon.vue'

/**
 * 窄屏：底部抽屉（与顶栏抽屉 / 验证弹窗同系视觉）；lg+：原生 select。
 */
const props = defineProps({
  label: { type: String, required: true },
  sheetTitle: { type: String, default: '' },
  options: { type: Array, required: true },
  ariaLabel: { type: String, default: '' },
  fieldKey: { type: String, default: '' },
  /**
   * 是否在打开/关闭选项抽屉时锁定 body（嵌套在其它已锁滚动的弹层内时请设为 false）
   */
  manageBodyScroll: { type: Boolean, default: true }
})

const model = defineModel({ type: String, default: '' })

const open = ref(false)

const titleText = computed(() => props.sheetTitle || props.label)

const titleId = computed(
  () => `front-adaptive-select-${props.fieldKey || props.label.replace(/\s+/g, '-')}`
)

const currentLabel = computed(() => {
  const hit = props.options.find((o) => o.value === model.value)
  return hit?.label ?? '请选择'
})

const triggerClass =
  'flex w-full min-h-9 items-center justify-between gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-left text-sm font-medium leading-snug text-[#eaecef] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] [-webkit-tap-highlight-color:transparent] transition active:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e11]'

const desktopSelectClass =
  'mt-1 w-full cursor-pointer appearance-none rounded-lg border border-white/[0.08] bg-white/[0.04] py-1.5 pl-2.5 pr-8 text-sm font-medium text-[#eaecef] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition focus:border-lime-400/45 focus:outline-none focus:ring-1 focus:ring-lime-400/30'

function optionRowClass(selected) {
  return [
    'flex w-full min-h-10 items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left text-sm font-medium leading-snug transition [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/28 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212]',
    selected
      ? 'border-lime-400/35 bg-lime-400/[0.06] text-[#eaecef]'
      : 'border-transparent text-[#eaecef] active:bg-white/[0.06]'
  ]
}

function pick(value) {
  model.value = value
  open.value = false
}

function close() {
  open.value = false
}

watch(open, (v) => {
  if (!props.manageBodyScroll || typeof document === 'undefined') return
  document.body.style.overflow = v ? 'hidden' : ''
})

onUnmounted(() => {
  if (!props.manageBodyScroll || typeof document === 'undefined') return
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="min-w-0">
    <span
      class="block text-[10px] font-medium uppercase tracking-[0.06em] text-[#848e9c]/85 sm:text-[11px] sm:tracking-wide sm:normal-case"
    >
      {{ label }}
    </span>

    <div class="mt-1 lg:hidden">
      <button
        type="button"
        :class="triggerClass"
        :aria-label="ariaLabel || label"
        :aria-expanded="open"
        aria-haspopup="listbox"
        @click="open = true"
      >
        <span class="min-w-0 truncate">{{ currentLabel }}</span>
        <span class="shrink-0 text-[#848e9c]" aria-hidden="true">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m7 10 5 5 5-5"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </button>

      <Teleport to="body">
        <Transition name="front-sheet">
          <div
            v-if="open"
            class="fixed inset-0 z-[135] flex flex-col justify-end lg:hidden"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
          >
            <div
              class="absolute inset-0 bg-black/55 backdrop-blur-[1px]"
              aria-hidden="true"
              @click="close"
            />
            <div
              class="front-sheet-panel relative mx-auto flex w-full max-w-md max-h-[min(72vh,480px)] flex-col rounded-t-2xl border border-white/10 bg-[#121212] text-white shadow-2xl sm:max-w-lg"
              :style="{
                paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
                boxShadow: '0 -8px 40px -12px rgba(0,0,0,0.55)'
              }"
              @click.stop
            >
              <div
                class="shrink-0 pt-3"
                :style="{ paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0px))' }"
              >
                <div
                  class="mx-auto h-1 w-10 rounded-full bg-white/20"
                  aria-hidden="true"
                />
              </div>
              <div
                class="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] px-4 pb-3 pt-2"
              >
                <h2 :id="titleId" class="text-base font-semibold leading-snug tracking-tight text-white">
                  {{ titleText }}
                </h2>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-[#848e9c] transition hover:bg-white/[0.08] hover:text-white"
                  aria-label="关闭"
                  @click="close"
                >
                  <FrontStrokeIcon name="x" size-class="h-4 w-4" />
                </button>
              </div>
              <ul
                class="scrollbar-thin min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain px-2 py-2"
                role="listbox"
              >
                <li v-for="opt in options" :key="opt.value === '' ? '__empty' : opt.value">
                  <button
                    type="button"
                    role="option"
                    :aria-selected="model === opt.value"
                    :class="optionRowClass(model === opt.value)"
                    @click="pick(opt.value)"
                  >
                    {{ opt.label }}
                    <FrontStrokeIcon
                      v-if="model === opt.value"
                      name="check"
                      size-class="h-4 w-4 shrink-0 text-lime-400/90"
                    />
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>

    <div class="relative mt-1 hidden lg:block">
      <select
        v-model="model"
        :class="desktopSelectClass"
        :aria-label="ariaLabel || label"
      >
        <option
          v-for="opt in options"
          :key="opt.value === '' ? '__empty' : opt.value"
          :value="opt.value"
          class="bg-[#141414] text-[#eaecef]"
        >
          {{ opt.label }}
        </option>
      </select>
      <span
        class="pointer-events-none absolute right-2 top-1/2 mt-px -translate-y-1/2 text-[#848e9c]"
        aria-hidden="true"
      >
        <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none">
          <path
            d="m7 10 5 5 5-5"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </div>
  </div>
</template>

<style scoped>
.front-sheet-enter-active,
.front-sheet-leave-active {
  transition: opacity 0.22s ease;
}

.front-sheet-enter-active .front-sheet-panel,
.front-sheet-leave-active .front-sheet-panel {
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
}

.front-sheet-enter-from,
.front-sheet-leave-to {
  opacity: 0;
}

.front-sheet-enter-from .front-sheet-panel,
.front-sheet-leave-to .front-sheet-panel {
  transform: translateY(100%);
}

.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}

@media (prefers-reduced-motion: reduce) {
  .front-sheet-enter-active,
  .front-sheet-leave-active,
  .front-sheet-enter-active .front-sheet-panel,
  .front-sheet-leave-active .front-sheet-panel {
    transition-duration: 0.01ms !important;
  }

  .front-sheet-enter-from .front-sheet-panel,
  .front-sheet-leave-to .front-sheet-panel {
    transform: none !important;
  }
}
</style>
