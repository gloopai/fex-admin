<script setup>
import CrossPlatformFloatNav from '../components/CrossPlatformFloatNav.vue'
import FrontTopNav from '../components/FrontTopNav.vue'
</script>

<template>
  <div class="min-h-screen bg-black text-white">
    <FrontTopNav prefix="/m" variant="mobile" />
    <RouterView />
    <CrossPlatformFloatNav />
  </div>
</template>
