<template>
  <div class="article-container">
    <!-- 文章头 -->
    <div class="articles-header">
      <h1>{{ articleTitle }}</h1>
      <!-- 搜索 -->
      <div class="articles-bar">
        <input v-model="searchQuery" type="text" placeholder="搜索文章..." @input="handleSearch" />
        <FaIcon :icon="faSearch" />
      </div>
    </div>

    <div v-if="isLoading" class="loading-container">
      <!-- 骨架屏加载效果 -->
      <!-- <div class="skeleton-container">
        <ArticleSkeleton v-for="i in skeletonCount" :key="i" />
      </div> -->

      <!-- 使用旋转加载器 -->
      <div class="spinner-overlay">
        <LoadingSpinner />
        <p class="loading-text">{{ loadingText }}</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="hasError" class="error-container">
      <ErrorDisplay :error="error" @retry="fetchArticles" />
    </div>

    <!-- 空状态 -->
    <div v-else-if="isEmpty" class="empty-container">
      <EmptyState @refresh="fetchArticles" />
    </div>

    <!-- 文章列表 -->
    <div v-else class="articles-list">
      <!-- 文章项 -->
      <ArticleCard v-for="article in articles" :key="article.id" :article="article" :show-time="true" :max-tags="2"
        @tag-click="handleTagClick" @read-more="handleReadMore" @click="handleArticleClick" />

      <!-- 加载更多按钮 -->
      <!-- <div v-if="hasMore" class="load-more-container">
        <button class="load-more-btn" :disabled="isLoadingMore" @click="loadMore">
          <span v-if="!isLoadingMore">加载更多</span>
          <LoadingSpinner v-else size="small" />
        </button>
      </div> -->
    </div>

    <!-- 分页控件 -->
    <Paging v-if="!isLoading && !isEmpty" :current="current" :page-size="pageSize" :total="pageData.pagination.total"
      :showIcons="true" :showText="true" :showPageSize="false" :showInfo="false" :showJump="false"
      :pageSizeOptions="[5, 10, 20, 50]" @page-change="handlePageChange" @page-size-change="handlePageSizeChange" />

    <!-- 底部信息 -->
    <footer class="blog-footer">
      <!-- ... 底部内容 ... -->
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import ArticleCard from '@/components/articles/ArticleCard.vue'
import ErrorDisplay from '@/components/core/ErrorDisplay.vue'
import EmptyState from '@/components/core/EmptyState.vue'
import ArticleSkeleton from '@/components/core/ArticleSkeleton.vue'
import LoadingSpinner from '@/components/core/LoadingSpinner.vue'
import Paging from '../../components/page/Paging.vue'
import type { Article } from '@/types/article'
import { useArticleStore } from '@/stores/article'
import useLoading from '@/composables/useLoading'
import cabinet from '@/utils/cabinet'

const router = useRouter()
const articleStore = useArticleStore()
const {
  isLoading,
  isLoadingMore,
  isLoadingPage,
  hasError,
  error,
  startLoading,
  stopLoading
} = useLoading()

const articleTitle = import.meta.env.VITE_APP_ARTICLE_TITLE

// 响应式数据

const current = ref(cabinet.CONS_CURRENT)
const pageSize = ref(cabinet.CONS_PAGESIZE)
const searchQuery = ref('')

// 骨架屏数量
const skeletonCount = ref(1)

// 是否显示旋转加载器（骨架屏加载2秒后显示）
const showSpinner = ref(true)
let spinnerTimer: number | null = null

// 分类数据
// const categories = ref([
//   { name: '日记', count: 12 },
//   { name: '生活', count: 8 },
//   { name: '旅行', count: 6 },
//   { name: '书评', count: 5 },
//   { name: '随笔', count: 7 }
// ])

// 最近文章
// const recentPosts = ref([
//   { id: 1, title: '武汉新天地周末随记', date: '2026-01-20' },
//   { id: 2, title: 'AI速记引发的隐私困惑', date: '2026-01-09' },
//   { id: 3, title: '2025年最后一天', date: '2025-12-31' },
//   { id: 4, title: '35岁生日在横店', date: '2025-12-13' },
//   { id: 5, title: '苏州园林漫步', date: '2025-11-30' }
// ])

// 标签云
// const tagCloud = ref([
//   { name: '生活', size: 16 },
//   { name: '读书', size: 14 },
//   { name: '旅行', size: 18 },
//   { name: '家庭', size: 15 },
//   { name: '工作', size: 12 },
//   { name: '科技', size: 13 },
//   { name: '写作', size: 14 },
//   { name: '感悟', size: 12 }
// ])

// 计算属性

// const article = computed(() => articleStore.article)
// const isLoading = computed(() => articleStore.isLoading)

const pageData = computed(() => articleStore.pageData)
const articles = computed(() => articleStore.articles)
// const totalArticles = computed(() => articles.value?.length)
// const totalComments = computed(() => articles.value.reduce((sum, article) => sum + (article.comments || 0), 0))

const isEmpty = computed(() => {
  return !isLoading.value && articles.value.length === 0
})

