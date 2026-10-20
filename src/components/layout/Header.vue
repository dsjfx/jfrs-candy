<template>
  <header class="header">
    <div class="header-container">
      <div class="header-content">
        <div class="logo" @click="router.push('/')">
          <el-avatar :src="avatar" size="default" />
          <h1 class="site-title">
            <span v-if="appNameParts.hasMaster" class="title-master">
              {{ appNameParts.master }}
            </span>
            <span v-if="appNameParts.hasMaster && appNameParts.hasSlave" class="title-divider">
              ·
            </span>
            <span v-if="appNameParts.hasSlave" class="title-slave">
              {{ appNameParts.slave }}
            </span>
          </h1>
        </div>

        <img v-if="isDaily && !isPhone" class="slogan artistic" src="@/assets/img/slogan.png" alt="slogan" />
        <div v-if="isNote && !isPhone" class="slogan artistic2">{{ appSlogan }}</div>

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
          <div v-if="isDaily">
            <el-button v-if="!userStore.userInfo" type="primary" @click="showLoginDialog = true">
              登录
            </el-button>
            <el-dropdown v-else>
              <div class="user-avatar">
                <el-avatar :size="32" :src="userStore.userInfo?.avatar" />
                <span class="username">{{ userStore.userInfo?.username }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>个人中心</el-dropdown-item>
                  <el-dropdown-item v-if="userStore.userInfo">我的文章</el-dropdown-item>
                  <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <div>
            <el-button class="mobile-menu-btn" :icon="Menu" circle @click="mobileMenuVisible = !mobileMenuVisible" />
          </div>
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
  </header>

  <LoginDialog v-model="showLoginDialog" @login-success="handleLoginSuccess" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  House, Document, Folder, User, Menu,
  Sunny, Moon
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useThemeStore } from '@/stores'
import { useUserStore } from '@/stores/user'
import { useAppNameStruct } from '@/composables/useAppName'
import { isDaily, isMobile, isNote } from '@/utils/cabinet'
import LoginDialog from '@/components/auth/LoginDialog.vue'
import type { UserInfo } from '@/types/user'

const router = useRouter()
const themeStore = useThemeStore()
const userStore = useUserStore()

const { appNameParts } = useAppNameStruct()
const appSlogan = import.meta.env.VITE_APP_TITLE_SLOGAN || '记记录生活点滴'

// avatar url
const avatar = ref<string>('https://picsum.photos/200/200?random=10')

const isPhone = ref(false)
const mobileMenuVisible = ref(false)
const showLoginDialog = ref(false)

const isDark = computed(() => themeStore.isDark)

const navItems = [
  { path: '/', name: '首页', icon: House },
  {
    path: '/articles',
    name: '文章',
    exact: false,
    matchPaths: ['/articles'],
    icon: Document
  },
  // { path: '/photos', name: '图片', icon: Picture },
  { path: '/archive', name: '归档', icon: Folder },
  { path: '/about', name: '关于', icon: User }
]

const toggleTheme = () => {
  themeStore.toggleTheme()
}

const handleLoginSuccess = (userInfo: UserInfo) => {
  showLoginDialog.value = false
}

const logout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    type: 'warning'
  }).then(() => {
    const subect: string = import.meta.env.VITE_APP_SUBJECT
    localStorage.removeItem(subect.concat('_token'))
    localStorage.removeItem('user_info')
    localStorage.removeItem('rememberMe')
    localStorage.removeItem('savedUsername')
    userStore.userInfo = null
    ElMessage.success('已退出登录')
  }).catch((action) => {
    if (action === 'cancel' || action === 'close') return  // 用户取消，静默
    // 真正的错误再处理/上报
    console.error(action)
  });
}

const fetchSimpleUser = async () => {
  try {
    await userStore.getSimpleUser({})
    if (userStore.simpleUser?.avatar) {
      // avatar.value = userStore.simpleUser?.avatar
    }
  } catch (error) {
    console.log(error)
  }
}

