<script setup>
import { computed, ref } from 'vue'
import { getVipLevelByLevel } from '../../../admin/mock/vip'
import FrontMutedPill from '../../../components/front/FrontMutedPill.vue'
import FrontStrokeIcon from '../../../components/front/FrontStrokeIcon.vue'

const prefix = '/front'

const userVipLevel = ref(2)
const currentVipMeta = computed(() => getVipLevelByLevel(userVipLevel.value))

const displayEmail = 'acheqi@qq.com'
const displayUid = '143'
const creditScore = 72
const kycLabel = '初级认证'

/** 首页安全项摘要（演示：与「新账户未绑定」一致；对接后可与全局用户状态同源） */
const securityBrief = ref([
  { key: 'phone', label: '手机', ok: false },
  { key: 'email', label: '邮箱', ok: false },
  { key: 'mfa', label: '两步验证', ok: false }
])

const securityCompleteCount = computed(() => securityBrief.value.filter((i) => i.ok).length)
const securityScore = computed(() => Math.min(96, 20 + securityCompleteCount.value * 26))

const securityPendingCount = computed(() => securityBrief.value.filter((i) => !i.ok).length)

/** 最近动态（示例） */
const recentItems = ref([
  {
    key: '1',
    kind: 'security',
    title: '新设备登录提醒',
    time: '今天 11:20',
    to: 'notifications'
  },
  {
    key: '2',
    kind: 'system',
    title: '现货费率将于下月按 VIP 等级调整',
    time: '昨天',
    to: 'fees-vip'
  },
  {
    key: '3',
    kind: 'account',
    title: '高级认证材料仍可补充，完成后可提升提现额度',
    time: '4 月 1 日',
    to: 'verification'
  }
])

function feedTo(pathKey) {
  const base = `${prefix}/personal-center`
  const map = {
    notifications: `${base}/notifications`,
    'fees-vip': `${base}/fees-vip`,
    verification: `${base}/verification`
  }
  return map[pathKey] || base
}

/** 高频功能：小链接即可，完整列表在侧栏 / 账户菜单 */
const compactLinks = computed(() => [
  { label: '账变记录', to: `${prefix}/personal-center/ledger` },
  { label: '提币地址', to: `${prefix}/personal-center/withdraw-addresses` },
  { label: '邀请返佣', to: `${prefix}/personal-center/referral` },
  { label: '账户设置', to: `${prefix}/personal-center/preferences` }
])

const card =
  'rounded-2xl border border-white/[0.06] bg-white/[0.025] shadow-none'
const sectionLabel = 'text-[10px] font-medium uppercase tracking-[0.08em] text-white/38'
const sectionTitle = 'text-sm font-medium text-white/90'
</script>

