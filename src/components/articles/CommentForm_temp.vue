<template>
  <div class="comment-form-container">
    <div class="comment-form-header">
      <h3 class="comment-form-title">
        <span class="title-icon">
          <FontAwesomeIcon :icon="['far', 'comment-dots']" />
        </span>
        <span>发表评论</span>
      </h3>
      <!-- <span class="comment-count">{{ comments }} 条评论</span> -->
    </div>

    <!-- 回复对象 -->
    <div v-if="replyTo" class="reply-to-info">
      <div class="reply-to-header">
        <span>
          正在回复 <span class="reply-author">@{{ replyTo.guestName || '访客' }}</span>
        </span>
        <button type="button" class="cancel-reply" @click="cancelReply">取消回复</button>
      </div>
      <div class="reply-to-content" v-html="replyTo.content"></div>
    </div>

    <!-- 访客信息表单 -->
    <div class="guest-info-form">
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
            <span class="optional">(可选)</span>
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
          <input type="checkbox" v-model="rememberMe" @change="handleRememberMe" />
          <span>记住我的信息</span>
        </label>
      </div>
    </div>

    <!-- 评论内容 -->
    <div class="comment-editor">
      <div class="active-editor">
        <div ref="editorRef" class="comment-textarea" contenteditable="true" :placeholder="editorPlaceholder"
          @input="handleInput" @focus="handleFocus" @paste="handlePaste" @keydown.ctrl.enter.prevent="handleSubmit">
        </div>

        <!-- 工具栏 -->
        <div v-if="isFocused" class="editor-toolbar">
          <button type="button" class="toolbar-btn" :class="{ active: toolbarState.bold }" @click="formatText('bold')"
            title="加粗">
            <strong>B</strong>
          </button>
          <button type="button" class="toolbar-btn" :class="{ active: toolbarState.italic }"
            @click="formatText('italic')" title="斜体">
            <em>I</em>
          </button>
          <button type="button" class="toolbar-btn" @click="formatText('link')" title="链接">
            🔗
          </button>
          <button type="button" class="toolbar-btn" @click.stop="insertEmoji" title="表情">
            😀
          </button>
        </div>

        <!-- 表情选择器 -->
        <div v-if="showEmojiPicker" class="emoji-picker-wrapper">
          <div class="emoji-picker">
            <div class="emoji-grid">
              <span v-for="emoji in emojis" :key="emoji" class="emoji-item" @click="insertEmojiText(emoji)">
                {{ emoji }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 字数统计 -->
      <div class="editor-footer">
        <div class="char-counter">
          <span :class="{ 'char-warning': charCount > maxLength }">
            {{ charCount }} / {{ maxLength }}
          </span>
        </div>

        <button type="button" class="submit-btn" :disabled="isSubmitting || !canSubmit" @click="handleSubmit">
          <span v-if="!isSubmitting">{{ submitText }}</span>
          <span v-else class="submitting">提交中...</span>
        </button>
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

    <!-- 评论格式帮助 -->
    <div class="format-help">
      <details class="help-details">
        <summary class="help-summary">支持 Markdown 格式</summary>
        <div class="help-content">
          <ul class="help-list">
            <li><strong>加粗</strong>: **加粗文字**</li>
            <li><em>斜体</em>: *斜体文字*</li>
            <li><code>代码</code>: `代码`</li>
            <li>链接: [链接文字](https://example.com)</li>
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

interface Comment {
  id: string
  content: string
  guestName: string
  guestEmail?: string
  guestWebsite?: string
  createdAt: string
  parentId?: string
  replies?: Comment[]
  likes?: number
  isLiked?: boolean
}

interface Props {
  articleId: string
  replyTo?: Comment | null
  placeholder?: string
  autoFocus?: boolean
  maxLength?: number
  comments?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '分享您的想法...',
  autoFocus: false,
  maxLength: 2000,
  comments: 0
})

const emit = defineEmits<{
  'comment-added': [comment: Comment]
  'cancel-reply': []
}>()

// State of the form, including guest info, content, and UI state
const guestName = ref('')
const guestEmail = ref('')
const guestWebsite = ref('')
const rememberMe = ref(false)
const content = ref('')
const isFocused = ref(false)
const isSubmitting = ref(false)
const showEmojiPicker = ref(false)
const submitStatus = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const validationErrors = ref<string[]>([])

// Editor reference for contenteditable div
const editorRef = ref<HTMLElement>()

// 工具栏状态
const toolbarState = ref({
  bold: false,
  italic: false
})

// Emoji列表
const emojis = ['😀', '😂', '🥰', '😎', '🤔', '😢', '👍', '❤️', '⭐', '🔥', '🎉', '💯']

// 计算属性
const charCount = computed(() => content.value.length)

const canSubmit = computed(() => {
  return content.value.trim().length > 0 &&
    charCount.value <= props.maxLength &&
    guestName.value.trim().length > 0 &&
    !isSubmitting.value
})

const submitText = computed(() => {
  return props.replyTo ? '回复' : '发表评论'
})

const editorPlaceholder = computed(() => {
  if (props.replyTo) {
    return `回复 @${props.replyTo.guestName || '访客'}...`
  }
  return props.placeholder
})

// 方法：加载访客信息
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

// 方法：记住访客信息
const handleRememberMe = () => {
  if (rememberMe.value) {
    localStorage.setItem('guest_info', JSON.stringify({
      name: guestName.value,
      email: guestEmail.value
    }))
  } else {
    localStorage.removeItem('guest_info')
  }
}

// 方法：编辑器处理
const handleInput = (event: Event) => {
  const target = event.target as HTMLElement
  content.value = target.innerHTML
  updateToolbarState()
}

const handleFocus = () => {
  isFocused.value = true
}

const handleBlur = () => {
  // 延迟隐藏工具栏，避免点击工具栏按钮时消失
  setTimeout(() => {
    isFocused.value = false
  }, 200)
}

const updateToolbarState = () => {
  toolbarState.value = {
    bold: document.queryCommandState('bold'),
    italic: document.queryCommandState('italic')
  }
}

const formatText = (command: string) => {
  if (!editorRef.value) return
  editorRef.value.focus()

  switch (command) {
    case 'bold':
      document.execCommand('bold', false)
      break
    case 'italic':
      document.execCommand('italic', false)
      break
    case 'link':
      const url = prompt('请输入链接地址:', 'https://')
      if (url) {
        document.execCommand('createLink', false, url)
      }
      break
  }

  content.value = editorRef.value.innerHTML
  updateToolbarState()
}

const insertEmoji = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const insertEmojiText = (emoji: string) => {
  if (!editorRef.value) return

  const selection = window.getSelection()
  if (!selection) return

  editorRef.value.focus()
  const range = selection.getRangeAt(0)
  range.deleteContents()
  const textNode = document.createTextNode(emoji)
  range.insertNode(textNode)

  range.setStartAfter(textNode)
  range.setEndAfter(textNode)
  selection.removeAllRanges()
  selection.addRange(range)

  content.value = editorRef.value.innerHTML
  showEmojiPicker.value = false
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()

  if (!editorRef.value) return

  const clipboardData = event.clipboardData
  if (!clipboardData) return

  const pastedText = clipboardData.getData('text/plain')

  // 检查是否为链接
  const urlRegex = /https?:\/\/[^\s]+/g
  if (urlRegex.test(pastedText)) {
    const html = pastedText.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
    })
    document.execCommand('insertHTML', false, html)
  } else {
    // 普通文本，转义HTML
    const escaped = pastedText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
    document.execCommand('insertHTML', false, escaped)
  }

  content.value = editorRef.value.innerHTML
}

