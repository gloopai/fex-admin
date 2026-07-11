import { computed, ref, watch } from 'vue'

export function useAdminListPagination(sourceRows, options = {}) {
  const currentPage = ref(1)
  const pageSize = ref(options.pageSize ?? 10)

  const totalPages = computed(() => Math.max(1, Math.ceil(sourceRows.value.length / pageSize.value)))
  const pagedRows = computed(() => {
    const safePage = Math.min(currentPage.value, totalPages.value)
    const start = (safePage - 1) * pageSize.value
    return sourceRows.value.slice(start, start + pageSize.value)
  })

  if (options.resetSources?.length) {
    watch(options.resetSources, () => {
      currentPage.value = 1
    })
  }

  watch([() => sourceRows.value.length, pageSize], () => {
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
    if (currentPage.value < 1) currentPage.value = 1
  })

  function onPageSizeChange(nextPageSize) {
    pageSize.value = Number(nextPageSize) || 10
    currentPage.value = 1
  }

  return {
    currentPage,
    pageSize,
    totalPages,
    pagedRows,
    onPageSizeChange
  }
}
