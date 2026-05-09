<template>
  <el-card class="categories-card">
    <template #header>
      <div class="card-header">
        <h3 class="card-title">分类</h3>
        <router-link to="/categories" class="see-all">
          查看全部
          <el-icon><ArrowRight /></el-icon>
        </router-link>
      </div>
    </template>
    
    <div class="categories-list">
      <div
        v-for="category in categories"
        :key="category.id"
        class="category-item"
        @click="goToCategory(category)"
      >
        <div class="category-info">
          <span class="category-name">{{ category.name }}</span>
          <span class="category-count">{{ category.articleCount }}</span>
        </div>
        <div class="category-description" v-if="category.description">
          {{ category.description }}
        </div>
      </div>
    </div>
    
    <div v-if="categories.length === 0" class="empty-state">
      <el-empty description="暂无分类" />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogStore } from '@/stores'
import { ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const blogStore = useBlogStore()

const categories = computed(() => 
  blogStore.categories.slice(0, 5) // 只显示前5个
)

const goToCategory = (category: any) => {
  router.push({
    path: '/articles',
    query: { category: category.id }
  })
}

onMounted(() => {
  if (blogStore.categories.length === 0) {
    blogStore.fetchCategories()
  }
})
</script>

<style scoped lang="scss">
.categories-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .card-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text);
    }
    
    .see-all {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: color 0.3s;
      
      &:hover {
        color: var(--color-primary);
      }
      
      .el-icon {
        font-size: 0.75rem;
      }
    }
  }
}

.categories-list {
  .category-item {
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border);
    cursor: pointer;
    transition: background-color 0.3s;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:hover {
      .category-name {
        color: var(--color-primary);
      }
    }
    
    .category-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
      
      .category-name {
        font-weight: 500;
        color: var(--color-text);
        transition: color 0.3s;
      }
      
      .category-count {
        font-size: 0.75rem;
        color: white;
        background-color: var(--color-primary);
        padding: 2px 8px;
        border-radius: 10px;
      }
    }
    
    .category-description {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-oright: vertical;
      overflow: hidden;
    }
  }
}

.empty-state {
  padding: 20px 0;
}
</style>