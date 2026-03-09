<script setup>
const emit = defineEmits(['toggle-menu'])
</script>

<template>
  <header class="flex h-14 items-center justify-between border-b border-slate-200 bg-[#f8f9fb] px-4 md:px-6">
    <div class="flex items-center gap-3 text-sm text-slate-500">
      <button
        type="button"
        class="rounded-md p-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-800 lg:hidden"
        aria-label="open menu"
        @click="emit('toggle-menu')"
      >
        <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none">
          <path d="M3.5 5.5H16.5M3.5 10H16.5M3.5 14.5H16.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      </button>
      <span>HOME</span>
      <span class="text-slate-300">/</span>
      <span class="text-slate-700">运营系统</span>
    </div>

    <div class="flex items-center gap-4 text-slate-500">
      <button class="rounded-md p-1.5 transition hover:bg-slate-100 hover:text-slate-700" aria-label="notice">
        <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none">
          <path d="M10 3.8C7.7 3.8 5.8 5.7 5.8 8V10.3L4.5 12.2V13H15.5V12.2L14.2 10.3V8C14.2 5.7 12.3 3.8 10 3.8Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M8.6 14.4C8.8 15.1 9.4 15.5 10 15.5C10.6 15.5 11.2 15.1 11.4 14.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
      <button class="rounded-md p-1.5 transition hover:bg-slate-100 hover:text-slate-700" aria-label="settings">
        <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none">
          <path d="M10 6.9C8.3 6.9 6.9 8.3 6.9 10C6.9 11.7 8.3 13.1 10 13.1C11.7 13.1 13.1 11.7 13.1 10C13.1 8.3 11.7 6.9 10 6.9Z" stroke="currentColor" stroke-width="1.5" />
          <path d="M16 10.8V9.2L14.6 8.8C14.5 8.4 14.3 8 14.1 7.6L14.8 6.3L13.7 5.2L12.4 5.9C12 5.7 11.6 5.5 11.2 5.4L10.8 4H9.2L8.8 5.4C8.4 5.5 8 5.7 7.6 5.9L6.3 5.2L5.2 6.3L5.9 7.6C5.7 8 5.5 8.4 5.4 8.8L4 9.2V10.8L5.4 11.2C5.5 11.6 5.7 12 5.9 12.4L5.2 13.7L6.3 14.8L7.6 14.1C8 14.3 8.4 14.5 8.8 14.6L9.2 16H10.8L11.2 14.6C11.6 14.5 12 14.3 12.4 14.1L13.7 14.8L14.8 13.7L14.1 12.4C14.3 12 14.5 11.6 14.6 11.2L16 10.8Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </header>
</template>
