<template>
  <div class="comment-form-container">
    <div class="comment-form-header">
      <h3 class="comment-form-title">
        <i class="title-icon">💬</i>
        {{ props.isEdit ? '编辑评论' : '发表评论' }}
      </h3>
      <div v-if="user" class="comment-user-info">
        <img :src="user.avatar" :alt="user.nickname" class="user-avatar" />
        <span class="user-name">{{ user.nickname }}</span>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="comment-form">
      <!-- 回复对象 -->
      <div v-if="replyTo" class="reply-to-info">
        <div class="reply-to-header">
          <span>正在回复 @{{ replyTo.user.nickname }}</span>
          <button type="button" class="cancel-reply" @click="cancelReply">取消回复</button>
        </div>
        <div class="reply-to-content" v-html="replyTo.content"></div>
      </div>

      <!-- 评论编辑器 -->
      <div class="comment-editor">
        <!-- 文本编辑器 -->
        <div ref="editorRef" class="comment-textarea" contenteditable="true" :placeholder="editorPlaceholder"
          v-html="initialContent" @input="handleInput" @focus="handleEditorFocus" @paste="handlePaste"></div>

        <!-- 工具栏 -->
        <div v-if="showToolbar" class="editor-toolbar">
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
          <button type="button" class="toolbar-btn" @click="formatText('code')" title="代码">
            &lt;/&gt;
          </button>
          <button type="button" class="toolbar-btn" @click="insertEmoji" title="表情">
            😀
          </button>
        </div>

        <!-- 表情选择器 -->
        <EmojiPicker v-if="showEmojiPicker" @select="insertEmojiText" @close="showEmojiPicker = false"
          class="emoji-picker" />

        <!-- 预览模式 -->
        <div v-if="showPreview" class="comment-preview">
          <div class="preview-title">预览</div>
          <div class="preview-content" v-html="previewContent"></div>
        </div>

        <!-- 字数统计 -->
        <div class="editor-footer">
          <div class="char-counter">
            字数: {{ charCount }} / {{ maxLength }}
            <span v-if="charCount > maxLength" class="char-warning">
              (超出 {{ charCount - maxLength }} 字)
            </span>
          </div>

          <div class="editor-actions">
            <button type="button" class="preview-btn" @click="cancelReply">
              取消
            </button>

            <button type="button" class="preview-btn" @click="togglePreview">
              {{ showPreview ? '编辑' : '预览' }}
            </button>

            <button type="submit" class="submit-btn" :disabled="isSubmitting || !canSubmit"
              :class="{ submitting: isSubmitting }">
              <span v-if="!isSubmitting">
                {{ submitText }}
              </span>
              <LoadingSpinner v-else size="small" />
            </button>
          </div>
        </div>
      </div>

      <!-- 验证错误 -->
      <div v-if="validationErrors.length > 0" class="validation-errors">
        <div v-for="error in validationErrors" :key="error" class="error-item">
          ⚠️ {{ error }}
        </div>
      </div>

      <!-- 提交状态 -->
      <div v-if="submitStatus" class="submit-status" :class="submitStatus.type">
        {{ submitStatus.message }}
      </div>
    </form>

    <!-- 评论格式帮助 -->
    <div class="format-help">
      <details class="help-details">
        <summary class="help-summary">评论支持以下格式</summary>
        <div class="help-content">
          <ul class="help-list">
            <li><strong>加粗</strong>: **加粗文字** 或 &lt;b&gt;加粗文字&lt;/b&gt;</li>
            <li><em>斜体</em>: *斜体文字* 或 &lt;i&gt;斜体文字&lt;/i&gt;</li>
            <li><code>代码</code>: `代码`</li>
            <li>链接: [链接文字](https://example.com)</li>
            <li>引用: > 引用内容</li>
            <li>表情: 😀 😂 🎉 等</li>
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
import LoadingSpinner from '@/components/core/LoadingSpinner.vue'
import type { User } from '@/types/user'
import type { Comment, CommoentFormProps } from '@/types/comment'
import { markdownToHtml } from '@/utils/cabinet'

const props = withDefaults(defineProps<CommoentFormProps>(), {
  placeholder: '请输入您的评论...',
  autoFocus: false,
  maxLength: 2000
})

const emit = defineEmits<{
  'comment-added': [comment: Comment]
  'cancel-reply': []
}>()

// 状态
const editorRef = ref<HTMLElement>()
const content = ref('')
const isSubmitting = ref(false)
const showPreview = ref(false)
const showEmojiPicker = ref(false)
const showToolbar = ref(false)
const submitStatus = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const validationErrors = ref<string[]>([])

// 用户信息（实际应用中应该从store获取）
const user = ref<User | null>({
  id: 1,
  username: 'guest',
  nickname: '访客用户',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
  createdAt: ''
})

// 工具栏状态
const toolbarState = ref({
  bold: false,
  italic: false,
  underline: false
})

const previewContent = ref('')

// 计算属性
const charCount = computed(() => content.value.length)
const canSubmit = computed(() => {
  return content.value.trim().length > 0 &&
    charCount.value <= props.maxLength &&
    !isSubmitting.value
})

const submitText = computed(() => {
  if (props.replyTo) {
    return '回复'
  }
  return '发表评论'
})

const editorPlaceholder = computed(() => {
  if (props.replyTo) {
    return `回复 @${props.replyTo.user.nickname}...`
  }
  return props.placeholder
})

// const previewContent = computed(async () => {
//   // 使用marked解析markdown
//   const html = await marked(content.value)
//   // 使用DOMPurify净化HTML
//   return DOMPurify.sanitize(html)
// })
// const previewContent = computed(async () => {
//   return await markdownToHtml(content.value)
// })

// 方法
const handleInput = (event: Event) => {
  const target = event.target as HTMLElement
  content.value = target.innerHTML

  // 更新工具栏状态
  updateToolbarState()
}

const handleEditorFocus = () => {
  showToolbar.value = true
}

const updateToolbarState = () => {
  if (!editorRef.value) return

  const selection = window.getSelection()
  if (!selection || !selection.rangeCount) return

  const range = selection.getRangeAt(0)
  toolbarState.value = {
    bold: isStyleActive('bold'),
    italic: isStyleActive('italic'),
    underline: isStyleActive('underline')
  }
}

const isStyleActive = (style: string) => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false

  const range = selection.getRangeAt(0)
  if (range.collapsed) {
    const parent = selection.anchorNode?.parentElement
    return parent ? document.queryCommandState(style) : false
  }

  return document.queryCommandState(style)
}

