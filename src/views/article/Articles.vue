<template>
  <div class="article-container">
    <!-- 文章头 -->
    <div class="articles-header">
      <h1>{{ articleTitle }}</h1>
      <!-- 搜索 -->
      <div class="articles-bar">
        <input ref="searchInputRef" v-model="searchQuery" type="text" placeholder="搜索文章..." @input="handleSearch" />
        <FaIcon :icon="faSearch" />
        <button v-if="searchQuery" class="clear-btn" type="button" @click="clearSearch" aria-label="清除搜索">×</button>
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
      <div class="articles-left"></div>

      <!-- 文章项 -->
      <div class="articles-center">
        <ArticleCard v-for="article in articles" :key="article.id" :article="article" :show-time="true" :max-tags="2"
          @tag-click="handleTagClick" @read-more="handleReadMore" @click="handleArticleClick" />
      </div>

      <div class="articles-right"></div>
    </div>

    <!-- 加载更多按钮 -->
    <!-- <div v-if="hasMore" class="load-more-container">
      <button class="load-more-btn" :disabled="isLoadingMore" @click="loadMore">
        <span v-if="!isLoadingMore">加载更多</span>
        <LoadingSpinner v-else size="small" />
      </button>
    </div> -->

    <!-- 搜索提示 + 分页控件 -->
    <div v-if="!isLoading && !isEmpty" class="pagination-row">
      <!-- 方式 A: 旧的 pill（保留为注释以便比较） -->
      <!--
      <div class="search-pill" v-if="searchQuery">
        当前搜索：<strong>{{ searchQuery }}</strong>
        <button class="pill-clear" @click="clearSearch">清除</button>
      </div>
      -->

      <!-- 方式 B: 可关闭的 Tag（推荐） -->
      <div v-if="searchQuery" class="search-tag">
        <span class="tag-label">搜索：</span>
        <button class="tag" @click="clearSearch">{{ searchQuery }} ×</button>
      </div>

      <Paging class="paging" :current="current" :page-size="pageSize" :total="pageData.pagination.total"
        :showIcons="true" :showText="true" :showPageSize="false" :showInfo="false" :showJump="false"
        :pageSizeOptions="[5, 10, 20, 50]" @page-change="handlePageChange" @page-size-change="handlePageSizeChange" />
    </div>

    <!-- 底部信息 -->
    <footer class="blog-footer">
      <!-- ... 底部内容 ... -->
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import ArticleCard from '@/components/articles/ArticleCard.vue'
import ErrorDisplay from '@/components/core/ErrorDisplay.vue'
import EmptyState from '@/components/core/EmptyState.vue'
import LoadingSpinner from '@/components/core/LoadingSpinner.vue'
import Paging from '../../components/page/Paging.vue'
import type { Article } from '@/types/article'
import { useArticleStore } from '@/stores/article'
import useLoading from '@/composables/useLoading'
import useDebouncedRef from '@/composables/useDebouncedRef'
import { DEFAULT_CURRENT, DEFAULT_PAGESIZE } from '@/utils/constant.ts'

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

const current = ref(DEFAULT_CURRENT)
const pageSize = ref(DEFAULT_PAGESIZE)
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

  // await cabinet.delay(2000)
  // 设置延迟显示旋转加载器
  spinnerTimer = window.setTimeout(() => {
    showSpinner.value = true
  }, 2000)

  try {
    await articleStore.fetchArticles({
      current: current.value,
      size: pageSize.value,
      search: searchQuery.value || undefined
    })
  } catch (err) {
    console.error('加载文章失败:', err)
    // error.value = err instanceof Error ? err.message : '加载失败'
    // hasError.value = true
  } finally {
    stopLoading()
    showSpinner.value = false
    if (spinnerTimer) {
      clearTimeout(spinnerTimer)
    }
  }
}

// use debounced ref for search input
const debouncedSearch = useDebouncedRef(searchQuery, 300)
const searchInputRef = ref<HTMLInputElement | null>(null)

