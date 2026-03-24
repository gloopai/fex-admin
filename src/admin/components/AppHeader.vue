<script setup>
const emit = defineEmits(['toggle-menu'])
</script>

<template>
  <header class="flex h-12 items-center justify-between border-b border-black/[0.06] bg-white px-4 md:px-6">
    <div class="flex items-center gap-3 text-sm text-black/45">
      <button
        type="button"
        class="rounded-md p-1.5 text-black/65 transition hover:bg-black/5 lg:hidden"
        aria-label="open menu"
        @click="emit('toggle-menu')"
      >
        <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none">
          <path d="M3.5 5.5H16.5M3.5 10H16.5M3.5 14.5H16.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      </button>
      <span class="hover:text-black/85 cursor-pointer transition-colors">首页</span>
      <span class="text-black/15">/</span>
      <span class="text-black/85">运营系统</span>
    </div>

    <div class="flex items-center gap-4 text-black/45">
      <button class="rounded-md p-1.5 transition hover:bg-black/5 hover:text-black/85" aria-label="notice">
        <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none">
          <path d="M10 3.8C7.7 3.8 5.8 5.7 5.8 8V10.3L4.5 12.2V13H15.5V12.2L14.2 10.3V8C14.2 5.7 12.3 3.8 10 3.8Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M8.6 14.4C8.8 15.1 9.4 15.5 10 15.5C10.6 15.5 11.2 15.1 11.4 14.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
      <div class="flex items-center gap-2 px-2 py-1 cursor-pointer rounded-md hover:bg-black/5 transition-colors">
        <div class="h-6 w-6 rounded-full bg-antd-primary/10 text-antd-primary grid place-items-center text-xs font-bold">
          AD
        </div>
        <span class="text-sm text-black/65">Admin</span>
      </div>
    </div>
  </header>
</template>
