import type { User } from './user'

// 文章
export interface Article {
  // 主要属性
  id: number
  title: string
  content: string
  summary: string
  coverImage?: string
  status: 'draft' | 'published' | 'archived'

  // 操作属性
  views?: number | 0
  likes?: number | 0
  comments?: number | 0

  // 关联属性
  category: Category | null
  tags?: Tag[]
  author: User | null

  // 次要属性
  createdAt: string
  updatedAt: string
  // slug: string


  // isPublished: boolean
  // isLiked?: boolean
  // isBookmarked?: boolean
  // description?: string,
  // readTime?: number | 0
  // featuredImage?: string | ''
  imageCaption?: string | '',
  // enableReward?: boolean | false
}

// 文章封装
export interface ArticleCardProps {
  // 必需参数
  article: Article

  // 可选参数
  showCategory?: boolean
  showComments?: boolean
  showTime?: boolean
  showTags?: boolean
  maxTags?: number
  maxLength?: number
  customClass?: string
  isFeatured?: boolean

  // 对象参数
  categoryColors?: Record<string, string>
}

// 文章详情页面元素属性
export interface ArticleDetailProps {
  showBreadcrumb?: boolean
  showAuthor?: boolean
  showTime?: boolean
  showView?: boolean
  showComments?: boolean
  showCategory?: boolean
  showTag?: boolean
  showAction?: boolean
  showLike?: boolean
  showShare?: boolean
  showCollect?: boolean
  showFooter?: boolean
  showCopyright?: boolean
  showNavigate?: boolean
  showReward?: boolean
  showRelated?: boolean
  showCatalog?: boolean
  showComment?: boolean

  // 对象参数
  categoryColors?: Record<string, string>
}

// 分类
export interface Category {
  id: number
  name: string
  slug?: string
  color?: string
  description?: string
  articleCount: number | 0
}

// 标签
export interface Tag {
  id: number
  name: string
  slug?: string
  articleCount: number | 0
}
