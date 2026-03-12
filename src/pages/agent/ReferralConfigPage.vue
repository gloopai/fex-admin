<script setup>
import { ref, onMounted } from 'vue'
import { mockReferralConfig, referralApi } from '../../mock/referral'
import { DEFAULT_REFERRAL_CONFIG } from '../../constants/referral'

// 配置表单
const config = ref({...mockReferralConfig})

// 保存状态
const isSaving = ref(false)

// 加载配置
const loadConfig = async () => {
  try {
    const result = await referralApi.getReferralConfig()
    if (result.success) {
      config.value = result.data
    }
  } catch (error) {
    console.error('Failed to load config:', error)
  }
}

// 保存配置
const saveConfig = async () => {
  // 验证佣金比例格式
  const validateRates = (rates) => {
    if (!rates.trim()) return true
    const values = rates.split(',').map(v => v.trim())
    return values.every(v => {
      const num = parseFloat(v)
      return !isNaN(num) && num >= 0 && num <= 1
    })
  }
  
  if (!validateRates(config.value.depositCommissionRates)) {
    alert('充值佣金比例格式错误，请输入0-1之间的数字，多个用逗号隔开')
    return
  }
  
  if (!validateRates(config.value.periodicCommissionRates)) {
    alert('周期产品佣金比例格式错误')
    return
  }
  
  if (!validateRates(config.value.lendingCommissionRates)) {
    alert('理财产品佣金比例格式错误')
    return
  }
  
  if (!validateRates(config.value.aiQuantCommissionRates)) {
    alert('AI量化佣金比例格式错误')
    return
  }
  
  isSaving.value = true
  
  try {
    const result = await referralApi.updateReferralConfig(config.value)
    if (result.success) {
      alert(result.message)
    }
  } catch (error) {
    alert('保存失败：' + error.message)
  } finally {
    isSaving.value = false
  }
}

// 重置配置
const resetConfig = () => {
  if (confirm('确认重置为默认配置？')) {
    config.value = {...DEFAULT_REFERRAL_CONFIG}
  }
}

// 页面加载时获取配置
onMounted(() => {
  loadConfig()
})
</script>

