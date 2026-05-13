import { http } from "./request"
import type { ResponseData } from "@/types/api"
import type { User, UserInfo, UserParam } from "@/types/user"
import { accessUrl } from "@/utils/cabinet"
import ResponseFactory from "@/utils/responseFactory"


function makeUrl(url: string) {
  return accessUrl('U', url)
}

export function loginApi(username: string, password: string) {
    const token = ''

    return {
        token
    }
}

export function getUserInfoApi() {
    const info = {
        id: 1,
        username: '',
        email: '',
        avatar: '',
        roles: [],
        permissions: []
    } as UserInfo

    return info
}

export async function getUser(param: UserParam = { id: 10 }): Promise<ResponseData<User>> {
	let result = ResponseFactory.success<User>({} as User)
	
	const response = await http.get(makeUrl(`/profile/simple`), param)
	if (response.data) {
		result = response.data as ResponseData<User>
	}

	return result
}