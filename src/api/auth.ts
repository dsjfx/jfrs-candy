import type { UserInfo } from "@/types/user"

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