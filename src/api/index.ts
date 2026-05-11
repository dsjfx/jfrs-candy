import { getAdjacentBlogs, getArchive, getArchiveMore, getBlogs, getBolgById, getRelatedBlogs } from './articles'
import { getComments } from './comments'
import api from './request'

// 文章 API
export const articleApi = {
  getArticles: getBlogs,

  getArticleById: getBolgById,

  getRelatedArticles: getRelatedBlogs,

  getAdjacentArticles: getAdjacentBlogs,

  getArticleArchive:  getArchive,

  getArticleArchiveMore: getArchiveMore,

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
  getProfile() {
    return api.get('/user/profile')
  },
  login(data: { username: string; password: string }) {
    return api.post('/auth/login', data)
  },
}

// 评论相关 API
export const commentApi = {
  getComments,
}