<template>
  <div class="image-gallery">
    <div class="gallery-header">
      <h2>{{ photoTitle }}</h2>
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索图片..."
          @input="handleSearch"
        />
        <FaIcon :icon="faSearch" />
      </div>
    </div>
    
    <div v-if="isLoading" class="loading-container">
      <LoadingSpinner />
      <p class="loading-text">{{ loadingText }}</p>
    </div>

    <!-- 瀑布流容器 -->
    <div v-else class="masonry-container">
      <div
        v-for="column in columns"
        :key="column.index"
        class="masonry-column"
        :style="{ width: columnWidth }"
      >
        <div
          v-for="item in column.items"
          :key="item.id"
          class="image-item"
          @click="handleImageClick(item)"
        >
          <!-- 图片容器 -->
          <div class="image-container">
            <img
              :src="item.url"
              :alt="item.title"
              :loading="lazy ? 'lazy' : 'eager'"
              @load="onImageLoad"
            />
            
            <!-- 文字说明遮罩层 -->
            <div class="image-overlay">
              <div class="image-content">
                <h3 class="image-title">{{ item.title }}</h3>
                <p class="image-description">{{ item.description }}</p >
                <div class="image-meta">
                  <span class="date">{{ formatDate(item.date) }}</span>
                  <span class="category">{{ item.category }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页控件 -->
    <Paging 
      v-if="!isLoading && !isEmpty"
      :current="current"
      :total="filteredPhotos.length"
      :page-size="pageSize"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
    />

    <!-- 图片预览模态框 -->
    <div v-if="selectedImage" class="modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closeModal">×</button>
        <img :src="selectedImage.url" :alt="selectedImage.title" />
        <div class="modal-info">
          <h2>{{ selectedImage.title }}</h2>
          <p>{{ selectedImage.description }}</p >
          <div class="modal-meta">
            <span>上传时间: {{ formatDate(selectedImage.date) }}</span>
            <span>分类: {{ selectedImage.category }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import Paging from '@/components/page/Paging.vue'
import LoadingSpinner from '@/components/core/LoadingSpinner.vue'
import { useLoading } from '@/composables/useLoading'
import type { PhotoItem } from '@/types/photo'
import { usePhotoStore } from '@/stores/photo'

const photoStore = usePhotoStore()
const {
  state,
  isLoading, 
  isLoadingMore, 
  isLoadingPage,
  hasError, 
  error,
  startLoading, 
  stopLoading 
} = useLoading()


// 响应式数据
const columns = ref<Array<{ index: number; items: PhotoItem[] }>>([])
const columnCount = ref(4)
const columnWidth = ref('25%')

const current = ref(1)
const pageSize = ref(4)

const searchQuery = ref('')
const selectedImage = ref<PhotoItem | null>(null)

const lazy = ref(true)

const photoTitle = import.meta.env.VITE_APP_PHOTO_TITLE || '图片故事'


// 计算属性

// const isLoading = computed(() => photoStore.isLoading)

const filteredPhotos = computed(() => {
  if (!searchQuery.value.trim()) {
    return photoStore.photos
  }
  
  const query = searchQuery.value.toLowerCase()
  return photoStore.photos.filter(image => 
    image.title.toLowerCase().includes(query) ||
    image.description.toLowerCase().includes(query) ||
    image.category.toLowerCase().includes(query)
  )
})

const totalPages = computed(() => {
  return Math.ceil(filteredPhotos.value.length / pageSize.value)
})

const isEmpty = computed(() => {
  return !isLoading.value && filteredPhotos.value.length === 0
})

const loadingText = computed(() => {
  if (isLoadingPage.value) return '正在加载页面...'
  if (isLoadingMore.value) return '正在加载更多...'
  return '正在加载...'
})

// 方法
const initColumns = () => {
  columns.value = Array.from({ length: columnCount.value }, (_, i) => ({
    index: i,
    items: []
  }))
}

const distributePhotos = () => {
  initColumns()
  let totalItems = filteredPhotos.value.length
  
  const startIndex = (current.value - 1) * pageSize.value
  const endIndex = Math.min(startIndex + pageSize.value, totalItems)
  const currentImages = filteredPhotos.value.slice(startIndex, endIndex)
  
  // 简单的按高度分布算法
  const columnHeights = Array(columnCount.value).fill(0)
  
  currentImages.forEach(image => {
    // 找到高度最小的列
    const minHeightIndex = columnHeights.indexOf(Math.min(...columnHeights))
    
    // 将图片添加到该列
    columns.value[minHeightIndex] && columns.value[minHeightIndex].items.push(image)
    
    // 更新列高度（考虑图片宽高比）
    columnHeights[minHeightIndex] += image.height / image.width
  })
}

const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== current.value) {
    current.value = page
    distributePhotos()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  current.value = 1
  distributePhotos()
}

const handleImageClick = (image: PhotoItem) => {
  selectedImage.value = image
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  selectedImage.value = null
  document.body.style.overflow = 'auto'
}

const handleSearch = () => {
  current.value = 1
  distributePhotos()
}

const onImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.opacity = '1'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const updateColumnCount = () => {
  const width = window.innerWidth
  
  if (width >= 1200) {
    columnCount.value = 4
  } else if (width >= 768) {
    columnCount.value = 3
  } else if (width >= 480) {
    columnCount.value = 2
  } else {
    columnCount.value = 1
  }
  
  columnWidth.value = `${100 / columnCount.value}%`
  distributePhotos()
}

const fetchPhotos = async () => {
  startLoading()

  try {
    await photoStore.fetchPhotos({
      page: current.value,
      pageSize: pageSize.value
    })
  } catch (err) {
    console.error('加载失败:', err)
    state.value.error = err instanceof Error ? err.message : '加载失败'
    state.value.hasError = true
  } finally {
    stopLoading()
  }
}

// 生命周期钩子
onMounted(async () => {
  if (photoStore.photos.length === 0) {
    await fetchPhotos()
  }
  updateColumnCount()
  distributePhotos()
  
  window.addEventListener('resize', updateColumnCount)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateColumnCount)
})

