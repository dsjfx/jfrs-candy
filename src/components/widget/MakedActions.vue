<template>
  <div class="comment-actions">
    <!-- 内联按钮 -->
    <button v-for="action in visibleActions" :key="action.key" class="action-btn" :class="action.btnClass"
      :title="action.label" @click="action.handler">
      <font-awesome-icon :icon="action.icon" />
    </button>

    <!-- 更多：只有溢出时才显示 -->
    <div class="more-actions" v-if="overflowActions.length">
      <button class="action-btn more-btn" @click="toggleMoreActions">⋮</button>
      <div v-if="moreActionsVisible" class="more-actions-menu">
        <button v-for="action in overflowActions" :key="action.key" class="menu-item" @click="action.handler">
          {{ action.label }}
        </button>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const moreActionsVisible = ref(false)
const userCanEdit = ref(false)
const userCanDelete = ref(false)
const toggleMoreActions = () => (moreActionsVisible.value = !moreActionsVisible.value)

const MAX_INLINE = 2   // 最多内联显示 2 个

// 所有有权限的操作，按优先级排列（排在前面的优先内联）
const availableActions = computed(() =>
  [
    {
      key: 'edit',
      label: '编辑',
      icon: ['fas', 'pen-to-square'],
      btnClass: 'edit-btn',
      handler: handleEdit,
      visible: userCanEdit.value,
    },
    {
      key: 'delete',
      label: '删除',
      icon: ['fas', 'trash'],
      btnClass: 'delete-btn',
      handler: handleDelete,
      visible: userCanDelete.value,
    },
    {
      key: 'report',
      label: '举报',
      icon: ['fas', 'flag'],
      handler: handleReport,
      visible: true,   // 按实际权限条件
    },
    {
      key: 'block',
      label: '屏蔽用户',
      icon: ['fas', 'ban'],
      handler: handleBlock,
      visible: true,
    },
  ].filter(a => a.visible)
)

const handleEdit = () => {

}

const handleDelete = () => {

}

const handleReport = () => {

}

const handleBlock = () => {

}
// 内联显示：优先填满 MAX_INLINE
const visibleActions = computed(() =>
  availableActions.value.slice(0, MAX_INLINE)
)

// 溢出：剩下的才进"更多"
const overflowActions = computed(() =>
  availableActions.value.slice(MAX_INLINE)
)
</script>

<style lang="scss" scoped></style>