<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getAllCreditScoreConfig, updateCreditScoreConfigs } from '../../mock/creditScore'
import { CREDIT_SCORE_CONFIG_KEYS, CREDIT_SCORE_CHANGE_TYPE, CREDIT_SCORE_CHANGE_TYPE_OPTIONS } from '../../constants/creditScore'

// 当前激活的标签
const activeTab = ref('basic')

// 表单数据
const formData = ref({
  enabled: true,
  maxScore: 100,
  initialScore: 60,
  rechargeAmount: 100000,
  primaryKycScore: 0,
  advancedKycScore: 0,
  autoUpgradeVip1Enabled: true,
  autoUpgradeVip1Score: 61,
  vipUpgradeRechargeAmount: 100000,
  
  // 扣除规则
  deductionEnabled: true,
  violationScore: 10,
  abnormalTradeScore: 5,
  inactiveDays: 90,
  inactiveScore: 3,
  withdrawFailScore: 2,
  disputeScore: 8,
  maliciousScore: 20,
  riskAlertScore: 5,
  minScore: 0,
  
  // 人工审核
  manualAuditEnabled: true,
  manualAuditThreshold: 10,
  manualAuditTypes: [
    CREDIT_SCORE_CHANGE_TYPE.MANUAL_ADJUST,
    CREDIT_SCORE_CHANGE_TYPE.PENALTY,
    CREDIT_SCORE_CHANGE_TYPE.REWARD
  ]
})

// 保存状态
const isSaving = ref(false)
const saveSuccess = ref(false)
const hasUnsavedChanges = ref(false)

// 验证错误
const validationErrors = ref({
  initialScore: '',
  rechargeAmount: '',
  autoUpgradeVip1Score: ''
})

// 计算器输入
const calculatorInputs = ref({
  rechargeAmount: 500000,
  hasPrimaryKyc: false,
  hasAdvancedKyc: false,
  
  // 扣除场景
  hasViolation: false,
  hasAbnormalTrade: false,
  hasDispute: false
})

// 配置模板
const configTemplates = [
  {
    name: '保守型',
    description: '严格的信用分规则，重惩罚',
    icon: '🛡️',
    config: {
      maxScore: 100,
      initialScore: 50,
      rechargeAmount: 200000,
      primaryKycScore: 5,
      advancedKycScore: 10,
      autoUpgradeVip1Enabled: true,
      autoUpgradeVip1Score: 70,
      vipUpgradeRechargeAmount: 200000,
      deductionEnabled: true,
      violationScore: 15,
      abnormalTradeScore: 8,
      inactiveDays: 60,
      inactiveScore: 5,
      withdrawFailScore: 3,
      disputeScore: 10,
      maliciousScore: 30,
      riskAlertScore: 8,
      minScore: 0
    }
  },
  {
    name: '标准型',
    description: '平衡的奖惩规则',
    icon: '⚖️',
    config: {
      maxScore: 100,
      initialScore: 60,
      rechargeAmount: 100000,
      primaryKycScore: 0,
      advancedKycScore: 0,
      autoUpgradeVip1Enabled: true,
      autoUpgradeVip1Score: 61,
      vipUpgradeRechargeAmount: 100000,
      deductionEnabled: true,
      violationScore: 10,
      abnormalTradeScore: 5,
      inactiveDays: 90,
      inactiveScore: 3,
      withdrawFailScore: 2,
      disputeScore: 8,
      maliciousScore: 20,
      riskAlertScore: 5,
      minScore: 0
    }
  },
  {
    name: '激进型',
    description: '容易获得，轻惩罚',
    icon: '🚀',
    config: {
      maxScore: 100,
      initialScore: 70,
      rechargeAmount: 50000,
      primaryKycScore: 3,
      advancedKycScore: 5,
      autoUpgradeVip1Enabled: true,
      autoUpgradeVip1Score: 75,
      vipUpgradeRechargeAmount: 50000,
      deductionEnabled: true,
      violationScore: 5,
      abnormalTradeScore: 3,
      inactiveDays: 120,
      inactiveScore: 2,
      withdrawFailScore: 1,
      disputeScore: 5,
      maliciousScore: 15,
      riskAlertScore: 3,
      minScore: 20
    }
  }
]