<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900">分佣奖金设置</h1>
      <p class="mt-1 text-sm text-slate-500">配置平台的分销与奖励逻辑</p>
    </div>

    <!-- 配置卡片 -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="flex items-center justify-between border-b border-slate-200 p-4 bg-white">
        <h3 class="text-base font-semibold text-slate-900">奖金配置</h3>
        <button
          @click="saveConfig"
          :disabled="isSaving"
          class="ant-btn ant-btn-primary"
        >
          {{ isSaving ? '保存中...' : '确认保存' }}
        </button>
      </div>

      <div class="p-6 space-y-6">
        <!-- 自动执行分佣 -->
        <div class="flex items-start justify-between py-4 border-b border-slate-100">
          <div class="flex-1">
            <label class="text-base font-medium text-slate-900">
              是否自动执行分佣
            </label>
            <p class="mt-1 text-sm text-slate-500">
              开启后系统将自动计算并发放佣金，关闭则需要手动执行
            </p>
          </div>
          <div class="ml-4">
            <button
              @click="config.autoExecute = !config.autoExecute"
              :class="config.autoExecute ? 'bg-blue-600' : 'bg-slate-200'"
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            >
              <span
                :class="config.autoExecute ? 'translate-x-5' : 'translate-x-0'"
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              />
            </button>
          </div>
        </div>

        <!-- 充值分销第一次才有 -->
        <div class="flex items-start justify-between py-4 border-b border-slate-100">
          <div class="flex-1">
            <label class="text-base font-medium text-slate-900">
              充值分销第一次才有
            </label>
            <p class="mt-1 text-sm text-slate-500">
              开启：仅第一次充值才分销；关闭：每次充值都会分销
            </p>
          </div>
          <div class="ml-4">
            <button
              @click="config.depositFirstOnly = !config.depositFirstOnly"
              :class="config.depositFirstOnly ? 'bg-blue-600' : 'bg-slate-200'"
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            >
              <span
                :class="config.depositFirstOnly ? 'translate-x-5' : 'translate-x-0'"
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              />
            </button>
          </div>
        </div>

        <!-- 多级分销奖金设置 - 充值 -->
        <div class="py-4 border-b border-slate-100">
          <label class="block text-base font-medium text-slate-900 mb-2">
            多级分销奖金设置 - 充值
          </label>
          <input
            v-model="config.depositCommissionRates"
            type="text"
            placeholder="例如：0.1, 0.05, 0.03"
            class="ant-input"
          />
          <p class="mt-2 text-sm text-slate-500 italic">
            设置多个用逗号隔开","，奖励10%请输入0.1。例如：0.1, 0.05, 0.03 表示一级10%，二级5%，三级3%
          </p>
          <div v-if="config.depositCommissionRates" class="mt-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
            <p class="text-sm text-blue-900 font-semibold mb-2">预览分佣比例：</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(rate, index) in config.depositCommissionRates.split(',').map(r => r.trim()).filter(r => r)"
                :key="index"
                class="px-3 py-1 bg-blue-100/50 text-blue-700 rounded-lg text-xs font-bold border border-blue-200"
              >
                {{ index + 1 }}级: {{ (parseFloat(rate) * 100).toFixed(2) }}%
              </span>
            </div>
          </div>
        </div>

        <!-- 多级分销奖金设置 - 周期 -->
        <div class="py-4 border-b border-slate-100">
          <label class="block text-base font-medium text-slate-900 mb-2">
            多级分销奖金设置 - 周期产品
          </label>
          <input
            v-model="config.periodicCommissionRates"
            type="text"
            placeholder="例如：0.08, 0.04, 0.02"
            class="ant-input"
          />
          <p class="mt-2 text-sm text-slate-500 italic">
            设置多个用逗号隔开","，留空表示不参与分销
          </p>
          <div v-if="config.periodicCommissionRates" class="mt-3 p-4 bg-purple-50/50 rounded-xl border border-purple-100/50">
            <p class="text-sm text-purple-900 font-semibold mb-2">预览分佣比例：</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(rate, index) in config.periodicCommissionRates.split(',').map(r => r.trim()).filter(r => r)"
                :key="index"
                class="px-3 py-1 bg-purple-100/50 text-purple-700 rounded-lg text-xs font-bold border border-purple-200"
              >
                {{ index + 1 }}级: {{ (parseFloat(rate) * 100).toFixed(2) }}%
              </span>
            </div>
          </div>
        </div>

        <!-- 多级分销奖金设置 - 理财 -->
        <div class="py-4 border-b border-slate-100">
          <label class="block text-base font-medium text-slate-900 mb-2">
            多级分销奖金设置 - 理财产品
          </label>
          <input
            v-model="config.lendingCommissionRates"
            type="text"
            placeholder="例如：0.06, 0.03, 0.01"
            class="ant-input"
          />
          <p class="mt-2 text-sm text-slate-500 italic">
            设置多个用逗号隔开","，留空表示不参与分销
          </p>
          <div v-if="config.lendingCommissionRates" class="mt-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
            <p class="text-sm text-emerald-900 font-semibold mb-2">预览分佣比例：</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(rate, index) in config.lendingCommissionRates.split(',').map(r => r.trim()).filter(r => r)"
                :key="index"
                class="px-3 py-1 bg-emerald-100/50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200"
              >
                {{ index + 1 }}级: {{ (parseFloat(rate) * 100).toFixed(2) }}%
              </span>
            </div>
          </div>
        </div>

        <!-- 多级分销奖金设置 - AI量化 -->
        <div class="py-4">
          <label class="block text-base font-medium text-slate-900 mb-2">
            多级分销奖金设置 - AI量化
          </label>
          <input
            v-model="config.aiQuantCommissionRates"
            type="text"
            placeholder="例如：0.08, 0.04, 0.02"
            class="ant-input"
          />
          <p class="mt-2 text-sm text-slate-500 italic">
            设置多个用逗号隔开","，留空表示不参与分销
          </p>
          <div v-if="config.aiQuantCommissionRates" class="mt-3 p-4 bg-amber-50/50 rounded-xl border border-amber-100/50">
            <p class="text-sm text-amber-900 font-semibold mb-2">预览分佣比例：</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(rate, index) in config.aiQuantCommissionRates.split(',').map(r => r.trim()).filter(r => r)"
                :key="index"
                class="px-3 py-1 bg-amber-100/50 text-amber-700 rounded-lg text-xs font-bold border border-amber-200"
              >
                {{ index + 1 }}级: {{ (parseFloat(rate) * 100).toFixed(2) }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-start items-center">
        <button
          @click="resetConfig"
          class="ant-btn"
        >
          重置为默认
        </button>
      </div>
    </div>

    <!-- 配置说明 -->
    <div class="bg-blue-50/50 border border-blue-200 rounded-xl p-5 shadow-sm">
      <h3 class="text-sm font-bold text-blue-900 mb-3 flex items-center">
        <span class="mr-2">💡</span> 配置说明
      </h3>
      <ul class="text-sm text-blue-800 space-y-2 list-none">
        <li class="flex items-start">
          <span class="text-blue-400 mr-2">•</span>
          <span>佣金比例范围：0 到 1 之间的小数，例如 0.1 表示 10%</span>
        </li>
        <li class="flex items-start">
          <span class="text-blue-400 mr-2">•</span>
          <span>多级设置：用逗号分隔，第一个数字是一级佣金，第二个是二级，以此类推</span>
        </li>
        <li class="flex items-start">
          <span class="text-blue-400 mr-2">•</span>
          <span>留空处理：某个 product 类型留空表示该类型不参与分销</span>
        </li>
        <li class="flex items-start">
          <span class="text-blue-400 mr-2">•</span>
          <span>自动执行：开启后系统自动计算分佣，关闭需手动在分佣记录页面执行</span>
        </li>
        <li class="flex items-start">
          <span class="text-blue-400 mr-2">•</span>
          <span>首充限制：仅对充值分销生效，其他产品类型不受影响</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* Toggle switch transitions */
button:focus {
  outline: none;
}
</style>
