import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Article, Category } from '@/types/article'
import {
  getAllCategories,
  getPopularCategories,
  searchCategories,
  getCategoryById,
  getCategoryBlogs,
} from '@/api/category'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([])
  const category = ref<Category | null>(null)
  const articles = ref<Article[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const reset = () => {
    categories.value = []
    category.value = null
    articles.value = []
    error.value = null
  }

  const fetchCategories = async (params: { current?: number; size?: number; sort?: string } = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await getAllCategories({
        current: 1,
        size: 10,
        sort: 'createAt',
        ...params,
      })
      categories.value = response.data || []
      return response.data
    } catch (err) {
      const message = err instanceof Error ? err.message : '获取分类列表失败'
      error.value = message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPopularCategories = async (limit = 5) => {
    loading.value = true
    error.value = null

    try {
      const response = await getPopularCategories(limit)
      categories.value = response.data || []
      return response.data
    } catch (err) {
      const message = err instanceof Error ? err.message : '获取热门分类失败'
      error.value = message
      throw err
    } finally {
      loading.value = false
    }
  }

  const searchCategory = async (keyword: string, params = { current: 1, size: 10 }) => {
    loading.value = true
    error.value = null

    try {
      const response = await searchCategories({ ...params, keyword })
      categories.value = response.data?.records || response.data || []
      return response.data
    } catch (err) {
      const message = err instanceof Error ? err.message : '搜索分类失败'
      error.value = message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchCategoryDetail = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const data = await getCategoryById(id)
      category.value = data
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : '获取分类详情失败'
      error.value = message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchCategoryArticles = async (
    id: number,
    page: { current?: number; size?: number; sort?: string } = {}
  ) => {
    loading.value = true
    error.value = null

    try {
      const response = await getCategoryBlogs(id, {
        current: 1,
        size: 10,
        sort: 'createAt',
        ...page,
      })
      articles.value = response.records || []
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : '获取分类文章失败'
      error.value = message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    category,
    articles,
    loading,
    error,
    reset,
    fetchCategories,
    fetchPopularCategories,
    searchCategory,
    fetchCategoryDetail,
    fetchCategoryArticles,
  }
})
