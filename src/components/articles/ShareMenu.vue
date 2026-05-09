<template>
  <div class="share-menu-overlay" @click="$emit('close')">
    <div class="share-menu" @click.stop>
      <div class="share-menu-header">
        <h3 class="share-title">
          <i class="share-icon">📤</i>
          分享文章
        </h3>
        <button class="close-btn" @click="$emit('close')" aria-label="关闭">
          ×
        </button>
      </div>
      
      <div class="share-content">
        <div class="share-options">
          <!-- 社交媒体分享 -->
          <div class="share-platforms">
            <button 
              v-for="platform in sharePlatforms"
              :key="platform.name"
              class="platform-btn"
              :style="{ backgroundColor: platform.color }"
              @click="shareToPlatform(platform)"
              :aria-label="`分享到${platform.name}`"
            >
              <span class="platform-icon">{{ platform.icon }}</span>
              <span class="platform-name">{{ platform.name }}</span>
            </button>
          </div>
          
          <!-- 复制链接 -->
          <div class="copy-link-section">
            <div class="link-preview">
              <input
                ref="linkInput"
                type="text"
                :value="shareUrl"
                readonly
                class="link-input"
                @click="selectLink"
              />
              <button 
                class="copy-btn"
                @click="copyLink"
                :class="{ copied: copyStatus === 'success' }"
              >
                <span v-if="copyStatus === 'idle'">复制</span>
                <span v-else-if="copyStatus === 'success'">✅ 已复制</span>
                <span v-else>❌ 失败</span>
              </button>
            </div>
          </div>
          
          <!-- 分享统计 -->
          <div v-if="showStats" class="share-stats">
            <div class="stat-item">
              <span class="stat-icon">👁️</span>
              <span class="stat-value">{{ stats.views }}</span>
              <span class="stat-label">阅读</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">📤</span>
              <span class="stat-value">{{ stats.shares }}</span>
              <span class="stat-label">分享</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">❤️</span>
              <span class="stat-value">{{ stats.likes }}</span>
              <span class="stat-label">点赞</span>
            </div>
          </div>
        </div>
        
        <!-- 生成二维码 -->
        <div v-if="showQRCode" class="qrcode-section">
          <div class="qrcode-header">
            <h4 class="qrcode-title">手机扫码分享</h4>
            <button class="download-btn" @click="downloadQRCode">
              <i class="download-icon">⬇️</i>
              下载
            </button>
          </div>
          <div ref="qrcodeRef" class="qrcode-container"></div>
        </div>
      </div>
      
      <!-- 分享提示 -->
      <div class="share-tips">
        <p class="tips-text">分享给朋友，一起学习进步！</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

interface Props {
  title: string
  url: string
  summary?: string
  image?: string
  showStats?: boolean
  showQRCode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  summary: '',
  image: '',
  showStats: true,
  showQRCode: true
})

const emit = defineEmits<{
  'close': []
  'shared': [platform: string]
}>()

// 状态
const copyStatus = ref<'idle' | 'success' | 'error'>('idle')
const linkInput = ref<HTMLInputElement>()
const qrcodeRef = ref<HTMLElement>()

// 分享统计
const stats = ref({
  views: 1256,
  shares: 89,
  likes: 256
})

// 分享平台配置
const sharePlatforms = [
  {
    name: '微信',
    icon: '💬',
    color: '#07C160',
    shareUrl: (url: string, title: string) => 
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
  },
  {
    name: '微博',
    icon: '📱',
    color: '#E6162D',
    shareUrl: (url: string, title: string) =>
      `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  },
  {
    name: 'QQ',
    icon: '💬',
    color: '#12B7F5',
    shareUrl: (url: string, title: string) =>
      `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  },
  {
    name: 'Twitter',
    icon: '🐦',
    color: '#1DA1F2',
    shareUrl: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  },
  {
    name: 'Facebook',
    icon: '📘',
    color: '#1877F2',
    shareUrl: (url: string, title: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  },
  {
    name: '复制链接',
    icon: '🔗',
    color: '#059669',
    shareUrl: (url: string, title: string) => url
  }
]

// 计算属性
const shareUrl = computed(() => {
  return props.url || window.location.href
})

// 方法
const shareToPlatform = (platform: any) => {
  if (platform.name === '复制链接') {
    copyLink()
    return
  }
  
  if (platform.name === '微信') {
    // 微信分享特殊处理，显示二维码
    generateQRCode()
    return
  }
  
  const shareUrl = platform.shareUrl(props.url, props.title)
  window.open(shareUrl, '_blank', 'width=600,height=400')
  
  emit('shared', platform.name)
  trackShare(platform.name)
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copyStatus.value = 'success'
    
    // 3秒后重置状态
    setTimeout(() => {
      copyStatus.value = 'idle'
    }, 3000)
    
    // 触发分享事件
    emit('shared', 'copy')
    trackShare('copy')
    
  } catch (err) {
    console.error('复制失败:', err)
    copyStatus.value = 'error'
    
    setTimeout(() => {
      copyStatus.value = 'idle'
    }, 3000)
  }
}

