<template>
  <div class="pagination">
    <button 
      class="pagination__button"
      :class="{ 'pagination__button--disabled': currentPage === 1 }"
      @click="goToPage(currentPage - 1)"
      :disabled="currentPage === 1"
    >
      上一页
    </button>
    
    <div class="pagination__pages">
      <button
        v-for="page in visiblePages"
        :key="page"
        class="pagination__page"
        :class="{
          'pagination__page--active': page === currentPage,
          'pagination__page--dots': page === '...'
        }"
        @click="goToPage(page)"
        :disabled="page === '...'"
      >
        {{ page }}
      </button>
    </div>
    
    <button 
      class="pagination__button"
      :class="{ 'pagination__button--disabled': currentPage === totalPages }"
      @click="goToPage(currentPage + 1)"
      :disabled="currentPage === totalPages"
    >
      下一页
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  currentPage: number;
  totalPages: number;
  maxVisiblePages?: number;
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 5
});

const emit = defineEmits<{
  pageChange: [page: number];
}>();

const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const { currentPage, totalPages, maxVisiblePages } = props;
  
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    const half = Math.floor(maxVisiblePages / 2);
    
    if (currentPage <= half + 1) {
      for (let i = 1; i <= maxVisiblePages - 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - half) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - maxVisiblePages + 2; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = currentPage - Math.floor((maxVisiblePages - 4) / 2); i <= currentPage + Math.floor((maxVisiblePages - 4) / 2); i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    }
  }
  
  return pages;
});

const goToPage = (page: number | string) => {
  if (typeof page === 'number' && page >= 1 && page <= props.totalPages) {
    emit('pageChange', page);
  }
};
</script>

<style scoped lang="scss">
@import '../styles/gallery.scss';

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
  
  .pagination__button {
    padding: 10px 20px;
    border: none;
    background-color: $primary-color;
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &:hover:not(:disabled) {
      background-color: darken($primary-color, 10%);
      transform: translateY(-2px);
    }
    
    &--disabled {
      background-color: lighten($primary-color, 25%);
      cursor: not-allowed;
      transform: none !important;
    }
  }
}

.pagination__pages {
  display: flex;
  gap: 8px;
}

.pagination__page {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid lighten($primary-color, 30%);
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background-color: lighten($primary-color, 35%);
    border-color: $primary-color;
  }
  
  &--active {
    background-color: $primary-color;
    color: white;
    border-color: $primary-color;
  }
  
  &--dots {
    border: none;
    background-color: transparent;
    cursor: default;
    
    &:hover {
      background-color: transparent;
      border: none;
    }
  }
}
</style>