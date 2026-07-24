# Delivery Actual Payout Rate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a separately configured actual payout rate to delivery period templates and use it for demo order earnings.

**Architecture:** Extend the existing cycle mock model with `actualPayoutPct`, surface it in template and product preview UIs, and update demo order generation to use the actual rate. Keep `payoutPct` unchanged as the display rate.

**Tech Stack:** Vue 3, JavaScript ES modules, Node test runner, Vite.

## Global Constraints

- This repository is an interface demo; no backend or database work is included.
- Loss orders continue to return zero principal.
- Fee is calculated from gross profit for win orders.

---

### Task 1: Add failing delivery rate tests

**Files:**
- Create: `test/deliveryActualPayoutRate.test.js`

**Interfaces:**
- Consumes: `createDeliveryTemplatesMock()` and generated delivery orders.
- Produces: Regression coverage for cycle data and order calculation source.

- [ ] Write tests asserting every template cycle has `actualPayoutPct` and order source uses it.
- [ ] Run `node --test test/deliveryActualPayoutRate.test.js` and confirm failure.

### Task 2: Extend mock data and calculations

**Files:**
- Modify: `src/admin/mock/delivery.js`
- Modify: `src/admin/mock/deliveryOrder.js`

**Interfaces:**
- Produces: Cycle objects with numeric `actualPayoutPct`; orders with actual-rate snapshots.

- [ ] Add actual payout rates to every delivery cycle.
- [ ] Calculate expected payout and win payout from `actualPayoutPct`; calculate fee from gross profit.
- [ ] Run the focused test and confirm it passes.

### Task 3: Update delivery admin UI

**Files:**
- Modify: `src/pages/admin/delivery/DeliveryTemplatePage.vue`
- Modify: `src/pages/admin/delivery/DeliveryManagementPage.vue`

**Interfaces:**
- Consumes: `cycle.actualPayoutPct`.
- Produces: Editable and visible actual payout rates.

- [ ] Add defaults, numeric serialization and validation-compatible inputs for actual payout rate.
- [ ] Show display and actual rates in template cards, editor preview and product cycle previews.
- [ ] Run full tests and `npm run build`.
