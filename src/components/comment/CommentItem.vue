<template>
  <article class="comment-item" :class="{ 'is-reply': isReply, 'highlight': highlight }">

    <!-- 评论头部 Comment Header -->
    <div class="comment-header">
      <!-- 用户信息 User info -->
      <div class="comment-author">
        <img :src="avatar" :alt="comment.user.name" class="author-avatar" loading="lazy" />
        <div class="author-info">
          <h4 class="author-name">
            {{ comment.user.name }}
            <span v-if="isAdmin" class="author-badge">管理员</span>
          </h4>
          <div class="comment-meta">
            <time class="comment-time" :datetime="comment.createdAt">
              {{ formatTime(comment.createdAt) }}
            </time>
            <span v-if="isEdited" class="edited-badge">已编辑</span>
          </div>
        </div>
      </div>

      <!-- 评论操作 Comment Actions -->
      <div class="comment-actions">
        <!-- 编辑按钮 Edit button -->
        <button v-if="userCanEdit" class="action-btn edit-btn" @click="handleEdit" title="编辑">
          <font-awesome-icon :icon="['fas', 'pen-to-square']" />
        </button>
        <!-- 删除按钮 Delete button -->
        <button v-if="userCanDelete" class="action-btn delete-btn" @click="handleDelete" title="删除">
          <font-awesome-icon :icon="['fas', 'trash']" />
        </button>
        <!-- 更多操作 -->
        <div class="more-actions" v-if="showMoreActions && userCanMore">
          <button class="action-btn more-btn" @click.stop="toggleMoreActions">
            <font-awesome-icon :icon="['fas', 'ellipsis-vertical']" />
          </button>
          <!-- 下拉菜单 -->
          <div v-if="showMoreMenu" class="more-actions-menu" @click.stop>
            <button class="menu-item" :disabled="comment.isReported" @click="openReportDialog">
              <FontAwesomeIcon :icon="['fas', 'flag']" />
              <span>{{ comment.isReported ? '已举报' : '举报' }}</span>
            </button>
            <button v-if="currentUser?.isAdmin" class="menu-item danger" :disabled="isBlocked" @click="openBlockDialog">
              <FontAwesomeIcon :icon="['fas', 'eye-slash']" />
              <span>{{ isBlocked ? '已屏蔽' : '屏蔽该用户' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑模式 Editing mode -->
    <div v-if="isEditing" class="comment-edit">
      <CommentForm :article-id="articleId" :reply-to="undefined" :initial-content="comment.content" :auto-focus="true"
        :is-edit="true" :comment-id="comment.id" :user-id="currentUser?.id" form-name="编辑评论"
        @comment-edited="handleEditSave" @cancel-reply="cancelEdit" />
    </div>

    <!-- 正常显示模式 Normal display mode -->
    <div v-else>
      <div class="comment-content" v-html="renderedContent"></div>

      <div class="comment-footer">
        <div class="comment-stats">
          <!-- 点赞 -->
          <button class="like-btn" :class="{ 'liked': comment.isLiked }" @click="handleLike" :disabled="isLiking">
            <span class="like-icon">
              <FontAwesomeIcon :icon="['far', comment.isLiked ? 'thumbs-up' : 'thumbs-up']" />
            </span>
            <span class="like-count">{{ comment.likes || 0 }}</span>
          </button>

          <!-- 回复 -->
          <button class="reply-btn" @click="handleReply" v-if="canReply">
            <FontAwesomeIcon :icon="['fas', 'reply']" />
            <span>回复</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 回复表单 Reply form -->
    <div v-if="isReplying" class="reply-form-container">
      <CommentForm :article-id="articleId" :reply-to="comment" :auto-focus="true" @comment-added="handleReplySubmit"
        @cancel-reply="handleCancelReply" />
    </div>

    <!-- 子回复 Sub replies -->
    <div v-if="hasReplies" class="comment-replies">
      <div class="replies-toggle" @click="toggleReplies">
        <span class="toggle-icon">
          <FontAwesomeIcon v-if="showReplies" :icon="['fas', 'caret-down']" />
          <FontAwesomeIcon v-else :icon="['fas', 'caret-right']" />
        </span>
        <span class="toggle-text">
          {{ showReplies ? '显示' : '隐藏' }} {{ comment.replies?.length }} 条回复
        </span>
      </div>

      <transition name="slide-fade">
        <div v-show="showReplies" class="replies-list">
          <CommentItem v-for="reply in comment.replies" :key="reply.id" :comment="reply" :article-id="articleId"
            :is-reply="false" :active-reply-id="activeReplyId" @reply="handleNestedReply" @like="handleNestedLike"
            @edit="handleNestedEdit" @delete="handleNestedDelete" @open-reply="$emit('open-reply', $event)"
            @close-reply="$emit('close-reply')" />
        </div>
      </transition>
    </div>

    <!-- 举报弹窗 -->
    <Teleport to="body">
      <div v-if="showReportDialog" class="modal-overlay" @click="closeReportDialog">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>举报评论</h3>
            <button class="close-btn" @click="closeReportDialog">×</button>
          </div>

          <div class="modal-body">
            <p class="modal-tip">请选择举报原因：</p>
            <div class="report-reasons">
              <label v-for="reason in reportReasons" :key="reason.value" class="reason-item"
                :class="{ active: selectedReason === reason.value }">
                <input type="radio" :value="reason.value" v-model="selectedReason" />
                <span class="reason-icon">{{ reason.icon }}</span>
                <span class="reason-label">{{ reason.label }}</span>
              </label>
            </div>

            <textarea v-if="selectedReason === 'other'" v-model="reportDescription" class="report-description"
              placeholder="请补充说明..." rows="3"></textarea>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="closeReportDialog">取消</button>
            <button class="btn-submit" :disabled="!selectedReason || isSubmitting" @click="handleReport">
              {{ isSubmitting ? '提交中...' : '提交举报' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 屏蔽确认弹窗 -->
    <Teleport to="body">
      <div v-if="showBlockDialog" class="modal-overlay" @click="closeBlockDialog">
        <div class="modal-content modal-small" @click.stop>
          <div class="modal-header">
            <h3>屏蔽用户</h3>
            <button class="close-btn" @click="closeBlockDialog">×</button>
          </div>

          <div class="modal-body">
            <p class="modal-tip">
              确定要屏蔽用户 <strong>{{ comment.user.name }}</strong> 吗？
            </p>
            <p class="modal-subtip">
              屏蔽后，你将不再看到该用户的所有评论。可以随时在设置中取消屏蔽。
            </p>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="closeBlockDialog">取消</button>
            <button class="btn-danger" :disabled="isSubmitting" @click="handleBlock">
              {{ isSubmitting ? '处理中...' : '确定屏蔽' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </article>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watchEffect, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user.ts'
import { useCommentStore } from '@/stores/comment'
import CommentForm from './CommentForm.vue'
import type { User } from '@/types/user'
import type { Comment } from '@/types/comment'
import { markdownToHtml, formatTime } from '@/utils/cabinet'

interface Props {
  articleId: string | number
  comment: Comment
  isReply?: boolean
  highlight?: boolean
  showMoreActions?: boolean
  canEdit?: boolean
  canDelete?: boolean
  activeReplyId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  isReply: false,
  highlight: false,
  showMoreActions: true,
  activeReplyId: null
})

const emit = defineEmits<{
  'reply': [comment: Comment]
  'like': [liked: boolean]
  'edit': [comment: Comment]
  'deleted': [commentId: string | number]
  'report': [commentId: string | number]
  'block': [userId: string | number]
  'open-reply': [commentId: string]
  'close-reply': []
}>()

const userStore = useUserStore()
const commentStore = useCommentStore()

// 状态
const isEditing = ref(false)
const showReplyForm = ref(false)
const showReplies = ref(true)
const showMoreMenu = ref(false)
const isLiking = ref(false)
const renderedContent = ref('')
const { blockedUsers, currentUser } = storeToRefs(commentStore)

// 是否是管理员
const isAdmin = ref<boolean>(false)

const showReportDialog = ref(false)
const selectedReason = ref<string>('')
const reportDescription = ref('')
const showBlockDialog = ref(false)

const reportReasons = [
  { value: 'spam', label: '垃圾广告', icon: '📢' },
  { value: 'abuse', label: '辱骂攻击', icon: '😡' },
  { value: 'porn', label: '色情内容', icon: '🔞' },
  { value: 'violence', label: '暴力内容', icon: '⚠️' },
  { value: 'politics', label: '政治敏感', icon: '🚨' },
  { value: 'other', label: '其他', icon: '💬' }
]

// ^^^^计算属性 Computational attributes

const isLiked = computed(() => {
  // 优先用后端返回的状态，其次用本地记录
  return props.comment.isLiked ?? commentStore.isCommentLiked(props.comment.id)
})

/**
 * 
 */
const isSubmitting = computed(() => commentStore.isSubmitting)

// 是否已屏蔽该用户
const isBlocked = computed(() => commentStore.isUserBlocked(props.comment))

/**
 * 
 */
const avatar = computed(() => {
  if (props.comment?.user?.avatar) {
    return props.comment.user.avatar
  }
  return defaultAvatar(props.comment?.user?.id)
})

const hasReplies = computed(() => {
  return props.comment.replies && props.comment.replies.length > 0
})

// 是否正在回复：完全由 props.activeReplyId 决定
const isReplying = computed(() => {
  return props.activeReplyId === props.comment.id
})

/**
 * 
 */
const isEdited = computed(() => {
  return props.comment.isEdited ||
    (props.comment.updatedAt &&
      props.comment.updatedAt !== props.comment.createdAt)
})

/**
 * 用户是否可以编辑评论
 * Check if user can edit comment
 */
const userCanEdit = computed(() => {
  return isAuthor()
})

/**
 * 用户是否可以删除评论
 * Check if user can delete comment
 */
const userCanDelete = computed(() => {
  // 没有用户信息直接拒绝
  if (!currentUser.value) return false

  const isAdminUser = currentUser.value?.isAdmin

  return isAuthor() || isAdminUser
})

/**
 * 用户是否可以查看更多操作
 * Check if user can see more actions
 */
const userCanMore = computed(() => {
  return !!(currentUser.value) && currentUser.value.id
})

/**
 * 
 */
const canReply = computed(() => {
  return !props.isReply // 只允许回复顶级评论，或者根据需要调整
})

// ^^^^方法 Method

// 默认头像地址 default avatar url
const defaultAvatar = (userId: string | number = 10): string => {
  return `https://picsum.photos/200/200?random=${userId}`
}

// 判断当前操作人是否是该评论的作者
// Determine whether the current operator is the author of this comment
const isAuthor = (): boolean => {
  const authorEmail = props.comment?.user?.email
  const isAuthor = !!authorEmail && currentUser.value?.email === authorEmail
  return isAuthor
}

const handleReply = () => {
  if (isReplying.value) {
    // 再次点击 → 取消
    emit('close-reply')
  } else {
    // 打开回复
    emit('open-reply', props.comment.id)
  }
}

const handleLike = async () => {
  if (isLiking.value) return
  isLiking.value = true

  try {

    // 模拟API调用延迟
    // await new Promise(resolve => setTimeout(resolve, 300))
    const { liked } = await commentStore.toggleLike(props.comment.id)

    emit('like', liked)

  } catch (error) {
    console.error('点赞失败:', error)
  } finally {
    isLiking.value = false
  }
}

// 进入编辑模式 Editing mode
const handleEdit = () => {
  isEditing.value = !isEditing.value
}

/**
 * 删除评论
 * Delete comment
 */
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
  ).then(async () => {
    try {
      // here we call the store's removeComment method 
      // with the comment ID and user ID
      await commentStore.removeComment(
        props.comment.id,
        { userId: `${currentUser.value?.id}` || '' }
      )

      emit('deleted', props.comment.id)

      ElMessage.success('删除成功')
    } catch (err) {
      // 业务/接口错误
      console.error('删除评论失败:', err)

      ElMessage.error('删除失败，请稍后重试')
    }
  }).catch((action) => {
    // 用户主动取消/关闭
    if (action === 'cancel' || action === 'close') {
      ElMessage({
        type: 'info',
        message: '删除取消',
      })
    }
  })
}

const toggleMoreActions = () => {
  showMoreMenu.value = !showMoreMenu.value
}

const openReportDialog = () => {
  if (props.comment.isReported) return
  showMoreMenu.value = false
  showReportDialog.value = true
  selectedReason.value = ''
  reportDescription.value = ''
}

const closeReportDialog = () => {
  showReportDialog.value = false
  selectedReason.value = ''
  reportDescription.value = ''
}

/**
 * 举报评论
 * Report comment
 */
const handleReport = async () => {
  if (!selectedReason.value) return

  try {
    await commentStore.reportComment(
      props.comment.id,
      selectedReason.value as any,
      reportDescription.value || undefined
    )

    emit('report', props.comment.id)

    closeReportDialog()
    ElMessage.primary('举报已提交，感谢您的反馈！我们会尽快处理。')
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '举报失败，请稍后重试')
  }
}

const openBlockDialog = () => {
  if (isBlocked.value) return

  if (!props.comment.userId) {
    ElMessage.primary('无法屏蔽该用户（缺少用户ID）')
    return
  }

  showMoreMenu.value = false
  showBlockDialog.value = true
}

const closeBlockDialog = () => {
  showBlockDialog.value = false
}

/**
 * 屏蔽用户
 * Block user
 */
const handleBlock = async () => {
  if (!props.comment.userId) return

  try {
    await commentStore.blockUser(currentUser?.value?.id, props.comment)

    closeBlockDialog()
    // 可以显示一个提示
    ElMessage.primary(`已屏蔽用户 ${props.comment.user.name}`)
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '屏蔽失败，请稍后重试')
  }

  emit('block', props.comment?.user?.id ?? '')

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
  emit('close-reply')

  // 如果是顶级评论，添加到回复列表
  if (!props.isReply) {
    if (!props.comment.replies) {
      props.comment.replies = []
    }
    props.comment.replies.unshift(replyComment)
  }
}

const handleCancelReply = () => {
  emit('close-reply')
}

const toggleReplies = () => {
  showReplies.value = !showReplies.value
}

const handleNestedReply = (comment: Comment) => {
  emit('reply', comment)
}

const handleNestedLike = (liked: boolean) => {
  // emit('like', commentId)
}

const handleNestedEdit = (comment: Comment) => {
  emit('edit', comment)
}

const handleNestedDelete = (commentId: string | number) => {
  emit('deleted', commentId)
}

// 跟踪用户，判断是否是管理员
watch(
  () => props.comment?.user?.email,
  async (email) => {
    if (!email) {
      isAdmin.value = false
      return
    }
    const vuser = await userStore.getUserByEmail(email)
    isAdmin.value = userStore.hasRole(vuser, 'admin')
  },
  { immediate: true }
)

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
})

