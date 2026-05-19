import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, SimpleUser, UserInfo, UserParam } from '@/types/user'
// import { loginApi, getUserInfoApi } from '@/api/auth'
import { userApi } from '@/api'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('')
  const user = ref<User | null>(null)
  const userInfo = ref<UserInfo | null>(null)
  const simpleUser = ref<SimpleUser>()

  const isLogin = computed(() => !!token.value)

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
  }

  const login = async (username: string, password: string) => {
    try {
      const data = await userApi.login({ username, password })
      setToken(data.data.accessToken)
      await getUserInfo({ id: 10 })
      return true
    } catch (error) {
      return false
    }
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  const getUserInfo = async (param: UserParam) => {
    try {
      const data = await userApi.getUserProfile(param)
      if (data && data.data) {
        let _data = data.data
        user.value = _data
        setUserInfo({
          id: _data.id,
          username: _data.username,
          nickname: _data.nickname,
          email: _data.email || '',
          avatar: _data.avatar || '',
        })
      }
    } catch (error) {
      logout()
    }
  }

  const getSimpleUser = async (param: UserParam) => {
    try {
      const res = await userApi.getSimpleUser(param)
      if (res && res.data) {
        console.log(res.data)
        simpleUser.value = res.data
      }
    } catch (error) {
      console.log(error)
    }
  }

  // 初始化时检查本地token
  const init = () => {
    const localToken = localStorage.getItem('token')
    if (localToken) {
      token.value = localToken
      getUserInfo({ id: 10 })
    }
  }

  // // 权限检查
  // const hasRole = (role: string) => {
  //   return userInfo.value?.roles?.includes(role) || false
  // }

  // const hasPermission = (permission: string) => {
  //   return userInfo.value?.permissions?.includes(permission) || false
  // }

  // const canEditPost = (postAuthorId: number) => {
  //   return userInfo.value?.id === postAuthorId || hasRole('admin')
  // }

  return {
    token,
    user,
    userInfo,
    isLogin,
    simpleUser,

    setToken,
    setUserInfo,
    login,
    logout,
    getUserInfo,
    init,
    getSimpleUser,
  }
})