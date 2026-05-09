import { ref, computed } from 'vue'

export interface LoadingOptions {
  initialLoading?: boolean
  loadingText?: string
  showError?: boolean
  autoReset?: boolean
  resetDelay?: number
}

export interface LoadingState {
  isLoading: boolean
  isLoadingMore: boolean
  isLoadingPage: boolean
  hasError: boolean
  error: string | null
  loadingText: string
  progress: number
}

export function useLoading(options: LoadingOptions = {}) {
  const {
    initialLoading = false,
    loadingText = '加载中...',
    showError = true,
    autoReset = true,
    resetDelay = 3000
  } = options

  // 状态
  const state = ref<LoadingState>({
    isLoading: initialLoading,
    isLoadingMore: false,
    isLoadingPage: false,
    hasError: false,
    error: null,
    loadingText,
    progress: 0
  })

  // 定时器引用
  let progressTimer: number | null = null
  let resetTimer: number | null = null

  // 计算属性
  const isLoading = computed(() => state.value.isLoading)
  const isLoadingMore = computed(() => state.value.isLoadingMore)
  const isLoadingPage = computed(() => state.value.isLoadingPage)
  const hasError = computed(() => state.value.hasError)
  const error = computed(() => state.value.error)
  const currentProgress = computed(() => state.value.progress)
  const isLoadingAny = computed(() =>
    state.value.isLoading || state.value.isLoadingMore || state.value.isLoadingPage
  )

  // 方法：开始加载
  const startLoading = (type: 'default' | 'more' | 'page' = 'default', customText?: string) => {
    stopLoading() // 先停止现有加载

    switch (type) {
      case 'more':
        state.value.isLoadingMore = true
        state.value.loadingText = customText || '正在加载更多...'
        break
      case 'page':
        state.value.isLoadingPage = true
        state.value.loadingText = customText || '正在加载页面...'
        break
      default:
        state.value.isLoading = true
        state.value.loadingText = customText || loadingText
    }

    state.value.hasError = false
    state.value.error = null
    state.value.progress = 0

    // 启动进度模拟
    startProgressSimulation()
  }

  // 方法：停止加载
  const stopLoading = (success: boolean = true) => {
    // 清除定时器
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }

    // 设置进度为100%
    if (success) {
      state.value.progress = 100
      setTimeout(() => {
        state.value.progress = 0
      }, 500)
    }

    // 重置加载状态
    state.value.isLoading = false
    state.value.isLoadingMore = false
    state.value.isLoadingPage = false
    state.value.loadingText = loadingText

    // 自动重置错误状态
    if (autoReset && state.value.hasError) {
      resetTimer = window.setTimeout(() => {
        state.value.hasError = false
        state.value.error = null
      }, resetDelay)
    }
  }

  // 方法：设置错误
  const setError = (errorMessage: string | Error, type: 'error' | 'warning' | 'info' = 'error') => {
    state.value.hasError = true
    state.value.error = errorMessage instanceof Error ? errorMessage.message : errorMessage

    // 停止所有加载状态
    stopLoading(false)

    console.error(`[Loading ${type}]:`, errorMessage)

    return state.value.error
  }

  // 方法：清除错误
  const clearError = () => {
    state.value.hasError = false
    state.value.error = null

    if (resetTimer) {
      clearTimeout(resetTimer)
      resetTimer = null
    }
  }

  // 方法：更新进度
  const updateProgress = (progress: number) => {
    if (progress < 0) progress = 0
    if (progress > 100) progress = 100
    state.value.progress = progress
  }

  // 方法：更新加载文本
  const updateLoadingText = (text: string) => {
    state.value.loadingText = text
  }

  // 方法：重置所有状态
  const reset = () => {
    stopLoading()
    clearError()
    state.value.progress = 0
  }

  // 方法：模拟进度（用于长时间操作）
  const startProgressSimulation = () => {
    if (progressTimer) {
      clearInterval(progressTimer)
    }

    // 模拟进度增长（0% 到 90%）
    state.value.progress = 0
    progressTimer = window.setInterval(() => {
      if (state.value.progress < 90) {
        state.value.progress += Math.random() * 10
      }
    }, 300)
  }

  // 方法：包装异步函数
  const withLoading = async <T>(
    promise: Promise<T>,
    type: 'default' | 'more' | 'page' = 'default',
    loadingText?: string
  ): Promise<T> => {
    try {
      startLoading(type, loadingText)
      const result = await promise
      stopLoading(true)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '操作失败'
      setError(errorMessage)
      throw error
    }
  }

  // 方法：并行加载
  const withParallelLoading = async <T>(
    promises: Promise<T>[],
    type: 'default' | 'more' | 'page' = 'default',
    loadingText?: string
  ): Promise<T[]> => {
    try {
      startLoading(type, loadingText)
      const results = await Promise.all(promises)
      stopLoading(true)
      return results
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '并行操作失败'
      setError(errorMessage)
      throw error
    }
  }

  // 清理定时器
  const cleanup = () => {
    if (progressTimer) clearInterval(progressTimer)
    if (resetTimer) clearTimeout(resetTimer)
  }

  return {
    // 状态
    state,

    // 计算属性
    isLoading,
    isLoadingMore,
    isLoadingPage,
    hasError,
    error,
    currentProgress,
    isLoadingAny,

    // 方法
    startLoading,
    stopLoading,
    setError,
    clearError,
    updateProgress,
    updateLoadingText,
    reset,
    withLoading,
    withParallelLoading,
    cleanup
  }
}

// 默认导出
export default useLoading