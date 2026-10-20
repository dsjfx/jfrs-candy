<template>
  <div class="comment-form-container">
    <div class="comment-form-header">
      <h3 class="comment-form-title">
        <span class="title-icon">
          <FontAwesomeIcon :icon="['far', 'comment-dots']" />
        </span>
        <span>{{ formName }}</span>
      </h3>
    </div>

    <!-- 回复对象 -->
    <div v-if="replyTo" class="reply-to-info">
      <div class="reply-to-header">
        <span>
          正在回复 <span class="reply-author">@{{ replyTo.user?.name || '访客' }}</span>
        </span>
        <button type="button" class="cancel-reply" @click="cancelReply">取消回复</button>
      </div>
      <div class="reply-to-content" v-html="replyTo.content"></div>
    </div>

    <!-- 访客信息表单 -->
    <div v-if="showGuestForm" class="guest-info-form">
      <div class="form-row">
        <div class="form-group">
          <label for="guest-name" class="form-label">
            <span class="label-icon">
              <font-awesome-icon :icon="['far', 'user']" />
            </span>
            <span class="label-name">昵称</span>
            <span class="required">*</span>
          </label>
          <input id="guest-name" v-model="guestName" type="text" placeholder="请输入您的昵称" class="form-input"
            :class="{ error: validationErrors.includes('昵称不能为空') }" />
        </div>

        <div class="form-group">
          <label for="guest-email" class="form-label">
            <span class="label-icon">
              <font-awesome-icon :icon="['far', 'envelope']" />
            </span>
            <span class="label-name">邮箱</span>
            <span class="required">*</span>
          </label>
          <input id="guest-email" v-model="guestEmail" type="email" placeholder="用于接收回复通知" class="form-input"
            :class="{ error: validationErrors.includes('请输入有效的邮箱地址') }" />
        </div>

        <div class="form-group">
          <label for="guest-website" class="form-label">
            <span class="label-icon">
              <font-awesome-icon :icon="['fas', 'globe']" />
            </span>
            <span class="label-name">网站</span>
            <span class="optional">(可选)</span>
          </label>
          <input id="guest-website" v-model="guestWebsite" type="url" placeholder="您的个人网站或博客" class="form-input" />
        </div>
      </div>

      <div class="form-options">
        <label class="remember-checkbox">
          <input type="checkbox" v-model="rememberMe" @change="handleRememberMe(null)" />
          <span>记住我的信息</span>
        </label>
      </div>
    </div>

    <!-- 评论编辑器 -->
    <div class="comment-editor">
      <div class="active-editor">
        <textarea ref="textareaRef" v-model="content" class="comment-textarea" :placeholder="editorPlaceholder"
          :maxlength="maxLength" @input="handleInput" @focus="isFocused = true" @blur="handleBlur"
          @keydown.ctrl.enter.prevent="handleSubmit"></textarea>

        <!-- 工具栏 -->
        <div class="editor-toolbar" :class="{ 'is-focused': isFocused }">
          <button type="button" class="toolbar-btn" @mousedown.prevent @click="insertMarkdown('bold')" title="加粗">
            <strong>B</strong>
          </button>
          <button type="button" class="toolbar-btn" @mousedown.prevent @click="insertMarkdown('italic')" title="斜体">
            <em>I</em>
          </button>
          <button type="button" class="toolbar-btn" @mousedown.prevent @click="insertMarkdown('code')" title="代码">
            &lt;/&gt;
          </button>
          <button type="button" class="toolbar-btn" @mousedown.prevent @click="insertMarkdown('link')" title="链接">
            🔗
          </button>
          <button type="button" class="toolbar-btn" @mousedown.prevent @click="insertMarkdown('quote')" title="引用">
            ❝
          </button>
          <button type="button" class="toolbar-btn emoji-btn" :class="{ active: showEmojiPicker }" @mousedown.prevent
            @click.stop="toggleEmojiPicker" title="表情">
            😀
          </button>
        </div>

        <!-- 表情选择器 -->
        <div v-if="showEmojiPicker" class="emoji-picker-wrapper" @click.stop>
          <EmojiPicker @insert-emoji="insertEmoji" @close="closeEmojiPicker" />
        </div>
      </div>

      <!-- 底部：字数统计和提交按钮 -->
      <div class="editor-footer">
        <div class="footer-left">
          <span class="char-counter" :class="{ 'char-warning': charCount > maxLength }">
            {{ charCount }} / {{ maxLength }}
          </span>
          <button type="button" class="preview-toggle" @click="showPreview = !showPreview">
            {{ showPreview ? '隐藏预览' : '预览效果' }}
          </button>
        </div>

        <button type="button" class="submit-btn" :disabled="isSubmitting || !canSubmit" @click="handleSubmit">
          <span v-if="!isSubmitting">{{ submitText }}</span>
          <span v-else class="submitting">提交中...</span>
        </button>
      </div>

      <!-- 预览 -->
      <div v-if="showPreview" class="comment-preview">
        <div class="preview-label">预览效果：</div>
        <div class="preview-content" v-html="renderedContent"></div>
      </div>
    </div>

    <!-- 验证错误 -->
    <div v-if="validationErrors.length > 0" class="validation-errors">
      <div v-for="error in validationErrors" :key="error" class="error-item">
        {{ error }}
      </div>
    </div>

    <!-- 提交状态 -->
    <div v-if="submitStatus" class="submit-status" :class="submitStatus.type">
      {{ submitStatus.message }}
    </div>

    <!-- 格式帮助 -->
    <div class="format-help">
      <details class="help-details">
        <summary class="help-summary">支持 Markdown 格式</summary>
        <div class="help-content">
          <ul class="help-list">
            <li><strong>加粗</strong>：**加粗文字**</li>
            <li><em>斜体</em>：*斜体文字*</li>
            <li><code>代码</code>：`代码`</li>
            <li>链接：[链接文字](https://example.com)</li>
            <li>引用：&gt; 引用内容</li>
          </ul>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import EmojiPicker from '@/components/core/EmojiPicker.vue'
import { type Comment, type CommentForm } from '@/types/comment'
import { useCommentStore } from '@/stores/comment'
import { htmlToText } from '@/utils/cabinet'
import { ElMessage } from 'element-plus'

interface Props {
  articleId: string | number
  replyTo?: Comment | null
  initialContent?: string
  isEdit?: boolean
  commentId?: string | number
  userId?: string | number
  formName?: string
  placeholder?: string
  autoFocus?: boolean
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
  formName: '发表评论',
  placeholder: '分享您的想法...（支持 Markdown 格式）',
  autoFocus: false,
  maxLength: 2000,
})

