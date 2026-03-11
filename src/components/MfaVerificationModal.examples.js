/**
 * MFA 验证组件使用示例集合
 * 
 * 此文件展示如何在不同场景下使用 MfaVerificationModal 组件
 */

// ============================================================================
// 示例 1: 简单的敏感操作验证（适用于一次性操作）
// ============================================================================

/*
<script setup>
import { ref } from 'vue'
import MfaVerificationModal from '@/components/MfaVerificationModal.vue'

const showMfaModal = ref(false)
const mfaLoading = ref(false)

// 执行需要 MFA 验证的操作
const handleSensitiveAction = async () => {
  showMfaModal.value = true
}

const handleMfaVerify = async (code) => {
  mfaLoading.value = true
  
  try {
    // 调用 API 验证
    await $api.post('/verify-mfa', { code })
    
    // 验证成功后执行实际操作
    await $api.post('/execute-action')
    
    showMfaModal.value = false
    alert('操作成功！')
  } catch (error) {
    alert(error.message || '验证失败')
  } finally {
    mfaLoading.value = false
  }
}
</script>

<template>
  <button @click="handleSensitiveAction">
    删除用户
  </button>
  
  <MfaVerificationModal
    v-model:open="showMfaModal"
    :loading="mfaLoading"
    title="安全验证"
    description="删除用户是敏感操作，请验证您的身份"
    @verify="handleMfaVerify"
  />
</template>
*/

// ============================================================================
// 示例 2: 表单提交前验证（适用于配置编辑）
// ============================================================================

/*
<script setup>
import { ref, reactive } from 'vue'
import MfaVerificationModal from '@/components/MfaVerificationModal.vue'

const showModal = ref(false)
const showMfaModal = ref(false)
const mfaLoading = ref(false)
const formData = reactive({
  name: '',
  value: 0,
  ratio: 0
})

// 打开编辑弹窗
const openEditModal = () => {
  showModal.value = true
}

// 用户点击保存时，先不直接保存，显示 MFA 验证
const handleSaveClick = () => {
  // 关闭编辑弹窗，但不要保存
  showModal.value = false
  
  // 显示 MFA 验证
  showMfaModal.value = true
}

const handleMfaVerify = async (code) => {
  mfaLoading.value = true
  
  try {
    await $api.post('/verify-mfa', { code })
    await $api.post('/save-config', formData)
    
    alert('配置保存成功！')
  } catch (error) {
    alert('保存失败：' + error.message)
  } finally {
    mfaLoading.value = false
  }
}
</script>

<template>
  <button @click="openEditModal">编辑配置</button>
  
  <!-- 编辑弹窗 -->
  <div v-if="showModal" class="modal">
    <input v-model="formData.name" placeholder="名称" />
    <input v-model.number="formData.value" type="number" placeholder="数值" />
    <button @click="handleSaveClick">保存</button>
  </div>
  
  <!-- MFA 验证弹窗 -->
  <MfaVerificationModal
    v-model:open="showMfaModal"
    :loading="mfaLoading"
    title="配置修改验证"
    description="修改系统配置需要 MFA 验证"
    @verify="handleMfaVerify"
  />
</template>
*/

// ============================================================================
// 示例 3: 批量操作验证（适用于批量审批、批量删除等）
// ============================================================================

/*
<script setup>
import { ref } from 'vue'
import MfaVerificationModal from '@/components/MfaVerificationModal.vue'

const selectedItems = ref([])
const showMfaModal = ref(false)
const mfaLoading = ref(false)

// 批量删除
const handleBatchDelete = () => {
  if (selectedItems.value.length === 0) {
    alert('请选择要删除的项目')
    return
  }
  
  showMfaModal.value = true
}

const handleMfaVerify = async (code) => {
  mfaLoading.value = true
  
  try {
    await $api.post('/verify-mfa', { code })
    await $api.post('/batch-delete', { ids: selectedItems.value })
    
    alert(`成功删除 ${selectedItems.value.length} 个项目`)
    selectedItems.value = []
    showMfaModal.value = false
  } catch (error) {
    alert(error.message)
  } finally {
    mfaLoading.value = false
  }
}
</script>

<template>
  <button 
    @click="handleBatchDelete"
    :disabled="selectedItems.value.length === 0"
  >
    批量删除 ({{ selectedItems.value.length }})
  </button>
  
  <MfaVerificationModal
    v-model:open="showMfaModal"
    :loading="mfaLoading"
    title="批量操作验证"
    :description="`即将删除 ${selectedItems.value.length} 个项目，请进行 MFA 验证`"
    @verify="handleMfaVerify"
  />
</template>
*/

