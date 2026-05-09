<template>
  <el-card class="about-card">
    <template #header>
      <div class="card-header">
        <h3 class="card-title">关于我</h3>
      </div>
    </template>
    
    <div class="about-content">
      <div class="avatar-section">
        <el-avatar :size="80" :src="user?.avatar || defaultAvatar" />
        <div class="user-info">
          <h4 class="username">{{ user?.username || '博主' }}</h4>
          <p class="bio">{{ user?.bio || '热爱技术，热爱生活' }}</p >
        </div>
      </div>
      
      <div class="stats">
        <div class="stat-item">
          <div class="stat-number">{{ stats.articles }}</div>
          <div class="stat-label">文章</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ stats.categories }}</div>
          <div class="stat-label">分类</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ stats.tags }}</div>
          <div class="stat-label">标签</div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBlogStore } from '@/stores'

const blogStore = useBlogStore()

const user = computed(() => blogStore.user)
const stats = computed(() => ({
  articles: blogStore.articles.length,
  categories: blogStore.categories.length,
  tags: blogStore.tags.length
}))

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
</script>

<style scoped lang="scss">
.about-card {
  .card-header {
    .card-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text);
    }
  }
}

.about-content {
  .avatar-section {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    
    .user-info {
      .username {
        margin: 0 0 8px 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--color-text);
      }
      
      .bio {
        margin: 0;
        color: var(--color-text-secondary);
        font-size: 0.875rem;
        line-height: 1.5;
      }
    }
  }
  
  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    text-align: center;
    
    .stat-item {
      padding: 12px;
      background-color: var(--color-bg-secondary);
      border-radius: var(--radius-md);
      transition: transform 0.3s;
      
      &:hover {
        transform: translateY(-2px);
        background-color: var(--color-primary);
        
        .stat-number,
        .stat-label {
          color: white;
        }
      }
      
      .stat-number {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-primary);
        margin-bottom: 4px;
      }
      
      .stat-label {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
      }
    }
  }
}

@media (max-width: 768px) {
  .about-content {
    .stats {
      gap: 12px;
      
      .stat-item {
        padding: 10px;
        
        .stat-number {
          font-size: 1.25rem;
        }
      }
    }
  }
}
</style>