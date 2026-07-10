<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  CUSTOMER_SERVICE_STATUS,
  filterCustomerServiceConversations,
  summarizeCustomerServiceConversations
} from '../../../features/customer-service/customerService.js'
import { customerServiceRepository } from '../../../features/customer-service/customerServiceRepository.js'

const snapshot = ref(customerServiceRepository.getSnapshot())
const selectedId = ref('')
const query = ref('')
const draft = ref('')
const noteDraft = ref('')
const errorMessage = ref('')
const listOpen = ref(false)
const profileOpen = ref(false)
const messageListRef = ref(null)
let unsubscribe = null

const quickReplies = [
  '您好，已收到您的问题，我来帮您处理。',
  '请稍等，我正在为您查询。',
  '感谢您的耐心等待，问题已经处理完成。'
]

const conversations = computed(() =>
  filterCustomerServiceConversations(snapshot.value.conversations, { query: query.value })
)
const summary = computed(() => summarizeCustomerServiceConversations(snapshot.value.conversations))
const selected = computed(() =>
  snapshot.value.conversations.find((item) => item.id === selectedId.value) || null
)
const isClosed = computed(() => selected.value?.status === CUSTOMER_SERVICE_STATUS.CLOSED)
const canReply = computed(() => Boolean(selected.value && !isClosed.value && draft.value.trim()))

