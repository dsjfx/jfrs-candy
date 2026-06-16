<template>
  <article class="related-article-card" @click="$emit('click', article.id)">
    <div class="related-article-image" v-if="article.coverImage">
      <img :src="article.coverImage" :alt="article.title" loading="lazy" />
    </div>

    <div class="related-article-content">
      <h4 class="related-article-title">{{ article.title }}</h4>
      <div class="related-article-meta">
        <span class="related-article-date">{{ formatDate(article.publishedAt) }}</span>
        <span class="related-article-views">👁️ {{ article.views || 0 }}</span>
      </div>
      <p class="related-article-summary">{{ article.summary }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Article } from '@/types';

// interface Article {
//   id: string | number
//   title: string
//   summary: string
//   coverImage?: string
//   publishedAt: string
//   views?: number
// }

interface Props {
  article: Article
}

defineProps<Props>()
defineEmits(['click'])

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
</script>

<style lang="scss" scoped>
.related-article-card {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: white;
    border-color: #059669;
    transform: translateX(4px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .related-article-image {
    flex-shrink: 0;
    width: 80px;
    height: 80px;
    border-radius: 6px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .related-article-content {
    flex: 1;
    min-width: 0;
  }

  .related-article-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
    line-height: 1.4;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .related-article-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    color: #6b7280;
    margin-bottom: 0.5rem;
  }

  .related-article-summary {
    font-size: 0.85rem;
    color: #4b5563;
    line-height: 1.5;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
</style>