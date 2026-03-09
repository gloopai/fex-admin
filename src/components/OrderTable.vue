<script setup>
defineProps({
  orders: {
    type: Array,
    default: () => []
  }
})

const statusStyle = {
  Paid: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Shipped: 'bg-sky-100 text-sky-700',
  Refunded: 'bg-rose-100 text-rose-700'
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
    <table class="w-full text-left text-sm">
      <thead class="bg-slate-50 text-slate-500">
        <tr>
          <th class="px-4 py-3 font-medium">Order</th>
          <th class="px-4 py-3 font-medium">Customer</th>
          <th class="px-4 py-3 font-medium">Status</th>
          <th class="px-4 py-3 font-medium">Amount</th>
          <th class="px-4 py-3 font-medium">Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id" class="border-t border-slate-100">
          <td class="px-4 py-3 font-medium text-slate-900">{{ order.id }}</td>
          <td class="px-4 py-3 text-slate-700">{{ order.customer }}</td>
          <td class="px-4 py-3">
            <span class="rounded-full px-2 py-1 text-xs font-medium" :class="statusStyle[order.status]">
              {{ order.status }}
            </span>
          </td>
          <td class="px-4 py-3 text-slate-700">{{ order.amount }}</td>
          <td class="px-4 py-3 text-slate-500">{{ order.date }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
