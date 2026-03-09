<script setup>
import { storeToRefs } from 'pinia'
import { useConsoleStore } from '../../stores/console'
import KpiCard from '../../components/KpiCard.vue'
import OrderTable from '../../components/OrderTable.vue'

const store = useConsoleStore()
const { summary, orders } = storeToRefs(store)
</script>

<template>
  <section class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        v-for="item in summary"
        :key="item.label"
        :label="item.label"
        :value="item.value"
        :trend="item.trend"
        :good="item.good"
      />
    </div>

    <div class="grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
      <div class="space-y-3">
        <h2 class="text-lg font-semibold text-slate-900">Recent Orders</h2>
        <OrderTable :orders="orders" />
      </div>

      <div class="rounded-xl border border-slate-200 bg-slate-950 p-5 text-slate-100">
        <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Insight</p>
        <h3 class="mt-2 text-xl font-semibold">Traffic is strongest at 20:00-22:00</h3>
        <p class="mt-3 text-sm text-slate-300">
          Campaign CTR increased 16% after shipping estimate optimization. Consider extending free shipping threshold experiments for tier-2 cities.
        </p>
      </div>
    </div>
  </section>
</template>
