import { http } from "./request"
import type { ResponseData } from "@/types/api"
import type { CaptchaParam, CaptchaResponse, CaptchaValid, LoginParams, LoginResponse, SimpleUser, User, UserInfo, UserParam } from "@/types/user"
import { accessUrl } from "@/utils/cabinet"
import ResponseFactory from "@/utils/responseFactory"


function makeUrl(url: string) {
  return accessUrl('AU', url)
}

// export function loginApi(username: string, password: string) {
//   const token = ''

//   return {
//     token
//   }
// }

// export function getUserInfoApi() {
//   const info = {
//     id: 1,
//     username: '',
//     nickname: '',
//     email: '',
//     avatar: '',
//     roles: [],
//     permissions: []
//   } as UserInfo

//   return info
// }

export async function getUser(param: UserParam = { id: 10 }): Promise<ResponseData<User>> {
  let result = ResponseFactory.success<User>({} as User)

  const response = await http.get(makeUrl(`/profile/simple`), param)
  if (response.data) {
    result = response.data as ResponseData<User>
  }

  return result
}

/**
 * 
 * @param param 
 * @returns 
 */
export async function login(param: LoginParams): Promise<ResponseData<LoginResponse>> {
  let result = ResponseFactory.success<LoginResponse>({} as LoginResponse)

  const response = await http.post(makeUrl(`/login`), param)
  if (response.data) {
    result = response.data as ResponseData<LoginResponse>
  }

  return result;
}

/**
 * 
 * @param captchaParam 
 * @returns 
 */
export async function validateCaptcha(captchaParam: CaptchaParam): Promise<ResponseData<CaptchaValid>> {
  let result = ResponseFactory.success<CaptchaValid>({} as CaptchaValid)

  const response = await http.post('/captcha/validate', captchaParam)
  if (response.data) {
    result = response.data as ResponseData<CaptchaValid>
  }

  return result
}

/**
 * 
 * @param param 
 * @returns 
 */
export async function refreshCaptcha(param: CaptchaParam): Promise<ResponseData<CaptchaResponse>> {
  let result = ResponseFactory.success<CaptchaResponse>({} as CaptchaResponse)

  const response = await http.post('/captcha/refresh', param)
  if (response.data) {
    result = response.data as ResponseData<CaptchaResponse>
  }

  return result
}

export async function getSimpleUserinfo(param: UserParam):
  Promise<ResponseData<SimpleUser>> {
  let data = ResponseFactory.success<SimpleUser>({} as SimpleUser)

  const response = await http.get(makeUrl(`/sys-avatar`), param)
  if (response.data) {
    data = response.data as ResponseData<SimpleUser>
  }

  return data
}

/**
 * 
 * @param email 
 * @returns 
 */
export async function getUserByEmail(email: string): Promise<ResponseData<UserInfo>> {
  let data = ResponseFactory.success<UserInfo>({} as UserInfo)

  const response = await http.get(makeUrl('/email'), { email })
  if (response.data) {
    data = response.data as ResponseData<UserInfo>
  }

  return data
}