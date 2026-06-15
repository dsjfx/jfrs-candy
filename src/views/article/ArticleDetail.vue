<template>
  <div class="blog-container">

    <!-- Loading状态 -->
    <div v-if="isLoading" class="loading-container">
      <ArticleDetailSkeleton />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="hasError" class="error-container">
      <ErrorDisplay :error="error" @retry="fetchArticle" />
    </div>

    <!-- 文章内容 -->
    <main v-else class="article-detail">
      <!-- 文章头部 -->
      <div class="article-header">

        <!-- 返回按钮 -->
        <button class="back-button" @click="handleBack" aria-label="返回上一页">
          <FaIcon :icon="faArrowLeftIcon" />
          <span>返回</span>
        </button>

        <!-- 面包屑导航 -->
        <nav v-if="showBreadcrumb" class="breadcrumb">
          <router-link to="/" class="breadcrumb-item">首页</router-link>
          <span class="breadcrumb-separator">/</span>
          <router-link :to="`/category/${article.category?.slug}`" class="breadcrumb-item">
            {{ article.category!.name }}
          </router-link>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-item current">{{ article.title }}</span>
        </nav>

        <!-- 文章标题 -->
        <h1 class="article-title">{{ article.title }}</h1>

        <!-- 文章元信息 -->
        <div class="article-meta">
          <div class="meta-left">
            <span v-if="showAuthor" class="meta-item author">
              <img :src="article.author?.avatar" alt="作者头像" class="author-avatar" />
              <span class="author-name">{{ article.author?.nickname || '佚名' }}</span>
            </span>

            <div v-if="showTime" class="meta-item">
              <span title="发布日期" class="meta-icon">
                <FaIcon :icon="faCalendarIcon" />
              </span>
              <span>
                <time :datetime="article.createdAt">{{ formatDate(article.createdAt) }}</time>
              </span>

            </div>

            <span v-if="showView" class="meta-item">
              <span title="阅读" class="meta-icon">
                <FaIcon :icon="faEyeIcon" />
              </span>
              {{ article.views || 0 }}
            </span>

            <span v-if="showComments" class="meta-item">
              <span title="评论" class="meta-icon">
                <FaIcon :icon="faCommentIcon" />
              </span>
              {{ article.comments || '5' }}
            </span>
          </div>

          <div class="meta-right">
            <span v-if="showCategory" class="article-category" :style="{ backgroundColor: categoryColor }">
              {{ article.category?.name }}
            </span>
          </div>
        </div>

        <!-- 标签 -->
        <div v-if="showTag" class="article-tags">
          <!-- <router-link v-for="tag in article.tags" :key="tag.id" :to="`/tag/${tag.id}`" class="article-tag">
            #{{ tag.name }}
          </router-link> -->
          <div v-for="tag in article.tags" class="article-tag">
            #{{ tag.name }}
          </div>
        </div>

        <!-- 特色图片 -->
        <div v-if="article.coverImage" class="featured-image">
          <img :src="article.coverImage" :alt="article.title" class="featured-image-content" loading="lazy" />
          <div v-if="article.imageCaption" class="image-caption">
            {{ article.imageCaption }}
          </div>
        </div>

        <!-- 左侧内容 -->
        <div class="article-main">
          <!-- 文章内容 -->
          <article class="article-content" ref="contentRef">
            <!-- 使用 v-html 或 markdown 渲染 -->
            <!-- <div class="content-html" v-html="article.content"></div> -->

            <!-- 或者使用 markdown 组件 -->
            <!-- <MarkdownRenderer :content="article.content" /> -->

            <!-- <SafeHtmlRenderer :html="article?.content" ref="contentRef" /> -->
            <SafeHtmlPrism :html="article?.content" ref="contentRef" />

          </article>

          <!-- <div v-if="showAction" class="article-action">
            <button v-if="showLike" class="action-btn" :class="{ 'liked': article.isLiked }" @click="toggleLike">
              <i class="action-icon">{{ article.isLiked ? '💖' : '🤍' }}</i>
              <span class="action-text">{{ article.likes || 0 }}</span>
            </button>

            <button v-if="showShare" class="action-btn" @click="showShareMenu = !showShareMenu">
              <i class="action-icon">📤</i>
              <span class="action-text">分享</span>
            </button>

            <button v-if="showCollect" class="action-btn" @click="toggleBookmark">
              <i class="action-icon">{{ article.isBookmarked ? '📚' : '📖' }}</i>
              <span class="action-text">{{ article.isBookmarked ? '已收藏' : '收藏' }}</span>
            </button>
          </div> -->

          <!-- 文章脚部 -->
          <footer class="article-footer">
            <!-- 版权声明 -->
            <div v-if="showCopyright" class="copyright">
              <p>本文作者：{{ article.author?.nickname || '佚名' }}</p>
              <p>原文链接：<a :href="currentUrl" class="original-link">{{ currentUrl }}</a></p>
              <p>版权声明：转载请注明出处</p>
            </div>

            <div v-if="showNavigate" class="navigation-links">
              <router-link v-if="prevArticle" :to="`/articles/${prevArticle.id}`" class="nav-link prev">
                <div class="nav-link-label">
                  <el-icon>
                    <ArrowLeftBold />
                  </el-icon>
                </div>
                <div class="nav-link-title">{{ prevArticle.title }}</div>
              </router-link>
              <div v-else class="nav-link prev disabled">
                <div class="nav-link-label">
                  <el-icon>
                    <ArrowLeftBold />
                  </el-icon>
                </div>
                <div class="nav-link-title">已经是第一篇了</div>
              </div>

              <router-link v-if="nextArticle" :to="`/article/${nextArticle.id}`" class="nav-link next">
                <div class="nav-link-title">{{ nextArticle.title }}</div>
                <div class="nav-link-label">
                  <el-icon>
                    <ArrowRightBold />
                  </el-icon>
                </div>
              </router-link>
              <div v-else class="nav-link next disabled">
                <div class="nav-link-title">已经是最后一篇了</div>
                <div class="nav-link-label">
                  <el-icon>
                    <ArrowRightBold />
                  </el-icon>
                </div>
              </div>
            </div>

            <!-- 打赏区域 -->
            <!-- <div v-if="showReward && article.enableReward" class="reward-section">
              <h3 class="reward-title">如果觉得有帮助，可以请作者喝杯咖啡 ☕</h3>
              <div class="reward-images">
                <img src="@/assets/wechat-reward.jpg" alt="微信打赏" class="reward-img" />
                <img src="@/assets/alipay-reward.jpg" alt="支付宝打赏" class="reward-img" />
              </div>
            </div> -->

            <!-- 相关文章 -->
            <div v-if="showRelated && relatedArticles.length > 0" class="related-articles">
              <h3 class="related-title">相关推荐</h3>
              <div class="related-list">
                <RelatedArticleCard v-for="related in relatedArticles" :key="related.id" :article="related"
                  @click="navigateToArticle(`${related.id}`)" />
              </div>
            </div>
          </footer>
        </div>

      </div>

      <!-- 右侧侧边栏 -->
      <aside class="article-sidebar">
        <!-- 目录导航 -->
        <div v-if="showCatalog" class="sidebar-widget toc-widget" ref="tocRef">
          <h3 class="widget-title">
            <span class="meta-icon">
              <el-icon>
                <Reading />
              </el-icon>
            </span>
            目录
          </h3>
          <div class="toc-content">
            <nav class="toc-nav">
              <ul class="toc-list">
                <li v-for="heading in headings" :key="heading.id" class="toc-item" :class="{
                  'active': activeHeading === heading.id,
                  [`level-${heading.level}`]: true
                }">
                  <a :href="`#${heading.id}`" class="toc-link" @click.prevent="scrollToHeading(heading.id)">
                    {{ heading.text }}
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </aside>

      <!-- 评论区域 -->
      <div v-if="showComment" class="comments-section">
        <div class="comments-header">
          <h2 class="comments-title">
            <i class="comments-icon">💬</i>
            评论 ({{ article.comments || 0 }})
          </h2>
          <button class="refresh-comments" @click="refreshComments">
            <i class="refresh-icon">🔄</i>
            刷新
          </button>
        </div>

        <!-- 评论表单 -->
        <CommentForm v-if="userStore.isLogin" :article-id="`${article.id}`" @comment-added="handleNewComment" />
        <div v-else class="login-prompt">
          请<router-link to="/login" class="login-link">登录</router-link>后发表评论
        </div>

        <!-- 评论列表 -->
        <div v-if="comments.length > 0" class="comments-list">
          <CommentItem v-for="comment in comments" :key="comment.id" :article-id="comment.id" :comment="comment"
            @reply="handleReply" @like="handleLikeComment" />
        </div>
        <div v-else class="no-comments">
          还没有评论，快来抢沙发吧！
        </div>

        <!-- 加载更多评论 -->
        <div v-if="hasMoreComments" class="load-more-comments">
          <button class="load-more-btn" :disabled="isLoadingComments" @click="loadMoreComments">
            <span v-if="!isLoadingComments">加载更多评论</span>
            <LoadingSpinner v-else size="small" />
          </button>
        </div>
      </div>
    </main>

    <!-- 分享菜单 -->
    <ShareMenu v-if="showShareMenu" :title="article.title" :url="currentUrl" @close="showShareMenu = false" />

    <!-- 回到顶部按钮 -->
    <button v-show="showBackToTop" class="back-to-top" @click="scrollToTop" aria-label="回到顶部">
      ↑
    </button>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import { faComment as faCommentRegular } from '@fortawesome/free-regular-svg-icons'