const emit = defineEmits<{
  'comment-added': [comment: Comment]
  'comment-edited': [comment: Comment]
  'cancel-reply': []
}>()

// 使用 Store
const commentStore = useCommentStore()

// 状态
const textareaRef = ref<HTMLTextAreaElement>()
const guestName = ref('')
const guestEmail = ref('')
const guestWebsite = ref('')
const rememberMe = ref(false)
const content = ref('')
const isFocused = ref(false)
const isSubmitting = ref(false)
const showEmojiPicker = ref(false)
const showPreview = ref(false)
const submitStatus = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const validationErrors = ref<string[]>([])

// ^^^^计算属性

const charCount = computed(() => content.value.length)

// 是否显示 guest 表单
const showGuestForm = computed(() => {
  if (props.isEdit) return false
  return true
})

const canSubmit = computed(() => {
  return content.value.trim().length > 0 &&
    charCount.value <= props.maxLength &&
    guestName.value.trim().length > 0 &&
    !isSubmitting.value
})

const submitText = computed(() => {
  return props.replyTo ? '回复' : props.isEdit ? '更新评论' : '发表评论'
})

const editorPlaceholder = computed(() => {
  if (props.replyTo) {
    return `回复 @${props.replyTo.user?.name || '访客'}...`
  }
  return props.placeholder
})

