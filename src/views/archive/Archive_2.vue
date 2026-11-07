<template>
  <div class="archive-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">文章归档</h1>
      <p class="page-subtitle">共计 {{ totalArticles }} 篇文章，按时间线记录成长</p>
    </div>

    <!-- 移动端专用：分类和标签快捷滑动条 -->
    <div class="mobile-quick-nav">
      <div class="scroll-wrap">
        <router-link to="/archive/categories" class="quick-item">📁 全部分类</router-link>
        <router-link to="/archive/tags" class="quick-item">🏷️ 全部标签</router-link>
        <router-link v-for="tag in topTags" :key="tag.id" :to="`/archive/tags/${tag.slug}'`" class="quick-item tag">
          #{{ tag.name }}
        </router-link>
      </div>
    </div>

    <!-- 主体布局：左侧列表 + 右侧边栏 -->
    <div class="archive-container">

      <!-- ================= 左侧：时间轴与折叠面板 ================= -->
      <div class="main-timeline">
        <div v-for="yearGroup in groupedByYear" :key="yearGroup.year" class="year-block">
          <!-- 左侧圆点装饰线 -->
          <div class="timeline-dot"></div>

          <div class="year-card">
            <!-- 卡片头部（点击展开/收起） -->
            <div class="card-header" @click="toggleYear(yearGroup.year)">
              <div class="header-left">
                <span class="year-title">{{ yearGroup.year }}</span>
                <span class="article-count-badge">{{ yearGroup.totalCount }}</span>
              </div>
              <button class="toggle-btn">
                {{ expandedYears.includes(yearGroup.year) ? '收起' : '展开' }}
              </button>
            </div>

            <!-- 月份折叠列表 -->
            <div v-show="expandedYears.includes(yearGroup.year)" class="months-container">
              <div v-for="monthGroup in yearGroup.months" :key="monthGroup.month" class="month-block">
                <div class="month-header">
                  <div class="month-name">
                    <span class="arrow">❯</span>
                    {{ monthGroup.month }} 月
                  </div>
                  <span class="month-count">{{ monthGroup.articles.length }}</span>
                </div>

                <!-- 文章列表 -->
                <ul class="article-list">
                  <li v-for="article in monthGroup.articles" :key="article.id">
                    <span class="date">{{ formatDate(article.createdAt) }}</span>
                    <router-link :to="`/article/${article.slug}`" class="article-title">
                      {{ article.title }}
                    </router-link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= 右侧：侧边栏 (PC端显示，移动端隐藏) ================= -->
      <aside class="sidebar">

        <!-- 1. 年份导航卡片 -->
        <div class="sidebar-card">
          <h3 class="sidebar-title">年份</h3>
          <ul class="year-nav">
            <li v-for="yearGroup in groupedByYear" :key="yearGroup.year">
              <button @click="scrollToYear(yearGroup.year)" class="year-nav-btn">
                <span class="nav-year">{{ yearGroup.year }}</span>
                <span class="nav-count">{{ yearGroup.totalCount }}</span>
              </button>
            </li>
          </ul>
        </div>

        <!-- 2. 分类卡片 -->
        <div class="sidebar-card">
          <h3 class="sidebar-title">分类</h3>
          <div class="category-list">
            <router-link v-for="cat in categories" :key="cat.id" :to="`/archive/categories/${cat.slug}`"
              class="category-item">
              <span class="cat-name">📁 {{ cat.name }}</span>
              <span class="cat-count">{{ cat.articleCount }}</span>
            </router-link>
            <router-link to="/archive/categories" class="view-all">查看全部分类 ❯</router-link>
          </div>
        </div>

        <!-- 3. 标签云卡片 -->
        <div class="sidebar-card">
          <h3 class="sidebar-title">热门标签</h3>
          <div class="tag-cloud">
            <router-link v-for="tag in tags" :key="tag.id" :to="`/tags/${tag.slug}`" class="tag-item"
              :class="`tag-size-${getTagSize(tag.articleCount)}`">
              #{{ tag.name }}
            </router-link>
          </div>
          <router-link to="/tags" class="view-all mt-2">查看全部标签 ❯</router-link>
        </div>

      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useArticleStore } from '@/stores/article'
import { useCategoryStore } from '@/stores/category'
import { useTagStore } from '@/stores/tag'

const articleStore = useArticleStore()
const categoryStore = useCategoryStore()
const tagStore = useTagStore()

// --- 数据准备 (实际请替换为你 Store 里的数据) ---
// 假设文章数据已经按需排好序
const totalArticles = computed(() => articleStore.articles.length)
const categories = computed(() => categoryStore.categories)
const tags = computed(() => tagStore.tags)
const topTags = computed(() => tagStore.tags.slice(0, 6)) // 移动端仅展示前几个

// 按年份分组数据
const groupedByYear = computed(() => {
  // ... 调用你的分组逻辑，返回类似：
  return [
    {
      year: 2026,
      totalCount: 6,
      months: [
        { month: 6, articles: [{ id: 1, title: 'Vue3 响应式原理', createdAt: '2026-06-15', slug: 'vue3' }] },
        // { month: 5, articles: [...] }
      ]
    },
    // ...
  ]
})

const expandedYears = ref(groupedByYear.value.map(g => g.year))