import { faCalendar as faCalendarRegular } from '@fortawesome/free-regular-svg-icons'
import { useRoute, useRouter } from 'vue-router'
import { useLoading } from '@/composables/useLoading'
import ArticleDetailSkeleton from '@/components/core/ArticleDetailSkeleton.vue'
import ErrorDisplay from '@/components/core/ErrorDisplay.vue'
import LoadingSpinner from '@/components/core/LoadingSpinner.vue'
import RelatedArticleCard from '@/components/articles/RelatedArticleCard.vue'
import CommentForm from '@/components/articles/CommentForm.vue'
import CommentItem from '@/components/articles/CommentItem.vue'
import ShareMenu from '@/components/articles/ShareMenu.vue'
import SafeHtmlRenderer from '@/components/core/SafeHtmlRenderer.vue'
import SafeHtmlPrism from '@/components/core/SafeHtmlPrism.vue'
import { useUserStore } from '@/stores/user'
import { useArticleStore } from '@/stores/article'
import { useCommentStore } from '@/stores/comment'
import type { Article, ArticleDetailProps, Category } from '@/types/article'
import type { Comment } from '@/types/comment'
import { formatDate } from '@/utils/cabinet'
import { ElMessage } from 'element-plus'

// 路由和状态
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const articleStore = useArticleStore()
const commentStore = useCommentStore()
const articleId = computed(() => route.params.id as string)

