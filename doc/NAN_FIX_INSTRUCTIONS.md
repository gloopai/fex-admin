# Fix for NaN Issue When Switching Action Types

## Problem
When switching from "Profit Control" (盈亏控制) to "Force Win/Force Loss" (强制盈利/强制亏损), the fluctuation fields show `NaN` because they're not initialized.

## Root Cause
The new fluctuation fields (`winFluctuationPercent` and `lossFluctuationPercent`) are only defined in the initial form data but not initialized when switching action types.

## Solution

### 1. Add Computed Properties (After line 554 in DeliveryRuleModal.vue)

Add these computed properties after the `maxFluctuation` computed property:

```javascript
// Get actual win/loss range for force win/force loss
const getForceWinRange = computed(() => {
  const profitPercent = Number(form.action.params.profitPercent) || 0;
  const winFluctuationPercent = Number(form.action.params.winFluctuationPercent) || 2;
  const min = ((profitPercent - winFluctuationPercent / 100) * 100).toFixed(1);
  const max = ((profitPercent + winFluctuationPercent / 100) * 100).toFixed(1);
 return { min, max };
});

const getForceLossRange = computed(() => {
  const lossPercent = Number(form.action.params.lossPercent) || 0;
  const lossFluctuationPercent = Number(form.action.params.lossFluctuationPercent) || 2;
  const min = ((lossPercent - lossFluctuationPercent / 100) * 100).toFixed(1);
  const max = ((lossPercent + lossFluctuationPercent / 100) * 100).toFixed(1);
 return { min, max };
});
```

### 2. Add Watch for Action Type Changes (After line 631 in DeliveryRuleModal.vue)

Add this watcher after the trigger type watcher:

```javascript
// 监听执行动作类型变化，确保波动字段初始化
watch(
  () => form.action.type,
  (newType) => {
    // Ensure fluctuation fields are always initialized with valid numbers
   if (newType === DELIVERY_RULE_ACTION.FORCE_WIN) {
      form.action.params.winFluctuationPercent = Number(form.action.params.winFluctuationPercent) || 2;
    } else if (newType === DELIVERY_RULE_ACTION.FORCE_LOSS) {
      form.action.params.lossFluctuationPercent = Number(form.action.params.lossFluctuationPercent) || 2;
    }
  },
);
```

### 3. Update Template Expressions

#### Force Loss Section (Around lines 1463, 1484):

**Line 1463** - Change:
```vue
每单亏损将在 {{ (form.action.params.lossPercent * 100).toFixed(0) }}% 基础上随机波动 ±{{ form.action.params.lossFluctuationPercent || 0 }}%
```

To:
```vue
每单亏损将在 {{ ((Number(form.action.params.lossPercent) || 0) * 100).toFixed(0) }}% 基础上随机波动 ±{{ Number(form.action.params.lossFluctuationPercent) || 2 }}%
```

**Line 1479-1480** - Change:
```vue
>{{ (form.action.params.lossPercent * 100).toFixed(0) }}% ±{{ form.action.params.lossFluctuationPercent || 0 }}%</strong>
```

To:
```vue
>{{ ((Number(form.action.params.lossPercent) || 0) * 100).toFixed(0) }}% ±{{ Number(form.action.params.lossFluctuationPercent) || 2 }}%</strong>
```

**Line 1484** - Change:
```vue
实际亏损范围：{{ ((form.action.params.lossPercent - form.action.params.lossFluctuationPercent / 100) * 100).toFixed(1) }}% ~ {{ ((form.action.params.lossPercent + form.action.params.lossFluctuationPercent / 100) * 100).toFixed(1) }}%
```

To:
```vue
实际亏损范围：{{ getForceLossRange.min }}% ~ {{ getForceLossRange.max }}%
```

#### Force Win Section (Around lines 1601, 1618):

**Line 1601** - Change:
```vue
每单盈利将在 {{ (form.action.params.profitPercent * 100).toFixed(0) }}% 基础上随机波动 ±{{ form.action.params.winFluctuationPercent || 0 }}%
```

To:
```vue
每单盈利将在 {{ ((Number(form.action.params.profitPercent) || 0) * 100).toFixed(0) }}% 基础上随机波动 ±{{ Number(form.action.params.winFluctuationPercent) || 2 }}%
```

**Line 1617-1618** - Change:
```vue
>{{ (form.action.params.profitPercent * 100).toFixed(0) }}% ±{{ form.action.params.winFluctuationPercent || 0 }}%</strong>
```

To:
```vue
>{{ ((Number(form.action.params.profitPercent) || 0) * 100).toFixed(0) }}% ±{{ Number(form.action.params.winFluctuationPercent) || 2 }}%</strong>
```

**Line 1622** - Change:
```vue
实际盈利范围：{{ ((form.action.params.profitPercent - form.action.params.winFluctuationPercent / 100) * 100).toFixed(1) }}% ~ {{ ((form.action.params.profitPercent + form.action.params.winFluctuationPercent / 100) * 100).toFixed(1) }}%
```

To:
```vue
实际盈利范围：{{ getForceWinRange.min }}% ~ {{ getForceWinRange.max }}%
```

### 4. Update Range Display Lines

Also update the display lines that show the fluctuation values to use safer number coercion:

**For slider value displays** (lines 1439, 1577):
```vue
±{{ Number(form.action.params.lossFluctuationPercent) || 2 }}%
±{{ Number(form.action.params.winFluctuationPercent) || 2 }}%
```

## Testing Steps

1. Open the rule creation modal
2. Select "强制盈利" (Force Win) - should show default ±2% without NaN
3. Switch to "强制亏损" (Force Loss) - should show default ±2% without NaN  
4. Switch to "盈亏控制" (Profit Control) - no errors
5. Switch back to "强制盈利" - should still work correctly
6. Edit an existing rule and switch between action types

## Expected Behavior

- ✅ No NaN values when switching between action types
- ✅ Default fluctuation of ±2% is applied automatically
- ✅ All calculations handle undefined/null gracefully
- ✅ Smooth transitions between different action types
