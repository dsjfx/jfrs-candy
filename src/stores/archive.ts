import { ref } from "vue";
import { defineStore } from "pinia";
import type { ArchiveYear } from "@/types";
import { archiveApi } from "@/api";

export const useArchiveStore = defineStore('archive', () => {

  // Archive related state
  const archiveYears = ref([] as ArchiveYear[])
  const archiveLoading = ref(false)
  const archiveNoMore = ref(false)

  const fetchArchive = async (
    opts = {
      year: undefined as number | undefined,
      month: undefined as number | undefined,
      limit: 3
    }
  ) => {
    // reset no-more flag on initial fetch so lazy-loading can proceed after reloads
    archiveNoMore.value = false
    archiveLoading.value = true
    try {
      const data = await archiveApi.getArticleArchive(opts)
      if (data && data.data) {
        // ensure years sorted desc
        archiveYears.value = (data.data.years || []).sort((a: any, b: any) => b.year - a.year)
      }
    } catch (err) {
      console.error('fetchArchive error', err)
      throw new Error('获取归档失败')
    } finally {
      archiveLoading.value = false
    }
  }

  /**
   * Reset archive related state.
   * @param options.clearYears - whether to clear the currently loaded years array (default false)
   */
  const resetArchiveState = (options: { clearYears?: boolean } = {}) => {
    archiveNoMore.value = false
    archiveLoading.value = false
    if (options.clearYears) {
      archiveYears.value = []
    }
  }

  const loadMoreArchiveYears = async ({ startYear, limit = 2 }: { startYear?: number; limit?: number } = {}) => {
    if (archiveLoading.value || archiveNoMore.value) return
    archiveLoading.value = true
    try {
      const data = await archiveApi.getArticleArchiveMore({ startYear, limit })
      if (data && data.data && data.data.years && data.data.years.length) {
        const returned = (data.data.years || []).sort((a: any, b: any) => b.year - a.year)
        // dedupe by year to avoid duplicates when backend returns overlapping ranges
        const existing = new Set(archiveYears.value.map((y: any) => y.year))
        const toAdd = returned.filter((y: any) => !existing.has(y.year))
        if (toAdd.length) {
          archiveYears.value = archiveYears.value.concat(toAdd)
        }
      } else {
        archiveNoMore.value = true
      }
    } catch (err) {
      console.error('loadMoreArchiveYears error', err)
      throw new Error('加载更多归档失败')
    } finally {
      archiveLoading.value = false
    }
  }

  return {
    archiveYears,
    archiveLoading,
    archiveNoMore,

    fetchArchive,
    loadMoreArchiveYears,
    resetArchiveState,
  }
});