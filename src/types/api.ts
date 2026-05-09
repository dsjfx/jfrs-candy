/**
 * 默认返回数据格式
 */
export interface ResponseData<T = any> {
  code: number
  data: T
  message: string
  success: boolean
  timestamp?: number
}

/**
 * 默认请求参数类型
 */
export interface PageParams {
  current?: number
  size?: number
  sort?: string
}

/**
 * 默认返回的分页数据格式
 */
export interface PageResult<T = any> {
  records: T[]
  pagination: Pagination
}

// 分页结构
export interface Pagination {
  current: number
  size: number
  total: number
  pages?: number
  hasNext?: boolean
  hasPrev?: boolean
}

// 相邻数据结构
export interface Adjacent<T = any> {
  prev: T
  next: T
}