// 监听过滤后的图片变化
watch(filteredPhotos, () => {
  if (current.value > totalPages.value) {
    current.value = 1
  }
  distributePhotos()
})
</script>

<style lang="scss">
.image-gallery {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  .gallery-header {
    text-align: center;
    margin-bottom: 50px;
    padding-top: 10px;
    position: relative;

    h2 {
      margin-bottom: 20px;
      color: #333;
      font-size: 2.5rem;
      font-weight: 300;
    }

    .search-bar {
      position: relative;
      max-width: 500px;
      margin: 0 auto;

      input {
        width: 100%;
        padding: 0.8rem 1rem 0.8rem 2.5rem;
        font-size: 1rem;
        border: 2px solid #e0e0e0;
        border-radius: 25px;
        outline: none;
        transition: border-color 0.3s ease;

        &:focus {
          border-color: $base-color-j1;
        }

        &::placeholder {
          color: #aaa;
        }
      }

      svg {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        cursor: pointer;
      }      
    }
      
    // &::before {
    //   content: '';
    //   position: absolute;
    //   left: 0;
    //   top: 10px;
    //   width: 100px;
    //   height: 5px;
    //   background: linear-gradient(90deg, $base-color-j9, $base-color-j10);
    // }    
  }

  .loading-container {
    min-height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;

      .spinner-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(4px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
        animation: fadeIn 0.3s ease;
      }

      .loading-text {
        margin-top: 16px;
        color: #666;
        font-size: 14px;
        animation: pulse 1.5s infinite;
      }    
  }

  .masonry-container {
    display: flex;
    gap: 20px;
    margin-bottom: 40px;

    .masonry-column {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .image-item {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      background: white;
      cursor: pointer;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);

        .image-overlay {
          opacity: 1;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.8) 0%,
            rgba(0, 0, 0, 0.4) 50%,
            rgba(0, 0, 0, 0) 100%
          );
        }

        .image-title {
          transform: translateY(0);
        }

        .image-description {
          transform: translateY(0);
        }
      }
    }

    .image-container {
      position: relative;
      overflow: hidden;

      img {
        width: 100%;
        height: auto;
        display: block;
        transition: opacity 0.5s ease;
        opacity: 0;
      }
    }

    .image-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 20px;
      background: linear-gradient(
        to top,
        rgba(0, 0, 0, 0.6) 0%,
        rgba(0, 0, 0, 0.2) 50%,
        rgba(0, 0, 0, 0) 100%
      );
      color: white;
      transition: all 0.3s ease;
      opacity: 0.8;
    }

    .image-content {
      transform: translateY(10px);
      transition: transform 0.3s ease;
    }

    .image-title {
      margin: 0 0 8px 0;
      font-size: 1.2rem;
      font-weight: 600;
      transform: translateY(20px);
      transition: transform 0.3s ease 0.1s;
    }

    .image-description {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.4;
      opacity: 0.9;
      transform: translateY(20px);
      transition: transform 0.3s ease 0.2s, opacity 0.3s ease;
    }

    .image-meta {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
      font-size: 0.8rem;
      opacity: 0.7;

      .date,
      .category {
        background: rgba(255, 255, 255, 0.2);
        padding: 4px 8px;
        border-radius: 4px;
      }
    }
  }

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;

    .modal-content {
      position: relative;
      max-width: 90%;
      max-height: 90%;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      animation: slideUp 0.3s ease;

      .close-btn {
        position: absolute;
        top: 15px;
        right: 15px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        z-index: 10;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(0, 0, 0, 0.9);
          transform: scale(1.1);
        }
      }

      img {
        width: 100%;
        height: auto;
        max-height: 70vh;
        object-fit: contain;
      }

      .modal-info {
        padding: 25px;

        h2 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 1.8rem;
        }

        p {
          margin: 0 0 20px 0;
          color: #666;
          line-height: 1.6;
          font-size: 1.1rem;
        }

        .modal-meta {
          display: flex;
          gap: 20px;
          color: #888;
          font-size: 0.9rem;

          span {
            padding: 5px 10px;
            background: #f5f5f5;
            border-radius: 4px;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .image-gallery {
    padding: 10px;

    .gallery-header {
      h1 {
        font-size: 2rem;
      }
    }
  }
}

// 动画
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>