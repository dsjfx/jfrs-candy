<template>
  <div class="emoji-picker-container">
    <div class="emoji-picker-header">
      <div class="emoji-search">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索表情..."
          class="search-input"
          @input="handleSearch"
        />
      </div>
      <div class="emoji-categories">
        <button
          v-for="category in categories"
          :key="category.name"
          class="category-btn"
          :class="{ active: activeCategory === category.name }"
          @click="setActiveCategory(category.name)"
          :title="category.label"
        >
          {{ category.icon }}
        </button>
      </div>
    </div>
    
    <div class="emoji-grid">
      <div 
        v-for="emoji in filteredEmojis"
        :key="emoji.emoji"
        class="emoji-item"
        :title="emoji.name"
        @click="selectEmoji(emoji.emoji)"
      >
        {{ emoji.emoji }}
      </div>
    </div>
    
    <div v-if="filteredEmojis.length === 0" class="no-results">
      没有找到相关表情
    </div>
    
    <div class="emoji-picker-footer">
      <button class="close-btn" @click="$emit('close')">
        关闭
      </button>
      <span class="emoji-count">
        {{ filteredEmojis.length }} / {{ allEmojis.length }} 个表情
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Emoji {
  emoji: string
  name: string
  category: string
  keywords: string[]
}

// 表情分类
const categories = [
  { name: 'smileys', label: '表情', icon: '😀' },
  { name: 'people', label: '人物', icon: '👋' },
  { name: 'animals', label: '动物', icon: '🐶' },
  { name: 'food', label: '食物', icon: '🍎' },
  { name: 'activities', label: '活动', icon: '⚽' },
  { name: 'travel', label: '旅行', icon: '✈️' },
  { name: 'objects', label: '物品', icon: '💡' },
  { name: 'symbols', label: '符号', icon: '❤️' },
  { name: 'flags', label: '旗帜', icon: '🎌' }
]

// 状态
const allEmojis = ref<Emoji[]>([])
const searchQuery = ref('')
const activeCategory = ref('smileys')

// 计算属性
const filteredEmojis = computed(() => {
  let emojis = allEmojis.value
  
  // 按分类过滤
  if (activeCategory.value !== 'all') {
    emojis = emojis.filter(emoji => emoji.category === activeCategory.value)
  }
  
  // 按搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    emojis = emojis.filter(emoji => 
      emoji.name.toLowerCase().includes(query) ||
      emoji.keywords.some(keyword => keyword.toLowerCase().includes(query))
    )
  }
  
  return emojis
})

// 方法
const setActiveCategory = (category: string) => {
  activeCategory.value = category
}

const selectEmoji = (emoji: string) => {
  emit('select', emoji)
}

const handleSearch = () => {
  if (searchQuery.value) {
    activeCategory.value = 'all'
  }
}