// 计算总信用分
const calculatedScore = computed(() => {
  let score = formData.value.initialScore
  
  // 充值增加
  if (formData.value.rechargeAmount > 0) {
    const rechargeScore = Math.floor(calculatorInputs.value.rechargeAmount / formData.value.rechargeAmount)
    score += rechargeScore
  }
  
  // 认证增加
  if (calculatorInputs.value.hasPrimaryKyc) {
    score += formData.value.primaryKycScore
  }
  if (calculatorInputs.value.hasAdvancedKyc) {
    score += formData.value.advancedKycScore
  }
  
  // 扣除场景（如果启用扣除规则）
  if (formData.value.deductionEnabled) {
    if (calculatorInputs.value.hasViolation) {
      score -= formData.value.violationScore
    }
    if (calculatorInputs.value.hasAbnormalTrade) {
      score -= formData.value.abnormalTradeScore
    }
    if (calculatorInputs.value.hasDispute) {
      score -= formData.value.disputeScore
    }
  }
  
  // 不超过最大值，不低于最小值
  return Math.max(formData.value.minScore, Math.min(score, formData.value.maxScore))
})

// 计算能否升级VIP1
const canUpgradeToVip1 = computed(() => {
  return formData.value.autoUpgradeVip1Enabled && 
         calculatedScore.value >= formData.value.autoUpgradeVip1Score
})

// 加载配置
onMounted(() => {
  const config = getAllCreditScoreConfig()
  formData.value = {
    enabled: config[CREDIT_SCORE_CONFIG_KEYS.ENABLED],
    maxScore: config[CREDIT_SCORE_CONFIG_KEYS.MAX_SCORE],
    initialScore: config[CREDIT_SCORE_CONFIG_KEYS.INITIAL_SCORE],
    rechargeAmount: config[CREDIT_SCORE_CONFIG_KEYS.RECHARGE_AMOUNT],
    primaryKycScore: config[CREDIT_SCORE_CONFIG_KEYS.PRIMARY_KYC_SCORE],
    advancedKycScore: config[CREDIT_SCORE_CONFIG_KEYS.ADVANCED_KYC_SCORE],
    autoUpgradeVip1Enabled: config[CREDIT_SCORE_CONFIG_KEYS.AUTO_UPGRADE_VIP1_ENABLED],
    autoUpgradeVip1Score: config[CREDIT_SCORE_CONFIG_KEYS.AUTO_UPGRADE_VIP1_SCORE],
    vipUpgradeRechargeAmount: config[CREDIT_SCORE_CONFIG_KEYS.VIP_UPGRADE_RECHARGE_AMOUNT],
    
    // 扣除规则
    deductionEnabled: config[CREDIT_SCORE_CONFIG_KEYS.DEDUCTION_ENABLED],
    violationScore: config[CREDIT_SCORE_CONFIG_KEYS.VIOLATION_SCORE],
    abnormalTradeScore: config[CREDIT_SCORE_CONFIG_KEYS.ABNORMAL_TRADE_SCORE],
    inactiveDays: config[CREDIT_SCORE_CONFIG_KEYS.INACTIVE_DAYS],
    inactiveScore: config[CREDIT_SCORE_CONFIG_KEYS.INACTIVE_SCORE],
    withdrawFailScore: config[CREDIT_SCORE_CONFIG_KEYS.WITHDRAW_FAIL_SCORE],
    disputeScore: config[CREDIT_SCORE_CONFIG_KEYS.DISPUTE_SCORE],
    maliciousScore: config[CREDIT_SCORE_CONFIG_KEYS.MALICIOUS_SCORE],
    riskAlertScore: config[CREDIT_SCORE_CONFIG_KEYS.RISK_ALERT_SCORE],
    minScore: config[CREDIT_SCORE_CONFIG_KEYS.MIN_SCORE],
    
    // 人工审核
    manualAuditEnabled: config[CREDIT_SCORE_CONFIG_KEYS.MANUAL_AUDIT_ENABLED] || false,
    manualAuditThreshold: config[CREDIT_SCORE_CONFIG_KEYS.MANUAL_AUDIT_THRESHOLD] || 10,
    manualAuditTypes: config[CREDIT_SCORE_CONFIG_KEYS.MANUAL_AUDIT_TYPES] || [
      CREDIT_SCORE_CHANGE_TYPE.MANUAL_ADJUST,
      CREDIT_SCORE_CHANGE_TYPE.PENALTY,
      CREDIT_SCORE_CHANGE_TYPE.REWARD
    ]
  }
  // 初始加载时没有未保存的变化
  hasUnsavedChanges.value = false
})

