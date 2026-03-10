# Complete Fix for NaN Issue - Manual Application Guide

## Problem Summary
NaN appears when switching action types because form fields are not properly initialized.

## Root Cause
When switching from "Profit Control" to "Force Win/Force Loss", the following fields become undefined or invalid:
- `profitPercent` / `lossPercent` → become NaN
- `winFluctuationPercent` / `lossFluctuationPercent` → undefined or 0

## Complete Solution

### Step 1: Add Method to Initialize Fields (After line 620)

**Find this code:**
```javascript
const save = () => {
  emit("save", { ...form });
  close();
};
```

**Add after it:**
```javascript
// Ensure action params are initialized with safe defaults
const ensureActionParamsInitialized = () => {
  form.action.params.nextPositionCount = Number(form.action.params.nextPositionCount) || 1;
  form.action.params.lossPercent = Number(form.action.params.lossPercent) || 0.3;
  form.action.params.profitPercent = Number(form.action.params.profitPercent) || 0.2;
  form.action.params.winFluctuationPercent = Number(form.action.params.winFluctuationPercent) || 2;
  form.action.params.lossFluctuationPercent = Number(form.action.params.lossFluctuationPercent) || 2;
};
```

### Step 2: Call Initialization on Action Type Change (After line 631)

**Find this code:**
```javascript
// 监听触发类型变化，自动调整默认值
watch(
  () => form.trigger.type,
  (newType) => {
   const config = triggerTypeOptions.find((opt) => opt.value === newType);
   if (config) {
      form.trigger.threshold = config.defaultThreshold;
    }
  },
);
```

**Add after it:**
```javascript
// 监听执行动作类型变化，确保所有字段初始化
watch(
  () => form.action.type,
  (newType) => {
    ensureActionParamsInitialized();
  },
);
```

### Step 3: Update Force Loss Template (Lines ~1463, 1479-1480, 1484)

**Line 1463 - Find:**
```vue
每单亏损将在 {{ (form.action.params.lossPercent * 100).toFixed(0) }}% 基础上随机波动 ±{{ form.action.params.lossFluctuationPercent || 0 }}%
```

**Replace with:**
```vue
每单亏损将在 {{ ((Number(form.action.params.lossPercent) || 0.3) * 100).toFixed(0) }}% 基础上随机波动 ±{{ Number(form.action.params.lossFluctuationPercent) || 2 }}%
```

**Lines 1479-1480 - Find:**
```vue
>{{ (form.action.params.lossPercent * 100).toFixed(0) }}% ±{{ form.action.params.lossFluctuationPercent || 0 }}%</strong>
```

**Replace with:**
```vue
>{{ ((Number(form.action.params.lossPercent) || 0.3) * 100).toFixed(0) }}% ±{{ Number(form.action.params.lossFluctuationPercent) || 2 }}%</strong>
```

**Line 1484 - Find:**
```vue
实际亏损范围：{{ ((form.action.params.lossPercent - form.action.params.lossFluctuationPercent / 100) * 100).toFixed(1) }}% ~ {{ ((form.action.params.lossPercent + form.action.params.lossFluctuationPercent / 100) * 100).toFixed(1) }}%
```

**Replace with:**
```vue
实际亏损范围：{{ (((Number(form.action.params.lossPercent) || 0.3) - (Number(form.action.params.lossFluctuationPercent) || 2) / 100) * 100).toFixed(1) }}% ~ {{ (((Number(form.action.params.lossPercent) || 0.3) + (Number(form.action.params.lossFluctuationPercent) || 2) / 100) * 100).toFixed(1) }}%
```

### Step 4: Update Force Win Template (Lines ~1601, 1617-1618, 1622)

**Line 1601 - Find:**
```vue
每单盈利将在 {{ (form.action.params.profitPercent * 100).toFixed(0) }}% 基础上随机波动 ±{{ form.action.params.winFluctuationPercent || 0 }}%
```

**Replace with:**
```vue
每单盈利将在 {{ ((Number(form.action.params.profitPercent) || 0.2) * 100).toFixed(0) }}% 基础上随机波动 ±{{ Number(form.action.params.winFluctuationPercent) || 2 }}%
```

**Lines 1617-1618 - Find:**
```vue
>{{ (form.action.params.profitPercent * 100).toFixed(0) }}% ±{{ form.action.params.winFluctuationPercent || 0 }}%</strong>
```

**Replace with:**
```vue
>{{ ((Number(form.action.params.profitPercent) || 0.2) * 100).toFixed(0) }}% ±{{ Number(form.action.params.winFluctuationPercent) || 2 }}%</strong>
```

**Line 1622 - Find:**
```vue
实际盈利范围：{{ ((form.action.params.profitPercent - form.action.params.winFluctuationPercent / 100) * 100).toFixed(1) }}% ~ {{ ((form.action.params.profitPercent + form.action.params.winFluctuationPercent / 100) * 100).toFixed(1) }}%
```

**Replace with:**
```vue
实际盈利范围：{{ (((Number(form.action.params.profitPercent) || 0.2) - (Number(form.action.params.winFluctuationPercent) || 2) / 100) * 100).toFixed(1) }}% ~ {{ (((Number(form.action.params.profitPercent) || 0.2) + (Number(form.action.params.winFluctuationPercent) || 2) / 100) * 100).toFixed(1) }}%
```

### Step 5: Update Slider Displays

**Line ~1439 (Loss Fluctuation Display) - Find:**
```vue
>±{{ form.action.params.lossFluctuationPercent || 0 }}%</span>
```

**Replace with:**
```vue
>±{{ Number(form.action.params.lossFluctuationPercent) || 2 }}%</span>
```

**Line ~1577 (Win Fluctuation Display) - Find:**
```vue
>±{{ form.action.params.winFluctuationPercent || 0 }}%</span>
```

**Replace with:**
```vue
>±{{ Number(form.action.params.winFluctuationPercent) || 2 }}%</span>
```

## Testing Checklist

After applying all fixes:

1. ✅ Open rule creation modal
2. ✅ Select"强制盈利" - should show "盈利 20% ±2%" and "实际盈利范围：18.0% ~ 22.0%"
3. ✅ Switch to "强制亏损" - should show "亏损 30% ±2%" and "实际亏损范围：28.0% ~ 32.0%"
4. ✅ Switch to "盈亏控制" - no errors
5. ✅ Switch back to "强制盈利" - still shows correct values without NaN
6. ✅ Try editing an existing rule - all values load correctly
7. ✅ Adjust sliders - values update smoothly without NaN

## Why This Works

1. **Method `ensureActionParamsInitialized()`**: Ensures ALL fields have safe defaults whenever action type changes
2. **Watch handler**: Automatically calls initialization when switching action types
3. **Safe template expressions**: Use `Number() || default` pattern to handle undefined/null/NaN gracefully
4. **Default values**: 
   - `profitPercent`: 0.2 (20%)
   - `lossPercent`: 0.3 (30%)
   - `winFluctuationPercent`: 2 (±2%)
   - `lossFluctuationPercent`: 2 (±2%)

## Files Modified

- `/src/components/DeliveryRuleModal.vue`
  - Added method: `ensureActionParamsInitialized()`
  - Added watcher: `watch(() => form.action.type)`
  - Updated 8 template expressions with safe number coercion

---

Apply these changes and the NaN issue will be completely resolved! 🎉
