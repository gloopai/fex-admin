# Custom Leverage Level Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a validated manual leverage multiplier input to the leverage-template create/edit modal.

**Architecture:** Keep one source of truth in `selectedLeverages`. A focused `addCustomLeverage` function validates and merges manual input into that array, while the existing save path continues serializing the sorted numeric values to `levels`. The selected-level chips call the existing toggle behavior to remove any preset or custom level.

**Tech Stack:** Vue 3 Composition API, Tailwind CSS, Node.js built-in test runner

## Global Constraints

- Accept only positive integers from `1` through `150` inclusive.
- Duplicate and out-of-range submissions must show explicit Chinese error messages and must not modify the selection.
- Successful additions must clear the input and keep `selectedLeverages` numerically sorted.
- Both click and Enter submission must work in create and edit modes.
- Preserve the persisted `levels: ['1x', ...]`, `leverageCount`, and `leverageRange` formats.
- Do not add custom values to the global preset list `perpetualLeverageLevels`.

---

### Task 1: Add and verify manual leverage entry

**Files:**
- Modify: `src/pages/admin/perpetual/PerpetualLeverageTemplatePage.vue`
- Test: `test/perpetualLeverageTemplate.test.js`

**Interfaces:**
- Consumes: existing `selectedLeverages: Ref<number[]>` and `toggleLeverage(value: number): void`
- Produces: `customLeverageInput: Ref<string | number>`, `customLeverageError: Ref<string>`, `addCustomLeverage(): void`

- [ ] **Step 1: Write the failing source-contract test**

Append this test to `test/perpetualLeverageTemplate.test.js`:

```js
test('perpetual leverage template editor supports validated custom leverage levels', () => {
  const source = readFileSync(
    new URL('../src/pages/admin/perpetual/PerpetualLeverageTemplatePage.vue', import.meta.url),
    'utf8'
  )

  assert.match(source, /customLeverageInput/)
  assert.match(source, /customLeverageError/)
  assert.match(source, /const addCustomLeverage = \(\) =>/)
  assert.match(source, /Number\.isInteger\(value\)/)
  assert.match(source, /value < 1 \|\| value > 150/)
  assert.match(source, /请输入杠杆倍数/)
  assert.match(source, /请输入 1–150 的正整数/)
  assert.match(source, /该杠杆档位已存在/)
  assert.match(source, /@keyup\.enter="addCustomLeverage"/)
  assert.match(source, /@click="addCustomLeverage"/)
  assert.match(source, /@click="toggleLeverage\(lv\)"/)
})
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test test/perpetualLeverageTemplate.test.js`

Expected: FAIL in `supports validated custom leverage levels` because `customLeverageInput` is absent.

- [ ] **Step 3: Add state, reset behavior, validation, and sorted insertion**

In `PerpetualLeverageTemplatePage.vue`, add state beside `selectedLeverages`:

```js
const customLeverageInput = ref('')
const customLeverageError = ref('')
```

Add the function beside `toggleLeverage`:

```js
const addCustomLeverage = () => {
  customLeverageError.value = ''
  if (String(customLeverageInput.value).trim() === '') {
    customLeverageError.value = '请输入杠杆倍数'
    return
  }

  const value = Number(customLeverageInput.value)
  if (!Number.isInteger(value) || value < 1 || value > 150) {
    customLeverageError.value = '请输入 1–150 的正整数'
    return
  }
  if (selectedLeverages.value.includes(value)) {
    customLeverageError.value = '该杠杆档位已存在'
    return
  }

  selectedLeverages.value = [...selectedLeverages.value, value].sort((a, b) => a - b)
  customLeverageInput.value = ''
}
```

Reset both refs in `openCreateTemplate`, `openEditTemplate`, and after `submitTemplate` succeeds:

```js
customLeverageInput.value = ''
customLeverageError.value = ''
```

- [ ] **Step 4: Add the manual input and removable selected chips**

Place this block below the preset-level grid:

```vue
<div class="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
  <label for="custom-leverage" class="block text-sm font-medium text-slate-700">手动添加倍数</label>
  <div class="flex gap-2">
    <div class="relative min-w-0 flex-1">
      <input
        id="custom-leverage"
        v-model="customLeverageInput"
        type="number"
        min="1"
        max="150"
        step="1"
        class="ant-input pr-8"
        :class="customLeverageError ? '!border-rose-400' : ''"
        placeholder="请输入 1–150"
        @input="customLeverageError = ''"
        @keyup.enter="addCustomLeverage"
      />
      <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">x</span>
    </div>
    <button type="button" class="ant-btn ant-btn-primary shrink-0" @click="addCustomLeverage">添加</button>
  </div>
  <p v-if="customLeverageError" class="text-sm text-rose-500">{{ customLeverageError }}</p>
</div>
```

Replace each selected chip with a removable button:

```vue
<button
  v-for="lv in selectedLeverages"
  :key="`picked-${lv}`"
  type="button"
  class="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-sm text-blue-600 hover:bg-blue-100"
  :aria-label="`移除 ${lv}x 杠杆档位`"
  @click="toggleLeverage(lv)"
>
  <span>{{ lv }}x</span><span aria-hidden="true">×</span>
</button>
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Run: `node --test test/perpetualLeverageTemplate.test.js`

Expected: all leverage-template tests PASS.

- [ ] **Step 6: Run full verification**

Run: `npm test`

Expected: all tests PASS.

Run: `npm run build`

Expected: Vite production build exits with status 0.

- [ ] **Step 7: Commit the implementation**

```bash
git add src/pages/admin/perpetual/PerpetualLeverageTemplatePage.vue test/perpetualLeverageTemplate.test.js docs/superpowers/plans/2026-07-18-leverage-template-custom-level.md
git commit -m "feat: add custom leverage levels"
```

