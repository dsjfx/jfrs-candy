// 评论状态
export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface Comment {
  id: string
  content: string
  likes: number | 0
  status: CommentStatus
  userId?: string
  parentId?: string
  replyToId?: string
  // userId: string
  blogId: string | number
  user: CommentUser
  // blog: Article
  createdAt: string
  updatedAt?: string

  // 附加属性
  isLiked?: boolean
  isEdited?: boolean
  replies?: Comment[]
  canEdit?: boolean
  canDelete?: boolean
  isReported?: boolean
}

// Type of comment user
export interface CommentUser {
  id?: string | number
  name: string
  email: string
  website?: string
  avatar?: string
  // isAdmin?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CommentParams {
  current?: number
  size?: number
  sort?: 'newest' | 'oldest' | 'popular'
  reset?: boolean
  parentId?: string
  status?: CommentStatus
  viewerId?: string
  viewerEmail?: string
}

export interface CommentForm {
  content: string
  user: CommentUser
  parentId?: string
  replyToId?: string
  status?: string
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


// CommentItemProps defines the properties for a comment item component. 
// It includes the article ID, the comment object, and optional flags 
// for reply status, highlighting, action visibility, and edit/delete 
// permissions.
export interface CommentItemProps {
  articleId: string | number
  comment: Comment
  isReply?: boolean
  highlight?: boolean
  showMoreActions?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

/**
 * 举报评论 reporting a comment
 * ReportParams defines the parameters for reporting a comment.
 */
export interface ReportParams {
  commentId: string
  reason: ReportReason
  description?: string
}

/**
 * 举报理由 report reasons
 * ReportReason defines the possible reasons for reporting a comment.
 */
export type ReportReason =
  | 'spam'          // 垃圾广告
  | 'abuse'         // 辱骂攻击
  | 'porn'          // 色情内容
  | 'violence'      // 暴力内容
  | 'politics'      // 政治敏感
  | 'other'         // 其他