// 加载状态
const { isLoading, hasError, error, setError, withLoading } = useLoading()

// 接收props并设置默认值
const props = withDefaults(defineProps<ArticleDetailProps>(), {
  showBreadcrumb: false,
  showAuthor: false,
  showTime: true,
  showView: true,
  showComments: true,
  showCategory: true,
  showTag: true,
  showAction: false,
  showLike: true,
  showShare: true,
  showCollect: true,
  showFooter: true,
  showCopyright: true,
  showNavigate: true,
  showReward: false,
  showRelated: true,
  showCatalog: true,
  showComment: false,
  categoryColors: () => ({
    '日记': '#059669',
    '生活': '#10B981',
    '旅行': '#3B82F6',
    '书评': '#8B5CF6',
    '随笔': '#F59E0B'
  })
})


// 文章数据
// const article = ref<Article>({} as Article)
// 相关文章
// const relatedArticles = ref<any[]>([])
// 导航文章
const prevArticle = ref<any>(null)
const nextArticle = ref<any>(null)

// 目录相关
const headings = ref<Array<{ id: string, text: string, level: number }>>([])
const activeHeading = ref('')
const contentRef = ref<HTMLElement>()
const tocRef = ref<HTMLElement>()

// 评论相关
// const comments = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const hasMoreComments = ref(false)
const isLoadingComments = ref(false)

// UI状态
const showShareMenu = ref(false)
const showBackToTop = ref(false)

// ~~~~计算属性

const currentUrl = computed(() => window.location.href)

// 文章数据
const article = computed(() => articleStore.article)

// 相关文章
const relatedArticles = computed(() => articleStore.relatedArticles)
const adjacentArticle = computed(() => articleStore.adjacentArticle)

