export const storage = {
  get(key: string, defaultValue: any = null) {
    const value = localStorage.getItem(key)
    try {
      return value ? JSON.parse(value) : defaultValue
    } catch {
      return value || defaultValue
    }
  },
  
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  
  remove(key: string) {
    localStorage.removeItem(key)
  },
  
  clear() {
    localStorage.clear()
  }
}