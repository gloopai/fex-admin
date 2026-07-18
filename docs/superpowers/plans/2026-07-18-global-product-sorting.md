# Global Product Sorting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every formal product editor a numeric sort field and apply descending order to its admin and shared customer product lists.

**Architecture:** Each product domain exports a non-mutating stable descending sort helper. Admin editors persist `sortOrder`; shared finance client lists call the same domain helper before rendering or pagination.

**Tech Stack:** Vue 3 Composition API, JavaScript ES modules, Node test runner, Vite.

## Global Constraints

- “产品状态”和“产品排序”同一行展示，输入提示为“数字越大越靠前”。
- New products default to the current maximum valid `sortOrder` plus `10`.
- Equal values remain stable; missing, blank, and non-finite values sort last.
- Filtering happens before sorting and pagination happens after sorting.
- Sort helpers must return new arrays and not mutate shared catalogs.

---

### Task 1: Liquidity-locked product sorting

**Files:**
- Modify: `src/admin/constants/liquidityLocked.js`
- Modify: `src/admin/mock/liquidityLocked.js`
- Modify: `src/pages/admin/liquidity/LiquidityLockedProductsPage.vue`
- Modify: `src/pages/front/finance/liquidity/FinanceLiquidityListPage.vue`
- Create: `test/liquidityLockedProductSort.test.js`

**Interfaces:**
- Produces: `sortLiquidityLockedProducts(products = []) -> Array`
- Consumes: shared `lockedProductsCatalog` product objects with `sortOrder`

- [ ] **Step 1: Write the failing test**

```js
assert.equal(typeof constants.sortLiquidityLockedProducts, 'function')
assert.deepEqual(constants.sortLiquidityLockedProducts(rows).map((row) => row.id), ['high', 'same', 'low', 'missing'])
assert.match(adminSource, /v-model\.number="productForm\.sortOrder"/)
assert.match(clientSource, /sortLiquidityLockedProducts/)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/liquidityLockedProductSort.test.js`
Expected: FAIL because `sortLiquidityLockedProducts` and the form field do not exist.

- [ ] **Step 3: Implement minimal behavior**

```js
export function sortLiquidityLockedProducts(products = []) {
  const value = (row) => row?.sortOrder === '' || row?.sortOrder == null || !Number.isFinite(Number(row.sortOrder))
    ? null
    : Number(row.sortOrder)
  return [...products].sort((a, b) => value(a) == null ? (value(b) == null ? 0 : 1) : value(b) == null ? -1 : value(b) - value(a))
}
```

Add `sortOrder` to mock products, form reset/edit/save, sort the admin filtered rows, and sort the client rows before period expansion.

- [ ] **Step 4: Run focused test**

Run: `node --test test/liquidityLockedProductSort.test.js`
Expected: 2 tests pass.

### Task 2: Credit-lending product sorting

**Files:**
- Modify: `src/admin/constants/cryptoLending.js`
- Modify: `src/admin/mock/cryptoLending.js`
- Modify: `src/pages/admin/lending/LendingProductPage.vue`
- Modify: `src/pages/front/finance/lending/FinanceLendingListPage.vue`
- Create: `test/lendingProductSort.test.js`

**Interfaces:**
- Produces: `sortLendingProducts(products = []) -> Array`
- Consumes: shared `lendingProductsCatalog` product objects with `sortOrder`

- [ ] **Step 1: Write and verify the failing test**

```js
assert.equal(typeof constants.sortLendingProducts, 'function')
assert.match(adminSource, /v-model\.number="formData\.sortOrder"/)
assert.match(adminSource, /sortOrder: Number\(formData\.value\.sortOrder\)/)
assert.match(clientSource, /sortLendingProducts/)
```

Run: `node --test test/lendingProductSort.test.js`
Expected: FAIL for the missing helper and form integration.

- [ ] **Step 2: Implement and verify**

Implement `sortLendingProducts` with the Task 1 ordering contract. Add explicit mock values, form default/edit/save integration, admin filtered-list sorting, and client list sorting.

Run: `node --test test/lendingProductSort.test.js`
Expected: 2 tests pass.

### Task 3: Spot admin product sorting

**Files:**
- Create: `src/admin/constants/spotProduct.js`
- Modify: `src/admin/mock/spot.js`
- Modify: `src/pages/admin/spot/SpotProductPage.vue`
- Create: `test/spotProductSort.test.js`

**Interfaces:**
- Produces: `sortSpotProducts(products = []) -> Array`
- Consumes: admin `mockSpotProducts` objects with `sortOrder`

- [ ] **Step 1: Write and verify the failing test**

```js
assert.equal(typeof constants.sortSpotProducts, 'function')
assert.match(pageSource, /v-model\.number="formData\.sortOrder"/)
assert.match(pageSource, /sortSpotProducts/)
assert.match(pageSource, /数字越大越靠前/)
```

Run: `node --test test/spotProductSort.test.js`
Expected: FAIL because the module and form field do not exist.

- [ ] **Step 2: Implement and verify**

Create the domain helper, add mock values, place status and sort inputs in the same grid, default new products to max plus 10, persist edits, and sort before existing pagination.

Run: `node --test test/spotProductSort.test.js`
Expected: 2 tests pass.

### Task 4: Global audit and verification

**Files:**
- Modify as required by audit: the seven admin product editor pages and their domain tests.

- [ ] **Step 1: Audit all seven editors**

```js
const editors = ['spot', 'perpetual', 'delivery', 'liquidity', 'lending', 'aiQuant', 'portfolio']
// Each editor source must contain a numeric sort model, save conversion, and descending sort helper usage.
```

Verify shared client lists for liquidity, lending, AI quant, and portfolio call their matching helper.

- [ ] **Step 2: Run all checks**

Run: `npm test`
Expected: all tests pass with zero failures.

Run: `npm run build`
Expected: Vite exits 0.

Run: `git diff --check`
Expected: no output.

- [ ] **Step 3: Commit implementation**

```bash
git add src test docs/superpowers/plans/2026-07-18-global-product-sorting.md
git commit -m "feat: standardize product sorting"
```
