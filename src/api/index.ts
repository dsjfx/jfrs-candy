import {
  getAdjacentBlogs,
  getBlogs,
  getBolgById,
  getRelatedBlogs,
  reactionArticle,
} from './articles'
import {
  getSimpleUserinfo, getUser,
  getUserByEmail, login, refreshCaptcha,
  validateCaptcha
} from './auth'
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
import {
  getArchive,
  getArchiveMore
} from './archive'
import api from './request'

// 文章 API
export const articleApi = {
  getArticles: getBlogs,

  getArticleById: getBolgById,

  getRelatedArticles: getRelatedBlogs,

  getAdjacentArticles: getAdjacentBlogs,

  reactionArticle,

}

export const archiveApi = {

  getArticleArchive: getArchive,

  getArticleArchiveMore: getArchiveMore,
}

// 分类相关API
export const categoryApi = {
  getCategories() {
    return api.get('/archive/categories')
  },
}

// 标签相关API
export const tagApi = {
  getTags() {
    return api.get('/archive/tags')
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