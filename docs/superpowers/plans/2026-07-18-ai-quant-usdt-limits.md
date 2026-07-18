# AI Quant USDT Amount Units Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every AI quant subscription range and monetary purchase limit use USDT while preserving the monthly purchase-count limit.

**Architecture:** Keep the existing product fields and page structure. Change their presentation contract so tier bounds, `limitAmount`, and `limitCount` are monetary USDT values everywhere; keep asset-denominated operational totals and order principal unchanged.

**Tech Stack:** Vue 3 SFCs, JavaScript mock catalog, Node.js built-in test runner, Vite.

## Global Constraints

- `tiers[].minAmount`, `tiers[].maxAmount`, `limitAmount`, and `limitCount` are USDT amounts.
- `monthlyLimitCount` remains a natural-month purchase count.
- Product currency, locked totals, yields, and order principal remain asset-denominated.
- Do not rename persisted/mock fields in this focused UI change.

---

### Task 1: Establish the USDT display contract

**Files:**
- Create: `test/aiQuantUsdtUnits.test.js`
- Modify: `src/pages/admin/aiQuant/AiQuantProductPage.vue`
- Modify: `src/pages/front/finance/aiQuant/FinanceAiQuantListPage.vue`
- Modify: `src/pages/front/finance/aiQuant/FinanceAiQuantDetailPage.vue`

**Interfaces:**
- Consumes: existing product fields `tiers`, `limitAmount`, `limitCount`, and `monthlyLimitCount`.
- Produces: source-level UI contract that labels monetary fields as USDT and monthly count as count-based.

- [ ] **Step 1: Write the failing source contract test**

Create a Node test that reads the three Vue files, requires explicit USDT tier/limit wording, requires product total-limit wording, and rejects `product.currency` as the unit beside those fields.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test test/aiQuantUsdtUnits.test.js`

Expected: FAIL because the existing pages display tier and limit amounts using `product.currency`, and the detail page calls `limitCount` a purchase-count limit.

- [ ] **Step 3: Apply the minimal UI changes**

In the admin list, form, and preview, display tier ranges and both monetary limits with `USDT`; add the product total limit to the list and preview. In the front list/detail/rent dialog, pass/display `USDT` for tier ranges and change the detail limit copy to a USDT total limit. Keep monthly limit text count-based.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test test/aiQuantUsdtUnits.test.js`

Expected: PASS.

### Task 2: Align mock product values with the new monetary meaning

**Files:**
- Modify: `src/admin/mock/aiQuant.js`
- Modify: `test/aiQuantUsdtUnits.test.js`

**Interfaces:**
- Consumes: the unchanged AI quant product catalog schema.
- Produces: representative USDT tier and limit values for every product.

- [ ] **Step 1: Extend the test to validate catalog amount semantics**

Import the catalog, verify every tier has finite non-negative bounds with `maxAmount >= minAmount`, and verify `limitAmount`/`limitCount` are finite USDT amounts that cover the configured subscription range.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test test/aiQuantUsdtUnits.test.js`

Expected: FAIL for non-USDT products whose old asset-sized tier and limit values no longer represent useful USDT amounts.

- [ ] **Step 3: Replace asset-sized mock thresholds with reasonable USDT amounts**

Update only product tier bounds, `limitAmount`, and `limitCount`. Do not change product currencies, operational totals, orders, or yield calculations.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test test/aiQuantUsdtUnits.test.js`

Expected: PASS.

### Task 3: Regression verification

**Files:**
- Modify only if verification exposes a directly related defect.

**Interfaces:**
- Consumes: completed UI and mock changes.
- Produces: verified build and regression status.

- [ ] **Step 1: Run all tests**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Build the application**

Run: `npm run build`

Expected: Vite exits successfully without compile errors.

- [ ] **Step 3: Review the final diff**

Run: `git diff --check && git diff --stat && git status --short`

Expected: no whitespace errors and only the planned files are modified.

