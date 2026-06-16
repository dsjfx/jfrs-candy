<template>
  <div class="main-content">
    <!-- 左侧文章列表 -->
    <div class="articles-section">
      <!-- 文章列表 -->
      <div class="articles-list">
        <!-- 文章项1 -->
        <article class="article-card" v-for="article in articles" :key="article.id">
          <div class="article-header">
            <span class="article-category" :style="{ backgroundColor: getCategoryColor(article.category) }">
              {{ article.category }}
            </span>
            <span class="article-comments" v-if="article.comments > 0">
              <i class="comment-icon">💬</i> {{ article.comments }}条评论
            </span>
          </div>

          <h2 class="article-title">
            {{ article.title }}
            <span class="article-time" v-if="article.date">{{ article.date }}</span>
          </h2>

          <p class="article-summary">{{ article.summary }}</p>

          <div class="article-footer">
            <div class="article-meta">
              <span class="article-date">
                <i class="date-icon">📅</i> {{ formatDate(article.publishedAt) }}
              </span>
              <span class="article-tags">
                <span class="tag" v-for="tag in article.tags" :key="tag">
                  #{{ tag }}
                </span>
              </span>
            </div>
            <a href="#" class="read-more">阅读全文 →</a>
          </div>
        </article>
      </div>
    </div>

    <!-- 右侧侧边栏 -->
    <aside class="sidebar">
      <!-- 个人简介 -->
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar">🍓</div>
          <div class="profile-info">
            <h3 class="profile-name">草莓熟了</h3>
            <p class="profile-bio">记录生活点滴，分享读书旅行</p>
          </div>
        </div>
        <div class="profile-stats">
          <div class="stat">
            <span class="stat-number">{{ totalArticles }}</span>
            <span class="stat-label">篇文章</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ totalComments }}</span>
            <span class="stat-label">条评论</span>
          </div>
        </div>
      </div>

      <!-- 分类统计 -->
      <div class="widget">
        <h3 class="widget-title">📚 分类</h3>
        <ul class="category-list">
          <li v-for="category in categories" :key="category.name">
            <span class="category-name">{{ category.name }}</span>
            <span class="category-count">{{ category.count }}</span>
          </li>
        </ul>
      </div>

      <!-- 最近文章 -->
      <div class="widget">
        <h3 class="widget-title">🕒 最近更新</h3>
        <ul class="recent-posts">
          <li v-for="post in recentPosts" :key="post.id">
            <a href="#" class="recent-post-title">{{ post.title }}</a>
            <span class="recent-post-date">{{ post.date }}</span>
          </li>
        </ul>
      </div>

      <!-- 标签云 -->
      <div class="widget">
        <h3 class="widget-title">🏷️ 标签</h3>
        <div class="tag-cloud">
          <span class="tag-cloud-item" v-for="tag in tagCloud" :key="tag" :style="{ fontSize: tag.size + 'px' }">
            {{ tag.name }}
          </span>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Article } from '@/types/article'

// 主色调
const primaryColor = '#059669'

const articles = ref<Article[]>([
  {
    id: 1,
    title: '秋日读书笔记：山月记中的自我追寻',
    summary: '读《山月记》最触动我的是那句"我深怕自己本非美玉，故而不敢加以刻苦琢磨..."，这句话道出了多少人在自我认知与价值实现之间的挣扎...',
    category: '书评',
    tags: ['读书', '文学', '感悟'],
    publishedAt: '2026-01-19',
    comments: 12
  },
  {
    id: 2,
    title: '草莓熟了',
    summary: '欢迎本博客的小公主：草莓。时间过得真快，转眼间我们的家庭迎来了新成员...',
    category: '日记',
    tags: ['生活', '家庭', '成长'],
    publishedAt: '2025-01-19',
    date: '2025-01-19',
    comments: 12
  },
  {
    id: 3,
    title: '我的2025：新阶段',
    summary: '例行年度总结，总结维度和去年相同，顺序略有调整。今年在生活上有买房、装修、结婚、生娃几件事...',
    category: '日记',
    tags: ['年度总结', '生活', '工作'],
    publishedAt: '2025-01-11',
    date: '2025-01-11',
    comments: 14
  },
  {
    id: 4,
    title: '武汉新天地周末随记',
    summary: '周末难得闲暇，天气也正好，一家人一拍即合，决定出门走走。目的地选在了武汉新天地...',
    category: '旅行',
    tags: ['旅行', '武汉', '家庭'],
    publishedAt: '2026-01-20',
    date: '2026-01-20',
    comments: 4
  },
  {
    id: 5,
    title: '谁在偷听我的电话？一次"AI速记"引发的隐私困惑',
    summary: '昨天中午，我给银行打电话咨询业务，通话一分多钟时，手机突然弹出一个提示界面，说可以使用"AI速记"...',
    category: '生活',
    tags: ['科技', '隐私', 'AI'],
    publishedAt: '2026-01-09',
    date: '2026-01-09',
    comments: 4
  },
  {
    id: 6,
    title: '晨间日记的实践：如何通过写作整理思绪',
    summary: '坚持写晨间日记三个月，最大的收获不是记录了多少内容，而是培养了一种与自我对话的习惯...',
    category: '随笔',
    tags: ['写作', '习惯', '自我成长'],
    publishedAt: '2025-12-28',
    comments: 8
  },
  {
    id: 7,
    title: '车辆第一次出故障',
    summary: '前两天早上和往常一样下班前提前把车启动车辆，发现远程系统自动启动了远程...',
    category: '生活',
    tags: ['汽车', '生活记录'],
    publishedAt: '2025-11-21',
    date: '2025-11-21',
    comments: 13
  }
])

