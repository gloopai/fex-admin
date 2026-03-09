<script setup>
import { ref } from 'vue'
import { verificationConfig } from '../../mock/verification'
import { VERIFICATION_LEVEL, VERIFICATION_DOC_TYPE_OPTIONS } from '../../constants/verification'

// 配置数据
const configs = ref({
  [VERIFICATION_LEVEL.NONE]: { ...verificationConfig[VERIFICATION_LEVEL.NONE] },
  [VERIFICATION_LEVEL.BASIC]: { ...verificationConfig[VERIFICATION_LEVEL.BASIC] },
  [VERIFICATION_LEVEL.ADVANCED]: { ...verificationConfig[VERIFICATION_LEVEL.ADVANCED] }
})

// 编辑状态
const editingLevel = ref(null)
const tempConfig = ref(null)

// Toast提示
const toast = ref({
  visible: false,
  message: ''
})

// 开始编辑
const startEdit = (level) => {
  editingLevel.value = level
  tempConfig.value = JSON.parse(JSON.stringify(configs.value[level]))
}

// 取消编辑
const cancelEdit = () => {
  editingLevel.value = null
  tempConfig.value = null
}

// 保存配置
const saveConfig = () => {
  if (editingLevel.value && tempConfig.value) {
    configs.value[editingLevel.value] = { ...tempConfig.value }
    editingLevel.value = null
    tempConfig.value = null
    // 这里可以添加API调用保存到后端
    showToast('配置保存成功！')
  }
}

// 获取证件类型标签
const getDocTypeLabel = (docType) => {
  const option = VERIFICATION_DOC_TYPE_OPTIONS.find(opt => opt.value === docType)
  return option ? option.label : docType
}

// 切换证件要求
const toggleDocument = (docType) => {
  if (!tempConfig.value) return
  const index = tempConfig.value.requireDocuments.indexOf(docType)
  if (index > -1) {
    tempConfig.value.requireDocuments.splice(index, 1)
  } else {
    tempConfig.value.requireDocuments.push(docType)
  }
}

// 检查是否需要某个证件
const requiresDocument = (level, docType) => {
  const config = editingLevel.value === level ? tempConfig.value : configs.value[level]
  return config.requireDocuments.includes(docType)
}

// 显示Toast提示
const showToast = (message) => {
  toast.value.message = message
  toast.value.visible = true
  setTimeout(() => {
    toast.value.visible = false
  }, 3000)
}
</script>

