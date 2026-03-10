# Fix for Edit Mode NaN Issue

## Problem
When **editing** existing rules (created before adding fluctuation fields), NaN appears because the old rule data doesn't have `winFluctuationPercent` and `lossFluctuationPercent` fields.

## Root Cause
The initialization code in the `watch(() => props.open)` only handles `profitControl` fields but doesn't initialize the new fluctuation fields for FORCE_WIN and FORCE_LOSS actions when editing old rules.

## Solution

### Find This Section (Around Line 685-686)

In the watch handler for `props.open`, after this line:

```javascript
// 确保持续时间字段存在默认值
form.action.params.duration= Number(form.action.params.duration) || 0;
```

### Add This Code Immediately After

```javascript
// 确保波动字段存在默认值（数据迁移 - 编辑旧规则时）
form.action.params.nextPositionCount = Number(form.action.params.nextPositionCount) || 1;
form.action.params.lossPercent = Number(form.action.params.lossPercent) || 0.3;
form.action.params.profitPercent = Number(form.action.params.profitPercent) || 0.2;
form.action.params.winFluctuationPercent = Number(form.action.params.winFluctuationPercent) || 2;
form.action.params.lossFluctuationPercent = Number(form.action.params.lossFluctuationPercent) || 2;
```

## Complete Context

The full code block should look like this:

```javascript
if (props.rule && (props.mode === "edit" || props.mode === "duplicate")) {
  // 编辑或复制模式，加载现有数据
  Object.assign(form, JSON.parse(JSON.stringify(props.rule)));

  // 确保新字段存在默认值（数据迁移）
  if (form.action.params.profitControl) {
    // ... existing profitControl migration code ...
  }

  // 确保持续时间字段存在默认值
  form.action.params.duration= Number(form.action.params.duration) || 0;

  // ★★★ ADD THIS SECTION ★★★
  // 确保波动字段存在默认值（数据迁移 - 编辑旧规则时）
  form.action.params.nextPositionCount = Number(form.action.params.nextPositionCount) || 1;
  form.action.params.lossPercent = Number(form.action.params.lossPercent) || 0.3;
  form.action.params.profitPercent = Number(form.action.params.profitPercent) || 0.2;
  form.action.params.winFluctuationPercent = Number(form.action.params.winFluctuationPercent) || 2;
  form.action.params.lossFluctuationPercent = Number(form.action.params.lossFluctuationPercent) || 2;
  // ★★★ END OF ADDITION ★★★

  // 复制模式，修改名称
  if (props.mode === "duplicate") {
    form.name = `${form.name} (副本)`;
  }
}
```

## Why This Works

This ensures that when you open an **existing rule** for editing:

1. **Old rules without fluctuation fields** → Get default values (±2%)
2. **New rules with fluctuation fields** → Keep their saved values
3. **All action types** (FORCE_WIN, FORCE_LOSS, PROFIT_CONTROL) → Have valid numbers

## Testing Steps

After applying this fix:

1. ✅ Open an **old rule** (created before adding fluctuation fields)
2. ✅ Click "编辑" (Edit)
3. ✅ Should show proper values without NaN:
   - Force Win: "盈利 20% ±2%"
   - Force Loss: "亏损 30% ±2%"
4. ✅ Save the edited rule
5. ✅ All values should be preserved correctly

## Files to Modify

- `/src/components/DeliveryRuleModal.vue` (Line ~686-691)

Add 5 lines of initialization code after the duration initialization.

---

This will fix the edit mode NaN issue! 🎉