// 分类数据
const categories = ref([
  { name: '日记', count: 12 },
  { name: '生活', count: 8 },
  { name: '旅行', count: 6 },
  { name: '书评', count: 5 },
  { name: '随笔', count: 7 }
])

// 最近文章
const recentPosts = ref([
  { id: 1, title: '武汉新天地周末随记', date: '2026-01-20' },
  { id: 2, title: 'AI速记引发的隐私困惑', date: '2026-01-09' },
  { id: 3, title: '2025年最后一天', date: '2025-12-31' },
  { id: 4, title: '35岁生日在横店', date: '2025-12-13' },
  { id: 5, title: '苏州园林漫步', date: '2025-11-30' }
])

// 标签云
const tagCloud = ref([
  { name: '生活', size: 16 },
  { name: '读书', size: 14 },
  { name: '旅行', size: 18 },
  { name: '家庭', size: 15 },
  { name: '工作', size: 12 },
  { name: '科技', size: 13 },
  { name: '写作', size: 14 },
  { name: '感悟', size: 12 }
])

// 计算属性
const totalArticles = computed(() => articles.value.length)
const totalComments = computed(() => articles.value.reduce((sum, article) => sum + article.comments, 0))

// 方法
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

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
</script>

<style lang="scss" scoped>
// 变量定义
$primary-color: #059669;
$primary-light: #10B981;
$primary-dark: #047857;
$text-primary: #1F2937;
$text-secondary: #6B7280;
$text-light: #9CA3AF;
$bg-color: #F9FAFB;
$card-bg: #FFFFFF;
$border-color: #E5E7EB;
$shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
$shadow-hover: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
$radius: 8px;

// 主要内容区域
.main-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto 3rem;
  padding: 0 1rem;
  flex: 1;
}

// 文章列表样式
.articles-section {
  .articles-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
}

.article-card {
  background: $card-bg;
  border-radius: $radius;
  padding: 1.5rem;
  box-shadow: $shadow;
  transition: all 0.3s ease;
  border: 1px solid $border-color;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-hover;
    border-color: $primary-light;
  }

  .article-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

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

  .article-comments {
    font-size: 0.85rem;
    color: $text-light;

    .comment-icon {
      margin-right: 0.25rem;
    }
  }

  .article-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;

    .article-time {
      font-size: 0.9rem;
      color: $primary-color;
      font-weight: 500;
      background: rgba($primary-color, 0.1);
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
    }
  }

  .article-summary {
    color: $text-secondary;
    margin-bottom: 1rem;
    line-height: 1.7;
  }

  .article-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid $border-color;
  }

  .article-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .article-date {
    font-size: 0.85rem;
    color: $text-light;

    .date-icon {
      margin-right: 0.25rem;
    }
  }

  .article-tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;

    .tag {
      font-size: 0.8rem;
      color: $primary-color;
      background: rgba($primary-color, 0.1);
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        background: $primary-color;
        color: white;
      }
    }
  }

  .read-more {
    color: $primary-color;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.3s ease;

    &:hover {
      color: $primary-dark;
      transform: translateX(3px);
    }
  }
}

// 侧边栏样式
.sidebar {
  position: sticky;
  top: 2rem;
  align-self: flex-start;

  .widget {
    background: $card-bg;
    border-radius: $radius;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
    box-shadow: $shadow;
    border: 1px solid $border-color;
  }

  .widget-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}

// 个人简介卡片
.profile-card {
  .profile-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .avatar {
    font-size: 2.5rem;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, $primary-color, $primary-light);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .profile-info {
    .profile-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 0.25rem;
    }

    .profile-bio {
      font-size: 0.9rem;
      color: $text-secondary;
    }
  }

  .profile-stats {
    display: flex;
    justify-content: space-around;
    padding-top: 1rem;
    border-top: 1px solid $border-color;

    .stat {
      text-align: center;

      .stat-number {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
        color: $primary-color;
      }

      .stat-label {
        font-size: 0.85rem;
        color: $text-light;
      }
    }
  }
}

// 分类列表
.category-list {
  list-style: none;

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba($border-color, 0.5);

    &:last-child {
      border-bottom: none;
    }

    .category-name {
      color: $text-primary;
      font-weight: 500;
    }

    .category-count {
      color: $primary-color;
      font-weight: 600;
      background: rgba($primary-color, 0.1);
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.85rem;
    }
  }
}

// 最近文章列表
.recent-posts {
  list-style: none;

  li {
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba($border-color, 0.5);

    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .recent-post-title {
      display: block;
      color: $text-primary;
      text-decoration: none;
      font-weight: 500;
      margin-bottom: 0.25rem;
      transition: color 0.3s ease;

      &:hover {
        color: $primary-color;
      }
    }

    .recent-post-date {
      font-size: 0.8rem;
      color: $text-light;
    }
  }
}

// 标签云
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  .tag-cloud-item {
    color: $primary-color;
    background: rgba($primary-color, 0.1);
    padding: 0.3rem 0.7rem;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: $primary-color;
      color: white;
      transform: scale(1.05);
    }
  }
}

// 底部样式
.blog-footer {
  background: $text-primary;
  color: white;
  text-align: center;
  padding: 1.5rem 0;
  margin-top: auto;

  p {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .color-sample {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 2px;
    margin: 0 0.25rem;
    vertical-align: middle;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .sidebar {
    position: static;
    order: -1;
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

  .article-card {
    .article-title {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .article-footer {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
  }
}

@media (max-width: 480px) {
  .nav-menu {
    flex-direction: column;
    gap: 0.5rem;
  }

  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>