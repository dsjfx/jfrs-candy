import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

// 定义 Store 状态类型（可选，也可以让 TypeScript 自动推断）
interface SearchState {
  keyword: string
  currentPage: number
  pageSize: number
  total: number
  scrollTop: number
}

export const useSearchStore = defineStore('search', () => {
  // ========== 状态 ==========
  const keyword = ref<string>('')
  const currentPage = ref<number>(1)
  const pageSize = ref<number>(10)
  const total = ref<number>(0)
  const scrollTop = ref<number>(0)

  // ========== 计算属性（可选） ==========
  // 如果有需要可以添加 computed

  // ========== 方法 ==========

  /**
   * 重置所有搜索条件
   */
  const resetSearch = (): void => {
    keyword.value = ''
    currentPage.value = 1
    pageSize.value = 10
    total.value = 0
    scrollTop.value = 0
  }

  /**
   * 设置搜索关键词（自动重置到第一页）
   * @param val - 搜索关键词
   */
  const setKeyword = (val: string): void => {
    keyword.value = val
    currentPage.value = 1
  }

  /**
   * 设置当前页码
   * @param page - 页码
   */
  const setPage = (page: number): void => {
    if (page < 1) {
      console.warn('页码不能小于 1')
      return
    }
    currentPage.value = page
  }

  /**
   * 设置每页条数（自动重置到第一页）
   * @param size - 每页条数
   */
  const setPageSize = (size: number): void => {
    if (size < 1) {
      console.warn('每页条数不能小于 1')
      return
    }
    pageSize.value = size
    currentPage.value = 1
  }

  /**
   * 设置总条数
   * @param val - 总条数
   */
  const setTotal = (val: number): void => {
    if (val < 0) {
      console.warn('总条数不能小于 0')
      return
    }
    total.value = val
  }

  /**
   * 设置滚动位置
   * @param top - 滚动高度
   */
  const setScrollTop = (top: number): void => {
    if (top < 0) {
      console.warn('滚动位置不能小于 0')
      return
    }
    scrollTop.value = top
  }

  // ========== 批量更新方法（可选） ==========
  /**
   * 批量更新搜索条件（用于从 URL 参数恢复）
   * @param params - 搜索参数对象
   */
  const updateSearchParams = (params: Partial<Omit<SearchState, 'total' | 'scrollTop'>>): void => {
    if (params.keyword !== undefined) {
      keyword.value = params.keyword
    }
    if (params.currentPage !== undefined && params.currentPage >= 1) {
      currentPage.value = params.currentPage
    }
    if (params.pageSize !== undefined && params.pageSize >= 1) {
      pageSize.value = params.pageSize
    }
  }

  return {
    // 状态
    keyword,
    currentPage,
    pageSize,
    total,
    scrollTop,
    // 方法
    resetSearch,
    setKeyword,
    setPage,
    setPageSize,
    setTotal,
    setScrollTop,
    updateSearchParams
  }
})