<template>
  <article class="article-card" :class="[customClass, { 'featured': isFeatured }]">
    <!-- 头部 -->
    <div class="article-header">
      <!-- 使用props控制显示 -->
      <span v-if="showCategory" class="article-category"
        :style="{ '--category-color-rgb': tagColorRgb(categoryColor) }">
        {{ article.category?.name }}
      </span>

      <!-- 使用插槽 -->
      <slot name="header">
        <!-- 默认内容 -->
        <div class="default-header">
          <!-- <span class="article-date">{{ formattedDate }}</span> -->
          <span v-if="showComments /**&& (article.comments || 0) > 0*/" class="article-comments">
            <FaIcon :icon="faComment" />
            <span> &nbsp;{{ article.comments || 0 }} </span>
            <span> &nbsp;条评论</span>
          </span>
        </div>
      </slot>
    </div>

    <!-- 标题 -->
    <h2 class="article-title">
      <span class="article-title-text" @click="handleClick">
        <span>{{ article.title }}</span>
        <span v-if="article.subtitle" class="master-title">
          <span class="pipe">|</span>
          <span class="subtitle">{{ article.subtitle }}</span>
        </span>
      </span>
      <span v-if="showTime && formattedDate" class="article-time">
        {{ formattedDate }}
      </span>
    </h2>

    <!-- 内容 -->
    <div class="article-content">
      <div v-if="coverUrl" class="cover-wrap">
        <img :src="coverUrl" alt="封面" class="cover-thumb" v-if="coverUrl" />
      </div>
      <p class="article-summary">
        {{ truncatedSummary }}
      </p>
      <!-- 默认插槽 -->
      <!-- <slot>
        <p v-if="article.content" class="article-description">
          {{ article.content }}
        </p>
      </slot> -->
    </div>

    <!-- 底部 -->
    <div class="article-footer">
      <div class="article-meta">
        <!-- 标签 -->
        <div v-if="showTags && limitedTags" class="article-tags">
          <span v-for="tag in limitedTags" class="tag" :key="tag.id" @click="emitTagClick(tag.name)"
            :style="{ '--tag-color': tag.color || '', '--tag-color-rgb': tagColorRgb(tag.color) }">
            #{{ tag.name }}
          </span>
          <span v-if="hasMoreTags" class="tag-more">...</span>
        </div>
      </div>

      <a href="#" class="read-more" @click.prevent="handleReadMore">
        阅读全文
      </a>
    </div>

    <!-- 底部插槽 -->
    <slot name="footer"></slot>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { faComment } from '@fortawesome/free-regular-svg-icons'
import type { Article, ArticleCardProps } from '@/types/article'
import { DEFAULT_COLOR } from '@/utils/constant';
import { tagColorRgb } from '@/utils/cabinet';

// 接收props并设置默认值
const props = withDefaults(defineProps<ArticleCardProps>(), {
  showCategory: true,
  showComments: true,
  showTime: true,
  showTags: true,
  maxTags: 3,
  maxLength: 200,
  customClass: '',
  isFeatured: false,
  categoryColors: () => ({
    '日记': '#059669',
    '生活': '#10B981',
    '旅行': '#3B82F6',
    '书评': '#8B5CF6',
    '随笔': '#F59E0B'
  })
})

// 定义Emits（事件）
const emit = defineEmits<{
  // 点击标签事件
  (e: 'tag-click', tag: string): void
  // 点击阅读更多事件
  (e: 'read-more', article: Article): void
  // 点击文章事件
  (e: 'click', article: Article): void
}>()

// 计算属性
const categoryColor = computed(() => {
  let color = props.article.category!.color
  if (color) return color
  color = props.categoryColors[props.article.category!.name]
  if (color) return color
  return DEFAULT_COLOR[Math.floor(Math.random() * DEFAULT_COLOR.length)]
})

const formattedDate = computed(() => {
  const date = new Date(props.article.publishedAt)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
})

const truncatedSummary = computed(() => {
  if (!props.article.summary) return ''
  if (props.article.summary.length > props.maxLength) {
    return props.article.summary.slice(0, props.maxLength) + '...'
  }
  return props.article.summary
})

// computed cover URL (supports coverImage or coverThumbnail fallback)
const coverUrl = computed(() => {
  // some APIs may return coverThumbnail instead of coverImage
  const a: any = props.article as any
  return props.article.coverImage || a.coverThumbnail || ''
})

