<template>
  <!-- 分页控件 -->
  <div class="pagination" :class="customClass">
    <!-- 上一页按钮 -->
    <button :disabled="current === 1" @click="onPageChange(current - 1)" class="page-btn prev-btn"
      :aria-label="`前往第 ${current - 1} 页`">
      <svg v-if="showIcons" class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      <span v-if="showText" class="page-text">上一页</span>
    </button>

    <div class="page-numbers">
      <!-- 第一页 -->
      <span v-if="showFirstPage" @click="onPageChange(1)" :class="{ active: current === 1 }" class="page-number"
        aria-label="前往第一页">
        1
      </span>

      <!-- 前省略号 -->
      <span v-if="showStartEllipsis" class="ellipsis">...</span>

      <!-- 中间页码 -->
      <span v-for="page in visiblePages" :key="page" :class="{ active: page === current }" @click="onPageChange(page)"
        class="page-number" :aria-label="`前往第 ${page} 页`">
        {{ page }}
      </span>

      <!-- 后省略号 -->
      <span v-if="showEndEllipsis" class="ellipsis">...</span>

      <!-- 最后一页 -->
      <span v-if="showLastPage" @click="onPageChange(totalPages)" :class="{ active: current === totalPages }"
        class="page-number" aria-label="前往最后一页">
        {{ totalPages }}
      </span>
    </div>

    <!-- 下一页按钮 -->
    <button :disabled="current === totalPages || totalPages == 0" @click="onPageChange(current + 1)"
      class="page-btn next-btn" :aria-label="`前往第 ${current + 1} 页`">
      <span v-if="showText" class="page-text">下一页</span>
      <svg v-if="showIcons" class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>

    <!-- 跳转输入 -->
    <div v-if="showJump" class="page-jump">
      <input v-model.number="jumpPage" type="number" :min="1" :max="totalPages" placeholder="页码"
        @keyup.enter="handleJump" class="jump-input" aria-label="输入要跳转的页码" />
      <button @click="handleJump" class="jump-btn" :disabled="!isValidJumpPage" aria-label="跳转到指定页面">
        跳转
      </button>
    </div>

    <!-- 页面大小选择 -->
    <div v-if="showPageSize" class="page-size-selector">
      <select v-model="selectedPageSize" @change="onPageSizeChange" class="size-select" aria-label="选择每页显示数量">
        <option v-for="size in pageSizeOptions" :key="size" :value="size" class="select-option">
          {{ size }} 条/页
        </option>
      </select>
    </div>

    <!-- 页面信息 -->
    <div v-if="showInfo" class="page-info">
      <span class="info-text">
        第 {{ current }} 页 / 共 {{ totalPages }} 页
        <span v-if="showTotal" class="total-items">(共 {{ total }} 条)</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRefs, onMounted, watch, nextTick } from 'vue';
import type { PageProps } from '@/types/pages'

const props = withDefaults(defineProps<PageProps>(), {
  maxVisiblePages: 4,
  showIcons: true,
  showText: true,
  showJump: true,
  showPageSize: true,
  showInfo: true,
  showTotal: true,
  customClass: '',
  pageSizeOptions: () => [12, 24, 36, 48]
});

// 响应式数据
const { current, total, pageSize, maxVisiblePages } = toRefs(props);
const jumpPage = ref<number>(1)
const selectedPageSize = ref<number>(props.pageSize)
const defaultPageSize = 12

// 定义 Emits
const emit = defineEmits<{
  'page-change': [page: number],
  'page-size-change': [size: number]
}>();

// 计算属性

const totalPages = computed(() => {
  if (total.value == 0) return 0
  return Math.ceil(total.value / pageSize.value)
})

const showFirstPage = computed(() => {
  return totalPages.value > 1
})

const showLastPage = computed(() => {
  return totalPages.value > 1 && totalPages.value > maxVisiblePages.value
})

const showStartEllipsis = computed(() => {
  return totalPages.value > maxVisiblePages.value
    && current.value > Math.floor(maxVisiblePages.value / 2) + 1
})

