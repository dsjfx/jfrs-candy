import type { Author } from "./user"
import type { Article } from "./article"

export interface Comment {
  id: string
  content: string
  likes: number | 0
  status: string
  parentId?: string
  userId: string
  blogId: string
  user: Author
  blog: Article
  createdAt: string
  updatedAt?: string

  // 附加属性
  isLiked?: boolean
  isEdited?: boolean
  replies?: Comment[]
  canEdit?: boolean
  canDelete?: boolean
}

export interface CommentParams {
  articleId: string
  page?: number
  pageSize?: number
  sort?: 'newest' | 'oldest' | 'popular'
  parentId?: string
}

export interface CommentResponse {
  comments: Comment[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface CommoentFormProps {
  articleId: string
  isEdit?: boolean
  initialContent?: string
  replyTo?: Comment
  placeholder?: string
  autoFocus?: boolean
  maxLength?: number
}

export interface CommentItemProps {
  comment: Comment
  articleId: string
  isReply?: boolean
  highlight?: boolean
  showMoreActions?: boolean
}