watchEffect(async () => {
  renderedContent.value = await markdownToHtml(props.comment.content, {
    ALLOWED_TAGS: ['p', 'br', 'b', 'strong', 'i', 'em', 'code', 'pre', 'a', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  })
})

// 监听外部点击，关闭更多操作菜单
const handleClickOutside = (event: MouseEvent) => {
  if (showMoreMenu.value &&
    !(event.target as Element).closest('.more-actions')) {
    showMoreMenu.value = false
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
  margin: 2rem 0;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 12px;
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
    background: rgba(241, 91, 03, .1);
    color: rgba(241, 91, 03, .6);
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

    .more-btn {
      width: 32px;
      height: 32px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      background: #ffffff;
      color: #6b7280;
      cursor: pointer;
      font-size: 1.2rem;
      transition: all 0.2s ease;

      &:hover {
        background: #f9fafb;
        color: #1f2937;
      }
    }

    .more-actions-menu {
      position: absolute;
      top: 100%;
      right: 0;
      min-width: 140px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      z-index: 10;
      overflow: hidden;
      animation: fadeIn 0.2s ease;

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

        &:hover:not(:disabled) {
          background: #f3f4f6;
        }

        &:not(:last-child) {
          border-bottom: 1px solid #f3f4f6;
        }

        &:disabled {
          color: #9ca3af;
          opacity: 0.5;
          cursor: not-allowed;
        }

        &.danger:hover:not(:disabled) {
          background: #fee2e2;
          color: #dc2626;
        }

        span {
          margin-left: 10px;
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

    &.active {
      background: #059669;
      color: #fff;
      border-color: #059669;
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


.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
  padding: 1rem;
}

.modal-content {
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: slideUp 0.3s ease;

  &.modal-small {
    max-width: 400px;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;

  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #1f2937;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    font-size: 1.5rem;
    color: #6b7280;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;

    &:hover {
      background: #f3f4f6;
      color: #1f2937;
    }
  }
}

.modal-body {
  padding: 1.5rem;

  .modal-tip {
    font-size: 0.95rem;
    color: #1f2937;
    margin: 0 0 1rem 0;

    strong {
      color: #059669;
    }
  }

  .modal-subtip {
    font-size: 0.85rem;
    color: #6b7280;
    line-height: 1.6;
    margin: 0.5rem 0 0 0;
  }
}

// ========== 举报原因 ==========
.report-reasons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;

  .reason-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: #d1d5db;
      background: #f9fafb;
    }

    &.active {
      border-color: #059669;
      background: rgba(5, 150, 105, 0.05);
    }

    input[type="radio"] {
      display: none;
    }

    .reason-icon {
      font-size: 1.2rem;
    }

    .reason-label {
      font-size: 0.9rem;
      color: #1f2937;
    }
  }
}

.report-description {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #059669;
  }
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  justify-content: flex-end;

  button {
    padding: 0.6rem 1.5rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .btn-cancel {
    background: #ffffff;
    color: #6b7280;
    border: 1px solid #d1d5db;

    &:hover {
      background: #f3f4f6;
    }
  }

  .btn-submit {
    background: #059669;
    color: #ffffff;

    &:hover:not(:disabled) {
      background: #047857;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .btn-danger {
    background: #dc2626;
    color: #ffffff;

    &:hover:not(:disabled) {
      background: #b91c1c;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
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