<template>
  <div class="text-white">
    <header class="mb-4 hidden border-b border-white/[0.06] pb-4 md:mb-5 md:block lg:mb-6 lg:pb-5">
      <h1 class="text-xl font-semibold tracking-tight text-white lg:text-[1.35rem]">账户总览</h1>
      <p class="mt-1 max-w-xl text-xs leading-relaxed text-white/42">
        信用、安全与近期提醒；完整功能请使用左侧菜单。
      </p>
    </header>

    <div class="flex flex-col gap-4 md:gap-5">
      <!-- 用户主卡片 -->
      <section :class="`${card} p-4 md:p-5`">
        <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex items-start gap-3.5 md:gap-4">
            <div
              class="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-lg font-semibold text-white/95 md:h-16 md:w-16 md:text-xl"
            >
              {{ displayEmail.slice(0, 1).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <p class="truncate text-base font-medium text-white md:text-lg">
                {{ displayEmail }}
              </p>
              <p class="mt-0.5 text-xs text-white/45">UID {{ displayUid }}</p>
              <div class="mt-2.5 flex flex-wrap items-center gap-2">
                <FrontMutedPill tone="amber" inline-flex>
                  <img
                    v-if="currentVipMeta?.iconUrl"
                    :src="currentVipMeta.iconUrl"
                    alt=""
                    class="h-3.5 w-3.5 object-contain brightness-110"
                    loading="lazy"
                  />
                  <FrontStrokeIcon
                    v-else
                    name="star"
                    size-class="h-3.5 w-3.5 shrink-0 text-amber-400"
                  />
                  VIP {{ userVipLevel }}
                </FrontMutedPill>
                <FrontMutedPill tone="sky">{{ kycLabel }}</FrontMutedPill>
              </div>
              <div class="mt-3 hidden flex-wrap gap-x-5 gap-y-1 text-xs text-white/50 lg:flex">
                <RouterLink
                  :to="`${prefix}/personal-center/security`"
                  class="text-lime-300/85 transition hover:text-lime-200"
                >
                  安全中心
                </RouterLink>
                <RouterLink
                  :to="`${prefix}/personal-center/verification`"
                  class="text-lime-300/85 transition hover:text-lime-200"
                >
                  身份认证
                </RouterLink>
                <RouterLink
                  :to="`${prefix}/personal-center/notifications`"
                  class="transition hover:text-white/70"
                >
                  消息通知
                </RouterLink>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 sm:w-[13.5rem] sm:shrink-0 sm:gap-2.5 sm:text-right">
            <div class="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2.5 md:px-3.5 md:py-3">
              <p :class="sectionLabel">信用分</p>
              <p class="mt-1 font-mono text-lg font-medium tabular-nums text-lime-200/95 md:text-xl">
                {{ creditScore }}
              </p>
            </div>
            <div class="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2.5 md:px-3.5 md:py-3">
              <p :class="sectionLabel">安全评分</p>
              <p class="mt-1 font-mono text-lg font-medium tabular-nums text-violet-200/95 md:text-xl">
                {{ securityScore }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <RouterLink
        :to="`${prefix}/personal-center/assets`"
        :class="`${card} flex flex-col gap-3 p-4 transition hover:border-white/[0.1] hover:bg-white/[0.035] sm:flex-row sm:items-center sm:justify-between md:p-5`"
      >
        <div>
          <p :class="sectionLabel">账户总资产</p>
          <p class="mt-2 font-mono text-lg font-medium tabular-nums text-white md:text-xl">0</p>
          <p class="mt-1 text-xs text-white/42">≈ $ 0 · 今日收益 0</p>
        </div>
        <span class="text-xs font-medium text-lime-300/85 sm:shrink-0">查看资产</span>
      </RouterLink>

      <div class="grid gap-4 md:gap-5 lg:grid-cols-2 lg:items-start">
        <section :class="`${card} p-4 md:p-5`">
          <div class="flex items-center justify-between gap-3">
            <h2 :class="sectionTitle">安全项</h2>
            <RouterLink
              :to="`${prefix}/personal-center/security`"
              class="text-xs font-medium text-lime-300/85 hover:text-lime-200"
            >
              管理
            </RouterLink>
          </div>
          <p v-if="securityPendingCount" class="mt-2 text-xs leading-relaxed text-amber-200/80">
            还有 {{ securityPendingCount }} 项待完善。可前往安全中心，任选绑定手机、邮箱或两步验证。
          </p>
          <p v-else class="mt-2 text-xs text-emerald-200/75">当前安全项已齐备（示例）。</p>
          <ul class="mt-4 divide-y divide-white/[0.06] border-t border-white/[0.06]">
            <li
              v-for="row in securityBrief"
              :key="row.key"
              class="flex items-center justify-between py-2.5 first:pt-3"
            >
              <span class="text-sm text-white/78">{{ row.label }}</span>
              <span
                class="text-xs font-medium tabular-nums"
                :class="row.ok ? 'text-emerald-300/85' : 'text-white/38'"
              >
                {{ row.ok ? '已设置' : '未完成' }}
              </span>
            </li>
          </ul>
        </section>

        <section :class="`${card} p-4 md:p-5`">
          <div class="flex items-center justify-between gap-3">
            <h2 :class="sectionTitle">最近动态</h2>
            <RouterLink
              :to="`${prefix}/personal-center/notifications`"
              class="text-xs font-medium text-lime-300/85 hover:text-lime-200"
            >
              全部
            </RouterLink>
          </div>
          <ul class="mt-2 divide-y divide-white/[0.06]">
            <li
              v-for="row in recentItems"
              :key="row.key"
              class="max-lg:[&:nth-child(n+3)]:hidden"
            >
              <RouterLink
                :to="feedTo(row.to)"
                class="flex gap-3 py-3 text-left transition hover:bg-white/[0.02]"
              >
                <span
                  class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  :class="
                    row.kind === 'security'
                      ? 'bg-amber-400/85'
                      : row.kind === 'system'
                        ? 'bg-sky-400/75'
                        : 'bg-white/28'
                  "
                  aria-hidden="true"
                />
                <div class="min-w-0 flex-1">
                  <p class="text-sm leading-snug text-white/85">{{ row.title }}</p>
                  <p class="mt-0.5 text-xs text-white/38">{{ row.time }}</p>
                </div>
              </RouterLink>
            </li>
          </ul>
        </section>
      </div>

      <section :class="`hidden ${card} px-4 py-4 md:block md:px-5 md:py-4`">
        <p :class="sectionLabel">常用功能</p>
        <div class="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          <RouterLink
            v-for="link in compactLinks"
            :key="link.to"
            :to="link.to"
            class="text-sm text-white/55 transition hover:text-lime-300/85"
          >
            {{ link.label }}
          </RouterLink>
        </div>
      </section>

      <section
        :class="`hidden ${card} border-lime-400/15 bg-lime-400/[0.04] md:flex md:items-center md:justify-between md:px-5 md:py-4`"
      >
        <div class="flex gap-3">
          <FrontStrokeIcon name="lightbulb" size-class="h-5 w-5 shrink-0 text-lime-200/80" />
          <div>
            <p class="text-sm font-medium text-lime-100/90">降低账户风险</p>
            <p class="mt-1 text-xs leading-relaxed text-white/48">
              完成邮箱与两步验证后，提现与改密等操作更安全。
            </p>
          </div>
        </div>
        <RouterLink
          :to="`${prefix}/personal-center/security`"
          class="mt-3 inline-flex shrink-0 rounded-lg bg-lime-400 px-3.5 py-2 text-xs font-semibold text-black transition hover:bg-lime-300 md:mt-0"
        >
          去安全中心
        </RouterLink>
      </section>
    </div>
  </div>
</template>
