<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { agentDashboardSummary } from '../../admin/mock/agentPortal'
import { agentSettlementApi } from '../../admin/mock/agentSettlement'
import { agentPortalSettlementHeadline } from '../../admin/constants/agentSettlement'
import { useAgentAuthStore } from '../../stores/agentAuth'

const auth = useAgentAuthStore()
const s = agentDashboardSummary
const periodSummary = ref(null)

onMounted(async () => {
  const res = await agentSettlementApi.getCurrentPeriodSummary(auth.uid)
  if (res.success) periodSummary.value = res.data
})

const settlementSubline = computed(() => {
  const p = periodSummary.value
  if (!p?.status) return `${s.settlementStatus} · ${s.nextSettlementDate}`
  return `${agentPortalSettlementHeadline(p.status)} · ${p.period} 账期 · 预计 ${p.nextSettlementDate}`
})
</script>

<template>
  <div class="space-y-6">
    <p class="text-sm text-white/55 md:hidden">{{ auth.nickname }} · UID {{ auth.uid }}</p>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
        <p class="text-xs text-white/45">本月预估佣金</p>
        <p class="mt-2 text-2xl font-semibold text-emerald-300">
          {{ s.monthCommission.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}
          <span class="text-sm font-normal text-white/40">USDT</span>
        </p>
        <p class="mt-1 text-xs text-white/38">{{ settlementSubline }}</p>
      </div>
      <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
        <p class="text-xs text-white/45">本月直邀交易量</p>
        <p class="mt-2 text-2xl font-semibold text-white">
          {{ s.monthVolume.toLocaleString('zh-CN') }}
          <span class="text-sm font-normal text-white/40">{{ s.monthVolumeUnit }}</span>
        </p>
      </div>
      <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
        <p class="text-xs text-white/45">直邀活跃 / 本月新增</p>
        <p class="mt-2 text-2xl font-semibold text-white">
          {{ s.activeClients }}
          <span class="text-base font-normal text-white/40">/ +{{ s.newClientsThisMonth }}</span>
        </p>
      </div>
      <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
        <p class="text-xs text-white/45">待审核认证</p>
        <p class="mt-2 text-2xl font-semibold text-amber-200">{{ s.pendingKyc }}</p>
        <RouterLink
          to="/agent-system/verification-audit"
          class="mt-2 inline-block text-xs text-emerald-400/90 hover:underline"
        >
          去处理 →
        </RouterLink>
      </div>
    </div>

    <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
      <h2 class="text-sm font-semibold text-white">快捷入口</h2>
      <ul class="mt-3 space-y-2 text-sm">
        <li>
          <RouterLink class="text-emerald-300/95 hover:underline" to="/agent-system/data-query">数据查询 · 直邀用户与交易量</RouterLink>
        </li>
        <li>
          <RouterLink class="text-emerald-300/95 hover:underline" to="/agent-system/daily-report">数据日报 · 按日交易与佣金</RouterLink>
        </li>
        <li>
          <RouterLink class="text-emerald-300/95 hover:underline" to="/agent-system/commission-rates">记佣比例 · 各产品线一级比例</RouterLink>
        </li>
        <li>
          <RouterLink class="text-emerald-300/95 hover:underline" to="/agent-system/commission">佣金结算 · 账期、进度与入账</RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>
