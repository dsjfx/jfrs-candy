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

    <!-- 文章内容 Article Content -->
    <main v-else class="article-detail">
      <!-- 文章头部 Article Header -->
      <div class="article-header">

        <!-- 返回按钮 -->
        <button class="back-button" @click="handleBack" aria-label="返回上一页">
          <!-- <FaIcon :icon="faArrowLeftIcon" /> -->
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
        <h1 class="article-title">
          <span>{{ article.title }}</span>
          <span v-if="article.subtitle" class="master-title">
            <span class="pipe">|</span>
            <span class="subtitle">{{ article.subtitle }}</span>
          </span>
        </h1>

        <!-- 文章元信息 -->
        <div class="article-meta">
          <div class="meta-left">
            <span v-if="showAuthor" class="meta-item author">
              <img :src="article.author?.avatar" alt="作者头像" class="author-avatar" />
              <span class="author-name">{{ article.author?.nickname || '佚名' }}</span>
            </span>

            <div v-if="showTime" class="meta-item">
              <span title="发布日期" class="meta-icon">
                <FaIcon :icon="['far', 'calendar']" />
              </span>
              <span>
                <time :datetime="article.publishedAt">{{ formatDate(article.publishedAt) }}</time>
              </span>
            </div>

            <span v-if="showView" class="meta-item">
              <span title="阅读" class="meta-icon">
                <FaIcon :icon="['far', 'eye']" />
              </span>
              {{ article.views || 0 }}
            </span>

            <span v-if="showComments" class="meta-item">
              <span title="评论" class="meta-icon">
                <FaIcon :icon="['far', 'comment']" />
              </span>
              {{ article.comments || '5' }}
            </span>
          </div>

          <div class="meta-right">
            <span v-if="showCategory" class="article-category"
              :style="{ '--category-color-rgb': tagColorRgb(article.category?.color || categoryColor) }">
              {{ article.category?.name }}
            </span>
          </div>
        </div>

        <!-- 标签 -->
        <div v-if="showTag" class="article-tags">
          <!-- <router-link v-for="tag in article.tags" :key="tag.id" :to="`/tag/${tag.id}`" class="article-tag">
            #{{ tag.name }}
          </router-link> -->
          <div v-for="tag in article.tags" :key="tag.id" class="article-tag"
            :style="{ '--tag-color-rgb': tagColorRgb(tag.color) }">
            #{{ tag.name }}
          </div>
        </div>

        <!-- 特色图片 Featured Image -->
        <div v-if="article.coverImage" class="featured-image">
          <img :src="article.coverImage" :alt="article.title" class="featured-image-content" loading="lazy" />
          <div v-if="article.imageCaption" class="image-caption">
            {{ article.imageCaption }}
          </div>
        </div>

        <!-- 左侧内容 Left Content -->
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

          <div class="article-end">
            <span>THE END</span>
          </div>

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

          <!-- 文章脚部 Article Footer -->
          <footer class="article-footer">
            <!-- 版权声明 Copyright Notice -->
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

              <router-link v-if="nextArticle" :to="`/articles/${nextArticle.id}`" class="nav-link next">
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

            <!-- 打赏区域 Reward Area -->
            <!-- <div v-if="showReward && article.enableReward" class="reward-section">
              <h3 class="reward-title">如果觉得有帮助，可以请作者喝杯咖啡 ☕</h3>
              <div class="reward-images">
                <img src="@/assets/wechat-reward.jpg" alt="微信打赏" class="reward-img" />
                <img src="@/assets/alipay-reward.jpg" alt="支付宝打赏" class="reward-img" />
              </div>
            </div> -->

            <!-- 相关文章 Related Articles -->
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

      <!-- 右侧侧边栏 Right Sidebar -->
      <aside class="article-sidebar">
        <!-- 目录导航 Catalog Navigation -->
        <div v-if="showCatalog" class="sidebar-widget toc-widget" ref="tocRef">
          <h3 class="widget-title">
            <span class="meta-icon">
              <el-icon>
                <Reading />
              </el-icon>
            </span>
            目录
            <button class="toc-toggle" v-if="mobile" @click="toggleToc" :aria-expanded="tocVisible"
              :aria-label="tocVisible ? '收起目录' : '展开目录'">
              <span class="toc-icon" v-if="tocVisible">
                <FontAwesomeIcon :icon="['fas', 'caret-up']" />
              </span>
              <span class="toc-icon" v-else>
                <FontAwesomeIcon :icon="['fas', 'caret-down']" />
              </span>
            </button>
          </h3>
          <div class="toc-content" v-show="tocVisible || !mobile">
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

      <!-- 评论区域 Comment area -->
      <div class="comment-container">
        <CommentSection v-if="showComment && article.id" :article-id="article.id" @count-change="commentHandler" />
      </div>
    </main>

    <!-- 分享菜单 Share Menu -->
    <ShareMenu v-if="showShareMenu" :title="article.title" :url="currentUrl" @close="showShareMenu = false" />

    <!-- 回到顶部按钮 Back to Top Button -->
    <button v-show="showBackToTop" class="back-to-top" @click="scrollToTop" aria-label="回到顶部">
      ↑
    </button>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoading } from '@/composables/useLoading'
