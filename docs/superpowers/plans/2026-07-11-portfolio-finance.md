# Portfolio Finance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a frontend-only investment portfolio finance module with AI-quant-style front pages and admin configuration screens.

**Architecture:** Add a focused `portfolio` domain beside the existing `aiQuant`, `liquidity`, and `lending` modules. Shared mock product state lives under `src/admin`, front pages consume that state for list/detail/order flows, and admin pages mutate the same local refs so changes are visible across the frontend without a backend.

**Tech Stack:** Vue 3 `<script setup>`, Vue Router, Tailwind CSS, Node `node:test`, Vite build.

## Global Constraints

- Do not add a backend, database, service calls, real wallet debit, real settlement job, or real rebalancing.
- Use the existing AI 量化 visual direction for the frontend finance module.
- Use local mock data and Vue refs only.
- Keep existing user/untracked files such as `outputs/` and `tmp/` untouched.
- Preserve existing route and navigation behavior for liquidity, lending, and AI 量化.

---

### Task 1: Add Domain Tests for Portfolio Formulas and Navigation

**Files:**
- Create: `test/portfolioFinance.test.js`
- Later tasks will modify files imported by this test.

**Interfaces:**
- Consumes after implementation: `calculatePortfolioEstimate(principal, product)`, `canSubscribePortfolio(product, principal)`, `getFrontFinanceChannelEntries(prefix)`, `frontDesktopRoutes`, `navTree`, and `consoleRoutes`.
- Produces: executable requirements for formulas, front routes, admin routes, and admin nav.

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  calculatePortfolioEstimate,
  canSubscribePortfolio,
  PRODUCT_STATUS
} from '../src/admin/constants/portfolio.js'
import { getFrontFinanceChannelEntries } from '../src/constants/frontNav.js'
import { frontDesktopRoutes } from '../src/router/modules/front.js'
import { navTree } from '../src/admin/config/nav.js'
import { consoleRoutes } from '../src/router/modules/console.js'

test('calculates portfolio subscription estimates from daily rate range and fee', () => {
  const result = calculatePortfolioEstimate(1000, {
    durationDays: 3,
    minDailyRatePct: 0.2,
    maxDailyRatePct: 0.6,
    subscriptionFeePct: 0.3
  })

  assert.deepEqual(result, {
    principal: 1000,
    minYield: 6,
    maxYield: 18,
    fee: 3,
    minSettlement: 1003,
    maxSettlement: 1015
  })
})

test('validates whether a portfolio product can be subscribed', () => {
  const product = {
    status: PRODUCT_STATUS.ENABLED,
    minAmount: 1000,
    maxAmount: 30000
  }

  assert.deepEqual(canSubscribePortfolio(product, 1000), { ok: true, reason: '' })
  assert.equal(canSubscribePortfolio(product, 999).reason, '金额低于最低申购金额')
  assert.equal(canSubscribePortfolio({ ...product, status: PRODUCT_STATUS.MAINTENANCE }, 1000).reason, '产品当前不可认购')
})

test('registers portfolio in front finance navigation and routes', () => {
  const channels = getFrontFinanceChannelEntries('/front')
  assert.equal(channels.find((entry) => entry.key === 'portfolio')?.to, '/front/finance/portfolio')

  const financeRoute = frontDesktopRoutes.find((route) => route.path === 'finance')
  const children = financeRoute.children
  assert.equal(children.find((route) => route.name === 'front-finance-portfolio')?.path, 'portfolio')
  assert.equal(children.find((route) => route.name === 'front-finance-portfolio-detail')?.path, 'portfolio/:productId')
})

