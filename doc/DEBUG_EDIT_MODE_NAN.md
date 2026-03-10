# Debug Guide for Edit Mode NaN Issue

## Problem Analysis

The edit mode still shows NaN even after adding initialization code. This could be because:

1. **Initialization order issue** - The watch might not be triggered at the right time
2. **Reactivity issue** - Vue's reactivity system might not be picking up the changes
3. **Template rendering before initialization** - Template renders before values are set

## Debug Steps

### Step 1: Check What Data is Being Loaded

Add this temporary debug log in the watch handler(around line 640):

```javascript
if (props.rule && (props.mode === "edit" || props.mode === "duplicate")) {
  // 编辑或复制模式，加载现有数据
  const ruleData = JSON.parse(JSON.stringify(props.rule));
  
  // DEBUG: Log what we're loading
  console.log('🔍 Editing rule:', props.rule.name);
  console.log('🔍 Action type:', ruleData.action.type);
  console.log('🔍 Action params BEFORE init:', ruleData.params);
  console.log('🔍 lossPercent:', ruleData.params.lossPercent);
  console.log('🔍 profitPercent:', ruleData.params.profitPercent);
  console.log('🔍 winFluctuationPercent:', ruleData.params.winFluctuationPercent);
  console.log('🔍 lossFluctuationPercent:', ruleData.params.lossFluctuationPercent);
  
  Object.assign(form, ruleData);
  
  // ... rest of initialization code ...
}
```

### Step 2: Add Debug After Initialization

Add another debug log after the initialization (around line 692):

```javascript
// 确保波动字段存在默认值（数据迁移 - 编辑旧规则时）
form.action.params.nextPositionCount = Number(form.action.params.nextPositionCount) || 1;
form.action.params.lossPercent = Number(form.action.params.lossPercent) || 0.3;
form.action.params.profitPercent = Number(form.action.params.profitPercent) || 0.2;
form.action.params.winFluctuationPercent = Number(form.action.params.winFluctuationPercent) || 2;
form.action.params.lossFluctuationPercent = Number(form.action.params.lossFluctuationPercent) || 2;

// DEBUG: Log what we have after init
console.log('✅ After initialization:');
console.log('✅ lossPercent:', form.action.params.lossPercent);
console.log('✅ profitPercent:', form.action.params.profitPercent);
console.log('✅ winFluctuationPercent:', form.action.params.winFluctuationPercent);
console.log('✅ lossFluctuationPercent:', form.action.params.lossFluctuationPercent);
```

### Step 3: Check Which Rule You're Editing

When you click "编辑" on a rule, check the browser console:

1. **If you see the debug logs** → The watch is being triggered
2. **If logs show undefined values** → The mock data doesn't have those fields
3. **If logs show correct values but UI still shows NaN** → Template or reactivity issue

### Step 4: Verify Mock Data Structure

Check which rule you're editing. The mock data should have:

**For FORCE_LOSS (rule_004):**
```javascript
action: {
  type: DELIVERY_RULE_ACTION.FORCE_LOSS,
  params: {
    nextPositionCount: 1,
    lossPercent: 0.3,
    lossFluctuationPercent: 2  // ← Should have this
  }
}
```

**For FORCE_WIN (if exists):**
```javascript
action: {
  type: DELIVERY_RULE_ACTION.FORCE_WIN,
  params: {
    nextPositionCount: 1,
    profitPercent: 0.2,
    winFluctuationPercent: 2  // ← Should have this
  }
}
```

## Common Issues

### Issue 1: Wrong Field Names

Make sure the field names match exactly:
- ✅ `lossFluctuationPercent` (correct)
- ❌ `loss_fluctuation_percent` (wrong - snake_case)
- ❌ `lossFluctuation` (wrong - missing "Percent")

### Issue 2: Type Mismatch

Values should be numbers, not strings:
- ✅ `lossFluctuationPercent: 2` (number)
- ❌ `lossFluctuationPercent: "2"` (string)

### Issue 3: Nested Structure

Make sure the structure is correct:
```javascript
action: {
  params: {
    lossFluctuationPercent: 2  // ← Must be inside params
  }
}
```

NOT:
```javascript
action: {
  lossFluctuationPercent: 2  // ← Wrong level
}
```

## Temporary Fix: Force Reactive Update

If the issue persists, try forcing Vue's reactivity system to update:

```javascript
// After all initialization, force a reactive update
form.action.params = { ...form.action.params };
```

Or use Vue's `set` method (if using Vue 2):
```javascript
import { set } from 'vue';

set(form.action.params, 'winFluctuationPercent', Number(form.action.params.winFluctuationPercent) || 2);
set(form.action.params, 'lossFluctuationPercent', Number(form.action.params.lossFluctuationPercent) || 2);
```

## Quick Test

Try this test to isolate the issue:

1. Open browser DevTools → Console
2. Click "编辑" on any rule
3. Look for the debug logs
4. If values are correct in logs but NaN in UI → Template issue
5. If values are undefined in logs → Initialization issue

## Alternative Solution

If the watch approach doesn't work, try using `onMounted` with a small delay:

```javascript
import { onMounted } from 'vue';

onMounted(() => {
  setTimeout(() => {
    ensureActionParamsInitialized();
  }, 100);
});
```

---

Apply these debug steps and report what you see in the console, and I can help pinpoint the exact issue! 🔍
