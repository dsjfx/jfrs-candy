<template>
  <div class="tags-page">
    <div class="page-header">
      <h1 class="page-title">标签</h1>
      <p class="page-description">浏览所有标签</p >
    </div>
    
    <div class="page-content">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>
      
      <div v-else class="tags-container">
        <div v-if="tags.length > 0" class="tags-section">
          <div class="tags-header">
            <span class="tags-count">共 {{ tags.length }} 个标签</span>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索标签..."
              clearable
              size="small"
              class="search-input"
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          
          <div class="tags-cloud">
            <el-tag
              v-for="tag in filteredTags"
              :key="tag.id"
              class="tag-item"
              :type="getTagType(tag.id)"
              :size="getTagSize(tag.articleCount)"
              effect="light"
              @click="goToTag(tag)"
            >
              {{ tag.name }}
              <span class="tag-count">{{ tag.articleCount }}</span>
            </el-tag>
          </div>
          
          <div class="tags-list">
            <div
              v-for="tag in filteredTags"
              :key="tag.id"
              class="tag-list-item"
              @click="goToTag(tag)"
            >
              <div class="tag-info">
                <h3 class="tag-name">{{ tag.name }}</h3>
                <p class="tag-description" v-if="tag.description">
                  {{ tag.description }}
                </p >
              </div>
              <div class="tag-meta">
                <span class="article-count">{{ tag.articleCount }} 篇文章</span>
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-state">
          <el-empty description="暂无标签" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogStore } from '@/stores'
import { Search, ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const blogStore = useBlogStore()

const loading = computed(() => blogStore.loading)
const tags = computed(() => blogStore.tags)
const searchKeyword = ref('')

const filteredTags = computed(() => {
  if (!searchKeyword.value) return tags.value
  
  const keyword = searchKeyword.value.toLowerCase()
  return tags.value.filter(tag => 
    tag.name.toLowerCase().includes(keyword) ||
    (tag.description && tag.description.toLowerCase().includes(keyword))
  )
})

const getTagType = (id: number): string => {
  const types = ['', 'success', 'info', 'warning', 'danger']
  return types[id % types.length]
}

const getTagSize = (count: number): 'small' | 'medium' | 'large' => {
  if (count > 50) return 'large'
  if (count > 20) return 'medium'
  return 'small'
}

const goToTag = (tag: any) => {
  router.push({
    path: '/articles',
    query: { tag: tag.id }
  })
}

const handleSearch = () => {
  // 搜索功能已通过计算属性实现
}

onMounted(async () => {
  if (blogStore.tags.length === 0) {
    await blogStore.fetchTags()
  }
})
</script>

<style scoped lang="scss">
.tags-page {
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
    
    .tags-container {
      .tags-section {
        .tags-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
          
          .tags-count {
            font-size: 1.125rem;
            font-weight: 500;
            color: var(--color-text);
          }
          
          .search-input {
            width: 300px;
            
            @media (max-width: 768px) {
              width: 100%;
            }
          }
        }
        
        .tags-cloud {
          margin-bottom: 48px;
          padding: 32px;
          background-color: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
          text-align: center;
          
          .tag-item {
            margin: 8px;
            cursor: pointer;
            transition: all 0.3s;
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: var(--shadow-sm);
            }
            
            .tag-count {
              font-size: 0.75rem;
              opacity: 0.8;
              margin-left: 4px;
            }
          }
        }
        
        .tags-list {
          .tag-list-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            background-color: var(--color-bg);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-sm);
            cursor: pointer;
            transition: all 0.3s;
            margin-bottom: 16px;
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: var(--shadow-md);
              
              .tag-meta {
                color: var(--color-primary);
              }
            }
            
            .tag-info {
              .tag-name {
                margin: 0 0 8px 0;
                font-size: 1.125rem;
                font-weight: 600;
                color: var(--color-text);
              }
              
              .tag-description {
                margin: 0;
                font-size: 0.875rem;
                color: var(--color-text-secondary);
                line-height: 1.6;
              }
            }
            
            .tag-meta {
              display: flex;
              align-items: center;
              gap: 8px;
              color: var(--color-text-secondary);
              transition: color 0.3s;
              
              .el-icon {
                font-size: 0.875rem;
              }
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
  .tags-page {
    .page-header {
      margin-bottom: 32px;
      
      .page-title {
        font-size: 2rem;
      }
    }
    
    .page-content {
      .tags-container {
        .tags-section {
          .tags-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .tags-list {
            .tag-list-item {
              flex-direction: column;
              align-items: flex-start;
              gap: 12px;
              
              .tag-meta {
                align-self: flex-end;
              }
            }
          }
        }
      }
    }
  }
}
</style>