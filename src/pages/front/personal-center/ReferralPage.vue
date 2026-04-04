<script setup>
import { ref } from 'vue'

const inviteCode = ref('FEX2026')
const inviteLink = ref('https://example.com/r/FEX2026')

const stats = ref({
  invited: 128,
  pendingCommission: '320.50',
  settled: '1,204.80'
})

function copy(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => {})
  }
}
</script>

<template>
  <div>
    <header class="mb-6 md:mb-8">
      <h1 class="text-2xl font-bold tracking-tight text-white md:text-3xl">邀请返佣</h1>
      <p class="mt-1 text-sm text-white/55">
        邀请好友注册并完成交易，按规则获得返现。比例与结算周期以活动公告为准。
      </p>
    </header>

    <section class="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6">
      <h2 class="text-sm font-semibold text-white/90">我的邀请码</h2>
      <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div class="min-w-0 flex-1">
          <label class="text-xs text-white/50">邀请码</label>
          <p
            class="mt-1.5 rounded-xl border border-white/15 bg-black/40 px-4 py-3 font-mono text-lg font-semibold tracking-wide text-lime-200"
          >
            {{ inviteCode }}
          </p>
        </div>
        <button
          type="button"
          class="rounded-lg bg-lime-400 px-5 py-3 text-sm font-semibold text-black hover:bg-lime-300 sm:shrink-0"
          @click="copy(inviteCode)"
        >
          复制邀请码
        </button>
      </div>
      <div class="mt-4">
        <label class="text-xs text-white/50">邀请链接</label>
        <div
          class="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <p class="min-w-0 flex-1 truncate rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-xs text-white/65">
            {{ inviteLink }}
          </p>
          <button
            type="button"
            class="rounded-lg border border-white/20 px-4 py-2.5 text-sm text-white/85 hover:bg-white/[0.06] sm:shrink-0"
            @click="copy(inviteLink)"
          >
            复制链接
          </button>
        </div>
      </div>
    </section>

    <section class="mb-6 grid gap-3 sm:grid-cols-3">
      <div class="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
        <p class="text-xs text-white/45">已邀请（人）</p>
        <p class="mt-2 text-2xl font-semibold tabular-nums text-white">{{ stats.invited }}</p>
      </div>
      <div class="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
        <p class="text-xs text-white/45">待结算（USDT）</p>
        <p class="mt-2 text-2xl font-semibold tabular-nums text-amber-200">{{ stats.pendingCommission }}</p>
      </div>
      <div class="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
        <p class="text-xs text-white/45">累计已到账（USDT）</p>
        <p class="mt-2 text-2xl font-semibold tabular-nums text-lime-200">{{ stats.settled }}</p>
      </div>
    </section>

    <section class="rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-4 text-xs leading-relaxed text-white/50 md:px-5">
      <p class="font-medium text-white/65">说明</p>
      <ul class="mt-2 list-inside list-disc space-y-1">
        <li>好友须通过您的邀请链接或填写邀请码完成注册。</li>
        <li>若被邀请人触发风控或违规交易，相关返佣可能被收回。</li>
        <li>详情以「邀请活动规则」页面与站内信通知为准。</li>
      </ul>
    </section>
  </div>
</template>
