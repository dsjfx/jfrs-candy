<template>
  <el-card class="recent-articles-card">
    <template #header>
      <div class="card-header">
        <h3 class="card-title">最近更新</h3>
      </div>
    </template>

    <div class="articles-list">
      <div v-for="article in recentArticles" :key="article.id" class="article-item" @click="goToArticle(article)">
        <div class="article-content">
          <h4 class="article-title">{{ article.title }}</h4>
          <div class="article-meta">
            <span class="article-date">
              <el-icon>
                <Calendar />
              </el-icon>
              {{ formatDate(article.publishedAt) }}
            </span>
            <span class="article-views">
              <el-icon>
                <View />
              </el-icon>
              {{ article.viewCount }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="recentArticles.length === 0" class="empty-state">
      <el-empty description="暂无文章" />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogStore } from '@/stores'
import { Calendar, View } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const router = useRouter()
const blogStore = useBlogStore()

const recentArticles = computed(() => blogStore.recentArticles)

const formatDate = (date: string) => {
  return dayjs(date).format('MM-DD')
}

const goToArticle = (article: any) => {
  router.push({ name: 'ArticleDetail', params: { id: article.id } })
}

onMounted(() => {
  if (blogStore.articles.length === 0) {
    blogStore.fetchArticles()
  }
})
</script>

<style scoped lang="scss">
.recent-articles-card {
  .card-header {
    .card-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text);
    }
  }
}

.articles-list {
  .article-item {
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border);
    cursor: pointer;
    transition: background-color 0.3s;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      .article-title {
        color: var(--color-primary);
      }
    }

    .article-content {
      .article-title {
        margin: 0 0 8px 0;
        font-size: 0.9375rem;
        font-weight: 500;
        line-height: 1.4;
        color: var(--color-text);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        transition: color 0.3s;
      }

      .article-meta {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 0.75rem;
        color: var(--color-text-secondary);

        &>span {
          display: flex;
          align-items: center;
          gap: 4px;

          .el-icon {
            font-size: 0.75rem;
          }
        }
      }
    }
  }
}

.empty-state {
  padding: 20px 0;
}
</style>