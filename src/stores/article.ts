import { ref } from 'vue'
import { defineStore } from 'pinia'
import { articleApi } from '@/api/';
import mockArticle from '@/mock/mockArticle';
import type { Adjacent, PageResult } from '@/types/api';
import type { Article, Category } from '@/types/article'
import { defaultAdjacent, defaultPageResult } from '@/utils/cabinet';

export const useArticleStore = defineStore('article', () => {
  // 初始状态
  const pageData = ref<PageResult<Article>>(defaultPageResult<Article>())
  const articles = ref<Article[]>([] as Article[])
  const article = ref<Article>({} as Article)
  const relatedArticles = ref<Article[]>([] as Article[])
  const adjacentArticle = ref<Adjacent<Article>>(defaultAdjacent<Article>())

  /**
   * 获取分页博客数据
   * @param payload 
   */
  const fetchArticles = async (payload = { current: 1, size: 10 }) => {
    const current: number = payload.current
    const size: number = payload.size

    try {
      const data = await articleApi.getArticles({ current, size })

      if (data && data.data) {
        pageData.value = data.data
        articles.value = data.data.records
      } /*else {
        article.value = mockArticle.getArticles(1, 10)
      }*/
    } catch (error) {
      console.log(error)
      throw new Error('获取文章列表出错')
    }
  }

  /**
   * 根据 id 获取博客
   * @param payload 
   */
  const fetchArticleById = async (payload = { id: '' }) => {
    const id: string = payload.id
    try {
      const data = await articleApi.getArticleById(id)
      if (data && data.data) {
        article.value = data.data
      }
    } catch (error) {
      console.log(error)
      throw new Error('获取文章详情出错')
    }
  }

  const fetchRelatedArticles = async (payload = { id: '' }) => {
    const articleId: string = payload.id
    try {
      const data = await articleApi.getRelatedArticles(articleId)
      if (data && data.data) {
        relatedArticles.value = data.data
      }
    } catch (error) {
      console.log(error)
      throw new Error('获取相关文章出错')
    }
  }

  const fetchAdjacentArticles = async (payload = { id: '' }) => {
    const articleId: string = payload.id

    try {
      const data = await articleApi.getAdjacentArticles(articleId)
      if (data && data.data) {
        adjacentArticle.value = data.data
      }
    } catch (error) {
      console.log(error)
      throw new Error('获取相邻文章出错')
    }
  }

  return {
    pageData,
    articles,
    article,
    relatedArticles,
    adjacentArticle,

    fetchArticles,
    fetchArticleById,
    fetchRelatedArticles,
    fetchAdjacentArticles,
  }
});

export const useCategoriesStore = defineStore('category', () => {
  const categories: Category[] = []

  return {
    categories
  }
});