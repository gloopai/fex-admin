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
      <h1 class="text-2xl font-bold text-gray-900">分佣奖金设置</h1>
      <p class="mt-1 text-sm text-gray-500">配置平台的分销与奖励逻辑</p>
    </div>

    <!-- 配置表单 -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-6 space-y-6">
        <!-- 自动执行分佣 -->
        <div class="flex items-start justify-between py-4 border-b">
          <div class="flex-1">
            <label class="text-base font-medium text-gray-900">
              是否自动执行分佣
            </label>
            <p class="mt-1 text-sm text-gray-500">
              开启后系统将自动计算并发放佣金，关闭则需要手动执行
            </p>
          </div>
          <div class="ml-4">
            <button
              @click="config.autoExecute = !config.autoExecute"
              :class="config.autoExecute ? 'bg-blue-600' : 'bg-gray-200'"
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span
                :class="config.autoExecute ? 'translate-x-5' : 'translate-x-0'"
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              />
            </button>
          </div>
        </div>

        <!-- 充值分销第一次才有 -->
        <div class="flex items-start justify-between py-4 border-b">
          <div class="flex-1">
            <label class="text-base font-medium text-gray-900">
              充值分销第一次才有
            </label>
            <p class="mt-1 text-sm text-gray-500">
              开启：仅第一次充值才分销；关闭：每次充值都会分销
            </p>
          </div>
          <div class="ml-4">
            <button
              @click="config.depositFirstOnly = !config.depositFirstOnly"
              :class="config.depositFirstOnly ? 'bg-blue-600' : 'bg-gray-200'"
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span
                :class="config.depositFirstOnly ? 'translate-x-5' : 'translate-x-0'"
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              />
            </button>
          </div>
        </div>

        <!-- 多级分销奖金设置 - 充值 -->
        <div class="py-4 border-b">
          <label class="block text-base font-medium text-gray-900 mb-2">
            多级分销奖金设置 - 充值
          </label>
          <input
            v-model="config.depositCommissionRates"
            type="text"
            placeholder="例如：0.1, 0.05, 0.03"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p class="mt-2 text-sm text-gray-500">
            设置多个用逗号隔开","，奖励10%请输入0.1。例如：0.1, 0.05, 0.03 表示一级10%，二级5%，三级3%
          </p>
          <div v-if="config.depositCommissionRates" class="mt-3 p-3 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-900 font-medium mb-2">预览分佣比例：</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(rate, index) in config.depositCommissionRates.split(',').map(r => r.trim()).filter(r => r)"
                :key="index"
                class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {{ index + 1 }}级: {{ (parseFloat(rate) * 100).toFixed(2) }}%
              </span>
            </div>
          </div>
        </div>

        <!-- 多级分销奖金设置 - 周期 -->
        <div class="py-4 border-b">
          <label class="block text-base font-medium text-gray-900 mb-2">
            多级分销奖金设置 - 周期产品
          </label>
          <input
            v-model="config.periodicCommissionRates"
            type="text"
            placeholder="例如：0.08, 0.04, 0.02"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p class="mt-2 text-sm text-gray-500">
            设置多个用逗号隔开","，留空表示不参与分销
          </p>
          <div v-if="config.periodicCommissionRates" class="mt-3 p-3 bg-purple-50 rounded-lg">
            <p class="text-sm text-purple-900 font-medium mb-2">预览分佣比例：</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(rate, index) in config.periodicCommissionRates.split(',').map(r => r.trim()).filter(r => r)"
                :key="index"
                class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
              >
                {{ index + 1 }}级: {{ (parseFloat(rate) * 100).toFixed(2) }}%
              </span>
            </div>
          </div>
        </div>

        <!-- 多级分销奖金设置 - 理财 -->
        <div class="py-4 border-b">
          <label class="block text-base font-medium text-gray-900 mb-2">
            多级分销奖金设置 - 理财产品
          </label>
          <input
            v-model="config.lendingCommissionRates"
            type="text"
            placeholder="例如：0.06, 0.03, 0.01"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p class="mt-2 text-sm text-gray-500">
            设置多个用逗号隔开","，留空表示不参与分销
          </p>
          <div v-if="config.lendingCommissionRates" class="mt-3 p-3 bg-green-50 rounded-lg">
            <p class="text-sm text-green-900 font-medium mb-2">预览分佣比例：</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(rate, index) in config.lendingCommissionRates.split(',').map(r => r.trim()).filter(r => r)"
                :key="index"
                class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {{ index + 1 }}级: {{ (parseFloat(rate) * 100).toFixed(2) }}%
              </span>
            </div>
          </div>
        </div>

        <!-- 多级分销奖金设置 - AI量化 -->
        <div class="py-4">
          <label class="block text-base font-medium text-gray-900 mb-2">
            多级分销奖金设置 - AI量化
          </label>
          <input
            v-model="config.aiQuantCommissionRates"
            type="text"
            placeholder="例如：0.08, 0.04, 0.02"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p class="mt-2 text-sm text-gray-500">
            设置多个用逗号隔开","，留空表示不参与分销
          </p>
          <div v-if="config.aiQuantCommissionRates" class="mt-3 p-3 bg-yellow-50 rounded-lg">
            <p class="text-sm text-yellow-900 font-medium mb-2">预览分佣比例：</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(rate, index) in config.aiQuantCommissionRates.split(',').map(r => r.trim()).filter(r => r)"
                :key="index"
                class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
              >
                {{ index + 1 }}级: {{ (parseFloat(rate) * 100).toFixed(2) }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="px-6 py-4 bg-gray-50 border-t flex justify-between items-center rounded-b-lg">
        <button
          @click="resetConfig"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          重置为默认
        </button>
        <button
          @click="saveConfig"
          :disabled="isSaving"
          :class="isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'"
          class="px-6 py-2 text-white rounded-lg transition-colors"
        >
          {{ isSaving ? '保存中...' : '确认保存' }}
        </button>
      </div>
    </div>

    <!-- 配置说明 -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-blue-900 mb-2">💡 配置说明</h3>
      <ul class="text-sm text-blue-800 space-y-1 list-disc list-inside">
        <li>佣金比例范围：0 到 1 之间的小数，例如 0.1 表示 10%</li>
        <li>多级设置：用逗号分隔，第一个数字是一级佣金，第二个是二级，以此类推</li>
        <li>留空处理：某个产品类型留空表示该类型不参与分销</li>
        <li>自动执行：开启后系统自动计算分佣，关闭需手动在分佣记录页面执行</li>
        <li>首充限制：仅对充值分销生效，其他产品类型不受影响</li>
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