const toggleYear = (year) => {
  const index = expandedYears.value.indexOf(year)
  if (index > -1) expandedYears.value.splice(index, 1)
  else expandedYears.value.push(year)
}

const scrollToYear = (year) => {
  document.getElementById(`year-${year}`)?.scrollIntoView({ behavior: 'smooth' })
}

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return `${d.getDate()}日`
}

// 控制标签云字号
const getTagSize = (count) => {
  if (count > 10) return 'lg'
  if (count > 5) return 'md'
  return 'sm'
}
</script>

<style lang="scss" scoped>
$primary: #059669;
$primary-bg: #ecfdf5;
$text-main: #1f2937;
$text-sub: #6b7280;
$border: #f3f4f6;

.archive-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;

  .page-title {
    font-size: 2rem;
    font-weight: 700;
    color: $text-main;
    margin-bottom: 0.5rem;
  }

  .page-subtitle {
    color: $text-sub;
    font-size: 0.95rem;
  }
}

/* 📱 移动端快捷导航（横向滚动） */
.mobile-quick-nav {
  margin-bottom: 1.5rem;
  overflow: hidden; // 防止撑破页面

  @media (min-width: 768px) {
    display: none; // PC端隐藏
  }

  .scroll-wrap {
    display: flex;
    gap: 0.75rem;
    overflow-x: auto;
    padding-bottom: 0.5rem; // 留出滚动条空间
    -webkit-overflow-scrolling: touch; // iOS 顺滑滚动

    &::-webkit-scrollbar {
      display: none;
    }

    // 隐藏滚动条
  }

  .quick-item {
    white-space: nowrap;
    padding: 0.4rem 1rem;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    color: $text-sub;
    text-decoration: none;
    font-size: 0.85rem;
    transition: all 0.2s;

    &.tag {
      color: $primary;
    }

    &:hover {
      background: #f9fafb;
    }
  }
}

/* 🟢 核心双栏布局 */
.archive-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 260px; // 左侧自适应，右侧固定260px
    align-items: start;
  }
}

/* ================= 左侧时间轴 ================= */
.main-timeline {
  position: relative;
  padding-left: 20px;

  &::before {
    content: '';
    position: absolute;
    left: 6px;
    top: 10px;
    bottom: 0;
    width: 2px;
    background: rgba($primary, 0.15);
  }
}

.year-block {
  position: relative;
  margin-bottom: 2rem;
  scroll-margin-top: 80px; // 吸顶偏移

  .timeline-dot {
    position: absolute;
    left: -20px;
    top: 18px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: $primary;
    border: 3px solid #fff;
    box-shadow: 0 0 0 2px rgba($primary, 0.2);
    z-index: 2;
  }

  .year-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  background: #fff;

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .year-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: $text-main;
    }

    .article-count-badge {
      background: $primary-bg;
      color: $primary;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.1rem 0.5rem;
      border-radius: 20px;
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
    transition: 0.2s;

    &:hover {
      background: #f9fafb;
      color: $text-main;
    }
  }
}

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
  margin-bottom: 0.75rem;

  .month-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: $text-main;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .arrow {
      color: $text-sub;
      font-size: 0.7rem;
      transform: rotate(90deg);
    }
  }

  .month-count {
    background: $primary;
    color: #fff;
    font-size: 0.75rem;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }
}

.article-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    align-items: baseline;
    padding: 0.5rem 0;
    gap: 1rem;

    // 📱 移动端优化：取消基线对齐，改为换行
    @media (max-width: 480px) {
      flex-direction: column;
      gap: 0.2rem;
      padding: 0.6rem 0;
    }
  }

  .date {
    color: $text-sub;
    font-size: 0.85rem;
    min-width: 45px;
    font-family: monospace;
  }

  .article-title {
    color: $text-main;
    text-decoration: none;
    font-size: 0.95rem;
    line-height: 1.4;
    transition: color 0.2s;

    &:hover {
      color: $primary;
    }
  }
}


/* ================= 右侧边栏 ================= */
.sidebar {
  display: none; // 📱 手机端隐藏

  @media (min-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: sticky;
    top: 2rem; // 吸顶
  }
}

.sidebar-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);

  .sidebar-title {
    font-size: 1rem;
    font-weight: 700;
    color: $text-main;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid $primary-bg;
  }
}

/* 年份导航 */
.year-nav {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

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
    transition: 0.2s;

    &:hover {
      background: #f9fafb;
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

/* 分类列表 */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .category-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.4rem;
    color: $text-sub;
    text-decoration: none;
    font-size: 0.9rem;
    transition: 0.2s;
    border-radius: 4px;

    &:hover {
      color: $primary;
      background: $primary-bg;
    }

    .cat-count {
      font-size: 0.8rem;
      opacity: 0.7;
    }
  }
}

/* 标签云 */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  .tag-item {
    color: $primary;
    text-decoration: none;
    transition: 0.2s;

    &:hover {
      text-decoration: underline;
    }

    &.tag-size-sm {
      font-size: 0.85rem;
      opacity: 0.8;
    }

    &.tag-size-md {
      font-size: 1rem;
    }

    &.tag-size-lg {
      font-size: 1.2rem;
      font-weight: 600;
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
</style>