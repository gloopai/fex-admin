<template>
  <div class="min-h-screen bg-[#050505] px-6 py-10 text-white">
    <div class="mx-auto max-w-5xl">
      <h1 class="text-3xl font-semibold">选择入口</h1>
      <p class="mt-2 text-sm text-white/60">进入管理台，或打开响应式前台（自动适配手机与桌面）。</p>

      <div class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <RouterLink
          to="/admin"
          class="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-lime-300/40 hover:bg-lime-300/10"
        >
          <div class="text-xl font-semibold">管理台</div>
          <div class="mt-2 text-sm text-white/65">后台运营与风控管理</div>
        </RouterLink>

        <RouterLink
          to="/front/home"
          class="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-lime-300/40 hover:bg-lime-300/10"
        >
          <div class="text-xl font-semibold">前台</div>
          <div class="mt-2 text-sm text-white/65">行情、资产、交易与个人中心（含移动端布局）</div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
