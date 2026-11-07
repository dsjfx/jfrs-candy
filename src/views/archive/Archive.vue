<template>
  <div class="archive-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">文章归档</h1>
      <p class="page-subtitle">“记录思考，分享生活”</p>
    </div>

    <div class="archive-layout">
      <!-- 左侧主内容：时间轴 -->
      <div class="main-timeline" ref="mainRef">
        <div v-for="yearGroup in visibleYears" :key="yearGroup.year" class="year-block" :id="`year-${yearGroup.year}`">
          <!-- 左侧时间轴圆点 -->
          <div class="timeline-dot"></div>

          <!-- 年份卡片 -->
          <div class="year-card">
            <!-- 卡片头部 -->
            <div class="card-header" @click="toggleYear(yearGroup.year)">
              <div class="header-left">
                <span class="year-title">{{ yearGroup.year }}</span>
                <span class="article-count-badge">{{ yearGroup.count }}</span>
              </div>
              <button class="toggle-btn">
                {{ expandedYears.includes(yearGroup.year) ? '收起' : '展开' }}
              </button>
            </div>

            <!-- 月份折叠列表 -->
            <div v-show="expandedYears.includes(yearGroup.year)" class="months-container">
              <div v-for="monthGroup in yearGroup.months" :key="monthGroup.month" class="month-block">
                <div class="month-header" @click="toggleMonth(monthGroup)">
                  <div class="month-name">
                    <span class="arrow">
                      <FaIcon v-if="monthGroup.expanded" :icon="['fas', 'caret-up']" />
                      <FaIcon v-else :icon="['fas', 'caret-left']" />
                    </span>
                    {{ monthGroup.month }} 月
                  </div>
                  <span class="month-count">{{ monthGroup.posts.length }}</span>
                </div>

                <!-- 文章列表 -->
                <ul class="article-list" v-show="monthGroup.expanded">
                  <li v-for="article in monthGroup.posts" :key="article.id">
                    <span class="date">{{ formatDateNoYear(article.publishedAt) }}</span>
                    <router-link :to="`/articles/${article.id}`" class="article-title">
                      {{ article.title }}
                    </router-link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- sentinel for lazy loading more years -->
        <div ref="sentinelRef" class="sentinel" />
      </div>

      <!-- 右侧侧边栏：导航与发现 -->
      <aside class="sidebar">
        <div class="sidebar-sticky">
          <!-- 年份导航 -->
          <div class="sidebar-card">
            <h3 class="sidebar-title">年份</h3>
            <ul class="year-nav">
              <li v-for="yearGroup in visibleYears" :key="yearGroup.year">
                <button @click="scrollToYear(yearGroup.year)" class="year-nav-btn">
                  <span class="nav-year">{{ yearGroup.year }}</span>
                  <span class="nav-count">{{ yearGroup.count }}</span>
                </button>
              </li>
            </ul>
          </div>

          <!-- 分类导航 -->
          <div class="sidebar-card">
            <h3 class="sidebar-title">
              <router-link to="/archive/categories" class="title-link">分类</router-link>
            </h3>
            <ul class="category-nav">
              <li v-for="cat in categories" :key="cat.id">
                <router-link :to="`/archive/categories/${cat.id}`" class="category-nav-item">
                  <span class="nav-name">{{ cat.name }}</span>
                  <span class="nav-count">{{ cat.articleCount }}</span>
                </router-link>
              </li>
            </ul>
            <router-link to="/archive/categories" class="view-all">查看全部分类 ❯</router-link>
          </div>

          <!-- 标签云 -->
          <div class="sidebar-card">
            <h3 class="sidebar-title">
              <router-link to="/archive/tags" class="title-link">标签</router-link>
            </h3>
            <div class="tag-cloud">
              <router-link v-for="tag in tags" :key="tag.id" :to="`/archive/tags/${tag.id}`" class="tag-item"
                :style="{ fontSize: getTagFontSize(tag.articleCount) }">
                #{{ tag.name }}
              </router-link>
            </div>
            <router-link to="/archive/tags" class="view-all mt-2">查看全部标签 ❯</router-link>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef, nextTick } from 'vue'
