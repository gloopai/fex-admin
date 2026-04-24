<script setup>
/** 金融路由壳：仅提供全宽底色与安全区高度，频道页各自负责 Hero 与版式 */
</script>

<template>
  <div
    class="min-h-[calc(100vh-3.5rem)] max-lg:min-h-[calc(100vh-3.5rem-0.5rem-3.5rem-0.6rem-env(safe-area-inset-bottom,0px))] bg-[#030304] text-white"
  >
    <RouterView />
  </div>
</template>
