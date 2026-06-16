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

        <img v-if="isDaily" class="slogan artistic" src="@/assets/img/slogan.png" alt="slogan" />
        <div v-if="isNote" class="slogan artistic">{{ appSlogan }}</div>

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
            <el-button v-if="!userStore.user" type="primary" @click="showLoginDialog = true">
              登录
            </el-button>
            <el-dropdown v-else>
              <div class="user-avatar">
                <el-avatar :size="32" :src="userStore.user?.avatar" />
                <span class="username">{{ userStore.user?.username }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>个人中心</el-dropdown-item>
                  <el-dropdown-item v-if="userStore.user">我的文章</el-dropdown-item>
                  <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

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

  <!-- 登录对话框 - 移到 header 外部，确保全屏显示 -->
  <el-dialog v-model="showLoginDialog" title="登录" width="420px" :close-on-click-modal="false"
    :close-on-press-escape="true" :destroy-on-close="true" class="login-dialog" @close="handleDialogClose">
    <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="0" class="login-form"
      @submit.prevent="handleLogin">
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" placeholder="请输入用户名 / 邮箱" size="large" :prefix-icon="User" clearable />
      </el-form-item>

      <el-form-item prop="password">
        <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" size="large" :prefix-icon="Lock"
          show-password clearable @keyup.enter="handleLogin" />
      </el-form-item>

      <div class="login-options">
        <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
        <el-link type="primary" underline="never" @click="handleForgotPassword">
          忘记密码？
        </el-link>
      </div>

      <el-form-item>
        <el-button type="primary" size="large" :loading="loginLoading" class="login-button" @click="handleLogin">
          {{ loginLoading ? '登录中...' : '登录' }}
        </el-button>
      </el-form-item>

      <div class="login-footer">
        <span>还没有账号？</span>
        <el-link type="primary" underline="hover" @click="handleRegister">
          立即注册
        </el-link>
      </div>

      <div class="login-divider">
        <span>其他登录方式</span>
      </div>

      <div class="social-login">
        <el-button circle size="large" @click="socialLogin('github')">
          <el-icon>
            <FaIcon :icon="faGithub" />
          </el-icon>
        </el-button>
        <el-button circle size="large" @click="socialLogin('wechat')">
          <el-icon>
            <FaIcon :icon="faWeibo" />
          </el-icon>
        </el-button>
        <el-button circle size="large" @click="socialLogin('qq')">
          <el-icon>
            <FaIcon :icon="faQq" />
          </el-icon>
        </el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  House, Document, Folder, PriceTag, Picture, User, Menu,
  Sunny, Moon, Lock
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { faGithub, faWeibo, faQq } from '@fortawesome/free-brands-svg-icons'
import { userApi } from '@/api'
import { useThemeStore } from '@/stores'
import { useUserStore } from '@/stores/user'
import { useAppNameStruct } from '@/composables/useAppName'
import { isDaily, isNote } from '@/utils/cabinet'

const router = useRouter()
const themeStore = useThemeStore()
const userStore = useUserStore()

const { appNameParts } = useAppNameStruct()
const appSlogan = import.meta.env.VITE_APP_TITLE_SLOGAN || '记记录生活点滴'

// avatar url
const avatar = ref<string>('https://picsum.photos/200/200?random=10')

const mobileMenuVisible = ref(false)
const showLoginDialog = ref(false)
const loginLoading = ref(false)
const loginFormRef = ref<FormInstance>()

const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名/邮箱', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

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

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loginLoading.value = true
    try {
      const response = await userApi.login({
        username: loginForm.username,
        password: loginForm.password
      })

      // 保存 token
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken)

        // 保存用户信息
        if (response.data.userInfo) {
          userStore.user = response.data.userInfo
        }

        // 记住密码功能
        if (loginForm.rememberMe) {
          localStorage.setItem('rememberMe', 'true')
          localStorage.setItem('savedUsername', loginForm.username)
        } else {
          localStorage.removeItem('rememberMe')
          localStorage.removeItem('savedUsername')
        }

        ElMessage.success('登录成功！')
        showLoginDialog.value = false

        // 清空表单
        loginForm.username = ''
        loginForm.password = ''
        loginForm.rememberMe = false
      }
    } catch (error: any) {
      console.error('登录失败:', error)
      ElMessage.error(error.response?.data?.message || '登录失败，请检查用户名和密码')
    } finally {
      loginLoading.value = false
    }
  })
}

const handleDialogClose = () => {
  // 关闭对话框时重置表单
  if (loginFormRef.value) {
    loginFormRef.value.resetFields()
  }
}

const handleForgotPassword = () => {
  ElMessage.info('请联系管理员重置密码')
}

const handleRegister = () => {
  ElMessage.info('注册功能开发中')
  // 可以跳转到注册页面或打开注册对话框
  // router.push('/register')
}

const socialLogin = (type: string) => {
  ElMessage.info(`${type} 登录功能开发中`)
  // 实现第三方登录
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('rememberMe')
  localStorage.removeItem('savedUsername')
  userStore.user = null
  ElMessage.success('已退出登录')
}

// 检查是否有记住的用户名
const loadSavedUsername = () => {
  const rememberMe = localStorage.getItem('rememberMe')
  if (rememberMe === 'true') {
    const savedUsername = localStorage.getItem('savedUsername')
    if (savedUsername) {
      loginForm.username = savedUsername
      loginForm.rememberMe = true
    }
  }
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

onMounted(async () => {
  await fetchSimpleUser()

  // 组件挂载时加载保存的用户名
  loadSavedUsername()
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
    // padding: 0 20px;

    @media (max-width: $breakpoint-mobile) {
      min-height: 50px;
      padding: 0 10px;
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

  img {
    width: auto;
    max-height: 40px;
    padding-left: 20px;
    // vertical-align: middle;

    @media (max-width: $breakpoint-mobile) {
      max-height: 30px;
      padding-left: 10px;
    }
  }

  h1 {
    margin: 0;
    padding-left: 8px;
    font-size: 1.8rem;
    font-weight: 800;
    // vertical-align: middle;
    color: var(--color-primary);
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    background-clip: text;
    -webkit-background-clip: text;
    // -webkit-text-fill-color: transparent;

    @media (max-width: $breakpoint-mobile) {
      font-size: 1.5rem;
    }

    .title-master {
      color: var(--color-primary)
    }

    .title-divider {
      color: var(--color-deputy);
      margin: 0 2px;
      font-weight: 800;
    }

    .title-slave {
      color: var(--color-secondary);
    }
  }
}

.slogan {
  // padding-top: 10px;
  font-size: 18px;
  font-weight: bolder;
  color: rgba($base-color-j9, 0.7);

  @media (max-width: $breakpoint-mobile) {
    font-size: 14px;
  }

  &.artistic {
    transform: rotate(1deg);
    display: inline-block;
    margin-left: 8px;
    font-family: '华文行楷', 'Georgia', 'Times New Roman', serif;
    text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.04), 2px 2px 6px rgba(0, 0, 0, 0.06);
    // color: var(--color-primary);
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