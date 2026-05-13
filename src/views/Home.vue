<template>
  <div class="container">

    <!-- 左侧文章列表 -->
    <aside class="sidebar">
      <div class="search-box">
        <input v-model="searchQuery" type="text" placeholder="搜索文章..." id="searchInput">
        <FaIcon :icon="faSearch" />
      </div>
      <div class="articles-list">
        <h3>最新文章</h3>
        <template v-if="latestArticles.length">
          <article v-for="item in latestArticles" :key="item.id" class="article-preview">
            <time :datetime="item.createdAt">{{ formatDate(item.createdAt) }}</time>
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
            <time :datetime="item.createdAt">{{ formatDate(item.createdAt) }}</time>
            <h4>{{ item.title }}</h4>
            <p>{{ item.summary }}</p>
          </article>
        </template>
      </div>
    </aside>

    <!-- 右侧文章内容 -->
    <article class="content">
      <header class="article-header">
        <time v-if="heroArticle" :datetime="heroArticle.createdAt">
          {{ formatDate(heroArticle.createdAt) }} • 阅读时间 {{ readTime }}
        </time>
        <time v-else datetime="2023-10-15">2023年10月15日 • 阅读时间 5分钟</time>
        <h1>{{ heroArticle?.title || '如何保持极简主义生活与工作平衡' }}</h1>
        <div class="meta">
          <span class="category">{{ heroArticle?.category?.name || '生活哲学' }}</span>
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

      <!-- 文章正文 -->
      <div v-if="heroArticle?.content" class="article-content" ref="contentRef">
        <div v-html="heroArticle.content"></div>
      </div>
      <div v-else class="article-body">
        <p class="intro">在信息爆炸的时代，极简主义不仅是一种设计风格，更是一种生存策略。本文将分享如何在生活与工作中找到简化之道。</p>

        <h2 id="section1">1. 什么是真正的极简主义</h2>
        <p>极简主义不是单纯地减少物品，而是有意识地保留最重要的事物，消除干扰。它适用于物理空间、数字环境以及思维方式。</p>

        <blockquote>
          “简单是复杂的最终形式。” —— 列奥纳多·达·芬奇
        </blockquote>

        <h2 id="section2">2. 数字断舍离实践</h2>
        <p>每天我们花费数小时在数字设备上。以下是一些实践建议：</p>
        <ul>
          <li>关闭非必要通知</li>
          <li>使用专注模式应用</li>
          <li>定期清理订阅和收藏</li>
        </ul>

        <h2 id="section3">3. 工作空间的简化</h2>
        <p>物理环境直接影响效率。一个简洁的工作桌应只包含：</p>
        <ol>
          <li>当前任务所需物品</li>
          <li>一件提升心情的物品（如植物）</li>
          <li>必要的工作设备</li>
        </ol>

        <!-- 代码示例 -->
        <h3>CSS 极简重置示例</h3>
        <pre><code class="language-css">
        /* 极简CSS重置 */
        * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        }

        body {
        font-family: 'Inter', sans-serif;
        line-height: 1.6;
        color: var(--text-primary);
        background: var(--bg-primary);
        }

        :root {
        --bg-primary: #ffffff;
        --text-primary: #2c3e50;
        --accent-color: #e74c3c;
        }
      </code></pre>

        <h2 id="section4">4. 持续维护的习惯</h2>
        <p>极简主义需要定期维护。建议每周花15分钟：</p>
        <table>
          <tr>
            <th>周一</th>
            <th>周三</th>
            <th>周五</th>
          </tr>
          <tr>
            <td>清理邮箱</td>
            <td>整理书签</td>
            <td>归档文件</td>
          </tr>
        </table>
      </div>

      <!-- 文章脚注 -->
      <footer class="article-footer">
        <div class="tags">
          <template v-if="heroArticle">
            <span v-if="tags.length">标签:</span>
            <span v-for="tag in tags" :key="tag.id" class="tag" @click="filterByTag(tag.id)">
              #{{ tag.name }}
            </span>
          </template>
          <template v-else>
            <span v-for="(tag, index) in mockTags" :key="index" class="tag">
              #{{ tag }}
            </span>
          </template>
        </div>
        <div class="share">
          <span>分享：</span>
          <FaIcon :icon="faTwitter" />
          <FaIcon :icon="faWeibo" />
          <FaIcon :icon="faLink" />
        </div>
      </footer>
    </article>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { faSearch, faList, faLink } from '@fortawesome/free-solid-svg-icons'
import { faTwitter, faWeibo } from '@fortawesome/free-brands-svg-icons'
import { ElMessage } from 'element-plus'
import { useArticleStore } from '@/stores/article'
import type { Article, Tag } from '@/types/article'
import { formatDate, getDisplayWordCount, getReadTimeMedium } from '@/utils/cabinet'
import useDebouncedRef from '@/composables/useDebouncedRef'

interface mocklatestArticle {
  id: number
  title: string
  summary: string
  createdAt: string
}
const mockLatestArticles: mocklatestArticle[] = [
  {
    id: 1,
    title: '如何保持极简主义生活与工作平衡',
    summary: '探讨在数字时代如何简化工作流程，减少干扰...',
    createdAt: '2023-10-15T10:00:00Z'
  },
  {
    id: 2,
    title: '现代CSS布局的实用技巧',
    summary: 'Flexbox、Grid和容器查询的实际应用案例...',
    createdAt: '2023-10-10T14:30:00Z'
  },
  {
    id: 3,
    title: '为什么写作是思考的最佳工具',
    summary: '写作不仅是表达，更是理清思维的过程...',
    createdAt: '2023-10-05T09:15:00Z'
  }
]
const mockCatalog = [
  { id: 1, text: '什么是真正的极简主义', level: 2 },
  { id: 2, text: '数字断舍离实践', level: 2 },
  { id: 3, text: '工作空间的简化', level: 2 },
  { id: 4, text: '持续维护的习惯', level: 2 }
]

