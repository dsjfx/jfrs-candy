export interface User {
  id: number
  username: string
  nickname: string
  avatar?: string
  createdAt?: string
  email?: string
  bio?: string
  articlesCount?: number | 0
  followers?: number | 0
  isAdmin?: boolean
  isLoggedIn?: boolean
  location?: string
  motto?: string
  job?: string
  hobbies?: string[]
  social?: SocialLinks
}


export interface UserInfo {
  id: number
  username: string
  nickname: string
  email: string
  avatar: string
  roles?: string[]
  permissions?: string[]
}

export interface LoginParams {
  username: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
  userInfo: UserInfo
}

export interface Author {
  id: number
  nickname: string
  avatar: string
  isAdmin?: boolean
}

export interface UserParam {
  id?: number
}

export interface SimpleUser {
  avatar?: string,
  icpLicense?: string,
  publicSecurityLicense?: string
}

export interface SocialLinks {
  github?: string
  githubQr?: string
  github_qr?: string

  weibo?: string
  weiboQr?: string
  weibo_qr?: string

  qq?: string
  qqQr?: string
  qq_qr?: string

  twitter?: string
  twitterQr?: string
  twitter_qr?: string

  wechat?: string
  wechatQr?: string
  wechat_qr?: string

  linkedin?: string
  email?: string
  homepage?: string
  [key: string]: string | undefined
}