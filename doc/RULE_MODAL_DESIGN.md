# 自动化规则配置界面设计文档

## 📋 概述

本设计为交割合约自动化规则管理系统提供了一个完整、易用的规则配置界面。通过分步引导的方式，帮助管理员轻松创建和管理复杂的自动化控制规则。

## 🎯 设计目标

1. **易用性**：分步引导界面，降低配置复杂度
2. **灵活性**：支持多种触发条件和执行动作的组合
3. **可视化**：实时预览和参数可视化，所见即所得
4. **高效性**：提供预设模板，快速创建常用规则
5. **完整性**：覆盖基础配置和高级选项的所有场景

## 🏗️ 核心架构

### 组件结构
```
DeliveryRuleModal.vue (规则配置模态框)
├── 步骤指示器 (4步)
├── 步骤1: 基本信息
│   ├── 预设模板选择
│   ├── 规则名称
│   ├── 规则描述
│   ├── 优先级选择
│   └── 初始状态
├── 步骤2: 触发条件
│   ├── 触发类型选择
│   ├── 时间周期设置
│   ├── 触发阈值
│   └── 附加筛选条件
├── 步骤3: 执行动作
│   ├── 动作类型选择
│   └── 动作参数配置
└── 步骤4: 高级选项
    ├── 生效时段
    ├── 用户筛选
    ├── 触发限制
    └── 通知设置
```

## ✨ 功能特性

### 1. 分步引导流程

界面采用4步引导流程，每步聚焦特定配置：

**步骤1：基本信息**
- 提供6种预设模板快速创建
- 配置规则名称、描述
- 设置优先级（高/中/低）
- 选择初始状态（运行/暂停/禁用）

**步骤2：触发条件**
- 7种触发类型可选：
  - 📊 交易次数
  - 📈 胜率
  - 💰 日盈利
  - 💎 持仓价值
  - 🎯 连续盈利
  - 📉 连续亏损
  - 💵 净入金
- 6种时间周期：实时、1小时、4小时、24小时、今日、7天
- 触发阈值设置，实时显示单位
- 附加筛选条件：
  - 胜率条件
  - 日盈利条件
  - 持仓价值条件
  - 用户风险等级

**步骤3：执行动作**
- 6种动作类型：
  - 🎚️ 胜率控制
  - ✅ 强制盈利
  - ❌ 强制亏损
  - 💹 价格调整
  - 🚫 订单拒绝
  - ⚖️ 仓位限制
- 根据动作类型显示对应参数配置
- 参数可视化，实时显示百分比等

**步骤4：高级选项**
- ⏰ 生效时段：设置规则生效的时间段和星期
- 👥 用户筛选：VIP等级、入金金额、注册天数、排除用户
- ⚠️ 触发限制：每日最大触发次数、单用户限制、冷却时间
- 📢 通知设置：Webhook、邮件通知

### 2. 预设模板系统

提供6个常用规则模板：

| 模板 | 图标 | 场景 |
|------|------|------|
| 高频交易控盈 | ⚡ | 限制高频交易用户的盈利 |
| 日盈利封顶 | 💰 | 限制单日盈利过高的用户 |
| 大额持仓控制 | 📊 | 对大额持仓采用不利价格 |
| 连胜阻断 | 🎯 | 阻止用户持续盈利 |
| VIP用户保护 | 👑 | 给高价值用户更好的胜率 |
| 胜率异常干预 | 📈 | 自动降低异常高胜率 |

用户点击模板后，自动填充对应配置，大幅提升创建效率。

### 3. 智能表单验证

每个步骤都有对应的验证逻辑：

```javascript
// 步骤1验证
- 规则名称必填
- 规则描述必填

// 步骤2验证
- 触发阈值必须大于0

// 步骤3验证
- 根据动作类型验证对应参数
  - 胜率控制：目标胜率0-1之间
  - 强制盈利/亏损：订单数量必须大于0
  - 仓位限制：最大持仓价值必须大于0
```

### 4. 动态表单系统

根据用户选择动态显示相关配置项：

**触发条件动态性**
- 选择不同触发类型，自动调整默认阈值和单位
- 根据触发类型决定是否显示时间周期选项

**执行动作动态性**
- 不同动作类型显示完全不同的参数配置面板
- 胜率控制：目标胜率、影响范围、持续时长
- 强制盈利/亏损：影响订单数量、盈亏幅度
- 价格调整：结算模式、偏移幅度
- 订单拒绝：锁定新仓、现有持仓调整、用户通知
- 仓位限制：最大持仓价值、最大杠杆

### 5. 可视化反馈

**实时数据展示**
- 百分比参数实时显示转换后的百分比值
- 阈值设置实时显示单位（次、%、USDT等）
- 触发条件预览：显示完整的触发条件描述

**状态可视化**
- 使用颜色区分不同优先级和状态
- 选中项高亮显示，提供视觉反馈
- 步骤进度可视化，当前步骤高亮

