<template>
  <article class="comment-item" :class="{ 'is-reply': isReply, 'highlight': highlight }">
    <div class="comment-header">
      <div class="comment-author">
        <img :src="comment.user.avatar" :alt="comment.user.nickname" class="author-avatar" loading="lazy" />
        <div class="author-info">
          <h4 class="author-name">
            {{ comment.user.nickname }}
            <span v-if="comment.user.isAdmin" class="author-badge">管理员</span>
          </h4>
          <div class="comment-meta">
            <time class="comment-time" :datetime="comment.createdAt">
              {{ formatTime(comment.createdAt) }}
            </time>
            <span v-if="isEdited" class="edited-badge">已编辑</span>
          </div>
        </div>
      </div>

      <div class="comment-actions">
        <button v-if="userCanEdit" class="action-btn edit-btn" @click="handleEdit" title="编辑">
          ✏️
        </button>
        <button v-if="userCanDelete" class="action-btn delete-btn" @click="handleDelete" title="删除">
          🗑️
        </button>
        <div class="more-actions" v-if="showMoreActions">
          <button class="action-btn more-btn" @click="toggleMoreActions">
            ⋮
          </button>
          <div v-if="moreActionsVisible" class="more-actions-menu">
            <button class="menu-item" @click="handleReport">举报</button>
            <button class="menu-item" @click="handleBlock">屏蔽用户</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑模式 -->
    <div v-if="isEditing" class="comment-edit">
      <CommentForm :article-id="articleId" :reply-to="undefined" :initial-content="comment.content" :auto-focus="true"
        :is-edit="true" @comment-added="handleEditSave" @cancel-reply="cancelEdit" />
    </div>

    <!-- 正常显示模式 -->
    <div v-else>
      <div class="comment-content" v-html="renderedContent"></div>

      <div class="comment-footer">
        <div class="comment-stats">
          <button class="like-btn" :class="{ 'liked': comment.isLiked }" @click="handleLike" :disabled="isLiking">
            <span class="like-icon">{{ comment.isLiked ? '❤️' : '🤍' }}</span>
            <span class="like-count">{{ comment.likes || 0 }}</span>
          </button>

          <button class="reply-btn" @click="handleReply" v-if="canReply">
            💬 回复
          </button>
        </div>
      </div>
    </div>

    <!-- 回复表单 -->
    <div v-if="showReplyForm" class="reply-form-container">
      <CommentForm :article-id="articleId" :reply-to="comment" :auto-focus="true" @comment-added="handleReplySubmit"
        @cancel-reply="cancelReply" />
    </div>

    <!-- 子回复 -->
    <div v-if="hasReplies" class="comment-replies">
      <div class="replies-toggle" @click="toggleReplies">
        <span class="toggle-icon">{{ showReplies ? '▼' : '▶' }}</span>
        <span class="toggle-text">
          {{ showReplies ? '隐藏' : '显示' }} {{ comment.replies?.length }} 条回复
        </span>
      </div>

      <transition name="slide-fade">
        <div v-show="showReplies" class="replies-list">
          <CommentItem v-for="reply in comment.replies" :key="reply.id" :comment="reply" :article-id="articleId"
            :is-reply="true" @reply="handleNestedReply" @like="handleNestedLike" @edit="handleNestedEdit"
            @delete="handleNestedDelete" />
        </div>
      </transition>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watchEffect } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import CommentForm from './CommentForm.vue'
import type { User } from '@/types/user'
import type { Comment, CommentItemProps } from '@/types/comment'
import { markdownToHtml } from '@/utils/cabinet'
import { ElMessage, ElMessageBox } from 'element-plus'


const props = withDefaults(defineProps<CommentItemProps>(), {
  isReply: false,
  highlight: false,
  showMoreActions: true
})

const emit = defineEmits<{
  'reply': [comment: Comment]
  'like': [commentId: string]
  'edit': [comment: Comment]
  'delete': [commentId: string]
  'report': [commentId: string]
  'block': [userId: number]
}>()

// 状态
const isEditing = ref(false)
const showReplyForm = ref(false)
const showReplies = ref(true)
const moreActionsVisible = ref(false)
const isLiking = ref(false)
const renderedContent = ref('')


// 当前用户（实际应用中应该从store获取）
const currentUser = ref<User | null>({
  id: 8,
  username: 'guest',
  nickname: '当前用户',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
  createdAt: ''
})