// ============================================================================
// 示例 4: 提现/转账审核（适用于资金相关操作）
// ============================================================================

/*
<script setup>
import { ref } from 'vue'
import MfaVerificationModal from '@/components/MfaVerificationModal.vue'

const withdrawalRequest = ref(null)
const showMfaModal = ref(false)
const mfaLoading = ref(false)

// 审核提现
const approveWithdrawal = (request) => {
  withdrawalRequest.value = request
  showMfaModal.value = true
}

const handleMfaVerify = async (code) => {
  mfaLoading.value = true
  
  try {
    await $api.post('/verify-mfa', { code })
    await $api.post('/approve-withdrawal', {
      id: withdrawalRequest.value.id,
      status: 'APPROVED'
    })
    
    alert('提现审核通过')
    showMfaModal.value = false
  } catch (error) {
    alert('审核失败：' + error.message)
  } finally {
    mfaLoading.value = false
  }
}
</script>

<template>
  <table>
    <tr v-for="request in withdrawalRequests" :key="request.id">
      <td>{{ request.user }}</td>
      <td>{{ request.amount }}</td>
      <td>
        <button @click="approveWithdrawal(request)">
          审核通过
        </button>
      </td>
    </tr>
  </table>
  
  <MfaVerificationModal
    v-model:open="showMfaModal"
    :loading="mfaLoading"
    title="资金操作验证"
    :description="`审核金额为 ${withdrawalRequest?.amount} USDT 的提现申请，请验证身份`"
    @verify="handleMfaVerify"
  />
</template>
*/

// ============================================================================
// 示例 5: 系统参数修改（适用于全局配置）
// ============================================================================

/*
<script setup>
import { ref, reactive } from 'vue'
import MfaVerificationModal from '@/components/MfaVerificationModal.vue'

const systemConfig = reactive({
  minDeposit: 0,
  maxWithdraw: 0,
  tradingFee: 0,
  maintenanceMode: false
})

const showMfaModal = ref(false)
const mfaLoading = ref(false)
const configBackup = ref(null)

// 开始修改配置
const updateConfig = () => {
  // 备份当前配置
  configBackup.value = { ...systemConfig }
  
  // 显示 MFA 验证
  showMfaModal.value = true
}

const handleMfaVerify = async (code) => {
  mfaLoading.value = true
  
  try {
    await $api.post('/verify-mfa', { code })
    await $api.post('/update-system-config', systemConfig)
    
    alert('系统配置更新成功')
    configBackup.value = null
    showMfaModal.value = false
  } catch (error) {
    // 恢复原配置
    if (configBackup.value) {
      Object.assign(systemConfig, configBackup.value)
    }
    alert('配置更新失败：' + error.message)
  } finally {
    mfaLoading.value = false
  }
}

// 取消修改
const cancelUpdate = () => {
  if (configBackup.value) {
    Object.assign(systemConfig, configBackup.value)
    configBackup.value = null
  }
}
</script>

<template>
  <div class="config-panel">
    <label>
      最小存款额
      <input v-model.number="systemConfig.minDeposit" type="number" />
    </label>
    
    <label>
      最大提款额
      <input v-model.number="systemConfig.maxWithdraw" type="number" />
    </label>
    
    <label>
      交易手续费率
      <input v-model.number="systemConfig.tradingFee" type="number" step="0.0001" />
    </label>
    
    <div class="actions">
      <button @click="updateConfig">保存配置</button>
      <button @click="cancelUpdate">取消</button>
    </div>
  </div>
  
  <MfaVerificationModal
    v-model:open="showMfaModal"
    :loading="mfaLoading"
    title="系统配置修改"
    description="修改系统全局配置需要管理员 MFA 验证"
    @verify="handleMfaVerify"
  />
</template>
*/

