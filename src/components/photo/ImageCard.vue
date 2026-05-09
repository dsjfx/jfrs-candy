<template>
  <div 
    class="image-card"
    :class="{ 'image-card--zoomed': zoomed }"
    @click="handleClick"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div class="image-container">
      <img 
        :src="image.imageUrl" 
        :alt="image.title"
        class="image-card__image"
        :class="{ 'image-card__image--hover': hover }"
      />
      <div class="image-card__overlay" :class="{ 'image-card__overlay--visible': hover }">
        <div class="image-card__content">
          <h3 class="image-card__title">{{ image.title }}</h3>
          <p class="image-card__description">{{ image.description }}</p>
          <div class="image-card__tags">
            <span 
              v-for="tag in image.tags" 
              :key="tag"
              class="image-card__tag"
            >
              #{{ tag }}
            </span>
          </div>
          <div class="image-card__date">{{ formattedDate }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { BlogImage } from '../types';

interface Props {
  image: BlogImage;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  click: [image: BlogImage];
}>();

const hover = ref(false);
const zoomed = ref(false);

const formattedDate = computed(() => {
  const date = new Date(props.image.date);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const handleClick = () => {
  zoomed.value = !zoomed.value;
  emit('click', props.image);
};
</script>

<style scoped lang="scss">
@import '../styles/gallery.scss';

.image-card {
  position: relative;
  border-radius: $border-radius;
  overflow: hidden;
  box-shadow: 0 4px 12px $shadow-color;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  height: 300px;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
  
  &--zoomed {
    transform: scale(1.05);
    z-index: 10;
  }
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  
  &--hover {
    transform: scale(1.05);
  }
}

.image-card__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.85) 0%,
    rgba(0, 0, 0, 0.7) 50%,
    rgba(0, 0, 0, 0) 100%
  );
  padding: 30px 20px 20px;
  transform: translateY(100%);
  transition: transform 0.4s ease;
  
  &--visible {
    transform: translateY(0);
  }
}

.image-card__content {
  color: $text-light;
}

.image-card__title {
  font-size: 1.3rem;
  margin-bottom: 8px;
  font-weight: 600;
}

.image-card__description {
  font-size: 0.95rem;
  margin-bottom: 12px;
  opacity: 0.9;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.image-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.image-card__tag {
  background-color: rgba(255, 255, 255, 0.15);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
  }
}

.image-card__date {
  font-size: 0.85rem;
  opacity: 0.8;
}
</style>