import { useArchiveStore } from '@/stores/archive'
import { useCategoryStore } from '@/stores/category'
import { useTagStore } from '@/stores/tag'
import type { ArchiveYear, Article } from '@/types'
import { formatDateNoYear } from '@/utils/cabinet'
import type { ArchiveMonth } from '@/types/archive'

// 使用 Store 获取数据
const archiveStore = useArchiveStore()
const categoryStore = useCategoryStore()
const tagStore = useTagStore()

// lazy load: initially show latest N years
const INITIAL_YEARS = 3
const visibleCount = ref(INITIAL_YEARS)

// 默认展开第一年
const expandedYears = ref<number[]>([])

const mainRef = ref<HTMLElement | null>(null)
const sentinelRef = useTemplateRef('sentinelRef')

let observer: IntersectionObserver | null = null
let loadingMore = false

const years = computed(() => (archiveStore.archiveYears || []) as ArchiveYear[])
const visibleYears = computed(() => years.value.slice(0, visibleCount.value))

const fetchArchive = async () => {
  // reset archive flags (do not clear loaded years by default)
  archiveStore.resetArchiveState({ clearYears: false })

  await archiveStore.fetchArchive({ year: undefined, month: undefined, limit: INITIAL_YEARS })
}

const fetchSidebarData = async () => {
  try {
    if (!categoryStore.categories.length) {
      await categoryStore.fetchPopularCategories(5)
    }

    if (!tagStore.tags.length) {
      await tagStore.fetchPopularTags(10)
    }
  } catch (error) {
    console.warn('Archive sidebar data load failed:', error)
  }
}

// initialize expanded states
// years.value.forEach((y, yi) => {
//   if (typeof y.expanded === 'undefined') y.expanded = yi < INITIAL_YEARS
//   y.months.forEach((m, mi) => {
//     if (typeof m.expanded === 'undefined') m.expanded = yi < INITIAL_YEARS
//   })
// })
// set up observer after DOM painted
// await nextTick()
// setupObserver()

const setupObserver = () => {
  if (!sentinelRef.value) return
  if (observer) observer.disconnect()
  observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting && !loadingMore && !archiveStore.archiveNoMore) {
        const lastYear = years.value.length ? years.value[years.value.length - 1]?.year : undefined
        const prevLen = (archiveStore.archiveYears as any[]).length

        loadingMore = true

        const startYear = lastYear ? lastYear - INITIAL_YEARS : undefined
        if (!startYear) {
          loadingMore = false
          return
        }

        archiveStore.loadMoreArchiveYears({ startYear, limit: (INITIAL_YEARS - 1) }).then(() => {
          const newLen = (archiveStore.archiveYears as any[]).length
          const added = Math.max(0, newLen - prevLen)
          if (added > 0) {
            visibleCount.value = Math.min((archiveStore.archiveYears as any[]).length, visibleCount.value + added)
          }
        }).catch(() => {
          // ignore
        }).finally(() => {
          loadingMore = false
        })
      }
    }
  }, { root: mainRef.value, threshold: 0.1 })

  observer.observe(sentinelRef.value)
}

// const articles = computed(() => {
//   // 如果没有数据，返回空数组
//   if (!articleStore.articles || articleStore.articles.length === 0)
//     return []
//   return articleStore.articles
// })

// 模拟或获取真实数据
// const groupedByYear = computed<YearGroup[]>(() => {
//   const groups: Record<number, Record<number, Article[]>> = {}

//   // 1. 按年、月分组
//   articles.value.forEach(article => {
//     if (!article.publishedAt) return

//     const date = new Date(article.publishedAt)
//     const year = date.getFullYear()
//     const month = date.getMonth() + 1

//     if (isNaN(year) || isNaN(month)) return

//     if (!groups[year]) groups[year] = {}
//     if (!groups[year][month]) groups[year][month] = []

//     groups[year][month].push(article)
//   })

