<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { AGENT_PRODUCT_GROUPS, AGENT_PRODUCT_LINE_DEFS } from '../../admin/constants/agentCommission'
import { mockAgentList } from '../../admin/mock/agent'
import { useAgentAuthStore } from '../../stores/agentAuth'

const auth = useAgentAuthStore()

onMounted(() => {
  auth.ensureHydrated()
})

function normEmail(e) {
  return String(e ?? '')
    .trim()
    .toLowerCase()
}

const currentAgentRow = computed(() =>
  mockAgentList.find((a) => normEmail(a.email) === normEmail(auth.email))
)

const productCommission = computed(() => currentAgentRow.value?.productCommission ?? null)

function lineDef(key) {
  return AGENT_PRODUCT_LINE_DEFS.find((l) => l.key === key)
}

function isLineEnabled(pc, line) {
  if (!pc || !line) return false
  return pc[line.enabledKey] === true
}

function formatLineRate(pc, line) {
  if (!pc || !line) return '—'
  const raw = pc[line.rateKey]
  const n = parseFloat(String(raw ?? '0'))
  if (!Number.isFinite(n)) return '—'
  return `${(n * 100).toFixed(2)}%`
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-white/55">
      以下为当前账号在各产品线可享受的<strong class="text-white/75">一级记佣比例</strong>；由运营在<strong class="text-white/75">管理后台 → 代理管理</strong>配置，与结算账单口径一致。
    </p>

    <div class="overflow-hidden rounded-xl border border-white/[0.06]">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[22rem] border-collapse text-left text-sm">
          <thead class="bg-white/[0.04] text-xs text-white/50">
            <tr>
              <th class="px-4 py-3 font-medium">产品线</th>
              <th class="px-4 py-3 font-medium">状态</th>
              <th class="px-4 py-3 text-right font-medium">一级比例</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.05]">
            <template v-for="g in AGENT_PRODUCT_GROUPS" :key="g.id">
              <tr class="bg-white/[0.03]">
                <td colspan="3" class="px-4 py-2 text-[11px] font-medium text-white/45">
                  {{ g.name }} · {{ g.blurb }}
                </td>
              </tr>
              <tr
                v-for="key in g.lineKeys"
                :key="`${g.id}-${key}`"
                class="hover:bg-white/[0.02]"
              >
                <td class="px-4 py-2.5 text-white/90">{{ lineDef(key)?.title ?? key }}</td>
                <td class="px-4 py-2.5">
                  <span
                    v-if="isLineEnabled(productCommission, lineDef(key))"
                    class="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-200"
                  >
                    已开通
                  </span>
                  <span v-else class="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/45">未开通</span>
                </td>
                <td class="px-4 py-2.5 text-right font-mono tabular-nums text-emerald-200/95">
                  {{
                    isLineEnabled(productCommission, lineDef(key))
                      ? formatLineRate(productCommission, lineDef(key))
                      : '—'
                  }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <p class="text-sm text-white/45">
      <RouterLink class="text-emerald-400/90 hover:underline" to="/agent-system/commission">查看账期结算与打款记录 →</RouterLink>
    </p>
  </div>
</template>
