import { ref, computed, onUnmounted } from 'vue'

export interface LoadingConfig {
  // 基础配置
  initialLoading?: boolean
  loadingText?: string
  showError?: boolean
  autoReset?: boolean
  resetDelay?: number
  
  // 重试配置
  enableRetry?: boolean
  maxRetries?: number
  retryDelay?: number
  
  // 超时配置
  timeout?: number
  timeoutMessage?: string
  
  // 缓存配置
  enableCache?: boolean
  cacheDuration?: number
  
  // 进度配置
  showProgress?: boolean
  progressType?: 'determinate' | 'indeterminate'
  
  // 网络状态感知
  networkAware?: boolean
}

export interface LoadingState {
  isLoading: boolean
  isLoadingMore: boolean
  isLoadingPage: boolean
  hasError: boolean
  error: string | null
  loadingText: string
  progress: number
  retryCount: number
  lastUpdated: number | null
  data: any | null
  isCached: boolean
  isTimeout: boolean
  isRetrying: boolean
}

export interface RetryOptions {
  maxRetries?: number
  retryDelay?: number
  onRetry?: (attempt: number) => void
  shouldRetry?: (error: any) => boolean
}

export function useLoadingAdvanced(config: LoadingConfig = {}) {
  const {
    initialLoading = false,
    loadingText = '加载中...',
    showError = true,
    autoReset = true,
    resetDelay = 3000,
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    timeout = 10000,
    timeoutMessage = '请求超时，请检查网络连接',
    enableCache = false,
    cacheDuration = 5 * 60 * 1000, // 5分钟
    showProgress = true,
    progressType = 'determinate',
    networkAware = true
  } = config

  // 状态
  const state = ref<LoadingState>({
    isLoading: initialLoading,
    isLoadingMore: false,
    isLoadingPage: false,
    hasError: false,
    error: null,
    loadingText,
    progress: 0,
    retryCount: 0,
    lastUpdated: null,
    data: null,
    isCached: false,
    isTimeout: false,
    isRetrying: false
  })

  // 定时器和超时引用
  let progressTimer: number | null = null
  let resetTimer: number | null = null
  let timeoutTimer: number | null = null
  let retryTimer: number | null = null

  // 网络状态检测
  const networkStatus = ref({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    effectiveType: typeof navigator !== 'undefined' && 
                  (navigator as any).connection?.effectiveType || '4g',
    saveData: typeof navigator !== 'undefined' && 
              (navigator as any).connection?.saveData || false
  })

  // 监听网络状态变化
  if (typeof window !== 'undefined' && networkAware) {
    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)
    
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', updateNetworkStatus)
    }
  }

  function updateNetworkStatus() {
    networkStatus.value = {
      isOnline: navigator.onLine,
      effectiveType: (navigator as any).connection?.effectiveType || '4g',
      saveData: (navigator as any).connection?.saveData || false
    }
  }

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
  
  const isNetworkSlow = computed(() => 
    ['slow-2g', '2g', '3g'].includes(networkStatus.value.effectiveType)
  )
  
  const shouldUseCache = computed(() => 
    enableCache && 
    state.value.isCached && 
    state.value.lastUpdated && 
    Date.now() - state.value.lastUpdated < cacheDuration
  )

  // 方法：开始加载
  const startLoading = (
    type: 'default' | 'more' | 'page' = 'default', 
    customText?: string,
    enableTimeout: boolean = true
  ) => {
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
    state.value.isTimeout = false
    state.value.isRetrying = false
    state.value.retryCount = 0
    state.value.progress = 0
    
    // 根据网络状态调整超时时间
    const adjustedTimeout = isNetworkSlow.value ? timeout * 2 : timeout
    
    // 设置超时
    if (enableTimeout && adjustedTimeout > 0) {
      timeoutTimer = window.setTimeout(() => {
        if (isLoadingAny.value) {
          setError(timeoutMessage, 'timeout')
          state.value.isTimeout = true
        }
      }, adjustedTimeout)
    }
    
    // 启动进度模拟
    if (showProgress) {
      startProgressSimulation()
    }
  }

  // 方法：停止加载
  const stopLoading = (success: boolean = true, cacheData?: any) => {
    // 清除定时器
    clearTimers()
    
    // 设置进度
    if (success) {
      state.value.progress = 100
      setTimeout(() => {
        state.value.progress = 0
      }, 500)
      
      // 缓存数据
      if (cacheData !== undefined && enableCache) {
        state.value.data = cacheData
        state.value.lastUpdated = Date.now()
        state.value.isCached = true
      }
    }
    
    // 重置加载状态
    state.value.isLoading = false
    state.value.isLoadingMore = false
    state.value.isLoadingPage = false
    state.value.loadingText = loadingText
    state.value.isRetrying = false
    
    // 自动重置错误状态
    if (autoReset && state.value.hasError) {
      resetTimer = window.setTimeout(() => {
        state.value.hasError = false
        state.value.error = null
        state.value.isTimeout = false
      }, resetDelay)
    }
  }

  // 方法：设置错误
  const setError = (
    errorMessage: string | Error, 
    type: 'error' | 'warning' | 'info' | 'timeout' = 'error',
    shouldRetry: boolean = true
  ) => {
    state.value.hasError = true
    state.value.error = errorMessage instanceof Error ? errorMessage.message : errorMessage
    state.value.errorType = type
    
    // 停止所有加载状态
    stopLoading(false)
    
    // 根据错误类型记录日志
    switch (type) {
      case 'timeout':
        console.warn('[Loading Timeout]:', errorMessage)
        break
      case 'warning':
        console.warn('[Loading Warning]:', errorMessage)
        break
      case 'info':
        console.info('[Loading Info]:', errorMessage)
        break
      default:
        console.error('[Loading Error]:', errorMessage)
    }
    
    // 自动重试
    if (shouldRetry && enableRetry && state.value.retryCount < maxRetries) {
      scheduleRetry()
    }
    
    return state.value.error
  }

  // 方法：重试逻辑
  const scheduleRetry = () => {
    state.value.isRetrying = true
    state.value.retryCount++
    
    retryTimer = window.setTimeout(() => {
      state.value.isRetrying = false
      state.value.hasError = false
      state.value.error = null
      startLoading()
    }, retryDelay * state.value.retryCount) // 指数退避
  }

  // 方法：重试操作
  const retry = async <T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> => {
    const {
      maxRetries: customMaxRetries = maxRetries,
      retryDelay: customRetryDelay = retryDelay,
      onRetry,
      shouldRetry = () => true
    } = options

    let lastError: any
    let attempts = 0

    while (attempts <= customMaxRetries) {
      try {
        if (attempts > 0) {
          state.value.isRetrying = true
          state.value.retryCount = attempts
          state.value.loadingText = `正在重试... (${attempts}/${customMaxRetries})`
          
          if (onRetry) {
            onRetry(attempts)
          }
        }
        
        const result = await operation()
        
        state.value.isRetrying = false
        state.value.retryCount = 0
        return result
        
      } catch (error) {
        lastError = error
        attempts++
        
        if (attempts <= customMaxRetries && shouldRetry(error)) {
          await new Promise(resolve => 
            setTimeout(resolve, customRetryDelay * attempts)
          )
        } else {
          break
        }
      }
    }
    
    throw lastError
  }

  // 方法：清除定时器
  const clearTimers = () => {
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
    if (timeoutTimer) {
      clearTimeout(timeoutTimer)
      timeoutTimer = null
    }
    if (resetTimer) {
      clearTimeout(resetTimer)
      resetTimer = null
    }
    if (retryTimer) {
      clearTimeout(retryTimer)
      retryTimer = null
    }
  }

  // 方法：模拟进度
  const startProgressSimulation = () => {
    if (progressType === 'determinate') {
      progressTimer = window.setInterval(() => {
        if (state.value.progress < 90) {
          // 根据网络状态调整进度速度
          const increment = isNetworkSlow.value ? 5 : 10
          state.value.progress += Math.random() * increment
        }
      }, 300)
    }
  }

  // 方法：包装异步函数（带重试）
  const withLoading = async <T>(
    promiseFn: () => Promise<T>,
    type: 'default' | 'more' | 'page' = 'default',
    loadingText?: string,
    retryOptions?: RetryOptions
  ): Promise<T> => {
    try {
      startLoading(type, loadingText)
      
      let result: T
      if (enableRetry && retryOptions) {
        result = await retry(promiseFn, retryOptions)
      } else {
        result = await promiseFn()
      }
      
      stopLoading(true, result)
      return result
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '操作失败'
      const shouldRetry = retryOptions?.shouldRetry?.(error) ?? true
      setError(errorMessage, 'error', shouldRetry)
      throw error
    }
  }

  // 方法：获取缓存数据
  const getCachedData = <T>(): T | null => {
    if (shouldUseCache.value && state.value.data) {
      return state.value.data as T
    }
    return null
  }

  // 方法：清除缓存
  const clearCache = () => {
    state.value.data = null
    state.value.lastUpdated = null
    state.value.isCached = false
  }

  // 方法：重置所有状态
  const reset = () => {
    clearTimers()
    clearCache()
    
    state.value.isLoading = false
    state.value.isLoadingMore = false
    state.value.isLoadingPage = false
    state.value.hasError = false
    state.value.error = null
    state.value.loadingText = loadingText
    state.value.progress = 0
    state.value.retryCount = 0
    state.value.isCached = false
    state.value.isTimeout = false
    state.value.isRetrying = false
  }

  // 清理
  const cleanup = () => {
    clearTimers()
    
    if (typeof window !== 'undefined' && networkAware) {
      window.removeEventListener('online', updateNetworkStatus)
      window.removeEventListener('offline', updateNetworkStatus)
      
      if ((navigator as any).connection) {
        (navigator as any).connection.removeEventListener('change', updateNetworkStatus)
      }
    }
  }

  // 自动清理
  onUnmounted(cleanup)

  return {
    // 状态
    state,
    networkStatus,
    
    // 计算属性
    isLoading,
    isLoadingMore,
    isLoadingPage,
    hasError,
    error,
    currentProgress,
    isLoadingAny,
    isNetworkSlow,
    shouldUseCache,
    
    // 方法
    startLoading,
    stopLoading,
    setError,
    clearError: () => {
      state.value.hasError = false
      state.value.error = null
      state.value.isTimeout = false
    },
    updateProgress: (progress: number) => {
      if (progress < 0) progress = 0
      if (progress > 100) progress = 100
      state.value.progress = progress
    },
    updateLoadingText: (text: string) => {
      state.value.loadingText = text
    },
    retry,
    withLoading,
    getCachedData,
    clearCache,
    reset,
    cleanup
  }
}

// 类型扩展
declare module 'vue' {
  interface ComponentCustomProperties {
    $loading: ReturnType<typeof useLoadingAdvanced>
  }
}