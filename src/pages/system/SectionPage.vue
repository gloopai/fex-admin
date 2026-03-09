<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const title = computed(() => route.meta.title || '模块页面')
const desc = computed(() => route.meta.desc || '这里是示例占位页，可替换为真实业务页面。')
</script>

<template>
  <section class="space-y-5">
    <header>
      <h1 class="text-[30px] font-semibold text-slate-900">{{ title }}</h1>
      <p class="mt-2 text-sm text-slate-500">{{ desc }}</p>
    </header>

    <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p class="text-sm leading-7 text-slate-600">
        当前脚手架已经支持全屏布局、顶部工具栏和左侧多级导航。你可以在该页面接入真实的 API、表格、表单和权限逻辑。
      </p>
    </article>
  </section>
</template>
