<template>
  <div class="error-display" :class="type">
    <div class="error-icon">
      <slot name="icon">
        <span v-if="type === 'network'">📡</span>
        <span v-else-if="type === 'empty'">📭</span>
        <span v-else>⚠️</span>
      </slot>
    </div>
    
    <h3 class="error-title">{{ title }}</h3>
    
    <p class="error-message">{{ message }}</p>
    
    <div class="error-actions">
      <slot name="actions">
        <button class="retry-btn" @click="$emit('retry')">
          {{ retryText }}
        </button>
        <button v-if="showHome" class="home-btn" @click="$emit('home')">
          返回首页
        </button>
      </slot>
    </div>
    
    <div v-if="showDetails" class="error-details">
      <button class="details-btn" @click="showDetails = !showDetails">
        {{ showDetails ? '隐藏详情' : '查看详情' }}
      </button>
      <pre v-if="showDetails" class="details-content">{{ errorDetails }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  error?: any
  type?: 'default' | 'network' | 'empty' | 'not-found'
  title?: string
  message?: string
  retryText?: string
  showHome?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  title: '出错了',
  retryText: '重试',
  showHome: true
})

const emit = defineEmits(['retry', 'home'])

const showDetails = ref(false)

const errorDetails = computed(() => {
  if (!props.error) return ''
  
  if (typeof props.error === 'string') return props.error
  
  if (props.error instanceof Error) {
    return JSON.stringify({
      message: props.error.message,
      stack: props.error.stack
    }, null, 2)
  }
  
  return JSON.stringify(props.error, null, 2)
})

const errorMessage = computed(() => {
  if (props.message) return props.message
  
  if (!props.error) return '发生了未知错误'
  
  if (typeof props.error === 'string') return props.error
  
  if (props.error instanceof Error) return props.error.message
  
  return '请求失败，请稍后重试'
})
</script>

<style lang="scss" scoped>
.error-display {
  text-align: center;
  padding: 48px 24px;
  max-width: 500px;
  margin: 0 auto;
  
  &.network {
    border-left: 4px solid #f59e0b;
  }
  
  &.empty {
    border-left: 4px solid #3b82f6;
  }
  
  &.not-found {
    border-left: 4px solid #8b5cf6;
  }
}

.error-icon {
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.7;
}

.error-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.error-message {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 32px;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.retry-btn,
.home-btn {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.retry-btn {
  background: #059669;
  color: white;
  
  &:hover {
    background: #047857;
    transform: translateY(-2px);
  }
}

.home-btn {
  background: #f3f4f6;
  color: #374151;
  
  &:hover {
    background: #e5e7eb;
  }
}

.error-details {
  margin-top: 24px;
}

.details-btn {
  background: none;
  border: none;
  color: #059669;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  
  &:hover {
    color: #047857;
  }
}

.details-content {
  margin-top: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 6px;
  text-align: left;
  font-size: 12px;
  color: #6b7280;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}
</style>