// ============================================================================
// 示例 6: 在借贷产品管理中使用（类似资金管理）
// ============================================================================

/*
<script setup>
import { ref, reactive } from 'vue'
import MfaVerificationModal from '@/components/MfaVerificationModal.vue'

const products = ref([])
const showProductModal = ref(false)
const showMfaModal = ref(false)
const editingProductId = ref(null)
const mfaLoading = ref(false)
const pendingSaveData = ref(null)

const productForm = reactive({
  productName: '',
  collateralType: '',
  loanCurrency: '',
  ltvRatio: 0,
  interestRate: 0
})

// 打开编辑
const openEditProduct = (product) => {
  editingProductId.value = product.id
  Object.assign(productForm, product)
  showProductModal.value = true
}

// 保存产品（先不直接保存）
const saveProduct = () => {
  const payload = {
    ...productForm,
    updatedAt: new Date().toISOString()
  }
  
  pendingSaveData.value = payload
  showProductModal.value = false
  showMfaModal.value = true
}

// MFA 验证后保存
const handleMfaVerify = async (code) => {
  mfaLoading.value = true
  
  try {
    await $api.post('/verify-mfa', { code })
    
    if (editingProductId.value) {
      // 编辑模式
      await $api.put(`/products/${editingProductId.value}`, pendingSaveData.value)
      const index = products.value.findIndex(p => p.id === editingProductId.value)
      if (index !== -1) {
        products.value[index] = { ...products.value[index], ...pendingSaveData.value }
      }
    } else {
      // 新增模式
      const newProduct = await $api.post('/products', pendingSaveData.value)
      products.value.unshift(newProduct.data)
    }
    
    alert('产品保存成功')
    showMfaModal.value = false
    pendingSaveData.value = null
    editingProductId.value = null
  } catch (error) {
    alert('保存失败：' + error.message)
  } finally {
    mfaLoading.value = false
  }
}
</script>

<template>
  <!-- 产品列表 -->
  <div class="products">
    <div v-for="product in products" :key="product.id" class="product-card">
      <h3>{{ product.productName }}</h3>
      <p>LTV: {{ product.ltvRatio }}%</p>
      <p>利率：{{ product.interestRate }}%</p>
      <button @click="openEditProduct(product)">编辑</button>
    </div>
  </div>
  
  <!-- 产品编辑弹窗 -->
  <div v-if="showProductModal" class="modal">
    <input v-model="productForm.productName" placeholder="产品名称" />
    <select v-model="productForm.collateralType">
      <option>BTC</option>
      <option>ETH</option>
      <option>USDT</option>
    </select>
    <input v-model.number="productForm.ltvRatio" type="number" placeholder="LTV%" />
    <input v-model.number="productForm.interestRate" type="number" step="0.01" placeholder="利率%" />
    <button @click="saveProduct">保存</button>
  </div>
  
  <!-- MFA 验证弹窗 -->
  <MfaVerificationModal
    v-model:open="showMfaModal"
    :loading="mfaLoading"
    title="产品配置验证"
    description="修改借贷产品配置需要 MFA 验证"
    @verify="handleMfaVerify"
  />
</template>
*/

// ============================================================================
// 最佳实践总结
// ============================================================================

/*
1. 安全性原则：
   - ✅ 永远在后端验证 MFA 码
   - ✅ 使用 HTTPS 传输
   - ✅ 限制尝试次数
   - ✅ 记录审计日志

2. 用户体验：
   - ✅ 验证前保存待处理数据
   - ✅ 提供清晰的错误提示
   - ✅ 显示加载状态
   - ✅ 允许取消操作

3. 代码组织：
   - ✅ 将 MFA 验证逻辑抽离为独立函数
   - ✅ 使用响应式变量管理状态
   - ✅ 统一错误处理
   - ✅ 添加适当的注释

4. 常见应用场景：
   - 资金操作（提现、转账、充值）
   - 配置修改（系统参数、产品配置）
   - 权限变更（用户角色、访问控制）
   - 数据操作（批量删除、导出）
   - 审核审批（订单审核、退款审批）
*/
