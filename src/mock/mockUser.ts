import type { User } from "@/types/user"

export function getUser0(): User {
    const user: User = {
        id: 1,
        username: 'jfx',
        name: '解放鞋',
        createdAt: '2026-01-29'
    }

    return user
}

export default {
    getUser0
}