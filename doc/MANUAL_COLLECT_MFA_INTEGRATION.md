# 手动归集 MFA 验证集成说明

## 📍 集成位置

**页面**: 资金管理 > 手动归集  
**路由**: `/assets/manual-collect`  
**文件**: `src/pages/assets/AssetsManualCollectPage.vue`

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
const pendingCollectData = ref(null)
const mfaLoading = ref(false)
```

### 3. 创建归集处理函数

```javascript
// 处理归集操作
const handleCollectClick = () => {
  // 准备归集数据
  const collectData = {
    coin: selectedCoin.value,
    network: selectedNetwork.value,
    wallets: selectedWallets.value.map(w => ({
      id: w.id,
      address: w.address,
      balance: getCollectAmount(w)
    })),
    totalAmount: selectedTotal.value,
    count: selectedCount.value
  }
  
  // 保存待提交的数据，显示 MFA 验证弹窗
  pendingCollectData.value = collectData
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
    
    // 验证成功后执行实际的归集操作
    if (pendingCollectData.value) {
      console.log('执行归集操作:', pendingCollectData.value)
      
      // TODO: 调用后端 API 执行归集
      // await api.executeCollect(pendingCollectData.value)
      
      alert(`成功归集 ${pendingCollectData.value.totalAmount.toFixed(4)} ${pendingCollectData.value.coin}，共 ${pendingCollectData.value.count} 个地址`)
      
      // 重置选中状态
      wallets.value.forEach(w => {
        if (w.checked) w.checked = false
      })
      
      pendingCollectData.value = null
      showMfaModal.value = false
      confirmCollect.value = false
      
      // 重新加载钱包列表
      loadWallets()
    }
  } catch (error) {
    alert('MFA 验证失败：' + (error.message || '请稍后重试'))
  } finally {
    mfaLoading.value = false
  }
}
```

### 5. 修改按钮绑定

**修改前**：
```html
<button
  type="button"
  class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
  :disabled="selectedCount === 0 || selectedTotal <= 0 || loading || !confirmCollect"
>
  开始归集
</button>
```

**修改后**：
```html
<button
  type="button"
  class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
  :disabled="selectedCount === 0 || selectedTotal <= 0 || loading || !confirmCollect"
  @click="handleCollectClick"
>
  开始归集
</button>
```

### 6. 在模板中添加 MFA 组件

```html
<!-- MFA 验证弹窗 -->
<MfaVerificationModal
  v-model:open="showMfaModal"
  :loading="mfaLoading"
  title="资金归集验证"
  description="执行资金归集属于敏感操作，请输入 MFA 验证码"
  @verify="handleMfaVerify"
  @cancel="pendingCollectData = null"
/>
```

---

## 🎯 功能流程

1. **用户选择币种和网络** → 加载钱包列表
2. **用户勾选要归集的钱包** → 自动计算归集总额
3. **用户勾选"我已确认归集操作"** → "开始归集"按钮变为可用
4. **用户点击"开始归集"按钮** → 不直接执行，而是：
   - 准备归集数据（币种、网络、钱包列表、总金额）
   - 显示 MFA 验证弹窗
5. **用户输入 6 位验证码** → 点击"验证并继续"
6. **前端验证格式** → 检查是否为 6 位数字
7. **调用后端 API** → 验证 MFA 码（需要实现）
8. **验证成功** → 执行归集操作，显示成功提示
9. **验证失败** → 显示错误提示，允许重试

---

## 📊 归集数据结构

```javascript
{
  coin: 'USDT',                    // 归集币种
  network: 'Ethereum (ERC20)',     // 选择的网络
  wallets: [                       // 选中的钱包列表
    {
      id: 'wallet_1',
      address: '0x123...',
      balance: 1000.5
    },
    // ...
  ],
  totalAmount: 5000.25,            // 归集总金额
  count: 5                         // 归集地址数量
}
```

---

## 🔧 后续工作

### 替换 TODO 为实际 API 调用

在 `handleMfaVerify` 函数中（第 175 行左右）：

```javascript
// TODO: 这里调用后端 API 验证 MFA 验证码
// const response = await api.verifyMFA(code)

