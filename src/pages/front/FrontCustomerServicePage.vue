<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  createCustomerMessage,
  DEMO_REPLY_TEXT,
  WELCOME_MESSAGE_TEXT
} from '../../features/customer-service/customerService.js'

const router = useRouter()
const listRef = ref(null)
const fileInputRef = ref(null)
const draft = ref('')
const pendingImageUrl = ref('')
const pendingImageName = ref('')
const replying = ref(false)
const objectUrls = new Set()
const replyTimers = new Set()
let nextMessageId = 2

const messages = ref([
  createCustomerMessage({
    id: 1,
    sender: 'agent',
    text: WELCOME_MESSAGE_TEXT
  })
])

const canSend = computed(
  () => !replying.value && Boolean(draft.value.trim() || pendingImageUrl.value)
)

async function scrollToLatest() {
  await nextTick()
  if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight
}

function goBack() {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
    return
  }
  router.push('/front/home')
}

function openImagePicker() {
  fileInputRef.value?.click()
}

function onImageSelected(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file || !file.type.startsWith('image/')) return

  if (pendingImageUrl.value) {
    URL.revokeObjectURL(pendingImageUrl.value)
    objectUrls.delete(pendingImageUrl.value)
  }
  const url = URL.createObjectURL(file)
  objectUrls.add(url)
  pendingImageUrl.value = url
  pendingImageName.value = file.name
}

function clearPendingImage() {
  if (pendingImageUrl.value) {
    URL.revokeObjectURL(pendingImageUrl.value)
    objectUrls.delete(pendingImageUrl.value)
  }
  pendingImageUrl.value = ''
  pendingImageName.value = ''
}

function scheduleDemoReply() {
  replying.value = true
  const timer = window.setTimeout(async () => {
    replyTimers.delete(timer)
    messages.value.push(
      createCustomerMessage({
        id: nextMessageId++,
        sender: 'agent',
        text: DEMO_REPLY_TEXT
      })
    )
    replying.value = false
    await scrollToLatest()
  }, 850)
  replyTimers.add(timer)
}

async function sendMessage() {
  if (replying.value) return
  const message = createCustomerMessage({
    id: nextMessageId++,
    sender: 'user',
    text: draft.value,
    imageUrl: pendingImageUrl.value
  })
  if (!message) return

  messages.value.push(message)
  draft.value = ''
  pendingImageUrl.value = ''
  pendingImageName.value = ''
  await scrollToLatest()
  scheduleDemoReply()
}

function onComposerKeydown(event) {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return
  event.preventDefault()
  sendMessage()
}

onMounted(scrollToLatest)

onUnmounted(() => {
  for (const timer of replyTimers) window.clearTimeout(timer)
  for (const url of objectUrls) URL.revokeObjectURL(url)
  replyTimers.clear()
  objectUrls.clear()
})
</script>