const renderedContent = computed(() => {
  if (!content.value.trim()) return '<p style="color:#9ca3af">暂无内容</p>'
  const html = marked(content.value) as string
  return DOMPurify.sanitize(html)
})

// 方法：加载/保存访客信息
const loadGuestInfo = () => {
  try {
    const saved = localStorage.getItem('guest_info')
    if (saved) {
      const info = JSON.parse(saved)
      guestName.value = info.name || ''
      guestEmail.value = info.email || ''
      rememberMe.value = true
    }
  } catch (error) {
    console.error('加载访客信息失败:', error)
  }
}

const handleRememberMe = (id: string | number | null) => {
  if (rememberMe.value) {
    localStorage.setItem('guest_info', JSON.stringify({
      name: guestName.value,
      email: guestEmail.value,
      id,
    }))
  } else {
    localStorage.removeItem('guest_info')
  }
}

// 方法：输入处理
const handleInput = () => {
  // 清除错误提示
  if (validationErrors.value.length > 0) {
    validationErrors.value = []
  }
}

const handleBlur = () => {
  // 延迟隐藏，让表情选择器有足够时间处理
  setTimeout(() => {
    isFocused.value = false
  }, 200)
}

// 方法：插入 Markdown 语法
const insertMarkdown = (type: string) => {
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = content.value.substring(start, end)

  const syntaxMap: Record<string, [string, string, string]> = {
    bold: ['**', '**', '加粗文字'],
    italic: ['*', '*', '斜体文字'],
    code: ['`', '`', '代码'],
    link: ['[', '](https://)', '链接文字'],
    quote: ['> ', '', '引用内容']
  }

  const [before, after, placeholder] = syntaxMap[type] || ['', '', '']
  const text = selected || placeholder
  const newText = before + text + after

  content.value =
    content.value.substring(0, start) +
    newText +
    content.value.substring(end)

  // 恢复焦点和光标位置
  nextTick(() => {
    textarea.focus()
    if (selected) {
      textarea.setSelectionRange(
        start + newText.length,
        start + newText.length
      )
    } else {
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + placeholder.length
      )
    }
  })
}

// 方法：表情操作
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const closeEmojiPicker = () => {
  showEmojiPicker.value = false
}

const insertEmoji = (emoji: string) => {
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  content.value =
    content.value.substring(0, start) +
    emoji +
    content.value.substring(end)

  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + emoji.length, start + emoji.length)
  })

  showEmojiPicker.value = false
}

/**
 * 验证表单
 * Validate form
 * 
 * This function checks the validity of the comment form. It ensures 
 * that the content, guest name, and guest email are not empty. It 
 * also validates the email format and checks if the content exceeds 
 * the maximum allowed length. Any validation errors are collected in 
 * the `validationErrors` array, which can be displayed to the user. 
 * The function returns `true` if the form is valid and `false` otherwise.
 */
const validateForm = (): boolean => {
  validationErrors.value = []

  if (!content.value.trim()) {
    validationErrors.value.push('评论内容不能为空')
  }

  if (!guestName.value.trim()) {
    validationErrors.value.push('昵称不能为空')
  }

  if (!guestEmail.value.trim()) {
    validationErrors.value.push('邮箱不能为空')
  }

  if (guestEmail.value && !isValidEmail(guestEmail.value)) {
    validationErrors.value.push('请输入有效的邮箱地址')
  }

  if (content.value.length > props.maxLength) {
    validationErrors.value.push(`评论内容不能超过 ${props.maxLength} 字`)
  }

  return validationErrors.value.length === 0
}

/**
 * 提交评论
 * Submit comment
 * 
 * This function handles the submission of a comment. It first 
 * checks if a submission is already in progress or if the form 
 * validation fails. If everything is valid, it sets the submission 
 * state to true and attempts to either create a new comment or update 
 * an existing one based on the `isEdit` prop. 
 * After a successful submission, it displays a success message and resets 
 * the form content. In case of an error, it logs the error and shows an 
 * error message. 
 * Finally, it resets the submission state.
 */