// 方法：验证表单
const validateForm = (): boolean => {
  validationErrors.value = []

  if (!content.value.trim()) {
    validationErrors.value.push('评论内容不能为空')
  }

  if (!guestName.value.trim()) {
    validationErrors.value.push('昵称不能为空')
  }

  if (guestEmail.value && !isValidEmail(guestEmail.value)) {
    validationErrors.value.push('请输入有效的邮箱地址')
  }

  if (content.value.length > props.maxLength) {
    validationErrors.value.push(`评论内容不能超过 ${props.maxLength} 字`)
  }

  // 检查HTML标签
  const div = document.createElement('div')
  div.innerHTML = content.value
  const invalidTags = Array.from(div.querySelectorAll('script, style, iframe'))
  if (invalidTags.length > 0) {
    validationErrors.value.push('评论内容包含不被允许的 HTML 标签')
  }

  return validationErrors.value.length === 0
}

// 方法：提交评论
const handleSubmit = async () => {
  if (!validateForm() || isSubmitting.value) return

  isSubmitting.value = true
  submitStatus.value = null

  try {
    // 构建评论数据
    const commentData: any = {
      content: DOMPurify.sanitize(content.value),
      articleId: props.articleId,
      parentId: props.replyTo?.id,
      guestName: guestName.value.trim(),
      guestEmail: guestEmail.value.trim() || undefined
    }

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 600))

    // 构建返回的评论对象
    const newComment: Comment = {
      id: Date.now().toString(),
      content: commentData.content,
      guestName: commentData.guestName,
      guestEmail: commentData.guestEmail,
      createdAt: new Date().toISOString(),
      parentId: props.replyTo?.id,
      likes: 0,
      isLiked: false
    }

    // 触发事件
    emit('comment-added', newComment)

    // 清空表单
    content.value = ''
    if (editorRef.value) {
      editorRef.value.innerHTML = ''
    }

    // 记住信息
    if (rememberMe.value) {
      localStorage.setItem('guest_info', JSON.stringify({
        name: guestName.value,
        email: guestEmail.value
      }))
    }

    // 重置回复状态
    if (props.replyTo) {
      emit('cancel-reply')
    }

    submitStatus.value = {
      type: 'success',
      message: '评论发表成功！'
    }

    setTimeout(() => {
      submitStatus.value = null
    }, 3000)

  } catch (error) {
    console.error('提交评论失败:', error)
    submitStatus.value = {
      type: 'error',
      message: '评论发表失败，请稍后重试'
    }
  } finally {
    isSubmitting.value = false
  }
}

