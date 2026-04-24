import { computed, reactive, ref, watch } from 'vue'

/**
 * 演示用：对已有数组做前端分页（生产应改为接口分页）。
 * @param {import('vue').ComputedRef<unknown[]> | import('vue').Ref<unknown[]>} source
 * @param {{ pageSize?: number }} [options]
 */
export function useClientListPagination(source, options = {}) {
  const pageSize = Math.max(1, Math.floor(Number(options.pageSize)) || 8)
  const page = ref(1)

  const list = computed(() => {
    const v = source && typeof source === 'object' && 'value' in source ? source.value : source
    return Array.isArray(v) ? v : []
  })

  const total = computed(() => list.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

  const pagedItems = computed(() => {
    const arr = list.value
    const start = (page.value - 1) * pageSize
    return arr.slice(start, start + pageSize)
  })

  function resetPage() {
    page.value = 1
  }

  function setPage(p) {
    const n = Math.floor(Number(p))
    if (!Number.isFinite(n)) return
    page.value = Math.min(totalPages.value, Math.max(1, n))
  }

  function goPrev() {
    setPage(page.value - 1)
  }

  function goNext() {
    setPage(page.value + 1)
  }

  watch([total, totalPages], () => {
    if (page.value > totalPages.value) page.value = totalPages.value
    if (page.value < 1) page.value = 1
  })

  watch(
    () => list.value.length,
    () => {
      if (page.value > totalPages.value) page.value = totalPages.value
    }
  )

  // reactive：模板里 `obj.pagedItems` / `obj.page` 才能自动解包 Ref、ComputedRef（普通对象嵌套则不会）
  return reactive({
    page,
    pageSize,
    total,
    totalPages,
    pagedItems,
    resetPage,
    setPage,
    goPrev,
    goNext
  })
}
