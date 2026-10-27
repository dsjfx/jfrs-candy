import type { PageResult, ResponseData } from '@/types/api'
import http from './request'
import type {
  Comment,
  CommentForm,
  CommentStatus,
  CommentUser,
  ReportParams,
} from '@/types/comment'
import ResponseFactory from '@/utils/responseFactory'
import { accessUrl } from '@/utils/cabinet'

function makeUrl(url: string = '') {
  return accessUrl('CO', url)
}

/**
 * 获取评论列表
 * @param articleId 
 * @param current 
 * @param size 
 * @param sort 
 * @param status 
 * @returns 
 */
export const getComments = async (
  articleId: string | number,
  current: number = 1,
  size: number = 10,
  options: {
    viewerId?: string,
    viewerEmail?: string
  } = {},
  sort: 'newest' | 'oldest' | 'popular' = 'newest',
  status: CommentStatus = 'approved',
): Promise<ResponseData<PageResult<Comment>>> => {
  let result = ResponseFactory.page<Comment>()

  const response = await http.get(makeUrl(`/list`), {
    blogId: articleId,
    current,
    size,
    sort,
    status,
    viewerId: options.viewerId,
    viewerEmail: options.viewerEmail
  })

  if (response.data) {
    result = response.data as ResponseData<PageResult<Comment>>
  }

  return result
}

/**
 * 发表评论
 * @param articleId 
 * @param data 
 * @returns 
 */
export const createComment = async (
  articleId: string | number,
  data: CommentForm
): Promise<Comment> => {
  const response = await http.post(
    makeUrl(`/add/${articleId}`),
    {
      content: data.content,
      ...data.user,
      // parentId: data.parentId,
      replyToCommentId: data.replyToCommentId,
      status: 'approved',   //先发后审
    }
  )
  const res = response.data

  if (!res) {
    throw new Error('服务端无响应')
  }

  if (res.code !== 200) {
    throw new Error(res.message || '评论失败')
  }

  return res.data
}

/**
 * 更新评论
 * @param commentId 
 * @param data 
 * @returns 
 */
export const updateComment = async (
  commentId: string,
  data: Pick<CommentForm, 'content'>
): Promise<Comment> => {
  const response = await http.put(makeUrl(`/update/${commentId}`), data)
  const res = response.data

  if (!res) {
    throw new Error('服务端无响应')
  }

  if (res.code !== 200) {
    throw new Error(res.message || '更新失败')
  }

  if (!res.data) {
    throw new Error('服务端未返回评论数据')
  }

  return res.data
}

/**
 * 删除评论
 * @param commentId 
 * @param data 
 */
export const deleteComment = async (
  commentId: string, data: Record<string, string>
): Promise<void> => {
  await http.delete(makeUrl(`/delete/${commentId}`), data)
}

/**
 * 举报评论 
 * @param params 
 */
export const reportComment = async (
  params: ReportParams
): Promise<void> => {
  const response = await http.post(
    makeUrl(`/reports`),
    { commentId: params.commentId, reason: params.reason, description: params.description }
  )

  const res = response.data
  if (!res || res.code !== 200) {
    throw new Error(res?.message || '举报失败')
  }
}

/**
 * 屏蔽用户
 * @param userId 
 */
export const blockUser = async (
  blockerId: string,
  blockedId: string
): Promise<void> => {
  const response = await http.post(
    makeUrl(`/blocks/personal`),
    { blockerId, blockedId, reason: '个人屏蔽用户' }
  )

  const res = response.data
  if (!res || res.code !== 200) {
    throw new Error(res?.message || '个人屏蔽失败')
  }
}

/**
 * 屏蔽用户
 * @param userId 
 */
export const blockUser0 = async (
  email: string
): Promise<void> => {
  const response = await http.post(
    makeUrl(`/blocks`),
    { type: 'email', value: email, reason: '屏蔽用户' }
  )

  const res = response.data
  if (!res || res.code !== 200) {
    throw new Error(res?.message || '屏蔽失败')
  }
}

/**
 * 取消屏蔽
 * @param userId 
 */
export const unblockUser = async (
  blockId: string
): Promise<void> => {
  const response = await http.delete(makeUrl(`/blocks/${blockId}`))

  const res = response.data
  if (!res || res.code !== 200) {
    throw new Error(res?.message || '取消屏蔽失败')
  }
}

/**
 * 获取已屏蔽用户列表
 * @returns 
 */
export const fetchBlockedUsers = async (): Promise<string[]> => {
  const response = await http.get('/api/users/blocked')
  const res = response.data
  if (!res || res.code !== 200) {
    throw new Error(res?.message || '获取屏蔽列表失败')
  }
  return res.data
}

// 点赞/取消点赞评论
export const likeComment = async (
  commentId: string,
  userId: string | null,
  anonymousId: string | null,
): Promise<{ liked: boolean; likes: number }> => {
  const response = await http.post(makeUrl(`/likes/toggle`), {
    commentId: `${commentId}`,
    userId,
    anonymousId
  })

  const res = response.data
  if (!res || res.code !== 200) {
    throw new Error(res?.message || '点赞失败')
  }
  return res.data
}