// 计算属性
// const renderedContent = computed(() => {
//   const html = marked(props.comment.content)
//   return DOMPurify.sanitize(html, {
//     ALLOWED_TAGS: ['p', 'br', 'b', 'strong', 'i', 'em', 'code', 'pre', 'a', 'blockquote'],
//     ALLOWED_ATTRS: {
//       a: ['href', 'target', 'rel']
//     }
//   })
// })
// const renderedContent = computed(async () => {
//   return await markdownToHtml(props.comment.content, {
//     ALLOWED_TAGS: ['p', 'br', 'b', 'strong', 'i', 'em', 'code', 'pre', 'a', 'blockquote'],
//     ALLOWED_ATTR: ['href', 'target', 'rel']
//   })
// })

const hasReplies = computed(() => {
  return props.comment.replies && props.comment.replies.length > 0
})

const isEdited = computed(() => {
  return props.comment.isEdited ||
    (props.comment.updatedAt &&
      props.comment.updatedAt !== props.comment.createdAt)
})

const userCanEdit = computed(() => {
  return props.comment.canEdit ||
    currentUser.value?.id === props.comment.user.id
})

const userCanDelete = computed(() => {
  return props.comment.canDelete ||
    currentUser.value?.id === props.comment.user.id ||
    currentUser.value?.isAdmin
})

const canReply = computed(() => {
  return !props.isReply // 只允许回复顶级评论，或者根据需要调整
})

// 方法
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleReply = () => {
  emit('reply', props.comment)
  showReplyForm.value = true
  showReplies.value = true // 显示回复时展开回复列表
}

const handleLike = async () => {
  if (isLiking.value) return

  isLiking.value = true
  try {
    emit('like', props.comment.id)

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 300))

  } catch (error) {
    console.error('点赞失败:', error)
  } finally {
    isLiking.value = false
  }
}

const handleEdit = () => {
  isEditing.value = true
}

const handleDelete = () => {
  ElMessageBox.confirm(
    '确定要删除这条评论吗？此操作不可撤销。',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      draggable: true,
    }
  ).then(() => {
    emit('delete', props.comment.id)
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '删除取消',
    })
  })
}

const handleReport = () => {
  emit('report', props.comment.id)
  moreActionsVisible.value = false
  // 可以显示一个提示
  ElMessage.primary('举报已提交，我们会尽快处理')
}

const handleBlock = () => {
  emit('block', props.comment.user.id)
  moreActionsVisible.value = false
  // 可以显示一个提示
  ElMessage.primary(`已屏蔽用户 ${props.comment.user.nickname}`)
}

const handleEditSave = (updatedComment: Comment) => {
  isEditing.value = false
  // 更新评论内容
  Object.assign(props.comment, {
    content: updatedComment.content,
    updatedAt: new Date().toISOString(),
    isEdited: true
  })
}

const cancelEdit = () => {
  isEditing.value = false
}

const handleReplySubmit = (replyComment: Comment) => {
  showReplyForm.value = false

  // 如果是顶级评论，添加到回复列表
  if (!props.isReply) {
    if (!props.comment.replies) {
      props.comment.replies = []
    }
    props.comment.replies.unshift(replyComment)
  }
}

const cancelReply = () => {
  showReplyForm.value = false
}

const toggleReplies = () => {
  showReplies.value = !showReplies.value
}

const toggleMoreActions = () => {
  moreActionsVisible.value = !moreActionsVisible.value
}

const handleNestedReply = (comment: Comment) => {
  emit('reply', comment)
}

const handleNestedLike = (commentId: string) => {
  emit('like', commentId)
}

const handleNestedEdit = (comment: Comment) => {
  emit('edit', comment)
}

const handleNestedDelete = (commentId: string) => {
  emit('delete', commentId)
}

