import { ref } from 'vue'
import { defineStore } from 'pinia'
import { articleApi } from '@/api/';
import mockArticle from '@/mock/mockArticle';
import type { Adjacent, PageParams, PageResult } from '@/types/api';
import type { Article, Category, ArchiveYear } from '@/types'
import { useUserStore } from '@/stores/user'
import { defaultAdjacent, defaultPageResult } from '@/utils/cabinet';
import { BLOG_LIKED_KEY } from '@/utils/constant';

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
  const fetchArticles = async (payload:
    {
      current?: number;
      size?: number;
      search?: string;
      status?: string;
      categoryId?: string | number;
      tagId?: string | number;
    } =
    {
      current: 1,
      size: 10,
      status: 'published',
    }
  ) => {
    const current: number = payload.current ?? 1
    const size: number = payload.size ?? 10
    const search: string | undefined = payload.search
    const status: string | undefined = payload.status || 'published'
    const categoryId: string | number | undefined = payload.categoryId
    const tagId: string | number | undefined = payload.tagId

    try {
      const params: PageParams = { current, size }
      if (search) params.search = search
      if (status) params.status = status
      if (categoryId !== undefined && categoryId !== '') params.categoryId = categoryId
      if (tagId !== undefined && tagId !== '') params.tagId = tagId

      const userStore = useUserStore()
      const userData = userStore.acquireUserOrAnonyId(BLOG_LIKED_KEY)
      Object.assign(params, userData)

      const response = await articleApi.getArticles(params)

      if (response && response.data) {
        pageData.value = response.data
        articles.value = response.data.records
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
      const userStore = useUserStore()
      const userData = userStore.acquireUserOrAnonyId(BLOG_LIKED_KEY)

      const data = await articleApi.getArticleById(id, userData.userId, userData.anonymousId)
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