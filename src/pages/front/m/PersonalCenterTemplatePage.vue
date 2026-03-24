<script setup>
const accountMenus = ['偏好设置', '安全中心', '身份认证', '账变记录', '账户资产']
const serviceMenus = ['邀请好友', '在线客服', '平台介绍', '监管报告']

const verificationLevel = '未认证'
const verificationLevelClassMap = {
  未认证: 'border-slate-300/40 bg-slate-300/10 text-slate-200',
  初级认证: 'border-sky-300/50 bg-sky-300/10 text-sky-200',
  高级认证: 'border-emerald-300/50 bg-emerald-300/10 text-emerald-200'
}
const verificationLevels = ['未认证', '初级认证', '高级认证']
</script>

<template>
  <div class="mx-auto min-h-screen w-full max-w-md bg-black px-4 py-4">
    <header class="mb-4 flex items-center gap-3">
      <button type="button" class="text-xl text-white/90">&lt;</button>
      <h1 class="text-2xl font-semibold">个人中心</h1>
    </header>

    <section class="mb-4 rounded-3xl bg-white/[0.12] p-4">
      <div class="flex items-center gap-3">
        <div class="grid h-14 w-14 place-items-center rounded-full bg-[#6a71ff]/40 font-semibold">U</div>
        <div class="min-w-0 flex-1">
          <div class="truncate text-lg font-semibold">acheqi@qq.com</div>
          <div class="text-base text-white/80">ID: 143</div>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <div class="inline-flex rounded-md border border-amber-300/50 bg-amber-300/10 px-2 py-0.5 text-xs text-amber-200">
               VIP 1
            </div>
            <div
              class="inline-flex rounded-md border px-2 py-0.5 text-xs"
              :class="verificationLevelClassMap[verificationLevel] || verificationLevelClassMap['未认证']"
            >
              {{ verificationLevel }}
            </div>
          </div>
          <div class="mt-2 flex flex-wrap items-center gap-1.5">
            <span class="text-xs text-white/60">认证样式:</span>
            <div
              v-for="level in verificationLevels"
              :key="level"
              class="inline-flex rounded-md border px-2 py-0.5 text-xs"
              :class="verificationLevelClassMap[level]"
            >
              {{ level }}
            </div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-lg font-semibold leading-none">Credit</div>
          <div class="mt-1 text-3xl font-bold leading-none">0</div>
        </div>
      </div>
    </section>

    <section class="mb-4 rounded-3xl bg-white/[0.12] p-4">
      <div class="flex items-center justify-between">
        <div class="text-xl font-semibold">模拟交易</div>
        <div class="h-8 w-16 rounded-full bg-lime-400 p-1">
          <div class="ml-auto h-6 w-6 rounded-full bg-white"></div>
        </div>
      </div>
    </section>

    <section class="mb-4 rounded-3xl bg-white/[0.12] p-2">
      <div
        v-for="menu in accountMenus"
        :key="menu"
        class="flex items-center justify-between rounded-2xl px-3 py-3 text-lg text-white/90 hover:bg-white/10"
      >
        <span>{{ menu }}</span>
        <span class="text-white/50">&gt;</span>
      </div>
    </section>

    <section class="rounded-3xl bg-white/[0.12] p-2">
      <div
        v-for="menu in serviceMenus"
        :key="menu"
        class="flex items-center justify-between rounded-2xl px-3 py-3 text-lg text-white/90 hover:bg-white/10"
      >
        <span>{{ menu }}</span>
        <span class="text-white/50">&gt;</span>
      </div>
    </section>
  </div>
</template>