// 评论相关
const comments = computed(() => commentStore.comments)
const commentPage = computed(() => commentStore.commentPageData)

const categoryColor = computed(() => {
  const category: Category | null = article.value.category
  if (category) {
    return props.categoryColors[category.name]
  }
  return '#059669'
})

// ~~~~生命周期
onMounted(async () => {
  await fetchArticle()
  setupScrollListeners()
})

onUnmounted(() => {
  removeScrollListeners()
})

// ~~~~方法

// 获取文章详情
const fetchArticle = async () => {
  try {
    await withLoading(
      articleStore.fetchArticleById({ id: articleId.value }),
      'page',
      '正在加载文章...'
    )

    // 提取目录
    extractHeadings()

    // 获取相关文章
    fetchRelatedArticlesData()

    // 获取评论
    // fetchCommentsData()

    // 获取导航文章
    fetchNavigationArticles()

    // 更新阅读量
    // updateViewCount()

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '操作失败'
    setError(errorMessage)
  }
}

const handleBack = () => {
  // prefer history back, fallback to articles list
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'Articles' })
  }
}

// fontawesome icon for template
const faArrowLeftIcon = faArrowLeft
const faCalendarIcon = faCalendarRegular
const faEyeIcon = faEye
const faCommentIcon = faCommentRegular

// 提取文章标题（用于目录）
const extractHeadings = () => {
  nextTick(() => {
    if (!contentRef.value) return

    const headingElements = contentRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
    headings.value = Array.from(headingElements).map((el, index) => {
      const id = el.id || `heading-${index}`
      el.id = id

      return {
        id,
        text: el.textContent || '',
        level: parseInt(el.tagName.charAt(1))
      }
    })
  })
}

// 获取相关文章
const fetchRelatedArticlesData = async () => {
  try {
    await articleStore.fetchRelatedArticles({ id: articleId.value })

  } catch (err) {
    console.error('获取相关文章失败:', err)
  }
}

// 获取评论
const fetchCommentsData = async () => {
  try {
    await commentStore.fetchComments({
      current: currentPage.value,
      size: pageSize.value,
      articleId: articleId.value,
    })

    if (commentPage) {
      hasMoreComments.value = commentPage.value.pagination.hasNext || false
      article.value.comments = commentPage.value.pagination.total
    }
  } catch (err) {
    ElMessage.error(err!)
  }
}

// 获取导航文章
const fetchNavigationArticles = async () => {
  // 这里应该调用API获取上一篇和下一篇文章
  // 暂时使用模拟数据
  // prevArticle.value = {
  //   id: 'prev-123',
  //   title: 'Vue3 Composition API 详解'
  // }

  // nextArticle.value = {
  //   id: 'next-456',
  //   title: 'TypeScript 类型系统深入'
  // }
  try {
    await articleStore.fetchAdjacentArticles({ id: articleId.value })

    const { prev, next } = adjacentArticle.value
    if (prev) {
      prevArticle.value = {
        id: `${prev.id}`,
        title: prev.title,
      }
    }

    if (next) {
      nextArticle.value = {
        id: `${next.id}`,
        title: next.title,
      }
    }
  } catch (err) {
    ElMessage.error(err!)
  }
}

// 滚动到指定标题
const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    const offset = 80 // 导航栏高度
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
    window.scrollTo({
      top: elementPosition - offset,
      behavior: 'smooth'
    })
  }
}

// 设置滚动监听
const setupScrollListeners = () => {
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('scroll', updateActiveHeading)
}

// 移除滚动监听
const removeScrollListeners = () => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('scroll', updateActiveHeading)
}

// 处理滚动
const handleScroll = () => {
  showBackToTop.value = window.scrollY > 500
}

// 更新活动标题
const updateActiveHeading = () => {
  if (!headings.value.length) return

  // 找到当前可见的标题
  const scrollPosition = window.scrollY + 100

  for (let i = headings.value.length - 1; i >= 0; i--) {
    const heading = headings.value[i] || { id: '' }
    const element = document.getElementById(heading.id)

    if (element && element.offsetTop <= scrollPosition) {
      activeHeading.value = heading.id
      break
    }
  }
}

// 方法：回到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 更新阅读量
// const updateViewCount = async () => {
//   try {
//     // 这里应该调用API更新阅读量
//     article.value.views++
//   } catch (err) {
//     console.error('更新阅读量失败:', err)
//   }
// }

