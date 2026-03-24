<script setup>
const sideMenus = [
  '模拟交易',
  '偏好设置',
  '安全中心',
  '身份认证',
  '账变记录',
  '账户资产',
  '邀请好友',
  '在线客服',
  '平台介绍',
  '监管报告',
  '帮助中心'
]

const verificationLevel = '未认证'
const verificationLevelClassMap = {
  未认证: 'border-slate-300/40 bg-slate-300/10 text-slate-200',
  初级认证: 'border-sky-300/50 bg-sky-300/10 text-sky-200',
  高级认证: 'border-emerald-300/50 bg-emerald-300/10 text-emerald-200'
}
const verificationLevels = ['未认证', '初级认证', '高级认证']
</script>

<template>
  <div class="min-h-screen">
    <header class="border-b border-white/10 px-6 py-4">
      <div class="mx-auto flex max-w-[1400px] items-center justify-between">
        <div class="flex items-center gap-8">
          <div class="text-xl font-bold text-[#f7a21a]">MDFEX</div>
          <nav class="hidden items-center gap-8 text-sm text-white/90 lg:flex">
            <a href="#" class="hover:text-white">首页</a>
            <a href="#" class="hover:text-white">行情</a>
            <a href="#" class="hover:text-white">资产</a>
            <a href="#" class="hover:text-white">交易</a>
            <a href="#" class="hover:text-white">金融</a>
            <a href="#" class="hover:text-white">更多</a>
          </nav>
        </div>
        <div class="text-sm text-white/80">个人中心</div>
      </div>
    </header>

    <div class="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 md:px-6">
      <aside class="w-[230px] shrink-0 rounded-xl border border-white/10 bg-white/[0.04] p-3">
        <div class="mb-4 rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <div class="text-sm font-semibold">acheqi@qq.com</div>
          <div class="mt-1 text-xs text-white/60">ID: 143</div>
        </div>
        <ul class="space-y-1">
          <li
            v-for="menu in sideMenus"
            :key="menu"
            class="rounded-md px-3 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            {{ menu }}
          </li>
        </ul>
      </aside>

      <main class="min-w-0 flex-1">
        <h1 class="mb-4 text-2xl font-semibold">个人中心</h1>
        <section class="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
          <div class="flex items-center gap-4">
            <div class="grid h-16 w-16 place-items-center rounded-full bg-[#6a71ff]/30 text-lg font-semibold">U</div>
            <div class="min-w-0 flex-1">
              <div class="truncate text-xl font-semibold">acheqi@qq.com</div>
              <div class="mt-1 text-sm text-white/65">ID: 143</div>
              <!-- <div class="mt-2 inline-flex rounded-md border border-white/20 px-2 py-1 text-xs text-white/80">未认证</div> -->
              <div class="mt-2 flex flex-wrap gap-2">
                <div class="inline-flex rounded-md border border-amber-300/50 bg-amber-300/10 px-2 py-1 text-xs text-amber-200">
                   VIP 1
                </div>
                <div
                  class="inline-flex rounded-md border px-2 py-1 text-xs"
                  :class="verificationLevelClassMap[verificationLevel] || verificationLevelClassMap['未认证']"
                >
                  {{ verificationLevel }}
                </div>
              </div>
              <div class="mt-2 flex flex-wrap items-center gap-2">
                <span class="text-xs text-white/60">认证样式:</span>
                <div
                  v-for="level in verificationLevels"
                  :key="level"
                  class="inline-flex rounded-md border px-2 py-1 text-xs"
                  :class="verificationLevelClassMap[level]"
                >
                  {{ level }}
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-white/60">Credit</div>
              <div class="text-xl font-semibold">60</div>
            </div>
          </div>
          
        </section>
      </main>
    </div>
  </div>
</template>