<template>
  <main class="customer-service-page bg-[#f5f6f8] text-[#161a1e] lg:bg-[#050505] lg:px-6 lg:py-8 lg:text-white">
    <section class="mx-auto flex h-full min-h-0 w-full flex-col overflow-hidden bg-white lg:max-w-4xl lg:rounded-2xl lg:border lg:border-white/[0.08] lg:bg-[#0b0e11] lg:shadow-2xl lg:shadow-black/40">
      <header class="relative flex h-14 shrink-0 items-center justify-center border-b border-black/[0.06] bg-black px-4 text-white lg:h-16 lg:border-white/[0.08] lg:bg-[#11151a]">
        <button
          type="button"
          class="absolute left-3 grid h-10 w-10 place-items-center rounded-full text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          aria-label="返回"
          @click="goBack"
        >
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div class="text-center">
          <h1 class="text-lg font-semibold tracking-wide">客服</h1>
          <p class="mt-0.5 hidden text-[11px] text-white/45 lg:block">在线服务 · 演示会话</p>
        </div>
      </header>

      <div ref="listRef" class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 lg:bg-[#0d1116] lg:px-8 lg:py-7" aria-live="polite">
        <div class="space-y-4">
          <article v-for="message in messages" :key="message.id" class="flex" :class="message.sender === 'user' ? 'justify-end' : 'justify-start'">
            <div
              class="max-w-[82%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm sm:max-w-[70%]"
              :class="message.sender === 'user' ? 'rounded-br-md bg-[#1597e5] text-white lg:bg-sky-500' : 'rounded-bl-md bg-[#f0f1f3] text-[#161a1e] lg:bg-white/[0.08] lg:text-white/90'"
            >
              <img v-if="message.imageUrl" :src="message.imageUrl" alt="用户发送的图片" class="mb-2 max-h-64 w-auto max-w-full rounded-xl object-contain" />
              <p v-if="message.text" class="whitespace-pre-wrap break-words">{{ message.text }}</p>
            </div>
          </article>

          <div v-if="replying" class="flex justify-start" aria-label="客服正在输入">
            <div class="flex items-center gap-1 rounded-2xl rounded-bl-md bg-[#f0f1f3] px-4 py-3 lg:bg-white/[0.08]">
              <span v-for="dot in 3" :key="dot" class="h-1.5 w-1.5 animate-pulse rounded-full bg-black/35 lg:bg-white/45" :style="{ animationDelay: `${dot * 120}ms` }" />
            </div>
          </div>
        </div>
      </div>

      <footer class="shrink-0 border-t border-black/[0.08] bg-white px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-3 sm:px-5 lg:border-white/[0.08] lg:bg-[#11151a] lg:pb-4 lg:pt-4">
        <div v-if="pendingImageUrl" class="mb-3 flex items-center gap-3 rounded-xl bg-black/[0.04] p-2 lg:bg-white/[0.05]">
          <img :src="pendingImageUrl" alt="待发送图片" class="h-12 w-12 rounded-lg object-cover" />
          <span class="min-w-0 flex-1 truncate text-xs text-black/55 lg:text-white/55">{{ pendingImageName }}</span>
          <button type="button" class="grid h-8 w-8 place-items-center rounded-full text-black/45 hover:bg-black/5 lg:text-white/50 lg:hover:bg-white/10" aria-label="移除图片" @click="clearPendingImage">×</button>
        </div>

        <div class="flex items-end gap-2.5">
          <div class="flex min-w-0 flex-1 items-end rounded-[1.65rem] border border-black/20 bg-white px-4 py-1.5 focus-within:border-sky-400 lg:border-white/15 lg:bg-black/20">
            <textarea
              v-model="draft"
              rows="1"
              class="max-h-28 min-h-10 min-w-0 flex-1 resize-none bg-transparent py-2 text-[15px] leading-6 text-black outline-none placeholder:text-black/40 lg:text-white lg:placeholder:text-white/35"
              placeholder="请输入"
              aria-label="输入客服消息"
              @keydown="onComposerKeydown"
            />
            <button type="button" class="mb-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#1597e5] text-white transition disabled:cursor-not-allowed disabled:opacity-35" :disabled="!canSend" aria-label="发送消息" @click="sendMessage">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 19V5M6.5 10.5 12 5l5.5 5.5" />
              </svg>
            </button>
          </div>

          <button type="button" class="mb-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-[#1597e5] transition hover:bg-sky-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 lg:hover:bg-white/[0.06]" aria-label="选择图片" @click="openImagePicker">
            <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m20.5 11.5-8.9 8.9a5 5 0 0 1-7.1-7.1l9.6-9.6a3.5 3.5 0 0 1 5 5l-9.7 9.7a2 2 0 0 1-2.8-2.8l8.9-8.9" />
            </svg>
          </button>
          <input ref="fileInputRef" type="file" accept="image/*" class="sr-only" @change="onImageSelected" />
        </div>
        <p class="mt-2 hidden text-center text-[11px] text-white/30 lg:block">Enter 发送 · Shift + Enter 换行 · 图片仅本地预览</p>
      </footer>
    </section>
  </main>
</template>

<style scoped>
.customer-service-page {
  height: 100dvh;
  min-height: 32rem;
}

@media (min-width: 1024px) {
  .customer-service-page {
    height: 100vh;
    min-height: 38rem;
  }
}
</style>
