import { computed, ref, watch } from 'vue'

/**
 * 代理系统列表前端分页：筛选结果变化时回到第 1 页。
 * @param {import('vue').Ref | import('vue').ComputedRef} filteredListRef 已筛选的完整列表
 * @param {{ pageSize?: number }} [options]
 */
export function useAgentPagedList(filteredListRef, options = {}) {
  const pageSize = ref(options.pageSize ?? 10)
  const currentPage = ref(1)

  const totalCount = computed(() => filteredListRef.value.length)

  const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))

  const pagedList = computed(() => {
    const list = filteredListRef.value
    const start = (currentPage.value - 1) * pageSize.value
    return list.slice(start, start + pageSize.value)
  })

  watch(filteredListRef, () => {
    currentPage.value = 1
  }, { deep: true })

  watch(pageSize, () => {
    currentPage.value = 1
  })

  watch([totalPages, totalCount], () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
    if (currentPage.value < 1) currentPage.value = 1
  })

  return {
    pageSize,
    currentPage,
    totalCount,
    totalPages,
    pagedList
  }
}
