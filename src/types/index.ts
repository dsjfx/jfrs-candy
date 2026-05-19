// export interface User {
//   id: number
//   username: string
//   email: string
//   avatar: string
//   bio: string
//   createdAt: string
// }
import type { User } from './user'

// export interface Category {
//   id: number
//   name: string
//   slug?: string
//   description?: string
//   articleCount?: number
// }

// export interface Tag {
//   id: number
//   name: string
//   slug: string
//   articleCount: number
// }

// export interface Article {
//   id: number
//   title: string
//   slug: string
//   summary: string
//   content: string
//   coverImage?: string
//   isPublished: boolean
//   viewCount: number
//   likeCount: number
//   commentCount: number
//   createdAt: string
//   updatedAt: string
//   author: User | null
//   category: Category | null
//   tags: Tag[]
// }
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