const handleSubmit = async () => {
  if (isSubmitting.value) return
  if (!(validateForm())) return

  isSubmitting.value = true
  submitStatus.value = null
  const word = props.isEdit ? '更新' : '发表'
  try {
    if (props.isEdit) {
      await updateComment()
    } else {
      await createComment()
    }

    submitStatus.value = {
      type: 'success',
      message: `评论${word}成功！`
    }
    ElMessage.success(`评论${word}成功，等待审核 ！`)

    setTimeout(() => {
      submitStatus.value = null
    }, 3000)

  } catch (error) {
    console.error('提交评论失败:', error)
    submitStatus.value = {
      type: 'error',
      message: `评论${word}失败，请稍后重试`
    }
  } finally {
    isSubmitting.value = false
  }
}

/**
 * 重置内容
 * Reset content
 */
function resetContent() {
  content.value = ''
  showPreview.value = false
}

/**
 * 创建评论
 * Create comment
 * 
 * This function is responsible for creating a new comment. It gathers 
 * the necessary data from the form, including the content and guest 
 * information, and then calls the store's addComment method to save 
 * the comment. 
 * After successfully adding the comment, it emits a 'comment-added' 
 * event and resets the form content.
 */
const createComment = async () => {
  const commentData = {
    content: content.value,
    user: {
      name: guestName.value.trim(),
      email: guestEmail.value.trim(),
      website: guestWebsite.value.trim() || undefined,
    },
    parentId: props.replyTo?.id,
  }

  // Invoke the store's addComment method to create a new comment
  const comment = await commentStore.addComment(props.articleId, commentData)

  emit('comment-added', comment)

  // 清空内容
  resetContent()

  // 记住信息
  if (rememberMe.value) {
    handleRememberMe(comment?.user?.id ?? null)
  }

  // 重置回复
  if (props.replyTo) {
    cancelReply()
  }

}

/**
 * 更新评论
 * Update comment
 * 
 * Use this function to update an existing comment. It checks 
 * if the commentId is provided, validates the input, and then 
 * calls the store's updateComment method. After a successful 
 * update, it emits a 'comment-edited' event and resets the content.
 */
const updateComment = async () => {
  const commentId = props.commentId
  if (!commentId) {
    ElMessage.error('评论不存在，请检查后重试')
    return
  }

  const commentData = {
    userId: props.userId,
    content: content.value,
  }

  // Invoke the store's updateComment method to update the existing comment
  const comment = await commentStore.updateComment(`${commentId}`, commentData)

  emit('comment-edited', comment)

  // 清空内容
  resetContent()

}

const cancelReply = () => {
  emit('cancel-reply')
}

// 工具函数
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const resetGuest = () => {
  guestName.value = ''
  guestEmail.value = ''
  guestWebsite.value = ''
  rememberMe.value = false
  localStorage.removeItem('guest_info')
}

const loadComment = () => {
  if (props.isEdit) {
    content.value = htmlToText(props.initialContent ?? '')
  }
}

// 生命周期
onMounted(() => {
  loadGuestInfo()

  loadComment()

  if (props.autoFocus) {
    nextTick(() => {
      textareaRef.value?.focus()
    })
  }

  // 点击外部关闭表情选择器
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element
    if (showEmojiPicker.value &&
      !target.closest('.emoji-picker-wrapper') &&
      !target.closest('.emoji-btn')) {
      showEmojiPicker.value = false
    }
  }

  document.addEventListener('click', handleClickOutside)

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})

defineExpose({
  focusEditor: () => textareaRef.value?.focus()
})
</script>

<style lang="scss" scoped>
$primary-color: #059669;
$primary-dark: #047857;
$text-primary: #1F2937;
$text-secondary: #6B7280;
$text-light: #9CA3AF;
$border-color: #E5E7EB;
$bg-color: #F9FAFB;
$radius: 8px;

