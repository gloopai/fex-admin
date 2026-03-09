<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '../components/AppSidebar.vue'
import AppHeader from '../components/AppHeader.vue'

const route = useRoute()
const mobileMenuOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false
  }
)
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-[#f5f6f8]">
    <AppSidebar :mobile-open="mobileMenuOpen" @close="mobileMenuOpen = false" />

    <button
      v-if="mobileMenuOpen"
      type="button"
      class="fixed inset-0 z-30 bg-black/40 lg:hidden"
      aria-label="close menu mask"
      @click="mobileMenuOpen = false"
    ></button>

    <div class="flex min-w-0 flex-1 flex-col">
      <AppHeader @toggle-menu="mobileMenuOpen = !mobileMenuOpen" />
      <main class="min-h-0 flex-1 overflow-auto bg-white px-4 py-4 md:px-8 md:py-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