// 生命周期
onMounted(() => {
  // 如果高亮，滚动到视图
  if (props.highlight) {
    nextTick(() => {
      const element = document.querySelector(`.comment-item.highlight`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })
  }

  props.comment.canDelete = true
  props.comment.canEdit = true
})

watchEffect(async () => {
  renderedContent.value = await markdownToHtml(props.comment.content, {
    ALLOWED_TAGS: ['p', 'br', 'b', 'strong', 'i', 'em', 'code', 'pre', 'a', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  })
})

// 监听外部点击，关闭更多操作菜单
const handleClickOutside = (event: MouseEvent) => {
  if (moreActionsVisible.value &&
    !(event.target as Element).closest('.more-actions')) {
    moreActionsVisible.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.comment-item {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;

  &.is-reply {
    margin-left: 2rem;
    background: #f9fafb;
    border-left: 3px solid #059669;

    @media (max-width: 768px) {
      margin-left: 1rem;
    }
  }

  &.highlight {
    animation: highlight-pulse 2s ease;
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
  }

  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.comment-author {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;

  .author-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e5e7eb;
  }

  .author-info {
    flex: 1;
  }

  .author-name {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.25rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .author-badge {
    font-size: 0.7rem;
    background: linear-gradient(135deg, #059669, #10b981);
    color: white;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    font-weight: 500;
  }
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: #6b7280;

  .comment-time {
    font-size: 0.8rem;
  }

  .edited-badge {
    background: #f3f4f6;
    color: #6b7280;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    font-size: 0.75rem;
  }
}

.comment-actions {
  display: flex;
  gap: 0.5rem;

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: #ffffff;
    color: #6b7280;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;

    &:hover {
      background: #f3f4f6;

      &.delete-btn {
        background: #fee2e2;
        color: #dc2626;
        border-color: #fecaca;
      }

      &.edit-btn {
        background: #dbeafe;
        color: #1d4ed8;
        border-color: #bfdbfe;
      }
    }
  }

  .more-actions {
    position: relative;

    .more-actions-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      min-width: 120px;
      z-index: 10;
      overflow: hidden;

      .menu-item {
        width: 100%;
        padding: 0.75rem 1rem;
        border: none;
        background: none;
        text-align: left;
        font-size: 0.9rem;
        color: #4b5563;
        cursor: pointer;
        transition: background 0.2s ease;

        &:hover {
          background: #f3f4f6;
        }

        &:first-child {
          border-bottom: 1px solid #f3f4f6;
        }
      }
    }
  }
}

.comment-content {
  font-size: 1rem;
  line-height: 1.6;
  color: #1f2937;
  margin-bottom: 1rem;

  :deep() {
    p {
      margin: 0 0 0.75rem 0;

      &:last-child {
        margin-bottom: 0;
      }
    }

    a {
      color: #059669;
      text-decoration: underline;

      &:hover {
        text-decoration: none;
      }
    }

    code {
      background: rgba(5, 150, 105, 0.1);
      padding: 0.1rem 0.3rem;
      border-radius: 4px;
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 0.9em;
    }

    pre {
      background: #2d2d2d;
      color: #ffffff;
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1rem 0;

      code {
        background: none;
        padding: 0;
        color: inherit;
        font-size: 0.9rem;
      }
    }

    blockquote {
      border-left: 4px solid #059669;
      margin: 1rem 0;
      padding: 0.5rem 1rem;
      background: rgba(5, 150, 105, 0.05);
      color: #4b5563;
      font-style: italic;
    }
  }
}

.comment-footer {
  .comment-stats {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .like-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    color: #6b7280;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      background: #fee2e2;
      color: #dc2626;
      border-color: #fecaca;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.liked {
      background: #fee2e2;
      color: #dc2626;
      border-color: #fecaca;
    }

    .like-icon {
      font-size: 1rem;
    }

    .like-count {
      font-weight: 500;
    }
  }

  .reply-btn {
    padding: 0.4rem 0.75rem;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    color: #6b7280;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: #dbeafe;
      color: #1d4ed8;
      border-color: #bfdbfe;
    }
  }
}

.comment-edit {
  margin: 1rem 0;
}

.reply-form-container {
  margin: 1rem 0;
}

.comment-replies {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.replies-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s ease;

  &:hover {
    background: #f3f4f6;
  }

  .toggle-icon {
    font-size: 0.8rem;
    transition: transform 0.3s ease;
  }

  .toggle-text {
    font-weight: 500;
  }
}

.replies-list {
  margin-top: 0.5rem;
  animation: fadeIn 0.3s ease;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes highlight-pulse {

  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.1);
  }

  50% {
    box-shadow: 0 0 0 8px rgba(5, 150, 105, 0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .comment-item {
    padding: 1rem;
  }

  .comment-header {
    flex-direction: column;
    gap: 0.75rem;
  }

  .comment-actions {
    align-self: flex-end;
  }

  .comment-item.is-reply {
    margin-left: 1rem;
  }
}
</style>