// ========== 容器 ==========
.comment-form-container {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid $border-color;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

// ========== 头部 ==========
.comment-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid $primary-color;

  .comment-form-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.2rem;
    color: $text-primary;
    margin: 0;

    .title-icon {
      font-size: 1.4rem;
    }
  }

  .comment-count {
    font-size: 0.9rem;
    color: $text-secondary;
  }
}

// ========== 回复信息 ==========
.reply-to-info {
  background: rgba($primary-color, 0.05);
  border-radius: $radius;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid $primary-color;

  .reply-to-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: $text-secondary;

    .reply-author {
      color: $primary-color;
      font-weight: 500;
    }

    .cancel-reply {
      background: none;
      border: none;
      color: #dc2626;
      cursor: pointer;
      font-size: 0.85rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      transition: background 0.2s ease;

      &:hover {
        background: #fee2e2;
      }
    }
  }

  .reply-to-content {
    font-size: 0.9rem;
    color: $text-secondary;
    line-height: 1.5;
    max-height: 80px;
    overflow-y: auto;
  }
}

// ========== 访客信息表单 ==========
.guest-info-form {
  background: $bg-color;
  border-radius: $radius;
  padding: 1rem;
  margin-bottom: 1rem;

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 0.75rem;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }
  }

  .form-group {
    .form-label {
      display: block;
      margin-bottom: 0.25rem;
      font-size: 0.85rem;
      color: $text-secondary;

      .label-icon {
        margin-right: 0.25rem;
        color: $primary-color;
      }

      .label-name {
        font-weight: 500;
      }

      .required {
        margin-left: 0.25rem;
        color: #dc2626;
        font-weight: 600;
      }

      .optional {
        margin-left: 0.25rem;
        color: $text-light;
        font-weight: 400;
      }
    }

    .form-input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 2px solid $border-color;
      border-radius: 6px;
      font-size: 0.95rem;
      transition: border-color 0.3s ease;
      background: #ffffff;

      &:focus {
        border-color: $primary-color;
        outline: none;
      }

      &.error {
        border-color: #dc2626;
      }
    }
  }

  .form-options {
    .remember-checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: $text-secondary;
      cursor: pointer;

      input[type="checkbox"] {
        width: 16px;
        height: 16px;
        accent-color: $primary-color;
        cursor: pointer;
      }
    }
  }
}

// ========== 编辑器 ==========
.comment-editor {
  // position: relative;
  padding: 1rem;
}

.active-editor {
  position: relative;
}

.comment-textarea {
  width: 100%;
  min-height: 120px;
  max-height: 400px;
  padding: 1rem;
  border: 2px solid $border-color;
  border-radius: $radius $radius 0 0;
  font-size: 1rem;
  line-height: 1.6;
  color: $text-primary;
  background: #ffffff;
  outline: none;
  resize: vertical;
  transition: border-color 0.3s ease;
  font-family: inherit;

  &:focus {
    border-color: $primary-color;
  }

  &::placeholder {
    color: $text-light;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;

    &:hover {
      background: #9ca3af;
    }
  }
}

// ========== 工具栏 ==========
.editor-toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: $bg-color;
  border: 2px solid $border-color;
  border-top: none;
  border-radius: 0 0 $radius $radius;
  transition: border-color 0.3s ease;

  // &.is-focused {
  //   border-color: $primary-color;
  // }

  .toolbar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 1px solid $border-color;
    border-radius: 4px;
    background: #ffffff;
    color: $text-secondary;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;

    &:hover {
      background: $bg-color;
      border-color: $primary-color;
      color: $primary-color;
    }

    &.active {
      background: $primary-color;
      color: #ffffff;
      border-color: $primary-color;
    }

    &.emoji-btn {
      font-size: 1.1rem;
    }
  }
}

