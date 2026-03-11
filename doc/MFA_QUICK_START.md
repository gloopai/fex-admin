# MFA 验证组件快速集成指南

## 30 秒快速集成

### 步骤 1: 导入组件 (5 秒)

```javascript
import MfaVerificationModal from '@/components/MfaVerificationModal.vue'
```

### 步骤 2: 添加状态管理 (5 秒)

```javascript
const showMfaModal = ref(false)
const mfaLoading = ref(false)
```

### 步骤 3: 实现验证处理函数 (10 秒)

```javascript
const handleMfaVerify = async (code) => {
  mfaLoading.value = true
  
  try {
    // TODO: 调用你的后端 API
    await $api.post('/verify-mfa', { code })
    
    // TODO: 执行你的业务逻辑
    await performYourOperation()
    
    showMfaModal.value = false
    alert('操作成功！')
  } catch (error) {
    alert('验证失败：' + error.message)
  } finally {
    mfaLoading.value = false
  }
}
```

### 步骤 4: 在模板中添加组件 (10 秒)

```html
<MfaVerificationModal
  v-model:open="showMfaModal"
  :loading="mfaLoading"
  title="安全验证"
  description="请输入 MFA 验证码"
  @verify="handleMfaVerify"
/>
```

**完成！** 🎉

---

## 在你的页面中集成（以资金管理为例）

### 场景：编辑产品配置时需要 MFA 验证

#### 修改前代码：

```vue
<script setup>
const saveProduct = () => {
  // 直接保存
  products.value.push(productData)
  alert('保存成功')
}
</script>

<template>
  <button @click="saveProduct">保存</button>
</template>
```

#### 修改后代码（带 MFA 验证）：

```vue
<script setup>
// 1. 导入组件
import MfaVerificationModal from '@/components/MfaVerificationModal.vue'

// 2. 添加状态
const showMfaModal = ref(false)
const mfaLoading = ref(false)
const pendingData = ref(null)

// 3. 修改保存逻辑
const saveProduct = () => {
  const productData = { /* ... */ }
  
  // 不直接保存，先显示 MFA 验证
  pendingData.value = productData
  showMfaModal.value = true
}

// 4. 处理验证
const handleMfaVerify = async (code) => {
  mfaLoading.value = true
  
  try {
    // 验证 MFA
    await $api.post('/verify-mfa', { code })
    
    // 验证成功后保存数据
    products.value.push(pendingData.value)
    
    showMfaModal.value = false
    pendingData.value = null
    alert('保存成功！')
  } catch (error) {
    alert('验证失败：' + error.message)
  } finally {
    mfaLoading.value = false
  }
}
</script>

<template>
  <button @click="saveProduct">保存</button>
  
  <!-- 添加 MFA 组件 -->
  <MfaVerificationModal
    v-model:open="showMfaModal"
    :loading="mfaLoading"
    title="产品配置验证"
    description="编辑产品配置需要 MFA 验证"
    @verify="handleMfaVerify"
  />
</template>
```

---

## 常见应用场景速查

### 1️⃣ 提现审核

```javascript
const approveWithdrawal = (request) => {
  pendingData.value = request
  showMfaModal.value = true
}

const handleMfaVerify = async (code) => {
  await $api.post('/verify-mfa', { code })
  await $api.post('/approve-withdrawal', pendingData.value)
  alert('审核通过')
}
```

### 2️⃣ 批量删除

```javascript
const batchDelete = () => {
  if (selectedIds.value.length === 0) return
  showMfaModal.value = true
}

const handleMfaVerify = async (code) => {
  await $api.post('/verify-mfa', { code })
  await $api.post('/batch-delete', { ids: selectedIds.value })
  alert(`删除了 ${selectedIds.value.length} 条记录`)
}
```

### 3️⃣ 系统参数修改

```javascript
const updateSystemConfig = () => {
  pendingData.value = systemConfig
  showMfaModal.value = true
}

const handleMfaVerify = async (code) => {
  await $api.post('/verify-mfa', { code })
  await $api.put('/system-config', pendingData.value)
  alert('配置更新成功')
}
```

### 4️⃣ 用户权限变更

```javascript
const updateUserRole = (user, newRole) => {
  pendingData.value = { userId: user.id, role: newRole }
  showMfaModal.value = true
}

const handleMfaVerify = async (code) => {
  await $api.post('/verify-mfa', { code })
  await $api.put('/user-role', pendingData.value)
  alert('用户权限已更新')
}
```

---

## 自定义样式和文案

### 修改标题和描述

```html
<MfaVerificationModal
  v-model:open="showMfaModal"
  :loading="mfaLoading"
  title="🔐 管理员安全验证"
  description="此操作涉及资金安全，需要管理员级别的 MFA 验证"
  @verify="handleMfaVerify"
/>
```

### 不同场景的文案建议

```javascript
// 资金操作
title="资金操作验证"
description="涉及资金的操作需要 MFA 二次验证"

// 配置修改
title="配置修改确认"
description="系统配置修改会影响所有用户，请谨慎操作"

// 批量操作
title="批量操作验证"
description="批量操作影响范围较大，请进行身份验证"

// 权限变更
title="权限变更验证"
description="修改用户权限需要管理员验证"
```

---

