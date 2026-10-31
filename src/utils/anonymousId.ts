import { storage } from "./storage"

const STORAGE_KEY = 'anonymous_id'

export function getAnonymousId(key: string = STORAGE_KEY): string {
    // 1. 先从 localStorage 读
    let id = storage.get(key)

    if (!id) {
        // 2. 没有就生成一个
        id = 'anon_' + crypto.randomUUID()
        storage.set(key, id)

        // 3. 同时写一份到 Cookie，防止 localStorage 被清
        document.cookie = `${key}=${id}; max-age=${60 * 60 * 24 * 365}; path=/`
    }

    return id
}