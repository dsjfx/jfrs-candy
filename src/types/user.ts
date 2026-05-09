export interface User {
  id: number
  username: string
  nickname: string
  avatar?: string
  createdAt: string
  email?: string
  bio?: string
  articlesCount?: number | 0
  followers?: number | 0
  isAdmin?: boolean
  isLoggedIn?: boolean
}


export interface UserInfo {
  id: number
  username: string
  email: string
  avatar: string
  roles: string[]
  permissions: string[]
}

export interface LoginParams {
  username: string
  password: string
  rememberMe?: boolean
}

export interface Author {
  id: number
  nickname: string
  avatar: string
  isAdmin?: boolean
}