const formatText = (command: string, value?: string) => {
  if (!editorRef.value) return

  // 保存当前选区
  const selection = window.getSelection()
  if (!selection) return

  // 聚焦编辑器
  editorRef.value.focus()

  // 执行格式命令
  switch (command) {
    case 'bold':
    case 'italic':
    case 'underline':
      document.execCommand(command, false)
      break

    case 'link':
      const url = prompt('请输入链接地址:', 'https://')
      if (url) {
        document.execCommand('createLink', false, url)
      }
      break

    case 'code':
      const selectedText = selection.toString()
      if (selectedText) {
        document.execCommand('insertHTML', false, `<code>${selectedText}</code>`)
      } else {
        document.execCommand('insertHTML', false, '<code></code>')
      }
      break
  }

  // 更新内容
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

  // 在光标位置插入表情
  const range = selection.getRangeAt(0)
  range.deleteContents()
  const textNode = document.createTextNode(emoji)
  range.insertNode(textNode)

  // 移动光标到表情后面
  range.setStartAfter(textNode)
  range.setEndAfter(textNode)
  selection.removeAllRanges()
  selection.addRange(range)

  // 更新内容
  content.value = editorRef.value.innerHTML
  showEmojiPicker.value = false
}

const handlePaste = async (event: ClipboardEvent) => {
  event.preventDefault()

  if (!editorRef.value) return

  const clipboardData = event.clipboardData
  if (!clipboardData) return

  let pastedText = clipboardData.getData('text')

  // 处理纯文本粘贴（避免格式问题）
  if (clipboardData.types.includes('text/plain')) {
    // 转义HTML特殊字符
    pastedText = pastedTextcancleHandler
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>')
  }

  // 插入处理后的文本
  document.execCommand('insertHTML', false, pastedText)
  content.value = editorRef.value.innerHTML
}

const togglePreview = () => {
  showPreview.value = !showPreview.value

  if (editorRef.value) {
    previewContent.value = editorRef.value.innerHTML
  }
}

const validateForm = (): boolean => {
  validationErrors.value = []

  if (!content.value.trim()) {
    validationErrors.value.push('评论内容不能为空')
  }

  if (content.value.length > props.maxLength) {
    validationErrors.value.push(`评论内容不能超过 ${props.maxLength} 字`)
  }

  // 检查是否有未闭合的HTML标签
  const div = document.createElement('div')
  div.innerHTML = content.value
  const invalidTags = Array.from(div.querySelectorAll('script, style, iframe'))
  if (invalidTags.length > 0) {
    validationErrors.value.push('评论内容包含不被允许的HTML标签')
  }

  return validationErrors.value.length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  submitStatus.value = null

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    const newComment: Comment = {
      id: Date.now().toString(),
      content: DOMPurify.sanitize(content.value),
      author: user.value!,
      createdAt: new Date().toISOString(),
      parentId: props.replyTo?.id
    }

    // 触发事件
    emit('comment-added', newComment)

    // 清空表单
    content.value = ''
    if (editorRef.value) {
      editorRef.value.innerHTML = ''
    }

    // 显示成功消息
    submitStatus.value = {
      type: 'success',
      message: '评论发表成功！'
    }

    // 3秒后清除成功消息
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

const focusEditor = () => {
  if (editorRef.value) {
    editorRef.value.focus()
  }
}

// 生命周期
onMounted(() => {
  if (editorRef.value && props.initialContent) {
    editorRef.value.innerHTML = props.initialContent
  }

  if (props.autoFocus) {
    nextTick(() => {
      focusEditor()
    })
  }

  // 监听全局点击，关闭表情选择器
  const handleClickOutside = (event: MouseEvent) => {
    if (showEmojiPicker.value &&
      !(event.target as Element).closest('.emoji-picker') &&
      !(event.target as Element).closest('.toolbar-btn')) {
      showEmojiPicker.value = false
    }
  }

  document.addEventListener('click', handleClickOutside)

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})

// 暴露方法给父组件
defineExpose({
  focusEditor
})
</script>

<style lang="scss" scoped>
.comment-form-container {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.comment-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #059669;
}

.comment-form-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  color: #1f2937;
  margin: 0;

  .title-icon {
    font-size: 1.4rem;
  }
}