const statusMeta = {
  waiting: { label: '待回复', class: 'bg-amber-50 text-amber-700 ring-amber-200' },
  active: { label: '处理中', class: 'bg-blue-50 text-blue-700 ring-blue-200' },
  'waiting-user': { label: '待用户', class: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  closed: { label: '已结束', class: 'bg-slate-100 text-slate-500 ring-slate-200' }
}

function statusFor(status) {
  return statusMeta[status] || statusMeta.waiting
}

function formatTime(value) {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function lastPreview(conversation) {
  const message = conversation.messages.at(-1)
  if (!message) return '暂无消息'
  return message.text || (message.imageDataUrl ? '[图片]' : '暂无消息')
}

async function scrollToLatest() {
  await nextTick()
  if (messageListRef.value) messageListRef.value.scrollTop = messageListRef.value.scrollHeight
}

function selectConversation(conversation) {
  selectedId.value = conversation.id
  noteDraft.value = conversation.internalNote || ''
  listOpen.value = false
  if (conversation.adminUnread) {
    customerServiceRepository.markRead({ conversationId: conversation.id, reader: 'admin' })
  }
  scrollToLatest()
}

function useQuickReply(text) {
  draft.value = text
}

function sendReply() {
  if (!canReply.value) return
  errorMessage.value = ''
  try {
    customerServiceRepository.sendAgentMessage({
      conversationId: selected.value.id,
      text: draft.value
    })
    draft.value = ''
    scrollToLatest()
  } catch (error) {
    errorMessage.value = `回复失败：${error?.message || '未知错误'}`
  }
}

function onReplyKeydown(event) {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return
  event.preventDefault()
  sendReply()
}

function endConversation() {
  if (!selected.value || isClosed.value) return
  if (!window.confirm('确定结束当前客服会话吗？')) return
  customerServiceRepository.close({ conversationId: selected.value.id })
}

function saveNote() {
  if (!selected.value) return
  customerServiceRepository.saveNote({
    conversationId: selected.value.id,
    note: noteDraft.value
  })
}

watch(selected, (conversation) => {
  if (!conversation) return
  noteDraft.value = conversation.internalNote || ''
  scrollToLatest()
})

onMounted(() => {
  if (!customerServiceRepository.getSnapshot().conversations.length) {
    customerServiceRepository.seedDemoData()
  }
  unsubscribe = customerServiceRepository.subscribe((next) => {
    snapshot.value = next
    if (!selectedId.value || !next.conversations.some((item) => item.id === selectedId.value)) {
      selectedId.value = filterCustomerServiceConversations(next.conversations, {})[0]?.id || ''
    }
  })
})

onUnmounted(() => unsubscribe?.())
</script>

<template>
  <section class="flex h-[calc(100vh-7rem)] min-h-0 flex-col gap-4">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-slate-900">客服操作面板</h1>
        <p class="mt-1 text-sm text-slate-500">前后台本地联动演示 · 当前 {{ summary.all }} 个会话</p>
      </div>
      <div class="flex items-center gap-2">
        <button type="button" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 lg:hidden" @click="listOpen = true">会话列表</button>
        <button type="button" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 xl:hidden" :disabled="!selected" @click="profileOpen = true">用户信息</button>
      </div>
    </header>

    <p v-if="errorMessage" class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{{ errorMessage }}</p>

    <div class="grid min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_280px]">
      <aside
        class="fixed inset-y-0 left-0 z-50 flex w-[min(86vw,320px)] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform lg:static lg:z-auto lg:w-auto lg:translate-x-0 lg:shadow-none"
        :class="listOpen ? 'translate-x-0' : '-translate-x-full'"
        aria-label="客服会话列表"
      >
        <div class="border-b border-slate-200 p-4">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-slate-900">会话</h2>
            <button type="button" class="text-xl text-slate-400 lg:hidden" aria-label="关闭会话列表" @click="listOpen = false">×</button>
          </div>
          <div class="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div class="rounded-lg bg-amber-50 px-2 py-2 text-amber-700"><b class="block text-base">{{ summary.waiting }}</b>待回复</div>
            <div class="rounded-lg bg-emerald-50 px-2 py-2 text-emerald-700"><b class="block text-base">{{ summary['waiting-user'] }}</b>待用户</div>
            <div class="rounded-lg bg-slate-100 px-2 py-2 text-slate-600"><b class="block text-base">{{ summary.closed }}</b>已结束</div>
          </div>
          <input v-model="query" type="search" placeholder="搜索邮箱、UID 或消息" class="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto p-2">
          <button
            v-for="conversation in conversations"
            :key="conversation.id"
            type="button"
            class="mb-1 w-full rounded-lg border px-3 py-3 text-left transition"
            :class="selectedId === conversation.id ? 'border-blue-200 bg-blue-50/70' : 'border-transparent hover:bg-slate-50'"
            @click="selectConversation(conversation)"
          >
            <div class="flex items-start gap-3">
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-800 text-sm font-semibold text-white">{{ (conversation.user.nickname || conversation.user.email || '?').slice(0, 1).toUpperCase() }}</span>
              <span class="min-w-0 flex-1">
                <span class="flex items-center justify-between gap-2">
                  <span class="truncate text-sm font-medium text-slate-900">{{ conversation.user.nickname || conversation.user.email }}</span>
                  <span class="shrink-0 text-[10px] text-slate-400">{{ formatTime(conversation.updatedAt) }}</span>
                </span>
                <span class="mt-1 flex items-center gap-2">
                  <span class="min-w-0 flex-1 truncate text-xs text-slate-500">{{ lastPreview(conversation) }}</span>
                  <span v-if="conversation.adminUnread" class="grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">{{ conversation.adminUnread }}</span>
                </span>
                <span class="mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] ring-1 ring-inset" :class="statusFor(conversation.status).class">{{ statusFor(conversation.status).label }}</span>
              </span>
            </div>
          </button>
          <p v-if="!conversations.length" class="px-4 py-10 text-center text-sm text-slate-400">没有匹配的会话</p>
        </div>
      </aside>

      <main class="flex min-w-0 flex-col bg-slate-50/50">
        <template v-if="selected">
          <header class="flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h2 class="truncate font-semibold text-slate-900">{{ selected.user.nickname || selected.user.email }}</h2>
                <span class="rounded-full px-2 py-0.5 text-[10px] ring-1 ring-inset" :class="statusFor(selected.status).class">{{ statusFor(selected.status).label }}</span>
              </div>
              <p class="mt-1 text-xs text-slate-400">UID {{ selected.user.uid || selected.userId }} · {{ selected.user.email }}</p>
            </div>
            <button type="button" class="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40" :disabled="isClosed" @click="endConversation">结束会话</button>
          </header>

          <div ref="messageListRef" class="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
            <div class="space-y-4">
              <article v-for="message in selected.messages" :key="message.id" class="flex" :class="message.sender === 'agent' ? 'justify-end' : 'justify-start'">
                <div class="max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm" :class="message.sender === 'agent' ? 'rounded-br-md bg-blue-600 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'">
                  <img v-if="message.imageDataUrl" :src="message.imageDataUrl" alt="会话图片" class="mb-2 max-h-52 rounded-lg object-contain" />
                  <p v-if="message.text" class="whitespace-pre-wrap break-words">{{ message.text }}</p>
                  <p class="mt-1 text-[10px]" :class="message.sender === 'agent' ? 'text-blue-100' : 'text-slate-400'">{{ formatTime(message.createdAt) }}</p>
                </div>
              </article>
              <p v-if="isClosed" class="text-center text-xs text-slate-400">— 会话已结束 —</p>
            </div>
          </div>

          <footer class="border-t border-slate-200 bg-white p-3 md:p-4">
            <div class="mb-2 flex gap-2 overflow-x-auto pb-1">
              <button v-for="reply in quickReplies" :key="reply" type="button" class="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40" :disabled="isClosed" @click="useQuickReply(reply)">{{ reply }}</button>
            </div>
            <div class="flex items-end gap-2">
              <textarea v-model="draft" rows="2" class="min-h-16 min-w-0 flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100" :disabled="isClosed" :placeholder="isClosed ? '会话已结束' : '输入回复内容，Enter 发送'" aria-label="客服回复" @keydown="onReplyKeydown" />
              <button type="button" class="h-10 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300" :disabled="!canReply" @click="sendReply">发送</button>
            </div>
          </footer>
        </template>
        <div v-else class="grid h-full min-h-80 place-items-center text-center text-slate-400">
          <div><p class="text-base font-medium text-slate-500">请选择一个会话</p><p class="mt-1 text-sm">从左侧列表开始处理用户咨询</p></div>
        </div>
      </main>

      <aside
        class="fixed inset-y-0 right-0 z-50 flex w-[min(86vw,320px)] flex-col border-l border-slate-200 bg-white p-5 shadow-xl transition-transform xl:static xl:z-auto xl:w-auto xl:translate-x-0 xl:shadow-none"
        :class="profileOpen ? 'translate-x-0' : 'translate-x-full'"
        aria-label="客服用户信息"
      >
        <div class="flex items-center justify-between">
          <h2 class="font-semibold text-slate-900">用户信息</h2>
          <button type="button" class="text-xl text-slate-400 xl:hidden" aria-label="关闭用户信息" @click="profileOpen = false">×</button>
        </div>
        <template v-if="selected">
          <div class="mt-5 flex items-center gap-3">
            <span class="grid h-11 w-11 place-items-center rounded-full bg-slate-800 font-semibold text-white">{{ (selected.user.nickname || selected.user.email || '?').slice(0, 1).toUpperCase() }}</span>
            <div class="min-w-0"><p class="truncate font-medium text-slate-900">{{ selected.user.nickname || '未设置昵称' }}</p><p class="truncate text-xs text-slate-500">{{ selected.user.email }}</p></div>
          </div>
          <dl class="mt-5 space-y-3 text-sm">
            <div class="flex justify-between gap-4"><dt class="text-slate-400">UID</dt><dd class="text-slate-700">{{ selected.user.uid || selected.userId }}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-slate-400">VIP</dt><dd class="text-slate-700">VIP {{ selected.user.vip }}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-slate-400">认证</dt><dd class="text-slate-700">{{ selected.user.kyc }}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-slate-400">信用分</dt><dd class="text-slate-700">{{ selected.user.creditScore }}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-slate-400">账户状态</dt><dd class="text-emerald-600">{{ selected.user.accountStatus }}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-slate-400">会话开始</dt><dd class="text-right text-slate-700">{{ formatTime(selected.createdAt) }}</dd></div>
          </dl>
          <div class="mt-6 border-t border-slate-200 pt-5">
            <label class="text-sm font-medium text-slate-700" for="customer-note">内部备注</label>
            <textarea id="customer-note" v-model="noteDraft" rows="4" class="mt-2 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="仅管理台可见" />
            <button type="button" class="mt-2 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700" @click="saveNote">保存备注</button>
          </div>
        </template>
        <p v-else class="mt-10 text-center text-sm text-slate-400">请选择会话查看用户信息</p>
      </aside>
    </div>

    <button v-if="listOpen || profileOpen" type="button" class="fixed inset-0 z-40 bg-black/30 xl:hidden" aria-label="关闭客服面板" @click="listOpen = false; profileOpen = false" />
  </section>
</template>
