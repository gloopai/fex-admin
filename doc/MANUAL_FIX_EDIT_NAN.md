# Manual Fix Required - Edit Mode NaN Issue

## Why Search/Replace Fails
The file has complex whitespace (tabs vs spaces) that makes automated replacement fail.

## What You Need to Do

Open the file: `/src/components/DeliveryRuleModal.vue`

### Find This Section (Around Line 685-688)

Look for these exact lines:

```javascript
// 确保持续时间字段存在默认值
form.action.params.duration= Number(form.action.params.duration) || 0;

// 复制模式，修改名称
if (props.mode === "duplicate") {
```

### Insert This Code Between Them

Add these 5 lines between the two sections above:

```javascript
// 确保波动字段存在默认值（数据迁移 - 编辑旧规则时）
form.action.params.nextPositionCount = Number(form.action.params.nextPositionCount) || 1;
form.action.params.lossPercent = Number(form.action.params.lossPercent) || 0.3;
form.action.params.profitPercent = Number(form.action.params.profitPercent) || 0.2;
form.action.params.winFluctuationPercent = Number(form.action.params.winFluctuationPercent) || 2;
form.action.params.lossFluctuationPercent = Number(form.action.params.lossFluctuationPercent) || 2;
```

### The Result Should Look Like This

```javascript
// 确保持续时间字段存在默认值
form.action.params.duration= Number(form.action.params.duration) || 0;

// ★★★ ADD THESE 5 LINES ★★★
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
```

## Save and Test

After adding these 5 lines and saving:

1. Click "编辑" on any rule
2. The NaN issue should be fixed
3. All values should show correctly

---

This is a **5-line fix** that will resolve the edit mode NaN problem! 🎯
