<template>
  <div class="image-gallery">
    <div class="image-gallery__header">
      <h1 class="image-gallery__title">我的图片博客</h1>
      <p class="image-gallery__subtitle">记录生活中的美好瞬间</p>
      <div class="image-gallery__stats">
        共 {{ pagination.totalItems }} 张图片 · 第 {{ pagination.currentPage }} 页 / 共 {{ pagination.totalPages }} 页
      </div>
    </div>
    
    <div v-if="loading" class="image-gallery__loading">
      <div class="loading-spinner"></div>
      <p>加载图片中...</p>
    </div>
    
    <div v-else class="image-gallery__container">
      <div class="image-gallery__grid">
        <ImageCard
          v-for="image in paginatedImages"
          :key="image.id"
          :image="image"
          @click="handleImageClick"
          class="fade-in"
        />
      </div>
      
      <Pagination
        :current-page="pagination.currentPage"
        :total-pages="pagination.totalPages"
        @page-change="handlePageChange"
      />
    </div>
    
    <div v-if="selectedImage" class="image-modal" @click.self="closeModal">
      <div class="image-modal__content">
        <button class="image-modal__close" @click="closeModal">&times;</button>
        <img :src="selectedImage.imageUrl" :alt="selectedImage.title" class="image-modal__image" />
        <div class="image-modal__info">
          <h2 class="image-modal__title">{{ selectedImage.title }}</h2>
          <p class="image-modal__description">{{ selectedImage.description }}</p>
          <div class="image-modal__meta">
            <span class="image-modal__date">{{ formatDate(selectedImage.date) }}</span>
            <div class="image-modal__tags">
              <span 
                v-for="tag in selectedImage.tags" 
                :key="tag"
                class="image-modal__tag"
              >
                #{{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import ImageCard from '@/components/photo/ImageCard.vue';
import Pagination from '@/components/page/Pagination.vue';
import type { BlogImage, PaginationInfo } from '@/types/pages';

// 模拟数据生成
const generateMockImages = (): BlogImage[] => {
  const mockTitles = [
    '山间日出', '海边日落', '城市夜景', '森林漫步', '雪景如画',
    '春之气息', '夏日海滩', '秋日枫叶', '冬日暖阳', '星空浩瀚',
    '古镇风情', '现代都市', '田园风光', '湖泊倒影', '山脉连绵'
  ];
  
  const mockDescriptions = [
    '清晨的第一缕阳光穿透薄雾，给山峦披上了金色的外衣，万物在温暖中苏醒。',
    '夕阳西下，天空被染成橙红色，海浪轻拍沙滩，仿佛在诉说着一天的故事。',
    '城市的灯火如繁星般闪烁，高楼大厦的轮廓在夜色中显得格外迷人。',
    '漫步在静谧的森林中，阳光透过树叶洒下斑驳光影，呼吸着清新的空气。',
    '雪花轻轻飘落，覆盖了整个世界，一切变得纯净而安宁，仿佛时间都静止了。',
    '春天来了，花朵竞相开放，空气中弥漫着花香，处处充满生机。',
    '夏日海滩上，人们在阳光下享受海浪的拥抱，留下欢乐的足迹。',
    '秋日的枫叶如火般绚烂，漫步在小道上，脚下是沙沙作响的落叶。',
    '冬日的阳光虽然温和，却带来温暖的感觉，雪地在阳光下闪闪发光。',
    '夜晚仰望星空，银河横跨天际，让人感受到宇宙的浩瀚与神秘。',
  ];
  
  const mockTags = [
    ['自然', '风景'], ['城市', '建筑'], ['旅行', '摄影'], ['四季', '气候'],
    ['动物', '植物'], ['人文', '生活'], ['美食', '文化'], ['艺术', '创意']
  ];
  
  const images: BlogImage[] = [];
  
  for (let i = 1; i <= 50; i++) {
    const titleIndex = Math.floor(Math.random() * mockTitles.length);
    const descIndex = Math.floor(Math.random() * mockDescriptions.length);
    const tagIndex = Math.floor(Math.random() * mockTags.length);
    
    const year = 2023;
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    
    images.push({
      id: i,
      title: mockTitles[titleIndex] + ' ' + i,
      description: mockDescriptions[descIndex],
      imageUrl: `https://picsum.photos/800/600?random=${i}`,
      date: `${year}-${month}-${day}`,
      tags: mockTags[tagIndex]
    });
  }
  
  return images;
};