**规则预览**
- 在最后一步提供完整的规则预览
- 汇总展示规则的关键信息
- 用标签形式展示触发类型、动作类型、优先级

### 6. 交互设计细节

**配色方案**
- 主色调：蓝色（#2563EB）和紫色（#7C3AED）渐变
- 触发条件：蓝色系
- 执行动作：根据类型使用不同颜色
  - 胜率控制：蓝色
  - 强制盈利：绿色
  - 强制亏损：红色
  - 价格调整：琥珀色
  - 订单拒绝：橙色
  - 仓位限制：紫色

**图标系统**
- 每个功能模块使用表情符号图标
- 提升识别度和趣味性
- 减少界面严肃感

**响应式布局**
- 根据屏幕尺寸调整网格列数
- 移动端友好的触摸交互
- 模态框自适应高度，支持滚动

## 🔧 技术实现

### 1. 响应式数据管理

```javascript
// 使用 reactive 管理复杂表单数据
const form = reactive({
  name: '',
  description: '',
  status: DELIVERY_RULE_STATUS.ENABLED,
  priority: DELIVERY_RULE_PRIORITY.MEDIUM,
  trigger: { ... },
  action: { ... },
  advanced: { ... }
})
```

### 2. 计算属性优化

```javascript
// 动态获取当前选择的配置
const currentTriggerConfig = computed(() => {
  return triggerTypeOptions.find(opt => opt.value === form.trigger.type)
})

// 格式化显示
const formattedThreshold = computed(() => {
  const config = currentTriggerConfig.value
  const value = config.isPercentage 
    ? form.trigger.threshold 
    : form.trigger.threshold
  return `${value}${config.unit || ''}`
})
```

### 3. 监听器

```javascript
// 监听触发类型变化，自动调整默认值
watch(() => form.trigger.type, (newType) => {
  const config = triggerTypeOptions.find(opt => opt.value === newType)
  if (config) {
    form.trigger.threshold = config.defaultThreshold
  }
})

// 监听模态框打开，初始化表单
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    // 根据模式加载数据或重置表单
  }
})
```

### 4. 事件处理

```javascript
// 保存规则
const save = () => {
  if (!validateStep1() || !validateStep2() || !validateStep3()) {
    return
  }
  emit('save', { ...form })
  close()
}

// 应用模板
const applyTemplate = (template) => {
  Object.assign(form, template.preset)
  currentStep.value = 2 // 跳到下一步
}
```

## 📊 数据结构

### 规则数据结构

```javascript
{
  id: 'rule_001',
  name: '规则名称',
  description: '规则描述',
  status: 'enabled', // enabled | paused | disabled
  priority: 'high', // high | medium | low
  
  // 触发条件
  trigger: {
    type: 'trade_count', // 触发类型
    period: 'last_1h', // 时间周期
    threshold: 20, // 触发阈值
    conditions: { // 附加条件
      winRate: { enabled: true, operator: '>', value: 0.6 },
      dailyProfit: { enabled: false, operator: '>', value: 1000 },
      positionValue: { enabled: false, operator: '>', value: 5000 },
      riskLevel: { enabled: false, values: [] }
    }
  },
  
  // 执行动作
  action: {
    type: 'win_rate_control', // 动作类型
    params: { // 动作参数（根据类型不同而不同）
      targetWinRate: 0.35,
      applyToNewPositions: true,
      duration: 0
    }
  },
  
  // 高级选项
  advanced: {
    enabled: true,
    schedule: { // 生效时段
      enabled: false,
      startTime: '09:00',
      endTime: '23:00',
      weekdays: [1, 2, 3, 4, 5, 6, 7]
    },
    userFilter: { // 用户筛选
      enabled: false,
      vipLevels: [],
      minDeposit: 0,
      maxDeposit: 0,
      registrationDays: { min: 0, max: 0 },
      excludeUserIds: ''
    },
    limits: { // 触发限制
      maxHitsPerDay: 0,
      maxHitsPerUser: 0,
      cooldownMinutes: 0
    },
    notification: { // 通知设置
      enabled: false,
      webhookUrl: '',
      emailList: ''
    }
  },
  
  // 统计数据
  hitCount: 34,
  lastHitAt: '2026-03-10 14:35:22',
  totalAffectedUsers: 156,
  createdAt: '2026-03-01 10:00:00',
  updatedAt: '2026-03-10 08:00:00'
}
```

## 🎨 UI/UX 设计亮点

### 1. 渐进式配置
从简单到复杂，步骤化引导用户完成配置，避免一次性展示过多信息造成认知负担。

### 2. 预设模板
为常见场景提供模板，既可以直接使用，也可以在模板基础上修改，大幅提升效率。

### 3. 视觉层次
- 使用卡片和颜色区分不同配置区域
- 重要信息使用粗体和颜色高亮
- 辅助信息使用小字和灰色