<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">认证权限配置</h1>
      <p class="mt-1 text-sm text-gray-600">管理不同认证等级的权限和要求</p>
    </div>

    <!-- 配置卡片列表 -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- 未认证配置 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4">
          <h3 class="text-lg font-semibold text-white">未认证用户</h3>
          <p class="text-sm text-gray-100 mt-1">{{ configs[VERIFICATION_LEVEL.NONE].description }}</p>
        </div>
        
        <div class="p-6 space-y-4">
          <template v-if="editingLevel === VERIFICATION_LEVEL.NONE">
            <!-- 编辑模式 -->
            <div class="space-y-3">
              <label class="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  v-model="tempConfig.canDeposit"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <span class="text-sm text-gray-700">允许入金</span>
              </label>
              
              <label class="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  v-model="tempConfig.canTrade"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <span class="text-sm text-gray-700">允许交易</span>
              </label>
              
              <label class="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  v-model="tempConfig.canWithdraw"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <span class="text-sm text-gray-700">允许提币</span>
              </label>

              <div>
                <label class="block text-sm text-gray-700 mb-1">每日提币限额（USDT）</label>
                <input 
                  type="number" 
                  v-model.number="tempConfig.withdrawLimit"
                  placeholder="留空表示无限制"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
            </div>

            <div class="flex space-x-2 pt-4 border-t">
              <button 
                @click="saveConfig"
                class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
              <button 
                @click="cancelEdit"
                class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
            </div>
          </template>

          <template v-else>
            <!-- 展示模式 -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">入金权限</span>
                <span :class="configs[VERIFICATION_LEVEL.NONE].canDeposit ? 'text-emerald-600' : 'text-rose-600'" class="text-sm font-medium">
                  {{ configs[VERIFICATION_LEVEL.NONE].canDeposit ? '✓ 允许' : '✗ 禁止' }}
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">交易权限</span>
                <span :class="configs[VERIFICATION_LEVEL.NONE].canTrade ? 'text-emerald-600' : 'text-rose-600'" class="text-sm font-medium">
                  {{ configs[VERIFICATION_LEVEL.NONE].canTrade ? '✓ 允许' : '✗ 禁止' }}
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">提币权限</span>
                <span :class="configs[VERIFICATION_LEVEL.NONE].canWithdraw ? 'text-emerald-600' : 'text-rose-600'" class="text-sm font-medium">
                  {{ configs[VERIFICATION_LEVEL.NONE].canWithdraw ? '✓ 允许' : '✗ 禁止' }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">提币限额</span>
                <span class="text-sm font-medium text-gray-900">
                  {{ configs[VERIFICATION_LEVEL.NONE].withdrawLimit ? `${configs[VERIFICATION_LEVEL.NONE].withdrawLimit.toLocaleString()} USDT/日` : '无限制' }}
                </span>
              </div>

              <div class="pt-3 border-t">
                <span class="text-sm text-gray-600">需要证件</span>
                <div class="mt-2 text-sm text-gray-500">
                  {{ configs[VERIFICATION_LEVEL.NONE].requireDocuments.length === 0 ? '无需上传证件' : configs[VERIFICATION_LEVEL.NONE].requireDocuments.map(getDocTypeLabel).join('、') }}
                </div>
              </div>
            </div>

            <button 
              @click="startEdit(VERIFICATION_LEVEL.NONE)"
              class="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              编辑配置
            </button>
          </template>
        </div>
      </div>

      <!-- 普通认证配置 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <h3 class="text-lg font-semibold text-white">普通认证用户</h3>
          <p class="text-sm text-blue-100 mt-1">{{ configs[VERIFICATION_LEVEL.BASIC].description }}</p>
        </div>
        
        <div class="p-6 space-y-4">
          <template v-if="editingLevel === VERIFICATION_LEVEL.BASIC">
            <!-- 编辑模式 -->
            <div class="space-y-3">
              <label class="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  v-model="tempConfig.canDeposit"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <span class="text-sm text-gray-700">允许入金</span>
              </label>
              
              <label class="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  v-model="tempConfig.canTrade"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <span class="text-sm text-gray-700">允许交易</span>
              </label>
              
              <label class="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  v-model="tempConfig.canWithdraw"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <span class="text-sm text-gray-700">允许提币</span>
              </label>

              <div>
                <label class="block text-sm text-gray-700 mb-1">每日提币限额（USDT）</label>
                <input 
                  type="number" 
                  v-model.number="tempConfig.withdrawLimit"
                  placeholder="留空表示无限制"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
              </div>

              <div class="pt-3 border-t">
                <label class="block text-sm text-gray-700 mb-2">需要上传的证件</label>
                <div class="space-y-2">
                  <label 
                    v-for="docType in VERIFICATION_DOC_TYPE_OPTIONS" 
                    :key="docType.value"
                    class="flex items-center space-x-2"
                  >
                    <input 
                      type="checkbox" 
                      :checked="requiresDocument(VERIFICATION_LEVEL.BASIC, docType.value)"
                      @change="toggleDocument(docType.value)"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                    <span class="text-sm text-gray-700">{{ docType.label }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="flex space-x-2 pt-4 border-t">
              <button 
                @click="saveConfig"
                class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
              <button 
                @click="cancelEdit"
                class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
            </div>
          </template>

          <template v-else>
            <!-- 展示模式 -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">入金权限</span>
                <span :class="configs[VERIFICATION_LEVEL.BASIC].canDeposit ? 'text-emerald-600' : 'text-rose-600'" class="text-sm font-medium">
                  {{ configs[VERIFICATION_LEVEL.BASIC].canDeposit ? '✓ 允许' : '✗ 禁止' }}
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">交易权限</span>
                <span :class="configs[VERIFICATION_LEVEL.BASIC].canTrade ? 'text-emerald-600' : 'text-rose-600'" class="text-sm font-medium">
                  {{ configs[VERIFICATION_LEVEL.BASIC].canTrade ? '✓ 允许' : '✗ 禁止' }}
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">提币权限</span>
                <span :class="configs[VERIFICATION_LEVEL.BASIC].canWithdraw ? 'text-emerald-600' : 'text-rose-600'" class="text-sm font-medium">
                  {{ configs[VERIFICATION_LEVEL.BASIC].canWithdraw ? '✓ 允许' : '✗ 禁止' }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">提币限额</span>
                <span class="text-sm font-medium text-gray-900">
                  {{ configs[VERIFICATION_LEVEL.BASIC].withdrawLimit ? `${configs[VERIFICATION_LEVEL.BASIC].withdrawLimit.toLocaleString()} USDT/日` : '无限制' }}
                </span>
              </div>

              <div class="pt-3 border-t">
                <span class="text-sm text-gray-600">需要证件</span>
                <div class="mt-2 text-sm text-gray-500">
                  {{ configs[VERIFICATION_LEVEL.BASIC].requireDocuments.length === 0 ? '无需上传证件' : configs[VERIFICATION_LEVEL.BASIC].requireDocuments.map(getDocTypeLabel).join('、') }}
                </div>
              </div>
            </div>

            <button 
              @click="startEdit(VERIFICATION_LEVEL.BASIC)"
              class="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              编辑配置
            </button>
          </template>
        </div>
      </div>

      <!-- 高级认证配置 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
          <h3 class="text-lg font-semibold text-white">高级认证用户</h3>
          <p class="text-sm text-purple-100 mt-1">{{ configs[VERIFICATION_LEVEL.ADVANCED].description }}</p>
        </div>
        
        <div class="p-6 space-y-4">
          <template v-if="editingLevel === VERIFICATION_LEVEL.ADVANCED">
            <!-- 编辑模式 -->
            <div class="space-y-3">
              <label class="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  v-model="tempConfig.canDeposit"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <span class="text-sm text-gray-700">允许入金</span>
              </label>
              
              <label class="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  v-model="tempConfig.canTrade"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <span class="text-sm text-gray-700">允许交易</span>
              </label>
              
              <label class="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  v-model="tempConfig.canWithdraw"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <span class="text-sm text-gray-700">允许提币</span>
              </label>

              <div>
                <label class="block text-sm text-gray-700 mb-1">每日提币限额（USDT）</label>
                <input 
                  type="number" 
                  v-model.number="tempConfig.withdrawLimit"
                  placeholder="留空表示无限制"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
              </div>

              <div class="pt-3 border-t">
                <label class="block text-sm text-gray-700 mb-2">需要上传的证件</label>
                <div class="space-y-2">
                  <label 
                    v-for="docType in VERIFICATION_DOC_TYPE_OPTIONS" 
                    :key="docType.value"
                    class="flex items-center space-x-2"
                  >
                    <input 
                      type="checkbox" 
                      :checked="requiresDocument(VERIFICATION_LEVEL.ADVANCED, docType.value)"
                      @change="toggleDocument(docType.value)"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                    <span class="text-sm text-gray-700">{{ docType.label }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="flex space-x-2 pt-4 border-t">
              <button 
                @click="saveConfig"
                class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
              <button 
                @click="cancelEdit"
                class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
            </div>
          </template>

          <template v-else>
            <!-- 展示模式 -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">入金权限</span>
                <span :class="configs[VERIFICATION_LEVEL.ADVANCED].canDeposit ? 'text-emerald-600' : 'text-rose-600'" class="text-sm font-medium">
                  {{ configs[VERIFICATION_LEVEL.ADVANCED].canDeposit ? '✓ 允许' : '✗ 禁止' }}
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">交易权限</span>
                <span :class="configs[VERIFICATION_LEVEL.ADVANCED].canTrade ? 'text-emerald-600' : 'text-rose-600'" class="text-sm font-medium">
                  {{ configs[VERIFICATION_LEVEL.ADVANCED].canTrade ? '✓ 允许' : '✗ 禁止' }}
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">提币权限</span>
                <span :class="configs[VERIFICATION_LEVEL.ADVANCED].canWithdraw ? 'text-emerald-600' : 'text-rose-600'" class="text-sm font-medium">
                  {{ configs[VERIFICATION_LEVEL.ADVANCED].canWithdraw ? '✓ 允许' : '✗ 禁止' }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">提币限额</span>
                <span class="text-sm font-medium text-gray-900">
                  {{ configs[VERIFICATION_LEVEL.ADVANCED].withdrawLimit ? `${configs[VERIFICATION_LEVEL.ADVANCED].withdrawLimit.toLocaleString()} USDT/日` : '无限制' }}
                </span>
              </div>

              <div class="pt-3 border-t">
                <span class="text-sm text-gray-600">需要证件</span>
                <div class="mt-2 text-sm text-gray-500">
                  {{ configs[VERIFICATION_LEVEL.ADVANCED].requireDocuments.length === 0 ? '无需上传证件' : configs[VERIFICATION_LEVEL.ADVANCED].requireDocuments.map(getDocTypeLabel).join('、') }}
                </div>
              </div>
            </div>

            <button 
              @click="startEdit(VERIFICATION_LEVEL.ADVANCED)"
              class="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              编辑配置
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- 配置说明 -->
    <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <h3 class="text-sm font-semibold text-blue-900 mb-3">配置说明</h3>
      <ul class="space-y-2 text-sm text-blue-800">
        <li class="flex items-start">
          <span class="mr-2">•</span>
          <span><strong>未认证用户：</strong>未完成任何身份认证的用户，可以根据需求开放部分功能</span>
        </li>
        <li class="flex items-start">
          <span class="mr-2">•</span>
          <span><strong>普通认证：</strong>完成基础身份信息认证的用户，可设置提币限额</span>
        </li>
        <li class="flex items-start">
          <span class="mr-2">•</span>
          <span><strong>高级认证：</strong>完成完整身份认证的用户，通常给予最高权限和无限额度</span>
        </li>
        <li class="flex items-start">
          <span class="mr-2">•</span>
          <span>修改配置后将立即对所有该等级用户生效，请谨慎操作</span>
        </li>
      </ul>
    </div>

    <!-- 成功提示 Toast -->
    <div 
      v-if="toast.visible"
      class="fixed top-4 right-4 z-50 bg-white border border-emerald-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 animate-slide-in"
    >
      <div class="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <span class="text-sm font-medium text-slate-900">{{ toast.message }}</span>
    </div>
  </div>
</template>

<style scoped>
/* 自定义样式 */
</style>