// when debounced search changes, perform search
watch(debouncedSearch, async (val, oldVal) => {
  if (val !== oldVal) {
    current.value = 1
    await fetchArticles()
  }
})

const handleSearch = () => {
  // input is bound to searchQuery; debounced watcher will call fetchArticles
  current.value = 1
}

const handleTagClick = (tag: string) => {
  console.log('点击标签:', tag)
  // 跳转到标签页
}

const handleReadMore = (article: Article) => {
  console.log('阅读更多:', article.title)
  // 跳转到文章详情页
  router.push(`/articles/${article.id}`)
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

const handlePageChange = async (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== current.value) {
    current.value = page
    // fetch considering search
    try {
      await articleStore.fetchArticles({ current: page, size: pageSize.value, search: searchQuery.value })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('切换页失败', err)
    }
  }
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  current.value = 1
}

const clearSearch = () => {
  searchQuery.value = ''
  current.value = 1
  fetchArticles()
  // focus input after clearing
  if (searchInputRef.value) searchInputRef.value.focus()
}

// 生命周期
onMounted(async () => {
  await fetchArticles()
})

</script>

<style lang="scss" scoped>
$breakpoint-tablet: 1024px;
$breakpoint-mobile: 768px;

// 主要内容区域
.article-container {
  width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;

  @media (max-width: $breakpoint-tablet) {
    width: 100%;
    padding: 15px;
  }

  @media (max-width: $breakpoint-mobile) {
    width: 100%;
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
      border: 2px solid rgba(5, 150, 105, 0.12);
      /* normal subtle green */
      border-radius: 25px;
      outline: none;
      transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease;

      @media (max-width: $breakpoint-mobile) {
        padding: 0.5rem 1rem 0.5rem 2.0rem;
        font-size: 0.8rem;
        border: 1px solid #e0e0e0;
        border-radius: 10px;
      }

      &:hover {
        border-color: rgba(var(--accent-color-rgb, 5, 150, 105), 0.28);
        /* stronger green on hover */
      }

      &:focus {
        border-color: var(--accent-color);
        box-shadow: 0 6px 18px rgba(var(--accent-color-rgb, 5, 150, 105), 0.10);
        transform: translateY(-1px);
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
      color: #7f8c8d;
      /* default icon color */
      cursor: pointer;

      @media (max-width: $breakpoint-mobile) {
        width: 12px;
      }
    }

    /* clear button inside search input */
    .clear-btn,
    .clear-bt {
      position: absolute;
      right: 0.6rem;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      font-size: 1.1rem;
      color: #666;
      cursor: pointer;
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.12s ease, color 0.12s ease;
    }

    .clear-btn:hover,
    .clear-bt:hover {
      background: rgba(var(--accent-color-rgb, 5, 150, 105), 0.08);
      color: var(--accent-color);
    }

    /* icon color on hover/focus */
    &:hover svg,
    input:focus~svg {
      color: var(--accent-color);
      transform: translateY(-50%) scale(1.05);
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
  margin-top: 20px;
  display: grid;
  grid-template-columns: 100px 1fr 100px;
  gap: 1.5rem;

  .articles-center {
    display: flex;
    flex-direction: column;
    gap: 5rem;
  }
}

.load-more-container {
  margin-top: 40px;
  text-align: center;
  padding: 20px;

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
}

.pagination-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 24px;

  .paging {
    flex: 1;
  }

  .search-pill {
    background: rgba(0, 0, 0, 0.03);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 8px;

    .pill-clear {
      background: transparent;
      border: none;
      color: var(--color-primary);
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 8px;
    }
  }

  .search-tag {
    display: flex;
    align-items: center;
    gap: 8px;

    .tag {
      padding: 6px 10px;
      background: var(--color-primary);
      color: #fff;
      border: none;
      border-radius: 16px;
      cursor: pointer
    }

    .tag-label {
      color: #666
    }
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
}
</style>