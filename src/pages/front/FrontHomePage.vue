<script setup>
const prefix = '/front'
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-12 text-white md:px-6 md:py-16">
    <h1 class="text-2xl font-bold tracking-tight md:text-3xl">欢迎来到 CryptoX Pro</h1>
    <p class="mt-2 text-sm text-white/55">
      浏览行情、管理资产与交易；账户与安全设置请前往个人中心。
    </p>
    <div class="mt-8 flex flex-wrap gap-3">
      <RouterLink
        :to="`${prefix}/market`"
        class="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-white/90 hover:bg-white/[0.06]"
      >
        行情
      </RouterLink>
      <RouterLink
        :to="`${prefix}/personal-center/assets`"
        class="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-white/90 hover:bg-white/[0.06]"
      >
        资产
      </RouterLink>
      <RouterLink
        :to="`${prefix}/trade/perpetual`"
        class="rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-semibold text-black hover:bg-lime-300"
      >
        交易
      </RouterLink>
      <RouterLink
        :to="`${prefix}/personal-center`"
        class="rounded-xl border border-lime-400/35 px-4 py-2.5 text-sm font-medium text-lime-200/95 hover:bg-lime-400/10"
      >
        个人中心
      </RouterLink>
    </div>
  </div>
</template>
