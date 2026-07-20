# Manual Deposit Confirmation And Public Address MFA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three-field manual deposit confirmation and require MFA for every public deposit address write.

**Architecture:** Extend the existing in-memory fund order API with an optional manual confirmation payload while preserving the chain-event path. Keep public address mutations pending in the page until the shared MFA modal verifies.

**Tech Stack:** Vue 3 Composition API, Tailwind CSS, Node.js built-in test runner, Vite.

## Global Constraints

- Manual confirmation fields are exactly TxHash, payer address, and actual received amount; all are required.
- Coin, network, destination address, and required confirmations come from the deposit order.
- Public address create, edit, enable, and disable actions require MFA before mutation.

---

### Task 1: Manual confirmation domain behavior

**Files:**
- Modify: `src/admin/mock/fundOrders.js`
- Create: `test/manualDepositConfirmation.test.js`

**Interfaces:**
- Consumes: `fundOrderApi.updateDepositOrder(id, action, note, chainEventId)`.
- Produces: `fundOrderApi.updateDepositOrder(id, action, note, chainEventId, manualConfirmation)` where `manualConfirmation` contains `txHash`, `fromAddress`, and `amount`.

- [ ] Write tests that submit a valid manual payload and assert a credited order with `linkedChainEvent.source === 'manual'`.
- [ ] Run `node --test test/manualDepositConfirmation.test.js` and verify the new behavior fails.
- [ ] Implement required-field, positive-amount, and duplicate-TxHash validation plus manual linked-record creation.
- [ ] Run the focused test and verify it passes.

### Task 2: Deposit review dual-mode UI

**Files:**
- Modify: `src/pages/admin/user/DepositOrdersPage.vue`
- Modify: `test/manualDepositConfirmation.test.js`

**Interfaces:**
- Consumes: the extended `updateDepositOrder` API.
- Produces: chain-event and manual-entry modes in the existing review panel.

- [ ] Add source assertions for the two mode buttons and three required form fields.
- [ ] Run the focused test and verify it fails.
- [ ] Add mode state, reset behavior, form validation, API payload wiring, and manual-source detail copy.
- [ ] Run the focused test and verify it passes.

### Task 3: MFA-gated public address mutations

**Files:**
- Modify: `src/pages/admin/assets/AssetsPublicDepositAddressPage.vue`
- Modify: `test/publicDepositAddress.test.js`

**Interfaces:**
- Consumes: `MfaVerificationModal` and the existing address repository.
- Produces: pending mutation callbacks executed only by `handleMfaVerify`.

- [ ] Add source assertions for the shared MFA modal and pending operation state.
- [ ] Run `node --test test/publicDepositAddress.test.js` and verify it fails.
- [ ] Route save and status-toggle operations through MFA, with cancel clearing pending state.
- [ ] Run the focused test and verify it passes.

### Task 4: Regression and build verification

**Files:**
- Verify only.

- [ ] Run `npm test` and require zero failures.
- [ ] Run `npm run build` and require exit code 0.
- [ ] Open both affected admin flows locally and verify the primary interactions and browser console.