import ArticleDetailSkeleton from '@/components/core/ArticleDetailSkeleton.vue'
import ErrorDisplay from '@/components/core/ErrorDisplay.vue'
import LoadingSpinner from '@/components/core/LoadingSpinner.vue'
import RelatedArticleCard from '@/components/articles/RelatedArticleCard.vue'
import CommentSection from '@/components/comment/CommentSection.vue'
import CommentForm from '@/components/comment/CommentForm.vue'
import CommentItem from '@/components/comment/CommentItem.vue'
import ShareMenu from '@/components/articles/ShareMenu.vue'
// import SafeHtmlRenderer from '@/components/core/SafeHtmlRenderer.vue'
import SafeHtmlPrism from '@/components/core/SafeHtmlPrism.vue'
import { useUserStore } from '@/stores/user'
import { useArticleStore } from '@/stores/article'
import type { Article, ArticleDetailProps, Category } from '@/types/article'
import { formatDate, isMobile, tagColorRgb } from '@/utils/cabinet'
import { ElMessage } from 'element-plus'

// 路由和状态
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const articleStore = useArticleStore()

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
  showComment: true,
  categoryColors: () => ({
    '日记': '#059669',
    '生活': '#10B981',
    '旅行': '#3B82F6',
    '书评': '#8B5CF6',
    '随笔': '#F59E0B'
  })
})

// 导航文章
const prevArticle = ref<any>(null)
const nextArticle = ref<any>(null)

// 目录相关
const headings = ref<Array<{ id: string, text: string, level: number }>>([])
const activeHeading = ref('')
const contentRef = ref<HTMLElement>()
const tocRef = ref<HTMLElement>()

// UI状态
const showShareMenu = ref(false)
const showBackToTop = ref(false)
// const showLogin = ref(false)
// const showRegister = ref(false)

// ~~~~ Computed properties

const isLoggedIn = computed(() => userStore.isLogin)
// const user = computed(() => userStore.user)

const articleId = computed(() => route.params.id as string)

const mobile = computed(() => isMobile())
// 目录可见性（移动端默认隐藏）
const tocVisible = ref(!mobile.value)

const currentUrl = computed(() => window.location.href)

// 文章数据
const article = computed(() => articleStore.article)

// 相关文章
const relatedArticles = computed(() => articleStore.relatedArticles)
const adjacentArticle = computed(() => articleStore.adjacentArticle)

const categoryColor = computed(() => {
  const category: Category | null = article.value.category
  if (category) {
    return props.categoryColors[category.name]
  }
  return '#059669'
})

// ^^^^生命周期
onMounted(async () => {
  await fetchArticle()
  setupScrollListeners()
  setupResizeListeners()

})

onUnmounted(() => {
  removeScrollListeners()
  removeResizeListeners()
})

// ^^^^方法


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

    // 获取导航文章
    fetchNavigationArticles()

    // 更新阅读量
    // updateViewCount()

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '操作失败'
    setError(errorMessage)
  }
}

// 切换目录可见性
const toggleToc = () => {
  tocVisible.value = !tocVisible.value
}

// Resize 监听：同步更新 mobile 与 tocVisible
const updateIsMobile = () => {
  // if switching between desktop/mobile, adjust toc visibility
  tocVisible.value = !mobile
}

const setupResizeListeners = () => {
  window.addEventListener('resize', updateIsMobile)
}

const removeResizeListeners = () => {
  window.removeEventListener('resize', updateIsMobile)
}

const handleBack = () => {
  // prefer history back, fallback to articles list
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'Articles' })
  }
}


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
        title: prev.subtitle || prev.title,
      }
    }

    if (next) {
      nextArticle.value = {
        id: `${next.id}`,
        title: next.subtitle || next.title,
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
  // 额外监听touchmove事件，对移动端更友好
  window.addEventListener('touchmove', handleScroll);
}

// 移除滚动监听
const removeScrollListeners = () => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('scroll', updateActiveHeading)
  window.removeEventListener('touchmove', handleScroll);
}

// 处理滚动
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  // 当滚动距离大于300px时显示按钮
  showBackToTop.value = window.scrollY > 300

  // 如果滚动到顶部，确保按钮隐藏
  if (scrollTop === 0) {
    showBackToTop.value = false;
  }
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

  // 立即隐藏，但也会在滚动事件中再次确认
  showBackToTop.value = false;
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

const commentHandler = (newCount: number) => {
  article.value.comments = newCount
}

