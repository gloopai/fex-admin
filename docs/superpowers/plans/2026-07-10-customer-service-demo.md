# Customer Service Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a login-protected customer-service demo page with text/image chat and entry points in the top navigation, personal center, and a global floating button.

**Architecture:** Keep message creation and validation in a small framework-independent module so browser behavior can be covered with Node's built-in test runner. Render that state in one responsive Vue page, register it in the existing authenticated front router, and expose one shared destination from the existing navigation configurations plus a layout-level floating action.

**Tech Stack:** Vue 3 Composition API, Vue Router 4, Tailwind CSS, Node built-in test runner, Vite.

## Global Constraints

- The route is `/front/customer-service` and requires front-user authentication.
- Chat state and selected images remain browser-local and reset on refresh.
- No HTTP, WebSocket, third-party support system, file upload, persistence, or support-agent admin UI is added.
- Mobile layout follows the supplied reference; desktop layout follows the current dark front-site visual language.
- Empty messages cannot be sent; text and image messages can be sent; a delayed demo reply follows each valid send.

---

### Task 1: Testable chat behavior

**Files:**
- Create: `src/features/customer-service/customerService.js`
- Create: `test/customerService.test.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `createCustomerMessage({ id, sender, text, imageUrl })`, returning a normalized message object or `null` for empty content.
- Produces: `WELCOME_MESSAGE_TEXT` and `DEMO_REPLY_TEXT` strings consumed by the page.

- [ ] **Step 1: Add failing Node tests** for rejecting blank content, trimming text, accepting image-only messages, and exposing the two required customer-service copy constants.
- [ ] **Step 2: Run `npm test`** and confirm failure because `src/features/customer-service/customerService.js` does not exist.
- [ ] **Step 3: Implement the minimal pure module** and add `"test": "node --test"` to scripts.
- [ ] **Step 4: Run `npm test`** and confirm all chat-model tests pass.

### Task 2: Authenticated route and navigation configuration

**Files:**
- Modify: `src/router/modules/front.js`
- Modify: `src/constants/frontNav.js`
- Modify: `src/constants/personalCenterNav.js`
- Create: `test/customerServiceNavigation.test.js`

**Interfaces:**
- Consumes: destination `/front/customer-service`.
- Produces: route name `front-customer-service`, a top-nav item with key `customer-service`, and a personal-center item with key `customer-service`.

- [ ] **Step 1: Add failing configuration tests** that locate the route and both navigation entries, assert the route's `requiresAuth` flag, and assert all destinations are `/front/customer-service`.
- [ ] **Step 2: Run `npm test`** and confirm the assertions fail because the entries are absent.
- [ ] **Step 3: Register the lazy route** and add the two configuration entries; include customer service in the mobile personal-center ordering.
- [ ] **Step 4: Run `npm test`** and confirm all configuration and chat-model tests pass.

### Task 3: Responsive customer-service page

**Files:**
- Create: `src/pages/front/FrontCustomerServicePage.vue`

**Interfaces:**
- Consumes: `createCustomerMessage`, `WELCOME_MESSAGE_TEXT`, and `DEMO_REPLY_TEXT`.
- Produces: the page component referenced by route `front-customer-service`.

- [ ] **Step 1: Build the page around the tested model** with welcome message initialization, text input, Enter send, Shift+Enter newline, image selection and local preview, delayed canned reply, automatic scroll, timer cleanup, object-URL cleanup, and history-aware back navigation.
- [ ] **Step 2: Add the responsive template** with a compact mobile header and fixed composer matching the reference, plus a centered desktop chat panel using existing dark-site colors.
- [ ] **Step 3: Run `npm test` and `npm run build`** and fix any integration or compilation failure before continuing.

### Task 4: Top-nav, personal-center, and floating entry points

**Files:**
- Modify: `src/components/FrontTopNav.vue`
- Modify: `src/layouts/PersonalCenterShellLayout.vue`
- Modify: `src/layouts/FrontDesktopLayout.vue`
- Create: `src/components/front/CustomerServiceFloatButton.vue`

**Interfaces:**
- Consumes: authenticated route `/front/customer-service` and existing login redirect helper behavior in `FrontTopNav.vue`.
- Produces: a visible desktop top-nav link, mobile drawer link, personal-center desktop/mobile links, and a global floating action hidden on the customer-service page.

- [ ] **Step 1: Resolve the customer-service top-nav link** to the login page with a redirect query when logged out and directly to customer service when logged in.
- [ ] **Step 2: Map customer-service icons** in the top-nav drawer and personal-center mobile shortcut map.
- [ ] **Step 3: Add the floating button component** using `useRoute`, `useRouter`, and front auth state; hide it on the customer-service page and route logged-out users through login with a return destination.
- [ ] **Step 4: Mount the floating action in the front layout** without covering the existing mobile bottom bar.
- [ ] **Step 5: Run `npm test` and `npm run build`** and confirm clean exits.

### Task 5: Runtime and visual verification

**Files:**
- Modify as needed only when verification reveals a customer-service defect.

**Interfaces:**
- Consumes: the complete feature from Tasks 1-4.
- Produces: runtime evidence for authentication, entry visibility, chat interactions, and responsive layout.

- [ ] **Step 1: Start the Vite development server** and open the application in a browser.
- [ ] **Step 2: Verify logged-out direct navigation** redirects to `/front/login?redirect=/front/customer-service`.
- [ ] **Step 3: Verify authenticated navigation and interaction** from the three entry families, including text send, image preview, delayed reply, and back navigation.
- [ ] **Step 4: Capture and inspect desktop and mobile screenshots** for header, message bubbles, scrolling, composer placement, safe-area spacing, and floating-button visibility.
- [ ] **Step 5: Run fresh final `npm test` and `npm run build` commands**, inspect `git diff --check` and the complete diff, and report only evidence-supported completion.