const selectLink = () => {
  if (linkInput.value) {
    linkInput.value.select()
  }
}

const generateQRCode = () => {
  // 这里可以使用第三方库生成二维码，如 qrcode
  // 为了简化，我们使用在线服务
  if (qrcodeRef.value) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl.value)}`
    qrcodeRef.value.innerHTML = `<img src="${qrUrl}" alt="分享二维码" />`
  }
}

const downloadQRCode = () => {
  // 下载二维码图片
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(shareUrl.value)}`
  const link = document.createElement('a')
  link.href = qrUrl
  link.download = `分享二维码-${props.title}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const trackShare = (platform: string) => {
  // 这里可以发送统计到后端
  console.log(`分享到 ${platform}:`, {
    title: props.title,
    url: props.url,
    timestamp: new Date().toISOString()
  })
}

// 生命周期
onMounted(() => {
  if (props.showQRCode) {
    nextTick(() => {
      generateQRCode()
    })
  }
})
</script>

<style lang="scss" scoped>
.share-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

.share-menu {
  width: 90%;
  max-width: 500px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.share-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
  background: linear-gradient(135deg, #059669, #10b981);
  color: #ffffff;
  
  .share-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0;
    
    .share-icon {
      font-size: 1.5rem;
    }
  }
  
  .close-btn {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    transition: background 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.share-content {
  padding: 1.5rem;
}

.share-options {
  margin-bottom: 1.5rem;
}

.share-platforms {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.platform-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.5rem;
  border: none;
  border-radius: 12px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 80px;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(-2px);
  }
  
  .platform-icon {
    font-size: 2rem;
  }
  
  .platform-name {
    font-size: 0.9rem;
    font-weight: 500;
  }
}

.copy-link-section {
  .link-preview {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .link-input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.9rem;
    color: #1f2937;
    background: #f9fafb;
    outline: none;
    cursor: pointer;
    
    &:focus {
      border-color: #059669;
    }
  }
  
  .copy-btn {
    padding: 0.75rem 1.5rem;
    background: #059669;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 80px;
    
    &:hover:not(.copied) {
      background: #047857;
    }
    
    &.copied {
      background: #10b981;
    }
  }
}

.share-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 12px;
  margin-top: 1.5rem;
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    
    .stat-icon {
      font-size: 1.2rem;
    }
    
    .stat-value {
      font-size: 1.2rem;
      font-weight: 600;
      color: #1f2937;
    }
    
    .stat-label {
      font-size: 0.8rem;
      color: #6b7280;
    }
  }
}

.qrcode-section {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
}

.qrcode-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  .qrcode-title {
    font-size: 1.1rem;
    color: #1f2937;
    margin: 0;
  }
  
  .download-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #059669;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: #047857;
    }
    
    .download-icon {
      font-size: 1rem;
    }
  }
}

.qrcode-container {
  display: flex;
  justify-content: center;
  
  img {
    width: 200px;
    height: 200px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    padding: 1rem;
  }
}

.share-tips {
  padding: 1rem 1.5rem;
  background: #f0fdf4;
  border-top: 1px solid #bbf7d0;
  text-align: center;
  
  .tips-text {
    margin: 0;
    color: #059669;
    font-size: 0.9rem;
  }
}

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
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>