//   // 2. 转换为数组格式并排序
//   const result: YearGroup[] = Object.keys(groups)
//     .map(Number)
//     .sort((a, b) => b - a) // 年份倒序
//     .map(year => {
//       if (!groups[year]) return { year, totalCount: 0, months: [] }

//       const currentYearData = groups[year] as Record<number, Article[]>
//       const months = Object.keys(currentYearData)
//         .map(Number)
//         .sort((a, b) => b - a) // 月份倒序
//         .map(month => {
//           if (!currentYearData[month]) return { month, articles: [] }

//           // 该月内文章按时间倒序
//           const articles = currentYearData[month].sort(
//             (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
//           )
//           return { month, articles }
//         })
//         .filter(m => m.articles.length > 0)

//       const totalCount = months.reduce((sum, m) => sum + m.articles.length, 0)

//       return { year, totalCount, months }
//     })

//   return result
// })

// 初始化展开第一个年份
onMounted(async () => {
  await Promise.all([
    fetchArchive(),
    fetchSidebarData(),
  ])

  if (visibleYears.value.length > 0) {
    const year = visibleYears.value[0]?.year
    if (year && !expandedYears.value.includes(year)) {
      expandedYears.value.push(year)
    }
  }
})

const categories = computed(() => categoryStore.categories || [])
const tags = computed(() => tagStore.tags || [])

// 方法
const toggleYear = (year: number) => {
  const index = expandedYears.value.indexOf(year)
  if (index > -1) {
    expandedYears.value.splice(index, 1)
  } else {
    expandedYears.value.push(year)
  }
}

const toggleMonth = (month: ArchiveMonth) => {
  month.expanded = !month.expanded
}

const scrollToYear = (year: number) => {
  const el = document.getElementById(`year-${year}`)
  if (el) {
    // 留出顶部导航栏的偏移
    const top = el.getBoundingClientRect().top + window.pageYOffset - 80
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

// 标签云字号
const getTagFontSize = (count: number) => {
  if (count > 10) return '1rem'
  if (count > 5) return '0.9rem'
  return '0.8rem'
}
</script>

<style lang="scss" scoped>
// 主题变量
$primary: #059669;
$primary-light: #ecfdf5;
$text-main: #1f2937;
$text-sub: #6b7280;
$border-color: #f3f4f6;
$bg-main: #f9fafb;
$bg-card: #ffffff;

.archive-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 3rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;

  .page-title {
    font-size: 2.2rem;
    font-weight: 700;
    color: $text-main;
    margin-bottom: 0.5rem;
  }

  .page-subtitle {
    color: $text-sub;
    font-size: 1rem;
  }
}

/* 🟢 布局：PC双栏，移动单栏 */
.archive-layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (min-width: 900px) {
    display: grid;
    grid-template-columns: 1fr 260px;
    gap: 3rem;
    align-items: start;
  }
}

/* ================= 左侧时间轴 ================= */
.main-timeline {
  position: relative;
  padding-left: 1.5rem;
}

/* 贯穿竖线 */
.main-timeline::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 10px;
  bottom: 0;
  width: 2px;
  // background: #e5e7eb;
  background: #afc592;
  z-index: 0;
}

.year-block {
  position: relative;
  margin-bottom: 2.5rem;
  scroll-margin-top: 100px; // 防止锚点跳转被头部遮挡

  .timeline-dot {
    position: absolute;
    left: -1.5rem;
    top: 1.5rem;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: $primary;
    border: 3px solid $bg-card;
    box-shadow: 0 0 0 2px $primary;
    z-index: 1;
  }

  .year-card {
    background: $bg-card;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
    overflow: hidden;
    position: relative;
    z-index: 1;
  }
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  user-select: none;

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .year-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: $text-main;
    }

    .article-count-badge {
      background: $primary-light;
      color: $primary;
      padding: 0.15rem 0.6rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }
  }

  .toggle-btn {
    padding: 0.3rem 0.8rem;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    color: $text-sub;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: $bg-main;
      color: $text-main;
    }
  }
}

