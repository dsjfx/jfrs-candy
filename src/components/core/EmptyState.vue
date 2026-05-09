<template>
  <div class="empty-state" :class="type">
    <div class="empty-icon">
      <slot name="icon">
        <span v-if="type === 'search'">🔍</span>
        <span v-else-if="type === 'favorites'">⭐</span>
        <span v-else>📄</span>
      </slot>
    </div>
    
    <h3 class="empty-title">{{ title }}</h3>
    
    <p class="empty-message">{{ message }}</p>
    
    <div class="empty-actions">
      <slot name="actions">
        <button class="primary-btn" @click="$emit('refresh')">
          {{ actionText }}
        </button>
        <button v-if="showBrowse" class="secondary-btn" @click="$emit('browse')">
          浏览更多
        </button>
      </slot>
    </div>
    
    <!-- 推荐内容 -->
    <div v-if="recommendations && recommendations.length > 0" class="empty-recommendations">
      <h4 class="recommendations-title">你可能感兴趣</h4>
      <div class="recommendations-list">
        <a 
          v-for="item in recommendations" 
          :key="item.id"
          :href="item.url"
          class="recommendation-item"
        >
          {{ item.title }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'default' | 'search' | 'favorites' | 'drafts'
  title?: string
  message?: string
  actionText?: string
  showBrowse?: boolean
  recommendations?: Array<{
    id: number
    title: string
    url: string
  }>
}

withDefaults(defineProps<Props>(), {
  type: 'default',
  title: '暂无内容',
  message: '这里还没有任何内容，快去创建第一个吧！',
  actionText: '刷新一下',
  showBrowse: true,
  recommendations: () => []
})

defineEmits(['refresh', 'browse'])
</script>

<style lang="scss" scoped>
.empty-state {
  text-align: center;
  padding: 64px 24px;
  max-width: 600px;
  margin: 0 auto;
  
  &.search {
    border-top: 4px solid #8b5cf6;
  }
  
  &.favorites {
    border-top: 4px solid #f59e0b;
  }
}

.empty-icon {
  font-size: 72px;
  margin-bottom: 24px;
  opacity: 0.5;
  animation: float 3s ease-in-out infinite;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.empty-message {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 32px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.empty-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 40px;
}

.primary-btn,
.secondary-btn {
  padding: 12px 32px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.primary-btn {
  background: #059669;
  color: white;
  
  &:hover {
    background: #047857;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
  }
}

.secondary-btn {
  background: #f3f4f6;
  color: #374151;
  
  &:hover {
    background: #e5e7eb;
    transform: translateY(-2px);
  }
}

.empty-recommendations {
  border-top: 1px solid #e5e7eb;
  padding-top: 32px;
}

.recommendations-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 400px;
  margin: 0 auto;
}

.recommendation-item {
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;
  color: #059669;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f0fdf4;
    transform: translateX(4px);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>