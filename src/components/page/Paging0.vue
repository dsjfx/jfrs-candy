<template>
  <!-- 分页控件 -->
  <div class="pagination" :class="customClass">
    <button
      :disabled="current === 1"
      @click="goToPage(current - 1)"
      class="page-btn"
    >
      上一页
    </button>
    
    <div class="page-numbers">
      <span
        v-for="page in visiblePages"
        :key="page"
        :class="{ active: page === current }"
        @click="goToPage(page)"
        class="page-number"
      >
        {{ page }}
      </span>

      <span v-if="showEllipsis" class="ellipsis">...</span>
    </div>
    
    <button
      :disabled="current === totalPages"
      @click="goToPage(current + 1)"
      class="page-btn"
    >
      下一页
    </button>
    
    <div class="page-info">
      <span>第 {{ current }} 页 / 共 {{ totalPages }} 页</span>
      <select v-model="pageSize" @change="onPageSizeChange">
        <option value="12">12 张/页</option>
        <option value="24">24 张/页</option>
        <option value="36">36 张/页</option>
      </select>
    </div>
  </div>  
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';
import type { PageProps } from '@/types/pages'

const props = withDefaults(defineProps<PageProps>(), {
  maxVisiblePages: 5,
  showIcons: true,
  showText: true,
  showJump: true,
  showPageSize: true,
  showInfo: true,
  showTotal: true,
  customClass: '',
  pageSizeOptions: () => [12, 24, 36, 48]
});

const { current, total, pageSize, maxVisiblePages } = toRefs(props);

const emit = defineEmits<{
  'page-change': [page: number],
  'page-size-change': [size: number]
}>();


const goToPage = (page: number) => {
  if (page >= 1 && page <= total.value && page !== current.value) {
    // current.value = page
    // distributeImages()
    // window.scrollTo({ top: 0, behavior: 'smooth' })
    emit('page-change', page);
  }
}

const totalPages = computed(() => {
  if (total.value == 0) return 0
  return Math.ceil(total.value / pageSize.value)
})

// 可见页码
const visiblePages = computed(() => {
  const maxVisible = maxVisiblePages.value
  
  // 总页数少于最大可见页数，显示所有页码
  if (total.value <= maxVisible) {
    const pages: number[] = []
    for (let i = 1; i <= total.value; i++) {
      pages.push(i)
    }
    return pages
  }

  // 计算显示范围
  let start = Math.max(1, current.value - Math.floor(maxVisible / 2))
  let end = start + maxVisible - 1
  
  if (end > total.value) {
    end = total.value
    start = end - maxVisible + 1
  }
  
  const pages: number[] = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const showEllipsis = computed(() => {
  let maxVisible =  visiblePages.value[visiblePages.value.length - 1] || totalPages.value
  return totalPages.value > maxVisiblePages.value && maxVisible < totalPages.value
})

const onPageSizeChange = () => {
  // current.value = 1
  // distributeImages()
  emit('page-size-change', pageSize.value)
}

</script>
<style lang="scss">

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;

  .page-btn {
    padding: 10px 20px;
    border: none;
    background: #3498db;
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      background: #2980b9;
      transform: translateY(-2px);
    }

    &:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
      transform: none;
    }
  }

  .page-numbers {
    display: flex;
    gap: 8px;
    align-items: center;

    .page-number {
      padding: 8px 15px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;

      &:hover:not(.active) {
        background: #e0e0e0;
      }

      &.active {
        background: #3498db;
        color: white;
        font-weight: bold;
      }
    }

    .ellipsis {
      padding: 0 5px;
      color: #7f8c8d;
    }
  }

  .page-info {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-left: auto;
    font-size: 0.9rem;
    color: #666;

    select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      outline: none;
      transition: border-color 0.3s ease;

      &:focus {
        border-color: #3498db;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .pagination {
    flex-direction: column;
    gap: 10px;

    .page-info {
      margin-left: 0;
      order: -1;
    }
  }
}


</style>
