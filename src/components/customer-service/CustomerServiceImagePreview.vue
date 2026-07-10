<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  src: { type: String, default: '' }
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}

function onKeydown(event) {
  if (props.src && event.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="customer-service-image-preview">
      <div
        v-if="src"
        class="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-4 backdrop-blur-sm sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-label="图片预览"
        @click.self="close"
      >
        <button
          type="button"
          class="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
          aria-label="关闭图片预览"
          @click="close"
        >
          ×
        </button>
        <img :src="src" alt="放大的消息图片" class="max-h-full max-w-full rounded-lg object-contain shadow-2xl" />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.customer-service-image-preview-enter-active,
.customer-service-image-preview-leave-active { transition: opacity 160ms ease; }
.customer-service-image-preview-enter-from,
.customer-service-image-preview-leave-to { opacity: 0; }
</style>
