# Admin Customer Service Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a demo customer-service workbench in the admin console that exchanges persistent messages with the authenticated front customer-service page.

**Architecture:** Replace the front page's isolated canned-reply state with a framework-independent shared conversation domain and a browser repository backed by localStorage plus same-tab and cross-tab events. Both the front page and a new three-column admin workbench consume the repository API; route and navigation configuration expose the workbench without adding backend or permission infrastructure.

**Tech Stack:** Vue 3 Composition API, Vue Router 4, Tailwind CSS, localStorage, browser CustomEvent/storage events, Node built-in test runner, Vite.

## Global Constraints

- Admin route is `/admin/customer-service/workbench` under a top-level “客服管理” menu.
- Front customer service remains login-protected and no longer generates a canned automatic reply.
- Demo persistence uses same-origin localStorage; no HTTP, WebSocket, database, third-party support platform, or multi-agent assignment is added.
- Messages accept nonblank text or a Data URL image; image input is restricted to image MIME types and 1 MB.
- Closed conversations are read-only to agents; the next user message creates a new conversation.
- Desktop admin uses three columns; narrow admin uses conversation and user-information panels around the chat view.

## Prototype Scope Adjustment

During implementation the user explicitly reduced this to a simple demo prototype. The required admin surface is conversation selection, linked text messages, agent text reply, conversation close, user summary, and a simple private note. Advanced status filtering, agent image reply, assignment, and multi-agent workflows are excluded; this adjustment overrides broader steps below.

---

### Task 1: Shared conversation domain

**Files:**
- Replace: `src/features/customer-service/customerService.js`
- Create: `test/customerServiceDomain.test.js`
- Modify: `test/customerService.test.js`

**Interfaces:**
- Produces constants `CUSTOMER_SERVICE_STATUS`, `CUSTOMER_SERVICE_SENDER`, `WELCOME_MESSAGE_TEXT`, `MAX_CUSTOMER_SERVICE_IMAGE_BYTES`.
- Produces pure functions `normalizeCustomerServiceState(raw)`, `createCustomerServiceMessage(input)`, `sendUserMessage(state, input)`, `sendAgentMessage(state, input)`, `markConversationRead(state, input)`, `markConversationActive(state, input)`, `closeConversation(state, input)`, `saveConversationNote(state, input)`, `filterCustomerServiceConversations(conversations, filters)`, and `summarizeCustomerServiceConversations(conversations)`.

- [ ] **Step 1: Write failing domain tests** for valid/blank messages, first user conversation creation, open conversation reuse, state and unread transitions, agent reply, mark active, close, post-close recreation, notes, corrupted-state normalization, sorting, search, filtering, and counts.
- [ ] **Step 2: Run `node --test test/customerServiceDomain.test.js`** and confirm failure because the new exports do not exist.
- [ ] **Step 3: Implement immutable pure state transitions** with generated IDs/timestamps supplied through input parameters for deterministic tests.
- [ ] **Step 4: Update the original message tests** to use `createCustomerServiceMessage` and remove `DEMO_REPLY_TEXT` expectations.
- [ ] **Step 5: Run `npm test`** and confirm all domain and existing navigation tests pass.

### Task 2: Browser repository and synchronization

**Files:**
- Create: `src/features/customer-service/customerServiceRepository.js`
- Create: `test/customerServiceRepository.test.js`

**Interfaces:**
- Consumes all state transitions from Task 1.
- Produces `createCustomerServiceRepository({ storage, eventTarget, now, createId })` with methods `getSnapshot()`, `subscribe(listener)`, `sendUserMessage(input)`, `sendAgentMessage(input)`, `markRead(input)`, `markActive(input)`, `close(input)`, `saveNote(input)`, `seedDemoData()`, and `dispose()`.
- Produces singleton `customerServiceRepository` for browser components.