// ========== 表情选择器 ==========
.emoji-picker-wrapper {
  position: absolute;
  left: 0;
  top: 100%;
  width: 350px;
  max-width: 100vw;
  height: auto;
  margin-top: 0.5rem;
  margin-left: 100px;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

// ========== 编辑器底部 ==========
.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  flex-wrap: wrap;
  gap: 0.75rem;

  .footer-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .char-counter {
    font-size: 0.85rem;
    color: $text-light;

    &.char-warning {
      color: #dc2626;
      font-weight: 500;
    }
  }

  .preview-toggle {
    background: none;
    border: none;
    color: $primary-color;
    font-size: 0.85rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: background 0.2s ease;

    &:hover {
      background: rgba($primary-color, 0.1);
    }
  }

  .submit-btn {
    padding: 0.5rem 1.5rem;
    background: $primary-color;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 100px;
    min-height: 40px;

    &:hover:not(:disabled) {
      background: $primary-dark;
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(5, 150, 105, 0.3);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .submitting {
      display: inline-block;
      animation: pulse 1.5s ease-in-out infinite;
    }
  }
}

// ========== 预览 ==========
.comment-preview {
  margin-top: 1rem;
  padding: 1rem;
  background: $bg-color;
  border-radius: $radius;
  border: 1px solid $border-color;

  .preview-label {
    font-size: 0.85rem;
    color: $text-secondary;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .preview-content {
    font-size: 0.95rem;
    line-height: 1.6;
    color: $text-primary;

    :deep(p) {
      margin: 0 0 0.5rem 0;

      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep(a) {
      color: $primary-color;
      text-decoration: underline;
    }

    :deep(code) {
      background: rgba($primary-color, 0.1);
      padding: 0.1rem 0.3rem;
      border-radius: 4px;
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 0.9em;
    }

    :deep(blockquote) {
      border-left: 4px solid $primary-color;
      margin: 0.5rem 0;
      padding: 0.25rem 1rem;
      background: rgba($primary-color, 0.05);
      color: $text-secondary;
      font-style: italic;
    }
  }
}

// ========== 验证错误 ==========
.validation-errors {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: $radius;

  .error-item {
    color: #dc2626;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

// ========== 提交状态 ==========
.submit-status {
  margin-top: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: $radius;
  font-size: 0.9rem;
  font-weight: 500;

  &.success {
    background: #dcfce7;
    color: $primary-color;
    border: 1px solid #bbf7d0;
  }

  &.error {
    background: #fee2e2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }
}

// ========== 格式帮助 ==========
.format-help {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid $border-color;
}

.help-details {
  background: $bg-color;
  border-radius: $radius;
  padding: 0.5rem;

  .help-summary {
    font-size: 0.9rem;
    color: $text-secondary;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    list-style: none;

    &:hover {
      background: #f3f4f6;
    }

    &::-webkit-details-marker {
      display: none;
    }

    &:after {
      content: '▶';
      display: inline-block;
      margin-left: 0.5rem;
      transition: transform 0.3s ease;
      font-size: 0.8rem;
    }
  }

  &[open] .help-summary:after {
    transform: rotate(90deg);
  }

  .help-content {
    padding: 0.75rem;
    background: #ffffff;
    border-radius: 6px;
    margin-top: 0.5rem;
  }

  .help-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      padding: 0.15rem 0;
      font-size: 0.85rem;
      color: $text-secondary;
      line-height: 1.6;
    }
  }
}

// ========== 动画 ==========
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

// ========== 响应式 ==========
@media (max-width: 640px) {
  .comment-form-container {
    padding: 1rem;
  }

  .comment-form-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .guest-info-form .form-row {
    grid-template-columns: 1fr;
  }

  .editor-footer {
    flex-direction: column;
    align-items: stretch;

    .footer-left {
      justify-content: space-between;
    }

    .submit-btn {
      width: 100%;
    }
  }

  .emoji-picker {
    width: 280px;

    .emoji-grid {
      grid-template-columns: repeat(6, 1fr);
    }
  }
}
</style>