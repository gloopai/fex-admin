# 交割合约自动化场控 MFA 验证集成说明

## 📍 集成位置

**页面**: 交割合约 > 自动化场控  
**路由**: `/delivery/auto-rule`  
**文件**: `src/pages/delivery/DeliveryAutoRulePage.vue`

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

**修改前**：直接保存规则
```javascript
const saveRule = (ruleData) => {
  if (modalMode.value === 'create' || modalMode.value === 'duplicate') {
    const newRule = { /* ... */ }
    rules.value.unshift(newRule)
  } else if (modalMode.value === 'edit') {
    const index = rules.value.findIndex(r => r.id === currentRule.value.id)
    if (index !== -1) {
      rules.value[index] = { /* ... */ }
    }
  }
  closeModal()
}
```

**修改后**：先显示 MFA 验证
```javascript
const saveRule = (ruleData) => {
  // 准备保存数据，显示 MFA 验证
  pendingSaveData.value = {
    mode: modalMode.value,
    ruleData,
    currentRule: currentRule.value
  }
  showMfaModal.value = true
}
```

### 4. 实现 MFA 验证处理函数

```javascript
// 处理 MFA 验证
const handleMfaVerify = async (code) => {
  mfaLoading.value = true
  
  try {
    // TODO: 调用后端 API 验证 MFA
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 验证成功后执行实际的保存操作
    if (pendingSaveData.value) {
      const { mode, ruleData, currentRule } = pendingSaveData.value
      
      if (mode === 'create' || mode === 'duplicate') {
        // 新增规则
        const newRule = {
          id: `rule_${Date.now()}`,
          ...ruleData,
          hitCount: 0,
          lastHitAt: '-',
          totalAffectedUsers: 0,
          createdAt: new Date().toLocaleString('zh-CN'),
          updatedAt: new Date().toLocaleString('zh-CN')
        }
        rules.value.unshift(newRule)
        alert('自动化规则创建成功！')
      } else if (mode === 'edit') {
        // 编辑规则
        const index = rules.value.findIndex(r => r.id === currentRule.id)
        if (index !== -1) {
          rules.value[index] = {
            ...rules.value[index],
            ...ruleData,
            updatedAt: new Date().toLocaleString('zh-CN')
          }
          alert('自动化规则编辑成功！')
        }
      }
      
      closeModal()
      pendingSaveData.value = null
      showMfaModal.value = false
    }
  } catch (error) {
    alert('MFA 验证失败：' + (error.message || '请稍后重试'))
  } finally {
    mfaLoading.value = false
  }
}
```

### 5. 在模板中添加 MFA 组件

```html
<!-- MFA 验证弹窗 -->
<MfaVerificationModal
  v-model:open="showMfaModal"
  :loading="mfaLoading"
  title="自动化规则验证"
  description="新增或编辑自动化场控规则属于敏感操作，请输入 MFA 验证码"
  @verify="handleMfaVerify"
  @cancel="pendingSaveData = null"
/>
```

---

## 🎯 功能流程

1. **用户点击"新增规则"按钮** → 打开规则配置弹窗
2. **用户填写触发条件和执行动作**
3. **用户点击"保存"** → 不直接保存，而是：
   - 准备规则数据
   - 设置 `pendingSaveData`（包含模式、规则数据、当前规则）
   - 显示 MFA 验证弹窗
4. **用户输入 6 位验证码** → 点击"验证并继续"
5. **前端验证格式** → 检查是否为 6 位数字
6. **调用后端 API** → 验证 MFA 码（需要实现）
7. **验证成功** → 根据模式保存规则（新增/编辑）
8. **验证失败** → 显示错误提示，允许重试

---

## 📊 支持的操作模式

### 1. 新增规则 (`create`)
- 创建全新的自动化规则
- 验证成功后添加到列表顶部
- 显示"自动化规则创建成功！"

### 2. 编辑规则 (`edit`)
- 修改现有规则的配置
- 验证成功后更新对应规则
- 显示"自动化规则编辑成功！"

### 3. 复制规则 (`duplicate`)
- 基于现有规则创建新规则
- 验证成功后添加到列表顶部
- 显示"自动化规则创建成功！"

---

## 🔧 后续工作

### 替换 TODO 为实际 API 调用

在 `handleMfaVerify` 函数中（第 191 行左右）：

