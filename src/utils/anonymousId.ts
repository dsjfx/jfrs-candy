import { storage } from "./storage"

const STORAGE_KEY = 'anonymous_id'

export function getAnonymousId(key: string = STORAGE_KEY): string {
  // 1. 先从 localStorage 读
  let id = storage.get(key)

  if (!id) {
    // 2. 没有就生成一个
    id = 'anon_' + generateUUID()
    storage.set(key, id)

    // 3. 同时写一份到 Cookie，防止 localStorage 被清
    document.cookie = `${key}=${id}; max-age=${60 * 60 * 24 * 365}; path=/`
  }

  return id
}

function generateUUID() {
  // 优先使用原生 randomUUID
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // 降级：用 getRandomValues 手动拼凑 v4 UUID
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] ?? 0) % 16;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  // 最后兜底（不推荐用于安全场景）
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}