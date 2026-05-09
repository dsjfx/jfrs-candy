import type { PageResult, ResponseData } from '@/types/api'
import http from './request'
import type { Comment, CommentParams, CommentResponse } from '@/types/comment'
import ResponseFactory from '@/utils/responseFactory'
import { accessUrl } from '@/utils/cabinet'

function makeUrl(url: string = '') {
  return accessUrl('C', url)
}

// 获取评论列表
export const getComments = async (
  articleId: string,
  current: number = 1,
  size: number = 10,
  sort: 'newest' | 'oldest' | 'popular' = 'newest'
): Promise<ResponseData<PageResult<Comment>>> => {
  let result = ResponseFactory.page<Comment>()

  const response = await http.get(makeUrl(`/list`), {
    blogId: articleId, current, size, sort
  })

  if (response.data) {
    result = response.data as ResponseData<PageResult<Comment>>
  }

  return result
}

// 发表评论
export const createComment = async (
  articleId: string,
  content: string,
  parentId?: string
): Promise<Comment> => {
  const response = await http.post(`/api/articles/${articleId}/comments`, {
    content,
    parentId
  })
  return response.data
}

// 更新评论
export const updateComment = async (
  commentId: string,
  content: string
): Promise<Comment> => {
  const response = await http.put(`/api/comments/${commentId}`, { content })
  return response.data
}

// 删除评论
export const deleteComment = async (commentId: string): Promise<void> => {
  await http.delete(`/api/comments/${commentId}`)
}

// 点赞/取消点赞评论
export const toggleLikeComment = async (commentId: string): Promise<void> => {
  await http.post(`/api/comments/${commentId}/like`)
}

// 举报评论
export const reportComment = async (
  commentId: string,
  reason: string
): Promise<void> => {
  await http.post(`/api/comments/${commentId}/report`, { reason })
}