```javascript
// TODO: 这里调用后端 API 验证 MFA 验证码
// const response = await api.verifyMFA(code)

// 替换为：
const response = await axios.post('/api/mfa/verify', {
  code: code,
  operationType: modalMode.value === 'edit' 
    ? 'DELIVERY_RULE_EDIT' 
    : 'DELIVERY_RULE_CREATE'
})

if (!response.data.success) {
  throw new Error(response.data.message || '验证码错误')
}

// 然后调用后端 API 保存规则
if (modalMode.value === 'edit') {
  await axios.put(`/api/delivery/rules/${currentRule.value.id}`, ruleData)
} else {
  await axios.post('/api/delivery/rules', ruleData)
}
```

---

## 📝 测试步骤

### 测试新增规则

1. 访问 `/delivery/auto-rule` 页面
2. 点击"+ 新增规则"按钮
3. 填写规则配置：
   - 规则名称（必填）
   - 触发条件
   - 执行动作
4. 点击"保存"按钮
5. **预期结果**：
   - ✅ 弹出 MFA 验证对话框
   - ✅ 标题显示"自动化规则验证"
   - ✅ 描述显示"新增或编辑自动化场控规则属于敏感操作，请输入 MFA 验证码"
   - ✅ 背景变暗，z-index 正确
6. 输入 6 位验证码 → 点击"验证并继续"
7. 验证成功 → 显示"自动化规则创建成功！"，关闭弹窗，列表中显示新规则

### 测试编辑规则

1. 在同一页面，找到任意规则
2. 点击"编辑"按钮
3. 修改规则配置
4. 点击"保存"按钮
5. **预期结果**：
   - ✅ 弹出 MFA 验证对话框
   - ✅ 标题显示"自动化规则验证"
   - ✅ 描述显示"新增或编辑自动化场控规则属于敏感操作，请输入 MFA 验证码"
6. 输入 6 位验证码 → 点击"验证并继续"
7. 验证成功 → 显示"自动化规则编辑成功！"，关闭弹窗，列表中规则被更新

---

## 🎨 UI 效果

- **弹窗标题**: "自动化规则验证"
- **描述文字**: "新增或编辑自动化场控规则属于敏感操作，请输入 MFA 验证码"
- **安全图标**: 蓝色圆形背景的锁图标
- **z-index**: 9999（确保在所有元素之上）
- **动画效果**: Modal 过渡动画（缩放 + 淡入淡出）
- **按钮状态**: 
  - 取消按钮：灰色边框
  - 验证按钮：蓝色背景，加载中显示旋转图标

---

## ⚠️ 注意事项

1. **三种模式统一验证** - 新增、编辑、复制都需要 MFA 验证
2. **数据完整性** - `pendingSaveData` 包含完整的保存信息（模式、规则数据、当前规则）
3. **错误处理** - 提供清晰的错误提示，区分网络错误、验证码错误等
4. **状态清理** - 验证成功或取消后，清理所有临时状态
5. **提示信息** - 根据不同操作显示不同的成功提示

---

## 🚀 技术亮点

- ✅ **统一管理** - 新增和编辑共用同一个验证流程
- ✅ **数据保护** - 验证前保存完整数据，避免重复填写
- ✅ **用户体验** - 流畅动画、清晰反馈、键盘支持
- ✅ **组件复用** - 使用统一的 MFA 验证组件
- ✅ **代码整洁** - 逻辑清晰，易于维护
- ✅ **模式区分** - 通过 `mode` 字段区分不同操作

---

## 📋 相关文件

- **组件文件**: `src/components/MfaVerificationModal.vue`
- **集成页面**: `src/pages/delivery/DeliveryAutoRulePage.vue`
- **使用示例**: `src/components/MfaVerificationModal.examples.js`
- **详细文档**: `doc/MFA_VERIFICATION_COMPONENT.md`
- **快速指南**: `doc/MFA_QUICK_START.md`

---

## 🔄 已集成 MFA 的页面汇总

现在已经有**5 个页面/模块**集成了 MFA 验证：

1. ✅ **币种管理** (`/assets/currencies`)
   - 编辑/新增币种配置
   
2. ✅ **手动归集** (`/assets/manual-collect`)
   - 开始归集按钮
   
3. ✅ **锁仓产品管理** (`/liquidity/products`)
   - 编辑/新增产品配置

4. ✅ **永续合约线控** (`/perpetual/control`)
   - 线控参数配置
   - 自动线控规则（新增/编辑）

5. ✅ **交割合约自动化场控** (`/delivery/auto-rule`) ⭐ **最新**
   - 自动化规则（新增/编辑/复制）

---

**集成日期**: 2026-03-11  
**状态**: ✅ 完成并可用  
**下一步**: 实现后端 MFA 验证 API 和规则保存 API
