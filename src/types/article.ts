import type { User } from './user'

// 文章
export interface Article {
  // 主要属性
  id: number
  title: string
  subtitle?: string
  content: string
  summary: string
  coverImage?: string
  status: 'draft' | 'published' | 'archived'

  // 操作属性
  views?: number | 0
  likeCount?: number | 0
  dislikeCount?: number | 0
  reaction: 1 | -1 | 0
  comments?: number | 0
  likes?: number[] | []
  dislikes?: number[] | []

  // 关联属性
  category: Category | null
  tags?: Tag[]
  author: User | null

  // 次要属性
  createdAt: string
  updatedAt: string
  publishedAt: string


  slug?: string
  // isPublished: boolean
  // isLiked?: boolean
  // isBookmarked?: boolean
  // description?: string,
  // readTime?: number | 0
  // featuredImage?: string | ''
  imageCaption?: string | '',
  // enableReward?: boolean | false
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
  color?: string
  articleCount: number | 0
  BlogTag?: {
    blogId: number
    tagId: number
  }
}

export interface ladyArticleParams {
  years?: number[]; // 指定要加载的年份
  startYear?: number; // 起始年份（不包含）
  endYear?: number; // 结束年份
  limit?: number; // 加载的年份数量
  status?: string; // 文章状态（如 published、draft 等）
}

export type actionType = 'like' | 'dislike' | 'none'

export interface ReactionResponse {
  reaction: 0 | 1 | -1;
  likeCount: number;
  dislikeCount: number;
  reactionType: actionType
}