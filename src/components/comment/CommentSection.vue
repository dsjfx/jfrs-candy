<template>
  <div class="comment-section">
    <!-- 头部 -->
    <div class="comments-header">
      <h2 class="comments-title">
        评论 ({{ commentsCount }})
      </h2>

      <div class="comments-header-right">
        <button class="refresh-btn" @click="refreshComments">
          <faIcon :icon="['fas', 'refresh']" />
          刷新
        </button>
      </div>
    </div>

    <!-- 评论表单 -->
    <CommentForm ref="commentFormRef" :article-id="articleId" :reply-to="replyTo" :comments-count="commentsCount"
      :auto-focus="isCommenting" @comment-added="handleCommentAdded" @cancel-reply="cancelReply" />

    <!-- 总数和排序 -->
    <div v-if="!isEmpty" class="comments-footer">
      <span class="comments-total">
        共 <span class="comments-num">{{ commentsCount }}</span> 条评论
      </span>

      <div class="comments-sort">
        <button v-for="sort in sortOptions" :key="sort.value" class="sort-btn"
          :class="{ active: currentSort === sort.value }" @click="changeSort(sort.value)">
          {{ sort.label }}
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      <CommentSkeleton v-for="i in 3" :key="i" />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="refreshComments">重试</button>
    </div>

    <!-- 空状态 -->
    <CommentEmpty v-else-if="isEmpty" />

    <!-- 评论列表 -->
    <div v-else class="comments-list">
      <CommentItem v-for="comment in comments" :key="comment.id" :comment="comment" :article-id="articleId"
        @reply="handleReply" @like="handleLikeComment(comment.id)" @deleted="handleDeletedComment(comment.id)" />
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore" class="load-more-wrapper">
      <button class="load-more-btn" :disabled="isLoadingMore" @click="loadMore">
        <span v-if="!isLoadingMore">加载更多评论</span>
        <span v-else>加载中...</span>
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCommentStore } from '@/stores/comment'
import CommentForm from './CommentForm.vue'
import CommentItem from './CommentItem.vue'
import CommentEmpty from './CommentEmpty.vue'
import CommentSkeleton from './CommentSkeleton.vue'

interface Props {
  articleId: string | number
  autoLoad?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoLoad: true
})

const emit = defineEmits<{
  'count-change': [count: number]
}>()

// 使用 Store
const commentStore = useCommentStore()
const {
  comments,
  commentsCount,
  isLoading,
  isLoadingMore,
  hasMore,
  error,
  currentSort,
  currentUser
} = storeToRefs(commentStore)

// 本地状态
const replyTo = ref<any>(null)
const isCommenting = ref(false)
const commentFormRef = ref()

// 排序选项
const sortOptions = [
  { value: 'newest', label: '最新' },
  { value: 'oldest', label: '最早' },
  { value: 'popular', label: '最热' }
]

// ^^^^计算属性

const isEmpty = computed(() => !isLoading.value && comments.value.length === 0)

// ^^^^业务逻辑

// 获取评论
const fetchComments = async () => {
  try {
    await commentStore.fetchComments(props.articleId, {
      current: 1,
      size: 10,
      sort: 'newest',
      reset: true,
      status: 'approved',
      viewerId: `${currentUser?.value?.id}`,
      viewerEmail: currentUser?.value?.email
    })
    emit('count-change', commentsCount.value)
  } catch (err) {
    console.error('获取评论失败:', err)
  }
}

// 刷新评论
const refreshComments = async () => {
  await commentStore.refreshComments()
  emit('count-change', commentsCount.value)
}

// 加载更多
const loadMore = async () => {
  await commentStore.loadMoreComments(
    {
      viewerId: `${currentUser?.value?.id}`,
      viewerEmail: currentUser?.value?.email
    }
  )
}

// 切换排序
const changeSort = async (sort: string) => {
  await commentStore.changeSort(sort as any)
}

// 处理新评论
const handleCommentAdded = (newComment: any) => {
  // Store 已经在 addComment 中更新了列表
  // 这里只需要处理UI状态
  isCommenting.value = false
  replyTo.value = null
  emit('count-change', commentsCount.value)

  // 滚动到新评论
  setTimeout(() => {
    commentStore.scrollToComment(newComment.id)
  }, 300)
}

// 处理回复
const handleReply = (comment: any) => {
  replyTo.value = comment
  isCommenting.value = true

  // 滚动到表单
  setTimeout(() => {
    const formEl = document.querySelector('.comment-form-container')
    formEl?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 100)
}

// 取消回复
const cancelReply = () => {
  replyTo.value = null
  isCommenting.value = false
}

// 点赞评论
const handleLikeComment = async (commentId: string) => {
  try {
    await commentStore.toggleLike(commentId)
  } catch (err) {
    console.error('点赞失败:', err)
  }
}

// 删除评论
const handleDeletedComment = async (commentId: string) => {
  emit('count-change', commentsCount.value)
}

// 生命周期
onMounted(() => {
  if (props.autoLoad) {
    fetchComments()
  }
})

onUnmounted(() => {
  // 可选：重置 store（如果是单页面多个文章）
  // commentStore.reset()
})

// 暴露方法给父组件
defineExpose({
  refresh: refreshComments,
  focus: () => commentFormRef.value?.focusEditor()
})
</script>

<style lang="scss" scoped>
.comment-section {
  padding: 2rem;
  margin-bottom: 3rem;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #059669;

  .comments-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.4rem;
    color: #1f2937;
    margin: 0;
  }

  .refresh-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.8rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    color: #6b7280;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: #059669;
      color: white;
      border-color: #059669;
    }
  }
}

.comments-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4rem;
  padding-bottom: 10px;
  border-bottom: 3px solid var(--primary-color, #059669);

  .comments-total {
    color: #6b7280;
    font-size: 0.9rem;
  }

  .comments-num {
    color: var(--primary-deputy, #8b1a1a);
    font-size: 1.2rem;
    font-weight: 600;
  }

  .comments-sort {
    display: flex;
    gap: 0.5rem;

    .sort-btn {
      padding: 0.25rem 0.75rem;
      background: none;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      color: #6b7280;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: #f9fafb;
      }

      &.active {
        background: #059669;
        color: white;
        border-color: #059669;
      }
    }
  }
}

.load-more-wrapper {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;

  .load-more-btn {
    padding: 0.6rem 2rem;
    background: #f9fafb;
    color: #6b7280;
    border: 1px solid #e5e7eb;
    border-radius: 25px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      background: #059669;
      color: white;
      border-color: #059669;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.loading-state {
  padding: 1rem 0;
}

.error-state {
  text-align: center;
  padding: 2rem;
  color: #dc2626;

  button {
    margin-top: 1rem;
    padding: 0.5rem 1.5rem;
    background: #059669;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
}

@media (max-width: 768px) {
  .comment-section {
    padding: 1.5rem;
  }

  .comments-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .comments-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>