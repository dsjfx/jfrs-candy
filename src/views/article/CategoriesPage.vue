<template>
  <div class="categories-page">
    <div class="page-header">
      <h1 class="page-title">分类</h1>
      <p class="page-description">探索不同主题的文章</p >
    </div>
    
    <div class="page-content">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>
      
      <div v-else class="categories-container">
        <div v-if="categories.length > 0" class="categories-grid">
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-card"
            @click="goToCategory(category)"
          >
            <div class="category-icon">
              <el-icon><Folder /></el-icon>
            </div>
            <h3 class="category-name">{{ category.name }}</h3>
            <p class="category-description" v-if="category.description">
              {{ category.description }}
            </p >
            <div class="category-meta">
              <span class="article-count">{{ category.articleCount }} 篇文章</span>
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-state">
          <el-empty description="暂无分类" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogStore } from '@/stores'
import { Folder, ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const blogStore = useBlogStore()

const loading = computed(() => blogStore.loading)
const categories = computed(() => blogStore.categories)

const goToCategory = (category: any) => {
  router.push({
    path: '/articles',
    query: { category: category.id }
  })
}

onMounted(async () => {
  if (blogStore.categories.length === 0) {
    await blogStore.fetchCategories()
  }
})
</script>

<style scoped lang="scss">
.categories-page {
  .page-header {
    text-align: center;
    margin-bottom: 48px;
    
    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 12px;
      background: linear-gradient(135deg, var(--color-primary), #66b1ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .page-description {
      font-size: 1.125rem;
      color: var(--color-text-secondary);
    }
  }
  
  .page-content {
    .loading-container {
      padding: 40px 0;
    }
    
    .categories-container {
      .categories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 24px;
        
        .category-card {
          padding: 32px 24px;
          background-color: var(--color-bg);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          
          &:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-md);
            
            .category-meta {
              color: var(--color-primary);
            }
          }
          
          .category-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, var(--color-primary), #66b1ff);
            border-radius: 50%;
            margin-bottom: 20px;
            
            .el-icon {
              font-size: 28px;
              color: white;
            }
          }
          
          .category-name {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 12px;
            color: var(--color-text);
          }
          
          .category-description {
            font-size: 0.875rem;
            color: var(--color-text-secondary);
            line-height: 1.6;
            margin-bottom: 20px;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .category-meta {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            color: var(--color-text-secondary);
            font-size: 0.875rem;
            transition: color 0.3s;
            
            .el-icon {
              font-size: 0.75rem;
            }
          }
        }
      }
      
      .empty-state {
        padding: 60px 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .categories-page {
    .page-header {
      margin-bottom: 32px;
      
      .page-title {
        font-size: 2rem;
      }
    }
    
    .page-content {
      .categories-container {
        .categories-grid {
          grid-template-columns: 1fr;
          gap: 20px;
        }
      }
    }
  }
}
</style>