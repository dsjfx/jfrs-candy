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
import { getSimpleUserinfo, getUser, login } from './auth'
import { getComments } from './comments'
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

// 用户相关API
export const userApi = {
  getUserProfile: getUser,

  login: login,

  getSimpleUser: getSimpleUserinfo,

}

// 评论相关 API
export const commentApi = {
  getComments,
}