const showEndEllipsis = computed(() => {
  return totalPages.value > maxVisiblePages.value
    && current.value < totalPages.value - Math.floor(maxVisiblePages.value / 2)
})

const isValidJumpPage = computed(() => {
  return jumpPage.value >= 1 && jumpPage.value <= totalPages.value
})

const handleJump = () => {
  if (isValidJumpPage.value && jumpPage.value !== current.value) {
    onPageChange(jumpPage.value)
  }
}

// 可见页码
const visiblePages = computed(() => {
  const maxVisible = maxVisiblePages.value

  // 总页数少于最大可见页数，显示所有页码
  if (totalPages.value <= maxVisible) {
    const pages: number[] = []
    for (let i = 1; i <= totalPages.value; i++) {
      // 总页数大于1时，不显示第一页
      if (totalPages.value > 1 && i == 1) continue;
      pages.push(i)
    }
    return pages
  }

  // 计算显示范围
  let start = Math.max(2, current.value - Math.floor((maxVisible - 2) / 2))
  let end = start + maxVisible - 3

  if (end > totalPages.value - 1) {
    end = totalPages.value - 1
    start = end - maxVisible + 3
  }

  const pages: number[] = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

//方法

const onPageChange = (page: number) => {
  if (page >= 1 && page <= total.value && page !== current.value) {
    emit('page-change', page);
  }
}

const onPageSizeChange = () => {
  emit('page-size-change', selectedPageSize.value)
}

// 确保初始值在选项中
const validateInitialValue = () => {
  if (props.pageSizeOptions.length > 0) {
    // 如果当前值不在选项中，选择第一个选项
    if (!props.pageSizeOptions.includes(selectedPageSize.value)) {
      selectedPageSize.value = props.pageSizeOptions[0] || defaultPageSize
      // 通知父组件值被修正
      emit('page-size-change', selectedPageSize.value)
    }
  }
}

onMounted(async () => {
  // 下拉框设置默认值
  validateInitialValue()

  // 确保DOM更新后下拉框显示正确
  nextTick(() => {
    // console.log('当前选中的页面大小:', selectedPageSize.value)
    // console.log('可用选项:', props.pageSizeOptions)
  })
})

// 监听选项变化
watch(() => props.pageSizeOptions, (newOptions) => {
  if (newOptions.length > 0) {
    // 如果当前选中的值不在新选项中，修正它
    if (!newOptions.includes(selectedPageSize.value)) {
      selectedPageSize.value = newOptions[0] || defaultPageSize
      emit('page-size-change', selectedPageSize.value)
    }
  }
})

// 监听 Props 变化
watch(() => current.value, (newPage) => {
  jumpPage.value = newPage
})

// 监听父组件传递的pageSize变化
watch(() => pageSize.value, (newSize) => {
  // 只有当值不同且新值有效时才更新
  if (newSize !== selectedPageSize.value &&
    props.pageSizeOptions.includes(newSize)) {
    selectedPageSize.value = newSize
  }
})

</script>

<style lang="scss">
$breakpoint-mobile: 480px;

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 30px;
  padding: 20px;
  // background: #f8f9fa;
  border-radius: 12px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  @media (max-width: $breakpoint-mobile) {
    padding: 10px;
    gap: 5px;
  }

  // 按钮基础样式
  .page-btn {
    display: flex;
    min-height: 40px;
    padding: 10px 20px;
    border: none;
    background: $base-color-j1;
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    transition: all 0.3s ease;

    @media (max-width: $breakpoint-mobile) {
      font-size: 0.8rem;
      padding: 10px;
    }

    &:hover:not(:disabled) {
      background: $base-color-j3;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: #f5f5f5;
      border-color: #ddd;
      color: #999
    }

    .btn-icon {
      width: 18px;
      height: 18px;
    }

    &.prev-btn {
      order: 1;
    }

    &.next-btn {
      order: 3;
    }

    .page-text {
      @media (max-width: $breakpoint-mobile) {
        display: none;
      }
    }
  }

  // 按钮基础样式
  .page-numbers {
    display: flex;
    align-items: center;
    gap: 8px;
    order: 2;

    .page-number {
      padding: 8px 15px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.95rem;
      // font-weight: 500;
      transition: all 0.3s ease;

      @media (max-width: $breakpoint-mobile) {
        font-size: 0.8rem;
      }

      &:hover:not(.active) {
        background: #e0e0e0;
      }

      &.active {
        background: $base-color-j1;
        color: white;
        font-weight: bold;
      }
    }

    .ellipsis {
      padding: 0 5px;
      color: #7f8c8d;
      font-weight: 500;
      user-select: none;
    }
  }

  // 跳转输入
  .page-jump {
    display: flex;
    gap: 8px;
    order: 4;

    .jump-input {
      width: 58px;
      height: 40px;
      padding: 0 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 0.95rem;
      text-align: center;
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
      }

      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      &[type=number] {
        -moz-appearance: textfield;
        appearance: textfield;
      }
    }

    .jump-btn {
      padding: 0 10px;
      height: 40px;
      border: none;
      background: $base-color-j1;
      color: white;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 500;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        background: $base-color-j3;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(46, 204, 113, 0.2);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: #95a5a6;
      }
    }
  }

  // 页面大小选择
  .page-size-selector {
    order: 6;

    .size-select {
      height: 34px;
      padding: 0 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      background: white;
      color: #333;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-color: $base-color-j1;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
      }

      option {
        padding: 10px;

        &:hover {
          background-color: #059669;
        }
      }
    }
  }

  .page-info {
    display: flex;
    align-items: center;
    gap: 15px;
    order: 5;
    margin-left: auto;
    font-size: 0.9rem;
    color: #666;

    .info-text {
      display: inline-block;
      padding: 8px;
      // background: white;
      // border-radius: 8px;
      // border: 2px solid #e0e0e0;
    }

    .total-items {
      margin-left: 8px;
      color: #7f8c8d;
      font-size: 0.85rem;
    }
  }
}

