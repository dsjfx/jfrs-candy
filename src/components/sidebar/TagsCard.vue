<template>
  <el-card class="tags-card">
    <template #header>
      <div class="card-header">
        <h3 class="card-title">标签云</h3>
        <router-link to="/tags" class="see-all">
          查看全部
          <el-icon><ArrowRight /></el-icon>
        </router-link>
      </div>
    </template>
    
    <div class="tags-cloud">
      <el-tag
        v-for="tag in tags"
        :key="tag.id"
        class="tag-item"
        :type="getTagType(tag.id)"
        effect="plain"
        @click="goToTag(tag)"
      >
        {{ tag.name }}
        <span class="tag-count">{{ tag.articleCount }}</span>
      </el-tag>
    </div>
    
    <div v-if="tags.length === 0" class="empty-state">
      <el-empty description="暂无标签" />
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

const tags = computed(() => blogStore.tags.slice(0, 15)) // 只显示前15个标签

const getTagType = (id: number): string => {
  const types = ['', 'success', 'info', 'warning', 'danger']
  return types[id % types.length]
}

const goToTag = (tag: any) => {
  router.push({
    path: '/articles',
    query: { tag: tag.id }
  })
}

onMounted(() => {
  if (blogStore.tags.length === 0) {
    blogStore.fetchTags()
  }
})
</script>

<style scoped lang="scss">
.tags-card {
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

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  .tag-item {
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

.empty-state {
  padding: 20px 0;
}
</style>