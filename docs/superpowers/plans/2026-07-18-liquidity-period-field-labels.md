# Liquidity Period Field Labels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add clear visible labels to all four inputs in every liquidity-locked product period row.

**Architecture:** Keep the existing period data model and two-column layout. Wrap each input in a label block and render amount units from `productForm.currency`.

**Tech Stack:** Vue 3 single-file components, Node test runner, Vite.

## Global Constraints

- Preserve `period.days`, `period.annualRate`, `period.minAmount`, and `period.maxAmount` models.
- Preserve add/remove period behavior and calculation previews.
- Amount labels must update with `productForm.currency`.

---

### Task 1: Add period input labels

**Files:**
- Modify: `src/pages/admin/liquidity/LiquidityLockedProductsPage.vue`
- Modify: `test/liquidityLockedProductSort.test.js`

**Interfaces:**
- Consumes: `productForm.currency` and each `period` row.
- Produces: four visible field labels per period row.

- [ ] **Step 1: Write the failing test**

```js
assert.match(adminSource, /锁仓天数（天）/)
assert.match(adminSource, /年化收益率（%）/)
assert.match(adminSource, /最低申购金额（\{\{ productForm\.currency \}\}）/)
assert.match(adminSource, /最高申购金额（\{\{ productForm\.currency \}\}）/)
```

- [ ] **Step 2: Verify the test fails**

Run: `node --test test/liquidityLockedProductSort.test.js`
Expected: FAIL because the visible labels are missing.

- [ ] **Step 3: Add the labels**

```vue
<label class="block">
  <span class="mb-1 block text-xs font-medium text-slate-600">锁仓天数（天）</span>
  <input v-model.number="period.days" type="number" />
</label>
```

Use the same structure for annual yield, minimum subscription amount, and maximum subscription amount; interpolate `productForm.currency` in both amount titles.

- [ ] **Step 4: Verify focused and full checks**

Run: `node --test test/liquidityLockedProductSort.test.js`
Expected: all focused tests pass.

Run: `npm test`
Expected: all tests pass.

Run: `npm run build`
Expected: Vite exits 0.

Run: `git diff --check`
Expected: no output.
