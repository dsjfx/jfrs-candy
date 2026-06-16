import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { AppError } from '@/types/error'
import type { ResponseData } from '@/types/api'
// import { useUserStore } from '@/stores/user'

interface RequestConfig extends AxiosRequestConfig {
  showLoading?: boolean
  showError?: boolean
}

class Request {
  instance: AxiosInstance

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config)

    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // const userStore = useUserStore()
        // if (userStore.token) {
        //   config.headers.Authorization = `Bearer ${userStore.token}`
        // }
        const token = localStorage.getItem('token')

        // 判断是否需要 token
        // const needAuth = !isPublicEndpoint(config.url || '')

        if (/*needAuth &&*/ token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // 添加默认参数
        config.params = {
          ...config.params,
          timestamp: Date.now(), // 时间戳防缓存
          version: import.meta.env.VITE_APP_VERSION,        // API版本
          subject: import.meta.env.VITE_APP_SUBJECT,       // 平台标识
        };

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      // 错误处理已经在拦截器中统一处理，这里返回数据即可
      (response: AxiosResponse<ResponseData>) => {
        // const { data } = response
        // // 根据后端接口规范调整
        // if (data.code === 200) {
        //   return data.data
        // } else {
        //   this.handleError(data.code, data.message)
        //   return Promise.reject(new Error(data.message || 'Error'))
        // }
        return response
      },
      (error) => {
        // this.handleHttpError(error)
        // 错误已经被 errorHandler 处理，这里只需要将错误继续抛出
        return Promise.reject(error)
      }
    )
  }

  request<T = any>(config: RequestConfig): Promise<T> {
    return this.instance.request(config)
  }

  get0<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request({ ...config, method: 'GET', url })
  }

  post0<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request({ ...config, method: 'POST', url, data })
  }

  put0<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request({ ...config, method: 'PUT', url, data })
  }

  delete0<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request({ ...config, method: 'DELETE', url })
  }

  async get<T = ResponseData>(
    url: string,
    params?: any,
    options?: {
      ignoreError?: boolean  // 是否忽略全局错误处理
      customErrorHandler?: (error: AppError) => void
    }
  ): Promise<T> {
    try {
      const response = await this.instance.get<T>(url, { params })
      return response as T
    } catch (error) {
      if (options?.customErrorHandler) {
        options.customErrorHandler(error as AppError)
      }
      if (!options?.ignoreError) {
        // 错误已经被全局处理，这里不再重复处理
        throw error
      }
      return null as T
    }
  }

  async post<T = any>(
    url: string,
    data?: any,
    options?: {
      ignoreError?: boolean
      customErrorHandler?: (error: AppError) => void
    }
  ): Promise<T> {
    try {
      const response = await this.instance.post<T>(url, data)
      return response as T
    } catch (error) {
      if (options?.customErrorHandler) {
        options.customErrorHandler(error as AppError)
      }
      if (!options?.ignoreError) {
        throw error
      }
      return null as T
    }
  }

  async put<T = any>(
    url: string,
    data?: any,
    options?: {
      ignoreError?: boolean
      customErrorHandler?: (error: AppError) => void
    }
  ): Promise<T> {
    try {
      const response = await this.instance.put<T>(url, data)
      return response as T
    } catch (error) {
      if (options?.customErrorHandler) {
        options.customErrorHandler(error as AppError)
      }
      if (!options?.ignoreError) {
        throw error
      }
      return null as T
    }
  }

  async delete<T = any>(
    url: string,
    params?: any,
    options?: {
      ignoreError?: boolean
      customErrorHandler?: (error: AppError) => void
    }
  ): Promise<T> {
    try {
      const response = await this.instance.delete<T>(url, { params })
      return response as T
    } catch (error) {
      if (options?.customErrorHandler) {
        options.customErrorHandler(error as AppError)
      }
      if (!options?.ignoreError) {
        throw error
      }
      return null as T
    }
  }
}

// 判断是否是公开接口
function isPublicEndpoint(url: string): boolean {
  const publicEndpoints = [
    '/api/posts',
    '/api/comments',
    '/auth/login',
    '/auth/register'
  ]

  return publicEndpoints.some(endpoint => url.startsWith(endpoint))
}

export const http = new Request({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default http