// 响应式设计
// @media (max-width: 768px) {
//   .pagination {
//     flex-direction: column;
//     gap: 10px;

//     .page-numbers {
//       order: 1;
//       flex-wrap: wrap;
//       justify-content: center;
//     }

//     .page-btn {
//       order: 2;
//       width: 100%;
//       justify-content: center;

//       &.prev-btn,
//       &.next-btn {
//         width: calc(50% - 6px);
//       }
//     }

//     .page-jump {
//       order: 3;
//       width: 100%;
//       justify-content: center;
//     }

//     .page-size-selector {
//       order: 4;
//       width: 100%;

//       .size-select {
//         width: 100%;
//       }
//     }

//     .page-info {
//       order: 5;
//       width: 100%;
//     }
//   }
// }

// @media (max-width: 480px) {
//   .pagination {
//     gap: 10px;
//     padding: 10px;

//     .page-numbers {
//       .page-number {
//         min-width: 36px;
//         height: 36px;
//         font-size: 0.85rem;
//       }
//     }

//     .page-btn {
//       padding: 8px 12px;
//       font-size: 0.85rem;
//       min-height: 36px;
//     }

//     .jump-input,
//     .jump-btn,
//     .size-select {
//       height: 36px;
//       font-size: 0.85rem;
//     }
//   }
// }

// 动画效果
.page-number,
.page-btn {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

// 暗色主题支持
@media (prefers-color-scheme: dark) {
  .pagination {
    background: #2c3e50;

    .page-btn:not(:disabled) {
      background: #34495e;
      border-color: #4a6278;
      color: #ecf0f1;
    }

    .page-number:not(.active) {
      background: #34495e;
      border-color: #4a6278;
      color: #ecf0f1;

      &:hover {
        background: #3d566e;
        border-color: #5d7a94;
      }
    }

    .jump-input,
    .size-select {
      background: #34495e;
      border-color: #4a6278;
      color: #ecf0f1;

      &:focus {
        border-color: #3498db;
      }
    }

    .page-info .info-text {
      background: #34495e;
      border-color: #4a6278;
      color: #ecf0f1;
    }

    .ellipsis {
      color: #bdc3c7;
    }
  }
}
</style>