const limitedTags = computed(() => {
  if (!props.article.tags) return []
  return props.article.tags.slice(0, props.maxTags)
})

const hasMoreTags = computed(() => {
  return props.article.tags && props.article.tags.length > props.maxTags
})

// 方法
const emitTagClick = (tag: string) => {
  emit('tag-click', tag)
}

const handleClick = () => {
  emit('click', props.article)
}

const handleReadMore = () => {
  emit('read-more', props.article)
}

</script>

<style lang="scss" scoped>
$breakpoint-mobile: 768px;

// 独立的组件样式
.article-card {
  padding: 1.5rem;
  background: var(--card-bg, #FFFFFF);
  border-radius: var(--radius, 8px);
  box-shadow: var(--shadow, 0 1px 3px rgba(0, 0, 0, 0.1));
  // border: 1px solid var(--border-color, #E5E7EB);
  // border-left: 2px solid #8b1a1a;
  border: none;
  // border-bottom: 1px dashed #8b1a1a;
  border-bottom: 1px dashed #5a026b;
  transition: all 0.3s ease;

  &:nth-child(odd) {
    border-left: 2px solid #5a026b;
  }

  &:nth-child(even) {
    border-right: 2px solid #5a026b;
  }

  &:hover {
    // transform: translateY(-2px);
    box-shadow: var(--shadow-hover, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    border-color: rgba(#059669, 0.3);
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
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 400;
    color: rgba(var(--category-color-rgb, 5, 150, 105), 1);
    background: rgba(var(--category-color-rgb, 5, 150, 105), 0.1);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .article-comments {
    font-size: 0.85rem;
    color: var(--text-light, #9CA3AF);

    .comment-icon {
      margin-right: 0.25rem;
    }
  }

  .article-title {
    margin-bottom: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary, #1F2937);

    .article-time {
      font-size: 0.9rem;
      color: var(--color-primary, #059669);
      font-weight: 500;
      background: rgba(var(--primary-color-rgb, 5, 150, 105), 0.1);
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
    }

    .article-title-text {

      &:hover {
        cursor: pointer;
        color: $base-color-j1;
        text-decoration: underline;
      }

      .master-title {
        font-weight: 600;

        .pipe {
          margin: auto 10px;
          color: #5a026b;
          opacity: .2;
        }

        .subtitle {
          font-weight: 400;
        }
      }
    }
  }

  .article-content {
    margin-bottom: 1rem;
    display: flex;
    gap: 12px;
    align-items: flex-start;

    .cover-wrap {
      flex: 0 0 110px;
      width: 110px;
      height: 72px;
      overflow: hidden;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
      background: var(--cover-placeholder, #f3f4f6);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cover-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .article-summary {
      flex: 1 1 auto;
      min-height: 72px;
      margin: 0;
      color: var(--text-secondary, #6B7280);
      line-height: 1.6;
    }
  }

  .article-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color, #E5E7EB);
  }

  .article-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;

    @media (max-width: $breakpoint-mobile) {
      display: none;
    }
  }

  .article-date {
    font-size: 0.85rem;
    color: var(--text-light, #9CA3AF);

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
      /* use dynamic tag color via CSS variables set inline */
      color: rgba(var(--tag-color-rgb, 5, 150, 105), 1);
      background: rgba(var(--tag-color-rgb, 5, 150, 105), 0.1);
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      transition: all 0.18s ease, background 0.18s ease, color 0.18s ease;
      cursor: pointer;

      &:hover {
        background: rgba(var(--tag-color-rgb, 5, 150, 105), 1);
        color: white;
      }
    }
  }

  .read-more {
    color: var(--primary-color, #059669);
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.3s ease;

    &:hover {
      color: var(--primary-dark, #047857);
      transform: translateX(3px);
    }
  }
}

// 响应式
// @media (max-width: 768px) {
//   .article-card {
//     .article-title {
//       flex-direction: column;
//       align-items: flex-start;
//       gap: 0.5rem;
//     }

//     .article-footer {
//       flex-direction: column;
//       align-items: flex-start;
//       gap: 1rem;
//     }
//   }
// }

@media (max-width: 480px) {
  .article-card {
    .article-content {
      flex-direction: column;

      .cover-wrap {
        width: 100%;
        height: 160px;
        flex: none;
      }

      .article-summary {
        min-height: auto;
      }
    }
  }
}
</style>