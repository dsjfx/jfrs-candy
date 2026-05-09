export const validate = {
  isEmail(email: string): boolean {
    const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return reg.test(email)
  },
  
  isPhone(phone: string): boolean {
    const reg = /^1[3-9]\d{9}$/
    return reg.test(phone)
  },
  
  isPassword(password: string): boolean {
    return password.length >= 6 && password.length <= 20
  },
}