// 点赞/取消点赞
// const toggleLike = async () => {
//   try {
//     // 这里应该调用API
//     if (article.value.isLiked) {
//       article.value.likes = Math.max(0, article.value.likes - 1)
//     } else {
//       article.value.likes++
//     }
//     article.value.isLiked = !article.value.isLiked

//   } catch (err) {
//     console.error('点赞操作失败:', err)
//   }
// }

// 方法：收藏/取消收藏
// const toggleBookmark = async () => {
//   try {
//     // 这里应该调用API
//     article.value.isBookmarked = !article.value.isBookmarked

//   } catch (err) {
//     console.error('收藏操作失败:', err)
//   }
// }

// 方法：刷新评论
const refreshComments = async () => {
  currentPage.value = 1
  await fetchCommentsData()
}

// 方法：加载更多评论
const loadMoreComments = async () => {
  if (isLoadingComments.value || !hasMoreComments.value) return

  isLoadingComments.value = true
  currentPage.value++

  // try {
  //   commentStore.commentPageData
  //   const data = await commentStore.fetchComments({
  //     articleId: articleId.value,
  //     current: currentPage.value,
  //     size: pageSize.value
  //   })
  //   comments.value.push(...data.comments)
  //   hasMoreComments.value = data.hasMore
  // } catch (err) {
  //   console.error('加载更多评论失败:', err)
  //   currentPage.value--
  // } finally {
  //   isLoadingComments.value = false
  // }
}

// 方法：处理新评论
const handleNewComment = (newComment: any) => {
  comments.value.unshift(newComment)
  // article.value.comments++
}

// 方法：处理回复
const handleReply = (comment: Comment) => {
  const commentId = comment.id
  console.log('回复评论:', commentId)
  // 实现回复逻辑
}

// 方法：处理点赞评论
const handleLikeComment = (commentId: string) => {
  console.log('点赞评论:', commentId)
  // 实现点赞评论逻辑
}

// 方法：导航到文章
const navigateToArticle = (id: string) => {
  router.push(`/articles/${id}`)
}

</script>

<style lang="scss" scoped>
// 变量定义（与列表页保持一致）
$bg-color: $base-bg-j3;
$border-color: $base-border-j2;
$shadow: $shadow-xs;
$radius: $radius-sm;
$breakpoint-mobile: 768px;

.blog-container {
  min-height: 100vh;
  background-color: $bg-color;
}

// Loading和Error容器
.loading-container,
.error-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem;

  @media (max-width: $breakpoint-mobile) {
    max-width: 100vh;
  }
}

// 主要内容区域
.article-detail {
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;

  // 让所有直接子元素允许收缩
  &>* {
    min-width: 0;
  }

  @media (max-width: $breakpoint-mobile) {
    grid-template-columns: 1fr;
  }

  // 文章头部
  .article-header {
    margin-bottom: 2rem;
    padding: 2rem;
    background: $card-bg;

    .back-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 8px;
      background: transparent;
      border: 1px solid $border-color;
      color: $text-secondary;
      cursor: pointer;
      margin-bottom: 12px;

      span {
        font-size: 0.9rem;
      }

      &:hover {
        border: 1px solid var(--color-primary);
      }
    }

    @media (max-width: $breakpoint-mobile) {
      padding: 0;
    }
  }
}

// 面包屑导航
.breadcrumb {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: $text-light;

  .breadcrumb-item {
    color: $text-secondary;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: $primary-color;
    }

    &.current {
      color: $text-primary;
      font-weight: 500;
    }
  }

  .breadcrumb-separator {
    color: $text-light;
  }
}

.article-title {
  margin: 0 0 1.5rem 0;
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.3;
  color: $text-primary;

  @media (max-width: $breakpoint-mobile) {
    font-size: 1.8rem;
  }
}

