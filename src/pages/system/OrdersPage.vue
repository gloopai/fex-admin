<script setup>
import { storeToRefs } from 'pinia'
import { useConsoleStore } from '../../stores/console'
import OrderTable from '../../components/OrderTable.vue'

const store = useConsoleStore()
const { orders } = storeToRefs(store)
</script>

<template>
  <section class="space-y-4">
    <h2 class="text-xl font-semibold text-slate-900">Orders</h2>
    <p class="text-sm text-slate-500">Use this page as your list/search/filter entry point.</p>
    <OrderTable :orders="orders" />
  </section>
</template>