// 监听表单变化
watch(() => formData.value, () => {
  hasUnsavedChanges.value = true
  saveSuccess.value = false
  // 清除验证错误
  validationErrors.value = {
    initialScore: '',
    rechargeAmount: '',
    autoUpgradeVip1Score: ''
  }
}, { deep: true })

// 应用模板
const applyTemplate = (template) => {
  Object.assign(formData.value, template.config)
  saveSuccess.value = false
  hasUnsavedChanges.value = true
}

// 表单验证
const validateForm = () => {
  let isValid = true
  validationErrors.value = {
    initialScore: '',
    rechargeAmount: '',
    autoUpgradeVip1Score: ''
  }

  if (formData.value.initialScore < 0 || formData.value.initialScore > formData.value.maxScore) {
    validationErrors.value.initialScore = `初始分数必须在 0 到 ${formData.value.maxScore} 之间`
    isValid = false
  }

  if (formData.value.rechargeAmount < 0) {
    validationErrors.value.rechargeAmount = '充值金额必须大于等于 0'
    isValid = false
  }

  if (formData.value.autoUpgradeVip1Enabled && formData.value.autoUpgradeVip1Score <= 0) {
    validationErrors.value.autoUpgradeVip1Score = '自动升级VIP1的信用分必须大于 0'
    isValid = false
  }

  return isValid
}

// 保存配置
const saveConfig = () => {
  // 验证
  if (!validateForm()) {
    return
  }

  isSaving.value = true

  // 模拟保存
  setTimeout(() => {
    updateCreditScoreConfigs({
      [CREDIT_SCORE_CONFIG_KEYS.ENABLED]: formData.value.enabled,
      [CREDIT_SCORE_CONFIG_KEYS.MAX_SCORE]: formData.value.maxScore,
      [CREDIT_SCORE_CONFIG_KEYS.INITIAL_SCORE]: formData.value.initialScore,
      [CREDIT_SCORE_CONFIG_KEYS.RECHARGE_AMOUNT]: formData.value.rechargeAmount,
      [CREDIT_SCORE_CONFIG_KEYS.PRIMARY_KYC_SCORE]: formData.value.primaryKycScore,
      [CREDIT_SCORE_CONFIG_KEYS.ADVANCED_KYC_SCORE]: formData.value.advancedKycScore,
      [CREDIT_SCORE_CONFIG_KEYS.AUTO_UPGRADE_VIP1_ENABLED]: formData.value.autoUpgradeVip1Enabled,
      [CREDIT_SCORE_CONFIG_KEYS.AUTO_UPGRADE_VIP1_SCORE]: formData.value.autoUpgradeVip1Score,
      [CREDIT_SCORE_CONFIG_KEYS.VIP_UPGRADE_RECHARGE_AMOUNT]: formData.value.vipUpgradeRechargeAmount,
      
      // 扣除规则
      [CREDIT_SCORE_CONFIG_KEYS.DEDUCTION_ENABLED]: formData.value.deductionEnabled,
      [CREDIT_SCORE_CONFIG_KEYS.VIOLATION_SCORE]: formData.value.violationScore,
      [CREDIT_SCORE_CONFIG_KEYS.ABNORMAL_TRADE_SCORE]: formData.value.abnormalTradeScore,
      [CREDIT_SCORE_CONFIG_KEYS.INACTIVE_DAYS]: formData.value.inactiveDays,
      [CREDIT_SCORE_CONFIG_KEYS.INACTIVE_SCORE]: formData.value.inactiveScore,
      [CREDIT_SCORE_CONFIG_KEYS.WITHDRAW_FAIL_SCORE]: formData.value.withdrawFailScore,
      [CREDIT_SCORE_CONFIG_KEYS.DISPUTE_SCORE]: formData.value.disputeScore,
      [CREDIT_SCORE_CONFIG_KEYS.MALICIOUS_SCORE]: formData.value.maliciousScore,
      [CREDIT_SCORE_CONFIG_KEYS.RISK_ALERT_SCORE]: formData.value.riskAlertScore,
      [CREDIT_SCORE_CONFIG_KEYS.MIN_SCORE]: formData.value.minScore,
      
      // 人工审核
      [CREDIT_SCORE_CONFIG_KEYS.MANUAL_AUDIT_ENABLED]: formData.value.manualAuditEnabled,
      [CREDIT_SCORE_CONFIG_KEYS.MANUAL_AUDIT_THRESHOLD]: formData.value.manualAuditThreshold,
      [CREDIT_SCORE_CONFIG_KEYS.MANUAL_AUDIT_TYPES]: formData.value.manualAuditTypes
    })

    isSaving.value = false
    saveSuccess.value = true
    hasUnsavedChanges.value = false

    // 3秒后隐藏成功消息
    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
  }, 500)
}