/* 月份区域 */
.months-container {
  border-top: 1px dashed #e5e7eb;
  padding: 0 1.5rem;
}

.month-block {
  padding: 1rem 0;
  border-bottom: 1px dashed #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
}

.month-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  &:hover {
    cursor: pointer;
    color: var(--color-primary, $primary);
  }

  .month-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: $text-main;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .arrow {
      font-size: 0.7rem;
      color: $text-sub;
      transform: rotate(180deg);
    }
  }

  .month-count {
    background: $primary;
    color: #fff;
    font-size: 0.75rem;
    padding: 0.1rem 0.5rem;
    border-radius: 12px;
  }
}

/* 文章列表 */
.article-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    align-items: baseline;
    padding: 0.4rem 0;
    gap: 1rem;

    @media (max-width: 640px) {
      flex-direction: column;
      gap: 0.25rem;
    }
  }

  .date {
    color: $text-sub;
    font-size: 0.85rem;
    min-width: 60px;
    font-family: monospace;
  }

  .article-title {
    color: $text-main;
    text-decoration: none;
    font-size: 0.95rem;
    line-height: 1.5;
    transition: color 0.2s;

    &:hover {
      color: $primary;
      text-decoration: underline;
    }
  }
}

/* ================= 右侧侧边栏 ================= */
.sidebar {
  /* 移动端放在底部，PC端在右侧 */

  .sidebar-sticky {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    @media (min-width: 900px) {
      position: sticky;
      top: 2rem;
    }
  }

  .sidebar-card {
    background: $bg-card;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.25rem;
  }

  .sidebar-title {
    font-size: 1rem;
    font-weight: 700;
    color: $text-main;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #f3f4f6;

    .title-link {
      color: inherit;
      text-decoration: none;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &::after {
        content: '→';
        color: $text-sub;
        font-size: 0.8rem;
        opacity: 0;
        transition: opacity 0.2s;
      }

      &:hover::after {
        opacity: 1;
      }
    }
  }

  /* 年份导航 */
  .year-nav {
    list-style: none;
    padding: 0;
    margin: 0;

    .year-nav-btn {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0.5rem;
      background: transparent;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: $bg-main;
      }

      .nav-year {
        color: $text-sub;
        font-size: 0.9rem;
      }

      .nav-count {
        background: $primary;
        color: #fff;
        font-size: 0.75rem;
        padding: 0.1rem 0.5rem;
        border-radius: 12px;
      }
    }
  }

  /* 分类导航 */
  .category-nav {
    list-style: none;
    padding: 0;
    margin: 0;

    .category-nav-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      border-radius: 6px;
      text-decoration: none;
      color: $text-sub;
      font-size: 0.9rem;
      transition: all 0.2s;

      &:hover {
        background: $bg-main;
        color: $primary;
      }

      .nav-count {
        background: $primary-light;
        color: $primary;
        font-size: 0.75rem;
        padding: 0.1rem 0.5rem;
        border-radius: 12px;
      }
    }
  }

  /* 标签云 */
  .tag-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    .tag-item {
      color: $text-sub;
      text-decoration: none;
      padding: 0.2rem 0.6rem;
      background: $bg-main;
      border-radius: 6px;
      transition: all 0.2s;

      &:hover {
        background: $primary;
        color: #fff;
      }
    }
  }
}

/* 公共的查看全部链接 */
.view-all {
  display: block;
  font-size: 0.85rem;
  color: $text-sub;
  text-decoration: none;
  text-align: right;
  transition: 0.2s;

  &.mt-2 {
    margin-top: 0.75rem;
  }

  &:hover {
    color: $primary;
  }
}

/* 🟢 移动端侧边栏排版优化（横向平铺） */
@media (max-width: 899px) {
  .sidebar-sticky {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (min-width: 640px) {
    .sidebar-sticky {
      grid-template-columns: 1fr 1fr;
    }

    .sidebar-card:first-child {
      grid-column: 1 / -1;
    }
  }
}
</style>