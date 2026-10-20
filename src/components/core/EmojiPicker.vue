<template>
  <div class="emoji-picker">
    <div class="emoji-categories">
      <button v-for="cat in emojiCategories" :key="cat.name" type="button" class="category-btn"
        :class="{ active: currentCategory === cat.name }" @click.stop="currentCategory = cat.name">
        {{ cat.icon }}
      </button>
    </div>

    <div class="emoji-grid">
      <span v-for="emoji in filteredEmojis" :key="emoji" class="emoji-item" @click.stop="insertEmoji(emoji)">
        {{ emoji }}
      </span>
    </div>

    <div class="emoji-picker-footer">
      <span class="emoji-count">{{ filteredEmojis.length }} 个表情</span>
      <button type="button" class="close-emoji-btn" @click.stop="closeEmojiPicker">
        关闭
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const currentCategory = ref('all')

const emit = defineEmits<{
  (e: 'insert-emoji', emoji: string): void
  (e: 'close'): void
}>()

const emojiCategories = [
  { name: 'all', icon: '🌟' },
  { name: 'smileys', icon: '😀' },
  { name: 'people', icon: '👋' },
  { name: 'animals', icon: '🐶' },
  { name: 'food', icon: '🍎' },
  { name: 'symbols', icon: '❤️' }
]

const emojiData: Record<string, string[]> = {
  smileys: ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '🥰', '😘', '🤔', '😐', '😴', '😢', '😭', '😡'],
  people: ['👋', '👍', '👎', '👏', '🙌', '🙏', '💪', '🤝', '✌️', '🤞', '👌', '👀'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'],
  food: ['🍎', '🍊', '🍌', '🍉', '🍇', '🍓', '🍕', '🍔', '🍟', '🍜', '🍚', '🍰'],
  symbols: ['❤️', '💔', '⭐', '🔥', '🎉', '💯', '✅', '❌', '⚠️', '💡', '📌', '🔔']
}

const filteredEmojis = computed(() => {
  if (currentCategory.value === 'all') {
    return Object.values(emojiData).flat()
  }

  return emojiData[currentCategory.value] || []
})

const insertEmoji = (emoji: string) => {
  emit('insert-emoji', emoji)
}

const closeEmojiPicker = () => {
  emit('close')
}
</script>

<style scoped lang="scss">
$primary-color: #059669;
$text-secondary: #6b7280;
$text-light: #9ca3af;
$border-color: #e5e7eb;
$bg-color: #f9fafb;
$radius: 8px;

.emoji-picker {
  width: 100%;
  background: #ffffff;
  border-radius: $radius;
  border: 1px solid $border-color;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow-x: hidden;

  .emoji-categories {
    display: flex;
    gap: 0.25rem;
    padding: 0.5rem;
    border-bottom: 1px solid $border-color;
    background: $bg-color;

    .category-btn {
      flex: 1;
      height: 32px;
      border: 1px solid transparent;
      border-radius: 6px;
      background: transparent;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #ffffff;
      }

      &.active {
        background: #ffffff;
        border-color: $primary-color;
      }
    }
  }

  .emoji-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 0.25rem;
    padding: 0.75rem;
    max-height: 200px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 3px;
    }

    .emoji-item {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      padding: 0.25rem;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s ease;
      user-select: none;

      &:hover {
        background: $bg-color;
        transform: scale(1.2);
      }
    }
  }

  .emoji-picker-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background: $bg-color;
    border-top: 1px solid $border-color;

    .emoji-count {
      font-size: 0.8rem;
      color: $text-light;
    }

    .close-emoji-btn {
      padding: 0.25rem 0.75rem;
      border: 1px solid $border-color;
      border-radius: 4px;
      background: #ffffff;
      color: $text-secondary;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: $bg-color;
        border-color: $primary-color;
        color: $primary-color;
      }
    }
  }
}
</style>
