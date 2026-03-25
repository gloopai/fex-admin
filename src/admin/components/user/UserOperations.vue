<script setup>
import UserFreezeAction from './UserFreezeAction.vue'
import UserDepositAction from './UserDepositAction.vue'
import UserTransferAction from './UserTransferAction.vue'

const props = defineProps({
  user: { type: Object, required: true },
  assets: { type: Object, default: null }
})

const emit = defineEmits(['submit'])
</script>

<template>
  <div class="pt-1 flex flex-col gap-2 flex-shrink-0">
    <UserFreezeAction :user="user" @submit="emit('submit', $event)" />
    <UserDepositAction :user="user" :assets="assets" @submit="emit('submit', $event)" />
    <UserTransferAction :user="user" :assets="assets" @submit="emit('submit', $event)" />
  </div>
</template>