const checkIfMobile = () => {
  isPhone.value = isMobile()
}

onMounted(async () => {
  await fetchSimpleUser()

  checkIfMobile()

  window.addEventListener('resize', checkIfMobile)
})

</script>

<style scoped lang="scss">
$breakpoint-mobile: 768px;

.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(10px);

  .header-container {
    // max-width: 1300px;
    // min-height: 70px;
    margin: 0 20px;

    @media (max-width: $breakpoint-mobile) {
      width: 100%;
      min-height: 50px;
      margin: 0;
      padding: 0 20px;
    }
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);

  @media (max-width: $breakpoint-mobile) {
    height: var(--header-height-mobile);
  }
}

.logo {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  padding-left: 8px;

  @media (max-width: $breakpoint-mobile) {
    padding-left: 0;
    gap: 8px;
  }

  img {
    width: auto;
    max-height: 40px;
    padding-left: 20px;

    @media (max-width: $breakpoint-mobile) {
      max-height: 30px;
    }
  }

  h1 {
    margin: 0;
    padding-left: 8px;
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--color-primary);
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    background-clip: text;
    -webkit-background-clip: text;
    // -webkit-text-fill-color: transparent;

    @media (max-width: $breakpoint-mobile) {
      font-size: 1.3rem;
    }

    .title-master {
      color: var(--color-primary)
    }

    .title-divider {
      color: var(--color-deputy);
      margin: 0 1px;
      font-weight: 800;
    }

    .title-slave {
      color: var(--color-secondary);
    }
  }
}

.slogan {
  font-size: 18px;
  font-weight: bolder;
  color: rgba($base-color-j9, 0.7);

  &.artistic {
    transform: rotate(1deg);
    display: inline-block;
    margin-left: 8px;
    font-family: '华文中宋', 'Georgia', 'Times New Roman', serif;
    text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.04), 2px 2px 6px rgba(0, 0, 0, 0.06);
    // color: var(--color-primary);
  }

  &.artistic2 {
    transform: rotate(-2deg);
    display: inline-block;
    margin-left: 8px;
    font-size: 20px;
    font-family: '华文中宋', 'Georgia', 'Times New Roman', serif;
    text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.04), 2px 2px 6px rgba(0, 0, 0, 0.06);
  }
}

.nav {
  @media (max-width: $breakpoint-mobile) {
    display: none;
  }

  .nav-list {
    display: flex;
    margin: 0;
    padding: 0;
    gap: 32px;
    list-style: none;
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

  .el-button {
    @media (max-width: $breakpoint-mobile) {
      &:not(.mobile-menu-btn) {
        display: none;
      }
    }
  }

  .mobile-menu-btn {
    display: none;

    @media (max-width: $breakpoint-mobile) {
      display: inline-flex;
    }
  }
}

// 去除轮廓
:deep(.el-tooltip__trigger:focus),
:deep(.el-dropdown__caret:focus) {
  outline: none;
  box-shadow: none;
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

// 登录对话框样式
.login-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;
    overflow: hidden;

    .el-dialog__header {
      padding: 24px 24px 0;
      margin: 0;

      .el-dialog__title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--color-text);
      }
    }

    .el-dialog__body {
      padding: 24px;
    }
  }
}

.login-form {
  .el-form-item {
    margin-bottom: 20px;
  }

  .login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .login-button {
    width: 100%;
    font-size: 1rem;
    font-weight: 500;
  }

  .login-footer {
    text-align: center;
    margin-top: 20px;
    color: var(--color-text-secondary);

    .el-link {
      margin-left: 8px;
    }
  }

  .login-divider {
    position: relative;
    text-align: center;
    margin: 24px 0 20px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 100%;
      height: 1px;
      background-color: var(--color-border);
    }

    span {
      position: relative;
      padding: 0 16px;
      background-color: var(--color-bg);
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }
  }

  .social-login {
    display: flex;
    justify-content: center;
    gap: 16px;

    .el-button {
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
      }
    }
  }
}
</style>