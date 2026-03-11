# MFA 验证组件使用指南

## 组件说明

`MfaVerificationModal.vue` 是一个通用的 MFA（多因素认证）验证码输入弹窗组件，用于在用户执行敏感操作时进行二次身份验证。

## 功能特性

- ✅ 6 位数字验证码输入
- ✅ 实时输入验证和错误提示
- ✅ 加载状态显示
- ✅ 支持回车键提交
- ✅ 美观的 UI 设计
- ✅ 响应式布局
- ✅ 可自定义标题和描述

## Props 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `open` | Boolean | `false` | 控制弹窗显示/隐藏 |
| `title` | String | `'MFA 验证'` | 弹窗标题 |
| `description` | String | `'请输入您的 MFA 验证码以继续操作'` | 弹窗描述文字 |
| `loading` | Boolean | `false` | 加载状态 |

## Events 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `update:open` | `(value: Boolean)` | 弹窗显示状态变化时触发 |
| `verify` | `(code: String)` | 用户点击验证按钮时触发，返回验证码 |
| `cancel` | `-` | 用户点击取消按钮时触发 |

## 使用示例

### 基础用法

```vue
<script setup>
import { ref } from 'vue'
import MfaVerificationModal from '@/components/MfaVerificationModal.vue'

const showMfaModal = ref(false)
const mfaLoading = ref(false)

const handleMfaVerify = async (code) => {
  mfaLoading.value = true
  
  try {
    // 调用后端 API 验证 MFA 验证码
    const response = await api.verifyMFA(code)
    
    if (response.success) {
      // 验证成功，执行后续操作
      console.log('验证成功')
      showMfaModal.value = false
    }
  } catch (error) {
    console.error('验证失败', error)
  } finally {
    mfaLoading.value = false
  }
}
</script>

<template>
  <button @click="showMfaModal = true">执行敏感操作</button>
  
  <MfaVerificationModal
    v-model:open="showMfaModal"
    :loading="mfaLoading"
    title="安全验证"
    description="请输入 MFA 验证码"
    @verify="handleMfaVerify"
  />
</template>
```

### 高级用法（带待存数据）

```vue
<script setup>
import { ref } from 'vue'
import MfaVerificationModal from '@/components/MfaVerificationModal.vue'

const showMfaModal = ref(false)
const showDataModal = ref(false)
const mfaLoading = ref(false)
const pendingSaveData = ref(null)

// 第一步：用户点击保存，先不直接保存，而是显示 MFA 验证
const handleSaveClick = () => {
  // 准备要保存的数据
  pendingSaveData.value = {
    name: '产品名称',
    value: 100
  }
  
  // 显示 MFA 验证弹窗
  showMfaModal.value = true
}

// 第二步：MFA 验证通过后执行实际保存
const handleMfaVerify = async (code) => {
  mfaLoading.value = true
  
  try {
    // 调用后端 API 验证 MFA
    const response = await api.verifyMFA(code)
    
    if (response.success) {
      // 验证成功，使用之前保存的数据执行实际操作
      await api.saveData(pendingSaveData.value)
      
      // 关闭所有弹窗
      showDataModal.value = false
      showMfaModal.value = false
      pendingSaveData.value = null
      
      alert('保存成功！')
    }
  } catch (error) {
    alert('验证失败：' + error.message)
  } finally {
    mfaLoading.value = false
  }
}
</script>

<template>
  <!-- 主弹窗 -->
  <div v-if="showDataModal" class="modal">
    <button @click="handleSaveClick">保存配置</button>
  </div>
  
  <!-- MFA 验证弹窗 -->
  <MfaVerificationModal
    v-model:open="showMfaModal"
    :loading="mfaLoading"
    title="安全验证"
    description="编辑配置属于敏感操作，请输入 MFA 验证码"
    @verify="handleMfaVerify"
    @cancel="pendingSaveData = null"
  />
</template>
```

## 完整集成示例（资金管理币种管理）

参考文件：`src/pages/liquidity/LiquidityLockedModulePage.vue`

### 关键代码片段