// 格式化数字为货币
const formatNumber = (value) => {
  if (!value && value !== 0) return '0'
  return new Intl.NumberFormat('zh-CN').format(value)
}

// 标签配置
const tabs = [
  { id: 'basic', name: '基础配置', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'earn', name: '获取规则', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'deduct', name: '扣除规则', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  { id: 'audit', name: '人工审核', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
]
</script>

<template>
  <section class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">信用分配置</h1>
        <p class="text-sm text-slate-500 mt-1">配置信用分规则、自动升级策略，并实时预览效果</p>
      </div>
    </div>

    <!-- 成功提示 -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="saveSuccess"
        class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3"
      >
        <svg class="h-5 w-5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span class="text-sm text-emerald-800 font-medium">配置已成功保存！</span>
      </div>
    </Transition>

    <!-- 主内容区域 - 左右布局 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左侧：标签页配置表单 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 操作栏 -->
        <div class="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between shadow-sm">
          <div class="flex items-center gap-2">
            <h2 class="text-base font-semibold text-slate-900">配置参数</h2>
            <span v-if="hasUnsavedChanges" class="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-100">
              <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              有未保存的修改
            </span>
          </div>
          <button
            @click="saveConfig"
            :disabled="isSaving"
            class="ant-btn ant-btn-primary !h-9"
          >
            <svg v-if="isSaving" class="animate-spin h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSaving ? '保存中...' : '保存配置' }}
          </button>
        </div>

        <!-- 系统开关 -->
        <div class="rounded-xl border border-slate-200 bg-white p-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <svg class="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                </svg>
                信用分系统
              </h2>
              <p class="text-sm text-slate-500 mt-1">开启后，平台将启用信用分功能</p>
            </div>
            <button
              @click="formData.enabled = !formData.enabled"
              :class="formData.enabled ? 'bg-blue-600' : 'bg-slate-300'"
              class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span
                :class="formData.enabled ? 'translate-x-6' : 'translate-x-1'"
                class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm"
              />
            </button>
          </div>
        </div>

        <!-- 标签页导航 -->
        <div class="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <!-- 标签头部 -->
          <div class="border-b border-slate-200 bg-slate-50">
            <nav class="flex -mb-px">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100',
                  'flex-1 py-4 px-4 text-center border-b-2 font-medium text-sm transition-colors inline-flex items-center justify-center gap-2'
                ]"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
                </svg>
                {{ tab.name }}
              </button>
            </nav>
          </div>

          <!-- 标签内容 -->
          <div class="p-6">
            <!-- 基础配置 -->
            <div v-show="activeTab === 'basic'" class="space-y-6">
              <!-- 分数设置 -->
              <div>
                <h4 class="text-sm font-semibold text-slate-900 mb-3">分数设置</h4>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">最大分数</label>
                    <input
                      v-model.number="formData.maxScore"
                      type="number"
                      min="0"
                      max="1000"
                      class="ant-input"
                    />
                    <p class="text-xs text-slate-500 mt-1">信用分上限</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">初始分数</label>
                    <input
                      v-model.number="formData.initialScore"
                      type="number"
                      min="0"
                      :max="formData.maxScore"
                      class="ant-input"
                      :class="{'!border-rose-500': validationErrors.initialScore}"
                    />
                    <p v-if="validationErrors.initialScore" class="text-xs text-rose-600 mt-1">{{ validationErrors.initialScore }}</p>
                    <p v-else class="text-xs text-slate-500 mt-1">新用户默认分数</p>
                  </div>
                </div>
              </div>

              <!-- VIP自动升级 -->
              <div class="pt-4 border-t border-slate-200">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h4 class="text-sm font-semibold text-slate-900">VIP自动升级</h4>
                    <p class="text-xs text-slate-500 mt-1">根据信用分自动升级VIP等级</p>
                  </div>
                  <button
                    @click="formData.autoUpgradeVip1Enabled = !formData.autoUpgradeVip1Enabled"
                    :class="formData.autoUpgradeVip1Enabled ? 'bg-blue-600' : 'bg-slate-300'"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <span
                      :class="formData.autoUpgradeVip1Enabled ? 'translate-x-6' : 'translate-x-1'"
                      class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    />
                  </button>
                </div>

                <div v-if="formData.autoUpgradeVip1Enabled" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">升级到VIP1所需信用分</label>
                    <input
                      v-model.number="formData.autoUpgradeVip1Score"
                      type="number"
                      min="0"
                      :max="formData.maxScore"
                      class="ant-input"
                      :class="{'!border-rose-500': validationErrors.autoUpgradeVip1Score}"
                    />
                    <p v-if="validationErrors.autoUpgradeVip1Score" class="text-xs text-rose-600 mt-1">{{ validationErrors.autoUpgradeVip1Score }}</p>
                    <p v-else class="text-xs text-slate-500 mt-1">普通用户达到此分数自动升级为VIP1</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">VIP升级充值金额</label>
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-sm text-slate-600">VIP1+用户每充值</span>
                      <input
                        v-model.number="formData.vipUpgradeRechargeAmount"
                        type="number"
                        min="0"
                        step="1000"
                        class="ant-input !w-32"
                      />
                      <span class="text-sm text-slate-600">USDT 升一级</span>
                    </div>
                    <p class="text-xs text-slate-500 mt-2">例如：VIP1用户充值该金额后自动升级为VIP2</p>
                  </div>
                </div>

                <div v-else class="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-lg">
                  自动升级功能已关闭
                </div>
              </div>
            </div>

            <!-- 获取规则 -->
            <div v-show="activeTab === 'earn'" class="space-y-4">
              <!-- 充值规则 -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">充值规则</label>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-sm text-slate-600">每充值</span>
                  <input
                    v-model.number="formData.rechargeAmount"
                    type="number"
                    min="0"
                    step="1000"
                    class="ant-input !w-32"
                    :class="{'!border-rose-500': validationErrors.rechargeAmount}"
                  />
                  <span class="text-sm text-slate-600">USDT，获得</span>
                  <span class="px-3 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg">+1</span>
                  <span class="text-sm text-slate-600">信用分</span>
                </div>
                <p v-if="validationErrors.rechargeAmount" class="text-xs text-rose-600 mt-2">{{ validationErrors.rechargeAmount }}</p>
                <p v-else class="text-xs text-slate-500 mt-2">
                  💡 例如：设置为 {{ formatNumber(100000) }}，用户充值 {{ formatNumber(500000) }} USDT 将获得 5 信用分
                </p>
              </div>

              <!-- 认证规则 -->
              <div class="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">初级认证奖励</label>
                  <div class="flex items-center gap-2">
                    <input
                      v-model.number="formData.primaryKycScore"
                      type="number"
                      min="0"
                      :max="formData.maxScore"
                      class="ant-input !w-24"
                    />
                    <span class="text-sm text-slate-600">信用分</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">高级认证奖励</label>
                  <div class="flex items-center gap-2">
                    <input
                      v-model.number="formData.advancedKycScore"
                      type="number"
                      min="0"
                      :max="formData.maxScore"
                      class="ant-input !w-24"
                    />
                    <span class="text-sm text-slate-600">信用分</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 扣除规则 -->
            <div v-show="activeTab === 'deduct'" class="space-y-4">
              <div class="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                <div>
                  <h4 class="text-sm font-semibold text-slate-900">启用扣除规则</h4>
                  <p class="text-xs text-slate-500 mt-1">开启后将对违规行为进行扣分</p>
                </div>
                <button
                  @click="formData.deductionEnabled = !formData.deductionEnabled"
                  :class="formData.deductionEnabled ? 'bg-rose-600' : 'bg-slate-300'"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                >
                  <span
                    :class="formData.deductionEnabled ? 'translate-x-6' : 'translate-x-1'"
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  />
                </button>
              </div>

              <div v-if="formData.deductionEnabled" class="space-y-4">
                <!-- 扣分场景 -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">违规行为</label>
                    <div class="flex items-center gap-2">
                      <span class="text-rose-600">-</span>
                      <input
                        v-model.number="formData.violationScore"
                        type="number"
                        min="0"
                        :max="formData.maxScore"
                        class="ant-input !w-24"
                      />
                      <span class="text-sm text-slate-600">分</span>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">异常交易</label>
                    <div class="flex items-center gap-2">
                      <span class="text-rose-600">-</span>
                      <input
                        v-model.number="formData.abnormalTradeScore"
                        type="number"
                        min="0"
                        :max="formData.maxScore"
                        class="ant-input !w-24"
                      />
                      <span class="text-sm text-slate-600">分</span>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">交易纠纷</label>
                    <div class="flex items-center gap-2">
                      <span class="text-rose-600">-</span>
                      <input
                        v-model.number="formData.disputeScore"
                        type="number"
                        min="0"
                        :max="formData.maxScore"
                        class="ant-input !w-24"
                      />
                      <span class="text-sm text-slate-600">分</span>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">提现失败</label>
                    <div class="flex items-center gap-2">
                      <span class="text-rose-600">-</span>
                      <input
                        v-model.number="formData.withdrawFailScore"
                        type="number"
                        min="0"
                        :max="formData.maxScore"
                        class="ant-input !w-24"
                      />
                      <span class="text-sm text-slate-600">分</span>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">恶意行为</label>
                    <div class="flex items-center gap-2">
                      <span class="text-rose-600">-</span>
                      <input
                        v-model.number="formData.maliciousScore"
                        type="number"
                        min="0"
                        :max="formData.maxScore"
                        class="ant-input !w-24"
                      />
                      <span class="text-sm text-slate-600">分</span>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">风控预警</label>
                    <div class="flex items-center gap-2">
                      <span class="text-rose-600">-</span>
                      <input
                        v-model.number="formData.riskAlertScore"
                        type="number"
                        min="0"
                        :max="formData.maxScore"
                        class="ant-input !w-24"
                      />
                      <span class="text-sm text-slate-600">分</span>
                    </div>
                  </div>
                </div>

                <!-- 不活跃扣分 -->
                <div class="pt-4 border-t border-slate-200">
                  <label class="block text-sm font-medium text-slate-700 mb-2">长期不活跃</label>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm text-slate-600">连续</span>
                    <input
                      v-model.number="formData.inactiveDays"
                      type="number"
                      min="0"
                      class="ant-input !w-24"
                    />
                    <span class="text-sm text-slate-600">天不登录，扣</span>
                    <input
                      v-model.number="formData.inactiveScore"
                      type="number"
                      min="0"
                      :max="formData.maxScore"
                      class="ant-input !w-24"
                    />
                    <span class="text-sm text-slate-600">信用分</span>
                  </div>
                </div>

                <!-- 最低分数 -->
                <div class="pt-4 border-t border-slate-200">
                  <label class="block text-sm font-medium text-slate-700 mb-2">最低分数保护</label>
                  <input
                    v-model.number="formData.minScore"
                    type="number"
                    min="0"
                    :max="formData.maxScore"
                    class="ant-input"
                  />
                  <p class="text-xs text-slate-500 mt-1">扣分后不会低于此值（0表示无保护）</p>
                </div>

                <div class="bg-rose-50 border border-rose-200 rounded-lg p-3">
                  <p class="text-xs text-rose-700">
                    ⚠️ 扣除规则帮助维护平台秩序，请根据实际情况合理设置扣分力度
                  </p>
                </div>
              </div>

              <div v-else class="text-sm text-slate-500 text-center py-8 bg-slate-50 rounded-lg">
                扣除规则已关闭，不会对用户进行扣分
              </div>
            </div>

            <!-- 人工审核配置 -->
            <div v-show="activeTab === 'audit'" class="space-y-4">
              <div class="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                <div>
                  <h4 class="text-sm font-semibold text-slate-900">启用人工审核</h4>
                  <p class="text-xs text-slate-500 mt-1">开启后，符合条件的积分变动需要人工审核</p>
                </div>
                <button
                  @click="formData.manualAuditEnabled = !formData.manualAuditEnabled"
                  :class="formData.manualAuditEnabled ? 'bg-blue-600' : 'bg-slate-300'"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span
                    :class="formData.manualAuditEnabled ? 'translate-x-6' : 'translate-x-1'"
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  />
                </button>
              </div>

              <div v-if="formData.manualAuditEnabled" class="space-y-4">
                <!-- 审核阈值 -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">审核阈值</label>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm text-slate-600">积分变动绝对值超过</span>
                    <input
                      v-model.number="formData.manualAuditThreshold"
                      type="number"
                      min="0"
                      :max="formData.maxScore"
                      class="ant-input !w-24"
                    />
                    <span class="text-sm text-slate-600">分时需要审核</span>
                  </div>
                  <p class="text-xs text-slate-500 mt-2">
                    💡 例如：设置为 10，则 +15 或 -15 的变动都需要审核
                  </p>
                </div>

                <!-- 需要审核的变动类型 -->
                <div class="pt-4 border-t border-slate-200">
                  <label class="block text-sm font-medium text-slate-700 mb-3">需要审核的变动类型</label>
                  <div class="space-y-2">
                    <label 
                      v-for="option in CREDIT_SCORE_CHANGE_TYPE_OPTIONS" 
                      :key="option.value"
                      class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        :value="option.value"
                        v-model="formData.manualAuditTypes"
                        class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span class="text-sm text-slate-700">{{ option.label }}</span>
                    </label>
                  </div>
                  <p class="text-xs text-slate-500 mt-3">
                    勾选的变动类型在满足阈值条件时需要人工审核
                  </p>
                </div>

                <!-- 审核说明 -->
                <div class="pt-4 border-t border-slate-200">
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 class="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                      </svg>
                      人工审核流程说明
                    </h5>
                    <ul class="text-xs text-blue-800 space-y-1.5 ml-7">
                      <li>1. 符合审核条件的积分变动将进入待审核队列</li>
                      <li>2. 管理员在"信用分变动审核"页面进行审批</li>
                      <li>3. 审核通过后，积分变动才会生效</li>
                      <li>4. 审核拒绝的变动将不会生效</li>
                      <li>5. 同时满足"变动类型"和"阈值"两个条件才需审核</li>
                    </ul>
                  </div>
                </div>

                <!-- 审核示例 -->
                <div class="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h5 class="text-sm font-semibold text-slate-700 mb-3">审核规则示例</h5>
                  <div class="space-y-2 text-xs">
                    <div class="flex items-start gap-2">
                      <svg class="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      <span class="text-slate-600">
                        当前阈值 <strong>{{ formData.manualAuditThreshold }}</strong> 分，
                        <strong>手动调整</strong> +15 分 → <span class="text-blue-600 font-medium">需要审核</span>
                      </span>
                    </div>
                    <div class="flex items-start gap-2">
                      <svg class="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                      </svg>
                      <span class="text-slate-600">
                        <strong>充值</strong> +5 分（未勾选类型） → <span class="text-slate-500 font-medium">无需审核</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="text-sm text-slate-500 text-center py-8 bg-slate-50 rounded-lg">
                人工审核已关闭，所有积分变动将自动生效
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：计算器和模板 -->
      <div class="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <!-- 信用分计算器 -->
        <div class="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
          <h3 class="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            实时计算器
          </h3>

          <div class="space-y-4">
            <!-- 充值金额 -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">充值金额(USDT)</label>
              <input
                v-model.number="calculatorInputs.rechargeAmount"
                type="number"
                min="0"
                step="10000"
                class="ant-input bg-white"
              />
              <p class="text-xs text-slate-500 mt-1">当前输入：{{ formatNumber(calculatorInputs.rechargeAmount) }} USDT</p>
            </div>

            <!-- 认证状态 -->
            <div class="space-y-2">
              <p class="text-xs font-medium text-slate-600 mb-1">✅ 加分项</p>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="calculatorInputs.hasPrimaryKyc"
                  type="checkbox"
                  class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span class="text-sm text-slate-700">已完成初级认证</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="calculatorInputs.hasAdvancedKyc"
                  type="checkbox"
                  class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span class="text-sm text-slate-700">已完成高级认证</span>
              </label>
            </div>

            <!-- 扣除场景 -->
            <div v-if="formData.deductionEnabled" class="space-y-2 pt-2 border-t border-blue-200">
              <p class="text-xs font-medium text-slate-600 mb-1">⚠️ 扣分项</p>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="calculatorInputs.hasViolation"
                  type="checkbox"
                  class="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span class="text-sm text-slate-700">存在违规行为</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="calculatorInputs.hasAbnormalTrade"
                  type="checkbox"
                  class="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span class="text-sm text-slate-700">有异常交易</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="calculatorInputs.hasDispute"
                  type="checkbox"
                  class="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span class="text-sm text-slate-700">发生交易纠纷</span>
              </label>
            </div>

            <!-- 计算结果 -->
            <div class="mt-6 pt-6 border-t border-blue-200">
              <div class="text-center">
                <p class="text-sm text-slate-600 mb-2">预计总信用分</p>
                <div class="text-4xl font-bold text-blue-600 mb-2">
                  {{ calculatedScore }}
                </div>
                <div class="text-xs text-slate-500">
                  最大值: {{ formData.maxScore }}
                </div>
              </div>

              <!-- VIP升级提示 -->
              <div v-if="canUpgradeToVip1" class="mt-4 p-3 bg-emerald-100 border border-emerald-200 rounded-lg">
                <div class="flex items-center gap-2 text-emerald-800">
                  <svg class="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-sm font-medium">可自动升级为VIP1</span>
                </div>
              </div>
              <div v-else-if="formData.autoUpgradeVip1Enabled" class="mt-4 p-3 bg-slate-100 border border-slate-200 rounded-lg">
                <p class="text-xs text-slate-600 text-center">
                  还需 {{ formData.autoUpgradeVip1Score - calculatedScore }} 分升级VIP1
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 配置模板 -->
        <div class="rounded-xl border border-slate-200 bg-white p-6">
          <h3 class="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg class="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            快速模板
          </h3>

          <div class="space-y-3">
            <button
              v-for="template in configTemplates"
              :key="template.name"
              @click="applyTemplate(template)"
              class="w-full text-left p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div class="flex items-start gap-3">
                <span class="text-2xl">{{ template.icon }}</span>
                <div class="flex-1">
                  <h4 class="font-semibold text-slate-900 group-hover:text-blue-700">{{ template.name }}</h4>
                  <p class="text-xs text-slate-500 mt-1">{{ template.description }}</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- 配置说明 -->
        <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div class="flex gap-3">
            <svg class="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <div class="text-sm text-amber-800 space-y-1">
              <p class="font-semibold">提示</p>
              <ul class="list-disc list-inside space-y-0.5 text-amber-700 text-xs">
                <li>使用右侧计算器测试配置效果</li>
                <li>可选择快速模板一键应用</li>
                <li>修改后记得点击保存按钮</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
