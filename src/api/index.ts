import {
  getAdjacentBlogs,
  getArchive,
  getArchiveMore,
  getBlogs,
  getBolgById,
  getRelatedBlogs,
  likeArticle,
  dislikeArticle,
} from './articles'
import { getSimpleUserinfo, getUser, getUserByEmail, login, refreshCaptcha, validateCaptcha } from './auth'
import {
  createComment,
  deleteComment,
  getComments,
  reportComment,
  likeComment,
  updateComment,
  blockUser,
  unblockUser,
  fetchBlockedUsers,
} from './comments'
import api from './request'

// 文章 API
export const articleApi = {
  getArticles: getBlogs,

  getArticleById: getBolgById,

  getRelatedArticles: getRelatedBlogs,

  getAdjacentArticles: getAdjacentBlogs,

  getArticleArchive: getArchive,

  getArticleArchiveMore: getArchiveMore,

  likeArticle: likeArticle,

  dislikeArticle: dislikeArticle,

  // createArticle(data: any) {
  //   return api.post('/articles', data)
  // },
  // updateArticle(id: string | number, data: any) {
  //   return api.put(`/articles/${id}`, data)
  // },
  // deleteArticle(id: string | number) {
  //   return api.delete(`/articles/${id}`)
  // },
}

// 分类相关API
export const categoryApi = {
  getCategories() {
    return api.get('/categories')
  },
}

// 标签相关API
export const tagApi = {
  getTags() {
    return api.get('/tags')
  },
}

// 用户相关 API
export const userApi = {
  getUserProfile: getUser,

  login: login,

  getSimpleUser: getSimpleUserinfo,

  validateCaptcha: validateCaptcha,

  refreshCaptcha: refreshCaptcha,

  getUserByEmail: getUserByEmail,

}

// 评论相关 API
export const commentApi = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  reportComment,
  blockUser,
  unblockUser,
  fetchBlockedUsers,
}