test('registers portfolio admin navigation and routes', () => {
  const item = navTree.find((entry) => entry.title === '投资组合')
  assert.ok(item)
  assert.deepEqual(
    item.children.map((child) => child.path),
    [
      '/admin/portfolio/products',
      '/admin/portfolio/orders',
      '/admin/portfolio/yield-records',
      '/admin/portfolio/operation-log',
      '/admin/portfolio/rules'
    ]
  )

  assert.equal(consoleRoutes.find((route) => route.name === 'portfolio-products')?.path, 'portfolio/products')
  assert.equal(consoleRoutes.find((route) => route.name === 'portfolio-orders')?.path, 'portfolio/orders')
  assert.equal(consoleRoutes.find((route) => route.name === 'portfolio-yield-records')?.path, 'portfolio/yield-records')
  assert.equal(consoleRoutes.find((route) => route.name === 'portfolio-operation-log')?.path, 'portfolio/operation-log')
  assert.equal(consoleRoutes.find((route) => route.name === 'portfolio-rules')?.path, 'portfolio/rules')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/portfolioFinance.test.js`

Expected: FAIL because `src/admin/constants/portfolio.js` does not exist.

### Task 2: Add Portfolio Constants, Mock Data, and Shared State

**Files:**
- Create: `src/admin/constants/portfolio.js`
- Create: `src/admin/mock/portfolio.js`
- Create: `src/admin/state/portfolioOrders.js`
- Create: `src/admin/state/portfolioOperationLogs.js`
- Modify: `src/admin/state/financeCatalogs.js`

**Interfaces:**
- Produces: `portfolioProductsCatalog`, `portfolioOrders`, `portfolioOperationLogs`, formula helpers, status metadata, and mock factories.
- Consumes: Vue `ref`.

- [ ] **Step 1: Implement portfolio domain helpers**

Create `src/admin/constants/portfolio.js` with product statuses, order statuses, early redeem modes, metadata maps, `roundMoney`, `calculatePortfolioEstimate`, `canSubscribePortfolio`, `formatPortfolioRateRange`, and `formatPortfolioDuration`.

- [ ] **Step 2: Add mock products and orders**

Create `src/admin/mock/portfolio.js` with at least four products covering enabled, sold out, maintenance, and disabled states; include the reference examples `USDT + ETH + BTC` and `BTC + SHIB + XRP`.

- [ ] **Step 3: Add shared refs**

Create state files and export `portfolioProductsCatalog` from `src/admin/state/financeCatalogs.js`.

- [ ] **Step 4: Run focused test**

Run: `npm test -- test/portfolioFinance.test.js`

Expected: formula tests pass, navigation tests still fail until routes/nav are added.

### Task 3: Wire Front and Admin Navigation Routes

**Files:**
- Modify: `src/constants/frontNav.js`
- Modify: `src/pages/front/finance/FinanceHomePage.vue`
- Modify: `src/router/modules/front.js`
- Modify: `src/admin/config/nav.js`
- Modify: `src/router/modules/console.js`

**Interfaces:**
- Consumes: placeholder Vue pages added in Task 4 and Task 5.
- Produces: `/front/finance/portfolio`, `/front/finance/portfolio/:productId`, and admin `/admin/portfolio/*` route registrations.

- [ ] **Step 1: Add placeholder page files**

Before routes import them, create temporary valid Vue files for all portfolio front/admin pages with a simple `<template><div /></template>`.

- [ ] **Step 2: Add front channel entry**

Add `portfolio` to `getFrontFinanceChannelEntries`, update `FinanceHomePage.vue` stats and visual map.

- [ ] **Step 3: Add front routes**

Add list/detail routes and rules redirects under the existing finance route.

- [ ] **Step 4: Add admin menu and routes**

Add the “投资组合” menu after AI 量化 or adjacent to finance products, with products/orders/yield-records/operation-log/rules children.

- [ ] **Step 5: Run focused test**

Run: `npm test -- test/portfolioFinance.test.js`

Expected: all tests in `portfolioFinance.test.js` pass.

### Task 4: Build Front Portfolio List and Detail Flows

**Files:**
- Replace placeholder: `src/pages/front/finance/portfolio/FinancePortfolioListPage.vue`
- Replace placeholder: `src/pages/front/finance/portfolio/FinancePortfolioDetailPage.vue`

**Interfaces:**
- Consumes: `portfolioProductsCatalog`, `portfolioOrders`, `calculatePortfolioEstimate`, `canSubscribePortfolio`, metadata maps.
- Produces: front market list, mine tab, subscription modal, detail page, estimate UI, and early redeem UI.

- [ ] **Step 1: Implement list page**

Use the AI 量化 list layout style: dark hero, “组合市场 / 我的组合” switch, product cards/table, mock order list, and subscribe/redeem modals.

- [ ] **Step 2: Implement detail page**

Use the AI 量化 detail layout style: breadcrumb, product header, metric cards, asset composition, estimate panel, rule sections, and CTA.

- [ ] **Step 3: Verify formulas manually through source and test**

Run: `npm test -- test/portfolioFinance.test.js`

Expected: PASS.

### Task 5: Build Admin Portfolio Pages

**Files:**
- Replace placeholder: `src/pages/admin/portfolio/PortfolioProductPage.vue`
- Replace placeholder: `src/pages/admin/portfolio/PortfolioOrderPage.vue`
- Replace placeholder: `src/pages/admin/portfolio/PortfolioYieldRecordsPage.vue`
- Replace placeholder: `src/pages/admin/portfolio/PortfolioOperationLogPage.vue`
- Replace placeholder: `src/pages/admin/portfolio/PortfolioRulePage.vue`

**Interfaces:**
- Consumes: portfolio state, constants, mock data.
- Produces: admin product editor, order list, yield records, operation logs, and rules guide.

- [ ] **Step 1: Implement product management**

Create filterable product table and edit/create modal with tabs for base info, asset symbols, yield/fee, limits/redeem, and display copy. Mutations update `portfolioProductsCatalog`.

- [ ] **Step 2: Implement order and yield pages**

Create dense admin tables for portfolio orders and yield records, using existing admin table style.

- [ ] **Step 3: Implement logs and rules pages**

Create operation-log table and rule explanation page including formulas and early redeem modes.

- [ ] **Step 4: Run focused test**

Run: `npm test -- test/portfolioFinance.test.js`

Expected: PASS.

### Task 6: Final Verification

**Files:**
- No new files unless fixes are required.

**Interfaces:**
- Consumes: all previous tasks.
- Produces: verified frontend-only portfolio module.

- [ ] **Step 1: Run all tests**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: Vite build exits 0.

- [ ] **Step 3: Check git status**

Run: `git status --short`

Expected: portfolio implementation files are changed or added; unrelated `outputs/` and `tmp/` remain untouched.
