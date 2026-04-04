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
const securityScore = 78
const kycLabel = '初级认证'

/** 首页安全项摘要（示例，可与安全中心同源） */
const securityBrief = ref([
  { key: 'phone', label: '手机', ok: true },
  { key: 'email', label: '邮箱', ok: false },
  { key: 'mfa', label: '两步验证', ok: false }
])

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
</script>

<template>
  <div>
    <header class="mb-5 hidden md:mb-8 md:block">
      <h1 class="text-3xl font-bold tracking-tight text-white">账户总览</h1>
      <p class="mt-1 text-sm text-white/55">
        查看信用、安全与最近动态；更多功能见侧栏导航。
      </p>
    </header>

    <!-- 用户主卡片 -->
    <section
      class="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-gradient-to-br from-white/[0.06] to-white/[0.015] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] md:p-6"
    >
      <div
        class="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-lime-400/10 blur-3xl"
        aria-hidden="true"
      />
      <div class="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex items-start gap-4">
          <div
            class="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-white/[0.09] bg-gradient-to-br from-white/[0.1] via-lime-400/[0.14] to-emerald-950/40 text-xl font-bold text-lime-50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] md:h-[4.5rem] md:w-[4.5rem] md:text-2xl"
          >
            {{ displayEmail.slice(0, 1).toUpperCase() }}
          </div>
          <div class="min-w-0">
            <p class="truncate text-lg font-semibold text-white md:text-xl">
              {{ displayEmail }}
            </p>
            <p class="mt-0.5 text-sm text-white/50">UID {{ displayUid }}</p>
            <div class="mt-3 flex flex-wrap items-center gap-2">
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
            <!-- 大屏侧栏无此区域时保留；窄屏由壳层快捷入口覆盖 -->
            <div class="mt-4 hidden flex-wrap gap-x-4 gap-y-2 text-xs lg:flex">
              <RouterLink
                :to="`${prefix}/personal-center/security`"
                class="text-lime-300/90 hover:text-lime-200"
              >
                安全中心
              </RouterLink>
              <RouterLink
                :to="`${prefix}/personal-center/verification`"
                class="text-lime-300/90 hover:text-lime-200"
              >
                身份认证
              </RouterLink>
              <RouterLink
                :to="`${prefix}/personal-center/notifications`"
                class="text-white/45 hover:text-white/70"
              >
                消息通知
              </RouterLink>
            </div>
          </div>
        </div>

        <div
          class="grid grid-cols-2 gap-2 sm:gap-3 sm:shrink-0 sm:text-right md:gap-3"
        >
          <div class="rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/[0.04] sm:px-4 sm:py-3">
            <p class="text-[10px] uppercase tracking-wider text-white/40">信用分</p>
            <p class="mt-1 text-xl font-semibold tabular-nums text-lime-200 sm:text-2xl">
              {{ creditScore }}
            </p>
          </div>
          <div class="rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/[0.04] sm:px-4 sm:py-3">
            <p class="text-[10px] uppercase tracking-wider text-white/40">安全评分</p>
            <p class="mt-1 text-xl font-semibold tabular-nums text-violet-200 sm:text-2xl">
              {{ securityScore }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 资产总览入口（完整页在顶栏「资产」） -->
    <RouterLink
      :to="`${prefix}/personal-center/assets`"
      class="mt-6 flex flex-col gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.035] p-3 transition hover:border-lime-400/22 hover:bg-white/[0.05] sm:flex-row sm:items-center sm:justify-between md:p-5"
    >
      <div>
        <p class="text-xs font-medium uppercase tracking-wider text-white/45">账户总资产</p>
        <p class="mt-1 font-mono text-xl font-semibold text-white md:text-2xl">0</p>
        <p class="mt-0.5 text-sm text-white/45">≈ $ 0 · 今日收益 0</p>
      </div>
      <span class="text-sm font-medium text-lime-300/90 sm:shrink-0">查看资产 →</span>
    </RouterLink>

    <div class="mt-5 grid gap-5 md:mt-6 md:gap-6 lg:grid-cols-2 lg:items-start">
      <!-- 安全项摘要 -->
      <section class="rounded-2xl border border-white/[0.05] bg-white/[0.035] p-3 md:p-5">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-sm font-semibold text-white/90">安全项</h2>
          <RouterLink
            :to="`${prefix}/personal-center/security`"
            class="text-xs font-medium text-lime-300/90 hover:text-lime-200"
          >
            管理
          </RouterLink>
        </div>
        <p v-if="securityPendingCount" class="mt-2 text-xs text-amber-200/85">
          还有 {{ securityPendingCount }} 项待完善，建议优先绑定邮箱与两步验证。
        </p>
        <p v-else class="mt-2 text-xs text-emerald-200/80">当前安全项已齐备（示例数据）。</p>
        <ul
          class="mt-4 overflow-hidden rounded-xl bg-black/20 divide-y divide-white/[0.04]"
        >
          <li
            v-for="row in securityBrief"
            :key="row.key"
            class="flex items-center justify-between px-3 py-2.5 transition hover:bg-white/[0.03]"
          >
            <span class="text-sm text-white/80">{{ row.label }}</span>
            <span
              class="text-xs font-medium"
              :class="row.ok ? 'text-emerald-300/90' : 'text-white/40'"
            >
              {{ row.ok ? '已设置' : '未完成' }}
            </span>
          </li>
        </ul>
      </section>

      <!-- 最近动态：窄屏仅保留前 2 条，减轻滚动 -->
      <section class="rounded-2xl border border-white/[0.05] bg-white/[0.035] p-3 md:p-5">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-sm font-semibold text-white/90">最近动态</h2>
          <RouterLink
            :to="`${prefix}/personal-center/notifications`"
            class="text-xs font-medium text-lime-300/90 hover:text-lime-200"
          >
            全部消息
          </RouterLink>
        </div>
        <ul class="mt-3 divide-y divide-white/[0.04]">
          <li
            v-for="row in recentItems"
            :key="row.key"
            class="max-lg:[&:nth-child(n+3)]:hidden"
          >
            <RouterLink
              :to="feedTo(row.to)"
              class="flex gap-3 py-3 text-left transition hover:bg-white/[0.03]"
            >
              <span
                class="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                :class="
                  row.kind === 'security'
                    ? 'bg-amber-400/90'
                    : row.kind === 'system'
                      ? 'bg-sky-400/80'
                      : 'bg-white/30'
                "
                aria-hidden="true"
              />
              <div class="min-w-0 flex-1">
                <p class="text-sm text-white/88">{{ row.title }}</p>
                <p class="mt-0.5 text-xs text-white/40">{{ row.time }}</p>
              </div>
              <span class="shrink-0 text-white/25" aria-hidden="true">›</span>
            </RouterLink>
          </li>
        </ul>
      </section>
    </div>

    <!-- 常用功能：窄屏与上方快捷入口重复，隐藏 -->
    <section
      class="mt-6 hidden rounded-2xl border border-white/[0.05] bg-black/22 px-4 py-4 md:block md:px-5"
    >
      <h2 class="text-xs font-medium uppercase tracking-wider text-white/40">常用功能</h2>
      <div class="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <RouterLink
          v-for="link in compactLinks"
          :key="link.to"
          :to="link.to"
          class="text-white/65 transition hover:text-lime-300/90"
        >
          {{ link.label }}
        </RouterLink>
      </div>
    </section>

    <!-- 提示条：窄屏隐藏，减少干扰 -->
    <section
      class="mt-6 hidden rounded-2xl border border-lime-400/12 bg-lime-400/[0.055] px-4 py-4 md:flex md:items-center md:justify-between md:px-5"
    >
      <div class="flex gap-3">
        <FrontStrokeIcon name="lightbulb" size-class="h-6 w-6 shrink-0 text-lime-200/90" />
        <div>
          <p class="text-sm font-medium text-lime-100/95">降低账户风险</p>
          <p class="mt-1 text-xs leading-relaxed text-white/55">
            完成邮箱与两步验证后，提现与改密等操作将更安全。
          </p>
        </div>
      </div>
      <RouterLink
        :to="`${prefix}/personal-center/security`"
        class="mt-3 inline-flex rounded-lg bg-lime-400 px-4 py-2 text-sm font-semibold text-black hover:bg-lime-300 md:mt-0 md:shrink-0"
      >
        去安全中心
      </RouterLink>
    </section>

  </div>
</template>
