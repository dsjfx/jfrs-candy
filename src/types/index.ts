import type { User } from './user'
import type { Category, Tag, Article } from './article'

// export interface Pagination<T> {
//   data: T[]
//   total: number
//   page: number
//   pageSize: number
//   totalPages: number
// }

// export interface ApiResponse<T = any> {
//   code: number
//   message: string
//   data: T
// }

export interface NavItem<T = any> {
  path: string
  name: string
  exact?: boolean
  matchPaths?: [string]
  icon: T
}

export type { User, Category, Tag, Article }