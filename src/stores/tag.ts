import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Article, Tag } from '@/types/article'
import {
  fetchAllTags as apiFetchAllTags,
  fetchPopularTags as apiFetchPopularTags,
  searchTags as apiSearchTags,
  fetchTagById as apiFetchTagById,
  fetchTagBlogs as apiFetchTagBlogs,
} from '@/api/tag'

export const useTagStore = defineStore('tag', () => {
  const tags = ref<Tag[]>([])
  const tag = ref<Tag | null>(null)
  const articles = ref<Article[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const reset = () => {
    tags.value = []
    tag.value = null
    articles.value = []
    error.value = null
  }

  const fetchTags = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await apiFetchAllTags()
      tags.value = response.data || []
      return response.data
    } catch (err) {
      const message = err instanceof Error ? err.message : '获取标签列表失败'
      error.value = message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPopularTags = async (limit = 5) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiFetchPopularTags(limit)
      tags.value = response.data || []
      return response.data
    } catch (err) {
      const message = err instanceof Error ? err.message : '获取热门标签失败'
      error.value = message
      throw err
    } finally {
      loading.value = false
    }
  }

  const searchTag = async (keyword: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiSearchTags(keyword)
      tags.value = response.data || []
      return response.data
    } catch (err) {
      const message = err instanceof Error ? err.message : '搜索标签失败'
      error.value = message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchTagDetail = async (id: number | string) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiFetchTagById(id)
      tag.value = response.data
      return response.data
    } catch (err) {
      const message = err instanceof Error ? err.message : '获取标签详情失败'
      error.value = message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchTagArticles = async (
    id: number | string,
    page: { current: number; size: number } = {
      current: 1,
      size: 10
    }
  ) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiFetchTagBlogs(id,
        {
          ...page,
        }
      )
      articles.value = response.data?.records || response.data || []
      return response.data || response
    } catch (err) {
      const message = err instanceof Error ? err.message : '获取标签文章失败'
      error.value = message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    tags,
    tag,
    articles,
    loading,
    error,
    reset,
    fetchTags,
    fetchPopularTags,
    searchTag,
    fetchTagDetail,
    fetchTagArticles,
  }
})