// 标签数据
const mockTags = ref<string[]>(['极简主义', '技术', '生活', '写作', '设计'])
const tags = ref<Tag[]>([])

const wordCount = ref<number>(1200)
const readTime = ref<string>('5分钟')
// 目录相关
const headings = ref<Array<{ id: string, text: string, level: number }>>([])
const activeHeading = ref('')
const contentRef = ref<HTMLElement>()

// 事件处理
const handleLike = () => {
  ElMessage.success('感谢点赞！')
}

const handleShare = () => {
  ElMessage.info('分享功能开发中...')
}

const handleClap = () => {
  ElMessage.success('👏 感谢支持！')
}

const filterByTag = (tag: number) => {
  ElMessage.info(`正在筛选标签: ${tag}`)
  // 这里可以添加实际的筛选逻辑
}

// --- data fetching for homepage ---
const articleStore = useArticleStore()
const heroArticle = ref<Article | null>(null)
const latestArticles = ref<Article[]>([])
const searchQuery = ref('')
const debouncedSearch = useDebouncedRef(searchQuery, 350)
const router = useRouter()

const loadHomeArticles = async (search?: string) => {
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
        wordCount.value = getDisplayWordCount(heroArticle.value.content || '')
        readTime.value = getReadTimeMedium(heroArticle.value.content || '', 300)
        tags.value = heroArticle.value.tags || []

        // 提取目录
        extractHeadings()
      }
    }
  } catch (err) {
    console.error('loadHomeArticles error', err)
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
$bg-color: $base-bg-j3;
$border-color: $base-border-j2;
$shadow: $shadow-xs;
$radius: $radius-sm;

/* 主布局 */
.container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 3rem;

  /* 侧边栏 */
  .sidebar {
    position: sticky;
    top: 5rem;
    height: fit-content;

    .search-box {
      position: relative;
      margin-bottom: 2rem;

      input {
        width: 100%;
        padding: 0.8rem 1rem 0.8rem 2.5rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-secondary);
        color: var(--text-primary);
        font-size: 0.9rem;
        transition: var(--transition);
      }

      input:focus {
        outline: none;
        border-color: var(--accent-color);
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
      }

      svg {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
      }
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

  .tags {
    h3 {
      margin-bottom: 1rem;
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
    }

    .tag-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag {
      cursor: pointer;
      background: var(--bg-secondary);
      color: var(--text-secondary);
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.85rem;
      transition: var(--transition);

      &:hover {
        background: var(--accent-color);
        color: white;
      }
    }
  }

  /* 文章内容 */
  .content {
    max-width: 800px;
    margin: 0 auto;

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

  .article-content {
    overflow-x: auto;
    font-size: 1.1rem;
    line-height: 1.8;
    color: $text-primary;

    :deep() {

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        color: $text-primary;
        margin-top: 2rem;
        margin-bottom: 1rem;
        font-weight: 600;
        scroll-margin-top: 80px;
      }

      h1 {
        font-size: 1.8rem;
      }

      h2 {
        font-size: 1.6rem;
        // border-bottom: 2px solid $primary-light;
        padding-bottom: 0.5rem;
      }

      h3 {
        font-size: 1.4rem;
      }

      h4 {
        font-size: 1.2rem;
      }

      p {
        margin-bottom: 1.5rem;
      }

      a {
        color: $primary-color;
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition: all 0.3s ease;

        &:hover {
          border-bottom-color: $primary-color;
        }
      }

      img {
        max-width: 100%;
        height: auto;
        border-radius: $radius;
        margin: 1.5rem 0;
        box-shadow: $shadow;
      }

      blockquote {
        border-left: 4px solid $primary-color;
        margin: 1.5rem 0;
        padding: 1rem 1.5rem;
        background: rgba($primary-color, 0.05);
        border-radius: 0 $radius $radius 0;
        color: $text-secondary;

        p {
          margin: 0;
        }
      }

      code {
        background: rgba($primary-color, 0.1);
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        font-size: 0.9em;
        color: $primary-dark;
      }

      pre {
        background: #2d2d2d;
        color: #fff;
        padding: 1.5rem;
        border-radius: $radius;
        overflow-x: auto;
        margin: 1.5rem 0;

        code {
          background: none;
          padding: 0;
          color: inherit;
        }
      }

      ul,
      ol {
        margin: 1.5rem 0;
        padding-left: 1.5rem;

        li {
          margin-bottom: 0.5rem;

          &::marker {
            color: $primary-color;
          }
        }
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.5rem 0;

        th,
        td {
          padding: 0.75rem 1rem;
          border: 1px solid $border-color;
          text-align: left;
        }

        th {
          background: rgba($primary-color, 0.1);
          font-weight: 600;
          color: $text-primary;
        }

        tr:nth-child(even) {
          background: $bg-color;
        }
      }
    }
  }

  .article-footer {
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);

    .tags {
      margin-bottom: 1rem;

      a {
        margin-right: 0.5rem;
        padding: 0.3rem 0.8rem;
        background: var(--bg-secondary);
        border-radius: 4px;
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 0.9rem;
        transition: var(--transition);

        &:hover {
          background: var(--accent-color);
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
  }
}
</style>