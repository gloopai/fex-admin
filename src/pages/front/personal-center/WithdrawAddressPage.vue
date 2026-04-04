<script setup>
import { ref } from 'vue'

const addresses = ref([
  {
    id: 'a1',
    network: 'USDT · TRC20',
    tag: '主钱包',
    address: 'TXYz...9k2m',
    verified: true
  },
  {
    id: 'a2',
    network: 'USDT · ERC20',
    tag: '硬件钱包',
    address: '0x71c...3f9e',
    verified: true
  },
  {
    id: 'a3',
    network: 'BTC',
    tag: '冷存储',
    address: 'bc1q...vx4',
    verified: false
  }
])
</script>

<template>
  <div>
    <header class="mb-5 hidden md:mb-6 md:block">
      <h1 class="text-2xl font-bold tracking-tight text-white md:text-3xl">提币地址</h1>
      <p class="mt-1 text-sm text-white/55">
        管理链上提币白名单地址。新增或修改地址通常需安全验证与短时冷静期。
      </p>
    </header>

    <div class="flex flex-col gap-5 md:gap-6">
    <section class="flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        class="rounded-lg bg-lime-400 px-4 py-2.5 text-sm font-semibold text-black hover:bg-lime-300"
      >
        添加地址
      </button>
      <p class="text-xs text-white/45">已启用 {{ addresses.filter((a) => a.verified).length }} / {{ addresses.length }} 条已验证</p>
    </section>

    <div class="flex flex-col gap-5 md:gap-6">
      <article
        v-for="row in addresses"
        :key="row.id"
        class="rounded-2xl border border-white/10 bg-white/[0.04] p-3 md:p-5"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-white/95">{{ row.network }}</p>
            <p class="mt-1 text-xs text-white/50">{{ row.tag }}</p>
          </div>
          <span
            class="shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium"
            :class="
              row.verified
                ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
                : 'border-amber-400/40 bg-amber-400/10 text-amber-200'
            "
          >
            {{ row.verified ? '已验证' : '待验证' }}
          </span>
        </div>
        <p class="mt-3 break-all font-mono text-sm text-white/75">{{ row.address }}</p>
        <div class="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <button
            type="button"
            class="rounded-lg border border-white/18 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/[0.06]"
          >
            复制
          </button>
          <button
            type="button"
            class="rounded-lg border border-white/18 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/[0.06]"
          >
            编辑
          </button>
          <button
            type="button"
            class="rounded-lg border border-rose-400/30 px-3 py-1.5 text-xs font-medium text-rose-200/90 hover:bg-rose-500/10"
          >
            删除
          </button>
        </div>
      </article>
    </div>
    </div>
  </div>
</template>
