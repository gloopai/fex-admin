<script setup>
import CrossPlatformFloatNav from '../components/CrossPlatformFloatNav.vue'
import FrontBottomTabBar from '../components/FrontBottomTabBar.vue'
import FrontTopNav from '../components/FrontTopNav.vue'
</script>

<template>
  <div
    class="min-h-screen bg-[#050505] pb-[calc(0.5rem+3.5rem+0.6rem+env(safe-area-inset-bottom,0px))] text-white lg:pb-0"
  >
    <FrontTopNav prefix="/front" />
    <RouterView />
    <FrontBottomTabBar prefix="/front" />
    <CrossPlatformFloatNav />
  </div>
</template>