## 完整后端 API 对接示例

### 前端代码

```javascript
const handleMfaVerify = async (code) => {
  mfaLoading.value = true
  
  try {
    // 第一步：验证 MFA 码
    const verifyResponse = await axios.post('/api/mfa/verify', {
      code: code,
      operationType: 'PRODUCT_EDIT',
      timestamp: Date.now()
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!verifyResponse.data.success) {
      throw new Error(verifyResponse.data.message || '验证码错误')
    }
    
    // 第二步：执行业务操作
    const saveResponse = await axios.post('/api/products/save', 
      pendingData.value,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-MFA-Verified': 'true'  // 告诉后端已通过 MFA 验证
        }
      }
    )
    
    alert('保存成功！')
    showMfaModal.value = false
    
  } catch (error) {
    const message = error.response?.data?.message || error.message || '操作失败'
    alert(message)
  } finally {
    mfaLoading.value = false
  }
}
```

### 后端接口示例（Node.js/Express）

```javascript
// POST /api/mfa/verify
router.post('/mfa/verify', authenticateToken, async (req, res) => {
  const { code, operationType } = req.body
  const userId = req.user.id
  
  try {
    // 验证 MFA 码
    const verified = speakeasy.totp.verify({
      secret: req.user.mfaSecret,
      encoding: 'base32',
      token: code,
      window: 1  // 允许前后 1 个时间窗口（约 60 秒）
    })
    
    if (!verified) {
      return res.status(400).json({
        success: false,
        message: '验证码错误或已过期'
      })
    }
    
    // 记录审计日志
    await AuditLog.create({
      userId,
      operationType,
      action: 'MFA_VERIFIED',
      timestamp: new Date(),
      ip: req.ip
    })
    
    res.json({
      success: true,
      message: '验证通过',
      verifiedAt: new Date().toISOString()
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '验证服务异常'
    })
  }
})
```

---

## 错误处理最佳实践

### 完整的错误处理

```javascript
const handleMfaVerify = async (code) => {
  mfaLoading.value = true
  
  try {
    const response = await $api.post('/verify-mfa', { code })
    
    if (!response.data.success) {
      // 处理特定的错误类型
      switch (response.data.error) {
        case 'INVALID_CODE':
          throw new Error('验证码错误，请检查后重试')
        case 'CODE_EXPIRED':
          throw new Error('验证码已过期，请刷新页面')
        case 'ATTEMPTS_EXCEEDED':
          throw new Error('尝试次数过多，请稍后再试')
        default:
          throw new Error(response.data.message || '验证失败')
      }
    }
    
    // 继续业务逻辑...
    
  } catch (error) {
    // 网络错误
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      alert('网络连接失败，请检查网络后重试')
    }
    // HTTP 错误
    else if (error.response) {
      alert(error.response.data?.message || '服务器错误')
    }
    // 其他错误
    else {
      alert(error.message || '操作失败，请稍后重试')
    }
  } finally {
    mfaLoading.value = false
  }
}
```

---

## 测试清单

在将 MFA 组件集成到你的页面后，请确保测试以下场景：

- [ ] 打开弹窗，界面显示正常
- [ ] 输入空验证码，提示错误
- [ ] 输入少于 6 位的验证码，提示错误
- [ ] 输入正确的验证码，验证成功
- [ ] 输入错误的验证码，提示错误
- [ ] 点击取消按钮，弹窗关闭
- [ ] 点击遮罩层，弹窗关闭
- [ ] 按 ESC 键，弹窗关闭（可选）
- [ ] 加载状态显示正确
- [ ] 验证成功后，业务逻辑正常执行
- [ ] 验证失败后，可以重新尝试
- [ ] 多次快速点击，不会重复提交

---

## 性能优化建议

### 1. 按需加载组件

```javascript
// 使用动态导入，减少首屏加载体积
const MfaVerificationModal = defineAsyncComponent(() =>
  import('@/components/MfaVerificationModal.vue')
)
```

### 2. 缓存验证状态

```javascript
const recentVerifiedOperations = ref(new Set())

const handleMfaVerify = async (code, operationId) => {
  // 如果是刚刚验证过的操作，可以直接跳过
  if (recentVerifiedOperations.value.has(operationId)) {
    await performOperation()
    return
  }
  
  // 正常验证流程...
  await verifyAndPerformOperation(code)
  
  // 记录已验证的操作
  recentVerifiedOperations.value.add(operationId)
  
  // 5 分钟后清除记录
  setTimeout(() => {
    recentVerifiedOperations.value.delete(operationId)
  }, 5 * 60 * 1000)
}
```

---

## 相关资源

- **组件文件**: `src/components/MfaVerificationModal.vue`
- **示例文件**: `src/components/MfaVerificationModal.examples.js`
- **详细文档**: `doc/MFA_VERIFICATION_COMPONENT.md`
- **已集成页面**: `src/pages/liquidity/LiquidityLockedModulePage.vue`

---

## 获取帮助

如遇到问题，请检查：

1. 组件是否正确导入
2. Props 是否传递正确
3. 事件监听器是否绑定
4. 响应式变量是否定义
5. 后端 API 是否正常响应

---

**祝你集成顺利！** 🚀

如有任何问题，请参考完整文档或联系开发团队。
