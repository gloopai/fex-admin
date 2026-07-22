# Liquidity Product Currency Field Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a “产品品种” currency Select to the liquidity locked product create/edit dialog.

**Architecture:** Extend the existing local reactive form with `productCurrency`, reuse `SUPPORTED_CURRENCIES`, and include the field in the existing create/update payload. Preserve compatibility with demo products that do not yet contain the field by falling back to `currency` when editing.

**Tech Stack:** Vue 3 Composition API, native HTML Select, Node.js built-in test runner, Vite

## Global Constraints

- Keep the change limited to the admin create/edit dialog and its local product payload.
- Do not change list columns, frontend pages, filters, or mock data.
- Use `productCurrency` as the data property and “产品品种” as the visible label.

---

### Task 1: Add the product currency form field

**Files:**
- Modify: `src/pages/admin/liquidity/LiquidityLockedProductsPage.vue`
- Test: `test/liquidityLockedProductSort.test.js`

**Interfaces:**
- Consumes: `SUPPORTED_CURRENCIES: string[]` already imported by the page.
- Produces: `productForm.productCurrency: string` and saved product property `productCurrency: string`.

- [ ] **Step 1: Write the failing test**

Add a source-level regression test that verifies the reactive default, create reset, edit fallback, payload mapping, label, Select binding, and reuse of `SUPPORTED_CURRENCIES`:

```js
test('liquidity product editor includes a product currency select', () => {
  assert.match(adminSource, /productCurrency:\s*'USDT'/)
  assert.match(adminSource, /productForm\.productCurrency\s*=\s*'USDT'/)
  assert.match(adminSource, /productForm\.productCurrency\s*=\s*product\.productCurrency\s*\?\?\s*product\.currency/)
  assert.match(adminSource, /productCurrency:\s*productForm\.productCurrency/)
  assert.match(adminSource, />产品品种<\/label>/)
  assert.match(adminSource, /v-model="productForm\.productCurrency"/)
  assert.match(adminSource, /v-for="curr in SUPPORTED_CURRENCIES"/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/liquidityLockedProductSort.test.js`

Expected: FAIL because `productCurrency` is absent from the page.

- [ ] **Step 3: Write minimal implementation**

Add `productCurrency: 'USDT'` to `productForm`, reset it in `openCreateProduct`, populate it with `product.productCurrency ?? product.currency` in `openEditProduct`, and include `productCurrency: productForm.productCurrency` in `payload`. Add this field beside the existing “计价币种” Select:

```vue
<div>
  <label class="mb-1 block text-sm font-medium text-slate-700">产品品种</label>
  <select
    v-model="productForm.productCurrency"
    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
  >
    <option v-for="curr in SUPPORTED_CURRENCIES" :key="curr" :value="curr">{{ curr }}</option>
  </select>
</div>
```

- [ ] **Step 4: Run focused and full verification**

Run: `node --test test/liquidityLockedProductSort.test.js`

Expected: all focused tests PASS.

Run: `npm test`

Expected: all tests PASS.

Run: `npm run build`

Expected: Vite production build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/liquidity/LiquidityLockedProductsPage.vue test/liquidityLockedProductSort.test.js docs/superpowers/plans/2026-07-22-liquidity-product-currency-field.md
git commit -m "feat: add liquidity product currency field"
```
