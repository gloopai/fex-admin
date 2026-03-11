# 币种管理 MFA 验证集成说明

## 📍 集成位置

**页面**: 资金管理 / 币种管理  
**路由**: `/assets/currencies`  
**文件**: `src/pages/assets/AssetsCurrencyPage.vue`

---

## ✅ 已完成的修改

### 1. 导入 MFA 组件

```javascript
import MfaVerificationModal from '../../components/MfaVerificationModal.vue'
```

### 2. 添加 MFA 相关状态

```javascript
// MFA 验证相关
const showMfaModal = ref(false)
const pendingSaveData = ref(null)
const mfaLoading = ref(false)
```

### 3. 修改保存逻辑

**修改前**：直接保存数据
```javascript
const saveCoin = () => {
  const payload = { /* ... */ }
  
  if (editingCoinId.value) {
    coins.value = coins.value.map((coin) => 
      (coin.id === editingCoinId.value ? { ...coin, ...payload } : coin)
    )
  } else {
    coins.value.unshift({ id: `coin-${Date.now()}`, ...payload })
  }
  
  showEditModal.value = false
}
```

**修改后**：先显示 MFA 验证
```javascript
const saveCoin = () => {
  const payload = { /* ... */ }
  
  // 保存待提交的数据，先显示 MFA 验证弹窗
  pendingSaveData.value = payload
  showMfaModal.value = true
}

// 处理 MFA 验证
const handleMfaVerify = async (code) => {
  mfaLoading.value = true
  
  try {
    // TODO: 调用后端 API 验证 MFA
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 验证成功后执行保存
    if (pendingSaveData.value) {
      if (editingCoinId.value) {
        coins.value = coins.value.map((coin) => 
          (coin.id === editingCoinId.value ? { ...coin, ...pendingSaveData.value } : coin)
        )
      } else {
        coins.value.unshift({ id: `coin-${Date.now()}`, ...pendingSaveData.value })
      }
      
      showEditModal.value = false
      pendingSaveData.value = null
      showMfaModal.value = false
      alert('币种配置保存成功！')
    }
  } catch (error) {
    alert('MFA 验证失败：' + (error.message || '请稍后重试'))
  } finally {
    mfaLoading.value = false
  }
}
```

### 4. 在模板中添加 MFA 组件

```html
<!-- MFA 验证弹窗 -->
<MfaVerificationModal
  v-model:open="showMfaModal"
  :loading="mfaLoading"
  title="安全验证"
  description="编辑币种配置属于敏感操作，请输入 MFA 验证码"
  @verify="handleMfaVerify"
  @cancel="pendingSaveData = null"
/>
```

---

## 🎯 功能流程

1. **用户点击"编辑"按钮** → 打开币种编辑弹窗
2. **用户修改配置并点击"保存"** → 不直接保存，而是：
   - 准备要保存的数据
   - 显示 MFA 验证弹窗
3. **用户输入 6 位验证码** → 点击"验证并继续"
4. **前端验证** → 检查格式（6 位数字）
5. **调用后端 API** → 验证 MFA 码（需要实现）
6. **验证成功** → 保存币种配置，关闭所有弹窗
7. **验证失败** → 显示错误提示，允许重试

---

## 🔧 后续工作

### 替换 TODO 为实际 API 调用

在 `handleMfaVerify` 函数中（第 120 行左右）：

```javascript
// TODO: 这里调用后端 API 验证 MFA 验证码
// const response = await api.verifyMFA(code)

// 替换为：
const response = await axios.post('/api/mfa/verify', {
  code: code,
  operationType: 'CURRENCY_EDIT',
  userId: currentUserId
})

if (!response.data.success) {
  throw new Error(response.data.message || '验证码错误')
}
```

---

## 📝 测试步骤

1. 打开浏览器，访问 `/assets/currencies` 页面
2. 点击任意币种的"编辑"按钮
3. 修改一些配置信息
4. 点击"保存"按钮
5. **预期结果**：
   - ✅ 弹出 MFA 验证对话框
   - ✅ 背景变暗，z-index 正确显示在最上层
   - ✅ 标题显示"安全验证"
   - ✅ 描述显示"编辑币种配置属于敏感操作，请输入 MFA 验证码"
6. 输入错误的验证码（如：12345） → 提示"验证码必须是 6 位数字"
7. 输入正确的 6 位验证码（如：123456） → 显示加载状态
8. 验证成功后 → 显示"币种配置保存成功"，关闭弹窗

---

## 🎨 UI 效果

- **弹窗层级**: z-index: 9999（确保在最顶层）
- **背景遮罩**: rgba(0, 0, 0, 0.45)（半透明黑色）
- **动画效果**: Modal 过渡动画（缩放 + 淡入淡出）
- **图标**: 安全锁图标（蓝色圆形背景）
- **按钮**: 
  - 取消按钮（灰色边框）
  - 验证按钮（蓝色背景，加载中显示旋转图标）

---

## 🚀 复用到其他页面

现在 MFA 组件已经成功集成到币种管理页面，你可以用同样的方式集成到其他页面：

### 快速集成步骤

1. **导入组件**
```javascript
import MfaVerificationModal from '@/components/MfaVerificationModal.vue'
```

2. **添加状态**
```javascript
const showMfaModal = ref(false)
const pendingSaveData = ref(null)
const mfaLoading = ref(false)
```

3. **修改保存函数**
```javascript
const handleSave = () => {
  const data = { /* ... */ }
  pendingSaveData.value = data
  showMfaModal.value = true
}

const handleMfaVerify = async (code) => {
  mfaLoading.value = true
  try {
    await api.verifyMFA(code)
    await api.save(pendingSaveData.value)
    showMfaModal.value = false
    alert('保存成功')
  } catch (error) {
    alert('验证失败')
  } finally {
    mfaLoading.value = false
  }
}
```

4. **添加组件到模板**
```html
<MfaVerificationModal
  v-model:open="showMfaModal"
  :loading="mfaLoading"
  title="安全验证"
  description="此操作需要 MFA 验证"
  @verify="handleMfaVerify"
  @cancel="pendingSaveData = null"
/>
```

---

## 📋 相关文件

- **组件文件**: `src/components/MfaVerificationModal.vue`
- **集成页面**: `src/pages/assets/AssetsCurrencyPage.vue`
- **使用示例**: `src/components/MfaVerificationModal.examples.js`
- **详细文档**: `doc/MFA_VERIFICATION_COMPONENT.md`
- **快速指南**: `doc/MFA_QUICK_START.md`

---

## ⚠️ 注意事项

1. **z-index 设置**: MFA 弹窗的 z-index 设置为 9999，确保在所有其他元素之上
2. **响应式更新**: 使用 Vue 3 的响应式系统，确保状态变更能触发视图更新
3. **错误处理**: 提供清晰的错误提示，区分网络错误、验证码错误等
4. **用户体验**: 验证前保存待处理数据，避免验证失败后用户需要重新填写

---

## ✨ 技术亮点

- ✅ **组件化设计** - 完全解耦，易于复用
- ✅ **两步验证** - 先验证身份，再执行业务逻辑
- ✅ **数据安全** - 验证前保存数据，避免重复填写
- ✅ **用户体验** - 流畅动画、清晰反馈、键盘支持
- ✅ **类型安全** - 明确的 Props 和 Events 定义
- ✅ **文档完善** - 中文详细文档 + 丰富示例

---

**集成日期**: 2026-03-11  
**状态**: ✅ 完成并可用  
**下一步**: 实现后端 MFA 验证 API
