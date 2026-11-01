<template>
  <div class="article-reactions" role="group" aria-label="article reactions">
    <!-- 点赞按钮 like button -->
    <button class="reaction-btn like-btn" :class="{ active: currentReaction === 'like' }" :disabled="isSubmitting"
      @click="handleReact('like')" aria-label="喜欢">
      <FontAwesomeIcon :icon="['fas', 'thumbs-up']" />
      <span class="reaction-count" :class="{ bump: likeBump }">{{ (likeCount ?? 0) }}</span>
    </button>

    <!-- 踩按钮 dislike button -->
    <button class="reaction-btn dislike-btn" :class="{ active: currentReaction === 'dislike' }" :disabled="isSubmitting"
      @click="handleReact('dislike')" aria-label="不喜欢">
      <FontAwesomeIcon :icon="['fas', 'thumbs-down']" />
      <span class="reaction-count" :class="{ bump: dislikeBump }">{{ (dislikeCount ?? 0) }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { articleApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { getAnonymousId } from '@/utils/anonymousId'
import { ElMessage } from 'element-plus';
import { BLOG_LIKED_KEY } from '@/utils/constant';
import type { actionType } from '@/types/article';


interface Props {
  articleId: string | number
  likes: number
  dislikes: number
  type: actionType
}

const props = defineProps<Props>()

// 使用 Store
const userStore = useUserStore()

const likeCount = ref(props.likes)
const dislikeCount = ref(props.dislikes)
const currentReaction = ref(props.type)
const isSubmitting = ref(false)

const likeBump = ref(false)
const dislikeBump = ref(false)

const typeMap: Record<actionType, 1 | -1 | 0> = {
  'like': 1,
  "dislike": -1,
  "none": 0
}

// 如果父组件异步加载了数据，同步更新内部状态
watch(() => props.type, (val) => {
  currentReaction.value = val
  likeCount.value = props.likes
  dislikeCount.value = props.dislikes
})

const handleReact = async (type: actionType) => {
  if (isSubmitting.value) return
  isSubmitting.value = true

  // 1. 乐观更新（备份旧数据用于回滚）
  const oldReaction = currentReaction.value
  const oldLikes = likeCount.value
  const oldDislikes = dislikeCount.value

  // 计算目标状态（如果点的是当前状态，则取消）
  const targetReaction = oldReaction === type ? 'none' : type

  // 更新本地计数和状态
  currentReaction.value = targetReaction

  // 计数加减逻辑
  if (targetReaction === 'like') {
    likeCount.value++
    if (oldReaction === 'dislike') dislikeCount.value--
  } else if (targetReaction === 'dislike') {
    dislikeCount.value++
    if (oldReaction === 'like') likeCount.value--
  } else if (targetReaction === 'none') {
    if (oldReaction === 'like') likeCount.value--
    if (oldReaction === 'dislike') dislikeCount.value--
  }

  // 2. 发送请求
  try {
    const userData = userStore.acquireUserOrAnonyId(BLOG_LIKED_KEY)
    const payload = {
      type: typeMap[targetReaction],
      ...userData
    }

    const res = await articleApi.reactionArticle(`${props.articleId}`, payload)

    // 3. 以后端返回的最新数据为准（防止多端并发导致偏差）
    likeCount.value = res.likeCount
    dislikeCount.value = res.dislikeCount
    currentReaction.value = res.reactionType

    if (targetReaction === 'like') handleLike()
    else if (targetReaction === 'dislike') handleDislike()

  } catch (error) {
    // 4. 失败回滚
    console.error('操作失败', error)
    currentReaction.value = oldReaction
    likeCount.value = oldLikes
    dislikeCount.value = oldDislikes
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

function handleLike() {

  // trigger bump animation
  likeBump.value = true
  setTimeout(() => (likeBump.value = false), 350)

  ElMessage.success('感谢点赞！')
}

function handleDislike() {

  // trigger bump animation
  dislikeBump.value = true
  setTimeout(() => (dislikeBump.value = false), 350)

  ElMessage.info('感谢反馈！')
}

</script>

<style lang="scss" scoped>
$breakpoint-mobile: 768px;

/* centered reactions */
.article-reactions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
  margin-bottom: 2rem;

  .reaction-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.6rem;
    background: transparent;
    border: none;
    cursor: pointer;
    border-radius: 8px;
    font-size: 1.6rem;
    /* slightly larger */
    color: var(--text-secondary);
    transition: transform 120ms ease, color 120ms ease, background 120ms ease;

    &.like-btn {
      &.active {
        color: var(--color-secondary)
      }

      &:hover {
        transform: translateY(-4px);
        color: var(--accent-color);
        background: rgba(var(--accent-color-rgb, 231, 76, 60), 0.06);
      }
    }

    &.dislike-btn {
      &.active {
        color: var(--color-deputy)
      }

      &:hover {
        transform: translateY(-4px);
        color: var(--deputy-color);
        background: rgba(var(--accent-color-rgb, 231, 76, 60), 0.06);
      }
    }
  }

  .like-btn,
  .dislike-btn {
    min-width: 64px;

    .reaction-count {
      margin-left: 0.5rem;
      font-size: 1rem;
      color: var(--text-secondary);
      display: inline-block;
      transform-origin: center;
      transition: transform 220ms cubic-bezier(.2, .8, .2, 1), color 160ms;
    }

    /* bump animation */
    @keyframes bump {
      0% {
        transform: scale(1);
      }

      30% {
        transform: scale(1.25);
      }

      60% {
        transform: scale(0.95);
      }

      100% {
        transform: scale(1);
      }
    }

    .reaction-count.bump {
      animation: bump 340ms cubic-bezier(.2, .8, .2, 1) forwards;
      color: var(--accent-color);
    }
  }
}
</style>