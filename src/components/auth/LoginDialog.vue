<template>
  <el-dialog :model-value="modelValue" title="登录" width="420px" :close-on-click-modal="false"
    :close-on-press-escape="true" :destroy-on-close="true" class="login-dialog"
    @update:model-value="handleVisibilityUpdate" @close="handleDialogClose">

    <!-- 登陆表单 Login Form -->
    <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="0" class="login-form"
      @submit.prevent="handleLogin">
      <!-- 用户名 username -->
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" placeholder="请输入用户名 / 邮箱" size="large" :prefix-icon="User" clearable />
      </el-form-item>

      <!-- 密码 password -->
      <el-form-item prop="password">
        <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" size="large" :prefix-icon="Lock"
          show-password clearable @keyup.enter="handleLogin" />
      </el-form-item>

      <!-- 验证码 -->
      <el-form-item v-if="showCaptcha" prop="captcha">
        <div class="captcha-wrapper">
          <el-input v-model="loginForm.captcha" placeholder="验证码" size="large" :prefix-icon="Picture" />
          <div class="captcha-image" @click="refreshCaptcha">
            <img :src="captchaImage" alt="验证码" v-if="captchaImage" />
            <el-icon v-else>
              <Loading />
            </el-icon>
          </div>
        </div>
      </el-form-item>

      <div class="login-options">
        <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
        <el-link v-if="showForgetPassword" type="primary" underline="never" @click="handleForgotPassword">
          忘记密码？
        </el-link>
      </div>

      <el-form-item>
        <el-button type="primary" size="large" :loading="loginLoading" class="login-button" @click="handleLogin">
          {{ loginLoading ? '登录中...' : '登录' }}
        </el-button>
      </el-form-item>

      <div v-if="showRegister" class="login-footer">
        <span>还没有账号？</span>
        <el-link type="primary" underline="hover" @click="handleRegister">
          立即注册
        </el-link>
      </div>

      <div v-if="showSocialLogin" class="login-others">
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
      </div>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Lock, User, Picture } from '@element-plus/icons-vue'
import { faGithub, faQq, faWeibo } from '@fortawesome/free-brands-svg-icons'
import { useUserStore } from '@/stores/user'
import type { CaptchaResponse, UserInfo } from '@/types/user'

interface LoginProps {
  modelValue: boolean
  showSocialLogin?: boolean
  showRegister?: boolean
  showForgetPassword?: boolean
  showCaptcha?: boolean
}

const props = withDefaults(defineProps<LoginProps>(), {
  showSocialLogin: false,
  showRegister: false,
  showForgetPassword: false,
  showCaptcha: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'login-success': [userInfo: UserInfo]
}>()

const userStore = useUserStore()
const loginFormRef = ref<FormInstance>()
const loginLoading = ref(false)

const captchaImage = ref('')

const loginForm = reactive({
  username: '',
  password: '',
  captcha: '',
  rememberMe: false
})

const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名/邮箱', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  captcha: props.showCaptcha
    ? [
      { required: true, message: '请输入验证码', trigger: 'blur' },
      { min: 4, max: 4, message: '验证码为4位字符', trigger: 'blur' }
    ]
    : []
}

// 刷新验证码
const refreshCaptcha = async () => {
  // 获取旧的id
  let captchaId = getCaptchaId();

  // 调用获取验证码的API
  const result = await userStore.refreshCaptcha(captchaId)

  if (result && result.data.svg) {
    captchaImage.value = `data:image/svg+xml;base64,${btoa(result.data.svg)}`
  } else {
    ElMessage.error('验证码刷新失败。')
  }
}

// 获取旧的id
const getCaptchaId = () => {
  let captchaId = '';
  const oldCaptchaStr = localStorage.getItem('captcha')
  if (oldCaptchaStr) {
    const oldCaptcha: CaptchaResponse = JSON.parse(oldCaptchaStr)
    if (oldCaptcha && oldCaptcha.id) {
      captchaId = oldCaptcha.id
    }
  }
  return captchaId
}

const handleVisibilityUpdate = (value: boolean) => {
  emit('update:modelValue', value)
}

const closeDialog = () => {
  emit('update:modelValue', false)
}

// 登陆 Login
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async valid => {
    if (!valid) return

    loginLoading.value = true

    try {
      const response = await userStore.login({
        username: loginForm.username,
        password: loginForm.password,
        captcha: loginForm.captcha,
        captchaId: getCaptchaId(),
        appType: import.meta.env.VITE_APP_SUBJECT,
      })

      // 清空验证码输入框
      loginForm.captcha = ''
      // 刷新验证码
      refreshCaptcha()

      if (response.data.accessToken) {
        userStore.setToken(response.data.accessToken)

        userStore.setUserInfo(response.data.userInfo)

        if (loginForm.rememberMe) {
          localStorage.setItem('rememberMe', 'true')
          localStorage.setItem('savedUsername', loginForm.username)
        } else {
          localStorage.removeItem('rememberMe')
          localStorage.removeItem('savedUsername')
        }

        ElMessage.success('登录成功！')
        emit('login-success', response.data.userInfo || userStore.userInfo)

        closeDialog()

        resetLogin()
      }
    } catch (error: any) {
      console.error('登录失败:', error)

      // 刷新验证码
      refreshCaptcha()
      loginForm.captcha = ''

      ElMessage.error(error.message || '登录失败，请检查用户名和密码')
    } finally {
      loginLoading.value = false
    }
  })
}

const resetLogin = () => {
  loginForm.username = ''
  loginForm.password = ''
  loginForm.rememberMe = false
}

const handleDialogClose = () => {
  if (loginFormRef.value) {
    loginFormRef.value.resetFields()
  }
}

const handleForgotPassword = () => {
  ElMessage.info('请联系管理员重置密码')
}

const handleRegister = () => {
  ElMessage.info('注册功能开发中')
}

const socialLogin = (type: string) => {
  ElMessage.info(`${type} 登录功能开发中`)
}

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

onMounted(() => {
  loadSavedUsername()

  // 初始化验证码（如果开启）
  if (props.showCaptcha) {
    refreshCaptcha()
  }
})
</script>

<style scoped lang="scss">
.login-dialog {
  .login-form {
    width: 100%;
  }

  .captcha-wrapper {
    display: flex;
    gap: 10px;
    width: 100%;

    .captcha-image {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 40px;
      background: #f5f5f5;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  .login-options {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }

  .login-button {
    width: 100%;
  }

  .login-footer {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 16px;
    color: var(--color-text-regular);
  }

  .login-divider {
    position: relative;
    margin: 20px 0 16px;
    text-align: center;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      border-top: 1px solid var(--color-border);
    }

    span {
      position: relative;
      display: inline-block;
      padding: 0 12px;
      background: var(--color-bg);
      color: var(--color-text-secondary);
      font-size: 12px;
    }
  }

  .social-login {
    display: flex;
    justify-content: center;
    gap: 16px;
  }
}
</style>
