<script setup>
import CrossPlatformFloatNav from '../components/CrossPlatformFloatNav.vue'
import FrontTopNav from '../components/FrontTopNav.vue'
</script>

<template>
  <div class="min-h-screen bg-[#050505] text-white">
    <FrontTopNav prefix="/front" variant="desktop" />
    <RouterView />
    <CrossPlatformFloatNav />
  </div>
</template>
