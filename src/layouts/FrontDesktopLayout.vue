<script setup>
import { onMounted, onUnmounted } from 'vue'
import CrossPlatformFloatNav from '../components/CrossPlatformFloatNav.vue'
import FrontBottomTabBar from '../components/FrontBottomTabBar.vue'
import FrontTopNav from '../components/FrontTopNav.vue'

/** 与 tailwind.css 中 html.front-site 规则对应：统一文档底色、禁止拉出浅底/白边 */
const FRONT_DOC_CLASS = 'front-site'

onMounted(() => {
  document.documentElement.classList.add(FRONT_DOC_CLASS)
  document.body.classList.add(FRONT_DOC_CLASS)
})
onUnmounted(() => {
  document.documentElement.classList.remove(FRONT_DOC_CLASS)
  document.body.classList.remove(FRONT_DOC_CLASS)
})
</script>

<template>
  <div
    class="min-h-screen min-h-[100dvh] w-full max-w-[100vw] bg-[#050505] pb-[calc(0.5rem+3.5rem+0.6rem+env(safe-area-inset-bottom,0px))] text-white lg:min-h-screen lg:pb-0"
  >
    <FrontTopNav prefix="/front" />
    <!--
      横向裁剪用 clip 而非 hidden：hidden 会让多数浏览器把 overflow-y 算成 auto，
      本层变成滚动容器，破坏子页面里 sticky（如交易页 top-14 条）并出现布局错位/侧边露底。
    -->
    <div class="min-w-0 w-full overflow-x-clip overflow-y-visible">
      <RouterView />
    </div>
    <FrontBottomTabBar prefix="/front" />
    <CrossPlatformFloatNav />
  </div>
</template>
