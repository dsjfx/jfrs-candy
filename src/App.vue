<template>
  <div id="app2">
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router';
import { useAppName } from './composables/useAppName';
// import { useUserStore } from '@/stores/user'

const router = useRouter();
// const userStore = useUserStore()

onMounted(() => {
  const { appName } = useAppName();

  // 初始化用户信息
  // if (userStore.token) {
  //   // 可以在这里添加 token 刷新逻辑
  // }

  // 全局后置钩子
  router.afterEach((to, _from) => {
    // 标题
    document.title = appName.value || '糖果生活'
  })
})
</script>

<style scoped>
#app2 {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
  min-height: 100vh;
}

/* 全局过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>