const cancelReply = () => {
  emit('cancel-reply')
}

// 工具函数
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// 生命周期
onMounted(() => {
  loadGuestInfo()

  if (props.autoFocus) {
    nextTick(() => {
      editorRef.value?.focus()
    })
  }

  // 点击外部关闭表情选择器
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element
    if (showEmojiPicker.value && !target.closest('.emoji-picker-wrapper')) {
      showEmojiPicker.value = false
    }
  }

  document.addEventListener('click', handleClickOutside)

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})

// 暴露方法
defineExpose({
  focusEditor: () => editorRef.value?.focus()
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
$breakpoint-tablet: 1024px;
$breakpoint-mobile: 768px;

.comment-form-container {
  padding: 1.5rem;
  background: #ffffff;
  border: 1px solid $border-color;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: $breakpoint-mobile) {
    padding: 1rem;
  }
}

.comment-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid $primary-color;

  @media (max-width: $breakpoint-mobile) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .comment-form-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    font-size: 1.2rem;
    color: $text-primary;

    .title-icon {
      font-size: 1.4rem;
    }
  }

  .comment-count {
    font-size: 0.9rem;
    color: $text-secondary;
  }
}

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

.guest-info-form {
  margin-bottom: 1rem;
  padding: 1rem;
  background: $bg-color;
  border-radius: $radius;

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 0.75rem;

    @media (max-width: $breakpoint-mobile) {
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
      background: #ffffff;
      border: 2px solid $border-color;
      border-radius: 6px;
      font-size: 0.95rem;
      transition: border-color 0.3s ease;

      &:focus {
        border-color: $primary-color;
        outline: none;
      }

      &.error {
        border-color: #dc2626;
      }

      &::placeholder {
        color: $text-light;
        opacity: 1;
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

.comment-editor {
  // position: relative;
  padding: 1rem;
}

.active-editor {
  position: relative;
}

.comment-textarea {
  min-height: 100px;
  max-height: 300px;
  padding: 1rem;
  background: #ffffff;
  border: 2px solid $border-color;
  border-radius: $radius;
  font-size: 1rem;
  line-height: 1.6;
  color: $text-primary;
  outline: none;
  overflow-y: auto;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: $primary-color;
  }

  &[contenteditable="true"]:empty:before {
    content: attr(placeholder);
    color: $text-light;
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
}

.editor-toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: $bg-color;
  border: 2px solid $border-color;
  border-top: none;
  border-radius: 0 0 $radius $radius;

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
    }

    &.active {
      background: $primary-color;
      color: #ffffff;
      border-color: $primary-color;
    }
  }
}

.emoji-picker-wrapper {
  position: absolute;
  left: 0;
  top: 100%;
  width: 270px;
  max-width: 100vw;
  height: auto;
  margin-top: 0.5rem;
  margin-left: 100px;
  z-index: 10;
}

.emoji-picker {
  background: #ffffff;
  border: 1px solid $border-color;
  border-radius: $radius;
  padding: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  .emoji-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.25rem;
    width: 200px;

    .emoji-item {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      padding: 0.25rem;
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.2s ease;

      &:hover {
        background: $bg-color;
        transform: scale(1.2);
      }
    }
  }
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;

  .char-counter {
    font-size: 0.85rem;
    color: $text-light;

    .char-warning {
      color: #dc2626;
      font-weight: 500;
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

  details[open] .help-summary:after {
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

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

@media (max-width: 768px) {



  .guest-info-form .form-row {
    grid-template-columns: 1fr;
  }

  .editor-footer {
    flex-direction: column;
    gap: 0.75rem;
  }

  .submit-btn {
    width: 100%;
  }
}
</style>