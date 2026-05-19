import axios, { AxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/stores/user'
import { ErrorType } from '@/types/error'
import type { AppError, ErrorHandlerOptions } from '@/types/error'

class ErrorHandler {
  private static instance: ErrorHandler
  private errorQueue: AppError[] = []
  private isRefreshing = false
  private refreshSubscribers: ((token: string) => void)[] = []

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // 初始化错误处理
  init() {
    this.setupAxiosInterceptors()
    this.setupGlobalHandlers()
  }

  // 设置 Axios 拦截器
  private setupAxiosInterceptors() {
    // 响应拦截器
    axios.interceptors.response.use(
      (response: AxiosResponse) => {
        return this.handleSuccess(response)
      },
      (error: AxiosError) => {
        // return this.handleError(error)
        // 返回 Promise.reject 以保持错误链
        return Promise.reject(this.handleError(error))
      }
    )
  }

  // 处理成功响应
  private handleSuccess(response: AxiosResponse): AxiosResponse {
    const { data } = response

    // 检查业务状态码
    if (!data.code || data.code !== 200) {
      const code = data.code || 900
      const message = data.message || '操作失败'
      // 创建业务错误
      const appError: AppError = {
        type: ErrorType.BUSINESS,
        code: code,
        message: message,
        details: data,
        timestamp: Date.now(),
        url: response.config.url,
        method: response.config.method
      }

      // 处理错误（显示提示等）
      this.processError(appError, {
        showToast: true,
        logToConsole: true
      })

      // 创建错误对象并抛出
      const error = new Error(message)
      error.name = 'BusinessError'
        ; (error as any).code = code
        ; (error as any).type = ErrorType.BUSINESS

      // 重要：这里抛出错误，让拦截器进入错误处理流程
      throw error
    }

    return response
  }

  // 统一错误处理
  private handleError(error: AxiosError | Error): AppError {
    let appError: AppError

    if (axios.isAxiosError(error)) {
      appError = this.normalizeAxiosError(error)
    } else {
      appError = this.normalizeGenericError(error)
    }

    // 根据错误类型处理
    const options = this.getErrorOptions(appError.type)
    this.processError(appError, options)

    return appError
  }

  // 标准化 Axios 错误
  private normalizeAxiosError(error: AxiosError): AppError {
    const appError: AppError = {
      type: ErrorType.UNKNOWN,
      code: error.code || 0,
      message: error.message || '未知错误',
      timestamp: Date.now(),
      url: error.config?.url,
      method: error.config?.method?.toUpperCase()
    }

    if (error.code === 'ECONNABORTED') {
      appError.type = ErrorType.TIMEOUT
      appError.message = '请求超时，请重试'
    } else if (!error.response) {
      appError.type = ErrorType.NETWORK
      appError.message = '网络连接失败，请检查网络'
    } else {
      const status = error.response.status
      const resData = error.response.data as any

      switch (status) {
        case 401:
          appError.type = ErrorType.UNAUTHORIZED
          appError.message = resData?.message || '登录已过期，请重新登录'
          break
        case 403:
          appError.type = ErrorType.FORBIDDEN
          appError.message = resData?.message || '没有权限执行此操作'
          break
        case 404:
          appError.type = ErrorType.NOT_FOUND
          appError.message = resData?.message || '请求的资源不存在'
          break
        case 422:
          appError.type = ErrorType.VALIDATION
          appError.message = resData?.message || '数据验证失败'
          appError.details = resData
          break
        case 500:
        case 502:
        case 503:
          appError.type = ErrorType.SERVER
          appError.message = resData?.message || '服务器繁忙，请稍后重试'
          break
        default:
          appError.message = resData?.message || `请求失败 (${status})`
      }
    }

    return appError
  }

  // 标准化普通错误
  private normalizeGenericError(error: Error): AppError {
    return {
      type: (error as any).type || ErrorType.UNKNOWN,
      code: (error as any).code || 'UNKNOWN',
      message: error.message,
      timestamp: Date.now(),
      stack: error.stack
    }
  }

  // 标准化错误
  private normalizeError(error: AxiosError): AppError {
    const appError: AppError = {
      type: ErrorType.UNKNOWN,
      code: error.code || 0,
      message: error.message || '未知错误',
      timestamp: Date.now(),
      url: error.config?.url,
      method: error.config?.method?.toUpperCase()
    }

    if (error.code === 'ECONNABORTED') {
      appError.type = ErrorType.TIMEOUT
      appError.message = '请求超时，请重试'
    } else if (!error.response) {
      appError.type = ErrorType.NETWORK
      appError.message = '网络连接失败，请检查网络'
    } else {
      const status = error.response.status
      switch (status) {
        case 401:
          appError.type = ErrorType.UNAUTHORIZED
          appError.message = '登录已过期，请重新登录'
          break
        case 403:
          appError.type = ErrorType.FORBIDDEN
          appError.message = '没有权限执行此操作'
          break
        case 404:
          appError.type = ErrorType.NOT_FOUND
          appError.message = '请求的资源不存在'
          break
        case 422:
          appError.type = ErrorType.VALIDATION
          appError.message = '数据验证失败'
          appError.details = error.response.data
          break
        case 500:
        case 502:
        case 503:
          appError.type = ErrorType.SERVER
          appError.message = '服务器繁忙，请稍后重试'
          break
        default:
          appError.message = (error.response.data as any)?.message || `请求失败 (${status})`
      }
    }

    return appError
  }

  // 根据错误类型获取处理选项
  private getErrorOptions(type: ErrorType): ErrorHandlerOptions {
    const defaultOptions: ErrorHandlerOptions = {
      showToast: true,
      logToConsole: true,
      logToServer: false,
      redirectOnUnauthorized: true
    }

    switch (type) {
      case ErrorType.UNAUTHORIZED:
        return {
          ...defaultOptions,
          showToast: true,
          redirectOnUnauthorized: true,
          logToServer: true
        }
      case ErrorType.NETWORK:
        return {
          ...defaultOptions,
          showToast: true,
          retry: true
        }
      case ErrorType.VALIDATION:
        return {
          ...defaultOptions,
          showToast: false,
          logToConsole: true
        }
      default:
        return defaultOptions
    }
  }

  // 处理错误
  private async processError(error: AppError, options: ErrorHandlerOptions) {
    // 记录错误
    this.errorQueue.push(error)
    if (options.logToConsole) {
      console.error('[App Error]:', error)
    }

    // 显示提示
    if (options.showToast) {
      this.showErrorToast(error)
    }

    // 上报服务器
    if (options.logToServer) {
      await this.reportErrorToServer(error)
    }

    // 处理未授权
    if (error.type === ErrorType.UNAUTHORIZED && options.redirectOnUnauthorized) {
      await this.handleUnauthorized()
    }

    // 处理重试
    if (options.retry && error.type === ErrorType.NETWORK) {
      this.showRetryDialog(error)
    }
  }

  // 显示错误提示
  private showErrorToast(error: AppError) {
    // 使用 Element Plus 的 Message 组件
    ElMessage({
      type: 'error',
      message: error.message,
      duration: 3000,
      showClose: true
    })
  }

  // 处理未授权
  private async handleUnauthorized() {
    const userStore = useUserStore()
    // userStore.clearUserInfo()

    // 保存当前页面，登录后跳回
    const currentPath = router.currentRoute.value.fullPath
    if (currentPath !== '/login') {
      router.push({
        path: '/login',
        query: { redirect: currentPath }
      })
    }
  }

  // 显示重试对话框
  private showRetryDialog(error: AppError) {
    ElMessageBox.confirm(
      '网络连接失败，是否重试？',
      '提示',
      {
        confirmButtonText: '重试',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      // 重试逻辑
      this.retryRequest(error)
    }).catch(() => {
      console.log('用户取消重试')
    })
  }

  // 重试请求
  private async retryRequest(error: AppError) {
    // 实现请求重试逻辑
    if (error.url) {
      try {
        const response = await axios.get(error.url)
        return response
      } catch (retryError) {
        this.processError(this.normalizeError(retryError as AxiosError), {
          showToast: true,
          logToConsole: true
        })
      }
    }
  }

  // 上报错误到服务器
  private async reportErrorToServer(error: AppError) {
    try {
      await axios.post('/api/logs/error', {
        ...error,
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    } catch (e) {
      console.error('上报错误失败:', e)
    }
  }

  // 设置全局错误处理
  private setupGlobalHandlers() {
    // 处理未捕获的 Promise 错误
    window.addEventListener('unhandledrejection', (event) => {
      console.warn('未处理的 Promise 错误:', event.reason)
      this.processError({
        type: ErrorType.UNKNOWN,
        code: 'UNHANDLED_REJECTION',
        message: event.reason?.message || '未知错误',
        timestamp: Date.now(),
        stack: event.reason?.stack
      }, {
        showToast: true,
        logToConsole: true,
        logToServer: true
      })
    })

    // 处理运行时错误
    window.addEventListener('error', (event) => {
      console.warn('运行时错误:', event.error)
      this.processError({
        type: ErrorType.UNKNOWN,
        code: 'RUNTIME_ERROR',
        message: event.error?.message || '脚本错误',
        timestamp: Date.now(),
        stack: event.error?.stack
      }, {
        showToast: false, // 运行时错误通常不显示给用户
        logToConsole: true,
        logToServer: true
      })
    })
  }
}

export default ErrorHandler.getInstance()