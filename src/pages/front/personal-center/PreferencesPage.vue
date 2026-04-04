<script setup>
import { ref } from 'vue'

const nickname = ref('交易用户 143')
const language = ref('zh-CN')
const timezone = ref('Asia/Shanghai')
const orderConfirm = ref(true)
const priceAlertSound = ref(false)

const languages = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' },
  { value: 'zh-TW', label: '繁體中文' }
]

const timezones = [
  { value: 'Asia/Shanghai', label: 'UTC+8 北京/新加坡' },
  { value: 'Asia/Tokyo', label: 'UTC+9 东京' },
  { value: 'UTC', label: 'UTC+0' }
]

const savedHint = ref('')

function save() {
  savedHint.value = '已保存（前端示例，对接接口后写入服务端）'
  window.setTimeout(() => {
    savedHint.value = ''
  }, 2600)
}
</script>

<template>
  <div>
    <header class="mb-6 md:mb-8">
      <h1 class="text-2xl font-bold tracking-tight text-white md:text-3xl">账户设置</h1>
      <p class="mt-1 text-sm text-white/55">
        昵称与显示偏好；敏感变更仍需在安全中心完成验证。
      </p>
    </header>

    <p
      v-if="savedHint"
      class="mb-4 rounded-xl border border-lime-400/30 bg-lime-400/10 px-4 py-2 text-sm text-lime-100/95"
      role="status"
    >
      {{ savedHint }}
    </p>

    <section class="space-y-6">
      <div class="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5">
        <h2 class="text-sm font-semibold text-white/90">基本资料</h2>
        <label class="mt-4 block">
          <span class="text-xs text-white/50">昵称（前台展示）</span>
          <input
            v-model="nickname"
            type="text"
            class="mt-1.5 w-full max-w-md rounded-lg border border-white/15 bg-black/40 px-3 py-3 text-sm text-white focus:border-lime-400/50 focus:outline-none focus:ring-1 focus:ring-lime-400/30"
          />
        </label>
      </div>

      <div class="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5">
        <h2 class="text-sm font-semibold text-white/90">语言与时区</h2>
        <div class="mt-4 grid gap-4 sm:max-w-xl sm:grid-cols-2">
          <label class="block">
            <span class="text-xs text-white/50">界面语言</span>
            <select
              v-model="language"
              class="mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-3 text-sm text-white focus:border-lime-400/50 focus:outline-none"
            >
              <option v-for="o in languages" :key="o.value" :value="o.value">
                {{ o.label }}
              </option>
            </select>
          </label>
          <label class="block">
            <span class="text-xs text-white/50">默认时区</span>
            <select
              v-model="timezone"
              class="mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-3 text-sm text-white focus:border-lime-400/50 focus:outline-none"
            >
              <option v-for="o in timezones" :key="o.value" :value="o.value">
                {{ o.label }}
              </option>
            </select>
          </label>
        </div>
      </div>

      <div class="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5">
        <h2 class="text-sm font-semibold text-white/90">交易体验</h2>
        <label class="mt-4 flex cursor-pointer items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <span class="text-sm text-white/75">下单前二次确认</span>
          <input
            v-model="orderConfirm"
            type="checkbox"
            class="h-4 w-4 rounded border-white/25 bg-black/40 text-lime-400 focus:ring-lime-400/40"
          />
        </label>
        <label class="mt-4 flex cursor-pointer items-center justify-between gap-3">
          <span class="text-sm text-white/75">价格波动提示音</span>
          <input
            v-model="priceAlertSound"
            type="checkbox"
            class="h-4 w-4 rounded border-white/25 bg-black/40 text-lime-400 focus:ring-lime-400/40"
          />
        </label>
      </div>

      <button
        type="button"
        class="rounded-lg bg-lime-400 px-6 py-3 text-sm font-semibold text-black hover:bg-lime-300"
        @click="save"
      >
        保存设置
      </button>
    </section>
  </div>
</template>
