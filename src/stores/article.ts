import { ref } from 'vue'
import { defineStore } from 'pinia'
import { articleApi } from '@/api/';
import mockArticle from '@/mock/mockArticle';
import type { Adjacent, PageResult } from '@/types/api';
import type { ArchiveYear, Article, Category } from '@/types/article'
import { defaultAdjacent, defaultPageResult } from '@/utils/cabinet';

export const useArticleStore = defineStore('article', () => {
  // 初始状态
  const pageData = ref<PageResult<Article>>(defaultPageResult<Article>())
  const articles = ref<Article[]>([] as Article[])
  const article = ref<Article>({} as Article)
  const relatedArticles = ref<Article[]>([] as Article[])
  const adjacentArticle = ref<Adjacent<Article>>(defaultAdjacent<Article>())

  // Archive related state
  const archiveYears = ref([] as ArchiveYear[])
  const archiveLoading = ref(false)
  const archiveNoMore = ref(false)

  const fetchArchive = async (opts = { year: undefined as number | undefined, month: undefined as number | undefined, limit: 3 }) => {
    // reset no-more flag on initial fetch so lazy-loading can proceed after reloads
    archiveNoMore.value = false
    archiveLoading.value = true
    try {
      const data = await articleApi.getArticleArchive(opts)
      if (data && data.data) {
        // ensure years sorted desc
        archiveYears.value = (data.data.years || []).sort((a: any, b: any) => b.year - a.year)
      }
    } catch (err) {
      console.error('fetchArchive error', err)
      throw new Error('获取归档失败')
    } finally {
      archiveLoading.value = false
    }
  }

  /**
   * Reset archive related state.
   * @param options.clearYears - whether to clear the currently loaded years array (default false)
   */
  const resetArchiveState = (options: { clearYears?: boolean } = {}) => {
    archiveNoMore.value = false
    archiveLoading.value = false
    if (options.clearYears) {
      archiveYears.value = []
    }
  }

  const loadMoreArchiveYears = async ({ startYear, limit = 2 }: { startYear?: number; limit?: number } = {}) => {
    if (archiveLoading.value || archiveNoMore.value) return
    archiveLoading.value = true
    try {
      const data = await articleApi.getArticleArchiveMore({ startYear, limit })
      if (data && data.data && data.data.years && data.data.years.length) {
        const returned = (data.data.years || []).sort((a: any, b: any) => b.year - a.year)
        // dedupe by year to avoid duplicates when backend returns overlapping ranges
        const existing = new Set(archiveYears.value.map((y: any) => y.year))
        const toAdd = returned.filter((y: any) => !existing.has(y.year))
        if (toAdd.length) {
          archiveYears.value = archiveYears.value.concat(toAdd)
        }
      } else {
        archiveNoMore.value = true
      }
    } catch (err) {
      console.error('loadMoreArchiveYears error', err)
      throw new Error('加载更多归档失败')
    } finally {
      archiveLoading.value = false
    }
  }

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

    try {
      const params: any = { current, size }
      if (search) params.search = search
      if (status) params.status = status

      const data = await articleApi.getArticles(params)

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

  // Like / dislike actions (simple local update or API call if available)
  const likeArticle = async (payload: { id: number }) => {
    try {
      // try calling API if available
      if (articleApi && typeof articleApi.likeArticle === 'function') {
        await articleApi.likeArticle(payload)
      }
    } catch (err) {
      console.warn('likeArticle api failed or not implemented', err)
    }

    // optimistic local update if the current article matches
    if (article.value && (article.value as any).id === payload.id) {
      ; (article.value as any).likes = ((article.value as any).likes || 0) + 1
    }
  }

  const dislikeArticle = async (payload: { id: number }) => {
    try {
      if (articleApi && typeof articleApi.dislikeArticle === 'function') {
        await articleApi.dislikeArticle(payload)
      }
    } catch (err) {
      console.warn('dislikeArticle api failed or not implemented', err)
    }

    if (article.value && (article.value as any).id === payload.id) {
      ; (article.value as any).dislikes = ((article.value as any).dislikes || 0) + 1
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
    likeArticle,
    dislikeArticle,

    archiveYears,
    archiveLoading,
    archiveNoMore,
    fetchArchive,
    loadMoreArchiveYears,
    resetArchiveState,
  }
});

export const useCategoriesStore = defineStore('category', () => {
  const categories: Category[] = []

  return {
    categories
  }
});