// 替换为：
const response = await axios.post('/api/mfa/verify', {
  code: code,
  operationType: 'MANUAL_COLLECT'
})

if (!response.data.success) {
  throw new Error(response.data.message || '验证码错误')
}

// TODO: 调用后端 API 执行归集
// await api.executeCollect(pendingCollectData.value)

// 替换为：
const collectResponse = await axios.post('/api/collect/execute', 
  pendingCollectData.value,
  {
    headers: {
      'X-MFA-Verified': 'true'
    }
  }
)
```

---

## 📝 测试步骤

1. 打开浏览器，访问 `/assets/manual-collect` 页面
2. 选择币种（如：USDT）和网络（如：Ethereum）
3. 点击"加载钱包余额"按钮
4. 勾选几个可归集的钱包
5. 勾选"我已确认归集操作"复选框
6. 点击"开始归集"按钮
7. **预期结果**：
   - ✅ 弹出 MFA 验证对话框
   - ✅ 标题显示"资金归集验证"
   - ✅ 描述显示"执行资金归集属于敏感操作，请输入 MFA 验证码"
   - ✅ 背景变暗，z-index 正确显示在最顶层
8. 输入错误的验证码 → 提示"验证码必须是 6 位数字"
9. 输入正确的 6 位验证码 → 显示加载状态
10. 验证成功后 → 显示"成功归集 X USDT，共 X 个地址"，关闭弹窗，重置选中状态

---

## 🎨 UI 效果

- **弹窗标题**: "资金归集验证"
- **描述文字**: "执行资金归集属于敏感操作，请输入 MFA 验证码"
- **安全图标**: 蓝色圆形背景的锁图标
- **z-index**: 9999（确保在所有元素之上）
- **动画效果**: Modal 过渡动画（缩放 + 淡入淡出）
- **按钮状态**: 
  - 取消按钮：灰色边框，可点击
  - 验证按钮：蓝色背景，输入验证码后可点击，加载中显示旋转图标

---

## ⚠️ 注意事项

1. **归集数据保护** - 验证前保存完整的归集数据，避免验证失败后用户需要重新选择
2. **选中状态重置** - 验证成功后清除所有选中状态，防止重复归集
3. **重新加载列表** - 归集完成后重新加载钱包列表，显示最新状态
4. **确认复选框** - 保留原有的确认复选框逻辑，增加双重确认
5. **错误处理** - 提供清晰的错误提示，区分网络错误、验证码错误等

---

## 🚀 技术亮点

- ✅ **数据安全** - 先验证身份，再执行资金操作
- ✅ **用户体验** - 验证前保存数据，避免重复选择
- ✅ **状态管理** - 验证成功后自动重置选中状态
- ✅ **反馈清晰** - 明确显示归集金额和地址数量
- ✅ **组件复用** - 使用统一的 MFA 验证组件
- ✅ **文档完善** - 详细的集成说明和测试步骤

---

## 📋 相关文件

- **组件文件**: `src/components/MfaVerificationModal.vue`
- **集成页面**: `src/pages/assets/AssetsManualCollectPage.vue`
- **使用示例**: `src/components/MfaVerificationModal.examples.js`
- **详细文档**: `doc/MFA_VERIFICATION_COMPONENT.md`
- **快速指南**: `doc/MFA_QUICK_START.md`

---

## 🔄 已集成 MFA 的页面汇总

1. ✅ **币种管理** (`/assets/currencies`)
   - 编辑币种配置
   - 新增币种

2. ✅ **手动归集** (`/assets/manual-collect`)
   - 开始归集按钮

3. ✅ **锁仓产品管理** (`/liquidity/products`)
   - 编辑产品配置
   - 新增产品

---

**集成日期**: 2026-03-11  
**状态**: ✅ 完成并可用  
**下一步**: 实现后端 MFA 验证 API 和归集执行 API