// 文章元信息
.article-meta {
  margin-bottom: 1.5rem;
  padding: 1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  border-top: 1px solid $border-color;

  @media (max-width: $breakpoint-mobile) {
    flex-direction: column;
    align-items: flex-start;

    .meta-right {
      width: 100%;
      justify-content: flex-start;
    }
  }

  .meta-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: $text-secondary;
    font-size: 0.95rem;
    height: 100%;

    &.author {
      gap: 0.75rem;
    }

    .author-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
    }

    .author-name {
      font-weight: 500;
      color: $text-primary;
    }

    .meta-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.04);
      color: $text-secondary;
      transition: all 0.18s ease;
      font-size: 0.95rem;
    }

    &:hover .meta-icon {
      background: rgba(var(--primary-color-rgb, 5, 150, 105), 0.12);
      color: var(--primary-color);
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(5, 150, 105, 0.08);
    }
  }

  .meta-icon {
    display: flex;
    align-items: center;
  }

  .meta-right {
    display: flex;
    gap: 0.5rem;

    .article-category {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      color: white;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

  }
}

.article-action {
  display: flex;
  justify-content: center;
  gap: 0.5rem;

  .action-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: $bg-color;
    border: 1px solid $border-color;
    border-radius: $radius;
    color: $text-secondary;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: $primary-color;
      color: white;
      border-color: $primary-color;
      transform: translateY(-2px);
      box-shadow: $shadow-hover;
    }

    &.liked {
      background: rgba($primary-color, 0.1);
      color: $primary-color;
      border-color: $primary-color;
    }

    .action-icon {
      font-size: 1.1rem;
    }
  }
}

// 标签样式
.article-tags {
  margin-top: 2.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;

  .article-tag {
    padding: 0.4rem 0.8rem;
    background: rgba($primary-color, 0.1);
    color: $primary-color;
    border-radius: 20px;
    font-size: 0.85rem;
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
      background: $primary-color;
      color: white;
      transform: translateY(-2px);
    }
  }
}

// 特色图片
.featured-image {
  margin: 1.5rem 0;
  border-radius: $radius;
  overflow: hidden;
  box-shadow: $shadow;

  .featured-image-content {
    width: 100%;
    height: auto;
    max-height: 400px;
    object-fit: cover;
    display: block;
  }

  .image-caption {
    padding: 0.75rem 1rem;
    background: $bg-color;
    color: $text-secondary;
    font-size: 0.9rem;
    text-align: center;
    border-top: 1px solid $border-color;
  }
}

// 文章主内容
.article-main {
  background: $card-bg;
}

// 文章内容
// .article-content {
//   overflow-x: auto;
//   font-size: 1.1rem;
//   line-height: 1.8;
//   color: $text-primary;

//   :deep() {

//     h1,
//     h2,
//     h3,
//     h4,
//     h5,
//     h6 {
//       color: $text-primary;
//       margin-top: 2rem;
//       margin-bottom: 1rem;
//       font-weight: 600;
//       scroll-margin-top: 80px;
//     }

//     h1 {
//       font-size: 1.8rem;
//     }

//     h2 {
//       font-size: 1.6rem;
//       // border-bottom: 2px solid $primary-light;
//       padding-bottom: 0.5rem;
//     }

//     h3 {
//       font-size: 1.4rem;
//     }

//     h4 {
//       font-size: 1.2rem;
//     }

//     p {
//       margin-bottom: 1.5rem;
//     }

//     a {
//       color: $primary-color;
//       text-decoration: none;
//       border-bottom: 1px solid transparent;
//       transition: all 0.3s ease;

//       &:hover {
//         border-bottom-color: $primary-color;
//       }
//     }

//     img {
//       max-width: 100%;
//       height: auto;
//       border-radius: $radius;
//       margin: 1.5rem 0;
//       box-shadow: $shadow;
//     }

//     blockquote {
//       border-left: 4px solid $primary-color;
//       margin: 1.5rem 0;
//       padding: 1rem 1.5rem;
//       background: rgba($primary-color, 0.05);
//       border-radius: 0 $radius $radius 0;
//       color: $text-secondary;

//       p {
//         margin: 0;
//       }
//     }

//     code {
//       background: rgba($primary-color, 0.1);
//       padding: 0.2rem 0.4rem;
//       border-radius: 4px;
//       font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
//       font-size: 0.9em;
//       color: $primary-dark;
//     }

//     pre {
//       background: #2d2d2d;
//       color: #fff;
//       padding: 1.5rem;
//       border-radius: $radius;
//       overflow-x: auto;
//       margin: 1.5rem 0;

//       code {
//         background: none;
//         padding: 0;
//         color: inherit;
//       }
//     }

