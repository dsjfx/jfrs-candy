<template>
  <div class="article-page">
    <div class="page-header">
      <div class="header-content">
        <p class="eyebrow">分类筛选</p>
        <h1>{{ categoryName }}</h1>
        <p class="summary">共 {{ filteredArticles.length }} 篇文章</p>
      </div>

      <div class="header-actions">
        <button class="ghost-btn" type="button" @click="goToAllArticles">查看全部</button>
        <button class="back-btn" type="button" @click="goBack">返回列表</button>
      </div>
    </div>

    <div v-if="!categorySlug" class="filter-panel">
      <p class="panel-title">请选择分类</p>
      <div class="chip-list">
        <button v-for="item in availableCategories" :key="item.id || item.name" type="button" class="chip"
          @click="navigateToCategory(item)">
          {{ item.name }}
          <span>{{ item.articleCount || 0 }}</span>
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <LoadingSpinner />
      <p>正在加载分类文章...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadArticles">重试</button>
    </div>

    <div v-else-if="filteredArticles.length === 0" class="empty-state">
      <EmptyState title="暂无该分类文章" description="换一个分类或稍后再试。" @refresh="loadArticles" />
    </div>

    <div v-else class="articles-list">
      <ArticleCard v-for="article in filteredArticles" :key="article.id" :article="article" :show-time="true"
        :max-tags="2" @tag-click="handleTagClick" @read-more="handleReadMore" @click="handleArticleClick" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArticleCard from '@/components/articles/ArticleCard.vue'
import EmptyState from '@/components/core/EmptyState.vue'
import LoadingSpinner from '@/components/core/LoadingSpinner.vue'
import { useArticleStore } from '@/stores/article'
import type { Article, Category } from '@/types/article'

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()

const isLoading = ref(false)
const error = ref('')

const routeValue = computed(() => {
  const raw = String(route.params.slug || route.query.category || route.query.slug || '')
  return raw ? decodeURIComponent(raw) : ''
})

const categorySlug = computed(() => routeValue.value)

const availableCategories = computed(() => {
  const unique = new Map<string, Category>()
  for (const article of articleStore.articles) {
    const category = article.category
    if (!category) continue
    const key = String(category.slug || category.name || category.id)
    if (!unique.has(key)) unique.set(key, category)
  }
  return Array.from(unique.values())
})

const categoryName = computed(() => {
  const slug = categorySlug.value
  if (!slug) return '全部分类'

  const matched = articleStore.articles.find((article) => {
    const category = article.category
    if (!category) return false
    return [category.slug, category.name, String(category.id)].includes(slug)
  })

  return matched?.category?.name || slug
})

const filteredArticles = computed(() => {
  const slug = categorySlug.value
  if (!slug) return articleStore.articles

  return articleStore.articles.filter((article) => {
    const category = article.category
    if (!category) return false
    return [category.slug, category.name, String(category.id)].includes(slug)
  })
})

const loadArticles = async () => {
  isLoading.value = true
  error.value = ''

  try {
    await articleStore.fetchArticles({
      current: 1,
      size: 200,
      status: 'published',
      category: categorySlug.value || undefined,
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载文章失败'
  } finally {
    isLoading.value = false
  }
}

const navigateToCategory = (category: Category) => {
  const target = category.slug || category.name || String(category.id)
  router.push({ name: 'CategoryArticles', params: { slug: encodeURIComponent(target) } })
}

const handleTagClick = (tagName: string) => {
  router.push({ name: 'TagArticles', params: { slug: encodeURIComponent(tagName) } })
}

const handleReadMore = (article: Article) => {
  router.push(`/articles/${article.id}`)
}

const handleArticleClick = (article: Article) => {
  router.push(`/articles/${article.id}`)
}

const goToAllArticles = () => {
  router.push({ name: 'Articles' })
}

const goBack = () => {
  router.push({ name: 'Articles' })
}

watch(
  () => route.params.slug,
  () => {
    loadArticles()
  },
  { immediate: true }
)

onMounted(() => {
  loadArticles()
})
</script>

<style scoped lang="scss">
.article-page {
  width: min(1200px, calc(100% - 32px));
  margin: 0 auto;
  padding: 2rem 0 4rem;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(5, 150, 105, 0.2);
}

.header-content {
  .eyebrow {
    margin: 0 0 0.5rem;
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #059669;
    font-weight: 700;
  }

  h1 {
    margin: 0;
    font-size: clamp(2rem, 3vw, 3rem);
    color: #111827;
  }

  .summary {
    margin: 0.5rem 0 0;
    color: #6b7280;
    font-size: 0.95rem;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ghost-btn,
.back-btn {
  border: 1px solid rgba(5, 150, 105, 0.2);
  background: #f0fdf4;
  color: #065f46;
  border-radius: 999px;
  padding: 0.7rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #059669;
    color: #fff;
  }
}

.filter-panel {
  margin-bottom: 2rem;
  padding: 1.25rem;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.05), rgba(15, 118, 110, 0.04));
  border: 1px solid rgba(5, 150, 105, 0.12);
}

.panel-title {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #047857;
  font-weight: 700;
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.65rem 0.95rem;
  border: 1px solid rgba(5, 150, 105, 0.2);
  background: white;
  color: #065f46;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #059669;
    color: #fff;
  }

  span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.4rem;
    height: 1.4rem;
    padding: 0 0.35rem;
    border-radius: 999px;
    background: rgba(5, 150, 105, 0.08);
    font-size: 0.75rem;
  }
}

.loading-state,
.error-state,
.empty-state {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #4b5563;
}

.error-state {
  button {
    margin-top: 1rem;
    border: none;
    border-radius: 999px;
    background: #059669;
    color: white;
    padding: 0.8rem 1.2rem;
    cursor: pointer;
  }
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
