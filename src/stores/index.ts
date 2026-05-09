import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Article, Category, Tag, User } from '@/types'
import Articles from '@/views/article/Articles.vue'

export const useBlogStore = defineStore('blog', () => {
  // 状态
  const user = ref<User | null>(null)
  const articles = ref<Article[]>([])
  const categories = ref<Category[]>([])
  const tags = ref<Tag[]>([])
  const loading = ref(false)

  // 计算属性
  const recentArticles = computed(() =>
    [...articles.value]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  )

  const categoryMap = computed(() =>
    new Map(categories.value.map(cat => [cat.id, cat]))
  )

  // 方法
  const fetchArticles = async () => {
    loading.value = true
    try {
      // 这里会调用API
      articles.value = [
        {
          id: 1,
          title: '秋日读书笔记：山月记中的自我追寻',
          slug: '',
          summary: '',
          content: '读《山月记》最触动我的是那句"我深怕自己本非美玉，故而不敢加以刻苦琢磨..."，这句话道出了多少人在自我认知与价值实现之间的挣扎...',
          coverImage: '',
          isPublished: false,
          viewCount: 1,
          likeCount: 1,
          commentCount: 1,
          createdAt: '2025-10-22',
          updatedAt: '',
          author: null,
          category: {
            id: 1,
            name: '生活哲学',

          },
          tags: []
        },
        {
          id: 2,
          title: '苏州园林漫步：留园与拙政园的比较观察',
          slug: '',
          summary: '',
          content: '留园的精致与拙政园的疏朗形成鲜明对比。前者如工笔画，每一处都经过精心设计；后者如写意山水，更注重空间的开合与意境的营造...',
          coverImage: '',
          isPublished: false,
          viewCount: 1,
          likeCount: 1,
          commentCount: 1,
          createdAt: '2025-10-18',
          updatedAt: '',
          author: null,
          category: {
            id: 2,
            name: '技术'
          },
          tags: []
        },
        {
          id: 3,
          title: '晨间日记的实践：如何通过写作整理思绪',
          slug: '',
          summary: '',
          content: '坚持写晨间日记三个月，最大的收获不是记录了多少内容，而是培养了一种与自我对话的习惯。每天清晨的15分钟，成为一天中最重要的整理时刻...',
          coverImage: '',
          isPublished: false,
          viewCount: 1,
          likeCount: 1,
          commentCount: 1,
          createdAt: '2025-10-12',
          updatedAt: '',
          author: null,
          category: {
            id: 3,
            name: '写作'
          },
          tags: []
        }
      ]
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async () => {
    // 获取分类
  }

  const fetchTags = async () => {
    // 获取标签
  }

  return {
    user,
    articles,
    categories,
    tags,
    loading,
    recentArticles,
    categoryMap,
    fetchArticles,
    fetchCategories,
    fetchTags,
  }
})

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)

  const toggleTheme = () => {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  return {
    isDark,
    toggleTheme,
  }
})