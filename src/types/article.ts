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
  color?: string
  articleCount: number | 0
  BlogTag?: {
    blogId: number
    tagId: number
  }
}

// 归档
export interface ArchivePost {
  id: number;
  title: string;
  subtitle?: string;
  publishedAt: string;
  day: number;
  summary?: string;
  coverImage?: string;
}

export interface ArchiveMonth {
  month: number;
  monthName: string;
  count: number;
  posts: ArchivePost[];
  expanded?: boolean;
}

export interface ArchiveYear {
  year: number;
  count: number;
  months: ArchiveMonth[];
  expanded?: boolean;
}

export interface ArchiveStats {
  earliestYear: number;
  latestYear: number;
  yearsWithPosts: number[];
}

export interface ArchiveResponse {
  years: ArchiveYear[];
  totalPosts: number;
  totalYears: number;
  stats: ArchiveStats;
}

export interface ladyArticleParams {
  years?: number[]; // 指定要加载的年份
  startYear?: number; // 起始年份（不包含）
  endYear?: number; // 结束年份
  limit?: number; // 加载的年份数量
  status?: string; // 文章状态（如 published、draft 等）
}