//     ul,
//     ol {
//       margin: 1.5rem 0;
//       padding-left: 1.5rem;

//       li {
//         margin-bottom: 0.5rem;

//         &::marker {
//           color: $primary-color;
//         }
//       }
//     }

//     table {
//       width: 100%;
//       border-collapse: collapse;
//       margin: 1.5rem 0;

//       th,
//       td {
//         padding: 0.75rem 1rem;
//         border: 1px solid $border-color;
//         text-align: left;
//       }

//       th {
//         background: rgba($primary-color, 0.1);
//         font-weight: 600;
//         color: $text-primary;
//       }

//       tr:nth-child(even) {
//         background: $bg-color;
//       }
//     }
//   }
// }

// 文章脚部
.article-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid $border-color;
}

.copyright {
  margin-bottom: 2rem;
  // padding: 1.5rem;
  background: $bg-color;
  border-radius: $radius;
  font-size: 0.9rem;
  color: $text-secondary;

  p {
    margin: 0.5rem 0;
  }

  .original-link {
    color: $primary-color;
    text-decoration: none;
    word-break: break-all;

    &:hover {
      text-decoration: underline;
    }
  }
}

.reward-section {
  margin: 2rem 0;
  padding: 2rem;
  text-align: center;
  background: linear-gradient(135deg, rgba($primary-color, 0.05), rgba($primary-color, 0.1));
  border-radius: $radius;

  .reward-title {
    color: $text-primary;
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
  }

  .reward-images {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .reward-img {
    width: 200px;
    height: 200px;
    border-radius: $radius;
    box-shadow: $shadow;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
}

.related-articles {
  margin-top: 3rem;

  .related-title {
    font-size: 1.4rem;
    color: $text-primary;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid $primary-light;
  }

  .related-list {
    display: grid;
    gap: 1rem;
  }
}

// 侧边栏
.article-sidebar {
  position: sticky;
  top: 100px;
  width: 100%;
  align-self: start;

  @media (max-width: $breakpoint-mobile) {
    position: static;
    order: -1;
  }

  .sidebar-widget {
    margin-bottom: 1.5rem;
    padding: 1.5rem;
    // border: 1px solid $border-color;
    // border-radius: $radius;
    // box-shadow: $shadow;
    // background: $card-bg;

    .widget-title {
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.1rem;
      color: $text-primary;
      border-bottom: 1px solid $border-color;

      .meta-icon {
        font-size: 1.2rem;
      }
    }
  }
}

// 目录组件
.toc-widget {
  .toc-content {
    max-height: 400px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: $bg-color;
      border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background: $primary-light;
      border-radius: 2px;
    }
  }

  .toc-nav {
    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .toc-item {
      margin-bottom: 0.1rem;

      &.level-2 {
        padding-left: 0.5rem;
      }

      &.level-3 {
        padding-left: 1rem;
      }

      &.level-4 {
        padding-left: 1.5rem;
      }

      &.level-5 {
        padding-left: 2rem;
      }

      &.level-6 {
        padding-left: 2.5rem;
      }

      &.active {
        .toc-link {
          color: $primary-color;
          font-weight: 600;
          // background: rgba($primary-color, 0.1);
          border-left: 2px solid $primary-light;
        }
      }
    }

    .toc-link {
      display: block;
      padding: 0.5rem 0.75rem;
      color: $text-secondary;
      text-decoration: none;
      // border-radius: 4px;
      font-size: 0.9rem;
      transition: all 0.3s ease;

      &:hover {
        color: $primary-color;
        background: rgba($primary-color, 0.05);
      }
    }
  }
}

// 文章导航
.navigation-links {
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  .nav-link {
    padding: 0.8rem;
    display: flex;
    flex: 1;
    align-items: center;
    border-radius: $radius;
    text-decoration: none;
    transition: all 0.3s ease;
    cursor: default;

    &.prev {
      border-left: 1px solid $primary-color;
      border-bottom: 1px solid $primary-color;

      .nav-link-label {
        margin-right: 0.5rem;
      }
    }

    &.next {
      border-right: 1px solid $primary-color;
      border-bottom: 1px solid $primary-color;

      .nav-link-label {
        margin-left: 0.5rem;
      }
    }

    &:not(.disabled) {
      &:hover {
        background: rgba($primary-color, 0.05);
        // border-color: $primary-color;
        // transform: translateX(4px);
      }
    }

    .nav-link-label {
      // margin-bottom: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
      color: $text-light;
      text-transform: uppercase;
      letter-spacing: 1px;

      &:hover {
        cursor: pointer;
        color: $primary-color;
      }
    }

    .nav-link-title {
      // margin-left: 10px;
      font-size: 0.95rem;
      color: $text-primary;
      line-height: 1.4;
      font-weight: 500;

      &:hover {
        cursor: pointer;
        color: $primary-color;
      }
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;

      &.prev {
        display: flex;
        justify-content: flex-start;

        .nav-link-label {
          margin-left: 10px;
          color: $text-light;
          cursor: not-allowed;
        }

        .nav-link-title {
          margin-left: 10px;
          color: $text-light;
          cursor: not-allowed;
        }
      }

      &.next {
        display: flex;
        justify-content: flex-end;

        .nav-link-label {
          margin-right: 10px;
          color: $text-light;
          cursor: not-allowed;
        }

        .nav-link-title {
          color: $text-light;
          margin-right: 10px;
          cursor: not-allowed;
        }
      }
    }
  }
}

// 评论区域
.comments-section {
  margin-bottom: 3rem;
  padding: 2rem;
  background: $card-bg;
  border-radius: $radius;
  box-shadow: $shadow;
  border: 1px solid $border-color;

  .comments-header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid $primary-light;
  }

  .comments-title {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.4rem;
    color: $text-primary;

    .comments-icon {
      font-size: 1.5rem;
    }
  }

  .refresh-comments {
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: $bg-color;
    border: 1px solid $border-color;
    border-radius: $radius;
    color: $text-secondary;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: $primary-color;
      color: white;
      border-color: $primary-color;
    }

    .refresh-icon {
      font-size: 1rem;
    }
  }

  .login-prompt {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: $bg-color;
    border-radius: $radius;
    text-align: center;
    color: $text-secondary;

    .login-link {
      margin: 0 0.25rem;
      color: $primary-color;
      text-decoration: none;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .no-comments {
    padding: 3rem;
    text-align: center;
    color: $text-light;
    font-style: italic;
    background: $bg-color;
    border-radius: $radius;
  }
}

// 加载更多评论
.load-more-comments {
  margin-top: 2rem;
  padding-top: 2rem;
  text-align: center;
  border-top: 1px solid $border-color;

  .load-more-btn {
    min-width: 150px;
    min-height: 44px;
    padding: 0.75rem 2rem;
    background: $primary-color;
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      background: $primary-dark;
      transform: translateY(-2px);
      box-shadow: $shadow-hover;
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
}

// 分享菜单
.share-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

// 回到顶部按钮
.back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 48px;
  height: 48px;
  background: $primary-color;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 99;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
  display: flex;
  align-items: center;
  justify-content: center;

  &.show {
    opacity: 1;
    transform: translateY(0);
  }

  &:hover {
    background: $primary-dark;
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(5, 150, 105, 0.4);
  }
}

// 响应式设计
// @media (max-width: 768px) {

//   .article-detail {
//     padding: 0 1rem;
//   }

//   .article-header {
//     padding: 1.5rem;
//   }

//   .article-title {
//     font-size: 1.8rem;
//   }

//   .article-meta {
//     flex-direction: column;
//     align-items: flex-start;
//     gap: 1rem;

//     .meta-right {
//       width: 100%;
//       justify-content: flex-start;
//     }
//   }

//   // .article-content-container {
//   //   gap: 1rem;
//   // }

//   .article-main,
//   .sidebar-widget {
//     padding: 1.5rem;
//   }

//   .comments-section {
//     padding: 1.5rem;
//   }

//   .back-to-top {
//     bottom: 1rem;
//     right: 1rem;
//     width: 40px;
//     height: 40px;
//     font-size: 1.2rem;
//   }
// }

// @media (max-width: 480px) {
//   .article-meta {
//     .meta-left {
//       flex-direction: column;
//       align-items: flex-start;
//       gap: 0.75rem;
//     }
//   }

//   .featured-image {
//     .featured-image-content {
//       max-height: 250px;
//     }
//   }

//   .reward-images {
//     flex-direction: column;
//     align-items: center;
//   }
// }

// 动画
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>