```javascript
// 1. 导入组件
import MfaVerificationModal from '../../components/MfaVerificationModal.vue'

// 2. 定义响应式状态
const showMfaModal = ref(false)
const pendingSaveData = ref(null)
const mfaLoading = ref(false)

// 3. 修改保存逻辑
const saveProduct = () => {
  const payload = { /* 产品数据 */ }
  
  // 不直接保存，而是先显示 MFA 验证
  pendingSaveData.value = payload
  showMfaModal.value = true
}

// 4. 处理 MFA 验证
const handleMfaVerify = async (code) => {
  mfaLoading.value = true
  
  try {
    // 验证 MFA 并保存数据
    await api.verifyMFA(code)
    await api.saveProduct(pendingSaveData.value)
    
    // 清理状态
    showProductModal.value = false
    pendingSaveData.value = null
    showMfaModal.value = false
  } catch (error) {
    alert('验证失败')
  } finally {
    mfaLoading.value = false
  }
}
```

```html
<!-- 5. 在模板中添加组件 -->
<MfaVerificationModal
  v-model:open="showMfaModal"
  :loading="mfaLoading"
  title="安全验证"
  description="编辑产品比重配置属于敏感操作，请输入 MFA 验证码"
  @verify="handleMfaVerify"
  @cancel="pendingSaveData = null"
/>
```

## 适用场景

MFA 验证组件适用于以下敏感操作场景：

1. **资金相关操作**
   - 修改币种配置
   - 调整资金比重
   - 大额转账审批
   - 提现审核

2. **系统配置修改**
   - 修改交易规则
   - 调整费率配置
   - 更新风控参数

3. **用户权限管理**
   - 修改用户权限
   - 调整信用额度
   - 账户冻结/解冻

4. **数据导出**
   - 导出敏感数据
   - 批量下载用户信息

## 最佳实践

### 1. 安全性考虑

```javascript
const handleMfaVerify = async (code) => {
  mfaLoading.value = true
  
  try {
    // ✅ 必须调用后端 API 验证，不要仅在前端验证
    const response = await axios.post('/api/verify-mfa', { code })
    
    // ✅ 验证成功后再执行业务逻辑
    if (response.data.verified) {
      await performSensitiveOperation()
    }
  } catch (error) {
    // ✅ 提供清晰的错误提示
    alert(error.response?.data?.message || '验证失败，请重试')
  } finally {
    mfaLoading.value = false
  }
}
```

### 2. 用户体验优化

```javascript
// ✅ 验证前保存待处理数据，避免用户重新填写
const saveBeforeVerify = () => {
  pendingData.value = formData.value
  showMfaModal.value = true
}

// ✅ 验证失败后保留已填数据
const handleMfaVerify = async (code) => {
  try {
    await verifyAndSave()
  } catch (error) {
    // 不清除 pendingData，用户可以重新尝试
  }
}
```

### 3. 错误处理

```javascript
const handleMfaVerify = async (code) => {
  mfaLoading.value = true
  
  try {
    const response = await api.verifyMFA(code)
    
    if (!response.success) {
      throw new Error(response.message || '验证码错误')
    }
    
    // 成功逻辑
  } catch (error) {
    // 区分不同类型的错误
    if (error.name === 'MFA_EXPIRED') {
      alert('验证码已过期，请刷新后重试')
    } else if (error.name === 'MFA_INVALID') {
      alert('验证码错误，还剩 2 次尝试机会')
    } else {
      alert('网络错误，请稍后重试')
    }
  } finally {
    mfaLoading.value = false
  }
}
```

## API 接口示例

### 后端验证接口

```javascript
// POST /api/verify-mfa
{
  "userId": "user_123",
  "code": "123456",
  "operationType": "PRODUCT_EDIT"
}

// Response Success
{
  "success": true,
  "verified": true,
  "message": "验证通过"
}

// Response Error
{
  "success": false,
  "verified": false,
  "error": "INVALID_CODE",
  "message": "验证码错误或已过期",
  "remainingAttempts": 2
}
```

## 注意事项

1. ⚠️ **永远不要在前端验证 MFA 码** - 必须调用后端 API
2. ⚠️ **验证码应该有有效期** - 通常 30 秒
3. ⚠️ **限制尝试次数** - 防止暴力破解
4. ⚠️ **记录审计日志** - 追踪所有敏感操作
5. ⚠️ **使用 HTTPS** - 保证传输安全

## 相关文件

- 组件文件：`src/components/MfaVerificationModal.vue`
- 示例页面：`src/pages/liquidity/LiquidityLockedModulePage.vue`

## 更新日志

- **v1.0.0** (2026-03-11): 初始版本，提供基础 MFA 验证功能
