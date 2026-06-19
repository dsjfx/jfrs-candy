<template>
  <div class="container">

    <!-- 左侧文章列表 -->
    <aside class="sidebar">
      <!-- 搜索框 -->
      <div class="search-box">
        <button class="search-left" type="button"
          @click="() => { searchInputRef?.focus(); loadHomeArticles(searchQuery) }" aria-label="搜索">
          <FaIcon :icon="faSearch" />
        </button>
        <input ref="searchInputRef" v-model="searchQuery" type="text" placeholder="搜索文章..." id="searchInput">
        <div class="search-right">
          <LoadingSpinner v-if="searchLoading" size="small" variant="primary" />
          <button v-else-if="searchQuery" class="clear-btn" type="button"
            @click="() => { searchQuery = ''; searchInputRef?.focus(); }" aria-label="清除搜索">×</button>
        </div>
      </div>

      <!-- 最新文章列表 -->
      <div class="articles-list">
        <h3>最新文章</h3>
        <template v-if="latestArticles.length">
          <article v-for="item in latestArticles" :key="item.id" class="article-preview">
            <time :datetime="item.publishedAt">{{ formatDate(item.publishedAt) }}</time>
            <h4>
              <router-link :to="`/articles/${item.id}`">{{ item.title || '未命名文章' }}</router-link>
            </h4>
            <p v-if="item.summary">{{ item.summary }}</p>
            <p v-else-if="item.summary">{{ item.summary }}</p>
            <p v-else>暂无摘要</p>
          </article>
        </template>
        <template v-else>
          <article v-for="item in mockLatestArticles" :key="item.id" class="article-preview">
            <time :datetime="item.publishedAt">{{ formatDate(item.publishedAt) }}</time>
            <h4>{{ item.title }}</h4>
            <p>{{ item.summary }}</p>
          </article>
        </template>
      </div>
    </aside>

    <!-- 右侧文章内容 -->
    <article class="content">
      <header class="article-header">
        <time v-if="heroArticle" :datetime="heroArticle.publishedAt">
          {{ formatDate(heroArticle.publishedAt) }} • 阅读时间 {{ readTime }}
        </time>
        <time v-else datetime="2023-10-15">2023年10月15日 • 阅读时间 5分钟</time>
        <!-- 文章标题 -->
        <h1>{{ heroArticle?.title || '如何保持极简主义生活与工作平衡' }}</h1>
        <div class="meta">
          <span class="category" :style="{ backgroundColor: heroArticle?.category?.color || '#3498db' }">
            {{ heroArticle?.category?.name || '生活哲学' }}
          </span>
          <span class="word-count">约 {{ wordCount }} 字</span>
        </div>
      </header>

      <!-- 文章目录 -->
      <nav class="toc" id="toc">
        <h3>
          <FaIcon :icon="faList" />
          目录
        </h3>
        <ol v-if="heroArticle" class="toc-list">
          <li v-for="heading in headings" :key="heading.id" class="toc-item" :class="{
            'active': activeHeading === heading.id,
            [`level-${heading.level}`]: true
          }">
            <a :href="`#${heading.id}`" class="toc-link" @click.prevent="scrollToHeading(heading.id)">
              {{ heading.text }}
            </a>
          </li>
        </ol>
        <ol v-else>
          <template v-for="item in mockCatalog" :key="item.id">
            <li>{{ item.text }}</li>
          </template>
        </ol>
      </nav>

      <!-- 文章正文: use a stable container to avoid remounting and layout flicker -->
      <div class="article-content article-container" :class="{ 'is-loading': searchLoading }">
        <div class="article-content-inner" :aria-busy="searchLoading">
          <!-- Safe render article HTML and expose inner root via ref -->
          <SafeHtmlRenderer :html="heroArticle?.content || homeContent" ref="contentRef" />
          <!-- <SafeHtmlToVNodes :html="heroArticle?.content || homeContent" ref="contentRef" /> -->
        </div>
      </div>

      <!-- centered reactions -->
      <div class="article-reactions" role="group" aria-label="article reactions">
        <button class="reaction-btn like-btn" @click="handleLike" aria-label="喜欢">
          <FaIcon :icon="faThumbsUp" />
          <span class="reaction-count" :class="{ bump: likeBump }">{{ (heroArticle?.likeCount ?? 0) }}</span>
        </button>
        <button class="reaction-btn dislike-btn" @click="handleDislike" aria-label="不喜欢">
          <FaIcon :icon="faThumbsDown" />
          <span class="reaction-count" :class="{ bump: dislikeBump }">{{ (heroArticle?.dislikeCount ?? 0) }}</span>
        </button>
      </div>

      <!-- 文章脚注 -->
      <footer class="article-footer">
        <!-- 标签 -->
        <div class="tags">
          <template v-if="heroArticle">
            <span v-if="tags.length" class="tag-label">标签:</span>
            <span v-for="tag in tags" :key="tag.id" class="tag" @click="filterByTag(tag.id)"
              :style="{ '--tag-color-rgb': tagColorRgb(tag.color) }">
              #{{ tag.name }}
            </span>
          </template>
          <template v-else>
            <span v-for="(tag, index) in mockTags" :key="index" class="tag">
              <span class="tag">
                #{{ tag }}
              </span>
            </span>
          </template>
        </div>

        <!-- 分享 -->
        <div class="share">
          <span>分享：</span>
          <FaIcon :icon="faTwitter" class="share-icon" @click="handleSharePlatform('Twitter')" />
          <FaIcon :icon="faWeibo" class="share-icon" @click="handleSharePlatform('Weibo')" />
          <FaIcon :icon="faQq" class="share-icon" @click="handleSharePlatform('QQ')" />

        </div>
      </footer>
    </article>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { faSearch, faList, faLink, faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons'
import { faTwitter, faWeibo, faQq } from '@fortawesome/free-brands-svg-icons'
import { ElMessage } from 'element-plus'
import { useArticleStore } from '@/stores/article'
import type { Article, Tag } from '@/types/article'
import useDebouncedRef from '@/composables/useDebouncedRef'
import SafeHtmlRenderer from '@/components/core/SafeHtmlRenderer.vue'
import SafeHtmlToVNodes from '@/components/core/SafeHtmlToVNodes.vue'
import LoadingSpinner from '@/components/core/LoadingSpinner.vue'
import { homeContent, mockLatestArticles, mockCatalog, mockTags } from '@/mock/mockHome'
import { formatDate, getDisplayWordCount, getReadTimeMedium, tagColorRgb } from '@/utils/cabinet'
import {
  DEBOUNCED_INPUT_DELAY,
  DEFAULT_READ_TIME,
  DEFAULT_WORD_COUNT
} from '@/utils/constant'

// mock data (mockLatestArticles, mockCatalog, mockTags) imported from mockHome

const tags = ref<Tag[]>([])
const wordCount = ref<number>(DEFAULT_WORD_COUNT)
const readTime = ref<string>(DEFAULT_READ_TIME)
// 目录相关
const headings = ref<Array<{ id: string, text: string, level: number }>>([])
const activeHeading = ref('')
const contentRef = ref<HTMLElement>()
const likeBump = ref(false)
const dislikeBump = ref(false)

// 事件处理
const handleLike = async () => {
  if (heroArticle.value?.id) {
    try {
      await articleStore.likeArticle({ id: heroArticle.value.id })
    } catch (err) {
      console.warn('like failed', err)
    }
    // optimistic local update so UI shows incremented value
    if (typeof heroArticle.value.likeCount === 'number') {
      heroArticle.value = { ...heroArticle.value, likeCount: (heroArticle.value.likeCount || 0) + 1 }
    } else {
      heroArticle.value = { ...heroArticle.value, likeCount: 1 }
    }
    // trigger bump animation
    likeBump.value = true
    setTimeout(() => (likeBump.value = false), 350)
  }
  ElMessage.success('感谢点赞！')
}

const handleDislike = async () => {
  if (heroArticle.value?.id) {
    try {
      await articleStore.dislikeArticle({ id: heroArticle.value.id })
    } catch (err) {
      console.warn('dislike failed', err)
    }
    if (typeof heroArticle.value.dislikeCount === 'number') {
      heroArticle.value = { ...heroArticle.value, dislikeCount: (heroArticle.value.dislikeCount || 0) + 1 }
    } else {
      heroArticle.value = { ...heroArticle.value, dislikeCount: 1 }
    }
    // trigger bump animation
    dislikeBump.value = true
    setTimeout(() => (dislikeBump.value = false), 350)
  }
  ElMessage.info('感谢反馈！')
}

const handleSharePlatform = (platform: string) => {
  ElMessage.info(`${platform} 正在开发中`)
}

const filterByTag = (tag: number) => {
  ElMessage.info(`正在筛选标签: ${tag}`)
  // 这里可以添加实际的筛选逻辑
}

// --- data fetching for homepage ---
const articleStore = useArticleStore()
const heroArticle = ref<Article | null>(null)
const latestArticles = ref<Article[]>([])
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchLoading = ref(false)
const searchQuery = ref('')
const debouncedSearch = useDebouncedRef(searchQuery, DEBOUNCED_INPUT_DELAY)
const router = useRouter()

const loadHomeArticles = async (search?: string) => {
  searchLoading.value = true
  try {
    // fetch 5 latest articles
    await articleStore.fetchArticles({ current: 1, size: 5, search })
    const records = (articleStore.articles || []).slice(0, 5)
    if (records && records.length) {
      latestArticles.value = records
      // pick one random from the fetched set
      const idx = Math.floor(Math.random() * records.length)
      const randomRecord = records[idx]
      if (randomRecord) {
        heroArticle.value = randomRecord
        heroArticle.value.likeCount = randomRecord.likes?.length
        wordCount.value = getDisplayWordCount(heroArticle.value.content || '')
        readTime.value = getReadTimeMedium(heroArticle.value.content || '', 300)
        tags.value = heroArticle.value.tags || []

        // 提取目录
        extractHeadings()
      }
    }
  } catch (err) {
    console.error('loadHomeArticles error', err)
  } finally {
    searchLoading.value = false
  }
}

// 提取文章标题（用于目录）
const extractHeadings = () => {
  nextTick(() => {
    if (!contentRef.value) return

    // contentRef may be the component instance (which exposes `root`) or an HTMLElement
    // Resolve to the actual DOM element to query headings from
    // @ts-ignore
    const rootEl: HTMLElement | null = (contentRef.value.root && contentRef.value.root instanceof HTMLElement)
      ? contentRef.value.root
      : // @ts-ignore
      (contentRef.value instanceof HTMLElement ? contentRef.value : null)

    if (!rootEl) return

    const headingElements = rootEl.querySelectorAll('h1, h2, h3, h4, h5, h6')
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

onMounted(() => {
  loadHomeArticles()
})

// watch debounced search and reload
watch(debouncedSearch, (val) => {
  loadHomeArticles(val || undefined)
})
</script>

<style scoped lang="scss">
$breakpoint-tablet: 1024px;
$breakpoint-mobile: 768px;
$bg-color: $base-bg-j3;
$border-color: $base-border-j2;
$shadow: $shadow-xs;
$radius: $radius-sm;

/* 主布局 */
.container {
  width: 1200px;
  margin: 2rem auto;
  padding: 0;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;

  @media (max-width: $breakpoint-tablet) {
    width: 90%;
    grid-template-columns: 1fr;
  }

  @media (max-width: $breakpoint-mobile) {
    width: 100%;
    padding: 0 1rem;
    grid-template-columns: 1fr;
  }

  /* 侧边栏 */
  .sidebar {
    position: sticky;
    top: 5rem;
    height: fit-content;

    .search-box {
      position: relative;
      margin-bottom: 2rem;

      // search input
      input {
        width: 100%;
        padding: 0.8rem 2.8rem 0.8rem 2.8rem; // room for left and right controls
        border: 1px solid rgba(5, 150, 105, 0.12); // subtle green border
        border-radius: 8px;
        background: #ffffff;
        color: var(--text-primary);
        font-size: 0.95rem;
        transition: border-color 180ms ease, box-shadow 180ms ease, transform 120ms ease;
      }

      // hover state
      &:hover input {
        border-color: rgba(5, 150, 105, 0.22);
        // transform: translateY(-1px);
      }

      // focus state
      input:focus {
        outline: none;
        border-color: var(--accent-color);
        box-shadow: 0 8px 20px rgba(5, 150, 105, 0.12);
      }

      // placeholder styling
      input::placeholder {
        color: #97a6a1;
        opacity: 1;
      }

      svg {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        transition: color 160ms ease, transform 120ms ease;
        pointer-events: none;
        /* keep clicks on input */
      }

      // icon color changes when the wrapper is hovered or any child has focus
      &:hover svg,
      &:focus-within svg {
        color: var(--accent-color);
        transform: translateY(-50%) scale(1.06);
      }
    }

    .search-left {
      position: absolute;
      left: 6px;
      top: 50%;
      transform: translateY(-50%);
      border: none;
      background: transparent;
      padding: 6px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-muted);
    }

    .search-right {
      position: absolute;
      right: 6px;
      top: 50%;
      transform: translateY(-50%);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .clear-btn {
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 1rem;
      color: var(--text-muted);
      padding: 4px 6px;
      border-radius: 6px;
    }

    .clear-btn:hover {
      background: rgba(0, 0, 0, 0.04);
      color: var(--accent-color);
    }

    .articles-list {
      h3 {
        margin-bottom: 1rem;
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-muted);
      }

      .article-preview {
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 2px solid rgba(var(--primary-color-rgb, 5, 150, 105), 0.1);

        &:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        time {
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-muted);
          display: block;
        }

        h4 {
          font-size: 1rem;
          margin-bottom: 0.5rem;

          a {
            color: var(--text-primary);
            text-decoration: none;
            transition: var(--transition);

            &:hover {
              color: var(--accent-color);
            }
          }
        }

        p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
      }
    }
  }

  /* 文章内容 */
  .content {
    width: 800px;
    margin: 0 auto;

    .article-container {
      width: 100%;
      transition: opacity 200ms ease, transform 160ms ease;
      will-change: opacity, transform;
    }

    .article-content-inner {
      transition: opacity 160ms ease, transform 160ms ease;
      min-height: 120px;
      /* keep space during content swap to reduce layout jumps */
    }

    .article-container.is-loading .article-content-inner {
      opacity: 0.96;
      transform: translateY(2px);
    }

    .article-header {
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);

      time {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: var(--text-muted);
      }

      h1 {
        margin-bottom: 1rem;
        font-family: 'Source Serif Pro', serif;
        font-size: 2.5rem;
        line-height: 1.2;
        color: var(--text-primary);
      }

      .meta {
        display: flex;
        gap: 1rem;
        font-size: 0.9rem;
        color: var(--text-secondary);

        .category {
          padding: 0.2rem 0.8rem;
          background: var(--accent-color);
          border-radius: 4px;
          color: white;
        }
      }
    }

    .toc {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: var(--bg-secondary);
      border-left: 3px solid var(--accent-color);
      border-radius: 8px;

      h3 {
        margin-bottom: 1rem;
        font-size: 1rem;
        color: var(--text-primary);

        svg {
          margin-right: 0.5rem;
          color: var(--accent-color);
        }
      }

      ol {
        padding-left: 0;
        list-style: none;

        li {
          margin-bottom: 0.7rem;
          padding-left: 0;
        }
      }

      a {
        padding: 0.3rem 0;
        display: block;
        color: var(--text-secondary);
        text-decoration: none;
        transition: var(--transition);
        font-size: 0.95rem;

        &:hover {
          color: var(--accent-color);
          transform: translateX(5px);
        }
      }
    }

    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;

      .toc-item {
        margin-bottom: 0.1rem;

        &.active {
          .toc-link {
            color: $primary-color;
            font-weight: 600;
            // background: rgba($primary-color, 0.1);
            border-left: 2px solid $primary-light;
          }
        }

        &.level-1 {
          padding-left: 0;
        }

        &.level-2 {
          padding-left: 1rem;
        }

        &.level-3 {
          padding-left: 2rem;
        }

        &.level-4 {
          padding-left: 3rem;
        }
      }
    }

    .article-body {
      font-family: 'Source Serif Pro', serif;
      font-size: 1.125rem;
      line-height: 1.8;

      &>* {
        margin-bottom: 1.5rem;
      }

      .intro {
        margin-bottom: 2rem !important;
        padding-left: 1rem;
        border-left: 3px solid var(--accent-color);
        font-size: 1.2rem;
        color: var(--text-secondary);
      }

      h2 {
        margin-top: 2.5rem;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border-color);
        font-family: 'Inter', sans-serif;
        font-size: 1.8rem;
        color: var(--text-primary);
      }

      h3 {
        margin-top: 2rem;
        margin-bottom: 1rem;
        font-family: 'Inter', sans-serif;
        font-size: 1.3rem;
      }

      blockquote {
        margin: 1.5rem 0;
        padding: 1rem 1.5rem;
        background: var(--bg-secondary);
        border-left: 4px solid var(--accent-color);
        border-radius: 0 8px 8px 0;
        color: var(--text-secondary);
        font-style: italic;
      }

      ul,
      ol {
        margin: 1rem 0;
        padding-left: 2rem;

        li {
          margin-bottom: 0.5rem;
        }
      }

      pre {
        overflow-x: auto;
        margin: 1.5rem 0;
        padding: 1.5rem;
        background: var(--code-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;

        code {
          font-family: 'Courier New', monospace;
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .language-css {
          display: block;
        }
      }

      table {
        width: 100%;
        margin: 1.5rem 0;
        border-collapse: collapse;

        th,
        td {
          padding: 0.8rem;
          border: 1px solid var(--border-color);
          text-align: left;
        }

        th {
          background: var(--bg-secondary);
          font-weight: 600;
        }
      }
    }
  }

  // .article-content {
  //   overflow-x: auto;
  //   font-size: 1.1rem;
  //   line-height: 1.8;
  //   // color: $text-primary;
  //   /* 深灰蓝，不刺眼 */
  //   color: #1e293b;

  //   :deep() {

  //     h1,
  //     h2,
  //     h3,
  //     h4,
  //     h5,
  //     h6 {
  //       margin-top: 1.2rem;
  //       margin-bottom: 0.8rem;
  //       color: $text-primary;
  //       font-weight: 600;
  //       line-height: 1.3;
  //       /* 略微收紧，更现代 */
  //       letter-spacing: -0.01em;
  //       /* 锚点跳转时留出空间 */
  //       scroll-margin-top: 1rem;
  //     }

  //     h1 {
  //       margin-top: 0.2em;
  //       margin-bottom: 0.6em;
  //       padding-bottom: 0.3rem;
  //       font-size: 2.5rem;
  //       font-weight: 700;
  //       background: linear-gradient(135deg, #1e293b 0%, #2d4a6e 100%);
  //       background-clip: text;
  //       -webkit-background-clip: text;
  //       color: transparent;
  //       letter-spacing: -0.02em;
  //       border-bottom: 2px solid #e2e8f0;
  //     }

  //     h2 {
  //       margin-top: 2rem;
  //       margin-bottom: 1rem;
  //       padding-left: 0.9rem;
  //       font-size: 1.875rem;
  //       /* 清新绿条，增加层次感 */
  //       border-left: 5px solid var(--accent-color);
  //       color: #2c3e4e;
  //     }

  //     h3 {
  //       // display: inline-block;
  //       padding: 0 0.5rem 0 0;
  //       font-size: 1.5rem;
  //       color: #2c5a6e;
  //       // background: linear-gradient(to right, #d9f0e9, transparent);
  //     }

  //     h4 {
  //       display: inline-block;
  //       margin-bottom: 0.3em;
  //       font-size: 1.25rem;
  //       font-weight: 550;
  //       color: #3b6e62;
  //       border-bottom: 1px dashed #cbd5e1;
  //     }

  //     h5 {
  //       font-size: 1.1rem;
  //       font-weight: 550;
  //       color: #4a7c6b;
  //       font-style: normal;
  //     }

  //     h6 {
  //       font-size: 1rem;
  //       font-weight: 500;
  //       color: #5f8b7a;
  //       text-transform: uppercase;
  //       letter-spacing: 0.5px;
  //     }

  //     p {
  //       margin-top: 0;
  //       margin-bottom: 0.8em;
  //     }

  //     a {
  //       color: #2c7a6e;
  //       text-decoration: none;
  //       border-bottom: 1px solid transparent;
  //       transition: all 0.3s ease;

  //       &:hover {
  //         color: #1e5a5a;
  //         border-bottom-color: #2c7a6e;
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
  //       margin: 1.5rem 0;
  //       padding: 0.8rem 1.2rem;
  //       border-left: 4px solid #b9e0c5;
  //       border-radius: 0 12px 12px 0;
  //       background-color: #f8fafc;
  //       font-style: normal;
  //       color: #2c5a5c;

  //       p {
  //         margin: 0;
  //       }
  //     }

  //     code {
  //       // background: rgba($primary-color, 0.1);
  //       // padding: 0.2rem 0.4rem;
  //       // border-radius: 4px;
  //       // font-size: 0.9em;
  //       // color: $primary-dark;
  //       padding: 0.2rem 0.4rem;
  //       font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  //       background-color: #f1f5f9;
  //       border-radius: 6px;
  //       font-size: 0.9em;
  //       color: #0f3b3b;
  //     }

  //     pre {
  //       // background: #2d2d2d;
  //       // color: #fff;
  //       // padding: 1.5rem;
  //       // border-radius: $radius;
  //       // overflow-x: auto;
  //       // margin: 1.5rem 0;
  //       /* 布局与间距 */
  //       margin: 1.5rem 0;
  //       padding: 1.25rem 1.5rem;

  //       /* 背景与边框 - 极浅灰绿，不刺眼 */
  //       background-color: #f8fafc;
  //       border: 1px solid #e2edf2;
  //       border-radius: 16px;

  //       /* 排版 */
  //       font-family: 'SF Mono', 'Menlo', 'Monaco', 'Cascadia Code', 'Consolas', monospace;
  //       font-size: 0.875rem;
  //       line-height: 1.55;

  //       /* 滚动与溢出处理 */
  //       overflow-x: auto;
  //       white-space: pre;
  //       word-break: normal;
  //       word-wrap: normal;

  //       /* 增加微妙阴影，提升层次感 */
  //       box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.03);

  //       /* 平滑滚动条（WebKit） */
  //       scrollbar-width: thin;

  //       /* 美化滚动条（可选，提升细节） */
  //       &::-webkit-scrollbar {
  //         height: 6px;
  //       }

  //       &::-webkit-scrollbar-track {
  //         background: #e9f0f3;
  //         border-radius: 10px;
  //       }

  //       &::-webkit-scrollbar-thumb {
  //         background: #b9cfda;
  //         border-radius: 10px;
  //       }

  //       &::-webkit-scrollbar-thumb:hover {
  //         background: #92b3c2;
  //       }

  //       &::before {
  //         content: '</>';
  //         margin-top: -0.3rem;
  //         margin-bottom: 0.5rem;
  //         float: right;
  //         font-size: 0.7rem;
  //         color: #9bbec7;
  //         font-family: monospace;
  //         opacity: 0.7;
  //       }

  //       code {
  //         display: block;
  //         padding: 0;
  //         background: none;
  //         border: none;
  //         border-radius: 0;
  //         font-size: inherit;
  //         color: #1e3a3a;
  //         font-weight: normal;
  //       }
  //     }

  //     ul,
  //     ol {
  //       margin: 0.8em 0 1.2em 1.5em;
  //       padding-left: 0.5rem;

  //       li {
  //         margin: 0.3em 0;

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

  //     /* 响应式调整 */
  //     @media (max-width: $breakpoint-mobile) {
  //       .prose-content h1 {
  //         font-size: 2rem;
  //       }

  //       .prose-content h2 {
  //         font-size: 1.5rem;
  //       }

  //       .prose-content h3 {
  //         font-size: 1.3rem;
  //       }

  //       .prose-content {
  //         padding: 1rem;
  //       }
  //     }
  //   }
  // }

  .article-footer {
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);

    .tags {
      margin-bottom: 1rem;

      .tag-label {
        font-size: 0.9rem;
        color: var(--text-muted);
        margin-right: 8px;
      }

      .tag {
        margin-left: 5px;
        padding: 0.3rem 0.5rem;
        font-size: 0.85rem;
        cursor: pointer;
        transition: var(--transition);
        color: rgba(var(--tag-color-rgb, 5, 150, 105), 1);
        background: rgba(var(--tag-color-rgb, 5, 150, 105), 0.1);
        border-radius: 20px;

        &:hover {
          background: rgba(var(--tag-color-rgb, 5, 150, 105), 1);
          color: white;
        }
      }
    }

    .share {
      display: flex;
      align-items: center;
      gap: 1rem;

      span {
        color: var(--text-muted);
        font-size: 0.9rem;

        a {
          color: var(--text-secondary);
          font-size: 1.2rem;
          transition: var(--transition);

          &:hover {
            color: var(--accent-color);
          }
        }
      }
    }

    .share-icon {
      cursor: pointer;
      color: var(--text-secondary);
      transition: color 0.2s, transform 0.12s;
    }

    .share-icon:hover {
      color: var(--accent-color);
      transform: translateY(-2px);
    }
  }

  /* centered reactions */
  .article-reactions {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 1rem;
    margin-bottom: 2rem;

    .reaction-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.6rem;
      border-radius: 8px;
      font-size: 1.6rem;
      /* slightly larger */
      color: var(--text-secondary);
      transition: transform 120ms ease, color 120ms ease, background 120ms ease;

      &:hover {
        transform: translateY(-4px);
        color: var(--accent-color);
        background: rgba(var(--accent-color-rgb, 231, 76, 60), 0.06);
      }
    }

    .like-btn,
    .dislike-btn {
      min-width: 64px;

      .reaction-count {
        margin-left: 0.5rem;
        font-size: 1rem;
        color: var(--text-secondary);
        display: inline-block;
        transform-origin: center;
        transition: transform 220ms cubic-bezier(.2, .8, .2, 1), color 160ms;
      }

      /* bump animation */
      @keyframes bump {
        0% {
          transform: scale(1);
        }

        30% {
          transform: scale(1.25);
        }

        60% {
          transform: scale(0.95);
        }

        100% {
          transform: scale(1);
        }
      }

      .reaction-count.bump {
        animation: bump 340ms cubic-bezier(.2, .8, .2, 1) forwards;
        color: var(--accent-color);
      }
    }
  }
}
</style>