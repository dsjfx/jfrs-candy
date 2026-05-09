<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="logo" @click="router.push('/')">
          <img src="@/assets/img/tg.png" />
          <h1>{{ appTitle }}</h1>
        </div>

        <div class="slogan">{{ appSlogan }}</div>

        <nav class="nav">
          <ul class="nav-list">
            <li v-for="item in navItems" class="nav-item">
              <router-link :to="item.path" class="nav-link">
                <el-icon>
                  <component :is="item.icon" />
                </el-icon>
                <span>{{ item.name }}</span>
              </router-link>
            </li>
          </ul>
        </nav>

        <div class="header-actions">
          <el-button :icon="isDark ? 'Sunny' : 'Moon'" circle @click="toggleTheme"
            :title="isDark ? '切换到亮色模式' : '切换到暗色模式'" />
          <el-button v-if="!blogStore.user" type="primary" @click="showLoginDialog = true">
            登录
          </el-button>
          <el-dropdown v-else>
            <div class="user-avatar">
              <el-avatar :size="32" :src="blogStore.user?.avatar" />
              <span class="username">{{ blogStore.user?.username }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item v-if="blogStore.user">我的文章</el-dropdown-item>
                <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-button class="mobile-menu-btn" :icon="Menu" circle @click="mobileMenuVisible = !mobileMenuVisible" />
        </div>
      </div>

      <!-- 移动端菜单 -->
      <transition name="slide-down">
        <div v-if="mobileMenuVisible" class="mobile-menu">
          <div class="mobile-nav">
            <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="mobile-nav-item"
              @click="mobileMenuVisible = false">
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.name }}</span>
            </router-link>
          </div>
        </div>
      </transition>
    </div>

    <!-- 登录对话框 -->
    <el-dialog v-model="showLoginDialog" title="登录" width="400px">
      <el-form :model="loginForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showLoginDialog = false">取消</el-button>
        <el-button type="primary" @click="handleLogin">登录</el-button>
      </template>
    </el-dialog>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { FormInstance } from 'element-plus'
import { House, Document, Picture, User, Menu, Sunny, Moon } from '@element-plus/icons-vue'
import { useBlogStore, useThemeStore } from '@/stores'
import { userApi } from '@/api'
import type { NavItem } from '@/types'

const router = useRouter()
const route = useRoute()
const blogStore = useBlogStore()
const themeStore = useThemeStore()

const appTitle = import.meta.env.VITE_APP_TITLE || '个人博客'
const appSlogan = import.meta.env.VITE_APP_SLOGAN

const mobileMenuVisible = ref(false)
const showLoginDialog = ref(false)
const loginForm = ref({
  username: '',
  password: ''
})

const isDark = computed(() => themeStore.isDark)

const navItems: Array<NavItem> = [
  { path: '/', name: '首页', icon: House },
  {
    path: '/articles',
    name: '文章',
    exact: false,
    matchPaths: ['/articles'],
    icon: Document
  },
  // { path: '/categories', name: '分类', icon: Folder },
  // { path: '/tags', name: '标签', icon: PriceTag },
  { path: '/photos', name: '图片', icon: Picture },
  { path: '/about', name: '关于', icon: User }
]

const toggleTheme = () => {
  themeStore.toggleTheme()
}

const handleLogin = async () => {
  try {
    await userApi.login(loginForm.value)
    showLoginDialog.value = false
    // 可以在这里触发用户信息获取
  } catch (error) {
    console.error('登录失败:', error)
  }
}

// 计算激活状态
const isActive = (item: NavItem) => {
  if (item.exact) {
    // 精确匹配：首页
    return route.path === item.path
  } else {
    // 模糊匹配：文章（匹配/articles和/articles/*）
    return route.path.startsWith(item.path)
  }
}

const logout = () => {
  localStorage.removeItem('token')
  blogStore.user = null
}
</script>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(10px);

  .container {
    max-width: 1200px;
    min-height: 70px;
    margin: 0 auto;
    padding: 0 20px;
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
}

.logo {
  display: flex;
  cursor: pointer;

  img {
    padding-left: 40px;
    max-height: 60px;
    width: auto;
    vertical-align: middle;
  }

  h1 {
    margin: 0;
    padding-left: 0px;
    font-size: 2.5rem;
    font-weight: 800;
    vertical-align: middle;
    color: var(--color-primary);
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.slogan {
  padding-top: 10px;
  font-size: 20px;
  font-weight: bolder;
  color: rgba($base-color-j9, 0.7);
}

.nav {
  .nav-list {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 32px;
  }

  .nav-item {
    .nav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--color-text);
      text-decoration: none;
      font-weight: 500;
      padding: 8px 0;
      position: relative;
      transition: color 0.3s;

      &:hover {
        color: var(--color-primary);
      }

      &.router-link-active {
        color: var(--color-primary);

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--color-primary);
          border-radius: 1px;
        }
      }

      .el-icon {
        font-size: 1rem;
      }
    }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;

  .user-avatar {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 4px;
    border-radius: var(--radius-md);
    transition: background-color 0.3s;

    &:hover {
      background-color: var(--color-bg-secondary);
    }

    .username {
      font-weight: 500;
    }
  }

  .mobile-menu-btn {
    display: none;
  }
}

.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--color-bg);
  border-top: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);

  .mobile-nav {
    padding: 16px 20px;

    .mobile-nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: var(--color-text);
      text-decoration: none;
      border-radius: var(--radius-md);
      transition: background-color 0.3s;

      &:hover {
        background-color: var(--color-bg-secondary);
      }

      &.router-link-active {
        color: var(--color-primary);
        background-color: rgba(var(--color-primary-rgb), 0.1);
      }

      .el-icon {
        width: 20px;
        font-size: 1.2rem;
      }
    }
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .nav {
    display: none;
  }

  .header-actions {
    .mobile-menu-btn {
      display: inline-flex;
    }

    .el-button:not(.mobile-menu-btn) {
      display: none;
    }
  }
}
</style>