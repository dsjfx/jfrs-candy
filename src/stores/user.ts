import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { userApi } from '@/api'
import type {
  User, SimpleUser, UserInfo, UserParam,
  CaptchaResponse, CaptchaParam, LoginParams
} from '@/types/user'
import type { ResponseData } from '@/types/api'

export const useUserStore = defineStore('user', () => {
  const subect: string = import.meta.env.VITE_APP_SUBJECT
  const token = ref<string>(localStorage.getItem(getTokenKey()) || '')
  const user = ref<User | null>(null)
  const userInfo = ref<UserInfo | null>(JSON.parse(localStorage.getItem('user_info') || 'null'))
  const simpleUser = ref<SimpleUser>()

  const isLogin = computed(() => !!token.value)

  function getTokenKey() {
    if (!subect) {
      throw new Error('VITE_APP_SUBJECT is not defined in the environment variables.')
    }
    return subect.concat('_token')
  }

  const setToken = (newToken: string, local: boolean = true) => {
    token.value = newToken
    const tokenName = getTokenKey()
    if (local) {
      localStorage.setItem(tokenName, newToken)
    }
  }

  const setUserInfo = (info: UserInfo, local: boolean = true) => {
    userInfo.value = addRoles(info)
    if (local) {
      localStorage.setItem('user_info', JSON.stringify(info))
    }
  }

  const login = async (params: LoginParams) => {
    try {
      // 验证码校验
      const captchaParam = {
        captchaId: params.captchaId,
        captchInput: params.captcha
      }

      const result = await userApi.validateCaptcha(captchaParam);
      if (!result || !(result?.data?.isValid)) {
        throw new Error("无效的验证码");
      }

      const response = await userApi.login(params)
      if (!response || !response.data?.accessToken || !response.data?.userInfo) {
        throw new Error("登陆失败，请重新登陆。");
      }

      // Why not synchronized?
      setToken(response.data.accessToken)
      setUserInfo(response.data.userInfo)

      await getUserInfo({ id: 10 })

      return response
    } catch (error) {
      throw error
    }
  }

  // 刷新验证码
  const refreshCaptcha = async (oid: string): Promise<ResponseData<CaptchaResponse>> => {
    try {
      const param: CaptchaParam = {}
      if (oid) {
        param['captchaId'] = oid
      }

      const response = await userApi.refreshCaptcha(param)
      if (response && response.data) {
        localStorage.setItem('captcha', JSON.stringify({
          id: response.data.id,
          expiresIn: response.data.expiresIn,
        }))
      }

      return response;
    } catch (error) {
      console.log('刷新验证码失败')
      throw error
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
        // setUserInfo({
        //   id: _data.id,
        //   username: _data.username,
        //   nickname: _data.nickname,
        //   email: _data.email || '',
        //   avatar: _data.avatar || '',
        // })
      }
    } catch (error) {
      logout()
    }
  }

  const getSimpleUser = async (param: UserParam) => {
    try {
      const res = await userApi.getSimpleUser(param)
      if (res && res.data) {
        simpleUser.value = res.data
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getUserByEmail = async (email: string): Promise<UserInfo | null> => {
    let vUser: UserInfo | null = null

    try {
      const result = await userApi.getUserByEmail(email)
      vUser = result?.data ?? null

      // 将权限转为数组
      return addRoles(vUser)
    } catch (error) {
      console.log(error)
      throw new Error('获取用户失败')
    }
  }

  function addRoles(vUser: UserInfo) {
    if (vUser) {
      const roles: string[] = []
      roles.push(
        ...(vUser?.role ?? '')
          .split(',')
          .map(r => r.trim())
          .filter(Boolean)
      )
      vUser.roles = roles
    }
    return vUser
  }

  // 初始化时检查本地token
  const init = () => {
    const localToken = localStorage.getItem('token')
    if (localToken) {
      token.value = localToken
      getUserInfo({ id: 10 })
    }
  }

  // 权限检查
  const hasRole = (user: UserInfo | null, role: string): boolean => {
    return user?.roles?.includes('admin') ?? false
  }

  // const hasPermission = (permission: string) => {
  //   return userInfo.value?.permissions?.includes(permission) || false
  // }

  const canEditPost = (postAuthorId: number) => {
    return userInfo.value?.id === postAuthorId /**|| hasRole('admin')*/
  }

  return {
    token,
    user,
    userInfo,
    isLogin,
    simpleUser,

    getTokenKey,
    setToken,
    setUserInfo,
    getUserInfo,
    getSimpleUser,
    getUserByEmail,
    login,
    logout,
    init,
    refreshCaptcha,
    hasRole
  }
})