.comment-user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #059669;
  }

  .user-name {
    font-weight: 500;
    color: #374151;
    font-size: 0.95rem;
  }
}

.reply-to-info {
  background: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 4px solid #059669;
}

.reply-to-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #6b7280;

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
  color: #4b5563;
  line-height: 1.5;
  max-height: 100px;
  overflow-y: auto;

  :deep() {
    * {
      margin: 0;
      font-size: 0.9rem;
    }
  }
}

.comment-editor {
  position: relative;
}

.comment-textarea {
  min-height: 120px;
  max-height: 400px;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.6;
  color: #1f2937;
  background: #ffffff;
  outline: none;
  overflow-y: auto;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #059669;
  }

  &[contenteditable="true"]:empty:before {
    content: attr(placeholder);
    color: #9ca3af;
  }

  &:deep() {
    a {
      color: #059669;
      text-decoration: underline;
    }

    code {
      background: rgba(5, 150, 105, 0.1);
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 0.9em;
    }

    b,
    strong {
      font-weight: 600;
    }

    i,
    em {
      font-style: italic;
    }
  }
}

.editor-toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 8px 8px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  color: #4b5563;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }

  &.active {
    background: #059669;
    color: #ffffff;
    border-color: #059669;
  }
}

.emoji-picker {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 100;
  margin-top: 0.5rem;
}

.comment-preview {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.preview-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.preview-content {
  font-size: 1rem;
  line-height: 1.6;
  color: #1f2937;

  :deep() {
    * {
      margin: 0 0 0.75rem 0;
      font-size: 1rem;
    }

    p:last-child {
      margin-bottom: 0;
    }

    a {
      color: #059669;
      text-decoration: underline;
    }

    code {
      background: rgba(5, 150, 105, 0.1);
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: 'SFMono-Regular', Consolas, monospace;
    }

    pre {
      background: #2d2d2d;
      color: #fff;
      padding: 1rem;
      border-radius: 6px;
      overflow-x: auto;

      code {
        background: none;
        padding: 0;
        color: inherit;
      }
    }

    blockquote {
      border-left: 4px solid #059669;
      margin: 1rem 0;
      padding: 0.5rem 1rem;
      background: rgba(5, 150, 105, 0.05);
      color: #4b5563;
    }
  }
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.char-counter {
  font-size: 0.85rem;
  color: #6b7280;

  .char-warning {
    color: #dc2626;
    font-weight: 500;
  }
}

.editor-actions {
  display: flex;
  gap: 0.75rem;
}

.preview-btn,
.submit-btn {
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.preview-btn {
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;

  &:hover {
    background: #e5e7eb;
  }
}

.submit-btn {
  background: #059669;
  color: #ffffff;

  &:hover:not(:disabled) {
    background: #047857;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(5, 150, 105, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.submitting {
    background: #10b981;
  }
}

.validation-errors {
  margin-top: 1rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}

.error-item {
  color: #dc2626;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }
}

.submit-status {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;

  &.success {
    background: #dcfce7;
    color: #059669;
    border: 1px solid #bbf7d0;
  }

  &.error {
    background: #fee2e2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }
}

.format-help {
  display: none;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.help-details {
  background: #f9fafb;
  border-radius: 8px;
  padding: 0.5rem;
}

.help-summary {
  font-size: 0.9rem;
  color: #6b7280;
  cursor: pointer;
  list-style: none;
  padding: 0.5rem;
  border-radius: 4px;

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
  }
}

details[open] .help-summary:after {
  transform: rotate(90deg);
}

.help-content {
  padding: 1rem;
  background: #ffffff;
  border-radius: 6px;
  margin-top: 0.5rem;
}

.help-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    padding: 0.25rem 0;
    font-size: 0.85rem;
    color: #4b5563;
    line-height: 1.6;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .comment-form-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .comment-form-title {
    font-size: 1.1rem;
  }

  .editor-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .editor-actions {
    width: 100%;

    .preview-btn,
    .submit-btn {
      flex: 1;
    }
  }
}
</style>