const hasMore = computed(() => {
  return articles.value.length > current.value * pageSize.value
})

const totalPages = computed(() => {
  return Math.ceil((pageData.value?.pagination?.total ?? 0) / pageSize.value)
})

const loadingText = computed(() => {
  if (isLoadingPage.value) return '正在加载页面...'
  if (isLoadingMore.value) return '正在加载更多...'
  return '正在加载文章...'
})

// 
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    '日记': '#059669',
    '生活': '#10B981',
    '旅行': '#3B82F6',
    '书评': '#8B5CF6',
    '随笔': '#F59E0B'
  }
  return colors[category] || '#059669'
}

const fetchArticles = async () => {
  startLoading()

  await cabinet.delay(2000)
  // 设置延迟显示旋转加载器
  // spinnerTimer = window.setTimeout(() => {
  //   showSpinner.value = true
  // }, 2000)

  try {
    await articleStore.fetchArticles({
      current: current.value,
      size: pageSize.value
    })
  } catch (err) {
    console.error('加载文章失败:', err)
    // error.value = err instanceof Error ? err.message : '加载失败'
    // hasError.value = true
  } finally {
    stopLoading()
    // showSpinner.value = false
    // if (spinnerTimer) {
    //   clearTimeout(spinnerTimer)
    // }
  }
}

const handleSearch = () => {
  // current.value = 1
  // distributePhotos()
}

const handleTagClick = (tag: string) => {
  console.log('点击标签:', tag)
  // 跳转到标签页
}

const handleReadMore = (article: Article) => {
  console.log('阅读更多:', article.title)
  // 跳转到文章详情页
  // router.push(`/article/${article.id}`)
}

const handleArticleClick = (article: Article) => {
  router.push({ name: 'ArticleDetail', params: { id: article.id } })
}

// const loadMore = async () => {
//   isLoadingMore.value = true
//   try {
//     await articleStore.loadMoreArticles()
//     currentPage.value++
//   } catch (err) {
//     console.error('加载更多失败:', err)
//   } finally {
//     isLoadingMore.value = false
//   }
// }

const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== current.value) {
    current.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  current.value = 1
}

// 生命周期
onMounted(async () => {
  await fetchArticles()
})

</script>

<style lang="scss" scoped>
$breakpoint-mobile: 768px;

// 主要内容区域
.article-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  flex: 1;

  @media (max-width: $breakpoint-mobile) {
    padding: 10px;
  }
}

// 文章列表样式
.articles-header {
  position: relative;
  margin-bottom: 50px;
  padding-top: 10px;
  text-align: center;

  h1 {
    margin-bottom: 20px;
    color: #333;
    font-size: 2.5rem;
    font-weight: 300;

    @media (max-width: $breakpoint-mobile) {
      font-size: 1.3rem;
      font-weight: 500;
    }
  }

  .articles-bar {
    position: relative;
    max-width: 500px;
    margin: 0 auto;

    @media (max-width: $breakpoint-mobile) {
      max-width: 400px;
    }

    input {
      width: 100%;
      padding: 0.8rem 1rem 0.8rem 2.5rem;
      font-size: 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 25px;
      outline: none;
      transition: border-color 0.3s ease;

      @media (max-width: $breakpoint-mobile) {
        padding: 0.5rem 1rem 0.5rem 2.0rem;
        font-size: 0.8rem;
        border: 1px solid #e0e0e0;
        border-radius: 10px;
      }

      &:hover {
        border-color: $base-color-j1;
        opacity: 0.4;
      }

      & input:focus {
        border-color: $base-color-j1;
      }

      &::placeholder {
        color: #aaa;
      }
    }

    svg {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      cursor: pointer;

      @media (max-width: $breakpoint-mobile) {
        width: 12px;
      }
    }
  }

  // &::before {
  //   content: '';
  //   position: absolute;
  //   left: 0;
  //   top: 10px;
  //   width: 100px;
  //   height: 5px;
  //   background: linear-gradient(90deg, $base-color-j9, $base-color-j10);
  // }  
}

.loading-container {
  position: relative;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .skeleton-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  .spinner-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    animation: fadeIn 0.3s ease;

    .loading-text {
      margin-top: 16px;
      color: #666;
      font-size: 14px;
      animation: pulse 1.5s infinite;
    }
  }
}

.error-container,
.empty-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.articles-list {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.load-more-container {
  margin-top: 40px;
  text-align: center;
  padding: 20px;
}

.load-more-btn {
  padding: 12px 32px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  min-height: 48px;

  &:hover:not(:disabled) {
    background: #047857;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.blog-footer {
  display: none;
}

// 响应式设计
@media (max-width: 768px) {
  .article-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .blog-header {
    padding: 1.5rem 0;

    .blog-title {
      font-size: 2rem;
    }

    .nav-menu {
      gap: 1rem;
    }
  }

}

// @media (max-width: 480px) {
//   .nav-menu {
//     flex-direction: column;
//     gap: 0.5rem;
//   }

//   .article-meta {
//     flex-direction: column;
//     align-items: flex-start;
//     gap: 0.5rem;
//   }
// }</style>