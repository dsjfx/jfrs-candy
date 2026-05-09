<template>
  <div 
    class="loading-spinner" 
    :class="[size, variant, { 'center': center }]"
    :style="spinnerStyle"
    aria-label="加载中"
    role="status"
  >
    <div class="spinner-inner">
      <div 
        v-for="n in dotCount" 
        :key="n"
        class="spinner-dot"
        :style="{
          '--dot-index': n - 1,
          'animation-delay': `${(n - 1) * 0.1}s`
        }"
      ></div>
    </div>
    
    <!-- 可选的文字 -->
    <span v-if="text" class="spinner-text">{{ text }}</span>
    <slot v-else></slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'small' | 'medium' | 'large'
  variant?: 'primary' | 'secondary' | 'light' | 'dark'
  color?: string
  center?: boolean
  text?: string
  dotCount?: number
}

withDefaults(defineProps<Props>(), {
  size: 'medium',
  variant: 'primary',
  center: true,
  dotCount: 8
})

const spinnerStyle = {
  '--spinner-color': '#059669' // 默认使用主色调
}
</script>

<style lang="scss" scoped>
.loading-spinner {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &.center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &.small {
    .spinner-inner {
      width: 40px;
      height: 40px;
    }
    
    .spinner-text {
      font-size: 12px;
      margin-top: 8px;
    }
  }

  &.medium {
    .spinner-inner {
      width: 60px;
      height: 60px;
    }
    
    .spinner-text {
      font-size: 14px;
      margin-top: 12px;
    }
  }

  &.large {
    .spinner-inner {
      width: 80px;
      height: 80px;
    }
    
    .spinner-text {
      font-size: 16px;
      margin-top: 16px;
    }
  }

  // 主题变体
  &.primary {
    --spinner-color: #059669;
  }

  &.secondary {
    --spinner-color: #3b82f6;
  }

  &.light {
    --spinner-color: #ffffff;
  }

  &.dark {
    --spinner-color: #1f2937;
  }
}

.spinner-inner {
  position: relative;
  width: 60px;
  height: 60px;
  animation: spinner-rotate 1.4s linear infinite;
}

.spinner-dot {
  position: absolute;
  width: 100%;
  height: 100%;
  
  &::before {
    content: '';
    display: block;
    width: 15%;
    height: 15%;
    background-color: var(--spinner-color, #059669);
    border-radius: 50%;
    animation: spinner-fade 1.2s linear infinite;
    animation-delay: calc(var(--dot-index) * 0.1s);
  }
  
  @for $i from 1 through 8 {
    &:nth-child(#{$i}) {
      transform: rotate(calc(45deg * #{$i}));
    }
  }
}

.spinner-text {
  margin-top: 12px;
  color: var(--spinner-color, #059669);
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

// 动画
@keyframes spinner-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes spinner-fade {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 1;
  }
}

// 其他动画变体
@keyframes spinner-bounce {
  0%, 100% {
    transform: scale(0.3);
    opacity: 0.5;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes spinner-wave {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>