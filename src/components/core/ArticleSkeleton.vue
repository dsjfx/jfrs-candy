<template>
  <div class="article-skeleton">
    <div class="skeleton-header">
      <div class="skeleton-category"></div>
      <div class="skeleton-date"></div>
    </div>
    
    <div class="skeleton-title"></div>
    <div class="skeleton-content">
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
      <div class="skeleton-line"></div>
    </div>
    
    <div class="skeleton-footer">
      <div class="skeleton-tags">
        <div class="skeleton-tag"></div>
        <div class="skeleton-tag"></div>
        <div class="skeleton-tag"></div>
      </div>
      <div class="skeleton-button"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 可配置的骨架屏
interface Props {
  variant?: 'default' | 'compact' | 'featured'
  animated?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  animated: true
})
</script>

<style lang="scss" scoped>
.article-skeleton {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #f0f0f0;
  animation: var(--skeleton-animation, skeleton-pulse 1.5s ease-in-out infinite);
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.skeleton-category {
  width: 60px;
  height: 24px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 12px;
}

.skeleton-date {
  width: 100px;
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
}

.skeleton-title {
  width: 70%;
  height: 28px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  margin-bottom: 16px;
}

.skeleton-content {
  margin-bottom: 20px;
}

.skeleton-line {
  width: 100%;
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  margin-bottom: 8px;
  
  &.short {
    width: 80%;
  }
}

.skeleton-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f5f5f5;
}

.skeleton-tags {
  display: flex;
  gap: 8px;
}

.skeleton-tag {
  width: 50px;
  height: 24px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 12px;
}

.skeleton-button {
  width: 80px;
  height: 36px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 18px;
}

// 骨架屏动画
@keyframes skeleton-pulse {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes skeleton-shimmer {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

// 配置不同的动画
.article-skeleton.animated {
  --skeleton-animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.article-skeleton.fade {
  --skeleton-animation: skeleton-shimmer 1.5s ease-in-out infinite;
}
</style>