- [ ] **Step 1: Write failing repository tests** using in-memory storage/event doubles for persistence, snapshot cloning, same-tab notification, storage-event notification, corrupt JSON recovery, quota error propagation, and demo seeding idempotence.
- [ ] **Step 2: Run the repository test** and confirm failure because the repository module is absent.
- [ ] **Step 3: Implement the repository** with storage key `fex-customer-service-v1`, custom event `fex-customer-service-updated`, state normalization on every read, and immutable writes.
- [ ] **Step 4: Run `npm test`** and confirm all tests pass.

### Task 3: Front page live conversation integration

**Files:**
- Modify: `src/pages/front/FrontCustomerServicePage.vue`
- Modify: `src/stores/frontAuth.js` only if a stable demo user snapshot helper is needed.

**Interfaces:**
- Consumes `customerServiceRepository`, authenticated store email/nickname, and the shared domain constants.
- Produces front behavior that creates/resumes an open conversation, sends text/Data URL images, subscribes to admin replies and close events, and creates a new conversation after close.

- [ ] **Step 1: Replace local canned-reply state** with repository snapshot selection for the current authenticated user.
- [ ] **Step 2: Convert selected images through FileReader** after validating `file.type.startsWith('image/')` and `file.size <= MAX_CUSTOMER_SERVICE_IMAGE_BYTES`; show actionable read/storage errors.
- [ ] **Step 3: Send user messages through the repository**, clear front unread after subscription, keep auto-scroll, show closed-session status, and allow the next valid user send to create a new conversation.
- [ ] **Step 4: Run `npm test` and `npm run build`** and resolve integration failures.

### Task 4: Admin route, navigation, and workbench

**Files:**
- Create: `src/pages/admin/customer-service/CustomerServiceWorkbenchPage.vue`
- Modify: `src/router/modules/console.js`
- Modify: `src/admin/config/nav.js`
- Modify: `src/admin/components/SidebarNode.vue`
- Create: `test/customerServiceAdminNavigation.test.js`

**Interfaces:**
- Consumes `customerServiceRepository`, filter/count domain helpers, and route `/admin/customer-service/workbench`.
- Produces top-level menu item `客服管理`, route name `customer-service-workbench`, and the responsive workbench UI.

- [ ] **Step 1: Write failing navigation tests** asserting the menu path/icon and lazy route metadata.
- [ ] **Step 2: Run the navigation test** and confirm failure because menu and route are absent.
- [ ] **Step 3: Register the route and menu** and add a `customer-service` sidebar icon path.
- [ ] **Step 4: Build the workbench page** with summary tabs, search/status/unread filters, sorted conversation cards, direct selection/read clearing, message history, quick replies, text/image reply composer, explicit active state, end confirmation, user profile, internal note save, error banners, and empty states.
- [ ] **Step 5: Add narrow-layout controls** where conversation list and user profile become fixed overlay panels while chat remains primary.
- [ ] **Step 6: Seed demo history only when the repository is empty**, subscribe on mount, and dispose the page subscription on unmount.
- [ ] **Step 7: Run `npm test` and `npm run build`** and confirm clean exits.

### Task 5: End-to-end runtime verification

**Files:**
- Modify only customer-service files when runtime verification reveals a defect.

**Interfaces:**
- Consumes the complete front/admin feature.
- Produces evidence for the demo conversation lifecycle and responsive UI.

- [ ] **Step 1: Start Vite and authenticate the front demo account.**
- [ ] **Step 2: Send a front message and verify it appears in `/admin/customer-service/workbench` with waiting state and unread count.**
- [ ] **Step 3: Open the conversation, reply from admin, save a private note, and verify the front page receives the reply.**
- [ ] **Step 4: End the conversation, verify the front closed state, then send a new front message and verify a new conversation ID appears.**
- [ ] **Step 5: Inspect desktop three-column and narrow overlay layouts, image controls, empty states, focusable controls, and browser console errors.**
- [ ] **Step 6: Run fresh `npm test`, `npm run build`, and `git diff --check`; review the complete diff and commit the implementation.**