const images = ref<BlogImage[]>([]);
const loading = ref(true);
const selectedImage = ref<BlogImage | null>(null);
const pagination = ref<PaginationInfo>({
  currentPage: 1,
  pageSize: 12,
  totalPages: 1,
  totalItems: 0
});

// 计算分页后的图片
const paginatedImages = computed(() => {
  const startIndex = (pagination.value.currentPage - 1) * pagination.value.pageSize;
  const endIndex = startIndex + pagination.value.pageSize;
  return images.value.slice(startIndex, endIndex);
});

// 初始化分页信息
const updatePagination = () => {
  pagination.value.totalItems = images.value.length;
  pagination.value.totalPages = Math.ceil(images.value.length / pagination.value.pageSize);
};

// 处理图片点击
const handleImageClick = (image: BlogImage) => {
  selectedImage.value = image;
};

// 关闭模态框
const closeModal = () => {
  selectedImage.value = null;
};

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.value.currentPage = page;
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

// 模拟异步加载数据
onMounted(() => {
  setTimeout(() => {
    images.value = generateMockImages();
    updatePagination();
    loading.value = false;
  }, 800);
});
</script>

<style scoped lang="scss">
@import '../../styles/gallery.scss';

.image-gallery {
  padding: 20px 0 40px;
}

.image-gallery__header {
  text-align: center;
  margin-bottom: 40px;
}

.image-gallery__title {
  font-size: 2.5rem;
  color: $primary-color;
  margin-bottom: 10px;
  font-weight: 700;
}

.image-gallery__subtitle {
  font-size: 1.1rem;
  color: lighten($text-color, 20%);
  margin-bottom: 20px;
}

.image-gallery__stats {
  display: inline-block;
  background-color: lighten($primary-color, 40%);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.95rem;
  color: darken($primary-color, 10%);
  font-weight: 500;
}

.image-gallery__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: lighten($text-color, 30%);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid lighten($primary-color, 40%);
  border-top: 4px solid $primary-color;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.image-gallery__container {
  min-height: 500px;
}

.image-gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

// 模态框样式
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.image-modal__content {
  position: relative;
  max-width: 900px;
  max-height: 90vh;
  width: 90%;
  background-color: white;
  border-radius: $border-radius;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.4s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.image-modal__close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
}

.image-modal__image {
  width: 100%;
  max-height: 60vh;
  object-fit: contain;
  background-color: #f5f5f5;
}

.image-modal__info {
  padding: 25px;
  background-color: white;
}

.image-modal__title {
  font-size: 1.8rem;
  color: $text-color;
  margin-bottom: 15px;
  font-weight: 600;
}

.image-modal__description {
  font-size: 1.05rem;
  line-height: 1.6;
  color: lighten($text-color, 10%);
  margin-bottom: 20px;
}

.image-modal__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.image-modal__date {
  font-size: 0.95rem;
  color: lighten($text-color, 30%);
}

.image-modal__tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.image-modal__tag {
  background-color: lighten($primary-color, 40%);
  color: darken($primary-color, 10%);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

// 响应式设计
@media (max-width: 768px) {
  .image-gallery__title {
    font-size: 2rem;
  }
  
  .image-gallery__grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }
  
  .image-modal__content {
    flex-direction: column;
  }
  
  .image-modal__image {
    max-height: 50vh;
  }
  
  .image-modal__info {
    padding: 20px;
  }
  
  .image-modal__title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .image-gallery__grid {
    grid-template-columns: 1fr;
  }
  
  .image-modal__meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>