// 方法：Toast提示
const showToast = (message: string) => {
  // 可以使用 Element Plus 或其他库的 toast
  alert(message)
}

// 方法：导航到文章
const navigateToArticle = (id: string) => {
  router.push(`/articles/${id}`)
}

</script>

<style lang="scss" scoped>
// 变量定义（与列表页保持一致）
$bg-color: $base-bg-j3;
$card-bg: $base-bg-j3;
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
      margin-bottom: 12px;
      padding: 6px 14px;
      border-radius: 8px;
      // background: transparent;
      border: 1px solid $border-color;
      font-weight: bolder;
      color: var(--color-primary);
      background: rgba(var(--category-color-rgb, 5, 150, 105), 0.1);
      cursor: pointer;

      span {
        font-size: 0.9rem;
      }

      &:hover {
        border: 1px solid var(--color-primary);
      }
    }

    @media (max-width: $breakpoint-mobile) {
      padding: 1rem;
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

  .master-title {
    font-size: 2rem;

    .pipe {
      margin: auto 20px;
      font-weight: 600;
      opacity: .8;
    }

    .subtitle {
      font-weight: 400;
      opacity: 0.7;
    }
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

  // @media (max-width: $breakpoint-mobile) {
  //   flex-direction: column;
  //   align-items: flex-start;

  //   .meta-right {
  //     width: 100%;
  //     justify-content: flex-start;
  //   }
  // }

  .meta-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;

    @media (max-width: $breakpoint-mobile) {
      gap: 0.5rem;
    }
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: $text-secondary;
    font-size: 0.95rem;
    height: 100%;

    @media (max-width: $breakpoint-mobile) {
      gap: 0.3rem;
      margin-right: 0.5rem;
    }

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

      @media (max-width: $breakpoint-mobile) {
        width: auto;
        height: auto;
        background: transparent;
      }
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
      padding: 0.2rem 0.6rem;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 400;
      color: rgba(var(--category-color-rgb, 5, 150, 105), 1);
      background: rgba(var(--category-color-rgb, 5, 150, 105), 0.1);
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
    font-size: 0.85rem;
    text-decoration: none;
    transition: all 0.18s ease;
    color: rgba(var(--tag-color-rgb, 5, 150, 105), 1);
    background: rgba(var(--tag-color-rgb, 5, 150, 105), 0.1);
    border-radius: 20px;

    &:hover {
      background: rgba(var(--tag-color-rgb, 5, 150, 105), 1);
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
  text-align: center;

  .featured-image-content {
    max-width: 70%;
    height: auto;
    max-height: 400px;
    object-fit: cover;
    // display: block;
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

.article-end {
  margin-top: 40px;
  text-align: center;
  font-size: 20px;
  color: var(--color-primary);

  span {
    color: var(--color-primary);
    font-weight: 600;
  }

  &::before {
    content: '----- ';
    opacity: .5;
  }

  &::after {
    content: ' -----';
    opacity: .5;
  }
}


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

    @media (max-width: $breakpoint-mobile) {
      margin-bottom: 0;
      padding: 1rem;
      padding-bottom: 0;
    }

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

      .toc-toggle {
        margin-left: auto;
        background: transparent;
        border: 1px solid $border-color;
        color: $text-secondary;
        padding: 0;
        width: 36px;
        height: 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        font-size: 0.95rem;
        cursor: pointer;

        @media (min-width: $breakpoint-mobile) {
          display: none;
        }

        .toc-icon {
          line-height: 1;
        }
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
  // display: flex;
  // flex-direction: row;
  // justify-content: space-between;
  // align-items: center;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 20px;

  &>* {
    min-width: 0;
  }

  .nav-link {
    display: flex;
    flex: 1;
    align-items: center;
    padding: 0.8rem;
    border-radius: $radius;
    text-decoration: none;
    transition: all 0.3s ease;
    cursor: default;

    @media (max-width: $breakpoint-mobile) {
      padding: 0.3rem;
    }

    &.prev {
      display: inline-flex;
      justify-content: flex-start;
      border-left: 1px solid $primary-color;
      border-bottom: 1px solid $primary-color;

      .nav-link-label {
        margin-right: 0.5rem;
      }
    }

    &.next {
      display: inline-flex;
      justify-content: flex-end;
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

      @media (max-width: $breakpoint-mobile) {
        display: none;
      }

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
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

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

          @media (max-width: $breakpoint-mobile) {
            margin-left: 5px;
          }
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

          @media (max-width: $breakpoint-mobile) {
            margin-right: 5px;
          }
        }
      }
    }
  }
}


.comment-container {
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 2rem 0;
  padding: 0 1.5rem;

  @media (max-width: $breakpoint-mobile) {
    max-width: 100vh;
    padding: 1rem;
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
  display: flex;
  align-items: center;
  justify-content: center;
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