### 4. 即时反馈
- 输入框失焦时验证
- 实时计算和显示转换后的值
- 步骤验证失败时弹窗提示

### 5. 无障碍设计
- 表单标签清晰
- 必填项使用星号标注
- 帮助文本说明参数含义
- 键盘导航支持

## 🚀 使用方式

### 在页面中集成

```vue
<template>
  <div>
    <button @click="openCreateModal">新增规则</button>
    
    <DeliveryRuleModal
      :open="modalOpen"
      :mode="modalMode"
      :rule="currentRule"
      @close="closeModal"
      @save="saveRule"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DeliveryRuleModal from '@/components/DeliveryRuleModal.vue'

const modalOpen = ref(false)
const modalMode = ref('create') // 'create' | 'edit' | 'duplicate'
const currentRule = ref(null)

const openCreateModal = () => {
  modalMode.value = 'create'
  currentRule.value = null
  modalOpen.value = true
}

const openEditModal = (rule) => {
  modalMode.value = 'edit'
  currentRule.value = rule
  modalOpen.value = true
}

const saveRule = (ruleData) => {
  // 保存规则逻辑
  console.log('保存规则：', ruleData)
}

const closeModal = () => {
  modalOpen.value = false
}
</script>
```

### 组件属性

| 属性 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| open | Boolean | 是否打开模态框 | false |
| mode | String | 模式：'create'(新增) / 'edit'(编辑) / 'duplicate'(复制) | 'create' |
| rule | Object | 编辑或复制时传入的规则对象 | null |

### 组件事件

| 事件 | 参数 | 说明 |
|------|------|------|
| close | - | 关闭模态框 |
| save | ruleData | 保存规则，参数为完整的规则数据对象 |

## 🔄 扩展性

### 1. 添加新的触发类型

在 `triggerTypeOptions` 数组中添加新配置：

```javascript
{
  value: 'new_trigger_type',
  label: '新触发类型',
  icon: '🆕',
  description: '触发类型描述',
  unit: '单位',
  needsPeriod: true,
  defaultThreshold: 10
}
```

### 2. 添加新的动作类型

在 `actionTypeOptions` 数组中添加新配置：

```javascript
{
  value: 'new_action_type',
  label: '新动作类型',
  icon: '🆕',
  description: '动作类型描述',
  color: 'blue'
}
```

然后在步骤3中添加对应的参数配置UI：

```vue
<div v-if="form.action.type === 'new_action_type'" class="space-y-4">
  <!-- 自定义参数配置 -->
</div>
```

### 3. 添加新的预设模板

在 `ruleTemplates` 数组中添加新模板：

```javascript
{
  id: 'new_template',
  name: '模板名称',
  icon: '🆕',
  description: '模板描述',
  preset: {
    // 完整的规则配置
  }
}
```

## 📝 最佳实践

### 1. 规则命名
- 使用清晰、描述性的名称
- 说明触发条件和动作
- 例如："高频交易控盈"、"日盈利封顶"

### 2. 规则描述
- 详细说明触发场景
- 说明执行的动作和影响
- 例如："1小时内交易超过20次且胜率超过60%的用户，自动降低胜率到35%"

### 3. 优先级设置
- 高优先级：关键风控规则
- 中优先级：常规控制规则
- 低优先级：优化和保护规则

### 4. 测试建议
- 新规则先设置为"暂停"状态
- 在高级选项中设置触发限制
- 启用通知，监控规则执行情况
- 确认无误后再启用

## 🐛 故障排查

### 问题1：保存后规则没有生效
**检查项：**
- 规则状态是否为"运行中"
- 高级选项中的生效时段是否正确
- 用户是否符合筛选条件

### 问题2：规则触发频率过高
**解决方案：**
- 调整触发阈值，提高门槛
- 在高级选项中设置冷却时间
- 限制每日最大触发次数

### 问题3：规则没有触发
**检查项：**
- 触发阈值是否设置过高
- 附加条件是否过于严格
- 时间周期是否合理

## 📈 未来优化方向

1. **规则模拟器**：在保存前模拟规则效果
2. **规则冲突检测**：检测多个规则之间的冲突
3. **批量操作**：支持批量启用/禁用规则
4. **规则分组**：按场景或功能对规则分组管理
5. **规则模板市场**：分享和导入社区规则模板
6. **可视化规则流**：图形化展示规则的触发流程
7. **A/B测试**：支持规则效果的对比测试
8. **智能推荐**：根据历史数据推荐规则配置

## 📄 总结

这个自动化规则配置界面设计充分考虑了易用性、灵活性和扩展性，通过分步引导、预设模板、动态表单等方式，让复杂的规则配置变得简单直观。同时保留了高度的自定义空间，满足各种复杂的业务场景需求。

界面采用现代化的设计风格，配色和谐，交互流畅，为管理员提供了出色的使用体验。
