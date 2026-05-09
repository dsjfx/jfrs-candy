<template>
  <div class="article-detail-skeleton">
    <!-- 面包屑骨架 -->
    <div class="skeleton-breadcrumb">
      <div class="skeleton-line short"></div>
    </div>
    
    <!-- 标题骨架 -->
    <div class="skeleton-title">
      <div class="skeleton-line long"></div>
      <div class="skeleton-line medium"></div>
    </div>
    
    <!-- 元信息骨架 -->
    <div class="skeleton-meta">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-meta-items">
        <div class="skeleton-line short"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
    
    <!-- 标签骨架 -->
    <div class="skeleton-tags">
      <div class="skeleton-tag"></div>
      <div class="skeleton-tag"></div>
      <div class="skeleton-tag"></div>
    </div>
    
    <!-- 特色图片骨架 -->
    <div class="skeleton-featured-image"></div>
    
    <!-- 内容骨架 -->
    <div class="skeleton-content">
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line medium"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>
    
    <!-- 侧边栏骨架 -->
    <div class="skeleton-sidebar">
      <div class="skeleton-widget"></div>
      <div class="skeleton-widget"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  animated?: boolean
}

withDefaults(defineProps<Props>(), {
  animated: true
})
</script>

<style lang="scss" scoped>
.article-detail-skeleton {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-breadcrumb {
  margin-bottom: 1.5rem;
}

.skeleton-title {
  margin-bottom: 1.5rem;
}

.skeleton-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem 0;
  border-top: 1px solid #f5f5f5;
  border-bottom: 1px solid #f5f5f5;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

.skeleton-meta-items {
  flex: 1;
}

.skeleton-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.skeleton-tag {
  width: 60px;
  height: 28px;
  border-radius: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

.skeleton-featured-image {
  width: 100%;
  height: 300px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.skeleton-content {
  margin-bottom: 2rem;
}

.skeleton-line {
  width: 100%;
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  margin-bottom: 1rem;
  
  &.long {
    width: 90%;
  }
  
  &.medium {
    width: 70%;
  }
  
  &.short {
    width: 40%;
  }
}

.skeleton-sidebar {
  display: grid;
  gap: 1rem;
}

.skeleton-widget {
  height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 8px;
}

@keyframes skeleton-pulse {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>