// 加载表情数据
const loadEmojis = async () => {
  // 这里可以加载真实的emoji数据
  // 为了示例，我们使用一些常见的emoji
  const emojiData: Emoji[] = [
    // 表情
    { emoji: '😀', name: '大笑', category: 'smileys', keywords: ['笑', '开心', '大笑'] },
    { emoji: '😂', name: '笑哭', category: 'smileys', keywords: ['笑哭', '笑哭了'] },
    { emoji: '🥰', name: '微笑爱心', category: 'smileys', keywords: ['爱', '喜欢', '爱心'] },
    { emoji: '😎', name: '酷', category: 'smileys', keywords: ['酷', '帅', '墨镜'] },
    { emoji: '🤔', name: '思考', category: 'smileys', keywords: ['思考', '疑惑'] },
    { emoji: '😢', name: '哭泣', category: 'smileys', keywords: ['哭', '伤心', '难过'] },
    { emoji: '😡', name: '生气', category: 'smileys', keywords: ['生气', '愤怒'] },
    
    // 人物
    { emoji: '👋', name: '挥手', category: 'people', keywords: ['挥手', '再见', '你好'] },
    { emoji: '👍', name: '点赞', category: 'people', keywords: ['赞', '好', '支持'] },
    { emoji: '👏', name: '鼓掌', category: 'people', keywords: ['鼓掌', '表扬', '喝彩'] },
    { emoji: '🙏', name: '祈祷', category: 'people', keywords: ['祈祷', '感谢', '拜托'] },
    
    // 动物
    { emoji: '🐶', name: '狗', category: 'animals', keywords: ['狗', '宠物'] },
    { emoji: '🐱', name: '猫', category: 'animals', keywords: ['猫', '宠物'] },
    { emoji: '🐼', name: '熊猫', category: 'animals', keywords: ['熊猫', '可爱'] },
    
    // 食物
    { emoji: '🍎', name: '苹果', category: 'food', keywords: ['苹果', '水果'] },
    { emoji: '🍕', name: '披萨', category: 'food', keywords: ['披萨', '食物'] },
    { emoji: '🍺', name: '啤酒', category: 'food', keywords: ['啤酒', '喝酒'] },
    
    // 活动
    { emoji: '⚽', name: '足球', category: 'activities', keywords: ['足球', '运动'] },
    { emoji: '🎮', name: '游戏手柄', category: 'activities', keywords: ['游戏', '电竞'] },
    { emoji: '🎨', name: '调色板', category: 'activities', keywords: ['艺术', '绘画'] },
    
    // 旅行
    { emoji: '✈️', name: '飞机', category: 'travel', keywords: ['飞机', '旅行'] },
    { emoji: '🚗', name: '汽车', category: 'travel', keywords: ['汽车', '开车'] },
    { emoji: '🏠', name: '房子', category: 'travel', keywords: ['家', '房子'] },
    
    // 物品
    { emoji: '💡', name: '灯泡', category: 'objects', keywords: ['灯泡', '想法', '创意'] },
    { emoji: '📱', name: '手机', category: 'objects', keywords: ['手机', '电话'] },
    { emoji: '💻', name: '笔记本电脑', category: 'objects', keywords: ['电脑', '工作'] },
    
    // 符号
    { emoji: '❤️', name: '红心', category: 'symbols', keywords: ['爱', '喜欢', '心'] },
    { emoji: '⭐', name: '星星', category: 'symbols', keywords: ['星星', '收藏'] },
    { emoji: '🎉', name: '派对', category: 'symbols', keywords: ['庆祝', '派对'] },
    { emoji: '🔥', name: '火焰', category: 'symbols', keywords: ['火', '热门', '厉害'] },
    { emoji: '💯', name: '一百分', category: 'symbols', keywords: ['满分', '完美'] },
    
    // 旗帜
    { emoji: '🇨🇳', name: '中国', category: 'flags', keywords: ['中国', '国旗'] },
    { emoji: '🇺🇸', name: '美国', category: 'flags', keywords: ['美国', '国旗'] },
  ]
  
  allEmojis.value = emojiData
}

// 事件
const emit = defineEmits<{
  'select': [emoji: string]
  'close': []
}>()

// 生命周期
onMounted(() => {
  loadEmojis()
})
</script>

<style lang="scss" scoped>
.emoji-picker-container {
  width: 320px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 1000;
}

.emoji-picker-header {
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.emoji-search {
  margin-bottom: 1rem;
  
  .search-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.95rem;
    color: #1f2937;
    background: #ffffff;
    outline: none;
    transition: border-color 0.3s ease;
    
    &:focus {
      border-color: #059669;
    }
    
    &::placeholder {
      color: #9ca3af;
    }
  }
}

.emoji-categories {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  
  .category-btn {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #ffffff;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: #f3f4f6;
      transform: translateY(-2px);
    }
    
    &.active {
      background: #059669;
      color: #ffffff;
      border-color: #059669;
    }
  }
}

.emoji-grid {
  height: 280px;
  overflow-y: auto;
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
    
    &:hover {
      background: #9ca3af;
    }
  }
}

.emoji-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.no-results {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
  font-style: italic;
}

.emoji-picker-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  
  .close-btn {
    padding: 0.5rem 1rem;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    color: #4b5563;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: #e5e7eb;
    }
  }
  
  .emoji-count {
    font-size: 0.85rem;
    color: #6b7280;
  }
}

// 响应式设计
@media (max-width: 480px) {
  .emoji-picker-container {
    width: 280px;
  }
  
  .emoji-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>